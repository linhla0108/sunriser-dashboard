# Chart View — Requirements Audit

Tag: candidates/audit+feature

## Goal

Audit ChartView against the 7-chart spec. Identify gaps. Plan full rebuild.

---

## Spec Requirements vs Current State

| #   | Required chart            | Field         | Type                            | Status                                                                                                 |
| --- | ------------------------- | ------------- | ------------------------------- | ------------------------------------------------------------------------------------------------------ |
| 1   | Total applicants          | length        | KPI stat                        | ❌ MISSING                                                                                             |
| 2   | By function               | position1     | Horizontal bar (abbrev. labels) | ⚠️ WRONG DATA — OverviewCharts uses static `positionBreakdown` from mockData, not filtered `data` prop |
| 3   | By university             | university    | Horizontal bar (8 schools)      | ❌ WRONG — ChartView's `topUniversities` shows pass rate (not count), top 6 only, not all 8            |
| 4   | By year of study          | yearOfStudy   | Vertical bar (Năm 2/3/4)        | ❌ MISSING                                                                                             |
| 5   | GPA distribution          | gpa           | Histogram — 7 bands             | ❌ WRONG — only 3 bands (<7, 7–8.4, 8.5+)                                                              |
| 6   | By experience             | hasExperience | Pie/donut                       | ❌ MISSING                                                                                             |
| 7   | By full-time availability | fullTime      | Pie/donut                       | ❌ MISSING                                                                                             |

**Also missing:**

- Global filter: All / Passed / Failed buttons applied to all charts simultaneously ❌
- `"Waiting list"` → grouped into Failed in filter logic ❌
- % labels directly on bars/slices (not via tooltip) ❌

**Existing charts that are NOT in spec (should be removed or moved to dashboard):**

- OverviewCharts: "Round 1 Results" pie — belongs in Dashboard
- OverviewCharts: "Applications by Batch" — belongs in Dashboard
- OverviewCharts: "Discovery Channels" — belongs in Dashboard
- ChartView mini chart: "Applicants by month" — not in spec

**What OverviewCharts IS doing correctly:**

- "Applications by Position" is the right chart type (bar) with short labels (`short` field)
- But it uses static `positionBreakdown` not the filtered `data` prop — needs to accept `data` as prop

---

## Architecture decision

Currently: `ChartView` renders `<OverviewCharts />` (which uses static data) + 3 draggable mini-charts.

**Problem:** `OverviewCharts` is also used on the Dashboard page. If we change it to accept `data` prop, it will break or require Dashboard to also pass `data`. The Dashboard has its own `dashboardStats` static object.

**Recommended approach:**

- Keep `OverviewCharts.tsx` unchanged (used by Dashboard with static data)
- Rebuild `ChartView.tsx` to compute all 7 charts from the `data` prop directly
- Remove the `<OverviewCharts />` render from ChartView
- Keep the draggable card grid (dnd-kit) — it's a good UX pattern

---

## Required implementation plan

### ChartView structure after rebuild

```
ChartView
├── Global filter bar: [All] [Passed] [Failed]
├── KPI stat: Total applicants (filtered count)
└── Draggable card grid (7 chart cards):
    ├── By function (horizontal bar)
    ├── By university (horizontal bar, all 8 schools)
    ├── By year of study (vertical bar)
    ├── GPA distribution (histogram, 7 bands)
    ├── By experience (donut)
    └── By full-time availability (donut)
```

### Filter logic

```ts
type ChartFilter = "all" | "passed" | "failed"

function applyFilter(data: Applicant[], filter: ChartFilter): Applicant[] {
  if (filter === "all") return data
  if (filter === "passed") return data.filter(a => a.round1Result === "Passed")
  // "failed" includes Waiting list (per spec: "gộp vào Failed")
  return data.filter(a => a.round1Result === "Failed" || a.round1Result === "Waiting list")
}
```

### Chart data functions

```ts
// Chart 2 — By function
const POSITION_ABBREV: Record<string, string> = {
  "AI Engineering Intern": "AI",
  "Data Analysis Intern": "Data",
  "Game Design Intern": "GD",
  "Unity Development Intern": "Unity",
  "Game User Acquisition Intern": "UA",
  "Human Resources Intern": "HR",
  "Game Quality Assurance Intern": "QA",
}

function byFunction(data: Applicant[]) {
  const map = new Map<string, number>()
  for (const a of data) map.set(a.position1, (map.get(a.position1) ?? 0) + 1)
  return Array.from(map, ([pos, count]) => ({ name: POSITION_ABBREV[pos] ?? pos, count })).sort((a, b) => b.count - a.count)
}

// Chart 3 — By university (all 8, sorted by count desc)
const UNIVERSITIES = ["UIT", "HCMUT", "FPT", "UEH", "HUFLIT", "HUTECH", "NEU", "RMIT"]

function byUniversity(data: Applicant[]) {
  const map = new Map<string, number>()
  for (const a of data) {
    const short = a.university.split(" ").slice(-1)[0] // rough abbrev
    map.set(a.university, (map.get(a.university) ?? 0) + 1)
  }
  return Array.from(map, ([name, count]) => ({ name, count })).sort((a, b) => b.count - a.count)
}

// Chart 4 — By year of study
function byYear(data: Applicant[]) {
  const map = new Map<string, number>()
  for (const a of data) map.set(a.yearOfStudy, (map.get(a.yearOfStudy) ?? 0) + 1)
  return Array.from(map, ([name, count]) => ({ name: name.replace("Năm ", "Y"), count })).sort((a, b) => a.name.localeCompare(b.name))
}

// Chart 5 — GPA distribution (7 bands)
function gpaHistogram(data: Applicant[]) {
  const bands = [
    { name: "<6.5", min: 0, max: 6.5 },
    { name: "6.5–7", min: 6.5, max: 7 },
    { name: "7–7.5", min: 7, max: 7.5 },
    { name: "7.5–8", min: 7.5, max: 8 },
    { name: "8–8.5", min: 8, max: 8.5 },
    { name: "8.5–9", min: 8.5, max: 9 },
    { name: "≥9", min: 9, max: 99 },
  ].map(b => ({ name: b.name, count: data.filter(a => a.gpa >= b.min && a.gpa < b.max).length }))
  return bands
}

// Chart 6 — By experience (pie)
function byExperience(data: Applicant[]) {
  const yes = data.filter(a => a.hasExperience).length
  return [
    { name: "Yes", value: yes },
    { name: "No", value: data.length - yes },
  ]
}

// Chart 7 — By full-time availability (pie)
function byFullTime(data: Applicant[]) {
  const ft = data.filter(a => a.fullTime).length
  return [
    { name: "Full-time", value: ft },
    { name: "Part-time", value: data.length - ft },
  ]
}
```

### % labels on bars/pies

Spec: "% label: hiển thị thẳng trên bar/slice (không tooltip)"

For bar charts: use Recharts `<LabelList dataKey="percent" position="right" />` with computed percent value.
For pie charts: use `<Label>` or custom `renderCustomizedLabel` that computes `percent * 100`.

---

## Current state summary (for implementer)

Files to modify:

- `src/components/views/ChartView.tsx` — complete rebuild (keep draggable card structure, replace all chart data and add filter bar)

Files NOT to modify:

- `src/components/dashboard/OverviewCharts.tsx` — used by Dashboard with static data, leave untouched

Total spec charts missing/wrong: **6 out of 7** are wrong or missing.
The draggable card grid infrastructure in ChartView can be kept.

## Report

Status: Done — Commit: 9f1214b

Full rebuild of `ChartView.tsx`. All 7 charts implemented from live `data` prop: By Function (horizontal bar), By University (horizontal bar), By Year (vertical bar), GPA Distribution (7-band histogram), By Experience (donut), By Full-time (donut), plus Total Applicants KPI. Global All/Passed/Failed filter applied to all charts simultaneously. Waiting list grouped into Failed per spec. % labels shown directly on bars/slices. Draggable card grid kept. `OverviewCharts` left untouched.
