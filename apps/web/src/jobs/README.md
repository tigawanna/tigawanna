# GitHub sync jobs

Payload Jobs drive GitHub → Payload repository sync.

- Admin UI: **Jobs progress** (`/admin/jobs-progress`) — live queue table + per-row **Run**
- Collection list: Repositories → **Pull from GitHub** / **Jobs progress**
- Inspect raw docs: Admin → **Payload Jobs**

## Queues

| Queue           | Purpose                                                        | Runner                                                                                     |
| --------------- | -------------------------------------------------------------- | ------------------------------------------------------------------------------------------ |
| `github-sync`   | `listAndUpsertRepos` — list + metadata upsert + enqueue enrich | Weekly cron `/api/cron/sync-repositories` or admin **Pull from GitHub** (queue + run once) |
| `github-enrich` | `enrichRepo` workflow — fetch README/monorepo → write          | Vercel Cron daily (`0 7 * * *`): `/api/payload-jobs/run?queue=github-enrich&limit=1`       |

## Flow

1. Metadata job upserts pinned + recent repos (no READMEs).
2. For each repo needing enrich (`pushedAt` newer than `lastEnrichedAt`), queue `enrichRepo` with `waitUntil` staggered by **+5m × index**.
3. Enrich runner picks **one** due job at a time (`limit: 1`), or run a specific job from **Jobs progress**.
4. Workflow: `fetchArtifacts` → `writeEnrichment` (write failures do not re-hit GitHub).
5. GitHub **429**: re-queue same enrich with `waitUntil + 20m` (no stampede).

## Auth

`jobs.access.run` allows logged-in users **or** `Authorization: Bearer $CRON_SECRET`.
Admin Jobs progress APIs require a logged-in Payload session.

```bash
curl -H "Authorization: Bearer $CRON_SECRET" \
  "http://localhost:3055/api/payload-jobs/run?queue=github-enrich&limit=1"
```

## CLI

```bash
pnpm sync:repositories   # queue + run metadata once
```
