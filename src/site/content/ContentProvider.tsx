'use client';

import { createContext, useContext, useState, type ReactNode } from 'react';
import type { SiteContent } from '@/cms/types';

interface Ctx {
  value: SiteContent;
  base: SiteContent;
  setOverride: (c: SiteContent | null) => void;
}

const C = createContext<Ctx | null>(null);

/**
 * Veröffentlichte CMS-Inhalte für alle Client-Komponenten der Site (geladen im Site-Layout).
 * Die LD-Flow-Vorschau setzt per `setOverride` einen Entwurf — dann sehen auch Nav, Suche usw. die Änderungen.
 */
export function ContentProvider({ value, children }: { value: SiteContent; children: ReactNode }) {
  const [override, setOverride] = useState<SiteContent | null>(null);
  return <C.Provider value={{ value: override ?? value, base: value, setOverride }}>{children}</C.Provider>;
}

export function useContent(): SiteContent {
  const v = useContext(C);
  if (!v) throw new Error('useContent() außerhalb von <ContentProvider>');
  return v.value;
}

/** Nur für die Vorschau: veröffentlichte Inhalte (ohne Override) + Setter. */
export function useContentOverride() {
  const v = useContext(C);
  if (!v) throw new Error('useContentOverride() außerhalb von <ContentProvider>');
  return { base: v.base, setOverride: v.setOverride };
}
