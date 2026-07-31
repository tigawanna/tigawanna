import { queueAndRunGithubMetadataSync } from "@/jobs/queue-and-run-metadata-sync";
import { GITHUB_ENRICH_QUEUE } from "@/jobs/queues";
import { requirePayloadUser } from "@/jobs/require-payload-user";

/**
 * Admin controls for GitHub job queues.
 * Body:
 * - `{ "action": "sync" }` — queue + run metadata sync
 * - `{ "action": "enrich-run" }` — drain one due job from `github-enrich`
 * - `{ "action": "run-job", "jobId": 123 }` — run one specific job by id (ignores waitUntil)
 */
export async function POST(request: Request) {
  const auth = await requirePayloadUser();
  if (!auth) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return Response.json({ error: "Expected JSON body" }, { status: 400 });
  }

  const action =
    typeof body === "object" && body !== null && "action" in body && typeof body.action === "string"
      ? body.action
      : "";

  const jobIdRaw =
    typeof body === "object" && body !== null && "jobId" in body ? body.jobId : undefined;
  const jobId =
    typeof jobIdRaw === "number"
      ? jobIdRaw
      : typeof jobIdRaw === "string" && jobIdRaw.trim()
        ? Number(jobIdRaw)
        : null;

  try {
    const { payload } = auth;

    if (action === "sync") {
      const result = await queueAndRunGithubMetadataSync(payload);
      return Response.json({ ok: true, action, ...result });
    }

    if (action === "enrich-run") {
      const runResult = await payload.jobs.run({
        queue: GITHUB_ENRICH_QUEUE,
        limit: 1,
      });
      return Response.json({
        ok: true,
        action,
        queue: GITHUB_ENRICH_QUEUE,
        runResult,
      });
    }

    if (action === "run-job") {
      if (jobId == null || !Number.isFinite(jobId)) {
        return Response.json({ error: "jobId is required" }, { status: 400 });
      }

      // Clear schedule so a staggered job can run immediately when requested.
      await payload.update({
        collection: "payload-jobs",
        id: jobId,
        data: {
          waitUntil: null,
          hasError: false,
          error: null,
        },
        depth: 0,
        overrideAccess: true,
      });

      const runResult = await payload.jobs.runByID({ id: jobId });
      return Response.json({ ok: true, action, jobId, runResult });
    }

    return Response.json(
      { error: 'action must be "sync", "enrich-run", or "run-job"' },
      { status: 400 },
    );
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "GitHub jobs action failed";
    return Response.json({ ok: false, error: message }, { status: 500 });
  }
}
