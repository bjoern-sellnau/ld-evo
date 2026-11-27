/* Kino-Trailer — Musik der sechs Genre-Fassungen (Wunsch vom 27.11.2026): Action 144, Thriller 104, Komödie 120, Horror 72, Epos 80 und
   Helden 88 BPM. kinoMusic (kino.js) ruft je Szene KGM[GENRE](A, s, si, sc, P) auf. Alle Stücke stehen über dem Leitmotiv der Trailer
   (CH in music.js, d-Moll; die Komödie in der Dur-Parallele F · C · Dm · B♭) und sind eigene Sätze — die Stile sind nur in der Machart
   nachempfunden, keine Tonfolge zitiert ein fremdes Stück. Der Bogen folgt dem Satz der Szene (KS[id].sec): dark → piano → pulse → lift →
   drive → peak, Stille im Satz stop, Einschlag zum title, Ausklang im tail. Akzente liegen auf den Schnitten (P.hitsT) und Szenenwechseln;
   unter einer Zwischentafel (P.card) nimmt sich die Musik zurück und setzt den Akzent des Genres.
   Alles entsteht aus den Instrumenten in music.js (A.*) — keine Samples. Abgemischt nach Messwerten (Lautheit, Pegel je Satz, Bänder). */
'use strict';
/* Hall-Länge (s), Hall-Anteil und Höhenanhebung im Master (dB) je Genre — music.js liest das als MXM */
const KGMIX = { action: [1.5, 0.45, 5.5], thriller: [3.4, 0.7, 5], comedy: [1.0, 0.3, 5], horror: [4.5, 0.85, 3], epos: [4.2, 0.8, 6], helden: [3.8, 0.8, 5.5], countdown: [4.2, 0.8, 5] };
const KGM = {};

/* ---------- gemeinsame Hilfen ---------- */
/* Zwischentafel in absoluter Zeit: a = Beginn, b = Ende, d = Dauer, n = Zeilen, fr = eingefrorenes Bild, at0 = steht am Szenenanfang */
const kmC = (s, P) => (P && P.card ? { a: s.t0 + P.card.at, b: s.t0 + P.card.at + P.card.dc, d: P.card.dc, n: P.card.lines.length, fr: !!P.card.freeze, at0: P.card.at === 0 } : null);
/* Zeitpunkt, zu dem Zeile i der Tafel erscheint (gleichmäßig über die Tafel verteilt) */
const kmLine = (c, i) => c.a + (i * c.d) / c.n;
/* Instrumente, die unter der Tafel schweigen: alles, was während der Tafel einsetzen würde, entfällt (Liegendes klingt aus) */
function kmGate(A, c) {
  if (!c) return A;
  const inC = (t) => t >= c.a - 1e-6 && t < c.b - 1e-6, G = {};
  for (const k of Object.keys(A)) G[k] = (t, ...r) => (inC(t) ? undefined : A[k](t, ...r));
  G.mel = (t0, ch, fn, o) => A.mel(t0, ch, (t, n, l) => { if (!inC(t)) fn(t, n, l); }, o);
  G.swell = A.swell;
  return G;
}
/* Schlagmuster aus 16 Zeichen: je Zeichen ungleich „.“ ein Aufruf mit Zeichen und Schritt */
const kmSteps = (pat, fn) => [...pat].forEach((ch, e) => { if (ch !== '.') fn(ch, e); });
const KM_IX = [0, 2, 1, 2, 3, 2, 1, 2];

/* ---------- Action (144 BPM): rastloser Antrieb ---------- */
KGM.action = (A, s, si, sc, P) => {
  const sec = KS[s.id].sec, prog = progFor(s.bars), last = si === sc.length - 1, S = B / 4, c = kmC(s, P), G = kmGate(A, c);
  /* Sechzehntel-Ostinato: Streicher-Staccato (bei „LD Beyond“ gezupfter Synth), oct = Oktave darüber */
  const ost = (t0, ch, g0, oct) => { for (let e = 0; e < 16; e++) { const n = ch.arp[KM_IX[e % 8]], t = t0 + e * S, gg = g0 * (e % 4 === 0 ? 1.3 : 0.9);
    if (KB) G.pluck(t, n - 12, gg * 1.9, { cut: 4200, pan: e % 2 ? 0.3 : -0.3, dly: 0.12, dur: 0.13, wet: 0.2 }); else G.tone(t, 0.09, midi(n - 12), 'sawtooth', gg * 1.3, { decay: true, att: 0.003, cut: 4400, cut1: 1500, cutT: 0.06, pan: -0.3, wet: 0.4 });
    if (oct) { G.tone(t, 0.09, midi(n), 'sawtooth', gg * 1.2, { decay: true, att: 0.003, cut: 6200, cut1: 2200, cutT: 0.06, pan: 0.3, wet: 0.4 }); if (e % 2 === 0) G.tone(t, 0.07, midi(n + 12), 'sawtooth', gg * 0.5, { decay: true, att: 0.003, cut: 7500, cut1: 3000, cutT: 0.05, wet: 0.45 }); } } };
  /* pulsierender Synth-Bass in Sechzehnteln */
  const pbass = (t0, ch, g0) => { for (let e = 0; e < 16; e++) G.tone(t0 + e * S, S * 0.8, midi(ch.bass + 12), 'sawtooth', g0 * (e % 4 === 0 ? 1.25 : 0.8), { att: 0.004, rel: 0.03, cut: 1400, cut1: 400, cutT: S * 0.8, q: 2 }); };
  const brass = (t, n, l, g0) => { G.tone(t, l * 0.94, midi(n - 12), 'sawtooth', g0, { att: 0.04, rel: 0.12, cut: 2400, wet: 0.6 }); G.tone(t, l * 0.94, midi(n), 'sawtooth', g0 * 1.1, { att: 0.04, rel: 0.12, cut: 3600, det: 6, wet: 0.6 }); G.tone(t, l * 0.94, midi(n + 12), 'sawtooth', g0 * 0.4, { att: 0.05, rel: 0.12, cut: 4800, det: -6, wet: 0.65 }); };
  const hats = (t0, g0) => { for (let e = 0; e < 16; e++) G.hat(t0 + e * S, (e % 4 === 2 ? 0.1 : e % 2 ? 0.04 : 0.06) * g0, e % 4 === 2 ? 0.06 : 0.025, e % 2 ? 0.35 : -0.35); };
  const wirbel = (t0, g0) => { G.riser(t0, BAR, 0.2 * g0); for (let e = 0; e < 16; e++) G.snare(t0 + e * S, (0.03 + e * 0.013) * g0); [12, 13, 14, 15].forEach((e, i) => G.taiko(t0 + e * S, 33 + i * 2, (0.26 + i * 0.07) * g0)); };
  for (let k = 0; k < s.bars; k++) {
    const t0 = s.t0 + k * BAR, cn = prog[k], ch = CH[cn], lastBar = k === s.bars - 1, pr = s.bars > 1 ? k / (s.bars - 1) : 1;
    if (sec === 'dark') {
      G.sub(t0, BAR + 0.2, 26, 0.09, { att: 0.3, rel: 0.5 });
      for (let e = 0; e < 8; e++) G.tone(t0 + (e * B) / 2, 0.14, midi(38), 'sawtooth', 0.035 + 0.035 * pr, { decay: true, att: 0.004, cut: 900, cut1: 260, cutT: 0.12 });
      if (k % 2 === 0) G.taiko(t0, 33, 0.2); if (lastBar) { G.riser(t0, BAR, 0.1); [12, 13, 14, 15].forEach((e, i) => G.taiko(t0 + e * S, 33 + i * 2, 0.14 + i * 0.05)); }
    } else if (sec === 'piano') {
      G.pad(t0, BAR + 0.4, ch.pad, 0.018, { cut: 900, att: 0.3, rel: 0.6, wet: 0.7 }); G.sub(t0, BAR, ch.bass, 0.06, { att: 0.08, rel: 0.3 });
      for (let e = 0; e < 8; e++) G.tone(t0 + (e * B) / 2, 0.16, midi(ch.bass + 12), 'sawtooth', 0.05, { decay: true, att: 0.004, cut: 1100, cut1: 300, cutT: 0.14 });
      for (let e = 0; e < 16; e++) G.hat(t0 + e * S, e % 4 === 0 ? 0.035 : 0.016, 0.02, e % 2 ? 0.35 : -0.35);
      G.mel(t0, cn, (t, n) => G.piano(t, n, 0.42, 1.6, { wet: 0.7, dly: 0.25 })); if (k % 2 === 0) G.taiko(t0, 33, 0.26);
      if (lastBar && !last) wirbel(t0, 0.6);
    } else if (sec === 'pulse' || sec === 'lift') {
      const E = sec === 'lift' ? 1.1 : 1.0 + 0.3 * pr;
      G.pad(t0, BAR + 0.4, ch.pad, 0.026 * E, { cut: 1500 + 1300 * pr, att: 0.2, rel: 0.5, wet: 0.7 }); G.sub(t0, BAR - 0.04, ch.bass, 0.05 * E, { att: 0.05, rel: 0.25 });
      ost(t0, ch, 0.052 * E, pr > 0.3 || sec === 'lift');
      G.kick(t0, 0.6 * E, { f0: 140, f1: 46, dec: 0.3 }); G.kick(t0 + 2.5 * B, 0.4 * E, { f0: 140, f1: 46, dec: 0.26 }); G.snare(t0 + 2 * B, 0.16 * E); G.taiko(t0 + 3.5 * B, 40, 0.2 * E);
      for (let e = 0; e < 8; e++) G.hat(t0 + (e * B) / 2, (e % 2 ? 0.07 : 0.04) * E, 0.025, e % 2 ? 0.3 : -0.3);
      if (sec === 'lift') { if (k === 0) { G.braam(t0, BAR * 1.8, ch.bass + 12, 0.11); G.chime(t0 + 0.1, [74, 77, 81, 86, 89], 0.05, 0.05); } G.mel(t0, cn, (t, n, l) => brass(t, n, l, 0.05)); }
      else if (pr > 0.3) G.mel(t0, cn, (t, n, l) => brass(t, n, l, 0.032 + 0.02 * pr), { skip: k % 2 ? (b) => b >= 2 : undefined });
      if (lastBar && !last) wirbel(t0, 0.8);
    } else if (sec === 'drive' || sec === 'peak') {
      const pk = sec === 'peak', E = pk ? 1.12 : 1.0 + 0.1 * pr;
      G.pad(t0, BAR + 0.4, ch.pad, 0.024 * E, { cut: pk ? 3200 : 2400, att: 0.2, rel: 0.5, wet: 0.7 });
      ost(t0, ch, 0.05 * E, true); pbass(t0, ch, 0.04 * E); hats(t0, 1);
      kmSteps(pk ? 'x..x..x.x..x..x.' : 'x.....x...x.....', (_, e) => G.kick(t0 + e * S, 0.6, { f0: 150, f1: 46, dec: 0.26 }));
      kmSteps(pk ? 'L..lL.l.L.lL.lLl' : 'L..l..L.l..lL.l.', (x, e) => G.taiko(t0 + e * S, x === 'L' ? 36 : 43, (x === 'L' ? 0.24 : 0.2) * E));
      if (pk) { G.snare(t0 + B, 0.22); G.snare(t0 + 3 * B, 0.25); } else G.snare(t0 + 2 * B, 0.22);
      if (k % 2 === 0) { G.impact(t0, pk ? 0.3 : 0.18); if (pk || k % 4 === 0) G.braam(t0, BAR * 1.6, ch.bass + 12, pk ? 0.09 : 0.07); }
      /* das Motiv im Blech; im Höhepunkt dazu Stöße und die Oktave */
      G.mel(t0, cn, (t, n, l) => { brass(t, n, l, 0.066 * E); if (pk) { G.stab(t, [n - 12, n], 0.05, { dur: 0.2, cut: 4400, wet: 0.4 }); G.saw5(t, l * 0.9, n + 12, 0.022, { att: 0.02, rel: 0.12, cut: 5400, wet: 0.6 }); } });
      if (lastBar && !last) wirbel(t0, s.bars > 1 ? 1 : 0.7);
    } else if (sec === 'stop') {
      /* Stille: nur der Ausklang und ein Klavierton — im letzten Takt holt die Musik Anlauf */
      if (k === 0) { G.sub(t0, Math.min(s.D, 4), 26, 0.05, { att: 0.4, rel: 1.0 }); G.piano(t0 + B, 62, 0.28, 4, { soft: true, wet: 0.95 }); }
      if (lastBar) { G.riser(t0, BAR, 0.3); A.swell(t0 + BAR, Math.min(BAR, 1.6), CH.Dm.pad, 0.04); for (let e = 8; e < 16; e++) G.snare(t0 + e * S, 0.02 + (e - 8) * 0.03); [12, 13, 14, 15].forEach((e, i) => G.taiko(t0 + e * S, 33, 0.24 + i * 0.08)); }
    } else if (sec === 'title') {
      const E = k === 0 ? 1.15 : 1;
      G.pad(t0, BAR + 0.5, ch.pad, 0.03 * E, { cut: 2800, att: 0.15, rel: 0.7, wet: 0.75 }); G.pad(t0, BAR + 0.5, ch.pad.slice(1).map((n) => n + 12), 0.015, { wave: 'triangle', cut: 4400, att: 0.2, rel: 0.7, wet: 0.8 });
      G.sub(t0, BAR - 0.04, ch.bass, 0.09, { att: 0.03, rel: 0.3 }); if (k % 2 === 0) { G.braam(t0, BAR * 1.7, ch.bass + 12, k === 0 ? 0.15 : 0.1); G.noise(t0, 1.6, 9000, 5000, 0.12, { wet: 0.6 }); }
      ost(t0, ch, 0.046, true); pbass(t0, ch, 0.035); hats(t0, 0.9);
      kmSteps('x.....x...x.x...', (_, e) => G.kick(t0 + e * S, 0.65, { f0: 150, f1: 46, dec: 0.3 })); kmSteps('L..l..L.l..lL.lL', (x, e) => G.taiko(t0 + e * S, x === 'L' ? 34 : 41, x === 'L' ? 0.3 : 0.22)); G.snare(t0 + 2 * B, 0.25);
      G.mel(t0, cn, (t, n, l) => { brass(t, n, l, 0.085); G.saw5(t, l * 0.94, n + 12, 0.026, { att: 0.02, rel: 0.14, cut: 5200, wet: 0.65 }); G.piano(t, n, 0.42, 1.8, { wet: 0.6 }); });
    } else if (sec === 'tail') {
      G.pad(t0, BAR + 0.5, ch.pad, 0.022, { cut: 1500, att: 0.3, rel: 0.7, wet: 0.8 }); G.sub(t0, BAR, ch.bass, 0.07, { att: 0.08, rel: 0.3 });
      if (!lastBar) { for (let e = 0; e < 8; e++) G.tone(t0 + (e * B) / 2, 0.16, midi(ch.bass + 12), 'sawtooth', 0.045, { decay: true, att: 0.004, cut: 1100, cut1: 300, cutT: 0.14 }); G.kick(t0, 0.5, { f0: 140, f1: 46, dec: 0.3 }); for (let e = 0; e < 8; e++) G.hat(t0 + (e * B) / 2, e % 2 ? 0.05 : 0.03, 0.025, e % 2 ? 0.3 : -0.3); }
      if (!lastBar || s.bars === 1) G.mel(t0, cn, (t, n) => G.piano(t, n, 0.42, 1.8, { wet: 0.75, dly: 0.2 }));
      /* Schlusston: Einschlag auf der Eins des letzten Takts, darüber der d-Moll-Akkord */
      if (lastBar) { G.impact(t0, 0.7); G.braam(t0, Math.min(BAR, 1.6), 38, 0.1); G.pad(t0, BAR, [38, 50, 57, 62, 65], 0.024, { cut: 1800, att: 0.05, rel: BAR * 0.6, wet: 0.85 }); G.piano(t0, 62, 0.36, 3, { wet: 0.9 }); G.piano(t0, 74, 0.28, 3, { wet: 0.9 }); }
    }
  }
  /* Szenenwechsel (steht eine Tafel am Szenenanfang, setzt sie den Akzent) */
  if (si > 0 && !(c && c.at0)) {
    if (sec === 'title') { A.impact(s.t0, 1.2); A.chime(s.t0 + 0.05, [74, 77, 81, 86, 89], 0.07, 0.05); A.noise(s.t0, 2.0, 9000, 4000, 0.16, { wet: 0.7 }); }
    else if (sec === 'peak' || sec === 'drive' || sec === 'lift') { A.whoosh(s.t0, 0.2, 0.5); A.impact(s.t0, sec === 'peak' ? 0.95 : 0.7); A.noise(s.t0, 1.2, 9000, 5000, 0.12, { wet: 0.5 }); }
    else if (sec === 'pulse') { A.whoosh(s.t0, 0.16, 0.5); A.impact(s.t0, 0.55); }
    else if (sec === 'stop') { A.tone(s.t0, 1.4, 62, 'sine', 0.2, { decay: true, att: 0.005, bend: 2.2, bendT: 1.0, cut: 400, wet: 0.5 }); A.noise(s.t0, 1.4, 2400, 120, 0.2, { type: 'lowpass', wet: 0.9 }); }
    else if (sec === 'tail') { A.whoosh(s.t0, 0.12, 0.6); A.impact(s.t0, 0.45); }
    else { A.whoosh(s.t0, 0.1, 0.5); A.taiko(s.t0, 33, 0.3); }
  }
  /* Schnitte im Bild */
  (P.hitsT || []).forEach(([lt, v]) => { if (lt < 0.01) return; const t = s.t0 + lt; if (v >= 0.8) { A.whoosh(t, 0.14, 0.3); A.taiko(t, 33, 0.42 * v); A.noise(t, 0.5, 8000, 3500, 0.07 * v, { wet: 0.5 }); } else if (v >= 0.4) { A.taiko(t, 38, 0.3 * v + 0.1); A.noise(t, 0.25, 7000, 4000, 0.04, { wet: 0.4 }); } else A.noise(t, 0.2, 6000, 3000, 0.03 + 0.05 * v, { wet: 0.4 }); });
  /* Tafel: je Zeile ein Schlag, dazwischen nur Sub und ein leises Ticken */
  if (c) {
    A.sub(c.a, c.d, 26, 0.06, { att: 0.05, rel: 0.2 }); for (let t = c.a; t < c.b - 1e-6; t += S) A.hat(t, 0.014, 0.014, 0);
    for (let i = 0; i < c.n; i++) { const t = kmLine(c, i); A.impact(t, 0.7); A.taiko(t, 33, 0.45); A.noise(t, 0.6, 8000, 3500, 0.08, { wet: 0.5 }); }
    A.whoosh(c.b, 0.2, 0.4);
  }
};

/* ---------- Thriller (104 BPM): Spannung statt Wucht ---------- */
KGM.thriller = (A, s, si, sc, P) => {
  const sec = KS[s.id].sec, prog = progFor(s.bars), last = si === sc.length - 1, S = B / 4, c = kmC(s, P), G = kmGate(A, c);
  /* die Uhr: Achtel im Becken, auf jedem Schlag ein hohes Ticken (tick — tack); n = Achtel im Takt */
  const clock = (X, t0, g0, n = 8) => { for (let e = 0; e < n; e++) { const t = t0 + (e * B) / 2; X.hat(t, (e % 2 ? 0.022 : 0.045) * g0, 0.018, e % 2 ? 0.35 : -0.35); if (e % 2 === 0) X.tone(t, 0.035, e % 4 ? 2100 : 2600, 'sine', 0.02 * g0, { decay: true, att: 0.001, cut: 9000, wet: 0.3, pan: e % 4 ? 0.2 : -0.2 }); } };
  /* Herzschlag: zwei dumpfe Schläge */
  const heart = (X, t, g0) => { X.kick(t, 0.55 * g0, { f0: 66, f1: 38, dec: 0.26, soft: true, lp: 180 }); X.kick(t + 0.27, 0.4 * g0, { f0: 60, f1: 36, dec: 0.3, soft: true, lp: 160 }); };
  /* Streicher-Tremolo: schnelle leise Tonwiederholungen, in der Taktmitte am stärksten */
  const trem = (t0, notes, g0, cres) => notes.forEach((nn, i) => { for (let e = 0; e < 32; e++) G.tone(t0 + (e * BAR) / 32, (BAR / 32) * 0.92, midi(nn), 'sawtooth', g0 * (cres ? 0.3 + 0.7 * (e / 31) : 0.75 + 0.25 * Math.sin((e / 32) * Math.PI)), { att: 0.008, rel: 0.02, cut: 3000, pan: i % 2 ? 0.45 : -0.45, wet: 0.6 }); });
  const rim = (X, t, g0) => { X.noise(t, 0.03, 2300, 1700, g0, { type: 'bandpass', q: 3, wet: 0.25 }); X.tone(t, 0.04, 830, 'triangle', g0 * 0.6, { decay: true, att: 0.001, cut: 4000 }); };
  /* tiefer Schlag statt heller Becken */
  const low = (X, t, g0) => { X.taiko(t, 31, 0.42 * g0); X.noise(t, 0.7, 260, 60, 0.2 * g0, { type: 'lowpass', wet: 0.8 }); };
  const pizz = (t0, ch, g0) => kmSteps('x..x.x..', (_, e) => G.pluck(t0 + (e * B) / 2, ch.bass + 12, g0, { cut: 1100, dur: 0.22, dly: 0, wet: 0.2 }));
  for (let k = 0; k < s.bars; k++) {
    const t0 = s.t0 + k * BAR, cn = prog[k], ch = CH[cn], lastBar = k === s.bars - 1, pr = s.bars > 1 ? k / (s.bars - 1) : 1;
    if (sec === 'dark') {
      G.sub(t0, BAR + 0.3, 26, 0.09, { att: 0.5, rel: 0.8 }); G.pad(t0, BAR + 0.9, [38, 45], 0.016, { cut: 400, att: 1.0, rel: 1.2, wet: 0.9 }); clock(G, t0, 0.6 + 0.4 * pr);
      if (k === 0) G.piano(t0 + B, 86, 0.18, 4, { wet: 0.95, dly: 0.5 }); if (lastBar) heart(G, t0 + 2 * B, 0.7);
    } else if (sec === 'piano') {
      G.sub(t0, BAR + 0.2, ch.bass, 0.07, { att: 0.3, rel: 0.6 }); G.pad(t0, BAR + 0.8, ch.pad.slice(0, 2), 0.016, { cut: 500, att: 0.9, rel: 1.0, wet: 0.9 }); clock(G, t0, 1);
      if (k % 2 === 0 || pr > 0.5) heart(G, t0, 0.65);
      G.mel(t0, cn, (t, n) => G.piano(t, n + 12, 0.32, 3.2, { wet: 0.85, dly: 0.45 }), { skip: (b) => b >= 2 }); pizz(t0, ch, 0.1);
      if (pr > 0.5) trem(t0, [ch.pad[3] + 12], 0.006); if (lastBar && !last) G.riser(t0 + BAR * 0.4, BAR * 0.6, 0.1);
    } else if (sec === 'pulse' || sec === 'lift') {
      const E = sec === 'lift' ? 1.05 : 0.85 + 0.3 * pr;
      G.sub(t0, BAR, ch.bass, 0.065 * E, { att: 0.2, rel: 0.5 }); G.pad(t0, BAR + 0.6, ch.pad, 0.018 * E, { cut: 900 + 800 * pr, att: 0.6, rel: 0.9, wet: 0.8 }); clock(G, t0, 1.1);
      heart(G, t0, 0.8 * E); if (pr > 0.6 || sec === 'lift') heart(G, t0 + 2 * B, 0.6 * E);
      trem(t0, [ch.pad[2] + 12, ch.pad[3] + 12], 0.009 * E); pizz(t0, ch, 0.11 * E);
      G.mel(t0, cn, (t, n) => G.piano(t, n + 12, 0.34, 3.0, { wet: 0.8, dly: 0.45 }), { skip: k % 2 ? (b) => b === 1.5 : undefined });
      if (sec === 'lift') { if (k === 0) G.chime(t0 + B, [86, 81, 77, 74], 0.035, 0.12); G.mel(t0, cn, (t, n, l) => G.tone(t, l * 0.96, midi(n - 12), 'sawtooth', 0.045, { att: 0.1, rel: 0.2, cut: 1700, wet: 0.7 })); }
      if (lastBar && !last) G.riser(t0 + BAR * 0.3, BAR * 0.7, 0.14);
    } else if (sec === 'drive' || sec === 'peak') {
      const pk = sec === 'peak', E = pk ? 1.32 : 1.12 + 0.1 * pr;
      G.pad(t0, BAR + 0.6, ch.pad, 0.022 * E, { cut: pk ? 2600 : 1900, att: 0.4, rel: 0.8, wet: 0.8 }); clock(G, t0, 1.2);
      /* treibendes Achtel-Ostinato in zwei Oktaven, Puls-Bass darunter */
      for (let e = 0; e < 8; e++) { const n = ch.arp[KM_IX[e]], t = t0 + (e * B) / 2, gg = (e % 2 ? 0.85 : 1.15) * E; G.tone(t, 0.15, midi(n - 12), 'sawtooth', 0.062 * gg, { decay: true, att: 0.004, cut: 3800, cut1: 1300, cutT: 0.1, pan: -0.3, wet: 0.5 }); G.tone(t, 0.15, midi(n), 'sawtooth', 0.056 * gg, { decay: true, att: 0.004, cut: 5400, cut1: 1900, cutT: 0.1, pan: 0.3, wet: 0.5 }); G.bass(t, B / 2 - 0.02, ch.bass + 12, 0.05 * E, { cut: pk ? 1900 : 1400, cut1: 450 }); }
      G.kick(t0, 0.55, { f0: 84, f1: 40, dec: 0.3, soft: true }); G.kick(t0 + 2 * B, 0.45, { f0: 84, f1: 40, dec: 0.3, soft: true }); rim(G, t0 + B, 0.13); rim(G, t0 + 3 * B, 0.15); if (pk) { rim(G, t0 + 2.75 * B, 0.07); for (let e = 0; e < 16; e++) G.hat(t0 + e * S, e % 2 ? 0.03 : 0.012, 0.02, e % 2 ? 0.3 : -0.3); }
      trem(t0, [ch.pad[2] + 12, ch.pad[3] + 12], 0.012 * E); if (k % 2 === 0) low(G, t0, pk ? 0.9 : 0.6);
      G.mel(t0, cn, (t, n, l) => { G.saw5(t, l * 0.95, n + 12, 0.02 * E, { att: 0.05, rel: 0.15, cut: 4400, wet: 0.7 }); G.tone(t, l * 0.96, midi(n - 12), 'sawtooth', 0.05 * E, { att: 0.08, rel: 0.18, cut: 1900, wet: 0.7 }); if (pk) G.piano(t, n + 12, 0.3, 2.4, { wet: 0.7, dly: 0.35 }); });
      if (lastBar && !last) { G.riser(t0, BAR, 0.18); for (let e = 8; e < 16; e++) rim(G, t0 + e * S, 0.03 + (e - 8) * 0.016); }
    } else if (sec === 'stop') {
      /* die Uhr allein, ein ferner Klavierton — im letzten Takt zieht das Tremolo an */
      clock(G, t0, 1.15); if (k % 2 === 0) heart(G, t0, 0.5); if (k === 0) G.piano(t0 + B, 74, 0.2, 5, { wet: 0.95, dly: 0.5 });
      if (lastBar) { G.riser(t0 + BAR * 0.25, BAR * 0.75, 0.26); A.swell(t0 + BAR, Math.min(BAR, 2.2), [50, 57, 62, 63], 0.035); trem(t0, [74, 75], 0.014, true); }
    } else if (sec === 'title') {
      G.pad(t0, BAR + 0.8, ch.pad, 0.028, { cut: 2200, att: 0.25, rel: 1.0, wet: 0.8 }); G.pad(t0, BAR + 0.8, ch.pad.slice(1).map((n) => n + 12), 0.014, { wave: 'triangle', cut: 3800, att: 0.4, rel: 1.0, wet: 0.85 });
      G.sub(t0, BAR - 0.05, ch.bass, 0.1, { att: 0.04, rel: 0.5 }); if (k === 0) G.braam(t0, BAR * 1.8, ch.bass + 12, 0.14); else if (k % 2 === 0) low(G, t0, 0.8);
      clock(G, t0, 1.2); G.kick(t0, 0.6, { f0: 84, f1: 40, dec: 0.32, soft: true }); G.kick(t0 + 2 * B, 0.45, { f0: 84, f1: 40, dec: 0.3, soft: true }); rim(G, t0 + B, 0.09); rim(G, t0 + 3 * B, 0.1);
      trem(t0, [ch.pad[1] + 12, ch.pad[2] + 12, ch.pad[3] + 12], 0.013);
      for (let e = 0; e < 8; e++) G.tone(t0 + (e * B) / 2, 0.15, midi(ch.arp[KM_IX[e]] - 12), 'sawtooth', 0.045, { decay: true, att: 0.004, cut: 3400, cut1: 1200, cutT: 0.1, pan: e % 2 ? 0.3 : -0.3, wet: 0.5 });
      G.mel(t0, cn, (t, n, l) => { G.tone(t, l * 0.96, midi(n - 12), 'sawtooth', 0.065, { att: 0.07, rel: 0.2, cut: 2000, wet: 0.7 }); G.tone(t, l * 0.96, midi(n), 'sawtooth', 0.055, { att: 0.08, rel: 0.2, cut: 2800, det: 5, wet: 0.7 }); G.piano(t, n, 0.46, 2.6, { wet: 0.75, dly: 0.3 }); G.piano(t, n + 12, 0.34, 2.6, { wet: 0.8, dly: 0.3 }); });
    } else if (sec === 'tail') {
      G.sub(t0, BAR + 0.2, ch.bass, 0.07, { att: 0.3, rel: 0.6 }); G.pad(t0, BAR + 0.8, ch.pad.slice(0, 3), 0.016, { cut: 700, att: 0.8, rel: 1.0, wet: 0.9 });
      /* im letzten Takt bleibt die Uhr stehen */
      clock(G, t0, 1 - 0.4 * pr, lastBar ? 4 : 8);
      if (!lastBar || s.bars === 1) G.mel(t0, cn, (t, n) => G.piano(t, n, 0.38, 3, { wet: 0.85, dly: 0.35 }));
      if (lastBar) { low(G, t0, 0.7); G.piano(t0, 38, 0.42, 4, { wet: 0.9 }); G.piano(t0, 62, 0.3, 4, { wet: 0.9 }); }
    }
  }
  if (si > 0 && !(c && c.at0)) {
    if (sec === 'title') { A.impact(s.t0, 0.9); low(A, s.t0, 0.9); A.noise(s.t0, 1.8, 5000, 1500, 0.1, { wet: 0.8 }); }
    else if (sec === 'peak' || sec === 'drive' || sec === 'lift') { low(A, s.t0, sec === 'peak' ? 1.0 : 0.8); A.whoosh(s.t0, 0.12, 0.7); }
    else if (sec === 'pulse') low(A, s.t0, 0.6);
    else if (sec === 'stop') { A.tone(s.t0, 1.8, 62, 'sine', 0.18, { decay: true, att: 0.005, bend: 2.2, bendT: 1.2, cut: 400, wet: 0.5 }); A.noise(s.t0, 1.6, 2000, 100, 0.16, { type: 'lowpass', wet: 0.9 }); }
    else if (sec === 'tail') low(A, s.t0, 0.5);
    else A.piano(s.t0, 38, 0.3, 4, { wet: 0.9 });
  }
  (P.hitsT || []).forEach(([lt, v]) => { if (lt < 0.01) return; const t = s.t0 + lt; if (v >= 0.8) low(A, t, 0.75 * v); else if (v >= 0.4) A.taiko(t, 36, 0.2 + 0.12 * v); else rim(A, t, 0.04 + 0.05 * v); });
  /* Tafel: nur Uhr und Bordun, je Zeile ein leiser tiefer Ton */
  if (c) {
    A.sub(c.a, c.d + 0.3, 26, 0.08, { att: 0.2, rel: 0.4 });
    for (let t = c.a, e = 0; t < c.b - 1e-6; t += B / 2, e++) { A.hat(t, e % 2 ? 0.022 : 0.045, 0.018, e % 2 ? 0.35 : -0.35); if (e % 2 === 0) A.tone(t, 0.035, e % 4 ? 2100 : 2600, 'sine', 0.02, { decay: true, att: 0.001, cut: 9000, wet: 0.3 }); }
    for (let i = 0; i < c.n; i++) { const t = kmLine(c, i); A.tone(t, 1.8, midi(38), 'sine', 0.14, { att: 0.02, decay: true, wet: 0.6 }); A.piano(t, 38, 0.24, 3, { wet: 0.9 }); }
  }
};

/* ---------- Komödie (120 BPM): hell und federnd, in der Dur-Parallele ---------- */
const kmProgC = (n, last) => { if (n === 1) return ['F']; const p = Array.from({ length: n }, (_, i) => ['F', 'C', 'Dm', 'Bb'][i % 4]); p[n - 1] = last ? 'F' : 'C'; return p; };
KGM.comedy = (A, s, si, sc, P) => {
  const sec = KS[s.id].sec, last = si === sc.length - 1, prog = kmProgC(s.bars, last), S = B / 4, c = kmC(s, P), G = kmGate(A, c);
  const tri = (ch) => ch.arp.slice(0, 3);
  /* „Um-pah“: Bass auf 1 und 3 (Grundton, Quinte), Akkord-Stiche auf 2 und 4 */
  const umpah = (t0, ch, g0) => { G.piano(t0, ch.bass + 12, 0.56 * g0, 0.8, { wet: 0.2 }); G.piano(t0 + 2 * B, ch.bass + 7, 0.5 * g0, 0.8, { wet: 0.2 }); [1, 3].forEach((b) => tri(ch).forEach((n, i) => G.piano(t0 + b * B, n, 0.36 * g0, 0.45, { wet: 0.2, pan: (i - 1) * 0.25 }))); };
  /* leises Harmonium unter dem Satz — hält den Akkord, damit zwischen den kurzen Tönen kein Loch entsteht */
  const harm = (t0, ch, g0) => G.pad(t0, BAR - 0.05, tri(ch), g0, { wave: 'triangle', cut: 2600, att: 0.04, rel: 0.15, wet: 0.3 });
  const pizz = (t0, ch, g0, n = 8) => { for (let e = 0; e < n; e++) G.pluck(t0 + (e * BAR) / n, ch.arp[[0, 2, 1, 2, 0, 2, 1, 3][e % 8]], g0 * (e % 2 ? 0.8 : 1.1), { dur: 0.15, cut: 4800, pan: e % 2 ? 0.3 : -0.3, dly: 0.06, wet: 0.2 }); };
  const tuba = (t0, ch, g0) => [[0, ch.bass + 12], [2, ch.bass + 7]].forEach(([b, n]) => { G.tone(t0 + b * B, B * 0.7, midi(n), 'triangle', g0, { att: 0.012, rel: 0.08, cut: 800 }); G.tone(t0 + b * B, B * 0.7, midi(n - 12), 'sine', g0 * 0.5, { att: 0.012, rel: 0.08, cut: 400 }); });
  /* gepfiffene Melodie: Sinus mit Vibrato */
  const pfiff = (t, n, l, g0) => G.tone(t, l * 0.9, midi(n + 12), 'sine', g0 * 1.6, { att: 0.035, rel: 0.07, vib: 16, vibF: 5.6, vibD: 0.07, cut: 8000, wet: 0.35, dly: 0.12 });
  const glock = (t, n, g0) => G.bell(t, n + 12, g0 * 1.4, { dur: 0.9, dly: 0.1 });
  /* Pauke „bom-bom“ */
  const bom = (X, t) => { X.taiko(t, 36, 0.26); X.taiko(t + B / 2, 41, 0.3); };
  const holz = (X, t, g0) => X.tone(t, 0.05, 880, 'square', g0, { decay: true, att: 0.001, cut: 5000, wet: 0.15 });
  const shake = (t0, g0, n = 8) => { for (let e = 0; e < n; e++) G.shaker(t0 + (e * BAR) / n, (e % 2 ? 0.09 : 0.055) * g0, e % 2 ? 0.4 : -0.4); };
  for (let k = 0; k < s.bars; k++) {
    const t0 = s.t0 + k * BAR, cn = prog[k], ch = CH[cn], lastBar = k === s.bars - 1, pr = s.bars > 1 ? k / (s.bars - 1) : 1;
    if (sec === 'dark') {
      [0.3, 0.18, 0.26, 0.18].forEach((gg, b) => G.pluck(t0 + b * B, ch.arp[[0, 1, 2, 1][b]], gg, { dur: 0.2, cut: 3400, wet: 0.3, dly: 0.1 })); glock(t0 + 2.5 * B, ch.mel[0][1], 0.06); G.piano(t0, ch.bass + 12, 0.46, 0.9, { wet: 0.25 }); G.piano(t0 + 2 * B, ch.bass + 7, 0.36, 0.9, { wet: 0.25 }); harm(t0, ch, 0.016);
      if (lastBar) { G.pluck(t0 + 3 * B, ch.arp[1], 0.09, { dur: 0.14, cut: 3400 }); G.pluck(t0 + 3.5 * B, ch.arp[2], 0.1, { dur: 0.14, cut: 3400 }); }
    } else if (sec === 'piano') {
      umpah(t0, ch, 0.9); harm(t0, ch, 0.01); G.mel(t0, cn, (t, n, l) => pfiff(t, n, l, 0.055)); if (pr > 0.4) shake(t0, 0.7);
      if (lastBar && !last) bom(G, t0 + 3 * B);
    } else if (sec === 'pulse' || sec === 'lift') {
      const E = sec === 'lift' ? 1.05 : 0.9 + 0.2 * pr;
      umpah(t0, ch, E); harm(t0, ch, 0.013 * E); pizz(t0, ch, 0.1 * E); tuba(t0, ch, 0.14 * E); shake(t0, E);
      G.mel(t0, cn, (t, n, l) => { glock(t, n, 0.042 * E); if (k % 2 === 0 || sec === 'lift') pfiff(t, n, l, 0.05 * E); });
      if (sec === 'lift') { G.clap(t0 + B, 0.12); G.clap(t0 + 3 * B, 0.13); G.mel(t0, cn, (t, n, l) => G.tone(t, l * 0.9, midi(n), 'sawtooth', 0.04, { att: 0.03, rel: 0.08, cut: 2800, wet: 0.4 })); }
      if (lastBar && !last) bom(G, t0 + 3 * B);
    } else if (sec === 'drive' || sec === 'peak') {
      const pk = sec === 'peak', E = pk ? 1.12 : 1.08;
      umpah(t0, ch, E); harm(t0, ch, 0.016 * E); pizz(t0, ch, 0.1 * E, pk ? 16 : 8); tuba(t0, ch, 0.15 * E); shake(t0, 1.1, 16);
      G.kick(t0, 0.4, { f0: 120, f1: 50, dec: 0.22, soft: true }); G.kick(t0 + 2 * B, 0.34, { f0: 120, f1: 50, dec: 0.22, soft: true }); G.clap(t0 + B, pk ? 0.2 : 0.16); G.clap(t0 + 3 * B, pk ? 0.22 : 0.17);
      for (let e = 0; e < 16; e++) G.hat(t0 + e * S, e % 4 === 2 ? 0.06 : 0.028, 0.03, e % 2 ? 0.35 : -0.35);
      G.mel(t0, cn, (t, n, l) => { pfiff(t, n, l, 0.058 * E); glock(t, n, 0.045 * E); if (pk) { G.tone(t, l * 0.9, midi(n - 12), 'sawtooth', 0.045, { att: 0.03, rel: 0.08, cut: 2600, wet: 0.4 }); G.tone(t, l * 0.9, midi(n), 'sawtooth', 0.035, { att: 0.03, rel: 0.08, cut: 3400, det: 6, wet: 0.4 }); } });
      if (pk) for (let e = 0; e < 4; e++) G.hat(t0 + (e + 0.5) * B, 0.07, 0.04, e % 2 ? 0.3 : -0.3);
      if (lastBar && !last) bom(G, t0 + 3 * B);
    } else if (sec === 'stop') {
      /* Stille mit einem einzelnen Zupfer — im letzten Takt Paukenwirbel und ein Pfiff nach oben */
      if (k === 0) G.pluck(t0 + B, 53, 0.09, { dur: 0.2, cut: 2400, wet: 0.4 });
      if (lastBar) { for (let e = 8; e < 16; e++) G.taiko(t0 + e * S, 38, 0.06 + (e - 8) * 0.04); G.tone(t0 + 2 * B, 2 * B * 0.95, midi(89), 'sine', 0.07, { bend: 0.25, bendT: 2 * B * 0.9, att: 0.05, rel: 0.05, vib: 10, cut: 9000, wet: 0.3 }); }
    } else if (sec === 'title') {
      umpah(t0, ch, 1.1); [0.5, 1.5, 2.5, 3.5].forEach((b) => G.stab(t0 + b * B, tri(ch).map((n) => n + 12), 0.036, { dur: 0.18, wet: 0.25 }));
      harm(t0, ch, 0.02); pizz(t0, ch, 0.1, 16); tuba(t0, ch, 0.17); shake(t0, 1.2, 16); G.taiko(t0, 41, 0.2);
      G.kick(t0, 0.42, { f0: 120, f1: 50, dec: 0.22, soft: true }); G.kick(t0 + 2 * B, 0.36, { f0: 120, f1: 50, dec: 0.22, soft: true }); G.clap(t0 + B, 0.2); G.clap(t0 + 3 * B, 0.22);
      if (k % 2 === 0) G.noise(t0, 1.2, 9000, 5000, 0.1, { wet: 0.4 }); for (let e = 0; e < 16; e++) G.hat(t0 + e * S, e % 4 === 2 ? 0.06 : 0.028, 0.03, e % 2 ? 0.35 : -0.35);
      G.mel(t0, cn, (t, n, l) => { pfiff(t, n, l, 0.062); glock(t, n, 0.05); G.tone(t, l * 0.9, midi(n - 12), 'sawtooth', 0.07, { att: 0.03, rel: 0.08, cut: 2800, wet: 0.4 }); G.tone(t, l * 0.9, midi(n), 'sawtooth', 0.07, { att: 0.03, rel: 0.08, cut: 3600, det: 6, wet: 0.4 }); });
    } else if (sec === 'tail') {
      if (!lastBar) { umpah(t0, ch, 0.85); harm(t0, ch, 0.01); pizz(t0, ch, 0.07); shake(t0, 0.7); }
      if (!lastBar || s.bars === 1) G.mel(t0, cn, (t, n, l) => { pfiff(t, n, l, 0.05); glock(t, n, 0.035); });
      /* Schluss-Pointe: bom-bom, dann der F-Dur-Akkord mit Glockenspiel nach oben */
      if (lastBar) { const tb = s.bars === 1 ? t0 + 2 * B : t0; bom(G, tb); G.stab(tb + B, [53, 57, 60, 65, 69, 72], 0.07, { dur: 0.5, wet: 0.35 }); G.piano(tb + B, 41, 0.4, 1.5, { wet: 0.3 }); G.piano(tb + B, 53, 0.4, 1.5, { wet: 0.3 }); G.chime(tb + B, [72, 77, 81, 84, 89], 0.045, 0.06); }
    }
  }
  if (si > 0 && !(c && c.at0)) {
    const hoch = () => A.tone(s.t0 - 0.26, 0.26, midi(86), 'sine', 0.05, { bend: 0.5, bendT: 0.24, att: 0.02, rel: 0.02, cut: 9000, wet: 0.3 });
    if (sec === 'title') { hoch(); A.noise(s.t0, 1.6, 9000, 5000, 0.16, { wet: 0.5 }); A.taiko(s.t0, 41, 0.34); A.chime(s.t0 + 0.04, [72, 77, 81, 84, 89], 0.05, 0.05); }
    else if (sec === 'peak' || sec === 'drive' || sec === 'lift') { hoch(); A.noise(s.t0, 0.9, 9000, 6000, 0.09, { wet: 0.4 }); if (sec === 'lift') A.chime(s.t0 + 0.04, [77, 81, 84, 89], 0.045, 0.06); }
    else if (sec === 'pulse') hoch();
    else if (sec === 'stop') A.tone(s.t0, 0.55, midi(58), 'sawtooth', 0.07, { bend: 1.5, bendT: 0.5, decay: true, att: 0.02, cut: 1300, wet: 0.3 });   // „wah“ nach unten
    else if (sec === 'tail') A.chime(s.t0, [77, 81, 84], 0.04, 0.07);
    else holz(A, s.t0, 0.06);
  }
  (P.hitsT || []).forEach(([lt, v]) => { if (lt < 0.01) return; const t = s.t0 + lt; if (v >= 0.8) { holz(A, t, 0.07); A.noise(t, 0.25, 9000, 6000, 0.05, { wet: 0.3 }); A.tone(t, 0.14, midi(84), 'sine', 0.04, { bend: 0.6, bendT: 0.12, decay: true, att: 0.004, cut: 9000, wet: 0.3 }); } else if (v >= 0.4) holz(A, t, 0.05); else A.shaker(t, 0.05, 0); });
  /* Tafel: Plattenkratzer, die Musik bricht ab; je Zeile ein Zupfer, zum Schluss „bom-bom“ als Auftakt zurück in den Satz */
  if (c) {
    const g0 = c.fr ? 1.4 : 1;
    A.noise(c.a, 0.22, 5200, 420, 0.3 * g0, { type: 'bandpass', q: 1.5 }); A.tone(c.a, 0.25, 420, 'sawtooth', 0.11 * g0, { bend: 3, bendT: 0.2, decay: true, att: 0.003, cut: 2600 });
    if (c.fr) A.tone(c.a + 0.22, 0.2, midi(96), 'sine', 0.04, { bend: 0.4, bendT: 0.18, decay: true, att: 0.004, cut: 9000, wet: 0.2 });
    for (let i = 0; i < c.n; i++) { const t = kmLine(c, i) + (i === 0 ? 0.45 : 0.05); if (t < c.b - B) { A.pluck(t, 65 - (i % 2) * 5, 0.1, { dur: 0.18, cut: 3000, wet: 0.35, dly: 0.1 }); A.pluck(t, 53 - (i % 2) * 5, 0.07, { dur: 0.18, cut: 1800, wet: 0.3 }); } }
    if (c.d >= 2 * B - 1e-6) bom(A, c.b - B);
  }
};

/* ---------- Horror (72 BPM): Dissonanz und Leere ---------- */
KGM.horror = (A, s, si, sc, P) => {
  const sec = KS[s.id].sec, prog = progFor(s.bars), last = si === sc.length - 1, c = kmC(s, P), G = kmGate(A, c);
  /* Bordun: Sub auf D, darüber D und Es eng verstimmt (kleine Sekunde), leise der Tritonus; open = wie weit der Filter aufgeht */
  const drone = (t0, g0, open, sub = 1) => { G.sub(t0, BAR + 0.4, 26, 0.085 * g0 * sub, { att: 0.8, rel: 1.0 }); [[38, -12], [39, 9], [44, -4]].forEach(([n, d], i) => G.tone(t0, BAR + 1.2, midi(n), 'sawtooth', (i === 2 ? 0.016 : 0.03) * g0, { att: 1.3, rel: 1.3, det: d, cut: 520 + 700 * open, q: 0.6, pan: i === 1 ? 0.5 : i ? 0 : -0.5, wet: 0.9 })); };
  /* Spieluhr: hoher Sinus mit unharmonischem Oberton, jeder Ton ein wenig daneben */
  const box = (X, t, n, g0, i = 0) => { const d = [-17, 12, -8, 21][i % 4]; X.tone(t, 1.9, midi(n + 24), 'sine', g0, { decay: true, att: 0.002, det: d, cut: 10000, pan: i % 2 ? 0.3 : -0.3, wet: 0.85, dly: 0.25 }); X.tone(t, 0.7, midi(n + 24) * 2.76, 'sine', g0 * 0.22, { decay: true, att: 0.002, det: d, cut: 12000, wet: 0.7 }); X.noise(t, 0.012, 5000, 3000, g0 * 0.25, { type: 'bandpass', q: 2 }); };
  const heart = (X, t, g0) => { X.kick(t, 0.55 * g0, { f0: 58, f1: 34, dec: 0.3, soft: true, lp: 160 }); X.kick(t + 0.3, 0.4 * g0, { f0: 52, f1: 32, dec: 0.34, soft: true, lp: 140 }); };
  /* metallisches Schaben: schmales Rauschband, das nach oben fährt */
  const scrape = (X, t, d, g0, pan = 0) => X.noise(t, d, 1700, 5600, g0, { type: 'bandpass', q: 10, swell: true, wet: 0.8, pan });
  /* Schreck-Akzent: dissonanter Cluster-Stich, Rauschstoß, Einschlag und ein Sub-Absturz */
  const sting = (X, t, g0) => { [74, 75, 80, 81].forEach((n) => X.saw5(t, 0.8, n, 0.028 * g0, { decay: true, att: 0.004, cut: 5600, cut1: 1200, cutT: 0.7, wet: 0.7 })); X.noise(t, 0.5, 5200, 1200, 0.18 * g0, { wet: 0.6 }); X.impact(t, 0.7 * g0); X.tone(t, 1.6, 55, 'sine', 0.18 * g0, { bend: 2.4, bendT: 1.2, decay: true, att: 0.004, cut: 300, wet: 0.4 }); };
  const tremc = (t0, notes, g0, cres) => notes.forEach((nn, i) => { for (let e = 0; e < 32; e++) G.tone(t0 + (e * BAR) / 32, (BAR / 32) * 0.9, midi(nn), 'sawtooth', g0 * (cres ? 0.3 + 0.7 * (e / 31) : 1), { att: 0.008, rel: 0.02, cut: 3200, pan: i % 2 ? 0.5 : -0.5, wet: 0.7 }); });
  /* hohe Schwebung: zwei Sinustöne im Halbtonabstand, kaum hörbar */
  const luft = (t0, g0) => G.pad(t0, BAR + 1, [74, 75], g0, { wave: 'sine', cut: 4000, att: 1.5, rel: 1.5, wet: 0.9 });
  /* Wind: breites Rauschband, das über den Takt anschwillt — wie ein Atemzug */
  const wind = (X, t, d, g0, pan = 0) => X.noise(t, d, 450, 1100, g0, { type: 'bandpass', q: 1.4, swell: true, wet: 0.8, pan });
  let bi = 0;
  for (let k = 0; k < s.bars; k++) {
    const t0 = s.t0 + k * BAR, cn = prog[k], ch = CH[cn], lastBar = k === s.bars - 1, pr = s.bars > 1 ? k / (s.bars - 1) : 1;
    if (sec === 'dark') {
      drone(t0, 1, 0.1, 0.6); luft(t0, 0.03); wind(G, t0, BAR * 1.02, 0.08, k % 2 ? 0.4 : -0.4); if (k === 0) box(G, t0 + 2 * B, 69, 0.07, 1); else box(G, t0 + B, 68, 0.05, 2); if (lastBar && s.bars > 1) scrape(G, t0 + B, BAR - B, 0.02, 0.4);
    } else if (sec === 'piano') {
      drone(t0, 0.9, 0.2 + 0.2 * pr, 0.6); luft(t0, 0.03); wind(G, t0, BAR * 1.02, 0.07, k % 2 ? -0.4 : 0.4);
      /* das Motiv in der Spieluhr — in jedem vierten Takt rutscht der letzte Ton einen Halbton tiefer */
      { const tl = t0 + ch.mel[ch.mel.length - 1][0] * B; G.mel(t0, cn, (t, n) => box(G, t, k % 4 === 3 && Math.abs(t - tl) < 1e-6 ? n - 1 : n, 0.1, bi++)); }
      if (pr >= 0.5) heart(G, t0, 0.6); if (k % 2 === 1) { scrape(G, t0 + B, BAR - B, 0.024, k % 4 === 1 ? -0.5 : 0.5); A.swell(t0 + BAR, 2.4, [50, 51], 0.02); }
    } else if (sec === 'pulse' || sec === 'lift') {
      const E = sec === 'lift' ? 1.05 : 0.85 + 0.3 * pr;
      drone(t0, 1, 0.3 + 0.4 * pr); heart(G, t0, 0.85 * E); if (pr > 0.5 || sec === 'lift') heart(G, t0 + 2 * B, 0.65 * E); G.taiko(t0, 31, 0.3 * E);
      tremc(t0, [62, 63], 0.007 * E);
      G.mel(t0, cn, (t, n) => box(G, t, n, 0.07, bi++), { skip: (b) => b === 1.5 || (k % 2 === 1 && b >= 2) }); wind(G, t0, BAR * 1.02, 0.035, k % 2 ? 0.4 : -0.4);
      if (sec === 'lift') { if (k === 0) G.chime(t0 + B, [89, 86, 82, 81, 75], 0.03, 0.16); G.pad(t0, BAR + 1, [50, 51, 57], 0.016, { cut: 1500, att: 0.8, rel: 1.2, wet: 0.9 }); }
      if (k % 2 === 1 || lastBar) A.swell(t0 + BAR, 2.6, [62, 63, 68], 0.026); if (lastBar && !last) scrape(G, t0 + B, BAR - B, 0.03, 0);
    } else if (sec === 'drive' || sec === 'peak') {
      const pk = sec === 'peak', E = pk ? 1.0 : 0.95;
      drone(t0, 1, pk ? 1 : 0.6, 0.5);
      /* stampfende tiefe Trommel auf jedem Schlag, im Höhepunkt mit Achteln dazwischen */
      for (let b = 0; b < 4; b++) { G.taiko(t0 + b * B, 31, (b === 0 ? 0.3 : 0.24) * E); if (pk) { G.kick(t0 + b * B, 0.35, { f0: 76, f1: 40, dec: 0.36, soft: true }); if (pr > 0.4) G.taiko(t0 + (b + 0.5) * B, 38, 0.16); } }
      tremc(t0, [62, 63, 68, 74, 75], (pk ? 0.009 : 0.007) * E);
      if (pk || k % 2 === 1) { G.riser(t0, BAR, pk ? 0.14 : 0.08); G.tone(t0, BAR * 0.98, midi(62), 'sawtooth', 0.03 * E, { bend: 0.5, bendT: BAR * 0.95, swell: true, cut: 2600, wet: 0.7 }); }
      if (k % 2 === 0) { G.braam(t0, BAR * 1.2, 38, pk ? 0.09 : 0.07); G.tone(t0, BAR * 1.1, midi(39), 'sawtooth', 0.03, { att: 0.05, rel: BAR * 0.5, cut: 500, cut1: 1400, cutT: 0.4, det: 9, wet: 0.8 }); }
      /* die Spieluhr läuft weiter über allem, tief darunter grollt dasselbe Motiv */
      G.mel(t0, cn, (t, n, l) => { box(G, t, n, 0.045, bi++); G.tone(t, l * 0.96, midi(n - 24), 'sawtooth', 0.045 * E, { att: 0.08, rel: 0.2, cut: 1000, wet: 0.7 }); G.tone(t, l * 0.96, midi(n - 12), 'sawtooth', 0.045 * E, { att: 0.1, rel: 0.2, cut: 1800, det: 7, wet: 0.7 }); });
      if (lastBar && !last) { A.swell(t0 + BAR, 2.6, [62, 63, 68, 74], 0.03); scrape(G, t0 + B, BAR - B, 0.035, 0); [0.5, 0.68, 0.8, 0.88, 0.94].forEach((f, i) => G.kick(t0 + BAR * f, 0.35 + i * 0.06, { f0: 60, f1: 34, dec: 0.25, soft: true, lp: 170 })); }
    } else if (sec === 'stop') {
      /* fast nichts: ein Spieluhr-Ton, der nächste einen Halbton tiefer — im letzten Takt schwillt es an, der Herzschlag wird schneller */
      if (k === 0) { G.sub(t0, Math.min(s.D, 6), 26, 0.035, { att: 1, rel: 2 }); box(G, t0 + B, 69, 0.06, 0); } else if (!lastBar) box(G, t0 + B, 68, 0.055, 1);
      if (!lastBar) { wind(G, t0, BAR * 1.02, 0.05, k % 2 ? 0.4 : -0.4); luft(t0, 0.02); }
      if (lastBar) { A.swell(t0 + BAR, Math.min(BAR, 2.8), [50, 51, 56, 62, 63], 0.04); G.riser(t0 + BAR * 0.3, BAR * 0.7, 0.2); [0.35, 0.55, 0.7, 0.8, 0.88, 0.94].forEach((f, i) => G.kick(t0 + BAR * f, 0.3 + i * 0.07, { f0: 60, f1: 34, dec: 0.25, soft: true, lp: 170 })); }
    } else if (sec === 'title') {
      if (k === 0) G.braam(t0, BAR * 1.5, 38, 0.15);
      G.pad(t0, BAR + 1, ch.pad, 0.026, { cut: 1900, att: 0.3, rel: 1.1, wet: 0.85 }); G.pad(t0, BAR + 1, [ch.pad[1], ch.pad[2]], 0.016, { wave: 'triangle', cut: 2600, att: 0.5, rel: 1.1, wet: 0.9 });
      drone(t0, 0.8, 0.5); heart(G, t0, 0.9); heart(G, t0 + 2 * B, 0.7); G.taiko(t0, 29, 0.42); tremc(t0, [ch.pad[2] + 12, ch.pad[3] + 12], 0.007);
      G.mel(t0, cn, (t, n, l) => { box(G, t, n, 0.06, bi++); G.bell(t, n + 12, 0.03, { dur: 2.2 }); G.tone(t, l * 0.96, midi(n - 24), 'sawtooth', 0.065, { att: 0.08, rel: 0.25, cut: 1100, wet: 0.7 }); G.tone(t, l * 0.96, midi(n - 12), 'sawtooth', 0.05, { att: 0.1, rel: 0.25, cut: 1700, det: 6, wet: 0.7 }); });
    } else if (sec === 'tail') {
      drone(t0, 0.9 - 0.3 * pr, 0.3, 0.6); luft(t0, 0.026); if (!lastBar) wind(G, t0, BAR * 1.02, 0.06, k % 2 ? 0.4 : -0.4);
      /* die Spieluhr läuft aus: die Töne des Motivs kommen immer langsamer und leiser, dann bleibt sie stehen */
      if (k === 0) { const tot = s.bars * 4 * B, end = s.t0 + s.D - BAR * 0.6; prog.forEach((cx, kk) => CH[cx].mel.forEach(([b, n]) => { const u = (kk * 4 + b) * B, t = s.t0 + u * (1 + (0.5 * u) / tot); if (t < end && !(c && t >= c.a && t < c.b)) box(A, t, n, 0.1 * (1 - (0.6 * u) / tot), bi++); })); }
      if (lastBar) { A.tone(t0, 3, midi(26), 'sine', 0.22, { att: 0.03, decay: true, wet: 0.5 }); A.impact(t0, 0.4); box(A, t0 + B, 62, 0.035, 2); }
    }
  }
  if (si > 0 && !(c && c.at0)) {
    const drop = (g0) => { A.tone(s.t0, 2.6, 55, 'sine', 0.2 * g0, { bend: 2.5, bendT: 2, decay: true, att: 0.005, cut: 300, wet: 0.4 }); A.noise(s.t0, 1.8, 1800, 90, 0.14 * g0, { type: 'lowpass', wet: 0.9 }); };
    if (sec === 'title') sting(A, s.t0, 1.0);
    else if (sec === 'peak') sting(A, s.t0, 0.6);
    else if (sec === 'drive' || sec === 'lift') { A.impact(s.t0, 0.6); drop(0.7); }
    else if (sec === 'pulse') { A.taiko(s.t0, 29, 0.4); A.noise(s.t0, 1.2, 1400, 80, 0.14, { type: 'lowpass', wet: 0.9 }); }
    else if (sec === 'stop') drop(1);
    else if (sec === 'tail') A.impact(s.t0, 0.35);
    else box(A, s.t0, 74, 0.03, 3);
  }
  /* Schnitte: nur der stärkste bekommt den Schreck, die übrigen einen tiefen Schlag mit kurzem Anschwellen davor */
  (P.hitsT || []).forEach(([lt, v]) => { if (lt < 0.01) return; const t = s.t0 + lt; if (v >= 0.95) sting(A, t, 0.7); else if (v >= 0.8) { A.taiko(t, 29, 0.34); A.noise(t, 0.4, 4200, 900, 0.07, { wet: 0.6 }); A.swell(t, 0.7, [62, 63], 0.018); } else if (v >= 0.4) A.taiko(t, 31, 0.2 + 0.1 * v); else A.noise(t, 0.02, 3000, 2000, 0.05, { type: 'bandpass', q: 4, wet: 0.5 }); });
  /* Tafel: fast Stille (ein ferner hoher Ton), frühere Zeilen mit einem Spieluhr-Ton — auf der letzten Zeile der Schreck */
  if (c) {
    A.sub(c.a, c.d + 0.2, 26, 0.035, { att: 0.5, rel: 0.5 }); A.tone(c.a, c.d, 4186, 'sine', 0.004, { att: 0.4, rel: 0.4, cut: 12000, wet: 0.5 }); wind(A, c.a, c.d, 0.06); A.pad(c.a, c.d, [74, 75], 0.02, { wave: 'sine', cut: 4000, att: 0.6, rel: 0.6, wet: 0.9 });
    for (let i = 0; i < c.n - 1; i++) box(A, kmLine(c, i) + 0.1, 69 - i, 0.03, i);
    sting(A, kmLine(c, c.n - 1), 0.85);
  }
};

/* ---------- Epos (80 BPM): der tiefe Ton ---------- */
KGM.epos = (A, s, si, sc, P) => {
  const sec = KS[s.id].sec, prog = progFor(s.bars), last = si === sc.length - 1, S = B / 4, c = kmC(s, P), G = kmGate(A, c);
  /* der tiefe Ton: Sub und verstimmte Sägezähne auf D1 und D2, Blech-Obertöne (D3, A3, D4), deren Filter aufgeht, darunter ein Grollen
     und ein kurzer Tonhöhen-Sturz im Anschlag — lang, mit viel Hall. len = Länge in Takten */
  const braam = (X, t, g0, len = 2) => { const d = Math.min(BAR * len * 0.95, 6.5); X.braam(t, d, 26, g0 * 0.75); X.braam(t, d, 38, g0 * 0.8);
    [[50, -7], [57, 5], [62, 9], [69, -5]].forEach(([n, dt], i) => X.tone(t, d, midi(n), 'sawtooth', g0 * [0.36, 0.26, 0.18, 0.09][i], { att: 0.06, rel: d * 0.5, det: dt, cut: 700, cut1: 3200, cutT: 0.5, q: 1, pan: (i - 1.5) * 0.35, wet: 0.8 }));
    X.noise(t, Math.min(d, 3), 500, 60, g0 * 0.6, { type: 'lowpass', wet: 0.9 }); X.tone(t, 1.2, midi(26), 'sine', g0 * 0.5, { bend: 1.6, bendT: 0.5, decay: true, att: 0.01, cut: 300 }); };
  /* die Uhr: Sechzehntel als Holz-Ticken, jeder Schlag betont (höher), dazu ganz leise das Becken */
  const tick1 = (X, t, e, g0) => { const ac = e % 4 === 0; X.noise(t, 0.014, ac ? 3400 : 2500, ac ? 2800 : 2100, (ac ? 0.1 : 0.05) * g0, { type: 'bandpass', q: 7, pan: e % 2 ? 0.25 : -0.25, wet: 0.25 }); if (e % 2 === 0) X.hat(t, 0.02 * g0, 0.012, e % 4 ? 0.3 : -0.3); };
  const tick = (X, t0, g0, n = 16) => { for (let e = 0; e < n; e++) tick1(X, t0 + e * S, e, g0); };
  /* Streicher-Ostinato: n Töne je Takt, lvl = wie viele Lagen (tief, Oktave, zweite Oktave mit Quinte) */
  const ost = (t0, ch, n, g0, lvl) => { for (let e = 0; e < n; e++) { const nn = ch.arp[KM_IX[e % 8]], t = t0 + (e * BAR) / n, gg = g0 * (e % (n / 4) === 0 ? 1.3 : 0.9);
    G.tone(t, 0.13, midi(nn - 12), 'sawtooth', gg * 1.3, { decay: true, att: 0.004, cut: 3800, cut1: 1300, cutT: 0.09, pan: -0.3, wet: 0.55 });
    if (lvl >= 1) G.tone(t, 0.13, midi(nn), 'sawtooth', gg * 1.2, { decay: true, att: 0.004, cut: 5400, cut1: 1900, cutT: 0.09, pan: 0.3, wet: 0.55 });
    if (lvl >= 2) { G.tone(t, 0.1, midi(nn + 12), 'sawtooth', gg * 0.55, { decay: true, att: 0.004, cut: 7000, cut1: 2600, cutT: 0.07, wet: 0.6 }); if (e % 2 === 0) G.tone(t, 0.1, midi(nn + 7), 'sawtooth', gg * 0.4, { decay: true, att: 0.004, cut: 6000, cut1: 2200, cutT: 0.07, pan: 0.5, wet: 0.6 }); } } };
  /* steigender Eindruck: drei Töne im Oktavabstand gleiten über zwei Takte eine Oktave nach oben und überlappen mit dem nächsten Satz */
  const rise = (t0, g0) => [50, 62, 74].forEach((n, i) => { const d = 2 * BAR * 0.98; G.tone(t0, d, midi(n + 12), i === 2 ? 'sine' : 'triangle', g0 * [1, 0.8, 0.45][i], { bend: 0.5, bendT: d * 0.98, att: d * 0.5, rel: d * 0.5, cut: 3200, pan: (i - 1) * 0.4, wet: 0.6 }); });
  /* tiefe Hörner */
  const horn = (t, n, d, g0) => { G.tone(t, d, midi(n - 24), 'sawtooth', g0, { att: 0.25, rel: 0.5, cut: 800, cut1: 1500, cutT: d * 0.6, wet: 0.75 }); G.tone(t, d, midi(n - 12), 'sawtooth', g0 * 0.85, { att: 0.3, rel: 0.5, cut: 1000, cut1: 2000, cutT: d * 0.6, det: 5, wet: 0.75 }); };
  const orgel = (t0, ch, g0) => G.pad(t0, BAR + 0.8, [ch.bass + 12, ch.bass + 19], g0, { wave: 'triangle', cut: 1400, att: 0.6, rel: 1.0, wet: 0.8 });
  const BG = { dark: 0.04, piano: 0.022, pulse: 0.07, lift: 0.09, drive: 0.085, peak: 0.115, title: 0.12, tail: 0.03 };
  for (let k = 0; k < s.bars; k++) {
    const t0 = s.t0 + k * BAR, cn = prog[k], ch = CH[cn], lastBar = k === s.bars - 1, pr = s.bars > 1 ? k / (s.bars - 1) : 1;
    /* der tiefe Ton alle zwei Takte und damit auf jedem Szenenanfang — der größte auf der Eins des Titels */
    if (k % 2 === 0 && sec !== 'stop' && !(sec === 'tail' && lastBar)) braam(G, t0, sec === 'title' && k === 0 ? 0.17 : BG[sec] * (k === 0 ? 1 : 0.85), sec === 'title' && k === 0 ? 2.2 : 2);
    if (sec === 'dark') {
      tick(G, t0, 0.6 + 0.3 * pr); G.pad(t0, BAR + 1, [38, 45, 50], 0.016, { cut: 440, att: 1, rel: 1.2, wet: 0.9 });
    } else if (sec === 'piano') {
      tick(G, t0, 0.7); G.pad(t0, BAR + 0.9, ch.pad, 0.014, { cut: 650, att: 0.9, rel: 1.1, wet: 0.85 }); G.piano(t0, ch.bass + 12, 0.3, 4, { wet: 0.85 }); G.piano(t0, ch.bass + 24, 0.2, 4, { wet: 0.85 });
      if (pr >= 0.5) horn(t0, ch.mel[0][1], BAR * 0.96, 0.03); rise(t0, 0.008);
    } else if (sec === 'pulse' || sec === 'lift') {
      const E = sec === 'lift' ? 1.05 : 0.75 + 0.35 * pr;
      tick(G, t0, 1); G.pad(t0, BAR + 0.8, ch.pad, 0.022 * E, { cut: 1000 + 1000 * pr, att: 0.6, rel: 0.9, wet: 0.8 }); orgel(t0, ch, 0.018 * E); G.sub(t0, BAR, ch.bass, 0.05 * E, { att: 0.1, rel: 0.4 });
      ost(t0, ch, sec === 'lift' || pr > 0.5 ? 16 : 8, 0.05 * E, sec === 'lift' ? 1 : 0);
      /* das Motiv sehr langsam: der erste Ton jedes Takts als ganzer Takt in den tiefen Hörnern */
      horn(t0, ch.mel[0][1], BAR * 0.96, 0.048 * E); rise(t0, 0.016 * E); if (k % 2 === 1) G.taiko(t0, 31, 0.3 * E);
      if (sec === 'lift' && k === 0) G.chime(t0 + 0.3, [74, 77, 81, 86, 89], 0.045, 0.09);
      if (lastBar && !last) G.riser(t0 + BAR * 0.4, BAR * 0.6, 0.14);
    } else if (sec === 'drive' || sec === 'peak') {
      const pk = sec === 'peak', E = pk ? 1.12 : 1.0 + 0.1 * pr;
      tick(G, t0, 1.1); G.pad(t0, BAR + 0.8, ch.pad, 0.024 * E, { cut: pk ? 2800 : 2000, att: 0.5, rel: 0.9, wet: 0.8 }); orgel(t0, ch, 0.02 * E); G.sub(t0, BAR, ch.bass, 0.05 * E, { att: 0.08, rel: 0.4 });
      ost(t0, ch, 16, 0.056 * E, pk ? 2 : 1); rise(t0, pk ? 0.026 : 0.02);
      kmSteps(pk ? 'L..l..L.l..lL.l.' : 'L.......l...L...', (x, e) => G.taiko(t0 + e * S, x === 'L' ? 33 : 40, (x === 'L' ? 0.3 : 0.22) * E)); G.kick(t0, 0.6, { f0: 110, f1: 40, dec: 0.5, soft: true });
      if (pk) { for (let e = 0; e < 8; e++) G.hat(t0 + (e + 0.5) * (B / 2), 0.06, 0.03, e % 2 ? 0.3 : -0.3); G.mel(t0, cn, (t, n, l) => { horn(t, n + 12, l * 0.96, 0.06 * E); G.saw5(t, l * 0.95, n, 0.024, { att: 0.06, rel: 0.2, cut: 3800, wet: 0.7 }); }); }
      else horn(t0, ch.mel[0][1], BAR * 0.96, 0.058 * E);
      if (lastBar && !last) { G.riser(t0, BAR, 0.2); [12, 13, 14, 15].forEach((e, i) => G.taiko(t0 + e * S, 33 + i * 2, 0.28 + i * 0.08)); }
    } else if (sec === 'stop') {
      /* die Uhr allein — in den letzten zwei Schlägen doppelt so schnell, dann der größte tiefe Ton */
      if (lastBar) { for (let e = 0; e < 8; e++) tick1(G, t0 + e * S, e, 1.25); for (let e = 0; e < 16; e++) tick1(G, t0 + 2 * B + (e * S) / 2, e % 2 ? 1 : 0, 0.9 + e * 0.05); A.swell(t0 + BAR, Math.min(BAR, 2.4), [38, 50, 57, 62], 0.04); G.riser(t0 + BAR * 0.5, BAR * 0.5, 0.16); }
      else tick(G, t0, 1.25);
    } else if (sec === 'title') {
      tick(G, t0, 1.1); G.pad(t0, BAR + 0.9, ch.pad, 0.03, { cut: 2800, att: 0.3, rel: 1.0, wet: 0.8 }); G.pad(t0, BAR + 0.9, ch.pad.slice(1).map((n) => n + 12), 0.015, { wave: 'triangle', cut: 4000, att: 0.5, rel: 1.0, wet: 0.85 }); orgel(t0, ch, 0.024);
      G.sub(t0, BAR - 0.05, ch.bass, 0.06, { att: 0.05, rel: 0.5 }); ost(t0, ch, 16, 0.052, 2); rise(t0, 0.022);
      kmSteps('L.....l.L...l.L.', (x, e) => G.taiko(t0 + e * S, x === 'L' ? 36 : 43, x === 'L' ? 0.3 : 0.24)); G.kick(t0, 0.65, { f0: 110, f1: 40, dec: 0.5, soft: true });
      G.mel(t0, cn, (t, n, l) => { horn(t, n + 12, l * 0.98, 0.075); G.saw5(t, l * 0.96, n + 12, 0.02, { att: 0.06, rel: 0.25, cut: 4400, wet: 0.75 }); G.piano(t, n, 0.42, 3, { wet: 0.75, dly: 0.2 }); });
    } else if (sec === 'tail') {
      G.pad(t0, BAR + 0.9, ch.pad, 0.014, { cut: 1100, att: 0.7, rel: 1.0, wet: 0.85 });
      if (!lastBar) tick(G, t0, 1 - 0.4 * pr); else { for (let e = 0; e < 9; e++) tick1(G, t0 + e * S, e, 0.7); }   // die Uhr bleibt auf der Drei stehen
      if (!lastBar || s.bars === 1) G.mel(t0, cn, (t, n) => G.piano(t, n, 0.34, 3.5, { wet: 0.85, dly: 0.2 }), { skip: (b) => b === 1.5 });
      if (lastBar) { braam(G, t0, 0.06, 1); G.piano(t0, 38, 0.42, 4, { wet: 0.9 }); G.piano(t0, 50, 0.3, 4, { wet: 0.9 }); }
    }
  }
  if (si > 0 && !(c && c.at0)) {
    if (sec === 'title') { A.impact(s.t0, 1.2); A.noise(s.t0, 2.4, 8000, 3000, 0.14, { wet: 0.8 }); }
    else if (sec === 'peak' || sec === 'drive' || sec === 'lift') { A.impact(s.t0, sec === 'peak' ? 0.8 : 0.6); A.whoosh(s.t0, 0.14, 0.9); }
    else if (sec === 'pulse') A.impact(s.t0, 0.5);
    else if (sec === 'stop') A.tone(s.t0, 2.2, 55, 'sine', 0.12, { bend: 2.2, bendT: 1.6, decay: true, att: 0.005, cut: 300, wet: 0.5 });
    else if (sec === 'tail') A.impact(s.t0, 0.4);
  }
  (P.hitsT || []).forEach(([lt, v]) => { if (lt < 0.01) return; const t = s.t0 + lt; if (v >= 0.8) { A.taiko(t, 31, 0.36 * v); A.whoosh(t, 0.1, 0.5); A.noise(t, 0.02, 3400, 2800, 0.1, { type: 'bandpass', q: 7, wet: 0.3 }); } else if (v >= 0.4) A.taiko(t, 36, 0.16 + 0.1 * v); else A.noise(t, 0.016, 3400, 2800, 0.07, { type: 'bandpass', q: 7, wet: 0.3 }); });
  /* Tafel: der tiefe Ton am Tafelbeginn, darunter nur die Uhr */
  if (c) { braam(A, c.a, 0.12, 1.5); for (let t = c.a, e = 0; t < c.b - 1e-6; t += S, e++) tick1(A, t, e, 1.1); }
};

/* ---------- Helden (88 BPM): vom einsamen Klavier zum großen Finale ---------- */
KGM.helden = (A, s, si, sc, P) => {
  const sec = KS[s.id].sec, prog = progFor(s.bars), last = si === sc.length - 1, S = B / 4, c = kmC(s, P), G = kmGate(A, c);
  /* Chor: hohe Dreieck- und Sinus-Flächen */
  const choir = (X, t0, ch, g0, d = BAR + 0.9) => { X.pad(t0, d, ch.pad.slice(1).map((n) => n + 12), g0, { wave: 'triangle', cut: 3400, att: 0.7, rel: 1.0, wet: 0.9 }); X.pad(t0, d, [ch.pad[2] + 24], g0 * 0.5, { wave: 'sine', cut: 5200, att: 0.9, rel: 1.0, wet: 0.9 }); };
  /* Blech: Hörner in zwei Lagen, trp = Trompeten eine Oktave darüber */
  const horns = (t, n, l, g0, trp) => { G.tone(t, l, midi(n - 12), 'sawtooth', g0, { att: 0.06, rel: 0.18, cut: 2000, wet: 0.7 }); G.tone(t, l, midi(n), 'sawtooth', g0 * 1.05, { att: 0.07, rel: 0.18, cut: 3000, det: 5, wet: 0.7 }); if (trp) G.tone(t, l, midi(n + 12), 'sawtooth', g0 * 0.55, { att: 0.05, rel: 0.16, cut: 4400, det: -6, wet: 0.7 }); };
  /* „Amboss“: kurzer heller Metallschlag */
  const anvil = (X, t, g0) => { X.tone(t, 0.3, 2093, 'square', g0 * 0.45, { decay: true, att: 0.001, cut: 9000, wet: 0.5 }); X.tone(t, 0.22, 3136, 'triangle', g0 * 0.4, { decay: true, att: 0.001, cut: 11000, wet: 0.5 }); X.tone(t, 0.5, 1245, 'sine', g0 * 0.3, { decay: true, att: 0.001, cut: 9000, wet: 0.5 }); X.noise(t, 0.05, 7000, 4500, g0 * 0.8, { wet: 0.3 }); };
  const ost = (t0, ch, n, g0) => { for (let e = 0; e < n; e++) { const nn = ch.arp[KM_IX[e % 8]], t = t0 + (e * BAR) / n, gg = g0 * (e % (n / 4) === 0 ? 1.3 : 0.9); G.tone(t, 0.13, midi(nn - 12), 'sawtooth', gg * 1.3, { decay: true, att: 0.004, cut: 3800, cut1: 1300, cutT: 0.09, pan: -0.3, wet: 0.55 }); G.tone(t, 0.13, midi(nn), 'sawtooth', gg * 1.25, { decay: true, att: 0.004, cut: 5600, cut1: 1900, cutT: 0.09, pan: 0.3, wet: 0.55 }); if (n === 16 && e % 2 === 0) G.tone(t, 0.1, midi(nn + 12), 'sawtooth', gg * 0.5, { decay: true, att: 0.004, cut: 7000, cut1: 2600, cutT: 0.07, wet: 0.6 }); } };
  /* Marsch-Trommel */
  const march = (t0, g0) => kmSteps('x..xx.x.x..xx.xx', (_, e) => G.snare(t0 + e * S, g0 * (e % 4 === 0 ? 1.4 : 0.8)));
  const cymb = (X, t, g0) => X.noise(t, 2.0, 9500, 5200, g0, { wet: 0.7 });
  for (let k = 0; k < s.bars; k++) {
    const t0 = s.t0 + k * BAR, cn = prog[k], ch = CH[cn], lastBar = k === s.bars - 1, pr = s.bars > 1 ? k / (s.bars - 1) : 1;
    if (sec === 'dark') {
      G.piano(t0 + B, ch.mel[0][1], 0.5, 5, { wet: 0.95 }); G.piano(t0 + 3 * B, ch.arp[k % 2 ? 1 : 2], 0.34, 4, { wet: 0.95 }); G.piano(t0, ch.bass + 12, 0.3, 5, { wet: 0.9 }); G.pad(t0, BAR + 0.9, [ch.pad[0], ch.pad[1]], 0.016, { cut: 700, att: 1.2, rel: 1.2, wet: 0.9 });
    } else if (sec === 'piano') {
      /* Solo-Klavier: das Motiv rechts, gebrochener Akkord links */
      G.mel(t0, cn, (t, n, l) => G.piano(t, n, 0.46, Math.max(2.6, l * 2.6), { wet: 0.9, dly: 0.15 }));
      [0, 1, 2, 3].forEach((b, i) => G.piano(t0 + b * B, [ch.bass + 12, ch.bass + 19, ch.bass + 24, ch.bass + 19][i], 0.24, 2.4, { wet: 0.85 }));
      if (pr >= 0.5) choir(G, t0, ch, 0.004); if (lastBar && !last) G.riser(t0 + BAR * 0.4, BAR * 0.6, 0.08);
    } else if (sec === 'pulse' || sec === 'lift') {
      const E = sec === 'lift' ? 1.25 : 1.0 + 0.3 * pr;
      G.pad(t0, BAR + 0.8, ch.pad, 0.024 * E, { cut: 1200 + 1000 * pr, att: 0.6, rel: 0.9, wet: 0.8 }); choir(G, t0, ch, (sec === 'lift' ? 0.012 : 0.008) * E); G.sub(t0, BAR - 0.05, ch.bass, 0.055 * E, { att: 0.08, rel: 0.4 });
      march(t0, 0.035 * E); G.taiko(t0, 38, 0.26 * E); if (pr > 0.5 || sec === 'lift') ost(t0, ch, 8, 0.032 * E);
      G.mel(t0, cn, (t, n, l) => G.piano(t, n, 0.38, Math.max(2.2, l * 2.2), { wet: 0.8, dly: 0.15 }));
      if (sec === 'lift') { if (k === 0) G.chime(t0 + 0.1, [74, 77, 81, 86, 89], 0.05, 0.07); G.mel(t0, cn, (t, n, l) => horns(t, n, l * 0.96, 0.048)); }
      if (lastBar && !last) { G.riser(t0, BAR, 0.16); for (let e = 8; e < 16; e++) G.snare(t0 + e * S, 0.03 + (e - 8) * 0.016); }
    } else if (sec === 'drive' || sec === 'peak') {
      const pk = sec === 'peak', E = pk ? 1.05 : 1.0 + 0.1 * pr;
      G.pad(t0, BAR + 0.8, ch.pad, 0.025 * E, { cut: pk ? 3000 : 2200, att: 0.4, rel: 0.8, wet: 0.8 }); choir(G, t0, ch, (pk ? 0.014 : 0.01) * E); G.sub(t0, BAR - 0.05, ch.bass, 0.05 * E, { att: 0.05, rel: 0.3 });
      ost(t0, ch, pk ? 16 : 8, (pk ? 0.044 : 0.052) * E); for (let e = 0; e < 8; e++) G.bass(t0 + (e * B) / 2, B / 2 - 0.02, ch.bass + 12, 0.045, { cut: pk ? 1900 : 1400, cut1: 500 });
      kmSteps(pk ? 'L..l.lL.L..lL.lL' : 'L...l...L..l.l..', (x, e) => G.taiko(t0 + e * S, x === 'L' ? 36 : 43, (x === 'L' ? 0.3 : 0.22) * E));
      G.kick(t0, 0.55, { f0: 120, f1: 44, dec: 0.4, soft: true }); G.kick(t0 + 2 * B, 0.45, { f0: 120, f1: 44, dec: 0.35, soft: true }); march(t0, pk ? 0.07 : 0.05);
      /* heroisches Blech mit dem Motiv, im Höhepunkt mit Trompeten-Oktave */
      G.mel(t0, cn, (t, n, l) => { horns(t, n, l * 0.96, 0.066 * E, pk); if (pk) G.saw5(t, l * 0.95, n + 12, 0.016, { att: 0.05, rel: 0.2, cut: 5000, wet: 0.7 }); });
      if (k % 2 === 0) { anvil(G, t0, 0.1); if (pk) anvil(G, t0 + 2 * B, 0.07); } if (k % 4 === 0) cymb(G, t0, 0.1);
      if (lastBar && !last) { G.riser(t0, BAR, 0.2); for (let e = 0; e < 16; e++) G.snare(t0 + e * S, 0.03 + e * 0.012); [12, 13, 14, 15].forEach((e, i) => G.taiko(t0 + e * S, 36 + i * 2, 0.28 + i * 0.08)); }
    } else if (sec === 'stop') {
      /* Stille mit einzelnen Klaviertönen — im letzten Takt Paukenwirbel, Becken und Chor schwellen an */
      if (k === 0) G.piano(t0 + B, 62, 0.3, 5, { wet: 0.95 }); else if (!lastBar) G.piano(t0 + B, 69, 0.2, 5, { wet: 0.95 });
      if (lastBar) { const e0 = s.bars > 1 ? 0 : 8; for (let e = e0; e < 16; e++) G.taiko(t0 + e * S, 38, 0.05 + (e - e0) * (s.bars > 1 ? 0.022 : 0.03)); G.riser(t0 + (s.bars > 1 ? 0 : BAR * 0.5), BAR * (s.bars > 1 ? 1 : 0.5), s.bars > 1 ? 0.24 : 0.16); A.swell(t0 + BAR, Math.min(BAR, 2.4), [62, 65, 69, 74], 0.035); }
    } else if (sec === 'title') {
      G.pad(t0, BAR + 0.9, ch.pad, 0.036, { cut: 2800, att: 0.25, rel: 1.0, wet: 0.8 }); choir(G, t0, ch, 0.03); G.sub(t0, BAR - 0.05, ch.bass, 0.1, { att: 0.04, rel: 0.5 });
      if (k === 0) G.braam(t0, BAR * 1.2, ch.bass + 12, 0.1);
      /* breit: lange, ineinander klingende Töne im Blech, die Trommeln nur in halben Noten */
      G.mel(t0, cn, (t, n, l) => { horns(t, n, l * 1.25, 0.115, true); G.piano(t, n, 0.42, 2.8, { wet: 0.7 }); G.saw5(t, l * 1.2, n + 12, 0.024, { att: 0.08, rel: 0.3, cut: 4800, wet: 0.75 }); });
      G.taiko(t0, 33, 0.5); G.taiko(t0 + 2 * B, 38, 0.36); G.kick(t0, 0.6, { f0: 120, f1: 44, dec: 0.45, soft: true }); ost(t0, ch, 8, 0.042);
      if (k % 2 === 0) { cymb(G, t0, 0.14); anvil(G, t0, 0.12); }
    } else if (sec === 'tail') {
      /* das Klavier allein, zum Schluss der d-Moll-Akkord über alle Lagen */
      if (!lastBar || s.bars === 1) { G.mel(t0, cn, (t, n, l) => G.piano(t, n, 0.44, Math.max(2.6, l * 2.6), { wet: 0.9, dly: 0.15 })); [0, 2].forEach((b, i) => G.piano(t0 + b * B, [ch.bass + 12, ch.bass + 19][i], 0.24, 3, { wet: 0.85 })); }
      if (lastBar) { const tb = s.bars === 1 ? t0 + 2 * B : t0; [38, 50, 57, 62, 65, 69, 74].forEach((n) => G.piano(tb, n, 0.32, 4.5, { wet: 0.9 })); G.taiko(tb, 38, 0.3); choir(G, tb, CH.Dm, 0.008, BAR); }
    }
  }
  if (si > 0 && !(c && c.at0)) {
    if (sec === 'title') { A.impact(s.t0, 1.1); cymb(A, s.t0, 0.18); anvil(A, s.t0, 0.14); A.chime(s.t0 + 0.05, [74, 77, 81, 86, 89], 0.06, 0.06); }
    else if (sec === 'peak' || sec === 'drive') { A.whoosh(s.t0, 0.16, 0.6); A.impact(s.t0, sec === 'peak' ? 0.8 : 0.6); cymb(A, s.t0, 0.12); }
    else if (sec === 'lift') { A.impact(s.t0, 0.5); cymb(A, s.t0, 0.1); }
    else if (sec === 'pulse') { A.taiko(s.t0, 38, 0.4); A.whoosh(s.t0, 0.1, 0.7); }
    else if (sec === 'stop') { A.piano(s.t0, 38, 0.3, 4, { wet: 0.9 }); A.noise(s.t0, 1.6, 2000, 100, s.bars > 1 ? 0.14 : 0.08, { type: 'lowpass', wet: 0.9 }); }
    else if (sec === 'tail') A.impact(s.t0, 0.3);
  }
  (P.hitsT || []).forEach(([lt, v]) => { if (lt < 0.01) return; const t = s.t0 + lt; if (v >= 0.8) { A.taiko(t, 38, 0.36 * v); anvil(A, t, 0.06); A.noise(t, 0.5, 9000, 5000, 0.05, { wet: 0.5 }); } else if (v >= 0.4) A.taiko(t, 40, 0.14 + 0.1 * v); });
  /* Tafel: der Chor schwillt an, die Trommeln schweigen; je Zeile eine Klavier-Oktave */
  if (c) {
    choir(A, c.a, CH.Dm, 0.012, c.d + 0.6); A.swell(c.b, Math.min(c.d, 2.4), [62, 65, 69], 0.03);
    for (let i = 0; i < c.n; i++) { const t = kmLine(c, i); A.piano(t, 50, 0.3, 3.5, { wet: 0.9 }); A.piano(t, 62, 0.22, 3.5, { wet: 0.9 }); }
  }
};

/* ---------- Countdown (120 BPM, im halben Tempo empfunden): stiller Teaser, am Ende tickt die Uhr ---------- */
/* Solo-Klavier mit dem Motiv in halbem Tempo (ein Motiv-Takt über zwei Takte), Streicherfläche, im Titel ein breiter Satz ohne schnelle
   Trommeln. In der Stille beginnt leise ein Ticken; in der Szene clock schlägt es auf jeder Sekunde (zwei Schläge, abwechselnd „Tick“ und
   „Tack“), darunter nur ein tiefer Bordun und alle vier Sekunden ein dumpfer Schlag. */
KGM.countdown = (A, s, si, sc, P) => {
  const sec = KS[s.id].sec, last = si === sc.length - 1, c = kmC(s, P), G = kmGate(A, c), prog = progFor(Math.max(1, Math.ceil(s.bars / 2)));
  /* Ticken: kurzer heller Schlag mit etwas Körper; hi = „Tick“, sonst „Tack“ */
  const tick = (t, g0, hi) => { A.noise(t, 0.035, hi ? 4200 : 2900, hi ? 3400 : 2300, g0 * 1.6, { type: 'bandpass', q: 4, wet: 0.35 }); A.noise(t, 0.012, 7000, 5000, g0 * 0.5, { wet: 0.2 }); A.tone(t, 0.06, hi ? 1900 : 1350, 'sine', g0 * 0.5, { decay: true, att: 0.001, cut: 9000, wet: 0.35 }); A.tone(t, 0.08, hi ? 520 : 390, 'triangle', g0 * 0.4, { decay: true, att: 0.001, cut: 2400, wet: 0.25 }); };
  /* Motiv in halbem Tempo: die Töne eines Motiv-Takts über zwei Takte */
  const mel2 = (t0, cn, fn) => CH[cn].mel.forEach(([b, n, l]) => fn(t0 + b * 2 * B, n, l * 2 * B));
  const horn = (t, n, l, g0) => { G.tone(t, l * 0.97, midi(n - 12), 'sawtooth', g0, { att: 0.12, rel: 0.3, cut: 1700, wet: 0.75 }); G.tone(t, l * 0.97, midi(n), 'sawtooth', g0 * 0.9, { att: 0.14, rel: 0.3, cut: 2500, det: 5, wet: 0.75 }); };
  if (sec === 'clock') {
    /* die Uhr: Sekunde für Sekunde, bis der Film ausblendet */
    const n = Math.floor(s.D + 1e-6);
    for (let j = 0; j <= n; j++) { const t = s.t0 + j; if (t >= DUR - 0.05) break; tick(t, j === 0 ? 0.5 : 0.42, j % 2 === 0); if (j % 4 === 0) { A.taiko(t, 33, j === 0 ? 0.26 : 0.16); A.sub(t, 3.6, 26, 0.05, { att: 0.3, rel: 1.6 }); } }
    A.pad(s.t0, s.D, [38, 45, 50], 0.009, { cut: 520, att: 1.5, rel: 2.0, wet: 0.9 });
    /* das Motiv noch einmal ganz leise im Klavier, dann nur noch die Uhr */
    if (s.D >= 8) mel2(s.t0 + 2, 'Dm', (t, nn) => { if (t < s.t0 + s.D - 3.5) A.piano(t, nn, 0.22, 4.5, { soft: true, wet: 0.95, dly: 0.2 }); });
    A.impact(s.t0, 0.3);
    return;
  }
  for (let k = 0; k < s.bars; k++) {
    const t0 = s.t0 + k * BAR, cn = prog[Math.floor(k / 2) % prog.length], ch = CH[cn], first = k % 2 === 0, lastBar = k === s.bars - 1, pr = s.bars > 1 ? k / (s.bars - 1) : 1;
    if (sec === 'dark') {
      G.sub(t0, BAR + 0.3, 26, 0.09, { att: 0.5, rel: 0.8 }); if (first) G.pad(t0, 2 * BAR + 0.8, [38, 45, 50], 0.014, { cut: 460 + 260 * pr, att: 1.2, rel: 1.4, wet: 0.9 });
      if (k === 0) G.piano(t0 + B, 74, 0.2, 5, { soft: true, wet: 0.95 }); if (lastBar && s.bars > 1) G.piano(t0 + 2 * B, 69, 0.17, 4.5, { soft: true, wet: 0.95 });
    } else if (sec === 'piano' || sec === 'tail') {
      if (first) { G.pad(t0, 2 * BAR + 0.8, ch.pad, 0.013, { cut: 700, att: 1.0, rel: 1.2, wet: 0.9 }); G.piano(t0, ch.bass + 12, 0.28, 5, { soft: true, wet: 0.85 }); G.piano(t0, ch.bass + 24, 0.14, 4.5, { soft: true, wet: 0.85 }); mel2(t0, cn, (t, n, l) => G.piano(t, n, 0.38, Math.max(3, l * 1.6), { soft: true, wet: 0.9, dly: 0.2 })); }
      else G.piano(t0 + 2 * B, ch.arp[1] - 12, 0.15, 4, { soft: true, wet: 0.85 });
    } else if (sec === 'pulse' || sec === 'lift') {
      const E = sec === 'lift' ? 1.05 : 0.8 + 0.3 * pr;
      if (first) { G.pad(t0, 2 * BAR + 0.8, ch.pad, 0.02 * E, { cut: 1100 + 900 * pr, att: 0.9, rel: 1.2, wet: 0.85 }); G.pad(t0, 2 * BAR + 0.8, [ch.pad[2] + 12, ch.pad[3] + 12], 0.009 * E, { wave: 'triangle', cut: 3800, att: 1.2, rel: 1.2, wet: 0.9 }); G.sub(t0, 2 * BAR - 0.1, ch.bass, 0.06 * E, { att: 0.2, rel: 0.8 }); G.piano(t0, ch.bass + 12, 0.3 * E, 5, { wet: 0.8 });
        mel2(t0, cn, (t, n, l) => { G.piano(t, n, 0.42 * E, Math.max(3, l * 1.6), { wet: 0.85, dly: 0.2 }); if (sec === 'lift' || pr > 0.45) G.tone(t, l * 0.96, midi(n + 12), 'triangle', 0.02 * E, { att: 0.2, rel: 0.4, cut: 4200, wet: 0.85, vib: 6, vibD: 0.3 }); }); }
      /* leiser Puls im halben Tempo */
      G.kick(t0, 0.3 * E, { f0: 100, f1: 44, dec: 0.5, soft: true }); if (!first) G.piano(t0 + 2 * B, ch.arp[2] - 12, 0.16 * E, 3.5, { soft: true, wet: 0.85 });
      if (sec === 'lift' && k === 0) G.chime(t0 + 0.3, [74, 77, 81, 86], 0.035, 0.12);
      if (lastBar && !last) G.riser(t0 + BAR * 0.3, BAR * 0.7, 0.08);
    } else if (sec === 'drive' || sec === 'peak') {
      const pk = sec === 'peak', E = pk ? 1.1 : 0.95;
      if (first) { G.pad(t0, 2 * BAR + 0.8, ch.pad, 0.026 * E, { cut: pk ? 2600 : 1900, att: 0.7, rel: 1.2, wet: 0.85 }); G.pad(t0, 2 * BAR + 0.8, [ch.pad[2] + 12, ch.pad[3] + 12], 0.013 * E, { wave: 'triangle', cut: 4200, att: 1.0, rel: 1.2, wet: 0.9 }); G.sub(t0, 2 * BAR - 0.1, ch.bass, 0.07 * E, { att: 0.15, rel: 0.8 });
        mel2(t0, cn, (t, n, l) => { G.piano(t, n, 0.46 * E, Math.max(3, l * 1.6), { wet: 0.8, dly: 0.2 }); G.piano(t, n + 12, 0.26 * E, 3, { wet: 0.85 }); horn(t, n, l, (pk ? 0.05 : 0.034) * E); }); G.taiko(t0, 33, (pk ? 0.34 : 0.24) * E); }
      else G.taiko(t0 + 2 * B, 38, (pk ? 0.24 : 0.16) * E);
      /* ruhiges Achtel-Ostinato der Streicher */
      for (let e = 0; e < 8; e++) { const n = ch.arp[KM_IX[e]], t = t0 + (e * B) / 2, gg = (pk ? 0.034 : 0.026) * E * (e % 4 === 0 ? 1.25 : 0.9); G.tone(t, 0.2, midi(n - 12), 'sawtooth', gg, { decay: true, att: 0.01, cut: 2600, cut1: 900, cutT: 0.16, pan: -0.3, wet: 0.7 }); if (pk) G.tone(t, 0.2, midi(n), 'sawtooth', gg * 0.9, { decay: true, att: 0.01, cut: 3600, cut1: 1200, cutT: 0.16, pan: 0.3, wet: 0.7 }); }
      if (lastBar && !last) { G.riser(t0, BAR, 0.14); G.swell(t0 + BAR, Math.min(BAR, 1.8), CH.Dm.pad, 0.03); }
    } else if (sec === 'stop') {
      /* Stille — und zum ersten Mal die Uhr, noch fern */
      if (k === 0) { G.sub(t0, Math.min(2, s.bars) * BAR, 26, 0.05, { att: 0.6, rel: 1.2 }); G.piano(t0 + B, 62, 0.26, 5, { soft: true, wet: 0.95 }); G.piano(t0 + B, 74, 0.16, 5, { soft: true, wet: 0.95 }); }
      for (let j = 0; j < 2; j++) tick(t0 + j * 2 * B, 0.1 + 0.1 * pr, (k * 2 + j) % 2 === 0);
      if (lastBar) { G.riser(t0, BAR, 0.2); G.swell(t0 + BAR, Math.min(BAR, 1.8), CH.Dm.pad, 0.04); }
    } else if (sec === 'title') {
      const E = k < 2 ? 1.12 : 1;
      if (first) { G.pad(t0, 2 * BAR + 0.9, ch.pad, 0.032 * E, { cut: 2400, att: 0.4, rel: 1.3, wet: 0.85 }); G.pad(t0, 2 * BAR + 0.9, ch.pad.slice(1).map((n) => n + 12), 0.017, { wave: 'triangle', cut: 4200, att: 0.6, rel: 1.3, wet: 0.9 }); G.sub(t0, 2 * BAR - 0.1, ch.bass, 0.1, { att: 0.08, rel: 0.9 }); G.braam(t0, 2 * BAR * 0.9, ch.bass + 12, k === 0 ? 0.11 : 0.07); G.taiko(t0, 33, 0.42);
        mel2(t0, cn, (t, n, l) => { G.piano(t, n, 0.52, Math.max(3, l * 1.6), { wet: 0.8, dly: 0.2 }); G.piano(t, n + 12, 0.3, 3, { wet: 0.85 }); horn(t, n, l, 0.06 * E); G.saw5(t, l * 0.97, n + 12, 0.012, { att: 0.15, rel: 0.4, cut: 4200, wet: 0.8 }); }); }
      else G.taiko(t0 + 2 * B, 38, 0.3);
      if (lastBar) { G.pad(t0, BAR, [38, 50, 57, 62, 65], 0.02, { cut: 1500, att: 0.3, rel: BAR * 0.7, wet: 0.9 }); }
    }
  }
  /* Tafel: eine Klavier-Oktave und eine leise Fläche */
  if (c) { A.piano(c.a + 0.2, 50, 0.3, 5, { soft: true, wet: 0.95 }); A.piano(c.a + 0.2, 62, 0.22, 5, { soft: true, wet: 0.95 }); A.pad(c.a, c.d + 0.6, [50, 57, 62], 0.012, { wave: 'triangle', cut: 2200, att: 0.8, rel: 1.0, wet: 0.9 }); }
  /* Szenenwechsel und Schnitte: zurückhaltend */
  if (si > 0) {
    if (sec === 'title') { A.impact(s.t0, 1.0); A.chime(s.t0 + 0.05, [74, 77, 81, 86], 0.055, 0.08); A.noise(s.t0, 2.4, 8000, 3500, 0.1, { wet: 0.8 }); }
    else if (sec === 'peak' || sec === 'drive' || sec === 'lift') { A.whoosh(s.t0, 0.1, 0.9); A.impact(s.t0, sec === 'peak' ? 0.5 : 0.35); }
    else if (sec === 'stop') { A.tone(s.t0, 1.8, 62, 'sine', 0.14, { decay: true, att: 0.005, bend: 2.0, bendT: 1.2, cut: 400, wet: 0.5 }); }
    else if (sec === 'pulse') A.impact(s.t0, 0.25);
  }
  (P.hitsT || []).forEach(([lt, v]) => { if (lt < 0.01 || v < 0.8) return; const t = s.t0 + lt; if (c && t >= c.a && t < c.b) return; A.taiko(t, 38, 0.14); A.noise(t, 0.6, 5000, 2000, 0.025, { wet: 0.6 }); });
};
