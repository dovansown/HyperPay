import { z } from "zod";

export const createAccountSchema = z.object({
  bank_name: z.string().min(1),
  account_number: z.string().min(1),
  account_holder: z.string().min(1)
});

export const accountIdParamsSchema = z.object({
  accountId: z.string().uuid()
});

export const updateAccountSchema = z
  .object({
    account_holder: z.string().min(1).optional(),
    account_number: z.string().min(1).optional()
  })
  .refine((d) => d.account_holder !== undefined || d.account_number !== undefined, {
    message: "Cần ít nhất một trường account_holder hoặc account_number"
  });

export type CreateAccountInput = z.infer<typeof createAccountSchema>;
export type UpdateAccountInput = z.infer<typeof updateAccountSchema>;
