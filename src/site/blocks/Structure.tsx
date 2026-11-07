'use client';

import type { CSSProperties } from 'react';
import type { MediaRef } from '@/cms/schema';
import { mediaSrcSet, withBase } from '@/cms/media';
import { isSafeHref } from '@/cms/safe';
import { LoonaMark } from '@/components/brand';
import { EText } from '../cms/editing';
import { mono } from '../cards/ProjectCard';
import { useT } from '../i18n/LocaleProvider';
import { LocalLink } from '../i18n/LocalLink';
import { mediaUrl } from './Media';
import styles from './blocks.module.css';

/**
 * Struktur-Widgets der Detailseiten (neu, Wunsch 07.11.2026): Hinweis-Box, Link-/Download-Karten, Team, Trenner.
 * Links nur über isSafeHref; externe Links öffnen in neuem Tab und sagen das auch (für Screenreader).
 */

// ---------------------------------------------------------------------------------------------------------------
// Hinweis
// ---------------------------------------------------------------------------------------------------------------

/** Farbe der Kennung (Rand + Symbol) — Text bleibt in Textfarben; die Art steht immer auch als Wort da. */
const NOTE: Record<string, { icon: string; color: string; key: 'w.note.info' | 'w.note.tipp' | 'w.note.warnung' | 'w.note.erfolg' }> = {
  info: { icon: 'i', color: '#3B82F6', key: 'w.note.info' },
  tipp: { icon: '✦', color: 'var(--accent)', key: 'w.note.tipp' },
  warnung: { icon: '!', color: '#F59E0B', key: 'w.note.warnung' },
  erfolg: { icon: '✓', color: '#22A06B', key: 'w.note.erfolg' },
};

export function Callout({ kind, title, text, path }: { kind: string; title?: string; text?: string; path: string }) {
  const t = useT();
  const k = NOTE[kind] ?? NOTE.info;
  return (
    <aside
      className={styles.box}
      style={{
        display: 'grid',
        gridTemplateColumns: 'auto minmax(0, 1fr)',
        gap: 14,
        padding: '16px 18px',
        borderRadius: 16,
        border: '1px solid var(--border)',
        borderLeft: `4px solid ${k.color}`,
        background: `color-mix(in srgb, ${k.color} 8%, var(--bg))`,
      }}
    >
      <span
        aria-hidden
        style={{
          width: 28,
          height: 28,
          borderRadius: '50%',
          display: 'grid',
          placeItems: 'center',
          fontWeight: 800,
          fontSize: 14,
          background: k.color,
          color: '#141210',
        }}
      >
        {k.icon}
      </span>
      <div>
        {/* --muted statt --soft: auf der getönten Fläche reicht --soft nicht für 4,5:1 */}
        <div style={{ fontFamily: mono, fontSize: 10.5, letterSpacing: '0.14em', textTransform: 'uppercase', color: 'var(--muted)' }}>
          {t(k.key)}
        </div>
        {title && (
          <div style={{ marginTop: 4, fontSize: 16, fontWeight: 700, color: 'var(--ink)' }}>
            <EText path={`${path}.title`} value={title} />
          </div>
        )}
        <p style={{ margin: '6px 0 0', fontSize: 14.5, lineHeight: 1.65, color: 'var(--muted)', whiteSpace: 'pre-line' }}>
          <EText path={`${path}.text`} value={text} multiline />
        </p>
      </div>
    </aside>
  );
}

// ---------------------------------------------------------------------------------------------------------------
// Link- und Download-Karten
// ---------------------------------------------------------------------------------------------------------------

export interface LinkCardItem {
  title?: string;
  desc?: string;
  href?: string;
  kind?: string;
}

const LINK: Record<string, { icon: string; key: 'w.link.link' | 'w.link.download' | 'w.link.demo' | 'w.link.code' | 'w.link.doku' }> = {
  link: { icon: '↗', key: 'w.link.link' },
  download: { icon: '↓', key: 'w.link.download' },
  demo: { icon: '▶', key: 'w.link.demo' },
  code: { icon: '</>', key: 'w.link.code' },
  doku: { icon: '§', key: 'w.link.doku' },
};

export function LinkCards({ items, path, accent }: { items: LinkCardItem[]; path: string; accent: string }) {
  const t = useT();
  return (
    <ul className={`${styles.box} ${styles.grid}`} style={{ '--min': '240px', listStyle: 'none', margin: 0, padding: 0 } as CSSProperties}>
      {items.map((l, i) => {
        const k = LINK[l.kind ?? ''] ?? LINK.link;
        const href = l.href && isSafeHref(l.href) ? l.href : null;
        const external = !!href && /^https?:/.test(href);
        // Dateien (Medien aus LD Flow, PDFs …) sind keine Seiten: normales <a> statt next/link (kein Prefetch/Routing)
        const file = !!href && !external && (href.startsWith('/media/') || /\.[a-z0-9]{2,5}$/i.test(href.split(/[?#]/)[0]));
        const inner = (
          <>
            <span style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 10 }}>
              <span style={{ fontFamily: mono, fontSize: 10.5, letterSpacing: '0.14em', textTransform: 'uppercase', color: 'var(--soft)' }}>
                {t(k.key)}
              </span>
              <span aria-hidden style={{ fontFamily: mono, fontSize: 15, fontWeight: 700, color: accent }}>
                {k.icon}
              </span>
            </span>
            <span style={{ fontSize: 16.5, fontWeight: 700, letterSpacing: '-0.01em', color: 'var(--ink)' }}>
              <EText path={`${path}.items.${i}.title`} value={l.title} />
            </span>
            {l.desc && (
              <span style={{ fontSize: 13.5, lineHeight: 1.55, color: 'var(--muted)' }}>
                <EText path={`${path}.items.${i}.desc`} value={l.desc} />
              </span>
            )}
            {external && <span className={styles.visuallyHidden}>{t('w.newTab')}</span>}
          </>
        );
        return (
          <li key={i} style={{ display: 'flex' }}>
            {!href ? (
              <div className={`${styles.card} ${styles.linkCard}`} style={{ flex: 1 }}>
                {inner}
              </div>
            ) : external ? (
              <a
                href={href}
                target="_blank"
                rel="noopener noreferrer"
                download={l.kind === 'download' || undefined}
                className={`${styles.card} ${styles.linkCard}`}
                style={{ flex: 1 }}
              >
                {inner}
              </a>
            ) : file ? (
              <a
                href={withBase(href)}
                download={l.kind === 'download' || undefined}
                className={`${styles.card} ${styles.linkCard}`}
                style={{ flex: 1 }}
              >
                {inner}
              </a>
            ) : (
              <LocalLink href={href} className={`${styles.card} ${styles.linkCard}`} style={{ flex: 1 }}>
                {inner}
              </LocalLink>
            )}
          </li>
        );
      })}
    </ul>
  );
}

// ---------------------------------------------------------------------------------------------------------------
// Team / Rollen
// ---------------------------------------------------------------------------------------------------------------

export interface Person {
  name?: string;
  role?: string;
  photo?: MediaRef;
  text?: string;
  href?: string;
}

const initials = (n?: string) =>
  (n ?? '?')
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((w) => w[0]?.toUpperCase())
    .join('');

export function Team({ items, path, accent }: { items: Person[]; path: string; accent: string }) {
  const t = useT();
  return (
    <ul className={`${styles.box} ${styles.grid}`} style={{ '--min': '220px', listStyle: 'none', margin: 0, padding: 0 } as CSSProperties}>
      {items.map((p, i) => {
        const src = mediaUrl(p.photo);
        const href = p.href && isSafeHref(p.href) ? p.href : null;
        return (
          <li key={i} className={styles.card} style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {src && p.photo ? (
              <img
                src={src}
                srcSet={mediaSrcSet(p.photo.src)}
                sizes="64px"
                alt={p.photo.alt ?? ''}
                width={64}
                height={64}
                loading="lazy"
                style={{ borderRadius: '50%', objectFit: 'cover', border: '1px solid var(--border)' }}
              />
            ) : (
              <span
                aria-hidden
                style={{
                  width: 64,
                  height: 64,
                  borderRadius: '50%',
                  display: 'grid',
                  placeItems: 'center',
                  fontWeight: 800,
                  fontSize: 20,
                  // Tönung + Kontur statt Vollfläche (Akzent kann hell oder dunkel sein; Text bleibt Textfarbe)
                  border: `1px solid ${accent}`,
                  background: `color-mix(in srgb, ${accent} 16%, transparent)`,
                  color: 'var(--ink)',
                }}
              >
                {initials(p.name)}
              </span>
            )}
            <div>
              <div style={{ fontSize: 16, fontWeight: 700, color: 'var(--ink)' }}>
                <EText path={`${path}.items.${i}.name`} value={p.name} />
              </div>
              <div style={{ fontFamily: mono, fontSize: 10.5, letterSpacing: '0.08em', color: 'var(--soft)', marginTop: 3 }}>
                <EText path={`${path}.items.${i}.role`} value={p.role} />
              </div>
            </div>
            {p.text && (
              <p style={{ margin: 0, fontSize: 13.5, lineHeight: 1.6, color: 'var(--muted)' }}>
                <EText path={`${path}.items.${i}.text`} value={p.text} multiline />
              </p>
            )}
            {href &&
              (/^https?:/.test(href) ? (
                <a
                  href={href}
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{ fontSize: 13, fontWeight: 600, color: 'var(--ink)', marginTop: 'auto' }}
                >
                  {p.name} ↗<span className={styles.visuallyHidden}> {t('w.newTab')}</span>
                </a>
              ) : (
                <LocalLink href={href} style={{ fontSize: 13, fontWeight: 600, color: 'var(--ink)', marginTop: 'auto' }}>
                  {p.name} →
                </LocalLink>
              ))}
          </li>
        );
      })}
    </ul>
  );
}

// ---------------------------------------------------------------------------------------------------------------
// Trenner / Abstand
// ---------------------------------------------------------------------------------------------------------------

const SPACE: Record<string, number> = { s: 12, m: 32, l: 72 };

/** Rein dekorativ (aria-hidden): Linie, Punkte, Slash-Band, das Zeichen oder nur Abstand. */
export function Divider({ look, size, accent }: { look: string; size: string; accent: string }) {
  const pad = SPACE[size] ?? SPACE.m;
  let mark = null;
  if (look === 'linie') mark = <span style={{ display: 'block', height: 1, background: 'var(--hair)' }} />;
  else if (look === 'punkte')
    mark = (
      <span style={{ display: 'flex', justifyContent: 'center', gap: 10 }}>
        {[0, 1, 2].map((i) => (
          <span key={i} style={{ width: 6, height: 6, borderRadius: '50%', background: 'var(--soft)' }} />
        ))}
      </span>
    );
  else if (look === 'slash')
    mark = (
      <span
        style={{
          display: 'block',
          height: 10,
          backgroundImage: `repeating-linear-gradient(60deg, ${accent} 0 3px, transparent 3px 14px)`,
          opacity: 0.6,
          maskImage: 'linear-gradient(90deg, transparent, #000 20%, #000 80%, transparent)',
        }}
      />
    );
  else if (look === 'zeichen')
    mark = (
      <span style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
        <span style={{ flex: 1, height: 1, background: 'var(--hair)' }} />
        <LoonaMark size={18} decorative />
        <span style={{ flex: 1, height: 1, background: 'var(--hair)' }} />
      </span>
    );
  return (
    <div aria-hidden style={{ padding: `${pad}px 0` }}>
      {mark}
    </div>
  );
}
