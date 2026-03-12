'use client';
import { createContext, useContext, useState, ReactNode } from 'react';
import { translations, Lang } from '@/i18n/translations';

type LangContextType = {
  lang: Lang;
  setLang: (l: Lang) => void;
  t: typeof translations.EN;
};

const LangContext = createContext<LangContextType>({
  lang: 'EN',
  setLang: () => {},
  t: translations.EN,
});

export function LangProvider({ children }: { children: ReactNode }) {
  const [lang, setLang] = useState<Lang>('EN');
  return (
    <LangContext.Provider value={{ lang, setLang, t: translations[lang] }}>
      {children}
    </LangContext.Provider>
  );
}

export const useLang = () => useContext(LangContext);
