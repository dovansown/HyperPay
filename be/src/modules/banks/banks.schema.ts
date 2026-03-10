import { z } from "zod";

export const createBankSchema = z.object({
  name: z.string().min(1),
  code: z.string().min(1),
  icon_url: z.string().url().optional()
});

export type CreateBankInput = z.infer<typeof createBankSchema>;
