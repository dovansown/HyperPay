import cors from "cors";
import express from "express";
import helmet from "helmet";
import { pinoHttp } from "pino-http";
import { v1Routes } from "./routes/v1.js";
import { errorHandlerMiddleware } from "./shared/middleware/error-handler.middleware.js";
import { requestIdMiddleware } from "./shared/middleware/request-id.middleware.js";
import { logger } from "./shared/utils/logger.js";

export function createApp() {
  const app = express();

  app.use(helmet());
  app.use(cors());
  app.use(express.json({ limit: "1mb" }));
  app.use(requestIdMiddleware);
  app.use(
    pinoHttp({
      logger,
      genReqId: (req: express.Request) => req.headers["x-request-id"] as string
    })
  );

  app.use("/api/v1", v1Routes);
  app.use(errorHandlerMiddleware);

  return app;
}
