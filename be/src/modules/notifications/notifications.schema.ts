import { z } from "zod";

export const listNotificationsQuerySchema = z.object({
  unread_only: z
    .union([z.literal("true"), z.literal("false")])
    .optional()
    .transform((v) => (v === "true" ? true : v === "false" ? false : undefined)),
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(20),
});

export const notificationIdParamsSchema = z.object({
  notificationId: z.string().uuid(),
});

export type ListNotificationsQuery = z.infer<typeof listNotificationsQuerySchema>;

