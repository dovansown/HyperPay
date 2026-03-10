import { Router } from "express";
import { asyncHandler } from "../../shared/http/async-handler.js";
import { authMiddleware } from "../../shared/middleware/auth.middleware.js";
import { validate } from "../../shared/middleware/validate.middleware.js";
import { banksController } from "./banks.controller.js";
import { createBankSchema } from "./banks.schema.js";

export const banksRoutes = Router();

banksRoutes.get("/", authMiddleware, asyncHandler(banksController.list));
banksRoutes.post("/", authMiddleware, validate({ body: createBankSchema }), asyncHandler(banksController.create));
