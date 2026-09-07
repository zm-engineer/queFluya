// Presentational (server-renderable): the caller resolves the i18n strings and
// passes them in, so this stays a plain server component with no client JS.

type Props = {
  /** Left-side label, e.g. "Progreso". */
  label: string
  /** Right-side value, e.g. "340 XP". */
  valueText: string
  /** 0..1 fill toward the next milestone. */
  fraction: number
}

export function ProgressBar({ label, valueText, fraction }: Props) {
  const pct = Math.round(Math.min(1, Math.max(0, fraction)) * 100)
  return (
    <div>
      <div className="flex items-baseline justify-between mb-1.5">
        <span className="text-lg font-black text-stone-900">{label}</span>
        <span className="text-xs font-bold text-stone-400 tabular-nums">
          {valueText}
        </span>
      </div>
      <div className="h-3 w-full rounded-full bg-stone-100 overflow-hidden">
        <div
          className="h-full rounded-full bg-emerald-500 transition-[width]"
          style={{ width: `${pct}%` }}
        />
      </div>
    </div>
  )
}
