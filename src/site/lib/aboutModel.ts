import { ABOUT_CAPTIONS, ABOUT_IMAGES, LOONA_PROJECTS, STATIONS, type RailTarget } from '@content/about';
import type { AboutContent, CmsStation, CmsStationProject } from '@/cms/types';

/**
 * Über mich: Rail, Bilder und Bildzeilen werden aus den (in LD Flow gepflegten) Stationen abgeleitet — so wie der
 * Prototyp sie aufbaut (uDefs/imgIdx/captions): 5 feste Abschnitte, je Station ein Unterpunkt + ihre Projekte,
 * dann Loona! mit Projekten. Bild 0–3 sind fest (Porträt, Werkzeuge, Arbeit, Loona!), ab 4 je Station eins.
 */
const FIXED: { id: string; label: string; img: number }[] = [
  { id: 'u-intro', label: 'Intro', img: 0 },
  { id: 'u-vita', label: 'Vita', img: 0 },
  { id: 'u-werkzeuge', label: 'Werkzeuge', img: 1 },
  { id: 'u-skills', label: 'Skills', img: 1 },
  { id: 'u-zertifikate', label: 'Zertifikate', img: 2 },
];

export interface AboutImage {
  key: string;
  src?: string;
  alt?: string;
  placeholder: string;
}

export function buildAbout(about: AboutContent) {
  const stations: CmsStation[] =
    about.stations ??
    STATIONS.map((s, i) => ({ ...s, caption: ABOUT_CAPTIONS[4 + i], placeholder: ABOUT_IMAGES[4 + i]?.placeholder, projekte: s.projekte }));
  const loonaProjects: CmsStationProject[] = about.loonaProjects ?? LOONA_PROJECTS;

  const fixedImages: AboutImage[] = ABOUT_IMAGES.slice(0, 4).map((def) => {
    const cms = about.images.find((x) => x.slot === def.slot);
    return { key: def.slot, src: cms?.image?.src ?? def.src, alt: cms?.image?.alt ?? def.alt, placeholder: def.placeholder };
  });
  const fixedCaptions = ABOUT_CAPTIONS.slice(0, 4).map((c, i) => about.images.find((x) => x.slot === ABOUT_IMAGES[i].slot)?.caption || c);

  const images: AboutImage[] = [
    ...fixedImages,
    ...stations.map((s) => ({ key: s.anchor, src: s.image?.src, alt: s.image?.alt, placeholder: s.placeholder || `${s.firma} — Foto` })),
  ];
  const captions = [...fixedCaptions, ...stations.map((s) => s.caption || s.firma)];

  const rail: RailTarget[] = FIXED.map(({ id, label }) => ({ id, label }));
  const imageFor: Record<string, number> = Object.fromEntries(FIXED.map((f) => [f.id, f.img]));
  stations.forEach((s, i) => {
    rail.push({ id: s.anchor, label: s.railLabel || s.firma, sub: true });
    imageFor[s.anchor] = 4 + i;
    for (const p of s.projekte ?? []) {
      rail.push({ id: p.anchor, label: p.railLabel || p.name, proj: true });
      imageFor[p.anchor] = 4 + i;
    }
  });
  rail.push({ id: 'u-loona', label: 'Loona! Designs' });
  imageFor['u-loona'] = 3;
  for (const p of loonaProjects) {
    rail.push({ id: p.anchor, label: p.railLabel || p.name, proj: true });
    imageFor[p.anchor] = 3;
  }
  return { stations, loonaProjects, images, captions, rail, imageFor };
}
