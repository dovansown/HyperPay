import type { Request, Response } from "express";
import { sendSuccess } from "../../shared/http/http-response.js";
import { supportService } from "./support.service.js";
import type { ListTicketsQuery } from "./support.schema.js";

export class SupportController {
  async listTickets(req: Request, res: Response) {
    const data = await supportService.listTickets(req.user!.userId, req.query as unknown as ListTicketsQuery);
    return sendSuccess(res, data);
  }

  async createTicket(req: Request, res: Response) {
    const data = await supportService.createTicket(req.user!.userId, req.body);
    return sendSuccess(res, data, 201);
  }

  async getTicket(req: Request, res: Response) {
    const data = await supportService.getTicket(req.user!.userId, String(req.params.ticketId));
    return sendSuccess(res, data);
  }

  async updateTicket(req: Request, res: Response) {
    const data = await supportService.updateTicket(req.user!.userId, String(req.params.ticketId), req.body);
    return sendSuccess(res, data);
  }
}

export const supportController = new SupportController();

