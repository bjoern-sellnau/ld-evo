/**
 * Favicon-Auswahl (neu, nicht im Prototyp — Wunsch vom 11.10.2026; Einstellung ld-favicon).
 * Varianten aus denselben Formen wie public/favicon.svg (Ink-Kachel, rx 14, LD-Glyph) bzw. dem Negativraum-Logo
 * (assets/negative-space-demo.svg, wie LoonaNegative). Umgeschaltet wird zur Laufzeit über die <link rel="icon">-Elemente.
 */
const INK = '#171310';
const ORANGE = '#FF7816';
const CREAM = '#F7F2EA';

const glyph = (fg: string) =>
  `<path d="M0 3H8V35H19L22 43H0Z" fill="${fg}"/><path d="M11 3H24A20 20 0 0 1 24 43H25L19 27H16V11H11ZM21 11H24A12 12 0 0 1 24 35L21 27Z" fill="${fg}" fill-rule="evenodd"/>`;
const tile = (bg: string, fg: string) =>
  `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64"><rect width="64" height="64" rx="14" fill="${bg}"/><g transform="translate(9.6 12.6) scale(1.018)">${glyph(fg)}</g></svg>`;
const negative = (fg: string) =>
  `<svg xmlns="http://www.w3.org/2000/svg" viewBox="6 9 32 28"><path d="M8 11H16V27H19L22 35H8Z" fill="${fg}"/><path d="M21 11H24A12 12 0 0 1 24 35L21 27Z" fill="${fg}"/></svg>`;

export type FaviconChoice = 'default' | 'color' | 'cream' | 'neg' | 'negcream';

export const FAVICONS: { key: FaviconChoice; label: string; svg: string }[] = [
  { key: 'default', label: 'Ink-Kachel', svg: tile(INK, ORANGE) },
  { key: 'color', label: 'Farb-Kachel', svg: tile(ORANGE, INK) },
  { key: 'cream', label: 'Cream-Kachel', svg: tile(CREAM, INK) },
  { key: 'neg', label: 'Negativ Orange', svg: negative(ORANGE) },
  { key: 'negcream', label: 'Negativ Cream', svg: negative(CREAM) },
];

export const faviconUri = (svg: string) => `data:image/svg+xml,${encodeURIComponent(svg)}`;

/** Setzt alle Icon-Links auf die Variante; 'default' stellt die ausgelieferten Dateien wieder her. */
export function applyFavicon(choice: string) {
  const links = document.querySelectorAll<HTMLLinkElement>('link[rel~="icon"]');
  const f = FAVICONS.find((x) => x.key === choice);
  links.forEach((l) => {
    if (l.dataset.ldOrig === undefined) {
      l.dataset.ldOrig = l.getAttribute('href') ?? '';
      l.dataset.ldOrigType = l.getAttribute('type') ?? '';
    }
    if (!f || choice === 'default') {
      l.setAttribute('href', l.dataset.ldOrig);
      if (l.dataset.ldOrigType) l.setAttribute('type', l.dataset.ldOrigType);
      else l.removeAttribute('type');
      return;
    }
    l.setAttribute('href', faviconUri(f.svg));
    l.setAttribute('type', 'image/svg+xml');
  });
}
