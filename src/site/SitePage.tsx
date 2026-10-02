'use client';

import type { ReactNode } from 'react';
import { SiteFooter } from './chrome/SiteFooter';
import { useSite } from './settings/SiteProvider';

/** Seiten-Container (Prototyp Zeile 364: pageMaxW / pageMargin / padX / pageBotPad / pageClip). */
export function SitePage({ children }: { children: ReactNode }) {
  const { mob, sideActive, isMobile } = useSite();
  return (
    <main
      id="inhalt"
      style={{
        boxSizing: 'border-box',
        maxWidth: mob ? 430 : 1240,
        margin: sideActive ? '0 auto 0 max(266px, calc((100vw - 1304px) / 2))' : '0 auto',
        padding: `0 ${mob ? 18 : 32}px ${mob ? 96 : 0}px`,
        overflow: mob && !isMobile ? 'hidden' : 'visible',
        transition: 'max-width 0.4s ease',
      }}
    >
      {children}
      <SiteFooter />
    </main>
  );
}
