"use client"

import { CalendarDays, Gauge, Target } from "lucide-react"
import { SPEED_OPTIONS } from "@/lib/defaults"
import { formatDate } from "@/lib/scheduler"
import type { Plan, PlanConfig } from "@/lib/tracker-types"
import { cn } from "@/lib/utils"

type Props = {
  config: PlanConfig
  plan: Plan
  onChange: (next: PlanConfig) => void
}

const WEEKDAYS = [
  { i: 1, label: "Mon" },
  { i: 2, label: "Tue" },
  { i: 3, label: "Wed" },
  { i: 4, label: "Thu" },
  { i: 5, label: "Fri" },
  { i: 6, label: "Sat" },
  { i: 0, label: "Sun" },
]

export function TimelineStep({ config, plan, onChange }: Props) {
  function set<K extends keyof PlanConfig>(key: K, value: PlanConfig[K]) {
    onChange({ ...config, [key]: value })
  }

  function toggleGapWeekday(i: number) {
    const has = config.gapWeekdays.includes(i)
    set("gapWeekdays", has ? config.gapWeekdays.filter((d) => d !== i) : [...config.gapWeekdays, i])
  }

  return (
    <div className="flex flex-col gap-5">
      <div>
        <h2 className="text-lg font-semibold tracking-tight">Configure timeline &amp; speed</h2>
        <p className="text-sm text-muted-foreground">
          {plan.total} lectures balanced across your subjects. Everything below updates the plan instantly.
        </p>
      </div>

      {/* Live summary */}
      <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
        <Stat label="Per study day" value={`${plan.effectiveDaily}`} unit="lectures" />
        <Stat label="Study days" value={`${plan.studyDays}`} unit="excl. off days" />
        <Stat label="Mock days" value={`${plan.mockDays}`} unit={config.mockEvery ? `every ${config.mockEvery}th` : "off"} />
        <Stat label="Finish by" value={formatDate(plan.finishDate).split(",")[1]?.trim() ?? ""} unit={formatDate(plan.finishDate).split(",")[0]} />
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        {/* Start date */}
        <Field icon={<CalendarDays className="size-4" />} title="Start date">
          <input
            type="date"
            value={config.startDate}
            onChange={(e) => set("startDate", e.target.value)}
            className="w-full rounded-lg border border-input bg-background px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-ring [color-scheme:dark]"
          />
        </Field>

        {/* Planning mode */}
        <Field icon={<Target className="size-4" />} title="Plan by">
          <div className="grid grid-cols-2 gap-2">
            <ModeButton active={config.mode === "pace"} onClick={() => set("mode", "pace")} label="Daily pace" hint="Set speed" />
            <ModeButton active={config.mode === "target"} onClick={() => set("mode", "target")} label="Target days" hint="Set deadline" />
          </div>
        </Field>

        {/* Pace / speed */}
        {config.mode === "pace" ? (
          <Field icon={<Gauge className="size-4" />} title="Daily pace & speed" className="md:col-span-2">
            <div className="flex flex-col gap-3">
              <div className="flex items-center gap-3">
                <span className="text-sm text-muted-foreground">Base</span>
                <input
                  type="range"
                  min={1}
                  max={8}
                  value={config.lecturesPerDay}
                  onChange={(e) => set("lecturesPerDay", Number(e.target.value))}
                  className="flex-1 accent-primary"
                />
                <span className="w-24 text-right text-sm tabular-nums">
                  {config.lecturesPerDay} lec/day
                </span>
              </div>
              <div className="flex flex-wrap items-center gap-2">
                <span className="text-sm text-muted-foreground">Speed</span>
                {SPEED_OPTIONS.map((s) => (
                  <button
                    key={s}
                    type="button"
                    onClick={() => set("speed", s)}
                    className={cn(
                      "rounded-lg border px-3 py-1.5 text-sm font-medium tabular-nums transition-colors",
                      config.speed === s
                        ? "border-primary bg-primary/15 text-primary-foreground"
                        : "border-border text-muted-foreground hover:bg-accent/40",
                    )}
                  >
                    {s}×
                  </button>
                ))}
                <span className="ml-auto text-sm tabular-nums text-muted-foreground">
                  = {plan.effectiveDaily} lectures / day
                </span>
              </div>
            </div>
          </Field>
        ) : (
          <Field icon={<Target className="size-4" />} title="Target study days" className="md:col-span-2">
            <div className="flex items-center gap-3">
              <input
                type="range"
                min={10}
                max={200}
                value={config.targetDays}
                onChange={(e) => set("targetDays", Number(e.target.value))}
                className="flex-1 accent-primary"
              />
              <span className="w-28 text-right text-sm tabular-nums">{config.targetDays} days</span>
            </div>
            <p className="mt-2 text-xs text-muted-foreground">
              Finishes all lectures in {config.targetDays} study days at {plan.effectiveDaily} lectures/day.
            </p>
          </Field>
        )}

        {/* Off days */}
        <Field icon={<CalendarDays className="size-4" />} title="Off days" className="md:col-span-2">
          <div className="flex flex-col gap-3">
            <label className="flex items-center gap-3 text-sm">
              <Switch checked={config.excludeSundays} onChange={(v) => set("excludeSundays", v)} />
              Skip every Sunday
            </label>
            <div>
              <div className="mb-2 text-xs uppercase tracking-wide text-muted-foreground">Extra weekly gap days</div>
              <div className="flex flex-wrap gap-2">
                {WEEKDAYS.map((wd) => {
                  const isSunday = wd.i === 0
                  const forced = isSunday && config.excludeSundays
                  const on = forced || config.gapWeekdays.includes(wd.i)
                  return (
                    <button
                      key={wd.i}
                      type="button"
                      disabled={forced}
                      onClick={() => toggleGapWeekday(wd.i)}
                      className={cn(
                        "rounded-lg border px-3 py-1.5 text-sm font-medium transition-colors",
                        on ? "border-destructive/50 bg-destructive/15 text-destructive" : "border-border text-muted-foreground hover:bg-accent/40",
                        forced && "opacity-60",
                      )}
                    >
                      {wd.label}
                    </button>
                  )
                })}
              </div>
            </div>
          </div>
        </Field>

        {/* Mock engine */}
        <Field icon={<Target className="size-4" />} title="Mock engine" className="md:col-span-2">
          <div className="flex flex-col gap-3">
            <label className="flex items-center gap-3 text-sm">
              <Switch checked={config.mockEvery > 0} onChange={(v) => set("mockEvery", v ? 14 : 0)} />
              Reserve a mock / revision day
            </label>
            {config.mockEvery > 0 && (
              <div className="flex items-center gap-3">
                <span className="text-sm text-muted-foreground">Every</span>
                <input
                  type="range"
                  min={5}
                  max={21}
                  value={config.mockEvery}
                  onChange={(e) => set("mockEvery", Number(e.target.value))}
                  className="flex-1 accent-primary"
                />
                <span className="w-24 text-right text-sm tabular-nums">{config.mockEvery}th day</span>
              </div>
            )}
          </div>
        </Field>
      </div>
    </div>
  )
}

function Stat({ label, value, unit }: { label: string; value: string; unit: string }) {
  return (
    <div className="rounded-xl border border-border bg-card px-4 py-3">
      <div className="text-[11px] uppercase tracking-wide text-muted-foreground">{label}</div>
      <div className="mt-1 text-xl font-semibold tabular-nums">{value}</div>
      <div className="text-xs text-muted-foreground">{unit}</div>
    </div>
  )
}

function Field({
  icon,
  title,
  className,
  children,
}: {
  icon: React.ReactNode
  title: string
  className?: string
  children: React.ReactNode
}) {
  return (
    <section className={cn("rounded-xl border border-border bg-card p-4", className)}>
      <div className="mb-3 flex items-center gap-2 text-sm font-medium">
        <span className="text-muted-foreground">{icon}</span>
        {title}
      </div>
      {children}
    </section>
  )
}

function Switch({ checked, onChange }: { checked: boolean; onChange: (v: boolean) => void }) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      onClick={() => onChange(!checked)}
      className={cn(
        "relative inline-flex h-6 w-11 shrink-0 items-center rounded-full transition-colors",
        checked ? "bg-primary" : "bg-secondary",
      )}
    >
      <span
        className={cn(
          "inline-block size-5 transform rounded-full bg-white shadow transition-transform",
          checked ? "translate-x-5" : "translate-x-0.5",
        )}
      />
    </button>
  )
}

function ModeButton({
  active,
  onClick,
  label,
  hint,
}: {
  active: boolean
  onClick: () => void
  label: string
  hint: string
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "flex flex-col rounded-lg border px-3 py-2 text-left transition-colors",
        active ? "border-primary bg-primary/15" : "border-border hover:bg-accent/40",
      )}
    >
      <span className="text-sm font-medium">{label}</span>
      <span className="text-xs text-muted-foreground">{hint}</span>
    </button>
  )
}
