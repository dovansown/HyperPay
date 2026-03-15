import { prisma } from "../../shared/infra/prisma.js";
import type { CreateAccountInput } from "./accounts.schema.js";

export class AccountsRepository {
  create(userId: string, input: CreateAccountInput, apiToken: string, apiTokenSuffix: string) {
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

  listByUserId(userId: string) {
    return prisma.bankAccount.findMany({
      where: { userId, deletedAt: null },
      orderBy: { createdAt: "desc" }
    });
  }

  findByUserIdAndBankName(userId: string, bankName: string) {
    return prisma.bankAccount.findMany({
      where: { userId, bankName, deletedAt: null }
    });
  }

  findByIdAndUser(accountId: string, userId: string) {
    return prisma.bankAccount.findFirst({
      where: { id: accountId, userId, deletedAt: null }
    });
  }

  updateToken(accountId: string, apiToken: string, apiTokenSuffix: string) {
    return prisma.bankAccount.update({
      where: { id: accountId },
      data: { apiToken, apiTokenSuffix }
    });
  }

  update(accountId: string, data: { accountHolder?: string; accountNumber?: string }) {
    return prisma.bankAccount.update({
      where: { id: accountId },
      data: {
        ...(data.accountHolder !== undefined && { accountHolder: data.accountHolder }),
        ...(data.accountNumber !== undefined && { accountNumber: data.accountNumber })
      }
    });
  }

  softDelete(accountId: string, userId: string) {
    return prisma.bankAccount.updateMany({
      where: { id: accountId, userId, deletedAt: null },
      data: { deletedAt: new Date() }
    });
  }

  findByApiToken(apiToken: string) {
    return prisma.bankAccount.findFirst({
      where: { apiToken, deletedAt: null }
    });
  }
}

export const accountsRepository = new AccountsRepository();
