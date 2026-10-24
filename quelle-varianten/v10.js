/* V10 „KOSMOS“ — das Negativ-Logo als Sonne, Stationen als Planeten auf Bahnen, Warp in die Schwarzen Löcher der neuen
   Website, am Ende formen Sterne den Negativraum. */
setup({ bpm: 90, bars: 18 });
const STARS = Array.from({ length: 460 }, (_, i) => [hash(i * 3.1), hash(i * 5.7), 0.3 + hash(i * 7.9) * 1.7]);
function space(t, warp = 0) {
  g.fillStyle = '#02030A'; g.fillRect(0, 0, W, H);
  const neb = [['124,58,237', 0.18, 0.3, 0.3], ['236,72,153', 0.12, 0.75, 0.6], ['20,184,166', 0.1, 0.4, 0.8]];
  neb.forEach(([c, a, x, y], i) => { const gx = W * x + Math.sin(t * 0.1 + i) * 80, gy = H * y; const gr = g.createRadialGradient(gx, gy, 0, gx, gy, 700); gr.addColorStop(0, `rgba(${c},${a})`); gr.addColorStop(1, `rgba(${c},0)`); g.fillStyle = gr; g.fillRect(0, 0, W, H); });
  STARS.forEach(([x, y, s], i) => {
    if (warp > 0) { const dx = x * W - W / 2, dy = y * H - H / 2, z = ((t * 0.6 * warp + hash(i)) % 1); const k = 0.2 + z * 2.2; g.strokeStyle = `rgba(220,230,255,${z})`; g.lineWidth = s; g.beginPath(); g.moveTo(W / 2 + dx * k, H / 2 + dy * k); g.lineTo(W / 2 + dx * (k + 0.25 * warp), H / 2 + dy * (k + 0.25 * warp)); g.stroke(); }
    else { g.fillStyle = `rgba(230,236,255,${0.3 + 0.7 * Math.abs(Math.sin(t * s + i))})`; g.fillRect(x * W, y * H, s, s); }
  });
}
function sun(cx, cy, s, t) {
  const gr = g.createRadialGradient(cx, cy, 0, cx, cy, 30 * s); gr.addColorStop(0, 'rgba(255,170,80,0.55)'); gr.addColorStop(0.4, 'rgba(255,120,22,0.18)'); gr.addColorStop(1, 'rgba(255,120,22,0)'); g.fillStyle = gr; g.fillRect(cx - 30 * s, cy - 30 * s, 60 * s, 60 * s);
  mark(cx, cy, s, { neg: 1, glow: 60 + 30 * pulse(t, 4), negCol: '#FF8A2A' });
}
const PL = KEY.map((s, i) => ({ s, r: 120 + i * 38, sp: 0.5 / Math.sqrt(1 + i), ph: hash(i * 11) * 6.28, sz: 9 + hash(i * 13) * 12, col: ['#5EEAD4', '#C4B5FD', '#FFB224', '#FF7A9C', '#5BD97A', '#9AD0FF'][i % 6] }));
function sSystem(t) {
  space(t);
  const cx = W / 2, cy = 820, tilt = 0.42, per = 12 * BAR / PL.length, sel = clamp(Math.floor(Math.max(0, t - bar(2)) / per), 0, PL.length - 1), f = (Math.max(0, t - bar(2)) % per) / per;
  // Bahnen
  PL.forEach((p, i) => { g.strokeStyle = i === sel && t > bar(2) ? 'rgba(255,190,120,0.6)' : 'rgba(180,190,230,0.14)'; g.lineWidth = i === sel ? 2.5 : 1.2; g.beginPath(); g.ellipse(cx, cy, p.r * 1.15, p.r * 1.15 * tilt, 0, 0, 7); g.stroke(); });
  // Planeten hinter der Sonne zuerst
  const pos = PL.map((p, i) => { const a = p.ph + t * p.sp; return { p, i, x: cx + Math.cos(a) * p.r * 1.15, y: cy + Math.sin(a) * p.r * 1.15 * tilt, back: Math.sin(a) < 0 }; });
  pos.filter((q) => q.back).forEach(planet);
  sun(cx, cy, 7 * eOut5(seg(t, 0.2, 1.6)), t);
  pos.filter((q) => !q.back).forEach(planet);
  function planet(q) { const { p, i, x, y } = q, hi = i === sel && t > bar(2); const r = p.sz * (hi ? 1.8 : 1); const gr = g.createRadialGradient(x - r / 3, y - r / 3, 1, x, y, r); gr.addColorStop(0, '#FFFFFF'); gr.addColorStop(0.35, p.col); gr.addColorStop(1, 'rgba(0,0,0,0.9)'); g.fillStyle = gr; g.beginPath(); g.arc(x, y, r, 0, 7); g.fill(); if (hi) { g.strokeStyle = p.col; g.lineWidth = 2; g.beginPath(); g.arc(x, y, r + 14 + 6 * Math.sin(t * 4), 0, 7); g.stroke(); } }
  text('LD-SYSTEM · 10 HIMMELSKÖRPER', W / 2, 200, { size: 30, weight: 600, fam: JM, align: 'center', color: '#AFC0E8', ls: 4, alpha: seg(t, 0.5, 1) });
  if (t > bar(2)) {
    const q = pos[sel], s = q.p.s, k = eOut5(clamp(f * 3));
    g.save(); g.globalAlpha = k * 0.8; g.strokeStyle = q.p.col; g.lineWidth = 2; g.beginPath(); g.moveTo(q.x, q.y); g.lineTo(q.x, 1380); g.lineTo(W / 2, 1380); g.stroke(); g.restore();
    g.save(); g.globalAlpha = k; g.fillStyle = 'rgba(6,8,20,0.85)'; rr(70, 1400, W - 140, 300, 30); g.fill(); g.strokeStyle = q.p.col; g.lineWidth = 2; g.stroke(); g.restore();
    text(s.d, 110, 1470, { size: 34, weight: 600, fam: JM, color: q.p.col, alpha: k });
    text(s.t, 110, 1560, { size: fit(s.t, W - 220, 72, 700), weight: 700, alpha: k });
    text(s.k === 'award' ? 'Gold · Best of Swiss Web 2017 · Kategorie Mobile' : s.s, 110, 1630, { size: fit(s.k === 'award' ? 'Gold · Best of Swiss Web 2017 · Kategorie Mobile' : s.s, W - 220, 34, 500, IS), weight: 500, fam: IS, color: '#C9D2E8', alpha: k });
    text(`${pad2(sel + 1)} / ${PL.length}`, W - 110, 1470, { size: 30, weight: 600, fam: JM, align: 'right', color: '#AFC0E8', alpha: k });
  }
}
function sWarp(t) {
  const lt = t - bar(14), modes = ['blackhole', 'aurum', 'viola'], i = clamp(Math.floor(lt / BAR), 0, 2), f = (lt % BAR) / BAR;
  space(t, 1);
  const img = seq(heroSrc(modes[i], f * 20));
  if (img) { g.save(); g.beginPath(); g.arc(W / 2, H / 2, 300 + 600 * eOut5(clamp(f * 2)), 0, 7); g.clip(); g.drawImage(img, 0, 0, W, H); g.restore(); }
  text('Die neue Website: Schwarze Löcher als Hero-Animation', W / 2, 1820, { size: fit('Die neue Website: Schwarze Löcher als Hero-Animation', W - 120, 34, 600, IS), weight: 600, fam: IS, align: 'center', color: '#DDE5FF' });
}
const CONST = (() => { const pts = []; let i = 0; while (pts.length < 420 && i < 40000) { const u = 8 + hash(i * 1.37) * 28, v = 11 + hash(i * 2.11 + 5) * 24; if (inNeg(u, v)) pts.push([u, v]); i++; } return pts; })();
function sConst(t) {
  const lt = t - bar(17) + BAR; // beginnt eine Phase vorher (sWarp-Ende)
  space(t);
  const k = eIO(seg(lt, 0, 1.6)), s = 17, cx = W / 2, cy = 820;
  CONST.forEach(([u, v], i) => { const [sx, sy] = STARS[i]; const x = lerp(sx * W, cx + (u - 22) * s, k), y = lerp(sy * H, cy + (v - 23) * s, k); g.fillStyle = `rgba(255,${190 + 40 * hash(i)},140,${0.6 + 0.4 * Math.sin(t * 3 + i)})`; g.beginPath(); g.arc(x, y, 2.5 + 1.5 * hash(i + 4), 0, 7); g.fill(); });
  if (k > 0.8) { g.save(); g.globalAlpha = (k - 0.8) * 5 * 0.5; g.strokeStyle = 'rgba(255,190,120,0.5)'; g.lineWidth = 1; for (let i = 0; i < CONST.length; i++) { const [a, b] = [CONST[i], CONST[(i * 7 + 3) % CONST.length]]; if (Math.hypot(a[0] - b[0], a[1] - b[1]) < 2.2) { g.beginPath(); g.moveTo(cx + (a[0] - 22) * s, cy + (a[1] - 23) * s); g.lineTo(cx + (b[0] - 22) * s, cy + (b[1] - 23) * s); g.stroke(); } } g.restore(); }
  text('Björn Sellnau', W / 2, 1360, { size: 96, weight: 700, align: 'center', alpha: seg(lt, 1.4, 1.9) });
  text('Das Web. Meine Leidenschaft.', W / 2, 1440, { size: 44, weight: 500, fam: IS, align: 'center', color: '#FFC68A', alpha: seg(lt, 1.7, 2.2) });
  LINKS.forEach((l, i) => text(l, W / 2, 1560 + i * 60, { size: 36, weight: 600, fam: JM, align: 'center', color: '#AFC0E8', alpha: seg(lt, 2.1 + i * 0.3, 2.5 + i * 0.3) }));
}
start({
  id: '10', title: 'Kosmos',
  scenes: [[0, sSystem], [14, sWarp], [16, sConst]],
  trans: { 14: 'zoom', 16: 'iris' }, tcol: '#FFB070', finish: { grain: 0.05, vignette: 0.55 },
  seqAt: (t, TD) => { if (t < bar(14) - TD || t > bar(17) + TD) return []; const lt = Math.max(0, t - bar(14)), i = clamp(Math.floor(lt / BAR), 0, 2), f = (lt % BAR) / BAR; return [heroSrc(['blackhole', 'aurum', 'viola'][i], f * 20)]; },
  music: { prog: [[57, 60, 64, 71], [53, 57, 60, 67], [48, 52, 55, 62], [55, 59, 62, 69]], roots: [45, 41, 48, 43], sec: (b) => (b < 2 ? 'intro' : b < 6 ? 'half' : b < 14 ? 'main' : b < 16 ? 'drop' : b < 17 ? 'outro' : 'end'), drums: 'half', bass: 'sub', arp: 'sine', arpSteps: 8, arpDrop: 16, arpGain: 0.05, arpPat: [0, 2, 1, 3], arpLen: 1.8, arpHalf: true, padWave: 'sawtooth', pad: 0.02, padSoft: 0.028, cut: 1200, cutDrop: 2400, verb: 0.55, verbLen: 3.5, introPulse: false, booms: [2, 14, 16], risers: [14] },
});
