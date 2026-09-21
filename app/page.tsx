"use client"

import { ArrowLeft, ArrowRight, CalendarDays, Home, LayoutList, RotateCcw, Sparkles, Target, TimerReset } from "lucide-react"
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

  function togglePush(date: string, keys: string[]) {
    setConfig((prev) => {
      const pushed = prev.pushedDates ?? []
      const has = pushed.includes(date)
      const pushedLectures = { ...(prev.pushedLectures ?? {}) }
      if (has) {
        for (const key of keys) delete pushedLectures[key]
      } else {
        for (const key of keys) pushedLectures[key] = date
      }
      return {
        ...prev,
        pushedDates: has ? pushed.filter((d) => d !== date) : [...pushed, date],
        pushedLectures,
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

  const todayLabel = new Intl.DateTimeFormat("en-IN", { weekday: "long", day: "numeric", month: "short" }).format(new Date())

  return (
    <main className="min-h-dvh bg-[#f7f8fb] text-slate-900 dark:bg-[#111522] dark:text-slate-100">
      <div className="mx-auto flex min-h-dvh w-full max-w-[1440px]">
        <aside className="hidden w-64 shrink-0 flex-col border-r border-slate-200 bg-white px-5 py-7 dark:border-white/10 dark:bg-[#171b2b] lg:flex">
          <div className="flex items-center gap-3 px-2">
            <div className="flex size-10 items-center justify-center rounded-xl bg-violet-600 text-white shadow-lg shadow-violet-600/20"><Sparkles className="size-5" /></div>
            <div><div className="font-bold tracking-tight">Tracker 360</div><div className="text-[11px] text-slate-500">JEE preparation</div></div>
          </div>
          <div className="mt-10 space-y-2">
            <SidebarItem icon={<Home className="size-4" />} label="Overview" active />
            <SidebarItem icon={<LayoutList className="size-4" />} label="Study plan" />
            <SidebarItem icon={<Target className="size-4" />} label="Progress" />
            <SidebarItem icon={<CalendarDays className="size-4" />} label="Calendar" />
          </div>
          <div className="mt-auto rounded-2xl bg-violet-50 p-4 dark:bg-violet-500/10"><div className="text-xs font-semibold text-violet-700 dark:text-violet-300">Keep your momentum</div><div className="mt-1 text-[11px] leading-relaxed text-slate-500">Small consistent sessions compound into big results.</div></div>
        </aside>
        <section className="flex min-w-0 flex-1 flex-col px-4 py-5 sm:px-7 lg:px-10 lg:py-8">
          <header className="flex items-center justify-between gap-4">
            <div><div className="text-xs font-medium uppercase tracking-[0.18em] text-violet-600 dark:text-violet-300">JEE 2027 · Arjuna</div><h1 className="mt-1 text-2xl font-bold tracking-tight sm:text-3xl">Good evening, Rudraksh</h1><p className="mt-1 text-sm text-slate-500">{todayLabel} · Let&apos;s make today count.</p></div>
            <button type="button" onClick={resetAll} className="flex items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs font-medium text-slate-500 shadow-sm transition-colors hover:bg-slate-50 dark:border-white/10 dark:bg-white/5"><RotateCcw className="size-3.5" /> Reset</button>
          </header>
          <div className="mt-7 grid gap-3 sm:grid-cols-3">
            <SummaryCard icon={<Target className="size-4" />} label="Overall progress" value={`${plan.total ? Math.round((Object.values(done).filter(Boolean).length / plan.total) * 100) : 0}%`} detail={`${Object.values(done).filter(Boolean).length} of ${plan.total} lectures`} />
            <SummaryCard icon={<TimerReset className="size-4" />} label="Daily pace" value={`${plan.effectiveDaily}`} detail="lectures per study day" />
            <SummaryCard icon={<CalendarDays className="size-4" />} label="Projected finish" value={plan.finishDate ? new Intl.DateTimeFormat("en-IN", { day: "numeric", month: "short" }).format(new Date(`${plan.finishDate}T12:00:00`)) : "—"} detail={`${plan.studyDays} active study days`} />
          </div>
          <div className="mt-8"><Stepper phase={phase} onSelect={(p) => setPhase(p)} /></div>

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
        </section>
      </div>
    </main>
  )
}

function SidebarItem({ icon, label, active = false }: { icon: React.ReactNode; label: string; active?: boolean }) {
  return (
    <button type="button" className={cn("flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-colors", active ? "bg-violet-600 text-white shadow-md shadow-violet-600/20" : "text-slate-500 hover:bg-slate-100 hover:text-slate-900 dark:hover:bg-white/5 dark:hover:text-white")}>
      {icon}<span>{label}</span>
    </button>
  )
}

function SummaryCard({ icon, label, value, detail }: { icon: React.ReactNode; label: string; value: string; detail: string }) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm dark:border-white/10 dark:bg-[#171b2b]">
      <div className="flex items-center gap-2 text-xs font-medium text-slate-500"><span className="flex size-8 items-center justify-center rounded-lg bg-violet-50 text-violet-600 dark:bg-violet-500/15 dark:text-violet-300">{icon}</span>{label}</div>
      <div className="mt-3 text-2xl font-bold tracking-tight">{value}</div>
      <div className="mt-1 text-xs text-slate-500">{detail}</div>
    </div>
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
