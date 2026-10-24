/* V05 „ABFLUG“ — die Karriere als Split-Flap-Abflugtafel: Zeit = Jahr, Ziel = Station, Status. Gong am Anfang und Ende. */
setup({ bpm: 112, bars: 24 });
const BOARD = '#0D0F14', YEL = '#FFD84D';
const TW = 40, TH = 62, GAP = 4;
function hall(t) {
  g.fillStyle = '#05070B'; g.fillRect(0, 0, W, H);
  const gr = g.createLinearGradient(0, 0, 0, H); gr.addColorStop(0, 'rgba(255,216,77,0.06)'); gr.addColorStop(1, 'rgba(0,0,0,0)'); g.fillStyle = gr; g.fillRect(0, 0, W, H);
}
function header(t, title, sub) {
  g.fillStyle = YEL; g.fillRect(40, 120, W - 80, 120);
  text('✈', 80, 210, { size: 76, weight: 700, fam: IS, color: '#111' });
  text(title, 180, 200, { size: 64, weight: 700, color: '#111', ls: 4 });
  text(sub, W - 80, 200, { size: 34, weight: 600, fam: JM, align: 'right', color: '#111' });
}
const SHORT = { 'Covert Operations Tournament': 'COVERT OPS', 'Computer Handel Yayci': 'YAYCI ONLINESHOP', 'Loona! Designs „ld2006“': 'LOONA LD2006', 'PIXELTEX GmbH': 'PIXELTEX', 'MySwitzerland.com Mobile': 'MYSWITZERLAND', 'Azubi-Recruiting': 'AZUBI-RECRUITING', 'Tabletop Herald App': 'TABLETOP HERALD' };
const STAT = (s) => (s.t === 'Materna SE' ? 'AN BORD' : s.k === 'award' ? 'GOLD' : 'GELANDET');
function row(s, i, y, lt, t0, tick) {
  const time = String(s.y), dest = (SHORT[s.t] ?? s.t.toUpperCase()).slice(0, 17).padEnd(17, ' '), st = STAT(s);
  flapRow(time, 40, y, TW, TH, GAP, t0, lt, i * 13, tick, { col: YEL });
  flapRow(dest, 40 + 5 * (TW + GAP), y, TW, TH, GAP, t0 + 0.15, lt, i * 29, tick);
  const p = seg(lt, t0 + 0.7, t0 + 1.0);
  g.save(); g.globalAlpha = p; g.fillStyle = st === 'AN BORD' ? '#1D9E54' : st === 'GOLD' ? '#B8860B' : '#2A2E38'; rr(40, y + TH + 10, W - 80, 44, 8); g.fill(); g.restore();
  text(`${s.d}  ·  ${s.s}`, 56, y + TH + 42, { size: fit(`${s.d}  ·  ${s.s}`, W - 300, 28, 500, IS), weight: 500, fam: IS, color: '#DDE3EC', alpha: p });
  text(st, W - 56, y + TH + 42, { size: 28, weight: 700, fam: JM, align: 'right', color: st === 'GELANDET' ? '#9AA7BA' : '#FFFFFF', alpha: p });
}
function board(t, list, b0, title, sub, perRow) {
  const lt = t - bar(b0), tick = Math.floor(t * 30);
  hall(t); header(t, title, sub);
  text('ZEIT', 40, 300, { size: 26, weight: 600, fam: JM, color: '#9AA7BA' }); text('ZIEL', 40 + 5 * (TW + GAP), 300, { size: 26, weight: 600, fam: JM, color: '#9AA7BA' });
  list.forEach((s, i) => row(s, i, 330 + i * 140, lt, 0.2 + i * perRow, tick));
  const clock = new Date(Date.UTC(2026, 9, 24, 10, 0, Math.floor(t)));
  text(`${pad2(clock.getUTCHours() + 2)}:${pad2(clock.getUTCMinutes())}`, W - 60, 1840, { size: 40, weight: 700, fam: JM, align: 'right', color: YEL });
  mark(90, 1820, 2.6, { neg: 1, negCol: YEL });
  text('loona! designs · Berlin', 150, 1832, { size: 28, weight: 600, fam: JM, color: '#9AA7BA' });
}
const P1 = STATIONS.filter((s) => ['Ausbildung', 'Covert Operations Tournament', 'Computer Handel Yayci', 'Loona! Designs „ld2006“', 'PIXELTEX GmbH', 'Gadmin 4 CMS', 'Berlin', 'MySwitzerland.com Mobile', 'OpenBooking', 'Azubi-Recruiting'].includes(s.t));
const P2 = STATIONS.filter((s) => ['IHK Berlin', 'Ausbilder', 'Code-b', 'BMW Neuwagensuche', 'Tabletop Herald App', 'Stripe', 'Labs', 'Materna SE'].includes(s.t));
function sB1(t) { board(t, P1, 0, 'ABFLUG', '2002 – 2018', B * 3); }
function sB2(t) { board(t, P2, 10, 'ABFLUG', '2019 – 2026', B * 3.6); }
function sLast(t) {
  const lt = t - bar(19), tick = Math.floor(t * 30);
  hall(t); header(t, 'LETZTER AUFRUF', 'GATE LD');
  flapRow('LOONA-DESIGNS', 40, 520, 58, 92, 6, 0.2, lt, 999, tick, { col: YEL });
  flapRow('.DE', 40, 640, 58, 92, 6, 0.6, lt, 777, tick, { col: YEL });
  const k = seg(lt, 1.4, 1.9);
  text('Passagier: Björn Sellnau', 60, 900, { size: 56, weight: 700, alpha: k });
  text('Senior Developer · Materna SE · Berlin', 60, 970, { size: 38, weight: 500, fam: IS, color: '#C9D2DF', alpha: k });
  text('Das Web. Meine Leidenschaft.', 60, 1100, { size: fit('Das Web. Meine Leidenschaft.', W - 120, 64, 700), weight: 700, color: YEL, alpha: seg(lt, 2.0, 2.5) });
  // Bordkarte
  const b = eOut5(seg(lt, 2.4, 3.2));
  g.save(); g.translate(W / 2, 1450 + (1 - b) * 600); g.rotate(-0.04); g.fillStyle = '#F4F1EA'; rr(-450, -170, 900, 340, 24); g.fill();
  g.fillStyle = YEL; g.fillRect(-450, -170, 900, 70);
  text('BORDKARTE · BOARDING PASS', -420, -122, { size: 30, weight: 700, fam: JM, color: '#111' });
  text('VON', -420, -50, { size: 22, weight: 600, fam: JM, color: '#666' }); text('2002', -420, 10, { size: 74, weight: 700, color: '#111' });
  text('NACH', 0, -50, { size: 22, weight: 600, fam: JM, color: '#666' }); text('DAS WEB', 0, 10, { size: 74, weight: 700, color: '#111' });
  text('linkedin.com/in/bjoern-sellnau', -420, 120, { size: 30, weight: 600, fam: JM, color: '#111' });
  g.save(); g.translate(330, 80); mark(0, 0, 3.4, { neg: 1, negCol: '#FF7816' }); g.restore();
  g.restore();
}
start({
  id: '05', title: 'Abflugtafel',
  scenes: [[0, sB1], [10, sB2], [19, sLast]],
  trans: { 10: 'push', 19: 'push' }, tcol: YEL, finish: { grain: 0.04, vignette: 0.45 },
  music: { prog: [[62, 65, 69, 72], [55, 59, 62, 65], [60, 64, 67, 71], [57, 60, 64, 67]], roots: [50, 43, 48, 45], sec: (b) => (b < 2 ? 'intro' : b < 19 ? 'main' : b < 22 ? 'half' : b < 23 ? 'outro' : 'end'), drums: 'house', bass: 'pluck', swing: 0.12, arp: 'triangle', arpSteps: 8, arpGain: 0.04, arpPat: [0, 2, 1, 3], padWave: 'triangle', pad: 0.025, padSoft: 0.03, cut: 2400, arpHalf: true,
    sfx: (A) => { A.chime(0.15, [76, 72, 67]); A.chime(bar(19), [76, 72, 67]); for (let r = 0; r < 18; r++) for (let j = 0; j < 14; j++) { const at = (r < 10 ? 0.2 + r * B * 3 : bar(10) + 0.2 + (r - 10) * B * 3.6) + j * 0.035 + 0.15; A.noise(at, 0.015, 2500, 3500, 0.035, 'bandpass', 2); } } },
});
