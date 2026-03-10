import { env } from "../../shared/config/env.js";
import { consumeQueue } from "../../shared/infra/rabbitmq.js";
import { logger } from "../../shared/utils/logger.js";

interface WebhookJob {
  url: string;
  payload: unknown;
  secretToken?: string;
}

export async function startWebhookWorker() {
  await consumeQueue(env.RABBITMQ_WEBHOOK_QUEUE, async (msg) => {
    const body = JSON.parse(msg.content.toString()) as WebhookJob;
    if (!body.url) {
      throw new Error("Invalid webhook job payload");
    }

    const headers: Record<string, string> = {
      "Content-Type": "application/json"
    };
    if (body.secretToken) {
      headers["x-webhook-secret"] = body.secretToken;
    }

    const response = await fetch(body.url, {
      method: "POST",
      headers,
      body: JSON.stringify(body.payload ?? {})
    });

    if (!response.ok) {
      throw new Error(`Webhook delivery failed with status ${response.status}`);
    }

    logger.info({ url: body.url }, "Webhook delivered");
  });
}
