# Modularization progress

Track for: versioned **spelunk → enrich → embed** pipeline, shared packages, and Better Auth.

Legend: `[x]` done · `[ ]` pending · `[~]` in progress

---

## Auth (`@repo/auth` + site)

| Step                                                             | Status | Notes                                                       |
| ---------------------------------------------------------------- | ------ | ----------------------------------------------------------- |
| Auth-1 — `@repo/auth` package + `auth-roles.ts` (access control) | [x]    | `admin` / `user`, backstage resource statements             |
| Auth-2 — Shared plugin config (`plugins.ts`)                     | [x]    | `apiKey`, `bearer`, `deviceAuthorization`, `admin`          |
| Auth-3 — Site `lib/better-auth/auth.ts` + `/api/auth/$` route    | [x]    | TanStack Start handler, `tanstackStartCookies()` last       |
| Auth-4 — Env vars (`BETTER_AUTH_SECRET`, `BETTER_AUTH_URL`, …)   | [x]    | Falls back from `ADMIN_SESSION_SECRET`                      |
| Auth-5 — DB tables for `apikey` + `deviceCode`                   | [x]    | Migration `0008_foamy_viper.sql`                            |
| Auth-6 — CLI credential store (`cli-credentials.ts`)             | [x]    | `~/.config/tigawanna/credentials.json`                      |
| Auth-7 — Rip out bespoke admin JWT / Telegram OTP                | [x]    | Email/password sign-in at `/backstage/sign-in`              |
| Auth-8 — `lib/better-auth/client.ts`                             | [x]    | `adminClient` + `apiKeyClient`                              |
| Auth-9 — Backstage session via Better Auth                       | [x]    | `getBackstageViewer`, `requireBackstageSession`, middleware |
| Auth-10 — Backstage API key management UI                        | [ ]    | Create/revoke keys in backstage                             |
| Auth-11 — `embed-cli auth login` (device flow)                   | [ ]    | Uses `deviceAuthorization` + `cli-credentials`              |
| Auth-12 — Drop `admin_login_challenges` table + dead env vars    | [ ]    | `ADMIN_OTP_PEPPER`, `ADMIN_SESSION_SECRET` cleanup          |

### Auth test checklist

- [ ] `pnpm --filter @repo/db db:migrate` applied locally
- [ ] `BETTER_AUTH_SECRET` + `ADMIN_EMAIL` set in `.env`
- [ ] First-time admin sign-up at `/backstage/sign-in` (email must match `ADMIN_EMAIL`)
- [ ] Sign in → `/backstage` loads
- [ ] Sign out from sidebar works

---

## Pipeline — `@repo/github` spelunk

| Step                                                             | Status | Notes                                                      |
| ---------------------------------------------------------------- | ------ | ---------------------------------------------------------- |
| GitHub-1 — `spelunk/types.ts` (`RepoArtifact`, `SpelunkPayload`) | [ ]    |                                                            |
| GitHub-2 — Per-language parsers (≤100 lines each)                | [ ]    | JS/TS, Go, Python, Rust, Kotlin/Java, C#, Ruby, PHP, Swift |
| GitHub-3 — `manifest-paths.ts` + `collect-artifacts.ts`          | [ ]    | GitHub API only; no DB                                     |
| GitHub-4 — Parser tests with fixtures                            | [ ]    |                                                            |
| GitHub-5 — Remove legacy `extraction.ts` monolith                | [ ]    | After site migrates                                        |

---

## Pipeline — DB versioning

| Step                                      | Status | Notes                                                    |
| ----------------------------------------- | ------ | -------------------------------------------------------- |
| DB-1 — `project_repo_artifacts` table     | [ ]    | `generation`, `collectorVersion`, `payload`, `createdAt` |
| DB-2 — `project_enrichment_outputs` table | [ ]    | `sourceGeneration`, `payload`, `createdAt`               |
| DB-3 — Extend `project_embeddings`        | [ ]    | `sourceGeneration`, `sourceEnrichmentAt`                 |
| DB-4 — Drizzle migration + apply          | [ ]    |                                                          |

### Skip rules (agreed)

| Stage       | Skip when                                                           |
| ----------- | ------------------------------------------------------------------- |
| Spelunk     | `collectorVersion` current AND `createdAt` < 7d AND `!force`        |
| Enrich      | `enrichment.sourceGeneration === artifacts.generation` AND `!force` |
| Embed (CLI) | same generation + same `enrichment.createdAt` AND `!force`          |

Enrich **never** calls GitHub — only reads `project_repo_artifacts.payload`.

---

## Pipeline — `@repo/ai`

| Step                                              | Status | Notes                                                 |
| ------------------------------------------------- | ------ | ----------------------------------------------------- |
| AI-1 — Package scaffold                           | [ ]    | `openrouter.ts`, `schema.ts`, `types.ts`              |
| AI-2 — `enrich-prompt.ts` + `enrich-repo.ts`      | [ ]    | DeepSeek V4 Flash via OpenRouter                      |
| AI-3 — `embed-chunks.ts`                          | [ ]    | Build text chunks from artifacts + enrichment payload |
| AI-4 — Move logic out of `apps/site/enrich-ai.ts` | [ ]    | Site keeps DB orchestration only                      |

---

## Pipeline — site workflow

| Step                                               | Status | Notes                                                        |
| -------------------------------------------------- | ------ | ------------------------------------------------------------ |
| WF-1 — `spelunk-repo.ts` step                      | [ ]    | GitHub → `project_repo_artifacts`, bump `generation`         |
| WF-2 — `enrich-from-artifacts.ts` step             | [ ]    | DB → `@repo/ai` → `project_enrichment_outputs` + suggestions |
| WF-3 — Split workflow steps into thin files        | [ ]    | `steps/spelunk`, `steps/enrich`, `steps/progress`            |
| WF-4 — Remove embedding from workflow              | [ ]    | Drop `indexEmbeddingStep`, `runEmbedding` params             |
| WF-5 — Remove `@kessler/gemma-embedding` from site | [ ]    | Fixes Vercel 250MB function limit                            |
| WF-6 — Update backstage import UI                  | [ ]    | Remove server-side embed option; point to CLI                |

---

## Pipeline — `apps/embed-cli`

| Step                                                    | Status | Notes                             |
| ------------------------------------------------------- | ------ | --------------------------------- |
| CLI-1 — Package scaffold + commander entry              | [ ]    |                                   |
| CLI-2 — `auth-guard.ts` (Better Auth session / API key) | [ ]    | Uses `@repo/auth/cli-credentials` |
| CLI-3 — `embed-one.ts` + version skip logic             | [ ]    | Gemma local only here             |
| CLI-4 — `embed pending` / `embed all` commands          | [ ]    |                                   |
| CLI-5 — README / usage docs                             | [ ]    |                                   |

---

## Cleanup

| Step                                                                               | Status | Notes                                |
| ---------------------------------------------------------------------------------- | ------ | ------------------------------------ |
| Clean-1 — Delete `index-repo-embedding.ts`, `gemma-embedding-service.ts` from site | [ ]    | After CLI exists                     |
| Clean-2 — Trim `@repo/isomorphic` stale org roles                                  | [ ]    | Kitchen/cuisine leftovers from dishi |
| Clean-3 — Remove `admin_login_challenges` schema                                   | [ ]    | See Auth-12                          |

---

## Current focus

**Next recommended step:** `DB-1` through `DB-4` (artifact + enrichment output tables), then `GitHub-1` spelunk parsers — can run in parallel with **Auth-10** (API key UI) if needed.
