import { Router } from "express";
import { UserRole } from "@prisma/client";
import { asyncHandler } from "../../shared/http/async-handler.js";
import { authMiddleware } from "../../shared/middleware/auth.middleware.js";
import { requireRole } from "../../shared/middleware/require-role.middleware.js";
import { validate } from "../../shared/middleware/validate.middleware.js";
import { packagesController } from "./packages.controller.js";
import {
  createPackageSchema,
  purchasePackageBodySchema,
  purchasePackageParamsSchema
} from "./packages.schema.js";

export const packagesRoutes = Router();

packagesRoutes.get("/", authMiddleware, asyncHandler(packagesController.list));
packagesRoutes.get("/me/active", authMiddleware, asyncHandler(packagesController.myActive));
packagesRoutes.post(
  "/",
  authMiddleware,
  requireRole([UserRole.ADMIN]),
  validate({ body: createPackageSchema }),
  asyncHandler(packagesController.create)
);
packagesRoutes.post(
  "/:packageId/purchase",
  authMiddleware,
  validate({ params: purchasePackageParamsSchema, body: purchasePackageBodySchema }),
  asyncHandler(packagesController.purchase)
);
