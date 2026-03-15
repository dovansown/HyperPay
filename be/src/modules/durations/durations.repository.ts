import { prisma } from "../../shared/infra/prisma.js";

export class DurationsRepository {
  list() {
    return prisma.duration.findMany({
      where: { deletedAt: null },
      orderBy: [{ sortOrder: "asc" }, { id: "asc" }]
    });
  }

  findById(id: string) {
    return prisma.duration.findFirst({
      where: { id, deletedAt: null }
    });
  }

  create(data: { name: string; months: number; days: number; sortOrder?: number }) {
    return prisma.duration.create({
      data: {
        name: data.name,
        months: data.months,
        days: data.days,
        sortOrder: data.sortOrder ?? 0
      }
    });
  }

  update(id: string, data: { name?: string; months?: number; days?: number; sortOrder?: number }) {
    return prisma.duration.update({
      where: { id },
      data: {
        ...(data.name != null && { name: data.name }),
        ...(data.months != null && { months: data.months }),
        ...(data.days != null && { days: data.days }),
        ...(data.sortOrder != null && { sortOrder: data.sortOrder })
      }
    });
  }

  softDelete(id: string) {
    return prisma.duration.update({
      where: { id },
      data: { deletedAt: new Date() }
    });
  }
}

export const durationsRepository = new DurationsRepository();
