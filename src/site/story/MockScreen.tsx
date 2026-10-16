'use client';

import type { CSSProperties, ReactNode } from 'react';
import { inkOn, readableAlpha } from '../lib/color';
import { mono } from '../cards/ProjectCard';
import { mediaSrcSet } from '@/cms/media';
import { isSafeMediaSrc } from '@/cms/safe';
import type { MediaRef } from '@/cms/schema';
import { SCREEN_OPTIONS } from './options';

/**
 * Nachgebaute App-Screens für Story-Seiten (neu, nicht im Prototyp): zeigen Funktionen, ohne dass es Screenshots
 * braucht. Inhalt kommt aus Textzeilen „Beschriftung | Wert | Zusatz“ (Feld „Zeilen“ im Widget). Eigene Farben
 * werden über inkOn() kontrastsicher beschriftet; der Screen selbst ist immer hell (wie eine App im Light Mode).
 */

export type ScreenKind = (typeof SCREEN_OPTIONS)[number][0];

export interface Row {
  label: string;
  value: string;
  extra: string;
}

/** „Miete | -950 € | ✓“ → { label, value, extra } (leere Zeilen fallen weg). */
export function parseRows(lines: string[] | undefined): Row[] {
  return (lines ?? [])
    .map((l) => l.split('|').map((x) => x.trim()))
    .filter((p) => p[0])
    .map(([label, value = '', extra = '']) => ({ label, value, extra }));
}

/**
 * Zahl aus einem Anzeige-Wert, deutsch oder englisch geschrieben: „-1.250,50 €“ → -1250.5, „€2,481.20“ → 2481.2,
 * „12.500“ → 12500, „2.4“ → 2.4. Das zuletzt stehende Trennzeichen ist das Dezimalzeichen, außer es folgen genau drei
 * Ziffern ohne weiteres Trennzeichen (Tausender). Ohne Ziffern: NaN.
 */
export function parseDisplayNumber(v: string): { value: number; decimals: number; grouped: boolean; de: boolean } {
  const s = v.replace(/[^\d,.-]/g, '');
  const dot = s.lastIndexOf('.');
  const comma = s.lastIndexOf(',');
  const last = Math.max(dot, comma);
  const both = dot >= 0 && comma >= 0;
  const thousandsOnly = !both && last >= 0 && /^[.,]\d{3}$/.test(s.slice(last)) && s.split(s[last]).length >= 2;
  const decSep = last < 0 || thousandsOnly ? '' : s[last];
  const de = decSep === ',' || (thousandsOnly && s[last] === '.');
  const intPart = (decSep ? s.slice(0, last) : s).replace(/[.,]/g, '');
  const frac = decSep ? s.slice(last + 1) : '';
  const value = parseFloat(`${intPart}${frac ? `.${frac}` : ''}`);
  return { value, decimals: frac.length, grouped: both || thousandsOnly, de };
}

export const numberOf = (v: string) => parseDisplayNumber(v).value;

const INK = '#141821';
const SOFT = '#59606e';
const LINE = '#e3e6ee';

export function MockScreen({
  kind,
  title,
  rows,
  accent,
  image,
}: {
  kind: string;
  title?: string;
  rows: Row[];
  accent: string;
  image?: MediaRef;
}) {
  if (image?.src && isSafeMediaSrc(image.src))
    return (
      <img
        src={image.src}
        srcSet={mediaSrcSet(image.src)}
        sizes="320px"
        alt={image.alt}
        loading="lazy"
        style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }}
      />
    );
  const on = inkOn(accent);
  const head = (
    <div style={{ padding: '46px 18px 10px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
      <span style={{ fontSize: 17, fontWeight: 800, letterSpacing: '-0.02em', color: INK }}>{title || label(kind)}</span>
      <span
        aria-hidden
        style={{
          width: 28,
          height: 28,
          borderRadius: 9,
          background: accent,
          color: on,
          display: 'grid',
          placeItems: 'center',
          fontSize: 13,
        }}
      >
        +
      </span>
    </div>
  );
  return (
    <div
      style={{
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        fontSize: 12,
        color: INK,
        fontFamily: 'var(--ld-font-sans),sans-serif',
      }}
    >
      {head}
      <div style={{ flex: 1, overflow: 'hidden', padding: '0 14px 14px', display: 'flex', flexDirection: 'column', gap: 8 }}>
        {body(kind, rows, accent, on)}
      </div>
      <TabBar accent={accent} />
    </div>
  );
}

function label(kind: string) {
  return SCREEN_OPTIONS.find(([k]) => k === kind)?.[1] ?? 'App';
}

const card: CSSProperties = { background: '#fff', borderRadius: 14, border: `1px solid ${LINE}`, padding: '10px 12px' };

function body(kind: string, rows: Row[], accent: string, on: string): ReactNode {
  switch (kind) {
    case 'finanzen': {
      const [top, ...rest] = rows;
      const vals = rest.map((r) => Math.abs(numberOf(r.value))).filter((n) => !Number.isNaN(n));
      const max = Math.max(1, ...vals);
      return (
        <>
          <div style={{ ...card, background: accent, color: on, border: 0, padding: '14px 14px 12px' }}>
            <div style={{ fontSize: 10.5, fontWeight: 600, opacity: readableAlpha(accent, on, 0.85) }}>{top?.label ?? 'Kontostand'}</div>
            <div style={{ fontSize: 24, fontWeight: 800, letterSpacing: '-0.03em', marginTop: 2 }}>{top?.value ?? '—'}</div>
            <div style={{ display: 'flex', alignItems: 'flex-end', gap: 5, height: 46, marginTop: 10 }}>
              {(vals.length ? vals : [4, 7, 5, 9, 6, 8, 3]).slice(0, 9).map((v, i) => (
                <span
                  key={i}
                  style={{
                    flex: 1,
                    height: `${Math.max(12, (v / max) * 100)}%`,
                    borderRadius: 4,
                    background: on,
                    opacity: 0.35 + (i % 3) * 0.2,
                  }}
                />
              ))}
            </div>
          </div>
          {rest.slice(0, 5).map((r, i) => {
            const n = numberOf(r.value);
            return (
              <div key={i} style={{ ...card, display: 'flex', alignItems: 'center', gap: 10 }}>
                <Dot c={accent} t={r.extra || r.label[0]} />
                <span style={{ flex: 1, fontWeight: 600 }}>{r.label}</span>
                <span style={{ fontWeight: 700, color: n < 0 ? '#b42318' : '#067647' }}>{r.value}</span>
              </div>
            );
          })}
        </>
      );
    }
    case 'haushalt':
      return rows.slice(0, 6).map((r, i) => {
        const pct = Math.max(0, Math.min(100, numberOf(r.extra || r.value) || 0));
        return (
          <div key={i} style={card}>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontWeight: 600 }}>
              <span>{r.label}</span>
              <span style={{ color: SOFT }}>{r.value}</span>
            </div>
            <div style={{ height: 7, borderRadius: 4, background: LINE, marginTop: 7, overflow: 'hidden' }}>
              <div style={{ width: `${pct}%`, height: '100%', borderRadius: 4, background: pct > 90 ? '#d92d20' : accent }} />
            </div>
          </div>
        );
      });
    case 'liste':
      return rows.slice(0, 8).map((r, i) => {
        // Häkchen nur aus der Zusatz-Spalte (bzw. ein einzelnes ✓ als Wert) — eine Menge wie „1“ ist kein Häkchen
        const done = /^(✓|x|ja|done)$/i.test(r.extra) || r.value === '✓';
        return (
          <div key={i} style={{ ...card, display: 'flex', alignItems: 'center', gap: 10, padding: '9px 12px' }}>
            <span
              aria-hidden
              style={{
                width: 18,
                height: 18,
                borderRadius: 6,
                border: `2px solid ${done ? accent : '#aab1bf'}`,
                background: done ? accent : 'transparent',
                color: on,
                fontSize: 11,
                display: 'grid',
                placeItems: 'center',
              }}
            >
              {done ? '✓' : ''}
            </span>
            <span style={{ flex: 1, fontWeight: 600, textDecoration: done ? 'line-through' : 'none', color: done ? SOFT : INK }}>
              {r.label}
            </span>
            {r.value && !/^(✓|x)$/i.test(r.value) && <span style={{ color: SOFT }}>{r.value}</span>}
          </div>
        );
      });
    case 'bestellungen':
      return rows.slice(0, 4).map((r, i) => {
        const stage = Math.max(0, Math.min(3, Number.isNaN(numberOf(r.extra)) ? i % 4 : numberOf(r.extra)));
        return (
          <div key={i} style={card}>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontWeight: 700 }}>
              <span>{r.label}</span>
              <span style={{ color: SOFT, fontWeight: 600 }}>{r.value}</span>
            </div>
            <div style={{ display: 'flex', gap: 4, marginTop: 8 }}>
              {[0, 1, 2, 3].map((k) => (
                <span key={k} style={{ flex: 1, height: 5, borderRadius: 3, background: k <= stage ? accent : LINE }} />
              ))}
            </div>
            <div style={{ fontFamily: mono, fontSize: 9, color: SOFT, marginTop: 6, letterSpacing: '0.06em' }}>
              {['BESTELLT', 'VERSENDET', 'UNTERWEGS', 'ZUGESTELLT'][stage]}
            </div>
          </div>
        );
      });
    case 'feed':
      return rows.slice(0, 4).map((r, i) => (
        <div key={i} style={{ ...card, display: 'flex', gap: 10 }}>
          <span
            aria-hidden
            style={{ width: 46, height: 46, flex: 'none', borderRadius: 10, background: `linear-gradient(135deg, ${accent}, #c7cbd6)` }}
          />
          <span style={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
            <span style={{ fontWeight: 700, lineHeight: 1.25 }}>{r.label}</span>
            <span style={{ fontSize: 10, color: SOFT }}>
              {r.value}
              {r.extra && ` · ${r.extra}`}
            </span>
          </span>
        </div>
      ));
    case 'sammlung':
      return (
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
          {rows.slice(0, 6).map((r, i) => (
            <div key={i} style={{ ...card, padding: 8 }}>
              <div
                aria-hidden
                style={{
                  aspectRatio: '1',
                  borderRadius: 10,
                  background: i % 2 ? '#e9ecf4' : `color-mix(in srgb, ${accent} 22%, #fff)`,
                  display: 'grid',
                  placeItems: 'center',
                  fontSize: 26,
                }}
              >
                {r.extra || r.label[0]}
              </div>
              <div style={{ fontWeight: 700, marginTop: 6, fontSize: 11 }}>{r.label}</div>
              <div style={{ fontSize: 10, color: SOFT }}>{r.value}</div>
            </div>
          ))}
        </div>
      );
    case 'lesezeichen':
      return rows.slice(0, 6).map((r, i) => (
        <div key={i} style={{ ...card, display: 'flex', alignItems: 'center', gap: 10 }}>
          <Dot c={['#2563eb', '#16a34a', '#9333ea', '#ea580c', '#0891b2', '#db2777'][i % 6]} t={r.extra || r.label[0]} />
          <span style={{ display: 'flex', flexDirection: 'column', flex: 1, minWidth: 0 }}>
            <span style={{ fontWeight: 700, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{r.label}</span>
            <span style={{ fontSize: 10, color: SOFT }}>{r.value}</span>
          </span>
          <span aria-hidden style={{ color: accent === '#ffffff' ? INK : SOFT }}>
            ›
          </span>
        </div>
      ));
    default:
      return (
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
          {rows.slice(0, 6).map((r, i) => (
            <div
              key={i}
              style={{ ...card, background: i === 0 ? accent : '#fff', color: i === 0 ? on : INK, border: i === 0 ? 0 : card.border }}
            >
              <div style={{ fontSize: 18 }} aria-hidden>
                {r.extra || '•'}
              </div>
              <div style={{ fontWeight: 800, fontSize: 16, marginTop: 4 }}>{r.value}</div>
              <div style={{ fontSize: 10, opacity: i === 0 ? readableAlpha(accent, on, 0.8) : 0.8 }}>{r.label}</div>
            </div>
          ))}
        </div>
      );
  }
}

function Dot({ c, t }: { c: string; t: string }) {
  return (
    <span
      aria-hidden
      style={{
        width: 28,
        height: 28,
        flex: 'none',
        borderRadius: 9,
        background: c,
        color: inkOn(c),
        display: 'grid',
        placeItems: 'center',
        fontSize: 12,
        fontWeight: 800,
      }}
    >
      {t}
    </span>
  );
}

function TabBar({ accent }: { accent: string }) {
  return (
    <div
      aria-hidden
      style={{ display: 'flex', justifyContent: 'space-around', padding: '9px 0 16px', borderTop: `1px solid ${LINE}`, background: '#fff' }}
    >
      {['◎', '▤', '✓', '☆'].map((g, i) => (
        <span
          key={g}
          style={{
            fontSize: 15,
            color: i === 0 ? INK : '#6b7280',
            borderBottom: `2px solid ${i === 0 ? accent : 'transparent'}`,
            paddingBottom: 2,
          }}
        >
          {g}
        </span>
      ))}
    </div>
  );
}
