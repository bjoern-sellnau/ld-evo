'use client';

import { useEffect, useRef, useState } from 'react';
import { NO_STATS_KEY } from '@/site/stats/useHitCounter';
import type { SiteStats } from '../repo';

const num = (n: number) => n.toLocaleString('de-DE');
const dayLabel = (d: string, long = false) =>
  new Date(`${d}T12:00:00`).toLocaleDateString(
    'de-DE',
    long ? { weekday: 'short', day: '2-digit', month: '2-digit' } : { day: '2-digit', month: '2-digit' },
  );

/** Glatte Achsenwerte: 0 · Hälfte · Maximum; Maximum auf 1/1,2/1,6/2/3/4/6/8/10 × 10ⁿ (Hälfte bleibt glatt). */
export function niceMax(v: number): number {
  if (v <= 4) return 4;
  const p = 10 ** Math.floor(Math.log10(v));
  return [1, 1.2, 1.6, 2, 3, 4, 6, 8, 10].map((m) => Math.round(m * p)).find((x) => x >= v) ?? v;
}

/**
 * Säulen je Tag (eine Datenreihe → keine Legende; Titel benennt sie). Marken nach den Diagramm-Richtlinien: Säulen
 * ≤ 24 px mit 4 px gerundetem Ende und eckiger Basis, 2 px Luft, Raster als Haarlinie; Tooltip je Säule;
 * darunter dieselben Werte als Tabelle.
 */
function DailyChart({ days }: { days: SiteStats['days'] }) {
  const box = useRef<HTMLDivElement>(null);
  const [w, setW] = useState(720);
  const [hover, setHover] = useState<number | null>(null);
  useEffect(() => {
    const el = box.current;
    if (!el) return;
    const ro = new ResizeObserver(() => setW(el.clientWidth));
    ro.observe(el);
    return () => ro.disconnect();
  }, []);
  const H = 200;
  const T = 10; // Luft oben, damit der oberste Achsenwert nicht abgeschnitten wird
  const left = 36;
  const plotW = Math.max(120, w - left);
  const max = niceMax(Math.max(...days.map((d) => d.views)));
  const band = plotW / days.length;
  const bw = Math.min(24, Math.max(2, band - 2));
  const y = (v: number) => T + H - (v / max) * H;
  const bar = (x: number, top: number) => {
    const h = T + H - top;
    if (h <= 0) return '';
    const r = Math.min(4, h, bw / 2);
    return `M${x},${T + H}V${top + r}Q${x},${top} ${x + r},${top}H${x + bw - r}Q${x + bw},${top} ${x + bw},${top + r}V${T + H}Z`;
  };
  const hv = hover === null ? null : days[hover];
  return (
    <div ref={box} style={{ position: 'relative' }}>
      <svg width={w} height={T + H + 24} role="img" aria-label={`Aufrufe je Tag, ${days.length} Tage — Werte in der Tabelle darunter`}>
        {[0, max / 2, max].map((t) => (
          <g key={t}>
            <line x1={left} x2={w} y1={y(t)} y2={y(t)} stroke="var(--f-line)" strokeWidth={1} />
            <text x={left - 8} y={y(t) + 4} textAnchor="end" fontSize={11} fill="var(--f-soft)">
              {num(t)}
            </text>
          </g>
        ))}
        {days.map((d, i) => {
          const x = left + i * band + (band - bw) / 2;
          return (
            <g key={d.day} onMouseEnter={() => setHover(i)} onMouseLeave={() => setHover((h) => (h === i ? null : h))}>
              {/* Trefferfläche: ganze Spalte, größer als die Säule */}
              <rect x={left + i * band} y={T} width={band} height={H} fill="transparent" />
              <path d={bar(x, y(d.views))} fill="var(--f-accent)" opacity={hover === null || hover === i ? 1 : 0.55} />
            </g>
          );
        })}
        {[0, Math.floor(days.length / 2), days.length - 1].map((i) => (
          <text key={i} x={left + i * band + band / 2} y={T + H + 17} textAnchor="middle" fontSize={11} fill="var(--f-soft)">
            {dayLabel(days[i].day)}
          </text>
        ))}
      </svg>
      {hv && hover !== null && (
        <div
          aria-hidden // nur fürs Auge; dieselben Werte stehen in der Tabelle
          style={{
            position: 'absolute',
            left: Math.min(w - 150, Math.max(0, left + hover * band + band / 2 - 75)),
            top: Math.max(0, y(hv.views) - 46),
            width: 150,
            padding: '6px 10px',
            borderRadius: 8,
            background: 'var(--f-panel2)',
            border: '1px solid var(--f-line2)',
            fontSize: 12,
            pointerEvents: 'none',
            textAlign: 'center',
          }}
        >
          <div style={{ color: 'var(--f-muted)' }}>{dayLabel(hv.day, true)}</div>
          <strong style={{ color: 'var(--f-ink)' }}>
            {num(hv.views)} {hv.views === 1 ? 'Aufruf' : 'Aufrufe'}
          </strong>
        </div>
      )}
    </div>
  );
}

function Top({ title, rows }: { title: string; rows: { k: string; v: number }[] }) {
  return (
    <section className="f-card" aria-label={title}>
      <h2 style={{ margin: '0 0 10px', fontSize: 15 }}>{title}</h2>
      {rows.length === 0 ? (
        <p className="f-help" style={{ margin: 0 }}>
          Noch keine Daten.
        </p>
      ) : (
        <table className="f-table" style={{ width: '100%' }}>
          <tbody>
            {rows.map((r) => (
              <tr key={r.k}>
                <td style={{ overflowWrap: 'anywhere' }}>{r.k}</td>
                <td style={{ textAlign: 'right', fontVariantNumeric: 'tabular-nums' }}>{num(r.v)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </section>
  );
}

export function StatsView({ stats }: { stats: SiteStats }) {
  const sum = (n: number) => stats.days.slice(-n).reduce((a, d) => a + d.views, 0);
  const [excluded, setExcluded] = useState<boolean | null>(null);
  useEffect(() => {
    try {
      // eslint-disable-next-line react-hooks/set-state-in-effect -- Opt-out steht nur im Browser (localStorage) — nach der Hydration übernehmen
      setExcluded(localStorage.getItem(NO_STATS_KEY) === '1');
    } catch {
      setExcluded(false);
    }
  }, []);
  const toggle = () => {
    try {
      if (excluded) localStorage.removeItem(NO_STATS_KEY);
      else localStorage.setItem(NO_STATS_KEY, '1');
      setExcluded(!excluded);
    } catch {
      // ohne localStorage nicht möglich
    }
  };
  return (
    <>
      <div className="f-row" style={{ gap: 14, alignItems: 'stretch', marginBottom: 18 }}>
        <div className="f-card" style={{ flex: '2 1 220px' }}>
          <div className="f-help">Aufrufe, letzte 30 Tage</div>
          <div style={{ fontSize: 48, fontWeight: 600, lineHeight: 1.1, color: 'var(--f-ink)' }}>{num(sum(30))}</div>
        </div>
        <div className="f-card" style={{ flex: '1 1 140px' }}>
          <div className="f-help">Letzte 7 Tage</div>
          <div style={{ fontSize: 26, fontWeight: 600, color: 'var(--f-ink)' }}>{num(sum(7))}</div>
        </div>
        <div className="f-card" style={{ flex: '1 1 140px' }}>
          <div className="f-help">Heute</div>
          <div style={{ fontSize: 26, fontWeight: 600, color: 'var(--f-ink)' }}>{num(sum(1))}</div>
        </div>
      </div>
      <section className="f-card" aria-labelledby="chart-t" style={{ marginBottom: 18 }}>
        <h2 id="chart-t" style={{ margin: '0 0 12px', fontSize: 15 }}>
          Aufrufe je Tag
        </h2>
        <DailyChart days={stats.days} />
        <details style={{ marginTop: 10 }}>
          <summary className="f-help" style={{ cursor: 'pointer' }}>
            Als Tabelle
          </summary>
          <table className="f-table" style={{ marginTop: 8 }}>
            <thead>
              <tr>
                <th>Tag</th>
                <th style={{ textAlign: 'right' }}>Aufrufe</th>
              </tr>
            </thead>
            <tbody>
              {[...stats.days].reverse().map((d) => (
                <tr key={d.day}>
                  <td>{dayLabel(d.day, true)}</td>
                  <td style={{ textAlign: 'right', fontVariantNumeric: 'tabular-nums' }}>{num(d.views)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </details>
      </section>
      <div style={{ display: 'grid', gap: 18, gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))' }}>
        <Top title="Meistbesuchte Seiten" rows={stats.pages.map((p) => ({ k: p.path, v: p.views }))} />
        <Top title="Herkunft (externe Links)" rows={stats.referrers.map((r) => ({ k: r.host, v: r.views }))} />
      </div>
      <div className="f-card" style={{ marginTop: 18 }}>
        <p className="f-help" style={{ marginTop: 0 }}>
          Gezählt werden nur Seitenaufrufe je Tag und Seite sowie die Domain externer Verweise — ohne Cookies, ohne IP-Adressen, ohne
          Kennungen. Browser mit „Do Not Track“ oder „Global Privacy Control“ werden nicht gezählt.
        </p>
        {excluded !== null && (
          <button className="f-btn sm" type="button" onClick={toggle} aria-pressed={excluded}>
            {excluded ? 'Diesen Browser wieder mitzählen' : 'Diesen Browser nicht mitzählen (eigene Aufrufe)'}
          </button>
        )}
      </div>
    </>
  );
}
