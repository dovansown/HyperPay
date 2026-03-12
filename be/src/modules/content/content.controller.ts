import type { Request, Response } from "express";
import { createHash, randomBytes } from "node:crypto";
import { ContentStatus, ContentType } from "@prisma/client";
import { AppError, ErrorCodes } from "../../shared/http/app-error.js";
import { sendSuccess } from "../../shared/http/http-response.js";
import { contentRepository } from "./content.repository.js";

function assertCanManageContent(
  user: Request["user"]
): asserts user is NonNullable<Request["user"]> {
  if (!user) {
    throw new AppError(401, ErrorCodes.UNAUTHORIZED, "Unauthorized");
  }
}

function assertCanManageExistingContent(
  user: NonNullable<Request["user"]>,
  content: { authorId: number | null }
) {
  if (user.role === "EDITOR" || user.role === "ADMIN") {
    return;
  }

  if (user.role === "AUTHOR" && content.authorId === user.userId) {
    return;
  }

  throw new AppError(403, ErrorCodes.FORBIDDEN, "No permission to modify this content");
}

export const contentController = {
  async listPublic(req: Request, res: Response) {
    const { type, category, tag, q, limit, offset } = req.query as unknown as {
      type?: ContentType;
      category?: string;
      tag?: string;
      q?: string;
      limit: number;
      offset: number;
    };

    const result = await contentRepository.listPublic({
      type,
      category,
      tag,
      q,
      limit,
      offset
    });

    return sendSuccess(res, result.items, 200, { total: result.total, limit, offset });
  },

  async listCategoriesPublic(_req: Request, res: Response) {
    const items = await contentRepository.listCategoriesPublic();
    return sendSuccess(res, items);
  },

  async listTagsPublic(_req: Request, res: Response) {
    const items = await contentRepository.listTagsPublic();
    return sendSuccess(res, items);
  },

  async listCategoriesAdmin(_req: Request, res: Response) {
    const items = await contentRepository.listCategoriesAdmin();
    return sendSuccess(res, items);
  },

  async listTagsAdmin(_req: Request, res: Response) {
    const items = await contentRepository.listTagsAdmin();
    return sendSuccess(res, items);
  },

  async getPublicBySlug(req: Request, res: Response) {
    const { slug } = req.params as unknown as { slug: string };
    const item = await contentRepository.getPublicBySlug(slug);
    if (!item) {
      throw new AppError(404, ErrorCodes.NOT_FOUND, "Content not found");
    }
    return sendSuccess(res, item);
  },

  async previewByToken(req: Request, res: Response) {
    const { token } = req.params as unknown as { token: string };
    const tokenHash = createHash("sha256").update(token).digest("hex");
    const item = await contentRepository.getByPreviewTokenHash(tokenHash);
    if (!item) {
      throw new AppError(404, ErrorCodes.NOT_FOUND, "Preview content not found");
    }
    return sendSuccess(res, item);
  },

  async create(req: Request, res: Response) {
    assertCanManageContent(req.user);
    const authorId = req.user.userId;
    const body = req.body as {
      type: ContentType;
      title: string;
      slug: string;
      excerpt?: string;
      content: string;
      cover_image?: string;
      seo_title?: string;
      seo_description?: string;
      seo_keywords?: string;
      scheduled_publish_at?: Date;
      category_slugs?: string[];
      tag_slugs?: string[];
    };
    if (body.scheduled_publish_at && body.scheduled_publish_at <= new Date()) {
      throw new AppError(
        400,
        ErrorCodes.INVALID_REQUEST,
        "scheduled_publish_at must be in the future"
      );
    }

    const created = await contentRepository.create(authorId, {
      type: body.type,
      title: body.title,
      slug: body.slug,
      excerpt: body.excerpt,
      content: body.content,
      coverImage: body.cover_image,
      seoTitle: body.seo_title,
      seoDescription: body.seo_description,
      seoKeywords: body.seo_keywords,
      scheduledPublishAt: body.scheduled_publish_at,
      categorySlugs: body.category_slugs,
      tagSlugs: body.tag_slugs
    });

    return sendSuccess(res, created, 201);
  },

  async updateBySlug(req: Request, res: Response) {
    assertCanManageContent(req.user);
    const { slug } = req.params as unknown as { slug: string };
    const content = await contentRepository.getBySlugForAdmin(slug);
    if (!content) {
      throw new AppError(404, ErrorCodes.NOT_FOUND, "Content not found");
    }
    assertCanManageExistingContent(req.user, { authorId: content.authorId ?? null });

    const body = req.body as {
      title?: string;
      slug?: string;
      excerpt?: string | null;
      content?: string;
      cover_image?: string | null;
      status?: ContentStatus;
      seo_title?: string | null;
      seo_description?: string | null;
      seo_keywords?: string | null;
      scheduled_publish_at?: Date | null;
      category_slugs?: string[];
      tag_slugs?: string[];
    };
    if (body.scheduled_publish_at && body.scheduled_publish_at <= new Date()) {
      throw new AppError(
        400,
        ErrorCodes.INVALID_REQUEST,
        "scheduled_publish_at must be in the future"
      );
    }
    if (body.status === ContentStatus.SCHEDULED && !body.scheduled_publish_at) {
      throw new AppError(
        400,
        ErrorCodes.INVALID_REQUEST,
        "status SCHEDULED requires scheduled_publish_at"
      );
    }

    const updated = await contentRepository.updateBySlug(slug, req.user.userId, {
      title: body.title,
      slug: body.slug,
      excerpt: body.excerpt,
      content: body.content,
      coverImage: body.cover_image,
      status: body.status,
      seoTitle: body.seo_title,
      seoDescription: body.seo_description,
      seoKeywords: body.seo_keywords,
      scheduledPublishAt: body.scheduled_publish_at,
      categorySlugs: body.category_slugs,
      tagSlugs: body.tag_slugs
    });
    if (!updated) {
      throw new AppError(404, ErrorCodes.NOT_FOUND, "Content not found");
    }

    return sendSuccess(res, updated);
  },

  async listAdmin(req: Request, res: Response) {
    const { type, status, category, tag, q, limit, offset } = req.query as unknown as {
      type?: ContentType;
      status?: ContentStatus;
      category?: string;
      tag?: string;
      q?: string;
      limit: number;
      offset: number;
    };

    const result = await contentRepository.listAdmin({
      type,
      status,
      category,
      tag,
      q,
      limit,
      offset
    });

    return sendSuccess(res, result.items, 200, { total: result.total, limit, offset });
  },

  async deleteBySlug(req: Request, res: Response) {
    assertCanManageContent(req.user);
    const { slug } = req.params as unknown as { slug: string };
    const content = await contentRepository.getBySlugForAdmin(slug);
    if (!content) {
      throw new AppError(404, ErrorCodes.NOT_FOUND, "Content not found");
    }
    assertCanManageExistingContent(req.user, { authorId: content.authorId ?? null });

    const item = await contentRepository.deleteBySlug(slug);
    if (!item) {
      throw new AppError(404, ErrorCodes.NOT_FOUND, "Content not found");
    }
    return sendSuccess(res, { slug, deleted: true });
  },

  async createPreviewToken(req: Request, res: Response) {
    assertCanManageContent(req.user);
    const { slug } = req.params as unknown as { slug: string };
    const content = await contentRepository.getBySlugForAdmin(slug);
    if (!content) {
      throw new AppError(404, ErrorCodes.NOT_FOUND, "Content not found");
    }
    assertCanManageExistingContent(req.user, { authorId: content.authorId ?? null });

    const { expires_in_minutes } = req.body as { expires_in_minutes: number };
    const plainToken = randomBytes(24).toString("hex");
    const tokenHash = createHash("sha256").update(plainToken).digest("hex");
    const expiredAt = new Date(Date.now() + expires_in_minutes * 60 * 1000);

    const item = await contentRepository.createPreviewToken(slug, tokenHash, expiredAt);
    if (!item) {
      throw new AppError(404, ErrorCodes.NOT_FOUND, "Content not found");
    }
    return sendSuccess(
      res,
      {
        slug: item.slug,
        preview_token: plainToken,
        preview_url: `/api/v1/public/content/preview/${plainToken}`,
        expires_at: item.previewTokenExpiredAt
      },
      201
    );
  },

  async listRevisions(req: Request, res: Response) {
    assertCanManageContent(req.user);
    const { slug } = req.params as unknown as { slug: string };
    const content = await contentRepository.getBySlugForAdmin(slug);
    if (!content) {
      throw new AppError(404, ErrorCodes.NOT_FOUND, "Content not found");
    }
    assertCanManageExistingContent(req.user, { authorId: content.authorId ?? null });

    const items = await contentRepository.listRevisions(slug);
    if (!items) {
      throw new AppError(404, ErrorCodes.NOT_FOUND, "Content not found");
    }
    return sendSuccess(res, items);
  },

  async restoreRevision(req: Request, res: Response) {
    assertCanManageContent(req.user);
    const { slug, revisionId } = req.params as unknown as { slug: string; revisionId: number };
    const content = await contentRepository.getBySlugForAdmin(slug);
    if (!content) {
      throw new AppError(404, ErrorCodes.NOT_FOUND, "Content not found");
    }
    assertCanManageExistingContent(req.user, { authorId: content.authorId ?? null });

    const item = await contentRepository.restoreRevision(slug, revisionId, req.user.userId);
    if (!item) {
      throw new AppError(404, ErrorCodes.NOT_FOUND, "Revision not found");
    }
    return sendSuccess(res, item);
  },

  async upsertCategory(req: Request, res: Response) {
    const body = req.body as { name: string; slug: string; description?: string };
    const item = await contentRepository.upsertCategory(body);
    return sendSuccess(res, item, 201);
  },

  async updateCategoryBySlug(req: Request, res: Response) {
    const { slug } = req.params as unknown as { slug: string };
    const body = req.body as { name?: string; slug?: string; description?: string | null };
    const item = await contentRepository.updateCategoryBySlug(slug, body);
    if (!item) {
      throw new AppError(404, ErrorCodes.NOT_FOUND, "Category not found");
    }
    return sendSuccess(res, item);
  },

  async deleteCategoryBySlug(req: Request, res: Response) {
    const { slug } = req.params as unknown as { slug: string };
    const item = await contentRepository.deleteCategoryBySlug(slug);
    if (!item) {
      throw new AppError(404, ErrorCodes.NOT_FOUND, "Category not found");
    }
    return sendSuccess(res, { slug, deleted: true });
  },

  async upsertTag(req: Request, res: Response) {
    const body = req.body as { name: string; slug: string; description?: string };
    const item = await contentRepository.upsertTag(body);
    return sendSuccess(res, item, 201);
  },

  async updateTagBySlug(req: Request, res: Response) {
    const { slug } = req.params as unknown as { slug: string };
    const body = req.body as { name?: string; slug?: string; description?: string | null };
    const item = await contentRepository.updateTagBySlug(slug, body);
    if (!item) {
      throw new AppError(404, ErrorCodes.NOT_FOUND, "Tag not found");
    }
    return sendSuccess(res, item);
  },

  async deleteTagBySlug(req: Request, res: Response) {
    const { slug } = req.params as unknown as { slug: string };
    const item = await contentRepository.deleteTagBySlug(slug);
    if (!item) {
      throw new AppError(404, ErrorCodes.NOT_FOUND, "Tag not found");
    }
    return sendSuccess(res, { slug, deleted: true });
  }
};

