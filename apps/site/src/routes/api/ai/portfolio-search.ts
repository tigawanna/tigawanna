import { toServerSentEventsResponse, type ModelMessage } from "@tanstack/ai";
import { createFileRoute } from "@tanstack/react-router";
import { z } from "zod";
import { streamPortfolioSearchChat } from "@/features/portfolio-ai/portfolio-agent.server";
import { serverEnv } from "@/lib/server-env";

const portfolioAiRequestDataSchema = z.object({
  apiKey: z.string().trim().optional(),
  model: z.string().trim().optional(),
});

const portfolioAiCorsHeaders = {
  "Access-Control-Allow-Origin": serverEnv.FRONTEND_URL,
  "Access-Control-Allow-Credentials": "true",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type",
  Vary: "Origin",
} as const;

function isAllowedOrigin(request: Request) {
  const origin = request.headers.get("origin");
  return origin === serverEnv.FRONTEND_URL;
}

function withCors(response: Response) {
  const headers = new Headers(response.headers);
  for (const [key, value] of Object.entries(portfolioAiCorsHeaders)) {
    headers.set(key, value);
  }
  return new Response(response.body, {
    status: response.status,
    statusText: response.statusText,
    headers,
  });
}

export const Route = createFileRoute("/api/ai/portfolio-search")({
  server: {
    handlers: {
      POST: async ({ request }: { request: Request }) => {
        if (!isAllowedOrigin(request)) {
          return withCors(
            new Response(JSON.stringify({ error: "Forbidden" }), {
              status: 403,
              headers: { "Content-Type": "application/json" },
            }),
          );
        }

        try {
          const raw = (await request.json()) as {
            messages?: unknown;
            data?: unknown;
          };

          if (!Array.isArray(raw.messages)) {
            return withCors(
              new Response(JSON.stringify({ error: "Invalid chat payload" }), {
                status: 400,
                headers: { "Content-Type": "application/json" },
              }),
            );
          }

          const data = portfolioAiRequestDataSchema.parse(raw.data);
          const stream = await streamPortfolioSearchChat({
            messages: raw.messages as ModelMessage[],
            apiKey: data.apiKey,
            model: data.model,
          });

          return withCors(toServerSentEventsResponse(stream));
        } catch (error: unknown) {
          const message =
            error instanceof z.ZodError
              ? "Invalid AI request payload"
              : error instanceof Error
                ? error.message
                : "Unable to process AI request";
          return withCors(
            new Response(JSON.stringify({ error: message }), {
              status: 400,
              headers: { "Content-Type": "application/json" },
            }),
          );
        }
      },
      OPTIONS: async () =>
        new Response(null, {
          status: 204,
          headers: portfolioAiCorsHeaders,
        }),
    },
  },
});
