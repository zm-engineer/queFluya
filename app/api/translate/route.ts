import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

type Lang = 'EN' | 'ES'
const CODE: Record<Lang, string> = { EN: 'en', ES: 'es' }

// Fast word/phrase translation (word in the studied language → the learner's
// native language). Uses MyMemory (free, no key) so the meaning shows almost
// instantly — the richer AI definition loads separately. Auth is a light,
// local session check (no network round-trip) to keep it fast.
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
  const langpair = `${CODE[language]}|${CODE[to]}`
  const url = `https://api.mymemory.translated.net/get?q=${encodeURIComponent(
    word
  )}&langpair=${langpair}`

  const controller = new AbortController()
  const timeout = setTimeout(() => controller.abort(), 5000)
  try {
    const res = await fetch(url, { signal: controller.signal })
    const data = (await res.json().catch(() => null)) as {
      responseData?: { translatedText?: string }
    } | null
    const translation = data?.responseData?.translatedText ?? ''
    return NextResponse.json({ translation })
  } catch {
    return NextResponse.json({ translation: '' })
  } finally {
    clearTimeout(timeout)
  }
}
