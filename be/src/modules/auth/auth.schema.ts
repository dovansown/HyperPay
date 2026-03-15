import { z } from "zod";

export const registerSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6),
  full_name: z.string().min(1)
});

export const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1)
});

export const forgotPasswordSchema = z.object({
  email: z.string().email()
});

export const verifySchema = z.object({
  verification_id: z.string().uuid(),
  code: z.string().min(6).max(6).regex(/^\d+$/, "Must be 6 digits"),
  type: z.enum(["email", "login"]).optional().default("login"),
});

export const verify2FASchema = z.object({
  temp_token: z.string().min(1),
  code: z.string().min(6).max(8),
});

export type RegisterInput = z.infer<typeof registerSchema>;
export type LoginInput = z.infer<typeof loginSchema>;
export type ForgotPasswordInput = z.infer<typeof forgotPasswordSchema>;
export type VerifyInput = z.infer<typeof verifySchema>;
export type Verify2FAInput = z.infer<typeof verify2FASchema>;
