/* V01 „TERMINAL“ — alles in einer Shell: Boot, ASCII-Negativ-Logo, Stationen als Log, Award, Abschalten wie eine Röhre. */
setup({ bpm: 122, bars: 24 });
const GR = '#7CFF9B', GRD = 'rgba(124,255,155,', OR = '#FF9A4D';
const LH = 50, X0 = 70, Y0 = 250, ROWS = 28;
/* Skript: [Schlag, Art, Text, Farbe] — Befehle werden getippt */
const S = [];
let beat = 16.5;
const cmd = (txt, gap = 1) => { S.push([beat, 'cmd', txt]); beat += Math.max(1.2, txt.length / 9) + gap; };
const out = (txt, col, gap = 0.5) => { S.push([beat, 'out', txt, col]); beat += gap; };
cmd('whoami', 0.6);
out('bjoern-sellnau — Senior Developer · Berlin', GR, 1);
cmd('cat stationen.log', 0.8);
STATIONS.forEach((s) => out(`${s.d.padEnd(17, ' ')} ${s.t}`, s.k === 'award' ? '#FFD36E' : s.k === 'lead' ? OR : GR, 0.62));
beat += 0.6;
cmd('./award --show', 0.6);
['┌─────────────────────────────┐', '│  ★ GOLD                      │', '│  Best of Swiss Web 2017      │', '│  Kategorie Mobile            │', '│  MySwitzerland.com Mobile    │', '└─────────────────────────────┘'].forEach((l) => out(l, '#FFD36E', 0.3));
beat += 0.8;
cmd('uptime', 0.5);
out(`up ${fmtDE(SEC0)} s — seit 01.09.2007, 09:00`, GR, 1);
cmd('open https://loona-designs.de', 0.5);
out('→ Das Web. Meine Leidenschaft.', OR, 1);
// auf die Länge strecken: Skript endet bei Schlag 86, danach schaltet die Röhre ab
{ const k = (86 - 16.5) / (beat - 16.5); S.forEach((e) => (e[0] = 16.5 + (e[0] - 16.5) * k)); }

function asciiLogo(t, x0, y0, cw, chh, p) {
  // Raster über das Zeichen: Negativraum = █ (orange), Zeichen = ░ (grün, schwach)
  for (let r = 0; r < 22; r++) for (let c = 0; c < 26; c++) {
    if (hash(r * 31 + c) > p * 1.4 - r / 30) continue;
    const u = c * (44 / 26) + 0.85, v = 3 + r * (40 / 22) + 0.9;
    const neg = inNeg(u, v), pos = inPos(u, v);
    if (!neg && !pos) continue;
    text(neg ? '█' : '░', x0 + c * cw, y0 + r * chh, { size: chh * 1.05, weight: 500, fam: JM, color: neg ? OR : GRD + '0.45)', glow: neg ? 'rgba(255,140,60,0.7)' : undefined, glowSize: 14 });
  }
}
function crt(t) {
  g.fillStyle = '#030703'; g.fillRect(0, 0, W, H);
  const gr = g.createRadialGradient(W / 2, H / 2, 200, W / 2, H / 2, 1200); gr.addColorStop(0, 'rgba(40,90,50,0.22)'); gr.addColorStop(1, 'rgba(0,0,0,0)'); g.fillStyle = gr; g.fillRect(0, 0, W, H);
}
function sBoot(t) {
  crt(t);
  const lines = ['LOONA BIOS v26.10 — (c) loona! designs', `RAM CHECK ........ ${Math.min(64, Math.floor(t * 40))} GB`, 'CPU .............. 4 cores @ 122 BPM', 'BOOT DEVICE ...... /dev/web', 'LOADING NEGATIVRAUM.SYS'];
  lines.forEach((l, i) => { if (t > 0.2 + i * 0.45) text(typed(l, (t - 0.2 - i * 0.45) * 3), X0, 300 + i * LH, { size: 32, weight: 500, fam: JM, color: GR, glow: 'rgba(124,255,155,0.5)', glowSize: 12 }); });
  asciiLogo(t, 150, 700, 30, 40, seg(t, 2.4, 6.5));
  if (t > 6.6) text('L + D — der Raum dazwischen.', W / 2, 1640, { size: 34, weight: 500, fam: JM, align: 'center', color: OR, alpha: seg(t, 6.6, 7.0) });
  scanlines(0.22, 5);
}
function sShell(t) {
  crt(t);
  const nowBeat = t / B;
  const vis = [];
  for (const [bt, kind, txt, col] of S) {
    if (nowBeat < bt) break;
    if (kind === 'cmd') { const p = (nowBeat - bt) * B * 14 / Math.max(1, txt.length); vis.push(['$ ', typed(txt, p), '#E8FFE9', p < 1]); }
    else vis.push(['', txt, col, false]);
  }
  const first = Math.max(0, vis.length - ROWS);
  vis.slice(first).forEach(([pfx, txt, col, typing], i) => {
    const y = Y0 + i * LH;
    if (pfx) text(pfx, X0, y, { size: 32, weight: 700, fam: JM, color: OR });
    text(txt, X0 + (pfx ? 44 : 0), y, { size: fit(txt, W - X0 * 2 - 44, 32, 500, JM), weight: 500, fam: JM, color: col, glow: 'rgba(124,255,155,0.35)', glowSize: 10 });
    if (typing || (i === Math.min(vis.length, ROWS) - 1 && Math.floor(t * 3) % 2 === 0)) { const w = measure(txt, 32, 500, JM); g.fillStyle = GR; g.fillRect(X0 + (pfx ? 44 : 0) + w + 6, y - 28, 18, 34); }
  });
  text('bjoern@ld:~', X0, 160, { size: 28, weight: 600, fam: JM, color: GRD + '0.6)' });
  mark(W - 120, 150, 2.4, { neg: 1, negCol: OR, glow: 14 });
  // Röhre aus
  const off = seg(t, bar(24) - 1.0, bar(24) - 0.2);
  if (off > 0) { const k = eIn(off); g.fillStyle = `rgba(0,0,0,${k})`; g.fillRect(0, 0, W, H); const hh = Math.max(3, H * (1 - k) * 0.5); g.fillStyle = `rgba(200,255,210,${1 - seg(off, 0.8, 1)})`; g.fillRect(W * k * 0.45, H / 2 - hh / 2, W * (1 - k * 0.9), Math.min(hh, 12)); }
  scanlines(0.22, 5);
  g.fillStyle = `rgba(124,255,155,${0.02 + 0.02 * Math.sin(t * 50)})`; g.fillRect(0, 0, W, H);
}
start({
  id: '01', title: 'Terminal',
  scenes: [[0, sBoot], [4, sShell]],
  trans: { 4: 'pixel' }, tcol: GR, finish: { grain: 0.05, vignette: 0.75 },
  music: { prog: [[57, 60, 64], [53, 57, 60], [55, 59, 62], [52, 55, 59]], roots: [45, 41, 43, 40], sec: (b) => (b < 4 ? 'intro' : b < 8 ? 'main' : b < 20 ? 'drop' : b < 22 ? 'main' : b < 23 ? 'outro' : 'end'), drums: 'house', bass: 'saw8', arp: 'square', arpSteps: 8, arpDrop: 16, cut: 1200, cutDrop: 2000, booms: [4, 8, 20], risers: [8], sfx: (A) => { for (let i = 0; i < 40; i++) A.noise(0.2 + i * 0.06, 0.02, 3000, 5000, 0.06, 'bandpass', 3); } },
});
