import type { SystemSettingKey } from "./system-settings.repository.js";
import { systemSettingsRepository } from "./system-settings.repository.js";

export interface SmtpConfig {
  host: string;
  port: number;
  secure: boolean;
  user: string;
  pass: string;
  fromEmail: string;
  fromName: string;
}

export interface RateLimitConfig {
  loginAttempts: number;
  loginWindowSeconds: number;
  emailPerUserPerHour: number;
}

export type AlertLevel = "require_verify" | "warn_only";

export interface NotificationDefaults {
  success: boolean;
  failed: boolean;
  disputes: boolean;
  payouts: boolean;
  team: boolean;
}

const DEFAULTS: Record<string, string> = {
  rate_limit_login_attempts: "5",
  rate_limit_login_window_seconds: "900",
  rate_limit_email_per_user_per_hour: "5",
  alert_level: "require_verify",
  smtp_config: JSON.stringify({
    host: "localhost",
    port: 1025,
    secure: false,
    user: "",
    pass: "",
    fromEmail: "noreply@hyperpay.local",
    fromName: "HyperPay",
  }),
  notification_defaults: JSON.stringify({
    success: true,
    failed: true,
    disputes: true,
    payouts: false,
    team: false,
  }),
};

export class SystemSettingsService {
  async getValue(key: SystemSettingKey): Promise<string | null> {
    return systemSettingsRepository.get(key);
  }

  async getSmtpConfig(): Promise<SmtpConfig> {
    const raw = await systemSettingsRepository.get("smtp_config");
    if (!raw) return DEFAULTS.smtp_config as unknown as SmtpConfig;
    try {
      return JSON.parse(raw) as SmtpConfig;
    } catch {
      return DEFAULTS.smtp_config as unknown as SmtpConfig;
    }
  }

  async getRateLimitConfig(): Promise<RateLimitConfig> {
    const raw = await systemSettingsRepository.getMany([
      "rate_limit_login_attempts",
      "rate_limit_login_window_seconds",
      "rate_limit_email_per_user_per_hour",
    ]);
    return {
      loginAttempts: Math.max(1, parseInt(raw.rate_limit_login_attempts ?? DEFAULTS.rate_limit_login_attempts, 10) || 5),
      loginWindowSeconds: Math.max(60, parseInt(raw.rate_limit_login_window_seconds ?? DEFAULTS.rate_limit_login_window_seconds, 10) || 900),
      emailPerUserPerHour: Math.max(1, parseInt(raw.rate_limit_email_per_user_per_hour ?? DEFAULTS.rate_limit_email_per_user_per_hour, 10) || 5),
    };
  }

  async getAlertLevel(): Promise<AlertLevel> {
    const raw = await systemSettingsRepository.get("alert_level");
    if (raw === "warn_only" || raw === "require_verify") return raw;
    return "require_verify";
  }

  async getNotificationDefaults(): Promise<NotificationDefaults> {
    const raw = await systemSettingsRepository.get("notification_defaults");
    if (!raw) return JSON.parse(DEFAULTS.notification_defaults) as NotificationDefaults;
    try {
      return JSON.parse(raw) as NotificationDefaults;
    } catch {
      return JSON.parse(DEFAULTS.notification_defaults) as NotificationDefaults;
    }
  }

  async setSmtpConfig(config: Partial<SmtpConfig>): Promise<void> {
    const current = await this.getSmtpConfig();
    const merged = { ...current, ...config };
    await systemSettingsRepository.set("smtp_config", JSON.stringify(merged));
  }

  async setRateLimitConfig(config: Partial<RateLimitConfig>): Promise<void> {
    const current = await this.getRateLimitConfig();
    const merged = { ...current, ...config };
    await systemSettingsRepository.set("rate_limit_login_attempts", String(merged.loginAttempts));
    await systemSettingsRepository.set("rate_limit_login_window_seconds", String(merged.loginWindowSeconds));
    await systemSettingsRepository.set("rate_limit_email_per_user_per_hour", String(merged.emailPerUserPerHour));
  }

  async setAlertLevel(level: AlertLevel): Promise<void> {
    await systemSettingsRepository.set("alert_level", level);
  }

  async setNotificationDefaults(defaults: Partial<NotificationDefaults>): Promise<void> {
    const current = await this.getNotificationDefaults();
    const merged = { ...current, ...defaults };
    await systemSettingsRepository.set("notification_defaults", JSON.stringify(merged));
  }

  async getAllForAdmin(): Promise<{
    smtp_config: SmtpConfig;
    rate_limit: RateLimitConfig;
    alert_level: AlertLevel;
    notification_defaults: NotificationDefaults;
  }> {
    const [smtp_config, rate_limit, alert_level, notification_defaults] = await Promise.all([
      this.getSmtpConfig(),
      this.getRateLimitConfig(),
      this.getAlertLevel(),
      this.getNotificationDefaults(),
    ]);
    return { smtp_config, rate_limit, alert_level, notification_defaults };
  }

  async setAllFromAdmin(payload: {
    smtp_config?: Partial<SmtpConfig>;
    rate_limit?: Partial<RateLimitConfig>;
    alert_level?: AlertLevel;
    notification_defaults?: Partial<NotificationDefaults>;
  }): Promise<void> {
    if (payload.smtp_config) await this.setSmtpConfig(payload.smtp_config);
    if (payload.rate_limit) await this.setRateLimitConfig(payload.rate_limit);
    if (payload.alert_level != null) await this.setAlertLevel(payload.alert_level);
    if (payload.notification_defaults) await this.setNotificationDefaults(payload.notification_defaults);
  }
}

export const systemSettingsService = new SystemSettingsService();
