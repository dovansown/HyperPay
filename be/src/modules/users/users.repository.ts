import { prisma } from "../../shared/infra/prisma.js";

export class UsersRepository {
  findById(id: string) {
    return prisma.user.findFirst({
      where: { id, deletedAt: null },
      select: {
        id: true,
        email: true,
        fullName: true,
        role: true,
        password: true,
        emailVerified: true,
        totpEnabledAt: true,
      },
    });
  }

  async updateProfile(
    userId: string,
    data: { full_name?: string }
  ) {
    return prisma.user.update({
      where: { id: userId },
      data: { fullName: data.full_name },
      select: { id: true, email: true, fullName: true, role: true, emailVerified: true },
    });
  }

  async updatePassword(userId: string, passwordHash: string) {
    await prisma.user.update({
      where: { id: userId },
      data: { password: passwordHash },
    });
  }
}

export const usersRepository = new UsersRepository();
