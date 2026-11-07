'use client';

import { useState, type CSSProperties, type ReactNode } from 'react';
import { EText } from '../cms/editing';
import { mono } from '../cards/ProjectCard';
import { useT } from '../i18n/LocaleProvider';
import { contrast, inkOn } from '../lib/color';
import styles from './blocks.module.css';

/**
 * Design- & Technik-Widgets der Detailseiten (neu, Wunsch 07.11.2026): Farbpalette, Code-Block, Tech-Stack, Changelog.
 * Code wird nie als HTML eingefügt: ein kleiner Tokenizer zerlegt ihn in Text-Spans (kein dangerouslySetInnerHTML).
 */

/** In die Zwischenablage; meldet Erfolg für die Rückmeldung am Knopf. */
async function copyText(text: string): Promise<boolean> {
  try {
    await navigator.clipboard.writeText(text);
    return true;
  } catch {
    return false;
  }
}

function CopyButton({ text, label, className, style }: { text: string; label: string; className: string; style?: CSSProperties }) {
  const t = useT();
  const [done, setDone] = useState(false);
  return (
    <button
      type="button"
      className={className}
      style={style}
      aria-label={label}
      onClick={async () => {
        if (await copyText(text)) {
          setDone(true);
          setTimeout(() => setDone(false), 1600);
        }
      }}
    >
      <span aria-live="polite">{done ? `✓ ${t('w.copied')}` : t('w.copy')}</span>
    </button>
  );
}

// ---------------------------------------------------------------------------------------------------------------
// Farbpalette
// ---------------------------------------------------------------------------------------------------------------

export interface Swatch {
  name?: string;
  hex?: string;
  note?: string;
}

const HEX = /^#[0-9a-fA-F]{6}$/;
/** WCAG-Stufe für Text: AAA ≥ 7, AA ≥ 4,5, „AA groß“ ≥ 3 (nur große Schrift). */
const grade = (r: number, large: string) => (r >= 7 ? 'AAA' : r >= 4.5 ? 'AA' : r >= 3 ? large : '—');

/** Farbfelder mit Name, Hex (kopierbar) und Kontrast auf Weiß/Schwarz samt WCAG-Stufe. */
export function Palette({ items, path }: { items: Swatch[]; path: string }) {
  const t = useT();
  return (
    <div className={styles.box}>
      <div className={styles.grid} style={{ '--min': '190px' } as CSSProperties}>
        {items.map((c, i) => {
          const hex = c.hex && HEX.test(c.hex) ? c.hex.toUpperCase() : '#888888';
          const ink = inkOn(hex);
          const w = contrast(hex, '#FFFFFF');
          const b = contrast(hex, '#000000');
          return (
            <div key={i} className={styles.swatch}>
              <div className={styles.swatchColor} style={{ background: hex, color: ink }}>
                <span aria-hidden>Aa</span>
                <CopyButton text={hex} label={t('w.copyHex', { hex })} className={styles.swatchCopy} />
              </div>
              <div style={{ padding: '12px 14px' }}>
                <div style={{ fontSize: 14.5, fontWeight: 700, color: 'var(--ink)' }}>
                  <EText path={`${path}.items.${i}.name`} value={c.name} />
                </div>
                <div style={{ fontFamily: mono, fontSize: 12, color: 'var(--muted)', marginTop: 2 }}>{hex}</div>
                {c.note && (
                  <div style={{ fontSize: 12.5, lineHeight: 1.5, color: 'var(--soft)', marginTop: 6 }}>
                    <EText path={`${path}.items.${i}.note`} value={c.note} />
                  </div>
                )}
                <dl style={{ display: 'flex', gap: 12, margin: '10px 0 0', fontFamily: mono, fontSize: 10.5, color: 'var(--muted)' }}>
                  {(
                    [
                      [t('w.onWhite'), w],
                      [t('w.onBlack'), b],
                    ] as const
                  ).map(([k, r]) => (
                    <div key={k}>
                      <dt style={{ color: 'var(--soft)' }}>
                        {t('w.contrast')} {k}
                      </dt>
                      <dd style={{ margin: '2px 0 0', color: 'var(--ink)', fontWeight: 700 }}>
                        {r.toFixed(1)}:1 · {grade(r, t('w.aaLarge'))}
                      </dd>
                    </div>
                  ))}
                </dl>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------------------------------------------
// Code-Block
// ---------------------------------------------------------------------------------------------------------------

type Tok = { k: string; s: string };
const KW_JS =
  /^(import|from|export|default|function|const|let|var|return|if|else|for|while|of|in|new|class|extends|async|await|type|interface|as|try|catch|throw|true|false|null|undefined|this)$/;

/** Zerlegt eine Zeile in Tokens — bewusst einfach (Kommentare, Strings, Zahlen, Schlüsselwörter, Tags, Eigenschaften). */
function tokenize(line: string, lang: string): Tok[] {
  const out: Tok[] = [];
  const push = (k: string, s: string) => s && out.push({ k, s });
  if (lang === 'bash') {
    const m = line.match(/^(\s*)(#.*)$/);
    if (m)
      return [
        { k: '', s: m[1] },
        { k: 'tkComment', s: m[2] },
      ];
    // erstes Wort = Befehl, dann Optionen, Variablen, Strings
    let first = true;
    for (const p of line.match(/("[^"]*"?|'[^']*'?|\$[\w{}]+|\s+|[^\s"'$]+)/g) ?? [line]) {
      const k = /^\s+$/.test(p)
        ? ''
        : /^["']/.test(p)
          ? 'tkString'
          : /^\$/.test(p)
            ? 'tkProp'
            : /^-/.test(p)
              ? 'tkTag'
              : first
                ? 'tkKeyword'
                : '';
      if (!/^\s+$/.test(p)) first = /^(&&|\|\||\||;)$/.test(p);
      push(k, p);
    }
    return out;
  }
  const re =
    lang === 'css'
      ? /(\/\*.*?\*\/|\/\*.*$|"[^"]*"?|'[^']*'?|#[0-9a-fA-F]{3,8}\b|-?\d*\.?\d+(?:px|rem|em|%|s|ms|deg|vh|vw)?\b|[\w-]+(?=\s*:)|[{}:;(),]|[\w-]+|\s+|.)/g
      : lang === 'json'
        ? /("(?:[^"\\]|\\.)*"(?=\s*:)|"(?:[^"\\]|\\.)*"?|-?\d+\.?\d*(?:e[+-]?\d+)?|true|false|null|[{}[\],:]|\s+|.)/g
        : /(\/\/.*$|\/\*.*?\*\/|<!--.*?-->|`[^`]*`?|"(?:[^"\\]|\\.)*"?|'(?:[^'\\]|\\.)*'?|<\/?[A-Za-z][\w.-]*|\/?>|\b\d+\.?\d*\b|[A-Za-z_$][\w$]*|[{}()[\];,.=+\-*/:?!&|<>]|\s+|.)/g;
  for (const p of line.match(re) ?? [line]) {
    let k = '';
    if (/^(\/\/|\/\*|<!--)/.test(p)) k = 'tkComment';
    else if (/^["'`]/.test(p))
      k =
        lang === 'json' &&
        /"\s*$/.test(p) &&
        line
          .slice(line.indexOf(p) + p.length)
          .trimStart()
          .startsWith(':')
          ? 'tkProp'
          : 'tkString';
    else if (/^-?\d/.test(p) || /^#[0-9a-fA-F]{3,8}$/.test(p)) k = 'tkNumber';
    else if (/^<\/?[A-Za-z]/.test(p) || p === '>' || p === '/>') k = 'tkTag';
    else if (lang === 'css' && /^[\w-]+$/.test(p) && /^\s*:/.test(line.slice(line.indexOf(p) + p.length))) k = 'tkProp';
    else if (lang === 'json' && /^(true|false|null)$/.test(p)) k = 'tkKeyword';
    else if (lang !== 'css' && lang !== 'json' && KW_JS.test(p)) k = 'tkKeyword';
    else if (/^[{}()[\];,.=+\-*/:?!&|<>]$/.test(p)) k = 'tkPunct';
    push(k, p);
  }
  return out;
}

const LANG_LABEL: Record<string, string> = {
  ts: 'TypeScript',
  tsx: 'TSX',
  js: 'JavaScript',
  css: 'CSS',
  html: 'HTML',
  json: 'JSON',
  bash: 'Shell',
  text: 'Text',
};

export function CodeBlock({
  code,
  lang,
  filename,
  caption,
  numbers,
  path,
}: {
  code?: string;
  lang: string;
  filename?: string;
  caption?: string;
  numbers: boolean;
  path: string;
}) {
  const t = useT();
  const lines = (code ?? '').replace(/\t/g, '  ').split('\n');
  const head: ReactNode = (
    <div className={styles.codeHead}>
      <span style={{ fontFamily: mono, color: '#e4e9f2' }}>
        {filename ? <EText path={`${path}.filename`} value={filename} /> : LANG_LABEL[lang]}
      </span>
      {filename && <span style={{ fontFamily: mono, fontSize: 11 }}>· {LANG_LABEL[lang] ?? lang}</span>}
      <CopyButton text={code ?? ''} label={t('w.copyCode')} className={styles.codeCopy} />
    </div>
  );
  return (
    <figure className={styles.box} style={{ margin: 0 }}>
      <div className={styles.code}>
        {head}
        {/* scrollbar per Tastatur erreichbar (tabIndex), damit lange Zeilen lesbar bleiben */}
        <pre className={styles.codePre} tabIndex={0} aria-label={filename || LANG_LABEL[lang] || 'Code'} style={{ fontFamily: mono }}>
          <code>
            {lines.map((ln, i) => (
              <span key={i} className={styles.codeLine} data-n={numbers ? i + 1 : undefined}>
                {lang === 'text'
                  ? ln
                  : tokenize(ln, lang).map((tk, j) =>
                      tk.k ? (
                        <span key={j} className={styles[tk.k]}>
                          {tk.s}
                        </span>
                      ) : (
                        tk.s
                      ),
                    )}
                {ln === '' ? '​' : null}
              </span>
            ))}
          </code>
        </pre>
      </div>
      {caption && (
        <figcaption className={styles.caption}>
          <EText path={`${path}.caption`} value={caption} />
        </figcaption>
      )}
    </figure>
  );
}

// ---------------------------------------------------------------------------------------------------------------
// Tech-Stack
// ---------------------------------------------------------------------------------------------------------------

export interface StackGroup {
  category?: string;
  items?: string[];
  note?: string;
}

/** Technologien nach Bereichen (Frontend, Backend, Infrastruktur …) als Karten mit Chips. */
export function TechStack({ items, path, accent }: { items: StackGroup[]; path: string; accent: string }) {
  return (
    <div className={styles.box}>
      <div className={styles.grid} style={{ '--min': '240px' } as CSSProperties}>
        {items.map((g, i) => (
          <section key={i} className={styles.card}>
            <h3
              style={{
                margin: 0,
                fontFamily: mono,
                fontSize: 11,
                fontWeight: 400,
                letterSpacing: '0.16em',
                textTransform: 'uppercase',
                color: accent,
              }}
            >
              <EText path={`${path}.items.${i}.category`} value={g.category} />
            </h3>
            <ul style={{ display: 'flex', flexWrap: 'wrap', gap: 6, margin: '12px 0 0', padding: 0, listStyle: 'none' }}>
              {(g.items ?? []).map((c, j) => (
                <li
                  key={j}
                  style={{
                    padding: '6px 11px',
                    borderRadius: 999,
                    border: '1px solid var(--border)',
                    background: 'var(--bg)',
                    fontSize: 13,
                    fontWeight: 600,
                    color: 'var(--ink)',
                  }}
                >
                  {c}
                </li>
              ))}
            </ul>
            {g.note && (
              <p style={{ margin: '12px 0 0', fontSize: 13, lineHeight: 1.55, color: 'var(--muted)' }}>
                <EText path={`${path}.items.${i}.note`} value={g.note} multiline />
              </p>
            )}
          </section>
        ))}
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------------------------------------------
// Changelog
// ---------------------------------------------------------------------------------------------------------------

export interface Release {
  version?: string;
  date?: string;
  title?: string;
  kind?: string;
  items?: string[];
}

const REL = { release: 'w.release.release', beta: 'w.release.beta', fix: 'w.release.fix' } as const;

/** Versionen als Zeitleiste (geordnete Liste): Version + Art als Etikett, Datum, Titel, Änderungen. */
export function Changelog({ items, path, accent }: { items: Release[]; path: string; accent: string }) {
  const t = useT();
  return (
    <ol className={styles.box} style={{ listStyle: 'none', margin: 0, padding: 0, display: 'grid', gap: 12 }}>
      {items.map((r, i) => {
        const kind = r.kind === 'beta' || r.kind === 'fix' ? r.kind : 'release';
        return (
          <li key={i} className={styles.card} style={{ display: 'grid', gridTemplateColumns: 'minmax(0, 1fr)', gap: 8 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap' }}>
              <span
                style={{
                  fontFamily: mono,
                  fontSize: 13,
                  fontWeight: 700,
                  padding: '3px 9px',
                  borderRadius: 8,
                  // Kontur + Tönung statt Vollfläche: Akzent kann hell (Cover-Farbe-Vollmodus) oder dunkel sein — Text
                  // bleibt in der Textfarbe und damit lesbar
                  border: `1px solid ${accent}`,
                  background: `color-mix(in srgb, ${accent} 14%, transparent)`,
                  color: 'var(--ink)',
                }}
              >
                <span className={styles.visuallyHidden}>{t('w.version')} </span>
                <EText path={`${path}.items.${i}.version`} value={r.version} />
              </span>
              <span style={{ fontFamily: mono, fontSize: 10.5, letterSpacing: '0.12em', color: 'var(--soft)', textTransform: 'uppercase' }}>
                {t(REL[kind])}
              </span>
              {r.date && (
                <span style={{ fontFamily: mono, fontSize: 11.5, color: 'var(--muted)', marginLeft: 'auto' }}>
                  <EText path={`${path}.items.${i}.date`} value={r.date} />
                </span>
              )}
            </div>
            {r.title && (
              <h3 style={{ margin: 0, fontSize: 17, fontWeight: 700, color: 'var(--ink)' }}>
                <EText path={`${path}.items.${i}.title`} value={r.title} />
              </h3>
            )}
            {(r.items?.length ?? 0) > 0 && (
              <ul style={{ margin: 0, paddingLeft: 18, color: 'var(--muted)', fontSize: 14, lineHeight: 1.65 }}>
                {r.items!.map((c, j) => (
                  <li key={j}>{c}</li>
                ))}
              </ul>
            )}
          </li>
        );
      })}
    </ol>
  );
}
