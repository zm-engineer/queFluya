import type { Language, TopicVocab } from '@/lib/topics'

/** Material from a topic that the user is supposed to put into practice. */
export type CorrectionContext = {
  topicTitle: string
  topicDescription: string
  language: Language
  vocabulary: TopicVocab[]
  practicePhrases: string[]
  freePrompt: string
  transcription: string
}

/** The structured feedback we expect from Claude. */
export type Correction = {
  corrected: string
  vocabUsed: string[]
  vocabSuggested: string[]
  grammarTips: string[]
  fluency: string
}
