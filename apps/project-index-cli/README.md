# tigawanna-index

Local CLI for indexing GitHub repositories — extract README and package manifests (including monorepo workspaces), infer missing metadata with OpenRouter, embed sources with EmbeddingGemma, and persist vectors to Turso.

## Requirements

- [Node.js](https://nodejs.org) 20+
- [pnpm](https://pnpm.io)
- Environment variables from `apps/site/.env` (or a root `.env`)

The CLI is bundled with **tsdown** and type-checked with **tsgo** (`@typescript/native-preview`).

## Environment

The CLI loads the first env file it finds:

1. `./.env` (monorepo root)
2. `./apps/site/.env`
3. `../site/.env` (when run from this directory)

| Variable | Required | Purpose |
| --- | --- | --- |
| `GH_PAT` | Yes | GitHub API access (`GITHUB_TOKEN` / `GH_TOKEN` also accepted) |
| `DATABASE_URL` | Yes | Turso / LibSQL connection string |
| `DATABASE_AUTH_TOKEN` | For remote Turso | Auth token for hosted Turso |
| `OPENROUTER_API_KEY` | When inferring metadata | LLM calls for missing description or tags |
| `OPENROUTER_MODEL` | No | Defaults to `deepseek/deepseek-v4-flash` |
| `GEMMA_MODEL_PATH` | No | Local EmbeddingGemma model path (otherwise downloads from HuggingFace) |

## Quick start

From the monorepo root:

```bash
pnpm install
pnpm index run --count 5
```

From `apps/project-index-cli`:

```bash
pnpm index run --count 5
```

Process a single repo:

```bash
pnpm index run --repo tigawanna/tigawanna
```

Dry-run (extract + log only, no DB writes, no embeddings):

```bash
pnpm index run --count 3 --dry-run --skip-embed --skip-llm
```

## What it does

For each repository:

1. **Fetch** from GitHub (recent public repos, or specific `--repo` names)
2. **Skip** if embeddings, description, and tags already exist (unless `--force`)
3. **Extract** README, root `package.json`, and nested manifests under `apps/`, `packages/`, `libs/`, `tools/`
4. **Infer** missing description or tags via OpenRouter (max 6 tags), using README + package data
5. **Embed** readme, each package manifest, tags, and a summary vector with EmbeddingGemma
6. **Persist** to the `project_embeddings` table in Turso

Optional: push inferred metadata to GitHub with `--apply-github`.

## Commands

Run from the monorepo root with `pnpm index run …`, or from this directory with `pnpm index run …`.

| Command | Description |
| --- | --- |
| `run` | Index repositories (main command) |

### `run` options

| Flag | Default | Description |
| --- | --- | --- |
| `--limit <n>` | `100` | Fetch this many recent public repos from GitHub (1–100) |
| `--count <n>` | all fetched | Process only the first N repos from the candidate list |
| `--repo <owner/name>` | — | Target specific repos (repeatable) |
| `--force` | off | Re-process even when embeddings + metadata already exist |
| `--apply-github` | off | Write inferred description and tags to GitHub |
| `--dry-run` | off | Extract and log without saving to the database |
| `--skip-llm` | off | Skip OpenRouter even when description or tags are missing |
| `--skip-embed` | off | Skip Gemma embedding (useful for testing extraction / LLM) |

## Examples

```bash
# Index first 5 of your 100 most recent repos
pnpm index run --count 5

# Full batch of 100
pnpm index run --limit 100

# Specific repos
pnpm index run --repo tigawanna/tigawanna --repo tigawanna/voyeur

# Re-index one repo from scratch
pnpm index run --repo tigawanna/tigawanna --force

# Infer metadata and push to GitHub
pnpm index run --count 10 --apply-github

# Test extraction without LLM or embeddings
pnpm index run --count 3 --dry-run --skip-embed --skip-llm

# Test LLM inference only (no embed, no save)
pnpm index run --repo owner/repo --dry-run --skip-embed
```

## Console output

Logs use prefixed tags so you can follow progress:

| Prefix | Meaning |
| --- | --- |
| `[config]` | Active CLI flags |
| `[env]` | Loaded env file, database host, models |
| `[db]` | Turso connect / read / write |
| `[github]` | GraphQL and REST fetches |
| `[run]` | Queued repo list |
| `[repo]` | Per-repo progress (`1/N`) |
| `[check]` | Skip logic and GitHub metadata state |
| `[extract]` | Git tree, README, package.json discovery |
| `[llm]` | OpenRouter inference |
| `[embed]` | Gemma model load and per-source embeddings |
| `[summary]` | Final processed / skipped / failed counts |

## Development

From this directory:

```bash
pnpm build
pnpm check-types
pnpm index run --count 1 --dry-run --skip-embed
```

From the monorepo root:

```bash
pnpm index run --count 5
pnpm index:build
```

The binary name is `tigawanna-index` (`bin` → `dist/index.mjs` after `pnpm build`).

Root shortcut: `"index": "pnpm --filter project-index-cli index"` in the monorepo `package.json`.
