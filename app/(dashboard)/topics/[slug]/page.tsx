import Link from 'next/link'
import { notFound, redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { getProfile, getUser } from '@/lib/auth'
import { LogoutButton } from '@/components/auth/logout-button'
import { TopicSections } from '@/components/topic/topic-sections'
import { getTopicBySlug, type Language, type Level } from '@/lib/topics'
import { getDict } from '@/lib/i18n/dictionaries'

const LEVEL_EMOJI: Record<Level, string> = {
  BEGINNER: '🌱',
  INTERMEDIATE: '🌿',
  ADVANCED: '🌳',
}

export default async function TopicPage({
  params,
  searchParams,
}: {
  params: Promise<{ slug: string }>
  searchParams: Promise<{ section?: string }>
}) {
  const { slug } = await params
  const { section } = await searchParams
  const initialSection = section != null ? Number(section) : undefined

  const user = await getUser()
  if (!user) redirect('/login')
  const profile = await getProfile()
  if (!profile) redirect('/onboarding')

  const supabase = await createClient()

  const t = getDict(profile.native_language as Language)

  const topic = await getTopicBySlug(supabase, slug)

  if (!topic) {
    notFound()
  }

  const sections = topic.content.sections ?? []

  return (
    <main className="min-h-screen bg-stone-50">
      <header className="bg-white border-b-2 border-stone-100 sticky top-0 z-10">
        <div className="max-w-3xl mx-auto px-6 py-4 flex items-center justify-between">
          <Link
            href="/dashboard"
            className="text-2xl font-black tracking-tight text-stone-900"
          >
            que<span className="text-emerald-500">Fluya</span>
          </Link>
          <div className="flex items-center gap-5">
            <span className="text-sm font-bold text-stone-600">
              @{profile.username}
            </span>
            <LogoutButton />
          </div>
        </div>
      </header>

      <section className="max-w-3xl mx-auto px-6 pt-10 pb-10">
        <Link
          href="/dashboard"
          className="text-sm font-black text-stone-500 hover:text-emerald-600 transition-colors inline-block mb-6"
        >
          {t.back.toTopics}
        </Link>
        <div className="inline-flex items-center gap-2 bg-emerald-100 text-emerald-700 text-xs font-black uppercase tracking-wider px-3 py-1.5 rounded-full mb-4">
          <span>{LEVEL_EMOJI[topic.level]}</span>
          <span>{t.common.levels[topic.level]}</span>
        </div>
        <h1 className="text-4xl sm:text-5xl font-black text-stone-900 leading-tight mb-4">
          {topic.title}
        </h1>
        <p className="text-stone-600 text-lg font-semibold leading-relaxed max-w-2xl">
          {topic.description}
        </p>
      </section>

      <section className="max-w-3xl mx-auto px-6 pb-24">
        <TopicSections
          sections={sections}
          language={topic.language}
          topicSlug={topic.slug}
          topicTitle={topic.title}
          topicDescription={topic.description}
          profileId={profile.id}
          initialSection={
            initialSection != null && Number.isInteger(initialSection)
              ? initialSection
              : undefined
          }
        />
      </section>
    </main>
  )
}
