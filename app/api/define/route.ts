import OpenAI from 'openai'
import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

type Lang = 'EN' | 'ES'
const LANG_NAME: Record<Lang, string> = { EN: 'English', ES: 'Spanish' }

// Monolingual dictionary prompt: define the word using ONLY the target language,
// at a simple (CEFR B1) level, with 1-3 common senses and an example each.
function definePrompt(word: string, language: Lang): string {
  const name = LANG_NAME[language]
  return `You are a monolingual ${name} dictionary for language learners.
Define the ${name} word "${word}" using ONLY simple ${name} — never use any other language.
Return strict JSON:
{"word": string, "found": boolean, "phonetic": string, "entries": [{"partOfSpeech": string, "meaning": string, "example": string}]}
Rules:
- "meaning" and "example" MUST be written in ${name} only.
- Give 1-3 of the most common senses; keep meanings short and clear (B1 level).
- "phonetic" is the IPA transcription, or "" if unsure.
- If "${word}" is not a real ${name} word, set "found": false and "entries": [].`
}

// On-demand translation: the native-language gloss, only fetched when the learner
// asks for help.
function translatePrompt(word: string, from: Lang, to: Lang): string {
  return `Translate the ${LANG_NAME[from]} word "${word}" into ${LANG_NAME[to]}.
Return strict JSON: {"word": string, "translation": string}
"translation" is the 1-3 most common ${LANG_NAME[to]} equivalents, comma-separated, in ${LANG_NAME[to]} only.`
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
    return NextResponse.json({ error: 'openai_not_configured' }, { status: 500 })
  }

  const body = await request.json()
  const word = typeof body?.word === 'string' ? body.word.trim().slice(0, 60) : ''
  const language: Lang | null =
    body?.language === 'EN' || body?.language === 'ES' ? body.language : null
  const mode: 'define' | 'translate' =
    body?.mode === 'translate' ? 'translate' : 'define'
  const nativeLanguage: Lang = language === 'EN' ? 'ES' : 'EN'

  if (!word || !language) {
    return NextResponse.json({ error: 'invalid_body' }, { status: 400 })
  }

  const prompt =
    mode === 'translate'
      ? translatePrompt(word, language, nativeLanguage)
      : definePrompt(word, language)

  const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY })

  try {
    const completion = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      temperature: 0,
      response_format: { type: 'json_object' },
      messages: [{ role: 'user', content: prompt }],
    })

    const raw = completion.choices[0]?.message?.content ?? ''
    let parsed: unknown
    try {
      parsed = JSON.parse(raw)
    } catch {
      return NextResponse.json({ error: 'malformed_response' }, { status: 502 })
    }

    return NextResponse.json(parsed)
  } catch (err) {
    console.error('OpenAI define failed:', err)
    return NextResponse.json(
      { error: 'define_failed', message: err instanceof Error ? err.message : 'unknown' },
      { status: 500 }
    )
  }
}
