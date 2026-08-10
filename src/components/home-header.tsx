"use client"

import { UserButton } from "@clerk/nextjs"

export function HomeHeader() {
  return (
    <header className="flex items-start justify-between gap-4">
      <div className="min-w-0">
        <p className="text-base font-light tracking-wide text-muted-foreground">
          Hi Umair,
        </p>
        <h1 className="mt-1 text-4xl font-extrabold tracking-tight sm:text-5xl">
          Day <span className="text-foreground">73</span>
        </h1>
      </div>
      <UserButton />
    </header>
  )
}
