const REGION_LABELS: Record<string, string> = {
  Africa: "Africa",
  America: "Americas",
  Antarctica: "Antarctica",
  Arctic: "Arctic",
  Asia: "Asia",
  Atlantic: "Atlantic",
  Australia: "Australia",
  Europe: "Europe",
  Indian: "Indian Ocean",
  Pacific: "Pacific",
  Etc: "Other",
}

const timeFormatterCache = new Map<string, Intl.DateTimeFormat>()
const nameFormatterCache = new Map<string, Intl.DateTimeFormat>()

export type TimezoneItem = {
  value: string
  label: string
  city: string
  region: string
}

export type TimezoneGroup = {
  value: string
  items: TimezoneItem[]
}

export type TimezoneDisplayMeta = {
  time: string
  abbreviation: string | null
  offset: string
}

export function isValidTimeZone(timeZone: string): boolean {
  try {
    Intl.DateTimeFormat(undefined, { timeZone })
    return true
  } catch {
    return false
  }
}

export function timezoneFromPublicMetadata(
  metadata: UserPublicMetadata
): string | null {
  const timezone = metadata.timezone
  if (typeof timezone !== "string" || !isValidTimeZone(timezone)) {
    return null
  }
  return timezone
}

function titleFromIanaSegment(segment: string) {
  return segment.replaceAll("_", " ")
}

export function parseTimeZoneId(id: string): TimezoneItem {
  const [regionKey, ...rest] = id.split("/")
  const city = titleFromIanaSegment(rest.at(-1) ?? id)
  const region = REGION_LABELS[regionKey] ?? regionKey

  return {
    value: id,
    label: city,
    city,
    region,
  }
}

export function groupTimeZones(ids: string[]): TimezoneGroup[] {
  const groups = new Map<string, TimezoneItem[]>()

  for (const id of ids) {
    const item = parseTimeZoneId(id)
    const items = groups.get(item.region) ?? []
    items.push(item)
    groups.set(item.region, items)
  }

  return [...groups.entries()]
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([region, items]) => ({
      value: region,
      items: items.sort((a, b) => a.city.localeCompare(b.city)),
    }))
}

function getTimeFormatter(timeZone: string) {
  let formatter = timeFormatterCache.get(timeZone)
  if (!formatter) {
    formatter = new Intl.DateTimeFormat("en-US", {
      timeZone,
      hour: "numeric",
      minute: "2-digit",
    })
    timeFormatterCache.set(timeZone, formatter)
  }
  return formatter
}

function getNameFormatter(timeZone: string, timeZoneName: "short" | "shortOffset") {
  const key = `${timeZone}:${timeZoneName}`
  let formatter = nameFormatterCache.get(key)
  if (!formatter) {
    formatter = new Intl.DateTimeFormat("en-US", { timeZone, timeZoneName })
    nameFormatterCache.set(key, formatter)
  }
  return formatter
}

function timeZoneNamePart(
  timeZone: string,
  now: Date,
  timeZoneName: "short" | "shortOffset"
) {
  return (
    getNameFormatter(timeZone, timeZoneName)
      .formatToParts(now)
      .find((part) => part.type === "timeZoneName")?.value ?? ""
  )
}

export function timeZoneDisplayMeta(
  timeZone: string,
  now: Date
): TimezoneDisplayMeta {
  const time = getTimeFormatter(timeZone).format(now)
  const offset = timeZoneNamePart(timeZone, now, "shortOffset")
  const abbreviation = timeZoneNamePart(timeZone, now, "short")
  const named =
    abbreviation &&
    !abbreviation.startsWith("GMT") &&
    !abbreviation.startsWith("UTC")
      ? abbreviation
      : null

  return { time, abbreviation: named, offset }
}

export function timezoneMatchesQuery(
  item: TimezoneItem,
  query: string,
  now: Date
) {
  const normalized = query.trim().toLowerCase().replaceAll(/\s+/g, " ")
  if (!normalized) return true

  const meta = timeZoneDisplayMeta(item.value, now)
  const haystack = [
    item.value,
    item.city,
    item.region,
    item.value.replaceAll(/[_/]/g, " "),
    meta.abbreviation,
    meta.offset,
    meta.offset.replace("GMT", "UTC"),
  ]
    .filter(Boolean)
    .join(" ")
    .toLowerCase()

  return haystack.includes(normalized)
}
