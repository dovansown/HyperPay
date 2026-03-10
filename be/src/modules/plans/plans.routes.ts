import { Router } from "express";
import { asyncHandler } from "../../shared/http/async-handler.js";
import { authMiddleware } from "../../shared/middleware/auth.middleware.js";
import { validate } from "../../shared/middleware/validate.middleware.js";
import { plansController } from "./plans.controller.js";
import { createPlanSchema } from "./plans.schema.js";

export const plansRoutes = Router();

plansRoutes.get("/", authMiddleware, asyncHandler(plansController.list));
plansRoutes.post("/", authMiddleware, validate({ body: createPlanSchema }), asyncHandler(plansController.create));
