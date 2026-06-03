# Product

## Register

product

## Users

SUN.RISER Dashboard is used by SUN Studio's internal HR and recruitment team for the SUN.RISER 2026 internship program.

Primary users include recruiters, HR managers, coordinators, reviewers, and admins. The product already models roles as `admin`, `manager`, `member`, and `viewer`, with `read`, `edit`, and `delete` permissions.

Users work with many candidates across batches, roles, review stages, interview dates, PIC assignments, portfolio links, notes, reports, announcements, and Google Sheets sync operations. Their work is repetitive, time-sensitive, and detail-heavy. They need to scan, filter, compare, update, and recover context quickly without losing trust in the data.

## Product Purpose

SUN.RISER Dashboard is an internal recruitment workspace that brings applicant review, candidate status tracking, interview scheduling, internal announcements, HR staff management, pinned comparison, report generation, and sheet sync controls into one operational surface.

The product exists to reduce switching between spreadsheets, chat, notes, calendars, and ad hoc reporting. Success means the recruitment team can find the right candidate, understand current status, update decisions, coordinate ownership, and share outcomes with fewer mistakes and less repeated manual work.

Current product boundaries matter for design decisions:

- Candidate and dashboard surfaces still use mock candidate fixtures in several places.
- Upload sessions are client-state based and are not yet a durable source of truth.
- Schedule and HR staff management currently use local or mock state.
- Report share links are localStorage based and device-bound.
- Auth, announcements, attachment handling, and parts of Google Sheets sync have stronger Supabase or API infrastructure.
- Future UI should make persistence, permissions, loading, sync status, and mock-versus-live data boundaries clear instead of implying more certainty than the system has.

## Brand Personality

Clear, warm, decisive.

The interface should feel like a focused internal workspace: calm enough for sensitive candidate data, compact enough for daily operations, and warm enough to match the SUN Studio brand. It should avoid both cold enterprise HR software and decorative startup-dashboard styling.

Voice should be direct, specific, and operational. Labels should say what will happen. Error, empty, loading, and permission states should explain the next useful action without marketing language.

## Anti-references

- Do not treat the workspace like a landing page, campaign page, or SaaS marketing dashboard.
- Do not use oversized hero layouts, promotional stat blocks, or decorative feature-card grids in product surfaces.
- Do not use gradient text, side-stripe card accents, decorative stripe backgrounds, or generic AI dashboard ornament.
- Do not make glassmorphism the default visual language. Existing glass themes are optional appearance modes, not the baseline product identity.
- Do not overplay the game-industry context with playful UI if it slows candidate review.
- Do not drift into dark terminal, finance cockpit, or heavy enterprise admin aesthetics unless a specific workflow requires it.
- Do not invent unfamiliar controls for standard actions like filtering, sorting, selecting rows, editing records, opening details, or confirming destructive actions.
- Do not imply that mock, local, or device-bound data is durable server data.

## Design Principles

1. Task density first. Preserve compact spacing, clear grouping, and fast scanning for tables, filters, drawers, and admin flows.
2. State clarity over decoration. Current view, selected rows, round status, sync state, unread announcements, pinned items, permissions, and loading states must be obvious.
3. Sensitive data deserves calm controls. Candidate contact details, notes, reports, and public shares need restrained visuals, clear affordances, and low-risk defaults.
4. Familiar components win. Prefer the shared shadcn/ui primitives and the existing workspace shell patterns over custom one-off controls.
5. Compact warmth. Use the light canvas, high-contrast ink, and SUN orange accent with restraint. Orange should carry action, selection, or status rather than decoration.
6. Motion explains state. Animation should support loading, drawers, selected sections, route handoff, drag feedback, and small confirmations. Reduced motion support is required.

## Accessibility & Inclusion

Default to WCAG AA for contrast and interaction quality.

Body text, muted text, placeholders, disabled states, and text on tinted surfaces must stay readable. Status should never rely on color alone; use text, icons, labels, or structure where needed. Keyboard access is required for common workflows including auth, filters, dialogs, drawers, menus, table actions, and announcement composition.

The product should handle Vietnamese names, mixed Vietnamese and English content, long candidate messages, long portfolio URLs, and role names without clipping or layout breakage. Reduced-motion preferences must be respected for all non-essential motion.
