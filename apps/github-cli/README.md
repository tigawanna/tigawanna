# tigawanna-gh

Interactive terminal UI for browsing and bulk-managing your GitHub repositories.

## Requirements

- [Bun](https://bun.sh) (runtime used by this package)
- [pnpm](https://pnpm.io) (monorepo package manager)
- A GitHub account with access to the repositories you want to manage

## Quick start

From the monorepo root:

```bash
pnpm install
pnpm gh
```

This opens the interactive repository manager (default command). If you are not signed in, the login screen appears first.

## Commands

Run from the monorepo root with `pnpm gh -- <command>`, or from this directory with `pnpm start -- <command>` / `pnpm dev -- <command>`.

| Command | Description |
| --- | --- |
| `repos` | Open the interactive repository manager (default) |
| `login` | Sign in with a personal access token or device flow |
| `logout` | Remove stored credentials |
| `whoami` | Show the current GitHub user |

### Examples

```bash
pnpm gh
pnpm gh login --token ghp_xxxxxxxx
pnpm gh login --device
pnpm gh whoami
pnpm gh logout
```

## Authentication

Credentials are resolved in this order:

1. `GITHUB_TOKEN` or `GH_TOKEN` environment variable (not persisted)
2. Stored credentials at `~/.config/tigawanna-github/credentials.json`

### Personal access token (recommended)

Create a token at [github.com/settings/tokens](https://github.com/settings/tokens) with these scopes:

- `repo`
- `delete_repo`
- `read:user`

Sign in via CLI:

```bash
pnpm gh login --token ghp_xxxxxxxx
```

Or set an environment variable (useful for CI or one-off sessions):

```bash
export GITHUB_TOKEN=ghp_xxxxxxxx
pnpm gh whoami
```

You can also paste a token in the TUI login screen (option **1**).

### Device flow

For browser-based OAuth without pasting a token:

1. Create a GitHub OAuth App and note its **Client ID**
2. Set `GITHUB_OAUTH_CLIENT_ID` in your environment
3. Run:

```bash
export GITHUB_OAUTH_CLIENT_ID=your_client_id
pnpm gh login --device
```

Or choose option **2** in the TUI login screen.

## Interactive UI

After signing in, you see all repositories you own, collaborate on, or access via organization membership, sorted by last update.

### Navigation and selection

| Key | Action |
| --- | --- |
| `↑` / `↓` or `j` / `k` | Move cursor |
| `Space` | Toggle selection on current repo |
| `a` | Select all |
| `c` | Clear selection |
| `r` | Refresh repository list |

### Bulk actions

Select one or more repositories, then:

| Key | Action |
| --- | --- |
| `p` | Make selected repos private |
| `o` | Make selected repos public |
| `d` | Delete selected repos |

Destructive actions show a confirmation prompt. Press `y` to confirm or `n` / `Esc` to cancel.

### Other

| Key | Action |
| --- | --- |
| `l` | Log out (clears stored credentials) |
| `q` / `Esc` | Quit |

## Development

From this directory:

```bash
pnpm dev              # Run from source (no build)
pnpm build            # Compile to dist/
pnpm start            # Run compiled output
pnpm check-types      # Typecheck
```

From the monorepo root:

```bash
pnpm gh               # Run the CLI
pnpm --filter github-cli dev
pnpm --filter github-cli build
```

The published binary name is `tigawanna-gh` (`apps/github-cli/package.json` → `bin`).
