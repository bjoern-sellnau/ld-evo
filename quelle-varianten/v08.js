/* V08 „MAGAZIN“ — eine Sonderausgabe: Titelseite, umgeblätterte Doppelseiten (Anfänge, Gold, Ausbilder, Tech Lead, Labs), Rückseite. */
setup({ bpm: 98, bars: 22 });
const PAPER = '#F5F1EA', INK = '#15161A', ACC = '#D9480F';
function mast(t, a = 1) { text('LOONA', W / 2, 250, { size: 230, weight: 700, align: 'center', color: '#FFFFFF', ls: 18, alpha: a }); }
function sCover(t) {
  const img = IMG['sf:ui-05-photo'];
  g.fillStyle = '#000'; g.fillRect(0, 0, W, H);
  if (img) { g.save(); imgCover(img, 0, 0, W, H, 0, false, 1.08 + t * 0.012, 0.5, 0.3); g.restore(); }
  const gr = g.createLinearGradient(0, 0, 0, H); gr.addColorStop(0, 'rgba(0,0,0,0.55)'); gr.addColorStop(0.35, 'rgba(0,0,0,0.05)'); gr.addColorStop(0.7, 'rgba(0,0,0,0.35)'); gr.addColorStop(1, 'rgba(0,0,0,0.9)'); g.fillStyle = gr; g.fillRect(0, 0, W, H);
  mast(t, seg(t, 0.2, 0.8));
  text('SONDERAUSGABE · 10/2026 · BERLIN', W / 2, 310, { size: 30, weight: 600, fam: JM, align: 'center', color: '#FFFFFF', ls: 4, alpha: seg(t, 0.6, 1) });
  const lines = [['Gold für Mobile', 'Best of Swiss Web 2017'], ['Tech Lead', 'BMW Neuwagensuche'], ['Der Ausbilder', 'Fachinformatiker AE']];
  lines.forEach(([h, s], i) => { const a = seg(t, 1.2 + i * 0.4, 1.6 + i * 0.4); text(h, 70, 560 + i * 140, { size: 56, weight: 700, color: '#FFFFFF', alpha: a }); text(s, 70, 610 + i * 140, { size: 34, weight: 500, fam: IS, color: '#FFD1B8', alpha: a }); });
  text('Björn', 70, 1500, { size: 190, weight: 700, color: '#FFFFFF', ls: -6, alpha: seg(t, 2.6, 3.2) });
  text('Sellnau', 70, 1680, { size: 190, weight: 700, color: ACC, ls: -6, alpha: seg(t, 2.9, 3.5) });
  text('Titelbild: Fernsehturm in SPREE|FALL', 70, 1830, { size: 22, weight: 500, fam: JM, color: '#DDD', alpha: seg(t, 3.4, 4) });
  text('„Das Web. Meine Leidenschaft.“', 70, 1770, { size: 40, weight: 600, fam: IS, color: '#FFFFFF', alpha: seg(t, 3.4, 4) });
  // Barcode
  g.fillStyle = '#FFFFFF'; g.fillRect(W - 270, 1640, 200, 150); for (let i = 0; i < 40; i++) { g.fillStyle = '#000'; g.fillRect(W - 260 + i * 4.5, 1652, hash(i) > 0.5 ? 3 : 1.5, 110); }
  text('LD · 10/2026', W - 170, 1780, { size: 18, weight: 600, fam: JM, align: 'center', color: '#000' });
}
function spread(t, b0, n, kickerTxt, head, sub, body, imgs, pno) {
  const lt = t - bar(b0);
  g.fillStyle = PAPER; g.fillRect(0, 0, W, H);
  g.fillStyle = 'rgba(0,0,0,0.06)'; g.fillRect(0, 0, 18, H);
  text(`LOONA · SONDERAUSGABE`, 70, 90, { size: 22, weight: 600, fam: JM, color: '#7A7A7A', ls: 3 });
  text(String(pno), W - 70, 90, { size: 22, weight: 600, fam: JM, align: 'right', color: '#7A7A7A' });
  g.fillStyle = INK; g.fillRect(70, 115, W - 140, 2);
  text(kickerTxt, 70, 190, { size: 28, weight: 700, fam: JM, color: ACC, ls: 4, alpha: seg(lt, 0, 0.3) });
  const k = eOut5(seg(lt, 0.1, 0.7));
  g.save(); g.translate(0, (1 - k) * 40); g.globalAlpha = k;
  const hs = fit(head, W - 140, 120, 700, SG, -4); text(head, 70, 320, { size: hs, weight: 700, color: INK, ls: -4 });
  wrap(sub, 70, 400, W - 140, 40, { weight: 600, fam: IS, color: '#333' });
  g.restore();
  // Bilder
  imgs.forEach(([key, x, y, w, h, cap], i) => {
    const kk = eOut5(seg(lt, 0.6 + i * 0.35, 1.2 + i * 0.35)); if (kk <= 0) return;
    g.save(); g.globalAlpha = kk; g.translate(0, (1 - kk) * 60);
    g.shadowColor = 'rgba(0,0,0,0.25)'; g.shadowBlur = 30; g.fillStyle = '#fff'; g.fillRect(x - 10, y - 10, w + 20, h + 20); g.shadowBlur = 0;
    imgCover(IMG[key], x, y, w, h, 0, true);
    if (cap) text(cap, x, y + h + 46, { size: 26, weight: 500, fam: IS, color: '#555' });
    g.restore();
  });
  // Fließtext mit Initiale
  const by = 1420, a = seg(lt, 1.6, 2.2);
  text(body[0], 70, by + 92, { size: 128, weight: 700, color: ACC, alpha: a });
  const bodyTxt = body.slice(1);
  g.save(); g.globalAlpha = a; wrap(bodyTxt, 170, by + 20, W - 240, 34, { weight: 500, fam: IS, color: INK, lh: 1.45 }); g.restore();
}
const S1 = (t) => spread(t, 5, 0, 'DIE ANFÄNGE · 2002 – 2006', 'Vom Flash-Spiel zum Shop.', 'Ausbildung 2002, ein eigenes Flash-5-Spiel 2003, dann die ersten Kundenprojekte.', 'Erst kam das Spiel, dann das Geschäft: Nach der Ausbildung zum Technischen Assistenten für Informatik entstanden Onlineshops, Homepages mit eigenem MiniCMS und die eigene Seite ld2006.', [['yayci', 70, 520, 600, 380, 'Computer Handel Yayci · 2004'], ['ld2006', 560, 800, 450, 300, 'Loona! Designs „ld2006“ · 2006'], ['hanno', 70, 1000, 400, 260, 'Hannoback · 2005']], 6);
const S2 = (t) => spread(t, 8, 0, 'AUSZEICHNUNG · 2017', 'Gold für Mobile.', 'Best of Swiss Web 2017, Kategorie Mobile: der Mobile-Relaunch von MySwitzerland.com.', 'Planung und spätere Umsetzung von 01/2016 bis 04/2017 — am Ende stand Gold bei Best of Swiss Web. Davor: Web Engineer bei PIXELTEX seit 09/2007 und Entwicklung am Gadmin 4 CMS.', [['oldSite', 70, 540, 940, 560, 'Die bisherige loona-designs.de']], 14);
const S3 = (t) => spread(t, 11, 0, 'AUSBILDUNG · 2018 – 2020', 'Der Ausbilder.', 'Azubi-Recruiting, Ausbilder-Eignung bei der IHK Berlin, dann Ausbilder für Fachinformatiker Anwendungsentwicklung.', 'Von 08/2018 bis 03/2019 der Bewerbungsprozess für Auszubildende, im März 2019 die AEVO-Prüfung, von 03/2019 bis 02/2020 Ausbilder.', [['mobStory', 120, 560, 380, 720, 'Die neue Website, mobil'], ['mobHome', 580, 600, 380, 720, null]], 22);
const S4 = (t) => spread(t, 14, 0, 'FÜHRUNG · 2022 – 2023', 'Tech Lead.', 'BMW Neuwagensuche, 01/2022 bis 05/2023 — ab 09/2022 als Tech Lead.', 'Seit 05/2020 Software Engineer bei Code-b (bis 01/2026), dazwischen die BMW Neuwagensuche, von 04/2024 bis 12/2025 die Tabletop Herald App. Seit 05/2026: Senior Developer bei Materna SE.', [['deskAurum', 70, 540, 940, 530, 'Die neue loona-designs.de · LD Beyond']], 31);
const S5 = (t) => spread(t, 17, 0, 'LABS · 2026', 'Spiele aus dem Labor.', 'Corefall, Covert Operations und SPREE|FALL.', 'Ein 6D-Shooter à la Descent, ein Shooter mit Top-Down-, ISO- und FPS-Perspektive und ein Open-World-Shooter im Berlin aus OpenStreetMap-Daten.', [['cfTitle', 70, 520, 460, 260, 'Corefall'], ['coTitle', 550, 520, 460, 260, 'Covert Operations'], ['sf:01-pariser-platz', 70, 860, 940, 440, 'SPREE|FALL · Kartendaten © OpenStreetMap-Mitwirkende']], 40);
function sBack(t) {
  const lt = t - bar(20);
  g.fillStyle = ACC; g.fillRect(0, 0, W, H);
  mark(W / 2, 760, 18 * eOut5(seg(lt, 0, 0.6)), { neg: 1, negCol: PAPER });
  text('loona-designs.de', W / 2, 1300, { size: 80, weight: 700, fam: JM, align: 'center', color: PAPER, alpha: seg(lt, 0.4, 0.8) });
  text('Das Web. Meine Leidenschaft.', W / 2, 1400, { size: 52, weight: 600, fam: IS, align: 'center', color: PAPER, alpha: seg(lt, 0.7, 1.1) });
  text('linkedin.com/in/bjoern-sellnau', W / 2, 1490, { size: 36, weight: 600, fam: JM, align: 'center', color: PAPER, alpha: seg(lt, 1.0, 1.4) });
}
start({
  id: '08', title: 'Magazin',
  scenes: [[0, sCover], [5, S1], [8, S2], [11, S3], [14, S4], [17, S5], [20, sBack]],
  trans: { 5: 'flip', 8: 'flip', 11: 'flip', 14: 'flip', 17: 'flip', 20: 'flip' }, td: 0.4, tcol: ACC, finish: { grain: 0.04, vignette: 0.25 },
  music: { prog: [[62, 65, 69, 72], [55, 58, 62, 65], [60, 64, 67, 70], [57, 60, 64, 67]], roots: [50, 43, 48, 45], sec: (b) => (b < 2 ? 'intro' : b < 20 ? 'main' : b < 21 ? 'outro' : 'end'), drums: 'house', swing: 0.15, bass: 'pluck', arp: 'triangle', arpSteps: 8, arpGain: 0.04, arpPat: [0, 2, 3, 1], padWave: 'triangle', pad: 0.03, cut: 2600, verb: 0.35, introPulse: false,
    sfx: (A) => [5, 8, 11, 14, 17, 20].forEach((b) => A.noise(bar(b) - 0.25, 0.4, 1500, 4000, 0.12, 'bandpass', 0.8)) },
});
