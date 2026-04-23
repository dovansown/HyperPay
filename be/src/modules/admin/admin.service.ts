import { PackageStatus, UserRole } from "@prisma/client";
import { AppError, ErrorCodes } from "../../shared/http/app-error.js";
import { prisma } from "../../shared/infra/prisma.js";
import { cacheService } from "../cache/cache.service.js";
import type {
  AdminListQuery,
  AssignUserPackageInput,
  CreateBankAdminInput,
  CreateDurationAdminInput,
  CreatePackageAdminInput,
  UpdateDurationAdminInput,
  UpdatePackageAdminInput,
  UpdateUserPackageStatusInput,
  UpdateBankAdminInput,
  UpdateUserRoleInput
} from "./admin.schema.js";

function numberOrNull(value: bigint | number | null) {
  if (value == null) return null;
  return Number(value);
}

export class AdminService {
  async listUsers(query: AdminListQuery) {
    const where = {
      ...(query.role ? { role: query.role } : {}),
      ...(query.q
        ? {
            OR: [
              { email: { contains: query.q, mode: "insensitive" as const } },
              { fullName: { contains: query.q, mode: "insensitive" as const } }
            ]
          }
        : {})
    };

    const [items, total] = await Promise.all([
      prisma.user.findMany({
        where,
        orderBy: { createdAt: "desc" },
        skip: query.offset,
        take: query.limit,
        select: {
          id: true,
          email: true,
          fullName: true,
          role: true,
          createdAt: true,
          updatedAt: true
        }
      }),
      prisma.user.count({ where })
    ]);

    return {
      items: items.map((x) => ({
        id: x.id,
        email: x.email,
        full_name: x.fullName,
        role: x.role,
        created_at: x.createdAt,
        updated_at: x.updatedAt
      })),
      total,
      limit: query.limit,
      offset: query.offset
    };
  }

  async updateUserRole(userId: string, input: UpdateUserRoleInput) {
    const user = await prisma.user.findUnique({ where: { id: userId } });
    if (!user) {
      throw new AppError(404, ErrorCodes.NOT_FOUND, "User not found");
    }
    const updated = await prisma.user.update({
      where: { id: userId },
      data: { role: input.role },
      select: { id: true, email: true, fullName: true, role: true, updatedAt: true }
    });
    await cacheService.del(`user:${userId}`);
    return {
      id: updated.id,
      email: updated.email,
      full_name: updated.fullName,
      role: updated.role,
      updated_at: updated.updatedAt
    };
  }

  // Plans removed - using Packages only

  async listBanks(query: AdminListQuery) {
    const where = {
      ...(query.code ? { code: { contains: query.code, mode: "insensitive" as const } } : {}),
      ...(query.q
        ? {
            OR: [
              { name: { contains: query.q, mode: "insensitive" as const } },
              { code: { contains: query.q, mode: "insensitive" as const } }
            ]
          }
        : {})
    };
    const [items, total] = await Promise.all([
      prisma.bank.findMany({
        where,
        orderBy: { createdAt: "desc" },
        skip: query.offset,
        take: query.limit
      }),
      prisma.bank.count({ where })
    ]);
    return {
      items: items.map((x) => ({
        id: x.id,
        name: x.name,
        code: x.code,
        icon_url: x.iconUrl,
        created_at: x.createdAt
      })),
      total,
      limit: query.limit,
      offset: query.offset
    };
  }

  async createBank(input: CreateBankAdminInput) {
    const existed = await prisma.bank.findFirst({ where: { code: input.code.toUpperCase() } });
    if (existed) {
      throw new AppError(409, ErrorCodes.CONFLICT, "Bank code already exists");
    }
    const created = await prisma.bank.create({
      data: {
        name: input.name,
        code: input.code.toUpperCase(),
        iconUrl: input.icon_url ?? null
      }
    });
    return {
      id: created.id,
      name: created.name,
      code: created.code,
      icon_url: created.iconUrl
    };
  }

  async updateBank(id: string, input: UpdateBankAdminInput) {
    const found = await prisma.bank.findUnique({ where: { id } });
    if (!found) {
      throw new AppError(404, ErrorCodes.NOT_FOUND, "Bank not found");
    }
    const updated = await prisma.bank.update({
      where: { id },
      data: {
        name: input.name,
        code: input.code?.toUpperCase(),
        iconUrl: input.icon_url
      }
    });
    return {
      id: updated.id,
      name: updated.name,
      code: updated.code,
      icon_url: updated.iconUrl
    };
  }

  async listPackages(query: AdminListQuery) {
    const where = {
      deletedAt: null,
      ...(query.q ? { name: { contains: query.q, mode: "insensitive" as const } } : {}),
      ...(query.min_price_vnd != null || query.max_price_vnd != null
        ? {
            priceVnd: {
              ...(query.min_price_vnd != null ? { gte: BigInt(query.min_price_vnd) } : {}),
              ...(query.max_price_vnd != null ? { lte: BigInt(query.max_price_vnd) } : {})
            }
          }
        : {})
    };
    const [items, total] = await Promise.all([
      prisma.package.findMany({
        where,
        orderBy: { id: "asc" },
        skip: query.offset,
        take: query.limit,
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
              durationId: true,
              priceVnd: true,
              duration: { select: { id: true, name: true, months: true, days: true, isDefault: true, discountPercent: true } }
            }
          }
        }
      }),
      prisma.package.count({ where })
    ]);
    return {
      items: items.map((x) => ({
        id: x.id,
        name: x.name,
        status: x.status,
        is_default: x.isDefault,
        apply_default_discount: x.applyDefaultDiscount,
        price_vnd: Number(x.priceVnd),
        duration_days: x.durationDays,
        max_transactions: x.maxTransactions,
        max_webhook_deliveries: x.maxWebhookDeliveries,
        max_bank_types: x.maxBankTypes,
        description: x.description,
        created_at: x.createdAt,
        banks: x.packageBanks.map((pb) => ({
          bank_id: pb.bankId,
          account_limit: pb.accountLimit,
          bank: "bank" in pb && pb.bank ? { id: pb.bank.id, name: pb.bank.name, code: pb.bank.code } : null
        })),
        pricing: x.packageDurationPrices.map((p) => ({
          duration_id: p.duration.id,
          duration_name: p.duration.name,
          months: p.duration.months,
          days: p.duration.days,
          is_default: p.duration.isDefault,
          discount_percent: p.duration.discountPercent,
          price_vnd: Number(p.priceVnd)
        }))
      })),
      total,
      limit: query.limit,
      offset: query.offset
    };
  }

  async listDurations() {
    const rows = await prisma.duration.findMany({
      where: { deletedAt: null },
      orderBy: [{ sortOrder: "asc" }, { id: "asc" }]
    });
    return rows.map((r) => ({
      id: r.id,
      name: r.name,
      months: r.months,
      days: r.days,
      sort_order: r.sortOrder,
      is_default: r.isDefault,
      discount_percent: r.discountPercent
    }));
  }

  async createDuration(input: CreateDurationAdminInput) {
    if (input.is_default) {
      await prisma.duration.updateMany({
        where: { deletedAt: null },
        data: { isDefault: false }
      });
    }
    const created = await prisma.duration.create({
      data: {
        name: input.name,
        months: input.months,
        days: input.days,
        sortOrder: input.sort_order ?? 0,
        isDefault: input.is_default ?? false,
        discountPercent: input.discount_percent ?? null
      }
    });
    return {
      id: created.id,
      name: created.name,
      months: created.months,
      days: created.days,
      sort_order: created.sortOrder,
      is_default: created.isDefault,
      discount_percent: created.discountPercent
    };
  }

  async updateDuration(id: string, input: UpdateDurationAdminInput) {
    const found = await prisma.duration.findFirst({ where: { id, deletedAt: null } });
    if (!found) {
      throw new AppError(404, ErrorCodes.NOT_FOUND, "Duration not found");
    }
    if (input.is_default === true) {
      await prisma.duration.updateMany({
        where: { deletedAt: null, id: { not: id } },
        data: { isDefault: false }
      });
    }
    const updated = await prisma.duration.update({
      where: { id },
      data: {
        ...(input.name != null && { name: input.name }),
        ...(input.months != null && { months: input.months }),
        ...(input.days != null && { days: input.days }),
        ...(input.sort_order != null && { sortOrder: input.sort_order }),
        ...(input.is_default != null && { isDefault: input.is_default }),
        ...(input.discount_percent !== undefined && { discountPercent: input.discount_percent })
      }
    });
    return {
      id: updated.id,
      name: updated.name,
      months: updated.months,
      days: updated.days,
      sort_order: updated.sortOrder,
      is_default: updated.isDefault,
      discount_percent: updated.discountPercent
    };
  }

  async deleteDuration(id: string) {
    const found = await prisma.duration.findFirst({ where: { id, deletedAt: null } });
    if (!found) {
      throw new AppError(404, ErrorCodes.NOT_FOUND, "Duration not found");
    }
    await prisma.duration.update({
      where: { id },
      data: { deletedAt: new Date() }
    });
    return { id };
  }

  async createPackage(input: CreatePackageAdminInput) {
    const existed = await prisma.package.findFirst({ where: { name: input.name, deletedAt: null } });
    if (existed) {
      throw new AppError(409, ErrorCodes.CONFLICT, "Package name already exists");
    }
    const bankIds = input.banks.map((b) => b.bank_id);
    const existingCount = await prisma.bank.count({
      where: { id: { in: bankIds }, deletedAt: null }
    });
    if (bankIds.length > 0 && existingCount !== bankIds.length) {
      throw new AppError(400, ErrorCodes.INVALID_REQUEST, "Some bank_id do not exist");
    }
    const durationIds = input.pricing.map((p) => p.duration_id);
    const existingDurations = await prisma.duration.findMany({
      where: { id: { in: durationIds }, deletedAt: null },
      select: { id: true, months: true, discountPercent: true }
    });
    if (durationIds.length > 0 && existingDurations.length !== durationIds.length) {
      throw new AppError(400, ErrorCodes.INVALID_REQUEST, "Some duration_id do not exist");
    }
    const durationMap = new Map(existingDurations.map((d) => [d.id, d]));
    const maxBankTypes = input.banks.length;
    const applyDiscount = input.apply_default_discount === true;
    const created = await prisma.package.create({
      data: {
        name: input.name,
        status: input.status ?? PackageStatus.ACTIVE,
        isDefault: input.is_default ?? false,
        applyDefaultDiscount: input.apply_default_discount ?? false,
        priceVnd: BigInt(input.price_vnd),
        maxTransactions: input.max_transactions,
        maxWebhookDeliveries: input.max_webhook_deliveries,
        maxBankTypes,
        description: input.description ?? null,
        packageBanks: {
          create: input.banks.map((b: { bank_id: string; account_limit: number }) => ({ bankId: b.bank_id, accountLimit: b.account_limit }))
        },
        packageDurationPrices: {
          create: input.pricing.map((p: { duration_id: string; price_vnd: number }) => {
            const duration = durationMap.get(p.duration_id);
            const discountFactor = duration ? 1 - ((duration.discountPercent ?? 0) / 100) : 1;
            const priceVnd = applyDiscount && duration
              ? Math.round(input.price_vnd * duration.months * discountFactor)
              : p.price_vnd;
            return { durationId: p.duration_id, priceVnd: BigInt(priceVnd) };
          })
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
        },
        packageDurationPrices: {
          where: { deletedAt: null },
          select: {
            durationId: true,
            priceVnd: true,
            duration: { select: { id: true, name: true, months: true, days: true, isDefault: true, discountPercent: true } }
          }
        }
      }
    });
    return {
      id: created.id,
      name: created.name,
      status: created.status,
      is_default: created.isDefault,
      apply_default_discount: created.applyDefaultDiscount,
      price_vnd: Number(created.priceVnd),
      max_transactions: created.maxTransactions,
      max_webhook_deliveries: created.maxWebhookDeliveries,
      banks: created.packageBanks.map((pb) => ({
        bank_id: pb.bankId,
        account_limit: pb.accountLimit,
        bank: "bank" in pb && pb.bank ? { id: pb.bank.id, name: pb.bank.name, code: pb.bank.code } : null
      })),
      pricing: created.packageDurationPrices.map((p) => ({
        duration_id: p.duration.id,
        duration_name: p.duration.name,
        months: p.duration.months,
        days: p.duration.days,
        is_default: p.duration.isDefault,
        discount_percent: p.duration.discountPercent,
        price_vnd: Number(p.priceVnd)
      }))
    };
  }

  async updatePackage(id: string, input: UpdatePackageAdminInput) {
    const found = await prisma.package.findUnique({ where: { id, deletedAt: null } });
    if (!found) {
      throw new AppError(404, ErrorCodes.NOT_FOUND, "Package not found");
    }
    if (input.banks !== undefined) {
      const bankIds = input.banks.map((b) => b.bank_id);
      const existingCount = await prisma.bank.count({
        where: { id: { in: bankIds }, deletedAt: null }
      });
      if (bankIds.length > 0 && existingCount !== bankIds.length) {
        throw new AppError(400, ErrorCodes.INVALID_REQUEST, "Some bank_id do not exist");
      }
      await prisma.packageBank.deleteMany({ where: { packageId: id } });
      if (input.banks.length > 0) {
        await prisma.packageBank.createMany({
          data: input.banks.map((b: { bank_id: string; account_limit: number }) => ({
            packageId: id,
            bankId: b.bank_id,
            accountLimit: b.account_limit
          }))
        });
      }
    }
    if (input.pricing !== undefined) {
      await prisma.packageDurationPrice.deleteMany({ where: { packageId: id } });
      const durationIds = input.pricing.map((p: { duration_id: string }) => p.duration_id);
      const existingDurations = await prisma.duration.findMany({
        where: { id: { in: durationIds }, deletedAt: null },
        select: { id: true, months: true, discountPercent: true }
      });
      if (durationIds.length > 0 && existingDurations.length !== durationIds.length) {
        throw new AppError(400, ErrorCodes.INVALID_REQUEST, "Some duration_id do not exist");
      }
      const durationMap = new Map(existingDurations.map((d) => [d.id, d]));
      const applyDiscount = input.apply_default_discount ?? found.applyDefaultDiscount;
      const basePrice = input.price_vnd != null ? input.price_vnd : Number(found.priceVnd);
      if (input.pricing.length > 0) {
        await prisma.packageDurationPrice.createMany({
          data: input.pricing.map((p: { duration_id: string; price_vnd: number }) => {
            const duration = durationMap.get(p.duration_id);
            const discountFactor = duration ? 1 - ((duration.discountPercent ?? 0) / 100) : 1;
            const priceVnd = applyDiscount && duration
              ? Math.round(basePrice * duration.months * discountFactor)
              : p.price_vnd;
            return {
              packageId: id,
              durationId: p.duration_id,
              priceVnd: BigInt(priceVnd)
            };
          })
        });
      }
    }
    const updateData: Parameters<typeof prisma.package.update>[0]["data"] = {};
    if (input.name != null) updateData.name = input.name;
    if (input.status != null) updateData.status = input.status;
    if (input.is_default != null) updateData.isDefault = input.is_default;
    if (input.apply_default_discount != null) updateData.applyDefaultDiscount = input.apply_default_discount;
    if (input.price_vnd != null) updateData.priceVnd = BigInt(input.price_vnd);
    if (input.max_transactions != null) updateData.maxTransactions = input.max_transactions;
    if (input.max_webhook_deliveries != null) updateData.maxWebhookDeliveries = input.max_webhook_deliveries;
    if (input.description !== undefined) updateData.description = input.description;
    if (input.banks !== undefined) updateData.maxBankTypes = input.banks.length;
    const updated = await prisma.package.update({
      where: { id },
      data: updateData,
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
            durationId: true,
            priceVnd: true,
            duration: { select: { id: true, name: true, months: true, days: true, isDefault: true, discountPercent: true } }
          }
        }
      }
    });
    return {
      id: updated.id,
      name: updated.name,
      status: updated.status,
      is_default: updated.isDefault,
      apply_default_discount: updated.applyDefaultDiscount,
      price_vnd: Number(updated.priceVnd),
      duration_days: updated.durationDays ?? null,
      max_transactions: updated.maxTransactions,
      max_webhook_deliveries: updated.maxWebhookDeliveries,
      banks: updated.packageBanks.map((pb) => ({
        bank_id: pb.bankId,
        account_limit: pb.accountLimit,
        bank: "bank" in pb && pb.bank ? { id: pb.bank.id, name: pb.bank.name, code: pb.bank.code } : null
      })),
      pricing: updated.packageDurationPrices.map((p) => ({
        duration_id: p.duration.id,
        duration_name: p.duration.name,
        months: p.duration.months,
        days: p.duration.days,
        is_default: p.duration.isDefault,
        discount_percent: p.duration.discountPercent,
        price_vnd: Number(p.priceVnd)
      }))
    };
  }

  async listUserPackages(query: AdminListQuery) {
    const where = {
      ...(query.status ? { status: query.status } : {}),
      ...(query.user_id ? { userId: query.user_id } : {}),
      ...(query.package_id ? { packageId: query.package_id } : {}),
      ...(query.q
        ? {
            user: {
              OR: [
                { email: { contains: query.q, mode: "insensitive" as const } },
                { fullName: { contains: query.q, mode: "insensitive" as const } }
              ]
            }
          }
        : {})
    };
    const [items, total] = await Promise.all([
      prisma.userPackage.findMany({
        where,
        orderBy: { createdAt: "desc" },
        skip: query.offset,
        take: query.limit,
        include: {
          user: { select: { id: true, email: true, fullName: true, role: true } },
          package: { select: { id: true, name: true, status: true, priceVnd: true } }
        }
      }),
      prisma.userPackage.count({ where })
    ]);
    return {
      items: items.map((x) => ({
        id: x.id,
        user: {
          id: x.user.id,
          email: x.user.email,
          full_name: x.user.fullName,
          role: x.user.role
        },
        package: {
          id: x.package.id,
          name: x.package.name,
          status: x.package.status,
          price_vnd: Number(x.package.priceVnd)
        },
        start_at: x.startAt,
        end_at: x.endAt,
        status: x.status,
        used_transactions: x.usedTransactions,
        used_webhook_deliveries: x.usedWebhookDeliveries,
        used_bank_types: x.usedBankTypes
      })),
      total,
      limit: query.limit,
      offset: query.offset
    };
  }

  async assignUserPackage(input: AssignUserPackageInput) {
    const [user, pkg, duration] = await Promise.all([
      prisma.user.findUnique({ where: { id: input.user_id }, select: { id: true, role: true } }),
      prisma.package.findUnique({
        where: { id: input.package_id },
        select: { id: true, status: true, durationDays: true }
      }),
      input.duration_id
        ? prisma.duration.findFirst({ where: { id: input.duration_id, deletedAt: null }, select: { days: true } })
        : Promise.resolve(null)
    ]);
    if (!user) throw new AppError(404, ErrorCodes.NOT_FOUND, "User not found");
    if (!pkg) throw new AppError(404, ErrorCodes.NOT_FOUND, "Package not found");
    if (pkg.status !== PackageStatus.ACTIVE) {
      throw new AppError(409, ErrorCodes.CONFLICT, "Package is not active");
    }
    const startAt = input.start_at ?? new Date();
    const durationDays =
      input.duration_id && duration ? duration.days : input.duration_days ?? pkg.durationDays ?? 30;
    const endAt =
      input.end_at ??
      new Date(startAt.getTime() + durationDays * 24 * 60 * 60 * 1000);
    const created = await prisma.userPackage.create({
      data: {
        userId: input.user_id,
        packageId: input.package_id,
        startAt,
        endAt,
        status: input.status ?? "active"
      }
    });
    return {
      id: created.id,
      user_id: created.userId,
      package_id: created.packageId,
      start_at: created.startAt,
      end_at: created.endAt,
      status: created.status
    };
  }

  async updateUserPackageStatus(id: string, input: UpdateUserPackageStatusInput) {
    const found = await prisma.userPackage.findUnique({ where: { id } });
    if (!found) {
      throw new AppError(404, ErrorCodes.NOT_FOUND, "User package not found");
    }
    const updated = await prisma.userPackage.update({
      where: { id },
      data: { status: input.status }
    });
    return {
      id: updated.id,
      user_id: updated.userId,
      package_id: updated.packageId,
      status: updated.status,
      updated_at: updated.updatedAt
    };
  }

  async listWebhooks(query: AdminListQuery) {
    const where = {
      ...(query.user_id ? { userId: query.user_id } : {}),
      ...(query.auth_type ? { authType: query.auth_type as never } : {}),
      ...(query.is_active != null ? { isActive: query.is_active } : {}),
      ...(query.q
        ? {
            user: {
              OR: [
                { email: { contains: query.q, mode: "insensitive" as const } },
                { fullName: { contains: query.q, mode: "insensitive" as const } }
              ]
            }
          }
        : {})
    };
    const [items, total] = await Promise.all([
      prisma.userWebhook.findMany({
        where,
        orderBy: { createdAt: "desc" },
        skip: query.offset,
        take: query.limit,
        include: {
          user: { select: { id: true, email: true, fullName: true } },
          selectedAccounts: { select: { bankAccountId: true } }
        }
      }),
      prisma.userWebhook.count({ where })
    ]);
    return {
      items: items.map((x) => ({
        id: x.id,
        user: { id: x.user.id, email: x.user.email, full_name: x.user.fullName },
        url: x.url,
        auth_type: x.authType,
        content_type: x.contentType,
        transaction_direction: x.transactionDirection,
        is_active: x.isActive,
        account_ids: x.selectedAccounts.map((a) => a.bankAccountId),
        created_at: x.createdAt
      })),
      total,
      limit: query.limit,
      offset: query.offset
    };
  }

  async listTransactions(query: AdminListQuery) {
    const where = {
      ...(query.tx_type ? { type: query.tx_type } : {}),
      ...(query.user_id ? { bankAccount: { userId: query.user_id } } : {}),
      ...(query.from || query.to
        ? {
            occurredAt: {
              ...(query.from ? { gte: query.from } : {}),
              ...(query.to ? { lte: query.to } : {})
            }
          }
        : {}),
      ...(query.q
        ? {
            OR: [
              { description: { contains: query.q, mode: "insensitive" as const } },
              { paymentCode: { contains: query.q, mode: "insensitive" as const } },
              { externalId: { contains: query.q, mode: "insensitive" as const } },
              { bankAccount: { accountNumber: { contains: query.q, mode: "insensitive" as const } } },
              { bankAccount: { user: { email: { contains: query.q, mode: "insensitive" as const } } } }
            ]
          }
        : {})
    };
    const [items, total] = await Promise.all([
      prisma.bankTransaction.findMany({
        where,
        orderBy: { occurredAt: "desc" },
        skip: query.offset,
        take: query.limit,
        include: {
          bankAccount: {
            select: {
              id: true,
              accountNumber: true,
              bankName: true,
              user: { select: { id: true, email: true, fullName: true, role: true } }
            }
          }
        }
      }),
      prisma.bankTransaction.count({ where })
    ]);
    return {
      items: items.map((x) => ({
        id: x.id,
        external_id: x.externalId,
        type: x.type,
        amount: numberOrNull(x.amount) ?? 0,
        balance: numberOrNull(x.balance),
        payment_code: x.paymentCode,
        description: x.description,
        occurred_at: x.occurredAt,
        bank_account: {
          id: x.bankAccount.id,
          bank_name: x.bankAccount.bankName,
          account_number: x.bankAccount.accountNumber
        },
        user: {
          id: x.bankAccount.user.id,
          email: x.bankAccount.user.email,
          full_name: x.bankAccount.user.fullName,
          role: x.bankAccount.user.role as UserRole
        }
      })),
      total,
      limit: query.limit,
      offset: query.offset
    };
  }

  async getSystemSettings() {
    const { systemSettingsService } = await import("../system-settings/system-settings.service.js");
    return systemSettingsService.getAllForAdmin();
  }

  async updateSystemSettings(payload: {
    smtp_config?: Partial<import("../system-settings/system-settings.service.js").SmtpConfig>;
    rate_limit?: Partial<import("../system-settings/system-settings.service.js").RateLimitConfig>;
    alert_level?: import("../system-settings/system-settings.service.js").AlertLevel;
    notification_defaults?: Partial<import("../system-settings/system-settings.service.js").NotificationDefaults>;
  }) {
    const { systemSettingsService } = await import("../system-settings/system-settings.service.js");
    await systemSettingsService.setAllFromAdmin(payload);
    return systemSettingsService.getAllForAdmin();
  }
}

export const adminService = new AdminService();
