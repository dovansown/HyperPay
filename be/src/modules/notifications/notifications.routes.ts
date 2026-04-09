import { Router } from "express";
import { asyncHandler } from "../../shared/http/async-handler.js";
import { authMiddleware } from "../../shared/middleware/auth.middleware.js";
import { validate } from "../../shared/middleware/validate.middleware.js";
import { notificationsController } from "./notifications.controller.js";
import {
  listNotificationsQuerySchema,
  notificationIdParamsSchema,
} from "./notifications.schema.js";

export const notificationsRoutes = Router();

notificationsRoutes.use(authMiddleware);

notificationsRoutes.get(
  "/",
  validate({ query: listNotificationsQuerySchema }),
  asyncHandler(notificationsController.list)
);

notificationsRoutes.post(
  "/:notificationId/read",
  validate({ params: notificationIdParamsSchema }),
  asyncHandler(notificationsController.markRead)
);

notificationsRoutes.post("/read-all", asyncHandler(notificationsController.markAllRead));

