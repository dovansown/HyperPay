import { prisma } from "../../shared/infra/prisma.js";
import type { CreatePackageInput } from "./packages.schema.js";
import { PackageStatus } from "@prisma/client";

export class PackagesRepository {
  findByName(name: string) {
    return prisma.package.findFirst({ where: { name, deletedAt: null } });
  }

  findById(packageId: string) {
    return prisma.package.findFirst({
      where: { id: packageId, deletedAt: null },
      include: {
        packageBanks: {
          where: { deletedAt: null },
          select: {
            bankId: true,
            accountLimit: true,
            bank: { select: { id: true, name: true, code: true } }
          }
        }
      }
    });
  }

  create(input: CreatePackageInput) {
    return prisma.package.create({
      data: {
        name: input.name,
        status: input.status,
        isDefault: input.is_default,
        defaultStartAt: input.default_start_at,
        defaultEndAt: input.default_end_at,
        priceVnd: BigInt(input.price_vnd),
        maxTransactions: input.max_transactions,
        maxWebhookDeliveries: input.max_webhook_deliveries,
        maxBankTypes: input.max_bank_types,
        durationDays: input.duration_days,
        description: input.description,
        packageBanks: {
          create: (input.bank_ids ?? []).map((bankId) => ({ bankId, accountLimit: 1 }))
        }
      },
      include: {
        packageBanks: {
          where: { deletedAt: null },
          select: {
            bankId: true,
            accountLimit: true,
            bank: { select: { id: true, name: true, code: true } }
          }
        }
      }
    });
  }

  list() {
    return prisma.package.findMany({
      where: { deletedAt: null },
      include: {
        packageBanks: {
          where: { deletedAt: null },
          select: {
            bankId: true,
            accountLimit: true,
            bank: { select: { id: true, name: true, code: true } }
          }
        },
        packageDurationPrices: {
          where: { deletedAt: null },
          select: {
            priceVnd: true,
            duration: { select: { id: true, name: true, months: true, days: true, isDefault: true, discountPercent: true } }
          }
        }
      },
      orderBy: { id: "asc" }
    });
  }

  findPriceByPackageAndDuration(packageId: string, durationId: string) {
    return prisma.packageDurationPrice.findFirst({
      where: { packageId, durationId, deletedAt: null },
      include: {
        duration: { select: { id: true, name: true, months: true, days: true, discountPercent: true } },
        package: { select: { priceVnd: true, applyDefaultDiscount: true } }
      }
    });
  }

  countExistingBanks(bankIds: string[]) {
    if (bankIds.length === 0) return Promise.resolve(0);
    return prisma.bank.count({
      where: {
        id: { in: bankIds },
        deletedAt: null
      }
    });
  }

  findActiveUserPackage(userId: string, now: Date) {
    return prisma.userPackage.findFirst({
      where: {
        userId,
        deletedAt: null,
        status: "active",
        endAt: { gt: now }
      },
      include: {
        package: {
          include: {
            packageBanks: {
              where: { deletedAt: null },
              select: { bankId: true, accountLimit: true }
            }
          }
        }
      }
    });
  }

  findAllActiveUserPackages(userId: string, now: Date) {
    return prisma.userPackage.findMany({
      where: {
        userId,
        deletedAt: null,
        status: "active",
        endAt: { gt: now }
      },
      include: {
        package: {
          include: {
            packageBanks: {
              where: { deletedAt: null },
              select: { bankId: true, accountLimit: true }
            }
          }
        }
      },
      orderBy: { id: "asc" }
    });
  }

  findActiveDefaultPackage(now: Date) {
    return prisma.package.findFirst({
      where: {
        deletedAt: null,
        status: PackageStatus.ACTIVE,
        isDefault: true,
        OR: [{ defaultStartAt: null }, { defaultStartAt: { lte: now } }],
        AND: [{ OR: [{ defaultEndAt: null }, { defaultEndAt: { gte: now } }] }]
      },
      include: {
        packageBanks: { where: { deletedAt: null }, select: { bankId: true } },
        packageDurationPrices: {
          where: { deletedAt: null },
          take: 1,
          orderBy: { id: "asc" },
          select: { duration: { select: { days: true } } }
        }
      },
      orderBy: [{ defaultStartAt: "desc" }, { id: "asc" }]
    });
  }

  createPurchase(userId: string, packageId: string, startAt: Date, endAt: Date) {
    return prisma.userPackage.create({
      data: {
        userId,
        packageId,
        startAt,
        endAt,
        status: "active"
      },
      include: {
        package: {
          include: {
            packageBanks: {
              where: { deletedAt: null },
              select: { bankId: true, accountLimit: true }
            }
          }
        }
      }
    });
  }

  findBankByCodeOrName(bankCodeOrName: string) {
    return prisma.bank.findFirst({
      where: {
        deletedAt: null,
        OR: [{ code: bankCodeOrName }, { name: bankCodeOrName }]
      }
    });
  }

  /** Count user's bank accounts that match this bank (by code or name). */
  countUserAccountsForBank(userId: string, bankCode: string, bankName: string) {
    return prisma.bankAccount.count({
      where: {
        userId,
        deletedAt: null,
        bankName: { in: [bankCode, bankName] }
      }
    });
  }

  /** Count distinct bank types (bank names) the user currently has accounts for (chưa xóa). */
  async countDistinctUserBankNames(userId: string): Promise<number> {
    const rows = await prisma.bankAccount.groupBy({
      by: ["bankName"],
      where: {
        userId,
        deletedAt: null,
      },
    });
    return rows.length;
  }

  countDistinctUserBankNamesInRange(userId: string, startAt: Date, endAt: Date) {
    return prisma.bankAccount.groupBy({
      by: ["bankName"],
      where: {
        userId,
        deletedAt: null,
        createdAt: {
          gte: startAt,
          lte: endAt
        }
      }
    });
  }

  updateUsedBankTypes(userPackageId: string, usedBankTypes: number) {
    return prisma.userPackage.update({
      where: { id: userPackageId },
      data: { usedBankTypes }
    });
  }

  increaseUsedTransactions(userPackageId: string, by = 1) {
    return prisma.userPackage.update({
      where: { id: userPackageId },
      data: { usedTransactions: { increment: by } }
    });
  }

  increaseUsedWebhookDeliveries(userPackageId: string, by = 1) {
    return prisma.userPackage.update({
      where: { id: userPackageId },
      data: { usedWebhookDeliveries: { increment: by } }
    });
  }
}

export const packagesRepository = new PackagesRepository();
