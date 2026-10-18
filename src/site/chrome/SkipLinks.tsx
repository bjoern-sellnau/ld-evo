'use client';

import type { MouseEvent } from 'react';
import { usePathname } from 'next/navigation';
import { canonicalPath } from '../i18n/locale';
import { useT } from '../i18n/LocaleProvider';
import { useSite } from '../settings/SiteProvider';

/**
 * Sprunglinks (WCAG 2.4.1 „Blöcke umgehen“, neu, nicht im Prototyp): unsichtbar, bis sie per Tab den Fokus
 * bekommen — dann oben links eine Glas-Pille. Erste Station im Dokument, damit der erste Tab hier landet.
 * Ziele: Hauptinhalt (#inhalt), sichtbare Hauptnavigation, Suche, Einstellungen (dort die Barrierefreiheits-
 * Schalter), Fußzeile (#fuss).
 */
export function SkipLinks() {
  const t = useT();
  const { setOverlay } = useSite();
  // Die Reise hat keine Fußzeile (SiteFooter)
  const hasFooter = canonicalPath(usePathname()) !== '/reise';

  // Ziel fokussieren statt nur zu scrollen: Screenreader und der nächste Tab starten dort.
  const jump = (sel: string) => (e: MouseEvent<HTMLAnchorElement>) => {
    const el = document.querySelector<HTMLElement>(sel);
    if (!el) return;
    e.preventDefault();
    if (!el.hasAttribute('tabindex')) el.setAttribute('tabindex', '-1');
    el.focus({ preventScroll: true });
    el.scrollIntoView({ block: 'start', behavior: document.body.classList.contains('still') ? 'auto' : 'smooth' });
  };
  // Mehrere Navigationen je Modus (Leiste, Icon-Leiste, Mobil) — die erste sichtbare mit Bedienelement nehmen.
  const toNav = (e: MouseEvent<HTMLAnchorElement>) => {
    e.preventDefault();
    for (const nav of document.querySelectorAll<HTMLElement>('nav:not(.ldskip)')) {
      if (!nav.getClientRects().length) continue;
      const first = nav.querySelector<HTMLElement>('a[href], button:not([disabled])');
      if (first && first.getClientRects().length) {
        first.focus();
        return;
      }
    }
  };

  return (
    <nav aria-label={t('skip.label')} className="ldskip">
      <a href="#inhalt" onClick={jump('#inhalt')}>
        {t('skip.main')}
      </a>
      <a href="#hauptnavigation" onClick={toNav}>
        {t('skip.nav')}
      </a>
      <button type="button" onClick={() => setOverlay('search')}>
        {t('skip.search')}
      </button>
      <button type="button" onClick={() => setOverlay('settings')}>
        {t('skip.settings')}
      </button>
      {hasFooter && (
        <a href="#fuss" onClick={jump('#fuss')}>
          {t('skip.footer')}
        </a>
      )}
    </nav>
  );
}
