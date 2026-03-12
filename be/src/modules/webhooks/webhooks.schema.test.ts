import { describe, expect, it } from "vitest";
import { upsertWebhookSchema } from "./webhooks.schema.js";

describe("upsertWebhookSchema", () => {
  it("requires bearer token when auth_type is BEARER", () => {
    const result = upsertWebhookSchema.safeParse({
      url: "https://example.com/webhook",
      secret_token: "secret",
      auth_type: "BEARER"
    });

    expect(result.success).toBe(false);
    if (result.success) return;
    expect(result.error.issues.some((i) => i.path.join(".") === "auth_bearer_token")).toBe(true);
  });

  it("requires header name/value when auth_type is HEADER", () => {
    const result = upsertWebhookSchema.safeParse({
      url: "https://example.com/webhook",
      secret_token: "secret",
      auth_type: "HEADER",
      auth_header_name: "X-TOKEN"
    });

    expect(result.success).toBe(false);
    if (result.success) return;
    expect(result.error.issues.some((i) => i.path.join(".") === "auth_header_name")).toBe(true);
  });

  it("rejects payment rule when min length > max length", () => {
    const result = upsertWebhookSchema.safeParse({
      url: "https://example.com/webhook",
      secret_token: "secret",
      payment_code_rule_enabled: true,
      payment_code_prefix: "HPY",
      payment_code_suffix_min_length: 12,
      payment_code_suffix_max_length: 8,
      payment_code_suffix_charset: "NUMERIC"
    });

    expect(result.success).toBe(false);
    if (result.success) return;
    expect(result.error.issues.some((i) => i.path.join(".") === "payment_code_suffix_max_length")).toBe(true);
  });
});
