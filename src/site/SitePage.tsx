'use client';

import type { CSSProperties, ReactNode } from 'react';
import { SiteFooter } from './chrome/SiteFooter';
import { useSite } from './settings/SiteProvider';

/** Seiten-Container (Prototyp Zeile 364: pageMaxW / pageMargin / padX / pageBotPad / pageClip). */
export function SitePage({ children }: { children: ReactNode }) {
  const { mob, sideActive, railMode, isMobile, mobDesign } = useSite();
  // Freie Fläche links/rechts neben dem Inhalt bis zum Bildschirm- bzw. Leistenrand (--bl/--br) und eine maßvolle
  // Verbreiterung (--wl/--wr, je höchstens 160 px, 24 px Abstand zum Rand) — für vollbreite/breite Abschnitte der
  // Story-Seiten auf Widescreens. Rein per CSS aus denselben Werten wie unten (kein Messen → kein Layout-Sprung).
  // Leisten: Seitenleiste belegt 250 px (18 + 224 + 8), Icon-Leiste 88 px (16 + 64 + 8).
  const bleed = mob
    ? { '--bl': '18px', '--br': '18px' }
    : railMode
      ? {
          '--bl': 'calc(max(104px, (100vw - 1360px) / 2) - 56px)',
          '--br': 'calc(max(0px, 100vw - max(104px, (100vw - 1360px) / 2) - 1360px) + 32px)',
        }
      : sideActive
        ? {
            '--bl': 'calc(max(266px, (100vw - 1304px) / 2) - 218px)',
            '--br': 'calc(max(0px, 100vw - max(266px, (100vw - 1304px) / 2) - 1240px) + 32px)',
          }
        : { '--bl': 'calc(max(0px, (100vw - 1240px) / 2) + 32px)', '--br': 'calc(max(0px, (100vw - 1240px) / 2) + 32px)' };
  return (
    <main
      id="inhalt"
      // Ziel der Sprunglinks und des Welcome-Übergangs: per Skript fokussierbar, nicht per Tab
      tabIndex={-1}
      style={
        {
          ...(bleed as CSSProperties),
          '--wl': 'max(0px, min(var(--bl) - 24px, 160px))',
          '--wr': 'max(0px, min(var(--br) - 24px, 160px))',
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
        } as CSSProperties
      }
    >
      {children}
      <SiteFooter />
    </main>
  );
}
