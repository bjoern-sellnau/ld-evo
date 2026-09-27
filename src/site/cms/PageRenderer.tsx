'use client';

import type { CmsPage } from '@/cms/types';
import { mono } from '../cards/ProjectCard';
import { inkOn } from '../lib/color';
import { useCoverColor } from '../lib/useCoverColor';
import { useSite } from '../settings/SiteProvider';
import { EText } from './editing';
import { WidgetList, type Block } from './Widgets';

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
      <div style={{ marginTop: 28 }}>
        <WidgetList blocks={page.blocks as Block[] | undefined} path="blocks" accent="var(--accent)" />
      </div>
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
        <WidgetList blocks={page.blocks as Block[] | undefined} path="blocks" accent={s.coverFull ? ink : 'var(--accent)'} />
      </div>
    </article>
  );
}
