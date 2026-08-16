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
