'use client';

import { useCallback, useEffect, useRef, useState, type TouchEvent } from 'react';
import type { Project } from '@content/projects';
import { useContent } from '../content/ContentProvider';
import { ProjectCard, mono, useOpenItem } from '../cards/ProjectCard';
import styles from './catalog.module.css';
import { inkOn, readableAlpha } from '../lib/color';
import { projectHref } from '../lib/routes';
import { useSite } from '../settings/SiteProvider';

const TRANS = 'transform 0.6s cubic-bezier(0.3,0.8,0.3,1)';

const COPY = {
  projekte: { kicker: 'PROJEKTE — DAS PORTFOLIO', title: 'Webseiten, Shops und Spiele seit 2002 — die Arbeiten der Loona!-Plattform.' },
  labs: { kicker: 'LABS — DIE WERKBANK', title: 'Experimente in Arbeit — zuschauen erlaubt.' },
} as const;

/**
 * Endlos-Slider der Featured-Items (Prototyp: advanceSlide): Klon des ersten Slides am Ende; beim Erreichen
 * wird ohne Transition auf 0 zurückgesprungen. Rückwärts von 0 springt er erst auf den Klon.
 */
function useSlider(n: number, auto: boolean) {
  const [st, setSt] = useState({ slide: 0, trans: TRANS, tick: 0 });
  const ref = useRef(st);
  ref.current = st;

  const go = useCallback(
    (dir: 1 | -1) => {
      if (!n) return;
      const cur = ref.current;
      const tick = cur.tick + 1;
      if (dir < 0) {
        if (cur.slide === 0) {
          setSt({ ...cur, trans: 'none', slide: n });
          requestAnimationFrame(() => requestAnimationFrame(() => setSt({ trans: TRANS, slide: n - 1, tick })));
        } else setSt({ slide: cur.slide - 1, trans: TRANS, tick });
        return;
      }
      const next = Math.min(cur.slide + 1, n);
      setSt({ slide: next, trans: TRANS, tick });
      if (next === n) {
        setTimeout(() => {
          setSt((s) => ({ ...s, trans: 'none', slide: 0 }));
          requestAnimationFrame(() => requestAnimationFrame(() => setSt((s) => ({ ...s, trans: TRANS }))));
        }, 660);
      }
    },
    [n],
  );

  // Auto-Play 5,6 s — pausiert bei Animationen aus und offenen Overlays.
  useEffect(() => {
    if (!auto) return;
    const iv = setInterval(() => go(1), 5600);
    return () => clearInterval(iv);
  }, [auto, go]);

  const jump = (i: number) => setSt((s) => ({ slide: i, trans: TRANS, tick: s.tick + 1 }));
  return { ...st, go, jump };
}

/** Projekte / Labs: Kicker, Featured-Slider, Filter-Chips, Karten-Grid. Markup: Prototyp Zeile 468–531. */
export function CatalogPage({ kind }: { kind: 'projekte' | 'labs' }) {
  const { settings, mob, overlay } = useSite();
  const { projects } = useContent();
  const cat = projects.filter((p) => p.kind === kind);
  const slides = cat.filter((p) => p.featured);
  const kats = ['Alle', ...cat.map((p) => p.kat).filter((v, i, a) => a.indexOf(v) === i)];
  const [filter, setFilter] = useState('Alle');
  const grid = cat.filter((p) => filter === 'Alle' || p.kat === filter);
  const slider = useSlider(slides.length, settings.anim && overlay === null);
  const touch = useRef<{ x: number; y: number } | null>(null);

  const onTouchStart = (e: TouchEvent) => {
    const t = e.touches[0];
    if (t) touch.current = { x: t.clientX, y: t.clientY };
  };
  const onTouchEnd = (e: TouchEvent) => {
    const t = e.changedTouches[0];
    if (!t || !touch.current) return;
    const dx = t.clientX - touch.current.x;
    const dy = t.clientY - touch.current.y;
    // Swipe-Schwellen wie Lightbox: horizontal > 48 px, Richtungs-Check ×1,4 gegen Scrollen.
    if (Math.abs(dx) > 48 && Math.abs(dx) > Math.abs(dy) * 1.4) slider.go(dx < 0 ? 1 : -1);
    touch.current = null;
  };

  const shown = slides.length ? [...slides, slides[0]] : slides;
  const active = slides.length ? slider.slide % slides.length : 0;

  return (
    <div data-screen-label="Katalog" style={{ paddingTop: mob && settings.mobModern ? 84 : 140 }}>
      <h1 style={{ fontFamily: mono, fontSize: 11, fontWeight: 400, letterSpacing: '0.18em', color: 'var(--accent)', margin: 0 }}>
        {COPY[kind].kicker}
      </h1>
      <p style={{ fontSize: 15, color: 'var(--muted)', margin: '8px 0 0', maxWidth: 560, lineHeight: 1.6 }}>{COPY[kind].title}</p>

      {slides.length > 0 && (
        <section
          aria-roledescription="Karussell"
          aria-label="Ausgewählte Arbeiten"
          onTouchStart={onTouchStart}
          onTouchEnd={onTouchEnd}
          style={{
            position: 'relative',
            marginTop: 32,
            borderRadius: 22,
            overflow: 'hidden',
            border: '1px solid var(--border)',
            boxShadow: 'var(--cardShadow)',
            touchAction: 'pan-y',
          }}
        >
          <div style={{ display: 'flex', transform: `translateX(-${slider.slide * 100}%)`, transition: slider.trans }}>
            {shown.map((p, i) => (
              <Slide key={`${p.id}-${i}`} p={p} mob={mob} hidden={i !== slider.slide} />
            ))}
          </div>
          <button type="button" aria-label="Vorheriges Projekt" onClick={() => slider.go(-1)} className={styles.arrow} style={{ left: 14 }}>
            ‹
          </button>
          <button type="button" aria-label="Nächstes Projekt" onClick={() => slider.go(1)} className={styles.arrow} style={{ right: 14 }}>
            ›
          </button>
          <span aria-hidden style={{ position: 'absolute', top: 14, right: 14, width: 36, height: 36, pointerEvents: 'none' }}>
            <svg width="36" height="36" viewBox="0 0 36 36">
              <circle cx="18" cy="18" r="14" fill="none" stroke="rgba(255,255,255,0.3)" strokeWidth="3" />
              <circle
                key={slider.tick % 2}
                cx="18"
                cy="18"
                r="14"
                fill="none"
                stroke="var(--accent)"
                strokeWidth="3"
                pathLength={100}
                strokeDasharray="100"
                strokeLinecap="round"
                transform="rotate(-90 18 18)"
                style={{ strokeDashoffset: 100, animation: `${slider.tick % 2 === 0 ? 'ldProg' : 'ldProgB'} 5.6s linear infinite` }}
              />
            </svg>
          </span>
          {/* Prototyp: gap 7 — die Punkte bringen ihren Klickraum jetzt selbst mit (catalog.module.css .dot). */}
          <div style={{ position: 'absolute', bottom: 14 - 8.5, left: 40 - 8.5, display: 'flex', gap: 0 }}>
            {slides.map((p, i) => (
              <button
                key={p.id}
                type="button"
                aria-label={`Slide ${i + 1}: ${p.name}`}
                aria-current={i === active}
                onClick={() => slider.jump(i)}
                className={styles.dot}
                // backgroundColor statt background: die Kurzform setzte background-clip zurück (Klickraum, catalog.module.css)
                style={{ width: i === active ? 22 : 7, backgroundColor: i === active ? 'var(--accent)' : 'rgba(255,255,255,0.35)' }}
              />
            ))}
          </div>
        </section>
      )}

      <div role="group" aria-label="Kategorie filtern" style={{ display: 'flex', gap: 8, margin: '34px 0 22px', flexWrap: 'wrap' }}>
        {kats.map((k) => {
          const on = filter === k;
          return (
            <button
              key={k}
              type="button"
              aria-pressed={on}
              onClick={() => setFilter(k)}
              className={styles.chip}
              style={{
                border: `1px solid ${on ? 'var(--accent)' : 'var(--border)'}`,
                background: on ? 'var(--accent)' : 'transparent',
                color: on ? 'var(--on-accent)' : 'var(--muted)',
              }}
            >
              {k}
            </button>
          );
        })}
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: mob ? '1fr' : 'repeat(3,1fr)', gap: 14, paddingBottom: 80 }}>
        {grid.map((p) => (
          <ProjectCard key={p.id} p={p} prefix="c-" variant="grid" />
        ))}
      </div>
    </div>
  );
}

function Slide({ p, mob, hidden }: { p: Project; mob: boolean; hidden: boolean }) {
  const href = projectHref(p);
  const onClick = useOpenItem(href, p.id);
  const ink = inkOn(p.color);
  return (
    <div
      aria-hidden={hidden}
      // Nicht sichtbare Slides aus der Tab-Reihenfolge nehmen.
      inert={hidden}
      style={{ minWidth: '100%', display: 'grid', gridTemplateColumns: mob ? '1fr' : '1.05fr 1fr', background: 'var(--card)' }}
    >
      <div
        style={{
          padding: mob ? '26px 20px' : '44px 40px 44px 80px',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          gap: 12,
        }}
      >
        <div style={{ display: 'flex', gap: 10, alignItems: 'center', fontFamily: mono, fontSize: 10 }}>
          <span style={{ color: 'var(--accent)', letterSpacing: '0.14em' }}>{p.tag}</span>
          <span style={{ color: 'var(--soft)' }}>{p.datum}</span>
        </div>
        <h2 style={{ fontSize: 34, fontWeight: 700, letterSpacing: '-0.025em', margin: 0 }}>{p.name}</h2>
        <div style={{ fontSize: 14, color: 'var(--muted)', lineHeight: 1.65, maxWidth: 400 }}>{p.desc}</div>
        <div style={{ display: 'flex', gap: 14, alignItems: 'center', marginTop: 10 }}>
          <a href={href} onClick={onClick} className={styles.caseBtn}>
            Case ansehen ›
          </a>
          {p.link && (
            <a
              href={p.link}
              target="_blank"
              rel="noopener noreferrer"
              style={{ fontSize: 13, fontWeight: 700, color: 'var(--accent)', textDecoration: 'none' }}
            >
              {p.linkLabel || 'Jetzt spielen ↗'}
            </a>
          )}
        </div>
      </div>
      <div
        style={{
          position: 'relative',
          background: p.color,
          color: ink,
          minHeight: mob ? 190 : 290,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <div
          style={{
            position: 'absolute',
            inset: 0,
            background: 'repeating-linear-gradient(-45deg,rgba(255,255,255,0.06) 0 2px,transparent 2px 16px)',
          }}
        />
        <span aria-hidden style={{ position: 'relative', fontSize: 110, fontWeight: 800, letterSpacing: '-0.04em', opacity: 0.92 }}>
          {p.mono}
        </span>
        <span
          style={{
            position: 'absolute',
            bottom: 16,
            right: 20,
            fontFamily: mono,
            fontSize: 10,
            letterSpacing: '0.14em',
            opacity: readableAlpha(p.color, ink, 0.75),
          }}
        >
          {p.tool}
        </span>
      </div>
    </div>
  );
}
