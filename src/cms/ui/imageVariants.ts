'use client';

import { VARIANT_WIDTHS } from '../media';

/**
 * Verkleinerte WebP-Fassungen eines Bildes im Browser erzeugen (Canvas) — der Server braucht dafür keine
 * Bildbibliothek. Nur PNG/JPEG/WebP (GIF bliebe sonst nicht animiert); nur Breiten kleiner als das Original.
 * Kann der Browser kein WebP kodieren oder das Bild nicht dekodieren, gibt es einfach keine Varianten.
 */
export async function makeVariants(file: File): Promise<File[]> {
  if (!/^image\/(png|jpeg|webp)$/.test(file.type) || typeof createImageBitmap !== 'function') return [];
  let bmp: ImageBitmap;
  try {
    bmp = await createImageBitmap(file);
  } catch {
    return [];
  }
  const out: File[] = [];
  try {
    for (const w of VARIANT_WIDTHS) {
      if (w >= bmp.width) break;
      const h = Math.max(1, Math.round((bmp.height * w) / bmp.width));
      const canvas = document.createElement('canvas');
      canvas.width = w;
      canvas.height = h;
      const ctx = canvas.getContext('2d');
      if (!ctx) break;
      ctx.imageSmoothingQuality = 'high';
      ctx.drawImage(bmp, 0, 0, w, h);
      const blob = await new Promise<Blob | null>((res) => canvas.toBlob(res, 'image/webp', 0.82));
      // Browser ohne WebP-Encoder liefern stillschweigend PNG → dann lieber gar keine Varianten.
      if (!blob || blob.type !== 'image/webp') break;
      out.push(new File([blob], `${w}.webp`, { type: 'image/webp' }));
    }
  } finally {
    bmp.close();
  }
  return out;
}
