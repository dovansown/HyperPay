import amqp, { type Channel, type ConsumeMessage } from "amqplib";
import { env } from "../config/env.js";
import { logger } from "../utils/logger.js";

let channel: Channel | null = null;

export async function connectRabbit(): Promise<Channel> {
  if (channel) {
    return channel;
  }

  const conn = await amqp.connect(env.RABBITMQ_URL);
  const ch = await conn.createChannel();

  await ch.assertExchange(env.RABBITMQ_WEBHOOK_DLX, "direct", { durable: true });
  await ch.assertQueue(env.RABBITMQ_WEBHOOK_DLQ, {
    durable: true
  });
  await ch.bindQueue(env.RABBITMQ_WEBHOOK_DLQ, env.RABBITMQ_WEBHOOK_DLX, "failed");

  await ch.assertQueue(env.RABBITMQ_WEBHOOK_QUEUE, {
    durable: true,
    deadLetterExchange: env.RABBITMQ_WEBHOOK_DLX,
    deadLetterRoutingKey: "failed"
  });

  channel = ch;
  logger.info("RabbitMQ connected");
  return ch;
}

export async function publishToQueue(queue: string, payload: unknown) {
  const ch = await connectRabbit();
  ch.sendToQueue(queue, Buffer.from(JSON.stringify(payload)), { persistent: true });
}

export async function consumeQueue(
  queue: string,
  handler: (msg: ConsumeMessage) => Promise<void>
) {
  const ch = await connectRabbit();
  await ch.consume(queue, async (msg) => {
    if (!msg) {
      return;
    }

    try {
      await handler(msg);
      ch.ack(msg);
    } catch (error) {
      logger.error({ error }, "Queue handler failed, message moved to DLQ");
      ch.nack(msg, false, false);
    }
  });
}
