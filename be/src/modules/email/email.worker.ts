import nodemailer from "nodemailer";
import { env } from "../../shared/config/env.js";
import { consumeQueue } from "../../shared/infra/rabbitmq.js";
import { logger } from "../../shared/utils/logger.js";
import { rateLimitService } from "../rate-limit/rate-limit.service.js";
import { systemSettingsService } from "../system-settings/system-settings.service.js";
import type { EmailJob } from "./email.types.js";
import { renderTemplate } from "./email.templates.js";

export async function startEmailWorker() {
  logger.info({ queue: env.RABBITMQ_EMAIL_QUEUE }, "Email worker started, consuming queue");
  await consumeQueue(env.RABBITMQ_EMAIL_QUEUE, async (msg) => {
    const job = JSON.parse(msg.content.toString()) as EmailJob;
    if (!job.to || !job.template) {
      throw new Error("Invalid email job: missing to or template");
    }
    const html = renderTemplate(job.template, job.data);
    const smtp = await systemSettingsService.getSmtpConfig();
    if (job.userId) {
      try {
        await rateLimitService.checkEmailRateLimit(job.userId);
      } catch (e) {
        logger.warn({ userId: job.userId }, "Email rate limited in worker, skipping send");
        return;
      }
    }
    const transporter = nodemailer.createTransport({
      host: smtp.host,
      port: smtp.port,
      secure: smtp.secure,
      auth: smtp.user ? { user: smtp.user, pass: smtp.pass } : undefined,
    });
    await transporter.sendMail({
      from: `"${smtp.fromName}" <${smtp.fromEmail}>`,
      to: job.to,
      subject: job.subject,
      html,
    });
    if (job.userId) {
      await rateLimitService.incrementEmailCount(job.userId);
    }
    logger.info({ to: job.to, subject: job.subject }, "Email sent");
  });
}
