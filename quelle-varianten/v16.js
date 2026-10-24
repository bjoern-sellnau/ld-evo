/* V16 „LINIENNETZ“ — die Karriere als U-Bahn-Plan: vier Linien, ein Zug fährt die Stationen chronologisch ab. */
setup({ bpm: 110, bars: 22 });
const LCOL = { A: '#FF7816', B: '#2FAE6A', C: '#1E9BD7', D: '#9B5DE5' };
// Route in Kartenkoordinaten (Einheit px), chronologisch; [x, y, Linie, Station|null]
const R = [
  [0, 0, 'A', 'Ausbildung · 06/2002', 'r'], [0, 300, 'A', 'Flash-Spiel · 2003', 'r'], [210, 510, 'A', 'Yayci-Shop · 2004', 'r'], [210, 780, 'A', 'ld2006 · 2006', 'r'],
  [420, 990, 'A', 'PIXELTEX · 09/2007', 'd'], [690, 990, 'A', 'Gadmin 4 CMS · 2007 – 2009', 'u'], [960, 990, 'A', 'Berlin · 2011', 'd'],
  [1170, 1200, 'A', 'MySwitzerland Mobile · Gold', 'r'], [1170, 1500, 'A', 'OpenBooking · 09/2016', 'r'],
  [960, 1710, 'B', 'Azubi-Recruiting · 2018', 'd'], [690, 1710, 'B', 'AEVO · 03/2019', 'u'], [420, 1710, 'B', 'Ausbilder · 2019 – 2020', 'l'],
  [420, 2010, 'C', 'Code-b · 05/2020', 'l'], [630, 2220, 'C', 'BMW Neuwagensuche · Tech Lead', 'd'], [900, 2220, 'C', 'Tabletop Herald · 2024 – 2025', 'u'],
  [1110, 2430, 'D', 'Labs · Corefall · Covert · SPREE|FALL', 'r'], [1110, 2730, 'C', 'Materna SE · 05/2026', 'r'],
];
const SEGL = R.slice(1).map((p, i) => Math.hypot(p[0] - R[i][0], p[1] - R[i][1]));
const TOT = SEGL.reduce((a, b) => a + b, 0);
function at(d) { let acc = 0; for (let i = 0; i < SEGL.length; i++) { if (acc + SEGL[i] >= d) { const k = (d - acc) / SEGL[i]; return [lerp(R[i][0], R[i + 1][0], k), lerp(R[i][1], R[i + 1][1], k), i]; } acc += SEGL[i]; } return [R[R.length - 1][0], R[R.length - 1][1], SEGL.length - 1]; }
function mapDraw(t, cam, sc, prog, curSt) {
  g.fillStyle = '#F4F2EE'; g.fillRect(0, 0, W, H);
  g.save(); g.translate(W / 2, H / 2); g.scale(sc, sc); g.translate(-cam[0], -cam[1]);
  // Spree als Fluss
  g.strokeStyle = '#BFDDF2'; g.lineWidth = 120; g.lineCap = 'round'; g.beginPath(); g.moveTo(-600, 1250); g.bezierCurveTo(300, 1100, 700, 1450, 1900, 1300); g.stroke();
  g.lineCap = 'round'; g.lineJoin = 'round';
  for (let i = 0; i < R.length - 1; i++) { const col = LCOL[R[i + 1][2]]; g.strokeStyle = col; g.lineWidth = 34; g.globalAlpha = 0.25; g.beginPath(); g.moveTo(R[i][0], R[i][1]); g.lineTo(R[i + 1][0], R[i + 1][1]); g.stroke(); }
  g.globalAlpha = 1;
  let acc = 0; for (let i = 0; i < R.length - 1; i++) { const col = LCOL[R[i + 1][2]], d = clamp((prog - acc) / SEGL[i]); if (d > 0) { g.strokeStyle = col; g.lineWidth = 34; g.beginPath(); g.moveTo(R[i][0], R[i][1]); g.lineTo(lerp(R[i][0], R[i + 1][0], d), lerp(R[i][1], R[i + 1][1], d)); g.stroke(); } acc += SEGL[i]; }
  R.forEach(([x, y, l, name, ps], i) => {
    const reached = i === 0 || prog >= SEGL.slice(0, i).reduce((a, b) => a + b, 0) - 1, big = i === curSt;
    g.fillStyle = '#FFFFFF'; g.strokeStyle = '#111'; g.lineWidth = big ? 12 : 8; g.beginPath(); g.arc(x, y, big ? 34 : 24, 0, 7); g.fill(); g.stroke();
    const o = { size: big ? 46 : 38, weight: big ? 700 : 600, fam: IS, color: reached ? '#111' : '#9A9A9A' };
    if (ps === 'r') text(name, x + 60, y + 14, { ...o, align: 'left' }); else if (ps === 'l') text(name, x - 60, y + 14, { ...o, align: 'right' });
    else text(name, x, ps === 'u' ? y - 62 : y + 90, { ...o, align: 'center' });
  });
  g.restore();
}
function legend(a) {
  g.save(); g.globalAlpha = a; g.fillStyle = 'rgba(255,255,255,0.95)'; rr(40, 40, W - 80, 220, 20); g.fill(); g.strokeStyle = '#111'; g.lineWidth = 3; g.stroke();
  text('LD-NETZ · 2002 – 2026', 80, 110, { size: 44, weight: 700, color: '#111' });
  [['A', 'Agentur & Web'], ['B', 'Ausbildung'], ['C', 'Produkte & Führung'], ['D', 'Labs']].forEach(([k, l], i) => { const x = 80 + (i % 2) * 470, y = 170 + Math.floor(i / 2) * 56; g.fillStyle = LCOL[k]; rr(x, y - 26, 70, 34, 17); g.fill(); text(k, x + 35, y, { size: 26, weight: 700, align: 'center', color: '#fff' }); text(l, x + 90, y, { size: 30, weight: 600, fam: IS, color: '#111' }); });
  g.restore();
}
function sRide(t) {
  const lt = t - bar(2), ride = 17 * BAR, p = clamp(lt / ride), prog = eIO(p) * TOT;
  const [x, y, si] = at(prog), stIdx = R.findIndex((r) => Math.hypot(r[0] - x, r[1] - y) < 60);
  const zoomIn = eIO(seg(t, 0, bar(2) + 1)), zoomOut = eIO(seg(t, bar(19), bar(20) + 1));
  const sc = lerp(lerp(0.32, 0.9, zoomIn), 0.32, zoomOut);
  const cam = [lerp(lerp(650, x, zoomIn), 650, zoomOut), lerp(lerp(1360, y, zoomIn), 1360, zoomOut)];
  mapDraw(t, cam, sc, prog, stIdx);
  // Zug
  if (zoomOut < 0.9) { g.save(); g.translate(W / 2 + (x - cam[0]) * sc, H / 2 + (y - cam[1]) * sc); const nx = R[Math.min(si + 1, R.length - 1)][0] - R[si][0], ny = R[Math.min(si + 1, R.length - 1)][1] - R[si][1]; g.rotate(Math.atan2(ny, nx)); g.scale(sc, sc); g.fillStyle = '#111'; rr(-70, -28, 140, 56, 22); g.fill(); g.fillStyle = '#FFE066'; g.fillRect(40, -16, 18, 32); g.restore(); }
  legend(1 - zoomIn * 0.85 + zoomOut * 0.85);
  // Haltestellenanzeige
  const next = R[Math.min(si + 1, R.length - 1)];
  if (zoomOut < 0.5) { g.fillStyle = '#111'; rr(40, H - 250, W - 80, 190, 20); g.fill(); text(stIdx >= 0 ? 'HALT' : 'NÄCHSTER HALT', 80, H - 180, { size: 30, weight: 600, fam: JM, color: '#FFE066' }); const nm = stIdx >= 0 ? R[stIdx][3] : next[3]; text(nm, 80, H - 108, { size: fit(nm, W - 160, 58, 700), weight: 700, color: '#FFFFFF' }); }
  if (zoomOut > 0.6) { text('Björn Sellnau', W / 2, H - 260, { size: 80, weight: 700, align: 'center', color: '#111', alpha: seg(zoomOut, 0.6, 0.9) }); text('loona-designs.de · linkedin.com/in/bjoern-sellnau', W / 2, H - 190, { size: fit('loona-designs.de · linkedin.com/in/bjoern-sellnau', W - 120, 36, 600, JM), weight: 600, fam: JM, align: 'center', color: '#333', alpha: seg(zoomOut, 0.7, 1) }); mark(W / 2, H - 400, 4, { neg: seg(zoomOut, 0.7, 1) }); }
}
start({
  id: '16', title: 'Liniennetz',
  scenes: [[0, sRide]],
  trans: {}, finish: { grain: 0.02, vignette: 0.15 },
  music: { prog: [[64, 68, 71], [61, 64, 68], [57, 61, 64], [59, 63, 66]], roots: [52, 49, 45, 47], sec: (b) => (b < 2 ? 'intro' : b < 20 ? 'main' : b < 21 ? 'outro' : 'end'), drums: 'house', bass: 'pluck', arp: 'triangle', arpSteps: 8, arpGain: 0.04, arpPat: [0, 1, 2, 1], padWave: 'triangle', pad: 0.025, cut: 2400, introPulse: false,
    sfx: (A) => { const ride = 17 * BAR; for (let i = 1; i < R.length; i++) { /* Gong je Halt (ungefähr, nach Weglänge) */ let acc = 0; for (let j = 0; j < i; j++) acc += SEGL[j]; const p = acc / TOT; const tt = bar(2) + ride * (p < 0.5 ? Math.cbrt(p / 4) : 1 - Math.cbrt(2 * (1 - p)) / 2); A.tone(tt, 0.5, midi(81), 'sine', 0.05, 6000, true); A.tone(tt + 0.25, 0.7, midi(76), 'sine', 0.05, 6000, true); } } },
});
