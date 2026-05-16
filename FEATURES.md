# SUN.RISER 2026 Dashboard — Feature Docs

> Single-page application. One URL (`/`). Sidebar switches views via React state — no routing.

---

## Architecture

```
page.tsx (client component)
├── Sidebar          — view switcher, holds activeView state
└── main content
    ├── [dashboard]  OverviewCharts + StatsCards
    ├── [table]      ApplicantTable (dnd-kit + filters)
    ├── [upload]     UploadZone (xlsx/csv/json/tsv parser)
    └── [chat]       ChatBox (mock AI interface)
```

**State flow:** `activeView: View` lives in `page.tsx`. Sidebar receives `onViewChange` callback. Upload's "Analyze" button calls `onViewChange('table')`.

---

## Feature 1 — Dashboard Overview

### Description

Landing view. Shows key recruitment KPIs as stat cards and 4 Recharts charts visualising applicant distribution.

### Stat Cards

| Card             | Value                                | Source   |
| ---------------- | ------------------------------------ | -------- |
| Total Applicants | 646                                  | mockData |
| Passed Round 1   | count of `round1Result === 'Passed'` | mockData |
| Pass Rate        | `passed / total * 100`               | computed |
| Average GPA      | mean GPA of all applicants           | computed |

### Charts

| Chart                    | Type           | Data                                     |
| ------------------------ | -------------- | ---------------------------------------- |
| Applications by Position | Vertical Bar   | Count per `position1`                    |
| Round 1 Results          | Pie            | Passed / Failed / Waiting list           |
| Applications by Batch    | Vertical Bar   | Batch 1: 119, Batch 2: 343, Batch 3: 182 |
| Discovery Channel        | Horizontal Bar | Count per `discoveryChannel`             |

### Flow

1. App loads → `activeView = 'dashboard'`
2. Stat cards render with `dashboardStats` from `mockData.ts`
3. Charts hydrate client-side via `'use client'` on `OverviewCharts`
4. All data is static mock — no network calls

### Test Cases

| #      | Scenario                           | Expected                                               |
| ------ | ---------------------------------- | ------------------------------------------------------ |
| TC-D01 | Page loads for first time          | Dashboard view is active, all 4 stat cards visible     |
| TC-D02 | Switch away then back to Dashboard | State is preserved, charts re-render correctly         |
| TC-D03 | Viewport < 1280px                  | Grid collapses gracefully, charts remain readable      |
| TC-D04 | Viewport very narrow (< 640px)     | 4-col grid falls back to 2-col or 1-col                |
| TC-D05 | Chart container has no data        | Empty chart renders without crash (no division errors) |
| TC-D06 | `avgGpa` is NaN (all GPA = 0)      | Display shows `0.0`, not `NaN`                         |
| TC-D07 | `passRate` denominator is 0        | Shows `0%`, no division-by-zero crash                  |

---

## Feature 2 — Applicants Table

### Description

Full data table of all applicants with: global search, 3 filter dropdowns, sortable column headers, and drag-to-reorder rows via `@dnd-kit/sortable`.

### Columns

`#` · Name · Position 1 · University · GPA · Year · Batch · PIC · Round 1 · Round 2 · Actions

### Controls

| Control             | Behavior                                                                 |
| ------------------- | ------------------------------------------------------------------------ |
| Search input        | Filters by `name`, `email`, `position1`, `university` (case-insensitive) |
| Position filter     | Exact match on `position1`                                               |
| Batch filter        | Exact match on `batch` (1 / 2 / 3)                                       |
| Round 1 filter      | Exact match on `round1Result` (Passed / Failed / Waiting list)           |
| Column header click | Toggles asc/desc sort on `name`, `gpa`, `batch`, `university`            |
| Drag handle (⠿)     | Reorders rows in local state via DnD                                     |

### Row color coding

- `round1Result === 'Passed'` → `bg-green-50`
- `round1Result === 'Failed'` → default (muted text)
- `round1Result === 'Waiting list'` → `bg-amber-50`

### Flow

1. `ApplicantTable` receives `data: Applicant[]` as prop
2. `items` state is initialised from `data`
3. `filtered` is computed via `useMemo` from `items + search + filters + sort`
4. DnD reorders `items` state; filtered view updates accordingly
5. "N of M records" counter updates in real time

### Test Cases

| #      | Scenario                                             | Expected                                                                            |
| ------ | ---------------------------------------------------- | ----------------------------------------------------------------------------------- |
| TC-T01 | Search "Nguyễn"                                      | Only rows where name/email/position/university contains "nguyễn" (case-insensitive) |
| TC-T02 | Search with Vietnamese diacritics                    | Matches correctly (e.g. "nguyễn" matches "Nguyễn")                                  |
| TC-T03 | Search returns 0 results                             | Empty state message "No applicants match your filters" shown                        |
| TC-T04 | Filter: Position = "Data Analysis Intern"            | Only Data Analysis rows visible                                                     |
| TC-T05 | Filter: Batch 2 + Position "AI Engineering" combined | Intersection of both filters applied                                                |
| TC-T06 | Clear all filters                                    | All rows reappear                                                                   |
| TC-T07 | Sort by GPA asc                                      | Lowest GPA row at top                                                               |
| TC-T08 | Sort by GPA desc                                     | Highest GPA row at top                                                              |
| TC-T09 | Sort by Name                                         | Alphabetical Vietnamese sort                                                        |
| TC-T10 | Click same sort column twice                         | Toggles asc → desc → asc                                                            |
| TC-T11 | Drag row 1 to position 3                             | Rows 2 and 3 shift up, order persists in state                                      |
| TC-T12 | Drag while search filter active                      | Only filtered rows are reordered; non-visible rows unaffected                       |
| TC-T13 | DnD drag cancelled (ESC / pointer released outside)  | Order unchanged                                                                     |
| TC-T14 | All applicants have `round1Result = undefined`       | Row has no color tint, renders without crash                                        |
| TC-T15 | GPA value is 0                                       | Displayed as `0.0`, sorted correctly at bottom of asc                               |
| TC-T16 | Table with 0 rows (empty dataset)                    | Empty state shown, no JS error                                                      |
| TC-T17 | Very long name (> 40 chars)                          | Name truncates with ellipsis, no layout break                                       |
| TC-T18 | Very long university name                            | Same truncation behavior                                                            |
| TC-T19 | Record count label ("N of M records")                | Reflects filtered count after every filter/search change                            |

---

## Feature 3 — Upload Zone

### Description

Drag-and-drop file upload that parses the uploaded file client-side, shows a column preview, then optionally navigates to the Table view.

### Supported formats

`.xlsx`, `.xls`, `.csv`, `.tsv`, `.json`

### Parsing logic

| Format           | Library              | Strategy                                                 |
| ---------------- | -------------------- | -------------------------------------------------------- |
| `.xlsx` / `.xls` | `xlsx` (SheetJS)     | Read first sheet → `sheet_to_json` with `header:1`       |
| `.csv`           | Native `TextDecoder` | Split by `\n`, first row = headers, delimiter = `,`      |
| `.tsv`           | Native `TextDecoder` | Same as CSV but delimiter = `\t`                         |
| `.json`          | Native `JSON.parse`  | Expect array of objects; `Object.keys(arr[0])` = columns |

### Flow

1. User drops file OR clicks drop zone → file picker opens
2. `parseFile()` reads `ArrayBuffer` → detects extension
3. Parsing extracts `columns[]` (max 20 shown) and `rows` count
4. Success state: shows file name, size, row/col count, column pills
5. Click "Analyze in Table" → calls `onAnalyze()` → parent sets `activeView = 'table'`
6. Click "Clear" → resets state back to empty drop zone

### Test Cases

| #      | Scenario                                      | Expected                                                        |
| ------ | --------------------------------------------- | --------------------------------------------------------------- |
| TC-U01 | Drop valid `.xlsx` file                       | Parsed successfully; file name, size, row count, columns shown  |
| TC-U02 | Drop valid `.csv` file                        | Same success result                                             |
| TC-U03 | Drop `.json` array file                       | Columns = top-level keys of first object                        |
| TC-U04 | Drop `.tsv` file                              | Parsed with tab delimiter                                       |
| TC-U05 | Drop unsupported file (`.pdf`)                | Error banner: "Unsupported file type…"                          |
| TC-U06 | Drop `.xlsx` with > 20 columns                | Shows first 20 columns + "+ more..." pill                       |
| TC-U07 | Drop empty `.csv` (headers only, 0 data rows) | Shows 0 rows, columns detected                                  |
| TC-U08 | Drop completely empty file (0 bytes)          | Error banner shown, no crash                                    |
| TC-U09 | Drop malformed JSON                           | Error: "Failed to parse file…"                                  |
| TC-U10 | Drop malformed `.xlsx`                        | Error banner shown                                              |
| TC-U11 | Drop file > 50MB                              | No timeout crash; parsing completes (browser memory permitting) |
| TC-U12 | Click "Analyze in Table"                      | `activeView` switches to `'table'`                              |
| TC-U13 | Click "Clear" after successful parse          | Drop zone resets to initial empty state                         |
| TC-U14 | Drag file over drop zone                      | Border changes to solid `#17191c`, icon inverts to white        |
| TC-U15 | Drag file then drag away without dropping     | Drop zone returns to dashed border style                        |
| TC-U16 | Drop multiple files simultaneously            | Only first file is processed                                    |
| TC-U17 | `.json` file containing object (not array)    | Wrapped in array, keys extracted correctly                      |
| TC-U18 | Column names contain special chars or emoji   | Rendered safely inside pills without layout break               |
| TC-U19 | File input: select file via OS picker         | Same parsing flow as drag & drop                                |

---

## Feature 4 — Chat (Mock UI)

### Description

Mock AI chat interface connected to the recruitment data context. Pre-seeded with realistic Vietnamese/English Q&A pairs. Accepts new messages and returns a static mock reply.

### Layout

- Left panel (240px): "Data Context" — shows connected file badge and quick insight stats
- Right panel: message thread + input bar

### Pre-seeded messages

1. **User:** "Có bao nhiêu ứng viên pass Round 1?"
2. **AI:** Breakdown by position (127 passed, 19.7% rate)
3. **User:** "Show me candidates with GPA > 8.5"
4. **AI:** 89 candidates, by school, avg GPA 8.91

### Mock reply behavior

Any new message typed → triggers a canned response with timestamp after a short delay (simulated thinking).

### Flow

1. ChatBox mounts with 4 pre-seeded messages
2. User types in input → presses Enter or Send button
3. User message appended to thread
4. After 800ms delay → mock AI response appended
5. Thread auto-scrolls to latest message

### Test Cases

| #      | Scenario                                  | Expected                                                |
| ------ | ----------------------------------------- | ------------------------------------------------------- |
| TC-C01 | Chat view opens                           | 4 pre-seeded messages visible, input focused            |
| TC-C02 | Send message via Enter key                | User bubble appears, AI responds after delay            |
| TC-C03 | Send message via Send button              | Same as TC-C02                                          |
| TC-C04 | Send empty message                        | No bubble added, input stays empty                      |
| TC-C05 | Send whitespace-only message              | Treated as empty, not sent                              |
| TC-C06 | Send very long message (> 500 chars)      | Bubble wraps text, no overflow                          |
| TC-C07 | Rapid multiple sends                      | Each message appended in order; replies queue correctly |
| TC-C08 | Thread overflows viewport                 | Container scrolls to bottom automatically               |
| TC-C09 | Switch to another view then back to Chat  | Messages are preserved in component state               |
| TC-C10 | "Connected to: SUN.RISER 2026.xlsx" badge | Visible at top of data context panel                    |
| TC-C11 | Bold markdown in AI reply (`**text**`)    | Rendered as `<strong>`                                  |
| TC-C12 | Message contains newlines                 | Each line rendered as separate `<p>`                    |

---

## Navigation Flow

```
[Load] → activeView = 'dashboard'
         ↕ sidebar button click
     dashboard ←→ table ←→ upload ←→ chat
                              ↓
                       "Analyze in Table"
                              ↓
                           table
```

### Navigation Edge Cases

| #      | Scenario                                           | Expected                                                                     |
| ------ | -------------------------------------------------- | ---------------------------------------------------------------------------- |
| TC-N01 | Click active nav item again                        | No re-render flicker; state unchanged                                        |
| TC-N02 | Browser back button                                | No navigation (SPA — URL never changes)                                      |
| TC-N03 | Direct URL `/`                                     | Loads dashboard view                                                         |
| TC-N04 | Direct URL `/anything-else`                        | Next.js 404 page                                                             |
| TC-N05 | Refresh page                                       | Returns to dashboard (initial state)                                         |
| TC-N06 | Upload → Analyze → navigate away → return to Table | Table shows mock data (uploaded data not persisted across view switches yet) |

---

## Data Model

```typescript
interface Applicant {
  id: string
  name: string // Họ và tên
  dob: string // Ngày sinh
  email: string
  phone: string // SĐT
  position1: string // Nguyện vọng 1
  position2?: string // Nguyện vọng 2
  university: string // Đại học
  yearOfStudy: string // SV năm mấy
  major: string // Chuyên ngành
  gpa: number // GPA / 10
  hasExperience: boolean
  experienceDesc?: string
  portfolio?: string
  fullTime: boolean
  discoveryChannel: string
  submittedAt: string // ISO timestamp
  batch: number // 1 | 2 | 3
  pic?: string // Person In Charge
  round1Result?: 'Passed' | 'Failed' | 'Waiting list'
  round1Notes?: string
  round2Result?: string
}
```

---

## Known Limitations (v2026 mock)

- **Uploaded file data is not passed to the Table view** — Upload parses and previews, but clicking "Analyze" switches view without injecting the parsed rows into the table. Next step: lift parsed data to `page.tsx` state and pass to `ApplicantTable`.
- **Chat replies are static** — No real LLM integration. Replies are hard-coded.
- **No persistence** — All state resets on page refresh.
- **DnD reorder is view-local** — Reordered rows are not stored; refresh resets to original order.
