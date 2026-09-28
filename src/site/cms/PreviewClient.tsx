'use client';

import { useEffect, useMemo, useState, type ReactNode } from 'react';
import type { Article } from '@content/articles';
import type { HomeContent } from '@content/home';
import type { Project } from '@content/projects';
import type { AboutContent, CmsPage, ImprintContent, JourneyEntry, SiteContent } from '@/cms/types';
import { useContentOverride } from '../content/ContentProvider';
import type { NavItem } from '../nav/pages';
import { ImprintPage } from '../pages/ImprintPage';
import { AboutPage } from '../pages/AboutPage';
import { ArticlePage } from '../pages/ArticlePage';
import { CaseStudyPage } from '../pages/CaseStudyPage';
import { HalloPage } from '../pages/HalloPage';
import { ReisePage } from '../pages/ReisePage';
import { EditProvider, setAtPath } from './editing';
import { WidgetEditProvider, WidgetList, clearWidgetSelection, type Block, type Pattern } from './Widgets';
import { PageRenderer } from './PageRenderer';

type Doc = Record<string, unknown> & { id: string };

const upsert = <T extends { id: string }>(list: T[], doc: T) =>
  list.some((x) => x.id === doc.id) ? list.map((x) => (x.id === doc.id ? doc : x)) : [...list, doc];

/**
 * LD-Flow-Vorschau: rendert den Entwurf mit den echten Site-Komponenten. Der Editor (Eltern-Fenster, gleicher
 * Ursprung) schickt jede Formular-Änderung per postMessage; Inline-Änderungen gehen umgekehrt zurück.
 */
export function PreviewClient({ collection, initial }: { collection: string; initial: Doc }) {
  const { base, setOverride } = useContentOverride();
  const [doc, setDoc] = useState<Doc>(initial);
  const [patterns, setPatterns] = useState<Pattern[]>(base.patterns as Pattern[]);

  useEffect(() => {
    const on = (e: MessageEvent) => {
      if (e.origin !== window.location.origin || e.source !== window.parent) return;
      const d = e.data as { type?: string; doc?: Record<string, unknown> };
      if (d?.type === 'ldflow:doc' && d.doc) setDoc({ ...d.doc, id: initial.id });
      const pd = e.data as { type?: string; patterns?: Pattern[] };
      if (pd?.type === 'ldflow:patterns' && Array.isArray(pd.patterns)) setPatterns(pd.patterns);
    };
    window.addEventListener('message', on);
    window.parent.postMessage({ type: 'ldflow:ready' }, window.location.origin);
    // Links in der Vorschau nicht folgen (man bleibt im Editor); Buttons der Site bleiben bedienbar.
    const click = (e: MouseEvent) => {
      const a = (e.target as Element | null)?.closest?.('a[href]');
      if (a && !a.closest('[data-flow-field]')) e.preventDefault();
    };
    document.addEventListener('click', click, true);
    // Klick ins Leere hebt die Widget-Auswahl auf.
    const clear = (e: MouseEvent) => {
      if (!(e.target as Element | null)?.closest?.('[data-widget-path],[role=menu],[role=toolbar]')) clearWidgetSelection();
    };
    document.addEventListener('click', clear);
    return () => {
      document.removeEventListener('click', clear);
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

  const post = (msg: Record<string, unknown>) => window.parent.postMessage(msg, window.location.origin);
  const widgetApi = {
    doc,
    set: api.set,
    focus: (path: string) => post({ type: 'ldflow:focus', path }),
    savePattern: (block: Block) => post({ type: 'ldflow:pattern', block }),
    patterns,
  };

  // Entwurf in die Site-Inhalte einsetzen — gilt für die ganze Seite inkl. Nav/Suche (ContentProvider-Override).
  const merged = useMemo(() => mergeDraft(base, collection, doc, patterns), [base, collection, doc, patterns]);
  useEffect(() => {
    setOverride(merged);
  }, [merged, setOverride]);
  useEffect(() => () => setOverride(null), [setOverride]);

  let body: ReactNode = null;
  switch (collection) {
    case 'projects':
      body = <CaseStudyPage p={doc as unknown as Project} />;
      break;
    case 'articles':
      body = <ArticlePage a={doc as unknown as Article} />;
      break;
    case 'home':
    case 'navigation':
      body = <HalloPage />;
      break;
    case 'about':
      body = <AboutPage />;
      break;
    case 'imprint':
      body = <ImprintPage />;
      break;
    case 'journey':
      body = <ReisePage />;
      break;
    case 'pages':
      body = <PageRenderer page={doc as unknown as CmsPage} />;
      break;
    case 'patterns':
      body = (
        <div style={{ padding: '140px 0 80px', maxWidth: 760, margin: '0 auto' }}>
          <WidgetList blocks={doc.blocks as Block[] | undefined} path="blocks" />
        </div>
      );
      break;
  }
  return (
    <EditProvider api={api}>
      <WidgetEditProvider value={widgetApi}>{body}</WidgetEditProvider>
    </EditProvider>
  );
}

/** Setzt den Entwurf an die passende Stelle der veröffentlichten Inhalte. */
function mergeDraft(base: SiteContent, collection: string, doc: Doc, patterns: Pattern[]): SiteContent {
  const c: SiteContent = { ...base, patterns: patterns as SiteContent['patterns'] };
  switch (collection) {
    case 'projects':
      return { ...c, projects: upsert(base.projects, doc as unknown as Project) };
    case 'articles':
      return { ...c, articles: upsert(base.articles, doc as unknown as Article) };
    case 'home':
      return { ...c, home: doc as unknown as HomeContent };
    case 'about':
      return { ...c, about: doc as unknown as AboutContent };
    case 'navigation':
      return { ...c, navigation: ((doc.items as NavItem[] | undefined) ?? []).filter((x) => x?.label && x?.href) };
    case 'imprint':
      return { ...c, imprint: doc as unknown as ImprintContent };
    case 'journey':
      return { ...c, journey: upsert(base.journey, doc as unknown as JourneyEntry).sort((x, y) => x.year - y.year) };
    case 'patterns':
      return { ...c, patterns: upsert(c.patterns, doc as unknown as SiteContent['patterns'][number]) };
    default:
      return c;
  }
}
