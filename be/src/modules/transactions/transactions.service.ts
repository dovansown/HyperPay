import { AppError, ErrorCodes } from "../../shared/http/app-error.js";
import { accountsRepository } from "../accounts/accounts.repository.js";
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

  private async listByBankAccount(bankAccountId: number) {
    const txs = await transactionsRepository.listByBankAccountId(bankAccountId);
    return txs.map((tx) => ({
      id: tx.id,
      amount: Number(tx.amount),
      type: tx.type,
      description: tx.description ?? "",
      balance: Number(tx.balance ?? BigInt(0)),
      occurred_at: tx.occurredAt.toISOString()
    }));
  }
}

export const transactionsService = new TransactionsService();
