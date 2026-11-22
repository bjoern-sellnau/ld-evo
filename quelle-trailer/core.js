/* Trailer „loona! designs · Bjoern Sellnau“ — Kern: Zeichenfläche 1920×1080, Helfer, Marke, Geräte-Rahmen.
   Marke 1:1 aus dem Brand-System 2026-10 (ld-evo: docs/design_handoff_loona_brand/README.md, Stand 31.10.2026):
   Pfade, Farben, Schriften (Manrope, Instrument Serif kursiv, JetBrains Mono), Animationen (Reveal, Sweep,
   Mondphase, Slash-Wipe, Transformation Alt → Neu) mit ihren Easings. Don'ts beachtet: Zeichen nie gedreht, verzerrt
   oder mit Effekten; „!“ nie gefärbt; Badge nur auf Tinte; jede Logo-Animation endet im Primärzeichen. */
'use strict';
const W = 1920, H = 1080;
const cv = document.getElementById('c');
let g = cv.getContext('2d');

/* ---------- Marke: Farben und Schriften (Brand-README „Design Tokens“) ---------- */
const BR = {
  orange: '#FF7816', apricot: '#FFB366', signal: '#FF4D1C', ink: '#171310', night: '#0B1026', cream: '#F6F1E8', white: '#FFFFFF',
  text2: '#3F3B34', meta: '#7E796F', line: '#E3DCCF', glassDark: '#B4500E', ghostL: '#FFE3CC', ghostD: '#3B2B1F',
  sky: '#9CC8F2', navy: '#0B2A4A', mutedDark: '#B3A78F',
  flow: '#A78BFA', nova: '#38BDF8', buddy: '#F472B6', ivy: '#3DDC84',
};
const MAN = 'Manrope', SER = '"Instrument Serif"', MONO = '"JetBrains Mono"';

/* ---------- Mathe, Easing ---------- */
const clamp = (x, a = 0, b = 1) => Math.max(a, Math.min(b, x));
const lerp = (a, b, k) => a + (b - a) * k;
const seg = (t, a, b) => clamp((t - a) / (b - a));
const eOut = (x) => 1 - Math.pow(1 - x, 3);
const eOut5 = (x) => 1 - Math.pow(1 - x, 5);
const eIn = (x) => x * x * x;
const eIO = (x) => (x < 0.5 ? 4 * x * x * x : 1 - Math.pow(-2 * x + 2, 3) / 2);
const eBack = (x) => { const c1 = 1.70158, c3 = c1 + 1; return 1 + c3 * Math.pow(x - 1, 3) + c1 * Math.pow(x - 1, 2); };
const hash = (n) => { const s = Math.sin(n * 127.1 + 0.3) * 43758.5453; return s - Math.floor(s); };
/* cubic-bezier wie in CSS (für die Easings des Brand-Systems) */
function bez(x1, y1, x2, y2) {
  const cx = 3 * x1, bx = 3 * (x2 - x1) - cx, ax = 1 - cx - bx, cy = 3 * y1, by = 3 * (y2 - y1) - cy, ay = 1 - cy - by;
  return (x) => {
    x = clamp(x); let t = x;
    for (let i = 0; i < 8; i++) { const f = ((ax * t + bx) * t + cx) * t - x, d = (3 * ax * t + 2 * bx) * t + cx; if (Math.abs(d) < 1e-6) break; t -= f / d; }
    t = clamp(t); return ((ay * t + by) * t + cy) * t;
  };
}
const E_REVEAL = bez(0.2, 0.8, 0.2, 1); // Reveal, Mondphase
const E_SWEEP = bez(0.65, 0, 0.35, 1); // Sweep, Transformation
const E_WIPE = bez(0.7, 0, 0.3, 1); // Slash-Wipe
/* Keyframes wie in CSS: Easing je Abschnitt */
function kf(p, stops, ease = (x) => x) {
  if (p <= stops[0][0]) return stops[0][1];
  for (let i = 1; i < stops.length; i++) if (p <= stops[i][0]) { const [a, va] = stops[i - 1], [b, vb] = stops[i]; return b === a ? vb : lerp(va, vb, ease((p - a) / (b - a))); }
  return stops[stops.length - 1][1];
}
const rgba = (hex, a) => { const n = parseInt(hex.slice(1), 16); return `rgba(${(n >> 16) & 255},${(n >> 8) & 255},${n & 255},${a})`; };
const mix = (a, b, k) => { const x = parseInt(a.slice(1), 16), y = parseInt(b.slice(1), 16); const c = (s) => Math.round(lerp((x >> s) & 255, (y >> s) & 255, k)); return `rgb(${c(16)},${c(8)},${c(0)})`; };

/* ---------- Text ---------- */
function setFont(size, weight = 700, fam = MAN, italic = false) { g.font = `${italic ? 'italic ' : ''}${weight} ${size}px ${fam}`; }
function text(str, x, y, o = {}) {
  g.save();
  setFont(o.size ?? 64, o.weight ?? 700, o.fam ?? MAN, o.italic);
  g.textAlign = o.align ?? 'left'; g.textBaseline = o.base ?? 'alphabetic';
  g.globalAlpha *= o.alpha ?? 1;
  g.letterSpacing = (o.ls ?? 0) + 'px';
  g.fillStyle = o.color ?? '#fff'; g.fillText(str, x, y);
  g.restore();
}
function measure(str, size, weight = 700, fam = MAN, ls = 0, italic = false) {
  g.save(); setFont(size, weight, fam, italic); g.letterSpacing = ls + 'px'; const w = g.measureText(str).width; g.restore(); return w;
}
function fit(str, max, size, weight = 700, fam = MAN, lsEm = 0, italic = false) { while (size > 12 && measure(str, size, weight, fam, lsEm * size, italic) > max) size -= 2; return size; }
/* Mono-Label in Versalien (+0,06 em laut Brand-README) */
function label(str, x, y, o = {}) { const size = o.size ?? 22; text(str.toUpperCase(), x, y, { size, weight: o.weight ?? 500, fam: MONO, ls: size * (o.track ?? 0.14), color: o.color, alpha: o.alpha, align: o.align }); }

/* Zeile aus Wörtern mit gemischten Stilen: tok = { t, serif?, color?, weight? }. Serif = Instrument Serif kursiv (editorialer Akzent). */
const SERIF_SCALE = 1.14;
function tokens(str, o = {}) { return str.split(' ').map((t) => ({ t, ...o })); }
function layoutLine(toks, size, o = {}) {
  const ls = (o.lsEm ?? -0.03) * size; let x = 0; const out = [];
  const space = size * (o.space ?? 0.27);
  toks.forEach((k, i) => {
    const sz = k.serif ? size * SERIF_SCALE : size, wgt = k.serif ? 400 : k.weight ?? o.weight ?? 800, fam = k.serif ? SER : MAN;
    const w = measure(k.t, sz, wgt, fam, k.serif ? 0 : ls, !!k.serif) - (k.serif ? 0 : ls);
    out.push({ ...k, x, w, sz, wgt, fam, ls: k.serif ? 0 : ls }); x += w + (i < toks.length - 1 ? space : 0);
  });
  return { items: out, width: x };
}
/* p = 0…1 Einblendung (Wörter gestaffelt); style: rise | mask | fade | slam. out = 0…1 Ausblendung. */
function drawLine(toks, x, y, size, p, o = {}) {
  const L = layoutLine(toks, size, o); const n = L.items.length, st = o.stagger ?? 0.22, style = o.style ?? 'rise';
  const x0 = o.align === 'center' ? x - L.width / 2 : o.align === 'right' ? x - L.width : x;
  const out = o.out ?? 0;
  L.items.forEach((k, i) => {
    const q = clamp(p * (1 + (n - 1) * st) - i * st); if (q <= 0) return;
    let a = 1, dy = 0, sc = 1;
    if (style === 'rise') { a = eOut(q); dy = (1 - eOut5(q)) * size * 0.42; }
    else if (style === 'fade') { a = eIO(q); dy = (1 - eOut(q)) * 16; }
    else if (style === 'slam') { a = seg(q, 0, 0.3); sc = lerp(1.32, 1, eOut5(q)); }
    else if (style === 'mask') { dy = (1 - E_REVEAL(q)) * size * 1.15; }
    a *= 1 - out; if (a <= 0.003) return;
    g.save();
    if (style === 'mask') { g.beginPath(); g.rect(x0 + k.x - size * 0.2, y - size * 1.02, k.w + size * 0.4, size * 1.34); g.clip(); }
    if (sc !== 1) { g.translate(x0 + k.x + k.w / 2, y - size * 0.3); g.scale(sc, sc); g.translate(-(x0 + k.x + k.w / 2), -(y - size * 0.3)); }
    text(k.t, x0 + k.x, y + dy - out * 12, { size: k.sz, weight: k.wgt, fam: k.fam, italic: !!k.serif, ls: k.ls, color: k.color ?? o.color, alpha: a });
    g.restore();
  });
  return L.width;
}
function wrapLines(str, max, size, weight = 500, fam = MAN, lsEm = 0) {
  const words = str.split(' '); const lines = []; let line = '';
  for (const w of words) { const tt = line ? line + ' ' + w : w; if (measure(tt, size, weight, fam, lsEm * size) > max && line) { lines.push(line); line = w; } else line = tt; }
  if (line) lines.push(line); return lines;
}
function para(str, x, y, max, size, o = {}) {
  const lines = wrapLines(str, max, size, o.weight ?? 500, o.fam ?? MAN, o.lsEm ?? 0);
  lines.forEach((ln, i) => { const q = clamp((o.p ?? 1) * (1 + lines.length * 0.25) - i * 0.25); text(ln, x, y + i * size * (o.lh ?? 1.45) + (1 - eOut(q)) * 14, { size, weight: o.weight ?? 500, fam: o.fam ?? MAN, color: o.color, alpha: (o.alpha ?? 1) * eOut(q), align: o.align, ls: (o.lsEm ?? 0) * size }); });
  return lines.length;
}
const fmtInt = (v, lang) => String(Math.floor(v)).replace(/\B(?=(\d{3})+(?!\d))/g, lang === 'en' ? ',' : '.');
function rr(x, y, w, h, r) { g.beginPath(); g.roundRect(x, y, w, h, r); }

/* ---------- Ebenen ---------- */
const mkLayer = (w = W, h = H) => { const c = document.createElement('canvas'); c.width = w; c.height = h; return c.getContext('2d'); };
const LA = mkLayer(), LB = mkLayer(), LT = mkLayer();
function drawInto(ctx, fn) { const keep = g; g = ctx; g.save(); g.setTransform(1, 0, 0, 1, 0, 0); g.clearRect(0, 0, W, H); fn(); g.restore(); g = keep; }
/* weicher Lichtfleck (vorgerendert) */
const GLOW = {};
function glow(x, y, r, col, a = 1, add = true) {
  const key = col; if (!GLOW[key]) { const c = mkLayer(256, 256); const gr = c.createRadialGradient(128, 128, 0, 128, 128, 128); gr.addColorStop(0, rgba(col, 1)); gr.addColorStop(0.35, rgba(col, 0.42)); gr.addColorStop(1, rgba(col, 0)); c.fillStyle = gr; c.fillRect(0, 0, 256, 256); GLOW[key] = c.canvas; }
  g.save(); g.globalAlpha *= a; if (add) g.globalCompositeOperation = 'lighter'; g.drawImage(GLOW[key], x - r, y - r, r * 2, r * 2); g.restore();
}

/* ---------- Bilder ---------- */
const IMG = {}; const SRC = {};
const loadImg = (src) => new Promise((res) => { const i = new Image(); i.onload = () => res(i); i.onerror = () => res(null); i.src = src; });
const loadAll = async () => { await Promise.all(Object.entries(SRC).map(async ([k, s]) => { const i = await loadImg(s); if (i) IMG[k] = i; })); };
const SEQ = new Map();
async function need(list) { for (const s of list) if (!SEQ.has(s)) SEQ.set(s, await loadImg(s)); while (SEQ.size > 64) SEQ.delete(SEQ.keys().next().value); }
const seqImg = (s) => SEQ.get(s) ?? null;
function imgCover(img, x, y, w, h, r = 0, o = {}) {
  if (!img) { g.save(); g.fillStyle = 'rgba(128,128,128,0.25)'; rr(x, y, w, h, r); g.fill(); g.restore(); return; }
  const s = Math.max(w / img.width, h / img.height) * (o.zoom ?? 1), iw = img.width * s, ih = img.height * s;
  g.save(); rr(x, y, w, h, r); g.clip(); g.drawImage(img, x + (w - iw) * (o.px ?? 0.5), y + (h - ih) * (o.py ?? 0.5), iw, ih); g.restore();
}
/* Browserfenster mit Bild; scroll 0…1 fährt ein hohes Bild von oben nach unten ab */
function browser(img, x, y, w, h, o = {}) {
  const bar = o.bar ?? 44, r = o.r ?? 16, dark = o.dark ?? true;
  g.save(); g.globalAlpha *= o.alpha ?? 1;
  g.save(); g.shadowColor = o.shadow ?? 'rgba(0,0,0,0.5)'; g.shadowBlur = o.blur ?? 60; g.shadowOffsetY = 24; g.fillStyle = dark ? '#0F1014' : '#FFFFFF'; rr(x, y, w, h, r); g.fill(); g.restore();
  g.save(); rr(x, y, w, h, r); g.clip();
  g.fillStyle = dark ? '#1B1C22' : '#F1EDE5'; g.fillRect(x, y, w, bar);
  ['#FF5F57', '#FEBC2E', '#28C840'].forEach((c, i) => { g.fillStyle = c; g.beginPath(); g.arc(x + 22 + i * 20, y + bar / 2, 6, 0, 7); g.fill(); });
  if (o.url) { g.fillStyle = dark ? 'rgba(255,255,255,0.07)' : 'rgba(23,19,16,0.06)'; rr(x + w * 0.24, y + 9, w * 0.52, bar - 18, 999); g.fill(); text(o.url, x + w / 2, y + bar / 2 + 5, { size: 14, weight: 500, fam: MONO, align: 'center', color: dark ? 'rgba(255,255,255,0.6)' : 'rgba(23,19,16,0.6)' }); }
  if (img) {
    const iw = w, s = iw / img.width, ih = img.height * s, vh = h - bar;
    if (ih > vh + 2) g.drawImage(img, x, y + bar - (o.scroll ?? 0) * (ih - vh), iw, ih);
    else imgCover(img, x, y + bar, w, vh, 0, { zoom: o.zoom ?? 1, px: o.px, py: o.py });
  } else { g.fillStyle = dark ? '#0B0C10' : '#FAF7F2'; g.fillRect(x, y + bar, w, h - bar); }
  g.restore();
  g.strokeStyle = dark ? 'rgba(255,255,255,0.14)' : 'rgba(23,19,16,0.12)'; g.lineWidth = 1.5; rr(x, y, w, h, r); g.stroke();
  g.restore();
}
function phone(img, cx, cy, w, o = {}) {
  const h = w * 2.06, r = w * 0.15;
  g.save(); g.globalAlpha *= o.alpha ?? 1;
  g.save(); g.shadowColor = 'rgba(0,0,0,0.5)'; g.shadowBlur = 50; g.shadowOffsetY = 20; g.fillStyle = '#0B0C10'; rr(cx - w / 2 - 10, cy - h / 2 - 10, w + 20, h + 20, r + 8); g.fill(); g.restore();
  g.strokeStyle = 'rgba(255,255,255,0.18)'; g.lineWidth = 2; rr(cx - w / 2 - 10, cy - h / 2 - 10, w + 20, h + 20, r + 8); g.stroke();
  if (img) { g.save(); rr(cx - w / 2, cy - h / 2, w, h, r); g.clip(); const s = w / img.width, ih = img.height * s; g.drawImage(img, cx - w / 2, cy - h / 2 - (o.scroll ?? 0) * Math.max(0, ih - h), w, ih); g.restore(); }
  g.fillStyle = '#000'; rr(cx - w * 0.16, cy - h / 2 + 10, w * 0.32, 22, 11); g.fill();
  g.restore();
}

/* ---------- Marke: Formen (Koordinaten des Zeichen-Systems, viewBox 6 9 32 28; Kontur x 8–36, y 11–35) ---------- */
const ZP = {
  l: new Path2D('M8 12A1 1 0 0 1 9 11L15 11A1 1 0 0 1 16 12L16 27L19 27L22 35L9 35A1 1 0 0 1 8 34Z'),
  moon: new Path2D('M21 12A1 1 0 0 1 22 11H24A12 12 0 0 1 24 35L21 27Z'),
  sil: new Path2D('M8 12A1 1 0 0 1 9 11H24A12 12 0 0 1 24 35H9A1 1 0 0 1 8 34Z'),
  slash: new Path2D('M13 11H16.5L28.5 35H25Z'),
  /* Produktfamilie (Logo-Handoff v1.0, 46er-System, sichtbar y 3–43) */
  nova: new Path2D('M20 3L24 19L40 23L24 27L20 43L16 27L0 23L16 19Z'),
  buddy: new Path2D('M0 3H8V11A16 16 0 0 1 8 43H0ZM8 19A8 8 0 0 1 8 35Z'),
  ivy: new Path2D('M20 3C29 14 40 20 40 27A20 20 0 0 1 0 27C0 20 11 14 20 3Z'),
};
/* Zeichen: h = Höhe der Kontur in px (24 Einheiten), Mitte der Kontur bei (cx, cy). o.lx/o.my = Versatz in Einheiten (Reveal). */
function zeichen(cx, cy, h, col = BR.orange, o = {}) {
  const s = h / 24;
  g.save(); g.translate(cx, cy); g.scale(s, s); g.translate(-22, -23); g.fillStyle = col;
  if ((o.la ?? 1) > 0) { g.save(); g.globalAlpha *= o.la ?? 1; g.translate(o.lx ?? 0, 0); g.fill(ZP.l); g.restore(); }
  if ((o.ma ?? 1) > 0) { g.save(); g.globalAlpha *= o.ma ?? 1; g.translate(0, o.my ?? 0); g.fill(ZP.moon); g.restore(); }
  g.restore();
}
/* Reveal (1,2 s, cubic-bezier(.2,.8,.2,1)): L von translateX(−14), Mond ab 10 % von translateY(12) */
function zeichenReveal(cx, cy, h, p, col = BR.orange) {
  const a = E_REVEAL(clamp(p)), b = E_REVEAL(seg(p, 0.1, 1));
  zeichen(cx, cy, h, col, { lx: -14 * (1 - a), la: a, my: 12 * (1 - b), ma: b });
}
/* Sweep (Loader): Silhouette, der Slash wandert als Ausschnitt von −22 bis +8. Nie als statisches Logo. */
function zeichenSweep(cx, cy, h, p, col = BR.orange) {
  const s = h / 24, dx = lerp(-22, 8, E_SWEEP(clamp(p)));
  g.save(); g.translate(cx, cy); g.scale(s, s); g.translate(-22, -23); g.clip(ZP.sil);
  const path = new Path2D(); path.addPath(ZP.sil); path.addPath(ZP.slash, new DOMMatrix().translate(dx, 0));
  g.fillStyle = col; g.fill(path, 'evenodd'); g.restore();
}
/* Wortmarke: „loona!“ Manrope 800, „designs“ Manrope 500, −0,035 em, einfarbig. Gibt die Breite zurück. */
function wordmark(x, y, size, col, o = {}) {
  const ls = -0.035 * size, w1 = measure('loona!', size, 800, MAN, ls), sp = size * 0.26;
  const p = o.p ?? 1; const a = (o.alpha ?? 1);
  g.save();
  if (p < 1) { g.beginPath(); g.rect(x - 4, y - size * 1.1, (w1 + sp + measure('designs', size, 500, MAN, ls) + 12) * E_REVEAL(p), size * 1.5); g.clip(); }
  text('loona!', x, y, { size, weight: 800, ls, color: col, alpha: a });
  text('designs', x + w1 + sp, y, { size, weight: 500, ls, color: col, alpha: a });
  g.restore();
  return w1 + sp + measure('designs', size, 500, MAN, ls);
}
const wordmarkWidth = (size) => { const ls = -0.035 * size; return measure('loona!', size, 800, MAN, ls) + size * 0.26 + measure('designs', size, 500, MAN, ls); };
/* Lockup (Brand Guide S. 07): Zeichenhöhe m, Schrift 0,9275 m, Abstand 0,46 m ab Kontur; mittig um (cx, cy). pm = Reveal des Zeichens, pw = der Wortmarke. */
function lockup(cx, cy, m, textCol, o = {}) {
  const size = 0.9275 * m, gap = 0.46 * m, mw = (m * 28) / 24, ww = wordmarkWidth(size), total = mw + gap + ww, x0 = cx - total / 2;
  const pm = o.pm ?? 1, pw = o.pw ?? 1;
  if (pm >= 1) zeichen(x0 + mw / 2, cy, m, o.markCol ?? BR.orange); else zeichenReveal(x0 + mw / 2, cy, m, pm, o.markCol ?? BR.orange);
  if (pw > 0) wordmark(x0 + mw + gap, cy + size * 0.345, size, textCol, { p: pw, alpha: o.alpha });
  return { x0, total, size, mw, gap };
}
/* Kachel der Produktfamilie (Tinte, Glyph in Produktfarbe; Maße wie die Favicons im Logo-Handoff) */
function familyTile(cx, cy, size, key, alpha = 1) {
  const s = size / 64, wd = { nova: 40, buddy: 24, ivy: 40, flow: 49 }[key], col = BR[key], sc = Math.min(1.056, 51.2 / wd);
  g.save(); g.globalAlpha *= alpha; g.translate(cx - size / 2, cy - size / 2); g.scale(s, s);
  g.fillStyle = BR.ink; g.beginPath(); g.roundRect(0, 0, 64, 64, 14); g.fill();
  g.translate((64 - wd * sc) / 2, (64 - 40 * sc) / 2 - 3 * sc); g.scale(sc, sc);
  if (key === 'flow') { g.save(); g.transform(1, 0, Math.tan((-20.556 * Math.PI) / 180), 1, 14.125, 0); g.strokeStyle = col; g.lineWidth = 8; g.stroke(new Path2D('M30 7H26A8 8 0 0 0 18 15V31A8 8 0 0 1 10 39H6')); g.stroke(new Path2D('M8 23H18')); g.restore(); g.fillStyle = col; g.beginPath(); g.arc(35.5, 23, 4, 0, 7); g.fill(); }
  else if (key === 'ivy') { g.translate(1.5, -2.5); g.translate(20, 23); g.rotate((-38 * Math.PI) / 180); g.translate(-20, -23); g.fillStyle = col; g.fill(ZP.ivy); }
  else { g.fillStyle = col; g.fill(ZP[key], 'evenodd'); }
  g.restore();
}
/* Zeichen auf der Tinte-Kachel (Badge-Format 64, rx 14): das „Negativ-Logo“ der Site — der Negativraum des Badges, also das Primärzeichen.
   Wunsch 21.11.2026 für die Produktfamilie; Zeichenhöhe 50 % der Kachel lässt ringsum den Schutzraum (8/28 der Zeichenbreite). */
function zeichenTile(cx, cy, size, o = {}) {
  const s = size / 64;
  g.save(); g.globalAlpha *= o.alpha ?? 1; g.translate(cx - size / 2, cy - size / 2); g.scale(s, s);
  g.fillStyle = BR.ink; g.beginPath(); g.roundRect(0, 0, 64, 64, 14); g.fill();
  if (o.edge) { g.strokeStyle = o.edge; g.lineWidth = 1 / s; g.stroke(); }
  g.restore();
  g.save(); g.globalAlpha *= o.alpha ?? 1; zeichen(cx, cy, size * 0.5, o.fg ?? BR.orange); g.restore();
}
/* Farbkachel mit Kürzel (wie die generativen Karten der Website: Projektfarbe + Monogramm) */
function monoTile(x, y, size, mono, col, o = {}) {
  const n = parseInt(col.slice(1), 16), lum = (0.2126 * ((n >> 16) & 255) + 0.7152 * ((n >> 8) & 255) + 0.0722 * (n & 255)) / 255;
  g.save(); g.globalAlpha *= o.alpha ?? 1;
  rr(x, y, size, size, size * 0.22); g.fillStyle = col; g.fill(); g.strokeStyle = o.edge ?? 'rgba(127,127,127,0.35)'; g.lineWidth = 1.5; g.stroke();
  text(mono, x + size / 2, y + size * 0.64, { size: size * 0.4, weight: 800, align: 'center', color: lum > 0.6 ? BR.ink : '#FFFFFF', ls: -size * 0.01 });
  g.restore();
}
/* Slash-Wipe als Schnitt (0,6 s, cubic-bezier(.7,0,.3,1)): Fläche mit Kanten in Slash-Steigung 1 : 2 wandert über das Bild, dahinter die neue Szene. */
function slashWipe(A, B, p, col = BR.orange) {
  const e = E_WIPE(clamp(p)), sl = H / 2, band = W * 0.62, lead = lerp(-sl, W + band + 20, e), trail = lead - band;
  const poly = (xTop) => { g.beginPath(); g.moveTo(-10, -10); g.lineTo(xTop, -10); g.lineTo(xTop + sl, H + 10); g.lineTo(-10, H + 10); g.closePath(); };
  g.drawImage(A, 0, 0);
  g.save(); poly(lead - sl); g.fillStyle = col; g.fill(); g.restore();
  g.save(); poly(trail - sl); g.clip(); g.drawImage(B, 0, 0); g.restore();
}
