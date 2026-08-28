import { describe, expect, it } from "vitest"

import {
  calendarDateInTimezone,
  isLoggableDate,
  isRemovableDate,
  isValidCalendarDate,
  previousCalendarDay,
  todayInTimezone,
  yesterdayInTimezone,
} from "@/lib/dates"

describe("previousCalendarDay", () => {
  it("subtracts one calendar day", () => {
    expect(previousCalendarDay("2026-08-17")).toBe("2026-08-16")
  })

  it("crosses month boundaries", () => {
    expect(previousCalendarDay("2026-03-01")).toBe("2026-02-28")
  })

  it("crosses year boundaries", () => {
    expect(previousCalendarDay("2026-01-01")).toBe("2025-12-31")
  })

  it("handles leap-year February", () => {
    expect(previousCalendarDay("2024-03-01")).toBe("2024-02-29")
  })

  it("does not skip a day across US spring-forward DST", () => {
    expect(previousCalendarDay("2026-03-09")).toBe("2026-03-08")
    expect(previousCalendarDay("2026-03-08")).toBe("2026-03-07")
  })

  it("does not double a day across US fall-back DST", () => {
    expect(previousCalendarDay("2026-11-02")).toBe("2026-11-01")
    expect(previousCalendarDay("2026-11-01")).toBe("2026-10-31")
  })
})

describe("calendarDateInTimezone", () => {
  it("formats YYYY-MM-DD in the given timezone", () => {
    const utcNoon = new Date("2026-08-16T12:00:00.000Z")
    expect(calendarDateInTimezone(utcNoon, "UTC")).toBe("2026-08-16")
    expect(calendarDateInTimezone(utcNoon, "America/Los_Angeles")).toBe(
      "2026-08-16"
    )
    expect(calendarDateInTimezone(utcNoon, "Pacific/Auckland")).toBe(
      "2026-08-17"
    )
  })

  it("uses the local calendar day around a UTC midnight boundary", () => {
    const utcMidnight = new Date("2026-01-01T00:00:00.000Z")
    expect(calendarDateInTimezone(utcMidnight, "UTC")).toBe("2026-01-01")
    expect(calendarDateInTimezone(utcMidnight, "America/New_York")).toBe(
      "2025-12-31"
    )
    expect(calendarDateInTimezone(utcMidnight, "Asia/Tokyo")).toBe("2026-01-01")
  })

  it("stays on the same calendar day through US spring-forward", () => {
    const beforeSpringForward = new Date("2026-03-08T06:30:00.000Z")
    const afterSpringForward = new Date("2026-03-08T07:30:00.000Z")

    expect(
      calendarDateInTimezone(beforeSpringForward, "America/New_York")
    ).toBe("2026-03-08")
    expect(calendarDateInTimezone(afterSpringForward, "America/New_York")).toBe(
      "2026-03-08"
    )
  })

  it("stays on the same calendar day through US fall-back", () => {
    const first1Am = new Date("2026-11-01T05:30:00.000Z")
    const repeated1Am = new Date("2026-11-01T06:30:00.000Z")

    expect(calendarDateInTimezone(first1Am, "America/New_York")).toBe(
      "2026-11-01"
    )
    expect(calendarDateInTimezone(repeated1Am, "America/New_York")).toBe(
      "2026-11-01"
    )
  })
})

describe("isValidCalendarDate", () => {
  it("accepts valid YYYY-MM-DD strings", () => {
    expect(isValidCalendarDate("2026-08-17")).toBe(true)
    expect(isValidCalendarDate("2024-02-29")).toBe(true)
  })

  it("rejects malformed or impossible dates", () => {
    expect(isValidCalendarDate("2026-8-17")).toBe(false)
    expect(isValidCalendarDate("2026-08-32")).toBe(false)
    expect(isValidCalendarDate("2026-02-29")).toBe(false)
    expect(isValidCalendarDate("")).toBe(false)
  })
})

describe("isLoggableDate", () => {
  const today = "2026-08-19"

  it("allows past dates and today", () => {
    expect(isLoggableDate("2026-08-18", today)).toBe(true)
    expect(isLoggableDate(today, today)).toBe(true)
  })

  it("rejects future dates and invalid input", () => {
    expect(isLoggableDate("2026-08-20", today)).toBe(false)
    expect(isLoggableDate("not-a-date", today)).toBe(false)
  })
})

describe("isRemovableDate", () => {
  const today = "2026-08-19"

  it("allows only dates strictly before today", () => {
    expect(isRemovableDate("2026-08-18", today)).toBe(true)
    expect(isRemovableDate(today, today)).toBe(false)
    expect(isRemovableDate("2026-08-20", today)).toBe(false)
  })
})

describe("todayInTimezone and yesterdayInTimezone", () => {
  it("derive today and yesterday from an injected now", () => {
    const now = new Date("2026-08-16T23:30:00.000Z")

    expect(todayInTimezone("UTC", now)).toBe("2026-08-16")
    expect(yesterdayInTimezone("UTC", now)).toBe("2026-08-15")

    expect(todayInTimezone("Pacific/Auckland", now)).toBe("2026-08-17")
    expect(yesterdayInTimezone("Pacific/Auckland", now)).toBe("2026-08-16")

    expect(todayInTimezone("America/Los_Angeles", now)).toBe("2026-08-16")
    expect(yesterdayInTimezone("America/Los_Angeles", now)).toBe("2026-08-15")
  })
})
