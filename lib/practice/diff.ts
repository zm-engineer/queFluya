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

type Token = { display: string; norm: string }

function tokenize(input: string): Token[] {
  return input
    .split(/\s+/)
    .filter(Boolean)
    .map((word) => ({
      display: word,
      norm: word.toLowerCase().replace(/[^\p{L}\p{N}]/gu, ''),
    }))
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

  for (let i = 1; i <= m; i++) {
    for (let j = 1; j <= n; j++) {
      if (E[i - 1].norm === A[j - 1].norm) {
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
    if (i > 0 && j > 0 && E[i - 1].norm === A[j - 1].norm) {
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
