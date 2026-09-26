import { LOONA_NEUTRALS, LOONA_PRODUCTS, LOONA_PRODUCT_KEYS } from '@/components/brand/products';
import { contrastRatio } from './contrast';

export interface ContrastPair {
  label: string;
  fg: string;
  bg: string;
  ratio: number;
}

const { ink, cream, paper, mutedDark, mutedLight } = LOONA_NEUTRALS;

/** Alle Text-Kombinationen der Lockups (README §2 / §9; Ziel ≥ 4.5:1). */
export function brandTextPairs(): ContrastPair[] {
  const pairs: Omit<ContrastPair, 'ratio'>[] = [
    { label: 'Cream auf Ink (Wortmarke dunkel)', fg: cream, bg: ink },
    { label: 'Ink auf Paper (Wortmarke hell)', fg: ink, bg: paper },
    { label: 'Muted dark auf Ink (Unterzeile)', fg: mutedDark, bg: ink },
    { label: 'Muted light auf Paper (Unterzeile)', fg: mutedLight, bg: paper },
    ...LOONA_PRODUCT_KEYS.flatMap((k) => [
      { label: `${LOONA_PRODUCTS[k].name} Farbe auf Ink`, fg: LOONA_PRODUCTS[k].color, bg: ink },
      { label: `${LOONA_PRODUCTS[k].name} Deep auf Paper`, fg: LOONA_PRODUCTS[k].deep, bg: paper },
    ]),
  ];
  return pairs.map((p) => ({ ...p, ratio: contrastRatio(p.fg, p.bg) }));
}
