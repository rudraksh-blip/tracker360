import { SYLLABUS, type SyllabusChapter, type SyllabusStream } from "./syllabus"

export type StreamStyle = {
  label: string
  short: string
  /** solid dot / fill */
  dot: string
  /** text accent */
  text: string
  /** soft translucent background */
  soft: string
  /** border accent */
  border: string
  /** subtle ring for selected chips */
  ring: string
}

/**
 * Fixed display order. Physics -> Chemistry -> Maths.
 * Chemistry is a single subject, so the scheduler round-robins across
 * three streams and each gets an equal share of every day.
 */
export const STREAM_ORDER = ["physics", "chemistry", "maths"] as const

export const STREAM_STYLE: Record<string, StreamStyle> = {
  physics: {
    label: "Physics",
    short: "PHY",
    dot: "bg-sky-500",
    text: "text-sky-300",
    soft: "bg-sky-500/10",
    border: "border-sky-500/40",
    ring: "ring-sky-500/50",
  },
  chemistry: {
    label: "Chemistry",
    short: "CHE",
    dot: "bg-amber-500",
    text: "text-amber-300",
    soft: "bg-amber-500/10",
    border: "border-amber-500/40",
    ring: "ring-amber-500/50",
  },
  maths: {
    label: "Maths",
    short: "MAT",
    dot: "bg-emerald-500",
    text: "text-emerald-300",
    soft: "bg-emerald-500/10",
    border: "border-emerald-500/40",
    ring: "ring-emerald-500/50",
  },
}

export function orderedStreams(): SyllabusStream[] {
  const byId = new Map(SYLLABUS.map((s) => [s.id, s]))
  return STREAM_ORDER.map((id) => byId.get(id)).filter(Boolean) as SyllabusStream[]
}

export function streamLecturesTotal(stream: SyllabusStream): number {
  return stream.chapters.reduce((a, c) => a + c.lectures, 0)
}

/**
 * Return a stream's chapters honoring the user's saved order.
 * Any chapter missing from the saved order keeps its original position
 * at the end, so new syllabus additions never disappear.
 */
export function orderedChapters(stream: SyllabusStream, order?: string[]): SyllabusChapter[] {
  if (!order || order.length === 0) return stream.chapters
  const byId = new Map(stream.chapters.map((c) => [c.id, c]))
  const result: SyllabusChapter[] = []
  for (const id of order) {
    const chapter = byId.get(id)
    if (chapter) {
      result.push(chapter)
      byId.delete(id)
    }
  }
  for (const chapter of stream.chapters) {
    if (byId.has(chapter.id)) result.push(chapter)
  }
  return result
}
