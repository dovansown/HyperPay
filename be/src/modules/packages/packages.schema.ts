import { z } from "zod";
import { PackageStatus } from "@prisma/client";

export const createPackageSchema = z.object({
  name: z.string().trim().min(1).max(255),
  price_vnd: z.number().int().nonnegative(),
  status: z.nativeEnum(PackageStatus).optional().default(PackageStatus.ACTIVE),
  is_default: z.boolean().optional().default(false),
  default_start_at: z.coerce.date().optional(),
  default_end_at: z.coerce.date().optional(),
  max_transactions: z.number().int().min(0),
  max_webhook_deliveries: z.number().int().min(0),
  max_bank_types: z.number().int().min(0),
  duration_days: z.number().int().min(1),
  description: z.string().trim().max(512).optional(),
  bank_ids: z.array(z.string().uuid()).optional().default([])
}).superRefine((value, ctx) => {
  const uniqueBankIds = new Set(value.bank_ids);
  if (uniqueBankIds.size !== value.bank_ids.length) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      path: ["bank_ids"],
      message: "bank_ids must be unique"
    });
  }
  if (value.max_bank_types > 0 && value.bank_ids.length === 0) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      path: ["bank_ids"],
      message: "bank_ids is required when max_bank_types > 0"
    });
  }
  if (value.max_bank_types > 0 && value.bank_ids.length > value.max_bank_types) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      path: ["bank_ids"],
      message: "bank_ids length must be <= max_bank_types"
    });
  }
  if (value.default_end_at && value.default_start_at && value.default_end_at <= value.default_start_at) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      path: ["default_end_at"],
      message: "default_end_at must be greater than default_start_at"
    });
  }
});

export const purchasePackageParamsSchema = z.object({
  packageId: z.string().uuid()
});

export const purchasePackageBodySchema = z.object({
  duration_id: z.string().uuid()
});

export type PurchasePackageBody = z.infer<typeof purchasePackageBodySchema>;
export type CreatePackageInput = z.infer<typeof createPackageSchema>;
