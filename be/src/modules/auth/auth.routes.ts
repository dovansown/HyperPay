import { Router } from "express";
import { asyncHandler } from "../../shared/http/async-handler.js";
import { validate } from "../../shared/middleware/validate.middleware.js";
import { authController } from "./auth.controller.js";
import { forgotPasswordSchema, loginSchema, registerSchema, verify2FASchema, verifySchema } from "./auth.schema.js";

export const authRoutes = Router();

authRoutes.post("/register", validate({ body: registerSchema }), asyncHandler(authController.register));
authRoutes.post("/login", validate({ body: loginSchema }), asyncHandler(authController.login));
authRoutes.post("/verify", validate({ body: verifySchema }), asyncHandler(authController.verify));
authRoutes.post("/2fa", validate({ body: verify2FASchema }), asyncHandler(authController.verify2FA));
authRoutes.post(
  "/forgot-password",
  validate({ body: forgotPasswordSchema }),
  asyncHandler(authController.forgotPassword)
);
