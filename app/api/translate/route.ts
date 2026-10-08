import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

type Lang = 'EN' | 'ES'

// DeepL target codes (free API rejects a bare "EN"; Spanish is just "ES").
const DEEPL_SOURCE: Record<Lang, string> = { EN: 'EN', ES: 'ES' }
const DEEPL_TARGET: Record<Lang, string> = { EN: 'EN-US', ES: 'ES' }
// MyMemory (fallback) uses lowercase ISO codes in a `from|to` pair.
const MYMEMORY: Record<Lang, string> = { EN: 'en', ES: 'es' }

// Fast word/phrase translation (word in the studied language → the learner's
// native language), shown instantly while the richer AI definition loads
// separately. Primary engine is DeepL Free (~0.3s, reliable, best quality);
// if no key is configured (or DeepL errors) we fall back to MyMemory (free,
// no key, but ~1.4s) so the feature still works. Auth is a light, local
// session check (no network round-trip) to keep it fast.
async function withDeepL(
  word: string,
  from: Lang,
  to: Lang,
  signal: AbortSignal
): Promise<string | null> {
  const key = process.env.DEEPL_API_KEY
  if (!key) return null
  // Free keys end in ":fx" and must hit the api-free host; paid keys use api.
  const host = key.endsWith(':fx') ? 'api-free.deepl.com' : 'api.deepl.com'
  const res = await fetch(`https://${host}/v2/translate`, {
    method: 'POST',
    headers: {
      Authorization: `DeepL-Auth-Key ${key}`,
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    body: new URLSearchParams({
      text: word,
      source_lang: DEEPL_SOURCE[from],
      target_lang: DEEPL_TARGET[to],
    }),
    signal,
  })
  if (!res.ok) return null
  const data = (await res.json().catch(() => null)) as {
    translations?: { text?: string }[]
  } | null
  return data?.translations?.[0]?.text?.trim() ?? null
}

async function withMyMemory(
  word: string,
  from: Lang,
  to: Lang,
  signal: AbortSignal
): Promise<string> {
  const langpair = `${MYMEMORY[from]}|${MYMEMORY[to]}`
  const url = `https://api.mymemory.translated.net/get?q=${encodeURIComponent(
    word
  )}&langpair=${langpair}`
  const res = await fetch(url, { signal })
  const data = (await res.json().catch(() => null)) as {
    responseData?: { translatedText?: string }
  } | null
  return data?.responseData?.translatedText?.trim() ?? ''
}

export async function POST(request: NextRequest) {
  const supabase = await createClient()
  const {
    data: { session },
  } = await supabase.auth.getSession()
  if (!session) {
    return NextResponse.json({ error: 'unauthorized' }, { status: 401 })
  }

  const body = await request.json().catch(() => null)
  const word = typeof body?.word === 'string' ? body.word.trim().slice(0, 100) : ''
  const language: Lang | null =
    body?.language === 'EN' || body?.language === 'ES' ? body.language : null
  if (!word || !language) {
    return NextResponse.json({ error: 'invalid_body' }, { status: 400 })
  }

  const to: Lang = language === 'EN' ? 'ES' : 'EN'
  const controller = new AbortController()
  const timeout = setTimeout(() => controller.abort(), 4000)
  try {
    const deepl = await withDeepL(word, language, to, controller.signal)
    const translation =
      deepl ?? (await withMyMemory(word, language, to, controller.signal))
    return NextResponse.json({ translation })
  } catch {
    return NextResponse.json({ translation: '' })
  } finally {
    clearTimeout(timeout)
  }
}
