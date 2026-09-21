"use client"

import { ArrowLeft, ArrowRight, RotateCcw, Sparkles } from "lucide-react"
import { useMemo } from "react"
import { BacklogStep } from "@/components/tracker/backlog-step"
import { Roadmap } from "@/components/tracker/roadmap"
import { TimelineStep } from "@/components/tracker/timeline-step"
import { defaultConfig } from "@/lib/defaults"
import { generatePlan } from "@/lib/scheduler"
import { usePersistentState } from "@/lib/use-persistent-state"
import type { PlanConfig } from "@/lib/tracker-types"
import { cn } from "@/lib/utils"

type Phase = 0 | 1 | 2

const STEPS = ["Backlog", "Timeline", "Roadmap"]

export default function Page() {
  const [config, setConfig, cfgReady] = usePersistentState<PlanConfig>("bos.config.v1", defaultConfig())
  const [done, setDone, doneReady] = usePersistentState<Record<string, boolean>>("bos.done.v1", {})
  const [phase, setPhase] = usePersistentState<Phase>("bos.phase.v1", 0)

  const plan = useMemo(() => generatePlan(config), [config])

  function toggle(key: string) {
    setDone((prev) => ({ ...prev, [key]: !prev[key] }))
  }

  function toggleMany(keys: string[], value: boolean) {
    setDone((prev) => {
      const next = { ...prev }
      for (const k of keys) next[k] = value
      return next
    })
  }

  function togglePush(date: string) {
    setConfig((prev) => {
      const pushed = prev.pushedDates ?? []
      const has = pushed.includes(date)
      return {
        ...prev,
        pushedDates: has ? pushed.filter((d) => d !== date) : [...pushed, date],
      }
    })
  }

  function pushAgain(date: string) {
    const current = new Date(`${date}T12:00:00`)
    current.setDate(current.getDate() + 1)
    const nextDate = current.toISOString().slice(0, 10)
    setConfig((prev) => ({
      ...prev,
      pushedDates: Array.from(new Set([...(prev.pushedDates ?? []), nextDate])),
    }))
  }

  function toggleLecturePush(key: string, date: string) {
    setConfig((prev) => ({
      ...prev,
      // Always use the lecture's current day as the new source date. This
      // allows the same lecture to be pushed repeatedly across multiple days.
      pushedLectures: { ...(prev.pushedLectures ?? {}), [key]: date },
    }))
  }

  function resetAll() {
    setConfig(defaultConfig())
    setDone({})
    setPhase(0)
  }

  if (!cfgReady || !doneReady) {
    return (
      <main className="flex min-h-dvh items-center justify-center text-sm text-muted-foreground">
        Loading your tracker…
      </main>
    )
  }

  return (
    <main className="mx-auto flex min-h-dvh w-full max-w-4xl flex-col gap-6 px-4 py-6 md:py-10">
      <header className="flex items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="flex size-10 items-center justify-center rounded-xl bg-primary/15 text-primary">
            <Sparkles className="size-5" />
          </div>
          <div>
            <h1 className="text-lg font-semibold tracking-tight">Backlog OS</h1>
            <p className="text-xs text-muted-foreground">JEE 2027 · Arjuna · personal backlog planner</p>
          </div>
        </div>
        <button
          type="button"
          onClick={resetAll}
          className="flex items-center gap-1.5 rounded-lg border border-border px-3 py-2 text-xs text-muted-foreground transition-colors hover:bg-accent/40"
        >
          <RotateCcw className="size-3.5" />
          Reset
        </button>
      </header>

      <Stepper phase={phase} onSelect={(p) => setPhase(p)} />

      <div className="flex-1">
        {phase === 0 && <BacklogStep config={config} onChange={setConfig} />}
        {phase === 1 && <TimelineStep config={config} plan={plan} onChange={setConfig} />}
        {phase === 2 && (
          <Roadmap
            plan={plan}
            config={config}
            done={done}
            onToggle={toggle}
            onToggleMany={toggleMany}
            onPush={togglePush}
            onPushAgain={pushAgain}
            onPushLecture={toggleLecturePush}
          />
        )}
      </div>

      <footer className="sticky bottom-4 z-10 flex items-center justify-between gap-3 rounded-xl border border-border bg-card/90 p-3 backdrop-blur">
        <button
          type="button"
          disabled={phase === 0}
          onClick={() => setPhase((Math.max(0, phase - 1) as Phase))}
          className={cn(
            "flex items-center gap-1.5 rounded-lg border border-border px-4 py-2 text-sm font-medium transition-colors",
            phase === 0 ? "cursor-not-allowed opacity-40" : "hover:bg-accent/40",
          )}
        >
          <ArrowLeft className="size-4" />
          Back
        </button>
        <div className="text-xs text-muted-foreground tabular-nums">
          {plan.total} lectures · {plan.studyDays + plan.mockDays} days
        </div>
        {phase < 2 ? (
          <button
            type="button"
            onClick={() => setPhase((Math.min(2, phase + 1) as Phase))}
            className="flex items-center gap-1.5 rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground transition-colors hover:bg-primary/90"
          >
            {phase === 1 ? "Generate roadmap" : "Next"}
            <ArrowRight className="size-4" />
          </button>
        ) : (
          <button
            type="button"
            onClick={() => setPhase(0)}
            className="flex items-center gap-1.5 rounded-lg border border-border px-4 py-2 text-sm font-medium transition-colors hover:bg-accent/40"
          >
            Edit plan
          </button>
        )}
      </footer>
    </main>
  )
}

function Stepper({ phase, onSelect }: { phase: Phase; onSelect: (p: Phase) => void }) {
  return (
    <nav className="flex items-center gap-2">
      {STEPS.map((label, i) => {
        const active = i === phase
        const complete = i < phase
        return (
          <button
            key={label}
            type="button"
            onClick={() => onSelect(i as Phase)}
            className={cn(
              "flex flex-1 items-center gap-2 rounded-lg border px-3 py-2 text-sm transition-colors",
              active
                ? "border-primary bg-primary/15 text-foreground"
                : complete
                  ? "border-border bg-card text-foreground hover:bg-accent/40"
                  : "border-border text-muted-foreground hover:bg-accent/40",
            )}
          >
            <span
              className={cn(
                "flex size-6 shrink-0 items-center justify-center rounded-full text-xs font-semibold tabular-nums",
                active ? "bg-primary text-primary-foreground" : complete ? "bg-primary/30 text-foreground" : "bg-secondary text-muted-foreground",
              )}
            >
              {i + 1}
            </span>
            <span className="hidden sm:inline">{label}</span>
          </button>
        )
      })}
    </nav>
  )
}
