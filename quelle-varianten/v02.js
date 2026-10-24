/* V02 „SWISS“ — Internationaler Typografischer Stil: Papier, Schwarz, Rot, strenges Raster, große Grotesk-Ziffern.
   Passend zum Gold bei Best of Swiss Web 2017 (Kategorie Mobile). */
setup({ bpm: 118, bars: 24 });
const PAPER = '#F2EFE8', INK = '#111111', RED = '#E30613';
const COL = (i) => 60 + i * 160; // 6 Spalten à 160 px
function paper(t) {
  g.fillStyle = PAPER; g.fillRect(0, 0, W, H);
  g.save(); g.strokeStyle = 'rgba(0,0,0,0.07)'; g.lineWidth = 1;
  for (let i = 0; i <= 6; i++) { g.beginPath(); g.moveTo(COL(i), 0); g.lineTo(COL(i), H); g.stroke(); }
  for (let y = 120; y < H; y += 120) { g.beginPath(); g.moveTo(0, y); g.lineTo(W, y); g.stroke(); }
  g.restore();
}
function rule(x, y, w, p, col = INK, h = 10) { g.fillStyle = col; g.fillRect(x, y, w * eOut5(clamp(p)), h); }
function sOpen(t) {
  paper(t);
  const k1 = eOut5(seg(t, 0.2, 0.9)), k2 = eOut5(seg(t, 0.5, 1.2));
  g.fillStyle = RED; g.fillRect(COL(0), 160, 320 * eOut5(seg(t, 0, 0.5)), 320);
  text('Björn', COL(0), 760, { size: 300, weight: 700, color: INK, ls: -14, alpha: k1 });
  text('Sellnau', COL(0), 1030, { size: fit('Sellnau', W - 120, 300, 700, SG, -14), weight: 700, color: INK, ls: -14, alpha: k2 });
  rule(COL(0), 1090, W - 120, seg(t, 1.2, 2.0));
  text('Web Engineer', COL(0), 1200, { size: 54, weight: 700, color: INK, alpha: seg(t, 1.6, 2.0) });
  text('seit 2007', COL(3), 1200, { size: 54, weight: 500, color: RED, alpha: seg(t, 1.8, 2.2) });
  text('Berlin', COL(0), 1270, { size: 54, weight: 500, color: INK, alpha: seg(t, 2.0, 2.4) });
  text('Senior Developer, Materna SE', COL(0), 1340, { size: 40, weight: 500, fam: IS, color: INK, alpha: seg(t, 2.3, 2.7) });
  mark(COL(5) + 40, 320, 6, { neg: seg(t, 0.4, 0.8), negCol: PAPER });
  text('01', COL(5) + 120, 1830, { size: 34, weight: 700, fam: JM, align: 'right', color: INK });
}
function sChrono(t) {
  const lt = t - bar(4), per = (12 * BAR) / KEY.length, i = clamp(Math.floor(lt / per), 0, KEY.length - 1), f = (lt - i * per) / per, s = KEY[i];
  paper(t);
  const k = eOut5(clamp(f * 3));
  // Jahr als riesige Ziffer, von unten eingeschoben
  g.save(); g.beginPath(); g.rect(0, 200, W, 600); g.clip();
  text(String(s.y), COL(0) - 14, 760 + (1 - k) * 560, { size: 420, weight: 700, color: s.k === 'award' || s.k === 'lead' ? RED : INK, ls: -24 });
  g.restore();
  rule(COL(0), 830, W - 120, f * 4, RED, 14);
  text(s.d, COL(0), 920, { size: 40, weight: 600, fam: JM, color: RED, alpha: k });
  text(s.t, COL(0), 1030, { size: fit(s.t, W - 120, 104, 700, SG, -4), weight: 700, color: INK, ls: -4, alpha: k });
  wrap(s.s, COL(0), 1110, W - 280, 46, { weight: 500, fam: IS, color: INK, alpha: seg(f, 0.15, 0.35) });
  // Zeitstrahl am Fuß: 2002–2026
  const x0 = COL(0), x1 = W - 60, yy = 1640, px = (y) => x0 + ((y - 2002) / 24) * (x1 - x0);
  g.fillStyle = INK; g.fillRect(x0, yy, x1 - x0, 3);
  KEY.forEach((q, j) => { g.fillStyle = j === i ? RED : INK; const r = j === i ? 14 : 6; g.beginPath(); g.arc(px(q.y + (j > 0 && q.y === KEY[j - 1].y ? 0.4 : 0)), yy + 1, r, 0, 7); g.fill(); });
  ['2002', '2014', '2026'].forEach((y) => text(y, px(+y), yy + 60, { size: 28, weight: 600, fam: JM, align: 'center', color: INK }));
  text(pad2(i + 2), COL(5) + 120, 1830, { size: 34, weight: 700, fam: JM, align: 'right', color: INK });
  // rote Blockblende auf dem Wechsel
  const wipe = seg(f, 0.9, 1);
  if (wipe > 0 && i < KEY.length - 1) { g.fillStyle = RED; g.fillRect(0, 0, W * eIO(wipe), H); }
  const win = 1 - seg(f, 0, 0.1);
  if (win > 0 && i > 0) { g.fillStyle = RED; g.fillRect(W * (1 - eIO(win)), 0, W * eIO(win), H); }
}
function sGold(t) {
  const lt = t - bar(16);
  g.fillStyle = RED; g.fillRect(0, 0, W, H);
  const k = eOut5(seg(lt, 0, 0.5));
  text('Gold.', COL(0) - 10, 760, { size: 380 * lerp(1.12, 1, k), weight: 700, color: PAPER, ls: -20 });
  g.fillStyle = PAPER; g.fillRect(COL(0), 830, (W - 120) * eOut5(seg(lt, 0.4, 1.0)), 12);
  text(AWARD.t, COL(0), 960, { size: 72, weight: 700, color: PAPER, alpha: seg(lt, 0.6, 1.0) });
  text(AWARD.c, COL(0), 1050, { size: 56, weight: 500, color: PAPER, alpha: seg(lt, 0.9, 1.3) });
  text(AWARD.p, COL(0), 1180, { size: 44, weight: 500, fam: IS, color: PAPER, alpha: seg(lt, 1.4, 1.8) });
  text('Planung & Umsetzung · 01/2016 – 04/2017', COL(0), 1250, { size: 40, weight: 500, fam: IS, color: PAPER, alpha: seg(lt, 1.8, 2.2) });
  // Tech Lead
  const k2 = eOut5(seg(lt, 2 * BAR, 2 * BAR + 0.5));
  if (k2 > 0) {
    g.fillStyle = INK; g.fillRect(0, H * (1 - k2 * 0.42), W, H * 0.42);
    text('Tech Lead.', COL(0), H - 640 * k2 + 260, { size: 150, weight: 700, color: PAPER, ls: -6 });
    text('BMW Neuwagensuche · 09/2022 – 05/2023', COL(0), H - 640 * k2 + 360, { size: fit('BMW Neuwagensuche · 09/2022 – 05/2023', W - 120, 46, 500, IS), weight: 500, fam: IS, color: PAPER });
  }
  text('13', COL(5) + 120, 1830, { size: 34, weight: 700, fam: JM, align: 'right', color: PAPER });
}
function sEnd(t) {
  const lt = t - bar(20);
  paper(t);
  const k = eOut5(seg(lt, 0, 0.6));
  g.fillStyle = RED; g.fillRect(COL(0), 300, 480 * k, 480 * k);
  mark(COL(0) + 240 * k, 300 + 240 * k, 13 * k, { neg: k, negCol: PAPER });
  text('Das Web.', COL(0), 1020, { size: 150, weight: 700, color: INK, ls: -6, alpha: seg(lt, 0.4, 0.8) });
  text('Meine Leidenschaft.', COL(0), 1170, { size: fit('Meine Leidenschaft.', W - 120, 150, 700, SG, -6), weight: 700, color: RED, ls: -6, alpha: seg(lt, 0.7, 1.1) });
  rule(COL(0), 1240, W - 120, seg(lt, 1.0, 1.6));
  LINKS.forEach((l, i) => text(l, COL(0), 1360 + i * 70, { size: 46, weight: 600, fam: JM, color: INK, alpha: seg(lt, 1.4 + i * 0.3, 1.8 + i * 0.3) }));
  text('14', COL(5) + 120, 1830, { size: 34, weight: 700, fam: JM, align: 'right', color: INK });
}
start({
  id: '02', title: 'Swiss',
  scenes: [[0, sOpen], [4, sChrono], [16, sGold], [20, sEnd]],
  trans: { 4: 'push', 16: 'slice', 20: 'push' }, tcol: RED, finish: { grain: 0.03, vignette: 0 },
  music: { prog: [[57, 60, 64], [57, 60, 64], [53, 57, 60], [55, 59, 62]], roots: [45, 45, 41, 43], sec: (b) => (b < 2 ? 'intro' : b < 16 ? 'main' : b < 20 ? 'drop' : b < 23 ? 'outro' : 'end'), drums: 'house', bass: 'pluck', arp: 'triangle', arpSteps: 8, arpDrop: 8, arpGain: 0.05, padWave: 'triangle', pad: 0.03, cut: 2200, outroDrums: 'four', booms: [4, 16, 20], whoosh: [4, 16, 20] },
});
