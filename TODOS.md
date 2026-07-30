# GitHub repository sync → Payload Jobs Queue

**Goal:** Readable, durable GitHub → Payload sync without handmade Turso retries or a giant sync function. **The queue owns pacing and isolation between repos.** Payload [Tasks](https://payloadcms.com/docs/jobs-queue/tasks) / [Workflows](https://payloadcms.com/docs/jobs-queue/workflows) own fallible steps _inside_ one job.

**Objective:** readability + remove hacky code (`withDbRetry`, mega `syncRepositoriesFromGithub`, premature Vercel Workflow orchestration).

**Decision:** Prefer **Payload Jobs** over Workflow SDK for this feature — admin visibility (`payload-jobs`), Payload auth/`CRON_SECRET` on `/api/payload-jobs/run`, less Vercel lock-in. Pacing = staggered `waitUntil` + low `limit` on run, not durable `sleep("5m")` in an orchestrator.

**Docs (authoritative):**

| Topic                       | URL                                                        |
| --------------------------- | ---------------------------------------------------------- |
| Overview                    | https://payloadcms.com/docs/jobs-queue/overview            |
| Tasks                       | https://payloadcms.com/docs/jobs-queue/tasks               |
| Workflows                   | https://payloadcms.com/docs/jobs-queue/workflows           |
| Jobs (`queue`, `waitUntil`) | https://payloadcms.com/docs/jobs-queue/jobs                |
| Queues / run / Vercel Cron  | https://payloadcms.com/docs/jobs-queue/queues              |
| Quick start                 | https://payloadcms.com/docs/jobs-queue/quick-start-example |

---

## Mental model (new reality)

| Layer        | Responsibility                                                                                                                              |
| ------------ | ------------------------------------------------------------------------------------------------------------------------------------------- |
| **Queue**    | _When / how many_ jobs run. Stagger enrich jobs with `waitUntil`. Cron runs `/api/payload-jobs/run?queue=…&limit=1`.                        |
| **Task**     | One unit of work (list, or write enrichment). Retries on throw.                                                                             |
| **Workflow** | Optional: chain **tasks inside one job** so a retry resumes from the failed task and does **not** redo completed ones (cached task output). |
| **Job**      | One queued instance of a task or workflow.                                                                                                  |

**Do not** build a top-level “loop 100 repos + sleep” workflow. That was the wrong tool. The queue _is_ the loop.

```
Cron / admin button
    → queue job: syncGithubMetadata   (list + upsert + enqueue enrich jobs)
    → (later) cron runs queue github-enrich
         → job: enrichRepo (task or small workflow) × N, staggered
```

---

## Docs snapshot (Payload)

### Tasks

- Register on `jobs.tasks` with `slug`, `inputSchema`, `outputSchema`, `handler`, `retries`.
- Handler gets `{ input, job, req }` — use `req.payload` for DB.
- Fail by **throwing**; retries up to `retries` count.
- Keep tasks small and focused ([best practice](https://payloadcms.com/docs/jobs-queue/workflows#keep-tasks-small-and-focused)).

### Workflows (when isolation _inside_ a job matters)

- Handler calls `await tasks.someTask('stable-id', { input })` in order.
- On failure, workflow re-runs but **completed tasks return cached output** — resumes from the failure point.
- Use stable task IDs (`'fetch-artifacts'`, not random).
- Pass IDs / small inputs, not huge objects.
- Example: enrich as workflow = `fetchArtifacts` → `writeEnrichment` so a Payload write failure doesn’t re-hit GitHub.

### Jobs & pacing

```ts
await payload.jobs.queue({
  task: "enrichRepo", // or workflow: "enrichRepo"
  input: { nameWithOwner: "owner/repo" },
  queue: "github-enrich",
  waitUntil: new Date(Date.now() + i * 5 * 60_000), // +0, +5m, +10m…
});
```

- `waitUntil` = job not picked until that time ([Jobs](https://payloadcms.com/docs/jobs-queue/jobs)).
- Runner: `GET /api/payload-jobs/run?queue=github-enrich&limit=1` so a backlog of _due_ jobs doesn’t all fire at once.
- 429: re-queue same enrich with `waitUntil: now + 20m`, or throw and rely on task retries + slow cron (less precise).

### Cron / auth on Vercel

- **No `autoRun`** on serverless ([pitfalls](https://payloadcms.com/docs/jobs-queue/overview)).
- Vercel Cron → `/api/payload-jobs/run` (and optionally `handle-schedules` if using task `schedule`).
- Secure with `jobs.access.run`: logged-in user **or** `Authorization: Bearer ${CRON_SECRET}` ([Queues](https://payloadcms.com/docs/jobs-queue/queues)).

### Observability

- Unhide `payload-jobs` via `jobsCollectionOverrides` for debugging.

---

## Current pain

- `apps/web/src/modules/github/sync-repositories-from-github.ts` mixes GitHub, enrichment, Payload writes, and handmade DB retries.
- One timeout/429 can scramble a monolithic run.
- Scaffolded **Workflow SDK** path was removed; sync now targets Payload Jobs (`src/jobs/`).

## Target shape

```
apps/web/src/
  jobs/
    tasks/
      list-and-upsert-repos.ts       # TaskConfig — GitHub list + Payload metadata
      fetch-artifacts.ts             # optional — GitHub spelunk only
      write-enrichment.ts            # optional — Payload write only
    workflows/
      enrich-repo.ts                 # optional Workflow — fetch then write
    queue-enrich-jobs.ts             # helper: stagger waitUntil enqueue (step 3)
    index.ts                         # jobsConfig → payload.config
  payload.config.ts                  # jobs: jobsConfig
```

- `@repo/github` stays **GitHub-only**.
- Truncation / Payload mapping live in `apps/web`.
- Queues: `github-sync` (metadata) + `github-enrich` (paced spelunk).

### Flow

1. **Queue** `listAndUpsertRepos` (or run it from admin/cron immediately via `jobs.queue` + `jobs.run`).
2. That task: pull pinned + ~100 recent → upsert metadata → for each repo needing enrich, **queue** enrich job with staggered `waitUntil` (+5m × index).
3. Cron periodically **runs** `github-enrich` with `limit: 1` (or small).
4. Enrich job = **task** _or_ **workflow** (fetch → write) so retries don’t redo GitHub when only write failed.
5. Skip enrich when `pushedAt` ≤ `lastEnrichedAt` (don’t enqueue).

---

## Six steps (approval gate)

### 1. Enable Payload Jobs + tear down Workflow SDK scaffold

- [x] Add `jobs` to `payload.config.ts`: `access.run` (user or `CRON_SECRET`), stub `tasks`/`workflows`, `jobsCollectionOverrides` (`hidden: false`).
- [x] Point `vercel.json` enrich cron at `/api/payload-jobs/run?queue=github-enrich&limit=1` (legacy metadata cron kept until step 5).
- [x] Remove Workflow SDK github-sync scaffold (`workflow` package, `withWorkflow`, `src/workflows/github-sync/*`, `/api/workflows/github-sync`, `.well-known/workflow`).
- [x] Keep legacy `/api/cron/sync-repositories` until cutover (step 5).

**Done when:** `payload-jobs` visible; cron/`curl` with `CRON_SECRET` can hit `run` without error; Workflow SDK github-sync scaffold gone.

**Status:** ✅ Done

### 2. Extract domain helpers (kill the mega-function)

- [x] Split sync into helpers under `modules/github/`:
  - `list-github-repos.ts` — GitHub list → DTOs
  - `upsert-repo-metadata.ts` — Payload metadata (no README)
  - `map-enrichment-fields.ts` — skip check, spelunk + truncate, Payload write
- [x] Add `lastEnrichedAt` field + `src/seed/migrate-add-repository-last-enriched-at.ts` (see `apps/web/SCRIPTS.md`)
- [x] Thin legacy `syncRepositoriesFromGithub` to call helpers (`withDbRetry` stays until step 6)
- No Payload/Turso logic in `@repo/github`.

**Done when:** helpers are small, testable, and importable from job handlers.

**Status:** ✅ Done

### 3. Task: list + upsert metadata + enqueue enrich jobs

- Implement `listAndUpsertRepos` task (`retries` low — mostly local/DB).
- Persist `pushedAt`; use `lastEnrichedAt` for skip.
- After upsert, for each `toEnrich[i]`, `payload.jobs.queue({ workflow|task: 'enrichRepo', queue: 'github-enrich', waitUntil: now + i * 5m, input })`.
- Trigger: admin button + weekly cron queue this task (then `run` default/github-sync queue).

**Done when:** one metadata job seeds/updates repos and schedules enrich jobs without fetching READMEs inline.

**Status:** Next up

### 4. Enrich as task or small workflow + rate limits

- Prefer **workflow** `enrichRepo`: task `fetchArtifacts` (GitHub) → task `writeEnrichment` (Payload) so write failures don’t re-spelunk.
- Or single task if keep it one handler — still OK; isolation is weaker.
- `retries: 3–5` on GitHub-facing task.
- On explicit 429: queue a **new** enrich job with `waitUntil: now + 20m` (or throw and rely on runner interval — document choice).
- Idempotent writes; set `lastEnrichedAt` on success.
- Runner: `limit: 1` on `github-enrich`.

**Done when:** enrichments run staggered; failed write doesn’t always re-hit GitHub; 429 doesn’t stampede.

### 5. Wire triggers — weekly metadata + frequent enrich runner

- Weekly (or daily) cron: queue/run **metadata** sync.
- Frequent cron (e.g. every 5m): `GET /api/payload-jobs/run?queue=github-enrich&limit=1`.
- Admin “Pull from GitHub” → `payload.jobs.queue({ task: 'listAndUpsertRepos', … })` (+ optional immediate `run`); toast job id.
- Retire inline `syncRepositoriesFromGithub` from cron/admin.

**Done when:** cron + button only enqueue/run Payload jobs.

### 6. Cleanup + observability

- Delete dead sync path, Workflow SDK scaffold leftovers, handmade retries.
- README under `jobs/` describing queues, stagger, and how to inspect `payload-jobs`.
- Smoke: metadata job → N enrich jobs with staggered `waitUntil` → second metadata run skips unchanged repos.

**Done when:** old sync gone; skip logic verified; jobs readable in admin.

---

## Out of scope

- Landing / monorepo tabs UI (already shipped).
- Moving spelunk parsers out of `@repo/github`.
- Keeping Workflow SDK for this feature (explicitly abandoned for github-sync).

## Open choices (confirm on approval)

| Choice           | Default proposal                               |
| ---------------- | ---------------------------------------------- |
| Enrich pacing    | `waitUntil` +5m × index; run with `limit: 1`   |
| Enrich shape     | Workflow: `fetchArtifacts` → `writeEnrichment` |
| 429              | Re-queue enrich with `waitUntil + 20m`         |
| Metadata cadence | Weekly cron                                    |
| Enrich runner    | Every 5 minutes                                |
| Skip field       | `lastEnrichedAt`                               |
| Batch size       | Pinned + recent `100`                          |

---

**Status:** Steps 1–2 done. Next: step 3 (`listAndUpsertRepos` task + staggered enrich enqueue).
