'use client';

import { useMemo, useState, type KeyboardEvent } from 'react';
import { mono } from '../cards/ProjectCard';
import { useContent } from '../content/ContentProvider';
import { articleHref, projectHref } from '../lib/routes';
import { useSite } from '../settings/SiteProvider';
import { ModalOverlay } from './GlassPanel';
import styles from './overlays.module.css';

/** Suchindex wie im Prototyp: Seiten, Projekte/Labs (ohne Archiv), Artikel — plus frei angelegte CMS-Seiten. */
function useIndex() {
  const { projects, articles, pages, navigation } = useContent();
  return useMemo(
    () => [
      ...navigation.filter((p) => p.href.startsWith('/')).map((p) => ({ label: p.label, kind: 'SEITE', href: p.href })),
      ...projects
        .filter((p) => p.kind !== 'archiv')
        .map((p) => ({
          label: p.name,
          kind: p.kind === 'labs' ? 'LAB' : 'PROJEKT',
          href: projectHref(p),
        })),
      ...articles.map((a) => ({ label: a.titel, kind: 'ARTIKEL', href: articleHref(a) })),
      ...pages
        .filter((p) => !navigation.some((n) => n.href === `/${p.id}`))
        .map((p) => ({ label: p.title, kind: 'SEITE', href: `/${p.id}` })),
    ],
    [projects, articles, pages, navigation],
  );
}

/** Suche (⌘K / Strg+K, Esc). Treffer: Teilstring, max. 8. Markup: Prototyp Zeile 1241 ff. */
export function SearchOverlay() {
  const { overlay, setOverlay, navigate } = useSite();
  const INDEX = useIndex();
  const [q, setQ] = useState('');
  const [sel, setSel] = useState(0);
  const results = useMemo(() => {
    const n = q.toLowerCase();
    return INDEX.filter((r) => !n || r.label.toLowerCase().includes(n)).slice(0, 8);
  }, [q, INDEX]);

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

  return (
    <ModalOverlay label="Suche" onClose={() => setOverlay(null)} align="top" width={520} radius="var(--radL,20px)">
      <div style={{ display: 'flex', alignItems: 'center', gap: 11, padding: '15px 18px', borderBottom: '1px solid var(--hair)' }}>
        <span aria-hidden style={{ color: 'var(--soft)', fontSize: 16 }}>
          ⌕
        </span>
        <input
          value={q}
          onChange={(e) => {
            setQ(e.target.value);
            setSel(0);
          }}
          onKeyDown={onKey}
          placeholder="Seiten, Projekte, Artikel …"
          aria-label="Suchbegriff"
          role="combobox"
          aria-expanded="true"
          aria-controls="ld-search-results"
          aria-activedescendant={results[sel] ? `ld-sr-${sel}` : undefined}
          style={{
            flex: 1,
            background: 'transparent',
            border: 'none',
            outline: 'none',
            fontFamily: 'var(--ld-font-sans),sans-serif',
            fontSize: 15,
            color: 'var(--ink)',
          }}
        />
        <Kbd>⌘K</Kbd>
        <Kbd>esc</Kbd>
      </div>
      <div id="ld-search-results" role="listbox" aria-label="Treffer" style={{ padding: 8, maxHeight: 340, overflow: 'auto' }}>
        {results.map((r, i) => (
          <button
            key={r.kind + r.href}
            id={`ld-sr-${i}`}
            type="button"
            role="option"
            aria-selected={i === sel}
            tabIndex={-1}
            onMouseEnter={() => setSel(i)}
            onClick={() => navigate(r.href)}
            className={styles.result}
          >
            <span style={{ fontSize: 13.5, fontWeight: 600 }}>{r.label}</span>
            <span
              style={{
                fontFamily: mono,
                fontSize: 9,
                letterSpacing: '0.1em',
                color: 'var(--soft)',
                border: '1px solid var(--border)',
                borderRadius: 999,
                padding: '3px 9px',
              }}
            >
              {r.kind}
            </span>
          </button>
        ))}
      </div>
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
