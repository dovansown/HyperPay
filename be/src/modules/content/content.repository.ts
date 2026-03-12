import { ContentStatus, ContentType } from "@prisma/client";
import { prisma } from "../../shared/infra/prisma.js";

export type PublicListParams = {
  type?: ContentType;
  category?: string;
  tag?: string;
  q?: string;
  limit: number;
  offset: number;
};

export type AdminListParams = {
  type?: ContentType;
  status?: ContentStatus;
  category?: string;
  tag?: string;
  q?: string;
  limit: number;
  offset: number;
};

type CreateContentInput = {
  type: ContentType;
  title: string;
  slug: string;
  excerpt?: string;
  content: string;
  coverImage?: string;
  seoTitle?: string;
  seoDescription?: string;
  seoKeywords?: string;
  scheduledPublishAt?: Date;
  categorySlugs?: string[];
  tagSlugs?: string[];
};

type UpdateContentInput = {
  title?: string;
  slug?: string;
  excerpt?: string | null;
  content?: string;
  coverImage?: string | null;
  status?: ContentStatus;
  seoTitle?: string | null;
  seoDescription?: string | null;
  seoKeywords?: string | null;
  scheduledPublishAt?: Date | null;
  categorySlugs?: string[];
  tagSlugs?: string[];
};

function normalizeSlugs(slugs: string[]) {
  return [...new Set(slugs.map((x) => x.trim()).filter(Boolean))];
}

async function ensureCategories(slugs: string[]) {
  if (slugs.length === 0) return [];
  const normalized = normalizeSlugs(slugs);
  const created = await Promise.all(
    normalized.map((slug) =>
      prisma.contentCategory.upsert({
        where: { slug },
        update: {},
        create: {
          slug,
          name: slug
            .split("-")
            .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
            .join(" ")
        },
        select: { id: true }
      })
    )
  );
  return created.map((x) => x.id);
}

async function ensureTags(slugs: string[]) {
  if (slugs.length === 0) return [];
  const normalized = normalizeSlugs(slugs);
  const created = await Promise.all(
    normalized.map((slug) =>
      prisma.contentTag.upsert({
        where: { slug },
        update: {},
        create: {
          slug,
          name: slug
            .split("-")
            .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
            .join(" ")
        },
        select: { id: true }
      })
    )
  );
  return created.map((x) => x.id);
}

export const contentRepository = {
  async publishDueScheduled() {
    const now = new Date();
    await prisma.content.updateMany({
      where: {
        deletedAt: null,
        status: ContentStatus.SCHEDULED,
        scheduledPublishAt: { lte: now }
      },
      data: {
        status: ContentStatus.PUBLISHED,
        publishedAt: now,
        scheduledPublishAt: null
      }
    });
  },

  async listPublic(params: PublicListParams) {
    await this.publishDueScheduled();
    const now = new Date();
    const where = {
      deletedAt: null,
      status: ContentStatus.PUBLISHED,
      OR: [{ publishedAt: null }, { publishedAt: { lte: now } }],
      ...(params.type ? { type: params.type } : {}),
      ...(params.category ? { categories: { some: { category: { slug: params.category, deletedAt: null } } } } : {}),
      ...(params.tag ? { tags: { some: { tag: { slug: params.tag, deletedAt: null } } } } : {}),
      ...(params.q
        ? {
            OR: [
              { title: { contains: params.q, mode: "insensitive" as const } },
              { excerpt: { contains: params.q, mode: "insensitive" as const } }
            ]
          }
        : {})
    };

    const [items, total] = await Promise.all([
      prisma.content.findMany({
        where,
        orderBy: { publishedAt: "desc" },
        skip: params.offset,
        take: params.limit,
        select: {
          type: true,
          title: true,
          slug: true,
          excerpt: true,
          coverImage: true,
          seoTitle: true,
          seoDescription: true,
          seoKeywords: true,
          publishedAt: true,
          categories: { select: { category: { select: { slug: true, name: true } } } },
          tags: { select: { tag: { select: { slug: true, name: true } } } }
        }
      }),
      prisma.content.count({ where })
    ]);

    return { items, total };
  },

  async getPublicBySlug(slug: string) {
    await this.publishDueScheduled();
    const now = new Date();
    return prisma.content.findFirst({
      where: {
        slug,
        deletedAt: null,
        status: ContentStatus.PUBLISHED,
        OR: [{ publishedAt: null }, { publishedAt: { lte: now } }]
      },
      select: {
        type: true,
        title: true,
        slug: true,
        excerpt: true,
        content: true,
        coverImage: true,
        seoTitle: true,
        seoDescription: true,
        seoKeywords: true,
        publishedAt: true,
        author: { select: { id: true, email: true, fullName: true } },
        categories: { select: { category: { select: { slug: true, name: true } } } },
        tags: { select: { tag: { select: { slug: true, name: true } } } }
      }
    });
  },

  async getBySlugForAdmin(slug: string) {
    return prisma.content.findFirst({
      where: { slug, deletedAt: null },
      include: {
        categories: { select: { category: { select: { slug: true, name: true } } } },
        tags: { select: { tag: { select: { slug: true, name: true } } } }
      }
    });
  },

  async getByPreviewTokenHash(tokenHash: string) {
    return prisma.content.findFirst({
      where: {
        previewTokenHash: tokenHash,
        deletedAt: null,
        previewTokenExpiredAt: { gt: new Date() }
      },
      select: {
        type: true,
        title: true,
        slug: true,
        excerpt: true,
        content: true,
        coverImage: true,
        seoTitle: true,
        seoDescription: true,
        seoKeywords: true,
        status: true,
        scheduledPublishAt: true,
        publishedAt: true,
        author: { select: { id: true, email: true, fullName: true } },
        categories: { select: { category: { select: { slug: true, name: true } } } },
        tags: { select: { tag: { select: { slug: true, name: true } } } }
      }
    });
  },

  async create(authorId: number | null, data: CreateContentInput) {
    const categoryIds = await ensureCategories(data.categorySlugs ?? []);
    const tagIds = await ensureTags(data.tagSlugs ?? []);
    const shouldSchedule = data.scheduledPublishAt && data.scheduledPublishAt > new Date();
    const nextStatus = shouldSchedule ? ContentStatus.SCHEDULED : ContentStatus.DRAFT;

    return prisma.content.create({
      data: {
        type: data.type,
        title: data.title,
        slug: data.slug,
        excerpt: data.excerpt,
        content: data.content,
        coverImage: data.coverImage,
        seoTitle: data.seoTitle,
        seoDescription: data.seoDescription,
        seoKeywords: data.seoKeywords,
        status: nextStatus,
        scheduledPublishAt: shouldSchedule ? data.scheduledPublishAt : undefined,
        authorId: authorId ?? undefined,
        categories: {
          create: categoryIds.map((categoryId) => ({ categoryId }))
        },
        tags: {
          create: tagIds.map((tagId) => ({ tagId }))
        }
      }
    });
  },

  async updateBySlug(slug: string, editorId: number | null, data: UpdateContentInput) {
    const current = await prisma.content.findFirst({
      where: { slug, deletedAt: null },
      include: {
        categories: { select: { category: { select: { slug: true } } } },
        tags: { select: { tag: { select: { slug: true } } } },
        revisions: { orderBy: { version: "desc" }, take: 1, select: { version: true } }
      }
    });
    if (!current) return null;

    const categoryIds =
      data.categorySlugs !== undefined ? await ensureCategories(data.categorySlugs) : undefined;
    const tagIds = data.tagSlugs !== undefined ? await ensureTags(data.tagSlugs) : undefined;
    const shouldSchedule = data.scheduledPublishAt && data.scheduledPublishAt > new Date();
    const statusToPersist =
      shouldSchedule ? ContentStatus.SCHEDULED : data.status ?? undefined;
    const nextPublishedAt = statusToPersist === ContentStatus.PUBLISHED ? new Date() : undefined;

    const revisionVersion = (current.revisions[0]?.version ?? 0) + 1;
    return prisma.$transaction(async (tx) => {
      await tx.contentRevision.create({
        data: {
          contentId: current.id,
          version: revisionVersion,
          title: current.title,
          excerpt: current.excerpt,
          contentBody: current.content,
          coverImage: current.coverImage,
          status: current.status,
          seoTitle: current.seoTitle,
          seoDescription: current.seoDescription,
          seoKeywords: current.seoKeywords,
          categorySlugs: current.categories.map((item) => item.category.slug),
          tagSlugs: current.tags.map((item) => item.tag.slug),
          editedById: editorId ?? undefined
        }
      });

      return tx.content.update({
        where: { id: current.id },
        data: {
          ...(data.title != null ? { title: data.title } : {}),
          ...(data.slug != null ? { slug: data.slug } : {}),
          ...(data.excerpt !== undefined ? { excerpt: data.excerpt } : {}),
          ...(data.content != null ? { content: data.content } : {}),
          ...(data.coverImage !== undefined ? { coverImage: data.coverImage } : {}),
          ...(data.seoTitle !== undefined ? { seoTitle: data.seoTitle } : {}),
          ...(data.seoDescription !== undefined ? { seoDescription: data.seoDescription } : {}),
          ...(data.seoKeywords !== undefined ? { seoKeywords: data.seoKeywords } : {}),
          ...(statusToPersist != null ? { status: statusToPersist } : {}),
          ...(data.scheduledPublishAt !== undefined
            ? { scheduledPublishAt: data.scheduledPublishAt }
            : {}),
          ...(nextPublishedAt ? { publishedAt: nextPublishedAt, scheduledPublishAt: null } : {}),
          ...(categoryIds
            ? {
                categories: {
                  deleteMany: {},
                  create: categoryIds.map((categoryId: number) => ({ categoryId }))
                }
              }
            : {}),
          ...(tagIds
            ? {
                tags: {
                  deleteMany: {},
                  create: tagIds.map((tagId: number) => ({ tagId }))
                }
              }
            : {})
        }
      });
    });
  },

  async listAdmin(params: AdminListParams) {
    const where = {
      deletedAt: null,
      ...(params.type ? { type: params.type } : {}),
      ...(params.status ? { status: params.status } : {}),
      ...(params.category ? { categories: { some: { category: { slug: params.category, deletedAt: null } } } } : {}),
      ...(params.tag ? { tags: { some: { tag: { slug: params.tag, deletedAt: null } } } } : {}),
      ...(params.q
        ? {
            OR: [
              { title: { contains: params.q, mode: "insensitive" as const } },
              { excerpt: { contains: params.q, mode: "insensitive" as const } },
              { slug: { contains: params.q, mode: "insensitive" as const } }
            ]
          }
        : {})
    };

    const [items, total] = await Promise.all([
      prisma.content.findMany({
        where,
        orderBy: { createdAt: "desc" },
        skip: params.offset,
        take: params.limit,
        include: {
          categories: { select: { category: { select: { slug: true, name: true } } } },
          tags: { select: { tag: { select: { slug: true, name: true } } } },
          author: { select: { id: true, email: true, fullName: true } }
        }
      }),
      prisma.content.count({ where })
    ]);
    return { items, total };
  },

  async deleteBySlug(slug: string) {
    const item = await prisma.content.findFirst({
      where: { slug, deletedAt: null },
      select: { id: true }
    });
    if (!item) return null;

    return prisma.content.update({
      where: { id: item.id },
      data: { deletedAt: new Date(), status: ContentStatus.ARCHIVED }
    });
  },

  async createPreviewToken(slug: string, tokenHash: string, expiredAt: Date) {
    const item = await prisma.content.findFirst({
      where: { slug, deletedAt: null },
      select: { id: true, slug: true }
    });
    if (!item) return null;

    return prisma.content.update({
      where: { id: item.id },
      data: {
        previewTokenHash: tokenHash,
        previewTokenExpiredAt: expiredAt
      },
      select: { slug: true, previewTokenExpiredAt: true }
    });
  },

  async listRevisions(slug: string) {
    const content = await prisma.content.findFirst({
      where: { slug, deletedAt: null },
      select: { id: true }
    });
    if (!content) return null;
    return prisma.contentRevision.findMany({
      where: { contentId: content.id },
      orderBy: { version: "desc" },
      include: {
        editedBy: { select: { id: true, email: true, fullName: true } }
      }
    });
  },

  async restoreRevision(slug: string, revisionId: number, editorId: number | null) {
    const content = await prisma.content.findFirst({
      where: { slug, deletedAt: null },
      include: { revisions: { orderBy: { version: "desc" }, take: 1, select: { version: true } } }
    });
    if (!content) return null;

    const revision = await prisma.contentRevision.findFirst({
      where: { id: revisionId, contentId: content.id }
    });
    if (!revision) return null;

    const categorySlugs = Array.isArray(revision.categorySlugs)
      ? (revision.categorySlugs as string[])
      : [];
    const tagSlugs = Array.isArray(revision.tagSlugs) ? (revision.tagSlugs as string[]) : [];
    const categoryIds = await ensureCategories(categorySlugs);
    const tagIds = await ensureTags(tagSlugs);
    const newVersion = (content.revisions[0]?.version ?? 0) + 1;

    return prisma.$transaction(async (tx) => {
      await tx.contentRevision.create({
        data: {
          contentId: content.id,
          version: newVersion,
          title: content.title,
          excerpt: content.excerpt,
          contentBody: content.content,
          coverImage: content.coverImage,
          status: content.status,
          seoTitle: content.seoTitle,
          seoDescription: content.seoDescription,
          seoKeywords: content.seoKeywords,
          editedById: editorId ?? undefined
        }
      });

      return tx.content.update({
        where: { id: content.id },
        data: {
          title: revision.title,
          excerpt: revision.excerpt,
          content: revision.contentBody,
          coverImage: revision.coverImage,
          status: revision.status,
          seoTitle: revision.seoTitle,
          seoDescription: revision.seoDescription,
          seoKeywords: revision.seoKeywords,
          categories: {
            deleteMany: {},
            create: categoryIds.map((categoryId: number) => ({ categoryId }))
          },
          tags: {
            deleteMany: {},
            create: tagIds.map((tagId: number) => ({ tagId }))
          }
        }
      });
    });
  },

  async listCategoriesPublic() {
    return prisma.contentCategory.findMany({
      where: { deletedAt: null },
      orderBy: { name: "asc" },
      select: { name: true, slug: true, description: true }
    });
  },

  async listCategoriesAdmin() {
    return prisma.contentCategory.findMany({
      where: { deletedAt: null },
      orderBy: { name: "asc" },
      select: { id: true, name: true, slug: true, description: true, createdAt: true, updatedAt: true }
    });
  },

  async listTagsPublic() {
    return prisma.contentTag.findMany({
      where: { deletedAt: null },
      orderBy: { name: "asc" },
      select: { name: true, slug: true, description: true }
    });
  },

  async listTagsAdmin() {
    return prisma.contentTag.findMany({
      where: { deletedAt: null },
      orderBy: { name: "asc" },
      select: { id: true, name: true, slug: true, description: true, createdAt: true, updatedAt: true }
    });
  },

  async upsertCategory(data: { name: string; slug: string; description?: string }) {
    return prisma.contentCategory.upsert({
      where: { slug: data.slug },
      update: {
        name: data.name,
        description: data.description ?? null,
        deletedAt: null
      },
      create: {
        name: data.name,
        slug: data.slug,
        description: data.description
      }
    });
  },

  async updateCategoryBySlug(
    slug: string,
    data: { name?: string; slug?: string; description?: string | null }
  ) {
    const found = await prisma.contentCategory.findFirst({
      where: { slug, deletedAt: null },
      select: { id: true }
    });
    if (!found) return null;
    return prisma.contentCategory.update({
      where: { id: found.id },
      data: {
        ...(data.name !== undefined ? { name: data.name } : {}),
        ...(data.slug !== undefined ? { slug: data.slug } : {}),
        ...(data.description !== undefined ? { description: data.description } : {})
      }
    });
  },

  async deleteCategoryBySlug(slug: string) {
    const found = await prisma.contentCategory.findFirst({
      where: { slug, deletedAt: null },
      select: { id: true }
    });
    if (!found) return null;
    return prisma.contentCategory.update({
      where: { id: found.id },
      data: { deletedAt: new Date() }
    });
  },

  async upsertTag(data: { name: string; slug: string; description?: string }) {
    return prisma.contentTag.upsert({
      where: { slug: data.slug },
      update: {
        name: data.name,
        description: data.description ?? null,
        deletedAt: null
      },
      create: {
        name: data.name,
        slug: data.slug,
        description: data.description
      }
    });
  },

  async updateTagBySlug(
    slug: string,
    data: { name?: string; slug?: string; description?: string | null }
  ) {
    const found = await prisma.contentTag.findFirst({
      where: { slug, deletedAt: null },
      select: { id: true }
    });
    if (!found) return null;
    return prisma.contentTag.update({
      where: { id: found.id },
      data: {
        ...(data.name !== undefined ? { name: data.name } : {}),
        ...(data.slug !== undefined ? { slug: data.slug } : {}),
        ...(data.description !== undefined ? { description: data.description } : {})
      }
    });
  },

  async deleteTagBySlug(slug: string) {
    const found = await prisma.contentTag.findFirst({
      where: { slug, deletedAt: null },
      select: { id: true }
    });
    if (!found) return null;
    return prisma.contentTag.update({
      where: { id: found.id },
      data: { deletedAt: new Date() }
    });
  }
};

