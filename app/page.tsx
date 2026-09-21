"use client"

import { ArrowLeft, ArrowRight, CalendarDays, Home, LayoutList, RotateCcw, Sparkles, Target, TimerReset } from "lucide-react"
import { useMemo, useState } from "react"
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
  const [breakOpen, setBreakOpen] = useState(false)
  const [breakFrom, setBreakFrom] = useState(() => new Date().toISOString().slice(0, 10))
  const [breakTo, setBreakTo] = useState(() => new Date().toISOString().slice(0, 10))
  const [breakName, setBreakName] = useState("Break")
  const [breakMode, setBreakMode] = useState<"break" | "own">("break")
  const [finishMode, setFinishMode] = useState<"later" | "same">("later")

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

  function applyBreak() {
    const start = new Date(`${breakFrom}T12:00:00`)
    const end = new Date(`${breakTo}T12:00:00`)
    const dates: string[] = []
    for (const cursor = new Date(start); cursor <= end; cursor.setDate(cursor.getDate() + 1)) {
      dates.push(cursor.toISOString().slice(0, 10))
    }
    setConfig((prev) => ({
      ...prev,
      pushedDates: Array.from(new Set([...(prev.pushedDates ?? []), ...dates])),
    }))
    setBreakOpen(false)
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
            <div className="flex items-center gap-2">
              <button type="button" onClick={() => setBreakOpen(true)} className="flex items-center gap-1.5 rounded-xl bg-violet-600 px-3 py-2 text-xs font-semibold text-white shadow-sm shadow-violet-600/20 transition-colors hover:bg-violet-700"><CalendarDays className="size-3.5" /> Take a break</button>
              <button type="button" onClick={resetAll} className="flex items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs font-medium text-slate-500 shadow-sm transition-colors hover:bg-slate-50 dark:border-white/10 dark:bg-white/5"><RotateCcw className="size-3.5" /> Reset</button>
            </div>
          </header>
          <div className="mt-7 grid gap-3 sm:grid-cols-3">
            <SummaryCard icon={<Target className="size-4" />} label="Overall progress" value={`${plan.total ? Math.round((Object.values(done).filter(Boolean).length / plan.total) * 100) : 0}%`} detail={`${Object.values(done).filter(Boolean).length} of ${plan.total} lectures`} />
            <SummaryCard icon={<TimerReset className="size-4" />} label="Daily pace" value={`${plan.effectiveDaily}`} detail="lectures per study day" />
            <SummaryCard icon={<CalendarDays className="size-4" />} label="Projected finish" value={plan.finishDate ? new Intl.DateTimeFormat("en-IN", { day: "numeric", month: "short" }).format(new Date(`${plan.finishDate}T12:00:00`)) : "—"} detail={`${plan.studyDays} active study days`} />
          </div>
          <div className="mt-8"><Stepper phase={phase} onSelect={(p) => setPhase(p)} /></div>

      <div className="flex-1">
        {phase === 0 && <BacklogStep config={config} onChange={setConfig} />}
        {phase === 0 && <ProgressSection plan={plan} done={done} />}
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

      {breakOpen && (
        <BreakModal
          from={breakFrom}
          to={breakTo}
          name={breakName}
          mode={breakMode}
          finishMode={finishMode}
          setFrom={setBreakFrom}
          setTo={setBreakTo}
          setName={setBreakName}
          setMode={setBreakMode}
          setFinishMode={setFinishMode}
          onClose={() => setBreakOpen(false)}
          onApply={applyBreak}
        />
      )}

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

function ProgressSection({ plan, done }: { plan: ReturnType<typeof generatePlan>; done: Record<string, boolean> }) {
  const completed = Object.values(done).filter(Boolean).length
  const percent = plan.total ? Math.round((completed / plan.total) * 100) : 0
  const studiedDays = plan.days.filter((day) => day.type === "study" && day.lectures.some((lecture) => done[lecture.key])).length
  return (
    <section className="mt-6 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm dark:border-white/10 dark:bg-[#171b2b]">
      <div className="flex flex-wrap items-start justify-between gap-3"><div><div className="text-xs font-semibold uppercase tracking-[0.16em] text-violet-600 dark:text-violet-300">Your progress</div><h2 className="mt-1 text-xl font-bold">Keep building your streak</h2></div><div className="text-right"><div className="text-3xl font-bold text-violet-600">{percent}%</div><div className="text-xs text-slate-500">of your plan done</div></div></div>
      <div className="mt-4 h-3 overflow-hidden rounded-full bg-slate-100 dark:bg-white/10"><div className="h-full rounded-full bg-violet-600 transition-all" style={{ width: `${percent}%` }} /></div>
      <div className="mt-5 grid gap-3 sm:grid-cols-3"><ProgressMetric label="Lectures complete" value={`${completed}/${plan.total}`} /><ProgressMetric label="Study days" value={`${studiedDays}/${plan.studyDays}`} /><ProgressMetric label="Projected finish" value={plan.finishDate} /></div>
    </section>
  )
}

function ProgressMetric({ label, value }: { label: string; value: string }) { return <div className="rounded-xl bg-slate-50 p-3 dark:bg-white/5"><div className="text-lg font-bold">{value}</div><div className="mt-1 text-xs text-slate-500">{label}</div></div> }

function BreakModal({ from, to, name, mode, finishMode, setFrom, setTo, setName, setMode, setFinishMode, onClose, onApply }: { from: string; to: string; name: string; mode: "break" | "own"; finishMode: "later" | "same"; setFrom: (v: string) => void; setTo: (v: string) => void; setName: (v: string) => void; setMode: (v: "break" | "own") => void; setFinishMode: (v: "later" | "same") => void; onClose: () => void; onApply: () => void }) {
  return <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/35 p-4 backdrop-blur-sm" role="dialog" aria-modal="true" aria-labelledby="break-title"><div className="w-full max-w-3xl rounded-2xl border border-slate-200 bg-white p-6 shadow-2xl dark:border-white/10 dark:bg-[#171b2b]"><div className="flex items-center justify-between"><h2 id="break-title" className="text-xl font-bold">Take some days off</h2><button type="button" onClick={onClose} aria-label="Close" className="text-2xl text-slate-400 hover:text-slate-700">×</button></div><div className="mt-5 grid gap-3 md:grid-cols-2"><ChoiceCard selected={mode === "break"} onClick={() => setMode("break")} title="A break" text="Exams, travel, anything. Nothing is scheduled and nothing piles up." /><ChoiceCard selected={mode === "own"} onClick={() => setMode("own")} title="My own work" text="Questions, PYQs or revision. No lectures from the plan, and the day still counts." /></div><div className="mt-5 grid gap-4 md:grid-cols-3"><DateField label="From" value={from} onChange={setFrom} /><DateField label="To" value={to} onChange={setTo} /><label className="text-xs font-semibold uppercase tracking-wide text-slate-500">Call it<input value={name} onChange={(e) => setName(e.target.value)} className="mt-2 w-full rounded-xl border border-slate-200 px-3 py-3 text-sm outline-none focus:border-violet-500" /></label></div><div className="mt-5 grid gap-3 md:grid-cols-2"><ChoiceCard selected={finishMode === "later"} onClick={() => setFinishMode("later")} title="Move it later" text="By the break length. Your study days stay the same size." /><ChoiceCard selected={finishMode === "same"} onClick={() => setFinishMode("same")} title="Keep it" text="Finish on the same date. Remaining days get heavier." /></div><div className="mt-6 flex gap-3"><button type="button" onClick={onApply} className="rounded-xl bg-violet-600 px-5 py-3 text-sm font-semibold text-white hover:bg-violet-700">Take the break</button><button type="button" onClick={onClose} className="px-4 py-3 text-sm font-semibold text-slate-500">Cancel</button></div></div></div>
}

function ChoiceCard({ selected, onClick, title, text }: { selected: boolean; onClick: () => void; title: string; text: string }) { return <button type="button" onClick={onClick} className={cn("rounded-xl border p-4 text-left transition-colors", selected ? "border-violet-500 bg-violet-50 ring-1 ring-violet-500 dark:bg-violet-500/10" : "border-slate-200 hover:border-violet-300 dark:border-white/10")}><div className="flex items-center gap-3"><span className={cn("size-4 rounded-full border-2", selected ? "border-violet-600 bg-violet-600 shadow-[inset_0_0_0_3px_white]" : "border-slate-400")} /><span className="font-semibold">{title}</span></div><div className="mt-1 pl-7 text-sm text-slate-500">{text}</div></button> }

function DateField({ label, value, onChange }: { label: string; value: string; onChange: (v: string) => void }) { return <label className="text-xs font-semibold uppercase tracking-wide text-slate-500">{label}<input type="date" value={value} onChange={(e) => onChange(e.target.value)} className="mt-2 w-full rounded-xl border border-slate-200 px-3 py-3 text-sm outline-none focus:border-violet-500" /></label> }

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
