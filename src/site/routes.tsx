import type { Metadata } from 'next';
import type { ReactNode } from 'react';
import { notFound } from 'next/navigation';
import { getPage, getPageSlugs, getSiteContent, isFallback } from '@/cms/content';
import { PageRenderer } from '@/site/cms/PageRenderer';
import { translate, type UiKey } from '@/site/i18n/dict';
import type { Locale } from '@/site/i18n/locale';
import type { SiteContent } from '@/cms/types';
import { localizePath } from '@/site/i18n/locale';
import { AboutPage } from '@/site/pages/AboutPage';
import { ArticlePage } from '@/site/pages/ArticlePage';
import { CaseStudyPage } from '@/site/pages/CaseStudyPage';
import { CatalogPage } from '@/site/pages/CatalogPage';
import { HalloPage } from '@/site/pages/HalloPage';
import { ImprintPage } from '@/site/pages/ImprintPage';
import { ReisePage } from '@/site/pages/ReisePage';
import { TechPage } from '@/site/pages/TechPage';
import { JsonLd } from '@/site/seo/JsonLd';
import { buildFeed } from '@/site/seo/feed';
import { PERSON, SITE_URL, absUrl, isoMonth, pageMeta } from '@/site/seo/seo';
import { OG_CONTENT_TYPE, OG_SIZE, renderOg } from '@/site/og/renderOg';

/**
 * Seiten der Site als Fabriken je Sprache — die Route-Dateien unter src/app/(main)/(site) (deutsch) und
 * src/app/(en)/en (englisch) sind nur dünne Hüllen darum. Pfade sind kanonisch (deutsch); Adressen, hreflang und
 * JSON-LD entstehen je Sprache über die Routentabelle (src/site/i18n/locale.ts).
 *
 * „translated“: Die englische Seite ist eine echte Übersetzung, wenn ihr Hauptinhalt nicht auf die deutsche Fassung
 * zurückfällt (Listen: kein Eintrag fällt zurück). Sonst ist sie noindex und die deutsche Seite verweist nicht auf sie.
 */

type SlugParams = { params: Promise<{ slug: string }> };

/** Rückfall auf Deutsch: Sprache des Inhalts auszeichnen (WCAG 3.1.2). Ohne Rückfall kein zusätzliches Element. */
function Lang({ de, children }: { de: boolean; children: ReactNode }) {
  return de ? (
    <div lang="de" style={{ display: 'contents' }}>
      {children}
    </div>
  ) : (
    children
  );
}
const t = (l: Locale, k: UiKey) => translate(l, k);
/**
 * Gibt es eine echte englische Fassung? Immer gegen die ENGLISCHEN Inhalte prüfen — auch auf deutschen Seiten, denn
 * dort entscheidet es, ob hreflang auf Englisch verweist. Listen: jeder Eintrag muss übersetzt sein.
 */
function enReady(pick: (c: SiteContent) => unknown): boolean {
  const v = pick(getSiteContent('en'));
  const docs = Array.isArray(v) ? v : [v];
  return docs.length > 0 && docs.every((d) => !!d && !isFallback(d));
}

export function homeRoute(locale: Locale) {
  return {
    generateMetadata: (): Metadata => pageMeta({ path: '/', locale, translated: enReady((c) => c.home) }),
    Page: function Page() {
      return (
        <>
          <JsonLd
            data={{
              '@context': 'https://schema.org',
              '@graph': [
                { ...PERSON, '@id': `${SITE_URL}/#person`, url: absUrl('/') },
                {
                  '@type': 'WebSite',
                  name: 'Loona! Designs',
                  url: absUrl(localizePath('/', locale)),
                  inLanguage: locale,
                  author: { '@id': `${SITE_URL}/#person` },
                },
              ],
            }}
          />
          <Lang de={locale !== 'de' && isFallback(getSiteContent(locale).home)}>
            <HalloPage />
          </Lang>
        </>
      );
    },
  };
}

export function catalogRoute(kind: 'projekte' | 'labs', locale: Locale) {
  const path = kind === 'labs' ? '/labs' : '/projekte';
  return {
    generateMetadata: (): Metadata =>
      pageMeta({
        title: t(locale, kind === 'labs' ? 'seo.labsTitle' : 'seo.projectsTitle'),
        path,
        locale,
        translated: enReady((c) => c.projects.filter((p) => p.kind === kind)),
      }),
    Page: function Page() {
      return <CatalogPage kind={kind} />;
    },
  };
}

/** Projekte/Archiv unter /projekte, Labs unter /labs (src/site/lib/routes.ts). Neue Einträge rendern bei Bedarf. */
export function projectRoute(kind: 'projekte' | 'labs', locale: Locale) {
  const items = () => getSiteContent(locale).projects.filter((p) => (kind === 'labs' ? p.kind === 'labs' : p.kind !== 'labs'));
  const base = kind === 'labs' ? '/labs' : '/projekte';
  return {
    generateStaticParams: () => items().map((p) => ({ slug: p.id })),
    generateMetadata: async ({ params }: SlugParams): Promise<Metadata> => {
      const { slug } = await params;
      const p = items().find((x) => x.id === slug);
      return p
        ? pageMeta({
            title: `${p.name} — Loona! Designs`,
            description: p.desc,
            path: `${base}/${p.id}`,
            type: 'article',
            locale,
            translated: enReady((c) => c.projects.find((x) => x.id === p.id)),
          })
        : {};
    },
    Page: async function Page({ params }: SlugParams) {
      const { slug } = await params;
      const p = items().find((x) => x.id === slug);
      if (!p) notFound();
      const fallback = isFallback(p);
      return (
        <>
          <JsonLd
            data={{
              '@context': 'https://schema.org',
              '@type': 'CreativeWork',
              name: p.name,
              description: p.desc,
              url: absUrl(localizePath(`${base}/${p.id}`, locale)),
              genre: p.kat,
              dateCreated: isoMonth(p.datum),
              keywords: p.stack.join(', '),
              inLanguage: fallback ? 'de' : locale,
              creator: PERSON,
            }}
          />
          <Lang de={fallback}>
            <CaseStudyPage key={p.id} p={p} />
          </Lang>
        </>
      );
    },
    ogImage: async ({ params }: SlugParams) => {
      const { slug } = await params;
      const p = items().find((x) => x.id === slug);
      return renderOg({
        kicker: p ? `${p.tag} · ${p.datum}` : kind === 'labs' ? 'Labs' : t(locale, 'tab.projects'),
        title: p?.name ?? 'Loona! Designs',
        sub: p?.desc,
        accent: p?.color,
      });
    },
  };
}

export function techRoute(locale: Locale) {
  return {
    generateMetadata: (): Metadata =>
      pageMeta({
        title: t(locale, 'seo.techTitle'),
        description: t(locale, 'tech.lead'),
        path: '/tech',
        locale,
        translated: enReady((c) => c.articles),
      }),
    Page: function Page() {
      return <TechPage />;
    },
  };
}

export function articleRoute(locale: Locale) {
  const byId = (id: string) => getSiteContent(locale).articles.find((a) => a.id === id);
  return {
    generateStaticParams: () => getSiteContent(locale).articles.map((a) => ({ slug: a.id })),
    generateMetadata: async ({ params }: SlugParams): Promise<Metadata> => {
      const a = byId((await params).slug);
      // Entwürfe mit Platzhaltertext nicht indexieren.
      return a
        ? pageMeta({
            title: `${a.titel} — .Tech`,
            description: a.teaser,
            path: `/tech/${a.id}`,
            type: 'article',
            noindex: a.draft,
            locale,
            translated: enReady((c) => c.articles.find((x) => x.id === a.id)),
          })
        : {};
    },
    Page: async function Page({ params }: SlugParams) {
      const a = byId((await params).slug);
      if (!a) notFound();
      const fallback = isFallback(a);
      return (
        <>
          <JsonLd
            data={{
              '@context': 'https://schema.org',
              '@type': 'BlogPosting',
              headline: a.titel,
              description: a.teaser,
              url: absUrl(localizePath(`/tech/${a.id}`, locale)),
              datePublished: isoMonth(a.datum),
              articleSection: a.kat,
              inLanguage: fallback ? 'de' : locale,
              author: PERSON,
            }}
          />
          <Lang de={fallback}>
            <ArticlePage key={a.id} a={a} />
          </Lang>
        </>
      );
    },
    ogImage: async ({ params }: SlugParams) => {
      const a = byId((await params).slug);
      return renderOg({
        kicker: a ? `.Tech · ${a.kat} · ${a.datum}` : '.Tech',
        title: a?.titel ?? '.Tech',
        sub: a?.teaser,
        accent: a?.color,
      });
    },
  };
}

/** Singletons: Über mich, Reise, Impressum. */
export function aboutRoute(locale: Locale) {
  return {
    generateMetadata: (): Metadata =>
      pageMeta({
        title: t(locale, 'seo.aboutTitle'),
        path: '/ueber-mich',
        locale,
        translated: enReady((c) => c.about),
      }),
    Page: function Page() {
      const fallback = isFallback(getSiteContent(locale).about) && locale !== 'de';
      return (
        <Lang de={fallback}>
          <AboutPage />
        </Lang>
      );
    },
  };
}

export function journeyRoute(locale: Locale) {
  return {
    generateMetadata: (): Metadata =>
      pageMeta({
        title: t(locale, 'seo.journeyTitle'),
        description: t(locale, 'seo.journeyDescription'),
        path: '/reise',
        locale,
        translated: enReady((c) => c.journey),
      }),
    Page: function Page() {
      return <ReisePage />;
    },
  };
}

export function imprintRoute(locale: Locale) {
  return {
    generateMetadata: (): Metadata =>
      pageMeta({
        title: t(locale, 'seo.imprintTitle'),
        path: '/impressum',
        locale,
        translated: enReady((c) => c.imprint),
      }),
    Page: function Page() {
      const fallback = isFallback(getSiteContent(locale).imprint) && locale !== 'de';
      return (
        <Lang de={fallback}>
          <ImprintPage />
        </Lang>
      );
    },
  };
}

/** Frei angelegte LD-Flow-Seiten. Feste Routen (projekte, labs, …) haben Vorrang; neue Seiten rendern bei Bedarf. */
export function cmsPageRoute(locale: Locale) {
  return {
    generateStaticParams: () => getPageSlugs().map((slug) => ({ slug })),
    generateMetadata: async ({ params }: SlugParams): Promise<Metadata> => {
      const p = getPage((await params).slug, locale);
      return p
        ? pageMeta({
            title: `${p.title} — Loona! Designs`,
            description: p.description || undefined,
            path: `/${p.id}`,
            locale,
            translated: ((en) => !!en && !isFallback(en))(getPage(p.id, 'en')),
          })
        : {};
    },
    Page: async function Page({ params }: SlugParams) {
      const p = getPage((await params).slug, locale);
      if (!p) notFound();
      return (
        <Lang de={isFallback(p)}>
          <PageRenderer key={p.id} page={p} />
        </Lang>
      );
    },
  };
}

export function feedRoute(locale: Locale) {
  return () =>
    new Response(buildFeed(getSiteContent(locale).articles, locale), {
      headers: { 'Content-Type': 'application/rss+xml; charset=utf-8' },
    });
}

export const OG = { size: OG_SIZE, contentType: OG_CONTENT_TYPE };
