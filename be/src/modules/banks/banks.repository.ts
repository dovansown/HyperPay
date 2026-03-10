import { prisma } from "../../shared/infra/prisma.js";
import type { CreateBankInput } from "./banks.schema.js";

export class BanksRepository {
  findByCode(code: string) {
    return prisma.bank.findFirst({
      where: { code, deletedAt: null }
    });
  }

  create(input: CreateBankInput) {
    return prisma.bank.create({
      data: {
        name: input.name,
        code: input.code,
        iconUrl: input.icon_url
      }
    });
  }

  list() {
    return prisma.bank.findMany({
      where: { deletedAt: null },
      orderBy: { id: "asc" }
    });
  }
}

export const banksRepository = new BanksRepository();
