import { prisma } from "../../shared/infra/prisma.js";

export class TransactionsRepository {
  listByBankAccountId(bankAccountId: string) {
    return prisma.bankTransaction.findMany({
      where: { bankAccountId, deletedAt: null },
      orderBy: { occurredAt: "desc" }
    });
  }

  listByBankAccountIds(
    bankAccountIds: string[],
    options?: { from?: Date; to?: Date; limit?: number }
  ) {
    if (bankAccountIds.length === 0) {
      return Promise.resolve([]);
    }
    const where: { bankAccountId: { in: string[] }; deletedAt: null; occurredAt?: { gte?: Date; lte?: Date } } = {
      bankAccountId: { in: bankAccountIds },
      deletedAt: null
    };
    if (options?.from ?? options?.to) {
      where.occurredAt = {};
      if (options.from) where.occurredAt.gte = options.from;
      if (options.to) where.occurredAt.lte = options.to;
    }
    return prisma.bankTransaction.findMany({
      where,
      orderBy: { occurredAt: "desc" },
      ...(options?.limit != null && { take: options.limit })
    });
  }

  create(input: {
    bankAccountId: string;
    amount: number;
    type: string;
    description?: string;
    paymentCode?: string;
    balance?: number;
    occurredAt: Date;
  }) {
    return prisma.bankTransaction.create({
      data: {
        bankAccountId: input.bankAccountId,
        amount: BigInt(input.amount),
        type: input.type,
        description: input.description,
        paymentCode: input.paymentCode,
        balance: input.balance != null ? BigInt(input.balance) : null,
        occurredAt: input.occurredAt
      }
    });
  }
}

export const transactionsRepository = new TransactionsRepository();
