import { config as dotenvConfig } from "dotenv";
import { z } from "zod";

dotenvConfig();

const envSchema = z.object({
  NODE_ENV: z.enum(["development", "test", "production"]).default("development"),
  PORT: z.coerce.number().int().positive().default(8080),
  DATABASE_URL: z.string().min(1).default("postgresql://postgres:postgres@localhost:5432/hyperpay?schema=public"),
  JWT_SECRET: z.string().min(10).default("test-jwt-secret-123"),
  REDIS_URL: z.string().min(1).default("redis://localhost:6379"),
  RABBITMQ_URL: z.string().min(1).default("amqp://guest:guest@localhost:5672"),
  RABBITMQ_WEBHOOK_QUEUE: z.string().default("webhook.dispatch"),
  RABBITMQ_WEBHOOK_DLX: z.string().default("webhook.dispatch.dlx"),
  RABBITMQ_WEBHOOK_DLQ: z.string().default("webhook.dispatch.dlq"),
  CACHE_TTL_SECONDS: z.coerce.number().int().positive().default(120),
  CAPTCHA_SERVICE_URL: z.string().url().default("http://localhost:8090"),
  CAPTCHA_SERVICE_API_KEY: z.string().default(""),
  CAPTCHA_SERVICE_TIMEOUT_MS: z.coerce.number().int().positive().default(8000)
});

const parsed = envSchema.safeParse(process.env);
if (!parsed.success) {
  console.error("Invalid env variables:", parsed.error.flatten().fieldErrors);
  throw new Error("Environment validation failed");
}

export const env = parsed.data;
