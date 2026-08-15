// Pure rules for the dashboard "journey" — what kind each section is, and the
// gating: you can jump to any section freely EXCEPT the tandem/video-call one,
// which stays locked until you've completed the phrase-practice section(s).

import type { TopicSection } from './topics'

export type SectionKind = 'study' | 'shadowing' | 'recording' | 'video' | 'tandem'

export function sectionKind(section: TopicSection): SectionKind {
  if (section.comingSoon === 'tandem') return 'tandem'
  if (section.comingSoon) return 'video'
  if (section.shadowing) return 'shadowing'
  if (section.freeRecordingPrompt) return 'recording'
  return 'study'
}

/**
 * The tandem (live video call) unlocks only once every phrase-practice section
 * is completed — you shouldn't jump into a live exchange without having drilled
 * the phrases first. Topics without any phrase practice unlock it immediately.
 */
export function isTandemUnlocked(
  sections: TopicSection[],
  completed: Set<number>
): boolean {
  const practiceIdxs = sections
    .map((section, idx) => ({ section, idx }))
    .filter(
      ({ section }) =>
        sectionKind(section) === 'study' && section.practicePhrases.length > 0
    )
    .map(({ idx }) => idx)

  if (practiceIdxs.length === 0) return true
  return practiceIdxs.every((idx) => completed.has(idx))
}

/**
 * Free navigation to every section, except the tandem one which is gated.
 */
export function isSectionAccessible(
  sections: TopicSection[],
  idx: number,
  completed: Set<number>
): boolean {
  if (sectionKind(sections[idx]) === 'tandem') {
    return isTandemUnlocked(sections, completed)
  }
  return true
}
