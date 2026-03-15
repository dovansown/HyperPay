import { z } from "zod";

export const accountIdParamsSchema = z.object({
  accountId: z.string().uuid()
});

export const tokenParamsSchema = z.object({
  token: z.string().min(1)
});

export const createExternalTransactionSchema = z.object({
  amount: z.coerce.number().int(),
  type: z.string().trim().min(1).max(20),
  description: z.string().trim().max(512).optional(),
  payment_code: z.string().trim().max(64).optional(),
  balance: z.coerce.number().int().optional(),
  occurred_at: z.coerce.date().optional()
});

export type CreateExternalTransactionInput = z.infer<typeof createExternalTransactionSchema>;
