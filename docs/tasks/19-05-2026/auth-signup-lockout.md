# Auth Signup Lockout

Tag: auth/feature

## Goal

Disable public signup, add Remember Me with 6-day session, and create one sample admin account.

## Scope

- Included: disable signup form, Remember Me checkbox on login, 6-day localStorage marker, session-only sessionStorage marker, clear markers on sign out, sample Supabase admin account
- Excluded: Supabase dashboard auth settings, user management screen, data migration

## Acceptance criteria

- /signup does not create accounts
- Login displays Remember Me checkbox (checked by default)
- Remembered logins set 6-day expiry marker
- Non-remembered logins are session-only
- Sign out clears remember markers
- Sample admin account can sign in

---

## Report

Status: Done | Commit: 6c511bc

Replaced signup form with locked-account message. Added Remember Me state to LoginForm and AuthProvider. Created sample admin in Supabase project kumhwmpfxoyauquevhbz. Password login verified.
