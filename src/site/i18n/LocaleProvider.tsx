'use client';

import { createContext, useCallback, useContext, type ReactNode } from 'react';
import { translate, type UiKey } from './dict';
import { DEFAULT_LOCALE, localizePath, type Locale } from './locale';

const LocaleContext = createContext<Locale>(DEFAULT_LOCALE);

/** Sprache der aktuellen Site-Ansicht — gesetzt vom Layout (/ bzw. /en) oder von der LD-Flow-Vorschau. */
export function LocaleProvider({ locale, children }: { locale: Locale; children: ReactNode }) {
  return <LocaleContext.Provider value={locale}>{children}</LocaleContext.Provider>;
}

export const useLocale = (): Locale => useContext(LocaleContext);

/** UI-Text der aktuellen Sprache: t('nav.search'), mit Platzhaltern t('x', { n: 3 }). */
export function useT() {
  const locale = useLocale();
  return useCallback((key: UiKey, vars?: Record<string, string | number>) => translate(locale, key, vars), [locale]);
}

/** Interne (kanonische) Pfade in Adressen der aktuellen Sprache übersetzen: href('/ueber-mich') → '/en/about'. */
export function useHref() {
  const locale = useLocale();
  return useCallback((path: string) => localizePath(path, locale), [locale]);
}
