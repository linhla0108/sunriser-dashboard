# Codex macOS Handoff

File nay la snapshot setup Codex hien tai tren may Windows va huong dan khoi phuc tren macOS. Dua file nay cho Codex tren may Mac doc truoc khi lam viec trong repo.

## Repo

- Repo: `https://github.com/linhla0108/sunriser-dashboard`
- Branch dang dung: `main`
- Local Windows path hien tai: `C:\Users\leanh\Downloads\work\sunriser-dashboard`
- Plugin team da duoc vendor vao repo tai: `agent-skills/`
- Nested Git trong `agent-skills/` da duoc xoa. Day la thu muc binh thuong trong repo chinh, khong con remote cua owner goc.

## Viec Da Lam Cho Plugin

- Them manifest Codex: `agent-skills/.codex-plugin/plugin.json`
- Them marketplace repo-local: `.agents/plugins/marketplace.json`
- Bo ignore `agent-skills/` trong `.gitignore`
- Doi metadata cua plugin sang Sunriser Team va repo `linhla0108/sunriser-dashboard`
- Push commit len `main`: `c1db73e Vendor agent skills plugin`

## Cau Hinh Codex Hien Tai

Model:

```toml
model = "gpt-5.5"
model_reasoning_effort = "medium"
```

Marketplaces dang co tren Windows:

```toml
[marketplaces.openai-primary-runtime]
source_type = "local"
source = "\\\\?\\C:\\Users\\leanh\\.cache\\codex-runtimes\\codex-primary-runtime\\plugins\\openai-primary-runtime"

[marketplaces.claude-plugins-official]
source_type = "git"
source = "https://github.com/anthropics/claude-plugins-official.git"

[marketplaces.openai-bundled]
source_type = "local"
source = "\\\\?\\C:\\Users\\leanh\\.codex\\.tmp\\bundled-marketplaces\\openai-bundled"

[marketplaces.sunriser-dashboard]
source_type = "local"
source = "\\\\?\\C:\\Users\\leanh\\Downloads\\work\\sunriser-dashboard"
```

Plugin enable/disable hien tai:

```toml
[plugins."documents@openai-primary-runtime"]
enabled = true

[plugins."presentations@openai-primary-runtime"]
enabled = true

[plugins."spreadsheets@openai-primary-runtime"]
enabled = false

[plugins."code-review@claude-plugins-official"]
enabled = true

[plugins."frontend-design@claude-plugins-official"]
enabled = true

[plugins."playwright@claude-plugins-official"]
enabled = true

[plugins."supabase@claude-plugins-official"]
enabled = true

[plugins."superpowers@claude-plugins-official"]
enabled = true

[plugins."vercel@claude-plugins-official"]
enabled = true

[plugins."vercel@openai-curated"]
enabled = true

[plugins."agent-skills@sunriser-dashboard"]
enabled = true

[plugins."browser@openai-bundled"]
enabled = true

[plugins."chrome@openai-bundled"]
enabled = true
```

Project trust hien tai:

```toml
[projects.'c:\users\leanh\downloads\work\sunriser-dashboard']
trust_level = "trusted"
```

Features hien tai:

```toml
[features]
memories = true

[memories]
generate_memories = true
use_memories = true
disable_on_external_context = true
```

Local shell env hien tai co Anthropic-compatible proxy settings, nhung khong copy secret vao repo. Neu can dung lai tren Mac, hay tu cau hinh lai token rieng trong `~/.codex/config.toml` hoac shell env cua Mac:

```toml
[shell_environment_policy]
inherit = "core"

[shell_environment_policy.set]
ANTHROPIC_AUTH_TOKEN = "<REDACTED>"
ANTHROPIC_BASE_URL = "http://127.0.0.1:20128/v1"
ANTHROPIC_DEFAULT_HAIKU_MODEL = "oc/qwen3.6-plus-free"
ANTHROPIC_DEFAULT_OPUS_MODEL = "cc/claude-opus-4-6"
ANTHROPIC_DEFAULT_SONNET_MODEL = "cc/claude-sonnet-4-6"
```

## Cau Hinh Can Them Tren macOS

Sau khi clone repo tren Mac, them cac block sau vao `~/.codex/config.toml`. Thay `/Users/<you>/work/sunriser-dashboard` bang path repo that tren Mac.

```toml
model = "gpt-5.5"
model_reasoning_effort = "medium"

[marketplaces.sunriser-dashboard]
source_type = "local"
source = "/Users/<you>/work/sunriser-dashboard"

[plugins."agent-skills@sunriser-dashboard"]
enabled = true

[projects."/Users/<you>/work/sunriser-dashboard"]
trust_level = "trusted"
```

Sau khi sua config, restart Codex de plugin/skills duoc load lai.

Khong copy nguyen file config Windows sang Mac vi path Windows va secret khong dung tren macOS.

## Repo-local Marketplace

File `.agents/plugins/marketplace.json` trong repo hien dang khai bao:

```json
{
  "name": "sunriser-dashboard",
  "interface": {
    "displayName": "Sunriser Dashboard"
  },
  "plugins": [
    {
      "name": "agent-skills",
      "source": {
        "source": "local",
        "path": "./agent-skills"
      },
      "policy": {
        "installation": "AVAILABLE",
        "authentication": "ON_INSTALL"
      },
      "category": "Engineering"
    }
  ]
}
```

## Agent Skills Plugin

Manifest Codex nam tai `agent-skills/.codex-plugin/plugin.json`.

Thong tin chinh:

- Name: `agent-skills`
- Version: `1.0.0`
- Developer: `Sunriser Team`
- Skills path: `./skills/`
- Category: `Engineering`
- Capabilities: `Read`, `Write`
- Brand color: `#FF5533`

Skills trong plugin `agent-skills`:

| Skill | File |
| --- | --- |
| api-and-interface-design | `agent-skills/skills/api-and-interface-design/SKILL.md` |
| browser-testing-with-devtools | `agent-skills/skills/browser-testing-with-devtools/SKILL.md` |
| ci-cd-and-automation | `agent-skills/skills/ci-cd-and-automation/SKILL.md` |
| code-review-and-quality | `agent-skills/skills/code-review-and-quality/SKILL.md` |
| code-simplification | `agent-skills/skills/code-simplification/SKILL.md` |
| context-engineering | `agent-skills/skills/context-engineering/SKILL.md` |
| debugging-and-error-recovery | `agent-skills/skills/debugging-and-error-recovery/SKILL.md` |
| deprecation-and-migration | `agent-skills/skills/deprecation-and-migration/SKILL.md` |
| documentation-and-adrs | `agent-skills/skills/documentation-and-adrs/SKILL.md` |
| doubt-driven-development | `agent-skills/skills/doubt-driven-development/SKILL.md` |
| frontend-ui-engineering | `agent-skills/skills/frontend-ui-engineering/SKILL.md` |
| git-workflow-and-versioning | `agent-skills/skills/git-workflow-and-versioning/SKILL.md` |
| idea-refine | `agent-skills/skills/idea-refine/SKILL.md` |
| incremental-implementation | `agent-skills/skills/incremental-implementation/SKILL.md` |
| interview-me | `agent-skills/skills/interview-me/SKILL.md` |
| performance-optimization | `agent-skills/skills/performance-optimization/SKILL.md` |
| planning-and-task-breakdown | `agent-skills/skills/planning-and-task-breakdown/SKILL.md` |
| security-and-hardening | `agent-skills/skills/security-and-hardening/SKILL.md` |
| shipping-and-launch | `agent-skills/skills/shipping-and-launch/SKILL.md` |
| source-driven-development | `agent-skills/skills/source-driven-development/SKILL.md` |
| spec-driven-development | `agent-skills/skills/spec-driven-development/SKILL.md` |
| test-driven-development | `agent-skills/skills/test-driven-development/SKILL.md` |
| using-agent-skills | `agent-skills/skills/using-agent-skills/SKILL.md` |

Plugin nay cung co commands/agent files cho Claude/Gemini/OpenCode, nhung voi Codex phan quan trong nhat la `.codex-plugin/plugin.json` va `skills/`.

## Active Project Skills And Workflows

Trong project nay, khi user go slash-style names, Codex nen map sang cac skill/workflow sau. Day la tap dang duoc dung gan day cho Sunriser Dashboard:

| Requested name | Where it comes from | Codex action |
| --- | --- | --- |
| `/karpathy-guidelines` | Standalone skill in `~/.agents/skills/karpathy-guidelines` | Use before writing/reviewing/refactoring code; keep changes surgical and verifiable |
| `/frontend-design` | Standalone skill in `~/.agents/skills/frontend-design` and also official plugin skill | Use for UI/page/component work |
| `/ui-ux-pro-max` | Standalone skill in `~/.agents/skills/ui-ux-pro-max` | Use for UX, accessibility, responsive behavior, interaction quality |
| `/impeccable` | Standalone skill in `~/.agents/skills/impeccable` | Use for frontend polish, design critique, product UI refinement |
| `/tailwind-css-patterns` | Standalone skill in `~/.agents/skills/tailwind-css-patterns` | Use for Tailwind v4 layout/styling/token work |
| `/performance-optimization` | Repo-local `agent-skills/skills/performance-optimization` unless installed globally | Use for charts, tables, render cost, bundle/load/Core Web Vitals work |
| `/agent-skills:build` | Claude slash workflow at `agent-skills/.claude/commands/build.md` | Treat as a Codex workflow: use `incremental-implementation`, `test-driven-development`, and `frontend-ui-engineering` |
| `/agent-skills:code-simplify` | Claude slash workflow at `agent-skills/.claude/commands/code-simplify.md` | Treat as a Codex workflow: use `code-simplification`, preserve behavior, verify after each simplification |
| `/agent-skills:review` | Claude slash workflow at `agent-skills/.claude/commands/review.md` | Treat as a Codex workflow: use `code-review-and-quality`; lead with findings and risks |

Important: `/agent-skills:build`, `/agent-skills:code-simplify`, and `/agent-skills:review` are Claude-style command files in this repo, not separate Codex plugin tools. On Codex, use them as named workflows and invoke the mapped skills.

Standalone skills found on the current Windows machine under `C:\Users\leanh\.agents\skills`:

| Skill | Purpose in this project |
| --- | --- |
| `deploy-to-vercel` | Deploy applications and websites to Vercel |
| `karpathy-guidelines` | Minimal, disciplined code changes and explicit verification criteria |
| `frontend-design` | Production-grade UI implementation |
| `impeccable` | UI polish, hierarchy, spacing, micro-interactions, product interface refinement |
| `next-cache-components` | Next.js cache components, PPR, cache tags/life when relevant |
| `prompt-master` | Prompt writing/improvement when explicitly requested |
| `shadcn` | shadcn/ui component management |
| `tailwind-css-patterns` | Tailwind CSS v4 utility and responsive layout patterns |
| `typescript-advanced-types` | TypeScript advanced type-system help |
| `ui-ux-pro-max` | Accessibility, UX patterns, interaction states, responsive behavior |
| `vercel-cli-with-tokens` | Vercel CLI workflows that use token-based auth |
| `vercel-composition-patterns` | React composition patterns for scalable component APIs |
| `vercel-react-best-practices` | React/Next.js performance and architecture guidance |
| `vercel-react-native-skills` | React Native and Expo guidance |
| `vercel-react-view-transitions` | React View Transition API guidance |
| `web-design-guidelines` | UI/accessibility review when explicitly requested |

On macOS, these standalone skills are not guaranteed to sync automatically. If Codex does not list them, copy/install the needed skill folders into `~/.agents/skills` or enable the matching plugin when available. The repo-local `agent-skills` plugin will be available after the marketplace config points at this repo and Codex restarts.

## Repo Instructions Quan Trong

File `AGENTS.md` cua repo yeu cau:

- App la single-page application, chi co URL `/`
- `src/app/page.tsx` giu state `activeView: 'dashboard' | 'table'`
- Upload va chat la overlay, khong phai route/view rieng
- Stack chinh: Next.js, Tailwind CSS v4, shadcn/ui, Recharts, dnd-kit, lucide-react
- Tailwind v4 khong co `tailwind.config.js`; theme tokens nam trong `src/app/globals.css`

File `docs/claude/skills.md` yeu cau truoc cac task feature/fix/refactor/UI:

- `karpathy-guidelines`
- `impeccable`
- `frontend-design`
- `ui-ux-pro-max`
- `tailwind-css-patterns`
- `performance-optimization`

Neu cac skills nay co trong Codex session moi, hay dung chung voi repo instructions. Neu khong co, Codex nen doc file docs nay va ap dung noi dung tuong duong. Rieng `performance-optimization` co san trong `agent-skills` plugin.

## Installed/Enabled Plugin Groups Hien Tai

Tren Windows hien co cac plugin groups quan trong:

- `openai-primary-runtime`: Documents, Presentations, Spreadsheets disabled
- `openai-bundled`: Browser, Chrome
- `claude-plugins-official`: code-review, frontend-design, playwright, supabase, superpowers, vercel
- `openai-curated`: vercel
- `sunriser-dashboard`: agent-skills

Neu tren Mac chua co cac marketplace/plugin official, install/enable lai trong Codex UI hoac bang co che plugin cua Codex. Rieng `agent-skills` la repo-local, chi can clone repo va them marketplace local nhu tren.

## Workflow Goi Y Cho Codex Tren Mac

1. Clone repo:

```bash
git clone https://github.com/linhla0108/sunriser-dashboard.git
cd sunriser-dashboard
```

2. Cap nhat `~/.codex/config.toml` voi marketplace local:

```toml
[marketplaces.sunriser-dashboard]
source_type = "local"
source = "/Users/<you>/work/sunriser-dashboard"

[plugins."agent-skills@sunriser-dashboard"]
enabled = true

[projects."/Users/<you>/work/sunriser-dashboard"]
trust_level = "trusted"
```

3. Restart Codex.

4. Mo repo va yeu cau Codex doc:

```text
Read CODEX_MACOS_HANDOFF.md, AGENTS.md, docs/claude/skills.md, then inspect available skills/plugins.
Map slash-style requests like /karpathy-guidelines, /frontend-design, /ui-ux-pro-max, /impeccable, /performance-optimization, /tailwind-css-patterns, /agent-skills:build, /agent-skills:code-simplify, and /agent-skills:review to the skills/workflows documented in the handoff.
```

5. Kiem tra plugin da load:

- Trong danh sach skills phai thay cac skill tu `agent-skills`, vi du `agent-skills:using-agent-skills` hoac cac skill trong `agent-skills/skills`.
- Neu chua thay, kiem tra lai path `source` trong `~/.codex/config.toml`, restart Codex, va dam bao `.codex-plugin/plugin.json` ton tai.

## Bao Mat

- Khong commit `~/.codex/config.toml`
- Khong commit token/API key
- Khong copy Windows path sang Mac
- Khong push `.codex/`, `.cache/`, `node_modules/`, `.next/`
