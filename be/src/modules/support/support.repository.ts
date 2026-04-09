import { prisma } from "../../shared/infra/prisma.js";
import type {
  Prisma,
  SupportTicketCategory,
  SupportTicketPriority,
  SupportTicketStatus,
} from "@prisma/client";

export class SupportRepository {
  createTicket(userId: string, data: {
    subject: string;
    description: string;
    category: SupportTicketCategory;
    priority: SupportTicketPriority;
  }) {
    return prisma.supportTicket.create({
      data: {
        userId,
        subject: data.subject,
        description: data.description,
        category: data.category,
        priority: data.priority,
      },
      select: {
        id: true,
        code: true,
        subject: true,
        description: true,
        category: true,
        priority: true,
        status: true,
        createdAt: true,
        updatedAt: true,
      },
    });
  }

  async findTicketById(userId: string, ticketId: string) {
    return prisma.supportTicket.findFirst({
      where: { id: ticketId, userId, deletedAt: null },
      select: {
        id: true,
        code: true,
        subject: true,
        description: true,
        category: true,
        priority: true,
        status: true,
        createdAt: true,
        updatedAt: true,
      },
    });
  }

  async listTickets(userId: string, opts: {
    q?: string;
    status?: SupportTicketStatus;
    priority?: SupportTicketPriority;
    category?: SupportTicketCategory;
    skip: number;
    take: number;
  }) {
    const where: Prisma.SupportTicketWhereInput = {
      userId,
      deletedAt: null,
      ...(opts.status ? { status: opts.status } : null),
      ...(opts.priority ? { priority: opts.priority } : null),
      ...(opts.category ? { category: opts.category } : null),
      ...(opts.q
        ? {
            OR: [
              { subject: { contains: opts.q, mode: "insensitive" } },
              { code: { contains: opts.q, mode: "insensitive" } },
            ],
          }
        : null),
    };

    const [items, total] = await prisma.$transaction([
      prisma.supportTicket.findMany({
        where,
        orderBy: { createdAt: "desc" },
        skip: opts.skip,
        take: opts.take,
        select: {
          id: true,
          code: true,
          subject: true,
          category: true,
          priority: true,
          status: true,
          createdAt: true,
          updatedAt: true,
        },
      }),
      prisma.supportTicket.count({ where }),
    ]);

    return { items, total };
  }

  async updateTicket(userId: string, ticketId: string, data: {
    status?: SupportTicketStatus;
    priority?: SupportTicketPriority;
  }) {
    return prisma.supportTicket.updateMany({
      where: { id: ticketId, userId, deletedAt: null },
      data: {
        ...(data.status ? { status: data.status } : null),
        ...(data.priority ? { priority: data.priority } : null),
      },
    });
  }
}

export const supportRepository = new SupportRepository();

