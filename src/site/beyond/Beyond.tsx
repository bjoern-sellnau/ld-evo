'use client';

import { useMemo, type CSSProperties, type ReactNode } from 'react';
import type { Project } from '@content/projects';
import { EText } from '../cms/editing';
import { useContent } from '../content/ContentProvider';
import { useT } from '../i18n/LocaleProvider';
import { LocalLink } from '../i18n/LocalLink';
import { CAREER_START } from '../lib/career';
import { beyondParts, type BeyondPart } from '../settings/schema';
import { useSite } from '../settings/SiteProvider';
import styles from './beyond.module.css';

/**
 * Design-Richtung „Beyond“ (neu, Wunsch 07.11.2026): Bausteine aus dem Entwurf „Path to Beyond“
 * (github.com/bjoern-sellnau/ld-path-to-beyond — src/app/page.tsx, src/components/orb.tsx, ui.tsx), gespeist aus den
 * Inhalten dieser Site. Texte aus dem Entwurf nur, soweit about.ts/journey.ts sie belegen (content/home.ts → bx*);
 * Kennzahlen werden aus den Inhalten gezählt statt fest übernommen (Entwurf: 7 Experimente, 9 Zertifikate).
 */

/** Aktive Beyond-Elemente aus den Einstellungen (Klassisch: keines). */
export function useBeyond(): Record<BeyondPart, boolean> {
  const { settings } = useSite();
  const { design, designMix } = settings;
  return useMemo(() => beyondParts({ design, designMix }), [design, designMix]);
}

/** „MM/JJJJ“ → sortierbare Zahl (JJJJMM); sonst null. */
const monthKey = (d?: string) => {
  const m = /^(\d{2})\/(\d{4})$/.exec((d ?? '').trim());
  return m ? +m[2] * 100 + +m[1] : null;
};

/** Kennzahlen der Labs: Anzahl, davon mit Link (online), frühestes Datum, verschiedene Werkzeuge. */
export function labStats(projects: Project[]) {
  const labs = projects.filter((p) => p.kind === 'labs');
  const dates = labs.map((p) => ({ k: monthKey(p.datum), d: p.datum })).filter((x) => x.k !== null);
  dates.sort((a, b) => a.k! - b.k!);
  const tools = new Set(
    labs.flatMap((p) =>
      (p.tool ?? '')
        .split('·')
        .map((x) => x.trim())
        .filter(Boolean),
    ),
  );
  return { total: labs.length, online: labs.filter((p) => !!p.link).length, since: dates[0]?.d ?? '', tools: tools.size };
}

const careerYear = new Date(CAREER_START).getFullYear();

// ---------------------------------------------------------------------------------------------------------------
// Hero mit Orb
// ---------------------------------------------------------------------------------------------------------------

export function BeyondHero({ pill, mob }: { pill: boolean; mob: boolean }) {
  const { home, projects, about } = useContent();
  const { setOverlay } = useSite();
  const t = useT();
  const labs = labStats(projects);
  return (
    <div className={`${styles.hero} ${mob ? styles.heroMob : ''}`}>
      <div>
        {pill ? <NewPill /> : <KickerPill text={home.kicker} />}
        <h1 className={styles.title}>
          <span className={styles.grad}>
            <EText path="bxLine1" value={home.bxLine1} />
          </span>
          <br />
          <EText path="bxLine2" value={home.bxLine2} />
        </h1>
        <p className={styles.intro}>
          <EText path="intro" value={home.intro} multiline />
        </p>
        <div className={styles.actions}>
          <LocalLink href="/projekte" className={`${styles.btn} ${styles.btnPrimary}`}>
            {t('home.ctaProjects')} <Arrow />
          </LocalLink>
          <button type="button" onClick={() => setOverlay('kontakt')} className={`${styles.btn} ${styles.btnSecondary}`}>
            {t('home.ctaHello')} <Arrow />
          </button>
        </div>
        <dl className={styles.stats}>
          <div>
            <dt>{t('bx.statCareer')}</dt>
            <dd>{careerYear}</dd>
          </div>
          <div>
            <dt>{t('bx.statLabs')}</dt>
            <dd>{labs.total}</dd>
          </div>
          <div>
            <dt>{t('bx.statCerts')}</dt>
            <dd>{about.qualifications.length}</dd>
          </div>
        </dl>
      </div>
      <Orb small={mob} />
    </div>
  );
}

const Arrow = () => (
  <span aria-hidden className={styles.arrow}>
    →
  </span>
);

/** Der Loona-Mond mit Orbits — rein CSS/SVG, dekorativ (Entwurf: orb.tsx). */
export function Orb({ small }: { small?: boolean }) {
  const t = useT();
  return (
    <div className={styles.orb} aria-hidden style={small ? { maxWidth: 280 } : undefined}>
      <div className={styles.orbGlow} />
      <svg viewBox="0 0 400 400" className={styles.orbRings}>
        <g fill="none" stroke="var(--border)">
          <circle cx="200" cy="200" r="196" strokeDasharray="2 6" />
          <circle cx="200" cy="200" r="168" />
        </g>
        <circle cx="200" cy="4" r="4" fill="var(--accent)" />
        <circle cx="32" cy="200" r="2.5" fill="var(--muted)" />
        <circle cx="368" cy="200" r="3" fill="var(--accent)" />
      </svg>
      <div className={styles.orbMoon}>
        <div className={styles.orbBody}>
          <div className={styles.orbRing} />
          <div className={styles.orbCore} />
          <div className={styles.orbShine} />
        </div>
      </div>
      {!small && (
        <>
          <span className={styles.orbLabel} style={{ top: '14%', right: 0 }}>
            {t('bx.orbSince', { year: careerYear })}
          </span>
          <span className={styles.orbLabel} style={{ bottom: '12%', left: 0 }}>
            <span style={{ color: 'var(--accent)' }}>●</span> {t('bx.orbLabs')}
          </span>
        </>
      )}
    </div>
  );
}

// ---------------------------------------------------------------------------------------------------------------
// Pillen
// ---------------------------------------------------------------------------------------------------------------

/** „NEU“-Pille → Labs (Anzahl und frühestes Datum aus den Inhalten). */
export function NewPill({ solid }: { solid?: boolean }) {
  const { projects } = useContent();
  const t = useT();
  const labs = labStats(projects);
  return (
    // solid: über der klassischen Hero-Animation deckend (Kontrast unabhängig vom bewegten Hintergrund)
    <LocalLink href="/labs" className={styles.pill} style={solid ? { background: 'var(--cardsolid)' } : undefined}>
      <span className={styles.pillTag}>{t('bx.new')}</span>
      {t('bx.newPill', { n: labs.total, since: labs.since })}
      <span aria-hidden>↗</span>
    </LocalLink>
  );
}

/** Status-Pille im Beyond-Stil (ohne NEU-Pille: der bisherige Kicker der Startseite). */
function KickerPill({ text }: { text: string }) {
  return (
    <span className={`${styles.pill} ${styles.pillKicker}`} style={{ cursor: 'default' }}>
      <span className={styles.ping} aria-hidden />
      <EText path="kicker" value={text} />
    </span>
  );
}

// ---------------------------------------------------------------------------------------------------------------
// Aktuell-Leiste, Schwerpunkte, Laufband, Kontakt-Box
// ---------------------------------------------------------------------------------------------------------------

/** Aktuelle Position: Text aus LD Flow oder die erste Station aus „Über mich“ (Rolle @ Firma · Schwerpunkt · Zeit). */
export function NowBar() {
  const { home, about } = useContent();
  const t = useT();
  const st = about.stations?.[0];
  const main = home.bxNow || (st ? `${st.rolle} @ ${st.firma}` : '');
  const note = home.bxNowNote || (st ? [st.desc?.split('—')[0]?.trim(), st.zeit].filter(Boolean).join(' · ') : '');
  if (!main) return null;
  return (
    <section aria-label={t('bx.now').replace(':', '')} className={styles.now}>
      <p className={styles.nowMain}>
        <span className={styles.ping} aria-hidden />
        <span style={{ color: 'var(--muted)' }}>{t('bx.now')}</span>
        <strong style={{ fontWeight: 600, color: 'var(--ink)' }}>
          <EText path="bxNow" value={main} />
        </strong>
      </p>
      {note && (
        <p className={styles.nowNote}>
          <EText path="bxNowNote" value={note} />
        </p>
      )}
    </section>
  );
}

export function FocusAreas() {
  const { home } = useContent();
  const t = useT();
  const items = home.bxFocus ?? [];
  if (!items.length) return null;
  return (
    <section className={styles.section} aria-labelledby="bx-focus-title">
      <p className={styles.kicker}>{t('bx.focusKicker')}</p>
      <h2 id="bx-focus-title" className={styles.h2}>
        {t('bx.focusTitle')}
      </h2>
      <div className={styles.focusGrid}>
        {items.map((f, i) => (
          <article key={i} className={styles.focusCard}>
            <span className={styles.focusIcon} aria-hidden>
              {f.icon}
            </span>
            <h3>
              <EText path={`bxFocus.${i}.title`} value={f.title} />
            </h3>
            <p>
              <EText path={`bxFocus.${i}.text`} value={f.text} multiline />
            </p>
          </article>
        ))}
      </div>
    </section>
  );
}

/** Endlos-Laufband (zweite Kopie nur für die Schleife — für Screenreader verborgen). */
export function TechMarquee() {
  const { home } = useContent();
  const t = useT();
  const items = home.bxMarquee ?? [];
  if (!items.length) return null;
  const row = (dup: boolean): ReactNode[] =>
    items.map((x, i) => (
      <li key={`${dup ? 'd' : 'o'}${i}`} aria-hidden={dup || undefined} data-dup={dup ? '' : undefined}>
        {x}
        <span className={styles.marqueeStar} aria-hidden>
          ✦
        </span>
      </li>
    ));
  return (
    <section aria-label={t('bx.tech')} className={styles.marquee}>
      <ul className={styles.marqueeTrack}>
        {row(false)}
        {row(true)}
      </ul>
    </section>
  );
}

export function ContactBox() {
  // steht direkt nach den News (die enden mit 80 px Abstand) — eigener Abstand nach unten
  const { home } = useContent();
  const { setOverlay } = useSite();
  const t = useT();
  if (!home.bxCtaTitle) return null;
  return (
    <section className={styles.cta} aria-labelledby="bx-cta-title" style={{ margin: '0 0 80px' }}>
      <div className={styles.ctaGlow} aria-hidden />
      <span className={styles.ctaIcon} aria-hidden>
        ✦
      </span>
      <h2 id="bx-cta-title">
        <EText path="bxCtaTitle" value={home.bxCtaTitle} />
      </h2>
      {home.bxCtaText && (
        <p>
          <EText path="bxCtaText" value={home.bxCtaText} multiline />
        </p>
      )}
      <div className={styles.actions} style={{ justifyContent: 'center', position: 'relative' }}>
        <button type="button" onClick={() => setOverlay('kontakt')} className={`${styles.btn} ${styles.btnPrimary}`}>
          {t('bx.ctaBtn')} <Arrow />
        </button>
      </div>
    </section>
  );
}

// ---------------------------------------------------------------------------------------------------------------
// Lab-Look: Status-Badge, Kennzahl-Kacheln
// ---------------------------------------------------------------------------------------------------------------

/** Status als Wort + Punkt (mit Link: „Online“ mit Puls, sonst die Status-Zeile des Projekts; ohne beides: nichts). */
export function StatusBadge({ p }: { p: Project }) {
  const t = useT();
  const live = !!p.link;
  const text = live ? t('bx.badgeLive') : (p.status ?? '').replace(/^●\s*/, '');
  if (!text) return null;
  return (
    <span className={styles.badge}>
      <span
        aria-hidden
        className={live ? styles.ping : styles.dot}
        style={{ '--bx-ping': live ? '#22A06B' : '#F59E0B' } as CSSProperties}
      />
      {text}
    </span>
  );
}

/** Kennzahlen über der Labs-Liste (Entwurf: Experimente / Spielbar / In Arbeit / KI-Tools — hier aus den Inhalten). */
export function LabStatTiles() {
  const { projects } = useContent();
  const t = useT();
  const s = labStats(projects);
  const tiles: [string, string | number][] = [
    [t('bx.labTotal'), s.total],
    [t('bx.labOnline'), s.online],
    [t('bx.labSince'), s.since || '—'],
    [t('bx.labTools'), s.tools],
  ];
  return (
    <section aria-label={t('bx.labStats')} style={{ marginTop: 28 }}>
      <dl className={styles.labStats}>
        {tiles.map(([k, v]) => (
          <div key={k} className={styles.labStat}>
            <dt>{k}</dt>
            <dd>{v}</dd>
          </div>
        ))}
      </dl>
    </section>
  );
}
