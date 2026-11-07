'use client';

import { useLayoutEffect, useRef, useState, type CSSProperties } from 'react';
import { EText } from '../cms/editing';
import { mono } from '../cards/ProjectCard';
import { useT } from '../i18n/LocaleProvider';
import { useLocale } from '../i18n/LocaleProvider';
import { LocalLink } from '../i18n/LocalLink';
import { isSafeHref } from '@/cms/safe';
import { useInView, useMotionOk } from '../story/motion';
import styles from './blocks.module.css';

/**
 * Daten-Widgets der Detailseiten (neu, Wunsch 07.11.2026): Diagramm, KPI-Vergleich, Steckbrief, Skills.
 * Diagramm nach den Regeln der Datenvisualisierung: eine Reihe in Akzentfarbe (keine Legende nötig — der Titel
 * nennt sie), dünne Marken mit 4-px-Rundung am Datenende, Haarlinien-Raster, Text nie in Datenfarbe, Wert an der
 * Spitze, Tooltip bei Hover/Fokus und eine Tabellenansicht.
 */

const fmt = (n: number, locale: string) =>
  new Intl.NumberFormat(locale === 'en' ? 'en-US' : 'de-DE', { maximumFractionDigits: 2 }).format(n);

export interface Datum {
  label?: string;
  value?: number;
}

/** Saubere Skala 0 … max mit 3–5 runden Teilstrichen. */
function niceTicks(max: number): number[] {
  if (max <= 0) return [0, 1];
  const raw = max / 4;
  const mag = 10 ** Math.floor(Math.log10(raw));
  const step = [1, 2, 2.5, 5, 10].map((m) => m * mag).find((s) => s >= raw) ?? raw;
  const top = Math.ceil(max / step) * step;
  const out: number[] = [];
  for (let v = 0; v <= top + step / 2; v += step) out.push(Math.round(v * 1e6) / 1e6);
  return out;
}

/** Rechteck mit 4-px-Rundung nur am Datenende (Balken rechts, Säulen oben), eckig an der Grundlinie. */
const barPath = (x: number, y: number, w: number, h: number, dir: 'h' | 'v') => {
  const r = Math.min(4, dir === 'h' ? w / 2 : h / 2, dir === 'h' ? h / 2 : w / 2);
  if (dir === 'h')
    return `M${x} ${y}H${x + w - r}A${r} ${r} 0 0 1 ${x + w} ${y + r}V${y + h - r}A${r} ${r} 0 0 1 ${x + w - r} ${y + h}H${x}Z`;
  return `M${x} ${y + h}V${y + r}A${r} ${r} 0 0 1 ${x + r} ${y}H${x + w - r}A${r} ${r} 0 0 1 ${x + w} ${y + r}V${y + h}Z`;
};

export function Chart({
  title,
  unit,
  note,
  items,
  kind,
  path,
  accent,
}: {
  title?: string;
  unit?: string;
  note?: string;
  items: Datum[];
  kind: string;
  path: string;
  accent: string;
}) {
  const t = useT();
  const locale = useLocale();
  const [tip, setTip] = useState<{ i: number; x: number; y: number } | null>(null);
  // Zeichenfläche = echte Breite (1 SVG-Einheit = 1 px): Schrift und Marken bleiben auf dem Telefon wie auf
  // Ultra-Widescreen gleich groß, statt mit dem viewBox mitzuschrumpfen. Ohne Messung (Server) 640.
  const boxRef = useRef<HTMLDivElement>(null);
  const [cw, setCw] = useState(0);
  useLayoutEffect(() => {
    const el = boxRef.current;
    if (!el) return;
    const set = () => setCw(Math.round(el.clientWidth));
    set();
    if (typeof ResizeObserver === 'undefined') return;
    const ro = new ResizeObserver(set);
    ro.observe(el);
    return () => ro.disconnect();
  }, []);
  const data = items.map((d) => ({ label: d.label ?? '', value: Number.isFinite(Number(d.value)) ? Number(d.value) : 0 }));
  const max = Math.max(0, ...data.map((d) => d.value));
  const ticks = niceTicks(max);
  const top = ticks[ticks.length - 1] || 1;
  const val = (v: number) => `${fmt(v, locale)}${unit ? ` ${unit}` : ''}`;
  const n = data.length;
  // Zugänglicher Name: Titel und alle Werte (die Tabellenansicht darunter zeigt dasselbe sichtbar)
  const summary = `${title ? `${title}: ` : ''}${data.map((d) => `${d.label} ${val(d.value)}`).join(', ')}`;

  let svg = null;
  const W = cw > 0 ? Math.max(260, cw) : 640;
  const cut = (s: string, max: number) => (s.length > max ? `${s.slice(0, Math.max(1, max - 1))}…` : s);
  if (kind === 'balken') {
    // Waagerechte Balken: Beschriftung links (eigene Spalte), Wert an der Spitze
    const band = 34;
    const bar = Math.min(24, band - 12);
    const L = Math.min(150, Math.round(W * 0.32));
    const R = 70;
    const H = n * band + 8;
    const x = (v: number) => (Math.max(0, v) / top) * (W - L - R);
    svg = (
      <svg viewBox={`0 0 ${W} ${H}`} role="img" aria-label={summary}>
        {ticks.map((tk) => (
          <line key={tk} x1={L + x(tk)} x2={L + x(tk)} y1={0} y2={H - 4} stroke="var(--hair)" strokeWidth={1} />
        ))}
        {data.map((d, i) => {
          const y = i * band + (band - bar) / 2;
          const w = Math.max(1, x(d.value));
          return (
            <g
              key={i}
              className={styles.chartMark}
              onPointerEnter={() => setTip({ i, x: ((L + w) / W) * 100, y: (y / H) * 100 })}
              onPointerLeave={() => setTip(null)}
            >
              <rect className={styles.chartHit} x={0} y={i * band} width={W} height={band} fill="transparent" />
              <text x={L - 12} y={y + bar / 2} dominantBaseline="central" textAnchor="end" fontSize={13} fill="var(--muted)">
                {cut(d.label, Math.floor((L - 16) / 7))}
              </text>
              <path d={barPath(L, y, w, bar, 'h')} fill={accent} />
              <text x={L + w + 8} y={y + bar / 2} dominantBaseline="central" fontSize={13} fontWeight={600} fill="var(--ink)">
                {val(d.value)}
              </text>
            </g>
          );
        })}
      </svg>
    );
  } else {
    // Säulen bzw. Linie: y-Achse mit runden Teilstrichen (Haarlinien), Beschriftung darunter
    const H = 300;
    const L = 48;
    const B = 34;
    const T = 22;
    const plotW = W - L - 10;
    const plotH = H - B - T;
    const y = (v: number) => T + plotH - (Math.max(0, v) / top) * plotH;
    const slot = plotW / Math.max(1, n);
    const cx = (i: number) => L + slot * i + slot / 2;
    const bar = Math.min(24, slot * 0.6);
    const pts = data.map((d, i) => [cx(i), y(d.value)] as const);
    const peak = data.reduce((m, d, i) => (d.value > data[m].value ? i : m), 0);
    svg = (
      <svg viewBox={`0 0 ${W} ${H}`} role="img" aria-label={summary}>
        {ticks.map((tk) => (
          <g key={tk}>
            <line x1={L} x2={W - 10} y1={y(tk)} y2={y(tk)} stroke="var(--hair)" strokeWidth={1} />
            <text x={L - 8} y={y(tk)} dominantBaseline="central" textAnchor="end" fontSize={11.5} fill="var(--soft)">
              {fmt(tk, locale)}
            </text>
          </g>
        ))}
        {kind === 'linie' && n > 1 && (
          <>
            <path
              d={`M${pts[0][0]} ${y(0)}L${pts.map((p) => p.join(' ')).join('L')}L${pts[n - 1][0]} ${y(0)}Z`}
              fill={accent}
              opacity={0.1}
            />
            <path
              d={`M${pts.map((p) => p.join(' ')).join('L')}`}
              fill="none"
              stroke={accent}
              strokeWidth={2}
              strokeLinejoin="round"
              strokeLinecap="round"
            />
          </>
        )}
        {data.map((d, i) => {
          const tipAt = { i, x: (cx(i) / W) * 100, y: (y(d.value) / H) * 100 };
          // Beschriftung: Säulen am Kopf jeder Säule; Linie nur am Ende und am Höchstwert (sparsam)
          const label = kind !== 'linie' || i === n - 1 || i === peak;
          return (
            <g key={i} className={styles.chartMark} onPointerEnter={() => setTip(tipAt)} onPointerLeave={() => setTip(null)}>
              <rect className={styles.chartHit} x={cx(i) - slot / 2} y={T} width={slot} height={plotH} fill="transparent" />
              {kind === 'linie' ? (
                <circle cx={cx(i)} cy={y(d.value)} r={4.5} fill={accent} stroke="var(--bg)" strokeWidth={2} />
              ) : (
                <path d={barPath(cx(i) - bar / 2, y(d.value), bar, Math.max(1, y(0) - y(d.value)), 'v')} fill={accent} />
              )}
              {label && (
                <text x={cx(i)} y={y(d.value) - 10} textAnchor="middle" fontSize={12.5} fontWeight={600} fill="var(--ink)">
                  {val(d.value)}
                </text>
              )}
              <text x={cx(i)} y={H - 12} textAnchor="middle" fontSize={11.5} fill="var(--muted)">
                {cut(d.label, Math.max(3, Math.floor(slot / 7.5)))}
              </text>
            </g>
          );
        })}
      </svg>
    );
  }

  return (
    <figure className={styles.box} style={{ margin: 0 }}>
      {title && (
        <figcaption style={{ fontSize: 15, fontWeight: 700, color: 'var(--ink)', marginBottom: 12 }}>
          <EText path={`${path}.title`} value={title} />
        </figcaption>
      )}
      <div ref={boxRef} className={styles.chart}>
        {svg}
        {tip && data[tip.i] && (
          <span aria-hidden className={styles.chartTip} style={{ left: `${tip.x}%`, top: `${tip.y}%` }}>
            {data[tip.i].label}: {val(data[tip.i].value)}
          </span>
        )}
      </div>
      {note && (
        <p className={styles.caption}>
          <EText path={`${path}.note`} value={note} />
        </p>
      )}
      <details className={styles.chartTable}>
        <summary>{t('w.table')}</summary>
        <table>
          <thead>
            <tr>
              <th scope="col">{t('w.label')}</th>
              <th scope="col">{t('w.value')}</th>
            </tr>
          </thead>
          <tbody>
            {data.map((d, i) => (
              <tr key={i}>
                <td>{d.label}</td>
                <td>{val(d.value)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </details>
    </figure>
  );
}

// ---------------------------------------------------------------------------------------------------------------
// KPI-Vergleich
// ---------------------------------------------------------------------------------------------------------------

export interface Kpi {
  label?: string;
  before?: number;
  after?: number;
  unit?: string;
  better?: string;
}

/** Vorher → Nachher je Kennzahl mit Veränderung in %; „besser/schlechter“ als Wort und Pfeil, nie nur als Farbe. */
export function KpiCompare({ items, path, accent }: { items: Kpi[]; path: string; accent: string }) {
  const t = useT();
  const locale = useLocale();
  return (
    <div className={styles.box}>
      <div className={styles.grid} style={{ '--min': '220px' } as CSSProperties}>
        {items.map((k, i) => {
          const a = Number(k.before ?? 0);
          const b = Number(k.after ?? 0);
          const u = k.unit ? ` ${k.unit}` : '';
          const delta = a !== 0 ? ((b - a) / Math.abs(a)) * 100 : 0;
          const up = b > a;
          const good = b === a ? null : k.better === 'niedrig' ? !up : up;
          return (
            <div key={i} className={styles.card}>
              <div style={{ fontFamily: mono, fontSize: 10.5, letterSpacing: '0.14em', color: 'var(--soft)', textTransform: 'uppercase' }}>
                <EText path={`${path}.items.${i}.label`} value={k.label} />
              </div>
              <div
                style={{
                  marginTop: 10,
                  fontSize: 'clamp(30px, 3.4cqi, 44px)',
                  fontWeight: 800,
                  letterSpacing: '-0.03em',
                  lineHeight: 1,
                  color: 'var(--ink)',
                }}
              >
                {fmt(b, locale)}
                <span style={{ fontSize: '0.5em', fontWeight: 700, color: 'var(--muted)' }}>{u}</span>
              </div>
              <div
                style={{
                  marginTop: 10,
                  display: 'flex',
                  alignItems: 'center',
                  gap: 8,
                  flexWrap: 'wrap',
                  fontSize: 13,
                  color: 'var(--muted)',
                }}
              >
                <span>{t('w.change', { a: fmt(a, locale) + u, b: fmt(b, locale) + u })}</span>
                <span
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: 6,
                    padding: '3px 9px',
                    borderRadius: 999,
                    border: '1px solid var(--border)',
                    color: 'var(--ink)',
                    fontWeight: 700,
                  }}
                >
                  <span
                    aria-hidden
                    style={{
                      width: 8,
                      height: 8,
                      borderRadius: '50%',
                      background: good === null ? 'var(--soft)' : good ? '#22A06B' : '#E5484D',
                    }}
                  />
                  <span aria-hidden>{b === a ? '→' : up ? '▲' : '▼'}</span>
                  {a !== 0 ? `${delta > 0 ? '+' : ''}${fmt(Math.round(delta * 10) / 10, locale)} %` : ''}
                  <span style={{ fontWeight: 500, color: 'var(--muted)' }}>
                    {good === null ? t('w.same') : good ? t('w.better') : t('w.worse')}
                  </span>
                </span>
              </div>
              <div
                aria-hidden
                style={{
                  marginTop: 14,
                  height: 3,
                  borderRadius: 999,
                  background: accent,
                  opacity: 0.85,
                  width: `${Math.min(100, Math.max(6, a && b ? (Math.min(a, b) / Math.max(a, b)) * 100 : 100))}%`,
                }}
              />
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------------------------------------------
// Steckbrief
// ---------------------------------------------------------------------------------------------------------------

export interface Fact {
  label?: string;
  value?: string;
  href?: string;
}

/** Fakten-Raster (Definitionsliste) wie der Kopf der Case Study — Spalten nach verfügbarer Breite. */
export function Facts({ items, path, accent }: { items: Fact[]; path: string; accent: string }) {
  return (
    <div className={styles.box}>
      <dl
        className={styles.grid}
        style={
          {
            '--min': '170px',
            gap: 1,
            background: 'var(--hair)',
            border: '1px solid var(--hair)',
            borderRadius: 16,
            overflow: 'hidden',
            margin: 0,
          } as CSSProperties
        }
      >
        {items.map((f, i) => (
          <div key={i} style={{ background: 'var(--bg)', padding: '14px 16px', minWidth: 0 }}>
            <dt style={{ fontFamily: mono, fontSize: 9.5, letterSpacing: '0.14em', color: 'var(--soft)', textTransform: 'uppercase' }}>
              <EText path={`${path}.items.${i}.label`} value={f.label} />
            </dt>
            <dd
              style={{ margin: '6px 0 0', fontSize: 14.5, fontWeight: 600, lineHeight: 1.4, color: 'var(--ink)', overflowWrap: 'anywhere' }}
            >
              {f.href && isSafeHref(f.href) ? (
                <LocalLink href={f.href} style={{ color: 'inherit', textDecorationColor: accent }}>
                  {f.value}
                </LocalLink>
              ) : (
                <EText path={`${path}.items.${i}.value`} value={f.value} />
              )}
            </dd>
          </div>
        ))}
      </dl>
    </div>
  );
}

// ---------------------------------------------------------------------------------------------------------------
// Skills / Fortschritt
// ---------------------------------------------------------------------------------------------------------------

export interface Skill {
  label?: string;
  value?: number;
  note?: string;
}

/** Balken 0–100 % (role="meter"); füllt sich einmal beim Hineinscrollen, ohne Bewegung sofort voll. */
export function Skills({ items, path, accent }: { items: Skill[]; path: string; accent: string }) {
  const t = useT();
  const ref = useRef<HTMLUListElement>(null);
  const seen = useInView(ref);
  const motion = useMotionOk();
  return (
    <div className={styles.box}>
      <ul
        ref={ref}
        className={styles.grid}
        style={{ '--min': '300px', listStyle: 'none', margin: 0, padding: 0, gap: '18px 28px' } as CSSProperties}
      >
        {items.map((s, i) => {
          const v = Math.min(100, Math.max(0, Math.round(Number(s.value ?? 0))));
          return (
            <li key={i}>
              <div
                style={{ display: 'flex', justifyContent: 'space-between', gap: 12, fontSize: 14, fontWeight: 600, color: 'var(--ink)' }}
              >
                <EText path={`${path}.items.${i}.label`} value={s.label} />
                <span style={{ fontFamily: mono, fontSize: 12, color: 'var(--muted)', fontVariantNumeric: 'tabular-nums' }}>{v} %</span>
              </div>
              <div
                className={styles.meter}
                role="meter"
                aria-valuemin={0}
                aria-valuemax={100}
                aria-valuenow={v}
                aria-label={t('w.progress', { label: s.label ?? '', value: v })}
                style={{ marginTop: 8, background: `color-mix(in srgb, ${accent} 18%, transparent)` }}
              >
                <div
                  className={styles.meterFill}
                  data-anim={String(motion && seen)}
                  style={{ width: `${v}%`, background: accent, visibility: motion && !seen ? 'hidden' : undefined }}
                />
              </div>
              {s.note && (
                <div style={{ marginTop: 6, fontSize: 12.5, color: 'var(--soft)' }}>
                  <EText path={`${path}.items.${i}.note`} value={s.note} />
                </div>
              )}
            </li>
          );
        })}
      </ul>
    </div>
  );
}
