# HyperPay BE

Backend Express + TypeScript theo kien truc module (repository/service/controller/routes), su dung Prisma + PostgreSQL, Redis cache va RabbitMQ queue.

## 1) Khoi dong ha tang local

Chay trong thu muc `be/`:

```bash
npm run infra:up
```

Service sau khi bat:

- PostgreSQL: `localhost:5432`
- Redis: `localhost:6379`
- RabbitMQ AMQP: `localhost:5672`
- RabbitMQ UI: `http://localhost:15672` (`guest/guest`)

## 2) Cai dat backend

```bash
npm install
cp .env.example .env
npm run prisma:generate
npm run prisma:migrate
npm run prisma:seed
npm run dev
```

## 3) Lenh ho tro

- `npm run infra:ps`: xem trang thai container
- `npm run infra:logs`: xem logs realtime
- `npm run infra:down`: tat toan bo ha tang
