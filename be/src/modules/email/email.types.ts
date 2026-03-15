export type EmailTemplateType =
  | "code_verify_email"
  | "warning_email"
  | "change_amount"
  | "verified"
  | "verify_link";

export interface EmailJob {
  to: string;
  subject: string;
  template: EmailTemplateType;
  data: Record<string, string | number | undefined>;
  userId?: string; // for rate limit counting
}
