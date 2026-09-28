/**
 * Bildvarianten für hochgeladene Medien — ohne Abhängigkeiten (Server, LD Flow und Site nutzen dieselben Werte).
 *
 * Beim Upload rechnet der Browser von PNG/JPEG/WebP verkleinerte WebP-Fassungen (nur Breiten kleiner als das
 * Original); der Server speichert sie neben dem Original. `/media/<id>?w=<breite>` liefert die kleinste Variante,
 * die mindestens so breit ist — sonst das Original. Die Site setzt dafür `srcset`/`sizes`.
 */

export const VARIANT_WIDTHS = [640, 1280, 2400] as const;

/** Eigene Medien aus LD Flow (`/media/<id>`) — nur für diese gibt es Varianten. */
const OWN_MEDIA = /^\/media\/[\w-]{8,32}$/;

/** URL einer bestimmten Breite (fremde/statische Quellen bleiben unverändert). */
export function mediaUrl(src: string, width: number): string {
  return OWN_MEDIA.test(src) ? `${src}?w=${width}` : src;
}

/**
 * `srcset` für eigene Medien. Fehlt eine Stufe (Bild schmaler, GIF, AVIF, Browser ohne WebP-Encoder), liefert der
 * Server für diese Breite das Original — die Angabe bleibt also immer gültig, höchstens etwas größer als nötig.
 */
export function mediaSrcSet(src: string): string | undefined {
  if (!OWN_MEDIA.test(src)) return undefined;
  return VARIANT_WIDTHS.map((w) => `${src}?w=${w} ${w}w`).join(', ');
}

/** Breite und Höhe einer WebP-Datei aus dem Header (VP8, VP8L, VP8X) — zur Prüfung der Varianten. */
export function webpSize(buf: Uint8Array): { width: number; height: number } | null {
  if (buf.length < 30) return null;
  const tag = String.fromCharCode(buf[12], buf[13], buf[14], buf[15]);
  if (tag === 'VP8X') {
    const w = 1 + (buf[24] | (buf[25] << 8) | (buf[26] << 16));
    const h = 1 + (buf[27] | (buf[28] << 8) | (buf[29] << 16));
    return { width: w, height: h };
  }
  if (tag === 'VP8 ') {
    // Frame-Tag (3 Byte) + Startcode 9d 01 2a, danach 14 Bit Breite/Höhe (+2 Bit Skalierung).
    if (buf[23] !== 0x9d || buf[24] !== 0x01 || buf[25] !== 0x2a) return null;
    return { width: (buf[26] | (buf[27] << 8)) & 0x3fff, height: (buf[28] | (buf[29] << 8)) & 0x3fff };
  }
  if (tag === 'VP8L') {
    if (buf[20] !== 0x2f) return null;
    const bits = buf[21] | (buf[22] << 8) | (buf[23] << 16) | (buf[24] << 24);
    return { width: (bits & 0x3fff) + 1, height: ((bits >>> 14) & 0x3fff) + 1 };
  }
  return null;
}
