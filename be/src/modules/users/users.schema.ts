import { z } from "zod";

export const updateProfileSchema = z.object({
  full_name: z.string().min(1).max(255).optional(),
});

export const sendChangePasswordCodeSchema = z.object({});

export const checkChangePasswordSchema = z.object({
  current_password: z.string().min(1),
  new_password: z.string().min(6),
});

export const changePasswordSchema = z.object({
  verification_id: z.string().uuid(),
  code: z.string().min(6).max(6).regex(/^\d+$/, "Must be 6 digits"),
  current_password: z.string().min(1),
  new_password: z.string().min(6),
});

export const enable2FASchema = z.object({
  code: z.string().min(6).max(8),
});

export type UpdateProfileInput = z.infer<typeof updateProfileSchema>;
export type CheckChangePasswordInput = z.infer<typeof checkChangePasswordSchema>;
export type ChangePasswordInput = z.infer<typeof changePasswordSchema>;
export type Enable2FAInput = z.infer<typeof enable2FASchema>;
