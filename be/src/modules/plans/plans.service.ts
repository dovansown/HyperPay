import { AppError, ErrorCodes } from "../../shared/http/app-error.js";
import { cacheService } from "../cache/cache.service.js";
import { plansRepository } from "./plans.repository.js";
import type { CreatePlanInput } from "./plans.schema.js";

const PLANS_CACHE_KEY = "plans:list";

export class PlansService {
  async create(input: CreatePlanInput) {
    const existed = await plansRepository.findByName(input.name);
    if (existed) {
      throw new AppError(409, ErrorCodes.CONFLICT, "Plan already exists");
    }
    const plan = await plansRepository.create(input);
    await cacheService.del(PLANS_CACHE_KEY);
    return this.mapPlan(plan);
  }

  async list() {
    const cached = await cacheService.get<Array<ReturnType<PlansService["mapPlan"]>>>(PLANS_CACHE_KEY);
    if (cached) {
      return cached;
    }
    const plans = await plansRepository.list();
    const mapped = plans.map((plan) => this.mapPlan(plan));
    await cacheService.set(PLANS_CACHE_KEY, mapped);
    return mapped;
  }

  private mapPlan(plan: {
    id: number;
    name: string;
    priceVnd: bigint;
    maxBankAccounts: number;
    maxTransactions: number;
    durationDays: number;
    description: string | null;
    planBanks: Array<{ bankId: number }>;
  }) {
    return {
      id: plan.id,
      name: plan.name,
      price_vnd: Number(plan.priceVnd),
      max_bank_accounts: plan.maxBankAccounts,
      max_transactions: plan.maxTransactions,
      duration_days: plan.durationDays,
      description: plan.description ?? "",
      bank_ids: plan.planBanks.map((item) => item.bankId)
    };
  }
}

export const plansService = new PlansService();
