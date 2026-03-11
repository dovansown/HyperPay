import { prisma } from "../../shared/infra/prisma.js";

export class TransactionsRepository {
  listByBankAccountId(bankAccountId: number) {
    return prisma.bankTransaction.findMany({
      where: { bankAccountId, deletedAt: null },
      orderBy: { occurredAt: "desc" }
    });
  }

  create(input: {
    bankAccountId: number;
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
