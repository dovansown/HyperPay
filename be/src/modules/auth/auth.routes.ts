import { Router } from "express";
import { asyncHandler } from "../../shared/http/async-handler.js";
import { validate } from "../../shared/middleware/validate.middleware.js";
import { authController } from "./auth.controller.js";
import { forgotPasswordSchema, loginSchema, registerSchema } from "./auth.schema.js";

export const authRoutes = Router();

authRoutes.post("/register", validate({ body: registerSchema }), asyncHandler(authController.register));
authRoutes.post("/login", validate({ body: loginSchema }), asyncHandler(authController.login));
authRoutes.post(
  "/forgot-password",
  validate({ body: forgotPasswordSchema }),
  asyncHandler(authController.forgotPassword)
);
