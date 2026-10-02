'use client';

import { useCallback, useEffect, useLayoutEffect, useRef, useState, type CSSProperties } from 'react';
import { JOURNEY_MEDIA } from '@content/journeyMedia';
import { LoonaTile } from '@/components/brand';
import { useContent } from '../content/ContentProvider';
import { useSite } from '../settings/SiteProvider';
import { mediaSrcSet } from '@/cms/media';
import { useT } from '../i18n/LocaleProvider';

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
  const { settings, hydrated, sideActive, mob, isMobile } = useSite();
  const JOURNEY = useContent().journey;
  const t = useT();
  const LAST = JOURNEY.length - 1;
  const rm = !settings.anim; // reduceMotion = Animationen aus (Prototyp: reiseReduce)
  // Neu (nicht im Prototyp): Einstellung „Reise: Bild-Hintergrund“ — unscharfes Kapitelbild hinter der Bühne,
  // Infofeld, Rail und Knöpfe dann als Liquid Glass (Tokens --tgl* in site.css, Kontrast ≥ 4,5:1 auch über Weiß/Schwarz).
  const bgOn = settings.reiseBg;
  const glass = bgOn ? liquidGlass : undefined;
  const [cur, setCur] = useState(rm ? LAST : 0);
  const [stepIdx, setStepIdx] = useState<number | null>(null);
  const [intro, setIntro] = useState<{ phase: IntroPhase; year: number; p: number }>(
    rm ? { phase: 'done', year: 2026, p: 1 } : { phase: 'run', year: 2004, p: 0 },
  );
  const [swap, setSwap] = useState<'in' | 'out'>('in');
  const [swapKey, setSwapKey] = useState(0);
  const [vw, setVw] = useState(1280);
  // Widescreen-Modus (Seitenleiste links, Inhalt nach rechts verschoben): Bühne trotzdem über die volle Fensterbreite,
  // dazu der Abstand vom Fensterrand bis zum Inhaltsbereich — gemessen an einem Fühler vor der Bühne.
  const [shiftX, setShiftX] = useState(0);
  const probe = useRef<HTMLDivElement>(null);
  const [coarse, setCoarse] = useState(false);
  const stage = useRef<HTMLDivElement>(null);
  const timers = useRef<{
    iv?: ReturnType<typeof setInterval>;
    hold?: ReturnType<typeof setTimeout>;
    out?: ReturnType<typeof setTimeout>;
    swap?: ReturnType<typeof setTimeout>;
  }>({});
  const live = useRef({ cur, intro, rm, mob });
  useLayoutEffect(() => {
    live.current = { cur, intro, rm, mob };
  });
  const lastWheel = useRef(0);
  const touchX = useRef<number | null>(null);
  const chips = useRef<HTMLElement>(null);
  // Mobil: aktive Station in der Chip-Leiste sichtbar halten (nur waagerecht scrollen, nie die Seite).
  useEffect(() => {
    const nav = chips.current;
    const el = nav?.querySelector<HTMLElement>('[aria-current="step"]');
    if (!nav || !el) return;
    nav.scrollTo({ left: el.offsetLeft - nav.clientWidth / 2 + el.clientWidth / 2, behavior: rm ? 'auto' : 'smooth' });
  }, [cur, mob, rm]);

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
  }, [hydrated, LAST]);

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

  const step = useCallback((dir: number) => goStation(Math.max(0, Math.min(LAST, live.current.cur + dir))), [goStation, LAST]);

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
      setShiftX(Math.round(probe.current?.getBoundingClientRect().left ?? 0));
    };
    onSize();
    // Der Seiten-Container ändert seine Breite animiert (0,4 s) — danach noch einmal messen.
    const late = setTimeout(onSize, 450);
    const onWheel = (e: WheelEvent) => {
      if (mq.matches || live.current.mob) return; // Mobil (auch simuliert): normal scrollen
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
      // Fokus im scrollbaren Infofeld (kleine Bildschirme): Hoch/Runter/Bild scrollen dort, Links/Rechts wechseln weiter.
      const panel = tgt?.closest?.('#ldt-panel') as HTMLElement | null;
      if (panel && panel.scrollHeight > panel.clientHeight && ['ArrowDown', 'ArrowUp', 'PageDown', 'PageUp', 'Home', 'End'].includes(e.key))
        return;
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
      clearTimeout(late);
    };
  }, [step, jump, LAST, sideActive]);

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
  // Seitenleiste (Widescreen): links 18 + 224 px belegt, keine Leiste oben → Inhalte rücken nach rechts und nach oben.
  const sideW = sideActive ? 242 : 0;
  const padL = sideActive ? sideW + 20 : 30;
  const topY = sideActive ? 32 : 92;
  const panelW = Math.min(0.32 * (vw - sideW), 430);
  const panelRight = padL + panelW;
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
  const embeddedNarrow = vw - sideW < 1020 && !sideActive;
  // Einblicke: pro Zwischenschritt (LD Flow bzw. Slot-IDs des Prototyps), sonst die der Station.
  const mini1 = curStep?.images?.[0] || (curStep && JOURNEY_MEDIA[`ld-mini-${st.year}${stepSuffix}-1`]) || st.insights?.[0] || undefined;
  const mini2 = curStep?.images?.[1] || (curStep && JOURNEY_MEDIA[`ld-mini-${st.year}${stepSuffix}-2`]) || st.insights?.[1] || undefined;

  // Bausteine für Desktop (3D-Bühne + Infofeld) und die Mobil-Variante.
  const cardFace = (c: (typeof JOURNEY)[number], i: number) => {
    const shot = c.shot;
    return (
      <>
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
              srcSet={mediaSrcSet(shot.src)}
              sizes="600px"
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
      </>
    );
  };
  const panelBody = (
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
            ...(glass && innerGlass),
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
        <div style={sectionLabel}>{t('journey.stack')}</div>
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
                  ...(glass && !lead && innerGlass),
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
                    {t('journey.coreStack')}
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
        <div style={sectionLabel}>{t('journey.insights')}</div>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
          <MiniSlot media={mini1} label={t('journey.media1')} />
          <MiniSlot media={mini2} label={t('journey.media2')} />
        </div>
      </div>
    </div>
  );

  const bgLayers = (
    <div aria-hidden style={{ ...fill, overflow: 'hidden', pointerEvents: 'none' }}>
      {JOURNEY.map((c, i) => {
        const m = chapterBg(c);
        return (
          <div
            key={c.year}
            style={{
              ...fill,
              opacity: i === cur ? 1 : 0,
              transition: rm ? 'none' : 'opacity 0.9s ease',
              background: m ? undefined : fallbackBg(i),
            }}
          >
            {/* Nur Nachbarn laden; kleine Variante genügt, das Bild ist ohnehin stark unscharf. */}
            {m && Math.abs(i - cur) <= 1 && (
              <>
                <img src={m.src} srcSet={mediaSrcSet(m.src)} sizes="480px" alt="" className="ldt-bgimg" />
                <div style={{ ...fill, background: 'var(--tbgdim)' }} />
              </>
            )}
          </div>
        );
      })}
    </div>
  );
  const introOverlay = (
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
          left: `calc(50% + ${sideW / 2}px)`,
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
            <span style={{ fontFamily: mono, fontSize: 9.5, letterSpacing: '0.18em', color: 'var(--tsoft)' }}>/// THE WEB. MY PASSION</span>
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
          style={{
            fontSize: 'clamp(15px,1.6vw,19px)',
            lineHeight: 1.55,
            color: 'var(--tmut)',
            maxWidth: '36ch',
            textWrap: 'pretty',
          }}
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
          ...glass,
        }}
      >
        {t('journey.skip')}
      </button>
    </div>
  );

  // Mobil (echtes Telefon und simulierter Mobil-Modus): Übergangslösung bis zum eigenen Mobil-Design — der Prototyp
  // ist nur für Desktop gebaut (bei 390 px überlappen Infofeld, Rail und Karte). Gleiche Inhalte, untereinander:
  // Titel, Stationen als Chips, aktuelle Karte (wischen), Zwischenschritte, Infofeld. Die Seite scrollt normal.
  if (mob) {
    const introDone = done;
    return (
      <div data-screen-label="Reise" style={{ position: 'relative', margin: '0 -18px' }}>
        <div
          id="ldt-stage"
          ref={stage}
          className={bgOn ? 'ldt-bgon' : undefined}
          data-screen-label="LD Timeline"
          style={{
            position: 'relative',
            overflow: 'hidden',
            minHeight: '100dvh',
            boxSizing: 'border-box',
            padding: `${isMobile ? 96 : 84}px 18px 132px`,
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
                'radial-gradient(90% 40% at 50% 20%,var(--tfx1) 0%,transparent 70%),radial-gradient(70% 30% at 50% 0%,rgba(255,178,36,0.1),transparent 70%),radial-gradient(100% 40% at 50% 100%,var(--tfx2) 20%,transparent 70%)',
            }}
          />
          {bgOn && bgLayers}
          <div style={{ position: 'relative', zIndex: 1, display: 'flex', flexDirection: 'column', gap: 16 }}>
            <div key={`t${swapKey}`} style={{ animation: swapAnim }}>
              <div style={{ fontFamily: mono, fontSize: 10.5, letterSpacing: '0.16em', textTransform: 'uppercase', color: '#FFB224' }}>
                {t('journey.counter', { n: String(cur + 1).padStart(2, '0'), total: JOURNEY.length })}
              </div>
              <div style={{ fontFamily: mono, fontSize: 11, color: 'var(--tsoft)', marginTop: 4 }}>
                {st.role} · {st.partner}
              </div>
              <h1 style={{ fontSize: 28, fontWeight: 700, lineHeight: 1.1, letterSpacing: '-0.03em', margin: '8px 0 0' }}>{st.title}</h1>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <button
                type="button"
                onClick={() => step(-1)}
                aria-label={t('journey.earlier')}
                disabled={cur === 0}
                className="ldt-btn"
                style={{ ...roundBtn, ...glass, flex: 'none', opacity: cur === 0 ? 0.4 : 1 }}
              >
                ←
              </button>
              <nav
                ref={chips}
                aria-label={t('journey.stations')}
                style={{
                  position: 'relative',
                  display: 'flex',
                  gap: 6,
                  overflowX: 'auto',
                  scrollbarWidth: 'none',
                  flex: 1,
                  padding: '2px 0',
                }}
              >
                {JOURNEY.map((y, i) => {
                  const on = i === cur;
                  return (
                    <button
                      key={y.year}
                      type="button"
                      aria-current={on ? 'step' : undefined}
                      onClick={() => {
                        if (live.current.intro.phase === 'done') jump(i);
                      }}
                      className="ldt-year"
                      style={{
                        flex: 'none',
                        minHeight: 44,
                        padding: '0 12px',
                        borderRadius: 999,
                        fontFamily: mono,
                        fontSize: 12,
                        color: on ? '#241400' : 'var(--tink)',
                        background: on ? '#FFB224' : 'var(--tbtn)',
                        border: `1px solid ${on ? 'transparent' : 'var(--tbtnbrd)'}`,
                        fontWeight: on ? 700 : 500,
                      }}
                    >
                      {y.year}
                    </button>
                  );
                })}
              </nav>
              <button
                type="button"
                onClick={() => step(1)}
                aria-label={t('journey.later')}
                disabled={cur === LAST}
                className="ldt-btn"
                style={{ ...roundBtn, ...glass, flex: 'none', opacity: cur === LAST ? 0.4 : 1 }}
              >
                →
              </button>
            </div>

            {/* Karte: nach links/rechts wischen wechselt die Station */}
            <div
              key={`c${swapKey}`}
              onTouchStart={(e) => {
                touchX.current = e.touches[0]?.clientX ?? null;
              }}
              onTouchEnd={(e) => {
                const x0 = touchX.current;
                touchX.current = null;
                const x1 = e.changedTouches[0]?.clientX;
                if (x0 === null || x1 === undefined || Math.abs(x1 - x0) < 50) return;
                step(x1 < x0 ? 1 : -1);
              }}
              style={{
                position: 'relative',
                borderRadius: 20,
                background: 'linear-gradient(180deg,var(--tcardg1),var(--tcardg2)),var(--tcard)',
                border: '1px solid var(--thair)',
                boxShadow:
                  '0 0 0 1px color-mix(in srgb,#FFB224 55%,transparent),0 0 44px -6px color-mix(in srgb,#FFB224 40%,transparent),0 18px 40px -12px var(--tshadow)',
                animation: swapAnim,
              }}
            >
              {cardFace(st, cur)}
            </div>

            {st.steps.length > 0 && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                {st.steps.map((zs, k) => {
                  const sel = stepIdx === k;
                  return (
                    <button
                      key={k}
                      type="button"
                      aria-pressed={sel}
                      onClick={() => {
                        if (live.current.intro.phase === 'done') setStepIdx((x) => (x === k ? null : k));
                      }}
                      className="ldt-step"
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: 10,
                        minHeight: 44,
                        padding: '8px 12px',
                        borderRadius: 12,
                        textAlign: 'left',
                        background: 'var(--tbtn)',
                        border: `1px solid ${sel ? 'color-mix(in srgb,#FFB224 60%,transparent)' : 'var(--thair)'}`,
                        ...(glass && !sel && innerGlass),
                      }}
                    >
                      <span
                        style={{
                          width: 8,
                          height: 8,
                          borderRadius: '50%',
                          flex: 'none',
                          background: sel ? '#FFB224' : 'var(--tsoft)',
                          boxShadow: sel ? '0 0 10px rgba(255,178,36,0.6)' : 'none',
                        }}
                      />
                      <span style={{ fontSize: 13, fontWeight: sel ? 700 : 500, color: 'var(--tink)', flex: 1 }}>{zs.t}</span>
                      <span style={{ fontFamily: mono, fontSize: 10, color: 'var(--tsoft)', whiteSpace: 'nowrap' }}>{zs.d}</span>
                    </button>
                  );
                })}
              </div>
            )}

            <section
              aria-label={t('journey.station', { year: st.year })}
              style={{
                borderRadius: 20,
                background: 'linear-gradient(180deg,var(--tcardg1),var(--tcardg2)),var(--tpanelbg)',
                border: '1px solid var(--thair)',
                padding: '18px 18px 20px',
                ...glass,
              }}
            >
              {panelBody}
            </section>

            <a
              href="https://loona-designs.de"
              target="_blank"
              rel="noopener noreferrer"
              className="ldt-cta"
              style={{
                alignSelf: 'flex-start',
                background: 'var(--tcta)',
                color: 'var(--tctatx)',
                borderRadius: 999,
                padding: '12px 20px',
                fontSize: 14,
                fontWeight: 700,
                textDecoration: 'none',
              }}
            >
              {t('journey.cta')}
            </a>
          </div>

          {!introDone && (
            <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: '100dvh', zIndex: 200 }}>{introOverlay}</div>
          )}
        </div>
      </div>
    );
  }

  return (
    <>
      <div ref={probe} aria-hidden style={{ height: 0 }} />
      <div
        data-screen-label="Reise"
        style={{
          position: 'relative',
          ...(sideActive ? { left: -shiftX } : { left: '50%', transform: 'translateX(-50%)' }),
          width: '100vw',
          height: '100vh',
          overflow: 'hidden',
        }}
      >
        <div
          id="ldt-stage"
          ref={stage}
          className={bgOn ? 'ldt-bgon' : undefined}
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
          {bgOn && bgLayers}
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
                  {cardFace(c, i)}
                </div>
              );
            })}
          </div>

          {/* Jahres-Rail rechts */}
          <nav
            data-ldt-rail="1"
            aria-label={t('journey.stations')}
            onWheel={(e) => e.stopPropagation()}
            style={{
              position: 'absolute',
              right: 32,
              top: topY,
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
              // Mit Glas: Säule nur so hoch wie ihr Inhalt (scrollt weiterhin, wenn es eng wird).
              ...(glass && {
                ...glass,
                bottom: 'auto',
                maxHeight: `calc(100% - ${topY + (embeddedNarrow ? 110 : 36)}px)`,
                borderRadius: 22,
                padding: '12px 14px',
                boxSizing: 'border-box',
              }),
            }}
          >
            <div style={{ display: 'flex', gap: 8, flex: 'none', marginBottom: 6 }}>
              <button
                type="button"
                onClick={() => step(-1)}
                aria-label={t('journey.earlier')}
                disabled={cur === 0}
                className="ldt-btn"
                style={{ ...roundBtn, ...glass, opacity: cur === 0 ? 0.4 : 1, pointerEvents: cur === 0 ? 'none' : 'auto' }}
              >
                ↓
              </button>
              <button
                type="button"
                onClick={() => step(1)}
                aria-label={t('journey.later')}
                disabled={cur === LAST}
                className="ldt-btn"
                style={{ ...roundBtn, ...glass, opacity: cur === LAST ? 0.4 : 1, pointerEvents: cur === LAST ? 'none' : 'auto' }}
              >
                ↑
              </button>
            </div>
            <span style={railLabel}>{t('journey.today')}</span>
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
            <span style={railLabel}>{t('journey.start')}</span>
          </nav>

          {/* Info-Panel links */}
          {/* tabIndex 0: auf kleinen Bildschirmen scrollt das Panel — so ist es auch per Tastatur scrollbar (WCAG 2.1.1). */}
          <section
            id="ldt-panel"
            tabIndex={0}
            aria-label={t('journey.station', { year: st.year })}
            style={{
              position: 'absolute',
              left: padL,
              top: topY,
              bottom: 210,
              width: sideActive ? panelW : 'min(32vw,430px)',
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
              ...glass,
            }}
          >
            {panelBody}
          </section>

          {/* Titelblock unten links */}
          <div
            key={`t${swapKey}`}
            style={{
              position: 'absolute',
              left: padL + 10,
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
                {t('journey.counter', { n: String(cur + 1).padStart(2, '0'), total: JOURNEY.length })}
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
                  ...(glass && {
                    ...glass,
                    color: 'var(--tink)',
                    border: '1px solid color-mix(in srgb,#FFB224 60%,transparent)',
                    boxShadow: `${glass.boxShadow},0 0 24px -6px color-mix(in srgb,#FFB224 55%,transparent)`,
                  }),
                }}
              >
                {t('journey.cta')}
              </a>
            </div>
          </div>

          {!coarse && !embeddedNarrow && (
            <div
              aria-hidden
              style={{
                position: 'absolute',
                bottom: 12,
                left: `calc(50% + ${sideW / 2}px)`,
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
              {t('journey.hint')}
            </div>
          )}

          {!done && introOverlay}
        </div>
      </div>
    </>
  );
}

const fill: CSSProperties = { position: 'absolute', top: 0, left: 0, right: 0, bottom: 0 };

/** Liquid Glass der Reise (Option „Bild-Hintergrund“): Glanzstreif + Film über getönter, unscharfer Fläche. */
const liquidGlass: CSSProperties = {
  background:
    'linear-gradient(115deg,transparent 28%,var(--tglsheen) 40%,transparent 52%),linear-gradient(180deg,var(--tgl1),var(--tgl2)),var(--tgltint)',
  border: '1px solid var(--tglbrd)',
  backdropFilter: 'blur(26px) saturate(1.8) brightness(1.04)',
  WebkitBackdropFilter: 'blur(26px) saturate(1.8) brightness(1.04)',
  boxShadow:
    'inset 0 1.5px 1px var(--tglhi),inset 1px 0 1px var(--tglside),inset -1px 0 1px var(--tglside),inset 0 -10px 18px -12px rgba(0,0,0,0.35),0 18px 40px -12px var(--tshadow)',
};
/** Kacheln im Glas: nur Film + Lichtkante, kein zweiter Blur. */
const innerGlass: CSSProperties = {
  background: 'linear-gradient(180deg,var(--tglin1),var(--tglin2))',
  border: '1px solid var(--tglinbrd)',
  boxShadow: 'inset 0 1px 1px var(--tglhi)',
};

/** Hintergrund eines Kapitels: eigenes Bild aus LD Flow, sonst Karten-Screenshot, sonst erstes Einblick-Bild. */
function chapterBg(c: { bg?: MediaRefLike; shot?: MediaRefLike; insights?: (MediaRefLike | null)[] }): MediaRefLike | null {
  const m = c.bg ?? c.shot ?? c.insights?.find((x) => !!x && !x.video) ?? null;
  return m && !m.video ? m : null;
}
type MediaRefLike = { src: string; alt?: string; video?: boolean };

/** Ohne Bild: Farbfeld je Station (Akzentfarben der Site, Lage wechselt) — keine Stock-Fotos. */
const BG_HUES = [38, 22, 215, 262, 172, 330];
function fallbackBg(i: number): string {
  const h = BG_HUES[i % BG_HUES.length];
  const h2 = BG_HUES[(i + 2) % BG_HUES.length];
  const x = 30 + ((i * 37) % 45);
  const y = 20 + ((i * 23) % 50);
  return `radial-gradient(65% 70% at ${x}% ${y}%,hsl(${h} 90% 55% / var(--tbga)),transparent 72%),radial-gradient(60% 65% at ${100 - x}% ${100 - y}%,hsl(${h2} 85% 55% / var(--tbga)),transparent 74%)`;
}
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
          <img src={media.src} srcSet={mediaSrcSet(media.src)} sizes="240px" alt={media.alt} style={mediaFill} />
        )
      ) : (
        // Abweichung vom Prototyp: --tmut statt --tsoft — --tsoft auf --tshot erreicht hell nur 4,14:1 (axe), --tmut ≥ 7:1.
        <span style={{ fontFamily: mono, fontSize: 9, letterSpacing: '0.12em', color: 'var(--tmut)' }}>{label.toUpperCase()}</span>
      )}
    </div>
  );
}

const mediaFill: CSSProperties = { position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', objectFit: 'cover' };
