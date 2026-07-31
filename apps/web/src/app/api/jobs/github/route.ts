import { queueAndRunGithubMetadataSync } from "@/jobs/queue-and-run-metadata-sync";
import { requirePayloadUser } from "@/jobs/require-payload-user";

/**
 * Admin controls for GitHub job queues.
 * Body:
 * - `{ "action": "sync" }` — queue + run metadata sync
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

    return Response.json({ error: 'action must be "sync" or "run-job"' }, { status: 400 });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "GitHub jobs action failed";
    return Response.json({ ok: false, error: message }, { status: 500 });
  }
}
