import { prisma } from "../../shared/infra/prisma.js";

const DEFAULT_KEYS = [
  "smtp_config",
  "rate_limit_login_attempts",
  "rate_limit_login_window_seconds",
  "rate_limit_email_per_user_per_hour",
  "alert_level",
  "notification_defaults",
] as const;

export type SystemSettingKey = (typeof DEFAULT_KEYS)[number];

export class SystemSettingsRepository {
  async get(key: string): Promise<string | null> {
    const row = await prisma.systemSetting.findUnique({
      where: { key },
      select: { value: true },
    });
    return row?.value ?? null;
  }

  async set(key: string, value: string): Promise<void> {
    await prisma.systemSetting.upsert({
      where: { key },
      create: { key, value },
      update: { value },
    });
  }

  async getMany(keys: readonly string[]): Promise<Record<string, string | null>> {
    const rows = await prisma.systemSetting.findMany({
      where: { key: { in: [...keys] } },
      select: { key: true, value: true },
    });
    const out: Record<string, string | null> = {};
    for (const k of keys) {
      out[k] = rows.find((r) => r.key === k)?.value ?? null;
    }
    return out;
  }

  async getAll(): Promise<Record<string, string>> {
    const rows = await prisma.systemSetting.findMany({
      select: { key: true, value: true },
    });
    return Object.fromEntries(rows.map((r) => [r.key, r.value]));
  }
}

export const systemSettingsRepository = new SystemSettingsRepository();
