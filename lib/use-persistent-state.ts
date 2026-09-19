"use client"

import { useEffect, useRef, useState } from "react"

/**
 * Local-first persistence. This tracker is a personal, single-user tool with
 * no backend, so progress + config live in localStorage on the device.
 */
export function usePersistentState<T>(key: string, initial: T) {
  const [state, setState] = useState<T>(initial)
  const [hydrated, setHydrated] = useState(false)
  const initialRef = useRef(initial)

  useEffect(() => {
    try {
      const raw = window.localStorage.getItem(key)
      if (raw !== null) {
        setState(JSON.parse(raw) as T)
      }
    } catch {
      // ignore malformed storage
    }
    setHydrated(true)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [key])

  useEffect(() => {
    if (!hydrated) return
    try {
      window.localStorage.setItem(key, JSON.stringify(state))
    } catch {
      // storage full / unavailable — non-fatal
    }
  }, [key, state, hydrated])

  return [state, setState, hydrated] as const
}
