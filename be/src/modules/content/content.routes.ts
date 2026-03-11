import { Router } from "express";
import { UserRole } from "@prisma/client";
import { asyncHandler } from "../../shared/http/async-handler.js";
import { authMiddleware } from "../../shared/middleware/auth.middleware.js";
import { requireRole } from "../../shared/middleware/require-role.middleware.js";
import { validate } from "../../shared/middleware/validate.middleware.js";
import { contentController } from "./content.controller.js";
import {
  createPreviewTokenBodySchema,
  createContentBodySchema,
  listAdminContentQuerySchema,
  listPublicContentQuerySchema,
  previewTokenParamsSchema,
  revisionParamsSchema,
  slugParamsSchema,
  upsertCategoryBodySchema,
  upsertTagBodySchema,
  updateContentBodySchema
} from "./content.schema.js";

export const publicContentRoutes = Router();
publicContentRoutes.get(
  "/",
  validate({ query: listPublicContentQuerySchema }),
  asyncHandler(contentController.listPublic)
);
publicContentRoutes.get("/categories", asyncHandler(contentController.listCategoriesPublic));
publicContentRoutes.get("/tags", asyncHandler(contentController.listTagsPublic));
publicContentRoutes.get(
  "/preview/:token",
  validate({ params: previewTokenParamsSchema }),
  asyncHandler(contentController.previewByToken)
);
publicContentRoutes.get(
  "/:slug",
  validate({ params: slugParamsSchema }),
  asyncHandler(contentController.getPublicBySlug)
);

export const contentRoutes = Router();
contentRoutes.use(authMiddleware);
contentRoutes.use(requireRole([UserRole.AUTHOR, UserRole.EDITOR, UserRole.ADMIN]));
contentRoutes.get(
  "/",
  validate({ query: listAdminContentQuerySchema }),
  asyncHandler(contentController.listAdmin)
);
contentRoutes.post(
  "/",
  validate({ body: createContentBodySchema }),
  asyncHandler(contentController.create)
);
contentRoutes.patch(
  "/:slug",
  validate({ params: slugParamsSchema, body: updateContentBodySchema }),
  asyncHandler(contentController.updateBySlug)
);
contentRoutes.post(
  "/:slug/preview-token",
  validate({ params: slugParamsSchema, body: createPreviewTokenBodySchema }),
  asyncHandler(contentController.createPreviewToken)
);
contentRoutes.get(
  "/:slug/revisions",
  validate({ params: slugParamsSchema }),
  asyncHandler(contentController.listRevisions)
);
contentRoutes.post(
  "/:slug/revisions/:revisionId/restore",
  validate({ params: revisionParamsSchema }),
  asyncHandler(contentController.restoreRevision)
);
contentRoutes.delete(
  "/:slug",
  validate({ params: slugParamsSchema }),
  asyncHandler(contentController.deleteBySlug)
);
contentRoutes.post(
  "/categories",
  validate({ body: upsertCategoryBodySchema }),
  asyncHandler(contentController.upsertCategory)
);
contentRoutes.post(
  "/tags",
  validate({ body: upsertTagBodySchema }),
  asyncHandler(contentController.upsertTag)
);

