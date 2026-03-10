import { prisma } from "../../shared/infra/prisma.js";

export class TransactionsRepository {
  listByBankAccountId(bankAccountId: number) {
    return prisma.bankTransaction.findMany({
      where: { bankAccountId, deletedAt: null },
      orderBy: { occurredAt: "desc" }
    });
  }
}

export const transactionsRepository = new TransactionsRepository();
