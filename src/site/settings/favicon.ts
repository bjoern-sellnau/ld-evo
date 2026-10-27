import { LOONA_BADGE as B, LOONA_TONES, LOONA_ZEICHEN as Z } from '@/components/brand/products';

/**
 * Favicon-Auswahl (neu, nicht im Prototyp — Wunsch vom 11.10.2026; Einstellung ld-favicon).
 * Formen aus dem Brand-System 2026-10 (docs/design_handoff_loona_brand): Standard = ausgelieferte Dateien
 * (public/favicon.svg = Zeichen, assets/favicon.svg), Kacheln = Badge-Geometrie (rx 14, LD mittig).
 * Umgeschaltet wird zur Laufzeit über die <link rel="icon">-Elemente.
 * Bis 26.10.2026 war der Standard die Ink-Kachel; sie heißt jetzt „ink“. Der alte Schlüssel „neg“ (Negativraum
 * in Orange) ist seitdem dasselbe wie der Standard und wird darauf abgebildet (faviconChoice).
 */
const INK = LOONA_TONES.ink;
const ORANGE = LOONA_TONES.orange;
const CREAM = LOONA_TONES.cream;

const t = B.transform;
const tile = (bg: string, fg: string) =>
  `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64"><rect width="64" height="64" rx="${B.rx}" fill="${bg}"/><g transform="translate(${t.x} ${t.y}) scale(${t.scale})"><path d="${B.l}" fill="${fg}"/><path d="${B.d}" fill="${fg}" fill-rule="evenodd"/></g></svg>`;
export const zeichenSvg = (fg: string, extra = '') =>
  `<svg xmlns="http://www.w3.org/2000/svg" viewBox="${Z.viewBox}"><path d="${Z.l}" fill="${fg}"/><path d="${Z.moon}" fill="${fg}"/>${extra}</svg>`;

export type FaviconChoice = 'default' | 'ink' | 'color' | 'cream' | 'negcream';

export const FAVICONS: { key: FaviconChoice; label: string; svg: string }[] = [
  { key: 'default', label: 'Zeichen', svg: zeichenSvg(ORANGE) },
  { key: 'ink', label: 'Ink-Kachel', svg: tile(INK, ORANGE) },
  { key: 'color', label: 'Farb-Kachel', svg: tile(ORANGE, INK) },
  { key: 'cream', label: 'Cream-Kachel', svg: tile(CREAM, INK) },
  { key: 'negcream', label: 'Zeichen Cream', svg: zeichenSvg(CREAM) },
];

/** Gespeicherte Auswahl → Eintrag (alter Schlüssel „neg“ = Zeichen in Orange = Standard). */
export const faviconChoice = (key: string) => FAVICONS.find((f) => f.key === (key === 'neg' ? 'default' : key));

export const faviconUri = (svg: string) => `data:image/svg+xml,${encodeURIComponent(svg)}`;

/** Setzt alle Icon-Links auf die Variante; 'default' stellt die ausgelieferten Dateien wieder her. */
export function applyFavicon(choice: string) {
  const links = document.querySelectorAll<HTMLLinkElement>('link[rel~="icon"]');
  const f = faviconChoice(choice);
  links.forEach((l) => {
    if (l.dataset.ldOrig === undefined) {
      l.dataset.ldOrig = l.getAttribute('href') ?? '';
      l.dataset.ldOrigType = l.getAttribute('type') ?? '';
    }
    if (!f || f.key === 'default') {
      l.setAttribute('href', l.dataset.ldOrig);
      if (l.dataset.ldOrigType) l.setAttribute('type', l.dataset.ldOrigType);
      else l.removeAttribute('type');
      return;
    }
    l.setAttribute('href', faviconUri(f.svg));
    l.setAttribute('type', 'image/svg+xml');
  });
}

/**
 * Logo-Animation „Blinken“ (Brand-README: „Seite baut“ — Favicon, 1,1 s, steps(1)): zwei Bilder im Wechsel,
 * Bewegtes Zeichen (Silhouette mit Slash-Ausschnitt, assets/loona-bewegt.svg) 0–55 %, Silhouette ohne Slash 55–100 %.
 * Endet im gewählten Favicon (applyFavicon). Bei prefers-reduced-motion blinkt nichts.
 */
const blinkFrames = () => [
  `<svg xmlns="http://www.w3.org/2000/svg" viewBox="${Z.viewBox}"><mask id="s"><rect width="48" height="48" fill="#fff"/><path d="${Z.slash}" fill="#000"/></mask><path d="${Z.silhouette}" fill="${ORANGE}" mask="url(#s)"/></svg>`,
  `<svg xmlns="http://www.w3.org/2000/svg" viewBox="${Z.viewBox}"><path d="${Z.silhouette}" fill="${ORANGE}"/></svg>`,
];

export function blinkFavicon(choice: string): () => void {
  if (typeof window === 'undefined' || window.matchMedia('(prefers-reduced-motion: reduce)').matches) return () => {};
  const frames = blinkFrames().map(faviconUri);
  let i = 0;
  let t: ReturnType<typeof setTimeout>;
  const show = () => {
    document.querySelectorAll<HTMLLinkElement>('link[rel~="icon"]').forEach((l) => {
      if (l.dataset.ldOrig === undefined) {
        l.dataset.ldOrig = l.getAttribute('href') ?? '';
        l.dataset.ldOrigType = l.getAttribute('type') ?? '';
      }
      l.setAttribute('href', frames[i]);
      l.setAttribute('type', 'image/svg+xml');
    });
    // 55 % / 45 % von 1,1 s
    t = setTimeout(show, i === 0 ? 605 : 495);
    i = 1 - i;
  };
  show();
  return () => {
    clearTimeout(t);
    applyFavicon(choice);
  };
}
