import { Router } from "express";
import { asyncHandler } from "../../shared/http/async-handler.js";
import { authMiddleware } from "../../shared/middleware/auth.middleware.js";
import { validate } from "../../shared/middleware/validate.middleware.js";
import { webhooksController } from "./webhooks.controller.js";
import {
  upsertWebhookSchema,
  webhookIdParamSchema,
  sendTestBodySchema
} from "./webhooks.schema.js";

export const webhooksRoutes = Router();

webhooksRoutes.use(authMiddleware);
webhooksRoutes.get("/", asyncHandler(webhooksController.get));
webhooksRoutes.post("/", validate({ body: upsertWebhookSchema }), asyncHandler(webhooksController.create));
webhooksRoutes.put(
  "/:id",
  validate({ params: webhookIdParamSchema, body: upsertWebhookSchema }),
  asyncHandler(webhooksController.update)
);
webhooksRoutes.delete(
  "/:id",
  validate({ params: webhookIdParamSchema }),
  asyncHandler(webhooksController.delete)
);
webhooksRoutes.post("/test", validate({ body: sendTestBodySchema }), asyncHandler(webhooksController.sendTest));
webhooksRoutes.get("/logs", asyncHandler(webhooksController.getLogs));
