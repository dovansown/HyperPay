import { Router } from "express";
import { asyncHandler } from "../../shared/http/async-handler.js";
import { authMiddleware } from "../../shared/middleware/auth.middleware.js";
import { validate } from "../../shared/middleware/validate.middleware.js";
import { dashboardController } from "./dashboard.controller.js";
import { dashboardQuerySchema } from "./dashboard.schema.js";

export const dashboardRoutes = Router();

dashboardRoutes.use(authMiddleware);
dashboardRoutes.get("/", validate({ query: dashboardQuerySchema }), asyncHandler(dashboardController.get));
