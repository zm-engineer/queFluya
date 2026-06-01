import { NextRequest, NextResponse } from 'next/server'
import OpenAI from 'openai'
import { createClient } from '@/lib/supabase/server'

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

  const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY })

  try {
    const audio = await openai.audio.speech.create({
      model: 'tts-1',
      voice: 'nova',
      input: text,
      response_format: 'mp3',
    })

    const buffer = Buffer.from(await audio.arrayBuffer())
    return new NextResponse(buffer, {
      headers: {
        'Content-Type': 'audio/mpeg',
        'Content-Length': String(buffer.length),
      },
    })
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
