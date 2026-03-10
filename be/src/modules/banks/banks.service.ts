import { AppError, ErrorCodes } from "../../shared/http/app-error.js";
import { cacheService } from "../cache/cache.service.js";
import { banksRepository } from "./banks.repository.js";
import type { CreateBankInput } from "./banks.schema.js";

const BANKS_CACHE_KEY = "banks:list";

export class BanksService {
  async create(input: CreateBankInput) {
    const existed = await banksRepository.findByCode(input.code);
    if (existed) {
      throw new AppError(409, ErrorCodes.CONFLICT, "Bank code already exists");
    }
    const bank = await banksRepository.create(input);
    await cacheService.del(BANKS_CACHE_KEY);
    return this.mapBank(bank);
  }

  async list() {
    const cached = await cacheService.get<ReturnType<BanksService["mapBank"]>[]>(BANKS_CACHE_KEY);
    if (cached) {
      return cached;
    }

    const banks = await banksRepository.list();
    const mapped = banks.map((bank) => this.mapBank(bank));
    await cacheService.set(BANKS_CACHE_KEY, mapped);
    return mapped;
  }

  private mapBank(bank: { id: number; name: string; code: string; iconUrl: string | null }) {
    return {
      id: bank.id,
      name: bank.name,
      code: bank.code,
      icon_url: bank.iconUrl ?? ""
    };
  }
}

export const banksService = new BanksService();
