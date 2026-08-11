"use client"

import { useState } from "react"

import { cn } from "@/lib/utils"
import { addQuranLog } from "../server/actions"
import { toast } from "./ui/toast"


export function CheckInButton() {
  const [read, setRead] = useState(false)

  return (
    <button
      type="button"
      aria-pressed={read}
      disabled={read}//added so no mismatch in client state and db
      onClick={async () => {
        const result = await addQuranLog()
        if (!result.ok) {
          console.error("Failed to add quran log:", result.error)
          toast.add({
            type: "error",
            title: "Failed to add quran log",
            description: "Please try again",
          })
        } else {
          toast.add({
            type: "success",
            title: "Quran log added successfully",
            description: "You can check in again tomorrow",
          })
          setRead(true)
        }
      }}
      className={cn(
        "rounded-lg px-8 py-5 text-lg font-medium tracking-wide transition-colors sm:px-10 sm:py-6 sm:text-xl",
        "outline-none focus-visible:ring-3 focus-visible:ring-ring/50",
        "disabled:pointer-events-none disabled:cursor-default",
        read
          ? "bg-primary text-primary-foreground"
          : "bg-muted text-foreground"
      )}
    >
      Did u read Quran today?
    </button>
  )
}
