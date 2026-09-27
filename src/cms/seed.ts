import { ABOUT_IMAGES, ABOUT_TEXT, QUALIFICATIONS, SKILL_GROUPS, TOOLS } from '@content/about';
import { ARTICLES } from '@content/articles';
import { HOME } from '@content/home';
import { JOURNEY } from '@content/journey';
import { JOURNEY_MEDIA } from '@content/journeyMedia';
import { PROJECTS } from '@content/projects';

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
      images: ABOUT_IMAGES.map((im) => ({ slot: im.slot, ...(im.src ? { image: { src: im.src, alt: im.alt ?? '' } } : {}) })),
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
