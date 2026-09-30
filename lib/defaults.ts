import { SYLLABUS } from "./syllabus"
import { todayISO } from "./scheduler"
import type { PlanConfig } from "./tracker-types"

export function allSelected(): Record<string, boolean> {
  const map: Record<string, boolean> = {}
  for (const stream of SYLLABUS) {
    for (const chapter of stream.chapters) {
      map[chapter.id] = true
    }
  }
  return map
}

export function defaultConfig(): PlanConfig {
  return {
    selected: allSelected(),
    startDate: todayISO(),
    mode: "pace",
    lecturesPerDay: 4,
    speed: 1.25,
    targetDays: 60,
    excludeSundays: true,
    gapWeekdays: [],
    mockEvery: 14,
    order: {},
    pushedDates: [],
    pushedLectures: {},
    dailyLimits: {},
  }
}

export const SPEED_OPTIONS = [1, 1.25, 1.5, 1.75, 2] as const
