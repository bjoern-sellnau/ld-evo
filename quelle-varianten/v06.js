/* V06 „BLUEPRINT“ — Bauplan: das LD-Zeichen wird mit Maßlinien konstruiert (Radien und Raster aus den echten Pfaden),
   der Negativraum schraffiert; danach die Karriere als nummerierte Bauabschnitte. */
setup({ bpm: 96, bars: 20 });
const BLUE = '#0E3F8F', LINE = 'rgba(235,244,255,0.92)', FAINT = 'rgba(235,244,255,0.13)';
function paper(t) {
  g.fillStyle = BLUE; g.fillRect(0, 0, W, H);
  const gr = g.createRadialGradient(W / 2, H * 0.4, 100, W / 2, H / 2, 1300); gr.addColorStop(0, 'rgba(60,120,220,0.35)'); gr.addColorStop(1, 'rgba(0,10,40,0.35)'); g.fillStyle = gr; g.fillRect(0, 0, W, H);
  g.save(); g.strokeStyle = FAINT; g.lineWidth = 1; for (let x = 0; x <= W; x += 30) { g.globalAlpha = x % 150 === 0 ? 2 : 1; g.beginPath(); g.moveTo(x, 0); g.lineTo(x, H); g.stroke(); } for (let y = 0; y <= H; y += 30) { g.globalAlpha = y % 150 === 0 ? 2 : 1; g.beginPath(); g.moveTo(0, y); g.lineTo(W, y); g.stroke(); } g.restore();
  g.strokeStyle = LINE; g.lineWidth = 3; g.strokeRect(30, 30, W - 60, H - 60);
}
function label(str, x, y, a = 1, size = 28, align = 'left') { text(str, x, y, { size, weight: 500, fam: JM, color: LINE, alpha: a, align }); }
function dim(x1, y1, x2, y2, txt, p, off = 0) { // Maßlinie mit Pfeilen
  if (p <= 0) return; g.save(); g.strokeStyle = LINE; g.lineWidth = 2; g.globalAlpha = clamp(p * 2);
  const x = lerp(x1, x2, clamp(p)), y = lerp(y1, y2, clamp(p)); g.beginPath(); g.moveTo(x1, y1); g.lineTo(x, y); g.stroke();
  const ang = Math.atan2(y2 - y1, x2 - x1); [[x1, y1, ang], [x, y, ang + Math.PI]].forEach(([px, py, a]) => { g.beginPath(); g.moveTo(px, py); g.lineTo(px + Math.cos(a + 0.35) * 16, py + Math.sin(a + 0.35) * 16); g.moveTo(px, py); g.lineTo(px + Math.cos(a - 0.35) * 16, py + Math.sin(a - 0.35) * 16); g.stroke(); });
  g.restore(); if (p > 0.8) label(txt, (x1 + x2) / 2 + off, (y1 + y2) / 2 - 12, seg(p, 0.8, 1), 26, 'center');
}
const S0 = 17, CX = W / 2, CY = 800; // 1 Einheit = 17 px; Zeichen-Ursprung so, dass Mitte (22/23) bei CX/CY liegt
const U = (u) => CX + (u - 22) * S0, V = (v) => CY + (v - 23) * S0;
function sDraw(t) {
  paper(t);
  label('ZEICHNUNG LD-01 · MARKE · RASTER 46', 70, 110, seg(t, 0, 0.4), 30);
  // Achsen und Raster des Zeichens
  g.save(); g.strokeStyle = 'rgba(235,244,255,0.35)'; g.setLineDash([10, 8]); g.lineWidth = 1.5;
  [0, 8, 16, 24, 44].forEach((u, i) => { const p = seg(t, 0.3 + i * 0.12, 0.9 + i * 0.12); g.beginPath(); g.moveTo(U(u), V(-2)); g.lineTo(U(u), V(-2) + (V(48) - V(-2)) * p); g.stroke(); });
  [3, 11, 27, 35, 43].forEach((v, i) => { const p = seg(t, 0.5 + i * 0.12, 1.1 + i * 0.12); g.beginPath(); g.moveTo(U(-3), V(v)); g.lineTo(U(-3) + (U(48) - U(-3)) * p, V(v)); g.stroke(); });
  // Bögen R20 / R12
  const pa = seg(t, 1.6, 3.0); g.beginPath(); g.arc(U(24), V(23), 20 * S0, -Math.PI / 2, -Math.PI / 2 + Math.PI * pa); g.stroke(); g.beginPath(); g.arc(U(24), V(23), 12 * S0, -Math.PI / 2, -Math.PI / 2 + Math.PI * pa); g.stroke();
  g.restore();
  // Kontur des Zeichens
  mark(CX, CY, S0, { outline: seg(t, 2.4, 5.2), lineCol: LINE, lw: 4, lineGlow: false });
  // Negativraum schraffiert
  const hp = seg(t, 5.0, 7.0);
  if (hp > 0) { g.save(); clipNeg(CX, CY, S0); g.strokeStyle = 'rgba(255,170,90,0.85)'; g.lineWidth = 3; for (let x = -H; x < W + H; x += 18) { if ((x + H) / (W + 2 * H) > hp) break; g.beginPath(); g.moveTo(x, 0); g.lineTo(x + H, H); g.stroke(); } g.restore(); }
  // Maße
  dim(U(0), V(48), U(8), V(48), '8', seg(t, 3.2, 3.8));
  dim(U(8), V(50.5), U(16), V(50.5), '8', seg(t, 3.5, 4.1));
  dim(U(24), V(23), U(24) + 20 * S0 * 0.7071, V(23) - 20 * S0 * 0.7071, 'R 20', seg(t, 3.8, 4.6), 40);
  dim(U(24), V(23), U(24) + 12 * S0, V(23), 'R 12', seg(t, 4.2, 5.0));
  dim(U(-5), V(3), U(-5), V(43), '40', seg(t, 4.5, 5.2), -30);
  if (hp > 0.6) { label('L-KANAL', U(8) - 20, V(40) + 160, seg(hp, 0.6, 0.9), 30); label('D-COUNTER', U(30), V(40) + 160, seg(hp, 0.7, 1), 30); g.save(); g.strokeStyle = LINE; g.lineWidth = 2; g.globalAlpha = seg(hp, 0.6, 0.9); g.beginPath(); g.moveTo(U(12), V(30)); g.lineTo(U(10), V(40) + 125); g.moveTo(U(30), V(25)); g.lineTo(U(34), V(40) + 125); g.stroke(); g.restore(); }
  label('NEGATIVRAUM = L-KANAL + D-COUNTER', 70, 1480, seg(t, 7.2, 7.8), 34);
  label('Pfade: glyphs.tsx · LoonaNegative.tsx', 70, 1540, seg(t, 7.6, 8.2), 26);
  titleBlock(t, 'MARKE LD', '1 : 17');
}
function titleBlock(t, title, scale) {
  const x = W - 520, y = H - 300; g.save(); g.strokeStyle = LINE; g.lineWidth = 2; g.strokeRect(x, y, 470, 230); g.beginPath(); g.moveTo(x, y + 70); g.lineTo(x + 470, y + 70); g.moveTo(x, y + 150); g.lineTo(x + 470, y + 150); g.moveTo(x + 260, y + 150); g.lineTo(x + 260, y + 230); g.stroke(); g.restore();
  label('PROJEKT', x + 14, y + 28, 0.7, 20); label(title, x + 14, y + 58, 1, 30);
  label('GEZEICHNET', x + 14, y + 98, 0.7, 20); label('Björn Sellnau', x + 14, y + 132, 1, 28);
  label('MASSSTAB', x + 14, y + 178, 0.7, 20); label(scale, x + 14, y + 212, 1, 28);
  label('BLATT', x + 274, y + 178, 0.7, 20); label('10/2026', x + 274, y + 212, 1, 28);
}
function sPlan(t) {
  const lt = t - bar(8), n = KEY.length, per = 8.6 * BAR / n;
  paper(t);
  label('BAUPLAN EINER KARRIERE', 70, 120, 1, 40);
  label('BAUABSCHNITTE 2002 – 2026', 70, 170, 0.8, 26);
  const prog = lt / per, shown = Math.min(n, Math.floor(prog) + 1), scrollY = Math.max(0, prog - 6.4) * 190;
  g.save(); g.beginPath(); g.rect(0, 220, W, H - 560); g.clip(); g.translate(0, -scrollY);
  g.strokeStyle = LINE; g.lineWidth = 3; g.beginPath(); g.moveTo(150, 260); g.lineTo(150, 300 + 190 * Math.min(n - 1, prog)); g.stroke();
  for (let i = 0; i < shown; i++) {
    const s = KEY[i], y = 300 + i * 190, p = seg(lt, i * per, i * per + 0.8);
    g.save(); g.strokeStyle = LINE; g.lineWidth = 3; g.fillStyle = BLUE; g.beginPath(); g.arc(150, y, 40, 0, Math.PI * 2 * p); g.stroke(); g.restore();
    label(pad2(i + 1), 150, y + 12, p, 34, 'center');
    label(s.d, 230, y - 20, p, 28);
    text(s.t, 230, y + 30, { size: fit(s.t, W - 300, 52, 600, IS), weight: 600, fam: IS, color: s.k === 'award' ? '#FFD27A' : '#FFFFFF', alpha: p });
    text(s.k === 'award' ? 'Gold · Best of Swiss Web 2017 · Kategorie Mobile' : s.s, 230, y + 76, { size: fit(s.k === 'award' ? 'Gold · Best of Swiss Web 2017 · Kategorie Mobile' : s.s, W - 300, 30, 500, IS), weight: 500, fam: IS, color: 'rgba(235,244,255,0.75)', alpha: seg(lt, i * per + 0.3, i * per + 1) });
  }
  g.restore();
  titleBlock(t, 'KARRIERE', '1 : 1');
}
function sDone(t) {
  const lt = t - bar(17);
  paper(t);
  mark(CX, 700, 13, { outline: 1, lineCol: LINE, lw: 3, lineGlow: false, neg: eOut(seg(lt, 0.2, 1.0)), negCol: '#FF9A4D' });
  text('GEPRÜFT & FREIGEGEBEN', W / 2, 1180, { size: 52, weight: 700, fam: JM, align: 'center', color: '#FFFFFF', alpha: seg(lt, 0.6, 1.0) });
  text('Das Web. Meine Leidenschaft.', W / 2, 1270, { size: fit('Das Web. Meine Leidenschaft.', W - 160, 58, 700), weight: 700, align: 'center', color: '#FFD27A', alpha: seg(lt, 1.0, 1.4) });
  LINKS.forEach((l, i) => label(l, W / 2, 1370 + i * 56, seg(lt, 1.4 + i * 0.3, 1.8 + i * 0.3), 34, 'center'));
  // Stempel
  const st = eBack(seg(lt, 2.0, 2.4)); if (st > 0) { g.save(); g.translate(250, 1560); g.rotate(-0.18); g.scale(st, st); g.strokeStyle = '#FF9A4D'; g.lineWidth = 6; rr(-170, -60, 340, 120, 14); g.stroke(); text('FREIGABE 2026', 0, 14, { size: 40, weight: 700, fam: JM, align: 'center', color: '#FF9A4D' }); g.restore(); }
  titleBlock(t, 'LOONA-DESIGNS.DE', '1 : 1');
}
start({
  id: '06', title: 'Blueprint',
  scenes: [[0, sDraw], [8, sPlan], [17, sDone]],
  trans: { 8: 'slice', 17: 'zoom' }, tcol: '#FFFFFF', finish: { grain: 0.05, vignette: 0.35 },
  music: { prog: [[62, 65, 69], [58, 62, 65], [60, 64, 67], [57, 60, 64]], roots: [50, 46, 48, 45], sec: (b) => (b < 4 ? 'intro' : b < 8 ? 'half' : b < 16 ? 'main' : b < 18 ? 'half' : b < 19 ? 'outro' : 'end'), drums: 'four', bass: 'sub', arp: 'triangle', arpSteps: 8, arpGain: 0.045, arpPat: [0, 1, 2, 1, 0, 2], arpHalf: true, padWave: 'triangle', pad: 0.03, padSoft: 0.035, cut: 2000, verb: 0.45, verbLen: 3, introPulse: false, booms: [8, 17], whoosh: [8, 17],
    sfx: (A) => { for (let i = 0; i < 24; i++) A.noise(2.4 + i * 0.12, 0.08, 2000, 1200, 0.03, 'bandpass', 2); } },
});
