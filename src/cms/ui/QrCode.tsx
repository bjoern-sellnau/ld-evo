'use client';

import { create } from 'qrcode';
import { useMemo } from 'react';

/** QR-Code als SVG aus React-Elementen (kein innerHTML). Fehlerkorrektur M, 4 Module Ruhezone. */
export function QrCode({ text, size = 200, label }: { text: string; size?: number; label: string }) {
  const { n, path } = useMemo(() => {
    const m = create(text, { errorCorrectionLevel: 'M' }).modules;
    let d = '';
    for (let r = 0; r < m.size; r++) for (let c = 0; c < m.size; c++) if (m.get(r, c)) d += `M${c + 4} ${r + 4}h1v1h-1z`;
    return { n: m.size + 8, path: d };
  }, [text]);
  return (
    <svg viewBox={`0 0 ${n} ${n}`} width={size} height={size} role="img" aria-label={label} shapeRendering="crispEdges">
      <rect width={n} height={n} fill="#fff" />
      <path d={path} fill="#000" />
    </svg>
  );
}
