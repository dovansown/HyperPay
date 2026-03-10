import { publishToQueue } from "../../shared/infra/rabbitmq.js";

export class QueueService {
  async publish(queueName: string, payload: unknown) {
    await publishToQueue(queueName, payload);
  }
}

export const queueService = new QueueService();
