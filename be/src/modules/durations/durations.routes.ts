import { Router } from "express";
import { asyncHandler } from "../../shared/http/async-handler.js";
import { authMiddleware } from "../../shared/middleware/auth.middleware.js";
import { durationsController } from "./durations.controller.js";

export const durationsRoutes = Router();

durationsRoutes.get("/", authMiddleware, asyncHandler(durationsController.list));
