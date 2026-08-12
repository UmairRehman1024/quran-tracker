import { previousCalendarDay } from "@/lib/dates"

/** Consecutive days ending at today or yesterday (0 if streak is broken). */
export function currentStreak(
  logDates: string[],
  today: string,
  yesterday: string
): number {
  const dates = new Set(logDates)
  if (!dates.has(today) && !dates.has(yesterday)) {
    return 0
  }

  let cursor = dates.has(today) ? today : yesterday
  let count = 0
  while (dates.has(cursor)) {
    count += 1
    cursor = previousCalendarDay(cursor)
  }
  return count
}

/** Longest consecutive run of calendar days in `logDates`. */
export function longestStreak(logDates: string[]): number {
  if (logDates.length === 0) return 0

  const sorted = [...new Set(logDates)].sort()
  let max = 1
  let run = 1

  for (let i = 1; i < sorted.length; i++) {
    if (previousCalendarDay(sorted[i]) === sorted[i - 1]) {
      run += 1
      if (run > max) max = run
    } else {
      run = 1
    }
  }

  return max
}
