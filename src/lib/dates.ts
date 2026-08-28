const dateFormatterCache = new Map<string, Intl.DateTimeFormat>()

function getDateFormatter(timeZone: string) {
  let formatter = dateFormatterCache.get(timeZone)
  if (!formatter) {
    formatter = new Intl.DateTimeFormat("en-CA", {
      timeZone,
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
    })
    dateFormatterCache.set(timeZone, formatter)
  }
  return formatter
}

/** Calendar date (YYYY-MM-DD) for `date` in the given IANA timezone. */
export function calendarDateInTimezone(date: Date, timeZone: string): string {
  return getDateFormatter(timeZone).format(date)
}

export function todayInTimezone(timeZone: string, now = new Date()): string {
  return calendarDateInTimezone(now, timeZone)
}

/**
 * Previous calendar day for a YYYY-MM-DD string.
 * Subtracts one day in UTC date space (no clock times), so DST cannot
 * skip or double a day.
 */
export function previousCalendarDay(date: string): string {
  const [year, month, day] = date.split("-").map(Number)
  const utc = new Date(Date.UTC(year, month - 1, day - 1))
  const y = utc.getUTCFullYear()
  const m = String(utc.getUTCMonth() + 1).padStart(2, "0")
  const d = String(utc.getUTCDate()).padStart(2, "0")
  return `${y}-${m}-${d}`
}

/**
 * Yesterday's calendar date in the given timezone.
 * Once "today" is known as YYYY-MM-DD, subtract one calendar day in UTC
 * date space (no clock times), so DST cannot skip or double a day.
 */
export function yesterdayInTimezone(timeZone: string, now = new Date()): string {
  return previousCalendarDay(todayInTimezone(timeZone, now))
}

const CALENDAR_DATE_RE = /^\d{4}-\d{2}-\d{2}$/

/** True when `date` is a real YYYY-MM-DD calendar day. */
export function isValidCalendarDate(date: string): boolean {
  if (!CALENDAR_DATE_RE.test(date)) return false
  const [year, month, day] = date.split("-").map(Number)
  const utc = new Date(Date.UTC(year, month - 1, day))
  return (
    utc.getUTCFullYear() === year &&
    utc.getUTCMonth() === month - 1 &&
    utc.getUTCDate() === day
  )
}

/** True when a reading can be logged for `date` (today or earlier). */
export function isLoggableDate(date: string, today: string): boolean {
  return isValidCalendarDate(date) && date <= today
}

/** True when a logged past day can be removed (strictly before today). */
export function isRemovableDate(date: string, today: string): boolean {
  return isValidCalendarDate(date) && date < today
}
