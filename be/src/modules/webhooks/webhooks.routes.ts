import { Router } from "express";
import { asyncHandler } from "../../shared/http/async-handler.js";
import { authMiddleware } from "../../shared/middleware/auth.middleware.js";
import { validate } from "../../shared/middleware/validate.middleware.js";
import { webhooksController } from "./webhooks.controller.js";
import { upsertWebhookSchema } from "./webhooks.schema.js";

export const webhooksRoutes = Router();

webhooksRoutes.use(authMiddleware);
webhooksRoutes.get("/", asyncHandler(webhooksController.get));
webhooksRoutes.post("/", validate({ body: upsertWebhookSchema }), asyncHandler(webhooksController.upsert));
