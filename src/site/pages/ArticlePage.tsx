'use client';

import type { MouseEvent } from 'react';
import { ARTICLES, type Article } from '@content/articles';
import { mono } from '../cards/ProjectCard';
import { inkOn, lum } from '../lib/color';
import { articleHref } from '../lib/routes';
import { useCoverColor } from '../lib/useCoverColor';
import { useSite } from '../settings/SiteProvider';
import { GallerySlots, RelatedCard, related } from './detail';
import styles from './detail.module.css';

/** Artikel-Detail. Markup/Werte: Prototyp Zeile 640–686. */
export function ArticlePage({ a }: { a: Article }) {
  const { settings: s, mob, vtTarget, morphOk, from, navigate } = useSite();
  const coverFull = s.coverFull;
  useCoverColor(a.color, coverFull);
  const ink = inkOn(a.color);
  const acc = coverFull ? ink : 'var(--accent)';
  const rel = related(ARTICLES, a);
  const padX = mob ? 18 : 32;
  const go = (href: string) => (e: MouseEvent<HTMLAnchorElement>) => {
    if (e.metaKey || e.ctrlKey || e.shiftKey || e.button !== 0) return;
    e.preventDefault();
    navigate(href);
  };

  return (
    <article data-screen-label="Artikel" data-ldsample={coverFull ? lum(a.color).toFixed(2) : '0.03,0.98'}>
      <header
        data-ldsample={lum(a.color).toFixed(2)}
        style={{
          viewTransitionName: morphOk && vtTarget === a.id ? `${from === '/' ? 'artn-' : 'art-'}${a.id}` : 'none',
          position: 'relative',
          margin: `0 -${padX}px`,
          padding: mob && s.mobModern ? '72px 22px 38px' : mob ? '118px 22px 38px' : '150px 64px 56px',
          background: a.color,
          color: ink,
          borderRadius: coverFull ? 0 : '0 0 44px 44px',
        }}
      >
        <div style={{ maxWidth: 760, margin: '0 auto' }}>
          <div
            style={{
              display: 'flex',
              gap: 12,
              alignItems: 'center',
              marginTop: 24,
              fontFamily: mono,
              fontSize: 10.5,
              letterSpacing: '0.12em',
              opacity: 0.85,
            }}
          >
            <span>{a.kat}</span>
            <span aria-hidden>·</span>
            <span>{a.datum}</span>
            {a.draft && (
              <>
                <span aria-hidden>·</span>
                <span style={{ border: `1px solid ${ink}`, borderRadius: 999, padding: '3px 9px' }}>ENTWURF</span>
              </>
            )}
          </div>
          <h1 style={{ fontSize: mob ? 29 : 46, fontWeight: 800, letterSpacing: '-0.03em', lineHeight: 1.12, margin: '14px 0 0' }}>
            {a.titel}
          </h1>
          <div style={{ fontSize: 16, lineHeight: 1.6, marginTop: 14, opacity: 0.85, fontStyle: 'italic' }}>{a.teaser}</div>
        </div>
      </header>

      <div style={{ maxWidth: 680, margin: '0 auto', padding: '48px 0 60px' }}>
        {a.body.map((p, i) => (
          <p key={i} style={{ margin: '0 0 22px', fontSize: 16.5, lineHeight: 1.8, color: 'var(--muted)' }}>
            {p}
          </p>
        ))}
        <div style={{ marginTop: 40 }}>
          <GallerySlots
            wide={300}
            small={180}
            cols2={mob ? '1fr' : '1fr 1fr'}
            labels={['Artikel-Bild', 'Screenshot / Diagramm', 'Code-Ausschnitt / Foto']}
          />
        </div>

        <section style={{ marginTop: 44 }} aria-labelledby="rel-title">
          <h2 id="rel-title" style={{ fontFamily: mono, fontSize: 10.5, fontWeight: 400, letterSpacing: '0.18em', color: acc, margin: 0 }}>
            VERWANDTE ARTIKEL
          </h2>
          <div style={{ display: 'grid', gridTemplateColumns: mob ? '1fr' : 'repeat(3,1fr)', gap: 12, marginTop: 16 }}>
            {rel.map((r) => (
              <RelatedCard
                key={r.id}
                href={articleHref(r)}
                onClick={go(articleHref(r))}
                color={r.color}
                ink={inkOn(r.color)}
                meta={`${r.kat} · ${r.datum}`}
              >
                <span style={{ fontSize: 15, fontWeight: 800, letterSpacing: '-0.015em', lineHeight: 1.35, textWrap: 'pretty' }}>
                  {r.titel}
                </span>
              </RelatedCard>
            ))}
          </div>
        </section>

        <div
          style={{ borderTop: '1px solid var(--hair)', marginTop: 28, paddingTop: 22, display: 'flex', justifyContent: 'space-between' }}
        >
          <a href="/tech" onClick={go('/tech')} className={styles.textLink} style={{ color: acc }}>
            ‹ Mehr Artikel
          </a>
          <span style={{ fontFamily: mono, fontSize: 10.5, color: 'var(--soft)' }}>— Björn Sellnau, Berlin</span>
        </div>
      </div>
    </article>
  );
}
