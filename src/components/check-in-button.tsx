"use client"

import { useRouter } from "next/navigation"
import { useState } from "react"

import { cn } from "@/lib/utils"
import { addQuranLog } from "@/server/actions"
import { toast } from "@/components/ui/toast"

export function CheckInButton({ checkedInToday }: { checkedInToday: boolean }) {
  const router = useRouter()
  const [read, setRead] = useState(checkedInToday)

  return (
    <button
      type="button"
      aria-pressed={read}
      disabled={read}
      onClick={async () => {
        const result = await addQuranLog()
        if (!result.ok) {
          if (result.error === "already_exists") {
            setRead(true)
            router.refresh()
            return
          }
          if (result.error === "timezone_missing") {
            router.push("/onboarding")
            return
          }
          console.error("Failed to add quran log:", result.error)
          toast.add({
            type: "error",
            title: "Could not save check-in",
            description: "Please try again",
          })
        } else {
          toast.add({
            type: "success",
            title: "Checked in",
            description: "Come back tomorrow to keep your streak",
          })
          setRead(true)
          router.refresh()
        }
      }}
      className={cn(
        "rounded-lg px-8 py-5 text-lg font-medium tracking-wide transition-colors sm:px-10 sm:py-6 sm:text-xl",
        "outline-none focus-visible:ring-3 focus-visible:ring-ring/50",
        "disabled:pointer-events-none disabled:cursor-default",
        read ? "bg-primary text-primary-foreground" : "bg-muted text-foreground"
      )}
    >
      {read ? "Read today" : "Did you read Quran today?"}
    </button>
  )
}
