import { z } from "zod";

export const topUpBodySchema = z.object({
  amount_vnd: z.coerce.number().int().min(1, "Amount must be positive")
});

export type TopUpBody = z.infer<typeof topUpBodySchema>;
