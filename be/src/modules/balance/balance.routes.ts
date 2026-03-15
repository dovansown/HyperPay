import { Router } from "express";
import { asyncHandler } from "../../shared/http/async-handler.js";
import { authMiddleware } from "../../shared/middleware/auth.middleware.js";
import { validate } from "../../shared/middleware/validate.middleware.js";
import { balanceController } from "./balance.controller.js";
import { topUpBodySchema } from "./balance.schema.js";

export const balanceRoutes = Router();

balanceRoutes.use(authMiddleware);

balanceRoutes.get("/", asyncHandler(balanceController.get));
balanceRoutes.post("/top-up", validate({ body: topUpBodySchema }), asyncHandler(balanceController.topUp));
