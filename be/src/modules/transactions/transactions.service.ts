import { AppError, ErrorCodes } from "../../shared/http/app-error.js";
import { accountsRepository } from "../accounts/accounts.repository.js";
import { packagesService } from "../packages/packages.service.js";
import { webhooksService } from "../webhooks/webhooks.service.js";
import type { CreateExternalTransactionInput } from "./transactions.schema.js";
import { transactionsRepository } from "./transactions.repository.js";

export class TransactionsService {
  async listByAccountId(accountId: number, userId: number) {
    const account = await accountsRepository.findByIdAndUser(accountId, userId);
    if (!account) {
      throw new AppError(404, ErrorCodes.NOT_FOUND, "Account not found");
    }
    return this.listByBankAccount(account.id);
  }

  async listByToken(token: string) {
    const account = await accountsRepository.findByApiToken(token);
    if (!account) {
      throw new AppError(401, ErrorCodes.UNAUTHORIZED, "Invalid API token");
    }
    return this.listByBankAccount(account.id);
  }

  async createByToken(token: string, input: CreateExternalTransactionInput) {
    const account = await accountsRepository.findByApiToken(token);
    if (!account) {
      throw new AppError(401, ErrorCodes.UNAUTHORIZED, "Invalid API token");
    }

    await packagesService.consumeTransactionQuota(account.userId, 1);
    const created = await transactionsRepository.create({
      bankAccountId: account.id,
      amount: input.amount,
      type: input.type,
      description: input.description,
      paymentCode: input.payment_code,
      balance: input.balance,
      occurredAt: input.occurred_at ?? new Date()
    });

    await webhooksService.dispatchForUser(account.userId, {
      event: "transaction.created",
      account_id: account.id,
      transaction_id: created.id,
      amount: Number(created.amount),
      type: created.type,
      description: created.description ?? "",
      payment_code: created.paymentCode ?? null,
      balance: Number(created.balance ?? BigInt(0)),
      occurred_at: created.occurredAt.toISOString()
    });

    return {
      id: created.id,
      amount: Number(created.amount),
      type: created.type,
      description: created.description ?? "",
      payment_code: created.paymentCode ?? "",
      balance: Number(created.balance ?? BigInt(0)),
      occurred_at: created.occurredAt.toISOString()
    };
  }

  private async listByBankAccount(bankAccountId: number) {
    const txs = await transactionsRepository.listByBankAccountId(bankAccountId);
    return txs.map((tx) => ({
      id: tx.id,
      amount: Number(tx.amount),
      type: tx.type,
      description: tx.description ?? "",
      payment_code: tx.paymentCode ?? "",
      balance: Number(tx.balance ?? BigInt(0)),
      occurred_at: tx.occurredAt.toISOString()
    }));
  }
}

export const transactionsService = new TransactionsService();
