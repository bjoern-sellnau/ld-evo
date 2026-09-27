'use client';

import Link from 'next/link';
import type { CSSProperties } from 'react';
import type { Block, CmsPage } from '@/cms/types';
import { ProjectCard, mono } from '../cards/ProjectCard';
import { useContent } from '../content/ContentProvider';
import { inkOn } from '../lib/color';
import { useCoverColor } from '../lib/useCoverColor';
import { Chapter, GallerySlots } from '../pages/detail';
import detailStyles from '../pages/detail.module.css';
import { useSite } from '../settings/SiteProvider';
import { ERich, EText } from './editing';

/**
 * Darstellung frei angelegter LD-Flow-Seiten. Jeder Seitentyp (src/cms/schema.ts → PAGE_TEMPLATES) bekommt hier
 * seinen Kopf; die Blöcke teilen sich alle Templates. Typografie und Abstände folgen den bestehenden Seiten
 * (Impressum/Über mich bzw. Projekt-Detail), damit neue Seiten ohne Designarbeit ins System passen.
 */
export function PageRenderer({ page }: { page: CmsPage }) {
  return page.template === 'cover' ? <CoverPage page={page} /> : <StandardPage page={page} />;
}

function StandardPage({ page }: { page: CmsPage }) {
  const { settings: s, mob } = useSite();
  return (
    <article data-screen-label={page.title} style={{ paddingTop: mob && s.mobModern ? 88 : 150, paddingBottom: 80, maxWidth: 760 }}>
      {(page.kicker || page.kicker === '') && (
        <div style={{ fontFamily: mono, fontSize: 11, letterSpacing: '0.18em', color: 'var(--accent)' }}>
          <EText path="kicker" value={page.kicker} />
        </div>
      )}
      <h1 style={{ fontSize: mob ? 32 : 40, fontWeight: 700, letterSpacing: '-0.03em', lineHeight: 1.1, margin: '12px 0 0' }}>
        <EText path="title" value={page.title} />
      </h1>
      {page.intro !== undefined && (
        <p style={{ margin: '20px 0 0', fontSize: 17, lineHeight: 1.7, color: 'var(--muted)', whiteSpace: 'pre-line' }}>
          <EText path="intro" value={page.intro} multiline />
        </p>
      )}
      <Blocks blocks={page.blocks ?? []} accent="var(--accent)" />
    </article>
  );
}

function CoverPage({ page }: { page: CmsPage }) {
  const { settings: s, mob } = useSite();
  const color = page.color || '#2A1B4A';
  const ink = inkOn(color);
  useCoverColor(color, s.coverFull, s.themeColor);
  const padX = mob ? 18 : 32;
  return (
    <article data-screen-label={page.title}>
      <header
        style={{
          position: 'relative',
          margin: `0 -${padX}px`,
          padding: mob && s.mobModern ? '72px 22px 40px' : mob ? '118px 22px 40px' : '150px 64px 60px',
          background: color,
          color: ink,
          overflow: 'hidden',
          borderRadius: s.coverFull ? 0 : '0 0 44px 44px',
        }}
      >
        <div
          aria-hidden
          style={{
            position: 'absolute',
            inset: 0,
            background: 'repeating-linear-gradient(-45deg,rgba(255,255,255,0.05) 0 2px,transparent 2px 18px)',
          }}
        />
        {page.mono && (
          <span
            aria-hidden
            style={{
              position: 'absolute',
              right: mob ? 18 : 64,
              bottom: 20,
              fontFamily: mono,
              fontWeight: 700,
              fontSize: mob ? 64 : 120,
              opacity: 0.14,
              lineHeight: 1,
            }}
          >
            {page.mono}
          </span>
        )}
        <div style={{ position: 'relative', maxWidth: 1176, margin: '0 auto' }}>
          <div style={{ marginTop: 26, fontFamily: mono, fontSize: 10.5, letterSpacing: '0.12em', opacity: 0.85 }}>
            <EText path="kicker" value={page.kicker} />
          </div>
          <h1
            style={{
              fontSize: mob ? 34 : 56,
              fontWeight: 800,
              letterSpacing: '-0.035em',
              lineHeight: 1.05,
              margin: '14px 0 0',
              maxWidth: 760,
            }}
          >
            <EText path="title" value={page.title} />
          </h1>
          <div style={{ fontSize: 16.5, lineHeight: 1.6, marginTop: 16, maxWidth: 560, opacity: 0.85, whiteSpace: 'pre-line' }}>
            <EText path="intro" value={page.intro} multiline />
          </div>
        </div>
      </header>
      <div style={{ maxWidth: 760, margin: '0 auto', padding: '40px 0 60px' }}>
        <Blocks blocks={page.blocks ?? []} accent={s.coverFull ? ink : 'var(--accent)'} />
      </div>
    </article>
  );
}

function Blocks({ blocks, accent }: { blocks: Block[]; accent: string }) {
  return (
    <>
      {blocks.map((b, i) => (
        <section key={b._id} style={{ marginTop: b.type === 'chapter' ? 0 : 28 }}>
          <BlockView b={b} path={`blocks.${i}`} accent={accent} />
        </section>
      ))}
    </>
  );
}

function BlockView({ b, path, accent }: { b: Block; path: string; accent: string }) {
  const { mob } = useSite();
  const { projects } = useContent();
  switch (b.type) {
    case 'text':
      return <ERich path={`${path}.body`} value={b.body} />;
    case 'chapter':
      return (
        <div style={{ marginTop: 48 }}>
          <Chapter n={b.n ?? ''} label={(b.label ?? '').toUpperCase()} color={accent} first />
        </div>
      );
    case 'image':
      return b.image ? (
        <figure style={{ margin: 0 }}>
          <img
            src={b.image.src}
            alt={b.image.alt}
            loading="lazy"
            style={{ width: '100%', display: 'block', borderRadius: 18, border: '1px solid var(--border)' }}
          />
          {(b.caption || b.caption === '') && (
            <figcaption style={{ fontFamily: mono, fontSize: 10.5, color: 'var(--soft)', marginTop: 10 }}>
              <EText path={`${path}.caption`} value={b.caption} />
            </figcaption>
          )}
        </figure>
      ) : null;
    case 'gallery':
      return (
        <GallerySlots wide={320} small={200} cols2={mob ? '1fr' : '1fr 1fr'} labels={['Bild 1', 'Bild 2', 'Bild 3']} images={b.images} />
      );
    case 'quote':
      return (
        <blockquote style={quote}>
          „<EText path={`${path}.text`} value={b.text} multiline />“
          {(b.by || b.by === '') && (
            <footer style={{ fontFamily: mono, fontSize: 10.5, fontStyle: 'normal', color: 'var(--soft)', marginTop: 10 }}>
              — <EText path={`${path}.by`} value={b.by} />
            </footer>
          )}
        </blockquote>
      );
    case 'cta':
      return b.href ? (
        <Link href={b.href} className={detailStyles.pill} style={{ background: 'var(--accent)', color: 'var(--on-accent)' }}>
          <EText path={`${path}.label`} value={b.label} />
        </Link>
      ) : null;
    case 'projects': {
      const items = (b.ids ?? []).map((id) => projects.find((p) => p.id === id)).filter((p) => !!p);
      return (
        <div>
          {(b.title || b.title === '') && (
            <h2 style={{ fontFamily: mono, fontSize: 10.5, fontWeight: 400, letterSpacing: '0.18em', color: accent, margin: '0 0 16px' }}>
              <EText path={`${path}.title`} value={b.title} />
            </h2>
          )}
          <div style={{ display: 'grid', gridTemplateColumns: mob ? '1fr' : 'repeat(2,1fr)', gap: 14 }}>
            {items.map((p) => (
              <ProjectCard key={p.id} p={p} prefix="c-" variant="grid" />
            ))}
          </div>
        </div>
      );
    }
    case 'stats':
      return (
        <dl
          style={{
            display: 'grid',
            gridTemplateColumns: mob ? '1fr 1fr' : `repeat(${Math.min(4, Math.max(1, b.items?.length ?? 1))},1fr)`,
            gap: 1,
            background: 'var(--hair)',
            border: '1px solid var(--hair)',
            borderRadius: 14,
            overflow: 'hidden',
            margin: 0,
          }}
        >
          {(b.items ?? []).map((it, k) => (
            <div key={k} style={{ background: 'var(--bg)', padding: '14px 16px' }}>
              <dd style={{ margin: 0, fontFamily: mono, fontWeight: 700, fontSize: 22, color: accent }}>{it.value}</dd>
              <dt style={{ fontFamily: mono, fontSize: 9, letterSpacing: '0.14em', color: 'var(--soft)', marginTop: 5 }}>{it.label}</dt>
            </div>
          ))}
        </dl>
      );
  }
}

const quote: CSSProperties = {
  margin: 0,
  padding: '22px 26px',
  borderRadius: 18,
  background: 'var(--card)',
  border: '1px solid var(--border)',
  fontSize: 19,
  lineHeight: 1.55,
  fontStyle: 'italic',
  color: 'var(--ink)',
};
