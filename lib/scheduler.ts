import { orderedChapters, orderedStreams, STREAM_STYLE } from "./streams"
import type { LectureItem, Plan, PlanConfig, PlanDay } from "./tracker-types"

export function lectureKey(streamId: string, chapterId: string, lectureNo: number): string {
  return `${streamId}|${chapterId}|${lectureNo}`
}

/** Expand each stream's selected chapters (in the user's order) into a flat lecture queue. */
function buildSequences(config: PlanConfig): LectureItem[][] {
  const selected = config.selected
  const order = config.order ?? {}
  return orderedStreams().map((stream) => {
    const label = STREAM_STYLE[stream.id]?.label ?? stream.subject
    const items: LectureItem[] = []
    for (const chapter of orderedChapters(stream, order[stream.id])) {
      if (!selected[chapter.id]) continue
      for (let n = 1; n <= chapter.lectures; n++) {
        items.push({
          key: lectureKey(stream.id, chapter.id, n),
          streamId: stream.id,
          label,
          chapterId: chapter.id,
          chapterName: chapter.name,
          lectureNo: n,
          chapterTotal: chapter.lectures,
        })
      }
    }
    return items
  })
}

/** Interleave the stream queues one lecture at a time for an even balance. */
function roundRobin(sequences: LectureItem[][]): LectureItem[] {
  const queue: LectureItem[] = []
  const pointers = sequences.map(() => 0)
  let remaining = sequences.reduce((a, s) => a + s.length, 0)
  while (remaining > 0) {
    for (let i = 0; i < sequences.length; i++) {
      const seq = sequences[i]
      if (pointers[i] < seq.length) {
        queue.push(seq[pointers[i]])
        pointers[i]++
        remaining--
      }
    }
  }
  return queue
}

function parseISO(iso: string): Date {
  const [y, m, d] = iso.split("-").map(Number)
  return new Date(y, (m || 1) - 1, d || 1)
}

function toISO(date: Date): string {
  const y = date.getFullYear()
  const m = String(date.getMonth() + 1).padStart(2, "0")
  const d = String(date.getDate()).padStart(2, "0")
  return `${y}-${m}-${d}`
}

function isOffDay(date: Date, config: PlanConfig): boolean {
  const day = date.getDay()
  if (config.excludeSundays && day === 0) return true
  if (config.gapWeekdays.includes(day)) return true
  return false
}

export function generatePlan(config: PlanConfig): Plan {
  const sequences = buildSequences(config)
  const queue = roundRobin(sequences)
  const total = queue.length
  const pushedDates = new Set(config.pushedDates ?? [])
  const pushedLectures = config.pushedLectures ?? {}
  let pending = [...queue]

  let effectiveDaily: number
  if (config.mode === "target") {
    effectiveDaily = Math.max(1, Math.ceil(total / Math.max(1, config.targetDays)))
  } else {
    effectiveDaily = Math.max(1, Math.round(config.lecturesPerDay * config.speed))
  }

  const days: PlanDay[] = []
  const cursor = parseISO(config.startDate)
  let dayCounter = 0
  let mockCounter = 0
  let safety = 0

  while (pending.length > 0 && safety < 20000) {
    safety++
    if (isOffDay(cursor, config)) {
      cursor.setDate(cursor.getDate() + 1)
      continue
    }
    dayCounter++
    // A pushed day rests: no lectures are consumed, so everything shifts forward.
    if (pushedDates.has(toISO(cursor))) {
      days.push({ type: "carry", dayNumber: dayCounter, date: toISO(cursor) })
      cursor.setDate(cursor.getDate() + 1)
      continue
    }
    const isMock = config.mockEvery > 0 && dayCounter % config.mockEvery === 0
    if (isMock) {
      mockCounter++
      days.push({ type: "mock", dayNumber: dayCounter, date: toISO(cursor), mockNumber: mockCounter })
    } else {
      const date = toISO(cursor)
      const due = pending.filter((lecture) => {
        const sourceDate = pushedLectures[lecture.key]
        return !!sourceDate && sourceDate < date
      })
      const dueKeys = new Set(due.map((lecture) => lecture.key))
      const normal = pending.filter((lecture) => !dueKeys.has(lecture.key) && !pushedLectures[lecture.key])
      const dailyLimit = config.dailyLimits?.[date] ?? effectiveDaily
      const lectures = dailyLimit > 0 ? [...due, ...normal].slice(0, dailyLimit) : []
      const lectureKeys = new Set(lectures.map((lecture) => lecture.key))
      pending = pending.filter((lecture) => !lectureKeys.has(lecture.key))
      days.push({ type: "study", dayNumber: dayCounter, date, lectures })
    }
    cursor.setDate(cursor.getDate() + 1)
  }

  const studyDays = days.filter((d) => d.type === "study").length
  const mockDays = days.filter((d) => d.type === "mock").length
  const finishDate = days.length ? days[days.length - 1].date : config.startDate

  return { days, total, effectiveDaily, studyDays, mockDays, finishDate }
}

const WD = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"]
const MO = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"]

export function formatDate(iso: string): string {
  const d = parseISO(iso)
  return `${WD[d.getDay()]}, ${d.getDate()} ${MO[d.getMonth()]} ${d.getFullYear()}`
}

export function formatShort(iso: string): string {
  const d = parseISO(iso)
  return `${d.getDate()} ${MO[d.getMonth()]}`
}

export function todayISO(): string {
  return toISO(new Date())
}
