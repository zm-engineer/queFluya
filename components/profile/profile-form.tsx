'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { useDict } from '@/components/i18n/language-provider'
import { targetFor, validateUsername } from '@/lib/profile'
import { cn } from '@/lib/utils'
import type { Language, Level } from '@/lib/topics'

type Props = {
  profileId: string
  username: string
  nativeLanguage: Language
  level: Level
}

const LANGUAGES: { value: Language; flag: string; label: string }[] = [
  { value: 'EN', flag: '🇬🇧', label: 'English' },
  { value: 'ES', flag: '🇪🇸', label: 'Español' },
]

const LEVELS: { value: Level; emoji: string }[] = [
  { value: 'BEGINNER', emoji: '🌱' },
  { value: 'INTERMEDIATE', emoji: '🌿' },
  { value: 'ADVANCED', emoji: '🌳' },
]

export function ProfileForm({
  profileId,
  username,
  nativeLanguage,
  level,
}: Props) {
  const router = useRouter()
  const t = useDict()
  const [editing, setEditing] = useState(false)
  const [name, setName] = useState(username)
  const [native, setNative] = useState<Language>(nativeLanguage)
  const [lvl, setLvl] = useState<Level>(level)
  const [error, setError] = useState<string | null>(null)
  const [saving, setSaving] = useState(false)

  function startEditing() {
    setName(username)
    setNative(nativeLanguage)
    setLvl(level)
    setError(null)
    setEditing(true)
  }

  async function save() {
    const invalid = validateUsername(name)
    if (invalid) {
      setError(
        invalid === 'short'
          ? t.onboarding.usernameShort
          : t.onboarding.usernameChars
      )
      return
    }

    setSaving(true)
    setError(null)
    const supabase = createClient()
    // native_language drives the UI language and target_language is always its
    // opposite, so we recompute it here instead of trusting a stale value.
    const { error: updateError } = await supabase
      .from('profiles')
      .update({
        username: name.trim(),
        native_language: native,
        target_language: targetFor(native),
        level: lvl,
      })
      .eq('id', profileId)
    setSaving(false)

    if (updateError) {
      setError(
        updateError.code === '23505'
          ? t.onboarding.usernameTaken
          : updateError.message
      )
      return
    }

    setEditing(false)
    // Re-render the server component so the header, stats and — if the native
    // language changed — the whole UI language pick up the new values.
    router.refresh()
  }

  if (!editing) {
    return (
      <Button variant="secondary" onClick={startEditing}>
        {t.profile.edit}
      </Button>
    )
  }

  return (
    <div className="bg-white border-2 border-stone-100 rounded-3xl p-6 sm:p-8 space-y-6">
      <h2 className="text-xl font-black text-stone-900">{t.profile.editTitle}</h2>

      <label className="block">
        <span className="block text-xs font-black uppercase tracking-wider text-stone-400 mb-1.5">
          {t.profile.usernameLabel}
        </span>
        <Input
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          disabled={saving}
        />
      </label>

      <div>
        <span className="block text-xs font-black uppercase tracking-wider text-stone-400 mb-1.5">
          {t.profile.nativeLabel}
        </span>
        <div className="grid grid-cols-2 gap-3">
          {LANGUAGES.map((opt) => (
            <button
              key={opt.value}
              type="button"
              disabled={saving}
              onClick={() => setNative(opt.value)}
              className={cn(
                'bg-white border-2 border-b-4 rounded-2xl py-4 transition-transform duration-150',
                'hover:-translate-y-0.5 active:translate-y-0.5 active:border-b-2',
                'disabled:opacity-50 disabled:cursor-not-allowed',
                native === opt.value
                  ? 'border-emerald-400'
                  : 'border-stone-200 hover:border-emerald-300'
              )}
            >
              <span className="block text-3xl mb-1">{opt.flag}</span>
              <span className="block text-sm font-black text-stone-900">
                {opt.label}
              </span>
            </button>
          ))}
        </div>
      </div>

      <div>
        <span className="block text-xs font-black uppercase tracking-wider text-stone-400 mb-1.5">
          {t.profile.levelLabel}
        </span>
        <div className="space-y-2">
          {LEVELS.map((opt) => (
            <button
              key={opt.value}
              type="button"
              disabled={saving}
              onClick={() => setLvl(opt.value)}
              className={cn(
                'w-full bg-white border-2 border-b-4 rounded-2xl px-4 py-3 text-left transition-transform duration-150',
                'hover:-translate-y-0.5 active:translate-y-0.5 active:border-b-2',
                'disabled:opacity-50 disabled:cursor-not-allowed',
                lvl === opt.value
                  ? 'border-emerald-400'
                  : 'border-stone-200 hover:border-emerald-300'
              )}
            >
              <span className="text-2xl mr-3">{opt.emoji}</span>
              <span className="text-base font-black text-stone-900">
                {t.common.levels[opt.value]}
              </span>
            </button>
          ))}
        </div>
      </div>

      {error && <p className="text-sm font-bold text-red-700">{error}</p>}

      <div className="flex flex-wrap gap-3">
        <Button onClick={save} disabled={saving}>
          {saving ? t.onboarding.saving : t.profile.save}
        </Button>
        <Button
          variant="secondary"
          onClick={() => setEditing(false)}
          disabled={saving}
        >
          {t.profile.cancel}
        </Button>
      </div>
    </div>
  )
}
