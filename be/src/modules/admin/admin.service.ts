import { PackageStatus, UserRole } from "@prisma/client";
import { AppError, ErrorCodes } from "../../shared/http/app-error.js";
import { prisma } from "../../shared/infra/prisma.js";
import type {
  AdminListQuery,
  AssignUserPackageInput,
  CreateBankAdminInput,
  CreatePlanAdminInput,
  UpdateUserPackageStatusInput,
  UpdateBankAdminInput,
  UpdatePlanAdminInput,
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

  async updateUserRole(userId: number, input: UpdateUserRoleInput) {
    const user = await prisma.user.findUnique({ where: { id: userId } });
    if (!user) {
      throw new AppError(404, ErrorCodes.NOT_FOUND, "User not found");
    }
    const updated = await prisma.user.update({
      where: { id: userId },
      data: { role: input.role },
      select: { id: true, email: true, fullName: true, role: true, updatedAt: true }
    });
    return {
      id: updated.id,
      email: updated.email,
      full_name: updated.fullName,
      role: updated.role,
      updated_at: updated.updatedAt
    };
  }

  async listPlans(query: AdminListQuery) {
    const where = {
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
      prisma.plan.findMany({
        where,
        orderBy: { createdAt: "desc" },
        skip: query.offset,
        take: query.limit
      }),
      prisma.plan.count({ where })
    ]);
    return {
      items: items.map((x) => ({
        id: x.id,
        name: x.name,
        price_vnd: Number(x.priceVnd),
        max_bank_accounts: x.maxBankAccounts,
        max_transactions: x.maxTransactions,
        duration_days: x.durationDays,
        description: x.description,
        created_at: x.createdAt
      })),
      total,
      limit: query.limit,
      offset: query.offset
    };
  }

  async createPlan(input: CreatePlanAdminInput) {
    const existed = await prisma.plan.findFirst({ where: { name: input.name } });
    if (existed) {
      throw new AppError(409, ErrorCodes.CONFLICT, "Plan already exists");
    }
    const created = await prisma.plan.create({
      data: {
        name: input.name,
        priceVnd: BigInt(input.price_vnd),
        maxBankAccounts: input.max_bank_accounts,
        maxTransactions: input.max_transactions,
        durationDays: input.duration_days,
        description: input.description ?? null
      }
    });
    return {
      id: created.id,
      name: created.name,
      price_vnd: Number(created.priceVnd),
      max_bank_accounts: created.maxBankAccounts,
      max_transactions: created.maxTransactions,
      duration_days: created.durationDays,
      description: created.description
    };
  }

  async updatePlan(id: number, input: UpdatePlanAdminInput) {
    const found = await prisma.plan.findUnique({ where: { id } });
    if (!found) {
      throw new AppError(404, ErrorCodes.NOT_FOUND, "Plan not found");
    }
    const updated = await prisma.plan.update({
      where: { id },
      data: {
        name: input.name,
        priceVnd: input.price_vnd == null ? undefined : BigInt(input.price_vnd),
        maxBankAccounts: input.max_bank_accounts,
        maxTransactions: input.max_transactions,
        durationDays: input.duration_days,
        description: input.description
      }
    });
    return {
      id: updated.id,
      name: updated.name,
      price_vnd: Number(updated.priceVnd),
      max_bank_accounts: updated.maxBankAccounts,
      max_transactions: updated.maxTransactions,
      duration_days: updated.durationDays,
      description: updated.description
    };
  }

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

  async updateBank(id: number, input: UpdateBankAdminInput) {
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
    const [user, pkg] = await Promise.all([
      prisma.user.findUnique({ where: { id: input.user_id }, select: { id: true, role: true } }),
      prisma.package.findUnique({
        where: { id: input.package_id },
        select: { id: true, status: true, durationDays: true }
      })
    ]);
    if (!user) throw new AppError(404, ErrorCodes.NOT_FOUND, "User not found");
    if (!pkg) throw new AppError(404, ErrorCodes.NOT_FOUND, "Package not found");
    if (pkg.status !== PackageStatus.ACTIVE) {
      throw new AppError(409, ErrorCodes.CONFLICT, "Package is not active");
    }
    const startAt = input.start_at ?? new Date();
    const endAt =
      input.end_at ??
      new Date(startAt.getTime() + (input.duration_days ?? pkg.durationDays) * 24 * 60 * 60 * 1000);
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

  async updateUserPackageStatus(id: number, input: UpdateUserPackageStatusInput) {
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
}

export const adminService = new AdminService();
