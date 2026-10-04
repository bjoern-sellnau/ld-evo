'use client';

import { useEffect, useState, type CSSProperties } from 'react';
import { NewsCard } from '../cards/NewsCard';
import { CareerCounter } from './CareerCounter';
import { ProjectCard, mono } from '../cards/ProjectCard';
import styles from '../cards/cards.module.css';
import { useContent } from '../content/ContentProvider';
import { EText } from '../cms/editing';
import { FlowHero } from '../hero/FlowHero';
import { heroInk, heroMode } from '../hero/heroInk';
import { HERO_MODES, heroFxBgOf, heroFxSampleOf } from '../hero/modes';
import { useHeroShader } from '../hero/useHeroShader';
import { useSite } from '../settings/SiteProvider';
import { useLocale, useT } from '../i18n/LocaleProvider';
import { intlLocale, type Locale } from '../i18n/locale';
import { mobBottomZone, SIM_VH } from '../chrome/phoneBox';

const CAREER_START = new Date('2007-09-01T09:00:00').getTime();

const careerSeconds = (l: Locale) => Math.floor((Date.now() - CAREER_START) / 1000).toLocaleString(intlLocale(l));

/** Rotierende Rolle: alle 4,2 s ausblenden (7 px nach unten), 340 ms später nächste Rolle einblenden. */
function useRole(roles: string[], active: boolean) {
  const [state, setState] = useState({ idx: 0, op: 1, y: '0px' });
  useEffect(() => {
    if (!active) return;
    let t: ReturnType<typeof setTimeout>;
    const iv = setInterval(() => {
      if (document.hidden) return;
      setState((s) => ({ ...s, op: 0, y: '7px' }));
      t = setTimeout(() => setState((s) => ({ idx: s.idx + 1, op: 1, y: '0px' })), 340);
    }, 4200);
    return () => {
      clearInterval(iv);
      clearTimeout(t);
    };
  }, [active]);
  return { role: roles.length ? roles[state.idx % roles.length] : '', op: state.op, y: state.y };
}

function useCareerSeconds() {
  const [v, setV] = useState<string | null>(null);
  const locale = useLocale();
  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect -- Live-Zähler erst im Browser (Server-HTML ohne Uhrzeit → keine Hydration-Abweichung)
    setV(careerSeconds(locale));
    const iv = setInterval(() => setV(careerSeconds(locale)), 1000);
    return () => clearInterval(iv);
  }, [locale]);
  return v;
}

function useScrolled() {
  const [scrolled, setScrolled] = useState(false);
  useEffect(() => {
    const on = () => setScrolled(window.scrollY > 24);
    on();
    window.addEventListener('scroll', on, { passive: true });
    return () => window.removeEventListener('scroll', on);
  }, []);
  return scrolled;
}

/** Startseite „Hallo“ — Markup/Werte aus dem Prototyp, Zeile 370–464. */
export function HalloPage() {
  const { settings: s, mob, isMobile, mobDesign, navigate, setOverlay } = useSite();
  const hm = heroMode(s);
  const def = HERO_MODES[hm] ?? HERO_MODES.flow;
  const ink = heroInk(s);
  const { home, projects, articles } = useContent();
  const t = useT();
  // Featured in der im CMS gewählten Reihenfolge; News = gepinnte Artikel (Prototyp: renderVals).
  const FEATURED = home.featured.map((id) => projects.find((p) => p.id === id)).filter((p) => !!p);
  const NEWS = articles.filter((a) => a.pinned);
  const { role, op: roleOp, y: roleY } = useRole(home.roles, s.anim);
  const seconds = useCareerSeconds();
  const scrolled = useScrolled();
  const cineDone = useHeroShader(s);

  const padX = mob ? 18 : 32;
  // Cinematic (Matrix/Matrix v2) blendet den Hero-Text aus; mit „Hero-Text danach“ kommt er nach dem Cinematic zurück.
  const heroTxtHidden = ((hm === 'matrix' && s.mxCine) || hm === 'matrix2') && !(s.mxLater && cineDone);
  const heroPad = s.fullHero && !mob ? '140px 0 120px' : mob && s.mobModern ? '78px 0 56px' : mob ? '124px 0 64px' : '158px 0 92px';
  // Full-Hero mobil (Abweichung vom Prototyp, Wunsch 04.10.2026): Höhe der Tab-Leiste bzw. des Docks einrechnen und
  // die Zähler-Leiste (~124 px) sichtbar lassen; 100svh = kleine Viewport-Höhe (mit eingeblendeter Browserleiste).
  const mobChrome = mobBottomZone(mobDesign);
  const mobCut = mobChrome + 124;
  const heroMinH = s.fullHero ? (mob ? `calc(${SIM_VH} - ${mobCut}px)` : s.heroStats ? 'calc(100vh - 86px)' : '100vh') : 'auto';
  const heroFxH = s.fullHero
    ? mob
      ? `calc(${SIM_VH} - ${mobCut - 140}px)`
      : s.heroStats
        ? 'calc(100vh + 54px)'
        : 'calc(100vh + 140px)'
    : '720px';
  const txt: CSSProperties = {
    opacity: heroTxtHidden ? 0 : 1,
    visibility: heroTxtHidden ? 'hidden' : 'visible',
    transition: 'opacity 0.7s ease',
  };
  const cols3 = mob ? '1fr' : 'repeat(3,1fr)';

  return (
    <div data-screen-label="Hallo">
      <div
        id="ld-hero"
        style={{
          position: 'relative',
          margin: `0 -${padX}px`,
          padding: `0 ${padX}px`,
          boxSizing: 'border-box',
          minHeight: heroMinH,
          display: 'flex',
          flexDirection: 'column',
          justifyContent: s.fullHero && !mob ? 'center' : 'flex-start',
        }}
      >
        {def.renderer !== 'css' && (
          <div
            data-ldsample={heroFxSampleOf(hm, s.heroCfg)}
            data-ldpara="1"
            aria-hidden
            style={{
              position: 'absolute',
              top: -140,
              left: '50%',
              transform: 'translateX(-50%)',
              width: mob && !isMobile ? 430 : '100vw',
              height: heroFxH,
              overflow: 'hidden',
              pointerEvents: 'none',
              WebkitMask: 'linear-gradient(180deg,#000 68%,transparent)',
              mask: 'linear-gradient(180deg,#000 68%,transparent)',
              background: heroFxBgOf(hm, s.heroCfg),
            }}
          >
            <canvas
              id="ld-lava-canvas"
              style={{
                position: 'absolute',
                inset: 0,
                width: '100%',
                height: '100%',
                display: def.renderer === 'webgl' ? 'block' : 'none',
              }}
            />
            <canvas
              id="ld-orbit-canvas"
              style={{
                position: 'absolute',
                inset: 0,
                width: '100%',
                height: '100%',
                display: def.renderer === 'canvas2d' ? 'block' : 'none',
              }}
            />
          </div>
        )}
        {def.renderer === 'css' && <FlowHero />}
        <div
          aria-hidden
          style={{
            position: 'absolute',
            top: 330,
            left: '50%',
            transform: 'translateX(-50%)',
            width: '74vw',
            height: 160,
            background: 'radial-gradient(ellipse,rgba(255,140,60,0.18),transparent 65%)',
            filter: 'blur(42px)',
            pointerEvents: 'none',
          }}
        />
        {s.fullHero && !mob && <ScrollIndicator hidden={scrolled} />}

        <div style={{ position: 'relative', padding: heroPad, maxWidth: 640 }}>
          <div
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: 8,
              background: 'var(--glass)',
              border: '1px solid var(--glassbrd)',
              backdropFilter: 'blur(16px)',
              borderRadius: 999,
              padding: '7px 14px',
              fontFamily: mono,
              fontSize: 10.5,
              letterSpacing: '0.08em',
              color: ink.bar.col,
              mixBlendMode: ink.bar.blend,
              boxShadow: 'inset 0 1px 0 var(--glasshi)',
            }}
          >
            <span
              aria-hidden
              style={{ width: 7, height: 7, borderRadius: '50%', background: '#28C840', animation: 'ldPulse 2s infinite' }}
            />
            <EText path="kicker" value={home.kicker} />
          </div>
          <h1
            style={{
              fontSize: mob ? 40 : 62,
              fontWeight: 700,
              letterSpacing: '-0.035em',
              lineHeight: 1.03,
              margin: '20px 0 0',
              ...txt,
            }}
          >
            <span style={{ color: ink.t1.col, mixBlendMode: ink.t1.blend }}>
              <EText path="titleLine1" value={home.titleLine1} />
            </span>
            <br />
            <span style={{ color: ink.t2.col, mixBlendMode: ink.t2.blend }}>
              <EText path="titleLine2" value={home.titleLine2} />
            </span>
          </h1>
          <div
            style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'flex-start',
              gap: 3,
              marginTop: 16,
              fontSize: 19,
              fontWeight: 600,
              ...txt,
            }}
          >
            <span style={{ color: ink.sub.col, mixBlendMode: ink.sub.blend, fontWeight: 400, whiteSpace: 'nowrap', fontSize: 15 }}>
              <EText path="name" value={home.name} />
            </span>
            <span
              aria-live="polite"
              style={{
                color: ink.job.col,
                mixBlendMode: ink.job.blend,
                whiteSpace: mob ? 'normal' : 'nowrap',
                minHeight: mob ? 50 : 0,
                lineHeight: 1.3,
                opacity: roleOp,
                transform: `translateY(${roleY})`,
                transition: 'opacity 0.3s ease,transform 0.3s ease',
                display: 'inline-block',
              }}
            >
              {role}
            </span>
          </div>
          <p
            style={{
              margin: '18px 0 0',
              fontSize: 16,
              lineHeight: 1.65,
              maxWidth: 470,
              color: ink.intro.col,
              mixBlendMode: ink.intro.blend,
              ...txt,
            }}
          >
            <EText path="intro" value={home.intro} multiline />
          </p>
          <div style={{ display: 'flex', alignItems: 'center', gap: 18, marginTop: 30 }}>
            <button
              type="button"
              onClick={() => navigate('/projekte')}
              className={styles.heroBtn1}
              style={{
                font: 'inherit',
                borderRadius: 999,
                padding: ink.btn1.pad,
                fontSize: 14,
                fontWeight: 700,
                cursor: 'pointer',
                display: 'inline-flex',
                alignItems: 'center',
                gap: 7,
                transition: 'transform 0.25s',
                background: ink.btn1.bg,
                color: ink.btn1.fg,
                border: ink.btn1.border,
                backdropFilter: ink.btn1.blur,
                boxShadow: ink.btn1.shadow,
              }}
            >
              {t('home.ctaProjects')} <span aria-hidden>›</span>
            </button>
            <button
              type="button"
              onClick={() => setOverlay('kontakt')}
              className={styles.heroBtn2}
              style={{
                font: 'inherit',
                borderRadius: 999,
                padding: ink.btn2.pad,
                fontSize: 14,
                fontWeight: 600,
                cursor: 'pointer',
                display: 'inline-flex',
                alignItems: 'center',
                gap: 5,
                transition: 'transform 0.25s,gap 0.25s',
                background: ink.btn2.bg,
                color: ink.btn2.fg,
                border: ink.btn2.border,
                backdropFilter: ink.btn2.blur,
                boxShadow: ink.btn2.shadow,
              }}
            >
              {t('home.ctaHello')} <span aria-hidden>›</span>
            </button>
          </div>
        </div>
      </div>

      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: mob ? 'flex-start' : 'center',
          flexDirection: mob ? 'column' : 'row',
          borderTop: '1px solid var(--hair)',
          borderBottom: '1px solid var(--hair)',
          padding: '18px 0',
          flexWrap: 'wrap',
          gap: mob ? 12 : 14,
        }}
      >
        <div style={{ display: 'flex', alignItems: 'baseline', gap: 14 }}>
          {/* data-live: läuft sekündlich weiter — die Seiten-Pixeltests maskieren solche Stellen */}
          <CareerCounter
            value={seconds ?? ' '}
            fx={s.counterFx}
            anim={s.anim}
            style={{ fontFamily: mono, fontSize: mob ? 22 : 26, fontWeight: 600, fontVariantNumeric: 'tabular-nums' }}
          />
          <span style={{ fontSize: 13, color: 'var(--muted)' }}>{t('home.seconds')}</span>
        </div>
        <div style={{ display: 'flex', gap: mob ? 22 : 32, fontSize: 13, color: 'var(--muted)' }}>
          <span>
            <span style={{ fontWeight: 700, color: 'var(--ink)' }}>18+</span> {t('home.years')}
          </span>
          <span>
            <span style={{ fontWeight: 700, color: 'var(--ink)' }}>10</span> {t('home.certs')}
          </span>
          <span>
            <span style={{ fontWeight: 700, color: 'var(--ink)' }}>Berlin</span> &amp; Remote
          </span>
        </div>
      </div>

      <section style={{ padding: '64px 0 8px' }} aria-labelledby="featured-title">
        <SectionHead
          kicker={t('home.featuredKicker')}
          title={t('home.featuredTitle')}
          id="featured-title"
          link={t('home.featuredLink')}
          onLink={() => navigate('/projekte')}
        />
        <div data-m-rail style={{ display: 'grid', gridTemplateColumns: cols3, gap: 14, marginTop: 26 }}>
          {FEATURED.map((p) => (
            <ProjectCard key={p.id} p={p} prefix="cf-" />
          ))}
        </div>
      </section>

      <section style={{ padding: '64px 0 80px' }} aria-labelledby="news-title">
        <SectionHead
          kicker={t('home.newsKicker')}
          title={t('home.newsTitle')}
          id="news-title"
          link={t('home.newsLink')}
          onLink={() => navigate('/tech')}
        />
        <div data-m-rail style={{ display: 'grid', gridTemplateColumns: cols3, gap: 14, marginTop: 26 }}>
          {NEWS.map((a) => (
            <NewsCard key={a.id} a={a} />
          ))}
        </div>
      </section>
    </div>
  );
}

export function SectionHead({
  kicker,
  title,
  id,
  link,
  onLink,
}: {
  kicker: string;
  title: string;
  id: string;
  link?: string;
  onLink?: () => void;
}) {
  return (
    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', gap: 16 }}>
      <div>
        <div style={{ fontFamily: mono, fontSize: 10.5, letterSpacing: '0.18em', color: 'var(--accent)', marginBottom: 10 }}>{kicker}</div>
        <h2 id={id} style={{ fontSize: 30, fontWeight: 700, letterSpacing: '-0.025em', margin: 0 }}>
          {title}
        </h2>
      </div>
      {link && (
        <button
          type="button"
          onClick={onLink}
          className={styles.link}
          style={{ font: 'inherit', fontSize: 13.5, fontWeight: 600, background: 'none', border: 0, padding: 0, whiteSpace: 'nowrap' }}
        >
          {link}
        </button>
      )}
    </div>
  );
}

function ScrollIndicator({ hidden }: { hidden: boolean }) {
  return (
    <div
      aria-hidden
      style={{
        position: 'fixed',
        left: '50%',
        bottom: 26,
        transform: 'translateX(-50%)',
        zIndex: 5,
        opacity: hidden ? 0 : 1,
        transition: 'opacity 0.5s ease',
        pointerEvents: 'none',
        mixBlendMode: 'difference',
      }}
    >
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 7 }}>
        <div
          style={{
            width: 22,
            height: 36,
            border: '2px solid rgba(255,255,255,0.65)',
            borderRadius: 999,
            display: 'flex',
            justifyContent: 'center',
            paddingTop: 6,
            boxSizing: 'border-box',
          }}
        >
          <span
            style={{ width: 3, height: 8, borderRadius: 999, background: '#FFFFFF', animation: 'ldScrollBob 1.6s ease-in-out infinite' }}
          />
        </div>
        <span style={{ fontFamily: mono, fontSize: 9, letterSpacing: '0.22em', color: 'rgba(255,255,255,0.7)' }}>SCROLL</span>
      </div>
    </div>
  );
}
