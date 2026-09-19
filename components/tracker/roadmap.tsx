"use client"

import { CalendarClock, Check, CornerDownRight, FlaskConical, ListChecks, Undo2 } from "lucide-react"
import { useMemo } from "react"
import { formatDate, formatShort, todayISO } from "@/lib/scheduler"
import { STREAM_STYLE } from "@/lib/streams"
import type { LectureItem, Plan, PlanConfig, PlanDay } from "@/lib/tracker-types"
import { cn } from "@/lib/utils"

type Props = {
  plan: Plan
  config: PlanConfig
  done: Record<string, boolean>
  onToggle: (key: string) => void
  onToggleMany: (keys: string[], value: boolean) => void
  onPush: (date: string) => void
}

export function Roadmap({ plan, config, done, onToggle, onToggleMany, onPush }: Props) {
  const today = todayISO()

  const doneCount = useMemo(() => {
    let n = 0
    for (const day of plan.days) {
      if (day.type !== "study") continue
      for (const lec of day.lectures) if (done[lec.key]) n++
    }
    return n
  }, [plan, done])

  const pct = plan.total ? Math.round((doneCount / plan.total) * 100) : 0

  const todayIndex = useMemo(
    () => plan.days.findIndex((d) => d.date >= today),
    [plan, today],
  )

  function jumpToToday() {
    const target = todayIndex >= 0 ? plan.days[todayIndex] : null
    if (!target) return
    document.getElementById(`day-${target.dayNumber}`)?.scrollIntoView({ behavior: "smooth", block: "start" })
  }

  return (
    <div className="flex flex-col gap-5">
      {/* Progress header */}
      <div className="rounded-xl border border-border bg-card p-5">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <div className="text-sm text-muted-foreground">Overall completion</div>
            <div className="mt-1 flex items-baseline gap-2">
              <span className="text-3xl font-bold tabular-nums">{pct}%</span>
              <span className="text-sm text-muted-foreground tabular-nums">
                {doneCount} / {plan.total} lectures
              </span>
            </div>
          </div>
          <div className="flex flex-wrap gap-2">
            <HeaderStat icon={<ListChecks className="size-4" />} value={`${plan.effectiveDaily}/day`} label="pace" />
            <HeaderStat icon={<CalendarClock className="size-4" />} value={`${plan.studyDays}`} label="study days" />
            <HeaderStat icon={<FlaskConical className="size-4" />} value={`${plan.mockDays}`} label="mocks" />
            <button
              type="button"
              onClick={jumpToToday}
              className="rounded-lg border border-primary/50 bg-primary/15 px-3 py-2 text-sm font-medium text-primary transition-colors hover:bg-primary/25"
            >
              Jump to today
            </button>
          </div>
        </div>
        <div className="mt-4 h-2.5 w-full overflow-hidden rounded-full bg-secondary">
          <div
            className="h-full rounded-full bg-primary transition-all"
            style={{ width: `${pct}%` }}
          />
        </div>
        <div className="mt-2 text-xs text-muted-foreground">
          Finishes on {formatDate(plan.finishDate)}
        </div>
      </div>

      {/* Days */}
      <div className="flex flex-col gap-3">
        {plan.days.map((day) => (
          <DayCard
            key={day.dayNumber}
            day={day}
            isToday={day.date === today || (todayIndex >= 0 && plan.days[todayIndex].dayNumber === day.dayNumber)}
            done={done}
            onToggle={onToggle}
            onToggleMany={onToggleMany}
            onPush={onPush}
          />
        ))}
      </div>
    </div>
  )
}

function HeaderStat({ icon, value, label }: { icon: React.ReactNode; value: string; label: string }) {
  return (
    <div className="flex items-center gap-2 rounded-lg border border-border bg-background/40 px-3 py-2">
      <span className="text-muted-foreground">{icon}</span>
      <div className="leading-tight">
        <div className="text-sm font-semibold tabular-nums">{value}</div>
        <div className="text-[11px] text-muted-foreground">{label}</div>
      </div>
    </div>
  )
}

function DayCard({
  day,
  isToday,
  done,
  onToggle,
  onToggleMany,
  onPush,
}: {
  day: PlanDay
  isToday: boolean
  done: Record<string, boolean>
  onToggle: (key: string) => void
  onToggleMany: (keys: string[], value: boolean) => void
  onPush: (date: string) => void
}) {
  if (day.type === "carry") {
    return (
      <section
        id={`day-${day.dayNumber}`}
        className={cn(
          "flex items-center gap-4 rounded-xl border border-dashed border-border bg-secondary/30 p-4",
          isToday && "ring-2 ring-primary/60",
        )}
      >
        <div className="flex size-10 items-center justify-center rounded-lg bg-secondary text-muted-foreground">
          <CornerDownRight className="size-5" />
        </div>
        <div className="flex-1">
          <div className="text-sm font-semibold">Pushed to next day</div>
          <div className="text-xs text-muted-foreground">
            Day {day.dayNumber} · {formatDate(day.date)} · work shifted forward
          </div>
        </div>
        <button
          type="button"
          onClick={() => onPush(day.date)}
          className="flex items-center gap-1.5 rounded-md border border-border px-2.5 py-1 text-xs font-medium text-muted-foreground transition-colors hover:bg-accent/40"
        >
          <Undo2 className="size-3.5" />
          Undo
        </button>
      </section>
    )
  }

  if (day.type === "mock") {
    return (
      <section
        id={`day-${day.dayNumber}`}
        className={cn(
          "flex items-center gap-4 rounded-xl border border-dashed border-rose-500/40 bg-rose-500/5 p-4",
          isToday && "ring-2 ring-rose-500/50",
        )}
      >
        <div className="flex size-10 items-center justify-center rounded-lg bg-rose-500/15 text-rose-300">
          <FlaskConical className="size-5" />
        </div>
        <div className="flex-1">
          <div className="text-sm font-semibold text-rose-200">Mock Test #{day.mockNumber} + Revision</div>
          <div className="text-xs text-muted-foreground">Day {day.dayNumber} · {formatDate(day.date)}</div>
        </div>
        <span className="rounded-md bg-rose-500/15 px-2 py-1 text-xs font-medium text-rose-300">No new lectures</span>
      </section>
    )
  }

  const keys = day.lectures.map((l) => l.key)
  const doneInDay = day.lectures.filter((l) => done[l.key]).length
  const allDone = doneInDay === day.lectures.length && day.lectures.length > 0

  return (
    <section
      id={`day-${day.dayNumber}`}
      className={cn(
        "overflow-hidden rounded-xl border border-border bg-card",
        isToday && "ring-2 ring-primary/60",
        allDone && "opacity-70",
      )}
    >
      <header className="flex items-center gap-3 border-b border-border px-4 py-3">
        <div className="flex size-10 flex-col items-center justify-center rounded-lg bg-secondary leading-none">
          <span className="text-[10px] uppercase text-muted-foreground">Day</span>
          <span className="text-sm font-bold tabular-nums">{day.dayNumber}</span>
        </div>
        <div className="flex-1">
          <div className="flex items-center gap-2">
            <span className="text-sm font-semibold">{formatShort(day.date)}</span>
            {isToday && (
              <span className="rounded-md bg-primary/20 px-1.5 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-primary">
                Today
              </span>
            )}
          </div>
          <div className="text-xs text-muted-foreground">
            {day.lectures.length} lectures · {doneInDay} done
          </div>
        </div>
        <button
          type="button"
          onClick={() => onPush(day.date)}
          title="Move this day's lectures to the next day"
          className="flex items-center gap-1.5 rounded-md border border-border px-2.5 py-1 text-xs font-medium text-muted-foreground transition-colors hover:bg-accent/40"
        >
          <CornerDownRight className="size-3.5" />
          <span className="hidden sm:inline">Push to tomorrow</span>
        </button>
        <button
          type="button"
          onClick={() => onToggleMany(keys, !allDone)}
          className={cn(
            "rounded-md border px-2.5 py-1 text-xs font-medium transition-colors",
            allDone
              ? "border-primary/50 bg-primary/15 text-primary"
              : "border-border text-muted-foreground hover:bg-accent/40",
          )}
        >
          {allDone ? "Day done" : "Mark all"}
        </button>
      </header>
      <div className="flex flex-col divide-y divide-border/60">
        {day.lectures.map((lec) => (
          <LectureRow key={lec.key} lec={lec} done={!!done[lec.key]} onToggle={() => onToggle(lec.key)} />
        ))}
      </div>
    </section>
  )
}

function LectureRow({ lec, done, onToggle }: { lec: LectureItem; done: boolean; onToggle: () => void }) {
  const style = STREAM_STYLE[lec.streamId]
  return (
    <button
      type="button"
      onClick={onToggle}
      className="flex items-center gap-3 px-4 py-2.5 text-left transition-colors hover:bg-accent/30"
    >
      <span
        className={cn(
          "flex size-5 shrink-0 items-center justify-center rounded-md border transition-colors",
          done ? cn(style.dot, "border-transparent text-black") : "border-muted-foreground/40",
        )}
      >
        {done && <Check className="size-3.5" strokeWidth={3} />}
      </span>
      <span className={cn("hidden shrink-0 rounded px-1.5 py-0.5 text-[10px] font-semibold sm:inline-block", style.soft, style.text)}>
        {style.short}
      </span>
      <div className={cn("min-w-0 flex-1", done && "line-through opacity-60")}>
        <div className="truncate text-sm font-medium">{lec.chapterName}</div>
        <div className="text-xs text-muted-foreground">
          {style.label} · Lecture {lec.lectureNo}/{lec.chapterTotal}
        </div>
      </div>
    </button>
  )
}
