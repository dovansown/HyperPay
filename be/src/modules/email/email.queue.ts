import { env } from "../../shared/config/env.js";
import { queueService } from "../queue/queue.service.js";
import type { EmailJob } from "./email.types.js";

export async function enqueueEmail(job: EmailJob): Promise<void> {
  await queueService.publish(env.RABBITMQ_EMAIL_QUEUE, job);
}
