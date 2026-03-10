import { z } from "zod";

export const upsertWebhookSchema = z.object({
  url: z.string().url(),
  secret_token: z.string().min(1),
  is_active: z.boolean().optional().default(true)
});

export type UpsertWebhookInput = z.infer<typeof upsertWebhookSchema>;
