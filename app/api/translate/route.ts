import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

type Lang = 'EN' | 'ES'
const CODE: Record<Lang, string> = { EN: 'en', ES: 'es' }

// Fast word/phrase translation (word in the studied language → the learner's
// native language). Uses Google's public `gtx` endpoint (free, no key, ~0.35s
// — MyMemory was ~1.4s, no faster than the AI define it was meant to beat) so
// the meaning shows almost instantly, while the richer AI definition loads
// separately. Auth is a light, local session check (no network round-trip) to
// keep it fast.
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
  const url =
    `https://translate.googleapis.com/translate_a/single?client=gtx` +
    `&sl=${CODE[language]}&tl=${CODE[to]}&dt=t&q=${encodeURIComponent(word)}`

  const controller = new AbortController()
  const timeout = setTimeout(() => controller.abort(), 4000)
  try {
    const res = await fetch(url, { signal: controller.signal })
    // gtx returns [ [ [ "<translated>", "<source>", … ], … ], … ]. The
    // translation is the first element of each segment, concatenated.
    const data = (await res.json().catch(() => null)) as unknown
    const segments = Array.isArray(data) && Array.isArray(data[0]) ? data[0] : []
    const translation = segments
      .map((seg) => (Array.isArray(seg) && typeof seg[0] === 'string' ? seg[0] : ''))
      .join('')
      .trim()
    return NextResponse.json({ translation })
  } catch {
    return NextResponse.json({ translation: '' })
  } finally {
    clearTimeout(timeout)
  }
}
