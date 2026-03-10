import { z } from "zod";

export const createAccountSchema = z.object({
  bank_name: z.string().min(1),
  account_number: z.string().min(1),
  account_holder: z.string().min(1)
});

export const accountIdParamsSchema = z.object({
  accountId: z.coerce.number().int().positive()
});

export type CreateAccountInput = z.infer<typeof createAccountSchema>;
