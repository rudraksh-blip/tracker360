export type PlanMode = "pace" | "target"

export type PlanConfig = {
  /** chapterId -> selected for backlog */
  selected: Record<string, boolean>
  /** ISO yyyy-mm-dd */
  startDate: string
  mode: PlanMode
  /** base lectures per day (pace mode) */
  lecturesPerDay: number
  /** interchangeable speed multiplier (pace mode) */
  speed: number
  /** finish selected lectures within this many study days (target mode) */
  targetDays: number
  /** skip Sundays when laying out dates */
  excludeSundays: boolean
  /** extra weekly off days, 0=Sun ... 6=Sat */
  gapWeekdays: number[]
  /** every Nth active day becomes a mock/revision day. 0 = off */
  mockEvery: number
  /** subjectId -> ordered chapterIds (user-reorderable) */
  order: Record<string, string[]>
  /** ISO dates the user pushed — that day rests and its work shifts forward */
  pushedDates: string[]
}

export type LectureItem = {
  key: string
  streamId: string
  label: string
  chapterId: string
  chapterName: string
  lectureNo: number
  chapterTotal: number
}

export type PlanDay =
  | { type: "study"; dayNumber: number; date: string; lectures: LectureItem[] }
  | { type: "mock"; dayNumber: number; date: string; mockNumber: number }
  | { type: "carry"; dayNumber: number; date: string }

export type Plan = {
  days: PlanDay[]
  total: number
  effectiveDaily: number
  studyDays: number
  mockDays: number
  finishDate: string
}
