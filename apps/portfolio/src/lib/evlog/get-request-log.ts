import { createLogger, type RequestLogger } from "evlog";
import { useRequest } from "nitro/context";

const fallbackLog = createLogger({ service: "tigawanna-site" });

export function getRequestLog(): RequestLogger {
  try {
    const req = useRequest();
    const log = req.context?.log as RequestLogger | undefined;
    if (log) {
      return log;
    }
  } catch {
    return fallbackLog as RequestLogger;
  }

  return fallbackLog as RequestLogger;
}
