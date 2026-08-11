"use server"

import { and, desc, eq } from "drizzle-orm"
import { auth, currentUser } from "@clerk/nextjs/server"

import { db } from "@/db/db"
import { quranLogs, users } from "@/db/schema"
import { todayInTimezone, yesterdayInTimezone } from "@/lib/dates"
import { effectiveStreak, nextStreak } from "@/lib/streak"

function isUniqueViolation(error: unknown): boolean {
  if (!error || typeof error !== "object") return false
  const e = error as { code?: string; cause?: { code?: string }; message?: string }
  return (
    e.code === "23505" ||
    e.cause?.code === "23505" ||
    (typeof e.message === "string" && e.message.includes("23505"))
  )
}

async function requireClerkUserId() {
  await auth.protect()
  const clerkUser = await currentUser()
  if (!clerkUser) {
    return { ok: false as const, error: "user_not_found" as const }
  }
  return { ok: true as const, userId: clerkUser.id }
}

export async function addQuranLog() {
  const authResult = await requireClerkUserId()
  if (!authResult.ok) return authResult

  const { userId } = authResult

  const [dbUser] = await db
    .select({
      timezone: users.timezone,
      currentStreak: users.currentStreak,
      longestStreak: users.longestStreak,
    })
    .from(users)
    .where(eq(users.id, userId))
    .limit(1)

  if (!dbUser) {
    console.error("DB user not found (webhook lag?)", userId)
    return { ok: false as const, error: "db_user_not_found" as const }
  }

  const today = todayInTimezone(dbUser.timezone)
  const yesterday = yesterdayInTimezone(dbUser.timezone)

  const [existingToday] = await db
    .select({ id: quranLogs.id })
    .from(quranLogs)
    .where(and(eq(quranLogs.userId, userId), eq(quranLogs.date, today)))
    .limit(1)

  if (existingToday) {
    return { ok: false as const, error: "already_exists" as const }
  }

  try {
    await db.insert(quranLogs).values({
      userId,
      date: today,
    })
  } catch (error) {
    if (isUniqueViolation(error)) {
      return { ok: false as const, error: "already_exists" as const }
    }
    throw error
  }

  const [yesterdayLog] = await db
    .select({ id: quranLogs.id })
    .from(quranLogs)
    .where(and(eq(quranLogs.userId, userId), eq(quranLogs.date, yesterday)))
    .limit(1)

  const streaks = nextStreak({
    currentStreak: dbUser.currentStreak,
    longestStreak: dbUser.longestStreak,
    hadLogYesterday: Boolean(yesterdayLog),
  })

  await db
    .update(users)
    .set({
      currentStreak: streaks.currentStreak,
      longestStreak: streaks.longestStreak,
    })
    .where(eq(users.id, userId))

  return {
    ok: true as const,
    currentStreak: streaks.currentStreak,
    longestStreak: streaks.longestStreak,
  }
}

export async function getHomeStreak() {
  const authResult = await requireClerkUserId()
  if (!authResult.ok) return authResult

  const { userId } = authResult

  const [dbUser] = await db
    .select({
      timezone: users.timezone,
      currentStreak: users.currentStreak,
      longestStreak: users.longestStreak,
    })
    .from(users)
    .where(eq(users.id, userId))
    .limit(1)

  if (!dbUser) {
    console.error("DB user not found (webhook lag?)", userId)
    return { ok: false as const, error: "db_user_not_found" as const }
  }

  const today = todayInTimezone(dbUser.timezone)
  const yesterday = yesterdayInTimezone(dbUser.timezone)

  const [latestLog] = await db
    .select({ date: quranLogs.date })
    .from(quranLogs)
    .where(eq(quranLogs.userId, userId))
    .orderBy(desc(quranLogs.date))
    .limit(1)

  const lastLogDate = latestLog?.date ?? null
  const currentStreak = effectiveStreak({
    currentStreak: dbUser.currentStreak,
    lastLogDate,
    today,
    yesterday,
  })

  if (currentStreak === 0 && dbUser.currentStreak > 0) {
    await db
      .update(users)
      .set({ currentStreak: 0 })
      .where(eq(users.id, userId))
  }

  return {
    ok: true as const,
    currentStreak,
    longestStreak: dbUser.longestStreak,
    checkedInToday: lastLogDate === today,
  }
}

export async function getQuranLogs() {
  const authResult = await requireClerkUserId()
  if (!authResult.ok) return authResult

  const { userId } = authResult

  const logs = await db
    .select()
    .from(quranLogs)
    .where(eq(quranLogs.userId, userId))

  return { ok: true as const, logs }
}
