"use client"

import { UserButton, useUser } from "@clerk/nextjs"

export function HomeHeader({ day }: { day: number }) {

  const user = useUser()
  return (
    <header className="relative">
      <div className="min-w-0 text-center">
        <p className="text-base font-light tracking-wide text-muted-foreground">
        Hi {user.user?.firstName ?? "there"},
        </p>
        <h1 className="mt-1 text-4xl font-extrabold tracking-tight sm:text-5xl">
          You have read Quran for <span className="text-foreground">{day} days</span>
        </h1>
      </div>
      <div className="absolute top-0 right-0">
        <UserButton />
      </div>
    </header>
  )
}
