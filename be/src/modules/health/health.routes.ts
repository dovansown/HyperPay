import { Router } from "express";
import { asyncHandler } from "../../shared/http/async-handler.js";
import { healthController } from "./health.controller.js";

export const healthRoutes = Router();

healthRoutes.get("/", asyncHandler(healthController.check));
