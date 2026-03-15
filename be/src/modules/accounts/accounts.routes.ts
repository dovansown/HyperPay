import { Router } from "express";
import { asyncHandler } from "../../shared/http/async-handler.js";
import { authMiddleware } from "../../shared/middleware/auth.middleware.js";
import { validate } from "../../shared/middleware/validate.middleware.js";
import { accountsController } from "./accounts.controller.js";
import {
  accountIdParamsSchema,
  createAccountSchema,
  updateAccountSchema
} from "./accounts.schema.js";

export const accountsRoutes = Router();

accountsRoutes.use(authMiddleware);

accountsRoutes.post("/", validate({ body: createAccountSchema }), asyncHandler(accountsController.create));
accountsRoutes.get("/", asyncHandler(accountsController.list));
accountsRoutes.patch(
  "/:accountId",
  validate({ params: accountIdParamsSchema, body: updateAccountSchema }),
  asyncHandler(accountsController.update)
);
accountsRoutes.delete(
  "/:accountId",
  validate({ params: accountIdParamsSchema }),
  asyncHandler(accountsController.remove)
);
accountsRoutes.post(
  "/:accountId/token/refresh",
  validate({ params: accountIdParamsSchema }),
  asyncHandler(accountsController.refreshToken)
);
