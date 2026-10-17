'use client';

import { useEffect, useLayoutEffect, useRef, useState, type CSSProperties, type ReactNode } from 'react';
import { EText } from '../cms/editing';
import { mono } from '../cards/ProjectCard';
import { contrast, inkOn, over, readableAlpha } from '../lib/color';
import { useSite } from '../settings/SiteProvider';
import { useT } from '../i18n/LocaleProvider';
import type { MediaRef } from '@/cms/schema';
import { MockScreen, parseDisplayNumber, parseRows } from './MockScreen';
import { useInView, useMotionOk, useScrollVar } from './motion';
import { Reveal } from './Reveal';
import styles from './story.module.css';

/**
 * Bausteine der Story-Seiten (neu, nicht im Prototyp) — gerendert von den Widgets src/widgets/story-*.tsx.
 * Gestaltung: große Szenen-Karten mit 32 px Radius wie die Glas-Flächen der Site, Typo aus dem Site-System.
 * Kontrast: eigene Farbflächen setzen --ink/--muted/--soft/--accent lokal neu (toneVars), so bleiben auch
 * verschachtelte Widgets darin lesbar (≥ 4,5:1).
 */

const HEX = /^#[0-9a-fA-F]{6}$/;
export const okHex = (c?: string) => (c && HEX.test(c) ? c : undefined);
export const STORY_DEFAULT_COLOR = '#6D5AE6';

/** Schriftfarbe, die auf beiden Verlaufsenden besteht (die bessere der beiden Kandidaten). */
function inkOnBoth(a: string, b?: string) {
  if (!b) return inkOn(a);
  const w = Math.min(contrast(a, '#FFFFFF'), contrast(b, '#FFFFFF'));
  const d = Math.min(contrast(a, '#141210'), contrast(b, '#141210'));
  return w >= d ? '#FFFFFF' : '#141210';
}

/** Lokale Theme-Variablen für eine Farbfläche (Text, Nebentext, Linien, Karten, Akzent). */
export function toneVars(c1?: string, c2?: string): CSSProperties {
  const a = okHex(c1);
  if (!a) return {};
  const b = okHex(c2);
  const ink = inkOnBoth(a, b);
  // Nebentexte gegen das ungünstigere Verlaufsende rechnen
  const worst = b && contrast(b, ink) < contrast(a, ink) ? b : a;
  return {
    color: ink,
    '--ink': ink,
    '--muted': over(worst, ink, readableAlpha(worst, ink, 0.8)),
    '--soft': over(worst, ink, readableAlpha(worst, ink, 0.66)),
    '--hair': over(a, ink, 0.16),
    '--border': over(a, ink, 0.22),
    '--card': over(a, ink, 0.09),
    '--pill': over(a, ink, 0.12),
    '--accent': ink,
    '--on-accent': a,
  } as CSSProperties;
}

/** Volle Breite bis zum Bildschirm- bzw. Leistenrand (--bl/--br setzt SitePage je Ansicht). */
const bleed: CSSProperties = { marginLeft: 'calc(-1 * var(--bl, 32px))', marginRight: 'calc(-1 * var(--br, 32px))' };
/** Szenen-Breite: Inhalt (Spalte), Breit (bis 160 px je Seite mehr), Voll (randlos). */
const sceneWidth = (w: string): CSSProperties =>
  w === 'voll' ? bleed : w === 'breit' ? { marginLeft: 'calc(-1 * var(--wl, 0px))', marginRight: 'calc(-1 * var(--wr, 0px))' } : {};
export const kickerStyle: CSSProperties = {
  fontFamily: mono,
  fontSize: 11,
  letterSpacing: '0.18em',
  color: 'var(--accent)',
  textTransform: 'uppercase',
};

// ---------------------------------------------------------------------------------------------------------------
// Szene: Container mit Hintergrund, Höhe, Einblend-Effekt und optionalem Leuchten
// ---------------------------------------------------------------------------------------------------------------

export function StoryScene({
  c1,
  c2,
  bg,
  height,
  effect,
  glow,
  align,
  width = 'breit',
  kicker,
  title,
  text,
  path,
  children,
}: {
  c1?: string;
  c2?: string;
  bg: string;
  width?: string;
  height: string;
  effect: string;
  glow: boolean;
  align: string;
  kicker?: string;
  title?: string;
  text?: string;
  path: string;
  children: ReactNode;
}) {
  const { mob } = useSite();
  const motion = useMotionOk();
  const a = okHex(c1) ?? STORY_DEFAULT_COLOR;
  const b = okHex(c2) ?? over(a, '#000000', 0.45);
  const surface: CSSProperties =
    bg === 'farbe'
      ? { background: a, ...toneVars(a) }
      : bg === 'verlauf'
        ? { background: `linear-gradient(135deg, ${a}, ${b})`, ...toneVars(a, b) }
        : bg === 'dunkel'
          ? { background: '#0B0D12', ...toneVars('#0B0D12') }
          : bg === 'karte'
            ? { background: 'var(--card)', border: '1px solid var(--border)' }
            : {};
  const padded = bg !== 'keiner';
  const center = align === 'mitte';
  const head = (kicker || title || text) && (
    <div style={{ maxWidth: center ? 760 : 680, margin: center ? '0 auto' : 0, textAlign: center ? 'center' : 'left', marginBottom: 34 }}>
      {kicker !== undefined && kicker !== '' && (
        <div style={kickerStyle}>
          <EText path={`${path}.kicker`} value={kicker} />
        </div>
      )}
      {title && (
        <h2
          style={{
            fontSize: mob ? 32 : 'clamp(36px, 4.6vw, 64px)',
            fontWeight: 800,
            letterSpacing: '-0.035em',
            lineHeight: 1.02,
            margin: '12px 0 0',
            textWrap: 'balance',
          }}
        >
          <EText path={`${path}.title`} value={title} />
        </h2>
      )}
      {text && (
        <p style={{ fontSize: mob ? 16 : 19, lineHeight: 1.6, color: 'var(--muted)', margin: '16px 0 0', textWrap: 'pretty' }}>
          <EText path={`${path}.text`} value={text} multiline />
        </p>
      )}
    </div>
  );
  return (
    <Reveal effect={effect}>
      <section
        className={[styles.scene, motion ? styles.moving : ''].join(' ')}
        style={{
          ...surface,
          ...sceneWidth(width),
          padding: padded ? (mob ? '44px 20px' : 'clamp(48px, 7vw, 96px) clamp(28px, 6vw, 88px)') : '24px 0',
          minHeight: height === 'screen' ? 'min(100svh, 980px)' : undefined,
          display: 'flex',
          flexDirection: 'column',
          justifyContent: height === 'screen' ? 'center' : undefined,
          borderRadius: padded && width !== 'voll' ? 32 : 0,
        }}
      >
        {glow && padded && (
          <>
            <span aria-hidden className={styles.glow} style={{ ['--gc' as string]: over(a, '#ffffff', 0.35), top: '-20%', left: '-10%' }} />
            <span aria-hidden className={styles.glow} style={{ ['--gc' as string]: b, bottom: '-30%', right: '-15%' }} />
          </>
        )}
        {/* Inhalt bleibt lesbar breit, auch wenn die Fläche randlos ist */}
        <div style={{ width: '100%', maxWidth: 1480, margin: '0 auto' }}>
          {head}
          {children}
        </div>
      </section>
    </Reveal>
  );
}

// ---------------------------------------------------------------------------------------------------------------
// Hero: großer Auftakt mit Verlaufs-Schrift, Leuchten und Scroll-Hinweis; zieht sich beim Weiterscrollen zurück
// ---------------------------------------------------------------------------------------------------------------

export function StoryHero({
  kicker,
  title,
  title2,
  text,
  chips,
  c1,
  c2,
  c3,
  cue,
  layout = 'verlauf',
  device = 'desktop',
  screen,
  path,
}: {
  kicker?: string;
  title?: string;
  title2?: string;
  text?: string;
  chips?: string[];
  c1?: string;
  c2?: string;
  c3?: string;
  cue?: string;
  /** Stil des Auftakts: verlauf (Titel links, Verlaufszeile), zentriert, geraet (Text + Gerät), buehne (Farbfläche) */
  layout?: string;
  device?: string;
  screen?: ScreenData;
  path: string;
}) {
  const { mob, settings } = useSite();
  const motion = useMotionOk();
  const ref = useRef<HTMLElement>(null);
  useScrollVar(ref, motion, 'leave', 0);
  const g1 = okHex(c1) ?? STORY_DEFAULT_COLOR;
  const g2 = okHex(c2) ?? '#22D3EE';
  const g3 = okHex(c3) ?? '#F472B6';
  const center = layout === 'zentriert';
  const stage = layout === 'buehne';
  const withDevice = layout === 'geraet';
  return (
    <section
      ref={ref}
      className={motion ? styles.moving : undefined}
      style={{
        ...bleed,
        // Bühne: ganze Fläche in den Story-Farben, Schrift über toneVars kontrastsicher (≥ 4,5:1 auf beiden Enden)
        ...(stage ? { background: `linear-gradient(135deg, ${g1}, ${okHex(c2) ?? g1})`, ...toneVars(g1, okHex(c2)) } : null),
        textAlign: center ? 'center' : undefined,
        position: 'relative',
        isolation: 'isolate',
        overflow: 'hidden',
        minHeight: 'min(100svh, 1000px)',
        display: 'flex',
        alignItems: 'center',
        // Text bündig mit der Inhaltsspalte, Hintergrund/Leuchten bis an den Rand
        padding: mob ? (settings.mobModern ? '96px 22px 64px' : '130px 22px 72px') : '150px var(--br, 32px) 110px var(--bl, 32px)',
        boxSizing: 'border-box',
      }}
    >
      {/* Leuchten rechts — hinter dem (links stehenden) Text bliebe der Kontrast sonst im Light Mode nicht ≥ 4,5:1 */}
      {center ? (
        <span
          aria-hidden
          className={styles.glow}
          style={{ ['--gc' as string]: g1, top: '-30%', left: '20%', width: '60%', opacity: 0.3 }}
        />
      ) : stage ? (
        <span aria-hidden className={styles.glow} style={{ ['--gc' as string]: g3, top: '-30%', right: '-20%', opacity: 0.35 }} />
      ) : (
        <>
          <span aria-hidden className={styles.glow} style={{ ['--gc' as string]: g1, top: '-18%', right: '-14%', opacity: 0.42 }} />
          <span aria-hidden className={styles.glow} style={{ ['--gc' as string]: g2, bottom: '-34%', right: '12%', opacity: 0.32 }} />
        </>
      )}
      <div
        style={{
          position: 'relative',
          maxWidth: withDevice ? 1320 : 1176,
          margin: center ? '0 auto' : undefined,
          width: '100%',
          ...(withDevice && !mob
            ? { display: 'grid', gridTemplateColumns: 'minmax(0, 1fr) minmax(0, 1.15fr)', gap: 56, alignItems: 'center' }
            : null),
          transform: 'translateY(calc(var(--p, 0) * 140px)) scale(calc(1 - var(--p, 0) * 0.1))',
          opacity: 'calc(1 - var(--p, 0) * 1.2)',
          transformOrigin: '50% 30%',
          ['--g1' as string]: g1,
          ['--g2' as string]: g2,
          ['--g3' as string]: g3,
        }}
      >
        <div>
          {kicker && (
            <Reveal effect="fade">
              <div style={kickerStyle}>
                <EText path={`${path}.kicker`} value={kicker} />
              </div>
            </Reveal>
          )}
          <h1
            className={styles.heroTitle}
            style={{
              fontSize: mob
                ? 'clamp(44px, 13vw, 64px)'
                : withDevice
                  ? 'clamp(54px, 6vw, 96px)'
                  : stage
                    ? 'clamp(72px, 11vw, 168px)'
                    : 'clamp(64px, 9vw, 136px)',
              marginTop: 18,
            }}
          >
            <EText path={`${path}.title`} value={title} />
            {title2 && (
              <>
                <br />
                {/* Auf der Bühne ohne Verlaufsschrift — die Farbfläche ist schon der Verlauf */}
                <span className={stage ? undefined : styles.gradText} style={stage ? { opacity: 0.85 } : undefined}>
                  <EText path={`${path}.title2`} value={title2} />
                </span>
              </>
            )}
          </h1>
          {text && (
            <p
              style={{
                fontSize: mob ? 17 : 21,
                lineHeight: 1.55,
                color: 'var(--muted)',
                maxWidth: 640,
                margin: center ? '26px auto 0' : '26px 0 0',
                textWrap: 'pretty',
              }}
            >
              <EText path={`${path}.text`} value={text} multiline />
            </p>
          )}
          {!!chips?.length && (
            <ul
              style={{
                display: 'flex',
                flexWrap: 'wrap',
                justifyContent: center ? 'center' : undefined,
                gap: 8,
                listStyle: 'none',
                padding: 0,
                margin: '30px 0 0',
              }}
            >
              {chips.map((c, i) => (
                <Reveal as="li" key={i} effect="hoch" delay={120 + i * 70}>
                  <span
                    style={{
                      display: 'inline-block',
                      padding: '9px 15px',
                      borderRadius: 999,
                      border: '1px solid var(--border)',
                      background: 'var(--card)',
                      fontSize: 13,
                      fontWeight: 600,
                    }}
                  >
                    {c}
                  </span>
                </Reveal>
              ))}
            </ul>
          )}
        </div>
        {withDevice && (
          <Reveal effect="zoom" delay={200} style={{ marginTop: mob ? 40 : 0 }}>
            <div className={styles.float} style={{ display: 'flex', justifyContent: 'center' }}>
              <div style={{ width: device === 'phone' ? (mob ? 'min(240px, 70vw)' : 300) : '100%' }}>
                <AppFrame kind={device} h={mob ? '300px' : 'min(48vh, 440px)'}>
                  {screenOf(screen ?? {}, g1)}
                </AppFrame>
              </div>
            </div>
          </Reveal>
        )}
      </div>
      {/* Scroll-Hinweis mittig am unteren Rand des Auftakts; blendet beim Scrollen schnell aus */}
      {cue && (
        <div
          style={{
            position: 'absolute',
            left: 0,
            right: 0,
            bottom: mob ? 22 : 34,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: 10,
            fontFamily: mono,
            fontSize: 10.5,
            letterSpacing: '0.18em',
            textTransform: 'uppercase',
            color: 'var(--soft)',
            opacity: 'calc(1 - var(--p, 0) * 5)',
            pointerEvents: 'none',
          }}
        >
          <EText path={`${path}.cue`} value={cue} />
          <span
            aria-hidden
            style={{
              width: 24,
              height: 38,
              borderRadius: 999,
              border: '1.5px solid var(--border)',
              display: 'flex',
              justifyContent: 'center',
              paddingTop: 7,
              boxSizing: 'border-box',
            }}
          >
            <span className={styles.cue} style={{ width: 4, height: 8, borderRadius: 2, background: 'var(--soft)' }} />
          </span>
        </div>
      )}
    </section>
  );
}

// ---------------------------------------------------------------------------------------------------------------
// Geräte-Rahmen
// ---------------------------------------------------------------------------------------------------------------

export function Device({ kind, children, style }: { kind: string; children: ReactNode; style?: CSSProperties }) {
  if (kind === 'browser')
    return (
      <div className={styles.browser} style={style}>
        <div aria-hidden style={{ display: 'flex', gap: 6, padding: '10px 12px', background: '#1a1e25' }}>
          {['#ff5f57', '#febc2e', '#28c840'].map((c) => (
            <span key={c} style={{ width: 10, height: 10, borderRadius: '50%', background: c }} />
          ))}
        </div>
        <div style={{ height: 'min(52vh, 460px)', background: '#f6f7fb', color: '#141821', position: 'relative', overflow: 'hidden' }}>
          {children}
        </div>
      </div>
    );
  return (
    <div className={styles.phone} style={style}>
      <div className={styles.screen}>{children}</div>
    </div>
  );
}

/** Angedeuteter Seiteninhalt hinter Erweiterungen (Dekoration). */
function FauxPage() {
  return (
    <div aria-hidden style={{ padding: '22px 24px', display: 'flex', flexDirection: 'column', gap: 12 }}>
      <div style={{ width: '46%', height: 18, borderRadius: 6, background: '#d9dde6' }} />
      {[92, 84, 88, 60].map((w, i) => (
        <div key={i} style={{ width: `${w}%`, height: 10, borderRadius: 5, background: '#e5e8ef' }} />
      ))}
      <div style={{ width: '70%', aspectRatio: '16 / 7', borderRadius: 10, background: '#e9ecf2', marginTop: 6 }} />
    </div>
  );
}

const dots = (
  <span aria-hidden style={{ display: 'flex', gap: 6 }}>
    {['#ff5f57', '#febc2e', '#28c840'].map((c) => (
      <span key={c} style={{ width: 10, height: 10, borderRadius: '50%', background: c }} />
    ))}
  </span>
);

/** Rahmen je Ausführung. h = Höhe der Inhaltsfläche. */
export function AppFrame({ kind, label, h, children }: { kind: string; label?: string; h: string; children: ReactNode }) {
  if (kind === 'phone') return <Device kind="phone">{children}</Device>;
  if (kind === 'browser')
    return (
      <Device kind="browser" style={{ width: '100%' }}>
        {children}
      </Device>
    );
  const shell: CSSProperties = {
    width: '100%',
    borderRadius: 14,
    overflow: 'hidden',
    background: '#101318',
    boxShadow: '0 0 0 1px rgba(255,255,255,0.12) inset, 0 40px 80px -30px rgba(0,0,0,0.55)',
  };
  const body: CSSProperties = { height: h, position: 'relative', overflow: 'hidden', background: '#f6f7fb', color: '#141821' };
  if (kind === 'desktop')
    return (
      <div style={shell}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '9px 12px', background: '#1d2129' }}>
          {dots}
          <span style={{ flex: 1, textAlign: 'center', fontSize: 12, fontWeight: 600, color: '#c9d1dd', marginRight: 46 }}>{label}</span>
        </div>
        <div style={body}>{children}</div>
      </div>
    );
  // Browser mit Erweiterung: Chrome (Popup unter dem Puzzle-Symbol), Safari (Popup mit Pfeil), Seitenleiste
  const safari = kind === 'safari';
  const bar = (
    <div style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '8px 12px', background: safari ? '#e8e9ed' : '#202329' }}>
      {dots}
      <span
        aria-hidden
        style={{
          flex: 1,
          height: 24,
          borderRadius: safari ? 7 : 999,
          background: safari ? '#fff' : '#33373f',
          margin: safari ? '0 12%' : 0,
        }}
      />
      <span aria-hidden style={{ fontSize: 13, color: safari ? '#5b6270' : '#c9d1dd' }}>
        {kind === 'sidebar' ? '▥' : '⧉'}
      </span>
    </div>
  );
  return (
    <div style={{ ...shell, background: safari ? '#e8e9ed' : '#101318' }}>
      {bar}
      <div style={{ ...body, display: 'flex' }}>
        <div style={{ flex: 1, minWidth: 0 }}>
          <FauxPage />
        </div>
        {kind === 'sidebar' ? (
          <div style={{ width: 'min(42%, 340px)', position: 'relative', borderLeft: '1px solid #d9dde6' }}>{children}</div>
        ) : (
          <div
            className={styles.popup}
            style={{ top: 8, right: safari ? '18%' : 12, width: 'min(300px, 72%)', height: 'calc(100% - 16px)' }}
          >
            {children}
          </div>
        )}
      </div>
    </div>
  );
}

export interface ScreenData {
  screen?: string;
  screenTitle?: string;
  rows?: string[];
  image?: MediaRef;
}

export const screenOf = (d: ScreenData, accent: string) => (
  <LazyMount>
    <MockScreen kind={d.screen ?? 'dashboard'} title={d.screenTitle} rows={parseRows(d.rows)} accent={accent} image={d.image} />
  </LazyMount>
);

/**
 * Nachgebaute Screens sind Dekoration (aria-hidden bzw. Bild) und teuer im Aufbau — sie entstehen erst, wenn sie in die
 * Nähe des Bildschirms kommen (600 px Vorlauf). Bis dahin füllt ein leerer Platzhalter den Rahmen: keine Verschiebung.
 */
function LazyMount({ children }: { children: ReactNode }) {
  const ref = useRef<HTMLDivElement>(null);
  const [on, setOn] = useState(false);
  useEffect(() => {
    const el = ref.current;
    if (!el || on) return;
    if (typeof IntersectionObserver === 'undefined') {
      // eslint-disable-next-line react-hooks/set-state-in-effect -- ohne Observer sofort aufbauen
      setOn(true);
      return;
    }
    const io = new IntersectionObserver(
      ([e]) => {
        if (e.isIntersecting) {
          setOn(true);
          io.disconnect();
        }
      },
      { rootMargin: '600px 0px' },
    );
    io.observe(el);
    return () => io.disconnect();
  }, [on]);
  return (
    <div ref={ref} style={{ width: '100%', height: '100%' }}>
      {on ? children : null}
    </div>
  );
}

// ---------------------------------------------------------------------------------------------------------------
// Scrollytelling: Schritte scrollen, das Gerät bleibt stehen und wechselt den Screen
// ---------------------------------------------------------------------------------------------------------------

export interface Step extends ScreenData {
  icon?: string;
  title?: string;
  text?: string;
}

export function StorySteps({
  steps,
  side,
  device,
  color,
  path,
}: {
  steps: Step[];
  side: string;
  device: string;
  color?: string;
  path: string;
}) {
  const { mob } = useSite();
  const accent = okHex(color) ?? STORY_DEFAULT_COLOR;
  const [active, setActive] = useState(0);
  // Screens erst bauen, wenn sie (fast) dran sind: weniger Markup beim Laden, schnellere Hydration
  const [reached, setReached] = useState(0);
  const list = useRef<HTMLOListElement>(null);
  useEffect(() => {
    const el = list.current;
    if (!el || mob || typeof IntersectionObserver === 'undefined') return;
    const io = new IntersectionObserver(
      (es) => {
        for (const e of es)
          if (e.isIntersecting) {
            const i = Number((e.target as HTMLElement).dataset.i);
            setActive(i);
            setReached((r) => Math.max(r, i));
          }
      },
      { rootMargin: '-48% 0px -48% 0px' },
    );
    el.querySelectorAll('[data-i]').forEach((s) => io.observe(s));
    return () => io.disconnect();
  }, [mob, steps.length]);

  const stepText = (s: Step, i: number) => (
    <>
      <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
        <span
          aria-hidden
          style={{
            width: 44,
            height: 44,
            borderRadius: 14,
            display: 'grid',
            placeItems: 'center',
            fontSize: 22,
            background: i === active || mob ? accent : 'var(--card)',
            color: i === active || mob ? inkOn(accent) : 'var(--ink)',
            border: '1px solid var(--border)',
            transition: 'background 0.4s, color 0.4s',
          }}
        >
          {s.icon || String(i + 1)}
        </span>
        <span style={{ fontFamily: mono, fontSize: 10.5, letterSpacing: '0.16em', color: 'var(--soft)' }}>
          {String(i + 1).padStart(2, '0')} / {String(steps.length).padStart(2, '0')}
        </span>
      </div>
      <h3 style={{ fontSize: mob ? 26 : 38, fontWeight: 800, letterSpacing: '-0.03em', lineHeight: 1.08, margin: '18px 0 0' }}>
        <EText path={`${path}.steps.${i}.title`} value={s.title} />
      </h3>
      {s.text && (
        <p style={{ fontSize: mob ? 16 : 18, lineHeight: 1.65, color: 'var(--muted)', margin: '14px 0 0', maxWidth: 480 }}>
          <EText path={`${path}.steps.${i}.text`} value={s.text} multiline />
        </p>
      )}
    </>
  );

  if (mob)
    return (
      <ol style={{ listStyle: 'none', margin: 0, padding: 0, display: 'flex', flexDirection: 'column', gap: 56 }}>
        {steps.map((s, i) => (
          <Reveal as="li" key={i} effect="hoch">
            {stepText(s, i)}
            <div style={{ display: 'flex', justifyContent: 'center', marginTop: 26 }}>
              <Device kind={device} style={device === 'browser' ? undefined : { width: 'min(250px, 70vw)' }}>
                {screenOf(s, accent)}
              </Device>
            </div>
          </Reveal>
        ))}
      </ol>
    );

  const deviceCol = (
    <div
      style={{ position: 'sticky', top: 'max(90px, calc(50vh - 330px))', display: 'flex', justifyContent: 'center', alignSelf: 'start' }}
    >
      <Device kind={device} style={device === 'browser' ? { width: '100%' } : undefined}>
        {steps.map((s, i) => (
          <div key={i} className={styles.layer} data-on={i === active} aria-hidden={i !== active}>
            {i <= reached + 1 && screenOf(s, accent)}
          </div>
        ))}
      </Device>
    </div>
  );
  return (
    <div style={{ display: 'grid', gridTemplateColumns: side === 'links' ? '1fr 1.05fr' : '1.05fr 1fr', gap: 'clamp(32px, 6vw, 96px)' }}>
      {side === 'links' && deviceCol}
      <ol ref={list} style={{ listStyle: 'none', margin: 0, padding: 0 }}>
        {steps.map((s, i) => (
          <li
            key={i}
            data-i={i}
            style={{
              minHeight: '72vh',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'center',
              // Inaktive Schritte ohne Abdimmen (Deckkraft senkte die Nebenschrift auf schlichtem Grund unter 4,5:1):
              // stattdessen etwas kleiner und entsättigt (wirkt auf Symbol und Akzente, graue Schrift bleibt gleich)
              transform: i === active ? 'none' : 'scale(0.96)',
              filter: i === active ? 'none' : 'saturate(0.2)',
              transformOrigin: 'left center',
              transition: 'transform 0.45s, filter 0.45s',
            }}
          >
            {stepText(s, i)}
          </li>
        ))}
      </ol>
      {side !== 'links' && deviceCol}
    </div>
  );
}

// ---------------------------------------------------------------------------------------------------------------
// Bento: Feature-Kacheln in unterschiedlichen Größen
// ---------------------------------------------------------------------------------------------------------------

export interface Tile extends ScreenData {
  icon?: string;
  title?: string;
  text?: string;
  size?: string;
  color?: string;
}

const SPAN: Record<string, [number, number]> = { s: [1, 1], w: [2, 1], t: [1, 2], l: [2, 2] };

export function StoryBento({ items, path }: { items: Tile[]; path: string }) {
  const { mob } = useSite();
  return (
    <div
      style={{
        display: 'grid',
        gridTemplateColumns: mob ? '1fr' : 'repeat(4, minmax(0, 1fr))',
        gridAutoRows: mob ? 'minmax(170px, auto)' : 'minmax(210px, auto)',
        gridAutoFlow: 'dense',
        gap: 14,
      }}
    >
      {items.map((it, i) => {
        const [c, r] = SPAN[it.size ?? 's'] ?? SPAN.s;
        const col = okHex(it.color);
        const big = !mob && r === 2;
        return (
          <Reveal
            key={i}
            effect="zoom"
            delay={(i % 4) * 80}
            style={{ gridColumn: mob ? 'auto' : `span ${c}`, gridRow: mob ? 'auto' : `span ${r}`, display: 'flex' }}
          >
            <div
              className={styles.tile}
              style={{
                flex: 1,
                // deckende Grundfläche unter der Karten-Tönung: Kontrastprüfung sieht nie „durch“ (auch bei content-visibility)
                background: col ?? 'linear-gradient(var(--card), var(--card)), var(--bg)',
                border: col ? 0 : '1px solid var(--border)',
                padding: mob ? 22 : 28,
                display: 'flex',
                flexDirection: 'column',
                gap: 10,
                minHeight: big ? 440 : undefined,
                ...toneVars(col),
              }}
            >
              {it.icon && (
                <span aria-hidden style={{ fontSize: big ? 44 : 34, lineHeight: 1 }}>
                  {it.icon}
                </span>
              )}
              <h3 style={{ fontSize: big ? 30 : 21, fontWeight: 800, letterSpacing: '-0.025em', lineHeight: 1.12, margin: '6px 0 0' }}>
                <EText path={`${path}.items.${i}.title`} value={it.title} />
              </h3>
              {it.text && (
                <p style={{ fontSize: 14.5, lineHeight: 1.6, color: 'var(--muted)', margin: 0, maxWidth: 420 }}>
                  <EText path={`${path}.items.${i}.text`} value={it.text} multiline />
                </p>
              )}
              {it.screen && it.screen !== 'keiner' && (r === 2 || c === 2) && !mob && (
                <div
                  aria-hidden
                  style={{
                    marginTop: 'auto',
                    alignSelf: c === 2 ? 'flex-end' : 'center',
                    width: 220,
                    height: r === 2 ? 250 : 150,
                    marginBottom: mob ? 0 : -28 - (r === 2 ? 0 : 0),
                    borderRadius: '26px 26px 0 0',
                    overflow: 'hidden',
                    background: '#f6f7fb',
                    boxShadow: '0 -10px 40px -10px rgba(0,0,0,0.35)',
                    transform: 'rotate(-3deg) translateY(10px)',
                  }}
                >
                  {screenOf(it, col ?? STORY_DEFAULT_COLOR)}
                </div>
              )}
            </div>
          </Reveal>
        );
      })}
    </div>
  );
}

// ---------------------------------------------------------------------------------------------------------------
// Wort für Wort: großer Satz, der sich beim Scrollen „einfärbt“ (von --soft nach --ink, beides kontrastsicher)
// ---------------------------------------------------------------------------------------------------------------

export function StoryWords({ text, kicker, path }: { text?: string; kicker?: string; path: string }) {
  const { mob } = useSite();
  const motion = useMotionOk();
  const ref = useRef<HTMLDivElement>(null);
  useScrollVar(ref, motion, 'through', 1);
  const words = (text ?? '').split(/\s+/).filter(Boolean);
  const n = Math.max(1, words.length);
  return (
    <div ref={ref} style={{ maxWidth: 980, margin: '0 auto', padding: mob ? '40px 0' : '90px 0' }}>
      {kicker && (
        <div style={{ ...kickerStyle, marginBottom: 20 }}>
          <EText path={`${path}.kicker`} value={kicker} />
        </div>
      )}
      <p
        style={{ fontSize: mob ? 30 : 'clamp(38px, 4.8vw, 66px)', fontWeight: 800, letterSpacing: '-0.035em', lineHeight: 1.12, margin: 0 }}
      >
        {words.map((w, i) => (
          <span
            key={i}
            style={{
              color: `color-mix(in srgb, var(--ink) calc(clamp(0, (var(--p, 1) - 0.18) * ${(n * 2.4).toFixed(2)} - ${i}, 1) * 100%), var(--soft))`,
              transition: 'color 0.2s',
            }}
          >
            {w}{' '}
          </span>
        ))}
      </p>
    </div>
  );
}

// ---------------------------------------------------------------------------------------------------------------
// Laufband
// ---------------------------------------------------------------------------------------------------------------

export function StoryTicker({ items, speed, reverse, look }: { items: string[]; speed: string; reverse: boolean; look: string }) {
  const motion = useMotionOk();
  const big = look === 'gross';
  const item = (t: string, i: number) =>
    big ? (
      <span
        key={i}
        style={{
          fontSize: 'clamp(40px, 7vw, 96px)',
          fontWeight: 800,
          letterSpacing: '-0.04em',
          whiteSpace: 'nowrap',
          display: 'flex',
          alignItems: 'center',
          gap: 14,
        }}
      >
        {t}
        <span aria-hidden style={{ color: 'var(--accent)', fontSize: '0.5em' }}>
          ✦
        </span>
      </span>
    ) : (
      <span
        key={i}
        style={{
          whiteSpace: 'nowrap',
          padding: '12px 20px',
          borderRadius: 999,
          border: '1px solid var(--border)',
          background: 'var(--card)',
          fontSize: 15,
          fontWeight: 600,
        }}
      >
        {t}
      </span>
    );
  // Endlos auch auf Widescreens: eine Spur muss mindestens so breit sein wie die Fläche, sonst entsteht beim Durchlaufen
  // eine Lücke. Daher die Einträge so oft wiederholen, wie nötig (gemessen); das Tempo bleibt gleich (Dauer × Wiederholungen).
  const box = useRef<HTMLDivElement>(null);
  const first = useRef<HTMLDivElement>(null);
  const [reps, setReps] = useState(1);
  useLayoutEffect(() => {
    const b = box.current;
    const t = first.current;
    if (!motion || !b || !t) return;
    const fit = () => {
      // Breite EINES Durchgangs exakt messen (Abstand zum ersten Eintrag der Wiederholung) — eine Schätzung über
      // scrollWidth / reps schwankte um Bruchteile und ließ reps zwischen zwei Werten hin- und herspringen.
      const kids = t.children as HTMLCollectionOf<HTMLElement>;
      const one = reps > 1 && kids[items.length] ? kids[items.length].offsetLeft - kids[0].offsetLeft : t.scrollWidth;
      if (one > 0) {
        const need = Math.max(1, Math.ceil(b.clientWidth / one));
        if (need !== reps) setReps(need);
      }
    };
    fit();
    const ro = typeof ResizeObserver !== 'undefined' ? new ResizeObserver(fit) : null;
    ro?.observe(b);
    return () => ro?.disconnect();
  }, [motion, reps, items.length]);
  if (!motion) return <div style={{ display: 'flex', flexWrap: 'wrap', gap: 12, justifyContent: 'center' }}>{items.map(item)}</div>;
  const set = (k: number) => Array.from({ length: reps }, (_, r) => items.map((x, i) => item(x, k * 1000 + r * 100 + i)));
  const base = { langsam: 70, mittel: 42, schnell: 22 }[speed] ?? 42;
  return (
    <div
      ref={box}
      className={[styles.ticker, styles.moving, reverse ? styles.reverse : ''].join(' ')}
      style={{ ...bleed, ['--dur' as string]: `${base * reps}s` }}
    >
      <div ref={first} className={styles.track}>
        {set(0)}
      </div>
      <div className={styles.track} aria-hidden>
        {set(1)}
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------------------------------------------
// Horizontal: senkrecht scrollen, Karten fahren seitlich vorbei (ohne Bewegung / mobil: Wischen)
// ---------------------------------------------------------------------------------------------------------------

export interface HCard {
  icon?: string;
  kicker?: string;
  title?: string;
  text?: string;
  color?: string;
}

export function StoryHorizontal({ items, path }: { items: HCard[]; path: string }) {
  const { mob } = useSite();
  const t = useT();
  const motion = useMotionOk();
  const pinned = motion && !mob;
  const outer = useRef<HTMLDivElement>(null);
  const inner = useRef<HTMLDivElement>(null);
  const track = useRef<HTMLDivElement>(null);
  useScrollVar(outer, pinned, 'pin', 0);
  useLayoutEffect(() => {
    if (!pinned) return;
    const fit = () => {
      const t = track.current;
      const box = inner.current;
      if (t && box) outer.current?.style.setProperty('--hx', String(Math.max(0, t.scrollWidth - box.clientWidth)));
    };
    fit();
    window.addEventListener('resize', fit);
    return () => window.removeEventListener('resize', fit);
  }, [pinned, items.length]);

  const cards = items.map((it, i) => {
    const col = okHex(it.color);
    return (
      <article
        key={i}
        style={{
          width: mob ? '78vw' : 'min(420px, 34vw)',
          minHeight: mob ? 300 : 'min(56vh, 520px)',
          flex: 'none',
          borderRadius: 28,
          padding: mob ? 24 : 32,
          boxSizing: 'border-box',
          display: 'flex',
          flexDirection: 'column',
          gap: 12,
          // deckende Grundfläche unter der Karten-Tönung: Kontrastprüfung sieht nie „durch“ (auch bei content-visibility)
          background: col ?? 'linear-gradient(var(--card), var(--card)), var(--bg)',
          border: col ? 0 : '1px solid var(--border)',
          ...toneVars(col),
        }}
      >
        {it.icon && (
          <span aria-hidden style={{ fontSize: 46, lineHeight: 1 }}>
            {it.icon}
          </span>
        )}
        {it.kicker && <span style={{ ...kickerStyle, marginTop: 'auto' }}>{it.kicker}</span>}
        <h3
          style={{
            fontSize: mob ? 24 : 30,
            fontWeight: 800,
            letterSpacing: '-0.03em',
            lineHeight: 1.1,
            margin: it.kicker ? 0 : 'auto 0 0',
          }}
        >
          <EText path={`${path}.items.${i}.title`} value={it.title} />
        </h3>
        {it.text && (
          <p style={{ fontSize: 15, lineHeight: 1.6, color: 'var(--muted)', margin: 0 }}>
            <EText path={`${path}.items.${i}.text`} value={it.text} multiline />
          </p>
        )}
      </article>
    );
  });

  if (!pinned)
    return (
      <div className={styles.hsnap} role="region" aria-label={t('story.swipe')} tabIndex={0}>
        {cards}
      </div>
    );
  return (
    // Volle Breite bis an den Seitenrand, Karten starten bündig mit dem Inhalt
    <div ref={outer} style={{ ...bleed, height: `${Math.max(1, items.length) * 46 + 50}vh`, position: 'relative' }}>
      <div ref={inner} style={{ position: 'sticky', top: 0, height: '100vh', overflow: 'hidden', display: 'flex', alignItems: 'center' }}>
        <div
          ref={track}
          style={{
            display: 'flex',
            gap: 18,
            padding: '0 var(--br, 32px) 0 var(--bl, 32px)',
            transform: 'translateX(calc(var(--p, 0) * var(--hx, 0) * -1px))',
            willChange: 'transform',
          }}
        >
          {cards}
        </div>
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------------------------------------------
// Zahlen, die hochzählen
// ---------------------------------------------------------------------------------------------------------------

const NUM = /^(\D*?)(\d[\d.,]*)(.*)$/;

function CountUp({ value }: { value: string }) {
  const motion = useMotionOk();
  const ref = useRef<HTMLSpanElement>(null);
  const seen = useInView(ref);
  const m = NUM.exec(value);
  const [shown, setShown] = useState(value);
  const [armed, setArmed] = useState(false);
  useEffect(() => {
    const el = ref.current;
    if (!motion || !m || !el) return;
    // Nur Zahlen unterhalb des Bildschirms zählen hoch — sichtbare bleiben stehen
    if (el.getBoundingClientRect().top > window.innerHeight * 0.9) {
      setShown(`${m[1]}0${m[3]}`);
      setArmed(true);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [motion]);
  useEffect(() => {
    if (!armed || !seen || !m) return;
    const { value: target, decimals, grouped, de } = parseDisplayNumber(m[2]);
    const fmt = (n: number) =>
      n.toLocaleString(de ? 'de-DE' : 'en-US', { minimumFractionDigits: decimals, maximumFractionDigits: decimals, useGrouping: grouped });
    const t0 = performance.now();
    let raf = 0;
    const tick = (t: number) => {
      const k = Math.min(1, (t - t0) / 1400);
      const e = 1 - Math.pow(1 - k, 3);
      setShown(k < 1 ? `${m[1]}${fmt(target * e)}${m[3]}` : value);
      if (k < 1) raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [armed, seen, value]);
  return (
    <>
      <span ref={ref} aria-hidden>
        {shown}
      </span>
      <span style={{ position: 'absolute', width: 1, height: 1, overflow: 'hidden', clip: 'rect(0 0 0 0)', whiteSpace: 'nowrap' }}>
        {value}
      </span>
    </>
  );
}

export function StoryNumbers({ items }: { items: { value?: string; label?: string }[] }) {
  const { mob } = useSite();
  return (
    <dl
      style={{
        display: 'grid',
        gridTemplateColumns: mob ? '1fr 1fr' : `repeat(${Math.min(4, Math.max(1, items.length))}, 1fr)`,
        gap: mob ? 24 : 32,
        margin: 0,
      }}
    >
      {items.map((it, i) => (
        <Reveal key={i} effect="hoch" delay={i * 90} style={{ display: 'flex', flexDirection: 'column-reverse', gap: 8 }}>
          <dt style={{ fontSize: 14, lineHeight: 1.45, color: 'var(--muted)' }}>{it.label}</dt>
          <dd
            style={{
              margin: 0,
              fontSize: mob ? 40 : 'clamp(44px, 5vw, 72px)',
              fontWeight: 800,
              letterSpacing: '-0.045em',
              lineHeight: 1,
              position: 'relative',
            }}
          >
            <CountUp value={it.value ?? ''} />
          </dd>
        </Reveal>
      ))}
    </dl>
  );
}

// ---------------------------------------------------------------------------------------------------------------
// App-Feature: Gerät + Text, das Gerät schwebt mit dem Scrollen
// ---------------------------------------------------------------------------------------------------------------

export function StoryApp({
  kicker,
  title,
  text,
  bullets,
  side,
  device,
  color,
  data,
  path,
}: {
  kicker?: string;
  title?: string;
  text?: string;
  bullets?: string[];
  side: string;
  device: string;
  color?: string;
  data: ScreenData;
  path: string;
}) {
  const { mob } = useSite();
  const motion = useMotionOk();
  const ref = useRef<HTMLDivElement>(null);
  useScrollVar(ref, motion && !mob, 'through', 0.5);
  const accent = okHex(color) ?? STORY_DEFAULT_COLOR;
  const dev = (
    <div
      style={{
        display: 'flex',
        justifyContent: 'center',
        transform: 'translateY(calc((0.5 - var(--p, 0.5)) * 90px)) rotate(calc((0.5 - var(--p, 0.5)) * -5deg))',
      }}
    >
      <Device kind={device} style={device === 'browser' ? { width: '100%' } : mob ? { width: 'min(260px, 72vw)' } : undefined}>
        {screenOf(data, accent)}
      </Device>
    </div>
  );
  const copy = (
    <Reveal effect={side === 'links' ? 'rechts' : 'links'}>
      {kicker && (
        <div style={kickerStyle}>
          <EText path={`${path}.kicker`} value={kicker} />
        </div>
      )}
      <h2
        style={{
          fontSize: mob ? 30 : 'clamp(34px, 4vw, 54px)',
          fontWeight: 800,
          letterSpacing: '-0.035em',
          lineHeight: 1.04,
          margin: '12px 0 0',
        }}
      >
        <EText path={`${path}.title`} value={title} />
      </h2>
      {text && (
        <p style={{ fontSize: mob ? 16 : 18, lineHeight: 1.65, color: 'var(--muted)', margin: '16px 0 0' }}>
          <EText path={`${path}.text`} value={text} multiline />
        </p>
      )}
      {!!bullets?.length && (
        <ul style={{ listStyle: 'none', padding: 0, margin: '22px 0 0', display: 'flex', flexDirection: 'column', gap: 10 }}>
          {bullets.map((b, i) => (
            <li key={i} style={{ display: 'flex', gap: 10, fontSize: 15.5, lineHeight: 1.5 }}>
              <span
                aria-hidden
                style={{
                  flex: 'none',
                  width: 22,
                  height: 22,
                  borderRadius: 7,
                  background: accent,
                  color: inkOn(accent),
                  display: 'grid',
                  placeItems: 'center',
                  fontSize: 12,
                  marginTop: 1,
                }}
              >
                ✓
              </span>
              {b}
            </li>
          ))}
        </ul>
      )}
    </Reveal>
  );
  return (
    <div
      ref={ref}
      style={{
        display: 'grid',
        gridTemplateColumns: mob
          ? '1fr'
          : device === 'browser'
            ? side === 'links'
              ? '1.3fr 1fr'
              : '1fr 1.3fr'
            : side === 'links'
              ? '1fr 1.1fr'
              : '1.1fr 1fr',
        gap: mob ? 36 : 'clamp(32px, 6vw, 96px)',
        alignItems: 'center',
      }}
    >
      {side === 'links' && !mob ? (
        <>
          {dev}
          {copy}
        </>
      ) : (
        <>
          {copy}
          {dev}
        </>
      )}
    </div>
  );
}
