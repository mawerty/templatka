/**
 * Simple logger utility - use instead of console.log.
 *
 * Usage:
 *   import { createLogger } from "@/lib/logger";
 *   const logger = createLogger("MyComponent");
 *   logger.info("Hello", { data: 123 });
 */

type LogLevel = "debug" | "info" | "warn" | "error";

const isDev = import.meta.env.DEV;

function formatMessage(name: string, level: LogLevel, args: unknown[]): string {
  const timestamp = new Date().toISOString().slice(11, 23);
  return `[${timestamp}] [${level.toUpperCase()}] [${name}]`;
}

export function createLogger(name: string) {
  return {
    debug: (...args: unknown[]) => {
      if (isDev) {
        console.debug(formatMessage(name, "debug", args), ...args);
      }
    },
    info: (...args: unknown[]) => {
      if (isDev) {
        console.info(formatMessage(name, "info", args), ...args);
      }
    },
    warn: (...args: unknown[]) => {
      console.warn(formatMessage(name, "warn", args), ...args);
    },
    error: (...args: unknown[]) => {
      console.error(formatMessage(name, "error", args), ...args);
    },
  };
}

