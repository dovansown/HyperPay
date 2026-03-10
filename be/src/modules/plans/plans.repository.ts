import { prisma } from "../../shared/infra/prisma.js";
import type { CreatePlanInput } from "./plans.schema.js";

export class PlansRepository {
  findByName(name: string) {
    return prisma.plan.findFirst({ where: { name, deletedAt: null } });
  }

  async create(input: CreatePlanInput) {
    return prisma.plan.create({
      data: {
        name: input.name,
        priceVnd: BigInt(input.price_vnd),
        maxBankAccounts: input.max_bank_accounts,
        maxTransactions: input.max_transactions,
        durationDays: input.duration_days,
        description: input.description,
        planBanks: {
          create: (input.bank_ids ?? []).map((bankId) => ({ bankId }))
        }
      },
      include: {
        planBanks: true
      }
    });
  }

  list() {
    return prisma.plan.findMany({
      where: { deletedAt: null },
      include: { planBanks: true },
      orderBy: { id: "asc" }
    });
  }
}

export const plansRepository = new PlansRepository();
