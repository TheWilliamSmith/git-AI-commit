import pino from "pino";

export const logger = pino({
  transport: {
    target: "pino-pretty",
    options: {
      colorize: true,
      translateTime: "HH:mm:ss",
      ignore: "pid,hostname",
    },
  },
  level: process.env.LOG_LEVEL ?? "info",
});
