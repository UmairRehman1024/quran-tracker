import { CheckInButton } from "@/components/check-in-button"
import { HomeHeader } from "@/components/home-header"
import { getHomeStreak } from "@/server/actions"

const QUOTE =
  "Read the Quran, for indeed it will come on the Day of Resurrection as an intercessor for its companions."

export default async function Page() {
  const streak = await getHomeStreak()
  const currentStreak = streak.ok ? streak.currentStreak : 0
  const checkedInToday = streak.ok ? streak.checkedInToday : false

  return (
    <main className="flex min-h-svh flex-col px-6 py-8 sm:px-10 sm:py-10">
      <HomeHeader day={currentStreak} />

      <div className="flex flex-1 flex-col items-center justify-center">
        <CheckInButton checkedInToday={checkedInToday} />
      </div>

      <footer className="mx-auto w-full max-w-md space-y-5 pb-2">
        <div className="h-px w-full bg-border" />
        <p className="text-center text-sm font-light leading-relaxed text-muted-foreground">
          &ldquo;{QUOTE}&rdquo;
        </p>
      </footer>
    </main>
  )
}
