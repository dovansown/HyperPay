import { prisma } from "../../shared/infra/prisma.js";

export class UsersRepository {
  findById(userId: number) {
    return prisma.user.findFirst({
      where: { id: userId, deletedAt: null }
    });
  }
}

export const usersRepository = new UsersRepository();
