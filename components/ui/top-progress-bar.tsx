'use client'

import { useEffect, useRef, useState } from 'react'
import { usePathname } from 'next/navigation'

// A thin progress bar pinned to the top of the screen (YouTube/GitHub style). It
// starts when the user clicks an internal link and finishes when the route
// actually changes — so the current page stays visible while the next one loads,
// instead of a full-screen spinner. Mounted once in the root layout.
export function TopProgressBar() {
  const pathname = usePathname()
  const [progress, setProgress] = useState(0)
  const [visible, setVisible] = useState(false)
  const activeRef = useRef(false)
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null)
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  function clearTimers() {
    if (intervalRef.current) clearInterval(intervalRef.current)
    if (timeoutRef.current) clearTimeout(timeoutRef.current)
    intervalRef.current = null
    timeoutRef.current = null
  }

  function start() {
    clearTimers()
    activeRef.current = true
    setVisible(true)
    setProgress(12)
    // Creep toward ~90% (asymptotic) so it feels alive but never "finishes"
    // until the navigation actually completes.
    intervalRef.current = setInterval(() => {
      setProgress((p) => (p < 90 ? p + (90 - p) * 0.12 : p))
    }, 300)
  }

  function finish() {
    clearTimers()
    activeRef.current = false
    setProgress(100)
    timeoutRef.current = setTimeout(() => {
      setVisible(false)
      setProgress(0)
    }, 300)
  }

  // Start on internal link clicks (before navigation begins).
  useEffect(() => {
    function onClick(e: MouseEvent) {
      if (e.defaultPrevented || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) {
        return
      }
      const anchor = (e.target as HTMLElement | null)?.closest('a')
      if (!anchor) return
      if (!anchor.getAttribute('href')) return
      let url: URL
      try {
        url = new URL(anchor.href, location.href)
      } catch {
        return
      }
      if (url.origin !== location.origin) return
      if (anchor.target && anchor.target !== '_self') return
      if (url.pathname === location.pathname && url.search === location.search) {
        return
      }
      start()
    }
    document.addEventListener('click', onClick, true)
    return () => document.removeEventListener('click', onClick, true)
    // start() only reads stable setters/refs — safe to omit from deps.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  // The route changed → navigation committed → finish (only if we started one).
  // Deferred to the next frame so we don't setState synchronously in the effect.
  useEffect(() => {
    if (!activeRef.current) return
    const raf = requestAnimationFrame(finish)
    return () => cancelAnimationFrame(raf)
    // finish() only reads stable setters/refs — safe to omit from deps.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pathname])

  return (
    <div
      aria-hidden
      className="fixed inset-x-0 top-0 z-[70] h-1 pointer-events-none"
      style={{ opacity: visible ? 1 : 0, transition: 'opacity 250ms ease' }}
    >
      <div
        className="h-full bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.6)]"
        style={{ width: `${progress}%`, transition: 'width 300ms ease-out' }}
      />
    </div>
  )
}
