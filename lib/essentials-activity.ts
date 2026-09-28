// Fire-and-forget: tell the server the user interacted with Esenciales today, so
// it counts toward the daily streak. Throttled to one call per calendar day per
// page-session (the server upsert is idempotent anyway). Uses the UTC date to
// match the server's default day boundary.

let lastPingedDay = ''

export function pingEssentialsActivity(): void {
  const today = new Date().toISOString().slice(0, 10)
  if (lastPingedDay === today) return
  lastPingedDay = today
  fetch('/api/activity', { method: 'POST' }).catch(() => {
    lastPingedDay = '' // let a later interaction retry
  })
}
