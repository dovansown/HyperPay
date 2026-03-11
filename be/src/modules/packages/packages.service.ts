import { AppError, ErrorCodes } from "../../shared/http/app-error.js";
import { PackageStatus } from "@prisma/client";
import { packagesRepository } from "./packages.repository.js";
import type { CreatePackageInput } from "./packages.schema.js";

export class PackagesService {
  private async getActivePackageOrThrow(userId: number) {
    const item = await packagesRepository.findActiveUserPackage(userId, new Date());
    if (!item) {
      throw new AppError(403, ErrorCodes.FORBIDDEN, "No active package");
    }
    return item;
  }

  async create(input: CreatePackageInput) {
    const existed = await packagesRepository.findByName(input.name);
    if (existed) {
      throw new AppError(409, ErrorCodes.CONFLICT, "Package already exists");
    }
    const bankIds = [...new Set(input.bank_ids ?? [])];
    const existingBankCount = await packagesRepository.countExistingBanks(bankIds);
    if (bankIds.length > 0 && existingBankCount !== bankIds.length) {
      throw new AppError(400, ErrorCodes.INVALID_REQUEST, "Some bank_ids do not exist");
    }
    const item = await packagesRepository.create(input);
    return this.mapPackage(item);
  }

  async list() {
    const items = await packagesRepository.list();
    return items.map((item) => this.mapPackage(item));
  }

  async purchase(userId: number, packageId: number) {
    const now = new Date();
    const active = await packagesRepository.findActiveUserPackage(userId, now);
    if (active) {
      throw new AppError(
        409,
        ErrorCodes.CONFLICT,
        "User already has an active package. Wait until it expires."
      );
    }

    const item = await packagesRepository.findById(packageId);
    if (!item) {
      throw new AppError(404, ErrorCodes.NOT_FOUND, "Package not found");
    }
    if (item.status !== PackageStatus.ACTIVE) {
      throw new AppError(409, ErrorCodes.CONFLICT, "Package is not active");
    }

    const startAt = now;
    const endAt = new Date(startAt.getTime() + item.durationDays * 24 * 60 * 60 * 1000);
    const purchase = await packagesRepository.createPurchase(userId, packageId, startAt, endAt);

    return this.mapUserPackage(purchase);
  }

  async myActivePackage(userId: number) {
    const item = await packagesRepository.findActiveUserPackage(userId, new Date());
    if (!item) {
      return null;
    }
    return this.mapUserPackage(item);
  }

  async assertBankAllowedAndSyncUsage(userId: number, bankCodeOrName: string) {
    const active = await this.getActivePackageOrThrow(userId);
    const limit = active.package.maxBankTypes;
    const bank = await packagesRepository.findBankByCodeOrName(bankCodeOrName);
    if (!bank) {
      throw new AppError(400, ErrorCodes.INVALID_REQUEST, "Bank not found");
    }
    if (limit === 0) {
      return bank.code;
    }

    const allowedBankIds = active.package.packageBanks.map((item) => item.bankId);
    if (allowedBankIds.length > 0 && !allowedBankIds.includes(bank.id)) {
      throw new AppError(403, ErrorCodes.FORBIDDEN, "Bank type is not allowed by current package");
    }

    const bankNames = await packagesRepository.countDistinctUserBankNamesInRange(
      userId,
      active.startAt,
      active.endAt
    );
    const alreadyUsing = bankNames.some(
      (item) => item.bankName === bank.code || item.bankName === bank.name
    );
    const usedCount = bankNames.length;
    if (!alreadyUsing && usedCount >= limit) {
      throw new AppError(403, ErrorCodes.FORBIDDEN, "Reached bank type limit of current package");
    }

    const nextUsed = alreadyUsing ? usedCount : usedCount + 1;
    await packagesRepository.updateUsedBankTypes(active.id, nextUsed);
    return bank.code;
  }

  async consumeTransactionQuota(userId: number, by = 1) {
    const active = await this.getActivePackageOrThrow(userId);
    const limit = active.package.maxTransactions;
    if (limit > 0 && active.usedTransactions + by > limit) {
      throw new AppError(403, ErrorCodes.FORBIDDEN, "Reached transaction limit of current package");
    }
    await packagesRepository.increaseUsedTransactions(active.id, by);
  }

  async consumeWebhookDeliveryQuota(userId: number, by = 1) {
    const active = await this.getActivePackageOrThrow(userId);
    const limit = active.package.maxWebhookDeliveries;
    if (limit > 0 && active.usedWebhookDeliveries + by > limit) {
      throw new AppError(403, ErrorCodes.FORBIDDEN, "Reached webhook delivery limit of current package");
    }
    await packagesRepository.increaseUsedWebhookDeliveries(active.id, by);
  }

  async assignDefaultPackageForUser(userId: number) {
    const now = new Date();
    const active = await packagesRepository.findActiveUserPackage(userId, now);
    if (active) {
      return this.mapUserPackage(active);
    }

    const defaultPackage = await packagesRepository.findActiveDefaultPackage(now);
    if (!defaultPackage) {
      return null;
    }

    const startAt = now;
    const endAt = new Date(startAt.getTime() + defaultPackage.durationDays * 24 * 60 * 60 * 1000);
    const purchase = await packagesRepository.createPurchase(userId, defaultPackage.id, startAt, endAt);
    return this.mapUserPackage(purchase);
  }

  private mapPackage(item: {
    id: number;
    name: string;
    status: PackageStatus;
    isDefault: boolean;
    defaultStartAt: Date | null;
    defaultEndAt: Date | null;
    priceVnd: bigint;
    maxTransactions: number;
    maxWebhookDeliveries: number;
    maxBankTypes: number;
    durationDays: number;
    description: string | null;
    packageBanks: Array<{ bankId: number }>;
  }) {
    const limit = (value: number) => (value === 0 ? null : value);
    return {
      id: item.id,
      name: item.name,
      status: item.status,
      is_default: item.isDefault,
      default_start_at: item.defaultStartAt,
      default_end_at: item.defaultEndAt,
      price_vnd: Number(item.priceVnd),
      max_transactions: limit(item.maxTransactions),
      max_webhook_deliveries: limit(item.maxWebhookDeliveries),
      max_bank_types: limit(item.maxBankTypes),
      is_unlimited_transactions: item.maxTransactions === 0,
      is_unlimited_webhook_deliveries: item.maxWebhookDeliveries === 0,
      is_unlimited_bank_types: item.maxBankTypes === 0,
      duration_days: item.durationDays,
      description: item.description ?? "",
      bank_ids: item.packageBanks.map((x) => x.bankId)
    };
  }

  private mapUserPackage(item: {
    id: number;
    userId: number;
    packageId: number;
    startAt: Date;
    endAt: Date;
    usedTransactions: number;
    usedWebhookDeliveries: number;
    usedBankTypes: number;
    status: string;
    package: {
      id: number;
      name: string;
      status: PackageStatus;
      isDefault: boolean;
      defaultStartAt: Date | null;
      defaultEndAt: Date | null;
      priceVnd: bigint;
      maxTransactions: number;
      maxWebhookDeliveries: number;
      maxBankTypes: number;
      durationDays: number;
      description: string | null;
      packageBanks: Array<{ bankId: number }>;
    };
  }) {
    const normalizeLimit = (value: number) => (value === 0 ? null : value);
    return {
      id: item.id,
      user_id: item.userId,
      package_id: item.packageId,
      status: item.status,
      start_at: item.startAt,
      end_at: item.endAt,
      usage: {
        transactions: item.usedTransactions,
        webhook_deliveries: item.usedWebhookDeliveries,
        bank_types: item.usedBankTypes
      },
      limits: {
        transactions: normalizeLimit(item.package.maxTransactions),
        webhook_deliveries: normalizeLimit(item.package.maxWebhookDeliveries),
        bank_types: normalizeLimit(item.package.maxBankTypes),
        is_unlimited_transactions: item.package.maxTransactions === 0,
        is_unlimited_webhook_deliveries: item.package.maxWebhookDeliveries === 0,
        is_unlimited_bank_types: item.package.maxBankTypes === 0
      },
      allowed_bank_ids: item.package.packageBanks.map((x) => x.bankId),
      package: this.mapPackage(item.package)
    };
  }
}

export const packagesService = new PackagesService();
