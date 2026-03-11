import crypto from "node:crypto";
import { AppError, ErrorCodes } from "../../shared/http/app-error.js";
import { cacheService } from "../cache/cache.service.js";
import { packagesService } from "../packages/packages.service.js";
import { accountsRepository } from "./accounts.repository.js";
import type { CreateAccountInput } from "./accounts.schema.js";

export class AccountsService {
  private cacheKey(userId: number) {
    return `accounts:user:${userId}`;
  }

  async create(userId: number, input: CreateAccountInput) {
    const normalizedBankCode = await packagesService.assertBankAllowedAndSyncUsage(
      userId,
      input.bank_name
    );
    const token = this.generateApiToken();
    const suffix = token.slice(-8);
    const account = await accountsRepository.create(
      userId,
      { ...input, bank_name: normalizedBankCode },
      token,
      suffix
    );
    await cacheService.del(this.cacheKey(userId));
    return {
      account: this.mapAccount(account),
      token
    };
  }

  async list(userId: number) {
    const key = this.cacheKey(userId);
    const cached = await cacheService.get<Array<ReturnType<AccountsService["mapAccount"]>>>(key);
    if (cached) {
      return cached;
    }
    const accounts = await accountsRepository.listByUserId(userId);
    const mapped = accounts.map((account) => this.mapAccount(account));
    await cacheService.set(key, mapped);
    return mapped;
  }

  async refreshToken(userId: number, accountId: number) {
    const account = await accountsRepository.findByIdAndUser(accountId, userId);
    if (!account) {
      throw new AppError(404, ErrorCodes.NOT_FOUND, "Account not found");
    }

    const token = this.generateApiToken();
    const suffix = token.slice(-8);
    await accountsRepository.updateToken(account.id, token, suffix);
    await cacheService.del(this.cacheKey(userId));
    return { token };
  }

  private generateApiToken() {
    return crypto.randomBytes(32).toString("hex");
  }

  private mapAccount(account: {
    id: number;
    bankName: string;
    accountNumber: string;
    accountHolder: string | null;
    apiTokenSuffix: string | null;
  }) {
    return {
      id: account.id,
      bank_name: account.bankName,
      account_number: account.accountNumber,
      account_holder: account.accountHolder ?? "",
      api_token_suffix: account.apiTokenSuffix ?? ""
    };
  }
}

export const accountsService = new AccountsService();
