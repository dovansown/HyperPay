import { z } from "zod";

export const listTicketsQuerySchema = z.object({
  q: z.string().trim().min(1).max(200).optional(),
  status: z.enum(["OPEN", "IN_PROGRESS", "CLOSED"]).optional(),
  priority: z.enum(["LOW", "MEDIUM", "HIGH"]).optional(),
  category: z.enum(["BILLING", "TECHNICAL", "ACCOUNT", "OTHER"]).optional(),
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(20),
});

export const createTicketSchema = z.object({
  subject: z.string().trim().min(3).max(255),
  description: z.string().trim().min(10).max(10_000),
  category: z.enum(["BILLING", "TECHNICAL", "ACCOUNT", "OTHER"]),
  priority: z.enum(["LOW", "MEDIUM", "HIGH"]).optional(),
});

export const ticketIdParamsSchema = z.object({
  ticketId: z.string().uuid(),
});

export const updateTicketSchema = z.object({
  status: z.enum(["OPEN", "IN_PROGRESS", "CLOSED"]).optional(),
  priority: z.enum(["LOW", "MEDIUM", "HIGH"]).optional(),
});

export const createReplySchema = z.object({
  message: z.string().trim().min(1).max(10_000),
  attachments: z.array(z.string().url()).optional(),
});

export const replyIdParamsSchema = z.object({
  replyId: z.string().uuid(),
});

export type ListTicketsQuery = z.infer<typeof listTicketsQuerySchema>;
export type CreateTicketInput = z.infer<typeof createTicketSchema>;
export type UpdateTicketInput = z.infer<typeof updateTicketSchema>;
export type CreateReplyInput = z.infer<typeof createReplySchema>;

