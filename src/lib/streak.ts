export function nextStreak(args: {
  currentStreak: number
  longestStreak: number
  hadLogYesterday: boolean
}): { currentStreak: number; longestStreak: number } {
  const currentStreak = args.hadLogYesterday ? args.currentStreak + 1 : 1
  const longestStreak = Math.max(args.longestStreak, currentStreak)
  return { currentStreak, longestStreak }
}

export function effectiveStreak(args: {
  currentStreak: number
  lastLogDate: string | null
  today: string
  yesterday: string
}): number {
  const { currentStreak, lastLogDate, today, yesterday } = args
  if (lastLogDate === today || lastLogDate === yesterday) {
    return currentStreak
  }
  return 0
}
