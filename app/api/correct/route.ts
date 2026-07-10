import OpenAI from 'openai'
import { NextRequest, NextResponse } from 'next/server'
import { buildPrompt } from '@/lib/correction/build-prompt'
import { parseResponse } from '@/lib/correction/parse-response'
import { createClient } from '@/lib/supabase/server'
import type { CorrectionContext } from '@/lib/correction/types'

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
      { error: 'openai_not_configured' },
      { status: 500 }
    )
  }

  const body = await request.json()
  if (
    typeof body?.transcription !== 'string' ||
    typeof body?.freePrompt !== 'string' ||
    typeof body?.topicTitle !== 'string' ||
    typeof body?.topicDescription !== 'string' ||
    !Array.isArray(body?.vocabulary) ||
    !Array.isArray(body?.practicePhrases) ||
    (body?.language !== 'EN' && body?.language !== 'ES')
  ) {
    return NextResponse.json({ error: 'invalid_body' }, { status: 400 })
  }

  const ctx: CorrectionContext = {
    topicTitle: body.topicTitle,
    topicDescription: body.topicDescription,
    language: body.language,
    vocabulary: body.vocabulary,
    practicePhrases: body.practicePhrases,
    freePrompt: body.freePrompt,
    transcription: body.transcription,
  }

  const prompt = buildPrompt(ctx)
  const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY })

  try {
    const completion = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      temperature: 0,
      // JSON mode forces the model to return parseable JSON; the prompt
      // still defines the schema. Cheaper than Claude and natively
      // structured.
      response_format: { type: 'json_object' },
      messages: [{ role: 'user', content: prompt }],
    })

    const rawText = completion.choices[0]?.message?.content ?? ''

    const parsed = parseResponse(rawText)
    if (!parsed) {
      console.error('OpenAI returned malformed correction JSON:', rawText)
      return NextResponse.json(
        { error: 'malformed_response' },
        { status: 502 }
      )
    }

    return NextResponse.json(parsed)
  } catch (err) {
    console.error('OpenAI correction failed:', err)
    return NextResponse.json(
      {
        error: 'correction_failed',
        message: err instanceof Error ? err.message : 'unknown',
      },
      { status: 500 }
    )
  }
}
