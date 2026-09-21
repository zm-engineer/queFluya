import { createHash } from 'node:crypto'
import { NextRequest, NextResponse } from 'next/server'
import OpenAI from 'openai'
import { createClient } from '@/lib/supabase/server'

const BUCKET = 'tts-cache'

const MODEL = 'gpt-4o-mini-tts'
const VOICE = 'nova'

// Accent/style guidance per language. gpt-4o-mini-tts follows these, which is
// what fixes Spanish sounding like an English voice reading Spanish text.
const INSTRUCTIONS: Record<'EN' | 'ES', string> = {
  ES: 'Habla en español con acento nativo neutro, claro y natural, comprensible tanto en España como en Latinoamérica. Ritmo tranquilo y buena dicción, como para alguien que está aprendiendo el idioma.',
  EN: 'Speak in natural, native English with a clear, neutral accent. Calm pace and crisp pronunciation, as if helping a language learner.',
}

export async function POST(request: NextRequest) {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) {
    return NextResponse.json({ error: 'unauthorized' }, { status: 401 })
  }

  if (!process.env.OPENAI_API_KEY) {
    return NextResponse.json(
      { error: 'tts_not_configured' },
      { status: 500 }
    )
  }

  const body = await request.json()
  const text = body?.text
  if (typeof text !== 'string' || text.length === 0) {
    return NextResponse.json({ error: 'no_text' }, { status: 400 })
  }
  if (text.length > 4096) {
    return NextResponse.json({ error: 'text_too_long' }, { status: 400 })
  }
  // Default to English if the client didn't say — keeps old callers working.
  const language: 'EN' | 'ES' = body?.language === 'ES' ? 'ES' : 'EN'

  // Deterministic filename: same text+language always lands at the same path. If
  // the voice/model/instructions change, bump the prefix so old entries (with
  // the previous accent) are not reused.
  const hash = createHash('sha256')
    .update(`v2:${VOICE}:${MODEL}:${language}:${text}`)
    .digest('hex')
    .slice(0, 32)
  const filename = `${hash}.mp3`

  const { data: existing } = await supabase.storage
    .from(BUCKET)
    .list('', { search: filename })

  if (existing?.some((file) => file.name === filename)) {
    const { data } = supabase.storage.from(BUCKET).getPublicUrl(filename)
    return NextResponse.json({ url: data.publicUrl, cached: true })
  }

  const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY })

  try {
    const audio = await openai.audio.speech.create({
      model: MODEL,
      voice: VOICE,
      input: text,
      instructions: INSTRUCTIONS[language],
      response_format: 'mp3',
    })
    const buffer = Buffer.from(await audio.arrayBuffer())

    const { error: uploadError } = await supabase.storage
      .from(BUCKET)
      .upload(filename, buffer, {
        contentType: 'audio/mpeg',
        upsert: false,
      })

    // Ignore "already exists" race — another concurrent request beat us.
    if (uploadError && !uploadError.message.toLowerCase().includes('already exists')) {
      console.error('TTS upload failed:', uploadError)
      // Fall through and return the URL anyway — the file may still play.
    }

    const { data } = supabase.storage.from(BUCKET).getPublicUrl(filename)
    return NextResponse.json({ url: data.publicUrl, cached: false })
  } catch (err) {
    console.error('OpenAI TTS failed:', err)
    return NextResponse.json(
      {
        error: 'tts_failed',
        message: err instanceof Error ? err.message : 'unknown',
      },
      { status: 500 }
    )
  }
}
