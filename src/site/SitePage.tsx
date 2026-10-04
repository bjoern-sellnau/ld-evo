'use client';

import type { ReactNode } from 'react';
import { SiteFooter } from './chrome/SiteFooter';
import { useSite } from './settings/SiteProvider';

/** Seiten-Container (Prototyp Zeile 364: pageMaxW / pageMargin / padX / pageBotPad / pageClip). */
export function SitePage({ children }: { children: ReactNode }) {
  const { mob, sideActive, railMode, isMobile, mobDesign } = useSite();
  return (
    <main
      id="inhalt"
      style={{
        boxSizing: 'border-box',
        // Wide 2: breitere Inhalte (1360) und nur so weit eingerückt, wie die Icon-Leiste braucht
        maxWidth: mob ? 430 : railMode ? 1360 : 1240,
        margin: railMode
          ? '0 auto 0 max(104px, calc((100vw - 1360px) / 2))'
          : sideActive
            ? '0 auto 0 max(266px, calc((100vw - 1304px) / 2))'
            : '0 auto',
        // App v2: Leiste + Knopfreihe darüber brauchen mehr Platz am Seitenende.
        padding: `0 ${mob ? 18 : 32}px ${mob ? (mobDesign === 'appv2' ? 150 : 96) : 0}px`,
        overflow: mob && !isMobile ? 'hidden' : 'visible',
        transition: 'max-width 0.4s ease',
      }}
    >
      {children}
      <SiteFooter />
    </main>
  );
}
