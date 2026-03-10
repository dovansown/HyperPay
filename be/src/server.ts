import { createApp } from "./app.js";
import { env } from "./shared/config/env.js";
import { connectRabbit } from "./shared/infra/rabbitmq.js";
import { connectRedis, redisClient } from "./shared/infra/redis.js";
import { prisma } from "./shared/infra/prisma.js";
import { logger } from "./shared/utils/logger.js";
import { startWebhookWorker } from "./modules/webhooks/webhooks.worker.js";

async function bootstrap() {
  const app = createApp();

  await prisma.$connect();
  await connectRedis();
  await connectRabbit();
  await startWebhookWorker();

  app.listen(env.PORT, () => {
    logger.info(`HyperPay be listening on port ${env.PORT}`);
  });
}

void bootstrap().catch(async (error) => {
  logger.error({ error }, "Failed to start server");
  await prisma.$disconnect();
  if (redisClient.status === "ready") {
    await redisClient.quit();
  }
  process.exit(1);
});
