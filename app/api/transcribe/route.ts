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
      { error: 'transcription_not_configured' },
      { status: 500 }
    )
  }

  const formData = await request.formData()
  const audio = formData.get('audio')
  const language = formData.get('language')
  const prompt = formData.get('prompt')

  if (!(audio instanceof File) || audio.size === 0) {
    return NextResponse.json({ error: 'no_audio' }, { status: 400 })
  }

  const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY })

  try {
    const transcription = await openai.audio.transcriptions.create({
      file: audio,
      model: 'whisper-1',
      language: language === 'EN' ? 'en' : language === 'ES' ? 'es' : undefined,
      // A prompt biases Whisper toward expected vocabulary and phrasing
      // without forcing it — best fix for short language-learning phrases
      // where the model would otherwise hallucinate filler.
      prompt: typeof prompt === 'string' && prompt.length > 0 ? prompt : undefined,
      // Deterministic output for the same input. No creative re-interpretation.
      temperature: 0,
    })
    return NextResponse.json({ transcript: transcription.text })
  } catch (err) {
    console.error('Whisper transcription failed:', err)
    return NextResponse.json(
      {
        error: 'transcription_failed',
        message: err instanceof Error ? err.message : 'unknown',
      },
      { status: 500 }
    )
  }
}
