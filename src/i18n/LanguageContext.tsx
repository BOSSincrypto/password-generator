import { createContext, useCallback, useContext, useEffect, useState, type ReactNode } from 'react'
import { translations, type Language, type TranslationKey, t as translate } from './translations'

const STORAGE_KEY = 'password-generator-lang'

interface LanguageContextValue {
  lang: Language
  setLang: (lang: Language) => void
  t: (key: TranslationKey, ...args: any[]) => string
  strengthLabels: string[]
}

const LanguageContext = createContext<LanguageContextValue | null>(null)

function getInitialLanguage(): Language {
  if (typeof window === 'undefined') return 'en'
  const stored = window.localStorage.getItem(STORAGE_KEY)
  if (stored === 'en' || stored === 'ru') return stored
  return 'en'
}

interface LanguageProviderProps {
  children: ReactNode
}

export function LanguageProvider({ children }: LanguageProviderProps) {
  const [lang, setLangState] = useState<Language>(getInitialLanguage)

  const setLang = useCallback((nextLang: Language) => {
    setLangState(nextLang)
  }, [])

  useEffect(() => {
    if (typeof window === 'undefined') return
    window.localStorage.setItem(STORAGE_KEY, lang)
    document.documentElement.lang = lang
    document.title = translate(lang, 'htmlTitle')
  }, [lang])

  const t = useCallback(
    (key: TranslationKey, ...args: any[]) => translate(lang, key, ...args),
    [lang]
  )

  const value: LanguageContextValue = {
    lang,
    setLang,
    t,
    strengthLabels: translations[lang].strengthLabels,
  }

  return <LanguageContext.Provider value={value}>{children}</LanguageContext.Provider>
}

export function useLanguage(): LanguageContextValue {
  const context = useContext(LanguageContext)
  if (!context) {
    throw new Error('useLanguage must be used within a LanguageProvider')
  }
  return context
}
