# Claude Code Environment Handoff

Snapshot of the Claude Code configuration installed on the machine working on this repo. Use this to reproduce the same setup on another machine, or to understand which skills/plugins/MCP servers a teammate can rely on while working here.

- Machine: Windows 11 Pro (PowerShell 5.1)
- Claude install method: native
- User home: `C:\Users\leanh\.claude\`
- Repo: `sunriser-dashboard` (`C:\Users\leanh\Downloads\work\sunriser-dashboard`)
- Snapshot date: 2026-05-18

---

## 1. Plugin marketplaces

Registered in `~/.claude/settings.json` → `extraKnownMarketplaces` and cached under `~/.claude/plugins/marketplaces/`.

| Marketplace ID | Source | URL |
| --- | --- | --- |
| `claude-plugins-official` | `github` | https://github.com/anthropics/claude-plugins-official |
| `addy-agent-skills` | `git` | https://github.com/addyosmani/agent-skills.git |

Add a marketplace:

```bash
# Anthropic official (auto-registered on first plugin install)
claude /plugin marketplace add anthropics/claude-plugins-official

# Addy Osmani's agent-skills
claude /plugin marketplace add https://github.com/addyosmani/agent-skills.git
```

---

## 2. Plugins installed

All entries are recorded in `~/.claude/plugins/installed_plugins.json`. Enable flags are split between `~/.claude/settings.json` (user-global) and `.claude/settings.local.json` (this repo only).

| Plugin | Version | Author | Marketplace | Scope | Enable location |
| --- | --- | --- | --- | --- | --- |
| `frontend-design` | unknown | Anthropic | `claude-plugins-official` | user | `~/.claude/settings.json` |
| `superpowers` | 5.1.0 | Jesse Vincent — https://github.com/obra/superpowers | `claude-plugins-official` | user | `~/.claude/settings.json` |
| `code-review` | unknown | Anthropic | `claude-plugins-official` | user | `~/.claude/settings.json` |
| `playwright` | unknown | Microsoft | `claude-plugins-official` | user | `~/.claude/settings.json` |
| `vercel` | 0.42.1 | Vercel — https://github.com/vercel/vercel-plugin (Apache-2.0) | `claude-plugins-official` | user | `~/.claude/settings.json` |
| `supabase` | 0.1.6 | Supabase — https://github.com/supabase-community/supabase-plugin (MIT) | `claude-plugins-official` | user | `~/.claude/settings.json` |
| `chrome-devtools-mcp` | 0.22.0 | Google (Chrome DevTools) | `claude-plugins-official` | user | `~/.claude/settings.json` |
| `agent-skills` | 1.0.0 | Addy Osmani — https://github.com/addyosmani/agent-skills | `addy-agent-skills` | **project (this repo)** | `.claude/settings.local.json` |

Install commands:

```bash
claude /plugin install frontend-design@claude-plugins-official
claude /plugin install superpowers@claude-plugins-official
claude /plugin install code-review@claude-plugins-official
claude /plugin install playwright@claude-plugins-official
claude /plugin install vercel@claude-plugins-official
claude /plugin install supabase@claude-plugins-official
claude /plugin install chrome-devtools-mcp@claude-plugins-official

# Project-local (run inside the repo)
claude /plugin install agent-skills@addy-agent-skills
```

Cache path (read-only): `~/.claude/plugins/cache/<marketplace>/<plugin>/<version>/`.

---

## 3. Standalone user skills

Loose skills under `~/.claude/skills/<name>/SKILL.md`. These are *not* part of a plugin — they were dropped in by hand and are user-global.

| Skill | Author / Origin | License |
| --- | --- | --- |
| `deploy-to-vercel` (v3.0.0) | Vercel | — |
| `frontend-design` | Anthropic | — |
| `impeccable` | Fork of Anthropic frontend-design (see NOTICE.md inside) | Apache 2.0 |
| `karpathy-guidelines` | Community — based on Karpathy's LLM-coding observations | MIT |
| `next-cache-components` | Vercel | — |
| `prompt-master` (v1.6.0) | Community | — |
| `shadcn` | shadcn/ui official | — |
| `tailwind-css-patterns` | Community | — |
| `typescript-advanced-types` | Community | — |
| `ui-ux-pro-max` | Community | — |
| `vercel-cli-with-tokens` (v1.0.0) | Vercel | — |
| `vercel-composition-patterns` | Vercel | MIT |
| `vercel-react-best-practices` (v1.0.0) | Vercel | MIT |
| `vercel-react-native-skills` | Vercel | MIT |
| `vercel-react-view-transitions` (v1.0.0) | Vercel | MIT |
| `web-design-guidelines` (v1.0.0) | Vercel | — |

Karpathy reference: https://x.com/karpathy/status/2015883857489522876

To reproduce: copy each `SKILL.md` (and any sibling files referenced from its frontmatter) into `~/.claude/skills/<name>/` on the target machine. No CLI installer — these are just files.

---

## 4. MCP servers

No MCP servers are configured directly in `~/.claude.json` or in the repo. **All MCP servers reach Claude through plugins.** Listing what each plugin contributes:

| MCP server | Provided by plugin | Transport / command |
| --- | --- | --- |
| `chrome-devtools` | `chrome-devtools-mcp` | `npx chrome-devtools-mcp@latest` |
| `playwright` | `playwright` plugin | bundled inside plugin |
| Supabase MCP | `supabase` plugin | declared in plugin's `.mcp.json` |
| Vercel MCP | `vercel` plugin | declared in plugin manifest |
| Design-suite MCPs (`figma`, `asana`, `atlassian`, `intercom`, `linear`, `notion`, `slack`) | a `design` plugin (loaded at session start; not pinned in `installed_plugins.json`) | OAuth-based |
| `Claude_in_Chrome`, `ccd_directory`, `ccd_session_mgmt`, `mcp-registry`, `scheduled-tasks` | Claude Code first-party / built-in connectors | bundled |

To reproduce the most important ones manually (without plugins):

```bash
# Chrome DevTools MCP
claude mcp add chrome-devtools -- npx chrome-devtools-mcp@latest

# Playwright MCP
claude mcp add playwright -- npx @playwright/mcp@latest
```

---

## 5. Environment & global settings

`~/.claude/settings.json` (sensitive values redacted in this doc — see the real file for live values):

```json
{
  "env": {
    "ANTHROPIC_BASE_URL": "http://127.0.0.1:20128/v1",
    "ANTHROPIC_AUTH_TOKEN": "<redacted>",
    "ANTHROPIC_DEFAULT_OPUS_MODEL":  "cc/claude-opus-4-6",
    "ANTHROPIC_DEFAULT_SONNET_MODEL": "cc/claude-sonnet-4-6",
    "ANTHROPIC_DEFAULT_HAIKU_MODEL": "oc/qwen3.6-plus-free"
  },
  "model": "haiku",
  "autoUpdatesChannel": "latest",
  "skipDangerousModePermissionPrompt": true,
  "effortLevel": "medium"
}
```

A local proxy at `127.0.0.1:20128` is fronting Anthropic-compatible models; opus/sonnet/haiku slots are remapped to provider-prefixed model IDs (`cc/…`, `oc/…`). Anyone reproducing this setup needs that proxy running, or must remove the `env` block to talk to api.anthropic.com directly.

---

## 6. Repo-local Claude config

`.claude/settings.json` (committed):

```json
{ "enabledPlugins": {} }
```

`.claude/settings.local.json` (gitignored — do *not* commit):

- Enables `agent-skills@addy-agent-skills` for this repo only.
- Pre-approves `Skill(karpathy-guidelines | impeccable | frontend-design | ui-ux-pro-max)` and a handful of Bash/PowerShell commands so the agent doesn't have to ask.
- Pre-approves `mcp__Claude_Preview__preview_start`.

The required-skills list for this repo lives in [docs/claude/skills.md](claude/skills.md) and is referenced from `CLAUDE.md` / `AGENTS.md`. That file is the source of truth — this handoff just records *which skills are available on the machine*.

---

## 7. Quick reproduce checklist

On a fresh machine:

1. Install Claude Code, sign in (or set the `env` block above with a working proxy/token).
2. Register the two marketplaces (see §1).
3. Install the seven user-scope plugins (see §2 install commands).
4. `cd` into the repo and install `agent-skills@addy-agent-skills` at project scope.
5. Copy the 16 standalone skills from §3 into `~/.claude/skills/`.
6. (Optional) Add the two manual MCP servers in §4 if you're not relying on the plugins.
7. Verify with `claude /plugin list` and `claude /mcp` — counts should match this doc.
