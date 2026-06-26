import handler, { createServerEntry } from "@tanstack/react-start/server-entry";
import { runWithWorkerEnv } from "@/lib/worker-env";

type RequestContext = {
  isServer: true;
};

declare module "@tanstack/react-start" {
  interface Register {
    server: {
      requestContext: RequestContext;
    };
  }
}

type CloudflareServerEntry = {
  fetch: (request: Request, env: CloudflareBindings) => Promise<Response> | Response;
};

const serverEntry: CloudflareServerEntry = {
  async fetch(request, env) {
    return runWithWorkerEnv(env, () => handler.fetch(request, { context: { isServer: true } }));
  },
};

export default createServerEntry(serverEntry as unknown as Parameters<typeof createServerEntry>[0]);
