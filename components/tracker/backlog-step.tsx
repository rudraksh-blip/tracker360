"use client"

import { ArrowDown, ArrowUp, Check, ChevronDown } from "lucide-react"
import { useState } from "react"
import { orderedChapters, orderedStreams, STREAM_STYLE, streamLecturesTotal } from "@/lib/streams"
import type { PlanConfig } from "@/lib/tracker-types"
import { cn } from "@/lib/utils"

type Props = {
  config: PlanConfig
  onChange: (next: PlanConfig) => void
}

export function BacklogStep({ config, onChange }: Props) {
  const streams = orderedStreams()
  const selected = config.selected

  function setSelected(next: Record<string, boolean>) {
    onChange({ ...config, selected: next })
  }

  function toggleChapter(id: string) {
    setSelected({ ...selected, [id]: !selected[id] })
  }

  function toggleStream(streamId: string, value: boolean) {
    const stream = streams.find((s) => s.id === streamId)
    if (!stream) return
    const next = { ...selected }
    for (const c of stream.chapters) next[c.id] = value
    setSelected(next)
  }

  function moveChapter(streamId: string, chapterId: string, dir: "up" | "down") {
    const stream = streams.find((s) => s.id === streamId)
    if (!stream) return
    const ids = orderedChapters(stream, config.order?.[streamId]).map((c) => c.id)
    const i = ids.indexOf(chapterId)
    const j = dir === "up" ? i - 1 : i + 1
    if (i < 0 || j < 0 || j >= ids.length) return
    ;[ids[i], ids[j]] = [ids[j], ids[i]]
    onChange({ ...config, order: { ...(config.order ?? {}), [streamId]: ids } })
  }

  const totalSelectedLectures = streams.reduce(
    (sum, s) => sum + s.chapters.filter((c) => selected[c.id]).reduce((a, c) => a + c.lectures, 0),
    0,
  )
  const totalSelectedChapters = streams.reduce(
    (sum, s) => sum + s.chapters.filter((c) => selected[c.id]).length,
    0,
  )

  return (
    <div className="flex flex-col gap-5">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h2 className="text-lg font-semibold tracking-tight">Select backlog chapters</h2>
          <p className="text-sm text-muted-foreground">
            Tick the chapters you still need to cover. Lecture counts come straight from your planner JSON.
          </p>
        </div>
        <div className="rounded-lg border border-border bg-card px-3 py-2 text-right">
          <div className="text-xl font-semibold tabular-nums">{totalSelectedLectures}</div>
          <div className="text-[11px] uppercase tracking-wide text-muted-foreground">
            lectures · {totalSelectedChapters} chapters
          </div>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        {streams.map((stream) => {
          const style = STREAM_STYLE[stream.id]
          const total = streamLecturesTotal(stream)
          const selCount = stream.chapters.filter((c) => selected[c.id]).length
          const allOn = selCount === stream.chapters.length
          const selLectures = stream.chapters
            .filter((c) => selected[c.id])
            .reduce((a, c) => a + c.lectures, 0)
          return (
            <StreamCard
              key={stream.id}
              streamName={stream.subject}
              style={style}
              total={total}
              selLectures={selLectures}
              selCount={selCount}
              chapterCount={stream.chapters.length}
              allOn={allOn}
              onToggleAll={() => toggleStream(stream.id, !allOn)}
            >
              {(() => {
                const chapters = orderedChapters(stream, config.order?.[stream.id])
                return chapters.map((c, index) => {
                  const on = !!selected[c.id]
                  return (
                    <div
                      key={c.id}
                      className={cn(
                        "flex w-full items-center gap-2 rounded-lg border pl-3 pr-2 transition-colors",
                        on
                          ? cn("border-transparent", style.soft)
                          : "border-border bg-background/40 hover:bg-accent/40",
                      )}
                    >
                      <button
                        type="button"
                        onClick={() => toggleChapter(c.id)}
                        className="flex flex-1 items-center gap-3 py-2 text-left"
                      >
                        <span
                          className={cn(
                            "flex size-5 shrink-0 items-center justify-center rounded-md border",
                            on ? cn(style.dot, "border-transparent text-black") : "border-muted-foreground/40",
                          )}
                        >
                          {on && <Check className="size-3.5" strokeWidth={3} />}
                        </span>
                        <span className={cn("min-w-0 flex-1", on ? "text-foreground" : "text-muted-foreground")}>
                          <span className="flex items-center gap-2">
                            <span className="truncate text-sm">{c.name}</span>
                            {c.tag && (
                              <span className="shrink-0 rounded bg-secondary px-1.5 py-0.5 text-[10px] font-medium uppercase tracking-wide text-muted-foreground">
                                {c.tag}
                              </span>
                            )}
                          </span>
                        </span>
                        <span className="shrink-0 text-xs tabular-nums text-muted-foreground">{c.lectures} lec</span>
                      </button>
                      <div className="flex shrink-0 flex-col">
                        <button
                          type="button"
                          onClick={() => moveChapter(stream.id, c.id, "up")}
                          disabled={index === 0}
                          aria-label={`Move ${c.name} up`}
                          className="rounded p-0.5 text-muted-foreground transition-colors hover:bg-accent/60 hover:text-foreground disabled:cursor-not-allowed disabled:opacity-30"
                        >
                          <ArrowUp className="size-3.5" />
                        </button>
                        <button
                          type="button"
                          onClick={() => moveChapter(stream.id, c.id, "down")}
                          disabled={index === chapters.length - 1}
                          aria-label={`Move ${c.name} down`}
                          className="rounded p-0.5 text-muted-foreground transition-colors hover:bg-accent/60 hover:text-foreground disabled:cursor-not-allowed disabled:opacity-30"
                        >
                          <ArrowDown className="size-3.5" />
                        </button>
                      </div>
                    </div>
                  )
                })
              })()}
            </StreamCard>
          )
        })}
      </div>
    </div>
  )
}

function StreamCard({
  streamName,
  style,
  total,
  selLectures,
  selCount,
  chapterCount,
  allOn,
  onToggleAll,
  children,
}: {
  streamName: string
  style: (typeof STREAM_STYLE)[string]
  total: number
  selLectures: number
  selCount: number
  chapterCount: number
  allOn: boolean
  onToggleAll: () => void
  children: React.ReactNode
}) {
  const [open, setOpen] = useState(true)
  return (
    <section className="flex flex-col overflow-hidden rounded-xl border border-border bg-card">
      <header className="flex items-center gap-3 border-b border-border px-4 py-3">
        <span className={cn("size-2.5 rounded-full", style.dot)} aria-hidden />
        <div className="flex-1">
          <div className="flex items-center gap-2">
            <h3 className="text-sm font-semibold">{style.label}</h3>
            <span className="text-[11px] text-muted-foreground">{streamName}</span>
          </div>
          <div className="text-xs text-muted-foreground">
            {selCount}/{chapterCount} chapters · {selLectures}/{total} lectures
          </div>
        </div>
        <button
          type="button"
          onClick={onToggleAll}
          className={cn(
            "rounded-md border px-2.5 py-1 text-xs font-medium transition-colors",
            allOn ? cn(style.border, style.text, style.soft) : "border-border text-muted-foreground hover:bg-accent/40",
          )}
        >
          {allOn ? "All on" : "Select all"}
        </button>
        <button
          type="button"
          onClick={() => setOpen((v) => !v)}
          className="rounded-md p-1 text-muted-foreground hover:bg-accent/40"
          aria-label={open ? "Collapse" : "Expand"}
        >
          <ChevronDown className={cn("size-4 transition-transform", open ? "" : "-rotate-90")} />
        </button>
      </header>
      {open && <div className="flex flex-col gap-1.5 p-3">{children}</div>}
    </section>
  )
}
