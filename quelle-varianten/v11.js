/* V11 „NEGATIVRAUM“ — reiner Marken-Film: L-Kanal und D-Counter entstehen, kacheln sich zum Muster, passen exakt in das
   Zeichen und landen in der Kachel (Einstellung „Logo only negative“ der neuen Website). */
setup({ bpm: 124, bars: 16 });
const INKC = '#14110E', CREAM = C.cream, OR = C.deep;
function base(col = INKC) { g.fillStyle = col; g.fillRect(0, 0, W, H); }
function sBirth(t) {
  base();
  const s = 20, cx = W / 2, cy = 900;
  mark(cx, cy, s, { negOutline: seg(t, 0.2, 2.0), lineCol: OR, lw: 5 });
  const fL = eOut5(seg(t, 2.0, 2.6)), fD = eOut5(seg(t, 2.6, 3.2));
  g.save(); g.translate(cx, cy); g.scale(s, s); g.translate(-22, -23); g.fillStyle = OR; g.globalAlpha = fL; g.fill(NEG_L); g.globalAlpha = fD; g.save(); g.translate(28, 23); g.rotate((1 - fD) * -1.2); g.translate(-28, -23); g.fill(NEG_D); g.restore(); g.restore();
  text('L', cx - 150, 1420, { size: 90, weight: 700, align: 'center', color: CREAM, alpha: seg(t, 2.2, 2.6) });
  text('+', cx, 1420, { size: 90, weight: 500, align: 'center', color: C.soft, alpha: seg(t, 2.6, 3.0) });
  text('D', cx + 150, 1420, { size: 90, weight: 700, align: 'center', color: CREAM, alpha: seg(t, 2.8, 3.2) });
  text('der Raum dazwischen', cx, 1520, { size: 40, weight: 500, fam: JM, align: 'center', color: C.soft, ls: 6, alpha: seg(t, 4.0, 4.6) });
  shockwave(cx, cy, t - 3.2, '255,120,22', 1400);
}
function sPattern(t) {
  const lt = t - bar(4), beat = Math.floor(lt / B), inv = beat % 2 === 1;
  base(inv ? OR : INKC);
  g.save(); g.translate(W / 2, H / 2); g.rotate(lt * 0.12); g.scale(1 + 0.06 * pulse(t, 6), 1 + 0.06 * pulse(t, 6));
  const step = 190, s = 4.4;
  for (let y = -8; y <= 8; y++) for (let x = -6; x <= 6; x++) {
    const ph = Math.sin(lt * 1.5 + x * 0.6 + y * 0.4), col = inv ? INKC : (x + y) % 2 ? OR : CREAM;
    mark(x * step + (y % 2 ? step / 2 : 0), y * step * 0.9, s * (0.75 + 0.25 * ph), { neg: 1, negCol: col, rot: (x + y) % 4 === 0 ? Math.PI : 0 });
  }
  g.restore();
  const g2 = g.createRadialGradient(W / 2, H / 2, 200, W / 2, H / 2, 1200); g2.addColorStop(0, 'rgba(0,0,0,0)'); g2.addColorStop(1, 'rgba(0,0,0,0.65)'); g.fillStyle = g2; g.fillRect(0, 0, W, H);
  text('NEGATIVRAUM', W / 2, 980, { size: 120, weight: 700, align: 'center', color: inv ? INKC : CREAM, ls: 10, glow: inv ? undefined : 'rgba(0,0,0,0.8)' });
}
function sFit(t) {
  const lt = t - bar(8);
  base('#0B0A09');
  const s = 15, k = eIO(seg(lt, 1.2, 3.6)), sep = (1 - k) * 520;
  mark(W / 2, 900 - sep, s, { pos: 1, posCol: CREAM });
  mark(W / 2, 900 + sep, s, { neg: 1, negCol: OR, glow: k > 0.98 ? 40 : 0 });
  text('Zeichen', 80, 300 - sep * 0.2, { size: 46, weight: 600, fam: JM, color: CREAM, alpha: 1 - k });
  text('Negativraum', 80, 1620 + sep * 0.2, { size: 46, weight: 600, fam: JM, color: OR, alpha: 1 - k });
  if (k > 0.98) { text('= ein Ganzes', W / 2, 1480, { size: 70, weight: 700, align: 'center', color: CREAM, alpha: seg(lt, 3.6, 4.0) }); flash(Math.max(0, 0.35 - (lt - 3.6) * 0.8)); }
}
function sTile(t) {
  const lt = t - bar(12);
  base(INKC);
  const k = eBack(seg(lt, 0, 0.6));
  g.save(); g.translate(W / 2, 760); g.scale(k, k); g.shadowColor = 'rgba(255,120,22,0.4)'; g.shadowBlur = 80; g.fillStyle = '#1E1A16'; rr(-260, -260, 520, 520, 116); g.fill(); g.restore();
  mark(W / 2, 760, 12.5 * k, { neg: 1, negCol: OR });
  text('Logo only negative', W / 2, 1200, { size: 64, weight: 700, align: 'center', color: CREAM, alpha: seg(lt, 0.6, 1.0) });
  text('eine Einstellung der neuen loona-designs.de', W / 2, 1270, { size: 36, weight: 500, fam: IS, align: 'center', color: C.soft, alpha: seg(lt, 0.9, 1.3) });
  text('Björn Sellnau', W / 2, 1460, { size: 80, weight: 700, align: 'center', color: CREAM, alpha: seg(lt, 1.4, 1.8) });
  text('loona-designs.de', W / 2, 1550, { size: 46, weight: 600, fam: JM, align: 'center', color: OR, alpha: seg(lt, 1.7, 2.1) });
}
start({
  id: '11', title: 'Negativraum',
  scenes: [[0, sBirth], [4, sPattern], [8, sFit], [12, sTile]],
  trans: { 4: 'logo', 8: 'logo', 12: 'logo' }, tcol: OR, finish: { grain: 0.05, vignette: 0.35 }, beatZoom: [4, 8],
  music: { prog: [[57, 60, 64], [57, 60, 64], [53, 57, 60], [52, 55, 59]], roots: [45, 45, 41, 40], sec: (b) => (b < 4 ? 'intro' : b < 8 ? 'drop' : b < 12 ? 'half' : b < 15 ? 'main' : 'end'), drums: 'house', bass: 'saw8', arp: 'square', arpSteps: 8, arpDrop: 16, cut: 1300, cutDrop: 2400, booms: [4, 8, 12], risers: [4, 12], introPulse: true },
});
