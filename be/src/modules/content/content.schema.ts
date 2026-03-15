import { z } from "zod";
import { ContentStatus, ContentType } from "@prisma/client";

export const listPublicContentQuerySchema = z.object({
  type: z.nativeEnum(ContentType).optional(),
  category: z.string().trim().min(1).optional(),
  tag: z.string().trim().min(1).optional(),
  q: z.string().trim().min(1).optional(),
  limit: z.coerce.number().int().min(1).max(50).optional().default(12),
  offset: z.coerce.number().int().min(0).optional().default(0)
});

export const listAdminContentQuerySchema = z.object({
  type: z.nativeEnum(ContentType).optional(),
  status: z.nativeEnum(ContentStatus).optional(),
  category: z.string().trim().min(1).optional(),
  tag: z.string().trim().min(1).optional(),
  q: z.string().trim().min(1).optional(),
  limit: z.coerce.number().int().min(1).max(50).optional().default(20),
  offset: z.coerce.number().int().min(0).optional().default(0)
});

export const slugParamsSchema = z.object({
  slug: z.string().trim().min(1)
});

export const previewTokenParamsSchema = z.object({
  token: z.string().trim().min(20)
});

export const revisionParamsSchema = z.object({
  slug: z.string().trim().min(1),
  revisionId: z.string().uuid()
});

export const createContentBodySchema = z.object({
  type: z.nativeEnum(ContentType),
  title: z.string().trim().min(1).max(255),
  slug: z.string().trim().min(1).max(255),
  excerpt: z.string().trim().max(512).optional(),
  content: z.string().min(1),
  cover_image: z.string().url().max(512).optional(),
  seo_title: z.string().trim().max(255).optional(),
  seo_description: z.string().trim().max(512).optional(),
  seo_keywords: z.string().trim().max(512).optional(),
  scheduled_publish_at: z.coerce.date().optional(),
  category_slugs: z.array(z.string().trim().min(1).max(120)).optional().default([]),
  tag_slugs: z.array(z.string().trim().min(1).max(120)).optional().default([])
});

export const updateContentBodySchema = z.object({
  title: z.string().trim().min(1).max(255).optional(),
  slug: z.string().trim().min(1).max(255).optional(),
  excerpt: z.string().trim().max(512).optional().nullable(),
  content: z.string().min(1).optional(),
  cover_image: z.string().url().max(512).optional().nullable(),
  status: z.nativeEnum(ContentStatus).optional(),
  seo_title: z.string().trim().max(255).optional().nullable(),
  seo_description: z.string().trim().max(512).optional().nullable(),
  seo_keywords: z.string().trim().max(512).optional().nullable(),
  scheduled_publish_at: z.coerce.date().optional().nullable(),
  category_slugs: z.array(z.string().trim().min(1).max(120)).optional(),
  tag_slugs: z.array(z.string().trim().min(1).max(120)).optional()
});

export const upsertCategoryBodySchema = z.object({
  name: z.string().trim().min(1).max(120),
  slug: z.string().trim().min(1).max(120),
  description: z.string().trim().max(255).optional()
});

export const updateCategoryBodySchema = z.object({
  name: z.string().trim().min(1).max(120).optional(),
  slug: z.string().trim().min(1).max(120).optional(),
  description: z.string().trim().max(255).optional().nullable()
});

export const upsertTagBodySchema = z.object({
  name: z.string().trim().min(1).max(120),
  slug: z.string().trim().min(1).max(120),
  description: z.string().trim().max(255).optional()
});

export const updateTagBodySchema = z.object({
  name: z.string().trim().min(1).max(120).optional(),
  slug: z.string().trim().min(1).max(120).optional(),
  description: z.string().trim().max(255).optional().nullable()
});

export const taxonomySlugParamsSchema = z.object({
  slug: z.string().trim().min(1).max(120)
});

export const createPreviewTokenBodySchema = z.object({
  expires_in_minutes: z.coerce.number().int().min(5).max(1440).optional().default(30)
});

