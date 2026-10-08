'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { useTTS } from '@/lib/practice/use-tts'
import { pingEssentialsActivity } from '@/lib/essentials-activity'
import { useDict } from '@/components/i18n/language-provider'
import type { Language } from '@/lib/topics'

type Entry = { partOfSpeech: string; meaning: string; example?: string }
type DefineResult = {
  word: string
  found: boolean
  phonetic?: string
  entries: Entry[]
}
type PhraseResult = { phrase: string; explanation: string; translation: string }

// Session caches so the same lookup isn't paid for twice.
const defineCache = new Map<string, DefineResult>()
const fastCache = new Map<string, string>()
const phraseCache = new Map<string, PhraseResult>()

type Props = {
  /** The language being learned — the dictionary is monolingual in it. */
  language: Language
}

export function Dictionary({ language }: Props) {
  const t = useDict()
  const d = t.essentials.dictionary
  const synthesis = useTTS()

  const [query, setQuery] = useState('')
  const [searchedWord, setSearchedWord] = useState<string | null>(null)
  // Instant translation (MyMemory) — shown first; the AI definition fills in after.
  const [fastTranslation, setFastTranslation] = useState<string | null>(null)
  const [translatingFast, setTranslatingFast] = useState(false)
  const [result, setResult] = useState<DefineResult | null>(null)
  const [defining, setDefining] = useState(false)

  // Phrase-help block
  const [phraseQuery, setPhraseQuery] = useState('')
  const [phraseStatus, setPhraseStatus] = useState<'idle' | 'searching' | 'error'>('idle')
  const [phraseResult, setPhraseResult] = useState<PhraseResult | null>(null)
  // The Spanish translation stays hidden until the learner asks for it.
  const [phraseTransShown, setPhraseTransShown] = useState(false)

  async function onSearch(e: React.FormEvent) {
    e.preventDefault()
    const word = query.trim()
    if (!word) return
    pingEssentialsActivity()

    const key = `${language}:${word.toLowerCase()}`
    setSearchedWord(word)
    setResult(null)
    setFastTranslation(null)

    // 1) Instant translation (fast, free) — the meaning the learner wants NOW.
    const tCached = fastCache.get(key)
    if (tCached !== undefined) {
      setFastTranslation(tCached)
    } else {
      setTranslatingFast(true)
      fetch('/api/translate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ word, language }),
      })
        .then((r) => (r.ok ? r.json() : null))
        .then((data) => {
          const value = (data?.translation ?? '') as string
          fastCache.set(key, value)
          setFastTranslation(value)
        })
        .catch(() => setFastTranslation(''))
        .finally(() => setTranslatingFast(false))
    }

    // 2) AI monolingual definition (richer, slower) — loads in parallel, below.
    const dCached = defineCache.get(key)
    if (dCached) {
      setResult(dCached)
      if (dCached.found) synthesis.prefetch(dCached.word, language)
    } else {
      setDefining(true)
      fetch('/api/define', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ word, language, mode: 'define' }),
      })
        .then((r) => (r.ok ? (r.json() as Promise<DefineResult>) : null))
        .then((data) => {
          if (!data) return
          defineCache.set(key, data)
          setResult(data)
          if (data.found) synthesis.prefetch(data.word, language)
        })
        .catch(() => {})
        .finally(() => setDefining(false))
    }
  }

  async function onPhrase(e: React.FormEvent) {
    e.preventDefault()
    const phrase = phraseQuery.trim()
    if (!phrase) return
    pingEssentialsActivity()

    setPhraseResult(null)
    setPhraseTransShown(false)
    setPhraseStatus('searching')

    const key = `${language}:${phrase.toLowerCase()}`
    const cached = phraseCache.get(key)
    if (cached) {
      setPhraseResult(cached)
      setPhraseStatus('idle')
      synthesis.prefetch(cached.phrase, language)
      return
    }

    try {
      const r = await fetch('/api/define', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phrase, language, mode: 'phrase' }),
      })
      if (!r.ok) throw new Error('phrase_failed')
      const data = (await r.json()) as PhraseResult
      phraseCache.set(key, data)
      setPhraseResult(data)
      setPhraseStatus('idle')
      synthesis.prefetch(data.phrase, language)
    } catch {
      setPhraseStatus('error')
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
        <Button type="submit" disabled={!query.trim()}>
          🔎
        </Button>
      </form>

      {!searchedWord && (
        <p className="text-sm font-semibold text-stone-400">{d.prompt}</p>
      )}

      {searchedWord && (
        <div className="bg-white border-2 border-stone-100 rounded-3xl p-6">
          <div className="flex items-center gap-3 flex-wrap">
            <span className="text-2xl font-black text-stone-900">
              {searchedWord}
            </span>
            {result?.phonetic && (
              <span className="text-sm font-semibold text-stone-400">
                {result.phonetic}
              </span>
            )}
            {synthesis.isSupported && (
              <button
                type="button"
                onClick={() => synthesis.speak(searchedWord, language)}
                disabled={synthesis.isSpeaking}
                aria-label={t.practice.listen}
                className="shrink-0 w-9 h-9 flex items-center justify-center rounded-full bg-emerald-100 text-emerald-700 hover:bg-emerald-200 disabled:opacity-50 transition-colors"
              >
                🔊
              </button>
            )}
          </div>

          {/* Instant translation — the meaning they want, shown first/fast. */}
          <p className="mt-3 text-xl font-black text-emerald-700">
            {translatingFast && fastTranslation === null
              ? '…'
              : fastTranslation || (fastTranslation === '' ? '—' : null)}
          </p>

          {/* AI monolingual definition — loads in parallel, fills in below. */}
          <div className="mt-6 pt-4 border-t-2 border-stone-100">
            {defining && !result && (
              <p className="text-sm font-bold text-stone-400">{d.searching}</p>
            )}
            {result && !result.found && (
              <p className="text-sm font-bold text-stone-500">
                {d.notFound(result.word)}
              </p>
            )}
            {result?.found && (
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
            )}
          </div>
        </div>
      )}

      {/* Phrase help — a separate block on the same page. */}
      <section className="border-t-2 border-stone-100 pt-8 space-y-4">
        <div>
          <h2 className="text-lg font-black text-stone-900">{d.phraseTitle}</h2>
          <p className="text-sm font-semibold text-stone-500 mt-1">{d.phraseDesc}</p>
        </div>

        <form onSubmit={onPhrase} className="flex gap-3">
          <textarea
            value={phraseQuery}
            onChange={(e) => setPhraseQuery(e.target.value)}
            placeholder={d.phrasePlaceholder}
            rows={2}
            className="flex-1 rounded-2xl border-2 border-stone-200 bg-white px-4 py-3 text-sm font-semibold text-stone-900 placeholder:text-stone-400 outline-none focus:border-emerald-400 focus:ring-2 focus:ring-emerald-100 resize-none"
          />
          <Button
            type="submit"
            disabled={phraseStatus === 'searching' || !phraseQuery.trim()}
          >
            💬
          </Button>
        </form>

        {phraseStatus === 'searching' && (
          <p className="text-sm font-bold text-stone-400">{d.searching}</p>
        )}
        {phraseStatus === 'error' && (
          <p className="text-sm font-bold text-red-600">{d.error}</p>
        )}
        {phraseStatus === 'idle' && !phraseResult && (
          <p className="text-sm font-semibold text-stone-400">{d.phrasePrompt}</p>
        )}

        {phraseResult && (
          <div className="bg-white border-2 border-stone-100 rounded-3xl p-6">
            <div className="flex items-start gap-3 mb-4">
              <p className="flex-1 text-base font-black text-stone-900 leading-snug">
                “{phraseResult.phrase}”
              </p>
              {synthesis.isSupported && (
                <button
                  type="button"
                  onClick={() => synthesis.speak(phraseResult.phrase, language)}
                  disabled={synthesis.isSpeaking}
                  aria-label={t.practice.listen}
                  className="shrink-0 w-9 h-9 flex items-center justify-center rounded-full bg-emerald-100 text-emerald-700 hover:bg-emerald-200 disabled:opacity-50 transition-colors"
                >
                  🔊
                </button>
              )}
            </div>
            <p className="text-base font-bold text-stone-800 leading-snug">
              {phraseResult.explanation}
            </p>

            {/* Help: reveal the Spanish translation only on demand */}
            <div className="mt-6 pt-4 border-t-2 border-stone-100">
              {!phraseTransShown ? (
                <button
                  type="button"
                  onClick={() => setPhraseTransShown(true)}
                  className="text-sm font-black text-stone-500 hover:text-emerald-600 transition-colors"
                >
                  {d.help}
                </button>
              ) : (
                <p className="text-base font-black text-emerald-700 leading-snug">
                  {phraseResult.translation}
                </p>
              )}
            </div>
          </div>
        )}
      </section>
    </div>
  )
}
