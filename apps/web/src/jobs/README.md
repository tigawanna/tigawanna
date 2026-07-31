# GitHub sync jobs

Payload Jobs drive GitHub → Payload repository **metadata** sync (backup for the live landing fetch).

- Admin UI: **Jobs progress** (`/admin/jobs-progress`) — live queue table + per-row **Run**
- Collection list: Repositories → **Pull from GitHub** / **Jobs progress**
- Inspect raw docs: Admin → **Payload Jobs**

## Queues

| Queue           | Purpose                                            | Runner                                                                                    |
| --------------- | -------------------------------------------------- | ----------------------------------------------------------------------------------------- |
| `github-sync`   | `listAndUpsertRepos` — list + metadata upsert only | Daily cron `/api/cron/sync-repositories` or admin **Pull from GitHub** (queue + run once) |
| `github-enrich` | `enrichRepo` workflow — README / monorepo (manual) | Not cron'd. Queue a job yourself, then **Run** that row on Jobs progress                  |

## Flow

1. Metadata job lists pinned + recent repos from GitHub.
2. Upserts only repos with `pushedAt` within the last **2 days** (pinned repos always upsert so `featured` stays correct). Older repos are skipped with **no** DB read/write.
3. Enrichment is **not** auto-enqueued. Use a per-row **Run** on Jobs progress if you manually queue an `enrichRepo` job.

## Auth

`jobs.access.run` allows logged-in users **or** `Authorization: Bearer $CRON_SECRET`.
Admin Jobs progress APIs require a logged-in Payload session.

```bash
curl -H "Authorization: Bearer $CRON_SECRET" \
  "http://localhost:3055/api/cron/sync-repositories"
```

## CLI

```bash
pnpm sync:repositories   # queue + run metadata once
```
