import { toJobListItem } from "@/jobs/job-list-item";
import { requirePayloadUser } from "@/jobs/require-payload-user";

type RouteContext = {
  params: Promise<{ id: string }>;
};

/**
 * Reads a job from `payload-jobs` (admin session required).
 */
export async function GET(_request: Request, context: RouteContext) {
  const auth = await requirePayloadUser();
  if (!auth) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id: rawId } = await context.params;
  const id = Number(rawId);

  if (!Number.isFinite(id)) {
    return Response.json({ error: "Invalid job id" }, { status: 400 });
  }

  try {
    const job = await auth.payload.findByID({
      collection: "payload-jobs",
      id,
      depth: 0,
      overrideAccess: true,
    });

    return Response.json(toJobListItem(job));
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Job not found";
    return Response.json({ error: message }, { status: 404 });
  }
}
