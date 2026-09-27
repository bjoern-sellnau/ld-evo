'use client';

import { useEffect, useState, type CSSProperties } from 'react';
import { ARTICLES } from '@content/articles';
import { PROJECTS } from '@content/projects';
import { NewsCard } from '../cards/NewsCard';
import { ProjectCard, mono } from '../cards/ProjectCard';
import styles from '../cards/cards.module.css';
import { FlowHero } from '../hero/FlowHero';
import { heroInk, heroMode } from '../hero/heroInk';
import { HERO_MODES, heroFxBgOf, heroFxSampleOf } from '../hero/modes';
import { useHeroShader } from '../hero/useHeroShader';
import { useSite } from '../settings/SiteProvider';

// Prototyp: renderVals → roles / featuredCards / newsCards.
const ROLES = [
  'Senior Full-Stack / Senior Software Engineer : Frontend',
  'Senior React Engineer',
  'React Native Engineer',
  'Senior Full-Stack : Frontend',
  'Senior Nextjs Engineer',
  'Senior Node Engineer',
  'IT-Ausbilder (AEVO): Fachinformatiker — Anwendungsentwicklung',
];
const FEATURED = PROJECTS.filter((p) => ['corefall', 'covert', 'neuewebsite'].includes(p.id));
const NEWS = ARTICLES.filter((a) => a.pinned);
const CAREER_START = new Date('2007-09-01T09:00:00').getTime();

const careerSeconds = () => Math.floor((Date.now() - CAREER_START) / 1000).toLocaleString('de-DE');

/** Rotierende Rolle: alle 4,2 s ausblenden (7 px nach unten), 340 ms später nächste Rolle einblenden. */
function useRole(active: boolean) {
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
  return { role: ROLES[state.idx % ROLES.length], op: state.op, y: state.y };
}

function useCareerSeconds() {
  const [v, setV] = useState<string | null>(null);
  useEffect(() => {
    setV(careerSeconds());
    const iv = setInterval(() => setV(careerSeconds()), 1000);
    return () => clearInterval(iv);
  }, []);
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
  const { settings: s, mob, isMobile, navigate, setOverlay } = useSite();
  const hm = heroMode(s);
  const def = HERO_MODES[hm] ?? HERO_MODES.flow;
  const ink = heroInk(s);
  const { role, op: roleOp, y: roleY } = useRole(s.anim);
  const seconds = useCareerSeconds();
  const scrolled = useScrolled();
  const cineDone = useHeroShader(s);

  const padX = mob ? 18 : 32;
  // Cinematic (Matrix/Matrix v2) blendet den Hero-Text aus; mit „Hero-Text danach“ kommt er nach dem Cinematic zurück.
  const heroTxtHidden = ((hm === 'matrix' && s.mxCine) || hm === 'matrix2') && !(s.mxLater && cineDone);
  const heroPad = s.fullHero && !mob ? '140px 0 120px' : mob && s.mobModern ? '78px 0 56px' : mob ? '124px 0 64px' : '158px 0 92px';
  const heroMinH = s.fullHero ? (s.heroStats ? (mob ? 'calc(100vh - 132px)' : 'calc(100vh - 86px)') : '100vh') : 'auto';
  const heroFxH = s.fullHero ? (s.heroStats ? (mob ? 'calc(100vh + 8px)' : 'calc(100vh + 54px)') : 'calc(100vh + 140px)') : '720px';
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
              style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', display: def.renderer === 'webgl' ? 'block' : 'none' }}
            />
            <canvas
              id="ld-orbit-canvas"
              style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', display: def.renderer === 'canvas2d' ? 'block' : 'none' }}
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
            #TeamMaterna — Public Sector | E-Government | Zoll
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
            <span style={{ color: ink.t1.col, mixBlendMode: ink.t1.blend }}>Das Web.</span>
            <br />
            <span style={{ color: ink.t2.col, mixBlendMode: ink.t2.blend }}>Meine Leidenschaft.</span>
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
              Björn Sellnau
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
            Senior Full-Stack / Software Engineer — React, TypeScript, Web &amp; Mobile. Seit 18+ Jahren baue ich Dinge fürs Web, die
            bleiben.
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
              Projekte ansehen <span aria-hidden>›</span>
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
              Sag hallo <span aria-hidden>›</span>
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
          <span style={{ fontFamily: mono, fontSize: mob ? 22 : 26, fontWeight: 600, fontVariantNumeric: 'tabular-nums' }}>
            {seconds ?? ' '}
          </span>
          <span style={{ fontSize: 13, color: 'var(--muted)' }}>Sekunden im Dienst des Webs — läuft seit September 2007.</span>
        </div>
        <div style={{ display: 'flex', gap: mob ? 22 : 32, fontSize: 13, color: 'var(--muted)' }}>
          <span>
            <span style={{ fontWeight: 700, color: 'var(--ink)' }}>18+</span> Jahre
          </span>
          <span>
            <span style={{ fontWeight: 700, color: 'var(--ink)' }}>10</span> Zertifikate
          </span>
          <span>
            <span style={{ fontWeight: 700, color: 'var(--ink)' }}>Berlin</span> &amp; Remote
          </span>
        </div>
      </div>

      <section style={{ padding: '64px 0 8px' }} aria-labelledby="featured-title">
        <SectionHead
          kicker="FEATURED"
          title="Ausgewählte Arbeiten"
          id="featured-title"
          link="Alle Projekte ›"
          onLink={() => navigate('/projekte')}
        />
        <div style={{ display: 'grid', gridTemplateColumns: cols3, gap: 14, marginTop: 26 }}>
          {FEATURED.map((p) => (
            <ProjectCard key={p.id} p={p} prefix="cf-" />
          ))}
        </div>
      </section>

      <section style={{ padding: '64px 0 80px' }} aria-labelledby="news-title">
        <SectionHead
          kicker="NEWS — AUS DEM BLOG"
          title=".Tech, frisch gepinnt"
          id="news-title"
          link="Zum Blog ›"
          onLink={() => navigate('/tech')}
        />
        <div style={{ display: 'grid', gridTemplateColumns: cols3, gap: 14, marginTop: 26 }}>
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
