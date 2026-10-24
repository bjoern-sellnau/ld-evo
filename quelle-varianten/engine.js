/* Gemeinsame Engine der Reel-Varianten (1080×1920, 30 fps). Jede Variante (vNN.js) ruft setup() und start().
   Fakten: loona-designs.de (Über mich, Portfolio), Angaben von Björn Sellnau (Stationen 2007–2025),
   Best of Swiss Web 2017 (Gewinnerlisten), content/*.ts der neuen Website, Repo ld-spreefall (README, Screenshots). */
const W = 1080, H = 1920;
const cv = document.getElementById('c');
let g = cv.getContext('2d');
let inTrans = false;
let B = 0.5, BAR = 2, NB = 16, DUR = 34, BPM = 120;
const C = { bg: '#06080D', ink: '#F2F5FA', soft: '#9AA7BA', mute: '#5F6B7E', amber: '#FFB224', orange: '#FF7A2F', deep: '#FF7816', tileInk: '#171310', cream: '#F4ECDF', cyan: '#5EEAD4', violet: '#C4B5FD', red: '#FF3B5C', green: '#5BD97A', gold: '#E9C46A' };
const SG = '"Space Grotesk"', IS = '"Instrument Sans"', JM = '"JetBrains Mono"';

/* ---------- Fakten (geprüft) ---------- */
const STATIONS = [
  { d: '06/2002', y: 2002, t: 'Ausbildung', s: 'Staatl. gepr. Technischer Assistent für Informatik', k: 'ausbildung' },
  { d: '2003', y: 2003, t: 'Covert Operations Tournament', s: 'Flash-5-Spiel', k: 'spiel' },
  { d: '2004', y: 2004, t: 'Computer Handel Yayci', s: 'Onlineshop', img: 'yayci', k: 'projekt' },
  { d: '2005', y: 2005, t: 'CATT Service · Hannoback', s: 'Kundenprojekte', img: 'catt', k: 'projekt' },
  { d: '2006', y: 2006, t: 'Loona! Designs „ld2006“', s: 'Die eigene Website', img: 'ld2006', k: 'projekt' },
  { d: '09/2007', y: 2007, t: 'PIXELTEX GmbH', s: 'Web Engineer · Hannover, ab 2011 Berlin', k: 'job' },
  { d: '09/2007 – 2009', y: 2007, t: 'Gadmin 4 CMS', s: 'CMS-Entwicklung', k: 'projekt' },
  { d: '06/2010', y: 2010, t: 'Adobe Certified Expert', s: 'Advanced ColdFusion 8', k: 'zert' },
  { d: '2011', y: 2011, t: 'Berlin', s: 'Umzug mit PIXELTEX', k: 'job' },
  { d: '08/2015', y: 2015, t: 'StrongLoop / IBM', s: 'Certified Node Developer', k: 'zert' },
  { d: '01/2016 – 04/2017', y: 2016, t: 'MySwitzerland.com Mobile', s: 'Planung & Umsetzung → Gold, Best of Swiss Web 2017, Kategorie Mobile', k: 'award' },
  { d: '09/2016', y: 2016, t: 'OpenBooking', s: 'Frontend Lead Developer & Mobile Solutions', k: 'job' },
  { d: '08/2018 – 03/2019', y: 2018, t: 'Azubi-Recruiting', s: 'Bewerbungsprozess für Auszubildende', k: 'ausbildung' },
  { d: '03/2019', y: 2019, t: 'IHK Berlin', s: 'Ausbilder-Eignung (AEVO)', k: 'zert' },
  { d: '03/2019 – 02/2020', y: 2019, t: 'Ausbilder', s: 'Fachinformatiker Anwendungsentwicklung', k: 'ausbildung' },
  { d: '05/2020 – 01/2026', y: 2020, t: 'Code-b', s: 'Software Engineer', k: 'job' },
  { d: '01/2022 – 05/2023', y: 2022, t: 'BMW Neuwagensuche', s: 'ab 09/2022 Tech Lead', k: 'lead' },
  { d: '04/2024 – 12/2025', y: 2024, t: 'Tabletop Herald App', s: 'App-Projekt', k: 'projekt' },
  { d: '12/2024', y: 2024, t: 'Stripe', s: '3× Certified Developer', k: 'zert' },
  { d: '2026', y: 2026, t: 'Labs', s: 'Corefall · Covert Operations · SPREE|FALL', k: 'spiel' },
  { d: '05/2026', y: 2026, t: 'Materna SE', s: 'Senior Developer · Public Sector · E-Gov · Zoll', k: 'job' },
];
/* die wichtigsten Stationen für kurze Formate */
const KEY = ['Ausbildung', 'PIXELTEX GmbH', 'Gadmin 4 CMS', 'MySwitzerland.com Mobile', 'OpenBooking', 'Ausbilder', 'Code-b', 'BMW Neuwagensuche', 'Tabletop Herald App', 'Materna SE'].map((t) => STATIONS.find((s) => s.t === t));
const CERTS = [
  ['Claude Code in Action', 'Anthropic · 03/2026'], ['Introduction to Agent Skills', 'Anthropic · 03/2026'], ['KI-Spezialist im Unternehmen', 'Scaly Academy · 11/2025'],
  ['Stripe Certified Professional Developer', 'Stripe · 12/2024'], ['Stripe Certified Billing Developer', 'Stripe · 12/2024'], ['Stripe Certified Associate Developer', 'Stripe · 12/2024'],
  ['Ausbilder nach AEVO', 'IHK Berlin · 03/2019'], ['StrongLoop Certified Node Developer', 'IBM · 08/2015'], ['Adobe Certified Expert — ColdFusion 8', 'Adobe · 06/2010'],
];
const STACK = ['React', 'Next.js', 'TypeScript', 'JavaScript', 'Node.js', 'React Native', 'GraphQL', 'Redux', 'Webpack', 'Styled-Components', 'Jest', 'HTML5', 'CSS3', 'MongoDB', 'MySQL', 'Postgres', 'CouchDB', 'Stripe', 'ColdFusion', 'WebGL', 'Swift', 'Kotlin', 'Claude Code'];
const AWARD = { t: 'Best of Swiss Web 2017', l: 'Gold', c: 'Kategorie Mobile', p: 'Mobile-Relaunch MySwitzerland.com' };
const LINKS = ['loona-designs.de', 'linkedin.com/in/bjoern-sellnau'];
const SEC0 = 604206000; // 01.09.2007 09:00 → 24.10.2026 12:00 (Berlin)

/* ---------- Helfer ---------- */
const clamp = (x, a = 0, b = 1) => Math.max(a, Math.min(b, x));
const lerp = (a, b, k) => a + (b - a) * k;
const seg = (t, a, b) => clamp((t - a) / (b - a));
const eOut = (x) => 1 - Math.pow(1 - x, 3);
const eOut5 = (x) => 1 - Math.pow(1 - x, 5);
const eIn = (x) => x * x * x;
const eIO = (x) => (x < 0.5 ? 4 * x * x * x : 1 - Math.pow(-2 * x + 2, 3) / 2);
const eBack = (x) => { const c1 = 1.70158, c3 = c1 + 1; return 1 + c3 * Math.pow(x - 1, 3) + c1 * Math.pow(x - 1, 2); };
const eElastic = (x) => (x === 0 || x === 1 ? x : Math.pow(2, -10 * x) * Math.sin((x * 10 - 0.75) * (2 * Math.PI) / 3) + 1);
const hash = (n) => { const s = Math.sin(n * 127.1 + 0.3) * 43758.5453; return s - Math.floor(s); };
const bar = (n) => n * BAR;
const beatPh = (t) => ((t % B) + B) % B;
const pulse = (t, k = 7) => Math.exp(-beatPh(t) * k);
const pad2 = (n) => String(n).padStart(2, '0');
const pad3 = (n) => String(n).padStart(3, '0');
function font(size, weight = 700, fam = SG) { return `${weight} ${size}px ${fam}`; }
function text(str, x, y, o = {}) {
  g.save();
  g.font = font(o.size ?? 64, o.weight ?? 700, o.fam ?? SG);
  g.textAlign = o.align ?? 'left'; g.textBaseline = o.base ?? 'alphabetic';
  g.globalAlpha *= o.alpha ?? 1;
  if ('letterSpacing' in g) g.letterSpacing = (o.ls ?? 0) + 'px';
  if (o.glow) { g.shadowColor = o.glow; g.shadowBlur = o.glowSize ?? 30; }
  if (o.stroke) { g.strokeStyle = o.stroke; g.lineWidth = o.lw ?? 3; g.lineJoin = 'round'; g.strokeText(str, x, y); if (o.color) { g.fillStyle = o.color; g.fillText(str, x, y); } }
  else { g.fillStyle = o.color ?? C.ink; g.fillText(str, x, y); }
  g.restore();
}
function measure(str, size, weight = 700, fam = SG, ls = 0) {
  g.save(); g.font = font(size, weight, fam); if ('letterSpacing' in g) g.letterSpacing = ls + 'px';
  const w = g.measureText(str).width; g.restore(); return w;
}
function fit(str, max, size, weight = 700, fam = SG, ls = 0) { while (size > 10 && measure(str, size, weight, fam, ls) > max) size -= 2; return size; }
function rgbText(str, x, y, o = {}, amt = 0) {
  if (amt > 0.5) { g.save(); g.globalCompositeOperation = 'lighter'; text(str, x - amt, y, { ...o, color: 'rgba(255,40,80,0.8)', stroke: undefined, glow: undefined }); text(str, x + amt, y, { ...o, color: 'rgba(40,220,255,0.8)', stroke: undefined, glow: undefined }); g.restore(); }
  text(str, x, y, o);
}
const GLY = '01#$%&*+<>/\\=?@ABCDEFGHJKLMNPRSTUVWXYZ';
function scramble(str, p, seed = 0, tick = 0) {
  const n = str.length; let out = '';
  for (let i = 0; i < n; i++) { const ch = str[i]; if (ch === ' ') { out += ' '; continue; } const at = (i / n) * 0.85; out += p >= at + 0.15 ? ch : p > at - 0.1 ? GLY[Math.floor(hash(seed + i * 7 + tick) * GLY.length)] : ' '; }
  return out;
}
function typed(str, p) { return str.slice(0, Math.floor(str.length * clamp(p))); }
function rr(x, y, w, h, r) { g.beginPath(); g.roundRect(x, y, w, h, r); }
function imgCover(img, x, y, w, h, r = 0, top = false, zoom = 1, px = 0.5, py = 0.5) {
  if (!img) return;
  const s = Math.max(w / img.width, h / img.height) * zoom, iw = img.width * s, ih = img.height * s;
  g.save(); rr(x, y, w, h, r); g.clip(); g.drawImage(img, x + (w - iw) * px, top ? y : y + (h - ih) * py, iw, ih); g.restore();
}
function wrap(str, x, y, max, size, o = {}) {
  const words = str.split(' '); let line = '', ly = y;
  for (const w of words) { const tt = line ? line + ' ' + w : w; if (measure(tt, size, o.weight ?? 500, o.fam ?? IS, o.ls ?? 0) > max && line) { text(line, x, ly, { size, ...o }); line = w; ly += size * (o.lh ?? 1.3); } else line = tt; }
  text(line, x, ly, { size, ...o }); return ly;
}
function kicker(str, x, y, a = 1, col = C.amber, align = 'left', size = 30) { text(str, x, y, { size, weight: 500, fam: JM, color: col, ls: 6, alpha: a, align }); }

/* ---------- Logo: Zeichen und Negativraum (46er-System, Mitte 22/23; Pfade aus glyphs.tsx / LoonaNegative.tsx) ---------- */
const POS_L = new Path2D('M0 3H8V35H19L22 43H0Z');
const POS_D = new Path2D('M11 3H24A20 20 0 0 1 24 43H25L19 27H16V11H11ZM21 11H24A12 12 0 0 1 24 35L21 27Z');
const NEG_L = new Path2D('M8 11H16V27H19L22 35H8Z');
const NEG_D = new Path2D('M21 11H24A12 12 0 0 1 24 35L21 27Z');
function mark(cx, cy, s, o = {}) {
  g.save(); g.translate(cx, cy); if (o.rot) g.rotate(o.rot); g.scale(s * (o.sx ?? 1), s); g.translate(-22, -23);
  const sp = o.split ?? 0;
  if (o.outline > 0) {
    g.save(); g.lineWidth = (o.lw ?? 4) / s; g.strokeStyle = o.lineCol ?? C.orange; g.lineJoin = 'round';
    if (o.lineGlow !== false) { g.shadowColor = o.lineCol ?? C.orange; g.shadowBlur = 18; }
    g.setLineDash([130 * o.outline, 400]); g.save(); g.translate(-sp, 0); g.stroke(POS_L); g.restore();
    g.setLineDash([200 * o.outline, 400]); g.save(); g.translate(sp, 0); g.stroke(POS_D); g.restore();
    g.restore();
  }
  if (o.negOutline > 0) { g.save(); g.lineWidth = (o.lw ?? 4) / s; g.strokeStyle = o.lineCol ?? C.deep; g.setLineDash([80 * o.negOutline, 300]); g.stroke(NEG_L); g.setLineDash([70 * o.negOutline, 300]); g.stroke(NEG_D); g.restore(); }
  if (o.pos > 0) {
    g.save(); g.globalAlpha *= o.pos; g.fillStyle = o.posCol ?? C.ink;
    g.save(); g.translate(-sp, o.dy ?? 0); g.fill(POS_L); g.restore();
    g.save(); g.translate(sp, -(o.dy ?? 0)); g.fill(POS_D, 'evenodd'); g.restore();
    g.restore();
  }
  if (o.neg > 0) {
    g.save(); g.globalAlpha *= o.neg; g.fillStyle = o.negCol ?? C.deep;
    if (o.glow) { g.shadowColor = o.negCol ?? C.deep; g.shadowBlur = o.glow; }
    g.fill(NEG_L); g.fill(NEG_D); g.restore();
  }
  g.restore();
}
function clipNeg(cx, cy, s, ox = 22, oy = 23) {
  g.translate(cx, cy); g.scale(s, s); g.translate(-ox, -oy);
  const p = new Path2D(); p.addPath(NEG_L); p.addPath(NEG_D); g.clip(p);
  g.translate(ox, oy); g.scale(1 / s, 1 / s); g.translate(-cx, -cy);
}
function ldTile(cx, cy, size, bgc = C.tileInk, fg = C.deep, alpha = 1, neg = false) {
  g.save(); g.globalAlpha *= alpha; g.fillStyle = bgc; rr(cx - size / 2, cy - size / 2, size, size, size * 0.22); g.fill(); g.restore();
  if (neg) mark(cx, cy, size * 0.6 / 24, { neg: alpha, negCol: fg });
  else mark(cx, cy, size * 0.62 / 40, { pos: alpha, posCol: fg });
}
/* Negativ-Formen als Raster (für ASCII, Pixel, Muster) */
const NEG_TEST = document.createElement('canvas').getContext('2d');
function inNeg(u, v) { return NEG_TEST.isPointInPath(NEG_L, u, v) || NEG_TEST.isPointInPath(NEG_D, u, v); }
function inPos(u, v) { return NEG_TEST.isPointInPath(POS_L, u, v) || NEG_TEST.isPointInPath(POS_D, u, v, 'evenodd'); }

/* ---------- Bilder ---------- */
const IMG = {};
const SRC = {
  yayci: 'assets/old_yayci.webp', ld2006: 'assets/old_ld2006.webp', catt: 'assets/old_catt2005.webp', hanno: 'assets/old_hannoback.webp',
  cattshop: 'assets/old_cattshop.webp', fahrschule: 'assets/old_fahrschule.webp', oldSite: 'assets/alte-startseite.webp',
  mobHome: 'assets/mob_home.png', mobStory: 'assets/mob_story.png', mobBeyond: 'assets/mob_ldbeyond.png', deskAurum: 'assets/desk_aurum.png', deskViola: 'assets/desk_viola.png', deskLabs: 'assets/desk_labs.png',
  cfTitle: 'assets/g_core-fall-menu.jpg', cfMission: 'assets/g_cf-step4.jpg', cfPilot: 'assets/g_cf-step2.jpg', coTitle: 'assets/g_co-menu.jpg', coModes: 'assets/g_co-q1.jpg', coBoot: 'assets/g_co-step4.jpg',
};
const PLAY = ['00', '13', '14', '15', '16', '18', '19', '06'];
PLAY.forEach((n) => (SRC['cf' + n] = `assets/g_cf-play${n}.jpg`));
const SF = ['ui-01-title', 'ui-01b-modes', '01-pariser-platz', '07-tv-tower', 'ui-05-photo', '09-night', '12-spree', '05-reichstag', 'ui-02-intro', 'field-01-dome', 'combat-01-contact', 'muzzle-02-dusk', 'mech-04-titanfall', 'mech-05-cockpit', 'mechs-mine-2', 'collapse-03-falling', 'collapse-06-spikes-after', 'ops-08-warlord', 'city-02-warhead', 'backdoor-06-night', 'machines-01-street', 'ui-07-completion'];
SF.forEach((n) => (SRC['sf:' + n] = `assets/sf_${n}.jpg`));
const loadAll = () => Promise.all(Object.entries(SRC).map(([k, s]) => new Promise((res) => { const i = new Image(); i.onload = () => { IMG[k] = i; res(); }; i.onerror = () => res(); i.src = s; })));
const SEQ = new Map();
const seqLoad = (src) => new Promise((res) => { const i = new Image(); i.onload = () => res(i); i.onerror = () => res(null); i.src = src; });
async function need(list) { for (const s of list) if (!SEQ.has(s)) SEQ.set(s, await seqLoad(s)); while (SEQ.size > 48) SEQ.delete(SEQ.keys().next().value); }
const seq = (s) => SEQ.get(s) ?? null;
const walkSrc = (i) => `assets/walk/w${pad3(clamp(Math.floor(i), 0, 109) + 1)}.jpg`;
const HEROES = [['blackhole', 'Blackhole'], ['aurora', 'Aurora'], ['galaxy', 'Galaxie'], ['fireworks', 'Feuerwerk'], ['ocean', 'Ozeanwellen'], ['nova', 'Supernova'], ['plasma', 'Plasma'], ['kaleido', 'Kaleidoskop'], ['tunnel', 'Hypertunnel'], ['metal', 'Flüssigmetall'], ['prism', 'Prisma'], ['aurum', 'Zwei Horizonte: Aurum'], ['viola', 'Zwei Horizonte: Viola'], ['storm2', 'Blitzgewitter']];
const heroSrc = (m, i) => `assets/hero/${m}/f${pad3(clamp(Math.floor(i), 0, 23))}.jpg`;
const buildSrc = (i) => `assets/build/buildcode/f${pad3(clamp(Math.floor(i), 0, 43))}.jpg`;

/* ---------- Effekte ---------- */
const grainC = document.createElement('canvas'); grainC.width = grainC.height = 256;
{ const gx = grainC.getContext('2d'); const d = gx.createImageData(256, 256); for (let i = 0; i < d.data.length; i += 4) { const v = Math.floor(hash(i * 0.37 + 1) * 255); d.data[i] = d.data[i + 1] = d.data[i + 2] = v; d.data[i + 3] = 255; } gx.putImageData(d, 0, 0); }
const mkLayer = (w = W, h = H) => { const c = document.createElement('canvas'); c.width = w; c.height = h; return c.getContext('2d'); };
const BUF = mkLayer(); const bx = BUF;
function withCtx(ctx, fn) { const keep = g; g = ctx; g.save(); fn(); g.restore(); g = keep; }
const PAL = { amber: [['255,122,47', 0.22], ['255,178,36', 0.15], ['190,24,93', 0.08]], violet: [['124,58,237', 0.24], ['236,72,153', 0.12], ['56,189,248', 0.1]], cyan: [['20,184,166', 0.2], ['56,189,248', 0.14], ['255,122,47', 0.06]], red: [['220,38,38', 0.24], ['255,122,47', 0.14], ['120,20,40', 0.12]], green: [['34,197,94', 0.2], ['20,184,166', 0.12], ['255,178,36', 0.05]], gold: [['233,196,106', 0.2], ['255,122,47', 0.12], ['120,80,20', 0.1]] };
function bgGlow(t, hue = 'amber', warm = 1, base = C.bg) {
  g.fillStyle = base; g.fillRect(0, 0, W, H);
  (PAL[hue] ?? PAL.amber).forEach(([c, a], i) => {
    const x = W * (0.5 + 0.4 * Math.sin(t * 0.23 + i * 2.1)), y = H * (0.45 + 0.35 * Math.cos(t * 0.19 + i * 1.7)), r = 760 + 180 * Math.sin(t * 0.31 + i);
    const gr = g.createRadialGradient(x, y, 0, x, y, r); gr.addColorStop(0, `rgba(${c},${a * warm})`); gr.addColorStop(1, `rgba(${c},0)`); g.fillStyle = gr; g.fillRect(0, 0, W, H);
  });
}
function gridLines(t, a = 0.05, col = '#fff', step = 90, speed = 40) {
  g.save(); g.globalAlpha = a; g.strokeStyle = col; g.lineWidth = 1; const off = (t * speed) % step;
  for (let y = -step + off; y < H; y += step) { g.beginPath(); g.moveTo(0, y); g.lineTo(W, y); g.stroke(); }
  for (let x = 0; x < W; x += step) { g.beginPath(); g.moveTo(x, 0); g.lineTo(x, H); g.stroke(); }
  g.restore();
}
function dust(t, n = 80, col = '255,214,150') { for (let i = 0; i < n; i++) { const px = (hash(i) * W + t * (10 + hash(i + 9) * 30)) % W, py = (hash(i + 3) * H - t * (20 + hash(i + 5) * 50) + H * 20) % H; g.fillStyle = `rgba(${col},${0.06 + 0.25 * hash(i + 7)})`; g.fillRect(px, py, 2 + hash(i + 1) * 3, 2 + hash(i + 1) * 3); } }
let FIN = { vignette: 0.6, grain: 0.08 };
function finish(t) {
  if (FIN.vignette > 0) { const v = g.createRadialGradient(W / 2, H / 2, H * 0.25, W / 2, H / 2, H * 0.78); v.addColorStop(0, 'rgba(0,0,0,0)'); v.addColorStop(1, `rgba(0,0,0,${FIN.vignette})`); g.fillStyle = v; g.fillRect(0, 0, W, H); }
  if (FIN.grain > 0) { g.save(); g.globalAlpha = FIN.grain; g.globalCompositeOperation = 'overlay'; const f = Math.floor(t * 30), ox = Math.floor(hash(f) * 256), oy = Math.floor(hash(f + 4) * 256); for (let y = -oy; y < H; y += 256) for (let x = -ox; x < W; x += 256) g.drawImage(grainC, x, y); g.restore(); }
}
function glitch(amount, seed) {
  if (amount <= 0 || inTrans) return;
  bx.clearRect(0, 0, W, H); bx.drawImage(g.canvas, 0, 0);
  for (let i = 0; i < 16; i++) { const y = Math.floor(hash(seed + i) * H), h = 8 + Math.floor(hash(seed + i + 50) * 140 * amount), dx = (hash(seed + i + 99) - 0.5) * 260 * amount; g.drawImage(BUF.canvas, 0, y, W, h, dx, y, W, h); }
  g.save(); g.globalCompositeOperation = 'lighter'; g.globalAlpha = 0.35 * amount; g.drawImage(BUF.canvas, 14 * amount, 0); g.drawImage(BUF.canvas, -14 * amount, 0); g.restore();
  g.fillStyle = `rgba(255,122,47,${0.18 * amount})`; g.fillRect(0, Math.floor(hash(seed + 7) * H), W, 6 + 24 * amount);
}
function flash(a, col = '255,240,220') { if (a > 0 && !inTrans) { g.fillStyle = `rgba(${col},${Math.min(1, a)})`; g.fillRect(0, 0, W, H); } }
function shakeT(amp, t) { if (amp <= 0) return; g.translate((hash(Math.floor(t * 60)) - 0.5) * amp, (hash(Math.floor(t * 60) + 9) - 0.5) * amp); }
function shockwave(x, y, age, col = '255,190,90', max = 1300) { if (age < 0 || age > 0.9) return; const k = eOut(age / 0.9), r = 40 + max * k; g.save(); g.strokeStyle = `rgba(${col},${(1 - k) * 0.9})`; g.lineWidth = 30 * (1 - k) + 2; g.beginPath(); g.arc(x, y, r, 0, 7); g.stroke(); g.restore(); }
function burst(x, y, age, seed, n = 60, col = '255,200,120') { if (age < 0 || age > 1.4) return; for (let i = 0; i < n; i++) { const a = hash(seed + i) * 6.283, v = 400 + hash(seed + i + 3) * 1300, d = v * age * (1 - age * 0.35), px = x + Math.cos(a) * d, py = y + Math.sin(a) * d + 260 * age * age, s = (1 - age / 1.4) * (3 + hash(seed + i + 5) * 6); g.fillStyle = `rgba(${col},${1 - age / 1.4})`; g.fillRect(px, py, s, s); } }
function speedLines(t, a, cx = W / 2, cy = H / 2, col = 'rgba(255,230,190,0.5)') { if (a <= 0) return; g.save(); g.globalAlpha = a; g.strokeStyle = col; for (let i = 0; i < 60; i++) { const ang = hash(i) * 6.283, r0 = 300 + ((t * 2400 + hash(i + 1) * 1600) % 1600), len = 80 + hash(i + 2) * 260; g.lineWidth = 1 + hash(i + 3) * 3; g.beginPath(); g.moveTo(cx + Math.cos(ang) * r0, cy + Math.sin(ang) * r0); g.lineTo(cx + Math.cos(ang) * (r0 + len), cy + Math.sin(ang) * (r0 + len)); g.stroke(); } g.restore(); }
function brackets(x, y, w, h, col = C.amber, a = 1, s = 40) { g.save(); g.globalAlpha = a; g.strokeStyle = col; g.lineWidth = 4; [[x, y, 1, 1], [x + w, y, -1, 1], [x, y + h, 1, -1], [x + w, y + h, -1, -1]].forEach(([px, py, dx, dy]) => { g.beginPath(); g.moveTo(px, py + dy * s); g.lineTo(px, py); g.lineTo(px + dx * s, py); g.stroke(); }); g.restore(); }
function scanlines(a = 0.12, step = 6) { g.save(); g.globalAlpha = a; g.fillStyle = '#000'; for (let y = 0; y < H; y += step) g.fillRect(0, y, W, step / 3); g.restore(); }
function monitor(img, cx, cy, w, t, o = {}) {
  const h = w * (o.aspect ?? 9 / 16);
  g.save(); g.translate(cx, cy); if (o.rot) g.rotate(o.rot); g.scale(o.scale ?? 1, o.scale ?? 1);
  g.shadowColor = o.glowCol ?? 'rgba(255,122,47,0.45)'; g.shadowBlur = o.shadow ?? 70; g.fillStyle = o.frame ?? '#000'; rr(-w / 2 - 10, -h / 2 - 10, w + 20, h + 20, o.r ?? 22); g.fill(); g.shadowBlur = 0;
  imgCover(img, -w / 2, -h / 2, w, h, (o.r ?? 22) - 8, false, o.zoom ?? 1, o.px ?? 0.5, o.py ?? 0.5);
  if (o.rgb) { g.save(); g.globalCompositeOperation = 'lighter'; g.globalAlpha = 0.25 * o.rgb; imgCover(img, -w / 2 + 10 * o.rgb, -h / 2, w, h, 14, false, o.zoom ?? 1, o.px ?? 0.5, o.py ?? 0.5); g.restore(); }
  g.strokeStyle = o.edge ?? 'rgba(255,255,255,0.18)'; g.lineWidth = 2; rr(-w / 2, -h / 2, w, h, (o.r ?? 22) - 8); g.stroke();
  g.restore();
}
function phone(img, cx, cy, w, scroll, alpha = 1, rot = 0) {
  const h = w * 2.06;
  g.save(); g.globalAlpha = alpha; g.translate(cx, cy); g.rotate(rot);
  g.shadowColor = 'rgba(0,0,0,0.6)'; g.shadowBlur = 60; g.fillStyle = '#0B0D12'; rr(-w / 2 - 16, -h / 2 - 16, w + 32, h + 32, 70); g.fill(); g.shadowBlur = 0;
  g.strokeStyle = 'rgba(255,255,255,0.18)'; g.lineWidth = 3; g.stroke();
  if (img) { g.save(); rr(-w / 2, -h / 2, w, h, 56); g.clip(); const s = w / img.width, ih = img.height * s; g.drawImage(img, -w / 2, -h / 2 - scroll * Math.max(0, ih - h), w, ih); g.restore(); }
  g.fillStyle = '#000'; rr(-70, -h / 2 + 14, 140, 38, 19); g.fill(); g.restore();
}
const FLAPG = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789-';
function flapChar(ch, x, y, w, h, p, seed, tick, o = {}) {
  g.fillStyle = o.tile ?? '#14171E'; rr(x, y, w, h, 6); g.fill();
  g.fillStyle = 'rgba(255,255,255,0.04)'; g.fillRect(x, y, w, h / 2);
  let c = ch; if (p < 1 && ch !== ' ') c = p <= 0 ? ' ' : FLAPG[Math.floor(hash(seed + tick) * FLAPG.length)];
  const flip = p < 1 && p > 0 ? Math.abs(Math.cos(tick * 1.7)) : 1;
  g.save(); g.translate(x + w / 2, y + h / 2); g.scale(1, Math.max(0.15, flip)); text(c, 0, h * 0.32, { size: h * 0.78, weight: 700, fam: JM, align: 'center', color: p >= 1 ? (o.col ?? C.ink) : C.soft }); g.restore();
  g.fillStyle = '#05060A'; g.fillRect(x, y + h / 2 - 1.5, w, 3);
}
function flapRow(str, x, y, tw, th, gap, p0, lt, seed, tick, o = {}) {
  str.split('').forEach((ch, j) => flapChar(ch, x + j * (tw + gap), y, tw, th, clamp((lt - p0 - j * 0.035) / 0.45), seed + j * 7, tick, o));
}
/* Zahl mit Punkten (de-DE) */
const fmtDE = (v, digits = 9) => String(Math.floor(v)).padStart(digits, '0').replace(/\B(?=(\d{3})+(?!\d))/g, '.');

/* ---------- Übergänge ---------- */
const LA = mkLayer(), LB = mkLayer();
function drawInto(ctx, fn, t) { const keep = g; g = ctx; g.save(); fn(t); g.restore(); g = keep; }
function smear(src, dx, dy, bx2, by2, n = 12) { for (let k = 0; k < n; k++) { const u = n > 1 ? k / (n - 1) - 0.5 : 0; g.globalAlpha = 1 / (k + 1); g.drawImage(src, dx + u * bx2, dy + u * by2); } g.globalAlpha = 1; }
const PIX = mkLayer(W / 8, H / 8);
function transition(kind, p, t) {
  const A = LA.canvas, Bc = LB.canvas, e = eIO(p), sp = Math.sin(Math.PI * p);
  g.fillStyle = '#000'; g.fillRect(0, 0, W, H);
  if (kind === 'whip' || kind === 'whipV') {
    const hor = kind === 'whip', blur = 420 * sp, d = hor ? W : H, o1 = -d * e, o2 = d * (1 - e);
    smear(A, hor ? o1 : 0, hor ? 0 : o1, hor ? blur : 0, hor ? 0 : blur); smear(Bc, hor ? o2 : 0, hor ? 0 : o2, hor ? blur : 0, hor ? 0 : blur);
  } else if (kind === 'zoom') {
    const zin = lerp(0.55, 1, eOut5(seg(p, 0.25, 1))), zout = 1 + 2.4 * eIn(p);
    g.save(); g.filter = `blur(${Math.round(16 * (1 - seg(p, 0.3, 1)))}px)`; g.globalAlpha = seg(p, 0.25, 0.65); g.translate(W / 2, H / 2); g.scale(zin, zin); g.drawImage(Bc, -W / 2, -H / 2); g.restore();
    g.save(); g.filter = `blur(${Math.round(22 * seg(p, 0, 0.6))}px)`; g.globalAlpha = 1 - seg(p, 0.35, 0.7); g.translate(W / 2, H / 2); g.scale(zout, zout); g.drawImage(A, -W / 2, -H / 2); g.restore();
  } else if (kind === 'iris') {
    g.drawImage(A, 0, 0); const r = eIO(p) * Math.hypot(W, H) * 0.56;
    g.save(); g.beginPath(); g.arc(W / 2, H / 2, r, 0, 7); g.clip(); g.drawImage(Bc, 0, 0); g.restore();
    g.save(); g.strokeStyle = TCOL; g.lineWidth = 10 * sp + 2; g.shadowColor = TCOL; g.shadowBlur = 40; g.globalAlpha = sp; g.beginPath(); g.arc(W / 2, H / 2, r, 0, 7); g.stroke(); g.restore();
  } else if (kind === 'logo') {
    g.drawImage(A, 0, 0); g.fillStyle = `rgba(0,0,0,${0.5 * seg(p, 0, 0.3)})`; g.fillRect(0, 0, W, H);
    const s = 7 * Math.pow(36, eIn(p));
    g.save(); clipNeg(W / 2, H / 2, s, 28, 23); g.drawImage(Bc, 0, 0); g.restore();
    g.save(); g.translate(W / 2, H / 2); g.scale(s, s); g.translate(-28, -23); g.lineWidth = 8 / s; g.strokeStyle = TCOL; g.shadowColor = TCOL; g.shadowBlur = 40; g.globalAlpha = 1 - seg(p, 0.75, 1); g.stroke(NEG_L); g.stroke(NEG_D); g.restore();
  } else if (kind === 'flip') { // Seite umblättern
    if (p < 0.5) { const k = Math.cos(p * Math.PI); g.save(); g.translate(W / 2, 0); g.scale(Math.max(0.001, k), 1); g.drawImage(A, -W / 2, 0); g.restore(); g.fillStyle = `rgba(0,0,0,${0.5 * (1 - k)})`; g.fillRect(0, 0, W, H); }
    else { const k = -Math.cos(p * Math.PI); g.save(); g.translate(W / 2, 0); g.scale(Math.max(0.001, k), 1); g.drawImage(Bc, -W / 2, 0); g.restore(); }
  } else if (kind === 'push') { // nach oben schieben
    g.drawImage(A, 0, -H * e); g.drawImage(Bc, 0, H * (1 - e));
  } else if (kind === 'pixel') {
    const src = p < 0.5 ? A : Bc, q = Math.max(2, Math.round(2 + 60 * sp)); PIX.canvas.width = Math.ceil(W / q); PIX.canvas.height = Math.ceil(H / q);
    PIX.imageSmoothingEnabled = true; PIX.drawImage(src, 0, 0, PIX.canvas.width, PIX.canvas.height); g.save(); g.imageSmoothingEnabled = false; g.drawImage(PIX.canvas, 0, 0, W, H); g.restore();
  } else if (kind === 'slice') { // horizontale Streifen
    const n = 12; for (let i = 0; i < n; i++) { const h = H / n, d = clamp(e * 1.6 - (i / n) * 0.6), dir = i % 2 ? 1 : -1; g.drawImage(A, 0, i * h, W, h, dir * W * d, i * h, W, h); g.drawImage(Bc, 0, i * h, W, h, -dir * W * (1 - d), i * h, W, h); }
  } else { g.drawImage(p < 0.5 ? A : Bc, 0, 0); }
  if (kind !== 'flip' && kind !== 'push') flash(Math.max(0, 0.22 - Math.abs(p - 0.5) * 0.8), '255,236,210');
}
let TCOL = C.deep;

/* ---------- Musik ---------- */
const midi = (n) => 440 * Math.pow(2, (n - 69) / 12);
function makeMusic(P) {
  return async function music() {
    const SR = 48000, len = Math.ceil(DUR * SR);
    const ac = new OfflineAudioContext(2, len, SR);
    const master = ac.createGain(); master.gain.value = P.master ?? 0.45;
    const comp = ac.createDynamicsCompressor(); comp.threshold.value = -18; comp.ratio.value = 8; comp.attack.value = 0.003; comp.release.value = 0.15;
    master.connect(comp); comp.connect(ac.destination);
    const ir = ac.createBuffer(2, SR * (P.verbLen ?? 2.2), SR);
    for (let c = 0; c < 2; c++) { const d = ir.getChannelData(c); for (let i = 0; i < d.length; i++) d[i] = (hash(i * 1.3 + c * 7) * 2 - 1) * Math.pow(1 - i / d.length, 3); }
    const verb = ac.createConvolver(); verb.buffer = ir; const verbG = ac.createGain(); verbG.gain.value = P.verb ?? 0.25; verb.connect(verbG); verbG.connect(master);
    const nb = ac.createBuffer(1, SR * 2, SR); { const d = nb.getChannelData(0); for (let i = 0; i < d.length; i++) d[i] = hash(i * 0.731) * 2 - 1; }
    const A = {};
    A.noise = (t, dur, f0, f1, gain, type = 'highpass', q = 0.7, wet = false) => { if (t < 0) return; const s = ac.createBufferSource(); s.buffer = nb; const f = ac.createBiquadFilter(); f.type = type; f.Q.value = q; f.frequency.setValueAtTime(f0, t); f.frequency.exponentialRampToValueAtTime(f1, t + dur); const gg = ac.createGain(); gg.gain.setValueAtTime(gain, t); gg.gain.exponentialRampToValueAtTime(0.0001, t + dur); s.connect(f); f.connect(gg); gg.connect(master); if (wet) gg.connect(verb); s.start(t); s.stop(t + dur + 0.05); };
    A.riser = (t, dur, gain) => { const s = ac.createBufferSource(); s.buffer = nb; s.loop = true; const f = ac.createBiquadFilter(); f.type = 'bandpass'; f.Q.value = 2.5; f.frequency.setValueAtTime(250, t); f.frequency.exponentialRampToValueAtTime(7000, t + dur); const gg = ac.createGain(); gg.gain.setValueAtTime(0.0001, t); gg.gain.exponentialRampToValueAtTime(gain, t + dur); s.connect(f); f.connect(gg); gg.connect(master); gg.connect(verb); s.start(t); s.stop(t + dur); };
    A.tone = (t, dur, freq, type, gain, cutoff, wet = false, detune = 0, att = 0.01) => { if (t < 0) return; const o = ac.createOscillator(); o.type = type; o.frequency.value = freq; o.detune.value = detune; const f = ac.createBiquadFilter(); f.type = 'lowpass'; f.frequency.value = cutoff; const gg = ac.createGain(); gg.gain.setValueAtTime(0.0001, t); gg.gain.exponentialRampToValueAtTime(gain, t + att); gg.gain.exponentialRampToValueAtTime(0.0001, t + dur); o.connect(f); f.connect(gg); gg.connect(master); if (wet) gg.connect(verb); o.start(t); o.stop(t + dur + 0.05); };
    A.kick = (t, g0 = 1, f0 = 150, f1 = 40, dec = 0.38) => { const o = ac.createOscillator(); o.frequency.setValueAtTime(f0, t); o.frequency.exponentialRampToValueAtTime(f1, t + 0.16); const gg = ac.createGain(); gg.gain.setValueAtTime(g0, t); gg.gain.exponentialRampToValueAtTime(0.001, t + dec); o.connect(gg); gg.connect(master); o.start(t); o.stop(t + dec + 0.02); A.noise(t, 0.02, 4000, 3000, 0.25 * g0, 'highpass'); };
    A.k808 = (t, note, dur = 0.9, g0 = 0.9) => { const o = ac.createOscillator(); o.type = 'sine'; o.frequency.setValueAtTime(midi(note) * 2.2, t); o.frequency.exponentialRampToValueAtTime(midi(note), t + 0.08); const gg = ac.createGain(); gg.gain.setValueAtTime(g0, t); gg.gain.exponentialRampToValueAtTime(0.001, t + dur); o.connect(gg); gg.connect(master); o.start(t); o.stop(t + dur + 0.02); };
    A.boom = (t) => { A.kick(t, 1.4); A.noise(t, 2.2, 1200, 60, 0.55, 'lowpass', 0.7, true); };
    A.chime = (t, n = [76, 72], gain = 0.06) => n.forEach((m, i) => A.tone(t + i * 0.35, 1.4, midi(m), 'sine', gain, 6000, true));
    A.whoosh = (t) => A.noise(t - 0.34, 0.5, 300, 6000, 0.3, 'bandpass', 1.4, true);
    A.clap = (t, g0 = 0.3) => A.noise(t, 0.2, 1700, 500, g0, 'bandpass', 0.9, true);
    A.hat = (t, g0 = 0.08, d = 0.03) => A.noise(t, d, 8000, 10000, g0);
    A.snare = (t, g0 = 0.35) => { A.noise(t, 0.18, 3000, 900, g0, 'bandpass', 0.8, true); A.tone(t, 0.12, 190, 'triangle', g0 * 0.5, 2000); };
    A.tom = (t, n = 45, g0 = 0.5) => { const o = ac.createOscillator(); o.frequency.setValueAtTime(midi(n) * 1.6, t); o.frequency.exponentialRampToValueAtTime(midi(n), t + 0.2); const gg = ac.createGain(); gg.gain.setValueAtTime(g0, t); gg.gain.exponentialRampToValueAtTime(0.001, t + 0.7); o.connect(gg); gg.connect(master); gg.connect(verb); o.start(t); o.stop(t + 0.75); };
    const prog = P.prog, roots = P.roots, sec = P.sec;
    const sw = (k) => (k % 2 ? (P.swing ?? 0) * B : 0);
    for (let b = 0; b < NB; b++) {
      const t0 = bar(b), ch = prog[b % prog.length], s = sec(b);
      if (s === 'end') continue;
      // Fläche
      const padG = s === 'break' ? (P.padBreak ?? 0.05) : s === 'intro' || s === 'outro' || s === 'half' ? (P.padSoft ?? 0.03) : (P.pad ?? 0.022);
      if (P.padWave !== 'none') ch.forEach((n) => (P.padDetune ?? [-12, 0, 12]).forEach((d) => A.tone(t0, BAR + 0.5, midi(n), P.padWave ?? 'sawtooth', padG, s === 'drop' ? (P.cutDrop ?? 2800) : (P.cut ?? 1600), true, d, 0.08)));
      const drums = s === 'main' || s === 'drop' ? P.drums : s === 'half' ? 'half' : s === 'outro' ? (P.outroDrums ?? 'none') : s === 'intro' ? (P.introDrums ?? 'none') : 'none';
      const root = roots[b % roots.length];
      for (let k = 0; k < 4; k++) {
        const tb = t0 + k * B;
        if (drums === 'house') { A.kick(tb); A.hat(tb + B / 2 + sw(1), 0.2, 0.08); A.hat(tb + B / 4, 0.06); A.hat(tb + B * 3 / 4, 0.06); if (k % 2) A.clap(tb); }
        if (drums === 'breaks') { if (k === 0) A.kick(tb); if (k === 2) A.kick(tb + B / 2, 0.75); if (k === 1 || k === 3) A.snare(tb); A.hat(tb, 0.07); A.hat(tb + B / 2 + sw(1), 0.07); }
        if (drums === 'trap') { if (k === 0) A.k808(tb, root - 12, 1.2); if (k === 2) A.clap(tb, 0.38); if (k === 3 && b % 2) A.k808(tb + B / 2, root - 12, 0.6, 0.7); for (let h = 0; h < (k === 3 && b % 2 === 1 ? 8 : 4); h++) A.hat(tb + h * B / (k === 3 && b % 2 === 1 ? 8 : 4), 0.07, 0.02); }
        if (drums === 'chip') { if (k % 2 === 0) A.kick(tb, 0.8, 220, 60, 0.18); else A.noise(tb, 0.12, 6000, 2000, 0.22, 'highpass'); A.noise(tb + B / 2, 0.03, 9000, 9500, 0.06); }
        if (drums === 'half') { if (k === 0) A.kick(tb); if (k === 2) A.clap(tb); A.hat(tb, 0.05); A.hat(tb + B / 2, 0.05); }
        if (drums === 'boom') { if (k === 0) { A.kick(tb, 1.2, 90, 30, 0.9); A.tom(tb, 33, 0.6); } if (k === 2) A.tom(tb, 38, 0.4); if (k === 3) { A.tom(tb + B / 2, 40, 0.3); } }
        if (drums === 'four') { A.kick(tb, 0.9); A.hat(tb + B / 2, 0.08); }
        // Bass
        if (drums !== 'none') {
          if (P.bass === 'saw8') for (let e = 0; e < 2; e++) A.tone(tb + e * B / 2 + 0.02, B / 2 - 0.03, midi(root - 12 + (e ? 12 : 0)), 'sawtooth', e ? 0.2 : 0.14, s === 'drop' ? 900 : 450);
          if (P.bass === 'sub' && k % 2 === 0) A.tone(tb, B * 2 - 0.05, midi(root - 12), 'sine', 0.3, 300);
          if (P.bass === 'square16') for (let e = 0; e < 4; e++) A.tone(tb + e * B / 4, B / 4 - 0.01, midi(root - 12 + (e % 2 ? 12 : 0)), 'square', 0.08, 1800);
          if (P.bass === 'pluck') A.tone(tb + sw(k), B * 0.8, midi(root - 12 + (k === 3 ? 7 : 0)), 'triangle', 0.22, 900);
          if (P.bass === 'synth') A.tone(tb + B / 2, B / 2, midi(root - 12), 'sawtooth', 0.18, 700);
        }
      }
      // Arpeggio / Lead
      if ((s === 'main' || s === 'drop' || (s === 'half' && P.arpHalf)) && P.arp !== 'none') {
        const steps = s === 'drop' ? (P.arpDrop ?? 16) : (P.arpSteps ?? 8), pat = P.arpPat ?? [0, 1, 2, 1];
        for (let st = 0; st < steps; st++) { const n = ch[pat[st % pat.length] % ch.length] + 12 + (P.arpOct ?? 0) + (Math.floor(st / pat.length) % 2) * (P.arpJump ?? 12); A.tone(t0 + st * BAR / steps + sw(st), BAR / steps * (P.arpLen ?? 1), midi(n), P.arp ?? 'square', s === 'drop' ? (P.arpGainDrop ?? 0.035) : (P.arpGain ?? 0.028), P.arpCut ?? 3200, true); }
      }
      if (s === 'intro' && P.introPulse !== false) for (let k = 0; k < 4; k++) A.tone(t0 + k * B, 0.1, midi(root + 12), 'triangle', 0.06, 1200, true);
      if (P.lead && (s === 'drop' || s === 'main') && P.lead.bars.includes(b)) P.lead.notes.forEach(([o, n, d]) => A.tone(t0 + o * B, d * B, midi(n), P.lead.wave ?? 'square', P.lead.gain ?? 0.05, P.lead.cut ?? 4000, true));
    }
    (P.booms ?? []).forEach((b) => A.boom(bar(b)));
    (P.risers ?? []).forEach((b) => A.riser(bar(b) - BAR, BAR, 0.3));
    (P.whoosh ?? []).forEach((b) => A.whoosh(bar(b)));
    if (P.sfx) P.sfx(A);
    if (P.endChord !== false) { const ec = P.endChord ?? prog[0]; ec.forEach((n) => A.tone(bar(NB - 2), DUR - bar(NB - 2), midi(n), P.endWave ?? 'triangle', 0.06, 2200, true, 0, 0.3)); }
    const buf = await ac.startRendering();
    const L = buf.getChannelData(0), R = buf.getChannelData(1), n = L.length;
    const wv = new DataView(new ArrayBuffer(44 + n * 4));
    const ws = (o, s) => { for (let i = 0; i < s.length; i++) wv.setUint8(o + i, s.charCodeAt(i)); };
    ws(0, 'RIFF'); wv.setUint32(4, 36 + n * 4, true); ws(8, 'WAVE'); ws(12, 'fmt '); wv.setUint32(16, 16, true); wv.setUint16(20, 1, true); wv.setUint16(22, 2, true); wv.setUint32(24, SR, true); wv.setUint32(28, SR * 4, true); wv.setUint16(32, 4, true); wv.setUint16(34, 16, true); ws(36, 'data'); wv.setUint32(40, n * 4, true);
    for (let i = 0; i < n; i++) { wv.setInt16(44 + i * 4, clamp(L[i], -1, 1) * 32767, true); wv.setInt16(46 + i * 4, clamp(R[i], -1, 1) * 32767, true); }
    const bytes = new Uint8Array(wv.buffer); let bin = '';
    for (let i = 0; i < bytes.length; i += 0x8000) bin += String.fromCharCode.apply(null, bytes.subarray(i, i + 0x8000));
    return btoa(bin);
  };
}

/* ---------- Ablauf ---------- */
function setup(o) { BPM = o.bpm; B = 60 / BPM; BAR = 4 * B; NB = o.bars; DUR = NB * BAR + (o.tail ?? 2.4); }
function start(V) {
  const SC = V.scenes, TR = V.trans ?? {}, TD = V.td ?? 0.3;
  if (V.finish) FIN = { ...FIN, ...V.finish };
  if (V.tcol) TCOL = V.tcol;
  const sceneAt = (t) => { let fn = SC[0][1]; for (const [b, f] of SC) if (t >= bar(b)) fn = f; return fn; };
  function render(t) {
    let tr = null;
    for (const [b, kind] of Object.entries(TR)) { const at = bar(+b); if (t >= at - TD && t < at + TD) tr = [at, kind]; }
    g.save();
    if (V.beatZoom && t > bar(V.beatZoom[0]) && t < bar(V.beatZoom[1])) { const z = 1 + 0.012 * pulse(t, 9); g.translate(W / 2, H / 2); g.scale(z, z); g.translate(-W / 2, -H / 2); }
    if (tr) { const [at, kind] = tr; inTrans = true; drawInto(LA, sceneAt(at - 0.001), t); drawInto(LB, sceneAt(at), Math.max(t, at)); inTrans = false; transition(kind, (t - (at - TD)) / (2 * TD), t); }
    else sceneAt(t)(t);
    g.restore();
    finish(t);
    const end = seg(t, DUR - (V.fadeOut ?? 1.2), DUR); if (end > 0) { g.fillStyle = `rgba(0,0,0,${eIn(end)})`; g.fillRect(0, 0, W, H); }
  }
  window.REEL = {
    DUR, BAR, id: V.id, title: V.title,
    ready: (async () => {
      await loadAll();
      await Promise.all([500, 700].map((w) => document.fonts.load(`${w} 100px ${SG}`)).concat([400, 500, 600, 700].map((w) => document.fonts.load(`${w} 100px ${IS}`)), [400, 500, 600, 700].map((w) => document.fonts.load(`${w} 100px ${JM}`))));
      return Object.keys(IMG).length + '/' + Object.keys(SRC).length;
    })(),
    frame: async (t) => { if (V.seqAt) await need(V.seqAt(t, TD)); render(t); return cv.toDataURL('image/jpeg', 0.92).slice(23); },
    music: makeMusic(V.music),
  };
}
