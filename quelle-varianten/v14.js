/* V14 „NEWS“ — Nachrichtensendung: LIVE-Kennung, Bauchbinden, Story-Karten, Laufband mit allen Stationen. */
setup({ bpm: 120, bars: 22 });
const NB1 = '#0A1A3A', NB2 = '#132B5E', RD = '#E0182D', WH2 = '#FFFFFF';
const TICK = STATIONS.map((s) => `${s.d}: ${s.t}${s.k === 'award' ? ' — Gold, Best of Swiss Web 2017' : s.k === 'lead' ? ' — ab 09/2022 Tech Lead' : ''}`).join('   +++   ') + '   +++   ';
function studio(t) {
  const gr = g.createLinearGradient(0, 0, W, H); gr.addColorStop(0, NB1); gr.addColorStop(1, NB2); g.fillStyle = gr; g.fillRect(0, 0, W, H);
  g.save(); g.globalAlpha = 0.12; for (let i = 0; i < 9; i++) { const y = ((i * 260 + t * 60) % (H + 300)) - 150; g.fillStyle = i % 2 ? '#3D6BD6' : '#1E46A0'; g.beginPath(); g.moveTo(0, y); g.lineTo(W, y - 300); g.lineTo(W, y - 220); g.lineTo(0, y + 80); g.fill(); } g.restore();
  for (let i = 0; i < 40; i++) { g.fillStyle = `rgba(160,190,255,${0.05 + 0.1 * hash(i)})`; g.beginPath(); g.arc(hash(i * 3) * W, hash(i * 5) * H, 2 + hash(i) * 4, 0, 7); g.fill(); }
}
function bug(t) {
  g.fillStyle = RD; rr(60, 80, 170, 64, 8); g.fill(); text('● LIVE', 145, 125, { size: 34, weight: 700, align: 'center', color: WH2, alpha: Math.floor(t * 2) % 2 ? 1 : 0.75 });
  text('LD NEWS', 260, 125, { size: 36, weight: 700, color: WH2, ls: 3 });
  const s = Math.floor(t); text(`12:${pad2(Math.floor(s / 60) + 0)}:${pad2(s % 60)}`, W - 60, 125, { size: 34, weight: 600, fam: JM, align: 'right', color: WH2 });
  mark(W - 110, 1600, 3, { neg: 1, negCol: '#FF7816' });
}
function ticker(t) {
  g.fillStyle = '#FFFFFF'; g.fillRect(0, 1730, W, 90); g.fillStyle = RD; g.fillRect(0, 1730, 220, 90);
  text('TICKER', 110, 1790, { size: 36, weight: 700, align: 'center', color: WH2 });
  g.save(); g.beginPath(); g.rect(220, 1730, W - 220, 90); g.clip();
  const w = measure(TICK, 36, 600, IS), x = 240 - ((t * 190) % w);
  text(TICK, x, 1790, { size: 36, weight: 600, fam: IS, color: '#0A1A3A' }); text(TICK, x + w, 1790, { size: 36, weight: 600, fam: IS, color: '#0A1A3A' });
  g.restore();
}
function lower(title, sub, p, tag = 'EILMELDUNG') {
  const k = eOut5(clamp(p)); if (k <= 0) return;
  g.save(); g.translate((1 - k) * -W, 0);
  g.fillStyle = RD; g.fillRect(0, 1450, 300, 70); text(tag, 30, 1500, { size: 34, weight: 700, color: WH2 });
  g.fillStyle = '#FFFFFF'; g.fillRect(0, 1520, W - 60, 120); text(title, 30, 1598, { size: fit(title, W - 120, 56, 700), weight: 700, color: '#0A1A3A' });
  g.fillStyle = NB1; g.fillRect(0, 1640, W - 160, 64); text(sub, 30, 1684, { size: fit(sub, W - 220, 32, 500, IS), weight: 500, fam: IS, color: WH2 });
  g.restore();
}
const STORIES = [
  ['Seit 2007 im Dienst des Webs', 'Björn Sellnau, Web Engineer aus Berlin', 'oldSite', 'PORTRÄT'],
  ['Gold für den Mobile-Relaunch', 'Best of Swiss Web 2017 · Kategorie Mobile · MySwitzerland.com', null, 'EILMELDUNG'],
  ['Neuer Ausbilder in Berlin', 'AEVO bei der IHK Berlin (03/2019) · Ausbilder 03/2019 – 02/2020', null, 'BILDUNG'],
  ['Tech Lead bei BMW Neuwagensuche', 'Projekt 01/2022 – 05/2023 · Tech Lead ab 09/2022', null, 'WIRTSCHAFT'],
  ['Tabletop Herald App', 'Projekt 04/2024 – 12/2025', null, 'APPS'],
  ['Drei Spiele aus dem Labor', 'Corefall · Covert Operations · SPREE|FALL', 'sf:mech-04-titanfall', 'KULTUR'],
  ['Wechsel zu Materna SE', 'Senior Developer · Public Sector · seit 05/2026', null, 'KARRIERE'],
];
function sNews(t) {
  const lt = t - bar(2), per = 18 * BAR / STORIES.length, i = clamp(Math.floor(Math.max(0, lt) / per), 0, STORIES.length - 1), f = (Math.max(0, lt) - i * per) / per, [ti, sub, img, tag] = STORIES[i];
  studio(t);
  // Story-Karte
  const k = eOut5(clamp(f * 4));
  g.save(); g.translate(W / 2, 760); g.scale(lerp(0.9, 1, k), lerp(0.9, 1, k)); g.globalAlpha = k;
  g.shadowColor = 'rgba(0,0,0,0.5)'; g.shadowBlur = 60; g.fillStyle = '#0B1530'; rr(-480, -420, 960, 840, 26); g.fill(); g.shadowBlur = 0;
  if (img && IMG[img]) imgCover(IMG[img], -480, -420, 960, 600, 26, false, 1.05 + f * 0.05);
  else { g.save(); rr(-480, -420, 960, 600, 26); g.clip(); const gr = g.createLinearGradient(-480, -420, 480, 180); gr.addColorStop(0, '#1C3F8F'); gr.addColorStop(1, '#0B1530'); g.fillStyle = gr; g.fillRect(-480, -420, 960, 600); g.restore(); mark(0, -120, 10, { neg: 1, negCol: '#FF7816', glow: 40 }); }
  g.fillStyle = RD; g.fillRect(-480, 180, 960, 8);
  text(tag, -440, 260, { size: 34, weight: 700, fam: JM, color: '#FF8A97', ls: 4 });
  wrap(ti, -440, 330, 880, 56, { weight: 700, fam: SG, color: WH2 });
  g.restore();
  lower(ti, sub, seg(f, 0.15, 0.3), tag === 'EILMELDUNG' ? 'EILMELDUNG' : 'LD NEWS');
  bug(t); ticker(t);
}
function sOpen(t) {
  studio(t);
  const k = eOut5(seg(t, 0.2, 1.2));
  g.save(); g.translate(W / 2, 860); g.rotate((1 - k) * 2); g.scale(k, k); mark(0, 0, 16, { neg: 1, negCol: '#FF7816', glow: 60 }); g.restore();
  text('LD NEWS', W / 2, 1300, { size: 150, weight: 700, align: 'center', color: WH2, ls: 8, alpha: seg(t, 0.8, 1.3) });
  text('Die Karriere-Ausgabe', W / 2, 1390, { size: 46, weight: 500, fam: IS, align: 'center', color: '#B8C9F0', alpha: seg(t, 1.2, 1.7) });
  bug(t); ticker(t);
}
function sEnd(t) {
  const lt = t - bar(20);
  studio(t);
  text('Mehr dazu:', W / 2, 700, { size: 60, weight: 600, fam: IS, align: 'center', color: '#B8C9F0', alpha: seg(lt, 0.1, 0.4) });
  text('loona-designs.de', W / 2, 830, { size: 96, weight: 700, fam: JM, align: 'center', color: WH2, alpha: seg(lt, 0.3, 0.7) });
  text('linkedin.com/in/bjoern-sellnau', W / 2, 920, { size: 40, weight: 600, fam: JM, align: 'center', color: WH2, alpha: seg(lt, 0.6, 1.0) });
  text('Das Web. Meine Leidenschaft.', W / 2, 1100, { size: fit('Das Web. Meine Leidenschaft.', W - 120, 62, 700), weight: 700, align: 'center', color: '#FFB3BB', alpha: seg(lt, 0.9, 1.3) });
  bug(t); ticker(t);
}
start({
  id: '14', title: 'News',
  scenes: [[0, sOpen], [2, sNews], [20, sEnd]],
  trans: { 2: 'whip', 20: 'whip' }, tcol: RD, finish: { grain: 0.03, vignette: 0.35 },
  music: { prog: [[57, 60, 64], [53, 57, 60], [55, 59, 62], [52, 56, 59]], roots: [45, 41, 43, 40], sec: (b) => (b < 2 ? 'intro' : b < 20 ? 'main' : b < 21 ? 'outro' : 'end'), drums: 'four', bass: 'synth', arp: 'square', arpSteps: 8, arpGain: 0.022, arpPat: [0, 0, 1, 2], padWave: 'sawtooth', pad: 0.02, cut: 2000, introPulse: false,
    sfx: (A) => { [0, 0.2, 0.4].forEach((d, i) => A.tone(0.1 + d, 0.6, midi([76, 79, 84][i]), 'sawtooth', 0.07, 4000, true)); A.boom(0.1); for (let i = 0; i < 7; i++) { const at = bar(2) + i * (18 * BAR / 7) + 0.3; A.tone(at, 0.15, midi(88), 'square', 0.05, 7000); A.tone(at + 0.16, 0.25, midi(84), 'square', 0.05, 7000); } A.boom(bar(20)); } },
});
