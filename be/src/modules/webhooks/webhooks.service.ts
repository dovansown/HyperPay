import { env } from "../../shared/config/env.js";
import { AppError, ErrorCodes } from "../../shared/http/app-error.js";
import { PaymentCodeCharset, TransactionDirectionFilter, WebhookAuthType, WebhookContentType } from "@prisma/client";
import { packagesService } from "../packages/packages.service.js";
import { queueService } from "../queue/queue.service.js";
import { webhooksRepository } from "./webhooks.repository.js";
import type { UpsertWebhookInput } from "./webhooks.schema.js";

export class WebhooksService {
  private mapWebhook(webhook: {
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
    selectedAccounts: Array<{ bankAccountId: number; bankAccount: { accountNumber: string } }>;
  }) {
    return {
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

  async get(userId: number) {
    const webhook = await webhooksRepository.findByUserId(userId);
    if (!webhook) {
      return null;
    }
    return this.mapWebhook(webhook);
  }

  async upsert(userId: number, payload: UpsertWebhookInput) {
    const accountIds = [...new Set(payload.account_ids ?? [])];
    const ownedAccounts = await webhooksRepository.listOwnedAccounts(userId, accountIds);
    if (ownedAccounts.length !== accountIds.length) {
      throw new AppError(400, ErrorCodes.INVALID_REQUEST, "Some account_ids are invalid");
    }

    const webhook = await webhooksRepository.upsert(userId, payload);
    return this.mapWebhook(webhook);
  }

  async enqueueDispatch(event: unknown) {
    await queueService.publish(env.RABBITMQ_WEBHOOK_QUEUE, event);
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

  async dispatchForUser(
    userId: number,
    payload: {
      event: string;
      account_id: number;
      transaction_id: number;
      type: string;
      description?: string;
      payment_code?: string | null;
      amount: number;
      balance: number;
      occurred_at: string;
    }
  ) {
    const webhook = await webhooksRepository.findActiveByUserId(userId);
    if (!webhook) {
      return { queued: false };
    }
    const allowedAccountIds = webhook.selectedAccounts.map((x) => x.bankAccountId);
    if (allowedAccountIds.length > 0 && !allowedAccountIds.includes(payload.account_id)) {
      return { queued: false };
    }

    const txDirection = this.directionOf(payload.type);
    if (
      (webhook.transactionDirection === TransactionDirectionFilter.IN && txDirection !== "IN") ||
      (webhook.transactionDirection === TransactionDirectionFilter.OUT && txDirection !== "OUT")
    ) {
      return { queued: false };
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
      return { queued: false };
    }

    try {
      await packagesService.consumeWebhookDeliveryQuota(userId, 1);
    } catch (error) {
      if (
        error instanceof AppError &&
        (error.code === ErrorCodes.FORBIDDEN || error.code === ErrorCodes.CONFLICT)
      ) {
        return { queued: false };
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
    return { queued: true };
  }
}

export const webhooksService = new WebhooksService();
