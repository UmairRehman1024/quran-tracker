"use server"

import { and, eq } from "drizzle-orm"
import { auth, clerkClient, currentUser } from "@clerk/nextjs/server"
import { redirect } from "next/navigation"

import { db } from "@/db/db"
import { quranLogs } from "@/db/schema"
import { todayInTimezone, yesterdayInTimezone } from "@/lib/dates"
import { currentStreak, longestStreak } from "@/lib/streak"
import { isValidTimeZone, timezoneFromPublicMetadata } from "@/lib/timezone"

function isUniqueViolation(error: unknown): boolean {
  if (!error || typeof error !== "object") return false
  const e = error as {
    code?: string
    cause?: { code?: string }
    message?: string
  }
  return (
    e.code === "23505" ||
    e.cause?.code === "23505" ||
    (typeof e.message === "string" && e.message.includes("23505"))
  )
}

async function requireClerkUser() {
  await auth.protect()
  const clerkUser = await currentUser()
  if (!clerkUser) {
    return { ok: false as const, error: "user_not_found" as const }
  }
  return { ok: true as const, userId: clerkUser.id, user: clerkUser }
}

async function requireClerkUserWithTimezone() {
  const authResult = await requireClerkUser()
  if (!authResult.ok) return authResult

  const timezone = timezoneFromPublicMetadata(authResult.user.publicMetadata)
  if (!timezone) {
    return { ok: false as const, error: "timezone_missing" as const }
  }

  return { ok: true as const, userId: authResult.userId, timezone }
}

async function getUserLogDates(userId: string): Promise<string[]> {
  const logs = await db
    .select({ date: quranLogs.date })
    .from(quranLogs)
    .where(eq(quranLogs.userId, userId))
  return logs.map((log) => log.date)
}

export async function addQuranLog() {
  const authResult = await requireClerkUserWithTimezone()
  if (!authResult.ok) return authResult

  const { userId, timezone } = authResult

  const today = todayInTimezone(timezone)
  const yesterday = yesterdayInTimezone(timezone)

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

  const logDates = await getUserLogDates(userId)

  return {
    ok: true as const,
    currentStreak: currentStreak(logDates, today, yesterday),
    longestStreak: longestStreak(logDates),
  }
}

export async function getHomeData() {
  const authResult = await requireClerkUserWithTimezone()
  if (!authResult.ok) return authResult

  const { userId, timezone } = authResult

  const today = todayInTimezone(timezone)
  const yesterday = yesterdayInTimezone(timezone)
  const logDates = await getUserLogDates(userId)

  return {
    ok: true as const,
    currentStreak: currentStreak(logDates, today, yesterday),
    longestStreak: longestStreak(logDates),
    checkedInToday: logDates.includes(today),
    logDates,
  }
}

export async function saveTimezone(formData: FormData) {
  const authResult = await requireClerkUser()
  if (!authResult.ok) return authResult

  const timezone = String(formData.get("timezone") ?? "")
  if (!isValidTimeZone(timezone)) {
    return { ok: false as const, error: "invalid_timezone" as const }
  }

  const client = await clerkClient()
  await client.users.updateUserMetadata(authResult.userId, {
    publicMetadata: { timezone },
  })

  redirect("/")
}
