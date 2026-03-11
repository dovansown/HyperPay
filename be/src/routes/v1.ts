import { Router } from "express";
import { accountsRoutes } from "../modules/accounts/accounts.routes.js";
import { authRoutes } from "../modules/auth/auth.routes.js";
import { banksRoutes } from "../modules/banks/banks.routes.js";
import { healthRoutes } from "../modules/health/health.routes.js";
import { packagesRoutes } from "../modules/packages/packages.routes.js";
import { plansRoutes } from "../modules/plans/plans.routes.js";
import { transactionsRoutes } from "../modules/transactions/transactions.routes.js";
import { usersRoutes } from "../modules/users/users.routes.js";
import { webhooksRoutes } from "../modules/webhooks/webhooks.routes.js";
import { contentRoutes, publicContentRoutes } from "../modules/content/content.routes.js";

export const v1Routes = Router();

v1Routes.use("/health", healthRoutes);
v1Routes.use("/auth", authRoutes);
v1Routes.use("/users", usersRoutes);
v1Routes.use("/banks", banksRoutes);
v1Routes.use("/plans", plansRoutes);
v1Routes.use("/packages", packagesRoutes);
v1Routes.use("/accounts", accountsRoutes);
v1Routes.use("/webhook", webhooksRoutes);
v1Routes.use("/public/content", publicContentRoutes);
v1Routes.use("/content", contentRoutes);
v1Routes.use("/", transactionsRoutes);
