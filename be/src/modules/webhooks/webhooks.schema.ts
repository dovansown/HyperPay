import { z } from "zod";
import {
  PaymentCodeCharset,
  TransactionDirectionFilter,
  WebhookAuthType,
  WebhookContentType
} from "@prisma/client";

export const upsertWebhookSchema = z.object({
  url: z.string().url(),
  secret_token: z.string().min(1),
  account_ids: z.array(z.number().int().positive()).optional().default([]),
  transaction_direction: z
    .nativeEnum(TransactionDirectionFilter)
    .optional()
    .default(TransactionDirectionFilter.BOTH),
  retry_on_non_2xx: z.boolean().optional().default(true),
  max_retry_attempts: z.number().int().min(1).max(10).optional().default(3),
  content_type: z.nativeEnum(WebhookContentType).optional().default(WebhookContentType.JSON),
  auth_type: z.nativeEnum(WebhookAuthType).optional().default(WebhookAuthType.NONE),
  auth_header_name: z.string().trim().min(1).max(100).optional(),
  auth_header_value: z.string().trim().min(1).max(512).optional(),
  auth_bearer_token: z.string().trim().min(1).max(512).optional(),
  auth_username: z.string().trim().min(1).max(255).optional(),
  auth_password: z.string().trim().min(1).max(255).optional(),
  require_payment_code: z.boolean().optional().default(false),
  payment_code_rule_enabled: z.boolean().optional().default(false),
  payment_code_prefix: z.string().trim().min(2).max(5).optional(),
  payment_code_suffix_min_length: z.number().int().min(1).max(32).optional(),
  payment_code_suffix_max_length: z.number().int().min(1).max(32).optional(),
  payment_code_suffix_charset: z.nativeEnum(PaymentCodeCharset).optional(),
  is_active: z.boolean().optional().default(true)
}).superRefine((value, ctx) => {
  if (value.max_retry_attempts < 1) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      path: ["max_retry_attempts"],
      message: "max_retry_attempts must be >= 1"
    });
  }
  if (value.auth_type === WebhookAuthType.BEARER && !value.auth_bearer_token) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      path: ["auth_bearer_token"],
      message: "auth_bearer_token is required when auth_type is BEARER"
    });
  }
  if (value.auth_type === WebhookAuthType.BASIC && (!value.auth_username || !value.auth_password)) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      path: ["auth_username"],
      message: "auth_username and auth_password are required when auth_type is BASIC"
    });
  }
  if (
    value.auth_type === WebhookAuthType.HEADER &&
    (!value.auth_header_name || !value.auth_header_value)
  ) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      path: ["auth_header_name"],
      message: "auth_header_name and auth_header_value are required when auth_type is HEADER"
    });
  }
  if (value.payment_code_rule_enabled) {
    if (!value.payment_code_prefix) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["payment_code_prefix"],
        message: "payment_code_prefix is required when payment_code_rule_enabled is true"
      });
    }
    if (!value.payment_code_suffix_min_length || !value.payment_code_suffix_max_length) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["payment_code_suffix_min_length"],
        message: "suffix length range is required when payment_code_rule_enabled is true"
      });
    }
    if (!value.payment_code_suffix_charset) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["payment_code_suffix_charset"],
        message: "payment_code_suffix_charset is required when payment_code_rule_enabled is true"
      });
    }
  }
  if (
    value.payment_code_suffix_min_length &&
    value.payment_code_suffix_max_length &&
    value.payment_code_suffix_min_length > value.payment_code_suffix_max_length
  ) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      path: ["payment_code_suffix_max_length"],
      message: "payment_code_suffix_max_length must be >= payment_code_suffix_min_length"
    });
  }
});

export type UpsertWebhookInput = z.infer<typeof upsertWebhookSchema>;
