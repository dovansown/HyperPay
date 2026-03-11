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

  findByUserId(userId: number) {
    return prisma.userWebhook.findFirst({
      where: { userId, deletedAt: null },
      include: this.defaultInclude
    });
  }

  findActiveByUserId(userId: number) {
    return prisma.userWebhook.findFirst({
      where: { userId, deletedAt: null, isActive: true },
      include: this.defaultInclude
    });
  }

  listOwnedAccounts(userId: number, accountIds: number[]) {
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

  async upsert(userId: number, payload: UpsertWebhookInput) {
    const existed = await this.findByUserId(userId);
    if (!existed) {
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
            create: (payload.account_ids ?? []).map((bankAccountId) => ({
              bankAccountId
            }))
          },
          isActive: payload.is_active ?? true
        },
        include: this.defaultInclude
      });
    }
    return prisma.userWebhook.update({
      where: { id: existed.id },
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
        selectedAccounts: {
          deleteMany: {},
          create: (payload.account_ids ?? []).map((bankAccountId) => ({
            bankAccountId
          }))
        },
        isActive: payload.is_active ?? true
      },
      include: this.defaultInclude
    });
  }
}

export const webhooksRepository = new WebhooksRepository();
