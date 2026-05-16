> **STATUS: COMPLETED** — Features implemented 2026-05-16. Test cases remain as reference documentation.

# Test Cases: UX Layout Overhaul

> Paired with: `docs/superpowers/specs/2026-05-16-ux-layout-overhaul-design.md`
> Covers: bad UI/UX scenarios, error/success toasts, error states, edge cases, responsive.

---

## How to Use This Document

Each case lists:

- **Trigger** — how to reproduce
- **Expected** — what the user should see/experience
- **Risk** — severity if broken (High / Medium / Low)

Use `data-cid` attributes to locate elements during testing.

---

## 1. GlobalDropZone

### 1.1 Happy Path — Valid XLSX

|              |                                                                                                   |
| ------------ | ------------------------------------------------------------------------------------------------- |
| **Trigger**  | Drag a valid `.xlsx` file anywhere on the Dashboard view                                          |
| **Expected** | Backdrop appears → spinner card briefly → popup opens with filename, row/col counts, column pills |
| **Risk**     | High                                                                                              |

### 1.2 Happy Path — CSV / TSV / JSON

|              |                                                         |
| ------------ | ------------------------------------------------------- |
| **Trigger**  | Drop each file type one at a time                       |
| **Expected** | Correct file icon per type; columns detected; no errors |
| **Risk**     | High                                                    |

### 1.3 Unsupported File Type

|              |                                                                                                  |
| ------------ | ------------------------------------------------------------------------------------------------ |
| **Trigger**  | Drop a `.pdf`, `.png`, or `.docx`                                                                |
| **Expected** | Toast error: "Unsupported file type. Accepted: .xlsx .xls .csv .tsv .json" — popup does NOT open |
| **Risk**     | High                                                                                             |

### 1.4 Corrupt / Unparseable File

|              |                                                                                                        |
| ------------ | ------------------------------------------------------------------------------------------------------ |
| **Trigger**  | Drop a `.xlsx` that is actually renamed garbage bytes                                                  |
| **Expected** | Popup opens in error state: "Failed to parse file. Please check it is valid and try again." — no crash |
| **Risk**     | High                                                                                                   |

### 1.5 Empty File (0 Rows)

|              |                                                                                                                          |
| ------------ | ------------------------------------------------------------------------------------------------------------------------ |
| **Trigger**  | Drop a `.csv` with only a header row and no data rows                                                                    |
| **Expected** | Popup shows "0 rows". Warning toast or inline warning: "File has no data rows." Analyze button disabled or shows warning |
| **Risk**     | Medium                                                                                                                   |

### 1.6 File With No Detectable Columns

|              |                                                                   |
| ------------ | ----------------------------------------------------------------- |
| **Trigger**  | Drop a completely empty `.xlsx` (no header, no data)              |
| **Expected** | Popup error state: "No columns detected." Analyze button disabled |
| **Risk**     | Medium                                                            |

### 1.7 Very Large File (Many Columns)

|              |                                                                                           |
| ------------ | ----------------------------------------------------------------------------------------- |
| **Trigger**  | Drop a file with 50+ columns                                                              |
| **Expected** | First ~10 columns shown; "[+40 more ▸]" button visible and functional; no layout overflow |
| **Risk**     | Medium                                                                                    |

### 1.8 Column Filter — Match Found

|              |                                                                 |
| ------------ | --------------------------------------------------------------- |
| **Trigger**  | Type a partial column name in `data-cid="drop-zone-col-input"`  |
| **Expected** | Non-matching pills dim or hide; matching pills stay highlighted |
| **Risk**     | Medium                                                          |

### 1.9 Column Filter — No Match

|              |                                                                                 |
| ------------ | ------------------------------------------------------------------------------- |
| **Trigger**  | Type a string that matches no column                                            |
| **Expected** | All pills hidden, helpful text: "No columns match. Press [+] to add as custom." |
| **Risk**     | Medium                                                                          |

### 1.10 Adding a Custom Column

|              |                                                                                                    |
| ------------ | -------------------------------------------------------------------------------------------------- |
| **Trigger**  | Type a non-matching name → press [+]                                                               |
| **Expected** | New pill appears with dashed border + primary color (#FF5533). Can be removed with [×] on the pill |
| **Risk**     | Low                                                                                                |

### 1.11 Backdrop Click to Dismiss

|              |                                                  |
| ------------ | ------------------------------------------------ |
| **Trigger**  | Open popup → click the backdrop outside the card |
| **Expected** | Popup + backdrop close. No navigation change     |
| **Risk**     | Medium                                           |

### 1.12 Escape Key to Dismiss

|              |                             |
| ------------ | --------------------------- |
| **Trigger**  | Open popup → press `Escape` |
| **Expected** | Same as backdrop click      |
| **Risk**     | Low                         |

### 1.13 Drop Multiple Files

|              |                                                                                          |
| ------------ | ---------------------------------------------------------------------------------------- |
| **Trigger**  | Drag and drop 3 files at once                                                            |
| **Expected** | Only the first file is processed. Toast info: "Only one file can be analyzed at a time." |
| **Risk**     | Medium                                                                                   |

### 1.14 Drop While Popup Is Already Open

|              |                                                                                                      |
| ------------ | ---------------------------------------------------------------------------------------------------- |
| **Trigger**  | Open popup → drag a second file and drop                                                             |
| **Expected** | Popup updates to show the new file (or prompt: "Replace current file?"). Does not crash or duplicate |
| **Risk**     | Medium                                                                                               |

### 1.15 Drop a Non-File Object (Text / Image URL)

|              |                                                                    |
| ------------ | ------------------------------------------------------------------ |
| **Trigger**  | Drag selected text or an image from a website and drop on the page |
| **Expected** | Silently ignored — no error, no popup, no crash                    |
| **Risk**     | Medium                                                             |

### 1.16 Very Long Filename

|              |                                                                                     |
| ------------ | ----------------------------------------------------------------------------------- |
| **Trigger**  | Drop a file with a 120-character filename                                           |
| **Expected** | Filename truncates with ellipsis in the popup header. Tooltip or full name on hover |
| **Risk**     | Low                                                                                 |

---

## 2. FloatingChat

### 2.1 Open / Close Toggle

|              |                                                                   |
| ------------ | ----------------------------------------------------------------- |
| **Trigger**  | Click `data-cid="chat-trigger"`                                   |
| **Expected** | Panel slides up (150ms). Click again (or [✕]) → panel slides down |
| **Risk**     | High                                                              |

### 2.2 Messages Preserved on Close

|              |                                                                   |
| ------------ | ----------------------------------------------------------------- |
| **Trigger**  | Send a message → close panel → reopen                             |
| **Expected** | Message thread still shows the sent message. Input field is empty |
| **Risk**     | High                                                              |

### 2.3 Send Message

|              |                                                                               |
| ------------ | ----------------------------------------------------------------------------- |
| **Trigger**  | Type in `data-cid="chat-input-bar"` → press Enter                             |
| **Expected** | User bubble appears, AI mock response appears after brief pause. Input clears |
| **Risk**     | High                                                                          |

### 2.4 Send Empty Message

|              |                                                    |
| ------------ | -------------------------------------------------- |
| **Trigger**  | Click Send with empty input                        |
| **Expected** | Nothing happens. Send button stays disabled/grayed |
| **Risk**     | Medium                                             |

### 2.5 Long Message Overflow

|              |                                                                                |
| ------------ | ------------------------------------------------------------------------------ |
| **Trigger**  | Type and send a 500-character message                                          |
| **Expected** | User bubble wraps correctly; no overflow outside panel; message thread scrolls |
| **Risk**     | Medium                                                                         |

### 2.6 Many Messages — Scroll Behavior

|              |                                                                                         |
| ------------ | --------------------------------------------------------------------------------------- |
| **Trigger**  | Send 15+ messages                                                                       |
| **Expected** | Thread scrolls; newest message is always visible (auto-scroll to bottom on new message) |
| **Risk**     | High                                                                                    |

### 2.7 Data Context Panel Toggle

|              |                                                                           |
| ------------ | ------------------------------------------------------------------------- |
| **Trigger**  | Click `data-cid="chat-context-panel"` chevron                             |
| **Expected** | Context section collapses/expands smoothly. Message thread height adjusts |
| **Risk**     | Medium                                                                    |

### 2.8 Suggested Query Click

|              |                                                                    |
| ------------ | ------------------------------------------------------------------ |
| **Trigger**  | Click a suggested query chip in the context panel                  |
| **Expected** | Query text populates the input field. User can edit before sending |
| **Risk**     | Low                                                                |

### 2.9 Shift+Enter in Input

|              |                                                                |
| ------------ | -------------------------------------------------------------- |
| **Trigger**  | Press Shift+Enter in chat input                                |
| **Expected** | Newline inserted, message NOT sent. Input grows to accommodate |
| **Risk**     | Low                                                            |

### 2.10 Chat Panel While Drop Popup is Open

|              |                                                                                                                                                                       |
| ------------ | --------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Trigger**  | Open chat panel → drag a file over the page                                                                                                                           |
| **Expected** | Drop backdrop appears on top of chat panel (z-index: backdrop > chat panel) OR chat panel z-index is above backdrop. Either is acceptable but must not break both UIs |
| **Risk**     | Medium                                                                                                                                                                |

---

## 3. Responsive Layout

### 3.1 Mobile — Bottom Nav Visible

|              |                                                                                                      |
| ------------ | ---------------------------------------------------------------------------------------------------- |
| **Trigger**  | Resize viewport to 375px width                                                                       |
| **Expected** | `data-cid="sidebar"` hidden. `data-cid="mobile-bottom-nav"` visible at bottom with Dashboard + Table |
| **Risk**     | High                                                                                                 |

### 3.2 Mobile — Active Nav Item

|              |                                                                |
| ------------ | -------------------------------------------------------------- |
| **Trigger**  | Tap Dashboard → tap Table                                      |
| **Expected** | Active item shows #FF5533 icon + label. Inactive shows #767676 |
| **Risk**     | Medium                                                         |

### 3.3 Mobile — Stats Grid 2 Columns

|              |                                                             |
| ------------ | ----------------------------------------------------------- |
| **Trigger**  | Navigate to Dashboard on 375px viewport                     |
| **Expected** | 4 StatsCards in 2×2 grid, no overflow, no horizontal scroll |
| **Risk**     | High                                                        |

### 3.4 Mobile — Charts 1 Column

|              |                                                                   |
| ------------ | ----------------------------------------------------------------- |
| **Trigger**  | Dashboard view at 375px                                           |
| **Expected** | 4 charts stacked vertically, each at 160px height, legible labels |
| **Risk**     | High                                                              |

### 3.5 Mobile — Table Horizontal Scroll

|              |                                                                                               |
| ------------ | --------------------------------------------------------------------------------------------- |
| **Trigger**  | Navigate to Table view at 375px                                                               |
| **Expected** | Table scrolls horizontally. Batch/Year/PIC/GPA columns hidden. Name, Position, Round1 visible |
| **Risk**     | High                                                                                          |

### 3.6 Mobile — Chat Full Screen

|              |                                                                |
| ------------ | -------------------------------------------------------------- |
| **Trigger**  | Tap `data-cid="chat-trigger"` on 375px viewport                |
| **Expected** | Chat panel covers entire screen (fixed inset-0). [✕] closes it |
| **Risk**     | High                                                           |

### 3.7 Mobile — Drop Zone Bottom Sheet

|              |                                                                                                    |
| ------------ | -------------------------------------------------------------------------------------------------- |
| **Trigger**  | Drop file on 375px viewport                                                                        |
| **Expected** | Popup appears as bottom sheet (slides up from bottom, rounded top corners, max-h 80vh, scrollable) |
| **Risk**     | High                                                                                               |

### 3.8 Mobile — TopBar Overflow Menu

|              |                                                                                     |
| ------------ | ----------------------------------------------------------------------------------- |
| **Trigger**  | Check TopBar at 375px                                                               |
| **Expected** | Subtitle hidden. "⋮" button visible. Tapping it reveals Export Data + Create Report |
| **Risk**     | Medium                                                                              |

### 3.9 Tablet — Icon Sidebar

|              |                                                                                   |
| ------------ | --------------------------------------------------------------------------------- |
| **Trigger**  | Resize to 768px                                                                   |
| **Expected** | Sidebar collapses to 64px. Nav items show icon only. Tooltip on hover shows label |
| **Risk**     | High                                                                              |

### 3.10 Tablet — Stats 2 Columns

|              |                          |
| ------------ | ------------------------ |
| **Trigger**  | Dashboard at 768px       |
| **Expected** | 4 StatsCards in 2×2 grid |
| **Risk**     | Medium                   |

### 3.11 Tablet — Charts 1 Column

|              |                         |
| ------------ | ----------------------- |
| **Trigger**  | Dashboard at 768px      |
| **Expected** | Charts stacked 1-column |
| **Risk**     | Medium                  |

### 3.12 Desktop — Full Layout

|              |                                                                                   |
| ------------ | --------------------------------------------------------------------------------- |
| **Trigger**  | 1440px viewport                                                                   |
| **Expected** | 240px sidebar, 4-col stats, 2-col charts, all table columns, chat panel 380×560px |
| **Risk**     | High                                                                              |

---

## 4. TopBar Action Buttons

### 4.1 Buttons Always Visible

|              |                                                                                          |
| ------------ | ---------------------------------------------------------------------------------------- |
| **Trigger**  | Switch between Dashboard and Table views                                                 |
| **Expected** | `data-cid="btn-export-data"` and `data-cid="btn-create-report"` always present in TopBar |
| **Risk**     | High                                                                                     |

### 4.2 Create Report Button Style

|              |                                                                            |
| ------------ | -------------------------------------------------------------------------- |
| **Trigger**  | Inspect button                                                             |
| **Expected** | Primary style: #FF5533 background, white text, pill shape. Hover → #E63D1F |
| **Risk**     | Low                                                                        |

### 4.3 Export Data Button Style

|              |                                                                                                |
| ------------ | ---------------------------------------------------------------------------------------------- |
| **Trigger**  | Inspect button                                                                                 |
| **Expected** | Secondary style: transparent background, #1b1b1b border + text, pill shape. Hover → #f9f9f9 bg |
| **Risk**     | Low                                                                                            |

### 4.4 Placeholder Buttons (No Action)

|              |                                                                             |
| ------------ | --------------------------------------------------------------------------- |
| **Trigger**  | Click both buttons                                                          |
| **Expected** | No error thrown, no navigation. OK to show a "Coming soon" toast (optional) |
| **Risk**     | Low                                                                         |

---

## 5. Toast Notifications

All toasts should:

- Appear top-right or bottom-right (not overlapping TopBar action buttons)
- Auto-dismiss after 4s
- Have a manual [✕] close
- Stack if multiple toasts appear

### 5.1 Toast — File Parsed Successfully

| Trigger | Drop valid file → parse succeeds |
| Expected | ✅ **Success** toast: "File parsed: [filename]. 646 rows, 20 columns." Green bg, checkmark icon |

### 5.2 Toast — Unsupported File Type

| Trigger | Drop `.pdf` or `.png` |
| Expected | ❌ **Error** toast: "Unsupported file type. Accepted: .xlsx .xls .csv .tsv .json" Red bg, alert icon |

### 5.3 Toast — Parse Failed

| Trigger | Drop a corrupt file |
| Expected | ❌ **Error** toast: "Could not read file. Please check it is a valid spreadsheet or data file." |

### 5.4 Toast — Multiple Files Dropped

| Trigger | Drop 2+ files |
| Expected | ℹ️ **Info** toast: "Only one file can be analyzed at a time." Neutral/blue bg |

### 5.5 Toast — Empty File

| Trigger | Drop file with 0 data rows |
| Expected | ⚠️ **Warning** toast: "File has no data rows. Columns detected but nothing to analyze." Amber bg |

### 5.6 Toast — Analyzed / View Switched

| Trigger | Click "Analyze in Table" |
| Expected | ✅ **Success** toast: "Switched to Table view." (brief, low-priority) |

### 5.7 Toast Stacking

| Trigger | Trigger 3 errors in rapid succession |
| Expected | 3 toasts stacked vertically. Each auto-dismisses independently |

### 5.8 Toast on Mobile

| Trigger | Any toast on 375px viewport |
| Expected | Toast appears above bottom nav bar (not behind it). Full width or near-full width |

---

## 6. Error States

### 6.1 Table — Zero Results After Filter

|              |                                                                                                                    |
| ------------ | ------------------------------------------------------------------------------------------------------------------ |
| **Trigger**  | In ApplicantTable, filter to a combination that matches 0 applicants                                               |
| **Expected** | Empty state: illustration or icon + "No applicants match your filters." + "Clear filters" button. No broken layout |
| **Risk**     | High                                                                                                               |

### 6.2 Table — Search with No Match

|              |                                                         |
| ------------ | ------------------------------------------------------- |
| **Trigger**  | Type a nonsense string in `data-cid="table-search"`     |
| **Expected** | Empty state (same as above). Table header still visible |
| **Risk**     | Medium                                                  |

### 6.3 Chart — No Data (Future Proofing)

|              |                                                                                                            |
| ------------ | ---------------------------------------------------------------------------------------------------------- |
| **Trigger**  | If all chart data arrays were empty                                                                        |
| **Expected** | Each chart card shows an empty state placeholder ("No data available") instead of a broken Recharts render |
| **Risk**     | Low                                                                                                        |

### 6.4 Font Loading Failure (Slow/Offline Network)

|              |                                                                                                   |
| ------------ | ------------------------------------------------------------------------------------------------- |
| **Trigger**  | Block Cloudinary CDN in DevTools Network → reload                                                 |
| **Expected** | Fallback font (Helvetica Neue) is used. `font-display: swap` prevents FOIT. Layout does not break |
| **Risk**     | Medium                                                                                            |

### 6.5 Drag-Drop Not Supported (Old Browser)

|              |                                                                                         |
| ------------ | --------------------------------------------------------------------------------------- |
| **Trigger**  | Visit on a browser without HTML5 drag-drop API                                          |
| **Expected** | GlobalDropZone gracefully degrades — the rest of the UI still works. No JS error thrown |
| **Risk**     | Low                                                                                     |

---

## 7. Typography & Contrast

### 7.1 StatsCard Label Contrast

|              |                                                                      |
| ------------ | -------------------------------------------------------------------- |
| **Trigger**  | Inspect `data-cid="stats-total"` label text                          |
| **Expected** | Color `#6B5549` on `#FCFCFC` — contrast ratio ≥ 5.1:1 (WCAG AA pass) |
| **Risk**     | High                                                                 |

### 7.2 Timestamp Contrast (Chat)

|              |                                                                  |
| ------------ | ---------------------------------------------------------------- |
| **Trigger**  | Inspect message timestamps in `data-cid="chat-messages"`         |
| **Expected** | Color `#767676` on white — contrast ratio ≥ 4.6:1 (WCAG AA pass) |
| **Risk**     | High                                                             |

### 7.3 Stats Value Text Size

|              |                                       |
| ------------ | ------------------------------------- |
| **Trigger**  | Inspect stat value in any StatsCard   |
| **Expected** | `font-size: 36px`, `font-weight: 700` |
| **Risk**     | Low                                   |

### 7.4 Page Title Text Size

|              |                                       |
| ------------ | ------------------------------------- |
| **Trigger**  | Inspect `data-cid="topbar"` h1        |
| **Expected** | `font-size: 22px`, `font-weight: 700` |
| **Risk**     | Low                                   |

---

## 8. Component Label Integrity (`data-cid`)

### 8.1 All Labels Present

|              |                                                                                    |
| ------------ | ---------------------------------------------------------------------------------- |
| **Trigger**  | Run in browser console: `document.querySelectorAll('[data-cid]')`                  |
| **Expected** | Returns elements for all 20+ `data-cid` values listed in the design spec Section 8 |
| **Risk**     | Low                                                                                |

### 8.2 Labels Unique

|              |                                                                                                              |
| ------------ | ------------------------------------------------------------------------------------------------------------ |
| **Trigger**  | Check for duplicate `data-cid` values                                                                        |
| **Expected** | No two elements share the same `data-cid` value (except intentional per-item ones like `nav-item-dashboard`) |
| **Risk**     | Low                                                                                                          |

---

## 9. Edge Cases

### 9.1 Very Long Applicant Name

|              |                                                                    |
| ------------ | ------------------------------------------------------------------ |
| **Trigger**  | Inject an applicant with 80-char name into mockData                |
| **Expected** | Name truncates with ellipsis in table row. No row height expansion |
| **Risk**     | Medium                                                             |

### 9.2 Very High GPA Value

|              |                                                                      |
| ------------ | -------------------------------------------------------------------- |
| **Trigger**  | Inject GPA of 10.0 or 99 into mockData                               |
| **Expected** | Displays correctly. Color coding (high/mid/low) doesn't break layout |
| **Risk**     | Low                                                                  |

### 9.3 Rapid View Switching

|              |                                                         |
| ------------ | ------------------------------------------------------- |
| **Trigger**  | Click Dashboard → Table → Dashboard → Table rapidly 10× |
| **Expected** | No flicker, no memory leak, correct view always renders |
| **Risk**     | Medium                                                  |

### 9.4 Resize During Interaction

|              |                                                                                                  |
| ------------ | ------------------------------------------------------------------------------------------------ |
| **Trigger**  | Open drop zone popup → resize window from 1440px to 375px                                        |
| **Expected** | Popup adapts (modal → bottom sheet) or at minimum doesn't break. Preferred: re-renders correctly |
| **Risk**     | Medium                                                                                           |

### 9.5 Rapid Chat Send

|              |                                                                                                 |
| ------------ | ----------------------------------------------------------------------------------------------- |
| **Trigger**  | Press Enter 5 times rapidly with text in chat input                                             |
| **Expected** | 5 user messages and 5 AI responses appear correctly. No duplicate sends. Input clears each time |
| **Risk**     | Medium                                                                                          |

### 9.6 Tab Navigation (Keyboard Accessibility)

|              |                                                                                                                |
| ------------ | -------------------------------------------------------------------------------------------------------------- |
| **Trigger**  | Navigate entire UI using only keyboard (Tab, Enter, Space)                                                     |
| **Expected** | All interactive elements (nav, buttons, inputs, chat send, drop zone popup actions) are reachable and operable |
| **Risk**     | Medium                                                                                                         |

### 9.7 Viewport Zoom 200%

|              |                                                                                                          |
| ------------ | -------------------------------------------------------------------------------------------------------- |
| **Trigger**  | Set browser zoom to 200% on desktop                                                                      |
| **Expected** | Layout adapts (may trigger responsive breakpoints). Content is readable. No overlap or broken containers |
| **Risk**     | Low                                                                                                      |

### 9.8 File Upload Immediately Followed by Navigation

|              |                                                                                                 |
| ------------ | ----------------------------------------------------------------------------------------------- |
| **Trigger**  | Drop a file → click "Analyze in Table" → immediately click "Dashboard" in nav                   |
| **Expected** | View changes to Dashboard. Drop zone popup closes cleanly. No stale overlay or backdrop remains |
| **Risk**     | Medium                                                                                          |

---

## 10. Checklist Summary

Run through before shipping:

- [ ] All 5 file types parse without error
- [ ] Drop zone popup opens, columns show, filter works, custom add works
- [ ] FloatingChat opens/closes, messages persist, send works
- [ ] Toast notifications appear for: success, error, warning, info
- [ ] TopBar buttons always visible on all views
- [ ] Mobile (375px): bottom nav, 2-col stats, full-screen chat, bottom-sheet popup
- [ ] Tablet (768px): icon sidebar, 2-col stats, 1-col charts
- [ ] Desktop (1440px): full layout, 4-col stats, 2-col charts
- [ ] Table empty state renders on zero-filter results
- [ ] All `data-cid` attributes present (console check)
- [ ] Contrast: #6B5549 and #767676 used for readable text
- [ ] Font fallback works when Cloudinary is blocked
- [ ] No console errors on any view
- [ ] `npm run build` passes
- [ ] `npm run lint` passes
