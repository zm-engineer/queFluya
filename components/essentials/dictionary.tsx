'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { useTTS } from '@/lib/practice/use-tts'
import { useDict } from '@/components/i18n/language-provider'
import type { Language } from '@/lib/topics'

type Entry = { partOfSpeech: string; meaning: string; example?: string }
type DefineResult = {
  word: string
  found: boolean
  phonetic?: string
  entries: Entry[]
}

// Session caches so the same word isn't looked up (and paid for) twice.
const defineCache = new Map<string, DefineResult>()
const translateCache = new Map<string, string>()

type Props = {
  /** The language being learned — the dictionary is monolingual in it. */
  language: Language
}

export function Dictionary({ language }: Props) {
  const t = useDict()
  const d = t.essentials.dictionary
  const synthesis = useTTS()

  const [query, setQuery] = useState('')
  const [status, setStatus] = useState<'idle' | 'searching' | 'error'>('idle')
  const [result, setResult] = useState<DefineResult | null>(null)
  const [translation, setTranslation] = useState<string | null>(null)
  const [translating, setTranslating] = useState(false)

  async function onSearch(e: React.FormEvent) {
    e.preventDefault()
    const word = query.trim()
    if (!word) return

    setResult(null)
    setTranslation(null)
    setStatus('searching')

    const key = `${language}:${word.toLowerCase()}`
    const cached = defineCache.get(key)
    if (cached) {
      setResult(cached)
      setStatus('idle')
      if (cached.found) synthesis.prefetch(cached.word, language)
      return
    }

    try {
      const r = await fetch('/api/define', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ word, language, mode: 'define' }),
      })
      if (!r.ok) throw new Error('define_failed')
      const data = (await r.json()) as DefineResult
      defineCache.set(key, data)
      setResult(data)
      setStatus('idle')
      if (data.found) synthesis.prefetch(data.word, language)
    } catch {
      setStatus('error')
    }
  }

  async function onHelp() {
    if (!result) return
    const key = `${language}:${result.word.toLowerCase()}`
    const cached = translateCache.get(key)
    if (cached) {
      setTranslation(cached)
      return
    }
    setTranslating(true)
    try {
      const r = await fetch('/api/define', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ word: result.word, language, mode: 'translate' }),
      })
      if (!r.ok) throw new Error('translate_failed')
      const data = (await r.json()) as { translation?: string }
      const value = data.translation ?? ''
      translateCache.set(key, value)
      setTranslation(value)
    } catch {
      setTranslation(d.error)
    } finally {
      setTranslating(false)
    }
  }

  return (
    <div className="space-y-6">
      <form onSubmit={onSearch} className="flex gap-3">
        <Input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder={d.searchPlaceholder}
          autoFocus
        />
        <Button type="submit" disabled={status === 'searching' || !query.trim()}>
          🔎
        </Button>
      </form>

      {status === 'searching' && (
        <p className="text-sm font-bold text-stone-400">{d.searching}</p>
      )}

      {status === 'error' && (
        <p className="text-sm font-bold text-red-600">{d.error}</p>
      )}

      {status === 'idle' && !result && (
        <p className="text-sm font-semibold text-stone-400">{d.prompt}</p>
      )}

      {result && !result.found && (
        <p className="text-sm font-bold text-stone-500">{d.notFound(result.word)}</p>
      )}

      {result && result.found && (
        <div className="bg-white border-2 border-stone-100 rounded-3xl p-6">
          <div className="flex items-center gap-3 flex-wrap mb-4">
            <span className="text-2xl font-black text-stone-900">
              {result.word}
            </span>
            {result.phonetic && (
              <span className="text-sm font-semibold text-stone-400">
                {result.phonetic}
              </span>
            )}
            {synthesis.isSupported && (
              <button
                type="button"
                onClick={() => synthesis.speak(result.word, language)}
                disabled={synthesis.isSpeaking}
                aria-label={t.practice.listen}
                className="shrink-0 w-9 h-9 flex items-center justify-center rounded-full bg-emerald-100 text-emerald-700 hover:bg-emerald-200 disabled:opacity-50 transition-colors"
              >
                🔊
              </button>
            )}
          </div>

          <ul className="space-y-4">
            {result.entries.map((entry, i) => (
              <li key={i}>
                <span className="text-[11px] font-black uppercase tracking-wider text-emerald-600">
                  {entry.partOfSpeech}
                </span>
                <p className="text-base font-bold text-stone-800 leading-snug mt-0.5">
                  {entry.meaning}
                </p>
                {entry.example && (
                  <p className="text-sm font-semibold text-stone-400 italic mt-1">
                    “{entry.example}”
                  </p>
                )}
              </li>
            ))}
          </ul>

          {/* Help: reveal the native-language translation only on demand */}
          <div className="mt-6 pt-4 border-t-2 border-stone-100">
            {translation === null ? (
              <button
                type="button"
                onClick={onHelp}
                disabled={translating}
                className="text-sm font-black text-stone-500 hover:text-emerald-600 disabled:opacity-50 transition-colors"
              >
                {translating ? d.searching : d.help}
              </button>
            ) : (
              <p className="text-base font-black text-emerald-700">{translation}</p>
            )}
          </div>
        </div>
      )}
    </div>
  )
}
