import { describe, expect, it } from 'vitest';
import { mediaSrcSet, mediaUrl, webpSize } from '@/cms/media';

/** Minimaler RIFF/WEBP-Kopf mit dem angegebenen Chunk (Rest wird mit Nullen aufgefüllt). */
function webp(tag: string, body: number[]): Uint8Array {
  const b = new Uint8Array(40);
  b.set(
    [...'RIFF'].map((c) => c.charCodeAt(0)),
    0,
  );
  b.set(
    [...'WEBP'].map((c) => c.charCodeAt(0)),
    8,
  );
  b.set(
    [...tag].map((c) => c.charCodeAt(0)),
    12,
  );
  b.set(body, 20);
  return b;
}

describe('Bildvarianten', () => {
  it('liest die Breite aus VP8-, VP8L- und VP8X-Köpfen', () => {
    // VP8 (verlustbehaftet): Frame-Tag, Startcode 9d 01 2a, dann 640 × 427 (little endian)
    expect(webpSize(webp('VP8 ', [0, 0, 0, 0x9d, 0x01, 0x2a, 640 & 0xff, 640 >> 8, 427 & 0xff, 427 >> 8]))).toEqual({
      width: 640,
      height: 427,
    });
    // VP8L (verlustfrei): Signatur 0x2f, 14 Bit Breite-1, 14 Bit Höhe-1
    const bits = (1280 - 1) | ((853 - 1) << 14);
    expect(webpSize(webp('VP8L', [0x2f, bits & 0xff, (bits >> 8) & 0xff, (bits >> 16) & 0xff, (bits >>> 24) & 0xff]))).toEqual({
      width: 1280,
      height: 853,
    });
    // VP8X (erweitert): 24 Bit Breite-1/Höhe-1 ab Byte 24
    const x = webp('VP8X', []);
    x.set([2399 & 0xff, (2399 >> 8) & 0xff, 0, 1599 & 0xff, (1599 >> 8) & 0xff, 0], 24);
    expect(webpSize(x)).toEqual({ width: 2400, height: 1600 });
  });

  it('lehnt kaputte Köpfe ab', () => {
    expect(webpSize(new Uint8Array(10))).toBeNull();
    expect(webpSize(webp('VP8 ', [0, 0, 0, 0, 0, 0]))).toBeNull();
  });

  it('srcset nur für eigene Medien', () => {
    expect(mediaSrcSet('/media/abcdEFGH1234')).toBe(
      '/media/abcdEFGH1234?w=640 640w, /media/abcdEFGH1234?w=1280 1280w, /media/abcdEFGH1234?w=2400 2400w',
    );
    expect(mediaSrcSet('/brand/logo.png')).toBeUndefined();
    expect(mediaSrcSet('https://example.com/a.jpg')).toBeUndefined();
    expect(mediaUrl('/media/abcdEFGH1234', 640)).toBe('/media/abcdEFGH1234?w=640');
    expect(mediaUrl('/brand/logo.png', 640)).toBe('/brand/logo.png');
  });
});
