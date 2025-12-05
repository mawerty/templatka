type LogLevel = "debug" | "info" | "warn" | "error";

const isDev = import.meta.env.DEV;

function formatMessage(name: string, level: LogLevel): string {
  const timestamp = new Date().toISOString().slice(11, 23);
  return `[${timestamp}] [${level.toUpperCase()}] [${name}]`;
}

export function createLogger(name: string) {
  return {
    debug: (...args: unknown[]) => {
      if (isDev) console.debug(formatMessage(name, "debug"), ...args);
    },
    info: (...args: unknown[]) => {
      if (isDev) console.info(formatMessage(name, "info"), ...args);
    },
    warn: (...args: unknown[]) => {
      console.warn(formatMessage(name, "warn"), ...args);
    },
    error: (...args: unknown[]) => {
      console.error(formatMessage(name, "error"), ...args);
    },
  };
}
