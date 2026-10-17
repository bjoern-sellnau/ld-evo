'use client';

import type { CSSProperties } from 'react';
import type { Project } from '@content/projects';
import { EText } from '../cms/editing';
import { WidgetList, type Block } from '../cms/Widgets';
import { mono } from '../cards/ProjectCard';
import { useSite } from '../settings/SiteProvider';
import { CaseOutro } from './CaseStudyPage';

/**
 * Projekt-Detailseite im Layout „Story“ (neu, nicht im Prototyp): eine Scroll-Erzählung aus Widgets, gebaut in
 * LD Flow (Feld „Story-Inhalt“, WYSIWYG in der Vorschau). Story-Widgets: src/widgets/story-*.tsx, Bausteine:
 * src/site/story. Beginnt die Story nicht mit „Story: Auftakt“ (enthält das h1), steht oben ein schlichter Kopf.
 * Abschluss wie bei der Case Study: verwandte Projekte und Kontakt.
 */
export function StoryPage({ p }: { p: Project }) {
  const { mob } = useSite();
  const blocks = (p.story ?? []) as Block[];
  const hasHero = blocks[0]?.type === 'story-hero';
  const padX = mob ? 18 : 32;
  return (
    <article data-screen-label="Story" style={{ ['--story-bleed' as string]: `${padX}px` } as CSSProperties}>
      {!hasHero && (
        <header style={{ padding: mob ? '118px 0 36px' : '150px 0 48px', maxWidth: 860 }}>
          <div style={{ fontFamily: mono, fontSize: 10.5, letterSpacing: '0.14em', color: 'var(--accent)' }}>
            <EText path="tag" value={p.tag} /> · {p.datum}
          </div>
          <h1 style={{ fontSize: mob ? 40 : 72, fontWeight: 800, letterSpacing: '-0.045em', lineHeight: 1, margin: '14px 0 0' }}>
            <EText path="name" value={p.name} />
          </h1>
          <p style={{ fontSize: mob ? 17 : 20, lineHeight: 1.55, color: 'var(--muted)', margin: '18px 0 0', maxWidth: 640 }}>
            <EText path="desc" value={p.desc} multiline />
          </p>
        </header>
      )}
      <WidgetList blocks={blocks} path="story" accent="var(--accent)" gap={mob ? 18 : 24} lazyPaint />
      <div style={{ maxWidth: 1176, margin: '0 auto', paddingTop: 40 }}>
        <CaseOutro p={p} acc="var(--accent)" />
      </div>
    </article>
  );
}
