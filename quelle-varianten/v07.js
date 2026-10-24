/* V07 „GLITCH“ — Datamosh-Montage: Bild auf jedem halben Schlag, Pixel-Streifen, RGB-Versatz, VHS-Rauschen, Schlagworte. */
setup({ bpm: 136, bars: 28 });
const POOL = ['yayci', 'catt', 'hanno', 'ld2006', 'cattshop', 'oldSite', 'cfTitle', 'cf13', 'cf15', 'cf18', 'coTitle', 'coModes', 'sf:01-pariser-platz', 'sf:07-tv-tower', 'sf:mech-04-titanfall', 'sf:collapse-03-falling', 'sf:09-night', 'deskAurum', 'deskLabs', 'mobHome', 'sf:12-spree', 'cf00', 'sf:field-01-dome', 'deskViola'];
const WORDS = [['BJÖRN', 'SELLNAU'], ['SEIT', '2007'], ['GADMIN 4', 'CMS'], ['GOLD', 'SWISS WEB 17'], ['OPEN', 'BOOKING'], ['AUSBILDER', 'AEVO'], ['TECH', 'LEAD'], ['BMW NEU-', 'WAGENSUCHE'], ['TABLETOP', 'HERALD'], ['CODE-B', '2020–2026'], ['SPREE', '|FALL'], ['MATERNA', 'SE'], ['DAS', 'WEB.']];
const TINT = ['255,59,92', '94,234,212', '255,178,36', '196,181,253'];
function mosh(img, t, seed, amt) {
  if (!img) return;
  imgCover(img, 0, 0, W, H, 0, false, 1.15 + 0.05 * Math.sin(t * 3));
  // Pixel-Sortier-Streifen: eine Zeile senkrecht gezogen
  for (let i = 0; i < 6 * amt; i++) { const x = Math.floor(hash(seed + i) * W), w = 20 + hash(seed + i + 3) * 160, sy = hash(seed + i + 7) * H; g.drawImage(g.canvas, x, sy, w, 2, x, sy, w, H - sy); }
  // Blockverschiebung
  for (let i = 0; i < 10 * amt; i++) { const y = Math.floor(hash(seed + i + 20) * H), h = 20 + hash(seed + i + 40) * 160, dx = (hash(seed + i + 60) - 0.5) * 300 * amt; g.drawImage(g.canvas, 0, y, W, h, dx, y, W, h); }
  // RGB-Versatz
  g.save(); g.globalCompositeOperation = 'screen'; g.globalAlpha = 0.5; g.fillStyle = `rgba(${TINT[seed % 4]},0.25)`; g.fillRect(0, 0, W, H); g.restore();
}
function vhs(t, a = 1) {
  g.save(); g.globalAlpha = 0.12 * a; for (let i = 0; i < 40; i++) { g.fillStyle = hash(i + Math.floor(t * 30)) > 0.5 ? '#fff' : '#000'; g.fillRect(0, hash(i * 3 + Math.floor(t * 30)) * H, W, 1 + hash(i) * 3); } g.restore();
  const y = ((t * 420) % (H + 200)) - 100; g.fillStyle = 'rgba(255,255,255,0.06)'; g.fillRect(0, y, W, 60);
  scanlines(0.15, 4);
}
function slam(w1, w2, t, f, seed) {
  const k = eOut5(clamp(f * 5)), j = (1 - k) * 30 + (hash(Math.floor(t * 24) + seed) - 0.5) * 12;
  const s1 = fit(w1, W - 100, 260, 700, SG, -8), s2 = fit(w2, W - 100, 260, 700, SG, -8);
  g.fillStyle = 'rgba(0,0,0,0.35)'; g.fillRect(0, 680, W, 620);
  rgbText(w1, W / 2 + j, 960, { size: s1, weight: 700, align: 'center', ls: -8 }, 18 * (1 - k) + 6);
  rgbText(w2, W / 2 - j, 960 + s2 * 0.95, { size: s2, weight: 700, align: 'center', ls: -8, color: seed % 2 ? C.amber : C.cyan }, 18 * (1 - k) + 6);
}
function sStatic(t) {
  g.fillStyle = '#000'; g.fillRect(0, 0, W, H);
  for (let i = 0; i < 2600; i++) { const v = hash(i * 7.3 + Math.floor(t * 30) * 13.1); g.fillStyle = `rgba(255,255,255,${v * 0.5})`; g.fillRect(hash(i * 1.7 + Math.floor(t * 30)) * W, hash(i * 2.9 + Math.floor(t * 30) * 0.7) * H, 6, 6); }
  const on = hash(Math.floor(t * 12)) > 0.35 && t > 1.5;
  if (on) mark(W / 2 + (hash(Math.floor(t * 30)) - 0.5) * 30, 900, 18, { neg: 1, negCol: C.deep, glow: 50 });
  if (t > 4) { rgbText('SIGNAL GEFUNDEN', W / 2, 1500, { size: 60, weight: 700, fam: JM, align: 'center' }, 10); }
  vhs(t);
  if (Math.floor(t * 4) % 2 === 0) text('● REC', 70, 140, { size: 40, weight: 700, fam: JM, color: C.red });
  text('PLAY ▶', W - 70, 140, { size: 40, weight: 700, fam: JM, align: 'right' });
}
function sMosh(t) {
  const lt = t - bar(4), hb = Math.floor(lt / (B / 2)), f = (lt % (B / 2)) / (B / 2);
  const img = IMG[POOL[hb % POOL.length]], amt = 0.5 + 0.5 * pulse(t, 6) + (hb % 8 === 7 ? 1 : 0);
  mosh(img, t, hb * 17, amt);
  const wi = Math.floor(lt / (B * 6)), wf = (lt % (B * 6)) / (B * 6);
  if (wi < WORDS.length) slam(WORDS[wi][0], WORDS[wi][1], t, wf, wi);
  if (f < 0.15) flash(0.2 * (1 - f / 0.15));
  vhs(t, 0.8);
  text(`${pad2(Math.floor(lt / 60))}:${pad2(Math.floor(lt % 60))}:${pad2(Math.floor((lt * 30) % 30))}`, 70, 140, { size: 40, weight: 700, fam: JM });
  text('SP ▶▶', W - 70, 140, { size: 40, weight: 700, fam: JM, align: 'right' });
  const ky = KEY[Math.floor(lt / (B * 6)) % KEY.length];
  g.fillStyle = 'rgba(0,0,0,0.7)'; g.fillRect(0, 1640, W, 140);
  text(`${ky.d}  ${ky.t}`, 70, 1725, { size: fit(`${ky.d}  ${ky.t}`, W - 140, 44, 600, JM), weight: 600, fam: JM, color: C.ink });
}
function sOut(t) {
  const lt = t - bar(24);
  g.fillStyle = '#000'; g.fillRect(0, 0, W, H);
  const tear = Math.max(0, 1 - lt * 0.8);
  mark(W / 2, 760, 14, { neg: 1, negCol: C.deep, glow: 60 });
  glitch(tear * 1.5 + pulse(t, 8) * 0.3, Math.floor(t * 30));
  rgbText('Björn Sellnau', W / 2, 1180, { size: 110, weight: 700, align: 'center', ls: -3 }, 8 + tear * 20);
  text('Das Web. Meine Leidenschaft.', W / 2, 1270, { size: 50, weight: 600, fam: IS, align: 'center', color: C.amber, alpha: seg(lt, 0.6, 1) });
  LINKS.forEach((l, i) => text(l, W / 2, 1400 + i * 64, { size: 40, weight: 600, fam: JM, align: 'center', color: C.soft, alpha: seg(lt, 1 + i * 0.3, 1.4 + i * 0.3) }));
  vhs(t, 0.6);
  text('■ STOP', 70, 140, { size: 40, weight: 700, fam: JM });
}
start({
  id: '07', title: 'Glitch',
  scenes: [[0, sStatic], [4, sMosh], [24, sOut]],
  trans: { 4: 'pixel', 24: 'slice' }, tcol: C.red, finish: { grain: 0.12, vignette: 0.5 },
  music: { prog: [[53, 56, 60], [49, 53, 56], [51, 55, 58], [48, 51, 55]], roots: [41, 37, 39, 36], sec: (b) => (b < 4 ? 'intro' : b < 8 ? 'main' : b < 23 ? 'drop' : b < 24 ? 'break' : b < 27 ? 'outro' : 'end'), drums: 'breaks', bass: 'saw8', arp: 'square', arpSteps: 16, arpDrop: 16, arpGainDrop: 0.03, cutDrop: 3400, outroDrums: 'half', introDrums: 'none', booms: [4, 8, 24], risers: [8, 24],
    sfx: (A) => { for (let i = 0; i < 48; i++) A.noise(0.1 + i * B * 0.5 * 0.7, 0.06, 6000, 9000, 0.04 + 0.06 * hash(i), 'highpass'); for (let b = 8; b < 23; b++) A.noise(bar(b) + 3.5 * B, 0.12, 9000, 400, 0.18, 'bandpass', 2); } },
});
