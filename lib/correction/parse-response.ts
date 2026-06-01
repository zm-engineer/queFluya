import type { Correction } from './types'

/**
 * Defensively parse Claude's response. Claude usually outputs clean JSON when
 * asked, but occasionally wraps it in ```json fences or omits optional
 * fields. We strip fences, validate the two required string fields, and
 * coerce missing arrays to empty.
 */
export function parseResponse(raw: string): Correction | null {
  const stripped = raw
    .trim()
    .replace(/^```(?:json)?\s*/i, '')
    .replace(/\s*```$/, '')
    .trim()

  let parsed: unknown
  try {
    parsed = JSON.parse(stripped)
  } catch {
    return null
  }

  if (!parsed || typeof parsed !== 'object') return null
  const obj = parsed as Record<string, unknown>

  if (typeof obj.corrected !== 'string') return null
  if (typeof obj.fluency !== 'string') return null

  const asStringArray = (value: unknown): string[] =>
    Array.isArray(value) ? value.filter((v): v is string => typeof v === 'string') : []

  return {
    corrected: obj.corrected,
    vocabUsed: asStringArray(obj.vocabUsed),
    vocabSuggested: asStringArray(obj.vocabSuggested),
    grammarTips: asStringArray(obj.grammarTips),
    fluency: obj.fluency,
  }
}
