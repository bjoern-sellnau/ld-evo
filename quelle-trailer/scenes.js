/* Trailer — Stimmungen (Themes), Hintergründe und Szenen. Jede Szene: fn(lt, D) mit lokaler Zeit lt und Dauer D (Sekunden). */
'use strict';
const Q = new URLSearchParams(location.search);
const MOODS = ['cine', 'drive', 'calm', 'action', 'trance', 'hard', 'euro', 'rave', 'demo', 'old', 'b97', 'b2k', 'b99', 'b01', 'b03', 'b05', 'mark', 'ka', 'kb'];
const MOOD = MOODS.includes(Q.get('mood')) ? Q.get('mood') : 'cine';
/* 30 Sekunden gibt es nur für die fünf neuen Stimmungen (ihr Ablauf wird aus einer Vorlage berechnet, siehe main.js) */
/* Die beiden Kino-Trailer (ka, kb) haben ein eigenes Drehbuch je Länge — 30, 60, 90 und 120 Sekunden, keine lange Fassung */
const LEN = [60, 90, 120].concat(['ka', 'kb'].includes(MOOD) ? [] : [300], MOODS.indexOf(MOOD) > 3 ? [30] : []).includes(+Q.get('len')) ? +Q.get('len') : 60;
const LANG = Q.get('lang') === 'en' ? 'en' : 'de';
const T = TXT[LANG];

/* Vier Stimmungen auf den Gründen der Marke: Nacht (Mondhimmel), Tinte, Creme — und „Action“ auf Tinte mit Signalorange als zweitem Ton.
   fast = schneidet und blendet auf den Schlag; bgk = Hintergrund, trans = Übergang, wipe = Farbe des Übergangs. */
const THEMES = {
  cine: { name: 'cinematic', bgk: 'night', trans: 'cine', bpm: 96, dark: true, bg: BR.night, ink: BR.cream, soft: '#B4B9D0', mute: '#7C83A3', line: 'rgba(246,241,232,0.16)', accent: BR.orange, accentText: BR.orange, card: 'rgba(255,255,255,0.055)', style: 'rise', inDur: 1.0, pace: 1, top: 170, bot: 910, td: 0.9 },
  drive: { name: 'treibend', fast: true, bgk: 'ink', trans: 'slash', wipe: BR.orange, bpm: 128, dark: true, bg: BR.ink, ink: BR.cream, soft: BR.mutedDark, mute: '#8A8273', line: 'rgba(246,241,232,0.15)', accent: BR.orange, accentText: BR.orange, card: 'rgba(246,241,232,0.06)', style: 'mask', inDur: 0.36, pace: 0.42, top: 96, bot: 984, td: 0.6 },
  action: { name: 'action', fast: true, bgk: 'action', trans: 'slash', wipe: BR.signal, bpm: 160, dark: true, bg: BR.ink, ink: BR.cream, soft: BR.mutedDark, mute: '#8A8273', line: 'rgba(246,241,232,0.16)', accent: BR.orange, accentText: BR.orange, card: 'rgba(246,241,232,0.07)', style: 'mask', inDur: 0.3, pace: 0.36, top: 96, bot: 984, td: 0.45 },
  calm: { name: 'ruhig', bgk: 'cream', trans: 'soft', bpm: 80, dark: false, bg: BR.cream, ink: BR.ink, soft: BR.text2, mute: BR.meta, line: BR.line, accent: BR.orange, accentText: BR.glassDark, card: 'rgba(255,255,255,0.7)', style: 'fade', inDur: 1.3, pace: 1.15, top: 110, bot: 970, td: 1.2 },
  /* Fünf weitere Stimmungen (Wunsch vom 22.11.2026), benannt nach ihrer Musik. Die Gründe bleiben die der Marke (Nacht, Tinte, Creme);
     die Lichter der Tanz-Stimmungen nehmen die Farben der Produktfamilie (LD Flow, Nova, Buddy, Ivy) — nie am Zeichen selbst. */
  trance: { name: 'trance', fast: true, bgk: 'trance', trans: 'flash', bpm: 136, dark: true, bg: BR.night, ink: BR.cream, soft: '#B4B9D0', mute: '#7C83A3', line: 'rgba(246,241,232,0.16)', accent: BR.orange, accentText: BR.orange, card: 'rgba(255,255,255,0.06)', style: 'rise', inDur: 0.5, pace: 0.5, top: 96, bot: 984, td: 0.7 },
  hard: { name: 'hardstyle', fast: true, bgk: 'hard', trans: 'punch', bpm: 152, dark: true, bg: BR.ink, ink: BR.cream, soft: BR.mutedDark, mute: '#8A8273', line: 'rgba(246,241,232,0.16)', accent: BR.orange, accentText: BR.orange, card: 'rgba(246,241,232,0.07)', style: 'slam', inDur: 0.28, pace: 0.34, top: 96, bot: 952, td: 0.4 },
  euro: { name: 'eurodance', fast: true, bgk: 'euro', trans: 'iris', wipe: BR.buddy, bpm: 128, dark: false, bg: BR.cream, ink: BR.ink, soft: BR.text2, mute: BR.meta, line: 'rgba(23,19,16,0.16)', accent: BR.orange, accentText: BR.glassDark, card: 'rgba(255,255,255,0.8)', style: 'mask', inDur: 0.34, pace: 0.4, top: 96, bot: 984, td: 0.6 },
  rave: { name: 'rave', fast: true, bgk: 'rave', trans: 'slash', wipe: BR.orange, bpm: 144, dark: true, bg: BR.ink, ink: BR.cream, soft: BR.mutedDark, mute: '#8A8273', line: 'rgba(246,241,232,0.16)', accent: BR.orange, accentText: BR.orange, card: 'rgba(246,241,232,0.07)', style: 'mask', inDur: 0.3, pace: 0.36, top: 96, bot: 984, td: 0.45 },
  demo: { name: 'demoszene', fast: true, bgk: 'demo', trans: 'mosaic', bpm: 120, dark: true, bg: BR.night, ink: BR.cream, soft: '#B4B9D0', mute: '#7C83A3', line: 'rgba(246,241,232,0.18)', accent: BR.orange, accentText: BR.orange, card: 'rgba(11,16,38,0.72)', style: 'mask', inDur: 0.36, pace: 0.42, top: 104, bot: 936, td: 0.7 },
  /* Drei Retro-Looks (Wunsch vom 22.11.2026). Sie zeichnen nicht mit den Layout-Szenen dieser Datei, sondern mit einem eigenen Renderer
     (retro = Schlüssel in RETRO, siehe retro-old.js und retro-gl.js): „Demo 90“ rechnet einen 320×180-Bildspeicher mit Farbpalette wie eine
     Demo der frühen Neunziger; „Benchmark 97“ und „Benchmark 2000“ zeigen eigene 3D-Szenen im Look der 3D-Benchmarks jener Jahre (WebGL,
     kleine Auflösung, Pixel sichtbar). Vorbild ist jeweils die Machart der Zeit — Szenen, Namen, Logos und Musik sind eigene. */
  old: { name: 'demo90', retro: 'old', fast: true, bgk: 'demo', trans: 'mosaic', bpm: 128, dark: true, bg: BR.night, ink: BR.cream, soft: '#B4B9D0', mute: '#7C83A3', line: 'rgba(246,241,232,0.18)', accent: BR.orange, accentText: BR.orange, card: 'rgba(11,16,38,0.72)', style: 'mask', inDur: 0.36, pace: 0.42, top: 104, bot: 936, td: 0.5 },
  b97: { name: 'benchmark97', retro: 'gl', look: '97', fast: true, bgk: 'demo', trans: 'mosaic', bpm: 136, dark: true, bg: BR.night, ink: BR.cream, soft: '#B4B9D0', mute: '#7C83A3', line: 'rgba(246,241,232,0.18)', accent: BR.orange, accentText: BR.orange, card: 'rgba(11,16,38,0.72)', style: 'mask', inDur: 0.36, pace: 0.42, top: 104, bot: 936, td: 0.5 },
  /* Benchmark-Looks nach Jahrgängen (Wunsch vom 22.11.2026): 1999, 2000, 2001, 2003, 2005 — je mit Intro (intro = Faktor, um den der
     Auftakt gegenüber der Vorlage wächst; er endet mit dem Titel, siehe logoLock). Machart der jeweiligen Zeit, eigene Szenen. */
  b99: { name: 'benchmark99', retro: 'gl', look: '99', intro: 1.7, fast: true, bgk: 'ink', trans: 'mosaic', bpm: 176, dark: true, bg: BR.night, ink: BR.cream, soft: '#B4B9D0', mute: '#7C83A3', line: 'rgba(246,241,232,0.18)', accent: BR.orange, accentText: BR.orange, card: 'rgba(11,16,38,0.72)', style: 'mask', inDur: 0.3, pace: 0.36, top: 96, bot: 984, td: 0.5 },
  b01: { name: 'benchmark2001', retro: 'gl', look: '01', intro: 1.7, fast: true, bgk: 'ink', trans: 'mosaic', bpm: 128, dark: true, bg: BR.night, ink: BR.cream, soft: '#B4B9D0', mute: '#7C83A3', line: 'rgba(246,241,232,0.18)', accent: BR.orange, accentText: BR.orange, card: 'rgba(11,16,38,0.72)', style: 'mask', inDur: 0.3, pace: 0.36, top: 96, bot: 984, td: 0.5 },
  b03: { name: 'benchmark2003', retro: 'gl', look: '03', intro: 1.7, fast: true, bgk: 'ink', trans: 'mosaic', bpm: 152, dark: true, bg: BR.ink, ink: BR.cream, soft: BR.mutedDark, mute: '#8A8273', line: 'rgba(246,241,232,0.16)', accent: BR.orange, accentText: BR.orange, card: 'rgba(246,241,232,0.07)', style: 'mask', inDur: 0.3, pace: 0.36, top: 96, bot: 984, td: 0.5 },
  b05: { name: 'benchmark2005', retro: 'gl', look: '05', intro: 1.7, fast: true, bgk: 'ink', trans: 'mosaic', bpm: 136, dark: true, bg: BR.ink, ink: BR.cream, soft: BR.mutedDark, mute: '#8A8273', line: 'rgba(246,241,232,0.16)', accent: BR.orange, accentText: BR.orange, card: 'rgba(246,241,232,0.07)', style: 'mask', inDur: 0.3, pace: 0.36, top: 96, bot: 984, td: 0.5 },
  /* „mark“ ist kein Trailer: Stimmung nur für die Musik des eigenen Echtzeit-Benchmarks (ldmark.html), Aufruf mit ?plan=… */
  mark: { name: 'ldmark', retro: 'gl', look: '03', intro: 1.7, fast: true, bgk: 'ink', trans: 'mosaic', bpm: 144, dark: true, bg: BR.ink, ink: BR.cream, soft: BR.mutedDark, mute: '#8A8273', line: 'rgba(246,241,232,0.16)', accent: BR.orange, accentText: BR.orange, card: 'rgba(246,241,232,0.07)', style: 'mask', inDur: 0.3, pace: 0.36, top: 96, bot: 984, td: 0.5 },
  b2k: { name: 'benchmark2000', retro: 'gl', look: '2k', intro: 1.7, fast: true, bgk: 'ink', trans: 'mosaic', bpm: 144, dark: true, bg: BR.ink, ink: BR.cream, soft: BR.mutedDark, mute: '#8A8273', line: 'rgba(246,241,232,0.16)', accent: BR.orange, accentText: BR.orange, card: 'rgba(246,241,232,0.07)', style: 'mask', inDur: 0.3, pace: 0.36, top: 96, bot: 984, td: 0.5 },
  /* Zwei Kino-Trailer (Wunsch vom 26.11.2026) mit eigenem Renderer und eigenem Drehbuch (kino.js, kino-a.js, kino-b.js):
     „Über mich · 20 Jahre Erfahrung“ auf der Nacht der Marke, „LD Beyond“ in den Farben und Schriften des Beyond-Designs. */
  ka: { name: 'kino-ueber-mich', retro: 'kino', film: 'a', bgk: 'night', trans: 'cine', bpm: 96, dark: true, bg: BR.night, ink: BR.cream, soft: '#B4B9D0', mute: '#7C83A3', line: 'rgba(246,241,232,0.16)', accent: BR.orange, accentText: BR.orange, card: 'rgba(255,255,255,0.055)', style: 'rise', inDur: 1.0, pace: 1, top: 170, bot: 910, td: 0.9 },
  kb: { name: 'kino-ld-beyond', retro: 'kino', film: 'b', bgk: 'night', trans: 'cine', bpm: 112, dark: true, bg: '#05070c', ink: '#e8eef8', soft: '#93a1b8', mute: '#7d8aa0', line: 'rgba(148,178,220,0.12)', accent: BR.orange, accentText: BR.orange, card: 'rgba(148,178,220,0.06)', style: 'rise', inDur: 1.0, pace: 1, top: 170, bot: 910, td: 0.9 },
};
/* Genre-Fassungen der beiden Kino-Trailer (Wunsch vom 27.11.2026): ?g=action|thriller|comedy|horror|epos|helden|countdown — eigenes Tempo je Genre;
   Look, Tafeln und Musik stehen in kino-genre.js und kino-musik.js. Ohne ?g= laufen die Filme unverändert in ihrer Grundfassung. */
const KGENRES = { action: { bpm: 144, name: 'action' }, thriller: { bpm: 104, name: 'thriller' }, comedy: { bpm: 120, name: 'komoedie' }, horror: { bpm: 72, name: 'horror' }, epos: { bpm: 80, name: 'epos' }, helden: { bpm: 88, name: 'helden' },
  /* „countdown“ (Wunsch vom 27.11.2026): stiller Teaser, am Ende eine digitale Countdown-Uhr mit Ticken. 120 BPM, damit jede Sekunde der Uhr
     auf einem Schlag liegt (zwei Schläge je Sekunde) — die Musik ist im halben Tempo empfunden. */
  countdown: { bpm: 120, name: 'countdown' } };
const GENRE = ['ka', 'kb'].includes(MOOD) && Object.hasOwn(KGENRES, Q.get('g') ?? '') ? Q.get('g') : null;
const TH = GENRE ? { ...THEMES[MOOD], bpm: KGENRES[GENRE].bpm } : THEMES[MOOD];
/* Treibend, Action und die Tanz-Stimmungen schneiden und blenden auf den Schlag; Cinematic und Ruhig lassen sich Zeit */
const FAST = !!TH.fast;
/* laufende Szene (setzt main.js vor dem Zeichnen) — die Demoszene-Stimmung wählt danach ihren Effekt */
let CUR = null;
/* Renderer der Retro-Looks: RETRO[TH.retro] = { init: async () => …, render: (t) => … } — render zeichnet das ganze Bild (1920×1080) nach g */
const RETRO = {};
/* Auftakt der schnellen Stimmungen: zwei Takte Sweep, dann rastet das Lockup ein — bei nur zwei Takten nach einem */
/* Mit Intro steht der Titel am Ende des Auftakts: einen Takt vor dessen Ende, ab fünf Takten zwei */
const logoLock = (D) => (TH.intro ? D - (D >= 5 * BAR - 0.01 ? 2 : 1) * BAR : FAST ? (D >= 3 * BAR - 0.01 ? 2 * BAR : BAR) : D * 0.6);
const B = 60 / TH.bpm, BAR = 4 * B;
const CY = (TH.top + TH.bot) / 2;
/* Einblendung: Start (in „Schritten“ der Stimmung) und Dauer */
const pin = (lt, step = 0, k = 1) => seg(lt, step * 0.32 * TH.pace, step * 0.32 * TH.pace + TH.inDur * k);
const beatPulse = (t, k = 6) => Math.exp(-(((t % B) + B) % B) * k);
const barPulse = (t, k = 3) => Math.exp(-(((t % BAR) + BAR) % BAR) * k);

/* ---------- Hintergründe ---------- */
const STARS = Array.from({ length: 260 }, (_, i) => ({ x: hash(i * 3.1) * W, y: hash(i * 5.7 + 1) * H, s: 0.6 + hash(i * 7.3 + 2) * 1.9, ph: hash(i * 1.9 + 3) * 6.283, d: 0.3 + hash(i * 2.3 + 4) * 0.7 }));
function bgNight(t, o = {}) {
  const gr = g.createLinearGradient(0, 0, 0, H); gr.addColorStop(0, '#0B1026'); gr.addColorStop(1, '#060917'); g.fillStyle = gr; g.fillRect(0, 0, W, H);
  glow(W * (0.72 + 0.05 * Math.sin(t * 0.07)), H * 0.3, 900, '#2F7FD6', 0.16);
  glow(W * (0.2 + 0.04 * Math.cos(t * 0.05)), H * 0.85, 760, BR.orange, o.warm ?? 0.07);
  g.save();
  for (const s of STARS) {
    const x = (((s.x - t * 6 * s.d) % W) + W) % W, a = (0.25 + 0.75 * (0.5 + 0.5 * Math.sin(t * (0.6 + s.d) + s.ph))) * (o.stars ?? 1) * s.d;
    g.fillStyle = `rgba(246,241,232,${a * 0.8})`; g.beginPath(); g.arc(x, s.y, s.s * 0.8, 0, 7); g.fill();
  }
  g.restore();
}
/* Mond am Nachthimmel: Scheibe mit wandernder Abdeckung (Sichel → Halbmond), rein als Kulisse */
function skyMoon(cx, cy, r, phase, a = 1) {
  glow(cx, cy, r * 2.6, BR.apricot, 0.1 * a);
  const lay = LT; lay.save(); lay.setTransform(1, 0, 0, 1, 0, 0); lay.clearRect(0, 0, W, H);
  const gr = lay.createRadialGradient(cx - r * 0.3, cy - r * 0.35, r * 0.1, cx, cy, r); gr.addColorStop(0, '#FFF6E6'); gr.addColorStop(1, '#F1DDBF');
  lay.fillStyle = gr; lay.beginPath(); lay.arc(cx, cy, r, 0, 7); lay.fill();
  lay.globalCompositeOperation = 'destination-out'; lay.beginPath(); lay.arc(cx + lerp(0.34, -0.58, phase) * r, cy - lerp(0.12, 0, phase) * r, r * 0.92, 0, 7); lay.fill();
  lay.restore(); g.save(); g.globalAlpha *= a; g.drawImage(lay.canvas, 0, 0); g.restore();
}
function bgInk(t, o = {}) {
  g.fillStyle = BR.ink; g.fillRect(0, 0, W, H);
  const p = beatPulse(t, 5);
  g.save(); g.strokeStyle = `rgba(246,241,232,${0.035 + 0.035 * p * (o.pulse ?? 1)})`; g.lineWidth = 2;
  const step = 150, off = (t * 90) % step;
  for (let x = -H / 2 - step + off; x < W + step; x += step) { g.beginPath(); g.moveTo(x, 0); g.lineTo(x + H / 2, H); g.stroke(); }
  g.restore();
  glow(W * 0.85, H * 0.1, 700, BR.orange, 0.05 + 0.05 * p * (o.pulse ?? 1));
}
const DOTS = (() => { const c = mkLayer(48, 48); c.fillStyle = '#DDD4C4'; c.beginPath(); c.arc(24, 24, 1.6, 0, 7); c.fill(); return c.canvas; })();
function bgCream(t) {
  g.fillStyle = BR.cream; g.fillRect(0, 0, W, H);
  glow(W * (0.78 + 0.06 * Math.sin(t * 0.09)), H * (0.22 + 0.05 * Math.cos(t * 0.07)), 820, BR.apricot, 0.3, false);
  glow(W * (0.14 + 0.05 * Math.cos(t * 0.06)), H * (0.86 + 0.04 * Math.sin(t * 0.08)), 700, '#FFD9B0', 0.36, false);
  g.save(); g.globalAlpha = 0.8; g.fillStyle = g.createPattern(DOTS, 'repeat'); g.fillRect(0, 0, W, H); g.restore();
}
/* Action: schnellere Slash-Streifen, Signalorange pulst auf der Snare (Zählzeiten 2 und 4), Orange auf jedem Schlag */
function bgAction(t) {
  g.fillStyle = BR.ink; g.fillRect(0, 0, W, H);
  const p = beatPulse(t, 7), sn = Math.exp(-((((t - B) % (2 * B)) + 2 * B) % (2 * B)) * 6);
  g.save(); g.strokeStyle = `rgba(246,241,232,${0.03 + 0.045 * p})`; g.lineWidth = 2;
  const step = 110, off = (t * 260) % step;
  for (let x = -H / 2 - step + off; x < W + step; x += step) { g.beginPath(); g.moveTo(x, 0); g.lineTo(x + H / 2, H); g.stroke(); }
  g.restore();
  glow(W * 0.86, H * 0.08, 780, BR.signal, 0.07 + 0.1 * sn);
  glow(W * 0.1, H * 0.96, 700, BR.orange, 0.04 + 0.06 * p);
}

/* ---------- Hintergründe der Tanz-Stimmungen ---------- */
/* Trance: Nachthimmel, Lichtfächer von oben wandern langsam und atmen im Takt, am Horizont ein warmer Schein */
function bgTrance(t, o = {}) {
  const gr = g.createLinearGradient(0, 0, 0, H); gr.addColorStop(0, '#0B1026'); gr.addColorStop(1, '#070B1C'); g.fillStyle = gr; g.fillRect(0, 0, W, H);
  const p = beatPulse(t, 4), k = o.logo ? 0.4 : 1, cols = [BR.apricot, '#2F7FD6', BR.orange, '#2F7FD6', BR.apricot, '#2F7FD6', BR.orange];
  g.save(); g.globalCompositeOperation = 'lighter';
  for (let i = 0; i < 7; i++) {
    const a = (i - 3) * 0.31 + 0.17 * Math.sin(t * 0.33 + i * 1.7), w = 0.05 + 0.02 * Math.sin(t * 0.5 + i), len = H * 1.55, ox = W / 2 + (i - 3) * 70, oy = -170;
    const lg = g.createLinearGradient(ox, oy, ox + Math.sin(a) * len, oy + Math.cos(a) * len); lg.addColorStop(0, rgba(cols[i], (0.2 + 0.1 * p) * k)); lg.addColorStop(1, rgba(cols[i], 0));
    g.fillStyle = lg; g.beginPath(); g.moveTo(ox, oy); g.lineTo(ox + Math.sin(a - w) * len, oy + Math.cos(a - w) * len); g.lineTo(ox + Math.sin(a + w) * len, oy + Math.cos(a + w) * len); g.closePath(); g.fill();
  }
  g.restore();
  for (const s of STARS) { const x = (((s.x - t * 14 * s.d) % W) + W) % W, a = (0.2 + 0.6 * (0.5 + 0.5 * Math.sin(t * (0.8 + s.d) + s.ph))) * s.d; g.fillStyle = `rgba(246,241,232,${a * 0.7})`; g.beginPath(); g.arc(x, s.y, s.s * 0.8, 0, 7); g.fill(); }
  glow(W / 2, H + 140, 900, BR.orange, 0.1 + 0.08 * barPulse(t, 2));
}
/* Hardstyle: Tinte, breite Slash-Streifen, Signalorange stößt auf jedem Schlag von unten; Pegelsäulen am unteren Rand, zur Eins ein Blitz */
const EQ = Array.from({ length: 64 }, (_, i) => 0.35 + 0.65 * hash(i * 4.7 + 2));
function bgHard(t, o = {}) {
  g.fillStyle = BR.ink; g.fillRect(0, 0, W, H);
  const p = beatPulse(t, 8), bp = barPulse(t, 9);
  g.save(); g.strokeStyle = `rgba(246,241,232,${0.03 + 0.05 * p})`; g.lineWidth = 3; const step = 190, off = (t * 330) % step;
  for (let x = -H / 2 - step + off; x < W + step; x += step) { g.beginPath(); g.moveTo(x, 0); g.lineTo(x + H / 2, H); g.stroke(); }
  g.restore();
  glow(W / 2, H + 80, 1000, BR.signal, 0.1 + 0.2 * p); glow(W * 0.9, H * 0.06, 640, BR.orange, 0.05 + 0.07 * p);
  if (!o.logo) { const n = EQ.length, gw = W / n; for (let i = 0; i < n; i++) { const hgt = 14 + 70 * EQ[i] * (0.25 + 0.75 * p) * (0.6 + 0.4 * (0.5 + 0.5 * Math.sin(t * 9 + i * 1.3))); g.fillStyle = rgba(i % 2 ? BR.signal : BR.orange, 0.4); g.fillRect(i * gw + 3, H - 14 - hgt, gw - 6, hgt); } }
  if (bp > 0.05) { g.fillStyle = rgba(BR.cream, 0.07 * bp); g.fillRect(0, 0, W, H); }
}
/* Rave: Tinte, Laserfächer aus beiden unteren Ecken (Ivy-Grün und Signalorange), Dunst in Flow-Violett; auf jedem Schlag blitzen die Laser */
function bgRave(t, o = {}) {
  g.fillStyle = BR.ink; g.fillRect(0, 0, W, H);
  const p = beatPulse(t, 7), k = o.logo ? 0.35 : 1, beat = Math.floor(t / B);
  glow(W * 0.5, H * 0.04, 900, BR.flow, 0.05 + 0.05 * p); glow(W * 0.1, H * 0.96, 640, BR.ivy, 0.06 * k); glow(W * 0.9, H * 0.96, 640, BR.signal, 0.07 * k);
  g.save(); g.globalCompositeOperation = 'lighter'; g.lineCap = 'round';
  [[0, BR.ivy, 1], [W, BR.signal, -1]].forEach(([ox, col, dir], sd) => {
    for (let i = 0; i < 9; i++) {
      const a = 0.16 + i * 0.09 + 0.2 * Math.sin(t * (0.9 + sd * 0.13) + i * 0.5 + (beat % 4) * 0.4), len = W * 1.3;
      g.strokeStyle = rgba(col, (0.16 + 0.3 * p) * k * (i % 2 ? 1 : 0.6)); g.lineWidth = i % 3 === 0 ? 7 : 3.5;
      g.beginPath(); g.moveTo(ox, H + 30); g.lineTo(ox + dir * Math.cos(a) * len, H + 30 - Math.sin(a) * len); g.stroke();
    }
  });
  g.restore();
}
/* Eurodance: Creme, darauf Formen der Neunziger (Kreise, Ringe, Dreiecke, Zickzack, Plus) in den Farben der Produktfamilie — sie hüpfen im
   Takt, je Form auf „ihrer“ Zählzeit. In der Bildmitte, wo der Text steht, bleiben sie blass. */
const SHAPES = Array.from({ length: 34 }, (_, i) => { const x = hash(i * 3.7 + 1) * W, y = hash(i * 9.1 + 2) * H, mid = Math.abs(x - W / 2) < 620 && Math.abs(y - H / 2) < 330; return { x, y, mid, r: 26 + hash(i * 5.3 + 3) * 58, type: i % 6, c: Math.floor(hash(i * 2.9 + 4) * 6), beat: i % 4, rot: hash(i * 6.1 + 5) * 6.283, spin: (hash(i * 1.3 + 6) - 0.5) * 0.5, k: hash(i * 8.3 + 7) * 6.283 }; });
function bgEuro(t, o = {}) {
  g.fillStyle = BR.cream; g.fillRect(0, 0, W, H);
  g.save(); g.globalAlpha = 0.7; g.fillStyle = g.createPattern(DOTS, 'repeat'); g.fillRect(0, 0, W, H); g.restore();
  const cols = [BR.buddy, BR.nova, BR.flow, BR.ivy, BR.orange, BR.apricot], bt = t / B;
  for (const s of SHAPES) {
    const ph = (((bt - s.beat) % 4) + 4) % 4, pop = ph < 1 ? Math.exp(-ph * 5) : 0, r = s.r * (1 + 0.24 * pop);
    g.save(); g.translate(s.x + Math.sin(t * 0.3 + s.k) * 16, s.y + Math.cos(t * 0.26 + s.k) * 16); g.rotate(s.rot + t * s.spin);
    g.globalAlpha = (s.mid ? 0.09 : o.logo ? 0.2 : 0.3) + 0.1 * pop; g.fillStyle = g.strokeStyle = cols[s.c]; g.lineWidth = r * 0.24; g.lineJoin = 'miter';
    if (s.type === 0) { g.beginPath(); g.arc(0, 0, r, 0, 7); g.fill(); }
    else if (s.type === 1) { g.beginPath(); g.arc(0, 0, r, 0, 7); g.stroke(); }
    else if (s.type === 2) { g.beginPath(); g.moveTo(0, -r * 1.1); g.lineTo(r, r * 0.8); g.lineTo(-r, r * 0.8); g.closePath(); g.fill(); }
    else if (s.type === 3) { g.beginPath(); for (let q = 0; q < 6; q++) g.lineTo((q - 2.5) * r * 0.6, q % 2 ? -r * 0.4 : r * 0.4); g.stroke(); }
    else if (s.type === 4) { g.fillRect(-r, -r * 0.18, 2 * r, r * 0.36); g.fillRect(-r * 0.18, -r, r * 0.36, 2 * r); }
    else { g.beginPath(); g.arc(0, 0, r, 0, Math.PI); g.closePath(); g.fill(); }
    g.restore();
  }
}
/* Demoszene: je Szene ein klassischer Effekt — Sternenflug, Kupferbalken, Plasma (grobe Pixel), Schachbrett-Boden, Rechteck-Tunnel,
   Drahtwürfel. Alles in den Tönen der Marke, hinter dem Text zurückgenommen. */
const PX = mkLayer(160, 90), PXD = PX.createImageData(160, 90);
const PAL = (() => { const st = [[0, [11, 16, 38]], [0.3, [11, 42, 74]], [0.55, [47, 127, 214]], [0.78, [255, 120, 22]], [1, [255, 179, 102]]], out = []; for (let i = 0; i < 16; i++) { const v = i / 15; let k = 1; while (k < st.length - 1 && v > st[k][0]) k++; const [a, ca] = st[k - 1], [b, cb] = st[k], q = (v - a) / (b - a); out.push(ca.map((c, j) => Math.round(lerp(c, cb[j], q)))); } return out; })();
const DEMO_FX = { logo: 'stars', claim: 'copper', person: 'plasma', focus: 'cube', origin: 'floor', stack: 'tunnel', journey: 'stars', award: 'copper', works: 'floor', quote: 'stars', labs: 'plasma', labsAll: 'tunnel', hero: 'stars', site: 'floor', quote2: 'copper', family: 'stars', certs: 'tunnel', outro: 'stars' };
function demoStars(t, n = 240) { for (let i = 0; i < n; i++) { const z = 1 - ((hash(i * 1.7 + 0.5) + t * (0.1 + 0.12 * hash(i * 0.9 + 3))) % 1), d = z + 0.06, x = W / 2 + ((hash(i * 3.1 + 1) - 0.5) * W * 0.62) / d, y = H / 2 + ((hash(i * 5.9 + 2) - 0.5) * H * 0.62) / d; if (x < 0 || x > W || y < 0 || y > H) continue; const sz = Math.max(2, Math.round(7 * (1 - z))); g.fillStyle = `rgba(246,241,232,${0.25 + 0.75 * (1 - z)})`; g.fillRect(Math.round(x), Math.round(y), sz, sz); } }
function demoPlasma(t) { const d = PXD.data; let o = 0; for (let y = 0; y < 90; y++) for (let x = 0; x < 160; x++) { const v = Math.sin(x * 0.09 + t) + Math.sin(y * 0.11 - t * 1.3) + Math.sin((x + y) * 0.06 + t * 0.7) + Math.sin(Math.hypot(x - 80 + 40 * Math.sin(t * 0.5), y - 45 + 20 * Math.cos(t * 0.4)) * 0.14 - t * 1.6), c = PAL[clamp(Math.floor((v + 4) * 2), 0, 15)]; d[o++] = c[0]; d[o++] = c[1]; d[o++] = c[2]; d[o++] = 255; } PX.putImageData(PXD, 0, 0); g.save(); g.imageSmoothingEnabled = false; g.drawImage(PX.canvas, 0, 0, W, H); g.restore(); }
function demoFloor(t) { const d = PXD.data, hz = 38; let o = 0; for (let y = 0; y < 90; y++) for (let x = 0; x < 160; x++) { let c = PAL[0]; if (y > hz) { const z = 22 / (y - hz), u = (x - 80) * z * 0.12, on = (Math.floor(u) + Math.floor(z * 3 + t * 3)) & 1, f = clamp((y - hz) / 30); c = on ? PAL[Math.round(2 + 6 * f)] : PAL[Math.round(1 * f)]; } d[o++] = c[0]; d[o++] = c[1]; d[o++] = c[2]; d[o++] = 255; } PX.putImageData(PXD, 0, 0); g.save(); g.imageSmoothingEnabled = false; g.drawImage(PX.canvas, 0, 0, W, H); g.restore(); demoStars(t * 0.6, 90); }
function demoCopper(t) { const bars = [0, 1, 2, 3, 4].map((i) => ({ y: H / 2 + Math.sin(t * 1.25 + i * 0.85) * H * 0.34, z: Math.cos(t * 1.25 + i * 0.85), i })).sort((a, b) => a.z - b.z); for (const b of bars) for (let q = 0; q < 11; q++) { const v = 1 - Math.abs(q - 5) / 5.5, c = b.i % 2 ? [47 + 120 * v, 127 + 100 * v, 214 + 30 * v] : [255, 77 + 150 * v, 28 + 110 * v]; g.fillStyle = `rgba(${Math.round(c[0] * (0.35 + 0.65 * v))},${Math.round(c[1] * (0.35 + 0.65 * v))},${Math.round(c[2] * (0.35 + 0.65 * v))},0.9)`; g.fillRect(0, Math.round(b.y) - 33 + q * 6, W, 6); } }
function demoTunnel(t) { g.save(); g.translate(W / 2, H / 2); for (let i = 0; i < 14; i++) { const s = (i / 14 + t * 0.22) % 1, sz = 60 + s * s * 1900; g.save(); g.rotate(t * 0.25 + i * 0.22); g.strokeStyle = rgba(i % 2 ? '#2F7FD6' : BR.orange, 0.15 + 0.6 * s); g.lineWidth = 2 + 6 * s; g.strokeRect(-sz / 2, -sz / 2, sz, sz); g.restore(); } g.restore(); }
function demoCube(t) { demoStars(t * 0.5, 120); const V = [[-1, -1, -1], [1, -1, -1], [1, 1, -1], [-1, 1, -1], [-1, -1, 1], [1, -1, 1], [1, 1, 1], [-1, 1, 1]], Ed = [[0, 1], [1, 2], [2, 3], [3, 0], [4, 5], [5, 6], [6, 7], [7, 4], [0, 4], [1, 5], [2, 6], [3, 7]], a = t * 0.9, b = t * 0.6; const P = V.map(([x, y, z]) => { const x1 = x * Math.cos(a) - z * Math.sin(a), z1 = x * Math.sin(a) + z * Math.cos(a), y1 = y * Math.cos(b) - z1 * Math.sin(b), z2 = y * Math.sin(b) + z1 * Math.cos(b), f = 3.2 / (4.2 + z2); return [W / 2 + x1 * f * 330, H / 2 + y1 * f * 330]; }); g.save(); g.strokeStyle = rgba(BR.orange, 0.75); g.lineWidth = 4; g.lineJoin = 'round'; Ed.forEach(([i, j]) => { g.beginPath(); g.moveTo(P[i][0], P[i][1]); g.lineTo(P[j][0], P[j][1]); g.stroke(); }); g.fillStyle = BR.cream; P.forEach(([x, y]) => g.fillRect(x - 5, y - 5, 10, 10)); g.restore(); }
function bgDemo(t, o = {}) {
  g.fillStyle = BR.night; g.fillRect(0, 0, W, H);
  const fx = o.logo ? 'stars' : DEMO_FX[CUR?.id] ?? 'stars';
  if (fx === 'plasma') demoPlasma(t); else if (fx === 'floor') demoFloor(t); else if (fx === 'copper') demoCopper(t); else if (fx === 'tunnel') demoTunnel(t); else if (fx === 'cube') demoCube(t); else demoStars(t);
  /* hinter dem Text zurücknehmen; die Sterne bleiben klar */
  if (fx !== 'stars') { g.fillStyle = rgba(BR.night, fx === 'plasma' ? 0.74 : fx === 'floor' ? 0.66 : 0.52); g.fillRect(0, 0, W, H); }
}
const BGS = { night: bgNight, ink: bgInk, action: bgAction, cream: bgCream, trance: bgTrance, hard: bgHard, rave: bgRave, euro: bgEuro, demo: bgDemo };
function bg(t, o) { BGS[TH.bgk](t, o); }

/* ---------- Bausteine ---------- */
/* Zeichnet in eine eigene Ebene und blendet sie links und rechts weich aus (Laufbänder, Bildreihen) — der Hintergrund bleibt unberührt,
   auch wenn er sich bewegt (Lichtfächer, Laser, Demo-Effekte). */
function softEdges(edge, fn) {
  drawInto(LT, () => { fn(); g.globalAlpha = 1; g.globalCompositeOperation = 'destination-in'; const gr = g.createLinearGradient(0, 0, W, 0); gr.addColorStop(0, 'rgba(0,0,0,0)'); gr.addColorStop(edge / W, '#000'); gr.addColorStop(1 - edge / W, '#000'); gr.addColorStop(1, 'rgba(0,0,0,0)'); g.fillStyle = gr; g.fillRect(0, 0, W, H); });
  g.drawImage(LT.canvas, 0, 0);
}
function kicker(str, x, y, p = 1, align = 'left') { label(str, x, y + (1 - eOut(p)) * 10, { size: 22, color: TH.accentText, alpha: eOut(p), align }); }
function pill(str, x, y, o = {}) {
  const size = o.size ?? 24, padX = size * 0.75, w = measure(str, size, 600) + padX * 2, h = size * 1.9;
  g.save(); g.globalAlpha *= o.alpha ?? 1;
  rr(x, y - h / 2, w, h, 999); g.fillStyle = o.fill ?? TH.card; g.fill(); g.strokeStyle = o.stroke ?? TH.line; g.lineWidth = 1.5; g.stroke();
  text(str, x + padX, y + size * 0.35, { size, weight: 600, color: o.color ?? TH.ink });
  g.restore(); return w;
}
function hair(x1, y, x2, a = 1) { g.save(); g.globalAlpha *= a; g.strokeStyle = TH.line; g.lineWidth = 1.5; g.beginPath(); g.moveTo(x1, y); g.lineTo(x2, y); g.stroke(); g.restore(); }
function card(x, y, w, h, r = 20, a = 1) { g.save(); g.globalAlpha *= a; rr(x, y, w, h, r); g.fillStyle = TH.card; g.fill(); g.strokeStyle = TH.line; g.lineWidth = 1.5; g.stroke(); g.restore(); }
/* Verlauf der Glas-Tönung (Brand: #FFB366 → #FF7816 → #FF4D1C) als Textfüllung für Headline-Akzente */
function glassFill(y0, y1) { const gr = g.createLinearGradient(0, y0, 0, y1); gr.addColorStop(0, BR.apricot); gr.addColorStop(0.55, BR.orange); gr.addColorStop(1, BR.signal); return gr; }

/* ---------- Szene: Logo (Auftakt) ---------- */
function scLogo(lt, D) {
  bg(lt, { warm: 0.1, logo: true });
  const cx = W / 2, cy = CY - 30, hBig = 240, m = 150;
  const tLock = logoLock(D); // ab hier wird das Zeichen zum Lockup
  const pl = E_REVEAL(seg(lt, tLock, tLock + (FAST ? 0.5 : 1.1)));
  /* Lichtblitz auf dem Schlag — hinter dem Zeichen (kein Effekt auf dem Zeichen selbst) */
  if (FAST && lt >= tLock) { const f = Math.exp(-(lt - tLock) * 7); g.fillStyle = TH.dark ? rgba(BR.cream, 0.3 * f) : rgba(BR.apricot, 0.35 * f); g.fillRect(0, 0, W, H); }
  const size = 0.9275 * m, mw = (m * 28) / 24, total = mw + 0.46 * m + wordmarkWidth(size), x0 = cx - total / 2;
  const zx = lerp(cx, x0 + mw / 2, pl), zh = lerp(hBig, m, pl);
  if (MOOD === 'cine') {
    glow(cx, cy, 620, BR.apricot, 0.08 * (1 - pl));
    /* Vom alten Logo — dem Mond in der Glaskugel, Originalbild — zum Zeichen: die Kugel tritt zurück, das Zeichen kommt mit dem Reveal der Marke */
    const p = seg(lt, 0.35, tLock - 0.25), o1 = eOut(seg(p, 0, 0.14)), o2 = eIO(seg(p, 0.5, 0.72)), ps = seg(p, 0.6, 1);
    if (o2 < 1 && IMG.oldLogo) { const d = 460 * lerp(0.94, 1.03, eOut(seg(p, 0, 0.6))) * (1 - 0.14 * o2); g.save(); g.globalAlpha = o1 * (1 - o2); g.drawImage(IMG.oldLogo, cx - d / 2, cy - d / 2, d, d); g.restore(); }
    if (o2 > 0 && p < 1) glow(cx, cy, 520, BR.apricot, 0.16 * Math.sin(Math.PI * seg(p, 0.5, 0.95)));
    if (p >= 1) zeichen(zx, cy, zh); else if (ps > 0) zeichenReveal(cx, cy, hBig, ps);
  } else if (FAST) {
    if (lt < tLock - 0.15) { const loop = (lt % (2 * B)) / (2 * B); zeichenSweep(cx, cy, hBig, loop); }
    else { const k = seg(lt, tLock - 0.15, tLock); g.save(); g.globalAlpha = 1 - k; zeichenSweep(cx, cy, hBig, 1); g.restore(); g.save(); g.globalAlpha = k; zeichen(zx, cy, zh); g.restore(); }
  } else {
    const p = seg(lt, 0.7, 2.5); if (p < 1) zeichenReveal(cx, cy, hBig, p); else zeichen(zx, cy, zh);
  }
  if (pl > 0) {
    /* Die Wortmarke kommt hinter dem Zeichen hervor: links vom Zeichen (plus Abstand) bleibt sie abgeschnitten — nie Schrift über dem Zeichen */
    const edge = zx + (zh * 28) / 48 + 0.2 * m;
    g.save(); g.beginPath(); g.rect(edge, 0, W - edge, H); g.clip();
    wordmark(x0 + mw + 0.46 * m, cy + size * 0.345, size, TH.ink, { p: seg(pl, 0.25, 1) });
    g.restore();
    const pt = seg(lt, tLock + (FAST ? 0.5 : 1.0), tLock + (FAST ? 0.9 : 2.0));
    const tag = `${NAME} · ${ROLE} · ${FOCUS.join(', ')}`;
    text(tag, cx, cy + m * 0.5 + 92 + (1 - eOut(pt)) * 10, { size: 24, weight: 500, fam: MONO, align: 'center', color: TH.soft, alpha: eOut(pt) });
  }
}

/* ---------- Szene: Anspruch ---------- */
function scClaim(lt, D) {
  bg(lt);
  const size = 176;
  if (MOOD === 'cine') {
    skyMoon(W * 0.855, CY - 20, 215, eIO(seg(lt, 0, D)), eOut(seg(lt, 0, 1.6))); // rechts neben der Zeile, nie auf der Schrift
    const x = 190, y = CY - 40;
    kicker(T.claimKicker, x, y - size * 0.95, pin(lt, 0));
    drawLine(tokens(CLAIM[0]), x, y, size, pin(lt, 1, 1.2), { style: 'rise', color: TH.ink });
    g.save(); g.fillStyle = glassFill(y + 40, y + size * 1.15);
    drawLine(tokens(CLAIM[1], { serif: true }), x, y + size * 1.06, size, pin(lt, 3, 1.2), { style: 'rise', color: g.fillStyle }); g.restore();
    text(T.claimSub.join(' '), x + 6, y + size * 1.06 + 96, { size: 40, weight: 500, color: TH.soft, alpha: eOut(pin(lt, 6)) });
  } else if (FAST) {
    const cx = W / 2, y = CY - 20, toks = [...tokens(CLAIM[0]), ...tokens(CLAIM[1], { serif: true, color: BR.orange })];
    /* je Schlag ein Wort; die Zeile steht nach fünf Schlägen */
    const L1 = layoutLine(tokens(CLAIM[0]), size), L2 = layoutLine(tokens(CLAIM[1], { serif: true }), size);
    const at = (i) => seg(lt, i * B, i * B + 0.2);
    let k = 0;
    L1.items.forEach((it) => { const q = at(k++); if (q > 0) { g.save(); const px = cx - L1.width / 2 + it.x + it.w / 2; g.translate(px, y - 50); g.scale(lerp(1.4, 1, eOut5(q)), lerp(1.4, 1, eOut5(q))); g.translate(-px, -(y - 50)); text(it.t, cx - L1.width / 2 + it.x, y, { size: it.sz, weight: 800, ls: it.ls, color: TH.ink, alpha: seg(q, 0, 0.4) }); g.restore(); } });
    L2.items.forEach((it) => { const q = at(k++); if (q > 0) { g.save(); const px = cx - L2.width / 2 + it.x + it.w / 2; g.translate(px, y + size); g.scale(lerp(1.4, 1, eOut5(q)), lerp(1.4, 1, eOut5(q))); g.translate(-px, -(y + size)); text(it.t, cx - L2.width / 2 + it.x, y + size * 1.06, { size: it.sz, weight: 400, fam: SER, italic: true, color: TH.accent, alpha: seg(q, 0, 0.4) }); g.restore(); } });
    void toks;
    kicker(T.claimKicker, cx, y - size * 0.98, seg(lt, 0, 0.3), 'center');
    const ps = seg(lt, 6 * B, 6 * B + 0.3);
    if (ps > 0) { const str = T.claimSub.join(' '), w = measure(str, 40, 700) + 56; g.save(); g.globalAlpha = ps; g.fillStyle = TH.ink; rr(cx - w / 2, y + size * 1.06 + 50, w * E_WIPE(ps), 66, 8); g.fill(); g.beginPath(); g.rect(cx - w / 2, y + size * 1.06 + 50, w * E_WIPE(ps), 66); g.clip(); text(str, cx, y + size * 1.06 + 97, { size: 40, weight: 700, color: TH.bg, align: 'center' }); g.restore(); }
  } else {
    const cx = W / 2, y = CY - 30;
    kicker(T.claimKicker, cx, y - size * 0.98, pin(lt, 0), 'center');
    drawLine(tokens(CLAIM[0]), cx, y, size, pin(lt, 1, 1.3), { style: 'fade', color: TH.ink, align: 'center', weight: 700 });
    drawLine(tokens(CLAIM[1], { serif: true }), cx, y + size * 1.04, size, pin(lt, 3, 1.3), { style: 'fade', color: BR.orange, align: 'center' });
    const ph = eIO(pin(lt, 5)); hair(cx - 60 * ph, y + size * 1.04 + 58, cx + 60 * ph, ph);
    text(T.claimSub.join(' '), cx, y + size * 1.04 + 124, { size: 44, weight: 400, fam: SER, italic: true, align: 'center', color: TH.soft, alpha: eOut(pin(lt, 6)) });
  }
}

/* ---------- Szene: Person ---------- */
function scPerson(lt, D) {
  bg(lt);
  const x = 180, top = TH.top + 60;
  kicker(T.personKicker, x, top + 30, pin(lt, 0));
  const nSize = fit(NAME, 1000, 156, 800, MAN, -0.03);
  drawLine(tokens(NAME), x, top + 30 + nSize * 1.05, nSize, pin(lt, 1, 1.1), { style: TH.style, color: TH.ink });
  const yR = top + 30 + nSize * 1.05 + 76;
  text(ROLE, x + 4, yR + (1 - eOut(pin(lt, 3))) * 12, { size: 46, weight: 500, color: TH.soft, alpha: eOut(pin(lt, 3)), ls: -0.6 });
  let px = x; FOCUS.concat([T.place]).forEach((f, i) => { const a = eOut(pin(lt, 4.5 + i * 0.6)); px += pill(f, px, yR + 78, { alpha: a, size: 26, stroke: i === 3 ? TH.accent : undefined, color: TH.ink }) + 14; });
  /* rotierende Rolle (wie auf der Startseite) */
  const per = FAST ? 2 * B : MOOD === 'cine' ? BAR : BAR * 0.9, ri = Math.floor(Math.max(0, lt - 1.2) / per), rp = (Math.max(0, lt - 1.2) % per) / per;
  const ra = Math.min(seg(rp, 0, 0.18), 1 - seg(rp, 0.85, 1)) * eOut(pin(lt, 6));
  label('→ ' + T.roles[ri % T.roles.length], x + 4, yR + 168, { size: 22, color: TH.accentText, alpha: ra, track: 0.1 });
  /* Sekundenzähler */
  const yC = TH.bot - 96, pc = pin(lt, 5, 1.4);
  const val = SEC0 - (1 - eOut5(pc)) * 9.5e5 + Math.floor(lt);
  text(fmtInt(val, LANG), x, yC, { size: 104, weight: 700, fam: MONO, color: TH.ink, alpha: eOut(pc), ls: -3 });
  text(T.secLabel, x + 4, yC + 48, { size: 26, weight: 500, color: TH.soft, alpha: eOut(pin(lt, 7)) });
  /* Kennzahlen rechts */
  const rx = 1330, rw = 410; let ry = top + 60;
  T.stats.forEach(([a, b], i) => {
    const p = FAST ? seg(lt, (2 + i) * B, (2 + i) * B + 0.22) : pin(lt, 3 + i * 1.6);
    hair(rx, ry, rx + rw * eOut(p), eOut(p));
    text(a, rx, ry + 118 + (1 - eOut5(p)) * 24, { size: 112, weight: 800, color: i === 0 ? TH.accent : TH.ink, alpha: eOut(p), ls: -4 });
    text(b, rx + measure(a, 112, 800, MAN, -4) + 22, ry + 118, { size: 34, weight: 500, color: TH.soft, alpha: eOut(p) });
    ry += 176;
  });
  hair(rx, ry, rx + rw, eOut(pin(lt, 8)));
}

/* ---------- Szene: Anfänge (nur 120 s) ---------- */
function scOrigin(lt, D) {
  bg(lt);
  const x = 180, top = TH.top + 40;
  kicker(T.originKicker, x, top + 30, pin(lt, 0));
  const s1 = fit(T.originTitle[0], 1500, 72, 800, MAN, -0.03);
  drawLine(tokens(T.originTitle[0]), x, top + 122, s1, pin(lt, 1), { style: TH.style, color: TH.ink });
  drawLine(tokens(T.originTitle[1], { serif: true }), x, top + 122 + s1 * 1.12, s1, pin(lt, 3), { style: TH.style, color: TH.accent });
  /* Filmstreifen der frühen Arbeiten (Originalbilder) */
  const cw = 500, ch = 330, gap = 44, y = top + 290, span = ORIGIN.length * (cw + gap);
  const scroll = lerp(0, span - (W - 2 * x) + 40, eIO(seg(lt, 0.8, D - 0.4)));
  ORIGIN.forEach((it, i) => {
    const cx = x + i * (cw + gap) - scroll, a = eOut(pin(lt, 2 + i * 0.7));
    if (cx > W || cx + cw < 0 || a <= 0) return;
    g.save(); g.globalAlpha = a; g.translate(0, (1 - a) * 40);
    browser(IMG[it.img], cx, y, cw, ch, { dark: TH.dark, bar: 30, r: 12, blur: 30, shadow: TH.dark ? 'rgba(0,0,0,0.45)' : 'rgba(23,19,16,0.16)', py: 0 });
    label(it.y, cx + 2, y + ch + 46, { size: 20, color: TH.accentText });
    text(it[LANG][0], cx + 86, y + ch + 46, { size: 26, weight: 700, color: TH.ink });
    text(it[LANG][1], cx + 86, y + ch + 80, { size: 20, weight: 500, color: TH.soft });
    g.restore();
  });
}

/* ---------- Szene: Stack ---------- */
function scStack(lt, D) {
  bg(lt);
  const x = 180, top = TH.top + 40;
  kicker(T.stackKicker, x, top + 30, pin(lt, 0));
  text(T.stackTitle[0], x, top + 104, { size: 44, weight: 500, color: TH.soft, alpha: eOut(pin(lt, 1)) });
  const s2 = fit(T.stackTitle[1], 1560, 76, 800, MAN, -0.03);
  drawLine(tokens(T.stackTitle[1]), x, top + 104 + s2 * 1.18, s2, pin(lt, 2, 1.2), { style: TH.style, color: TH.ink });
  /* Laufbänder: Fokus-Technologien voll, der Rest zurückgenommen; Trenner = Slash der Marke */
  const speed = FAST ? 240 : MOOD === 'cine' ? 70 : 34, size = 92, y0 = top + 340, dy = (TH.bot - 110 - y0) / 2;
  softEdges(220, () => STACK_ROWS.forEach((row, r) => {
    const a = eOut(pin(lt, 3 + r));
    g.save(); g.globalAlpha = a; setFont(size, 800); g.letterSpacing = -0.03 * size + 'px';
    const widths = row.map((w) => g.measureText(w).width), sep = 96, total = widths.reduce((s, w) => s + w + sep, 0);
    let px = -(((lt * speed * (r % 2 ? -1 : 1) + r * 300) % total) + total) % total - total;
    const y = y0 + r * dy + (1 - a) * 30;
    while (px < W) {
      row.forEach((w, i) => {
        if (px + widths[i] > -50 && px < W + 50) {
          const foc = STACK_FOCUS.includes(w);
          g.fillStyle = foc ? TH.ink : rgba(TH.dark ? BR.cream : BR.ink, TH.dark ? 0.26 : 0.24); g.textBaseline = 'alphabetic'; g.fillText(w, px, y);
          g.save(); g.translate(px + widths[i] + sep / 2 - 14, y - size * 0.72); g.scale(size * 0.03, size * 0.03); g.translate(-13, -11); g.fillStyle = TH.accent; g.globalAlpha *= 0.9; g.fill(ZP.slash); g.restore();
        }
        px += widths[i] + sep;
      });
    }
    g.restore();
  }));
  const pn = eOut(pin(lt, 7)); label(T.stackNext + ' — ' + STACK_NEXT.join(' · '), W - 180, top + 30, { size: 20, color: TH.soft, alpha: pn, align: 'right', track: 0.08 });
}

/* ---------- Szene: Reise ---------- */
/* Auswahl für kurze Fassungen: Start (Ausbildung), Profi-Start, Lead + Gold, heute — dann der Rest */
function journeyPick(n) { const order = ['2000', '2007', '2016', '2026', '2004', '2020', '2010', '2023', '2019']; const keep = order.slice(0, clamp(n, 4, 9)); return JOURNEY.filter((j) => keep.includes(j.y)); }
/* Takte je Station: gleich verteilt; übrige Takte bekommen die gewichtigeren Stationen — jeder Wechsel liegt auf einer Eins */
function journeyBars(n, bars) {
  const list = journeyPick(n), base = Math.max(1, Math.floor(bars / list.length)); let extra = Math.max(0, bars - base * list.length);
  const prio = ['2026', '2016', '2007', '2020', '2023', '2010', '2004', '2019', '2000'], out = list.map(() => base);
  for (const y of prio) { if (extra <= 0) break; const k = list.findIndex((j) => j.y === y); if (k >= 0) { out[k]++; extra--; } }
  return out;
}
function scJourney(lt, D, o) {
  bg(lt);
  const list = journeyPick(o.n), n = list.length;
  /* Stationsgrenzen in Sekunden (o.bars: Takte je Station) */
  const durs = (o.bars ?? list.map(() => D / n / BAR)).map((b) => b * BAR), t0s = durs.map((_, k) => durs.slice(0, k).reduce((a2, b2) => a2 + b2, 0));
  let i = 0; for (let k = 0; k < n; k++) if (lt >= t0s[k]) i = k;
  const Ds = durs[i], q = lt - t0s[i];
  const x = 180, top = TH.top + 40, railY = TH.bot - 70;
  kicker(T.journeyKicker, x, top + 30, pin(lt, 0));
  label(`${String(i + 1).padStart(2, '0')} / ${String(n).padStart(2, '0')}`, W - 180, top + 30, { size: 20, color: TH.soft, align: 'right', alpha: eOut(pin(lt, 1)) });
  const inD = FAST ? 0.2 : MOOD === 'cine' ? 0.7 : 0.9, outD = FAST ? 0 : MOOD === 'cine' ? 0.35 : 0.5;
  const a = seg(q, 0, inD), b = i < n - 1 && outD > 0 ? seg(q, Ds - outD, Ds) : 0, al = eOut(a) * (1 - b);
  const it = list[i], tx = it[LANG], yY = CY + (o.steps ? 0 : 70);
  /* Die Textspalte beginnt hinter der breitesten Jahreszahl — sonst stößt z. B. „2004“ an den Titel */
  const ySize = 280, yW = Math.max(...list.map((s) => measure(s.y, ySize, 800, MAN, -0.045 * ySize)));
  /* Jahr groß */
  g.save(); g.globalAlpha = al;
  const dy = FAST ? 0 : (1 - eOut5(a)) * 60 - b * 40;
  if (FAST) { const sc = lerp(1.1, 1, eOut5(a)); g.translate(x, yY); g.scale(sc, sc); g.translate(-x, -yY); }
  g.fillStyle = TH.dark ? glassFill(yY - ySize * 0.75, yY + 10) : TH.ink;
  setFont(ySize, 800); g.letterSpacing = -0.045 * ySize + 'px'; g.fillText(it.y, x - 10, yY + dy);
  g.restore();
  /* Titel, Rolle, Kurztext */
  const cx = Math.round(x - 10 + yW + 64), cw = W - 180 - cx, ts = fit(tx[0], cw, 92, 800, MAN, -0.03);
  drawLine(tokens(tx[0]), cx, yY - 150, ts, FAST ? seg(q, 0.05, 0.3) : seg(q, 0.1, 0.1 + inD * 1.2), { style: TH.style, color: TH.ink, out: b });
  label(`${tx[1]} · ${tx[2]}`, cx + 2, yY - 84, { size: 24, color: TH.accentText, alpha: eOut(seg(q, 0.2 * TH.pace, 0.2 * TH.pace + inD)) * (1 - b), track: 0.1 });
  let nl = 0; if (o.blurb) nl = para(tx[3], cx + 2, yY - 26, cw, 30, { color: TH.soft, p: seg(q, 0.35 * TH.pace, 0.35 * TH.pace + inD * 1.4), alpha: 1 - b, lh: 1.42 });
  /* Etappen der Station (lange Fassung): nacheinander, je mit Slash der Marke */
  if (o.steps && it.st) {
    const y0 = yY - 26 + nl * 30 * 1.42 + 34, t1 = FAST ? BAR : 1.6, gapT = FAST ? 2 * B : Math.min(1.5, (Ds - t1 - 1.2) / 3);
    it.st[LANG].forEach((str, k) => {
      const ps = eOut(seg(q, t1 + k * gapT, t1 + k * gapT + (FAST ? 0.22 : 0.7))) * (1 - b), yy = y0 + k * 50;
      if (ps <= 0) return;
      g.save(); g.globalAlpha = ps; g.translate(cx + 2 + (1 - ps) * 24, yy - 21); g.scale(0.9, 0.9); g.translate(-13, -11); g.fillStyle = TH.accent; g.fill(ZP.slash); g.restore();
      text(str, cx + 34 + (1 - ps) * 24, yy, { size: fit(str, cw - 40, 30, 600), weight: 600, color: TH.ink, alpha: ps });
    });
  }
  /* Zeitstrahl */
  const x1 = x, x2 = W - 180, pos = (k) => lerp(x1, x2, n === 1 ? 0 : k / (n - 1));
  const mk = lerp(pos(Math.max(0, i - 1)), pos(i), i === 0 ? 1 : E_SWEEP(seg(q, 0, FAST ? 0.25 : 0.8)));
  const pr = eOut(pin(lt, 1, 1.4));
  g.save(); g.globalAlpha = pr; g.strokeStyle = TH.line; g.lineWidth = 2; g.beginPath(); g.moveTo(x1, railY); g.lineTo(x1 + (x2 - x1) * pr, railY); g.stroke();
  g.strokeStyle = TH.accent; g.lineWidth = 3; g.beginPath(); g.moveTo(x1, railY); g.lineTo(mk, railY); g.stroke();
  list.forEach((s, k) => { const on = k <= i; g.fillStyle = on ? TH.accent : TH.bg; g.strokeStyle = on ? TH.accent : TH.mute; g.lineWidth = 2; g.beginPath(); g.arc(pos(k), railY, 6, 0, 7); g.fill(); g.stroke(); label(s.y, pos(k), railY + 40, { size: 18, color: k === i ? TH.ink : TH.mute, align: 'center', track: 0.08 }); });
  g.fillStyle = TH.accent; g.beginPath(); g.arc(mk, railY, 10 + 3 * beatPulse(lt), 0, 7); g.fill();
  g.restore();
}

/* ---------- Szene: Auszeichnung ---------- */
function scAward(lt, D) {
  bg(lt, { warm: 0.14 });
  const cx = W / 2, cy = CY - 10, p0 = pin(lt, 0), R = Math.min(350, (TH.bot - TH.top) / 2 - 8);
  /* Strahlenkranz aus Strichen, langsam drehend; alle Texte stehen innerhalb */
  g.save(); g.translate(cx, cy); g.rotate(lt * 0.05); g.strokeStyle = TH.accent; g.lineWidth = 3;
  for (let i = 0; i < 90; i++) { const a = (i / 90) * 6.283, r0 = R - 34 + (i % 3 === 0 ? -16 : 0), r1 = R, k = eOut(seg(p0 * 1.6 - i / 130, 0, 1)); g.globalAlpha = (TH.dark ? 0.5 : 0.55) * k * (i % 3 === 0 ? 1 : 0.45); g.beginPath(); g.moveTo(Math.cos(a) * r0, Math.sin(a) * r0); g.lineTo(Math.cos(a) * lerp(r0, r1, k), Math.sin(a) * lerp(r0, r1, k)); g.stroke(); }
  g.restore();
  if (TH.dark) glow(cx, cy, 520, BR.apricot, 0.1 + 0.05 * barPulse(lt));
  kicker(T.awardKicker, cx, cy - 196, p0, 'center');
  const gs = 210, pg = FAST ? seg(lt, B, B + 0.25) : pin(lt, 1.5, 1.3);
  g.save(); const fill = glassFill(cy - 170, cy - 10);
  if (FAST) { const sc = lerp(1.5, 1, eOut5(pg)); g.translate(cx, cy - 70); g.scale(sc, sc); g.translate(-cx, -(cy - 70)); }
  text('Gold', cx, cy - 6 + (FAST ? 0 : (1 - eOut5(pg)) * 40), { size: gs * SERIF_SCALE, weight: 400, fam: SER, italic: true, align: 'center', color: fill, alpha: eOut(pg) });
  g.restore();
  const p2 = pin(lt, 4), p3 = pin(lt, 5.5), p4 = pin(lt, 7);
  text(T.awardTop, cx, cy + 84 + (1 - eOut(p2)) * 14, { size: 52, weight: 800, align: 'center', color: TH.ink, alpha: eOut(p2), ls: -1.5 });
  text(T.awardCat, cx, cy + 132, { size: 27, weight: 600, align: 'center', color: TH.soft, alpha: eOut(p3) });
  text(T.awardWhat, cx, cy + 170, { size: 27, weight: 500, align: 'center', color: TH.soft, alpha: eOut(p3) });
  text(T.awardNote, cx, cy + 226, { size: fit(T.awardNote, 2 * R - 190, 31, 400, SER, 0, true), weight: 400, fam: SER, italic: true, align: 'center', color: TH.accentText, alpha: eOut(p4) });
}

/* ---------- Szene: Labs ---------- */
function scLabs(lt, D, o) {
  bg(lt);
  const x = 150, top = TH.top + 30;
  const more = o.more, D1 = more ? D * 0.72 : D, ph2 = more ? seg(lt, D1 - 0.3, D1 + 0.5) : 0;
  kicker(T.labsKicker, x, top + 30, pin(lt, 0));
  const ts = fit(`${T.labsTitle[0]} ${T.labsTitle[1]}`, 1290, 78, 700); // bleibt links von der Zahl
  drawLine(tokens(T.labsTitle[0]), x, top + 122, ts, pin(lt, 1), { style: TH.style, color: TH.ink });
  drawLine(tokens(T.labsTitle[1], { serif: true }), x + layoutLine(tokens(T.labsTitle[0]), ts).width + ts * 0.3, top + 122, ts, pin(lt, 2.5), { style: TH.style, color: TH.accent });
  const pc = eOut(pin(lt, 3));
  text(String(LABS_COUNT), W - 150, top + 126, { size: 128, weight: 800, align: 'right', color: TH.accent, alpha: pc, ls: -5 });
  label(T.labsCount, W - 150 - measure(String(LABS_COUNT), 128, 800, MAN, -5) - 24, top + 124, { size: 22, color: TH.soft, align: 'right', alpha: pc });
  /* drei Karten, die aktive spielt eine Bildfolge */
  const cw = 520, ch = 292, gap = 30, x0 = (W - 3 * cw - 2 * gap) / 2, y = top + 200, per = D1 / 3, act = clamp(Math.floor(lt / per), 0, 2);
  LABS.forEach((L, i) => {
    const a = eOut(pin(lt, 3 + i * 1.2)) * (1 - ph2); if (a <= 0) return;
    const on = i === act, k = on ? eOut(seg(lt - i * per, 0, 0.5)) : 1 - eOut(seg(lt - (i + 1) * per, 0, 0.4)), on01 = i === act ? k : i < act ? k : 0;
    const cx = x0 + i * (cw + gap), sc = 1 + 0.045 * on01;
    g.save(); g.globalAlpha = a; g.translate(cx + cw / 2, y + ch / 2 + (1 - a) * 50 - ph2 * 40); g.scale(sc, sc); g.translate(-(cx + cw / 2), -(y + ch / 2));
    g.save(); g.shadowColor = TH.dark ? 'rgba(0,0,0,0.5)' : 'rgba(23,19,16,0.18)'; g.shadowBlur = 40; g.shadowOffsetY = 18; g.fillStyle = '#000'; rr(cx, y, cw, ch, 18); g.fill(); g.restore();
    /* Bildwechsel: Treibend auf jedem Schlag, sonst so, dass jede Karte mindestens zwei Bilder zeigt */
    const cut = FAST ? B : per / clamp(Math.round(per / (MOOD === 'cine' ? 1.25 : 1.6)), Math.min(2, L.shots.length), L.shots.length);
    const lt2 = Math.max(0, lt - i * per), si = on ? Math.floor(lt2 / cut) % L.shots.length : 0, sp = on ? (lt2 % cut) / cut : 1;
    imgCover(IMG[L.shots[si]], cx, y, cw, ch, 18, { zoom: 1.04 + 0.05 * sp });
    if (on && !FAST && sp < 0.25) { g.save(); g.globalAlpha *= 1 - sp / 0.25; imgCover(IMG[L.shots[(si + L.shots.length - 1) % L.shots.length]], cx, y, cw, ch, 18, { zoom: 1.09 }); g.restore(); }
    if (!on) { g.fillStyle = rgba(TH.dark ? '#000000' : BR.cream, TH.dark ? 0.42 : 0.35); rr(cx, y, cw, ch, 18); g.fill(); }
    g.strokeStyle = on ? TH.accent : TH.line; g.lineWidth = on ? 3 : 1.5; rr(cx, y, cw, ch, 18); g.stroke();
    label(`${L[LANG][0]} · ${L.d}`, cx + 4, y + ch + 40, { size: 17, color: TH.accentText, track: 0.1 });
    text(L.name, cx + 2, y + ch + 86, { size: 40, weight: 800, color: TH.ink, ls: -1 });
    if (o.desc) para(L[LANG][1], cx + 4, y + ch + 124, cw - 10, 22, { color: TH.soft, lh: 1.4, alpha: on ? 1 : 0.6 });
    if (L.credit && on) label(T.osm, cx + 14, y + ch - 16, { size: 13, color: 'rgba(255,255,255,0.85)', track: 0.04 });
    g.restore();
  });
  if (ph2 > 0) {
    /* die weiteren Projekte: Zeilen umbrechen und mittig setzen */
    const size = 34, gapX = 16, gapY = 84, maxW = W - 2 * x, rowsL = []; let cur = [], cw2 = 0;
    LABS_MORE.forEach((str) => { const w = measure(str, size, 600) + size * 1.5; if (cur.length && cw2 + gapX + w > maxW) { rowsL.push(cur); cur = []; cw2 = 0; } cw2 += (cur.length ? gapX : 0) + w; cur.push([str, w]); });
    if (cur.length) rowsL.push(cur);
    const cy0 = (y + TH.bot) / 2 - ((rowsL.length - 1) * gapY) / 2 + 14; let idx = 0;
    label(T.labsMore, W / 2, cy0 - 72, { size: 24, color: TH.soft, align: 'center', alpha: eOut(ph2) });
    rowsL.forEach((row, r) => { const tot = row.reduce((a2, it) => a2 + it[1] + gapX, -gapX); let px = (W - tot) / 2; row.forEach(([str, w]) => { const k = idx++, t1 = D1 + 0.1 + k * (FAST ? 0.035 : 0.06), a = eOut(seg(lt, t1, t1 + 0.5)); g.save(); g.translate(0, (1 - a) * 24); pill(str, px, cy0 + r * gapY, { size, alpha: a, stroke: str === 'LD Beyond.' ? TH.accent : undefined }); g.restore(); px += w + gapX; }); });
  }
}

/* ---------- Szene: Plattform (LD Beyond) ---------- */
function scSite(lt, D, o) {
  bg(lt);
  const x = 150, top = TH.top + 40;
  kicker(T.siteKicker, x, top + 30, pin(lt, 0));
  const ts = 96;
  drawLine(tokens(T.siteTitle[0]), x, top + 140, ts, pin(lt, 1), { style: TH.style, color: TH.ink });
  drawLine(tokens(T.siteTitle[1], { serif: true }), x, top + 140 + ts * 1.06, ts, pin(lt, 2.5), { style: TH.style, color: TH.accent });
  let yy = top + 140 + ts * 1.06 + 70;
  if (o.desc) yy += para(T.siteDesc, x + 2, yy, 560, 27, { color: TH.soft, p: pin(lt, 4, 1.4), lh: 1.45 }) * 39 + 26;
  let px = x, py = yy + 10;
  T.siteChips.forEach((c, i) => { const a = eOut(FAST ? seg(lt, (2 + i * 0.5) * B, (2 + i * 0.5) * B + 0.2) : pin(lt, 5 + i * 0.6)); const w = measure(c, 22, 600) + 33; if (px + w > x + 570) { px = x; py += 58; } /* bleibt links vom Telefon */ px += pill(c, px, py, { size: 22, alpha: a, stroke: i === 0 ? TH.accent : undefined }) + 10; });
  /* Browser mit der neuen Website: Ansichten wechseln, jede fährt langsam nach unten */
  const views = ['siteBeyond', 'siteHome', 'siteLabs', 'siteStory'].filter((k) => IMG[k]);
  const bx = 850, bw = 930, bh = 600, by = CY - bh / 2 + 6, pb = eOut(pin(lt, 2, 1.3));
  const per = Math.max(D / Math.min(views.length || 1, o.views ?? 4), 1.2), vi = Math.floor(lt / per) % Math.max(1, views.length), vp = (lt % per) / per;
  g.save(); g.globalAlpha = pb; g.translate(0, (1 - pb) * 60);
  browser(IMG[views[vi]], bx, by, bw, bh, { dark: true, url: 'loona-designs.de', scroll: eIO(vp) * 0.55, shadow: TH.dark ? 'rgba(0,0,0,0.6)' : 'rgba(23,19,16,0.22)' });
  if (vp < 0.18 && views.length > 1 && lt > per) { g.save(); g.globalAlpha *= 1 - vp / 0.18; browser(IMG[views[(vi + views.length - 1) % views.length]], bx, by, bw, bh, { dark: true, url: 'loona-designs.de', scroll: 0.55, blur: 0 }); g.restore(); }
  g.restore();
  const pp = eOut(pin(lt, 4, 1.3)); if (IMG.siteMob) { g.save(); g.translate(0, (1 - pp) * 80); phone(IMG.siteMob, bx + 10, by + bh - 170, 190, { alpha: pp, scroll: eIO(seg(lt, 1, D)) * 0.5, fix: { ...MOB_FIX, top: { ...MOB_FIX.top, img: IMG.siteMobTop }, bar: { ...MOB_FIX.bar, img: IMG.siteMobBar } } }); g.restore(); }
}

/* ---------- Szene: Produktfamilie (nur 120 s) ---------- */
function scFamily(lt, D) {
  bg(lt, { logo: true });
  const cx = W / 2, cy = CY - 30;
  kicker(T.familyKicker, cx, cy - 230, pin(lt, 0), 'center');
  const items = [{ key: 'ld', name: 'loona! designs', tag: 'plattform' }, ...FAMILY], n = items.length, sz = 170, step = 310, x0 = cx - ((n - 1) * step) / 2;
  items.forEach((it, i) => {
    const p = FAST ? seg(lt, i * B, i * B + 0.25) : pin(lt, 1 + i * 1.3), a = eOut(p), px = x0 + i * step, dy = (1 - eOut5(p)) * 50;
    /* Kernmarke: das Zeichen (Negativ-Logo, wie im Auftakt) auf der Tinte-Kachel — nicht das Badge mit dem großen LD */
    if (it.key === 'ld') zeichenTile(px, cy + dy, sz, { alpha: a, edge: TH.dark ? 'rgba(255,255,255,0.14)' : undefined });
    else { familyTile(px, cy + dy, sz, it.key, a); if (TH.dark) { g.save(); g.globalAlpha = a; g.strokeStyle = 'rgba(255,255,255,0.14)'; g.lineWidth = 1.5; rr(px - sz / 2, cy + dy - sz / 2, sz, sz, sz * 0.22); g.stroke(); g.restore(); } }
    if (it.key === 'ld') { g.save(); g.globalAlpha = a; const ws = 30; wordmark(px - wordmarkWidth(ws) / 2, cy + sz / 2 + 62, ws, TH.ink); g.restore(); }
    else text(it.name, px, cy + sz / 2 + 62, { size: 30, weight: 700, align: 'center', color: TH.ink, alpha: a });
    label(LANG === 'en' && it.tag === 'plattform' ? 'platform' : it.tag, px, cy + sz / 2 + 100, { size: 17, color: TH.soft, align: 'center', alpha: a, track: 0.1 });
  });
}

/* ============================================================ nur lange Fassung (300 s) ============================================================ */
/* Titelzeile wie in der Labs-Szene: erste Hälfte Manrope, zweite Hälfte Serif-Akzent; passt sich der Breite an */
function titlePair(pair, x, y, maxW, lt, size = 78) {
  const ts = fit(`${pair[0]} ${pair[1]}`, maxW, size, 700);
  drawLine(tokens(pair[0]), x, y, ts, pin(lt, 1), { style: TH.style, color: TH.ink });
  drawLine(tokens(pair[1], { serif: true }), x + layoutLine(tokens(pair[0]), ts).width + ts * 0.3, y, ts, pin(lt, 2.5), { style: TH.style, color: TH.accent });
  return ts;
}

/* ---------- Szene: Schwerpunkte ---------- */
function scFocus(lt, D) {
  bg(lt);
  const x = 150, top = TH.top + 30;
  kicker(T.focusKicker, x, top + 30, pin(lt, 0));
  titlePair(T.focusTitle, x, top + 128, W - 2 * x, lt, 84);
  const gap = 36, cw = (W - 2 * x - 2 * gap) / 3, y = top + 214, ch = Math.min(400, TH.bot - 36 - y);
  FOCUS_AREAS.forEach((f, i) => {
    const p = FAST ? seg(lt, (2 + i * 2) * B, (2 + i * 2) * B + 0.25) : pin(lt, 3 + i * 2.4), a = eOut(p), cx = x + i * (cw + gap);
    if (a <= 0) return;
    g.save(); g.globalAlpha = a; g.translate(0, (1 - eOut5(p)) * 50);
    card(cx, y, cw, ch, 24);
    /* nach dem Einblenden wandert der Akzent von Karte zu Karte */
    const tA = FAST ? 2 * BAR : 4.5, on = lt > tA && Math.floor(((lt - tA) / Math.max(1, D - tA - 0.5)) * 3) === i;
    if (on) { g.strokeStyle = TH.accent; g.lineWidth = 2.5; rr(cx, y, cw, ch, 24); g.stroke(); }
    g.fillStyle = TH.accent; g.fillRect(cx + 40, y + 40, on ? 96 : 56, 4);
    text(f.icon, cx + 40, y + 108, { size: 40, weight: 700, fam: MONO, color: TH.accent });
    const tsz = fit(f[LANG][0], cw - 80, 44, 800, MAN, -0.02);
    text(f[LANG][0], cx + 40, y + 182, { size: tsz, weight: 800, color: TH.ink, ls: -0.02 * tsz });
    para(f[LANG][1], cx + 40, y + 236, cw - 80, 26, { color: TH.soft, lh: 1.5 });
    g.restore();
  });
}

/* ---------- Szene: Werkliste 2002 – 2026 ---------- */
function scWorks(lt, D) {
  bg(lt);
  const x = 150, top = TH.top + 30;
  kicker(T.worksKicker, x, top + 30, pin(lt, 0));
  titlePair(T.worksTitle, x, top + 122, W - 2 * x, lt);
  const colGap = 70, colW = (W - 2 * x - colGap) / 2, yH = top + 188, y0 = yH + 28, rows = Math.max(WORKS.frei.length, WORKS.beruf.length), rowH = Math.min(62, (TH.bot - 14 - y0) / rows), tile = rowH - 14;
  const all = [...WORKS.frei.map((w, i) => [w, 0, i]), ...WORKS.beruf.map((w, i) => [w, 1, i])];
  /* eine Markierung läuft erst durch die freien Projekte, dann durch den Beruf */
  const tIn = FAST ? BAR : 1.6, span = Math.max(1, D - tIn - (FAST ? BAR : 2.4)), act = clamp(Math.floor(((lt - tIn) / span) * all.length), -1, all.length - 1);
  [0, 1].forEach((c) => { const a = eOut(pin(lt, 2 + c)), px = x + c * (colW + colGap); label(T.worksCols[c], px + 6, yH, { size: 18, color: c ? TH.accentText : TH.soft, alpha: a, track: 0.1 }); hair(px, yH + 14, px + colW * a, a); });
  all.forEach(([wk, c, r], i) => {
    const px = x + c * (colW + colGap), py = y0 + r * rowH;
    const t1 = tIn * 0.35 + i * (FAST ? B / 4 : 0.1), a = eOut(seg(lt, t1, t1 + (FAST ? 0.25 : 0.6)));
    if (a <= 0) return;
    const on = i === act, k = on ? 1 : i < act ? 0.82 : 0.55;
    g.save(); g.globalAlpha = a; g.translate((1 - a) * 30, 0);
    if (on) { g.fillStyle = rgba(BR.orange, TH.dark ? 0.16 : 0.13); rr(px - 12, py + 2, colW + 24, rowH - 4, 14); g.fill(); g.fillStyle = TH.accent; rr(px - 12, py + 2, 5, rowH - 4, 2.5); g.fill(); }
    g.globalAlpha = a * k;
    monoTile(px + 6, py + 7, tile, wk[1], wk[2]);
    const by = py + 7 + tile * 0.5 + 10, tx = px + tile + 26, kind = LANG === 'en' ? wk[6] : wk[5], name = LANG === 'en' ? wk[4] : wk[3];
    label(wk[0], tx, by - 2, { size: 16, color: TH.accentText, track: 0.06 });
    const kw = measure(kind, 20, 500), nx = tx + 112, ns = fit(name, colW - (nx - px) - kw - 24, 27, 700);
    text(name, nx, by, { size: ns, weight: 700, color: TH.ink, ls: -0.3 });
    text(kind, px + colW, by, { size: 20, weight: 500, color: TH.soft, align: 'right' });
    g.restore();
  });
}

/* ---------- Szene: Labs in Zahlen (alle zwölf) ---------- */
function scLabsAll(lt, D) {
  bg(lt);
  const x = 150, top = TH.top + 30;
  kicker(T.labsAllKicker, x, top + 30, pin(lt, 0));
  titlePair(T.labsAllTitle, x, top + 122, 700, lt);
  /* Kennzahlen: Projekte, Start, Spielmodi der COE, KI-Werkzeuge */
  const vs = 60; let sx = W - x;
  for (let k = 3; k >= 0; k--) {
    const p = FAST ? seg(lt, (2 + k) * B, (2 + k) * B + 0.22) : pin(lt, 3 + k * 1.2), a = eOut(p), lw = measure(T.labStatLabels[k].toUpperCase(), 15, 500, MONO, 15 * 0.1), w = Math.max(measure(LAB_STATS[k], vs, 800, MAN, -1.5), lw, 110);
    text(LAB_STATS[k], sx, top + 112 + (1 - eOut5(p)) * 20, { size: vs, weight: 800, color: k === 0 ? TH.accent : TH.ink, alpha: a, align: 'right', ls: -1.5 });
    label(T.labStatLabels[k], sx, top + 146, { size: 15, color: TH.soft, alpha: a, align: 'right', track: 0.1 });
    sx -= w + 46;
  }
  const cols = 7, gap = 18, gy = top + 190, gw = (W - 2 * x - (cols - 1) * gap) / cols, gh = Math.min(170, (TH.bot - 16 - gy - 2 * gap) / 3);
  const hot = Math.floor(lt / (FAST ? B : BAR / 2)) % LABS_ALL.length;
  LABS_ALL.forEach((lb, i) => {
    const cxx = x + (i % cols) * (gw + gap), cyy = gy + Math.floor(i / cols) * (gh + gap);
    const t1 = (FAST ? BAR / 2 : 1.2) + i * (FAST ? B / 4 : 0.1), p = seg(lt, t1, t1 + (FAST ? 0.25 : 0.7)), a = eOut(p);
    if (a <= 0) return;
    g.save(); g.globalAlpha = a; g.translate(0, (1 - eOut5(p)) * 40);
    card(cxx, cyy, gw, gh, 16);
    if (i === hot && lt > 3) { g.strokeStyle = TH.accent; g.lineWidth = 2.5; rr(cxx, cyy, gw, gh, 16); g.stroke(); }
    const ts2 = Math.min(54, gh * 0.36);
    monoTile(cxx + 16, cyy + 16, ts2, lb[0], lb[1]);
    const ns = fit(lb[2], gw - 30, 23, 700), kind = LANG === 'en' ? lb[4] : lb[3];
    text(lb[2], cxx + 16, cyy + gh - 44, { size: ns, weight: 700, color: TH.ink, ls: -0.3 });
    text(kind, cxx + 16, cyy + gh - 18, { size: fit(kind, gw - 30, 16, 500), weight: 500, color: TH.accentText });
    g.restore();
  });
}

/* ---------- Szene: Hero-Animationen (Bildfolgen aus der neuen Website) ---------- */
function scHero(lt, D) {
  bg(lt);
  const x = 150, top = TH.top + 30;
  kicker(T.heroKicker, x, top + 30, pin(lt, 0));
  titlePair(T.heroTitle, x, top + 122, W - 2 * x, lt);
  const pw = MOOD === 'cine' ? 206 : 262, ph = (pw * 16) / 9, gap = 46, y = top + 186, span = HERO.length * (pw + gap) - gap;
  const scroll = lerp(0, Math.max(0, span - (W - 2 * x)), eIO(seg(lt, 1, D - 0.8)));
  softEdges(150, () => HERO.forEach(([m, de, en], i) => {
    const px = x + i * (pw + gap) - scroll; if (px > W + 60 || px + pw < -60) return;
    const p = FAST ? seg(lt, (i * B) / 2, (i * B) / 2 + 0.25) : pin(lt, 2 + i * 0.55), a = eOut(p);
    if (a <= 0) return;
    /* Bildfolge vor und zurück (kein Sprung am Ende), je Gerät leicht versetzt */
    const N = HERO_FRAMES, f0 = Math.floor(lt * 10 + i * 5) % (2 * N - 2), f = f0 < N ? f0 : 2 * N - 2 - f0;
    g.save(); g.globalAlpha = a; g.translate(0, (1 - eOut5(p)) * 60);
    g.save(); g.shadowColor = TH.dark ? 'rgba(0,0,0,0.55)' : 'rgba(23,19,16,0.25)'; g.shadowBlur = 40; g.shadowOffsetY = 18; g.fillStyle = '#0B0C10'; rr(px - 8, y - 8, pw + 16, ph + 16, 34); g.fill(); g.restore();
    imgCover(IMG[`hero_${m}_${f}`], px, y, pw, ph, 26);
    g.strokeStyle = 'rgba(255,255,255,0.2)'; g.lineWidth = 2; rr(px - 8, y - 8, pw + 16, ph + 16, 34); g.stroke();
    label(LANG === 'en' ? en ?? de : de, px + pw / 2, y + ph + 52, { size: 17, color: TH.soft, align: 'center', track: 0.08 });
    g.restore();
  }));
}

/* ---------- Szene: Zitat aus den Labs ---------- */
function scQuote(lt, D, o) {
  bg(lt, { warm: 0.1 });
  const q = QUOTES[o.i ?? 0], cx = W / 2, size = 84, str = LANG === 'en' ? `“${q.en}”` : `„${q.de}“`;
  const lines = wrapLines(str, 1380, size, 700), lh = size * 1.24, y0 = CY - ((lines.length - 1) * lh) / 2 + 10;
  kicker(T.quoteKicker, cx, y0 - size * 1.5, pin(lt, 0), 'center');
  lines.forEach((ln, k) => {
    const p = FAST ? seg(lt, k * 2 * B, k * 2 * B + 0.5) : pin(lt, 1 + k * 2.6, 1.3);
    drawLine(tokens(ln, { serif: true }), cx, y0 + k * lh, size, p, { style: TH.style === 'mask' ? 'mask' : 'fade', color: TH.ink, align: 'center' });
  });
  const pa = eOut(FAST ? seg(lt, lines.length * 2 * B, lines.length * 2 * B + 0.3) : pin(lt, 2 + lines.length * 2.6)), ye = y0 + (lines.length - 1) * lh + 86;
  hair(cx - 60 * pa, ye - 34, cx + 60 * pa, pa);
  label(`— ${LANG === 'en' ? q.byEn ?? q.by : q.by}`, cx, ye + 14, { size: 22, color: TH.accentText, align: 'center', alpha: pa });
}

/* ---------- Szene: Zertifikate ---------- */
function scCerts(lt, D) {
  bg(lt);
  const x = 180, top = TH.top + 40;
  kicker(T.certsKicker, x, top + 30, pin(lt, 0));
  const p1 = pin(lt, 1, 1.2);
  g.save(); g.fillStyle = TH.dark ? glassFill(CY - 190, CY + 110) : BR.orange;
  text(T.certsTitle[0], x - 14, CY + 110 + (1 - eOut5(p1)) * 50, { size: 400, weight: 800, color: g.fillStyle, alpha: eOut(p1), ls: -18 }); g.restore();
  text(T.certsTitle[1], x, CY + 196, { size: 64, weight: 400, fam: SER, italic: true, color: TH.ink, alpha: eOut(pin(lt, 3)) });
  const lx = 800, lw = W - 180 - lx, rh = (TH.bot - TH.top - 60) / CERTS.length, y0 = TH.top + 34;
  CERTS.forEach((c, i) => {
    const p = FAST ? seg(lt, (1 + i * 0.5) * B, (1 + i * 0.5) * B + 0.2) : seg(lt, 0.5 + i * (Math.min(D * 0.5, 3.4) / CERTS.length), 1.3 + i * (Math.min(D * 0.5, 3.4) / CERTS.length)), a = eOut(p), y = y0 + i * rh;
    hair(lx, y, lx + lw * a, a);
    label(c.d, lx, y + rh * 0.62, { size: 18, color: TH.accentText, alpha: a, track: 0.06 });
    const by = LANG === 'en' && c.byEn ? c.byEn : c.by, bw = measure(by, 20, 500) + 20;
    const ts = fit(c[LANG], lw - 130 - bw, 27, 700);
    text(c[LANG], lx + 124 + (1 - a) * 20, y + rh * 0.64, { size: ts, weight: 700, color: TH.ink, alpha: a });
    text(by, lx + lw, y + rh * 0.63, { size: 20, weight: 500, color: TH.soft, alpha: a, align: 'right' });
  });
  hair(lx, y0 + CERTS.length * rh, lx + lw, eOut(pin(lt, 4)));
}

/* ---------- Szene: Schluss ---------- */
function scOutro(lt, D) {
  bg(lt, { warm: 0.12, logo: true });
  const cx = W / 2, cy = CY - 70, m = 120;
  /* Direkt das offizielle Logo: das Zeichen mit dem Reveal der Marke, dann die Wortmarke. Das Badge davor ist entfallen (Wunsch 22.11.2026). */
  const tB = FAST ? B : 0.9;
  lockup(cx, cy, m, TH.ink, { pm: seg(lt, FAST ? 0.04 : 0.3, FAST ? 0.4 : 1.5), pw: seg(lt, tB, tB + (FAST ? 0.4 : 1.0)) });
  const t2 = lt - tB, st = FAST ? B : 0.6;
  const pcl = seg(t2, st, st + TH.inDur), y1 = cy + 190;
  const toks = [...tokens(CLAIM[0], { weight: 700 }), ...tokens(CLAIM[1], { serif: true, color: TH.accent })];
  drawLine(toks, cx, y1, 72, pcl, { style: TH.style === 'mask' ? 'mask' : 'fade', color: TH.ink, align: 'center', weight: 700 });
  text(T.outroSub.join(' '), cx, y1 + 62, { size: 32, weight: 500, align: 'center', color: TH.soft, alpha: eOut(seg(t2, st * 2, st * 2 + TH.inDur)) });
  const pl = eOut(seg(t2, st * 3, st * 3 + TH.inDur)), ly = TH.bot - 60;
  hair(cx - 520 * pl, ly - 52, cx + 520 * pl, pl);
  const ws = LINKS.map((s) => measure(s.toUpperCase(), 20, 500, MONO, 20 * 0.08)), gapL = 60, tot = ws.reduce((s, w) => s + w + gapL, -gapL); let px = cx - tot / 2;
  LINKS.forEach((s, i) => { label(s, px, ly, { size: 20, color: i === 0 ? TH.ink : TH.soft, alpha: pl, track: 0.08 }); px += ws[i] + gapL; });
}
