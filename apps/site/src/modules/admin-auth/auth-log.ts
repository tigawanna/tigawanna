import { getRequestLog } from "@/lib/evlog/get-request-log";

export type AuthLogEvent = {
  action: string;
  outcome: "success" | "failure" | "redirect";
  reason?: string;
  email?: string;
  requestIp?: string;
  path?: string;
};

export function logAuthEvent(event: AuthLogEvent) {
  try {
    getRequestLog().set({ auth: event });
  } catch {
    return;
  }
}
