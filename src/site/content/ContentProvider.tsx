'use client';

import { createContext, useContext, type ReactNode } from 'react';
import type { SiteContent } from '@/cms/types';

const Ctx = createContext<SiteContent | null>(null);

/** Veröffentlichte CMS-Inhalte für alle Client-Komponenten der Site (geladen im Site-Layout). */
export function ContentProvider({ value, children }: { value: SiteContent; children: ReactNode }) {
  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

export function useContent(): SiteContent {
  const v = useContext(Ctx);
  if (!v) throw new Error('useContent() außerhalb von <ContentProvider>');
  return v;
}
