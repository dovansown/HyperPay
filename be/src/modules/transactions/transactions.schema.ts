import { z } from "zod";

export const accountIdParamsSchema = z.object({
  accountId: z.coerce.number().int().positive()
});

export const tokenParamsSchema = z.object({
  token: z.string().min(1)
});
