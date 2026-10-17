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
  // Vollflächige Screens ohne App-Kopf und Tab-Leiste
  if (kind === 'notch') return <NotchScreen rows={rows} accent={accent} title={title} />;
  if (kind === 'spiel') return <GameScreen rows={rows} accent={accent} title={title} />;
  if (kind === 'editor') return <EditorScreen rows={rows} accent={accent} title={title} />;
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
    case 'limits':
      return (
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
          {rows.slice(0, 6).map((r, i) => {
            const pct = Math.max(0, Math.min(100, numberOf(r.value) || 0));
            const warn = pct >= 85;
            return (
              <div key={i} style={{ ...card, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6, padding: '12px 8px' }}>
                <span
                  aria-hidden
                  style={{
                    width: 54,
                    height: 54,
                    borderRadius: '50%',
                    background: `conic-gradient(${warn ? '#d92d20' : accent} ${pct * 3.6}deg, ${LINE} 0)`,
                    display: 'grid',
                    placeItems: 'center',
                  }}
                >
                  <span
                    style={{
                      width: 42,
                      height: 42,
                      borderRadius: '50%',
                      background: '#fff',
                      display: 'grid',
                      placeItems: 'center',
                      fontWeight: 800,
                    }}
                  >
                    {r.value}
                  </span>
                </span>
                <span style={{ fontWeight: 700, textAlign: 'center' }}>{r.label}</span>
                {r.extra && <span style={{ fontSize: 10, color: SOFT, textAlign: 'center' }}>{r.extra}</span>}
              </div>
            );
          })}
        </div>
      );
    case 'system':
      return rows.slice(0, 7).map((r, i) => {
        // „Kerne | 40 62 18 77 …“ → einzelne Balken je CPU-Kern
        const cores = r.value
          .split(/\s+/)
          .map(Number)
          .filter((n) => !Number.isNaN(n));
        if (cores.length > 2)
          return (
            <div key={i} style={card}>
              <div style={{ fontWeight: 600 }}>{r.label}</div>
              <div style={{ display: 'flex', alignItems: 'flex-end', gap: 3, height: 48, marginTop: 6 }}>
                {cores.slice(0, 16).map((c, k) => (
                  <span
                    key={k}
                    style={{
                      flex: 1,
                      height: `${Math.max(8, Math.min(100, c))}%`,
                      borderRadius: 2,
                      background: c > 85 ? '#d92d20' : accent,
                    }}
                  />
                ))}
              </div>
            </div>
          );
        const pct = Math.max(0, Math.min(100, numberOf(r.extra || r.value) || 0));
        return (
          <div key={i} style={{ ...card, padding: '8px 12px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontWeight: 600 }}>
              <span>{r.label}</span>
              <span style={{ color: SOFT }}>{r.value}</span>
            </div>
            <div style={{ height: 6, borderRadius: 3, background: LINE, marginTop: 6, overflow: 'hidden' }}>
              <div style={{ width: `${pct}%`, height: '100%', borderRadius: 3, background: pct > 85 ? '#d92d20' : accent }} />
            </div>
          </div>
        );
      });
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

/**
 * Mac-Bildschirm mit „Notch-Insel“ (LD NotchBuddy): oben die schwarze Insel um die Kamera-Aussparung mit kleinen
 * Symbolen (Zusatz-Spalte der ersten Zeilen), darunter die aufgeklappte Insel mit den Zeilen als Kacheln.
 */
function NotchScreen({ rows, accent, title }: { rows: Row[]; accent: string; title?: string }) {
  const icons = rows.map((r) => r.extra).filter(Boolean);
  const left = icons.slice(0, 3);
  const right = icons.slice(3, 6);
  const on = inkOn(accent);
  return (
    <div
      style={{
        height: '100%',
        position: 'relative',
        overflow: 'hidden',
        fontFamily: 'var(--ld-font-sans),sans-serif',
        fontSize: 11,
        color: '#f2f4f8',
        background: `radial-gradient(120% 90% at 20% 110%, ${accent}, transparent 60%), linear-gradient(160deg, #1b1f2e, #0a0c12)`,
      }}
    >
      <div
        aria-hidden
        style={{
          height: 22,
          background: 'rgba(0,0,0,0.35)',
          display: 'flex',
          alignItems: 'center',
          padding: '0 12px',
          gap: 12,
          fontSize: 10,
        }}
      >
        <span>⌘</span>
        <span>{title}</span>
      </div>
      <div style={{ position: 'absolute', top: 0, left: '50%', transform: 'translateX(-50%)', width: 'min(92%, 440px)' }}>
        <div
          aria-hidden
          style={{
            margin: '0 auto',
            width: 'min(100%, 300px)',
            height: 30,
            borderRadius: '0 0 16px 16px',
            background: '#000',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            padding: '0 12px',
            fontSize: 13,
          }}
        >
          <span style={{ display: 'flex', gap: 8 }}>
            {left.map((g, i) => (
              <span key={i}>{g}</span>
            ))}
          </span>
          <span style={{ width: 70 }} />
          <span style={{ display: 'flex', gap: 8 }}>
            {right.map((g, i) => (
              <span key={i}>{g}</span>
            ))}
          </span>
        </div>
        <div
          style={{
            marginTop: 6,
            borderRadius: 22,
            background: '#000',
            padding: 12,
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(118px, 1fr))',
            gap: 8,
            boxShadow: '0 20px 40px -12px rgba(0,0,0,0.6)',
          }}
        >
          {rows.slice(0, 8).map((r, i) => (
            <div
              key={i}
              style={{ borderRadius: 12, padding: '8px 10px', background: i === 0 ? accent : '#1c1f26', color: i === 0 ? on : '#f2f4f8' }}
            >
              <div style={{ fontSize: 10, opacity: 0.85, display: 'flex', gap: 6 }}>
                {r.extra && <span aria-hidden>{r.extra}</span>}
                {r.label}
              </div>
              <div style={{ fontWeight: 800, fontSize: 14, marginTop: 2 }}>{r.value}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

/**
 * Spielszene mit HUD (COE-Beispiele): Motiv je Genre (Zusatz-Spalte der ersten Zeile: fps, stadt, rennen, stealth),
 * Fadenkreuz, Minikarte; Zeilen werden zu HUD-Werten (erste Zeile = Spiel/Ort oben links).
 */
function GameScreen({ rows, accent, title }: { rows: Row[]; accent: string; title?: string }) {
  const [mode, ...hud] = rows;
  return (
    <div
      style={{
        height: '100%',
        position: 'relative',
        overflow: 'hidden',
        fontFamily: mono,
        fontSize: 10,
        color: '#f4f6fa',
        background: '#07090d',
      }}
    >
      <GameArt genre={(mode?.extra || 'fps').toLowerCase()} accent={accent} />
      <div style={{ position: 'absolute', top: 10, left: 12, letterSpacing: '0.08em' }}>
        <div style={{ fontWeight: 700, fontSize: 11 }}>{(mode?.label ?? title ?? '').toUpperCase()}</div>
        {mode?.value && <div style={{ opacity: 0.8 }}>{mode.value}</div>}
      </div>
      <div
        aria-hidden
        style={{
          position: 'absolute',
          top: 10,
          right: 12,
          width: 64,
          height: 64,
          borderRadius: 8,
          border: '1px solid rgba(255,255,255,0.35)',
          background: 'rgba(0,0,0,0.45)',
        }}
      >
        <span
          style={{
            position: 'absolute',
            left: '50%',
            top: '50%',
            width: 6,
            height: 6,
            borderRadius: '50%',
            background: accent,
            transform: 'translate(-50%,-50%)',
          }}
        />
        <span style={{ position: 'absolute', left: '22%', top: '30%', width: 4, height: 4, borderRadius: '50%', background: '#ff4d4d' }} />
        <span style={{ position: 'absolute', left: '70%', top: '64%', width: 4, height: 4, borderRadius: '50%', background: '#ff4d4d' }} />
      </div>
      <div
        aria-hidden
        style={{
          position: 'absolute',
          left: '50%',
          top: '45%',
          transform: 'translate(-50%,-50%)',
          fontSize: 22,
          color: accent,
          textShadow: '0 0 6px rgba(0,0,0,0.8)',
        }}
      >
        ⌖
      </div>
      <div
        style={{
          position: 'absolute',
          left: 12,
          right: 12,
          bottom: 10,
          display: 'flex',
          flexWrap: 'wrap',
          justifyContent: 'space-between',
          gap: 8,
        }}
      >
        {hud.slice(0, 4).map((r, i) => (
          <span key={i} style={{ background: 'rgba(0,0,0,0.55)', borderRadius: 6, padding: '4px 8px', display: 'flex', gap: 6 }}>
            {r.extra && <span aria-hidden>{r.extra}</span>}
            <span style={{ opacity: 0.8 }}>{r.label}</span>
            <b>{r.value}</b>
          </span>
        ))}
      </div>
    </div>
  );
}

/** Hintergrund-Motiv je Genre — reine Dekoration aus Verläufen und Formen. */
function GameArt({ genre, accent }: { genre: string; accent: string }) {
  const abs: CSSProperties = { position: 'absolute', inset: 0 };
  if (genre === 'stadt')
    // Open World von oben: Häuserblöcke, Straßen, Fahrzeug
    return (
      <div aria-hidden style={{ ...abs, background: '#2a2f38' }}>
        <div
          style={{
            ...abs,
            background:
              'repeating-linear-gradient(90deg, transparent 0 70px, #1b1e24 70px 88px), repeating-linear-gradient(0deg, transparent 0 60px, #1b1e24 60px 78px)',
          }}
        />
        <div
          style={{
            ...abs,
            background:
              'repeating-linear-gradient(90deg, transparent 0 78px, rgba(255,214,10,0.5) 78px 80px, transparent 80px 88px), repeating-linear-gradient(0deg, transparent 0 68px, rgba(255,255,255,0.18) 68px 70px, transparent 70px 78px)',
          }}
        />
        <span
          style={{
            position: 'absolute',
            left: '42%',
            top: '46%',
            width: 12,
            height: 22,
            borderRadius: 3,
            background: accent,
            boxShadow: '0 0 12px ' + accent,
          }}
        />
        <span style={{ position: 'absolute', left: '62%', top: '30%', width: 12, height: 22, borderRadius: 3, background: '#3b82f6' }} />
      </div>
    );
  if (genre === 'rennen')
    // Strecke in Perspektive mit Mittelstreifen und Gegner vorne
    return (
      <div
        aria-hidden
        style={{ ...abs, background: 'linear-gradient(180deg, #ff9a3c 0%, #b4426b 38%, #2b1a3a 46%, #18301d 46.5%, #0d1a10 100%)' }}
      >
        <div style={{ ...abs, top: '46%', background: '#2c2f36', clipPath: 'polygon(47% 0, 53% 0, 100% 100%, 0 100%)' }} />
        <div
          style={{
            ...abs,
            top: '46%',
            background: 'repeating-linear-gradient(180deg, #f5f5f5 0 14px, transparent 14px 34px)',
            clipPath: 'polygon(49.6% 0, 50.4% 0, 51.6% 100%, 48.4% 100%)',
          }}
        />
        <span style={{ position: 'absolute', left: '53%', top: '58%', width: 34, height: 18, borderRadius: 6, background: '#2563eb' }} />
        <span
          style={{
            position: 'absolute',
            left: '50%',
            bottom: '8%',
            width: 96,
            height: 40,
            transform: 'translateX(-50%)',
            borderRadius: 12,
            background: accent,
          }}
        />
      </div>
    );
  if (genre === 'stealth')
    // Dunkle Halle, Lichtkegel der Lampen und Sichtkegel einer Wache
    return (
      <div aria-hidden style={{ ...abs, background: 'linear-gradient(180deg, #05060a, #0c0f16)' }}>
        <div style={{ ...abs, background: 'radial-gradient(28% 60% at 25% 0%, rgba(255,230,160,0.28), transparent 70%)' }} />
        <div style={{ ...abs, background: 'radial-gradient(28% 60% at 75% 0%, rgba(255,230,160,0.2), transparent 70%)' }} />
        <div style={{ ...abs, background: 'repeating-linear-gradient(90deg, rgba(255,255,255,0.03) 0 2px, transparent 2px 60px)' }} />
        <div
          style={{
            position: 'absolute',
            left: '58%',
            top: '50%',
            width: '34%',
            height: '30%',
            background: 'rgba(239,68,68,0.22)',
            clipPath: 'polygon(0 50%, 100% 0, 100% 100%)',
          }}
        />
        <span
          style={{
            position: 'absolute',
            left: 'calc(58% - 8px)',
            top: 'calc(65% - 8px)',
            width: 16,
            height: 16,
            borderRadius: '50%',
            background: '#ef4444',
          }}
        />
        <span
          style={{
            position: 'absolute',
            left: '22%',
            bottom: '18%',
            width: 14,
            height: 14,
            borderRadius: '50%',
            background: accent,
            boxShadow: '0 0 0 6px rgba(255,255,255,0.06)',
          }}
        />
      </div>
    );
  // FPS: Himmel, Hügel-Silhouette, Waffe unten rechts
  return (
    <div
      aria-hidden
      style={{
        ...abs,
        background: `linear-gradient(180deg, #0b0f1a 0%, color-mix(in srgb, ${accent} 45%, #0b0f1a) 52%, #1a140e 52.5%, #07090d 100%)`,
      }}
    >
      <div
        style={{
          ...abs,
          top: '30%',
          bottom: '48%',
          background: '#0a0d14',
          clipPath: 'polygon(0 100%, 0 60%, 12% 30%, 26% 55%, 40% 20%, 55% 50%, 70% 25%, 85% 55%, 100% 35%, 100% 100%)',
        }}
      />
      <div
        style={{ ...abs, top: '52%', background: 'repeating-linear-gradient(90deg, rgba(255,255,255,0.05) 0 1px, transparent 1px 38px)' }}
      />
      <div
        style={{
          position: 'absolute',
          right: '12%',
          bottom: 0,
          width: 150,
          height: 90,
          background: '#16191f',
          clipPath: 'polygon(30% 100%, 45% 30%, 95% 10%, 100% 30%, 60% 50%, 70% 100%)',
        }}
      />
    </div>
  );
}

/** CMS-Editor (LD Flow): Bausteine links, Seite in der Mitte, Eigenschaften rechts. Zeilen = Bausteine. */
function EditorScreen({ rows, accent, title }: { rows: Row[]; accent: string; title?: string }) {
  const on = inkOn(accent);
  return (
    <div
      style={{
        height: '100%',
        display: 'flex',
        fontFamily: 'var(--ld-font-sans),sans-serif',
        fontSize: 11,
        color: INK,
        background: '#eef0f5',
      }}
    >
      <div
        style={{
          width: '24%',
          minWidth: 90,
          background: '#fff',
          borderRight: `1px solid ${LINE}`,
          padding: 10,
          display: 'flex',
          flexDirection: 'column',
          gap: 6,
        }}
      >
        <div style={{ fontWeight: 800, fontSize: 12, marginBottom: 4 }}>{title}</div>
        {rows.slice(0, 8).map((r, i) => (
          <div
            key={i}
            style={{
              display: 'flex',
              gap: 6,
              alignItems: 'center',
              padding: '5px 6px',
              borderRadius: 7,
              background: i === 1 ? `color-mix(in srgb, ${accent} 16%, #fff)` : 'transparent',
            }}
          >
            <span aria-hidden style={{ width: 16, textAlign: 'center' }}>
              {r.extra || '▤'}
            </span>
            <span style={{ whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{r.label}</span>
          </div>
        ))}
      </div>
      <div style={{ flex: 1, padding: 12, display: 'flex', flexDirection: 'column', gap: 8, overflow: 'hidden' }}>
        {rows.slice(0, 5).map((r, i) => (
          <div
            key={i}
            style={{
              ...card,
              outline: i === 1 ? `2px solid ${accent}` : 'none',
              outlineOffset: 1,
              minHeight: i === 0 ? 64 : 36,
              background: i === 0 ? `linear-gradient(135deg, ${accent}, color-mix(in srgb, ${accent} 40%, #1b1f2e))` : '#fff',
              color: i === 0 ? on : INK,
            }}
          >
            <div style={{ fontWeight: 800, fontSize: i === 0 ? 15 : 12 }}>{r.value || r.label}</div>
            {i > 0 && <div style={{ height: 6, width: '70%', borderRadius: 3, background: LINE, marginTop: 6 }} aria-hidden />}
          </div>
        ))}
      </div>
      <div
        style={{
          width: '22%',
          minWidth: 80,
          background: '#fff',
          borderLeft: `1px solid ${LINE}`,
          padding: 10,
          display: 'flex',
          flexDirection: 'column',
          gap: 8,
        }}
      >
        <div style={{ fontWeight: 800, fontSize: 12 }}>{rows[1]?.label}</div>
        {[0, 1, 2].map((i) => (
          <div key={i} aria-hidden>
            <div style={{ height: 5, width: '50%', borderRadius: 3, background: LINE }} />
            <div
              style={{ height: 20, borderRadius: 6, border: `1px solid ${LINE}`, marginTop: 4, background: i === 2 ? accent : '#fff' }}
            />
          </div>
        ))}
        <div
          style={{
            marginTop: 'auto',
            borderRadius: 8,
            background: accent,
            color: on,
            textAlign: 'center',
            padding: '6px 0',
            fontWeight: 700,
          }}
          aria-hidden
        >
          ✓
        </div>
      </div>
    </div>
  );
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
