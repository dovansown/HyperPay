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
  createPlanAdminSchema,
  idParamsSchema,
  updateBankAdminSchema,
  updatePlanAdminSchema,
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

adminRoutes.get(
  "/plans",
  validate({ query: adminListQuerySchema }),
  asyncHandler(adminController.listPlans)
);
adminRoutes.post(
  "/plans",
  validate({ body: createPlanAdminSchema }),
  asyncHandler(adminController.createPlan)
);
adminRoutes.patch(
  "/plans/:id",
  validate({ params: idParamsSchema, body: updatePlanAdminSchema }),
  asyncHandler(adminController.updatePlan)
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
