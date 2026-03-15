import crypto from "node:crypto";
import { AppError, ErrorCodes } from "../../shared/http/app-error.js";
import { cacheService } from "../cache/cache.service.js";
import { packagesService } from "../packages/packages.service.js";
import { accountsRepository } from "./accounts.repository.js";
import type { CreateAccountInput, UpdateAccountInput } from "./accounts.schema.js";

export class AccountsService {
  private cacheKey(userId: string) {
    return `accounts:user:${userId}`;
  }

  async create(userId: string, input: CreateAccountInput) {
    const normalizedBankCode = await packagesService.assertBankAllowedAndSyncUsage(
      userId,
      input.bank_name
    );
    const existing = await accountsRepository.findByUserIdAndBankName(userId, normalizedBankCode);
    const normalizedHolder = input.account_holder.trim().toLowerCase();
    const duplicate = existing.some(
      (a) => (a.accountHolder ?? "").trim().toLowerCase() === normalizedHolder
    );
    if (duplicate) {
      throw new AppError(
        409,
        ErrorCodes.CONFLICT,
        "Tài khoản ngân hàng với chủ tài khoản này đã tồn tại cho ngân hàng đã chọn."
      );
    }
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

  async list(userId: string) {
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

  async refreshToken(userId: string, accountId: string) {
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

  async update(userId: string, accountId: string, input: UpdateAccountInput) {
    const account = await accountsRepository.findByIdAndUser(accountId, userId);
    if (!account) {
      throw new AppError(404, ErrorCodes.NOT_FOUND, "Account not found");
    }
    const updated = await accountsRepository.update(account.id, {
      ...(input.account_holder !== undefined && { accountHolder: input.account_holder }),
      ...(input.account_number !== undefined && { accountNumber: input.account_number })
    });
    await cacheService.del(this.cacheKey(userId));
    return this.mapAccount(updated);
  }

  async remove(userId: string, accountId: string) {
    const result = await accountsRepository.softDelete(accountId, userId);
    if (result.count === 0) {
      throw new AppError(404, ErrorCodes.NOT_FOUND, "Account not found");
    }
    await cacheService.del(this.cacheKey(userId));
    return { deleted: true };
  }

  private generateApiToken() {
    return crypto.randomBytes(32).toString("hex");
  }

  private mapAccount(account: {
    id: string;
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
