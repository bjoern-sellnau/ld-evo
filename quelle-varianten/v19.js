/* V19 „KEYNOTE“ — hell, ruhig, eine Aussage pro Takt, große Typografie mit Verlauf, Geräte mit der neuen Website. */
setup({ bpm: 100, bars: 20 });
const BG = '#F5F5F7', TX = '#1D1D1F', MUTE = '#6E6E73';
function gradText(str, x, y, size, c1 = '#FF7816', c2 = '#B4005A', a = 1, align = 'center') {
  g.save(); g.font = font(size, 700, SG); g.textAlign = align; if ('letterSpacing' in g) g.letterSpacing = '-4px'; g.globalAlpha = a;
  const w = g.measureText(str).width, x0 = align === 'center' ? x - w / 2 : x; const gr = g.createLinearGradient(x0, y - size, x0 + w, y); gr.addColorStop(0, c1); gr.addColorStop(1, c2); g.fillStyle = gr; g.fillText(str, x, y); g.restore();
}
const SLIDES = [
  { big: 'Björn Sellnau.', sub: 'Senior Developer · Berlin' },
  { big: 'Seit 2007.', sub: 'Web Engineer bei PIXELTEX, Gadmin 4 CMS' },
  { big: 'Gold.', sub: 'Best of Swiss Web 2017 · Kategorie Mobile', grad: ['#E9A23B', '#B8860B'] },
  { big: 'Frontend Lead.', sub: 'OpenBooking · ab 09/2016' },
  { big: 'Ausbilder.', sub: 'Fachinformatiker Anwendungsentwicklung · 2019 – 2020', grad: ['#2FAE6A', '#0E7C86'] },
  { big: 'Tech Lead.', sub: 'BMW Neuwagensuche · ab 09/2022', grad: ['#1E9BD7', '#6A3DE8'] },
  { big: 'Tabletop Herald.', sub: 'App-Projekt · 04/2024 – 12/2025' },
  { big: '10 Zertifikate.', sub: 'Anthropic · Stripe · IHK Berlin · IBM · Adobe …', grad: ['#9B5DE5', '#F15BB5'] },
  { big: 'Materna SE.', sub: 'Senior Developer · Public Sector · seit 05/2026' },
];
function sSlides(t) {
  const lt = t, i = clamp(Math.floor(lt / BAR), 0, SLIDES.length - 1), f = (lt - i * BAR) / BAR, S = SLIDES[i];
  g.fillStyle = BG; g.fillRect(0, 0, W, H);
  const k = eOut5(clamp(f * 2.5)), out = seg(f, 0.88, 1);
  const size = fit(S.big, W - 120, 170, 700, SG, -4);
  gradText(S.big, W / 2, 960 + (1 - k) * 60, size, S.grad?.[0] ?? '#FF7816', S.grad?.[1] ?? '#B4005A', k * (1 - out));
  text(S.sub, W / 2, 1060 + (1 - k) * 60, { size: fit(S.sub, W - 160, 42, 500, IS), weight: 500, fam: IS, align: 'center', color: MUTE, alpha: seg(f, 0.15, 0.4) * (1 - out) });
  if (i === 0) mark(W / 2, 640, 6 * k, { neg: k, negCol: '#FF7816' });
}
function sDevices(t) {
  const lt = t - bar(9);
  g.fillStyle = BG; g.fillRect(0, 0, W, H);
  text('Eine neue Website.', W / 2, 260, { size: fit('Eine neue Website.', W - 120, 110, 700, SG, -4), weight: 700, align: 'center', color: TX, ls: -4, alpha: seg(lt, 0, 0.4) });
  text('loona-designs.de · Next.js 16 · LD Flow CMS · DE/EN', W / 2, 340, { size: fit('loona-designs.de · Next.js 16 · LD Flow CMS · DE/EN', W - 140, 36, 500, IS), weight: 500, fam: IS, align: 'center', color: MUTE, alpha: seg(lt, 0.3, 0.7) });
  // Laptop
  const k = eOut5(seg(lt, 0.4, 1.2));
  g.save(); g.translate(W / 2, 760 + (1 - k) * 200); g.globalAlpha = k;
  g.fillStyle = '#C7C7CC'; rr(-470, -280, 940, 560, 26); g.fill(); g.fillStyle = '#111'; rr(-452, -262, 904, 524, 16); g.fill();
  imgCover(IMG[lt < BAR * 1.5 ? 'deskAurum' : 'deskLabs'], -440, -250, 880, 500, 8, true);
  g.fillStyle = '#B9B9BE'; rr(-540, 280, 1080, 34, 14); g.fill();
  g.restore();
  phone(IMG.mobHome, 280, 1440, 300, seg(lt, 1.2, 5) * 0.5, eOut5(seg(lt, 1.0, 1.6)), -0.05);
  phone(IMG.mobBeyond, 800, 1460, 300, seg(lt, 1.6, 5.5) * 0.4, eOut5(seg(lt, 1.3, 1.9)), 0.05);
}
function sHeroes(t) {
  const lt = t - bar(12);
  g.fillStyle = BG; g.fillRect(0, 0, W, H);
  gradText('71 Hero-Animationen.', W / 2, 250, fit('71 Hero-Animationen.', W - 120, 110, 700, SG, -4), '#7A3DE8', '#FF7816', seg(lt, 0, 0.4));
  const ms = ['blackhole', 'aurum', 'metal', 'prism', 'tunnel', 'storm2'];
  ms.forEach((m, i) => { const x = 90 + (i % 3) * 310, y = 380 + Math.floor(i / 3) * 690, k = eOut5(seg(lt, 0.3 + i * 0.15, 0.8 + i * 0.15)); const img = seq(heroSrc(m, 6 + lt * 6)); g.save(); g.globalAlpha = k; g.translate(0, (1 - k) * 80); g.shadowColor = 'rgba(0,0,0,0.25)'; g.shadowBlur = 40; g.fillStyle = '#111'; rr(x - 8, y - 8, 286, 626, 40); g.fill(); g.shadowBlur = 0; if (img) { g.save(); rr(x, y, 270, 610, 32); g.clip(); g.drawImage(img, x, y - 10, 270 * 1.0, 270 * 1920 / 1080); g.restore(); } g.restore(); });
  text('Und ein Negativraum.', W / 2, 1830, { size: 52, weight: 700, align: 'center', color: TX, alpha: seg(lt, 3.5, 4.0) });
}
function sNeg(t) {
  const lt = t - bar(15);
  g.fillStyle = BG; g.fillRect(0, 0, W, H);
  const k = eIO(seg(lt, 0.2, 1.8));
  mark(W / 2, 800, 15, { pos: 1 - k * 0.92, posCol: '#D2D2D7', neg: 1, negCol: '#FF7816' });
  text('Logo only negative.', W / 2, 1300, { size: 80, weight: 700, align: 'center', color: TX, alpha: seg(lt, 1.2, 1.7) });
  text('L + D — der Raum dazwischen.', W / 2, 1380, { size: 44, weight: 500, fam: IS, align: 'center', color: MUTE, alpha: seg(lt, 1.5, 2.0) });
  const e = seg(lt, BAR * 2.4, BAR * 2.4 + 0.8);
  if (e > 0) { g.fillStyle = `rgba(245,245,247,${e})`; g.fillRect(0, 0, W, H); gradText('Das Web.', W / 2, 860, 180, '#FF7816', '#B4005A', e); gradText('Meine Leidenschaft.', W / 2, 1040, fit('Meine Leidenschaft.', W - 120, 130, 700, SG, -4), '#B4005A', '#7A3DE8', e); text('loona-designs.de', W / 2, 1220, { size: 50, weight: 600, fam: JM, align: 'center', color: TX, alpha: e }); text('linkedin.com/in/bjoern-sellnau', W / 2, 1290, { size: 36, weight: 500, fam: JM, align: 'center', color: MUTE, alpha: e }); }
}
start({
  id: '19', title: 'Keynote',
  scenes: [[0, sSlides], [9, sDevices], [12, sHeroes], [15, sNeg]],
  trans: { 9: 'push', 12: 'push', 15: 'push' }, finish: { grain: 0.015, vignette: 0 },
  seqAt: (t, TD) => (t >= bar(12) - TD && t < bar(15) + TD ? ['blackhole', 'aurum', 'metal', 'prism', 'tunnel', 'storm2'].map((m) => heroSrc(m, 6 + Math.max(0, t - bar(12)) * 6)) : []),
  music: { prog: [[60, 64, 67, 71], [57, 60, 64, 67], [53, 57, 60, 64], [55, 59, 62, 65]], roots: [48, 45, 41, 43], sec: (b) => (b < 1 ? 'intro' : b < 9 ? 'half' : b < 17 ? 'main' : b < 19 ? 'outro' : 'end'), drums: 'four', bass: 'sub', arp: 'triangle', arpSteps: 8, arpGain: 0.05, arpPat: [0, 1, 2, 3, 2, 1], arpHalf: true, arpLen: 1.6, padWave: 'triangle', pad: 0.03, padSoft: 0.035, cut: 2400, verb: 0.45, verbLen: 3, introPulse: false, booms: [9, 15] },
});
