import OpenAI from 'openai'
import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

type Lang = 'EN' | 'ES'
const LANG_NAME: Record<Lang, string> = { EN: 'English', ES: 'Spanish' }

// DeepL target codes (free API rejects a bare "EN"; Spanish is just "ES").
const DEEPL_SOURCE: Record<Lang, string> = { EN: 'EN', ES: 'ES' }
const DEEPL_TARGET: Record<Lang, string> = { EN: 'EN-US', ES: 'ES' }

// Fast word translation (word in the studied language → the learner's native
// language), shown instantly while the richer AI definition loads separately.
// Engine order, each used only if the one before it isn't available/succeeds:
//   1. DeepL Free  (~0.3s, best, but needs DEEPL_API_KEY)
//   2. OpenAI      (~0.7s, reliable, reuses the key we already have)
//   3. MyMemory    (~1.4s, free, no key — last-resort so it never fully breaks)
// Auth is a light, local session check (no network round-trip) to stay fast.
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
  return data?.translations?.[0]?.text?.trim() || null
}

async function withOpenAI(word: string, from: Lang, to: Lang): Promise<string | null> {
  if (!process.env.OPENAI_API_KEY) return null
  const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY })
  const completion = await openai.chat.completions.create({
    model: 'gpt-4o-mini',
    temperature: 0,
    max_tokens: 30,
    messages: [
      {
        role: 'user',
        content: `Translate the ${LANG_NAME[from]} word "${word}" into ${LANG_NAME[to]}. Reply with ONLY the 1-3 most common ${LANG_NAME[to]} equivalents, comma-separated, and nothing else.`,
      },
    ],
  })
  return completion.choices[0]?.message?.content?.trim() || null
}

async function withMyMemory(
  word: string,
  from: Lang,
  to: Lang,
  signal: AbortSignal
): Promise<string> {
  const langpair = `${from.toLowerCase()}|${to.toLowerCase()}`
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
  const timeout = setTimeout(() => controller.abort(), 6000)
  try {
    const translation =
      (await withDeepL(word, language, to, controller.signal)) ??
      (await withOpenAI(word, language, to)) ??
      (await withMyMemory(word, language, to, controller.signal))
    return NextResponse.json({ translation })
  } catch {
    return NextResponse.json({ translation: '' })
  } finally {
    clearTimeout(timeout)
  }
}
