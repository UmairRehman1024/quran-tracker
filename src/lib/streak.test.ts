import { describe, expect, it } from "vitest"

import { currentStreak, longestStreak } from "@/lib/streak"

describe("currentStreak", () => {
  it("is 0 when there are no logs", () => {
    expect(currentStreak([], "2026-08-17", "2026-08-16")).toBe(0)
  })

  it("is 0 when the last log is older than yesterday", () => {
    expect(
      currentStreak(["2026-08-14", "2026-08-13"], "2026-08-17", "2026-08-16")
    ).toBe(0)
  })

  it("is 1 when only today is logged", () => {
    expect(currentStreak(["2026-08-17"], "2026-08-17", "2026-08-16")).toBe(1)
  })

  it("counts a streak that has not been checked in yet today", () => {
    expect(
      currentStreak(["2026-08-16", "2026-08-15"], "2026-08-17", "2026-08-16")
    ).toBe(2)
  })

  it("counts consecutive days ending today", () => {
    expect(
      currentStreak(
        ["2026-08-17", "2026-08-16", "2026-08-15"],
        "2026-08-17",
        "2026-08-16"
      )
    ).toBe(3)
  })

  it("stops at a gap even if older days exist", () => {
    expect(
      currentStreak(
        ["2026-08-17", "2026-08-16", "2026-08-13", "2026-08-12"],
        "2026-08-17",
        "2026-08-16"
      )
    ).toBe(2)
  })

  it("crosses a month boundary", () => {
    expect(
      currentStreak(["2026-03-01", "2026-02-28"], "2026-03-01", "2026-02-28")
    ).toBe(2)
  })

  it("ignores duplicate dates", () => {
    expect(
      currentStreak(
        ["2026-08-17", "2026-08-17", "2026-08-16"],
        "2026-08-17",
        "2026-08-16"
      )
    ).toBe(2)
  })
})

describe("longestStreak", () => {
  it("is 0 for an empty list", () => {
    expect(longestStreak([])).toBe(0)
  })

  it("is 1 for a single day", () => {
    expect(longestStreak(["2026-08-17"])).toBe(1)
  })

  it("counts unsorted consecutive days", () => {
    expect(longestStreak(["2026-08-16", "2026-08-14", "2026-08-15"])).toBe(3)
  })

  it("returns the longest run when there are multiple gaps", () => {
    expect(
      longestStreak([
        "2026-08-01",
        "2026-08-02",
        "2026-08-05",
        "2026-08-06",
        "2026-08-07",
        "2026-08-08",
        "2026-08-10",
      ])
    ).toBe(4)
  })

  it("deduplicates dates", () => {
    expect(
      longestStreak(["2026-08-15", "2026-08-16", "2026-08-16", "2026-08-17"])
    ).toBe(3)
  })

  it("crosses a year boundary", () => {
    expect(longestStreak(["2025-12-31", "2026-01-01", "2026-01-02"])).toBe(3)
  })

  it("handles a leap-day run", () => {
    expect(longestStreak(["2024-02-28", "2024-02-29", "2024-03-01"])).toBe(3)
  })
})
