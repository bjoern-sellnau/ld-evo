'use client';

import Link from 'next/link';
import type { Article } from '@content/articles';
import { useContent } from '../content/ContentProvider';
import { mono, useOpenItem } from '../cards/ProjectCard';
import cardStyles from '../cards/cards.module.css';
import { inkOn } from '../lib/color';
import { articleHref } from '../lib/routes';
import { useSite } from '../settings/SiteProvider';

/** .Tech-Magazin: erste Karte breiter (Spalte 1,2fr, 26 px Titel), Rest 18 px. Markup: Prototyp Zeile 622–636. */
export function TechPage() {
  const { settings, mob, isMobile } = useSite();
  const { articles } = useContent();
  return (
    <div data-screen-label=".Tech" style={{ paddingTop: mob && settings.mobModern ? 84 : 140, paddingBottom: 80 }}>
      <h1 style={{ fontFamily: mono, fontSize: 11, fontWeight: 400, letterSpacing: '0.18em', color: 'var(--accent)', margin: 0 }}>
        .TECH — DER BLOG
      </h1>
      <p style={{ fontSize: 15, color: 'var(--muted)', margin: '8px 0 0', maxWidth: 560, lineHeight: 1.6 }}>
        Notizen aus 18 Jahren Webentwicklung — gepinnt, was gerade zählt.
      </p>
      <div style={{ display: 'grid', gridTemplateColumns: mob ? '1fr' : '1.2fr 1fr 1fr', gap: 14, marginTop: 36, alignItems: 'stretch' }}>
        {articles.map((a, i) => (
          <MagCard key={a.id} a={a} lead={!isMobile && i === 0} />
        ))}
      </div>
    </div>
  );
}

function MagCard({ a, lead }: { a: Article; lead: boolean }) {
  const { vtTarget, morphOk } = useSite();
  const href = articleHref(a);
  const onClick = useOpenItem(href, a.id);
  const fg = inkOn(a.color);
  return (
    <Link
      href={href}
      onClick={onClick}
      className={cardStyles.card}
      style={{
        viewTransitionName: morphOk && vtTarget === a.id ? `art-${a.id}` : 'none',
        gridColumn: lead ? '1/2' : 'auto',
        background: a.color,
        border: '1px solid var(--border)',
        borderRadius: 20,
        padding: 24,
        display: 'flex',
        flexDirection: 'column',
        gap: 12,
        color: fg,
        minHeight: 220,
        boxShadow: 'var(--cardShadow)',
      }}
    >
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          fontFamily: mono,
          fontSize: 9.5,
          letterSpacing: '0.1em',
        }}
      >
        <span style={{ border: `1px solid ${fg}`, borderRadius: 999, padding: '4px 10px', opacity: 0.85 }}>{a.kat}</span>
        <span style={{ opacity: 0.7 }}>{a.datum}</span>
      </div>
      <h2 style={{ fontSize: lead ? 26 : 18, fontWeight: 800, letterSpacing: '-0.02em', lineHeight: 1.18, flex: 1, margin: 0 }}>
        {a.titel}
      </h2>
      <div style={{ fontSize: 13, lineHeight: 1.6, opacity: 0.8 }}>{a.teaser}</div>
      <span style={{ fontSize: 12.5, fontWeight: 700 }}>Lesen ›</span>
    </Link>
  );
}
