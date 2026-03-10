import { z } from "zod";

export const createPlanSchema = z.object({
  name: z.string().min(1),
  price_vnd: z.number().int().nonnegative(),
  max_bank_accounts: z.number().int().min(1),
  max_transactions: z.number().int().min(1),
  duration_days: z.number().int().min(1),
  description: z.string().optional(),
  bank_ids: z.array(z.number().int().positive()).optional().default([])
});

export type CreatePlanInput = z.infer<typeof createPlanSchema>;
