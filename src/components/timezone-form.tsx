"use client"

import { useState, useSyncExternalStore } from "react"

import { Button } from "@/components/ui/button"
import { saveTimezone } from "@/server/actions"

const emptySubscribe = () => () => {}

function browserTimeZone() {
  return Intl.DateTimeFormat().resolvedOptions().timeZone
}

export function TimezoneForm({ timezones }: { timezones: string[] }) {
  const detected = useSyncExternalStore(
    emptySubscribe,
    browserTimeZone,
    () => timezones[0] ?? "UTC"
  )
  const [selected, setSelected] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)

  const timezone = selected ?? (timezones.includes(detected) ? detected : timezones[0])

  async function action(formData: FormData) {
    setError(null)
    const result = await saveTimezone(formData)
    if (result && !result.ok) {
      setError("Could not save timezone. Please try again.")
    }
  }

  return (
    <form action={action} className="flex w-full max-w-sm flex-col gap-4">
      <label className="flex flex-col gap-2 text-sm">
        <span className="text-muted-foreground">Timezone</span>
        <select
          name="timezone"
          value={timezone}
          onChange={(event) => setSelected(event.target.value)}
          className="h-9 rounded-lg border border-input bg-background px-2.5 text-sm outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50"
        >
          {timezones.map((zone) => (
            <option key={zone} value={zone}>
              {zone}
            </option>
          ))}
        </select>
      </label>
      {error ? (
        <p className="text-sm text-destructive">{error}</p>
      ) : null}
      <Button type="submit" size="lg">
        Continue
      </Button>
    </form>
  )
}
