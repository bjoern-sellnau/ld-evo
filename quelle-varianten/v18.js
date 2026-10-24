/* V18 „SPREE|FALL – TRAILER“ — Kinotrailer: Texttafeln aus dem README, langsame Fahrten, Walk-Clip, Schnittgewitter, Titel.
   Bilder: docs/screenshots + docs/media des Repos ld-spreefall. Kartendaten im Spiel: © OpenStreetMap-Mitwirkende (ODbL). */
setup({ bpm: 90, bars: 20 });
const GOLDS = '#E9C46A';
function letterbox(img, t, z0 = 1.05, z1 = 1.18, px = 0.5, py = 0.5, lt = 0, dur = BAR) {
  g.fillStyle = '#000'; g.fillRect(0, 0, W, H);
  const h = 1080 * 9 / 16 * 1.6, y = (H - h) / 2;
  imgCover(img, 0, y, W, h, 0, false, lerp(z0, z1, clamp(lt / dur)), px, py);
  const gr = g.createLinearGradient(0, y, 0, y + h); gr.addColorStop(0, 'rgba(0,0,0,0.5)'); gr.addColorStop(0.2, 'rgba(0,0,0,0)'); gr.addColorStop(0.8, 'rgba(0,0,0,0)'); gr.addColorStop(1, 'rgba(0,0,0,0.6)'); g.fillStyle = gr; g.fillRect(0, y, W, h);
  g.save(); g.globalCompositeOperation = 'soft-light'; g.fillStyle = 'rgba(255,170,90,0.35)'; g.fillRect(0, y, W, h); g.restore();
}
function card(lines, lt, sizes = [70], col = '#F2F5FA') {
  g.fillStyle = '#000'; g.fillRect(0, 0, W, H);
  const a = seg(lt, 0.15, 0.7) * (1 - seg(lt, BAR - 0.5, BAR - 0.05));
  lines.forEach((l, i) => text(l, W / 2, 900 + i * (sizes[i] ?? sizes[0]) * 1.35 - (lines.length - 1) * 40, { size: fit(l, W - 140, sizes[i] ?? sizes[0], 600, SG, 8), weight: 600, align: 'center', color: i === lines.length - 1 && lines.length > 1 ? GOLDS : col, ls: 8, alpha: a }));
}
const SEQ1 = [
  ['card', ['BERLIN.'], [110]], ['img', 'sf:01-pariser-platz', 0.5, 0.45], ['card', ['JEDES GEBÄUDE.', 'JEDE STRASSE.', 'AUS OPENSTREETMAP.'], [64, 64, 52]], ['walk'],
  ['card', ['KEINE ENGINE.', 'KEINE 3D-BIBLIOTHEK.'], [70, 56]], ['img', 'sf:07-tv-tower', 0.5, 0.3], ['card', ['EIGENER WEBGL2-RENDERER.', 'EIGENE PHYSIK. EIGENER SOUND.'], [52, 46]], ['img', 'sf:09-night', 0.5, 0.5],
];
function sAct1(t) {
  const lt = t, i = clamp(Math.floor(lt / BAR), 0, SEQ1.length - 1), l = lt - i * BAR, e = SEQ1[i];
  if (e[0] === 'card') card(e[1], l, e[2]);
  else if (e[0] === 'img') letterbox(IMG[e[1]], t, 1.04, 1.16, e[2], e[3], l);
  else { const img = seq(walkSrc(l * 25 * 0.6)); letterbox(img, t, 1.0, 1.06, 0.5, 0.5, l); text('UNTER DEN LINDEN', W / 2, 1520, { size: 36, weight: 600, fam: JM, align: 'center', color: GOLDS, ls: 8, alpha: seg(l, 0.3, 0.8) }); }
  if (e[0] !== 'card') text('Kartendaten im Spiel: © OpenStreetMap-Mitwirkende (ODbL)', W / 2, 1860, { size: 20, weight: 500, fam: JM, align: 'center', color: 'rgba(200,200,200,0.6)' });
}
const CUTS = ['combat-01-contact', 'muzzle-02-dusk', 'mech-04-titanfall', 'mechs-mine-2', 'mech-05-cockpit', 'collapse-03-falling', 'city-02-warhead', 'collapse-06-spikes-after', 'ops-08-warlord', 'field-01-dome', 'backdoor-06-night', 'machines-01-street', '05-reichstag', '12-spree', 'ui-02-intro', '01-pariser-platz'];
function sAct2(t) {
  const lt = t - bar(8), bi = Math.floor(lt / B), f = (lt % B) / B;
  g.save(); shakeT(Math.max(0, 18 - f * 60), t);
  letterbox(IMG['sf:' + CUTS[bi % CUTS.length]], t, 1.12, 1.0, 0.5, 0.5, f * B, B);
  g.restore();
  flash((1 - clamp(f * 6)) * 0.25, '255,220,180');
  if (bi % 4 === 0) text(['SIEBEN SPIELE.', 'EINE STADT.', 'VON TAG BIS NACHT.', 'DREI SCHWIERIGKEITEN.'][Math.floor(bi / 4) % 4], W / 2, 1600, { size: 54, weight: 700, align: 'center', color: '#FFFFFF', ls: 8, alpha: clamp(f * 4) });
  text('Kartendaten im Spiel: © OpenStreetMap-Mitwirkende (ODbL)', W / 2, 1860, { size: 20, weight: 500, fam: JM, align: 'center', color: 'rgba(200,200,200,0.6)' });
}
function sTitle(t) {
  const lt = t - bar(12);
  g.fillStyle = '#000'; g.fillRect(0, 0, W, H);
  const img = IMG['sf:ui-01-title'], k = eOut5(seg(lt, 0, 1.2));
  if (img) { g.save(); g.globalAlpha = 0.3 * k; g.filter = 'blur(8px)'; imgCover(img, 0, 300, W, 1300, 0, false, 1.4 - lt * 0.02, 0.5, 0.5); g.restore(); }
  text('SPREE|FALL', W / 2, 980, { size: fit('SPREE|FALL', W - 100, 200, 700, SG, 14), weight: 700, align: 'center', color: GOLDS, ls: 14, alpha: k, glow: 'rgba(233,196,106,0.5)', glowSize: 40 });
  text('Ein Open-World-Shooter im echten Berlin', W / 2, 1090, { size: 44, weight: 500, fam: IS, align: 'center', color: '#F2F5FA', alpha: seg(lt, 1.2, 1.8) });
  const games = ['Berlin Phototour', 'Rise of the Machines', 'Just a Walk', 'Tactics', 'Slayer', 'The Hunt', '.BACKDOOR'];
  games.forEach((gm, i) => text(gm, W / 2, 1260 + i * 56, { size: 36, weight: 600, fam: JM, align: 'center', color: 'rgba(242,245,250,0.8)', alpha: seg(lt, 2.4 + i * 0.25, 2.8 + i * 0.25) }));
  shockwave(W / 2, 940, lt - 0.1, '233,196,106', 1400);
}
function sEnd(t) {
  const lt = t - bar(17);
  g.fillStyle = '#000'; g.fillRect(0, 0, W, H);
  text('ein Projekt von', W / 2, 760, { size: 40, weight: 500, fam: IS, align: 'center', color: '#9AA7BA', alpha: seg(lt, 0.2, 0.6) });
  text('Björn Sellnau', W / 2, 880, { size: 110, weight: 700, align: 'center', alpha: seg(lt, 0.4, 0.9) });
  mark(W / 2, 1110, 5, { neg: seg(lt, 0.8, 1.2), glow: 30 });
  text('bjoern-sellnau.github.io/ld-spreefall', W / 2, 1320, { size: fit('bjoern-sellnau.github.io/ld-spreefall', W - 120, 46, 600, JM), weight: 600, fam: JM, align: 'center', color: GOLDS, alpha: seg(lt, 1.2, 1.6) });
  text('loona-designs.de', W / 2, 1400, { size: 40, weight: 600, fam: JM, align: 'center', color: '#C9D2DF', alpha: seg(lt, 1.5, 1.9) });
  text('Kartendaten © OpenStreetMap-Mitwirkende (ODbL) · Bilder: Repo ld-spreefall', W / 2, 1820, { size: fit('Kartendaten © OpenStreetMap-Mitwirkende (ODbL) · Bilder: Repo ld-spreefall', W - 120, 24, 500, JM), weight: 500, fam: JM, align: 'center', color: 'rgba(200,200,200,0.6)', alpha: seg(lt, 1.8, 2.2) });
}
start({
  id: '18', title: 'SPREE|FALL-Trailer',
  scenes: [[0, sAct1], [8, sAct2], [12, sTitle], [17, sEnd]],
  trans: { 12: 'zoom', 17: 'iris' }, tcol: GOLDS, finish: { grain: 0.09, vignette: 0.55 },
  seqAt: (t) => { const i = Math.floor(t / BAR); if (i !== 3) return []; return [walkSrc((t - 3 * BAR) * 25 * 0.6)]; },
  music: { prog: [[45, 52, 57, 60], [41, 48, 53, 57], [43, 50, 55, 59], [40, 47, 52, 56]], roots: [45, 41, 43, 40], sec: (b) => (b < 8 ? 'half' : b < 12 ? 'drop' : b < 13 ? 'break' : b < 17 ? 'main' : b < 18 ? 'outro' : 'end'), drums: 'boom', bass: 'sub', arp: 'sawtooth', arpSteps: 8, arpDrop: 16, arpGain: 0.02, arpGainDrop: 0.03, arpCut: 1600, padWave: 'sawtooth', pad: 0.03, padSoft: 0.035, padBreak: 0.06, cut: 900, cutDrop: 1600, verb: 0.5, verbLen: 3.5, introPulse: false, endWave: 'sawtooth',
    booms: [0, 2, 4, 6, 8, 12, 17], risers: [8, 12], sfx: (A) => { for (let b = 8; b < 12; b++) for (let k = 0; k < 4; k++) A.tom(bar(b) + k * B, 40 - k, 0.45); } },
});
