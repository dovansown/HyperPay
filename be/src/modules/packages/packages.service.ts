import { AppError, ErrorCodes } from "../../shared/http/app-error.js";
import { PackageStatus } from "@prisma/client";
import { balanceService } from "../balance/balance.service.js";
import { packagesRepository } from "./packages.repository.js";
import type { CreatePackageInput } from "./packages.schema.js";

export class PackagesService {
  private async getActivePackageOrThrow(userId: string) {
    const item = await packagesRepository.findActiveUserPackage(userId, new Date());
    if (!item) {
      throw new AppError(403, ErrorCodes.FORBIDDEN, "No active package");
    }
    return item;
  }

  private async getActivePackagesOrThrow(userId: string) {
    const items = await packagesRepository.findAllActiveUserPackages(userId, new Date());
    if (items.length === 0) {
      throw new AppError(403, ErrorCodes.FORBIDDEN, "No active package");
    }
    return items;
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

  async purchase(userId: string, packageId: string, durationId: string) {
    const now = new Date();
    const item = await packagesRepository.findById(packageId);
    if (!item) {
      throw new AppError(404, ErrorCodes.NOT_FOUND, "Package not found");
    }
    if (item.status !== PackageStatus.ACTIVE) {
      throw new AppError(409, ErrorCodes.CONFLICT, "Package is not active");
    }

    const pricing = await packagesRepository.findPriceByPackageAndDuration(packageId, durationId);
    if (!pricing) {
      throw new AppError(
        400,
        ErrorCodes.INVALID_REQUEST,
        "This package does not have a price for the selected duration"
      );
    }

    const discountFactor = 1 - ((pricing.duration.discountPercent ?? 0) / 100);
    const totalPriceVnd = pricing.package.applyDefaultDiscount
      ? Math.round(Number(pricing.package.priceVnd) * pricing.duration.months * discountFactor)
      : Number(pricing.priceVnd);
    const durationDays = pricing.duration.days;
    await balanceService.deduct(userId, totalPriceVnd);

    const startAt = now;
    const endAt = new Date(startAt.getTime() + durationDays * 24 * 60 * 60 * 1000);
    const purchase = await packagesRepository.createPurchase(userId, packageId, startAt, endAt);

    return this.mapUserPackage(purchase);
  }

  /** Returns all active user packages (user can have multiple). */
  async myActivePackages(userId: string) {
    const [items, usedBankTypes] = await Promise.all([
      packagesRepository.findAllActiveUserPackages(userId, new Date()),
      packagesRepository.countDistinctUserBankNames(userId)
    ]);
    return items.map((item) => this.mapUserPackage(item, usedBankTypes));
  }

  /** Single active package (first) for backward compatibility. */
  async myActivePackage(userId: string) {
    const [item, usedBankTypes] = await Promise.all([
      packagesRepository.findActiveUserPackage(userId, new Date()),
      packagesRepository.countDistinctUserBankNames(userId)
    ]);
    if (!item) {
      return null;
    }
    return this.mapUserPackage(item, usedBankTypes);
  }

  /** Check limit across all active packages: max accounts per bank = number of packages that allow this bank. */
  async assertBankAllowedAndSyncUsage(userId: string, bankCodeOrName: string) {
    const actives = await this.getActivePackagesOrThrow(userId);
    const bank = await packagesRepository.findBankByCodeOrName(bankCodeOrName);
    if (!bank) {
      throw new AppError(400, ErrorCodes.INVALID_REQUEST, "Bank not found");
    }

    const allowedForThisBank = actives.reduce((sum, up) => {
      const pb = up.package.packageBanks.find((p) => p.bankId === bank.id);
      return sum + (pb ? pb.accountLimit : 0);
    }, 0);
    if (allowedForThisBank === 0) {
      throw new AppError(
        403,
        ErrorCodes.FORBIDDEN,
        `Ngân hàng "${bank.name}" không nằm trong gói của bạn. Chỉ được thêm tài khoản các ngân hàng trong gói đã mua.`
      );
    }

    const currentCount = await packagesRepository.countUserAccountsForBank(
      userId,
      bank.code,
      bank.name
    );
    if (currentCount >= allowedForThisBank) {
      throw new AppError(
        403,
        ErrorCodes.FORBIDDEN,
        `Bạn đã đạt giới hạn tài khoản cho ngân hàng ${bank.name} (tối đa ${allowedForThisBank} tài khoản theo gói).`
      );
    }

    return bank.code;
  }

  /** Consume transaction quota from one active package that has remaining quota. */
  async consumeTransactionQuota(userId: string, by = 1) {
    const actives = await this.getActivePackagesOrThrow(userId);
    const withQuota = actives.find(
      (a) => a.package.maxTransactions === 0 || a.usedTransactions + by <= a.package.maxTransactions
    );
    if (!withQuota) {
      throw new AppError(403, ErrorCodes.FORBIDDEN, "Reached transaction limit across your packages");
    }
    await packagesRepository.increaseUsedTransactions(withQuota.id, by);
  }

  /** Consume webhook delivery quota from one active package that has remaining quota. */
  async consumeWebhookDeliveryQuota(userId: string, by = 1) {
    const actives = await this.getActivePackagesOrThrow(userId);
    const withQuota = actives.find(
      (a) =>
        a.package.maxWebhookDeliveries === 0 ||
        a.usedWebhookDeliveries + by <= a.package.maxWebhookDeliveries
    );
    if (!withQuota) {
      throw new AppError(403, ErrorCodes.FORBIDDEN, "Reached webhook delivery limit across your packages");
    }
    await packagesRepository.increaseUsedWebhookDeliveries(withQuota.id, by);
  }

  async assignDefaultPackageForUser(userId: string) {
    const now = new Date();
    const active = await packagesRepository.findActiveUserPackage(userId, now);
    if (active) {
      return this.mapUserPackage(active);
    }

    const defaultPackage = await packagesRepository.findActiveDefaultPackage(now);
    if (!defaultPackage) {
      return null;
    }

    const firstPrice = (defaultPackage as { packageDurationPrices?: Array<{ duration: { days: number } }> })
      .packageDurationPrices?.[0];
    const durationDays = defaultPackage.durationDays ?? firstPrice?.duration.days ?? 30;
    const startAt = now;
    const endAt = new Date(startAt.getTime() + durationDays * 24 * 60 * 60 * 1000);
    const purchase = await packagesRepository.createPurchase(userId, defaultPackage.id, startAt, endAt);
    return this.mapUserPackage(purchase);
  }

  private mapPackage(item: {
    id: string;
    name: string;
    status: PackageStatus;
    isDefault: boolean;
    applyDefaultDiscount?: boolean;
    defaultStartAt: Date | null;
    defaultEndAt: Date | null;
    priceVnd: bigint;
    maxTransactions: number;
    maxWebhookDeliveries: number;
    maxBankTypes: number;
    durationDays: number | null;
    description: string | null;
    packageBanks: Array<
      | { bankId: string; accountLimit: number }
      | { bankId: string; accountLimit: number; bank: { id: string; name: string; code: string } }
    >;
    packageDurationPrices?: Array<{
      priceVnd: bigint;
      duration: { id: string; name: string; months: number; days: number; isDefault?: boolean; discountPercent?: number | null };
    }>;
  }) {
    const limit = (value: number) => (value === 0 ? null : value);
    const banks = item.packageBanks.map((pb) => {
      const bank = "bank" in pb ? pb.bank : null;
      return {
        bank_id: pb.bankId,
        name: bank?.name ?? "",
        code: bank?.code ?? "",
        account_limit: pb.accountLimit
      };
    });
    const applyDiscount = item.applyDefaultDiscount === true;
    const pricing =
      item.packageDurationPrices?.map((p) => {
        const discountFactor = 1 - ((p.duration.discountPercent ?? 0) / 100);
        const priceVnd = applyDiscount
          ? Math.round(Number(item.priceVnd) * p.duration.months * discountFactor)
          : Number(p.priceVnd);
        return {
          duration_id: p.duration.id,
          duration_name: p.duration.name,
          months: p.duration.months,
          days: p.duration.days,
          price_vnd: priceVnd,
          is_default: p.duration.isDefault === true,
          discount_percent: p.duration.discountPercent ?? null
        };
      }) ?? [];
    return {
      id: item.id,
      name: item.name,
      status: item.status,
      is_default: item.isDefault,
      apply_default_discount: item.applyDefaultDiscount === true,
      default_start_at: item.defaultStartAt,
      default_end_at: item.defaultEndAt,
      price_vnd: Number(item.priceVnd),
      max_transactions: limit(item.maxTransactions),
      max_webhook_deliveries: limit(item.maxWebhookDeliveries),
      max_bank_types: limit(item.maxBankTypes),
      is_unlimited_transactions: item.maxTransactions === 0,
      is_unlimited_webhook_deliveries: item.maxWebhookDeliveries === 0,
      is_unlimited_bank_types: item.maxBankTypes === 0,
      duration_days: item.durationDays ?? null,
      description: item.description ?? "",
      bank_ids: item.packageBanks.map((x) => x.bankId),
      banks,
      pricing
    };
  }

  private mapUserPackage(
    item: {
      id: string;
      userId: string;
      packageId: string;
      startAt: Date;
      endAt: Date;
      usedTransactions: number;
      usedWebhookDeliveries: number;
      usedBankTypes: number;
      status: string;
      package: {
        id: string;
        name: string;
        status: PackageStatus;
        isDefault: boolean;
        defaultStartAt: Date | null;
        defaultEndAt: Date | null;
        priceVnd: bigint;
        maxTransactions: number;
        maxWebhookDeliveries: number;
        maxBankTypes: number;
        durationDays: number | null;
        description: string | null;
        packageBanks: Array<{ bankId: string; accountLimit: number }>;
      };
    },
    currentUsedBankTypes?: number
  ) {
    const normalizeLimit = (value: number) => (value === 0 ? null : value);
    const bankTypesUsage =
      currentUsedBankTypes !== undefined ? currentUsedBankTypes : item.usedBankTypes;
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
        bank_types: bankTypesUsage
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
