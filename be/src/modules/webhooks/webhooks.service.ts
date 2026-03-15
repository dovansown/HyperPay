import { env } from "../../shared/config/env.js";
import { AppError, ErrorCodes } from "../../shared/http/app-error.js";
import { PaymentCodeCharset, TransactionDirectionFilter, WebhookAuthType, WebhookContentType } from "@prisma/client";
import { packagesService } from "../packages/packages.service.js";
import { queueService } from "../queue/queue.service.js";
import { webhooksRepository } from "./webhooks.repository.js";
import type { UpsertWebhookInput } from "./webhooks.schema.js";

export class WebhooksService {
  private mapWebhook(webhook: {
    id: string;
    url: string;
    secretToken: string;
    contentType: WebhookContentType;
    authType: WebhookAuthType;
    authHeaderName: string | null;
    authHeaderValue: string | null;
    authBearerToken: string | null;
    authUsername: string | null;
    authPassword: string | null;
    retryOnNon2xx: boolean;
    maxRetryAttempts: number;
    transactionDirection: TransactionDirectionFilter;
    requirePaymentCode: boolean;
    paymentCodeRuleEnabled: boolean;
    paymentCodePrefix: string | null;
    paymentCodeSuffixMinLength: number | null;
    paymentCodeSuffixMaxLength: number | null;
    paymentCodeSuffixCharset: PaymentCodeCharset | null;
    isActive: boolean;
    selectedAccounts: Array<{ bankAccountId: string; bankAccount: { accountNumber: string } }>;
  }) {
    return {
      id: webhook.id,
      url: webhook.url,
      secret_token: webhook.secretToken,
      account_ids: webhook.selectedAccounts.map((x) => x.bankAccountId),
      account_numbers: webhook.selectedAccounts.map((x) => x.bankAccount.accountNumber),
      transaction_direction: webhook.transactionDirection,
      retry_on_non_2xx: webhook.retryOnNon2xx,
      max_retry_attempts: webhook.maxRetryAttempts,
      content_type: webhook.contentType,
      auth_type: webhook.authType,
      auth_header_name: webhook.authHeaderName,
      auth_header_value: webhook.authHeaderValue,
      auth_bearer_token: webhook.authBearerToken,
      auth_username: webhook.authUsername,
      auth_password: webhook.authPassword,
      require_payment_code: webhook.requirePaymentCode,
      payment_code_rule_enabled: webhook.paymentCodeRuleEnabled,
      payment_code_prefix: webhook.paymentCodePrefix,
      payment_code_suffix_min_length: webhook.paymentCodeSuffixMinLength,
      payment_code_suffix_max_length: webhook.paymentCodeSuffixMaxLength,
      payment_code_suffix_charset: webhook.paymentCodeSuffixCharset,
      is_active: webhook.isActive
    };
  }

  async get(userId: string) {
    const webhooks = await webhooksRepository.findManyByUserId(userId);
    return webhooks.map((w) => this.mapWebhook(w));
  }

  async create(userId: string, payload: UpsertWebhookInput) {
    const accountIds = [...new Set(payload.account_ids ?? [])];
    const ownedAccounts = await webhooksRepository.listOwnedAccounts(userId, accountIds);
    if (ownedAccounts.length !== accountIds.length) {
      throw new AppError(400, ErrorCodes.INVALID_REQUEST, "Some account_ids are invalid");
    }
    const webhook = await webhooksRepository.create(userId, payload);
    return this.mapWebhook(webhook);
  }

  async update(userId: string, id: string, payload: UpsertWebhookInput) {
    const existing = await webhooksRepository.findByIdAndUserId(id, userId);
    if (!existing) {
      throw new AppError(404, ErrorCodes.NOT_FOUND, "Webhook not found");
    }
    const accountIds = [...new Set(payload.account_ids ?? [])];
    const ownedAccounts = await webhooksRepository.listOwnedAccounts(userId, accountIds);
    if (ownedAccounts.length !== accountIds.length) {
      throw new AppError(400, ErrorCodes.INVALID_REQUEST, "Some account_ids are invalid");
    }
    const webhook = await webhooksRepository.update(id, userId, payload);
    return this.mapWebhook(webhook);
  }

  async remove(userId: string, id: string): Promise<{ deleted: boolean }> {
    const deleted = await webhooksRepository.softDelete(id, userId);
    return { deleted };
  }

  async getDeliveryLogs(userId: string, limit: number) {
    const rows = await webhooksRepository.findRecentDeliveryLogs(userId, limit);
    return rows.map((r) => ({
      id: r.id,
      url: r.url,
      event_type: r.eventType,
      response_status_code: r.responseStatusCode,
      success: r.success,
      error_message: r.errorMessage,
      request_payload: r.requestPayload,
      response_body: r.responseBody,
      created_at: r.createdAt
    }));
  }

  async enqueueDispatch(event: unknown) {
    await queueService.publish(env.RABBITMQ_WEBHOOK_QUEUE, event);
  }

  /** Gửi sự kiện thử (test event) vào hàng đợi, worker sẽ gửi tới endpoint và ghi log. */
  async sendTestEvent(userId: string, webhookId?: string): Promise<{ queued: boolean }> {
    const webhook = webhookId
      ? await webhooksRepository.findByIdAndUserId(webhookId, userId)
      : (await webhooksRepository.findManyByUserId(userId))[0] ?? null;
    if (!webhook?.url) {
      throw new AppError(
        400,
        ErrorCodes.INVALID_REQUEST,
        "Chưa cấu hình webhook. Vui lòng lưu endpoint trước khi gửi sự kiện thử."
      );
    }

    const payload: Record<string, unknown> = {
      event: "webhook.test",
      message: "Sự kiện thử từ HyperPay",
      timestamp: new Date().toISOString(),
      data: {
        transaction_id: 0,
        account_id: 0,
        type: "CREDIT",
        description: "Test event",
        amount: 0,
        balance: 0,
        occurred_at: new Date().toISOString(),
        payment_code: null
      }
    };

    await queueService.publish(env.RABBITMQ_WEBHOOK_QUEUE, {
      userId,
      url: webhook.url,
      payload,
      secretToken: webhook.secretToken,
      contentType: webhook.contentType,
      authType: webhook.authType,
      authHeaderName: webhook.authHeaderName,
      authHeaderValue: webhook.authHeaderValue,
      authBearerToken: webhook.authBearerToken,
      authUsername: webhook.authUsername,
      authPassword: webhook.authPassword,
      retryOnNon2xx: webhook.retryOnNon2xx,
      maxRetryAttempts: webhook.maxRetryAttempts
    });

    return { queued: true };
  }

  private directionOf(txType: string) {
    const normalized = txType.toLowerCase();
    if (["credit", "in", "incoming", "deposit"].includes(normalized)) {
      return "IN";
    }
    if (["debit", "out", "outgoing", "withdraw"].includes(normalized)) {
      return "OUT";
    }
    return "UNKNOWN";
  }

  private extractPaymentCode(
    content: string,
    rule: {
      enabled: boolean;
      prefix: string | null;
      min: number | null;
      max: number | null;
      charset: PaymentCodeCharset | null;
    }
  ) {
    if (!rule.enabled || !rule.prefix || !rule.min || !rule.max || !rule.charset) {
      return null;
    }
    const charset =
      rule.charset === PaymentCodeCharset.NUMERIC
        ? "[0-9]"
        : rule.charset === PaymentCodeCharset.ALPHA
          ? "[A-Za-z]"
          : "[A-Za-z0-9]";
    const regex = new RegExp(`\\b${rule.prefix}(${charset}{${rule.min},${rule.max}})\\b`);
    const match = content.match(regex);
    if (!match) {
      return null;
    }
    return `${rule.prefix}${match[1]}`;
  }

  /**
   * Gửi webhook cho user khi có giao dịch. Gửi tới mọi webhook active khớp điều kiện
   * (account_ids, transaction_direction, payment code). Một tài khoản có thể trigger nhiều webhook.
   */
  async dispatchForUser(
    userId: string,
    payload: {
      event: string;
      account_id: string;
      transaction_id: string;
      type: string;
      description?: string;
      payment_code?: string | null;
      amount: number;
      balance: number;
      occurred_at: string;
    }
  ) {
    const webhooks = await webhooksRepository.findActiveByUserId(userId);
    const txDirection = this.directionOf(payload.type);
    let queued = false;

    for (const webhook of webhooks) {
      const allowedAccountIds = webhook.selectedAccounts.map((x) => x.bankAccountId);
      if (allowedAccountIds.length > 0 && !allowedAccountIds.includes(payload.account_id)) {
        continue;
      }
      if (
        (webhook.transactionDirection === TransactionDirectionFilter.IN && txDirection !== "IN") ||
        (webhook.transactionDirection === TransactionDirectionFilter.OUT && txDirection !== "OUT")
      ) {
        continue;
      }

      const extractedPaymentCode = this.extractPaymentCode(payload.description ?? "", {
        enabled: webhook.paymentCodeRuleEnabled,
        prefix: webhook.paymentCodePrefix,
        min: webhook.paymentCodeSuffixMinLength,
        max: webhook.paymentCodeSuffixMaxLength,
        charset: webhook.paymentCodeSuffixCharset
      });
      const paymentCode = payload.payment_code ?? extractedPaymentCode;
      if (webhook.requirePaymentCode && !paymentCode) {
        continue;
      }

      try {
        await packagesService.consumeWebhookDeliveryQuota(userId, 1);
      } catch (error) {
        if (
          error instanceof AppError &&
          (error.code === ErrorCodes.FORBIDDEN || error.code === ErrorCodes.CONFLICT)
        ) {
          continue;
        }
        throw error;
      }
      await queueService.publish(env.RABBITMQ_WEBHOOK_QUEUE, {
        userId,
        url: webhook.url,
        payload: {
          ...payload,
          has_payment_code: Boolean(paymentCode),
          payment_code: paymentCode ?? null
        },
        secretToken: webhook.secretToken,
        contentType: webhook.contentType,
        authType: webhook.authType,
        authHeaderName: webhook.authHeaderName,
        authHeaderValue: webhook.authHeaderValue,
        authBearerToken: webhook.authBearerToken,
        authUsername: webhook.authUsername,
        authPassword: webhook.authPassword,
        retryOnNon2xx: webhook.retryOnNon2xx,
        maxRetryAttempts: webhook.maxRetryAttempts
      });
      queued = true;
    }
    return { queued };
  }
}

export const webhooksService = new WebhooksService();
