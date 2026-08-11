"use client"

import * as React from "react"
import { ChevronLeft, ChevronRight } from "lucide-react"
import { Week, type WeekProps } from "react-day-picker"
import { addWeeks, format, isSameWeek, subWeeks } from "date-fns"

import { Button } from "@/components/ui/button"
import { Calendar } from "@/components/ui/calendar"

export function WeeklyCalendar({ readDates }: { readDates: string[] }) {
  const [week, setWeek] = React.useState<Date>(() => new Date())
  const readSet = new Set(readDates)

  const handlePrevWeek = () => {
    setWeek((prev) => subWeeks(prev, 1))
  }

  const handleNextWeek = () => {
    setWeek((prev) => addWeeks(prev, 1))
  }

  return (
    <div className="w-[280px] space-y-4">
      {/* Custom Header for Week-by-Week Navigation */}
      <div className="flex items-center justify-between">
        <h2 className="text-sm font-semibold">
          {format(week, "MMMM yyyy")}
        </h2>
        <div className="flex gap-1">
          <Button
            variant="outline"
            size="icon"
            className="h-7 w-7"
            onClick={handlePrevWeek}
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <Button
            variant="outline"
            size="icon"
            className="h-7 w-7"
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
        }}
        components={{
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
