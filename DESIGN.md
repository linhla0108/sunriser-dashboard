---
name: "SUN.RISER Dashboard"
description: "A compact, warm, decisive product UI system for SUN Studio recruitment operations."
colors:
  canvas: "#FCFCFC"
  surface: "#FFFFFF"
  ink: "#1B1B1B"
  primary-orange: "#FF5533"
  primary-orange-hover: "#E63D1F"
  warm-mist: "#FFDAD3"
  primary-tint: "#FFF1ED"
  fog: "#F9F9F9"
  border-warm: "#ECE7E4"
  muted-stone: "#555555"
  light-steel: "#6B5549"
  hint-grey: "#767676"
  destructive: "#E64B42"
  glass-orange-primary: "#D26C30"
  glass-blue-primary: "#7BBFE7"
typography:
  display:
    fontFamily: "Geist, Geist Fallback, ui-sans-serif, system-ui, sans-serif"
    fontSize: "2.25rem"
    fontWeight: 700
    lineHeight: 1
    letterSpacing: "normal"
  headline:
    fontFamily: "Geist, Geist Fallback, ui-sans-serif, system-ui, sans-serif"
    fontSize: "1.375rem"
    fontWeight: 600
    lineHeight: 1.25
    letterSpacing: "normal"
  title:
    fontFamily: "Geist, Geist Fallback, ui-sans-serif, system-ui, sans-serif"
    fontSize: "0.9375rem"
    fontWeight: 600
    lineHeight: 1.3
    letterSpacing: "normal"
  body:
    fontFamily: "Geist, Geist Fallback, ui-sans-serif, system-ui, sans-serif"
    fontSize: "0.875rem"
    fontWeight: 400
    lineHeight: 1.5
    letterSpacing: "normal"
  label:
    fontFamily: "Geist, Geist Fallback, ui-sans-serif, system-ui, sans-serif"
    fontSize: "0.75rem"
    fontWeight: 600
    lineHeight: 1.25
    letterSpacing: "normal"
rounded:
  sm: "0.375rem"
  md: "0.5rem"
  lg: "0.625rem"
  xl: "0.875rem"
  2xl: "1.125rem"
  3xl: "1.375rem"
  pill: "9999px"
spacing:
  xs: "4px"
  sm: "8px"
  md: "12px"
  lg: "16px"
  xl: "24px"
  page: "24px"
components:
  button-primary:
    backgroundColor: "{colors.primary-orange}"
    textColor: "{colors.surface}"
    rounded: "{rounded.lg}"
    height: "36px"
    padding: "0 12px"
    typography: "{typography.body}"
  button-outline:
    backgroundColor: "{colors.surface}"
    textColor: "{colors.ink}"
    rounded: "{rounded.lg}"
    height: "36px"
    padding: "0 12px"
    typography: "{typography.body}"
  input-default:
    backgroundColor: "{colors.surface}"
    textColor: "{colors.ink}"
    rounded: "{rounded.lg}"
    height: "32px"
    padding: "4px 10px"
    typography: "{typography.body}"
  card-default:
    backgroundColor: "{colors.surface}"
    textColor: "{colors.ink}"
    rounded: "{rounded.3xl}"
    padding: "16px"
  badge-primary:
    backgroundColor: "{colors.primary-orange}"
    textColor: "{colors.surface}"
    rounded: "{rounded.pill}"
    height: "20px"
    padding: "2px 8px"
    typography: "{typography.label}"
---

# Design System: SUN.RISER Dashboard

## 1. Overview

**Creative North Star: "The Warm Operations Desk"**

SUN.RISER Dashboard is a product UI system for daily recruitment work. It uses a restrained light canvas, high-contrast ink, and a rare SUN orange accent to keep candidate review, scheduling, announcements, and admin work clear under repeated use.

The current identity is this Impeccable design system: Geist-backed, compact, shadcn-first, and task-focused. `DESIGN.md`, `.impeccable/design.json`, `src/app/globals.css`, `src/styles/themes.css`, and shared primitives in `src/components/ui/` are the current source of visual truth. The legacy `material/` design files are archival references only and should not drive new UI decisions.

This system rejects landing-page drama, generic SaaS decoration, heavy glass effects, and novelty controls. The product should feel calm around sensitive candidate data while still carrying enough warmth to belong to SUN Studio.

**Key Characteristics:**

- Light canvas with restrained contrast layers.
- SUN orange for primary actions, selection, focus, and status emphasis.
- Compact density for tables, filters, drawers, and admin flows.
- Familiar shadcn primitives with lucide icons and Base UI behavior.
- Motion used for state feedback, not page choreography.
- Optional glass themes exist as appearance modes, not the baseline identity.

## 2. Colors

The palette is a restrained product palette: near-white surfaces, high-contrast ink, warm neutral dividers, and one decisive orange accent.

### Primary

- **SUN Action Orange** (#FF5533): Primary action color, active states, selected values, progress details, and urgent interface emphasis. It should appear sparingly on a screen.
- **SUN Action Orange Hover** (#E63D1F): Hover treatment for primary actions when a stronger orange state is needed.
- **Warm Mist** (#FFDAD3): Soft primary tint for low-pressure emphasis, assistant/avatar backgrounds, selected surface hints, and gentle status context.
- **Primary Tint** (#FFF1ED): Very light orange surface for sidebar active states and subtle selected containers.

### Secondary

- **Glass Orange Primary** (#D26C30): Optional `glass-orange` theme accent. Use only inside the glass appearance mode.
- **Glass Blue Primary** (#7BBFE7): Optional `glass-blue` theme accent. Use only inside the glass appearance mode.

### Neutral

- **Operational Canvas** (#FCFCFC): Main app background. It keeps the workspace bright without becoming warm paper.
- **Surface White** (#FFFFFF): Cards, popovers, inputs, sidebar surfaces, and modal panels.
- **Ink** (#1B1B1B): Primary text, headings, and high-priority labels.
- **Muted Stone** (#555555): Secondary text where full ink would overstate priority.
- **Light Steel** (#6B5549): Warm muted text and compact hints. Keep contrast checked on tinted backgrounds.
- **Hint Grey** (#767676): Placeholder and disabled-adjacent copy. Do not lighten this further.
- **Warm Border** (#ECE7E4): Main divider, input, and card border color.
- **Fog** (#F9F9F9): Secondary panels, quiet filter groups, and table-adjacent background layers.
- **Destructive Red** (#E64B42): Destructive or error treatment where the shadcn destructive token appears.

### Named Rules

**The Orange Rarity Rule.** SUN orange is for action, current selection, and state. If it is used as decoration, remove it.

**The Mock Boundary Rule.** Use neutral or informational treatments when data is mock, local, or device-bound. Do not use confident success styling for temporary client state.

**The Glass Is Optional Rule.** Glass orange and glass blue are theme variants. The default design language is solid, readable, and restrained.

## 3. Typography

**Display Font:** Geist, Geist Fallback, ui-sans-serif, system-ui, sans-serif  
**Body Font:** Geist, Geist Fallback, ui-sans-serif, system-ui, sans-serif  
**Label/Mono Font:** Geist for labels. Use the local mono/code style only for technical identifiers when needed.

**Character:** The product uses one sans family for speed, familiarity, and consistency. Typography should feel operational and compact rather than editorial. Do not use legacy material fonts or display-pairing assumptions for current workspace UI.

### Hierarchy

- **Display** (700, 2.25rem, 1): Large dashboard numbers and stat values. Do not use for page titles in dense product panels.
- **Headline** (600, 1.375rem, 1.25): Route and modal titles such as settings, HR, reports, and public result headers.
- **Title** (600, 0.9375rem, 1.3): Card titles, drawer section headers, table-adjacent headings, and compact panels.
- **Body** (400, 0.875rem, 1.5): Main UI copy, table text, dialog content, and form support copy. Keep prose to 65 to 75 characters per line where it is not data.
- **Label** (600, 0.75rem or 0.6875rem, normal letter spacing): Form labels, badges, compact metadata, and filter labels. Uppercase is allowed only for short status or metric labels.

### Named Rules

**The One Family Rule.** Product UI uses Geist across headings, buttons, labels, and data. Do not introduce display fonts into workspace controls.

**The Compact Heading Rule.** Product headings stay fixed-size and readable. Do not use fluid hero typography inside workspace surfaces.

**The Vietnamese Name Rule.** Names, universities, roles, and candidate messages may be long and multilingual. Layout must truncate or wrap intentionally.

## 4. Elevation

The system uses a hybrid of tonal layering, borders, and selective shadow. Base product surfaces should be flat or lightly bordered. Larger shadow stacks appear on metric cards and glass theme panels, but they should not become the default treatment for every container.

### Shadow Vocabulary

- **Card Ambient** (`rgba(4, 23, 43, 0.05) 0px 0px 0px 1px, rgba(0, 0, 0, 0.1) 0px 20px 25px -5px, rgba(0, 0, 0, 0.1) 0px 8px 10px -6px`): Existing elevated stat/card shadow. Use for high-value summary cards only.
- **Dialog Ring** (`0 0 0 1px color-mix(in srgb, var(--foreground) 10%, transparent)`): Modal and popover separation when a full drop shadow would feel heavy.
- **Glass Panel Shadow** (`0 24px 64px rgba(4, 23, 43, 0.12)`): Optional main glass theme panel shadow. Use only when the selected theme expects blur.
- **Focus Ring** (`0 0 0 3px color-mix(in srgb, var(--ring) 50%, transparent)`): Keyboard-visible focus affordance for controls.

### Named Rules

**The Border Before Shadow Rule.** In dense product UI, start with a warm border or tonal background. Add shadow only when depth changes the user's understanding.

**The No Ghost Stack Rule.** Do not pair a decorative 1px border with a wide soft shadow on ordinary cards or buttons.

## 5. Components

For product work, shared shadcn/ui primitives in `src/components/ui/` are the default component vocabulary. Feature code should compose those primitives before introducing one-off controls.

### Buttons

- **Shape:** Rounded rectangle for product commands (`rounded-lg`, 0.625rem). Full pill is reserved for badges, floating nav, and compact chip-like controls.
- **Primary:** SUN orange background with white text, compact height between 32px and 36px, inline lucide icon when it clarifies the command.
- **Hover / Focus:** Primary hover darkens or reduces opacity. Focus uses a 3px ring based on `--ring`.
- **Secondary / Ghost / Plain:** Outline and ghost variants stay neutral, with muted hover backgrounds and no decorative shadows.
- **Disabled:** Opacity reduces to 50 percent and cursor changes to not-allowed.

### Chips

- **Style:** Pill-shaped, compact, 20px height when using `Badge`, with 12px or smaller copy.
- **State:** Selected chips may use primary tint or primary orange depending on consequence. Filter chips should be quieter than destructive or primary command chips.
- **Usage:** Use chips for batch, PIC, result, role, count, and status metadata. Do not use chips as paragraph decoration.

### Cards / Containers

- **Corner Style:** Current dashboard cards use `rounded-3xl`; dialogs and many feature panels use `rounded-2xl` or `rounded-xl`. Keep card radius visually consistent within a surface.
- **Background:** Default cards use Surface White. Secondary cards use Fog or low-opacity background layers.
- **Shadow Strategy:** Use Card Ambient for high-level dashboard summary cards. Use borders or rings for ordinary containers.
- **Border:** Warm Border or low-opacity foreground ring.
- **Internal Padding:** Product cards usually use 12px to 16px. Larger 20px padding is for modal content, public report cards, or summary cards.

### Inputs / Fields

- **Style:** 32px height, `rounded-lg`, transparent or white background, warm border, 10px horizontal padding.
- **Focus:** Border shifts to ring color and receives a 3px focus ring.
- **Placeholder:** Use Hint Grey or `muted-foreground`, but keep contrast readable.
- **Error / Disabled:** Error uses destructive border and ring. Disabled fields reduce opacity and cursor.

### Navigation

- **Sidebar:** White or glass panel surface, compact 32px menu rows, lucide icons at 16 to 18px, active state uses sidebar accent and stronger text.
- **Top Bar:** Sticky, translucent or solid surface with border-bottom, route title, subtitle, announcement center, notes, AI drawer, and permission-aware actions.
- **View Pills:** Floating pill navigation is acceptable for candidate and dashboard view switching. Keep it compact and avoid covering table footer content.
- **Mobile:** Sidebar collapses and workspace controls must preserve touch targets without increasing typography scale.

### Dialogs, Drawers, and Popovers

- **Dialogs:** Use Base UI dialog primitives through local shadcn wrappers. Keep max-width constrained and content scrollable when necessary.
- **Drawers:** Use the existing drawer registry for chat, notes, candidate details, and schedule entries instead of local isolated drawer state.
- **Popovers:** Avoid clipped absolute dropdowns inside overflow containers. Use shared popover, dialog, sheet, or portal patterns.

### Tables and Data Views

- **Tables:** Dense data is expected. Preserve sticky headers, bounded scrolling, clear pagination, and explicit selected-row state.
- **Pipeline / Gallery / Chart:** These are alternate views of the same candidate data. Controls and status vocabulary should match table view.
- **Bulk Actions:** Selection should be obvious and reversible. Destructive actions need clear labels and confirmation when appropriate.

### Loading and Motion States

- **Loading:** Use skeletons and the existing SUN.RISER loading handoff rather than blank content.
- **Motion:** Keep transitions around 150ms to 250ms. Drawer and selected-section motion may use animejs when it materially improves state clarity.
- **Reduced Motion:** Every non-essential animation needs a reduced-motion path.

## 6. Do's and Don'ts

### Do:

- **Do** use `#FF5533` for primary actions, selected states, active controls, progress, and state emphasis.
- **Do** use `#FCFCFC` and `#FFFFFF` as the default workspace canvas and surface pair.
- **Do** use `#1B1B1B` for primary text and keep muted text at readable contrast.
- **Do** use shared `src/components/ui/` primitives for buttons, inputs, checkboxes, dialogs, tabs, tables, tooltips, sidebars, and popovers.
- **Do** keep workspace spacing compact: page padding around 12px to 24px, card padding around 12px to 16px, and section gaps around 16px.
- **Do** show mock, local, pending, syncing, and permission states explicitly.
- **Do** preserve Vietnamese text, long names, long URLs, and mixed-language candidate messages without overflow.
- **Do** use lucide icons inside icon buttons and action buttons when an icon clarifies the command.

### Don't:

- **Don't** treat the workspace like a landing page, campaign page, or SaaS marketing dashboard.
- **Don't** use oversized hero layouts, promotional stat blocks, or decorative feature-card grids in product surfaces.
- **Don't** use gradient text, colored side-stripe card accents, decorative stripe backgrounds, or generic AI dashboard ornament.
- **Don't** make glassmorphism the default visual language. Existing glass themes are optional appearance modes, not the baseline product identity.
- **Don't** overplay the game-industry context with playful UI if it slows candidate review.
- **Don't** drift into dark terminal, finance cockpit, or heavy enterprise admin aesthetics unless a specific workflow requires it.
- **Don't** invent unfamiliar controls for standard actions like filtering, sorting, selecting rows, editing records, opening details, or confirming destructive actions.
- **Don't** imply that mock, local, or device-bound data is durable server data.
- **Don't** introduce new font families into product controls.
- **Don't** use display-scale typography inside compact dashboard cards, settings panels, drawers, or table controls.
- **Don't** pair a decorative 1px border with a wide soft shadow on ordinary product containers.
