/* V20 „PINNWAND“ — Korkwand mit Polaroids, Notizzetteln und rotem Faden; die Kamera folgt dem Faden chronologisch. */
setup({ bpm: 104, bars: 20 });
// Elemente auf der Wand (Weltkoordinaten): [x, y, Art, Bild|null, Titel, Datum, Drehung]
const ITEMS = [
  [300, 300, 'note', null, 'Ausbildung', '06/2002', -0.06], [760, 420, 'pola', 'yayci', 'Yayci-Onlineshop', '2004', 0.05], [320, 900, 'pola', 'catt', 'CATT Service', '2005', -0.04],
  [800, 1060, 'pola', 'ld2006', 'Loona! Designs „ld2006“', '2006', 0.07], [340, 1520, 'note', null, 'PIXELTEX · Gadmin 4 CMS', '09/2007', 0.04], [790, 1700, 'note', null, 'Berlin', '2011', -0.08],
  [330, 2180, 'gold', null, 'Gold! Best of Swiss Web 2017 · Mobile', '01/2016 – 04/2017', -0.03], [800, 2360, 'note', null, 'OpenBooking · Frontend Lead', '09/2016', 0.05],
  [320, 2860, 'note', null, 'Azubi-Recruiting → AEVO → Ausbilder', '2018 – 2020', -0.05], [780, 3040, 'note', null, 'Code-b · Software Engineer', '05/2020 – 01/2026', 0.04],
  [330, 3540, 'lead', null, 'BMW Neuwagensuche · Tech Lead', '01/2022 – 05/2023', 0.06], [790, 3720, 'note', null, 'Tabletop Herald App', '04/2024 – 12/2025', -0.05],
  [330, 4220, 'pola', 'cfTitle', 'Corefall · Labs', '05/2026', -0.06], [790, 4400, 'pola', 'sf:01-pariser-platz', 'SPREE|FALL · Labs', '2026', 0.05], [540, 4950, 'note', null, 'Materna SE · Senior Developer', '05/2026', 0.02],
];
function cork(t, cam) {
  g.fillStyle = '#B98A5A'; g.fillRect(0, 0, W, H);
  for (let i = 0; i < 1400; i++) { const x = (hash(i * 1.7) * W * 1.2 - (cam[0] * 0.0)) % W, y = ((hash(i * 2.3) * 6000 - cam[1]) % H + H) % H; g.fillStyle = hash(i) > 0.5 ? 'rgba(90,55,25,0.35)' : 'rgba(230,190,140,0.35)'; g.fillRect(x, y, 2 + hash(i + 1) * 4, 2 + hash(i + 2) * 3); }
  const v = g.createRadialGradient(W / 2, H / 2, 300, W / 2, H / 2, 1200); v.addColorStop(0, 'rgba(0,0,0,0)'); v.addColorStop(1, 'rgba(40,20,5,0.5)'); g.fillStyle = v; g.fillRect(0, 0, W, H);
}
function pin(x, y, col = '#D7263D') { g.save(); g.shadowColor = 'rgba(0,0,0,0.45)'; g.shadowBlur = 10; g.shadowOffsetY = 6; g.fillStyle = col; g.beginPath(); g.arc(x, y, 18, 0, 7); g.fill(); g.restore(); g.fillStyle = 'rgba(255,255,255,0.6)'; g.beginPath(); g.arc(x - 6, y - 6, 5, 0, 7); g.fill(); }
function hand(str, x, y, size, col = '#1B1B1B', w = 600) { g.save(); g.translate(x, y); g.transform(1, 0, -0.18, 1, 0, 0); text(str, 0, 0, { size: fit(str, w, size, 600, IS), weight: 600, fam: IS, color: col }); g.restore(); }
function item(it, a) {
  const [x, y, kind, img, ti, d, rot] = it;
  g.save(); g.globalAlpha = a; g.translate(x, y); g.rotate(rot); g.shadowColor = 'rgba(0,0,0,0.4)'; g.shadowBlur = 24; g.shadowOffsetY = 12;
  if (kind === 'pola') { g.fillStyle = '#FBFAF6'; g.fillRect(-210, -200, 420, 470); g.shadowBlur = 0; g.shadowOffsetY = 0; imgCover(IMG[img], -185, -175, 370, 330, 0, true); hand(ti, -180, 205, 36, '#222', 360); hand(d, -180, 250, 28, '#7A2E1D', 360); }
  else { g.fillStyle = kind === 'gold' ? '#FFD45A' : kind === 'lead' ? '#7EC8F2' : '#FFF27A'; g.fillRect(-200, -170, 400, 340); g.shadowBlur = 0; g.shadowOffsetY = 0; hand(d, -170, -100, 32, '#7A2E1D', 340); const words = ti.split(' '); let line = '', ly = -30; for (const w of words) { const tt = line ? line + ' ' + w : w; if (measure(tt, 40, 600, IS) > 330 && line) { hand(line, -170, ly, 40); line = w; ly += 52; } else line = tt; } hand(line, -170, ly, 40); if (kind === 'gold') { g.save(); g.translate(130, 110); g.rotate(-0.3); text('★', 0, 0, { size: 80, weight: 700, fam: IS, color: '#B8860B' }); g.restore(); } }
  g.restore();
  pin(x + Math.sin(rot) * 10, y - (kind === 'pola' ? 205 : 170));
}
function sWall(t) {
  const span = 18 * BAR, p = clamp(t / span), n = ITEMS.length, fi = p * (n - 1), i0 = Math.floor(fi), k = eIO(fi - i0);
  const A = ITEMS[i0], Bn = ITEMS[Math.min(n - 1, i0 + 1)];
  const zoomOut = eIO(seg(t, bar(17.5), bar(19)));
  const sc = lerp(1.0, 0.36, zoomOut), cam = [lerp(lerp(A[0], Bn[0], k), 540, zoomOut), lerp(lerp(A[1], Bn[1], k) + 120, 2650, zoomOut)];
  cork(t, cam);
  g.save(); g.translate(W / 2, H / 2); g.scale(sc, sc); g.translate(-cam[0], -cam[1]);
  // roter Faden bis zum aktuellen Punkt
  g.strokeStyle = '#B3121F'; g.lineWidth = 6; g.shadowColor = 'rgba(0,0,0,0.35)'; g.shadowBlur = 6; g.beginPath();
  for (let i = 0; i <= Math.min(n - 1, i0 + 1); i++) { const it = ITEMS[i], px = it[0], py = it[1] - (it[2] === 'pola' ? 205 : 170); if (i === 0) g.moveTo(px, py); else if (i <= i0) g.lineTo(px, py); else g.lineTo(lerp(ITEMS[i0][0], px, k), lerp(ITEMS[i0][1] - (ITEMS[i0][2] === 'pola' ? 205 : 170), py, k)); }
  g.stroke(); g.shadowBlur = 0;
  ITEMS.forEach((it, i) => item(it, clamp((fi - i + 1.2) * 1.5)));
  g.restore();
  if (zoomOut > 0.4) { const a = seg(zoomOut, 0.4, 1); g.fillStyle = `rgba(255,253,244,${0.92 * a})`; g.save(); g.translate(W / 2, 1640); g.rotate(-0.02); rr(-430, -150, 860, 300, 10); g.fill(); g.restore(); hand('Björn Sellnau — Das Web. Meine Leidenschaft.', W / 2 - 390, 1600, 42, '#111', 780); hand('loona-designs.de · linkedin.com/in/bjoern-sellnau', W / 2 - 390, 1680, 34, '#7A2E1D', 780); mark(W / 2 + 330, 1500, 3, { neg: a }); }
}
start({
  id: '20', title: 'Pinnwand',
  scenes: [[0, sWall]], trans: {}, finish: { grain: 0.06, vignette: 0.3 },
  music: { prog: [[62, 66, 69, 73], [59, 62, 66, 69], [55, 59, 62, 66], [57, 61, 64, 67]], roots: [50, 47, 43, 45], sec: (b) => (b < 1 ? 'intro' : b < 4 ? 'half' : b < 18 ? 'main' : b < 19 ? 'outro' : 'end'), drums: 'half', bass: 'pluck', swing: 0.14, arp: 'triangle', arpSteps: 8, arpGain: 0.045, arpPat: [0, 2, 1, 3], arpHalf: true, padWave: 'triangle', pad: 0.025, cut: 2600, introPulse: false,
    sfx: (A) => { for (let i = 0; i < ITEMS.length; i++) { const at = (i / (ITEMS.length - 1)) * 18 * BAR - 0.4; A.noise(Math.max(0.05, at), 0.05, 3000, 1500, 0.12, 'bandpass', 2); } } },
});
