import { prisma } from "../../shared/infra/prisma.js";
import type { CreateAccountInput } from "./accounts.schema.js";

export class AccountsRepository {
  create(userId: number, input: CreateAccountInput, apiToken: string, apiTokenSuffix: string) {
    return prisma.bankAccount.create({
      data: {
        userId,
        bankName: input.bank_name,
        accountNumber: input.account_number,
        accountHolder: input.account_holder,
        apiToken,
        apiTokenSuffix
      }
    });
  }

  listByUserId(userId: number) {
    return prisma.bankAccount.findMany({
      where: { userId, deletedAt: null },
      orderBy: { id: "desc" }
    });
  }

  findByIdAndUser(accountId: number, userId: number) {
    return prisma.bankAccount.findFirst({
      where: { id: accountId, userId, deletedAt: null }
    });
  }

  updateToken(accountId: number, apiToken: string, apiTokenSuffix: string) {
    return prisma.bankAccount.update({
      where: { id: accountId },
      data: { apiToken, apiTokenSuffix }
    });
  }

  findByApiToken(apiToken: string) {
    return prisma.bankAccount.findFirst({
      where: { apiToken, deletedAt: null }
    });
  }
}

export const accountsRepository = new AccountsRepository();
