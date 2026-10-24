/* V17 „SHOWREEL“ — nur die Hero-Animationen der neuen Website: Split-Screens, harte Schnitte, Mosaik im Negativraum. */
setup({ bpm: 126, bars: 20 });
const HM = HEROES.map((h) => h[0]);
const lab = (m) => HEROES.find((h) => h[0] === m)[1];
function tileHero(m, i, x, y, w, h, t, label = true) {
  const img = seq(heroSrc(m, i));
  g.save(); rr(x, y, w, h, 18); g.clip();
  if (img) { const s = Math.max(w / W, h / H) * 1.02; g.drawImage(img, x + (w - W * s) / 2, y + (h - H * s) * 0.32, W * s, H * s); }
  g.restore();
  g.strokeStyle = 'rgba(255,255,255,0.18)'; g.lineWidth = 2; rr(x, y, w, h, 18); g.stroke();
  if (label) { g.fillStyle = 'rgba(0,0,0,0.65)'; rr(x + 16, y + h - 70, Math.min(w - 32, measure(lab(m), 30, 700) + 40), 52, 26); g.fill(); text(lab(m), x + 36, y + h - 34, { size: fit(lab(m), w - 80, 30, 700), weight: 700 }); }
}
function sTitle(t) {
  bgGlow(t, 'amber', 1);
  mark(W / 2, 720, 12 * eOut5(seg(t, 0.1, 0.9)), { neg: 1, glow: 50 });
  text('71', W / 2, 1180, { size: 300, weight: 700, align: 'center', ls: -10, alpha: seg(t, 0.5, 1.0) });
  text('Hero-Animationen', W / 2, 1290, { size: 80, weight: 700, align: 'center', color: C.amber, alpha: seg(t, 0.8, 1.3) });
  text('loona-designs.de · neu gebaut', W / 2, 1380, { size: 40, weight: 500, fam: JM, align: 'center', color: C.soft, alpha: seg(t, 1.1, 1.6) });
}
function sGrid(t) {
  const lt = t - bar(2), set = Math.floor(lt / BAR), f = (lt % BAR) / BAR;
  g.fillStyle = '#05060A'; g.fillRect(0, 0, W, H);
  const w = (W - 60) / 2, h = (H - 260) / 2;
  for (let k = 0; k < 4; k++) { const m = HM[(set * 4 + k) % HM.length], x = 20 + (k % 2) * (w + 20), y = 120 + Math.floor(k / 2) * (h + 20); const kk = eOut5(clamp((f - k * 0.06) * 5)); g.save(); g.globalAlpha = kk; g.translate(x + w / 2, y + h / 2); g.scale(lerp(0.85, 1, kk), lerp(0.85, 1, kk)); g.translate(-(x + w / 2), -(y + h / 2)); tileHero(m, 4 + f * 16, x, y, w, h, t); g.restore(); }
  text(`${pad2(Math.min(14, (set * 4) % 14 + 1))} – ${pad2(Math.min(14, (set * 4 + 3) % 14 + 1))}`, 40, 80, { size: 34, weight: 600, fam: JM, color: C.amber });
  text('HERO-ANIMATIONEN', W - 40, 80, { size: 34, weight: 600, fam: JM, align: 'right', color: C.soft });
}
function sCuts(t) {
  const lt = t - bar(10), i = Math.floor(lt / (2 * B)), f = (lt % (2 * B)) / (2 * B), m = HM[(i + 3) % HM.length];
  const img = seq(heroSrc(m, f * 20));
  g.fillStyle = '#000'; g.fillRect(0, 0, W, H);
  if (img) { const z = lerp(1.1, 1, eOut5(clamp(f * 3))); g.save(); g.translate(W / 2, H / 2); g.scale(z, z); g.drawImage(img, -W / 2, -H / 2, W, H); g.restore(); }
  g.fillStyle = 'rgba(3,4,8,0.9)'; g.fillRect(0, 1380, W, 300);
  rgbText(lab(m), 70, 1530, { size: fit(lab(m), W - 140, 96, 700, SG, -2), weight: 700, ls: -2 }, (1 - clamp(f * 4)) * 16);
  text(`HERO ${pad2(HM.indexOf(m) + 1)} / 14 · eine Auswahl aus 71`, 70, 1610, { size: 30, weight: 600, fam: JM, color: C.amber });
  flash((1 - clamp(f * 8)) * 0.2);
}
function sMosaic(t) {
  const lt = t - bar(16);
  bgGlow(t, 'amber', 0.8);
  const k = eIO(seg(lt, 0.4, 2.6)), s = lerp(60, 17, k);
  g.save(); clipNeg(W / 2, 760, s);
  const tw = 360 * lerp(1.6, 0.6, k), th = tw * 16 / 9 * 0.56;
  for (let r = -4; r <= 4; r++) for (let c = -3; c <= 3; c++) { const m = HM[((r + 4) * 7 + c + 3) % HM.length]; tileHero(m, 10, W / 2 + c * tw - tw / 2, 760 + r * th - th / 2, tw - 6, th - 6, t, false); }
  g.restore();
  g.save(); g.translate(W / 2, 760); g.scale(s, s); g.translate(-22, -23); g.strokeStyle = C.deep; g.lineWidth = 3 / s; g.stroke(NEG_L); g.stroke(NEG_D); g.restore();
  text('Alle 71 auf loona-designs.de', W / 2, 1300, { size: fit('Alle 71 auf loona-designs.de', W - 120, 70, 700), weight: 700, align: 'center', alpha: seg(lt, 2.4, 2.9) });
  text('in den Einstellungen wählbar', W / 2, 1380, { size: 40, weight: 500, fam: JM, align: 'center', color: C.amber, alpha: seg(lt, 2.7, 3.2) });
  text('Björn Sellnau · Das Web. Meine Leidenschaft.', W / 2, 1480, { size: fit('Björn Sellnau · Das Web. Meine Leidenschaft.', W - 120, 38, 600, IS), weight: 600, fam: IS, align: 'center', color: C.soft, alpha: seg(lt, 3.0, 3.5) });
}
start({
  id: '17', title: 'Showreel',
  scenes: [[0, sTitle], [2, sGrid], [10, sCuts], [16, sMosaic]],
  trans: { 2: 'zoom', 10: 'whip', 16: 'logo' }, tcol: C.deep, finish: { grain: 0.04, vignette: 0.4 }, beatZoom: [2, 16],
  seqAt: (t, TD) => {
    const out = [];
    if (t >= bar(2) - TD && t < bar(10) + TD) { const lt = Math.max(0, t - bar(2)), set = Math.floor(lt / BAR), f = (lt % BAR) / BAR; for (let k = 0; k < 4; k++) out.push(heroSrc(HM[(set * 4 + k) % HM.length], 4 + f * 16)); }
    if (t >= bar(10) - TD && t < bar(16) + TD) { const lt = Math.max(0, t - bar(10)), i = Math.floor(lt / (2 * B)), f = (lt % (2 * B)) / (2 * B); out.push(heroSrc(HM[(i + 3) % HM.length], f * 20)); }
    if (t >= bar(16) - TD) HM.forEach((m) => out.push(heroSrc(m, 10)));
    return out;
  },
  music: { prog: [[57, 60, 64], [53, 57, 60], [48, 52, 55], [55, 59, 62]], roots: [45, 41, 48, 43], sec: (b) => (b < 2 ? 'intro' : b < 10 ? 'main' : b < 16 ? 'drop' : b < 19 ? 'outro' : 'end'), drums: 'house', bass: 'saw8', arp: 'square', arpSteps: 16, arpDrop: 16, outroDrums: 'four', booms: [2, 10, 16], risers: [10, 16] },
});
