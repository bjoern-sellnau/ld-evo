/* V13 „RPG“ — Charakterbogen, Fertigkeitenbaum, Questlog und Errungenschaften im Fantasy-Stil (Stufe = Jahre im Web). */
setup({ bpm: 120, bars: 24 });
const GOLD = '#E8C36A', GOLD2 = '#9A7A2E', PARCH = '#1B140E', PARCH2 = '#2A1F15', TXT = '#F3E6C8';
function frame(t, title) {
  g.fillStyle = '#0D0A07'; g.fillRect(0, 0, W, H);
  const gr = g.createRadialGradient(W / 2, H / 2, 200, W / 2, H / 2, 1200); gr.addColorStop(0, 'rgba(120,80,30,0.25)'); gr.addColorStop(1, 'rgba(0,0,0,0)'); g.fillStyle = gr; g.fillRect(0, 0, W, H);
  g.fillStyle = PARCH; rr(40, 40, W - 80, H - 80, 24); g.fill();
  g.strokeStyle = GOLD; g.lineWidth = 6; rr(40, 40, W - 80, H - 80, 24); g.stroke(); g.strokeStyle = GOLD2; g.lineWidth = 2; rr(58, 58, W - 116, H - 116, 18); g.stroke();
  [[58, 58], [W - 58, 58], [58, H - 58], [W - 58, H - 58]].forEach(([x, y]) => { g.save(); g.translate(x, y); g.rotate(Math.PI / 4); g.fillStyle = GOLD; g.fillRect(-14, -14, 28, 28); g.restore(); });
  g.fillStyle = PARCH2; rr(160, 90, W - 320, 100, 50); g.fill(); g.strokeStyle = GOLD; g.lineWidth = 3; g.stroke();
  text(title, W / 2, 160, { size: 46, weight: 700, align: 'center', color: GOLD, ls: 8 });
}
function bar2(x, y, w, p, col) { g.fillStyle = 'rgba(0,0,0,0.5)'; rr(x, y, w, 26, 13); g.fill(); g.fillStyle = col; rr(x, y, Math.max(26, w * clamp(p)), 26, 13); g.fill(); g.strokeStyle = GOLD2; g.lineWidth = 2; rr(x, y, w, 26, 13); g.stroke(); }
function sSheet(t) {
  frame(t, 'CHARAKTER');
  g.save(); g.fillStyle = '#120D09'; g.beginPath(); g.arc(W / 2, 470, 190, 0, 7); g.fill(); g.strokeStyle = GOLD; g.lineWidth = 8; g.stroke(); g.restore();
  mark(W / 2, 470, 10 * eBack(seg(t, 0.3, 1.0)), { neg: 1, negCol: C.deep, glow: 40 });
  text('Björn Sellnau', W / 2, 760, { size: 92, weight: 700, align: 'center', color: TXT, alpha: seg(t, 0.8, 1.2) });
  const rows = [['Klasse', 'Web Engineer'], ['Stufe', '18+ (Jahre im Web)'], ['Gilde', 'Materna SE'], ['Rang', 'Senior Developer'], ['Heimat', 'Berlin'], ['Seit', '01.09.2007']];
  rows.forEach(([k, v], i) => { const a = seg(t, 1.4 + i * 0.25, 1.8 + i * 0.25), y = 900 + i * 92; g.fillStyle = `rgba(232,195,106,${0.08 * a})`; g.fillRect(120, y - 56, W - 240, 76); text(k, 150, y, { size: 40, weight: 600, fam: JM, color: GOLD, alpha: a }); text(v, W - 150, y, { size: 42, weight: 600, fam: IS, align: 'right', color: TXT, alpha: a }); });
  text('Erfahrung', 120, 1520, { size: 36, weight: 600, fam: JM, color: GOLD, alpha: seg(t, 3.2, 3.5) });
  bar2(120, 1540, W - 240, seg(t, 3.4, 6.5) * 0.92, '#7A4FD8');
  text('Ausdauer', 120, 1640, { size: 36, weight: 600, fam: JM, color: GOLD, alpha: seg(t, 3.5, 3.8) });
  bar2(120, 1660, W - 240, seg(t, 3.6, 6.5), '#2FAE6A');
}
const TREE = [['React', 0, 0], ['Next.js', -1, 1], ['React Native', 1, 1], ['TypeScript', 0, 2], ['Node.js', -1, 3], ['GraphQL', 1, 3], ['Redux', -1.6, 4], ['Jest', 0, 4], ['Stripe', 1.6, 4], ['MongoDB', -1, 5], ['Postgres', 1, 5], ['ColdFusion', -1.6, 6], ['WebGL', 0, 6], ['Claude Code', 1.6, 6]];
const EDGES = [[0, 1], [0, 2], [1, 3], [2, 3], [3, 4], [3, 5], [4, 6], [4, 7], [5, 7], [5, 8], [6, 9], [7, 9], [7, 10], [8, 10], [9, 11], [9, 12], [10, 12], [10, 13]];
function sTree(t) {
  const lt = t - bar(4);
  frame(t, 'FERTIGKEITEN');
  const P = (i) => [W / 2 + TREE[i][1] * 250, 330 + TREE[i][2] * 215], unl = (i) => seg(lt, 0.3 + i * B * 1.05, 0.6 + i * B * 1.05);
  EDGES.forEach(([a, b]) => { const [x1, y1] = P(a), [x2, y2] = P(b), p = unl(b); g.strokeStyle = p > 0 ? `rgba(232,195,106,${0.3 + 0.6 * p})` : 'rgba(232,195,106,0.12)'; g.lineWidth = p > 0 ? 4 : 2; g.beginPath(); g.moveTo(x1, y1); g.lineTo(lerp(x1, x2, Math.max(0.0001, p)), lerp(y1, y2, Math.max(0.0001, p))); g.stroke(); });
  TREE.forEach(([n], i) => {
    const [x, y] = P(i), p = unl(i), on = p > 0.99;
    g.save(); if (on) { g.shadowColor = C.deep; g.shadowBlur = 30; } g.fillStyle = on ? '#3A2410' : '#16110C'; g.beginPath(); g.arc(x, y, 58, 0, 7); g.fill(); g.strokeStyle = on ? GOLD : GOLD2; g.lineWidth = on ? 5 : 2; g.stroke(); g.restore();
    if (on) mark(x, y - 6, 1.6, { neg: 1, negCol: C.deep }); else text('🔒', x, y + 14, { size: 36, weight: 400, fam: IS, align: 'center', alpha: 0.5 });
    text(n, x, y + 96, { size: fit(n, 230, 30, 600, IS), weight: 600, fam: IS, align: 'center', color: on ? TXT : 'rgba(243,230,200,0.35)' });
    if (p > 0 && p < 1) burst(x, y, p * 0.8, i * 13, 24, '255,200,120');
  });
}
const QUESTS = STATIONS.filter((s) => !['Covert Operations Tournament', 'Computer Handel Yayci', 'CATT Service · Hannoback', 'Berlin', 'Labs', 'Stripe', 'StrongLoop / IBM', 'Adobe Certified Expert', 'IHK Berlin'].includes(s.t));
function sQuest(t) {
  const lt = t - bar(12), per = 8 * BAR / QUESTS.length, n = Math.min(QUESTS.length, Math.floor(lt / per) + 1), cur = n - 1, f = (lt - cur * per) / per;
  frame(t, 'QUESTLOG');
  const off = Math.max(0, n - 9) * 150;
  g.save(); g.beginPath(); g.rect(60, 210, W - 120, H - 420); g.clip(); g.translate(0, -off + (n > 9 ? (1 - eOut5(clamp(f * 3))) * 150 : 0));
  for (let i = 0; i < n; i++) {
    const s = QUESTS[i], y = 250 + i * 150, a = i === cur ? eOut5(clamp(f * 3)) : 1, big = s.k === 'award' || s.k === 'lead';
    g.globalAlpha = a; g.fillStyle = big ? 'rgba(232,195,106,0.16)' : 'rgba(255,255,255,0.04)'; rr(90, y, W - 180, 130, 16); g.fill(); g.strokeStyle = big ? GOLD : GOLD2; g.lineWidth = 2; g.stroke();
    text('✔', 130, y + 82, { size: 50, weight: 700, fam: IS, color: '#5BD97A' });
    text(s.t, 200, y + 60, { size: fit(s.t, W - 480, 42, 700), weight: 700, color: TXT });
    text(s.k === 'award' ? 'Gold · Best of Swiss Web 2017 · Kategorie Mobile' : s.s, 200, y + 104, { size: fit(s.k === 'award' ? 'Gold · Best of Swiss Web 2017 · Kategorie Mobile' : s.s, W - 480, 28, 500, IS), weight: 500, fam: IS, color: 'rgba(243,230,200,0.7)' });
    text(s.d, W - 120, y + 60, { size: 26, weight: 600, fam: JM, align: 'right', color: GOLD });
    g.globalAlpha = 1;
  }
  g.restore();
  const s = QUESTS[cur];
  if ((s.k === 'award' || s.k === 'lead') && f > 0.2 && f < 0.95) { const k = eBack(seg(f, 0.2, 0.35)); g.save(); g.translate(W / 2, 1720); g.scale(k, k); g.fillStyle = '#3A2410'; rr(-420, -70, 840, 120, 20); g.fill(); g.strokeStyle = GOLD; g.lineWidth = 5; g.stroke(); text(s.k === 'award' ? 'LEGENDÄRE QUEST: GOLD!' : 'NEUER TITEL: TECH LEAD', 0, 12, { size: 46, weight: 700, align: 'center', color: GOLD }); g.restore(); }
  else text('Quest abgeschlossen', W / 2, 1730, { size: 34, weight: 600, fam: JM, align: 'center', color: 'rgba(243,230,200,0.6)', alpha: clamp(f * 4) });
}
function sAch(t) {
  const lt = t - bar(20);
  frame(t, 'ERRUNGENSCHAFTEN');
  CERTS.forEach(([n, m], i) => { const x = 110 + (i % 3) * 300, y = 300 + Math.floor(i / 3) * 330, k = eBack(seg(lt, 0.1 + i * 0.12, 0.4 + i * 0.12)); g.save(); g.globalAlpha = clamp(k); g.translate(x + 130, y + 110); g.scale(k, k); g.fillStyle = '#2A1F15'; g.beginPath(); for (let j = 0; j < 6; j++) { const a = j * Math.PI / 3 - Math.PI / 2; g.lineTo(Math.cos(a) * 100, Math.sin(a) * 100); } g.closePath(); g.fill(); g.strokeStyle = i < 3 ? C.deep : GOLD; g.lineWidth = 5; g.stroke(); text(m.split(' · ')[0], 0, 10, { size: fit(m.split(' · ')[0], 170, 34, 700), weight: 700, align: 'center', color: GOLD }); text(n, 0, 150, { size: fit(n, 280, 22, 600, IS), weight: 600, fam: IS, align: 'center', color: TXT }); g.restore(); });
  text('Neues Abenteuer: Materna SE', W / 2, 1420, { size: 54, weight: 700, align: 'center', color: TXT, alpha: seg(lt, 1.8, 2.2) });
  text('loona-designs.de', W / 2, 1520, { size: 48, weight: 600, fam: JM, align: 'center', color: GOLD, alpha: seg(lt, 2.2, 2.6) });
  text('linkedin.com/in/bjoern-sellnau', W / 2, 1590, { size: 34, weight: 600, fam: JM, align: 'center', color: 'rgba(243,230,200,0.7)', alpha: seg(lt, 2.4, 2.8) });
}
start({
  id: '13', title: 'RPG',
  scenes: [[0, sSheet], [4, sTree], [12, sQuest], [20, sAch]],
  trans: { 4: 'iris', 12: 'iris', 20: 'iris' }, tcol: GOLD, finish: { grain: 0.05, vignette: 0.55 },
  music: { prog: [[62, 65, 69], [58, 62, 65], [60, 64, 67], [57, 61, 64]], roots: [50, 46, 48, 45], sec: (b) => (b < 2 ? 'intro' : b < 4 ? 'half' : b < 20 ? 'main' : b < 23 ? 'drop' : 'end'), drums: 'chip', bass: 'square16', arp: 'triangle', arpSteps: 8, arpDrop: 16, arpGain: 0.05, arpPat: [0, 1, 2, 1, 2, 0], padWave: 'triangle', pad: 0.03, padSoft: 0.035, cut: 2600, introPulse: false,
    lead: { bars: [12, 13, 16, 17, 20, 21], wave: 'square', gain: 0.04, notes: [[0, 74, 1], [1, 77, 0.5], [1.5, 76, 0.5], [2, 74, 1], [3, 69, 1]] },
    sfx: (A) => { for (let i = 0; i < TREE.length; i++) A.tone(bar(4) + 0.6 + i * B * 1.05, 0.25, midi(79 + (i % 5)), 'triangle', 0.05, 6000, true); A.chime(bar(20), [72, 76, 79, 84]); } },
});
