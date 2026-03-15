import { prisma } from "../../shared/infra/prisma.js";
import type { UpsertWebhookInput } from "./webhooks.schema.js";

export class WebhooksRepository {
  private defaultInclude = {
    selectedAccounts: {
      where: { deletedAt: null },
      select: {
        bankAccountId: true,
        bankAccount: {
          select: {
            accountNumber: true
          }
        }
      }
    }
  } as const;

  findManyByUserId(userId: string) {
    return prisma.userWebhook.findMany({
      where: { userId, deletedAt: null },
      orderBy: { createdAt: "asc" },
      include: this.defaultInclude
    });
  }

  findByIdAndUserId(id: string, userId: string) {
    return prisma.userWebhook.findFirst({
      where: { id, userId, deletedAt: null },
      include: this.defaultInclude
    });
  }

  findActiveByUserId(userId: string) {
    return prisma.userWebhook.findMany({
      where: { userId, deletedAt: null, isActive: true },
      include: this.defaultInclude
    });
  }

  listOwnedAccounts(userId: string, accountIds: string[]) {
    if (accountIds.length === 0) return Promise.resolve([]);
    return prisma.bankAccount.findMany({
      where: {
        id: { in: accountIds },
        userId,
        deletedAt: null
      },
      select: { id: true, accountNumber: true }
    });
  }

  async create(userId: string, payload: UpsertWebhookInput) {
    return prisma.userWebhook.create({
      data: {
        userId,
        url: payload.url,
        secretToken: payload.secret_token,
        contentType: payload.content_type,
        authType: payload.auth_type,
        authHeaderName: payload.auth_header_name,
        authHeaderValue: payload.auth_header_value,
        authBearerToken: payload.auth_bearer_token,
        authUsername: payload.auth_username,
        authPassword: payload.auth_password,
        retryOnNon2xx: payload.retry_on_non_2xx,
        maxRetryAttempts: payload.max_retry_attempts,
        transactionDirection: payload.transaction_direction,
        requirePaymentCode: payload.require_payment_code,
        paymentCodeRuleEnabled: payload.payment_code_rule_enabled,
        paymentCodePrefix: payload.payment_code_prefix,
        paymentCodeSuffixMinLength: payload.payment_code_suffix_min_length,
        paymentCodeSuffixMaxLength: payload.payment_code_suffix_max_length,
        paymentCodeSuffixCharset: payload.payment_code_suffix_charset,
        selectedAccounts: {
          create: (payload.account_ids ?? []).map((bankAccountId) => ({ bankAccountId }))
        },
        isActive: payload.is_active ?? true
      },
      include: this.defaultInclude
    });
  }

  async update(id: string, userId: string, payload: UpsertWebhookInput) {
    const accountIds = payload.account_ids ?? [];
    return prisma.$transaction(async (tx) => {
      await tx.userWebhook.update({
        where: { id },
        data: {
          url: payload.url,
          secretToken: payload.secret_token,
          contentType: payload.content_type,
          authType: payload.auth_type,
          authHeaderName: payload.auth_header_name,
          authHeaderValue: payload.auth_header_value,
          authBearerToken: payload.auth_bearer_token,
          authUsername: payload.auth_username,
          authPassword: payload.auth_password,
          retryOnNon2xx: payload.retry_on_non_2xx,
          maxRetryAttempts: payload.max_retry_attempts,
          transactionDirection: payload.transaction_direction,
          requirePaymentCode: payload.require_payment_code,
          paymentCodeRuleEnabled: payload.payment_code_rule_enabled,
          paymentCodePrefix: payload.payment_code_prefix,
          paymentCodeSuffixMinLength: payload.payment_code_suffix_min_length,
          paymentCodeSuffixMaxLength: payload.payment_code_suffix_max_length,
          paymentCodeSuffixCharset: payload.payment_code_suffix_charset,
          isActive: payload.is_active ?? true
        }
      });
      await tx.userWebhookAccount.deleteMany({ where: { userWebhookId: id } });
      if (accountIds.length > 0) {
        await tx.userWebhookAccount.createMany({
          data: accountIds.map((bankAccountId) => ({ userWebhookId: id, bankAccountId }))
        });
      }
      const updated = await tx.userWebhook.findUniqueOrThrow({
        where: { id },
        include: this.defaultInclude
      });
      return updated;
    });
  }

  createDeliveryLog(data: {
    userId: string;
    url: string;
    eventType: string;
    responseStatusCode: number;
    success: boolean;
    errorMessage?: string | null;
    requestPayload?: string | null;
    responseBody?: string | null;
  }) {
    return prisma.webhookDeliveryLog.create({
      data: {
        userId: data.userId,
        url: data.url,
        eventType: data.eventType,
        responseStatusCode: data.responseStatusCode,
        success: data.success,
        errorMessage: data.errorMessage ?? null,
        requestPayload: data.requestPayload ?? null,
        responseBody: data.responseBody ?? null
      }
    });
  }

  findRecentDeliveryLogs(userId: string, limit: number) {
    return prisma.webhookDeliveryLog.findMany({
      where: { userId },
      orderBy: { createdAt: "desc" },
      take: limit
    });
  }

  async softDelete(id: string, userId: string): Promise<boolean> {
    const webhook = await this.findByIdAndUserId(id, userId);
    if (!webhook) return false;
    await prisma.userWebhook.update({
      where: { id },
      data: { deletedAt: new Date() }
    });
    return true;
  }
}

export const webhooksRepository = new WebhooksRepository();
