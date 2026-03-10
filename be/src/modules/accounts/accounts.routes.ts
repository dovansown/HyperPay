import { Router } from "express";
import { asyncHandler } from "../../shared/http/async-handler.js";
import { authMiddleware } from "../../shared/middleware/auth.middleware.js";
import { validate } from "../../shared/middleware/validate.middleware.js";
import { accountsController } from "./accounts.controller.js";
import { accountIdParamsSchema, createAccountSchema } from "./accounts.schema.js";

export const accountsRoutes = Router();

accountsRoutes.use(authMiddleware);

accountsRoutes.post("/", validate({ body: createAccountSchema }), asyncHandler(accountsController.create));
accountsRoutes.get("/", asyncHandler(accountsController.list));
accountsRoutes.post(
  "/:accountId/token/refresh",
  validate({ params: accountIdParamsSchema }),
  asyncHandler(accountsController.refreshToken)
);
