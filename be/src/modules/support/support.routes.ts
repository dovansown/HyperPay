import { Router } from "express";
import { asyncHandler } from "../../shared/http/async-handler.js";
import { authMiddleware } from "../../shared/middleware/auth.middleware.js";
import { validate } from "../../shared/middleware/validate.middleware.js";
import { supportController } from "./support.controller.js";
import {
  createTicketSchema,
  listTicketsQuerySchema,
  ticketIdParamsSchema,
  updateTicketSchema,
  createReplySchema,
} from "./support.schema.js";

export const supportRoutes = Router();

supportRoutes.use(authMiddleware);

supportRoutes.get(
  "/tickets",
  validate({ query: listTicketsQuerySchema }),
  asyncHandler(supportController.listTickets)
);
supportRoutes.post(
  "/tickets",
  validate({ body: createTicketSchema }),
  asyncHandler(supportController.createTicket)
);
supportRoutes.get(
  "/tickets/:ticketId",
  validate({ params: ticketIdParamsSchema }),
  asyncHandler(supportController.getTicket)
);
supportRoutes.patch(
  "/tickets/:ticketId",
  validate({ params: ticketIdParamsSchema, body: updateTicketSchema }),
  asyncHandler(supportController.updateTicket)
);


supportRoutes.post(
  "/tickets/:ticketId/replies",
  validate({ params: ticketIdParamsSchema, body: createReplySchema }),
  asyncHandler(supportController.createReply)
);
supportRoutes.get(
  "/tickets/:ticketId/replies",
  validate({ params: ticketIdParamsSchema }),
  asyncHandler(supportController.listReplies)
);
