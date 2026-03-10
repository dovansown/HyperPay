import { env } from "../../shared/config/env.js";
import { queueService } from "../queue/queue.service.js";
import { webhooksRepository } from "./webhooks.repository.js";
import type { UpsertWebhookInput } from "./webhooks.schema.js";

export class WebhooksService {
  async get(userId: number) {
    const webhook = await webhooksRepository.findByUserId(userId);
    if (!webhook) {
      return null;
    }
    return {
      url: webhook.url,
      secret_token: webhook.secretToken,
      is_active: webhook.isActive
    };
  }

  async upsert(userId: number, payload: UpsertWebhookInput) {
    const webhook = await webhooksRepository.upsert(userId, payload);
    return {
      url: webhook.url,
      secret_token: webhook.secretToken,
      is_active: webhook.isActive
    };
  }

  async enqueueDispatch(event: unknown) {
    await queueService.publish(env.RABBITMQ_WEBHOOK_QUEUE, event);
  }
}

export const webhooksService = new WebhooksService();
