import { SYLLABUS, type SyllabusStream } from "./syllabus"

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
 * Fixed display order. Physics -> Physical Chem -> Inorganic Chem -> Maths.
 * The scheduler round-robins in this order so Physical and Inorganic
 * chemistry naturally interleave (PC -> IC -> PC ...).
 */
export const STREAM_ORDER = ["physics", "pchem", "ichem", "maths"] as const

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
  pchem: {
    label: "Physical Chemistry",
    short: "PC",
    dot: "bg-amber-500",
    text: "text-amber-300",
    soft: "bg-amber-500/10",
    border: "border-amber-500/40",
    ring: "ring-amber-500/50",
  },
  ichem: {
    label: "Inorganic Chemistry",
    short: "IC",
    dot: "bg-violet-500",
    text: "text-violet-300",
    soft: "bg-violet-500/10",
    border: "border-violet-500/40",
    ring: "ring-violet-500/50",
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
