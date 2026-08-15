'use client'

import { createContext, useContext } from 'react'
import { getDict, type Dict } from '@/lib/i18n/dictionaries'
import type { Language } from '@/lib/topics'

const DictContext = createContext<Dict | null>(null)

/** Provides the UI dictionary for the user's native language to client components. */
export function LanguageProvider({
  nativeLanguage,
  children,
}: {
  nativeLanguage: Language
  children: React.ReactNode
}) {
  return (
    <DictContext.Provider value={getDict(nativeLanguage)}>
      {children}
    </DictContext.Provider>
  )
}

/**
 * UI dictionary for the current user (client components). Falls back to the
 * default (Spanish) dictionary when rendered without a provider — the real app
 * always has one (root + dashboard layouts), so this only covers tests and edge
 * cases rather than crashing.
 */
export function useDict(): Dict {
  return useContext(DictContext) ?? getDict('ES')
}
