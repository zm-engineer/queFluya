import { cn } from '@/lib/utils'

// queFluya's mascot: a friendly water droplet ("¡que fluya!"). This is a
// PLACEHOLDER drawing — the point is the reusable API. Swap the SVG paths for
// your real illustration later; the `mood` prop and every usage stay the same.
//
// Usage: <Mascot mood="celebrating" className="w-24" />
// Size it with `className` (width); the aspect ratio is fixed by the viewBox.

export type MascotMood = 'happy' | 'celebrating' | 'thinking' | 'sad'

const LABEL: Record<MascotMood, string> = {
  happy: 'queFluya, contenta',
  celebrating: 'queFluya, celebrando',
  thinking: 'queFluya, pensando',
  sad: 'queFluya, triste',
}

export function Mascot({
  mood = 'happy',
  className,
}: {
  mood?: MascotMood
  className?: string
}) {
  return (
    <svg
      viewBox="0 0 100 120"
      className={cn('inline-block w-24 h-auto', className)}
      role="img"
      aria-label={LABEL[mood]}
    >
      {/* Body: a water droplet with the app's playful 3D outline. */}
      <path
        d="M50 6 C 60 34 84 52 84 82 A 34 34 0 1 1 16 82 C 16 52 40 34 50 6 Z"
        fill="#10b981"
        stroke="#047857"
        strokeWidth="3"
        strokeLinejoin="round"
      />
      {/* Shine */}
      <ellipse cx="36" cy="60" rx="7" ry="10" fill="#ffffff" opacity="0.35" />

      {/* Cheeks */}
      <circle cx="29" cy="90" r="6" fill="#fb7185" opacity="0.55" />
      <circle cx="71" cy="90" r="6" fill="#fb7185" opacity="0.55" />

      {/* Eyes */}
      {mood === 'celebrating' ? (
        // Happy closed eyes (^ ^)
        <g stroke="#052e2b" strokeWidth="3.5" strokeLinecap="round" fill="none">
          <path d="M33 79 Q 39 72 45 79" />
          <path d="M55 79 Q 61 72 67 79" />
        </g>
      ) : (
        <g fill="#052e2b">
          {/* thinking looks up; others look ahead */}
          <circle cx="39" cy={mood === 'thinking' ? 75 : 78} r="4.5" />
          <circle cx="61" cy={mood === 'thinking' ? 75 : 78} r="4.5" />
          {/* tiny glints */}
          <circle cx="40.5" cy={mood === 'thinking' ? 73.5 : 76.5} r="1.4" fill="#ffffff" />
          <circle cx="62.5" cy={mood === 'thinking' ? 73.5 : 76.5} r="1.4" fill="#ffffff" />
        </g>
      )}

      {/* Mouth */}
      {mood === 'happy' && (
        <path
          d="M41 92 Q 50 101 59 92"
          fill="none"
          stroke="#052e2b"
          strokeWidth="3.5"
          strokeLinecap="round"
        />
      )}
      {mood === 'celebrating' && (
        <path
          d="M40 90 Q 50 104 60 90 Q 50 96 40 90 Z"
          fill="#052e2b"
        />
      )}
      {mood === 'thinking' && (
        <circle cx="50" cy="95" r="3" fill="#052e2b" />
      )}
      {mood === 'sad' && (
        <path
          d="M41 97 Q 50 89 59 97"
          fill="none"
          stroke="#052e2b"
          strokeWidth="3.5"
          strokeLinecap="round"
        />
      )}
    </svg>
  )
}
