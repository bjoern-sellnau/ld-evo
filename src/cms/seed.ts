import * as aboutDe from '@content/about';
import type { StationProject } from '@content/about';
import * as articlesDe from '@content/articles';
import * as homeDe from '@content/home';
import * as imprintDe from '@content/imprint';
import type { ImprintBlock } from '@content/imprint';
import * as journeyDe from '@content/journey';
import { JOURNEY_MEDIA } from '@content/journeyMedia';
import * as projectsDe from '@content/projects';
import * as aboutEn from '@content/en/about';
import * as articlesEn from '@content/en/articles';
import * as homeEn from '@content/en/home';
import * as imprintEn from '@content/en/imprint';
import * as journeyEn from '@content/en/journey';
import * as projectsEn from '@content/en/projects';
import type { Locale } from '@/site/i18n/locale';
import { DEFAULT_NAV, DEFAULT_NAV_EN } from '@/site/nav/pages';

/** Startinhalte je Sprache: deutsch = 1:1 aus den Prototypen, englisch = Übersetzungsentwurf (content/en). */
const BUNDLES = {
  de: {
    about: aboutDe,
    articles: articlesDe,
    home: homeDe,
    imprint: imprintDe,
    journey: journeyDe,
    projects: projectsDe,
    nav: DEFAULT_NAV,
  },
  en: {
    about: aboutEn,
    articles: articlesEn,
    home: homeEn,
    imprint: imprintEn,
    journey: journeyEn,
    projects: projectsEn,
    nav: DEFAULT_NAV_EN,
  },
};

export interface SeedDoc {
  collection: string;
  id: string;
  position: number;
  data: Record<string, unknown>;
}

/**
 * Startinhalte = die 1:1 aus den Prototypen extrahierten Daten (content/*.ts) bzw. deren englischer Entwurf
 * (content/en/*.ts, gleiche Struktur und IDs).
 */
export function seedDocs(locale: Locale = 'de'): SeedDoc[] {
  const {
    about: {
      ABOUT_CAPTIONS,
      ABOUT_IMAGES,
      ABOUT_RAIL,
      ABOUT_TEXT,
      IMPRINT_RAIL,
      LOONA_PROJECTS,
      QUALIFICATIONS,
      SKILL_GROUPS,
      STATIONS,
      TOOLS,
    },
    articles: { ARTICLES },
    home: { HOME },
    imprint: { IMPRINT, PRIVACY_SECTIONS },
    journey: { JOURNEY },
    projects: { PROJECTS },
    nav,
  } = BUNDLES[locale];
  const railLabel = (anchor: string, name: string) => {
    const r = ABOUT_RAIL.find((x) => x.id === anchor);
    return r && r.label !== name ? { railLabel: r.label } : {};
  };
  const project = (p: StationProject) => ({
    name: p.name,
    anchor: p.anchor,
    zeit: p.zeit,
    desc: p.desc,
    stack: [...p.stack],
    ...railLabel(p.anchor, p.name),
  });
  const out: SeedDoc[] = [];
  out.push({ collection: 'home', id: 'home', position: 0, data: { ...HOME } });
  out.push({
    collection: 'about',
    id: 'about',
    position: 0,
    data: {
      ...ABOUT_TEXT,
      tools: [...TOOLS],
      skills: SKILL_GROUPS.map((g) => ({ titel: g.titel, chips: [...g.chips] })),
      qualifications: QUALIFICATIONS.map((q) => ({ ...q })),
      // Feste Abschnittsbilder (Porträt, Werkzeuge, Arbeit, Loona!) — Stationen tragen ihr Bild selbst.
      images: ABOUT_IMAGES.slice(0, 4).map((im, i) => ({
        slot: im.slot,
        caption: ABOUT_CAPTIONS[i],
        ...(im.src ? { image: { src: im.src, alt: im.alt ?? '' } } : {}),
      })),
      stations: STATIONS.map((st, i) => {
        const im = ABOUT_IMAGES[4 + i];
        return {
          firma: st.firma,
          anchor: st.anchor,
          rolle: st.rolle,
          zeit: st.zeit,
          desc: st.desc,
          ...railLabel(st.anchor, st.firma),
          caption: ABOUT_CAPTIONS[4 + i] ?? '',
          placeholder: im?.placeholder ?? '',
          ...(im?.src ? { image: { src: im.src, alt: im.alt ?? '' } } : {}),
          projekte: st.projekte.map(project),
        };
      }),
      loonaProjects: LOONA_PROJECTS.map(project),
    },
  });
  out.push({ collection: 'navigation', id: 'navigation', position: 0, data: { items: nav.map((n) => ({ inMenu: false, ...n })) } });
  out.push({
    collection: 'imprint',
    id: 'imprint',
    position: 0,
    data: {
      ...IMPRINT,
      address: [...IMPRINT.address],
      sections: PRIVACY_SECTIONS.map((sec) => {
        const r = IMPRINT_RAIL.find((x) => x.id === sec.id);
        return { id: sec.id, rail: r?.label ?? sec.id, sub: r?.sub === true, blocks: sec.blocks.map(imprintBlock) };
      }),
    },
  });
  PROJECTS.forEach((p, i) => {
    const { id, ...data } = p;
    out.push({ collection: 'projects', id, position: i, data: data as Record<string, unknown> });
  });
  ARTICLES.forEach((a, i) => {
    const { id, ...data } = a;
    out.push({ collection: 'articles', id, position: i, data: data as Record<string, unknown> });
  });
  JOURNEY.forEach((st, i) => {
    const shot = JOURNEY_MEDIA[`ld-shot-${st.year}`];
    const m1 = JOURNEY_MEDIA[`ld-mini-${st.year}-1`];
    const m2 = JOURNEY_MEDIA[`ld-mini-${st.year}-2`];
    out.push({
      collection: 'journey',
      id: String(st.year),
      position: i,
      data: {
        ...st,
        steps: st.steps.map((s) => ({ ...s })),
        ...(shot ? { shot: { src: shot.src, alt: shot.alt } } : {}),
        insights: [m1 ? { src: m1.src, alt: m1.alt } : null, m2 ? { src: m2.src, alt: m2.alt } : null],
      },
    });
  });
  return out;
}

/** Impressum-Blöcke des Prototyps → CMS-Form (Links als [Text](url)). */
function imprintBlock(b: ImprintBlock) {
  if ('h' in b) return { kind: b.size === 24 ? 'h2' : 'h3', text: b.h };
  if ('box' in b) return { kind: 'box', text: b.box.join('\n') };
  if ('credit' in b) return { kind: 'credit', text: b.credit.text, href: b.credit.href };
  const text = typeof b.p === 'string' ? b.p : b.p.map((seg) => (typeof seg === 'string' ? seg : `[${seg.text}](${seg.href})`)).join('');
  return { kind: 'p', text };
}
