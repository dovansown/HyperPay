import { UserRole } from "@prisma/client";
import { z } from "zod";

export const adminListQuerySchema = z.object({
  q: z.string().optional(),
  role: z.nativeEnum(UserRole).optional(),
  status: z.string().optional(),
  user_id: z.coerce.number().int().positive().optional(),
  package_id: z.coerce.number().int().positive().optional(),
  code: z.string().optional(),
  auth_type: z.string().optional(),
  is_active: z.coerce.boolean().optional(),
  tx_type: z.string().optional(),
  from: z.coerce.date().optional(),
  to: z.coerce.date().optional(),
  min_price_vnd: z.coerce.number().int().nonnegative().optional(),
  max_price_vnd: z.coerce.number().int().nonnegative().optional(),
  limit: z.coerce.number().int().min(1).max(200).optional().default(50),
  offset: z.coerce.number().int().min(0).optional().default(0)
});

export const userIdParamsSchema = z.object({
  userId: z.coerce.number().int().positive()
});

export const idParamsSchema = z.object({
  id: z.coerce.number().int().positive()
});

export const updateUserRoleSchema = z.object({
  role: z.nativeEnum(UserRole)
});

export const createPlanAdminSchema = z.object({
  name: z.string().min(1),
  price_vnd: z.coerce.number().int().nonnegative(),
  max_bank_accounts: z.coerce.number().int().min(1),
  max_transactions: z.coerce.number().int().min(1),
  duration_days: z.coerce.number().int().min(1),
  description: z.string().optional()
});

export const updatePlanAdminSchema = createPlanAdminSchema.partial();

export const createBankAdminSchema = z.object({
  name: z.string().min(1),
  code: z.string().min(2),
  icon_url: z.string().url().optional()
});

export const updateBankAdminSchema = createBankAdminSchema.partial();

export const assignUserPackageSchema = z.object({
  user_id: z.number().int().positive(),
  package_id: z.number().int().positive(),
  start_at: z.coerce.date().optional(),
  end_at: z.coerce.date().optional(),
  duration_days: z.coerce.number().int().min(1).optional(),
  status: z.string().optional().default("active")
});

export const updateUserPackageStatusSchema = z.object({
  status: z.string().min(1)
});

export type AdminListQuery = z.infer<typeof adminListQuerySchema>;
export type UpdateUserRoleInput = z.infer<typeof updateUserRoleSchema>;
export type CreatePlanAdminInput = z.infer<typeof createPlanAdminSchema>;
export type UpdatePlanAdminInput = z.infer<typeof updatePlanAdminSchema>;
export type CreateBankAdminInput = z.infer<typeof createBankAdminSchema>;
export type UpdateBankAdminInput = z.infer<typeof updateBankAdminSchema>;
export type AssignUserPackageInput = z.infer<typeof assignUserPackageSchema>;
export type UpdateUserPackageStatusInput = z.infer<typeof updateUserPackageStatusSchema>;
