import {
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
  type StationProject,
} from '@content/about';
import { ARTICLES } from '@content/articles';
import { HOME } from '@content/home';
import { IMPRINT, PRIVACY_SECTIONS, type ImprintBlock } from '@content/imprint';
import { JOURNEY } from '@content/journey';
import { JOURNEY_MEDIA } from '@content/journeyMedia';
import { PROJECTS } from '@content/projects';
import { DEFAULT_NAV } from '@/site/nav/pages';

export interface SeedDoc {
  collection: string;
  id: string;
  position: number;
  data: Record<string, unknown>;
}

/** Startinhalte = die 1:1 aus den Prototypen extrahierten Daten (content/*.ts). */
export function seedDocs(): SeedDoc[] {
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
  out.push({ collection: 'navigation', id: 'navigation', position: 0, data: { items: DEFAULT_NAV.map((n) => ({ inMenu: false, ...n })) } });
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

/** Rail-Beschriftung nur speichern, wenn sie vom Namen abweicht (Prototyp: uDefs). */
function railLabel(anchor: string, name: string) {
  const r = ABOUT_RAIL.find((x) => x.id === anchor);
  return r && r.label !== name ? { railLabel: r.label } : {};
}

function project(p: StationProject) {
  return { name: p.name, anchor: p.anchor, zeit: p.zeit, desc: p.desc, stack: [...p.stack], ...railLabel(p.anchor, p.name) };
}

/** Impressum-Blöcke des Prototyps → CMS-Form (Links als [Text](url)). */
function imprintBlock(b: ImprintBlock) {
  if ('h' in b) return { kind: b.size === 24 ? 'h2' : 'h3', text: b.h };
  if ('box' in b) return { kind: 'box', text: b.box.join('\n') };
  if ('credit' in b) return { kind: 'credit', text: b.credit.text, href: b.credit.href };
  const text = typeof b.p === 'string' ? b.p : b.p.map((seg) => (typeof seg === 'string' ? seg : `[${seg.text}](${seg.href})`)).join('');
  return { kind: 'p', text };
}
