/* Kino-Trailer (Wunsch vom 26.11.2026): zwei Filme im Stil eines Kinotrailers — „Über mich · 20 Jahre Erfahrung“ (Stimmung ka) und
   „LD Beyond“ (Stimmung kb). Beide zeichnen nicht mit den Layout-Szenen aus scenes.js, sondern mit eigenen Einstellungen: Texttafeln,
   Bildfahrten, Schnitte auf den Schlag, Stille vor dem Titel, Titel mit Einschlag, Abspann-Block wie auf einem Filmplakat. Format
   2,39 : 1 (Balken oben und unten), Korn und Randabdunklung. Diese Datei hält die gemeinsamen Bausteine und die Musik beider Filme;
   die Drehbücher stehen in kino-a.js und kino-b.js.
   Inhalte: nur belegte Angaben (data.js, content/projects.ts → Projekt „LD Beyond“, content/journey.ts); frei formuliert sind allein
   die verbindenden Tafeln des Trailers („zeigt“, „Nach einer wahren Geschichte“, „Demnächst“). */
'use strict';
const KINO = TH.retro === 'kino', KB = TH.film === 'b';
const UNB = 'Unbounded', GEI = 'Geist', GMO = '"Geist Mono"';
/* Bildfenster 2,39 : 1 */
const KH = Math.round(W / 2.39 / 2) * 2, KT = (H - KH) / 2, KBO = KT + KH, KCY = H / 2;
/* Look je Film. „Über mich“: Nacht der Marke, zum Rand schwarz, Creme als Schrift. „LD Beyond“: die Farben des Beyond-Designs
   (ld-evo: src/site/styles/site.css, body.bx-farben) und seine Schriften (src/site/fonts.ts: Unbounded, Geist, Geist Mono). */
const KL = KB
  ? { bg: '#05070c', ink: '#e8eef8', soft: '#93a1b8', mute: '#7d8aa0', acc: '#19a7ff', head: UNB, headW: 600, body: GEI, mono: GMO, cool: '#19a7ff', warm: '#19a7ff' }
  : { bg: '#04060f', ink: BR.cream, soft: '#B4B9D0', mute: '#7C83A3', acc: BR.orange, head: MAN, headW: 800, body: MAN, mono: MONO, cool: '#2F7FD6', warm: BR.apricot };

/* ---------- Zeit: Einstellungen einer Szene ---------- */
/* Gewichte → Schnittzeiten, auf das Raster q (ein Schlag) gerundet; jede Einstellung mindestens ein Raster lang */
function kSplit(D, weights, q = B) {
  const sum = weights.reduce((a, b) => a + b, 0), n = weights.length, cuts = [0]; let acc = 0;
  for (let i = 0; i < n - 1; i++) { acc += weights[i]; const lo = cuts[i] + q, hi = D - (n - 1 - i) * q; cuts.push(clamp(Math.round(((acc / sum) * D) / q) * q, lo, Math.max(lo, hi))); }
  cuts.push(D); return cuts;
}
const kAt = (cuts, lt) => { let i = 0; while (i < cuts.length - 2 && lt >= cuts[i + 1]) i++; return { i, t: lt - cuts[i], d: cuts[i + 1] - cuts[i] }; };
/* Szenen beider Filme: KS[id] = { sec (Satz der Musik), plan(D, bars) → { cuts, hits: [[Zeit, Stärke]] }, draw(lt, D, P), flash } */
const KS = {};
const KPC = new Map();
function kPlan(s) { if (!KPC.has(s.id)) KPC.set(s.id, KS[s.id].plan ? KS[s.id].plan(s.D, s.bars) : {}); return KPC.get(s.id); }

/* ---------- Bausteine ---------- */
const KL1 = mkLayer(), KDUST = Array.from({ length: 90 }, (_, i) => ({ x: hash(i * 2.7 + 5) * W, y: hash(i * 4.1 + 6), s: 0.7 + hash(i * 6.3 + 7) * 2.2, d: 0.25 + hash(i * 3.3 + 8) * 0.75, ph: hash(i * 1.3 + 9) * 6.283 }));
/* Schwebeteilchen wie Staub im Projektorlicht */
function kDust(t, a = 1, col = KL.ink) {
  g.save();
  for (const p of KDUST) { const x = (((p.x + t * 14 * p.d) % W) + W) % W, y = KT + ((((p.y * KH - t * 5 * p.d) % KH) + KH) % KH), al = (0.2 + 0.8 * (0.5 + 0.5 * Math.sin(t * (0.5 + p.d) + p.ph))) * p.d * a * 0.5; g.fillStyle = rgba(col, al); g.beginPath(); g.arc(x, y, p.s, 0, 7); g.fill(); }
  g.restore();
}
/* Grund „Über mich“: Nacht, zum Rand schwarz, ein kühles und ein warmes Licht */
function kaBg(t, o = {}) {
  g.fillStyle = '#000'; g.fillRect(0, 0, W, H);
  const gr = g.createRadialGradient(W / 2, KCY, 60, W / 2, KCY, W * 0.62); gr.addColorStop(0, rgba(BR.night, o.mid ?? 1)); gr.addColorStop(1, 'rgba(2,3,8,1)'); g.fillStyle = gr; g.fillRect(0, KT, W, KH);
  glow(W * (0.8 + 0.04 * Math.sin(t * 0.11)), KT + 60, 820, KL.cool, o.cool ?? 0.14);
  glow(W * (0.14 + 0.03 * Math.cos(t * 0.09)), KBO - 20, 700, BR.orange, o.warm ?? 0.07);
  kDust(t, o.dust ?? 1);
}
/* Grund „LD Beyond“: tiefes Nachtblau mit feinem Raster und blauem Schein (bx-farben: --bg, --bx-grid, --bx-glow) */
function kbBg(t, o = {}) {
  g.fillStyle = KL.bg; g.fillRect(0, 0, W, H);
  const ga = o.grid ?? 1;
  if (ga > 0) {
    const off = (t * 5) % 64; g.save(); g.strokeStyle = `rgba(148,178,220,${0.075 * ga})`; g.lineWidth = 1; g.beginPath();
    for (let x = off - 64; x < W + 64; x += 64) { g.moveTo(Math.round(x) + 0.5, KT); g.lineTo(Math.round(x) + 0.5, KBO); }
    for (let y = KT + 26; y < KBO; y += 64) { g.moveTo(0, y + 0.5); g.lineTo(W, y + 0.5); }
    g.stroke(); g.restore();
    /* Raster läuft zum Rand aus */
    const m = g.createRadialGradient(W / 2, KCY, 200, W / 2, KCY, W * 0.6); m.addColorStop(0, 'rgba(5,7,12,0)'); m.addColorStop(1, 'rgba(5,7,12,0.96)'); g.fillStyle = m; g.fillRect(0, KT, W, KH);
  }
  glow(W * (o.gx ?? 0.5), KT + (o.gy ?? -80), o.gr ?? 900, KL.acc, o.top ?? 0.13);
  kDust(t, (o.dust ?? 0.6), '#9cc8f2');
}
const kBg = (t, o) => (KB ? kbBg(t, o) : kaBg(t, o));
/* Lichtstreifen wie von einem anamorphotischen Objektiv */
function kFlare(x, y, w, col, a = 1) {
  if (a <= 0.004) return;
  g.save(); g.globalCompositeOperation = 'lighter';
  const gr = g.createLinearGradient(x - w, 0, x + w, 0); gr.addColorStop(0, rgba(col, 0)); gr.addColorStop(0.5, rgba(col, 0.95)); gr.addColorStop(1, rgba(col, 0)); g.fillStyle = gr;
  for (const [h, al] of [[3, 1], [12, 0.3], [44, 0.1]]) { g.globalAlpha = clamp(a * al); g.fillRect(x - w, y - h / 2, w * 2, h); }
  g.restore(); glow(x, y, w * 0.2, col, clamp(a * 0.7)); glow(x, y, w * 0.045, '#FFFFFF', clamp(a));
}
/* Blitz und Stoß auf einem Schnitt: tl = Zeit seit dem Schnitt */
/* Der Blitz wird je Bild nur einmal gezeichnet (der stärkste gewinnt, höchstens 0,5) — sonst addieren sich Szenen- und Schnittblitz zu Weiß */
let KFL = 0, KFLC = '#FFFFFF';
function kCutFlash(tl, a = 0.5, col = '#FFFFFF') { const k = a * Math.exp(-tl * 9); if (k > KFL) { KFL = k; KFLC = col; } }
function kPunch(tl, amt = 0.05, fn) { const k = amt * Math.exp(-tl * 7); g.save(); g.translate(W / 2 + Math.sin(tl * 80) * 220 * k, KCY + Math.cos(tl * 67) * 140 * k); g.scale(1 + k, 1 + k); g.translate(-W / 2, -KCY); fn(); g.restore(); }
/* Schrift: gesperrte Zeile, mittig sauber trotz Laufweite (letterSpacing hängt auch am letzten Zeichen) */
function kText(str, x, y, o = {}) {
  const size = o.size ?? 60, ls = (o.track ?? 0) * size, al = o.align ?? 'center';
  g.save(); g.font = `${o.it ? 'italic ' : ''}${o.w ?? KL.headW} ${size}px ${o.fam ?? KL.head}`; g.textAlign = al; g.textBaseline = 'alphabetic'; g.letterSpacing = ls + 'px'; g.globalAlpha *= o.alpha ?? 1;
  const xx = al === 'center' ? x + ls / 2 : al === 'right' ? x + ls : x;
  if (o.stroke) { g.lineWidth = o.stroke; g.lineJoin = 'round'; g.strokeStyle = o.col ?? KL.ink; g.strokeText(str, xx, y); }
  else { if (o.grad) { const gr = g.createLinearGradient(0, y - size * 0.78, 0, y + size * 0.08); o.grad.forEach(([p, c]) => gr.addColorStop(p, c)); g.fillStyle = gr; } else g.fillStyle = o.col ?? KL.ink; g.fillText(str, xx, y); }
  g.restore();
}
const kMeasure = (str, size, o = {}) => { g.save(); g.font = `${o.it ? 'italic ' : ''}${o.w ?? KL.headW} ${size}px ${o.fam ?? KL.head}`; g.letterSpacing = (o.track ?? 0) * size + 'px'; const w = g.measureText(str).width - (o.track ?? 0) * size; g.restore(); return w; };
const kFit = (str, max, size, o = {}) => { while (size > 14 && kMeasure(str, size, o) > max) size -= 2; return size; };
const kLabel = (str, x, y, o = {}) => kText(str.toUpperCase(), x, y, { size: o.size ?? 22, w: o.w ?? 500, fam: KL.mono, track: o.track ?? 0.3, col: o.col ?? KL.soft, alpha: o.alpha, align: o.align ?? 'center' });
/* Texttafel: Zeilen [{ s, size, w, fam, it, col, track, lh, at }] mittig um cy; jede Zeile blendet gestaffelt ein, die Tafel schiebt sich
   langsam nach vorn und die Laufweite wächst ein wenig — die klassische Bewegung der Trailer-Tafeln */
function kCard(lines, lt, D, o = {}) {
  const inD = o.inD ?? 0.7, outD = o.outD ?? 0.45, cy = o.cy ?? KCY, k = lt / D, sc = 1 + (o.push ?? 0.045) * k, out = o.noOut ? 1 : 1 - eIn(seg(lt, D - outD, D));
  const tot = lines.reduce((a, l) => a + l.size * (l.lh ?? 1.28), 0); let y = cy - tot / 2;
  g.save(); g.translate(W / 2, cy); g.scale(sc, sc); g.translate(-W / 2, -cy);
  lines.forEach((l, i) => {
    const h = l.size * (l.lh ?? 1.28), at = l.at ?? i * (o.stag ?? 0.4), a = eOut(seg(lt, at, at + inD)) * out, base = y + h * 0.5 + l.size * 0.34; y += h;
    if (a <= 0.004) return;
    kText(l.s, o.cx ?? W / 2, base + (1 - eOut5(seg(lt, at, at + inD * 1.4))) * 14, { size: l.size, w: l.w, fam: l.fam, it: l.it, col: l.col, grad: l.grad, track: (l.track ?? 0) + (l.grow ?? 0.03) * k, alpha: a });
  });
  g.restore();
}
/* Lichtkante, die einmal über eine Schrift läuft: fn zeichnet die Schrift, p = 0…1 Lauf der Kante */
function kSweep(fn, p, col = '#FFFFFF', a = 0.9) {
  drawInto(KL1, () => { fn(); if (p > 0 && p < 1) { const x = lerp(-500, W + 500, p), gr = g.createLinearGradient(x - 260, 0, x + 260, 0); gr.addColorStop(0, rgba(col, 0)); gr.addColorStop(0.5, rgba(col, a)); gr.addColorStop(1, rgba(col, 0)); g.globalCompositeOperation = 'source-atop'; g.fillStyle = gr; g.transform(1, 0, -0.5, 1, 270, 0); g.fillRect(-600, 0, W + 1200, H); } });
  g.drawImage(KL1.canvas, 0, 0);
}
/* Bildfahrt: Bild füllt das Fenster; Zoom und Ausschnitt wandern über die Dauer (z0→z1, x0→x1, y0→y1). sat < 1 entsättigt, dim dunkelt ab. */
function kShot(img, lt, D, o = {}) {
  const k = clamp(lt / D), e = o.ease ? eIO(k) : k;
  imgCover(img, 0, KT, W, KH, 0, { zoom: lerp(o.z0 ?? 1.03, o.z1 ?? 1.12, e), px: lerp(o.x0 ?? 0.5, o.x1 ?? o.x0 ?? 0.5, e), py: lerp(o.y0 ?? 0.5, o.y1 ?? o.y0 ?? 0.5, e) });
  if ((o.sat ?? 1) < 1) { g.save(); g.globalCompositeOperation = 'saturation'; g.globalAlpha = 1 - o.sat; g.fillStyle = '#808080'; g.fillRect(0, KT, W, KH); g.restore(); }
  if (o.tint) { g.save(); g.globalCompositeOperation = 'multiply'; g.fillStyle = o.tint; g.fillRect(0, KT, W, KH); g.restore(); }
  if (o.dim) { g.fillStyle = `rgba(0,0,0,${o.dim})`; g.fillRect(0, KT, W, KH); }
}
/* Verlauf für Bildunterschriften: unten und links dunkel */
function kShade(o = {}) {
  const a = o.a ?? 0.85; let gr = g.createLinearGradient(0, KBO - (o.h ?? 420), 0, KBO); gr.addColorStop(0, 'rgba(0,0,0,0)'); gr.addColorStop(1, `rgba(0,0,0,${a})`); g.fillStyle = gr; g.fillRect(0, KT, W, KH);
  if (o.left) { gr = g.createLinearGradient(0, 0, W * o.left, 0); gr.addColorStop(0, `rgba(0,0,0,${a})`); gr.addColorStop(1, 'rgba(0,0,0,0)'); g.fillStyle = gr; g.fillRect(0, KT, W, KH); }
}
/* weichgezeichnete Fassung eines Bildes als Hintergrund (einmal klein gerechnet, dann vergrößert) */
const KBL = new Map();
function kBlurBg(key, o = {}) {
  const img = IMG[key]; if (!img) return;
  if (!KBL.has(key)) { const c = mkLayer(384, 162); c.filter = 'blur(7px)'; const s = Math.max(404 / img.width, 182 / Math.min(img.height, img.width * 0.6)); c.drawImage(img, (384 - img.width * s) / 2, -10, img.width * s, img.height * s); KBL.set(key, c.canvas); }
  g.save(); g.globalAlpha *= o.a ?? 0.55; g.imageSmoothingQuality = 'high'; const z = o.z ?? 1.08; g.drawImage(KBL.get(key), W / 2 - (W * z) / 2, KCY - (KH * z) / 2, W * z, KH * z); g.restore();
  g.fillStyle = `rgba(3,5,10,${o.dim ?? 0.45})`; g.fillRect(0, KT, W, KH);
}
/* Telefon im Seitenverhältnis der Aufnahme (390 × 844) */
function kPhone(img, cx, cy, w, o = {}) {
  const h = (w * 844) / 390, r = w * 0.13, x0 = cx - w / 2, y0 = cy - h / 2;
  g.save(); g.globalAlpha *= o.alpha ?? 1;
  g.save(); g.shadowColor = o.shadow ?? 'rgba(0,0,0,0.6)'; g.shadowBlur = 60; g.shadowOffsetY = 24; g.fillStyle = '#06080d'; rr(x0 - 9, y0 - 9, w + 18, h + 18, r + 8); g.fill(); g.restore();
  g.strokeStyle = 'rgba(200,220,255,0.22)'; g.lineWidth = 2; rr(x0 - 9, y0 - 9, w + 18, h + 18, r + 8); g.stroke();
  if (img) { g.save(); rr(x0, y0, w, h, r); g.clip(); g.drawImage(img, x0, y0, w, h); g.restore(); }
  g.restore();
}
/* Lorbeer (wie auf Filmplakaten um eine Auszeichnung): zwei Zweige, p = 0…1 wächst von unten */
function kLaurel(cx, cy, r, col, a = 1, p = 1) {
  g.save(); g.globalAlpha *= a; g.fillStyle = col; g.strokeStyle = col; g.lineWidth = Math.max(2, r * 0.014); const n = 9;
  for (const side of [1, -1]) {
    g.save(); if (side < 0) { g.translate(2 * cx, 0); g.scale(-1, 1); }
    /* Zweig: Bogen von unten (250°) über links nach oben (112°), an jedem Knoten zwei Blätter */
    g.beginPath(); g.arc(cx, cy, r, -4.36, -lerp(4.36, 1.95, clamp(p)), false); g.stroke();
    for (let i = 0; i < n; i++) {
      const q = i / (n - 1); if (q > p) break;
      const an = lerp(4.36, 1.95, q), x = cx + Math.cos(an) * r, y = cy - Math.sin(an) * r, th = Math.atan2(Math.cos(an), Math.sin(an)), len = r * lerp(0.36, 0.2, q), wid = len * 0.36, gr = clamp((p - q) * (n - 1) + 0.25);
      for (const tilt of [-0.62, 0.62]) { const ro = th + tilt; g.beginPath(); g.ellipse(x + Math.cos(ro) * len * 0.45, y + Math.sin(ro) * len * 0.45, (len / 2) * gr, (wid / 2) * gr, ro, 0, 7); g.fill(); }
    }
    g.restore();
  }
  g.restore();
}
/* Abspann-Block wie auf einem Filmplakat: schmale, hohe Schrift (waagerecht gestaucht), kleine Funktionswörter vor großen Namen.
   rows = [[['s', 'mit'], ['b', 'React'], …], …] */
function kBilling(rows, cx, y, o = {}) {
  const size = o.size ?? 46, lh = size * 1.2, col = o.col ?? KL.soft, maxW = o.maxW ?? 1500, fam = KB ? GEI : MAN;
  rows.forEach((row, r) => {
    const parts = row.map(([kind, s]) => ({ s: s.toUpperCase(), size: kind === 's' ? size * 0.5 : size, w: kind === 's' ? 500 : 700, dy: kind === 's' ? -size * 0.2 : 0 }));
    const gap = size * 0.3; let tot = gap * (parts.length - 1); parts.forEach((p) => { p.wd = measure(p.s, p.size, p.w, fam, p.size * 0.05); tot += p.wd; });
    const sx = Math.min(o.sx ?? 0.6, maxW / tot); let x = -tot / 2;
    g.save(); g.translate(cx, 0); g.scale(sx, 1); g.globalAlpha *= (o.alpha ?? 1) * eOut(seg(o.p ?? 1, r * 0.12, r * 0.12 + 0.5));
    parts.forEach((p) => { text(p.s, x, y + r * lh + p.dy, { size: p.size, weight: p.w, fam, ls: p.size * 0.05, color: col }); x += p.wd + gap; });
    g.restore();
  });
  return rows.length * lh;
}
/* Abschluss jedes Bildes: Korn, Randabdunklung, Balken, Auf- und Abblende */
const KGRAIN = (() => { const c = mkLayer(256, 256), d = c.createImageData(256, 256); for (let i = 0; i < d.data.length; i += 4) { const v = Math.floor(hash(i * 0.41 + 3) * 255); d.data[i] = d.data[i + 1] = d.data[i + 2] = v; d.data[i + 3] = 255; } c.putImageData(d, 0, 0); return c.canvas; })();
function kFinish(t) {
  const v = g.createRadialGradient(W / 2, KCY, KH * 0.5, W / 2, KCY, W * 0.62); v.addColorStop(0, 'rgba(0,0,0,0)'); v.addColorStop(1, 'rgba(0,0,0,0.6)'); g.fillStyle = v; g.fillRect(0, KT, W, KH);
  g.save(); g.globalAlpha = 0.05; g.globalCompositeOperation = 'overlay'; const f = Math.floor(t * 30), ox = Math.floor(hash(f) * 256), oy = Math.floor(hash(f + 4) * 256); for (let y = KT - oy; y < KBO; y += 256) for (let x = -ox; x < W; x += 256) g.drawImage(KGRAIN, x, y); g.restore();
  g.fillStyle = '#000'; g.fillRect(0, 0, W, KT); g.fillRect(0, KBO, W, H - KBO);
  const k = Math.max(1 - eOut(seg(t, 0, 0.8)), eIn(seg(t, DUR - 1.3, DUR - 0.05)));
  if (k > 0) { g.fillStyle = `rgba(0,0,0,${k})`; g.fillRect(0, 0, W, H); }
}

/* ---------- gemeinsame Szene: Auftakt „loona! designs zeigt“ ---------- */
const KTX = { de: { presents: 'zeigt', rate1: 'Die folgende Vorschau ist freigegeben für', rate2: 'alle Bildschirmgrößen' }, en: { presents: 'presents', rate1: 'The following preview has been approved for', rate2: 'all screen sizes' } }[LANG];
/* Freigabe-Tafel (nur „Über mich“, ab drei Takten Auftakt): die Tafel, die im Kino vor jedem Trailer steht — hier in den Farben der Marke
   und mit eigener Zeile */
function kRating(lt, d) {
  const a = eOut(seg(lt, 0.1, 0.5)) * (1 - eIn(seg(lt, d - 0.4, d))), w = 1240, h = 400, x = (W - w) / 2, y = KCY - h / 2;
  g.save(); g.globalAlpha = a; g.fillStyle = BR.night; rr(x, y, w, h, 10); g.fill(); g.strokeStyle = rgba(BR.cream, 0.9); g.lineWidth = 3; rr(x + 16, y + 16, w - 32, h - 32, 4); g.stroke();
  kText(KTX.rate1.toUpperCase(), W / 2, y + 138, { size: 30, w: 700, fam: MAN, track: 0.14, col: BR.cream });
  kText(KTX.rate2.toUpperCase(), W / 2, y + 244, { size: kFit(KTX.rate2.toUpperCase(), w - 160, 84, { w: 800, fam: MAN, track: 0.06 }), w: 800, fam: MAN, track: 0.06, col: BR.cream });
  kText(LINKS[0].toUpperCase(), W / 2, y + 320, { size: 20, w: 500, fam: MONO, track: 0.3, col: rgba(BR.cream, 0.7) });
  g.restore();
}
KS.studio = {
  sec: 'dark',
  draw(lt, D) {
    kBg(lt, { top: 0.06, grid: 0.5, warm: 0.04, cool: 0.08 });
    const rating = !KB && D > 2.6 * BAR, t1 = rating ? BAR * 1.15 : 0;
    if (rating && lt < t1) { kRating(lt, t1); return; }
    const u = lt - t1, d = D - t1, f = Math.min(1, d / 3.4), a = 1 - eIn(seg(u, d - 0.55, d));
    g.save(); g.globalAlpha = a;
    kFlare(W / 2, KCY - 18, 620 + 240 * eOut(seg(u, 0, d)), KL.warm, 0.5 * eOut(seg(u, 0.1 * f, 1.2 * f)) * (1 - 0.5 * seg(u, 1.2 * f, d)));
    lockup(W / 2, KCY - 18, 104, KL.ink, { pm: seg(u, 0.12 * f, 1.3 * f), pw: seg(u, 0.75 * f, 1.7 * f) });
    kLabel(KTX.presents, W / 2, KCY + 112, { size: 22, track: 0.6, alpha: eOut(seg(u, 1.3 * f, 2.1 * f)) });
    g.restore();
  },
};

/* ---------- Renderer ---------- */
RETRO.kino = {
  init: async () => {
    await Promise.all((KB ? [[500, UNB], [600, UNB], [700, UNB], [400, GEI], [500, GEI], [700, GEI], [500, GMO]] : []).map(([w, f]) => document.fonts.load(`${w} 100px ${f}`)));
  },
  render(t) {
    const s = sceneAt(t), lt = clamp(t - s.t0, 0, s.D), sc = KS[s.id];
    g.fillStyle = '#000'; g.fillRect(0, 0, W, H);
    g.save(); g.beginPath(); g.rect(0, KT, W, KH); g.clip(); KFL = 0;
    sc.draw(lt, s.D, kPlan(s), s);
    if (sc.flash && s.i > 0) kCutFlash(lt, sc.flash, KB ? '#bfe4ff' : '#FFFFFF');
    if (KFL > 0.02) { g.globalCompositeOperation = 'lighter'; g.fillStyle = rgba(KFLC, Math.min(0.5, KFL)); g.fillRect(0, KT, W, KH); }
    g.restore();
    kFinish(t);
  },
};

/* ---------- Musik beider Filme ---------- */
/* Aufbau wie bei Trailer-Musik: dunkler Auftakt, Klavier, Puls, Steigerung, Stille vor dem Titel, Einschlag zum Titel, Ausklang. Dasselbe
   Leitmotiv in d-Moll wie alle Stücke (CH in music.js). „Über mich“ (96 BPM): Orchester-Klang — Streicher-Ostinato, Taikos, Hörner.
   „LD Beyond“ (112 BPM): Hybrid — gezupfter Synth-Puls, Sub-Bass, Supersaw. Die Schnitte der Bilder (kPlan → hits) bekommen Akzente. */
function kinoMusic(A, s, si, sc) {
  const sec = KS[s.id].sec, prog = progFor(s.bars), last = si === sc.length - 1, S = B / 4, P = kPlan(s);
  const ost = (t0, c, n, g0, hi) => { for (let e = 0; e < n; e++) { const ix = [0, 2, 1, 2, 3, 2, 1, 2][e % 8], t = t0 + (e * BAR) / n, gg = g0 * (e % (n / 4) === 0 ? 1.3 : 0.9);
    if (KB) A.pluck(t, c.arp[ix] - (hi ? 0 : 12), gg * 2.1, { cut: hi ? 5600 : 3600, pan: e % 2 ? 0.35 : -0.35, dly: 0.3, dur: 0.22 });
    else { A.tone(t, 0.13, midi(c.arp[ix] - 12), 'sawtooth', gg * 1.3, { decay: true, att: 0.004, cut: 3800, cut1: 1300, cutT: 0.09, pan: -0.3, wet: 0.55 }); if (hi) { A.tone(t, 0.13, midi(c.arp[ix]), 'sawtooth', gg * 1.3, { decay: true, att: 0.004, cut: 5600, cut1: 1900, cutT: 0.09, pan: 0.3, wet: 0.55 }); A.tone(t, 0.1, midi(c.arp[ix] + 12), 'sawtooth', gg * 0.5, { decay: true, att: 0.004, cut: 7000, cut1: 2600, cutT: 0.07, pan: 0, wet: 0.6 }); } } } };
  const horn = (t, n, l, g0) => { A.tone(t, l * 0.96, midi(n - 12), 'sawtooth', g0, { att: 0.07, rel: 0.18, cut: 2000, wet: 0.7 }); A.tone(t, l * 0.96, midi(n), 'sawtooth', g0 * 1.1, { att: 0.08, rel: 0.18, cut: 3000, det: 5, wet: 0.7 }); A.tone(t, l * 0.96, midi(n + 12), 'sawtooth', g0 * 0.4, { att: 0.1, rel: 0.2, cut: 4200, det: -6, wet: 0.75 }); };
  for (let k = 0; k < s.bars; k++) {
    const t0 = s.t0 + k * BAR, cn = prog[k], c = CH[cn], lastBar = k === s.bars - 1, pr = s.bars > 1 ? k / (s.bars - 1) : 1;
    if (sec === 'dark') {
      A.sub(t0, BAR + 0.3, 26, 0.1, { att: 0.5, rel: 0.8 }); A.pad(t0, BAR + 0.9, [38, 45, 50], 0.016, { cut: 420 + 300 * pr, att: 1.1, rel: 1.2, wet: 0.9 });
      if (k === 0) A.piano(t0 + B, 74, 0.2, 4.5, { soft: true, wet: 0.95 }); if (lastBar) { A.piano(t0 + 2 * B, 69, 0.18, 4, { soft: true, wet: 0.95 }); A.riser(t0 + BAR * 0.4, BAR * 0.6, 0.06); }
    } else if (sec === 'piano') {
      A.pad(t0, BAR + 0.8, c.pad, 0.016, { cut: 700, att: 0.9, rel: 1.0, wet: 0.85 }); A.sub(t0, BAR, c.bass, 0.07, { att: 0.2, rel: 0.6 });
      A.piano(t0, c.bass + 12, 0.26, 4, { soft: true, wet: 0.8 }); A.piano(t0 + 2 * B, c.arp[1] - 12, 0.16, 3, { soft: true, wet: 0.8 });
      A.mel(t0, cn, (t, n, l) => A.piano(t, n, 0.36, Math.max(2.4, l * 2.4), { soft: true, wet: 0.85, dly: 0.2 }), { skip: k % 2 ? (b) => b === 1.5 : undefined });
      /* die Uhr: leise Achtel — bei „LD Beyond“ ein weicher Sinus-Puls */
      for (let e = 0; e < 8; e++) { if (KB) A.tone(t0 + (e * B) / 2, 0.09, midi(86), 'sine', 0.012 + 0.012 * pr, { decay: true, att: 0.003, cut: 9000, pan: e % 2 ? 0.5 : -0.5, wet: 0.6, dly: 0.3 }); else A.hat(t0 + (e * B) / 2, (e % 2 ? 0.012 : 0.02) * (0.5 + 0.5 * pr), 0.02, e % 2 ? 0.4 : -0.4); }
      if (lastBar && !last) A.riser(t0 + BAR * 0.25, BAR * 0.75, 0.12);
    } else if (sec === 'pulse' || sec === 'lift') {
      const E = sec === 'lift' ? 1.05 : 0.95 + 0.3 * pr;
      A.pad(t0, BAR + 0.6, c.pad, 0.024 * E, { cut: 1300 + 1300 * pr, att: 0.5, rel: 0.8, wet: 0.75 }); A.pad(t0, BAR + 0.6, [c.pad[2] + 12, c.pad[3] + 12], 0.01 * E, { wave: 'triangle', cut: 4200, att: 0.6, rel: 0.8, wet: 0.8 }); A.sub(t0, BAR - 0.05, c.bass, 0.055 * E, { att: 0.08, rel: 0.4 });
      ost(t0, c, 8, 0.062 * E, pr > 0.3 || sec === 'lift');
      A.kick(t0, 0.5 * E, { f0: 130, f1: 44, dec: 0.4, soft: true }); if (KB) { A.kick(t0 + 2 * B, 0.38 * E, { f0: 130, f1: 44, dec: 0.35, soft: true }); for (let e = 0; e < 8; e++) A.hat(t0 + (e * B) / 2, e % 2 ? 0.08 * E : 0.04 * E, 0.03, e % 2 ? 0.3 : -0.3); if (sec === 'lift' || pr > 0.5) A.clap(t0 + 3 * B, 0.14 * E); } else { A.taiko(t0 + 2.5 * B, 40, 0.22 * E); if (pr > 0.5) A.taiko(t0 + 3.5 * B, 43, 0.17 * E); for (let e = 0; e < 8; e++) A.shaker(t0 + (e * B) / 2, (e % 2 ? 0.05 : 0.03) * E, e % 2 ? 0.4 : -0.4); }
      if (sec === 'lift') { if (k === 0) { A.braam(t0, BAR * 1.6, c.bass + 12, 0.11); A.chime(t0 + (KB ? B : 0.4), [74, 77, 81, 84, 86, 89], 0.05, 0.07); } A.mel(t0, cn, (t, n, l) => (KB ? A.saw5(t, l * 0.95, n, 0.026, { att: 0.04, rel: 0.2, cut: 3400, wet: 0.7, dly: 0.2 }) : horn(t, n, l, 0.055))); }
      else if (pr > 0.3) A.mel(t0, cn, (t, n, l) => (KB ? A.bell(t, n, 0.055, { dur: 1.6 }) : horn(t, n, l, 0.036 + 0.022 * pr)), { skip: k % 2 ? (b) => b >= 2 : undefined });
      if (lastBar && !last) { A.riser(t0, BAR, 0.16); [12, 13, 14, 15].forEach((e) => A.taiko(t0 + e * S, 33 + (e - 12) * 2, 0.26 + (e - 12) * 0.07)); }
    } else if (sec === 'drive' || sec === 'peak') {
      const pk = sec === 'peak', E = pk ? 1.12 : 1.0 + 0.1 * pr;
      A.pad(t0, BAR + 0.6, c.pad, 0.024 * E, { cut: pk ? 3200 : 2400, att: 0.4, rel: 0.8, wet: 0.75 }); A.pad(t0, BAR + 0.6, [c.pad[2] + 12, c.pad[3] + 12], 0.016 * E, { wave: 'triangle', cut: 4600, att: 0.5, rel: 0.8, wet: 0.8 });
      ost(t0, c, pk ? 16 : 8, (pk ? 0.052 : 0.064) * E, true);
      if (KB) {
        for (let b = 0; b < 4; b++) A.kick(t0 + b * B, 0.62, { f0: 150, f1: 46, dec: 0.32, duck: 0.6 }); A.clap(t0 + B, 0.26); A.clap(t0 + 3 * B, 0.28);
        for (let e = 0; e < 16; e++) A.hat(t0 + e * S, e % 4 === 2 ? 0.11 : e % 2 ? 0.045 : 0.065, e % 4 === 2 ? 0.07 : 0.03, e % 2 ? 0.35 : -0.35);
        for (let e = 0; e < 8; e++) A.bass(t0 + (e * B) / 2, B / 2 - 0.02, c.bass + 12, e % 2 ? 0.07 : 0.05, { cut: pk ? 2200 : 1500, cut1: 500 });
      } else {
        const TK = pk ? 'L..lL.l.L.lL.lLl' : 'L..l..L.l..lL.l.'; [...TK].forEach((ch, e) => { if (ch === 'L') A.taiko(t0 + e * S, 36, 0.26 * E); else if (ch === 'l') A.taiko(t0 + e * S, 43, 0.22 * E); });
        for (let e = 0; e < 16; e++) A.shaker(t0 + e * S, e % 4 === 2 ? 0.11 : 0.06, e % 2 ? 0.4 : -0.4); A.sub(t0, BAR - 0.05, c.bass, 0.045 * E, { att: 0.05, rel: 0.3 });
        for (let e = 0; e < 8; e++) A.bass(t0 + (e * B) / 2, B / 2 - 0.02, c.bass + 12, 0.05, { cut: pk ? 2000 : 1400, cut1: 500 });
        A.snare(t0 + 2 * B, pk ? 0.26 : 0.16); if (pk) { A.snare(t0 + 3.5 * B, 0.12); for (let e = 0; e < 8; e++) A.hat(t0 + (e + 0.5) * (B / 2), 0.05, 0.03, e % 2 ? 0.3 : -0.3); }
      }
      if (k % 2 === 0) { A.impact(t0, pk ? 0.3 : 0.18); if (pk) A.braam(t0, BAR * 0.92, c.bass + 12, 0.08); }
      A.mel(t0, cn, (t, n, l) => { if (KB) { A.saw5(t, l * 0.95, n, 0.032 * E, { att: 0.03, rel: 0.18, cut: pk ? 4800 : 3600, wet: 0.65, dly: 0.25 }); A.saw5(t, l * 0.95, n + 12, pk ? 0.022 : 0.012, { att: 0.03, rel: 0.2, cut: 5600, wet: 0.7 }); } else { horn(t, n, l, 0.07 * E); A.saw5(t, l * 0.96, n + 12, pk ? 0.026 : 0.014, { att: 0.05, rel: 0.2, cut: 5000, wet: 0.7 }); } });
      if (lastBar && !last) { A.riser(t0, BAR, 0.2); for (let e = 0; e < 16; e++) A.snare(t0 + e * S, 0.03 + e * 0.012); [12, 13, 14, 15].forEach((e) => A.taiko(t0 + e * S, 33 + (e - 12) * 2, 0.3 + (e - 12) * 0.08)); }
    } else if (sec === 'stop') {
      /* Stille: nur der Nachhall des letzten Schlags, ein Klavierton zur Zeile — im letzten Takt holt die Musik Luft für den Titel */
      if (k === 0) { A.sub(t0, BAR * Math.min(2, s.bars) , 26, 0.06, { att: 0.6, rel: 1.2 }); A.piano(t0 + B, 62, 0.3, 5, { soft: true, wet: 0.95 }); A.piano(t0 + B, 74, 0.18, 5, { soft: true, wet: 0.95 }); }
      else if (!lastBar) A.piano(t0 + B, 69, 0.22, 5, { soft: true, wet: 0.95 });
      if (lastBar) { A.riser(t0, BAR, 0.3); A.swell(t0 + BAR, Math.min(BAR, 2.2), CH.Dm.pad, 0.04); if (s.bars > 1) [8, 10, 12, 13, 14, 15].forEach((e, i) => A.taiko(t0 + e * S, 33, 0.2 + i * 0.07)); }
    } else if (sec === 'title') {
      const E = k === 0 ? 1.15 : 1;
      A.pad(t0, BAR + 0.8, c.pad, 0.028 * E, { cut: 2000, att: 0.25, rel: 1.0, wet: 0.8 }); A.pad(t0, BAR + 0.8, c.pad.slice(1).map((n) => n + 12), 0.014, { wave: 'triangle', cut: 3800, att: 0.4, rel: 1.0, wet: 0.85 });
      A.sub(t0, BAR - 0.05, c.bass, 0.11, { att: 0.04, rel: 0.5 }); A.braam(t0, BAR * 0.95, c.bass + 12, k === 0 ? 0.16 : 0.1);
      A.taiko(t0, 33, 0.5); A.taiko(t0 + 2.5 * B, 38, 0.36); if (k % 2) A.taiko(t0 + 3.5 * B, 40, 0.3);
      A.mel(t0, cn, (t, n, l) => { A.piano(t, n, 0.5, Math.max(2.4, l * 2.4), { wet: 0.75, dly: 0.2 }); A.piano(t, n + 12, 0.3, 2.4, { wet: 0.8 }); if (KB) A.saw5(t, l * 0.96, n, 0.024, { att: 0.03, rel: 0.25, cut: 3200, wet: 0.7, dly: 0.25 }); else horn(t, n, l, 0.06); A.saw5(t, l * 0.96, n + 12, 0.014, { att: 0.05, rel: 0.25, cut: 4200, wet: 0.75 }); });
      if (KB) for (let e = 0; e < 8; e++) A.pluck(t0 + (e * B) / 2, c.arp[[0, 2, 1, 2, 3, 2, 1, 2][e]], 0.05, { cut: 3600, pan: e % 2 ? 0.35 : -0.35, dly: 0.35 });
    } else if (sec === 'tail') {
      A.pad(t0, BAR + 0.8, c.pad, 0.02, { cut: 1200, att: 0.6, rel: 1.0, wet: 0.85 }); A.sub(t0, BAR, c.bass, 0.08, { att: 0.15, rel: 0.5 });
      if (!lastBar || s.bars === 1) A.mel(t0, cn, (t, n, l) => A.piano(t, n, 0.42, Math.max(2.4, l * 2.4), { wet: 0.8, dly: 0.2 }));
      for (let e = 0; e < 8; e++) A.pluck(t0 + (e * B) / 2, c.arp[[0, 2, 1, 2, 3, 2, 1, 2][e]] - 12, 0.04, { cut: 2000, pan: e % 2 ? 0.3 : -0.3, dly: 0.35 });
      if (lastBar) { A.pad(t0, BAR, [38, 50, 57, 62, 65], 0.022, { cut: 1600, att: 0.3, rel: BAR * 0.6, wet: 0.85 }); A.piano(t0, 62, 0.34, 3.5, { wet: 0.9 }); A.piano(t0, 74, 0.28, 3.5, { wet: 0.9 }); A.impact(t0, 0.5); }
    }
  }
  /* Akzent auf dem Szenenwechsel */
  if (si > 0) {
    if (sec === 'title') { A.impact(s.t0, 1.2); A.chime(s.t0 + 0.05, [74, 77, 81, 86, 89], 0.07, 0.06); A.noise(s.t0, 2.2, 9000, 4000, 0.16, { wet: 0.7 }); }
    else if (sec === 'peak' || sec === 'drive' || sec === 'lift') { A.whoosh(s.t0, 0.2, 0.6); A.impact(s.t0, sec === 'peak' ? 0.95 : 0.7); A.noise(s.t0, 1.4, 9000, 5000, 0.12, { wet: 0.5 }); }
    else if (sec === 'pulse') { A.whoosh(s.t0, 0.16, 0.7); A.impact(s.t0, 0.55); }
    else if (sec === 'stop') { /* der Schlag davor klingt aus — ein tiefer Abgang markiert die Stille */ A.tone(s.t0, 1.8, 62, 'sine', 0.2, { decay: true, att: 0.005, bend: 2.2, bendT: 1.2, cut: 400, wet: 0.5 }); A.noise(s.t0, 1.6, 2400, 120, 0.2, { type: 'lowpass', wet: 0.9 }); }
    else if (sec === 'tail') { A.whoosh(s.t0, 0.12, 0.8); A.impact(s.t0, 0.45); }
    else A.chime(s.t0, [CH.Dm.arp[1] + 12, CH.Dm.arp[2] + 12], 0.03, 0.18);
  }
  /* Akzente auf den Schnitten innerhalb der Szene */
  (P.hits || []).forEach(([lt, v]) => { if (lt < 0.01) return; const t = s.t0 + lt; if (v >= 0.8) { A.whoosh(t, 0.14, 0.4); A.taiko(t, 33, 0.42 * v); A.noise(t, 0.5, 8000, 3500, 0.07 * v, { wet: 0.5 }); } else if (v >= 0.4) { A.taiko(t, 38, 0.3 * v + 0.1); A.noise(t, 0.3, 7000, 4000, 0.04, { wet: 0.4 }); } else A.noise(t, 0.25, 6000, 3000, 0.03 + 0.05 * v, { wet: 0.4 }); });
}
