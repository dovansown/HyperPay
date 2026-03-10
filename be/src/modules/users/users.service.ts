import { AppError, ErrorCodes } from "../../shared/http/app-error.js";
import { usersRepository } from "./users.repository.js";

export class UsersService {
  async getProfile(userId: number) {
    const user = await usersRepository.findById(userId);
    if (!user) {
      throw new AppError(404, ErrorCodes.NOT_FOUND, "User not found");
    }
    return {
      id: user.id,
      email: user.email,
      full_name: user.fullName ?? ""
    };
  }
}

export const usersService = new UsersService();
