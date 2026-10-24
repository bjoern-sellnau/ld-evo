/* V12 „POP-ART“ — Comic: Rasterpunkte, dicke Konturen, Panels, Sprechblasen, Explosionen. Stationen als Comic-Seiten. */
setup({ bpm: 128, bars: 22 });
const CY = '#00AEEF', MG = '#EC008C', YE = '#FFF200', BK = '#111111', WH = '#FFFDF4';
function dots(x, y, w, h, col, r0 = 5, step = 18, ang = 0.3) {
  g.save(); g.beginPath(); g.rect(x, y, w, h); g.clip(); g.fillStyle = col;
  for (let yy = y - step; yy < y + h + step; yy += step) for (let xx = x - step + ((yy / step) % 2) * step / 2; xx < x + w + step; xx += step) { const r = r0 * (0.4 + 0.6 * ((xx - x) / w)); g.beginPath(); g.arc(xx, yy, r, 0, 7); g.fill(); }
  g.restore();
}
function panel(x, y, w, h, bg, p = 1) { const k = eBack(clamp(p)); if (k <= 0) return false; g.save(); g.translate(x + w / 2, y + h / 2); g.scale(k, k); g.translate(-(x + w / 2), -(y + h / 2)); g.fillStyle = bg; g.fillRect(x, y, w, h); return true; }
function endPanel(x, y, w, h) { g.lineWidth = 10; g.strokeStyle = BK; g.strokeRect(x, y, w, h); g.restore(); }
function caption(str, x, y, w, size = 34) { const h = size * 1.6; g.fillStyle = YE; g.fillRect(x, y, w, h); g.lineWidth = 5; g.strokeStyle = BK; g.strokeRect(x, y, w, h); text(str, x + 16, y + h * 0.68, { size: fit(str, w - 32, size, 700, SG), weight: 700, color: BK }); }
function boom(word, cx, cy, r, col, p, rot = -0.15) {
  const k = eBack(clamp(p)); if (k <= 0) return; g.save(); g.translate(cx, cy); g.rotate(rot); g.scale(k, k);
  g.beginPath(); for (let i = 0; i < 24; i++) { const a = (i / 24) * Math.PI * 2, rr2 = i % 2 ? r * 0.62 : r; g.lineTo(Math.cos(a) * rr2 * 1.25, Math.sin(a) * rr2); } g.closePath(); g.fillStyle = col; g.fill(); g.lineWidth = 9; g.strokeStyle = BK; g.stroke();
  text(word, 0, r * 0.18, { size: fit(word, r * 1.9, r * 0.62, 700, SG, -2), weight: 700, align: 'center', color: BK, stroke: WH, lw: 8 }); text(word, 0, r * 0.18, { size: fit(word, r * 1.9, r * 0.62, 700, SG, -2), weight: 700, align: 'center', color: col === YE ? MG : YE }); g.restore();
}
function bubble(str, x, y, w, size, tail = [0, 80]) {
  const words = str.split(' '), lines = []; let line = '';
  for (const wd of words) { const tt = line ? line + ' ' + wd : wd; if (measure(tt, size, 700, SG) > w * 0.78 && line) { lines.push(line); line = wd; } else line = tt; }
  lines.push(line);
  const h = lines.length * size * 1.2 + size * 1.4, cy = y + 120 - h / 2;
  g.fillStyle = WH; g.strokeStyle = BK; g.lineWidth = 6; g.beginPath(); g.ellipse(x + w / 2, cy + h / 2, w / 2, h / 2, 0, 0, 7); g.fill(); g.stroke();
  g.beginPath(); g.moveTo(x + w / 2 - 20, cy + h - 6); g.lineTo(x + w / 2 + tail[0], cy + h + tail[1]); g.lineTo(x + w / 2 + 30, cy + h - 10); g.fill(); g.stroke();
  lines.forEach((l, i) => text(l, x + w / 2, cy + size * 1.15 + i * size * 1.2 + (h - lines.length * size * 1.2 - size * 1.4) / 2 + size * 0.2, { size, weight: 700, align: 'center', color: BK }));
}
function comicImg(key, x, y, w, h) { g.save(); g.filter = 'contrast(1.5) saturate(1.7)'; imgCover(IMG[key], x, y, w, h); g.filter = 'none'; g.globalCompositeOperation = 'multiply'; dots(x, y, w, h, 'rgba(236,0,140,0.35)', 4, 14); g.restore(); }
function page(t) { g.fillStyle = WH; g.fillRect(0, 0, W, H); dots(0, 0, W, H, 'rgba(0,174,239,0.12)', 4, 22); }
function sCover(t) {
  page(t);
  if (panel(40, 40, W - 80, H - 80, MG, seg(t, 0, 0.5))) { dots(40, 40, W - 80, H - 80, 'rgba(255,242,0,0.35)', 9, 30); endPanel(40, 40, W - 80, H - 80); }
  text('DIE ABENTEUER VON', W / 2, 220, { size: 54, weight: 700, align: 'center', color: YE, stroke: BK, lw: 10, alpha: seg(t, 0.4, 0.7) });
  text('BJÖRN', W / 2, 470, { size: 240, weight: 700, align: 'center', color: YE, stroke: BK, lw: 18, ls: -6, alpha: seg(t, 0.6, 0.9) });
  text('SELLNAU', W / 2, 700, { size: fit('SELLNAU', W - 140, 240, 700, SG, -6), weight: 700, align: 'center', color: CY, stroke: BK, lw: 18, ls: -6, alpha: seg(t, 0.8, 1.1) });
  boom('SEIT 2007!', 760, 1000, 200, YE, seg(t, 1.6, 2.0), 0.12);
  g.save(); g.fillStyle = WH; g.strokeStyle = BK; g.lineWidth = 10; g.beginPath(); g.arc(300, 1150, 190, 0, 7); g.fill(); g.stroke(); g.restore();
  mark(300, 1150, 9 * eBack(seg(t, 1.2, 1.7)), { neg: 1, negCol: MG });
  caption('#1 · DAS WEB. MEINE LEIDENSCHAFT.', 80, 1560, W - 160, 44);
  text('LOONA COMICS · 10/2026', W - 80, 1820, { size: 30, weight: 700, fam: JM, align: 'right', color: WH });
}
const PAGES = [
  { b: 4, panels: [['2002', 'Ausbildung zum Technischen Assistenten!', null, CY], ['2003', 'Ein eigenes Flash-5-Spiel!', null, YE], ['2004–2006', 'Onlineshops & Homepages!', 'yayci', MG], ['09/2007', 'PIXELTEX! Gadmin 4 CMS!', null, CY]], boom: ['ZACK!', YE] },
  { b: 8, panels: [['01/2016 – 04/2017', 'MySwitzerland.com Mobile', null, YE], ['09/2016', 'OpenBooking: Frontend Lead!', null, CY], ['2018 – 2019', 'Azubi-Recruiting!', null, MG], ['03/2019 – 02/2020', 'Ausbilder (AEVO)!', null, YE]], boom: ['GOLD!', YE], sub: 'Best of Swiss Web 2017 · Mobile' },
  { b: 12, panels: [['05/2020 – 01/2026', 'Code-b: Software Engineer!', null, CY], ['01/2022 – 05/2023', 'BMW Neuwagensuche', null, MG], ['04/2024 – 12/2025', 'Tabletop Herald App!', null, YE], ['05/2026', 'Materna SE: Senior Developer!', null, CY]], boom: ['TECH LEAD!', MG], sub: 'ab 09/2022' },
  { b: 16, panels: [['2026', 'Corefall!', 'cfTitle', MG], ['2026', 'Covert Operations!', 'coTitle', CY], ['2026', 'SPREE|FALL!', 'sf:mech-04-titanfall', YE], ['2026', 'Die neue loona-designs.de!', 'deskLabs', MG]], boom: ['PEW PEW!', CY] },
];
function sPage(pi) {
  return (t) => {
    const P = PAGES[pi], lt = t - bar(P.b);
    page(t);
    const pw = (W - 120) / 2, ph = 720;
    P.panels.forEach(([d, txt, img, col], i) => {
      const x = 40 + (i % 2) * (pw + 40), y = 160 + Math.floor(i / 2) * (ph + 60), p = seg(lt, 0.15 + i * B * 1.6, 0.45 + i * B * 1.6);
      if (!panel(x, y, pw, ph, col, p)) return;
      if (img) comicImg(img, x, y + 120, pw, ph - 120); else dots(x, y, pw, ph, 'rgba(17,17,17,0.18)', 6, 26);
      caption(d, x + 10, y + 10, pw - 20, 34);
      if (!img) { mark(x + pw / 2, y + ph * 0.48, 6, { neg: 1, negCol: BK, rot: i * 0.2 }); }
      bubble(txt, x + 20, y + ph - 260, pw - 40, 36, [i % 2 ? -60 : 40, 40]);
      endPanel(x, y, pw, ph);
    });
    if (P.boom) boom(P.boom[0], W / 2, 920, 220, P.boom[1], seg(lt, 2.4, 2.8));
    if (P.sub) text(P.sub, W / 2, 1180, { size: 44, weight: 700, align: 'center', color: BK, stroke: WH, lw: 10, alpha: seg(lt, 2.6, 3.0) });
    text(`SEITE ${pi + 2}`, W - 60, 110, { size: 30, weight: 700, fam: JM, align: 'right', color: BK });
  };
}
function sEnd(t) {
  const lt = t - bar(20);
  page(t);
  if (panel(40, 40, W - 80, H - 80, CY, seg(lt, 0, 0.4))) { dots(40, 40, W - 80, H - 80, 'rgba(236,0,140,0.3)', 9, 30); endPanel(40, 40, W - 80, H - 80); }
  boom('FORTSETZUNG FOLGT…', W / 2, 640, 300, YE, seg(lt, 0.3, 0.8), -0.08);
  caption('loona-designs.de', 120, 1120, W - 240, 56);
  caption('linkedin.com/in/bjoern-sellnau', 120, 1260, W - 240, 40);
  mark(W / 2, 1600, 6, { neg: seg(lt, 1, 1.4), negCol: MG });
}
start({
  id: '12', title: 'Pop-Art',
  scenes: [[0, sCover], [4, sPage(0)], [8, sPage(1)], [12, sPage(2)], [16, sPage(3)], [20, sEnd]],
  trans: { 4: 'flip', 8: 'flip', 12: 'flip', 16: 'flip', 20: 'flip' }, td: 0.35, tcol: MG, finish: { grain: 0.03, vignette: 0 },
  music: { prog: [[60, 64, 67], [65, 69, 72], [67, 71, 74], [65, 69, 72]], roots: [48, 53, 55, 53], sec: (b) => (b < 2 ? 'intro' : b < 20 ? 'main' : b < 21 ? 'outro' : 'end'), drums: 'breaks', bass: 'square16', arp: 'square', arpSteps: 8, arpGain: 0.035, arpPat: [0, 2, 1, 2], padWave: 'square', pad: 0.012, cut: 2600, swing: 0.08, booms: [4, 8, 12, 16, 20],
    sfx: (A) => [4, 8, 12, 16].forEach((b) => { const at = bar(b) + 2.4; A.noise(at, 0.5, 2000, 200, 0.4, 'lowpass', 1, true); A.kick(at, 1.2); }) },
});
