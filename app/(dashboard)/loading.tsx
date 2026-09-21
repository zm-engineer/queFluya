// Shown instantly (Suspense fallback) while a dashboard route fetches its data
// on the server — auth + profile + queries, which cross to Supabase and can take
// a moment (more so on a Vercel cold start). Instead of a blank freeze, the user
// sees the page's frame right away and the content fills in. Not a full-screen
// spinner — a shaped skeleton in the app's own style.

function Block({ className = '' }: { className?: string }) {
  return <div className={`animate-pulse rounded-2xl bg-stone-200 ${className}`} />
}

export default function DashboardLoading() {
  return (
    <main className="min-h-screen bg-stone-50">
      {/* Header */}
      <header className="bg-white border-b-2 border-stone-100 sticky top-0 z-10">
        <div className="max-w-5xl mx-auto px-6 py-4 flex items-center justify-between">
          <Block className="h-7 w-32" />
          <div className="flex items-center gap-3">
            <Block className="h-8 w-20 rounded-full" />
            <Block className="h-8 w-8 rounded-full" />
          </div>
        </div>
      </header>

      <div className="max-w-5xl mx-auto px-6 py-8 space-y-6">
        {/* Hero / progress card */}
        <div className="bg-white border-2 border-stone-100 rounded-3xl p-8 space-y-4">
          <Block className="h-6 w-48" />
          <Block className="h-3 w-full" />
          <Block className="h-3 w-2/3" />
        </div>

        {/* Section rows */}
        {[0, 1, 2].map((i) => (
          <div
            key={i}
            className="bg-white border-2 border-stone-100 rounded-3xl p-6 flex items-center gap-4"
          >
            <Block className="h-12 w-12 rounded-2xl shrink-0" />
            <div className="flex-1 space-y-2">
              <Block className="h-4 w-40" />
              <Block className="h-3 w-24" />
            </div>
            <Block className="h-9 w-24 rounded-2xl shrink-0" />
          </div>
        ))}
      </div>
    </main>
  )
}
