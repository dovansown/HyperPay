import { z } from "zod";

export const dashboardQuerySchema = z.object({
  period: z.enum(["7", "30"]).optional().default("7")
});

export type DashboardQuery = z.infer<typeof dashboardQuerySchema>;
