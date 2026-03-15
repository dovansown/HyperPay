import { AppError, ErrorCodes } from "../../shared/http/app-error.js";
import { balanceRepository } from "./balance.repository.js";

export class BalanceService {
  async getBalance(userId: string): Promise<number> {
    const { balanceVnd } = await balanceRepository.getOrCreate(userId);
    return Number(balanceVnd);
  }

  async topUp(userId: string, amountVnd: number) {
    if (amountVnd < 1) {
      throw new AppError(400, ErrorCodes.INVALID_REQUEST, "Amount must be positive");
    }
    await balanceRepository.add(userId, BigInt(amountVnd));
    return this.getBalance(userId);
  }

  async deduct(userId: string, amountVnd: number): Promise<void> {
    if (amountVnd < 1) return;
    await balanceRepository.getOrCreate(userId);
    const ok = await balanceRepository.deduct(userId, BigInt(amountVnd));
    if (!ok) {
      throw new AppError(402, ErrorCodes.INVALID_REQUEST, "Insufficient balance");
    }
  }
}

export const balanceService = new BalanceService();
