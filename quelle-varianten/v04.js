/* V04 „OUTRUN“ — Synthwave: Sonnenuntergang, Gitterstraße, Chrom-Schrift, Stationen als Autobahnschilder. */
setup({ bpm: 100, bars: 20 });
const HZ = 980; // Horizont
function sky(t) {
  const gr = g.createLinearGradient(0, 0, 0, HZ); gr.addColorStop(0, '#0B0420'); gr.addColorStop(0.55, '#3A0F5C'); gr.addColorStop(0.85, '#B0287A'); gr.addColorStop(1, '#FF7A59');
  g.fillStyle = gr; g.fillRect(0, 0, W, HZ);
  for (let i = 0; i < 70; i++) { g.fillStyle = `rgba(255,255,255,${0.2 + 0.6 * hash(i + 3) * (0.5 + 0.5 * Math.sin(t * 2 + i))})`; g.fillRect(hash(i) * W, hash(i + 1) * HZ * 0.55, 2, 2); }
  // Sonne mit Streifen
  const sy = HZ - 150, R = 300;
  g.save(); g.beginPath(); g.arc(W / 2, sy, R, 0, 7); g.clip();
  const sg = g.createLinearGradient(0, sy - R, 0, sy + R); sg.addColorStop(0, '#FFE66B'); sg.addColorStop(0.5, '#FF8A3D'); sg.addColorStop(1, '#FF2E88'); g.fillStyle = sg; g.fillRect(W / 2 - R, sy - R, 2 * R, 2 * R);
  g.fillStyle = '#3A0F5C'; for (let i = 0; i < 8; i++) { const y = sy + 20 + i * 34 + ((t * 30) % 34), h = 4 + i * 2.2; g.fillRect(W / 2 - R, y, 2 * R, h); }
  g.restore();
  g.save(); g.shadowColor = '#FF2E88'; g.shadowBlur = 120; g.globalAlpha = 0.35; g.fillStyle = '#FF2E88'; g.beginPath(); g.arc(W / 2, sy, R, 0, 7); g.fill(); g.restore();
  // Berge
  g.fillStyle = '#1A0730'; g.beginPath(); g.moveTo(0, HZ);
  for (let x = 0; x <= W; x += 20) g.lineTo(x, HZ - 60 - 90 * Math.abs(Math.sin(x * 0.006 + 1)) - 40 * Math.abs(Math.sin(x * 0.021)));
  g.lineTo(W, HZ); g.fill();
}
function road(t, speed = 1) {
  g.fillStyle = '#12021F'; g.fillRect(0, HZ, W, H - HZ);
  g.save(); g.strokeStyle = '#FF2EC4'; g.shadowColor = '#FF2EC4'; g.shadowBlur = 16; g.lineWidth = 3;
  for (let i = -14; i <= 14; i++) { g.beginPath(); g.moveTo(W / 2 + i * 12, HZ); g.lineTo(W / 2 + i * 260, H); g.stroke(); }
  const ph = (t * speed * 1.3) % 1;
  for (let k = 0; k < 14; k++) { const z = (k + 1 - ph) / 14, y = HZ + (H - HZ) * Math.pow(z, 2.3); g.globalAlpha = clamp(z * 1.6); g.beginPath(); g.moveTo(0, y); g.lineTo(W, y); g.stroke(); }
  g.restore();
  const hg = g.createLinearGradient(0, HZ - 30, 0, HZ + 40); hg.addColorStop(0, 'rgba(255,46,196,0)'); hg.addColorStop(0.5, 'rgba(255,120,200,0.55)'); hg.addColorStop(1, 'rgba(255,46,196,0)'); g.fillStyle = hg; g.fillRect(0, HZ - 30, W, 70);
}
function chrome(str, x, y, size, o = {}) {
  g.save(); g.font = font(size, 700, SG); g.textAlign = o.align ?? 'center'; if ('letterSpacing' in g) g.letterSpacing = (o.ls ?? 0) + 'px';
  const gr = g.createLinearGradient(0, y - size * 0.8, 0, y + size * 0.1); gr.addColorStop(0, '#E8F6FF'); gr.addColorStop(0.48, '#6FB6FF'); gr.addColorStop(0.52, '#1B1340'); gr.addColorStop(0.75, '#B98CFF'); gr.addColorStop(1, '#FFE3F6');
  g.globalAlpha = o.alpha ?? 1; g.lineWidth = o.lw ?? 6; g.strokeStyle = o.stroke ?? '#FF2EC4'; g.shadowColor = '#FF2EC4'; g.shadowBlur = 30; g.strokeText(str, x, y); g.shadowBlur = 0; g.fillStyle = gr; g.fillText(str, x, y);
  g.restore();
}
function neon(str, x, y, size, col = '#4DF3FF', a = 1, align = 'center', fam = SG, w = 700) { text(str, x, y, { size, weight: w, fam, color: '#FFFFFF', align, alpha: a, glow: col, glowSize: 26 }); }
function sIntro(t) {
  sky(t); road(t, 0.6 + t * 0.1);
  const k1 = eOut5(seg(t, 0.4, 1.4)), k2 = eOut5(seg(t, 0.9, 1.9));
  chrome('BJÖRN', W / 2, 420 + (1 - k1) * -300, 210, { alpha: k1, ls: 6 });
  chrome('SELLNAU', W / 2, 640 + (1 - k2) * -300, fit('SELLNAU', W - 100, 210, 700, SG, 6), { alpha: k2, ls: 6 });
  neon('Web Engineer · Berlin', W / 2, 760, 52, '#4DF3FF', seg(t, 2.2, 2.8), 'center', IS, 600);
  mark(W / 2, 1500, 7 * eOut5(seg(t, 3.0, 4.0)), { neg: 1, negCol: '#FFE66B', glow: 50 });
  text('INSERT TAPE ▶ 2002 – 2026', W / 2, 1720, { size: 34, weight: 600, fam: JM, align: 'center', color: '#FFB3E6', alpha: seg(t, 4, 4.4) * (Math.floor(t * 2) % 2 ? 1 : 0.6) });
}
const SIGNS = KEY;
function sign(s, z, side, a) {
  const sc = 0.15 + 1.35 * z * z, x = W / 2 + side * (60 + 760 * z * z), y = HZ + (H - HZ) * Math.pow(z, 2.3) - 520 * sc;
  const w = 600 * sc, h = 330 * sc;
  g.save(); g.globalAlpha = a; g.translate(x, y);
  g.fillStyle = '#2B2B33'; g.fillRect(-8 * sc, h / 2, 16 * sc, 520 * sc);
  g.fillStyle = '#0B6B3A'; rr(-w / 2, -h / 2, w, h, 22 * sc); g.fill(); g.strokeStyle = '#F2F5FA'; g.lineWidth = 6 * sc; rr(-w / 2 + 10 * sc, -h / 2 + 10 * sc, w - 20 * sc, h - 20 * sc, 16 * sc); g.stroke();
  text(s.d, 0, -h / 2 + 80 * sc, { size: 46 * sc, weight: 700, fam: JM, align: 'center', color: '#FFE66B' });
  text(s.t, 0, -h / 2 + 175 * sc, { size: fit(s.t, w - 70 * sc, 70 * sc, 700, IS), weight: 700, fam: IS, align: 'center', color: '#F2F5FA' });
  text(s.k === 'award' ? 'GOLD · Best of Swiss Web 2017' : s.s, 0, -h / 2 + 250 * sc, { size: fit(s.k === 'award' ? 'GOLD · Best of Swiss Web 2017' : s.s, w - 70 * sc, 36 * sc, 600, IS), weight: 600, fam: IS, align: 'center', color: '#CFE9DA' });
  g.restore();
}
function sDrive(t) {
  const lt = t - bar(4), per = 13 * BAR / SIGNS.length;
  sky(t); road(t, 1.4);
  for (let i = SIGNS.length - 1; i >= 0; i--) { const z = (lt - i * per) / (per * 1.6); if (z <= 0 || z >= 1.15) continue; sign(SIGNS[i], Math.min(z, 1.15), i % 2 ? 1 : -1, clamp(z * 4) * (1 - seg(z, 1.0, 1.15))); }
  // aktuelles Schild groß unten lesbar
  const i = clamp(Math.floor(lt / per), 0, SIGNS.length - 1), s = SIGNS[i], f = (lt - i * per) / per, k = eOut5(clamp(f * 3));
  g.fillStyle = 'rgba(18,2,31,0.72)'; g.fillRect(0, 1560, W, 260);
  neon(s.t, W / 2, 1660, fit(s.t, W - 120, 74, 700, SG), s.k === 'award' ? '#FFE66B' : '#FF2EC4', k);
  neon(s.d, W / 2, 1740, 40, '#4DF3FF', k, 'center', JM, 600);
  chrome('NEXT EXIT', 120, 220, 54, { align: 'left', lw: 3 });
  neon(`${pad2(i + 1)} / ${SIGNS.length}`, W - 90, 210, 40, '#4DF3FF', 1, 'right', JM, 600);
}
function sExit(t) {
  const lt = t - bar(17);
  sky(t); road(t, 0.5);
  chrome('EXIT', W / 2, 420, 220, { ls: 10, alpha: eOut5(seg(lt, 0, 0.6)) });
  neon('loona-designs.de', W / 2, 560, 72, '#FFE66B', seg(lt, 0.5, 1.0), 'center', JM, 700);
  neon('Das Web. Meine Leidenschaft.', W / 2, 1600, fit('Das Web. Meine Leidenschaft.', W - 120, 64, 700), '#FF2EC4', seg(lt, 1.0, 1.5));
  neon('Björn Sellnau · Senior Developer · Materna SE', W / 2, 1690, fit('Björn Sellnau · Senior Developer · Materna SE', W - 120, 38, 600, IS), '#4DF3FF', seg(lt, 1.4, 1.9), 'center', IS, 600);
  mark(W / 2, 1450, 4, { neg: seg(lt, 1.8, 2.2), negCol: '#FFE66B', glow: 40 });
}
start({
  id: '04', title: 'Outrun',
  scenes: [[0, sIntro], [4, sDrive], [17, sExit]],
  trans: { 4: 'zoom', 17: 'iris' }, tcol: '#FF2EC4', finish: { grain: 0.06, vignette: 0.5 },
  music: { prog: [[57, 60, 64], [53, 57, 60], [48, 52, 55], [55, 59, 62]], roots: [45, 41, 48, 43], sec: (b) => (b < 4 ? 'intro' : b < 8 ? 'main' : b < 16 ? 'drop' : b < 18 ? 'main' : b < 19 ? 'outro' : 'end'), drums: 'breaks', bass: 'saw8', arp: 'sawtooth', arpSteps: 16, arpDrop: 16, arpGain: 0.02, arpGainDrop: 0.026, arpLen: 1.6, arpCut: 2400, pad: 0.026, padSoft: 0.035, cut: 1800, cutDrop: 2600, verb: 0.4, verbLen: 3,
    lead: { bars: [8, 9, 10, 11, 12, 13, 14, 15], wave: 'sawtooth', gain: 0.04, cut: 3000, notes: [[0, 76, 1.5], [1.5, 74, 0.5], [2, 72, 1], [3, 69, 1]] }, booms: [4, 8, 17], risers: [8, 17] },
});
