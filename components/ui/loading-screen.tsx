// Full-screen loading state (language-neutral). Used by the App Router
// `loading.tsx` files so every navigation shows instant feedback instead of a
// frozen screen while the server renders.
export function LoadingScreen() {
  return (
    <div className="min-h-screen bg-stone-50 flex flex-col items-center justify-center gap-5">
      <div className="h-10 w-10 rounded-full border-4 border-stone-200 border-t-emerald-500 animate-spin" />
      <span className="text-2xl font-black tracking-tight text-stone-300">
        que<span className="text-emerald-300">Fluya</span>
      </span>
    </div>
  )
}
