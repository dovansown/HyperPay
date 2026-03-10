import { prisma } from "../../shared/infra/prisma.js";

export class AuthRepository {
  findByEmail(email: string) {
    return prisma.user.findFirst({
      where: { email, deletedAt: null }
    });
  }

  createUser(input: { email: string; password: string; fullName: string }) {
    return prisma.user.create({
      data: {
        email: input.email,
        password: input.password,
        fullName: input.fullName
      }
    });
  }
}

export const authRepository = new AuthRepository();
