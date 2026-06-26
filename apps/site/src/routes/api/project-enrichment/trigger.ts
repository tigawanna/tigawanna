import { requireAdminSession } from "@/lib/admin-auth/require-admin";
import { createRunRecord } from "@/lib/project-enrichment/run-enrichment";
import type { EnrichmentRunParams } from "@/lib/project-enrichment/types";
import { enrichProjectsWorkflow } from "@/workflows/project-enrichment";
import { createFileRoute } from "@tanstack/react-router";
import { json } from "@tanstack/react-start";
import { checkBotId } from "botid/server";
import { start } from "workflow/api";
import { z } from "zod";

const triggerBodySchema = z.object({
  limit: z.number().int().min(1).max(100).optional(),
  repos: z.array(z.string().regex(/^[^/]+\/[^/]+$/)).optional(),
  force: z.boolean().optional(),
});

export const Route = createFileRoute("/api/project-enrichment/trigger")({
  server: {
    handlers: {
      POST: async ({ request }) => {
        await requireAdminSession();

        const verification = await checkBotId();
        if (verification.isBot) {
          return json({ error: "Access denied" }, { status: 403 });
        }

        const body = triggerBodySchema.parse(await request.json().catch(() => ({})));
        const trigger: EnrichmentRunParams["trigger"] = body.repos?.length ? "manual" : "scheduled";
        const runId = await createRunRecord(trigger, body.repos ?? null);

        const params: EnrichmentRunParams = {
          runId,
          trigger,
          limit: body.limit ?? 100,
          repos: body.repos,
          force: body.force ?? false,
        };

        await start(enrichProjectsWorkflow, [params]);

        return json({ runId, status: "started" }, { status: 202 });
      },
    },
  },
});
