/* V09 „DATEN“ — die Karriere als animiertes Gantt-Diagramm 2002–2026 mit exakten Monaten, danach Kennzahlen. */
setup({ bpm: 112, bars: 24 });
const CAT = { job: '#5EEAD4', projekt: '#C4B5FD', ausbildung: '#5BD97A', award: '#E9C46A', lead: '#FF7A2F', zert: '#9AA7BA', spiel: '#FF3B5C' };
const ym = (s) => { const m = s.match(/(\d{2})\/(\d{4})/); return m ? +m[2] + (+m[1] - 1) / 12 : +s.match(/\d{4}/)[0]; };
// Zeilen: [Titel, Start, Ende|null, Kategorie]
const ROWS = [
  ['Ausbildung (ITA)', '06/2002', null, 'ausbildung'], ['Covert Ops Tournament', '2003', null, 'spiel'], ['Kundenprojekte', '2004', '2006', 'projekt'],
  ['PIXELTEX', '09/2007', null, 'job'], ['Gadmin 4 CMS', '09/2007', '2009', 'projekt'], ['Adobe Certified Expert', '06/2010', null, 'zert'],
  ['StrongLoop Node', '08/2015', null, 'zert'], ['MySwitzerland Mobile', '01/2016', '04/2017', 'award'], ['OpenBooking', '2016', '2020', 'job'],
  ['Azubi-Recruiting', '08/2018', '03/2019', 'ausbildung'], ['AEVO · IHK Berlin', '03/2019', null, 'zert'], ['Ausbilder FIAE', '03/2019', '02/2020', 'ausbildung'],
  ['Code-b', '05/2020', '01/2026', 'job'], ['BMW Neuwagensuche', '01/2022', '05/2023', 'lead'], ['Tabletop Herald App', '04/2024', '12/2025', 'projekt'],
  ['Stripe ×3', '12/2024', null, 'zert'], ['Labs: Spiele', '2026', null, 'spiel'], ['Materna SE', '05/2026', '10/2026', 'job'],
];
const Y0 = 2002, Y1 = 2027, X0 = 70, X1 = W - 70, TOP = 360, RH = 74;
const xOf = (y) => X0 + ((y - Y0) / (Y1 - Y0)) * (X1 - X0);
function axes(t, now) {
  g.fillStyle = '#070B14'; g.fillRect(0, 0, W, H);
  for (let y = Y0; y <= Y1; y++) { const x = xOf(y); g.fillStyle = y % 5 === 0 ? 'rgba(255,255,255,0.14)' : 'rgba(255,255,255,0.05)'; g.fillRect(x, TOP - 30, 1, ROWS.length * RH + 40); if (y % 5 === 0 || y === 2026) text(String(y), x, TOP - 46, { size: 26, weight: 600, fam: JM, align: 'center', color: '#8090A8' }); }
  text('KARRIERE · 2002 – 2026', X0, 150, { size: 30, weight: 600, fam: JM, color: '#8090A8', ls: 4 });
  text(String(Math.floor(now)), X0, 260, { size: 120, weight: 700, color: '#F2F5FA', ls: -4 });
}
function chart(t, now, sel = -1) {
  ROWS.forEach(([ti, a, b, k], i) => {
    const s = ym(a), e = b ? ym(b) + (b.includes('/') ? 1 / 12 : 1) : null, y = TOP + i * RH;
    if (now < s) return;
    const col = CAT[k], ex = e ? Math.min(e, now) : null, on = sel < 0 || sel === i;
    g.save(); g.globalAlpha = on ? 1 : 0.25;
    if (ex) { g.fillStyle = col; rr(xOf(s), y, Math.max(8, xOf(ex) - xOf(s)), 34, 10); g.fill(); }
    else { g.fillStyle = col; g.save(); g.translate(xOf(s), y + 17); g.rotate(Math.PI / 4); g.fillRect(-12, -12, 24, 24); g.restore(); }
    if (k === 'lead') { const tl = ym('09/2022'), te = Math.min(ym('05/2023') + 1 / 12, now); if (now > tl) { g.strokeStyle = '#FFF'; g.lineWidth = 3; rr(xOf(tl), y - 4, xOf(te) - xOf(tl), 42, 10); g.stroke(); } }
    const lx = (ex ? xOf(ex) : xOf(s)) + 22, rightSide = lx + measure(ti, 28, 600, IS) < X1;
    text(ti, rightSide ? lx : xOf(s) - 22, y + 27, { size: 28, weight: 600, fam: IS, align: rightSide ? 'left' : 'right', color: '#E6ECF5', alpha: seg(now, s, s + 0.4) });
    g.restore();
  });
  // Abspielkopf
  const x = xOf(now); g.fillStyle = '#FF7816'; g.fillRect(x - 1.5, TOP - 30, 3, ROWS.length * RH + 40); g.beginPath(); g.arc(x, TOP - 30, 10, 0, 7); g.fill();
}
function legend(a = 1) {
  const items = [['Anstellung', 'job'], ['Projekt', 'projekt'], ['Ausbildung', 'ausbildung'], ['Gold', 'award'], ['Tech Lead', 'lead'], ['Zertifikat', 'zert'], ['Spiele', 'spiel']];
  items.forEach(([l, k], i) => { const x = X0 + (i % 4) * 240, y = 1740 + Math.floor(i / 4) * 52; g.fillStyle = CAT[k]; g.globalAlpha = a; g.fillRect(x, y - 20, 24, 24); g.globalAlpha = 1; text(l, x + 36, y, { size: 26, weight: 500, fam: IS, color: '#B8C2D2', alpha: a }); });
}
function sSweep(t) {
  const now = Y0 + 0.2 + (Math.min(t, bar(14)) / bar(14)) * (2026.8 - Y0 - 0.2);
  axes(t, now); chart(t, now); legend(seg(t, 1, 2));
}
const FOCUS = [7, 11, 13, 14, 17];
const NOTE = { 7: 'Gold · Best of Swiss Web 2017 · Kategorie Mobile', 11: 'nach Azubi-Recruiting und AEVO-Prüfung', 13: 'ab 09/2022 Tech Lead (weißer Rahmen)', 14: '04/2024 – 12/2025', 17: 'Senior Developer · Public Sector · seit 05/2026' };
function sFocus(t) {
  const lt = t - bar(14), per = 6 * BAR / FOCUS.length, i = clamp(Math.floor(lt / per), 0, FOCUS.length - 1), f = (lt - i * per) / per, r = FOCUS[i];
  axes(t, 2026.8); chart(t, 2026.8, r);
  const [ti, a, b] = ROWS[r], y = TOP + r * RH, k = eOut5(clamp(f * 3));
  g.save(); g.globalAlpha = k; g.fillStyle = 'rgba(7,11,20,0.92)'; rr(X0, 70, X1 - X0, 220, 24); g.fill(); g.strokeStyle = CAT[ROWS[r][3]]; g.lineWidth = 3; g.stroke();
  text(ti, X0 + 30, 150, { size: 54, weight: 700, color: '#F2F5FA' }); text(`${a}${b ? ' – ' + b : ''}`, X1 - 30, 150, { size: 36, weight: 600, fam: JM, align: 'right', color: CAT[ROWS[r][3]] });
  text(NOTE[r], X0 + 30, 235, { size: fit(NOTE[r], X1 - X0 - 60, 34, 500, IS), weight: 500, fam: IS, color: '#B8C2D2' });
  g.restore();
  g.strokeStyle = '#FFFFFF'; g.lineWidth = 3; g.globalAlpha = k; g.strokeRect(X0 - 10, y - 12, X1 - X0 + 20, 58); g.globalAlpha = 1;
}
function sKpi(t) {
  const lt = t - bar(20);
  g.fillStyle = '#070B14'; g.fillRect(0, 0, W, H);
  const K = [['18+', 'Jahre Web', '#5EEAD4'], ['10', 'Zertifikate', '#9AA7BA'], ['Gold', 'Best of Swiss Web 2017', '#E9C46A'], ['Tech Lead', 'BMW Neuwagensuche', '#FF7A2F']];
  K.forEach(([v, l, c], i) => { const k = eBack(seg(lt, 0.2 + i * 0.3, 0.6 + i * 0.3)), x = X0 + (i % 2) * 480, y = 300 + Math.floor(i / 2) * 420; g.save(); g.globalAlpha = clamp(k); g.translate(x + 220, y + 170); g.scale(k, k); g.fillStyle = 'rgba(255,255,255,0.05)'; rr(-220, -170, 440, 340, 30); g.fill(); g.strokeStyle = c; g.lineWidth = 3; g.stroke(); text(v, 0, 10, { size: fit(v, 380, 130, 700), weight: 700, align: 'center', color: c }); text(l, 0, 90, { size: fit(l, 380, 32, 600, IS), weight: 600, fam: IS, align: 'center', color: '#E6ECF5' }); g.restore(); });
  mark(W / 2, 1390, 6, { neg: seg(lt, 1.6, 2.2), glow: 30 });
  text('Björn Sellnau · loona-designs.de', W / 2, 1620, { size: 46, weight: 700, align: 'center', alpha: seg(lt, 2, 2.4) });
  text('Das Web. Meine Leidenschaft.', W / 2, 1690, { size: 38, weight: 500, fam: IS, align: 'center', color: '#B8C2D2', alpha: seg(lt, 2.3, 2.7) });
}
start({
  id: '09', title: 'Daten',
  scenes: [[0, sSweep], [14, sFocus], [20, sKpi]],
  trans: { 20: 'zoom' }, tcol: '#5EEAD4', finish: { grain: 0.03, vignette: 0.4 },
  music: { prog: [[60, 64, 67, 71], [57, 60, 64, 67], [53, 57, 60, 64], [55, 59, 62, 65]], roots: [48, 45, 41, 43], sec: (b) => (b < 2 ? 'intro' : b < 14 ? 'main' : b < 20 ? 'drop' : b < 23 ? 'outro' : 'end'), drums: 'house', bass: 'saw8', arp: 'sine', arpSteps: 16, arpDrop: 16, arpGain: 0.05, arpGainDrop: 0.05, arpPat: [0, 1, 2, 3, 2, 1], padWave: 'sawtooth', pad: 0.018, cut: 1800, outroDrums: 'four', booms: [14, 20], risers: [14, 20] },
});
