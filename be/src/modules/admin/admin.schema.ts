import { PackageStatus, UserRole } from "@prisma/client";
import { z } from "zod";

const packageBankItemSchema = z.object({
  bank_id: z.string().uuid(),
  account_limit: z.coerce.number().int().min(1).default(1)
});

export const adminListQuerySchema = z.object({
  q: z.string().optional(),
  role: z.nativeEnum(UserRole).optional(),
  status: z.string().optional(),
  user_id: z.string().uuid().optional(),
  package_id: z.string().uuid().optional(),
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
  userId: z.string().uuid()
});

export const idParamsSchema = z.object({
  id: z.string().uuid()
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
  user_id: z.string().uuid(),
  package_id: z.string().uuid(),
  start_at: z.coerce.date().optional(),
  end_at: z.coerce.date().optional(),
  duration_days: z.coerce.number().int().min(1).optional(),
  duration_id: z.string().uuid().optional(),
  status: z.string().optional().default("active")
});

export const updateUserPackageStatusSchema = z.object({
  status: z.string().min(1)
});

const packagePricingItemSchema = z.object({
  duration_id: z.string().uuid(),
  price_vnd: z.coerce.number().int().nonnegative()
});

export const createPackageAdminSchema = z.object({
  name: z.string().trim().min(1).max(255),
  price_vnd: z.coerce.number().int().nonnegative(),
  status: z.nativeEnum(PackageStatus).optional().default(PackageStatus.ACTIVE),
  is_default: z.coerce.boolean().optional().default(false),
  apply_default_discount: z.coerce.boolean().optional().default(false),
  max_transactions: z.coerce.number().int().min(0),
  max_webhook_deliveries: z.coerce.number().int().min(0),
  description: z.string().trim().max(512).optional(),
  banks: z.array(packageBankItemSchema).min(0),
  pricing: z.array(packagePricingItemSchema).min(0)
}).refine((v) => new Set(v.banks.map((b) => b.bank_id)).size === v.banks.length, {
  message: "banks must have unique bank_id",
  path: ["banks"]
}).refine((v) => new Set(v.pricing.map((p) => p.duration_id)).size === v.pricing.length, {
  message: "pricing must have unique duration_id",
  path: ["pricing"]
});

export const updatePackageAdminSchema = z.object({
  name: z.string().trim().min(1).max(255).optional(),
  price_vnd: z.coerce.number().int().nonnegative().optional(),
  status: z.nativeEnum(PackageStatus).optional(),
  is_default: z.coerce.boolean().optional(),
  apply_default_discount: z.coerce.boolean().optional(),
  max_transactions: z.coerce.number().int().min(0).optional(),
  max_webhook_deliveries: z.coerce.number().int().min(0).optional(),
  description: z.string().trim().max(512).optional(),
  banks: z.array(packageBankItemSchema).min(0).optional(),
  pricing: z.array(packagePricingItemSchema).min(0).optional()
}).refine((v) => !v.banks || new Set(v.banks.map((b) => b.bank_id)).size === v.banks.length, {
  message: "banks must have unique bank_id",
  path: ["banks"]
}).refine((v) => !v.pricing || new Set(v.pricing.map((p) => p.duration_id)).size === v.pricing.length, {
  message: "pricing must have unique duration_id",
  path: ["pricing"]
});

export type AdminListQuery = z.infer<typeof adminListQuerySchema>;
export type UpdateUserRoleInput = z.infer<typeof updateUserRoleSchema>;
export type CreatePlanAdminInput = z.infer<typeof createPlanAdminSchema>;
export type UpdatePlanAdminInput = z.infer<typeof updatePlanAdminSchema>;
export type CreateBankAdminInput = z.infer<typeof createBankAdminSchema>;
export type UpdateBankAdminInput = z.infer<typeof updateBankAdminSchema>;
export type AssignUserPackageInput = z.infer<typeof assignUserPackageSchema>;
export type UpdateUserPackageStatusInput = z.infer<typeof updateUserPackageStatusSchema>;
export const createDurationAdminSchema = z.object({
  name: z.string().trim().min(1).max(120),
  months: z.coerce.number().int().min(1),
  days: z.coerce.number().int().min(1),
  sort_order: z.coerce.number().int().min(0).optional().default(0),
  is_default: z.coerce.boolean().optional().default(false),
  discount_percent: z.coerce.number().int().min(0).max(100).optional().nullable()
});

export const updateDurationAdminSchema = z.object({
  name: z.string().trim().min(1).max(120).optional(),
  months: z.coerce.number().int().min(1).optional(),
  days: z.coerce.number().int().min(1).optional(),
  sort_order: z.coerce.number().int().min(0).optional(),
  is_default: z.coerce.boolean().optional(),
  discount_percent: z.coerce.number().int().min(0).max(100).optional().nullable()
});

export type CreateDurationAdminInput = z.infer<typeof createDurationAdminSchema>;
export type UpdateDurationAdminInput = z.infer<typeof updateDurationAdminSchema>;
export type CreatePackageAdminInput = z.infer<typeof createPackageAdminSchema>;
export type UpdatePackageAdminInput = z.infer<typeof updatePackageAdminSchema>;

export const systemSettingsSmtpSchema = z.object({
  host: z.string().min(1).optional(),
  port: z.coerce.number().int().min(1).max(65535).optional(),
  secure: z.boolean().optional(),
  user: z.string().optional(),
  pass: z.string().optional(),
  fromEmail: z.string().email().optional(),
  fromName: z.string().optional(),
});

export const systemSettingsRateLimitSchema = z.object({
  loginAttempts: z.coerce.number().int().min(1).max(100).optional(),
  loginWindowSeconds: z.coerce.number().int().min(60).max(86400).optional(),
  emailPerUserPerHour: z.coerce.number().int().min(1).max(100).optional(),
});

export const systemSettingsAlertLevelSchema = z.enum(["require_verify", "warn_only"]);

export const systemSettingsNotificationDefaultsSchema = z.object({
  success: z.boolean().optional(),
  failed: z.boolean().optional(),
  disputes: z.boolean().optional(),
  payouts: z.boolean().optional(),
  team: z.boolean().optional(),
});

export const systemSettingsUpdateSchema = z.object({
  smtp_config: systemSettingsSmtpSchema.optional(),
  rate_limit: systemSettingsRateLimitSchema.optional(),
  alert_level: systemSettingsAlertLevelSchema.optional(),
  notification_defaults: systemSettingsNotificationDefaultsSchema.optional(),
});

export type SystemSettingsUpdateInput = z.infer<typeof systemSettingsUpdateSchema>;
