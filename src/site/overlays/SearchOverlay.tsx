'use client';

import { useEffect, useMemo, useRef, useState, type KeyboardEvent, type ReactNode } from 'react';
import { mono } from '../cards/ProjectCard';
import { useContent } from '../content/ContentProvider';
import { articleHref, projectHref } from '../lib/routes';
import { search, type SearchDoc } from '../lib/search';
import { useSite } from '../settings/SiteProvider';
import { ModalOverlay } from './GlassPanel';
import styles from './overlays.module.css';
import { useT } from '../i18n/LocaleProvider';
import { APPV2_BAR_BOTTOM, APPV2_BAR_HEIGHT } from '../nav/AppV2Bar';

/**
 * Suchindex wie im Prototyp (Seiten, Projekte/Labs ohne Archiv, Artikel, freie CMS-Seiten) — erweitert um den Volltext:
 * Kapitel/Stack der Projekte, Artikeltexte, „Über mich“ und die Reise-Stationen (src/site/lib/search.ts).
 */
function useIndex(): SearchDoc[] {
  const { projects, articles, pages, navigation, about, journey } = useContent();
  const t = useT();
  return useMemo(() => {
    const T = (text: string | undefined, w: number) => (text ? [{ text, w }] : []);
    const aboutText = [about.introTitle, about.intro, ...about.vita, about.loona].join(' ');
    const stations = (about.stations ?? []).flatMap((st) => [
      st.firma,
      st.rolle,
      st.desc,
      ...st.projekte.map((pr) => `${pr.name} ${pr.desc}`),
    ]);
    return [
      ...navigation
        .filter((p) => p.href.startsWith('/'))
        .map((p) => ({
          label: p.label,
          kind: t('search.kindPage'),
          href: p.href,
          fields: [
            ...T(p.label, 10),
            ...(p.href === '/ueber-mich' ? [...T(aboutText, 1), ...T(stations.join(' '), 1), ...T(about.tools.join(' '), 4)] : []),
          ],
        })),
      ...projects
        .filter((p) => p.kind !== 'archiv')
        .map((p) => ({
          label: p.name,
          kind: p.kind === 'labs' ? t('search.kindLab') : t('search.kindProject'),
          href: projectHref(p),
          fields: [
            ...T(p.name, 10),
            ...T([p.tag, p.kat, p.tool, ...p.stack].join(' '), 4),
            ...T(p.desc, 3),
            ...[p.ueberblick, p.ansatz, p.ergebnis, p.zitat, p.learnings].flatMap((x) => T(x, 1)),
          ],
        })),
      ...articles.map((a) => ({
        label: a.titel,
        kind: t('search.kindArticle'),
        href: articleHref(a),
        fields: [...T(a.titel, 10), ...T(a.kat, 4), ...T(a.teaser, 3), ...a.body.flatMap((x) => T(x, 1))],
      })),
      ...journey.map((j) => ({
        label: `${j.year} · ${j.title}`,
        kind: t('search.kindJourney'),
        href: '/reise',
        fields: [
          ...T(`${j.year} ${j.title}`, 10),
          ...T(`${j.role} ${j.partner}`, 4),
          ...T(j.blurb, 3),
          ...T(j.story, 1),
          ...T(j.steps.map((x) => x.t).join(' '), 1),
        ],
      })),
      ...pages
        .filter((p) => !navigation.some((n) => n.href === `/${p.id}`))
        .map((p) => ({ label: p.title, kind: t('search.kindPage'), href: `/${p.id}`, fields: T(p.title, 10) })),
    ];
  }, [projects, articles, pages, navigation, about, journey, t]);
}

/** Suche (⌘K / Strg+K, Esc). Treffer: Teilstring, max. 8. Markup: Prototyp Zeile 1241 ff. */
export function SearchOverlay() {
  const { overlay, setOverlay, navigate, mob, isMobile, mobDesign } = useSite();
  const t = useT();
  const INDEX = useIndex();
  const [q, setQ] = useState('');
  const [sel, setSel] = useState(0);
  // Leere Suche: die ersten 8 wie im Prototyp; mit Suchwort bis zu 10 Volltext-Treffer.
  const results = useMemo(() => search(INDEX, q, q.trim() ? 10 : 8), [q, INDEX]);

  if (overlay !== 'search') return null;

  const onKey = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setSel((i) => Math.min(i + 1, results.length - 1));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setSel((i) => Math.max(i - 1, 0));
    } else if (e.key === 'Enter' && results[sel]) {
      navigate(results[sel].href);
    }
  };

  const input = (
    <input
      value={q}
      onChange={(e) => {
        setQ(e.target.value);
        setSel(0);
      }}
      onKeyDown={onKey}
      placeholder={t('search.placeholder')}
      aria-label={t('search.term')}
      role="combobox"
      aria-expanded="true"
      aria-controls="ld-search-results"
      aria-activedescendant={results[sel] ? `ld-sr-${sel}` : undefined}
      style={{
        flex: 1,
        minWidth: 0,
        background: 'transparent',
        border: 'none',
        outline: 'none',
        fontFamily: 'var(--ld-font-sans),sans-serif',
        fontSize: 16,
        color: 'var(--ink)',
      }}
    />
  );
  const list = (maxHeight: number | string) => (
    <div id="ld-search-results" role="listbox" aria-label={t('search.results')} style={{ padding: 8, maxHeight, overflow: 'auto' }}>
      {results.map((r, i) => (
        <button
          key={`${r.kind}${r.href}${r.label}`}
          id={`ld-sr-${i}`}
          type="button"
          role="option"
          aria-selected={i === sel}
          tabIndex={-1}
          onMouseEnter={() => setSel(i)}
          onClick={() => navigate(r.href)}
          className={styles.result}
        >
          <span style={{ minWidth: 0 }}>
            <span style={{ display: 'block', fontSize: 13.5, fontWeight: 600 }}>{r.label}</span>
            {r.snippet && (
              <span style={{ display: 'block', fontSize: 12, lineHeight: 1.5, color: 'var(--muted)', marginTop: 2 }}>
                {r.snippet.before}
                <mark className={styles.hit}>{r.snippet.match}</mark>
                {r.snippet.after}
              </span>
            )}
          </span>
          <span
            style={{
              fontFamily: mono,
              fontSize: 9,
              letterSpacing: '0.1em',
              color: 'var(--soft)',
              border: '1px solid var(--border)',
              borderRadius: 999,
              padding: '3px 9px',
              flex: 'none',
            }}
          >
            {r.kind}
          </span>
        </button>
      ))}
    </div>
  );

  // Mobil-Designs 2 (nicht Prototyp): kompaktes Panel, das von unten über der Leiste hochfährt — Eingabe unten im
  // Daumenbereich, Treffer darüber. Feste Farbwerte (ld-sheet2), damit es auf jeder Cover-Farbe lesbar bleibt.
  if (mob && mobDesign !== 'proto') {
    const framed = !isMobile;
    const above =
      mobDesign === 'appv2' ? APPV2_BAR_BOTTOM + APPV2_BAR_HEIGHT + 12 : mobDesign === 'app' ? 82 : mobDesign === 'lab' ? 104 : 14;
    return (
      <MobileSearchPanel label={t('search.label')} onClose={() => setOverlay(null)} framed={framed} bottom={above}>
        {list('min(46vh, 380px)')}
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '12px 16px', borderTop: '1px solid var(--hair)' }}>
          <span aria-hidden style={{ color: 'var(--soft)', fontSize: 17 }}>
            ⌕
          </span>
          {input}
          <button
            type="button"
            onClick={() => setOverlay(null)}
            aria-label={t('menu.close')}
            style={{
              border: 0,
              background: 'var(--pill)',
              color: 'var(--ink)',
              width: 36,
              height: 36,
              borderRadius: 999,
              cursor: 'pointer',
              flex: 'none',
            }}
          >
            ✕
          </button>
        </div>
      </MobileSearchPanel>
    );
  }

  return (
    <ModalOverlay label={t('search.label')} onClose={() => setOverlay(null)} align="top" width={520} radius="var(--radL,20px)">
      <div style={{ display: 'flex', alignItems: 'center', gap: 11, padding: '15px 18px', borderBottom: '1px solid var(--hair)' }}>
        <span aria-hidden style={{ color: 'var(--soft)', fontSize: 16 }}>
          ⌕
        </span>
        {input}
        <Kbd>⌘K</Kbd>
        <Kbd>esc</Kbd>
      </div>
      {list(340)}
    </ModalOverlay>
  );
}

function Kbd({ children }: { children: string }) {
  return (
    <kbd
      style={{
        fontFamily: mono,
        fontSize: 9.5,
        color: 'var(--soft)',
        border: '1px solid var(--border)',
        borderRadius: 5,
        padding: '2px 7px',
      }}
    >
      {children}
    </kbd>
  );
}

/** Such-Panel für die Mobil-Designs 2: unten verankert, gleitet hoch; Klick daneben schließt, Fokus ins Feld. */
function MobileSearchPanel({
  label,
  onClose,
  framed,
  bottom,
  children,
}: {
  label: string;
  onClose: () => void;
  framed: boolean;
  bottom: number;
  children: ReactNode;
}) {
  const panel = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const prev = document.activeElement as HTMLElement | null;
    panel.current?.querySelector<HTMLElement>('input')?.focus({ preventScroll: true });
    return () => prev?.focus?.({ preventScroll: true });
  }, []);
  return (
    <>
      <div aria-hidden onClick={onClose} style={{ position: 'fixed', inset: 0, zIndex: 79, background: 'rgba(5,10,20,0.32)' }} />
      <div
        ref={panel}
        role="dialog"
        aria-modal="true"
        aria-label={label}
        className="ld-sheet2"
        style={{
          position: 'fixed',
          zIndex: 80,
          ...(framed
            ? { left: 'calc(50% - 203px)', width: 406, bottom: bottom + 10 }
            : { left: 12, right: 12, bottom: `calc(${bottom}px + env(safe-area-inset-bottom))` }),
          borderRadius: 24,
          overflow: 'hidden',
          background: 'linear-gradient(180deg,var(--glassg1),var(--glassg2)),color-mix(in srgb,var(--bg) 88%,transparent)',
          backdropFilter: 'blur(24px) saturate(1.8)',
          WebkitBackdropFilter: 'blur(24px) saturate(1.8)',
          border: '1px solid var(--glassbrd)',
          boxShadow: 'inset 0 1.5px 1px var(--glasshi),0 18px 50px -12px rgba(0,0,0,0.5)',
          animation: 'ldSearchUp 0.34s cubic-bezier(0.22,1,0.32,1)',
        }}
      >
        {children}
      </div>
    </>
  );
}
