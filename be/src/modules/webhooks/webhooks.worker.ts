import { env } from "../../shared/config/env.js";
import { consumeQueue } from "../../shared/infra/rabbitmq.js";
import { logger } from "../../shared/utils/logger.js";
import { WebhookAuthType, WebhookContentType } from "@prisma/client";

interface WebhookJob {
  url: string;
  payload: unknown;
  secretToken?: string;
  contentType?: WebhookContentType;
  authType?: WebhookAuthType;
  authHeaderName?: string;
  authHeaderValue?: string;
  authBearerToken?: string;
  authUsername?: string;
  authPassword?: string;
  retryOnNon2xx?: boolean;
  maxRetryAttempts?: number;
}

export async function startWebhookWorker() {
  await consumeQueue(env.RABBITMQ_WEBHOOK_QUEUE, async (msg) => {
    const body = JSON.parse(msg.content.toString()) as WebhookJob;
    if (!body.url) {
      throw new Error("Invalid webhook job payload");
    }

    const headers: Record<string, string> = {
      "Content-Type":
        body.contentType === WebhookContentType.FORM_URLENCODED
          ? "application/x-www-form-urlencoded"
          : "application/json"
    };
    if (body.secretToken) {
      headers["x-webhook-secret"] = body.secretToken;
    }
    if (body.authType === WebhookAuthType.BEARER && body.authBearerToken) {
      headers["authorization"] = `Bearer ${body.authBearerToken}`;
    }
    if (body.authType === WebhookAuthType.BASIC && body.authUsername && body.authPassword) {
      const encoded = Buffer.from(`${body.authUsername}:${body.authPassword}`).toString("base64");
      headers["authorization"] = `Basic ${encoded}`;
    }
    if (body.authType === WebhookAuthType.HEADER && body.authHeaderName && body.authHeaderValue) {
      headers[body.authHeaderName] = body.authHeaderValue;
    }

    const bodyContent =
      body.contentType === WebhookContentType.FORM_URLENCODED
        ? new URLSearchParams(
            Object.entries((body.payload ?? {}) as Record<string, unknown>).map(([key, value]) => [
              key,
              String(value ?? "")
            ])
          ).toString()
        : JSON.stringify(body.payload ?? {});

    const maxAttempts = body.retryOnNon2xx ? Math.max(1, body.maxRetryAttempts ?? 3) : 1;
    let lastStatus = 0;
    for (let attempt = 1; attempt <= maxAttempts; attempt += 1) {
      const response = await fetch(body.url, {
        method: "POST",
        headers,
        body: bodyContent
      });
      lastStatus = response.status;
      if (response.ok) {
        logger.info({ url: body.url, attempt }, "Webhook delivered");
        return;
      }
    }

    throw new Error(`Webhook delivery failed with status ${lastStatus}`);
  });
}
