'use client';

import { useEffect, useMemo, useState, type ReactNode } from 'react';
import type { Article } from '@content/articles';
import type { HomeContent } from '@content/home';
import type { Project } from '@content/projects';
import type { AboutContent, CmsPage, JourneyEntry } from '@/cms/types';
import { ContentProvider, useContent } from '../content/ContentProvider';
import { AboutPage } from '../pages/AboutPage';
import { ArticlePage } from '../pages/ArticlePage';
import { CaseStudyPage } from '../pages/CaseStudyPage';
import { HalloPage } from '../pages/HalloPage';
import { ReisePage } from '../pages/ReisePage';
import { EditProvider, setAtPath } from './editing';
import { PageRenderer } from './PageRenderer';

type Doc = Record<string, unknown> & { id: string };

const upsert = <T extends { id: string }>(list: T[], doc: T) =>
  list.some((x) => x.id === doc.id) ? list.map((x) => (x.id === doc.id ? doc : x)) : [...list, doc];

/**
 * LD-Flow-Vorschau: rendert den Entwurf mit den echten Site-Komponenten. Der Editor (Eltern-Fenster, gleicher
 * Ursprung) schickt jede Formular-Änderung per postMessage; Inline-Änderungen gehen umgekehrt zurück.
 */
export function PreviewClient({ collection, initial }: { collection: string; initial: Doc }) {
  const content = useContent();
  const [doc, setDoc] = useState<Doc>(initial);

  useEffect(() => {
    const on = (e: MessageEvent) => {
      if (e.origin !== window.location.origin || e.source !== window.parent) return;
      const d = e.data as { type?: string; doc?: Record<string, unknown> };
      if (d?.type === 'ldflow:doc' && d.doc) setDoc({ ...d.doc, id: initial.id });
    };
    window.addEventListener('message', on);
    window.parent.postMessage({ type: 'ldflow:ready' }, window.location.origin);
    // Links in der Vorschau nicht folgen (man bleibt im Editor); Buttons der Site bleiben bedienbar.
    const click = (e: MouseEvent) => {
      const a = (e.target as Element | null)?.closest?.('a[href]');
      if (a && !a.closest('[data-flow-field]')) e.preventDefault();
    };
    document.addEventListener('click', click, true);
    return () => {
      window.removeEventListener('message', on);
      document.removeEventListener('click', click, true);
    };
  }, [initial.id]);

  const api = useMemo(
    () => ({
      set(path: string, value: unknown) {
        setDoc((d) => setAtPath(d, path, value));
        window.parent.postMessage({ type: 'ldflow:set', path, value }, window.location.origin);
      },
    }),
    [],
  );

  let merged = content;
  let body: ReactNode = null;
  switch (collection) {
    case 'projects': {
      const p = doc as unknown as Project;
      merged = { ...content, projects: upsert(content.projects, p) };
      body = <CaseStudyPage p={p} />;
      break;
    }
    case 'articles': {
      const a = doc as unknown as Article;
      merged = { ...content, articles: upsert(content.articles, a) };
      body = <ArticlePage a={a} />;
      break;
    }
    case 'home':
      merged = { ...content, home: doc as unknown as HomeContent };
      body = <HalloPage />;
      break;
    case 'about':
      merged = { ...content, about: doc as unknown as AboutContent };
      body = <AboutPage />;
      break;
    case 'journey': {
      const j = upsert(content.journey, doc as unknown as JourneyEntry).sort((x, y) => x.year - y.year);
      merged = { ...content, journey: j };
      body = <ReisePage />;
      break;
    }
    case 'pages':
      body = <PageRenderer page={doc as unknown as CmsPage} />;
      break;
  }
  return (
    <ContentProvider value={merged}>
      <EditProvider api={api}>{body}</EditProvider>
    </ContentProvider>
  );
}
