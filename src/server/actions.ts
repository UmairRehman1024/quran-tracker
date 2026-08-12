"use server"

import { and, eq } from "drizzle-orm"
import { auth, currentUser } from "@clerk/nextjs/server"

import { db } from "@/db/db"
import { quranLogs, users } from "@/db/schema"
import { todayInTimezone, yesterdayInTimezone } from "@/lib/dates"
import { currentStreak, longestStreak } from "@/lib/streak"

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

async function getUserLogDates(userId: string): Promise<string[]> {
  const logs = await db
    .select({ date: quranLogs.date })
    .from(quranLogs)
    .where(eq(quranLogs.userId, userId))
  return logs.map((log) => log.date)
}

export async function addQuranLog() {

  //checking auth
  const authResult = await requireClerkUserId()
  if (!authResult.ok) return authResult

  const { userId } = authResult


  //getting timezone from the database
  const [dbUser] = await db
    .select({
      timezone: users.timezone,
    })
    .from(users)
    .where(eq(users.id, userId))
    .limit(1)

  //if the user is not found, return an error
  if (!dbUser) {
    console.error("DB user not found (webhook lag?)", userId)
    return { ok: false as const, error: "db_user_not_found" as const }
  }

  //getting today and yesterday in the user's timezone
  const today = todayInTimezone(dbUser.timezone)
  const yesterday = yesterdayInTimezone(dbUser.timezone)

  //checking if the user has already logged today
  const [existingToday] = await db
    .select({ id: quranLogs.id })
    .from(quranLogs)
    .where(and(eq(quranLogs.userId, userId), eq(quranLogs.date, today)))
    .limit(1)

  //if the user has already logged today, return an error
  if (existingToday) {
    return { ok: false as const, error: "already_exists" as const }
  }

  //inserting the log into the database
  try {
    await db.insert(quranLogs).values({
      userId,
      date: today,
    })
  } catch (error) {
    //if the log is not unique, return an error
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

export async function getHomeStreak() {
  const authResult = await requireClerkUserId()
  if (!authResult.ok) return authResult

  const { userId } = authResult

  const [dbUser] = await db
    .select({
      timezone: users.timezone,
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
  const logDates = await getUserLogDates(userId)

  return {
    ok: true as const,
    currentStreak: currentStreak(logDates, today, yesterday),
    longestStreak: longestStreak(logDates),
    checkedInToday: logDates.includes(today),
  }
}

export async function getQuranLogs() {
  const authResult = await requireClerkUserId()
  if (!authResult.ok) return authResult

  const { userId } = authResult

  const logs = await db
    .select({ date: quranLogs.date })
    .from(quranLogs)
    .where(eq(quranLogs.userId, userId))

  return { ok: true as const, logs }
}
