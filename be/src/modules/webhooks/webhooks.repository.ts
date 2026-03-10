import { prisma } from "../../shared/infra/prisma.js";
import type { UpsertWebhookInput } from "./webhooks.schema.js";

export class WebhooksRepository {
  findByUserId(userId: number) {
    return prisma.userWebhook.findFirst({
      where: { userId, deletedAt: null }
    });
  }

  async upsert(userId: number, payload: UpsertWebhookInput) {
    const existed = await this.findByUserId(userId);
    if (!existed) {
      return prisma.userWebhook.create({
        data: {
          userId,
          url: payload.url,
          secretToken: payload.secret_token,
          isActive: payload.is_active ?? true
        }
      });
    }
    return prisma.userWebhook.update({
      where: { id: existed.id },
      data: {
        url: payload.url,
        secretToken: payload.secret_token,
        isActive: payload.is_active ?? true
      }
    });
  }
}

export const webhooksRepository = new WebhooksRepository();
