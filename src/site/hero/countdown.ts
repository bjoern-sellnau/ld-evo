/**
 * Countdown-Hero (neu, nicht im Prototyp — Wunsch vom 28.11.2026): die Uhr aus den beiden Countdown-Teasern als Hero
 * der Startseite. Quelle der Form: Trailer-Quelle im Branch `reel`, quelle-trailer/kino.js → KS.clock / kDigit
 * (Sieben-Segment-Ziffern, Titelzeile darüber, Einheiten darunter; Zieltage und Farben wie dort).
 *
 * Zwei Fassungen als Hero-Modi: „LD Beyond. · Die neue Website“ (blau, 06.09.2027) und „Bjoern Sellnau · 20 Jahre
 * Erfahrung“ (orange, 03.09.2027). Zieldatum, Farbe, Ticken und Darstellung sind je Modus frei wählbar
 * (Einstellungen → heroCfg[modus]: date, color, tick, solo). Hier nur die reine Logik (ohne React/DOM) — testbar.
 */

export const COUNTDOWN_MODES = {
  countdownbeyond: { kind: 'beyond', date: '2027-09-06T00:00', color: '#19A7FF' },
  countdownjahre: { kind: 'jahre', date: '2027-09-03T00:00', color: '#FF7816' },
} as const;

export type CountdownMode = keyof typeof COUNTDOWN_MODES;
export type CountdownKind = (typeof COUNTDOWN_MODES)[CountdownMode]['kind'];

export const isCountdownMode = (mode: string): mode is CountdownMode => Object.hasOwn(COUNTDOWN_MODES, mode);

/** id der Ziffernzeile im Markup — daran richtet der gezeichnete Grund (extra/countdown.ts) seinen Schein aus. */
export const COUNTDOWN_ANCHOR = 'ld-countdown-digits';

/** Das Zieldatum gilt in deutscher Zeit — für alle Besucher derselbe Augenblick, egal wo sie sitzen. */
const TZ = 'Europe/Berlin';

/** Abstand der Zone zu UTC in Millisekunden zum Zeitpunkt ms (Sommerzeit eingerechnet). */
function zoneOffset(ms: number): number {
  const parts = new Intl.DateTimeFormat('en-US', {
    timeZone: TZ,
    hourCycle: 'h23',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
  }).formatToParts(ms);
  const v = (type: string) => Number(parts.find((p) => p.type === type)?.value);
  return Date.UTC(v('year'), v('month') - 1, v('day'), v('hour'), v('minute'), v('second')) - Math.floor(ms / 1000) * 1000;
}

/**
 * „2027-09-06T00:00“ (Wert eines datetime-local-Felds, Uhrzeit optional) als Augenblick in deutscher Zeit.
 * Ungültige Angaben → null.
 */
export function berlinInstant(local: string): number | null {
  const m = /^(\d{4})-(\d{2})-(\d{2})(?:T(\d{2}):(\d{2}))?$/.exec(local);
  if (!m) return null;
  const [y, mo, d, h, mi] = [Number(m[1]), Number(m[2]), Number(m[3]), Number(m[4] ?? 0), Number(m[5] ?? 0)];
  if (mo < 1 || mo > 12 || d < 1 || d > 31 || h > 23 || mi > 59) return null;
  const wall = Date.UTC(y, mo - 1, d, h, mi);
  // Tage, die es nicht gibt (31.02.), würde Date.UTC stillschweigend verschieben
  if (new Date(wall).getUTCDate() !== d) return null;
  // zweimal annähern: an Umstellungstagen stimmt der erste Versatz noch nicht
  const first = wall - zoneOffset(wall);
  return wall - zoneOffset(first);
}

export interface CountdownCfg {
  /** Zieldatum als Feldwert (deutsche Zeit) und als Augenblick. */
  local: string;
  target: number;
  color: string;
  /** hörbares Ticken im Sekundentakt */
  tick: boolean;
  /** true = die Uhr steht groß und allein im Hero (wie im Trailer); false = neben dem Hero-Text */
  solo: boolean;
}

/** Einstellungen eines Countdown-Modus mit den Vorgaben der Fassung; ungültige Werte fallen auf die Vorgabe zurück. */
export function countdownCfg(mode: CountdownMode, cfg: Record<string, unknown>): CountdownCfg {
  const def = COUNTDOWN_MODES[mode];
  const local = typeof cfg.date === 'string' && berlinInstant(cfg.date) !== null ? cfg.date : def.date;
  const color = typeof cfg.color === 'string' && /^#[0-9a-f]{6}$/i.test(cfg.color) ? cfg.color : def.color;
  return { local, target: berlinInstant(local) ?? 0, color, tick: cfg.tick === true, solo: cfg.solo !== false };
}

/** Restzeit als vier Zifferngruppen: Tage (mindestens dreistellig), Stunden, Minuten, Sekunden. Abgelaufen = Nullen. */
export function countdownParts(msLeft: number): [string, string, string, string] {
  const s = Math.max(0, Math.floor(msLeft / 1000));
  const p2 = (v: number) => String(v).padStart(2, '0');
  return [String(Math.floor(s / 86400)).padStart(3, '0'), p2(Math.floor(s / 3600) % 24), p2(Math.floor(s / 60) % 60), p2(s % 60)];
}

/* ------------------------------------------------------------------------------- Sieben-Segment-Ziffer ---------- */

/** Welche Segmente je Ziffer leuchten: a oben, b/c rechts, d unten, e/f links, g Mitte (wie KSEG im Trailer). */
export const SEGMENTS: Record<string, string> = {
  0: 'abcdef',
  1: 'bc',
  2: 'abdeg',
  3: 'abcdg',
  4: 'bcfg',
  5: 'acdfg',
  6: 'acdefg',
  7: 'abc',
  8: 'abcdefg',
  9: 'abcdfg',
};

/** Maße einer Ziffer im Trailer (1920 × 1080): Breite, Höhe, Abstand zwischen Ziffern, Breite des Doppelpunkts. */
export const DIGIT = { w: 112, h: 204, gap: 22, colon: 80 } as const;

/** Eckpunkte der sieben Segmente als SVG-Polygone im Feld DIGIT.w × DIGIT.h (Geometrie 1:1 aus kDigit). */
export const SEGMENT_POINTS: Record<string, string> = (() => {
  const { w, h } = DIGIT;
  const t = w * 0.17;
  const gp = t * 0.16;
  const fmt = (pts: [number, number][]) => pts.map(([x, y]) => `${+x.toFixed(2)},${+y.toFixed(2)}`).join(' ');
  const hz = (yy: number) =>
    fmt([
      [t * 0.5 + gp, yy],
      [t + gp, yy - t / 2],
      [w - t - gp, yy - t / 2],
      [w - t * 0.5 - gp, yy],
      [w - t - gp, yy + t / 2],
      [t + gp, yy + t / 2],
    ]);
  const vt = (xx: number, y0: number, y1: number) =>
    fmt([
      [xx, y0 + t * 0.5 + gp],
      [xx + t / 2, y0 + t + gp],
      [xx + t / 2, y1 - t - gp],
      [xx, y1 - t * 0.5 - gp],
      [xx - t / 2, y1 - t - gp],
      [xx - t / 2, y0 + t + gp],
    ]);
  return {
    a: hz(t / 2),
    g: hz(h / 2),
    d: hz(h - t / 2),
    f: vt(t / 2, 0, h / 2),
    b: vt(w - t / 2, 0, h / 2),
    e: vt(t / 2, h / 2, h),
    c: vt(w - t / 2, h / 2, h),
  };
})();

/** Gesamtbreite der Anzeige (Gruppen mit 3·2·2·2 Ziffern bzw. mehr Tagesziffern) in Trailer-Pixeln. */
export function clockWidth(groups: readonly string[]): number {
  const digits = groups.reduce((n, s) => n + s.length, 0);
  return digits * DIGIT.w + (digits - groups.length) * DIGIT.gap + (groups.length - 1) * DIGIT.colon;
}

/** Linke Kante und Breite jeder Zifferngruppe in Trailer-Pixeln (dazwischen je ein Doppelpunkt der Breite DIGIT.colon). */
export function clockLayout(groups: readonly string[]): { x0: number; w: number }[] {
  const out: { x0: number; w: number }[] = [];
  for (const g of groups) {
    const prev = out.at(-1);
    out.push({ x0: prev ? prev.x0 + prev.w + DIGIT.colon : 0, w: g.length * (DIGIT.w + DIGIT.gap) - DIGIT.gap });
  }
  return out;
}
