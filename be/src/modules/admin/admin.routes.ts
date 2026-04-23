import { UserRole } from "@prisma/client";
import { Router } from "express";
import { asyncHandler } from "../../shared/http/async-handler.js";
import { authMiddleware } from "../../shared/middleware/auth.middleware.js";
import { requireRole } from "../../shared/middleware/require-role.middleware.js";
import { validate } from "../../shared/middleware/validate.middleware.js";
import { adminController } from "./admin.controller.js";
import {
  adminListQuerySchema,
  assignUserPackageSchema,
  createBankAdminSchema,
  createDurationAdminSchema,
  createPackageAdminSchema,
  idParamsSchema,
  systemSettingsUpdateSchema,
  updateBankAdminSchema,
  updateDurationAdminSchema,
  updatePackageAdminSchema,
  updateUserPackageStatusSchema,
  updateUserRoleSchema,
  userIdParamsSchema
} from "./admin.schema.js";

export const adminRoutes = Router();

adminRoutes.use(authMiddleware);
adminRoutes.use(requireRole([UserRole.ADMIN]));

adminRoutes.get(
  "/users",
  validate({ query: adminListQuerySchema }),
  asyncHandler(adminController.listUsers)
);
adminRoutes.patch(
  "/users/:userId/role",
  validate({ params: userIdParamsSchema, body: updateUserRoleSchema }),
  asyncHandler(adminController.updateUserRole)
);

// Plans removed - using Packages only

adminRoutes.get(
  "/packages",
  validate({ query: adminListQuerySchema }),
  asyncHandler(adminController.listPackages)
);
adminRoutes.post(
  "/packages",
  validate({ body: createPackageAdminSchema }),
  asyncHandler(adminController.createPackage)
);
adminRoutes.patch(
  "/packages/:id",
  validate({ params: idParamsSchema, body: updatePackageAdminSchema }),
  asyncHandler(adminController.updatePackage)
);

adminRoutes.get("/durations", asyncHandler(adminController.listDurations));
adminRoutes.post(
  "/durations",
  validate({ body: createDurationAdminSchema }),
  asyncHandler(adminController.createDuration)
);
adminRoutes.patch(
  "/durations/:id",
  validate({ params: idParamsSchema, body: updateDurationAdminSchema }),
  asyncHandler(adminController.updateDuration)
);
adminRoutes.delete(
  "/durations/:id",
  validate({ params: idParamsSchema }),
  asyncHandler(adminController.deleteDuration)
);

adminRoutes.get(
  "/banks",
  validate({ query: adminListQuerySchema }),
  asyncHandler(adminController.listBanks)
);
adminRoutes.post(
  "/banks",
  validate({ body: createBankAdminSchema }),
  asyncHandler(adminController.createBank)
);
adminRoutes.patch(
  "/banks/:id",
  validate({ params: idParamsSchema, body: updateBankAdminSchema }),
  asyncHandler(adminController.updateBank)
);

adminRoutes.get(
  "/user-packages",
  validate({ query: adminListQuerySchema }),
  asyncHandler(adminController.listUserPackages)
);
adminRoutes.post(
  "/user-packages/assign",
  validate({ body: assignUserPackageSchema }),
  asyncHandler(adminController.assignUserPackage)
);
adminRoutes.patch(
  "/user-packages/:id/status",
  validate({ params: idParamsSchema, body: updateUserPackageStatusSchema }),
  asyncHandler(adminController.updateUserPackageStatus)
);

adminRoutes.get(
  "/webhooks",
  validate({ query: adminListQuerySchema }),
  asyncHandler(adminController.listWebhooks)
);
adminRoutes.get(
  "/transactions",
  validate({ query: adminListQuerySchema }),
  asyncHandler(adminController.listTransactions)
);

adminRoutes.get("/system-settings", asyncHandler(adminController.getSystemSettings));
adminRoutes.put(
  "/system-settings",
  validate({ body: systemSettingsUpdateSchema }),
  asyncHandler(adminController.updateSystemSettings)
);
