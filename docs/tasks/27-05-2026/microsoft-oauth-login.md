# Microsoft OAuth Login Gate

Tag: auth/feature

## Goal

Allow internal company users to log in via Microsoft (Outlook / Azure AD) with a single "Continue with Microsoft" button. Non-allowlisted email domains are rejected **before** a Supabase `auth.users` row is created. The allowed domain is never stored in committed code.

## Scope

- Included: Azure (Microsoft Entra) OAuth via Supabase; `private.allowed_email_domains` table; Before User Created hook; `/auth/callback` route; `AuthProvider.signInWithMicrosoft`; login page button; proxy allow-list.
- Excluded: Google login; Microsoft Graph scopes (mail/calendar); allowed-domain management UI.

## Acceptance criteria

- Clicking "Continue with Microsoft" initiates the Azure OAuth PKCE flow.
- A user whose email matches the allowed domain is authenticated and lands on `/dashboard`.
- A user whose email does not match sees "Access denied. Contact your administrator." and is NOT created in `auth.users`.
- The allowed domain string does not appear in any committed file, env var, network response, or browser UI.
- `proxy.ts` allows `/auth/callback` without a session.
- `oauthErrors.ts` message snapshot test passes (no `@` or TLD in message string after stripping end punctuation).

## Manual ops checklist (operator runs after code ships)

1. **Azure Portal** — Register app as single-tenant. Redirect URI: `https://<supabase-project>.supabase.co/auth/v1/callback`. Copy client ID + secret.
2. **Supabase Dashboard → Auth → Providers → Azure** — Enable, paste Azure Tenant URL `https://login.microsoftonline.com/<tenant-id>`, client ID, secret.
3. **Supabase Dashboard → Auth → Hooks → Before User Created** — Select `public.hook_restrict_signup_by_email_domain`.
4. **Supabase SQL Editor** — Run `scripts/seed-allowed-domain.sql.example` with real domain substituted (do NOT commit the real value).

---

## Report

Status: In Progress
