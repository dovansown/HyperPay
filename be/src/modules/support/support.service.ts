import type { SupportTicketCategory, SupportTicketPriority, SupportTicketStatus } from "@prisma/client";
import { AppError, ErrorCodes } from "../../shared/http/app-error.js";
import { supportRepository } from "./support.repository.js";
import type { CreateTicketInput, ListTicketsQuery, UpdateTicketInput } from "./support.schema.js";

export class SupportService {
  async listTickets(userId: string, query: ListTicketsQuery) {
    const skip = (query.page - 1) * query.limit;
    const take = query.limit;
    const { items, total } = await supportRepository.listTickets(userId, {
      q: query.q,
      status: query.status as SupportTicketStatus | undefined,
      priority: query.priority as SupportTicketPriority | undefined,
      category: query.category as SupportTicketCategory | undefined,
      skip,
      take,
    });
    return {
      items,
      page: query.page,
      limit: query.limit,
      total,
    };
  }

  async createTicket(userId: string, payload: CreateTicketInput) {
    return supportRepository.createTicket(userId, {
      subject: payload.subject,
      description: payload.description,
      category: payload.category as SupportTicketCategory,
      priority: (payload.priority ?? "MEDIUM") as SupportTicketPriority,
    });
  }

  async getTicket(userId: string, ticketId: string) {
    const ticket = await supportRepository.findTicketById(userId, ticketId);
    if (!ticket) throw new AppError(404, ErrorCodes.NOT_FOUND, "Ticket not found");
    return ticket;
  }

  async updateTicket(userId: string, ticketId: string, payload: UpdateTicketInput) {
    if (!payload.status && !payload.priority) {
      throw new AppError(400, ErrorCodes.INVALID_REQUEST, "Nothing to update");
    }
    const result = await supportRepository.updateTicket(userId, ticketId, {
      status: payload.status as SupportTicketStatus | undefined,
      priority: payload.priority as SupportTicketPriority | undefined,
    });
    if (result.count === 0) throw new AppError(404, ErrorCodes.NOT_FOUND, "Ticket not found");
    return this.getTicket(userId, ticketId);
  }
}

export const supportService = new SupportService();

