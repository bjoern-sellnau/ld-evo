'use client';

import Link from 'next/link';
import { useLayoutEffect, useRef, type RefObject } from 'react';
import type { Article } from '@content/articles';
import { useContent } from '../content/ContentProvider';
import { mono, useOpenItem } from '../cards/ProjectCard';
import cardStyles from '../cards/cards.module.css';
import { inkOn, readableAlpha } from '../lib/color';
import { articleHref } from '../lib/routes';
import { useSite } from '../settings/SiteProvider';
import { useHref, useT } from '../i18n/LocaleProvider';

/** .Tech-Magazin: erste Karte breiter (Spalte 1,2fr, 26 px Titel), Rest 18 px. Markup: Prototyp Zeile 622–636. */
export function TechPage() {
  const { settings, mob, isMobile } = useSite();
  const { articles } = useContent();
  const t = useT();
  if (settings.techLayout === 'magazin') return <TechMagazine />;
  if (settings.techLayout === 'blog') return <TechBlog />;
  return (
    <div data-screen-label=".Tech" style={{ paddingTop: mob && settings.mobModern ? 84 : 140, paddingBottom: 80 }}>
      <h1 style={{ fontFamily: mono, fontSize: 11, fontWeight: 400, letterSpacing: '0.18em', color: 'var(--accent)', margin: 0 }}>
        {t('tech.kicker')}
      </h1>
      <p style={{ fontSize: 15, color: 'var(--muted)', margin: '8px 0 0', maxWidth: 560, lineHeight: 1.6 }}>{t('tech.lead')}</p>
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
  const t = useT();
  const lh = useHref();
  return (
    <Link
      href={lh(href)}
      onClick={onClick}
      className={cardStyles.card}
      data-m-card
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
        <span style={{ border: `1px solid ${fg}`, borderRadius: 999, padding: '4px 10px', opacity: readableAlpha(a.color, fg, 0.85) }}>
          {a.kat}
        </span>
        <span style={{ opacity: readableAlpha(a.color, fg, 0.7) }}>{a.datum}</span>
      </div>
      <h2 style={{ fontSize: lead ? 26 : 18, fontWeight: 800, letterSpacing: '-0.02em', lineHeight: 1.18, flex: 1, margin: 0 }}>
        {a.titel}
      </h2>
      <div style={{ fontSize: 13, lineHeight: 1.6, opacity: readableAlpha(a.color, fg, 0.8) }}>{a.teaser}</div>
      <span style={{ fontSize: 12.5, fontWeight: 700 }}>{t('card.read')}</span>
    </Link>
  );
}

/** Neueste Ausgabe aus den Artikeldaten („MM/JJJJ“): größtes Datum, sonst das des ersten Artikels. */
export function issueOf(articles: Pick<Article, 'datum'>[]): string {
  let best = '';
  let bestN = -1;
  for (const { datum } of articles) {
    const m = /^(\d{1,2})\/(\d{4})$/.exec(datum.trim());
    const n = m ? Number(m[2]) * 100 + Number(m[1]) : -1;
    if (n > bestN) [best, bestN] = [datum, n];
  }
  return best || articles[0]?.datum || '';
}

/**
 * Magazin-Layout (Einstellung „Tech-Layout“, neu — nicht im Prototyp): Kopf wie ein Heft-Titel, Titelgeschichte groß
 * in der Artikelfarbe, daneben das Inhaltsverzeichnis, darunter weitere Artikel als Textspalten mit Farbkante.
 */
function TechMagazine() {
  const { settings, mob } = useSite();
  const { articles } = useContent();
  const t = useT();
  const [cover, ...rest] = articles;
  const inside = rest.slice(0, 5);
  const more = rest.slice(5);
  const rule = (w: number) => ({ height: w, background: w > 1 ? 'var(--ink)' : 'var(--hair)', border: 0, margin: 0 });
  return (
    <div data-screen-label=".Tech" style={{ paddingTop: mob && settings.mobModern ? 84 : 140, paddingBottom: 80 }}>
      <hr aria-hidden style={rule(2)} />
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          gap: 12,
          flexWrap: 'wrap',
          fontFamily: mono,
          fontSize: 10.5,
          letterSpacing: '0.14em',
          padding: '9px 0',
        }}
      >
        <h1 style={{ font: 'inherit', color: 'var(--accent)', margin: 0 }}>{t('tech.kicker')}</h1>
        <span style={{ color: 'var(--muted)' }}>
          {t('tech.issue')} {issueOf(articles)} · {articles.length} {t('tech.articles')}
        </span>
      </div>
      <hr aria-hidden style={rule(1)} />
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: mob ? '1fr' : 'auto 1fr',
          alignItems: 'end',
          gap: mob ? 8 : 40,
          padding: mob ? '18px 0 22px' : '22px 0 30px',
        }}
      >
        <div aria-hidden style={{ fontSize: mob ? 64 : 132, fontWeight: 800, letterSpacing: '-0.05em', lineHeight: 0.85 }}>
          .Tech
        </div>
        <p style={{ fontSize: mob ? 15 : 18, color: 'var(--muted)', margin: 0, maxWidth: 520, lineHeight: 1.5 }}>{t('tech.lead')}</p>
      </div>
      <hr aria-hidden style={rule(2)} />

      {cover && (
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: mob ? '1fr' : 'minmax(0,1.65fr) minmax(0,1fr)',
            gap: mob ? 28 : 44,
            padding: '30px 0 36px',
          }}
        >
          <CoverStory a={cover} mob={mob} />
          {inside.length > 0 && (
            <nav aria-label={t('tech.inside')}>
              <h2
                style={{
                  fontFamily: mono,
                  fontSize: 10.5,
                  fontWeight: 400,
                  letterSpacing: '0.14em',
                  color: 'var(--accent)',
                  margin: '0 0 6px',
                }}
              >
                {t('tech.inside').toUpperCase()}
              </h2>
              <ol style={{ listStyle: 'none', margin: 0, padding: 0 }}>
                {inside.map((a, i) => (
                  <li key={a.id} style={{ borderTop: i ? '1px solid var(--hair)' : 0 }}>
                    <TocEntry a={a} n={i + 2} />
                  </li>
                ))}
              </ol>
            </nav>
          )}
        </div>
      )}

      {more.length > 0 && (
        <>
          <hr aria-hidden style={rule(1)} />
          <h2
            style={{
              fontFamily: mono,
              fontSize: 10.5,
              fontWeight: 400,
              letterSpacing: '0.14em',
              color: 'var(--accent)',
              margin: '14px 0 18px',
            }}
          >
            {t('tech.more').toUpperCase()}
          </h2>
          <div style={{ display: 'grid', gridTemplateColumns: mob ? '1fr' : 'repeat(3,minmax(0,1fr))', gap: mob ? 22 : 30 }}>
            {more.map((a) => (
              <ColumnEntry key={a.id} a={a} />
            ))}
          </div>
        </>
      )}
    </div>
  );
}

/** Link mit Seitenwechsel-Morph wie MagCard (vtTarget-Gating). */
function useArticleLink(a: Article) {
  const { vtTarget, morphOk } = useSite();
  const href = articleHref(a);
  const lh = useHref();
  return {
    href: lh(href),
    onClick: useOpenItem(href, a.id),
    vt: morphOk && vtTarget === a.id ? `art-${a.id}` : 'none',
  };
}

function CoverStory({ a, mob }: { a: Article; mob: boolean }) {
  const t = useT();
  const l = useArticleLink(a);
  const fg = inkOn(a.color);
  return (
    <Link
      href={l.href}
      onClick={l.onClick}
      className={cardStyles.card}
      style={{ color: 'inherit', textDecoration: 'none', display: 'block' }}
    >
      <div
        style={{
          viewTransitionName: l.vt,
          background: a.color,
          color: fg,
          borderRadius: 20,
          padding: mob ? 22 : 34,
          minHeight: mob ? 240 : 340,
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between',
          gap: 18,
          boxShadow: 'var(--cardShadow)',
        }}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', fontFamily: mono, fontSize: 10, letterSpacing: '0.12em' }}>
          <span style={{ border: `1px solid ${fg}`, borderRadius: 999, padding: '4px 10px', opacity: readableAlpha(a.color, fg, 0.85) }}>
            {t('tech.cover').toUpperCase()} · {a.kat}
          </span>
          <span style={{ opacity: readableAlpha(a.color, fg, 0.7) }}>{a.datum}</span>
        </div>
        <h2 style={{ fontSize: mob ? 30 : 46, fontWeight: 800, letterSpacing: '-0.03em', lineHeight: 1.04, margin: 0, maxWidth: 640 }}>
          {a.titel}
        </h2>
      </div>
      <p style={{ fontSize: mob ? 15 : 17, lineHeight: 1.6, color: 'var(--muted)', margin: '16px 0 8px', maxWidth: 620 }}>{a.teaser}</p>
      <span style={{ fontSize: 13, fontWeight: 700, color: 'var(--accent)' }}>{t('card.read')}</span>
    </Link>
  );
}

function TocEntry({ a, n }: { a: Article; n: number }) {
  const l = useArticleLink(a);
  return (
    <Link
      href={l.href}
      onClick={l.onClick}
      style={{
        viewTransitionName: l.vt,
        display: 'grid',
        gridTemplateColumns: '34px 1fr',
        gap: 10,
        padding: '13px 0',
        color: 'inherit',
        textDecoration: 'none',
      }}
    >
      <span aria-hidden style={{ fontFamily: mono, fontSize: 12, color: 'var(--accent)', paddingTop: 2 }}>
        {String(n).padStart(2, '0')}
      </span>
      <span style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
        <span style={{ fontFamily: mono, fontSize: 9.5, letterSpacing: '0.1em', color: 'var(--soft)' }}>
          <span
            aria-hidden
            style={{
              display: 'inline-block',
              width: 8,
              height: 8,
              borderRadius: 2,
              background: a.color,
              marginRight: 7,
              verticalAlign: '-1px',
            }}
          />
          {a.kat} · {a.datum}
        </span>
        <span style={{ fontSize: 15.5, fontWeight: 700, lineHeight: 1.3 }}>{a.titel}</span>
      </span>
    </Link>
  );
}

function ColumnEntry({ a }: { a: Article }) {
  const t = useT();
  const l = useArticleLink(a);
  return (
    <Link
      href={l.href}
      onClick={l.onClick}
      style={{
        viewTransitionName: l.vt,
        display: 'flex',
        flexDirection: 'column',
        gap: 9,
        color: 'inherit',
        textDecoration: 'none',
        borderTop: `4px solid ${a.color}`,
        paddingTop: 14,
      }}
    >
      <span style={{ fontFamily: mono, fontSize: 9.5, letterSpacing: '0.1em', color: 'var(--soft)' }}>
        {a.kat} · {a.datum}
      </span>
      <h3 style={{ fontSize: 20, fontWeight: 800, letterSpacing: '-0.02em', lineHeight: 1.2, margin: 0 }}>{a.titel}</h3>
      <span style={{ fontSize: 13.5, lineHeight: 1.6, color: 'var(--muted)' }}>{a.teaser}</span>
      <span style={{ fontSize: 12.5, fontWeight: 700, color: 'var(--accent)' }}>{t('card.read')}</span>
    </Link>
  );
}

/** Lesezeit in Minuten (≈ 200 Wörter/Minute, mindestens 1). */
export function readMinutes(a: Pick<Article, 'teaser' | 'body'>): number {
  const words = [a.teaser, ...a.body].join(' ').split(/\s+/).filter(Boolean).length;
  return Math.max(1, Math.round(words / 200));
}

/** Raster-Zeilenhöhe der Masonry (px) und Abstand zwischen Kacheln. */
const M_ROW = 4;
const M_GAP = 18;

/**
 * Masonry über CSS-Grid: jede Zelle überspannt so viele 4-px-Zeilen, wie ihr Inhalt hoch ist. So bleibt die
 * DOM-Reihenfolge zeilenweise (neueste oben links — auch für Tastatur und Screenreader), anders als bei CSS-Spalten.
 * Neu gemessen bei jeder Größenänderung (Webfonts, Fensterbreite).
 */
function useMasonry(grid: RefObject<HTMLDivElement | null>) {
  useLayoutEffect(() => {
    const g = grid.current;
    if (!g) return;
    const cells = [...g.children] as HTMLElement[];
    const fit = () => {
      for (const c of cells) {
        const inner = c.firstElementChild as HTMLElement | null;
        if (inner) c.style.gridRowEnd = `span ${Math.ceil((inner.getBoundingClientRect().height + M_GAP) / M_ROW)}`;
      }
    };
    fit();
    if (typeof ResizeObserver === 'undefined') return;
    const ro = new ResizeObserver(fit);
    cells.forEach((c) => c.firstElementChild && ro.observe(c.firstElementChild));
    return () => ro.disconnect();
  });
}

/**
 * Blog-Layout (Einstellung „Tech-Layout“ → Blog, neu — nicht im Prototyp): versetzte Kacheln (Masonry). Gepinnte
 * Artikel mit großem Farbkopf, alle mit Anlesetext (erster Absatz) und Lesezeit; die Höhen ergeben sich aus dem Inhalt.
 */
function TechBlog() {
  const { settings, mob, isWide } = useSite();
  const { articles } = useContent();
  const t = useT();
  const grid = useRef<HTMLDivElement>(null);
  useMasonry(grid);
  const cols = mob ? 1 : isWide ? 4 : 3;
  return (
    <div data-screen-label=".Tech" style={{ paddingTop: mob && settings.mobModern ? 84 : 140, paddingBottom: 80 }}>
      <h1 style={{ fontFamily: mono, fontSize: 11, fontWeight: 400, letterSpacing: '0.18em', color: 'var(--accent)', margin: 0 }}>
        {t('tech.kicker')}
      </h1>
      <p style={{ fontSize: 15, color: 'var(--muted)', margin: '8px 0 0', maxWidth: 560, lineHeight: 1.6 }}>{t('tech.lead')}</p>
      <div
        ref={grid}
        style={{
          display: 'grid',
          gridTemplateColumns: `repeat(${cols},minmax(0,1fr))`,
          gridAutoRows: M_ROW,
          columnGap: M_GAP,
          alignItems: 'start',
          marginTop: 36,
        }}
      >
        {articles.map((a) => (
          <div key={a.id}>
            <BlogCard a={a} />
          </div>
        ))}
      </div>
    </div>
  );
}

function BlogCard({ a }: { a: Article }) {
  const t = useT();
  const l = useArticleLink(a);
  const fg = inkOn(a.color);
  const excerpt = a.body[0];
  return (
    <Link
      href={l.href}
      onClick={l.onClick}
      className={cardStyles.card}
      style={{
        viewTransitionName: l.vt,
        display: 'flex',
        flexDirection: 'column',
        borderRadius: 18,
        overflow: 'hidden',
        border: '1px solid var(--border)',
        background: 'var(--card)',
        color: 'inherit',
        textDecoration: 'none',
        boxShadow: 'var(--cardShadow)',
      }}
    >
      {a.pinned ? (
        <div
          style={{
            background: a.color,
            color: fg,
            padding: '22px 22px 20px',
            display: 'flex',
            flexDirection: 'column',
            gap: 14,
            minHeight: 150,
          }}
        >
          <span style={{ fontFamily: mono, fontSize: 9.5, letterSpacing: '0.12em', opacity: readableAlpha(a.color, fg, 0.8) }}>
            ★ {t('tech.pinned').toUpperCase()} · {a.kat}
          </span>
          <h2 style={{ fontSize: 24, fontWeight: 800, letterSpacing: '-0.02em', lineHeight: 1.15, margin: 0 }}>{a.titel}</h2>
        </div>
      ) : (
        <div aria-hidden style={{ height: 6, background: a.color }} />
      )}
      <div style={{ padding: '16px 20px 18px', display: 'flex', flexDirection: 'column', gap: 9 }}>
        <span style={{ fontFamily: mono, fontSize: 9.5, letterSpacing: '0.1em', color: 'var(--soft)' }}>
          {a.pinned ? a.datum : `${a.kat} · ${a.datum}`} · {t('tech.readTime', { n: readMinutes(a) })}
        </span>
        {!a.pinned && <h2 style={{ fontSize: 18, fontWeight: 800, letterSpacing: '-0.015em', lineHeight: 1.25, margin: 0 }}>{a.titel}</h2>}
        <span style={{ fontSize: 13.5, lineHeight: 1.6, color: 'var(--ink)', fontWeight: 600 }}>{a.teaser}</span>
        {excerpt && <span style={{ fontSize: 13, lineHeight: 1.65, color: 'var(--muted)' }}>{excerpt}</span>}
        <span style={{ fontSize: 12.5, fontWeight: 700, color: 'var(--accent)' }}>{t('card.read')}</span>
      </div>
    </Link>
  );
}
