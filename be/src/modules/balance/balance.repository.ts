import { prisma } from "../../shared/infra/prisma.js";

export class BalanceRepository {
  async getOrCreate(userId: string): Promise<{ balanceVnd: bigint }> {
    const row = await prisma.userBalance.findUnique({
      where: { userId }
    });
    if (row) return { balanceVnd: row.balanceVnd };
    const created = await prisma.userBalance.create({
      data: { userId, balanceVnd: BigInt(0) }
    });
    return { balanceVnd: created.balanceVnd };
  }

  async add(userId: string, amountVnd: bigint) {
    await prisma.userBalance.upsert({
      where: { userId },
      create: { userId, balanceVnd: amountVnd },
      update: { balanceVnd: { increment: amountVnd } }
    });
  }

  async deduct(userId: string, amountVnd: bigint): Promise<boolean> {
    const row = await prisma.userBalance.findUnique({
      where: { userId }
    });
    if (!row || row.balanceVnd < amountVnd) return false;
    await prisma.userBalance.update({
      where: { userId },
      data: { balanceVnd: { decrement: amountVnd } }
    });
    return true;
  }
}

export const balanceRepository = new BalanceRepository();
