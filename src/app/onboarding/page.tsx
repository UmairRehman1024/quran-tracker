import { currentUser } from "@clerk/nextjs/server"
import { redirect } from "next/navigation"

import { TimezoneForm } from "@/components/timezone-form"
import { timezoneFromPublicMetadata } from "@/lib/timezone"

export default async function OnboardingPage() {
  const user = await currentUser()
  if (user && timezoneFromPublicMetadata(user.publicMetadata)) {
    redirect("/")
  }

  return (
    <main className="flex min-h-svh flex-col items-center justify-center px-6 py-8">
      <div className="flex w-full max-w-md flex-col items-center gap-6">
        <div className="space-y-2 text-center">
          <h1 className="text-2xl font-semibold tracking-tight">
            Choose your timezone
          </h1>
          <p className="text-sm text-muted-foreground">
            Streaks count by your local calendar day. Pick the city you are in.
          </p>
        </div>
        <TimezoneForm timezones={Intl.supportedValuesOf("timeZone")} />
      </div>
    </main>
  )
}
