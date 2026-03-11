import { Router } from "express";
import { asyncHandler } from "../../shared/http/async-handler.js";
import { authMiddleware } from "../../shared/middleware/auth.middleware.js";
import { validate } from "../../shared/middleware/validate.middleware.js";
import { transactionsController } from "./transactions.controller.js";
import {
  accountIdParamsSchema,
  createExternalTransactionSchema,
  tokenParamsSchema
} from "./transactions.schema.js";

export const transactionsRoutes = Router();

transactionsRoutes.get(
  "/accounts/:accountId/transactions",
  authMiddleware,
  validate({ params: accountIdParamsSchema }),
  asyncHandler(transactionsController.listByAccount)
);

transactionsRoutes.get(
  "/external/accounts/:token/transactions",
  validate({ params: tokenParamsSchema }),
  asyncHandler(transactionsController.listByToken)
);

transactionsRoutes.post(
  "/external/accounts/:token/transactions",
  validate({ params: tokenParamsSchema, body: createExternalTransactionSchema }),
  asyncHandler(transactionsController.createByToken)
);
