"use client"

import { useEffect, useMemo, useState, useSyncExternalStore } from "react"
import { CheckIcon, GlobeIcon } from "lucide-react"

import { Button } from "@/components/ui/button"
import {
  Combobox,
  ComboboxCollection,
  ComboboxContent,
  ComboboxEmpty,
  ComboboxGroup,
  ComboboxInput,
  ComboboxItem,
  ComboboxLabel,
  ComboboxList,
  ComboboxSeparator,
} from "@/components/ui/combobox"
import { InputGroupAddon } from "@/components/ui/input-group"
import {
  groupTimeZones,
  parseTimeZoneId,
  timeZoneDisplayMeta,
  timezoneMatchesQuery,
  type TimezoneGroup,
  type TimezoneItem,
} from "@/lib/timezone"
import { cn } from "@/lib/utils"
import { saveTimezone } from "@/server/actions"

const emptySubscribe = () => () => {}

function browserTimeZone() {
  return Intl.DateTimeFormat().resolvedOptions().timeZone
}

function findTimezoneItem(groups: TimezoneGroup[], id: string | null) {
  if (!id) return null
  for (const group of groups) {
    const match = group.items.find((item) => item.value === id)
    if (match) return match
  }
  return parseTimeZoneId(id)
}

function TimezoneMetaLine({
  item,
  now,
}: {
  item: TimezoneItem
  now: Date | null
}) {
  if (!now) {
    return (
      <span className="text-xs text-muted-foreground">
        {item.region}
      </span>
    )
  }

  const meta = timeZoneDisplayMeta(item.value, now)
  return (
    <span className="text-xs text-muted-foreground">
      {[item.region, meta.abbreviation, meta.offset].filter(Boolean).join(" · ")}
    </span>
  )
}

function TimezoneOptionRow({
  item,
  now,
}: {
  item: TimezoneItem
  now: Date | null
}) {
  const time = now ? timeZoneDisplayMeta(item.value, now).time : null

  return (
    <span className="flex min-w-0 flex-1 items-baseline justify-between gap-3">
      <span className="flex min-w-0 flex-col">
        <span className="truncate font-medium">{item.city}</span>
        <TimezoneMetaLine item={item} now={now} />
      </span>
      {time ? (
        <span className="shrink-0 font-mono text-xs tabular-nums text-muted-foreground">
          {time}
        </span>
      ) : null}
    </span>
  )
}

export function TimezoneForm({ timezones }: { timezones: string[] }) {
  const groups = useMemo(() => groupTimeZones(timezones), [timezones])
  const detectedId = useSyncExternalStore(
    emptySubscribe,
    browserTimeZone,
    () => timezones[0] ?? "UTC"
  )
  const detected = useMemo(
    () => findTimezoneItem(groups, detectedId),
    [detectedId, groups]
  )
  const [selectedId, setSelectedId] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [now, setNow] = useState<Date | null>(null)

  const timezoneId =
    selectedId ??
    (timezones.includes(detectedId) ? detectedId : (timezones[0] ?? "UTC"))
  const selected = findTimezoneItem(groups, timezoneId)
  const usingDetected = selected?.value === detected?.value

  useEffect(() => {
    setNow(new Date())
    const id = window.setInterval(() => setNow(new Date()), 30_000)
    return () => window.clearInterval(id)
  }, [])

  async function action(formData: FormData) {
    setError(null)
    const result = await saveTimezone(formData)
    if (result && !result.ok) {
      setError("Could not save timezone. Please try again.")
    }
  }

  return (
    <form action={action} className="flex w-full max-w-md flex-col gap-5">
      <input type="hidden" name="timezone" value={timezoneId} />

      {detected ? (
        <button
          type="button"
          aria-pressed={usingDetected}
          onClick={() => setSelectedId(detected.value)}
          className={cn(
            "flex w-full items-center gap-3 rounded-xl border bg-card px-3 py-3 text-left transition-colors",
            usingDetected
              ? "border-primary/40 ring-3 ring-ring/30"
              : "border-border hover:bg-muted/50"
          )}
        >
          <span className="flex size-8 shrink-0 items-center justify-center rounded-lg bg-muted">
            {usingDetected ? (
              <CheckIcon className="size-4 text-primary" />
            ) : (
              <GlobeIcon className="size-4 text-muted-foreground" />
            )}
          </span>
          <span className="min-w-0 flex-1">
            <span className="block text-xs text-muted-foreground">
              {usingDetected ? "Using time on this device" : "Suggested from this device"}
            </span>
            <TimezoneOptionRow item={detected} now={now} />
          </span>
        </button>
      ) : null}

      <div className="flex flex-col gap-2">
        <label htmlFor="timezone-search" className="text-sm text-muted-foreground">
          Or search for a city
        </label>
        <Combobox
          items={groups}
          value={selected}
          onValueChange={(item) => {
            if (item && "value" in item && !("items" in item)) {
              setSelectedId(item.value)
            }
          }}
          isItemEqualToValue={(itemValue, value) =>
            Boolean(
              itemValue &&
                value &&
                "value" in itemValue &&
                "value" in value &&
                itemValue.value === value.value
            )
          }
          itemToStringLabel={(item) =>
            item && "city" in item ? item.city : ""
          }
          itemToStringValue={(item) =>
            item && "value" in item ? item.value : ""
          }
          filter={(item, query) => {
            if (!item) return false
            if ("items" in item) return true
            if (!("city" in item)) return false
            return timezoneMatchesQuery(item, query, now ?? new Date())
          }}
          autoHighlight
        >
          <ComboboxInput
            id="timezone-search"
            placeholder="Start typing a city..."
            className="h-9 w-full"
            showClear
          >
            <InputGroupAddon align="inline-start">
              <GlobeIcon />
            </InputGroupAddon>
          </ComboboxInput>
          <ComboboxContent className="min-w-(--anchor-width)">
            <ComboboxEmpty>No matching city or timezone.</ComboboxEmpty>
            <ComboboxList>
              {(group: TimezoneGroup) => (
                <ComboboxGroup
                  key={group.value}
                  items={group.items}
                  className="last:[&_[data-slot=combobox-separator]]:hidden"
                >
                  <ComboboxLabel>{group.value}</ComboboxLabel>
                  <ComboboxCollection>
                    {(item: TimezoneItem) => (
                      <ComboboxItem
                        key={item.value}
                        value={item}
                        className="items-start py-2"
                      >
                        <TimezoneOptionRow item={item} now={now} />
                      </ComboboxItem>
                    )}
                  </ComboboxCollection>
                  <ComboboxSeparator />
                </ComboboxGroup>
              )}
            </ComboboxList>
          </ComboboxContent>
        </Combobox>
      </div>

      {selected && now ? (
        <p className="text-sm text-muted-foreground">
          Your reading day starts at midnight in {selected.city}. It is{" "}
          <span className="font-medium text-foreground">
            {timeZoneDisplayMeta(selected.value, now).time}
          </span>{" "}
          there now.
        </p>
      ) : null}

      {error ? <p className="text-sm text-destructive">{error}</p> : null}

      <Button type="submit" size="lg">
        Continue
      </Button>
    </form>
  )
}
