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
 * Yesterday's calendar date in the given timezone.
 * Once "today" is known as YYYY-MM-DD, subtract one calendar day in UTC
 * date space (no clock times), so DST cannot skip or double a day.
 */
export function yesterdayInTimezone(timeZone: string, now = new Date()): string {
  const today = todayInTimezone(timeZone, now)
  const [year, month, day] = today.split("-").map(Number)
  const utc = new Date(Date.UTC(year, month - 1, day - 1))
  const y = utc.getUTCFullYear()
  const m = String(utc.getUTCMonth() + 1).padStart(2, "0")
  const d = String(utc.getUTCDate()).padStart(2, "0")
  return `${y}-${m}-${d}`
}
