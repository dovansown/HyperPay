import { env } from "../../shared/config/env.js";
import { consumeQueue } from "../../shared/infra/rabbitmq.js";
import { logger } from "../../shared/utils/logger.js";
import { WebhookAuthType, WebhookContentType } from "@prisma/client";
import { webhooksRepository } from "./webhooks.repository.js";

interface WebhookJob {
  userId?: string;
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

function getEventType(payload: unknown): string {
  if (payload && typeof payload === "object" && "event" in payload && typeof (payload as { event: unknown }).event === "string") {
    return (payload as { event: string }).event;
  }
  return "unknown";
}

export async function startWebhookWorker() {
  logger.info({ queue: env.RABBITMQ_WEBHOOK_QUEUE }, "Webhook worker started, consuming queue");
  await consumeQueue(env.RABBITMQ_WEBHOOK_QUEUE, async (msg) => {
    const body = JSON.parse(msg.content.toString()) as WebhookJob;
    logger.info({ url: body.url, userId: body.userId }, "Webhook job received");
    if (!body.url) {
      throw new Error("Invalid webhook job payload");
    }

    // Authentication: x-webhook-secret, Bearer, Basic, custom Header
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

    const eventType = getEventType(body.payload);
    const userId = body.userId ?? "";

    const maxAttempts = body.retryOnNon2xx ? Math.max(1, body.maxRetryAttempts ?? 3) : 1;
    let lastStatus = 0;
    let lastResponseBody: string | null = null;
    try {
      for (let attempt = 1; attempt <= maxAttempts; attempt += 1) {
        const response = await fetch(body.url, {
          method: "POST",
          headers,
          body: bodyContent
        });
        lastStatus = response.status;
        try {
          lastResponseBody = await response.text();
        } catch {
          lastResponseBody = null;
        }
        if (response.ok) {
          logger.info({ url: body.url, attempt }, "Webhook delivered");
          if (userId) {
            await webhooksRepository.createDeliveryLog({
              userId,
              url: body.url,
              eventType,
              responseStatusCode: response.status,
              success: true,
              requestPayload: bodyContent,
              responseBody: lastResponseBody
            });
          }
          return;
        }
      }

      if (userId) {
        await webhooksRepository.createDeliveryLog({
          userId,
          url: body.url,
          eventType,
          responseStatusCode: lastStatus,
          success: false,
          errorMessage: `HTTP ${lastStatus}`,
          requestPayload: bodyContent,
          responseBody: lastResponseBody
        });
      }
      throw new Error(`Webhook delivery failed with status ${lastStatus}`);
    } catch (err) {
      const errMsg = err instanceof Error ? err.message : String(err);
      if (userId) {
        try {
          await webhooksRepository.createDeliveryLog({
            userId,
            url: body.url,
            eventType,
            responseStatusCode: lastStatus || 0,
            success: false,
            errorMessage: errMsg,
            requestPayload: bodyContent,
            responseBody: lastResponseBody
          });
        } catch (logErr) {
          logger.error({ err: logErr }, "Failed to write webhook delivery log");
        }
      }
      throw err;
    }
  });
}
