export type DiffState = 'match' | 'mistake' | 'extra' | 'missing'

export type DiffWord = {
  text: string
  state: DiffState
}

export type DiffResult = {
  words: DiffWord[]
  matchCount: number
  totalExpected: number
  /** Percentage of expected words spoken correctly, 0-100, rounded. */
  score: number
}

type Token = { display: string; norm: string; placeholder?: boolean }

/**
 * Split on whitespace, but keep `[bracketed groups]` (with any trailing
 * punctuation) together as one token flagged as a placeholder. Placeholders
 * are treated as wildcards by `comparePhrase` so users filling them with
 * personal info ("[your name]" → "Ziuling") still score correctly.
 */
function tokenize(input: string): Token[] {
  const tokens: Token[] = []
  const regex = /\[[^\]]*\][^\s]*|\S+/g
  let match: RegExpExecArray | null
  while ((match = regex.exec(input)) !== null) {
    const text = match[0]
    const placeholder = text.startsWith('[')
    tokens.push({
      display: text,
      norm: text.toLowerCase().replace(/[^\p{L}\p{N}]/gu, ''),
      placeholder,
    })
  }
  return tokens
}

/**
 * Compare a target phrase against a user transcription word by word using
 * Wagner-Fischer alignment. Case and punctuation are stripped for matching,
 * but the original casing of the expected words is preserved for display.
 *
 * The returned `words` array interleaves all four states so the UI can render
 * a single inline sequence (e.g. "I [am] happy" with "am" struck through).
 */
export function comparePhrase(expected: string, actual: string): DiffResult {
  const E = tokenize(expected)
  const A = tokenize(actual)
  const m = E.length
  const n = A.length

  if (m === 0 && n === 0) {
    return { words: [], matchCount: 0, totalExpected: 0, score: 0 }
  }

  const dp: number[][] = Array.from({ length: m + 1 }, () =>
    new Array<number>(n + 1).fill(0)
  )
  for (let i = 0; i <= m; i++) dp[i][0] = i
  for (let j = 0; j <= n; j++) dp[0][j] = j

  // Placeholders always match the actual token at the same alignment position
  // — they're "free" substitutions with cost 0.
  const matches = (expected: Token, actual: Token) =>
    expected.placeholder || expected.norm === actual.norm

  for (let i = 1; i <= m; i++) {
    for (let j = 1; j <= n; j++) {
      if (matches(E[i - 1], A[j - 1])) {
        dp[i][j] = dp[i - 1][j - 1]
      } else {
        dp[i][j] =
          1 +
          Math.min(
            dp[i - 1][j - 1], // substitute
            dp[i - 1][j],     // missing (skip an expected word)
            dp[i][j - 1]      // extra (skip an actual word)
          )
      }
    }
  }

  const words: DiffWord[] = []
  let i = m
  let j = n
  while (i > 0 || j > 0) {
    // Placeholder corner case: when an unfilled slot can be either "match
    // against the last available actual" or "missing" at the same DP cost,
    // prefer missing — otherwise the placeholder greedily eats a literal
    // word that should have aligned earlier in the sequence.
    if (
      i > 0 &&
      E[i - 1].placeholder &&
      dp[i][j] === dp[i - 1][j] + 1
    ) {
      words.unshift({ text: E[i - 1].display, state: 'missing' })
      i--
      continue
    }

    if (i > 0 && j > 0 && matches(E[i - 1], A[j - 1])) {
      words.unshift({ text: E[i - 1].display, state: 'match' })
      i--
      j--
    } else if (
      i > 0 &&
      j > 0 &&
      dp[i][j] === dp[i - 1][j - 1] + 1
    ) {
      words.unshift({ text: E[i - 1].display, state: 'mistake' })
      i--
      j--
    } else if (i > 0 && dp[i][j] === dp[i - 1][j] + 1) {
      words.unshift({ text: E[i - 1].display, state: 'missing' })
      i--
    } else {
      words.unshift({ text: A[j - 1].display, state: 'extra' })
      j--
    }
  }

  const matchCount = words.filter((w) => w.state === 'match').length
  const totalExpected = m
  const score =
    totalExpected === 0 ? 0 : Math.round((matchCount / totalExpected) * 100)

  return { words, matchCount, totalExpected, score }
}
