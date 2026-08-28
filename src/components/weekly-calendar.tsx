"use client"

import * as React from "react"
import { ChevronLeft, ChevronRight } from "lucide-react"
import { useRouter } from "next/navigation"
import { Week, type WeekProps } from "react-day-picker"
import { addWeeks, format, isSameWeek, subWeeks } from "date-fns"

import { Button } from "@/components/ui/button"
import { Calendar, CalendarDayButton } from "@/components/ui/calendar"
import { toast } from "@/components/ui/toast"
import { cn } from "@/lib/utils"
import { addQuranLogForDate, removeQuranLogForDate } from "@/server/actions"

export function WeeklyCalendar({
  readDates,
  today,
}: {
  readDates: string[]
  today: string
}) {
  const router = useRouter()
  const [week, setWeek] = React.useState<Date>(() => new Date())
  const [loadingDate, setLoadingDate] = React.useState<string | null>(null)
  const readSet = new Set(readDates)

  const handleDayClick = React.useCallback(
    async (dateStr: string, isRead: boolean) => {
      if (!today || dateStr > today || loadingDate) return
      if (isRead && dateStr >= today) return

      setLoadingDate(dateStr)

      try {
        if (isRead) {
          const result = await removeQuranLogForDate(dateStr)
          if (!result.ok) {
            if (result.error === "timezone_missing") {
              router.push("/onboarding")
              return
            }
            toast.add({
              type: "error",
              title: "Could not remove check-in",
              description: "Please try again",
            })
            return
          }

          toast.add({
            type: "success",
            title: "Check-in removed",
            description: format(new Date(`${dateStr}T12:00:00`), "MMM d, yyyy"),
          })
        } else {
          const result = await addQuranLogForDate(dateStr)
          if (!result.ok) {
            if (result.error === "timezone_missing") {
              router.push("/onboarding")
              return
            }
            if (result.error === "already_exists") {
              router.refresh()
              return
            }
            toast.add({
              type: "error",
              title: "Could not save check-in",
              description: "Please try again",
            })
            return
          }

          toast.add({
            type: "success",
            title: "Check-in saved",
            description: format(new Date(`${dateStr}T12:00:00`), "MMM d, yyyy"),
          })
        }

        router.refresh()
      } finally {
        setLoadingDate(null)
      }
    },
    [today, loadingDate, router]
  )

  const handlePrevWeek = () => {
    setWeek((prev) => subWeeks(prev, 1))
  }

  const handleNextWeek = () => {
    setWeek((prev) => addWeeks(prev, 1))
  }

  return (
    <div className="w-[280px] space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-sm font-semibold">{format(week, "MMMM yyyy")}</h2>
        <div className="flex gap-1">
          <Button
            variant="outline"
            size="icon"
            className="h-7 w-7"
            aria-label="Previous week"
            onClick={handlePrevWeek}
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <Button
            variant="outline"
            size="icon"
            className="h-7 w-7"
            aria-label="Next week"
            onClick={handleNextWeek}
          >
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      </div>

      <Calendar
        month={week}
        onMonthChange={setWeek}
        hideNavigation
        disableNavigation
        onDayClick={(date) => {
          const dateStr = format(date, "yyyy-MM-dd")
          void handleDayClick(dateStr, readSet.has(dateStr))
        }}
        disabled={(date) => !today || format(date, "yyyy-MM-dd") > today}
        modifiers={{
          read: (date) => readSet.has(format(date, "yyyy-MM-dd")),
        }}
        modifiersClassNames={{
          read: "bg-primary text-primary-foreground rounded-(--cell-radius)",
        }}
        className="w-full rounded-md border shadow"
        classNames={{
          root: "w-full",
          month: "w-full",
          month_caption: "hidden",
          nav: "hidden",
          disabled: "opacity-50 cursor-default",
        }}
        components={{
          DayButton: ({ day, modifiers, ...props }) => {
            const dateStr = format(day.date, "yyyy-MM-dd")
            const isFuture = !today || dateStr > today
            const isRead = readSet.has(dateStr)
            const isLoading = loadingDate === dateStr
            const isInteractive =
              !isFuture && !isLoading && (!isRead || dateStr < today)

            return (
              <CalendarDayButton
                day={day}
                modifiers={modifiers}
                {...props}
                disabled={Boolean(props.disabled) || isLoading}
                aria-label={
                  isRead
                    ? `Read on ${dateStr}${dateStr < today ? ", tap to remove" : ""}`
                    : isFuture
                      ? `${dateStr}, future day`
                      : `Log reading for ${dateStr}`
                }
                className={cn(
                  props.className,
                  isInteractive &&
                    "cursor-pointer hover:ring-2 hover:ring-ring/50",
                  isRead &&
                    dateStr < today &&
                    "hover:bg-primary/80 hover:text-primary-foreground"
                )}
              />
            )
          },
          Week: (props: WeekProps) => {
            const isRowInCurrentWeek = props.week.days.some((day) =>
              isSameWeek(day.date, week, { weekStartsOn: 0 })
            )

            if (!isRowInCurrentWeek) {
              return <tr aria-hidden className="hidden" />
            }

            return <Week {...props} />
          },
        }}
      />
    </div>
  )
}
