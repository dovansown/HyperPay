import { Router } from "express";
import { asyncHandler } from "../../shared/http/async-handler.js";
import { authMiddleware } from "../../shared/middleware/auth.middleware.js";
import { validate } from "../../shared/middleware/validate.middleware.js";
import { usersController } from "./users.controller.js";
import {
  checkChangePasswordSchema,
  changePasswordSchema,
  enable2FASchema,
  sendChangePasswordCodeSchema,
  updateProfileSchema,
} from "./users.schema.js";

export const usersRoutes = Router();

usersRoutes.get("/me", authMiddleware, asyncHandler(usersController.me));
usersRoutes.patch(
  "/me",
  authMiddleware,
  validate({ body: updateProfileSchema }),
  asyncHandler(usersController.updateProfile)
);
usersRoutes.post(
  "/me/change-password/check",
  authMiddleware,
  validate({ body: checkChangePasswordSchema }),
  asyncHandler(usersController.checkChangePassword)
);
usersRoutes.post(
  "/me/change-password/send-code",
  authMiddleware,
  validate({ body: sendChangePasswordCodeSchema }),
  asyncHandler(usersController.sendChangePasswordCode)
);
usersRoutes.post(
  "/me/change-password",
  authMiddleware,
  validate({ body: changePasswordSchema }),
  asyncHandler(usersController.changePassword)
);
usersRoutes.post(
  "/me/email/send-verification",
  authMiddleware,
  asyncHandler(usersController.sendVerifyEmailCode)
);
usersRoutes.get("/me/2fa/setup", authMiddleware, asyncHandler(usersController.get2FASetup));
usersRoutes.post(
  "/me/2fa/confirm",
  authMiddleware,
  validate({ body: enable2FASchema }),
  asyncHandler(usersController.enable2FA)
);
usersRoutes.post("/me/2fa/disable", authMiddleware, asyncHandler(usersController.disable2FA));
