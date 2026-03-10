import { Router } from "express";
import { asyncHandler } from "../../shared/http/async-handler.js";
import { authMiddleware } from "../../shared/middleware/auth.middleware.js";
import { usersController } from "./users.controller.js";

export const usersRoutes = Router();

usersRoutes.get("/me", authMiddleware, asyncHandler(usersController.me));
