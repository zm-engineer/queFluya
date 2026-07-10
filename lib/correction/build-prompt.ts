import type { CorrectionContext } from './types'

const LANGUAGE_NAME: Record<'EN' | 'ES', string> = {
  EN: 'English',
  ES: 'Spanish',
}

/**
 * Build the prompt sent to Claude for a free-recording correction.
 *
 * The model gets the topic context (title, description, vocabulary, practice
 * phrases) plus the user's transcription, and is asked to judge how well the
 * transcription puts that material into practice — not just generic
 * correctness.
 */
export function buildPrompt(ctx: CorrectionContext): string {
  const language = LANGUAGE_NAME[ctx.language]
  const vocabList = ctx.vocabulary
    .map((v) => `- ${v.term} (${v.translation})`)
    .join('\n')
  const phraseList = ctx.practicePhrases.map((p) => `- ${p}`).join('\n')

  return `You are a friendly ${language} teacher giving feedback to a learner who just finished a topic and is now putting it into practice with free speech.

The topic is:
Title: ${ctx.topicTitle}
Description: ${ctx.topicDescription}

The vocabulary the learner studied in this topic:
${vocabList}

The practice phrases the learner repeated:
${phraseList}

The free-recording prompt that the learner was given:
"${ctx.freePrompt}"

The learner's actual transcription (from Whisper, possibly imperfect):
"${ctx.transcription}"

Evaluate the transcription against the topic material. Be concrete, kind, and brief. Respond ONLY with a JSON object — no prose, no Markdown — with this exact shape:

{
  "corrected": "A polished version of what the learner said, in ${language}",
  "vocabUsed": ["Topic vocabulary the learner actually used (use the term as it appears in the list)"],
  "vocabSuggested": ["Topic vocabulary they could have used but didn't"],
  "grammarTips": ["At most 3 specific grammar or phrasing notes, in Spanish"],
  "fluency": "One short sentence in Spanish about overall fluency/rhythm"
}`
}
