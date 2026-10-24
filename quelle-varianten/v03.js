/* V03 „ARCADE“ — 8-Bit-Jump'n'Run: gezeichnet in 270×480, hochskaliert ohne Glättung. Stationen als Stages, Highscore-Tafel. */
setup({ bpm: 140, bars: 28 });
const LW = 270, LH = 480, LR = mkLayer(LW, LH);
const PX = { sky: '#140C2E', sky2: '#2B1450', hill: '#3B1F6B', hill2: '#5B2A86', ground: '#7A3E1D', grass: '#3CCB5A', ink: '#FFF6D8', yel: '#FFD23F', red: '#FF4D6D', cyan: '#4DE3FF', org: '#FF7816' };
function blit() { g.save(); g.imageSmoothingEnabled = false; g.drawImage(LR.canvas, 0, 0, W, H); g.restore(); }
function ptext(str, x, y, size, col = PX.ink, align = 'left', a = 1) { text(str, Math.round(x), Math.round(y), { size, weight: 700, fam: JM, color: col, align, alpha: a }); }
function pbox(x, y, w, h, col) { g.fillStyle = col; g.fillRect(Math.round(x), Math.round(y), Math.round(w), Math.round(h)); }
// Spielfigur 8×12 (zwei Lauf-Bilder)
const HERO = [
  ['..OOOO..', '.OOOOOO.', '.SSFSFS.', '.SFFFFS.', '..FFFF..', '.BBBBBB.', 'BBBBBBBB', 'F.BBBB.F', '..BBBB..', '..L..L..', '.LL..LL.', '........'],
  ['..OOOO..', '.OOOOOO.', '.SSFSFS.', '.SFFFFS.', '..FFFF..', '.BBBBBB.', 'BBBBBBBB', 'F.BBBB.F', '..BBBB..', '...LL...', '..L..L..', '.L....L.'],
];
const HC = { O: PX.org, S: '#3A2210', F: '#F2C9A0', B: PX.cyan, L: '#2A2A5A' };
function hero(x, y, fr) { HERO[fr].forEach((row, r) => row.split('').forEach((c, i) => { if (c !== '.') pbox(x + i * 2, y + r * 2, 2, 2, HC[c]); })); }
function stars(t, n = 60) { for (let i = 0; i < n; i++) { const x = (hash(i) * LW - t * (4 + hash(i + 2) * 10)) % LW, y = hash(i + 5) * LH * 0.6; pbox((x + LW) % LW, y, 1, 1, hash(i + 9) > 0.5 ? PX.ink : PX.cyan); } }
function negPix(cx, cy, s, col = PX.org) { g.save(); g.imageSmoothingEnabled = false; mark(cx, cy, s, { neg: 1, negCol: col }); g.restore(); }
function sTitle(t) {
  withCtx(LR, () => {
    pbox(0, 0, LW, LH, PX.sky); stars(t);
    negPix(LW / 2, 120, 2.2 * eOut5(seg(t, 0.2, 1.0)));
    ptext('BJÖRN', LW / 2, 200, 34, PX.yel, 'center', seg(t, 0.6, 0.8));
    ptext('SELLNAU', LW / 2, 236, 34, PX.yel, 'center', seg(t, 0.8, 1.0));
    ptext('THE WEB QUEST', LW / 2, 266, 14, PX.cyan, 'center', seg(t, 1.2, 1.4));
    if (Math.floor(t * 2.5) % 2 === 0 && t > 1.8) ptext(t < 4.5 ? 'INSERT COIN' : 'PRESS START', LW / 2, 340, 14, PX.ink, 'center');
    ptext('© 2002–2026 LOONA! DESIGNS', LW / 2, 440, 9, PX.ink, 'center', 0.7);
    ptext(`CREDIT ${t > 4.5 ? 1 : 0}`, LW - 8, 466, 9, PX.ink, 'right', 0.7);
  });
  blit(); scanlines(0.18, 8);
}
const STAGES = KEY;
function sRun(t) {
  const lt = t - bar(4), per = 18 * BAR / STAGES.length, si = clamp(Math.floor(lt / per), 0, STAGES.length - 1), sf = (lt - si * per) / per, st = STAGES[si];
  const scroll = lt * 60;
  withCtx(LR, () => {
    pbox(0, 0, LW, LH, PX.sky); stars(t, 30);
    // Hügel-Parallaxe
    for (let x = 0; x < LW + 40; x += 2) { const hx = x + scroll * 0.2; const h = 40 + 20 * Math.sin(hx * 0.03) + 10 * Math.sin(hx * 0.071); pbox(x, 330 - h, 2, h + 10, PX.hill); }
    for (let x = 0; x < LW + 40; x += 2) { const hx = x + scroll * 0.45; const h = 24 + 14 * Math.sin(hx * 0.05 + 1); pbox(x, 350 - h, 2, h + 10, PX.hill2); }
    // Boden
    const gy = 360; pbox(0, gy, LW, LH - gy, PX.ground); pbox(0, gy, LW, 4, PX.grass);
    for (let x = -((scroll) % 16); x < LW; x += 16) { pbox(x, gy + 10, 8, 4, '#5C2E14'); pbox(x + 8, gy + 24, 8, 4, '#5C2E14'); }
    // Stage-Schild und Fragezeichen-Block
    const signX = LW - sf * (LW + 120) + 40;
    pbox(signX, gy - 52, 4, 52, '#3A2210'); pbox(signX - 30, gy - 78, 64, 30, PX.ink); ptext(String(st.y), signX + 2, gy - 57, 14, '#3A2210', 'center');
    const bxX = 110, bxY = 250, hit = sf > 0.45 && sf < 0.6, bump = hit ? -4 * Math.sin((sf - 0.45) / 0.15 * Math.PI) : 0;
    pbox(bxX, bxY + bump, 20, 20, sf < 0.5 ? PX.yel : '#8A6A20'); if (sf < 0.5) ptext('?', bxX + 10, bxY + 15 + bump, 14, '#3A2210', 'center');
    // Figur: läuft, springt auf den Block
    const jump = sf > 0.3 && sf < 0.62 ? Math.sin((sf - 0.3) / 0.32 * Math.PI) : 0;
    hero(110 + 2, gy - 24 - jump * 80, Math.floor(t * 8) % 2);
    // Gegenstand mit Station
    if (sf > 0.5) {
      const k = seg(sf, 0.5, 0.62), y = bxY - 24 - k * 30;
      pbox(bxX + 4, y, 12, 12, st.k === 'award' ? PX.yel : st.k === 'lead' ? PX.red : PX.cyan);
      const boxY = 70;
      pbox(10, boxY, LW - 20, 92, 'rgba(0,0,0,0.75)'); g.strokeStyle = PX.ink; g.lineWidth = 1; g.strokeRect(10.5, boxY + 0.5, LW - 21, 91);
      ptext(st.k === 'award' ? '★ GOLD STAR!' : st.k === 'lead' ? 'BONUS: TECH LEAD!' : 'ITEM GET!', LW / 2, boxY + 18, 11, st.k === 'award' || st.k === 'lead' ? PX.yel : PX.cyan, 'center', seg(sf, 0.5, 0.55));
      ptext(st.t.toUpperCase(), LW / 2, boxY + 40, fit(st.t.toUpperCase(), LW - 30, 15, 700, JM), PX.ink, 'center', seg(sf, 0.55, 0.6));
      ptext(st.d, LW / 2, boxY + 58, 10, PX.yel, 'center', seg(sf, 0.58, 0.62));
      const sub = st.k === 'award' ? 'BEST OF SWISS WEB 2017 · MOBILE' : st.s.toUpperCase();
      ptext(sub, LW / 2, boxY + 78, fit(sub, LW - 30, 9, 700, JM), PX.ink, 'center', seg(sf, 0.6, 0.66) * 0.85);
    }
    // HUD
    const score = Math.floor((si + clamp(sf * 2)) * 1000 + lt * 37);
    ptext(`SCORE ${String(score).padStart(6, '0')}`, 8, 18, 10, PX.ink);
    ptext(`STAGE ${pad2(si + 1)}-${STAGES.length}`, LW - 8, 18, 10, PX.ink, 'right');
    ptext('♥♥♥', 8, 34, 10, PX.red);
    ptext(`YEAR ${st.y}`, LW - 8, 34, 10, PX.yel, 'right');
    if (hit) { pbox(0, 0, LW, LH, 'rgba(255,255,255,0.15)'); }
  });
  blit(); scanlines(0.18, 8);
}
function sScore(t) {
  const lt = t - bar(22);
  withCtx(LR, () => {
    pbox(0, 0, LW, LH, PX.sky); stars(t, 40);
    ptext('HIGH SCORES', LW / 2, 44, 20, PX.yel, 'center');
    const rows = [['2026', 'MATERNA SE'], ['2024', 'TABLETOP HERALD'], ['2022', 'TECH LEAD BMW'], ['2020', 'CODE-B'], ['2019', 'AUSBILDER'], ['2017', 'GOLD · SWISS WEB'], ['2016', 'OPENBOOKING'], ['2007', 'PIXELTEX'], ['2002', 'AUSBILDUNG']];
    rows.forEach(([y, n], i) => { const a = seg(lt, 0.2 + i * 0.18, 0.3 + i * 0.18); const col = [PX.yel, PX.cyan, PX.red, PX.ink][i % 4]; ptext(`${i + 1}.`, 22, 84 + i * 24, 12, col, 'left', a); ptext(y, 50, 84 + i * 24, 12, col, 'left', a); ptext(n, 96, 84 + i * 24, fit(n, 160, 12, 700, JM), col, 'left', a); });
    const c = 9 - Math.floor(clamp((lt - 3) / 2.4) * 9);
    if (lt > 3 && lt < 5.6) { ptext('CONTINUE?', LW / 2, 340, 16, PX.ink, 'center'); ptext(String(c), LW / 2, 380, 30, PX.red, 'center'); }
    if (lt > 5.6) { negPix(LW / 2, 340, 1.6); ptext('LOONA-DESIGNS.DE', LW / 2, 410, 14, PX.yel, 'center'); ptext('PLAYER 1: BJÖRN SELLNAU', LW / 2, 432, 10, PX.ink, 'center'); }
  });
  blit(); scanlines(0.18, 8);
}
start({
  id: '03', title: 'Arcade',
  scenes: [[0, sTitle], [4, sRun], [22, sScore]],
  trans: { 4: 'pixel', 22: 'pixel' }, tcol: PX.yel, finish: { grain: 0.03, vignette: 0.5 },
  music: { prog: [[64, 67, 71], [60, 64, 67], [62, 66, 69], [59, 62, 66]], roots: [52, 48, 50, 47], sec: (b) => (b < 4 ? 'intro' : b < 22 ? (b < 6 ? 'main' : 'drop') : b < 26 ? 'main' : b < 27 ? 'outro' : 'end'), drums: 'chip', bass: 'square16', arp: 'square', arpSteps: 16, arpDrop: 16, arpGain: 0.03, arpGainDrop: 0.035, arpCut: 6000, padWave: 'square', pad: 0.012, padSoft: 0.015, padBreak: 0.02, cut: 2500, cutDrop: 3000, introPulse: false, endWave: 'square',
    lead: { bars: [6, 7, 10, 11, 14, 15, 18, 19], wave: 'square', gain: 0.045, notes: [[0, 76, 0.5], [0.5, 79, 0.5], [1, 83, 0.5], [1.5, 79, 0.5], [2, 76, 1], [3, 74, 0.5], [3.5, 71, 0.5]] },
    sfx: (A) => { for (let i = 0; i < 10; i++) { const at = bar(4) + (i + 0.5) * (18 * BAR / 10); A.tone(at, 0.08, midi(84), 'square', 0.06, 8000); A.tone(at + 0.08, 0.2, midi(91), 'square', 0.06, 8000); } A.tone(bar(4) - 0.3, 0.12, midi(72), 'square', 0.07, 6000); } },
});
