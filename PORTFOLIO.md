# Quran Tracker — Portfolio & Interview Summary

A daily Quran reading check-in app. Sign in, set your timezone once, tap to log that you read today. Streaks follow your local calendar day — including around DST.

**Live demo:** [quran-tracker.vercel.app](https://quran-tracker.vercel.app)  
**Repo:** [github.com/UmairRehman1024/quran-tracker](https://github.com/UmairRehman1024/quran-tracker)

---

## Elevator pitch (15 seconds)

> I built a habit tracker for daily Quran reading where “today” is defined by the user’s timezone — not the server clock — so streaks stay fair across DST and travel. Identity lives in Clerk; one Postgres table holds check-ins; streaks are computed, never stored.

---

## Problem it solves

Most habit apps treat “today” as UTC or the browser clock. For a religious daily practice, a wrong day boundary (timezone, DST, travel) breaks trust. Quran Tracker makes **one check-in per local calendar day** correct and fair, with streaks derived from that truth.

---

## What users can do

| Feature | Detail |
| --- | --- |
| **Daily check-in** | One tap: “Did you read Quran today?” with optimistic UI |
| **Streaks** | Current streak + longest streak, personalized greeting |
| **Weekly calendar** | Navigate weeks; log or remove past days; future days disabled |
| **Timezone onboarding** | Required once — device detection, searchable IANA city list, live local clock |
| **Auth & account** | Clerk sign-in / sign-up; account deletion cleans up data via webhook |
| **Theme** | Light / dark (system preference + keyboard toggle) |

**Deliberately out of scope:** PWA/offline, social features, leaderboards, analytics dashboards. Small surface, high correctness.

---

## Tech stack

| Layer | Choice |
| --- | --- |
| App | Next.js 16 (App Router), React 19, TypeScript |
| Auth | Clerk |
| Database | Neon Postgres + Drizzle ORM |
| UI | Tailwind CSS v4, shadcn/ui |
| Dates | `Intl` APIs + date-fns |
| Tests | Vitest (streak + calendar-day helpers) |
| CI | GitHub Actions (typecheck, lint, test, build) |
| Hosting | Vercel |

---

## Architecture (what to say in interviews)

**Clear ownership split**

- **Clerk** owns identity and the user’s IANA timezone (`publicMetadata.timezone`).
- **Neon** stores only `quran_logs` — one row per user per local calendar day.
- **Streaks are derived** from those dates in pure functions, not denormalized columns that can drift.
- When a Clerk user is deleted, a **verified webhook** removes their rows (no orphaned data).

**Data model (intentionally tiny)**

| Column | Notes |
| --- | --- |
| `user_id` | Clerk user id |
| `date` | Local calendar day `YYYY-MM-DD` |
| Unique `(user_id, date)` | Race-safe one check-in per day |

**API style:** Server Actions for check-in, backfill, remove, home data, and timezone save — no public REST CRUD surface for the product itself.

---

## Engineering highlights (talking points)

These are the strongest interview angles — lead with *constraints solved*, not a stack laundry list.

1. **Timezone-correct “today”**  
   IANA zone in Clerk metadata; “today” via `Intl.DateTimeFormat` with that time zone — not server UTC.

2. **DST-safe calendar arithmetic**  
   Day walking subtracts in UTC date space so spring-forward / fall-back cannot skip or double a day. Covered by unit tests (DST, leap days, year boundaries).

3. **Derived streaks**  
   Pure `currentStreak` / `longestStreak` functions. Current streak still counts if you haven’t checked in *yet today* but logged yesterday.

4. **Concurrency**  
   Unique index on `(user_id, date)` + handling Postgres unique-violation on double-submit.

5. **History editing with rules**  
   Past days can be logged or removed; today’s check-in isn’t removable via the calendar; future days are blocked server-side.

6. **Ship hygiene**  
   Vitest for domain logic, GitHub Actions CI, committed migrations, product README, live demo — signals production habits, not a weekend scaffold.

7. **Product judgment**  
   Scoped hard: correctness over feature sprawl. Easy to explain *what you didn’t build* and why.

---

## User journey (for screenshots / demos)

1. **Signed out** → Landing with Sign in / Sign up  
2. **First sign-in** → Redirect to timezone onboarding  
3. **Home** → Greeting, streak, check-in button, weekly calendar  

**Suggested portfolio screenshots:** landing → timezone picker → home with an active streak and week highlights.

---

## Copy you can paste on a portfolio site

### Short (card / project tile)

**Quran Tracker** — Timezone-aware daily Quran check-in with derived streaks. Next.js, Clerk, Neon, Vercel.  
[Live demo](https://quran-tracker.vercel.app)

### Medium (project page blurb)

Quran Tracker is a focused habit app for logging daily Quran reading. The hard part isn’t the button — it’s defining “today” correctly across timezones and DST so streaks stay fair. Auth and timezone live in Clerk; check-ins live in Neon Postgres; streaks are computed from the log, never stored as counters. Built with Next.js 16, React 19, Drizzle, and Vitest; deployed on Vercel with CI on every push.

### One-liner for LinkedIn / résumé

Built a timezone- and DST-correct daily habit tracker (Next.js, Clerk, Neon) with derived streaks, race-safe check-ins, and account-deletion data cleanup.

---

## Interview Q&A cheat sheet

**“Walk me through the architecture.”**  
Browser → Server Actions → Clerk (identity + timezone) and Neon (`quran_logs`). Streaks computed in pure TS. Clerk `user.deleted` webhook cleans Neon.

**“Why not store the streak?”**  
Counters drift under edits, timezone changes, and bugs. Recomputing from the unique day log is the source of truth and is easy to test.

**“What’s the trickiest bug class?”**  
Local calendar days around DST. Subtracting “one day” with local clock math can skip or repeat a date; walking in UTC date space avoids that.

**“What would you build next?”**  
Examples: reminder notifications, mild multi-device polish, or E2E tests — without bloating into a social/PWA product unless the habit loop needs it.

**Honest limits (if asked)**  
No E2E suite yet; no offline/PWA; single-table by design. Happy to discuss tradeoffs.

---

## Links

| | |
| --- | --- |
| Demo | https://quran-tracker.vercel.app |
| Source | https://github.com/UmairRehman1024/quran-tracker |
| Setup / scripts | See [README.md](./README.md) |
