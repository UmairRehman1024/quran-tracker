import { currentUser } from "@clerk/nextjs/server"
import { redirect } from "next/navigation"

import { CheckInButton } from "@/components/check-in-button"
import { HomeHeader } from "@/components/home-header"
import { WeeklyCalendar } from "@/components/weekly-calendar"
import { timezoneFromPublicMetadata } from "@/lib/timezone"
import { getHomeData } from "@/server/actions"

const QUOTE =
  "Read the Quran, for indeed it will come on the Day of Resurrection as an intercessor for its companions."

export default async function Page() {
  const user = await currentUser()
  if (user && !timezoneFromPublicMetadata(user.publicMetadata)) {
    redirect("/onboarding")
  }

  const home = await getHomeData()
  const currentStreak = home.ok ? home.currentStreak : 0
  const longestStreak = home.ok ? home.longestStreak : 0
  const checkedInToday = home.ok ? home.checkedInToday : false
  const readDates = home.ok ? home.logDates : []

  return (
    <main className="flex min-h-svh flex-col px-6 py-8 sm:px-10 sm:py-10">
      <HomeHeader currentStreak={currentStreak} longestStreak={longestStreak} />

      <div className="flex flex-1 flex-col items-center justify-center">
        <CheckInButton checkedInToday={checkedInToday} />
      </div>

      <div className="flex w-full flex-1 flex-col items-center">
        <WeeklyCalendar readDates={readDates} />
      </div>

      <footer className="mx-auto w-full max-w-md space-y-5 pb-2">
        <div className="h-px w-full bg-border" />
        <p className="text-center text-sm leading-relaxed font-light text-muted-foreground">
          &ldquo;{QUOTE}&rdquo;
        </p>
      </footer>
    </main>
  )
}
