"use client"

import { UserButton, useUser } from "@clerk/nextjs"

function daysLabel(count: number) {
  return count === 1 ? "day" : "days"
}

export function HomeHeader({
  currentStreak,
  longestStreak,
}: {
  currentStreak: number
  longestStreak: number
}) {
  const user = useUser()
  return (
    <header className="relative">
      <div className="min-w-0 text-center">
        <p className="text-base font-light tracking-wide text-muted-foreground">
          Hi {user.user?.firstName ?? "there"},
        </p>
        <h1 className="mt-1 text-4xl font-extrabold tracking-tight sm:text-5xl">
          You have read Quran for{" "}
          <span className="text-foreground">
            {currentStreak} {daysLabel(currentStreak)}
          </span>
        </h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Best streak: {longestStreak} {daysLabel(longestStreak)}
        </p>
      </div>
      <div className="absolute top-0 right-0">
        <UserButton />
      </div>
    </header>
  )
}
