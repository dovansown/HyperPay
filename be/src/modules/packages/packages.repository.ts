import { prisma } from "../../shared/infra/prisma.js";
import type { CreatePackageInput } from "./packages.schema.js";
import { PackageStatus } from "@prisma/client";

export class PackagesRepository {
  findByName(name: string) {
    return prisma.package.findFirst({ where: { name, deletedAt: null } });
  }

  findById(packageId: number) {
    return prisma.package.findFirst({
      where: { id: packageId, deletedAt: null },
      include: { packageBanks: { where: { deletedAt: null }, select: { bankId: true } } }
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
          create: (input.bank_ids ?? []).map((bankId) => ({ bankId }))
        }
      },
      include: { packageBanks: { where: { deletedAt: null }, select: { bankId: true } } }
    });
  }

  list() {
    return prisma.package.findMany({
      where: { deletedAt: null },
      include: { packageBanks: { where: { deletedAt: null }, select: { bankId: true } } },
      orderBy: { id: "asc" }
    });
  }

  countExistingBanks(bankIds: number[]) {
    if (bankIds.length === 0) return Promise.resolve(0);
    return prisma.bank.count({
      where: {
        id: { in: bankIds },
        deletedAt: null
      }
    });
  }

  findActiveUserPackage(userId: number, now: Date) {
    return prisma.userPackage.findFirst({
      where: {
        userId,
        deletedAt: null,
        status: "active",
        endAt: { gt: now }
      },
      include: {
        package: {
          include: { packageBanks: { where: { deletedAt: null }, select: { bankId: true } } }
        }
      }
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
      include: { packageBanks: { where: { deletedAt: null }, select: { bankId: true } } },
      orderBy: [{ defaultStartAt: "desc" }, { id: "asc" }]
    });
  }

  createPurchase(userId: number, packageId: number, startAt: Date, endAt: Date) {
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
          include: { packageBanks: { where: { deletedAt: null }, select: { bankId: true } } }
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

  countDistinctUserBankNamesInRange(userId: number, startAt: Date, endAt: Date) {
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

  updateUsedBankTypes(userPackageId: number, usedBankTypes: number) {
    return prisma.userPackage.update({
      where: { id: userPackageId },
      data: { usedBankTypes }
    });
  }

  increaseUsedTransactions(userPackageId: number, by = 1) {
    return prisma.userPackage.update({
      where: { id: userPackageId },
      data: { usedTransactions: { increment: by } }
    });
  }

  increaseUsedWebhookDeliveries(userPackageId: number, by = 1) {
    return prisma.userPackage.update({
      where: { id: userPackageId },
      data: { usedWebhookDeliveries: { increment: by } }
    });
  }
}

export const packagesRepository = new PackagesRepository();
