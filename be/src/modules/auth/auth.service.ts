import { AppError, ErrorCodes } from "../../shared/http/app-error.js";
import { packagesService } from "../packages/packages.service.js";
import { hashPassword, verifyPassword } from "../../shared/utils/password.js";
import { signAccessToken } from "../../shared/utils/jwt.js";
import { authRepository } from "./auth.repository.js";
import type { ForgotPasswordInput, LoginInput, RegisterInput } from "./auth.schema.js";

export class AuthService {
  async register(input: RegisterInput) {
    const existing = await authRepository.findByEmail(input.email);
    if (existing) {
      throw new AppError(409, ErrorCodes.CONFLICT, "Email already exists");
    }

    const passwordHash = await hashPassword(input.password);
    const user = await authRepository.createUser({
      email: input.email,
      password: passwordHash,
      fullName: input.full_name
    });
    const defaultPackage = await packagesService.assignDefaultPackageForUser(user.id);

    const token = signAccessToken({ sub: String(user.id), email: user.email, role: user.role });
    return {
      token,
      user: {
        id: user.id,
        email: user.email,
        full_name: user.fullName ?? "",
        role: user.role
      },
      package: defaultPackage
    };
  }

  async login(input: LoginInput) {
    const user = await authRepository.findByEmail(input.email);
    if (!user) {
      throw new AppError(401, ErrorCodes.UNAUTHORIZED, "Invalid email or password");
    }

    const isValidPassword = await verifyPassword(user.password, input.password);
    if (!isValidPassword) {
      throw new AppError(401, ErrorCodes.UNAUTHORIZED, "Invalid email or password");
    }

    const token = signAccessToken({ sub: String(user.id), email: user.email, role: user.role });
    return {
      token,
      user: {
        id: user.id,
        email: user.email,
        full_name: user.fullName ?? "",
        role: user.role
      }
    };
  }

  async forgotPassword(_input: ForgotPasswordInput) {
    return { accepted: true };
  }
}

export const authService = new AuthService();
