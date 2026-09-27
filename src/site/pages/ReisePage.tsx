'use client';

import { useCallback, useEffect, useRef, useState, type CSSProperties } from 'react';
import { JOURNEY_MEDIA } from '@content/journeyMedia';
import { LoonaTile } from '@/components/brand';
import { useContent } from '../content/ContentProvider';
import { useSite } from '../settings/SiteProvider';

const mono = 'var(--ld-font-mono),monospace';
const GAP = 172; // depthGap-Default des Prototyps
const BENTO = [
  { col: '1 / 3', row: '1 / 3' },
  { col: '3 / 5', row: '1 / 2' },
  { col: '3 / 5', row: '2 / 3' },
  { col: '1 / 3', row: '3 / 4' },
  { col: '3 / 5', row: '3 / 4' },
];

type IntroPhase = 'run' | 'out' | 'done';

/**
 * Meine Reise — LD Timeline, 1:1 aus design/design_handoff_loona_site/LD Timeline.dc.html (Nachtrag v22/v23):
 * 3D-Kartenstapel, Info-Panel links, Jahres-Rail rechts mit Zwischenschritten, Intro-Zähler 2004 → 2026.
 * Eingebettet als full-bleed Wrapper mit overflow hidden — nie ein Scroll-Lock auf body. Ton ist entfernt.
 * Die „L!“-Kachel im Intro ist durch die LD-Kachel ersetzt (Entscheidung: neues Logo).
 */
export function ReisePage() {
  const { settings, hydrated } = useSite();
  const JOURNEY = useContent().journey;
  const LAST = JOURNEY.length - 1;
  const rm = !settings.anim; // reduceMotion = Animationen aus (Prototyp: reiseReduce)
  const [cur, setCur] = useState(rm ? LAST : 0);
  const [stepIdx, setStepIdx] = useState<number | null>(null);
  const [intro, setIntro] = useState<{ phase: IntroPhase; year: number; p: number }>(
    rm ? { phase: 'done', year: 2026, p: 1 } : { phase: 'run', year: 2004, p: 0 },
  );
  const [swap, setSwap] = useState<'in' | 'out'>('in');
  const [swapKey, setSwapKey] = useState(0);
  const [vw, setVw] = useState(1280);
  const [coarse, setCoarse] = useState(false);
  const stage = useRef<HTMLDivElement>(null);
  const timers = useRef<{
    iv?: ReturnType<typeof setInterval>;
    hold?: ReturnType<typeof setTimeout>;
    out?: ReturnType<typeof setTimeout>;
    swap?: ReturnType<typeof setTimeout>;
  }>({});
  const live = useRef({ cur, intro, rm });
  live.current = { cur, intro, rm };
  const lastWheel = useRef(0);

  // Intro: 3,6 s ease-out-cubic von 2004 bis 2026, 1,9 s halten, 0,7 s ausblenden. Startet nach der Hydration,
  // damit „Animationen aus“ (localStorage) berücksichtigt ist — dann direkt Station 2026 ohne Intro.
  useEffect(() => {
    if (!hydrated) return;
    if (live.current.rm) {
      setIntro({ phase: 'done', year: 2026, p: 1 });
      setCur(LAST);
      return;
    }
    const t = timers.current;
    const t0 = performance.now();
    t.iv = setInterval(() => {
      const k = Math.min((performance.now() - t0) / 3600, 1);
      const e = 1 - Math.pow(1 - k, 3);
      setIntro({ phase: 'run', year: Math.round(2004 + e * 22), p: e });
      setCur(Math.round(e * LAST));
      if (k >= 1) {
        clearInterval(t.iv);
        setIntro({ phase: 'run', year: 2026, p: 1 });
        setCur(LAST);
        t.hold = setTimeout(() => {
          setIntro((i) => ({ ...i, phase: 'out' }));
          t.out = setTimeout(() => setIntro((i) => ({ ...i, phase: 'done' })), 700);
        }, 1900);
      }
    }, 40);
    return () => {
      clearInterval(t.iv);
      clearTimeout(t.hold);
      clearTimeout(t.out);
      clearTimeout(t.swap);
    };
  }, [hydrated]);

  const goStation = useCallback((n: number) => {
    const { cur: c, intro: i, rm: r } = live.current;
    if (n === c) return;
    if (r || i.phase !== 'done') {
      setCur(n);
      setStepIdx(null);
      setSwap('in');
      setSwapKey((k) => k + 1);
      return;
    }
    clearTimeout(timers.current.swap);
    setSwap('out');
    timers.current.swap = setTimeout(() => {
      setCur(n);
      setStepIdx(null);
      setSwap('in');
      setSwapKey((k) => k + 1);
    }, 190);
  }, []);

  const step = useCallback((dir: number) => goStation(Math.max(0, Math.min(LAST, live.current.cur + dir))), [goStation]);

  const jump = useCallback(
    (idx: number) => {
      if (idx === live.current.cur) {
        setStepIdx(null);
        return;
      }
      goStation(idx);
    },
    [goStation],
  );

  useEffect(() => {
    const el = stage.current;
    const mq = window.matchMedia('(pointer: coarse)');
    const onSize = () => {
      setVw(window.innerWidth || 1280);
      setCoarse(mq.matches);
    };
    onSize();
    const onWheel = (e: WheelEvent) => {
      if (mq.matches) return;
      const tgt = e.target as Element | null;
      if (tgt?.closest?.('#ldt-panel,[data-ldt-rail]')) return; // Infofeld/Rail scrollen selbst
      e.preventDefault();
      if (live.current.intro.phase !== 'done') return;
      const now = performance.now();
      if (now - lastWheel.current < 340) return;
      lastWheel.current = now;
      step(e.deltaY > 0 ? -1 : 1);
    };
    const onKey = (e: KeyboardEvent) => {
      if (live.current.intro.phase !== 'done') return;
      const tgt = e.target as HTMLElement | null;
      if (tgt && (tgt.isContentEditable || /^(INPUT|TEXTAREA|SELECT)$/.test(tgt.tagName))) return;
      if (['ArrowDown', 'ArrowRight', 'PageDown'].includes(e.key)) {
        e.preventDefault();
        step(-1);
      } else if (['ArrowUp', 'ArrowLeft', 'PageUp'].includes(e.key)) {
        e.preventDefault();
        step(1);
      } else if (e.key === 'Home') {
        e.preventDefault();
        jump(LAST);
      } else if (e.key === 'End') {
        e.preventDefault();
        jump(0);
      }
    };
    el?.addEventListener('wheel', onWheel, { passive: false });
    document.addEventListener('keydown', onKey);
    window.addEventListener('resize', onSize);
    return () => {
      el?.removeEventListener('wheel', onWheel);
      document.removeEventListener('keydown', onKey);
      window.removeEventListener('resize', onSize);
    };
  }, [step, jump]);

  const skipIntro = () => {
    const t = timers.current;
    clearInterval(t.iv);
    clearTimeout(t.hold);
    setCur(LAST);
    setIntro({ phase: 'out', year: 2026, p: 1 });
    t.out = setTimeout(() => setIntro((i) => ({ ...i, phase: 'done' })), 640);
  };

  const done = intro.phase === 'done';
  const st = JOURNEY[cur];
  const curStep = stepIdx !== null && st.steps[stepIdx] ? st.steps[stepIdx] : null;
  const stepSuffix = curStep ? '-s' + stepIdx : '';
  const panelRight = 30 + Math.min(0.32 * vw, 430);
  const leftBound = panelRight + 24;
  const rightBound = vw - 32 - 210 - 16; // Rail (210px) + Abstand
  const availW = Math.max(200, rightBound - leftBound);
  const stageScale = Math.min(1, availW / 600);
  const cardLeft = Math.round(leftBound + availW / 2);
  const swapAnim = rm
    ? 'none'
    : swap === 'out'
      ? 'ldtSwapOut 0.2s cubic-bezier(0.4,0,0.7,0.2) both'
      : 'ldtSwapIn 0.5s cubic-bezier(0.2,0.7,0.2,1) both';
  const embeddedNarrow = vw < 1020;
  // Einblicke: pro Zwischenschritt (Slot-IDs des Prototyps) oder die der Station aus LD Flow.
  const mini1 = (curStep && JOURNEY_MEDIA[`ld-mini-${st.year}${stepSuffix}-1`]) || st.insights?.[0] || undefined;
  const mini2 = (curStep && JOURNEY_MEDIA[`ld-mini-${st.year}${stepSuffix}-2`]) || st.insights?.[1] || undefined;

  return (
    <div
      data-screen-label="Reise"
      style={{ position: 'relative', left: '50%', transform: 'translateX(-50%)', width: '100vw', height: '100vh', overflow: 'hidden' }}
    >
      <div
        id="ldt-stage"
        ref={stage}
        data-screen-label="LD Timeline"
        style={{
          position: 'relative',
          width: '100vw',
          height: '100vh',
          minHeight: 'min(640px,100dvh)',
          overflow: 'hidden',
          background: 'var(--tbg)',
          color: 'var(--tink)',
          fontFamily: 'var(--ld-font-sans),sans-serif',
        }}
      >
        <div
          aria-hidden
          style={{
            ...fill,
            background:
              'radial-gradient(70% 60% at 62% 28%,var(--tfx1) 0%,transparent 60%),radial-gradient(50% 40% at 60% 0%,rgba(255,178,36,0.08),transparent 70%),radial-gradient(80% 55% at 50% 105%,var(--tfx2) 20%,transparent 70%)',
          }}
        />
        <div
          aria-hidden
          style={{
            position: 'absolute',
            top: '-20%',
            left: '-20%',
            width: '140%',
            height: '140%',
            opacity: 'var(--tstars)' as unknown as number,
            backgroundImage:
              'radial-gradient(1.5px 1.5px at 20px 30px,rgba(255,255,255,0.55),transparent 60%),radial-gradient(1px 1px at 140px 90px,rgba(255,255,255,0.4),transparent 60%),radial-gradient(1.2px 1.2px at 260px 200px,rgba(255,178,36,0.5),transparent 60%),radial-gradient(1px 1px at 320px 140px,rgba(255,255,255,0.3),transparent 60%)',
            backgroundSize: '360px 360px',
            animation: rm ? 'none' : 'ldtDriftA 90s linear infinite alternate',
          }}
        />
        <div
          aria-hidden
          style={{
            position: 'absolute',
            top: '-20%',
            left: '-20%',
            width: '140%',
            height: '140%',
            opacity: 'var(--tstars2)' as unknown as number,
            backgroundImage:
              'radial-gradient(1px 1px at 60px 320px,rgba(255,255,255,0.45),transparent 60%),radial-gradient(1.4px 1.4px at 380px 120px,rgba(255,255,255,0.35),transparent 60%),radial-gradient(1px 1px at 220px 460px,rgba(255,178,36,0.4),transparent 60%)',
            backgroundSize: '520px 520px',
            animation: rm ? 'none' : 'ldtDriftB 120s linear infinite alternate',
          }}
        />
        <div
          aria-hidden
          style={{
            position: 'absolute',
            left: '62%',
            top: '47%',
            width: 840,
            height: 560,
            transform: 'translate(-50%,-50%)',
            background: 'radial-gradient(50% 50% at 50% 50%,rgba(255,178,36,0.22),transparent 70%)',
            filter: 'blur(30px)',
            pointerEvents: 'none',
          }}
        />
        <div
          aria-hidden
          style={{ ...fill, background: 'radial-gradient(120% 100% at 62% 45%,transparent 52%,var(--tdim))', pointerEvents: 'none' }}
        />
        <div
          aria-hidden
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            height: 130,
            background: 'linear-gradient(180deg,var(--tscrimtop),transparent)',
            pointerEvents: 'none',
            zIndex: 20,
          }}
        />
        <div
          aria-hidden
          style={{
            position: 'absolute',
            bottom: 0,
            left: 0,
            right: 0,
            height: 250,
            background: 'linear-gradient(0deg,var(--tscrimbot),transparent)',
            pointerEvents: 'none',
            zIndex: 20,
          }}
        />

        {/* Karten-Bühne */}
        <div
          style={{
            ...fill,
            perspective: 1500,
            perspectiveOrigin: '62% 42%',
            zIndex: 10,
            transform: stageScale < 0.999 ? `scale(${stageScale.toFixed(3)})` : 'none',
            transformOrigin: `${cardLeft}px 46%`,
          }}
        >
          {JOURNEY.map((c, i) => {
            const d = i - cur;
            const k = Math.abs(d);
            let tf: string, op: number, blur: number, pe: 'auto' | 'none', cursor: string;
            if (d === 0) {
              tf = 'translate3d(0,0,0) scale(1)';
              op = 1;
              blur = 0;
              pe = 'auto';
              cursor = 'pointer';
            } else if (d < 0) {
              tf = `translate3d(${-16 * k}px,${-34 * k}px,${-k * GAP}px) scale(${Math.max(0.58, 1 - 0.055 * k).toFixed(3)}) rotateX(${Math.min(7, 1.4 * k).toFixed(2)}deg)`;
              op = Math.max(0, 1 - 0.13 * k);
              blur = Math.min(6, 0.75 * k);
              pe = op > 0.02 ? 'auto' : 'none';
              cursor = 'pointer';
            } else {
              tf = `translate3d(${24 * k}px,${44 * k}px,${k * (GAP + 90)}px) scale(${(1 + 0.14 * k).toFixed(3)})`;
              op = 0;
              blur = Math.min(10, 3 * k);
              pe = 'none';
              cursor = 'default';
            }
            const shot = c.shot;
            return (
              <div
                key={c.year}
                aria-hidden={d !== 0}
                onClick={() => {
                  if (live.current.intro.phase !== 'done') return;
                  if (i !== live.current.cur) jump(i);
                }}
                style={{
                  position: 'absolute',
                  left: cardLeft,
                  top: '46%',
                  width: 582,
                  height: 376,
                  marginLeft: -291,
                  marginTop: -188,
                  zIndex: 100 - k,
                  transform: tf,
                  opacity: op,
                  filter: blur > 0.01 ? `blur(${blur.toFixed(2)}px)` : 'none',
                  pointerEvents: pe,
                  cursor,
                  transition: rm ? 'none' : 'transform 0.72s cubic-bezier(0.2,0.72,0.16,1), opacity 0.6s ease, filter 0.6s ease',
                  borderRadius: 20,
                  background: 'linear-gradient(180deg,var(--tcardg1),var(--tcardg2)),var(--tcard)',
                  border: '1px solid var(--thair)',
                  boxShadow: '0 0 0 1px color-mix(in srgb,#FFB224 12%,transparent),0 18px 40px -12px var(--tshadow)',
                }}
              >
                {d === 0 && (
                  <div
                    style={{
                      position: 'absolute',
                      top: -1,
                      left: -1,
                      right: -1,
                      bottom: -1,
                      borderRadius: 21,
                      boxShadow:
                        '0 0 0 1px color-mix(in srgb,#FFB224 55%,transparent),0 0 60px -4px color-mix(in srgb,#FFB224 45%,transparent)',
                      pointerEvents: 'none',
                    }}
                  />
                )}
                <div
                  style={{
                    position: 'relative',
                    height: 172,
                    borderRadius: '20px 20px 0 0',
                    overflow: 'hidden',
                    background: 'var(--tshot)',
                  }}
                >
                  {shot && (
                    <img
                      src={shot.src}
                      alt={shot.alt}
                      style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', objectFit: 'cover' }}
                    />
                  )}
                  <div
                    style={{
                      ...fill,
                      background: 'linear-gradient(180deg,rgba(10,14,22,0.15),transparent 40%,rgba(10,14,22,0.55))',
                      pointerEvents: 'none',
                    }}
                  />
                  <span
                    style={{
                      position: 'absolute',
                      top: 10,
                      left: 12,
                      fontFamily: mono,
                      fontSize: 9,
                      letterSpacing: '0.1em',
                      textTransform: 'uppercase',
                      color: '#FFB224',
                      background: 'rgba(10,14,22,0.5)',
                      border: '1px solid color-mix(in srgb,#FFB224 42%,transparent)',
                      borderRadius: 999,
                      padding: '4px 9px',
                      backdropFilter: 'blur(6px)',
                    }}
                  >
                    {c.role}
                  </span>
                  <span
                    style={{
                      position: 'absolute',
                      bottom: 8,
                      left: 12,
                      fontFamily: mono,
                      fontSize: 9.5,
                      color: 'rgba(242,245,250,0.85)',
                      textShadow: '0 1px 6px rgba(0,0,0,0.7)',
                    }}
                  >
                    {c.caption}
                  </span>
                </div>
                <div style={{ padding: '15px 20px 17px' }}>
                  <div
                    style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'baseline',
                      fontFamily: mono,
                      fontSize: 9.5,
                      letterSpacing: '0.12em',
                    }}
                  >
                    <span style={{ color: '#FFB224' }}>{c.year}</span>
                    <span style={{ color: 'var(--tsoft)' }}>STATION {String(i + 1).padStart(2, '0')}</span>
                  </div>
                  <div style={{ fontSize: 22, fontWeight: 700, letterSpacing: '-0.025em', lineHeight: 1.12, marginTop: 6 }}>{c.title}</div>
                  <div
                    style={{
                      fontSize: 13.5,
                      lineHeight: 1.55,
                      color: 'var(--tmut)',
                      marginTop: 6,
                      display: '-webkit-box',
                      WebkitLineClamp: 2,
                      WebkitBoxOrient: 'vertical',
                      overflow: 'hidden',
                    }}
                  >
                    {c.blurb}
                  </div>
                  <div
                    style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'baseline',
                      gap: 12,
                      marginTop: 10,
                      paddingTop: 10,
                      borderTop: '1px solid var(--thair)',
                    }}
                  >
                    <span style={{ display: 'flex', alignItems: 'baseline', gap: 7 }}>
                      <span style={{ fontFamily: mono, fontWeight: 700, fontSize: 13, color: '#FFB224' }}>{c.metric}</span>
                      <span style={{ fontSize: 11, color: 'var(--tsoft)' }}>{c.metricLabel}</span>
                    </span>
                    <span style={{ fontFamily: mono, fontSize: 10, color: 'var(--tsoft)' }}>{c.partner}</span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Jahres-Rail rechts */}
        <nav
          data-ldt-rail="1"
          aria-label="Stationen"
          onWheel={(e) => e.stopPropagation()}
          style={{
            position: 'absolute',
            right: 32,
            top: 92,
            bottom: embeddedNarrow ? 110 : 36,
            zIndex: 60,
            width: 210,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'flex-end',
            gap: 10,
            overflowY: 'auto',
            overflowX: 'hidden',
            scrollbarWidth: 'none',
            WebkitOverflowScrolling: 'touch',
            overscrollBehavior: 'contain',
            paddingBottom: 4,
          }}
        >
          <div style={{ display: 'flex', gap: 8, flex: 'none', marginBottom: 6 }}>
            <button
              type="button"
              onClick={() => step(-1)}
              aria-label="Frühere Station"
              disabled={cur === 0}
              className="ldt-btn"
              style={{ ...roundBtn, opacity: cur === 0 ? 0.4 : 1, pointerEvents: cur === 0 ? 'none' : 'auto' }}
            >
              ↓
            </button>
            <button
              type="button"
              onClick={() => step(1)}
              aria-label="Spätere Station"
              disabled={cur === LAST}
              className="ldt-btn"
              style={{ ...roundBtn, opacity: cur === LAST ? 0.4 : 1, pointerEvents: cur === LAST ? 'none' : 'auto' }}
            >
              ↑
            </button>
          </div>
          <span style={railLabel}>Heute</span>
          {JOURNEY.map((y, i) => ({ y, i }))
            .reverse()
            .map(({ y, i }) => {
              const on = i === cur;
              return (
                <span key={y.year} style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 3, maxWidth: '100%' }}>
                  <button
                    type="button"
                    aria-current={on ? 'step' : undefined}
                    onClick={() => {
                      if (live.current.intro.phase === 'done') jump(i);
                    }}
                    className="ldt-year"
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: 8,
                      padding: '3px 0',
                      opacity: on ? 1 : 0.55,
                      transition: 'opacity 0.3s',
                    }}
                  >
                    <span style={{ fontFamily: mono, fontSize: 12, color: on ? '#FFB224' : 'var(--tsoft)', transition: 'color 0.3s' }}>
                      {y.year}
                    </span>
                    <span
                      style={{
                        width: on ? 34 : 15,
                        height: 2,
                        borderRadius: 2,
                        background: on ? '#FFB224' : 'var(--tbtnhov)',
                        transition: 'width 0.3s,background 0.3s',
                      }}
                    />
                    <span
                      style={{
                        display: on ? 'inline-block' : 'none',
                        width: 9,
                        height: 9,
                        borderRadius: '50%',
                        background: '#FFB224',
                        boxShadow: '0 0 0 4px rgba(255,178,36,0.22),0 0 14px #FFB224',
                      }}
                    />
                  </button>
                  {on &&
                    y.steps.map((zs, k) => {
                      const sel = stepIdx === k;
                      return (
                        <button
                          key={k}
                          type="button"
                          aria-pressed={sel}
                          onClick={() => {
                            if (live.current.intro.phase === 'done') setStepIdx((s) => (s === k ? null : k));
                          }}
                          className="ldt-step"
                          style={{
                            display: 'flex',
                            alignItems: 'flex-start',
                            gap: 7,
                            maxWidth: '100%',
                            padding: '3px 0',
                            textAlign: 'right',
                            opacity: sel ? 1 : 0.78,
                            transition: 'opacity 0.25s',
                          }}
                        >
                          <span style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 2, minWidth: 0 }}>
                            <span
                              style={{
                                fontSize: 11,
                                lineHeight: 1.3,
                                fontWeight: sel ? 700 : 500,
                                color: sel ? '#FFB224' : 'var(--tink)',
                                display: '-webkit-box',
                                WebkitLineClamp: 2,
                                WebkitBoxOrient: 'vertical',
                                overflow: 'hidden',
                                transition: 'color 0.25s',
                              }}
                            >
                              {zs.t}
                            </span>
                            <span style={{ fontFamily: mono, fontSize: 8.5, color: 'var(--tsoft)', whiteSpace: 'nowrap' }}>{zs.d}</span>
                          </span>
                          <span
                            style={{
                              width: sel ? 8 : 5,
                              height: sel ? 8 : 5,
                              borderRadius: '50%',
                              background: sel ? '#FFB224' : 'var(--tsoft)',
                              boxShadow: sel ? '0 0 0 3px rgba(255,178,36,0.22),0 0 10px #FFB224' : 'none',
                              flex: 'none',
                              marginTop: sel ? 3 : 5,
                            }}
                          />
                        </button>
                      );
                    })}
                </span>
              );
            })}
          <span style={railLabel}>Start</span>
        </nav>

        {/* Info-Panel links */}
        <section
          id="ldt-panel"
          aria-label={`Station ${st.year}`}
          style={{
            position: 'absolute',
            left: 30,
            top: 92,
            bottom: 210,
            width: 'min(32vw,430px)',
            boxSizing: 'border-box',
            zIndex: 55,
            overflowY: 'auto',
            WebkitOverflowScrolling: 'touch',
            overscrollBehavior: 'contain',
            borderRadius: 20,
            background: 'linear-gradient(180deg,var(--tcardg1),var(--tcardg2)),var(--tpanelbg)',
            border: '1px solid var(--thair)',
            boxShadow: '0 0 0 1px color-mix(in srgb,#FFB224 12%,transparent),0 18px 40px -12px var(--tshadow)',
            padding: '20px 24px 22px',
            backdropFilter: 'blur(14px)',
          }}
        >
          <div key={swapKey} style={{ animation: swapAnim }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, fontFamily: mono, fontSize: 10, letterSpacing: '0.14em' }}>
              <span style={{ color: '#FFB224' }}>{st.year}</span>
              <span style={{ width: 16, height: 1, background: 'var(--tbtnbrd)' }} />
              <span style={{ color: 'var(--tsoft)', textTransform: 'uppercase' }}>{st.role}</span>
            </div>
            {curStep && (
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 10,
                  marginTop: 12,
                  padding: '10px 12px',
                  borderRadius: 12,
                  background: 'var(--tbtn)',
                  border: '1px solid var(--thair)',
                  animation: rm ? 'none' : 'ldtPanelIn 0.42s cubic-bezier(0.2,0.7,0.2,1)',
                }}
              >
                <span
                  style={{
                    width: 8,
                    height: 8,
                    borderRadius: '50%',
                    background: '#FFB224',
                    boxShadow: '0 0 10px rgba(255,178,36,0.6)',
                    flex: 'none',
                  }}
                />
                <span style={{ fontFamily: mono, fontSize: 9.5, color: '#FFB224', whiteSpace: 'nowrap' }}>{curStep.d}</span>
                <span style={{ fontSize: 13, fontWeight: 700, color: 'var(--tink)', lineHeight: 1.3 }}>{curStep.t}</span>
              </div>
            )}
            <div style={{ display: 'flex', gap: 20, marginTop: 14, alignItems: 'flex-start' }}>
              <span style={{ display: 'flex', flexDirection: 'column', gap: 6, flex: 'none' }}>
                <span style={{ fontFamily: mono, fontWeight: 700, fontSize: 40, lineHeight: 0.9, color: '#FFB224' }}>{st.metric}</span>
                <span
                  style={{
                    fontFamily: mono,
                    fontSize: 9,
                    letterSpacing: '0.1em',
                    textTransform: 'uppercase',
                    color: 'var(--tsoft)',
                    maxWidth: 118,
                  }}
                >
                  {st.metricLabel}
                </span>
              </span>
              <p style={{ margin: 0, fontSize: 14.5, lineHeight: 1.62, color: 'var(--tmut)' }}>{st.story}</p>
            </div>
            <div style={{ marginTop: 15, paddingTop: 14, borderTop: '1px solid var(--thair)' }}>
              <div style={sectionLabel}>Tech-Stack dieser Station</div>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gridTemplateRows: 'repeat(3,42px)', gap: 7 }}>
                {st.stack.slice(0, 5).map((name, j) => {
                  const p = BENTO[j] ?? BENTO[4];
                  const lead = j === 0;
                  return (
                    <div
                      key={name}
                      style={{
                        gridColumn: p.col,
                        gridRow: p.row,
                        display: 'flex',
                        flexDirection: 'column',
                        justifyContent: lead ? 'flex-end' : 'center',
                        gap: 4,
                        borderRadius: 12,
                        background: lead ? 'linear-gradient(150deg,rgba(255,178,36,0.92),rgba(255,122,47,0.82))' : 'var(--tbtn)',
                        border: `1px solid ${lead ? 'transparent' : 'var(--thair)'}`,
                        padding: lead ? '11px 13px' : '9px 12px',
                        overflow: 'hidden',
                      }}
                    >
                      {lead && (
                        <span
                          style={{
                            fontFamily: mono,
                            fontSize: 8,
                            letterSpacing: '0.14em',
                            textTransform: 'uppercase',
                            color: 'rgba(36,20,0,0.62)',
                          }}
                        >
                          Kern-Stack
                        </span>
                      )}
                      <span
                        style={{
                          fontSize: lead ? 17 : 12,
                          fontWeight: lead ? 800 : 600,
                          color: lead ? '#241400' : 'var(--tink)',
                          letterSpacing: '-0.01em',
                          lineHeight: 1.1,
                        }}
                      >
                        {name}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>
            <div style={{ marginTop: 15, paddingTop: 14, borderTop: '1px solid var(--thair)' }}>
              <div style={sectionLabel}>Einblicke</div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
                <MiniSlot media={mini1} label="Bild/Video 1" />
                <MiniSlot media={mini2} label="Bild/Video 2" />
              </div>
            </div>
          </div>
        </section>

        {/* Titelblock unten links */}
        <div
          key={`t${swapKey}`}
          style={{
            position: 'absolute',
            left: 40,
            bottom: 36,
            maxWidth: 'min(48vw,540px)',
            zIndex: 40,
            display: 'flex',
            flexDirection: 'column',
            gap: 11,
            animation: swapAnim,
          }}
        >
          <div style={{ display: 'flex', alignItems: 'baseline', gap: 12, fontFamily: mono }}>
            <span style={{ fontSize: 11, letterSpacing: '0.18em', textTransform: 'uppercase', color: '#FFB224' }}>
              STATION {String(cur + 1).padStart(2, '0')} / {JOURNEY.length}
            </span>
            <span style={{ fontSize: 11, color: 'var(--tsoft)' }}>
              {st.role} · {st.partner}
            </span>
          </div>
          <h1
            style={{
              fontSize: 30,
              fontWeight: 700,
              lineHeight: 1.08,
              letterSpacing: '-0.03em',
              maxWidth: '17ch',
              minHeight: 66,
              display: 'flex',
              alignItems: 'flex-end',
              margin: 0,
            }}
          >
            {st.title}
          </h1>
          <div style={{ display: 'flex', alignItems: 'center', gap: 9, flexWrap: 'wrap' }}>
            <a
              href="https://loona-designs.de"
              target="_blank"
              rel="noopener noreferrer"
              className="ldt-cta"
              style={{
                background: 'var(--tcta)',
                color: 'var(--tctatx)',
                borderRadius: 999,
                padding: '11px 20px',
                fontSize: 13,
                fontWeight: 700,
                cursor: 'pointer',
                textDecoration: 'none',
              }}
            >
              Projekt starten →
            </a>
          </div>
        </div>

        {!coarse && !embeddedNarrow && (
          <div
            aria-hidden
            style={{
              position: 'absolute',
              bottom: 12,
              left: '50%',
              transform: 'translateX(-50%)',
              zIndex: 40,
              fontFamily: mono,
              fontSize: 10,
              letterSpacing: '0.08em',
              color: 'var(--tsoft)',
              whiteSpace: 'nowrap',
              animation: rm ? 'none' : 'ldtFloat 4s ease-in-out infinite',
            }}
          >
            ↕ SCROLLEN · ← → PFEILTASTEN · EBENE WÄHLEN
          </div>
        )}

        {!done && (
          <div
            style={{
              ...fill,
              zIndex: 200,
              background: 'radial-gradient(130% 100% at 62% 44%,var(--tintro1),var(--tintro2))',
              backdropFilter: 'blur(22px) saturate(1.05)',
              opacity: intro.phase === 'out' ? 0 : 1,
              transition: 'opacity 0.7s ease',
            }}
          >
            <div
              style={{
                position: 'absolute',
                left: '50%',
                top: '43%',
                transform: 'translate(-50%,-50%)',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                gap: 26,
                textAlign: 'center',
                width: 'min(92vw,620px)',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
                <span
                  style={{
                    width: 52,
                    height: 52,
                    borderRadius: 16,
                    display: 'inline-flex',
                    animation: rm ? 'none' : 'ldtBreath 2.4s ease-in-out infinite',
                  }}
                >
                  <LoonaTile product="ld" variant="color" size={52} decorative style={{ display: 'block' }} />
                </span>
                <span style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start', gap: 3 }}>
                  <span style={{ fontSize: 20, fontWeight: 700 }}>Loona! Designs</span>
                  <span style={{ fontFamily: mono, fontSize: 9.5, letterSpacing: '0.18em', color: 'var(--tsoft)' }}>
                    /// THE WEB. MY PASSION
                  </span>
                </span>
              </div>
              <div
                aria-live="off"
                style={{
                  fontSize: 'clamp(96px,15vw,196px)',
                  fontWeight: 800,
                  lineHeight: 0.9,
                  letterSpacing: '-0.05em',
                  fontVariantNumeric: 'tabular-nums',
                  textShadow: '0 0 70px rgba(255,178,36,0.4)',
                }}
              >
                {intro.year}
              </div>
              <div
                style={{ fontSize: 'clamp(15px,1.6vw,19px)', lineHeight: 1.55, color: 'var(--tmut)', maxWidth: '36ch', textWrap: 'pretty' }}
              >
                Eine Reise durch 18 Jahre im Web — vom ersten &lt;div&gt; bis heute.
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 12, width: 'min(80vw,340px)' }}>
                <span style={{ fontFamily: mono, fontSize: 11, color: 'var(--tsoft)' }}>2004</span>
                <span style={{ flex: 1, height: 3, borderRadius: 999, background: 'var(--tbtn)', overflow: 'hidden' }}>
                  <span
                    style={{
                      display: 'block',
                      height: '100%',
                      width: `${Math.round(intro.p * 100)}%`,
                      borderRadius: 999,
                      background: 'linear-gradient(90deg,#FF7A2F,#FFB224)',
                      boxShadow: '0 0 12px rgba(255,178,36,0.7)',
                    }}
                  />
                </span>
                <span style={{ fontFamily: mono, fontSize: 11, color: 'var(--tsoft)' }}>2026</span>
              </div>
            </div>
            <button
              type="button"
              onClick={skipIntro}
              className="ldt-skip"
              style={{
                position: 'absolute',
                bottom: 28,
                right: 32,
                background: 'var(--tbtn)',
                border: '1px solid var(--tbtnbrd)',
                borderRadius: 999,
                padding: '10px 18px',
                fontSize: 13,
                fontWeight: 600,
                backdropFilter: 'blur(10px)',
              }}
            >
              Überspringen →
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

const fill: CSSProperties = { position: 'absolute', top: 0, left: 0, right: 0, bottom: 0 };
const roundBtn: CSSProperties = {
  width: 44,
  height: 44,
  display: 'inline-flex',
  alignItems: 'center',
  justifyContent: 'center',
  borderRadius: 999,
  background: 'var(--tbtn)',
  border: '1px solid var(--tbtnbrd)',
  backdropFilter: 'blur(10px)',
  fontSize: 17,
  transition: 'opacity 0.25s',
};
const railLabel: CSSProperties = {
  fontFamily: mono,
  fontSize: 8.5,
  letterSpacing: '0.16em',
  textTransform: 'uppercase',
  color: 'var(--tsoft)',
};
const sectionLabel: CSSProperties = {
  fontFamily: mono,
  fontSize: 9,
  letterSpacing: '0.14em',
  textTransform: 'uppercase',
  color: 'var(--tsoft)',
  marginBottom: 9,
};

function MiniSlot({ media, label }: { media?: { src: string; alt: string; video?: boolean }; label: string }) {
  return (
    <div
      style={{
        position: 'relative',
        height: 96,
        borderRadius: 12,
        overflow: 'hidden',
        background: 'var(--tshot)',
        border: '1px solid var(--thair)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
      }}
    >
      {media ? (
        media.video ? (
          <video src={media.src} aria-label={media.alt} muted loop playsInline autoPlay style={mediaFill} />
        ) : (
          <img src={media.src} alt={media.alt} style={mediaFill} />
        )
      ) : (
        <span style={{ fontFamily: mono, fontSize: 9, letterSpacing: '0.12em', color: 'var(--tsoft)' }}>{label.toUpperCase()}</span>
      )}
    </div>
  );
}

const mediaFill: CSSProperties = { position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', objectFit: 'cover' };
