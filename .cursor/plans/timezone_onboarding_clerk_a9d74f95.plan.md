---
name: Timezone onboarding Clerk
overview: Add a minimal timezone onboarding step after sign-up, store the IANA zone in Clerk public metadata, and drop the `users` table so logs key only on Clerk user IDs.
todos:
  - id: drop-users-table
    content: Remove users table/FK from schema, db:push, delete Clerk webhook route
    status: completed
  - id: clerk-timezone-helper
    content: Read/write timezone via currentUser publicMetadata + clerkClient.updateUserMetadata
    status: completed
  - id: onboarding-ui
    content: Add /onboarding with native timezone select and home-page redirect gate
    status: completed
isProject: false
---

# Timezone onboarding via Clerk public metadata

## Why

Timezone is only used to compute the user’s local calendar day for logs and streaks. It currently lives on `[users](src/db/schema.ts)` and is filled by `[src/app/api/webhooks/route.ts](src/app/api/webhooks/route.ts)` using **the server’s** `Intl` timezone (not the user’s). Clerk already owns identity; public metadata is enough.

```mermaid
flowchart TD
  SignUp[Sign up / sign in]
  SignedIn[Signed-in layout]
  HasTz{publicMetadata.timezone?}
  Onboard["/onboarding native select"]
  Save[Server action: clerkClient updateUserMetadata]
  Home["/"]
  Actions[addQuranLog / getHomeStreak]

  SignUp --> SignedIn --> HasTz
  HasTz -->|no| Onboard --> Save --> Home
  HasTz -->|yes| Home
  Home --> Actions
  Actions -->|read timezone from currentUser| Logs[quran_logs]
```



## 1. Drop the `users` table

In `[src/db/schema.ts](src/db/schema.ts)`:

- Remove `users`, `usersRelations`, and `quranLogsRelations`.
- Keep `quranLogs.userId` as `varchar` (Clerk user id) **without** a foreign key.

Then `pnpm db:push` so Neon drops `users` and the FK. Existing `quran_logs` rows stay keyed by Clerk id.

Delete `[src/app/api/webhooks/route.ts](src/app/api/webhooks/route.ts)` (and remove the Clerk `user.created` webhook in the dashboard when convenient).

## 2. Read timezone from Clerk, not the DB

In `[src/server/actions.ts](src/server/actions.ts)`, `requireClerkUserId` already loads `currentUser()`. Extend it (or a small helper in e.g. `[src/lib/timezone.ts](src/lib/timezone.ts)`) to read `publicMetadata.timezone`.

- Valid string → use it for `todayInTimezone` / `yesterdayInTimezone`.
- Missing/invalid → return a dedicated error (replace `db_user_not_found`). Home can `redirect("/onboarding")` when streak load fails for that reason; check-in should not insert a log without a timezone.

Use `currentUser().publicMetadata` (Backend API), not session JWT claims, so a save is visible immediately without a Clerk JWT template change.

Save with merge, not replace:

```ts
const client = await clerkClient()
await client.users.updateUserMetadata(userId, {
  publicMetadata: { timezone },
})
```

Validate the string with `Intl.DateTimeFormat(undefined, { timeZone })` before writing.

## 3. Minimal onboarding UI

Add `[src/app/onboarding/page.tsx](src/app/onboarding/page.tsx)`:

- If already signed in **and** metadata has a timezone → `redirect("/")`.
- Tiny client form: native `<select>` + one Continue button. No combobox, search, or extra shadcn components.
- Options: `Intl.supportedValuesOf("timeZone")`.
- Default: `Intl.DateTimeFormat().resolvedOptions().timeZone` (browser).
- Submit → server action `saveTimezone` → `redirect("/")`.

Gate the home page in `[src/app/page.tsx](src/app/page.tsx)`: if the signed-in user has no timezone, `redirect("/onboarding")`.

Keep the root `[layout.tsx](src/app/layout.tsx)` signed-out vs signed-in split as-is; onboarding is just another signed-in child.

## 4. Existing users

Anyone already in Clerk without `publicMetadata.timezone` (including people who only had a DB row) will see onboarding once. No copy from the dropped `users` table.



