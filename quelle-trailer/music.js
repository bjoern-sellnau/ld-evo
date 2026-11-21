/* Trailer — eigene Musik, vollständig im Browser synthetisiert (Web Audio, OfflineAudioContext) — keine Samples, keine fremden Rechte.
   Drei Stücke über dasselbe Leitmotiv in d-Moll (Dm · B♭ · F · C): Cinematic 96 BPM, Treibend 128 BPM, Ruhig 80 BPM.
   Das Arrangement folgt der Szenenfolge (REEL.scenes): jede Szene beginnt auf der Eins, Akzente liegen auf den Bildwechseln. */
'use strict';
const midi = (n) => 440 * Math.pow(2, (n - 69) / 12);
/* Akkorde: Bass (tief), Fläche, gebrochener Akkord, Melodie-Takt (Schlag, Note, Länge in Schlägen) */
const CH = {
  Dm: { bass: 38, pad: [50, 57, 60, 65], arp: [62, 65, 69, 72], mel: [[0, 69, 1.5], [1.5, 74, 0.5], [2, 72, 1], [3, 69, 1]] },
  Bb: { bass: 34, pad: [46, 53, 57, 62], arp: [58, 62, 65, 69], mel: [[0, 65, 1.5], [1.5, 70, 0.5], [2, 69, 2]] },
  F: { bass: 41, pad: [53, 57, 60, 67], arp: [60, 65, 69, 72], mel: [[0, 69, 1.5], [1.5, 72, 0.5], [2, 77, 1], [3, 76, 1]] },
  C: { bass: 36, pad: [48, 55, 62, 64], arp: [60, 64, 67, 72], mel: [[0, 76, 1.5], [1.5, 74, 0.5], [2, 72, 1], [3, 67, 1]] },
  Gm: { bass: 43, pad: [55, 58, 62, 65], arp: [62, 67, 70, 74], mel: [[0, 67, 1.5], [1.5, 70, 0.5], [2, 74, 2]] },
};
const P8 = ['Dm', 'Bb', 'F', 'C', 'Dm', 'Bb', 'Gm', 'C'];
/* Akkordfolge einer Szene: beginnt auf Dm, der letzte Takt führt über C zurück */
function progFor(n) { if (n === 1) return ['Dm']; if (n === 2) return ['Dm', 'C']; if (n === 3) return ['Dm', 'Bb', 'C']; const p = Array.from({ length: n }, (_, i) => P8[i % 8]); p[n - 1] = 'C'; if (n % 4 === 1) p[n - 2] = 'Gm'; return p; }
const SECT = { logo: 'intro', claim: 'intro2', person: 'build', origin: 'soft', stack: 'main', journey: 'main', award: 'break', labs: 'drop', site: 'drop', family: 'soft', certs: 'main', outro: 'outro', focus: 'build', works: 'main', labsAll: 'main', hero: 'drop', quote: 'break', quote2: 'break' };
/* Lange Szenen (über 12 Takte, in der langen Fassung die Reise) wechseln alle vier Takte den Satz — sonst wird es eintönig */
const LONG = ['main', 'main', 'soft', 'main', 'drop', 'main', 'build', 'drop'];
const barSect = (s, k) => (s.bars > 12 && SECT[s.id] === 'main' ? LONG[Math.floor(k / 4) % LONG.length] : SECT[s.id]);

/* Die Musik entsteht abschnittsweise (je rund 15 s plus Ausklang) und wird überlagert; der Master (Tiefensperre, Höhen,
   Kompressor, Blenden) läuft danach einmal über das Ganze. Ein einziger Durchlauf über die volle Länge wäre bei langen
   Stücken unbrauchbar langsam: Jeder geplante Klang kostet in jedem Block Rechenzeit — der Aufwand wächst quadratisch.
   Hall und Echo sind linear, die Überlagerung der Abschnitte ergibt deshalb dasselbe wie ein Durchlauf. */
const M_SR = 48000, M_TAIL = 9;
async function musicWindow(W0, W1) {
  const SR = M_SR, ac = new OfflineAudioContext(2, Math.ceil((W1 - W0 + M_TAIL) * SR), SR);
  const master = ac.createGain(); master.connect(ac.destination);
  /* Hall: erzeugte Impulsantwort (Rauschen mit Abklingen, zum Ende dunkler) */
  const vLen = MOOD === 'drive' ? 1.9 : MOOD === 'cine' ? 3.4 : 3.8, ir = ac.createBuffer(2, Math.floor(SR * vLen), SR);
  for (let c = 0; c < 2; c++) { const d = ir.getChannelData(c); let lp = 0; for (let i = 0; i < d.length; i++) { const x = i / d.length, n = (hash(i * 1.37 + c * 9.1) * 2 - 1) * Math.pow(1 - x, 2.6) * (i < SR * 0.012 ? i / (SR * 0.012) : 1); const k = 0.5 - 0.42 * x; lp += k * (n - lp); d[i] = lp; } }
  const verb = ac.createConvolver(); verb.buffer = ir; const verbG = ac.createGain(); verbG.gain.value = MOOD === 'drive' ? 0.55 : 0.8; verb.connect(verbG); verbG.connect(master);
  /* Echo (Ping-Pong, punktierte Achtel) */
  const dL = ac.createDelay(2), dR = ac.createDelay(2), fb = ac.createGain(), dIn = ac.createGain(), mrg = ac.createChannelMerger(2), dOut = ac.createGain();
  dL.delayTime.value = B * 0.75; dR.delayTime.value = B * 0.75; fb.gain.value = 0.36; dOut.gain.value = 0.5;
  dIn.connect(dL); dL.connect(dR); dR.connect(fb); fb.connect(dL); dL.connect(mrg, 0, 0); dR.connect(mrg, 0, 1); mrg.connect(dOut); dOut.connect(master); dOut.connect(verb);
  /* Bus mit „Pumpen“ zur Bassdrum (nur Treibend) */
  const duck = ac.createGain(); duck.connect(master);
  const nb = ac.createBuffer(1, SR * 2, SR); { const d = nb.getChannelData(0); for (let i = 0; i < d.length; i++) d[i] = hash(i * 0.731) * 2 - 1; }
  const shaper = ac.createWaveShaper(); { const c = new Float32Array(1024); for (let i = 0; i < 1024; i++) { const x = i / 511.5 - 1; c[i] = Math.tanh(2.6 * x); } shaper.curve = c; } const shG = ac.createGain(); shG.gain.value = 0.5; shaper.connect(shG); shG.connect(master); shG.connect(verb);

  const env = (gn, t, a, peak, dur, rel = 0.08) => { const pk = Math.max(0.0002, peak); gn.gain.setValueAtTime(0.0001, t); gn.gain.exponentialRampToValueAtTime(pk, t + a); gn.gain.setValueAtTime(pk, Math.max(t + a, t + dur - rel)); gn.gain.exponentialRampToValueAtTime(0.0001, t + dur); };
  const route = (node, o) => { let n = node; if (o.pan) { const p = ac.createStereoPanner(); p.pan.value = clamp(o.pan, -1, 1); n.connect(p); n = p; } n.connect(o.bus ?? master); if (o.wet) { const w = ac.createGain(); w.gain.value = o.wet; n.connect(w); w.connect(verb); } if (o.dly) { const w = ac.createGain(); w.gain.value = o.dly; n.connect(w); w.connect(dIn); } };
  const A = {};
  A.tone = (t, dur, freq, type, gain, o = {}) => {
    if (t < W0 || t >= W1 || gain <= 0) return; t -= W0; const os = ac.createOscillator(); os.type = type; os.frequency.value = freq; os.detune.value = o.det ?? 0;
    const f = ac.createBiquadFilter(); f.type = 'lowpass'; f.Q.value = o.q ?? 0.7; const c0 = o.cut ?? 3000; f.frequency.setValueAtTime(c0, t); if (o.cut1) f.frequency.exponentialRampToValueAtTime(o.cut1, t + (o.cutT ?? dur));
    const gn = ac.createGain(); if (o.decay) { gn.gain.setValueAtTime(0.0001, t); gn.gain.exponentialRampToValueAtTime(Math.max(0.0002, gain), t + (o.att ?? 0.005)); gn.gain.exponentialRampToValueAtTime(0.0001, t + dur); } else env(gn, t, o.att ?? 0.01, gain, dur, o.rel ?? 0.08);
    os.connect(f); f.connect(gn); route(gn, o); os.start(t); os.stop(t + dur + 0.05);
  };
  A.noise = (t, dur, f0, f1, gain, o = {}) => {
    if (t < W0 || t >= W1 || gain <= 0) return; const off = hash(t * 13.7) * 1.5; t -= W0; const s = ac.createBufferSource(); s.buffer = nb; s.loop = true;
    const f = ac.createBiquadFilter(); f.type = o.type ?? 'highpass'; f.Q.value = o.q ?? 0.7; f.frequency.setValueAtTime(f0, t); f.frequency.exponentialRampToValueAtTime(f1, t + dur);
    const gn = ac.createGain(); if (o.swell) { gn.gain.setValueAtTime(0.0001, t); gn.gain.exponentialRampToValueAtTime(gain, t + dur * 0.92); gn.gain.exponentialRampToValueAtTime(0.0001, t + dur); } else { gn.gain.setValueAtTime(0.0001, t); gn.gain.exponentialRampToValueAtTime(gain, t + (o.att ?? 0.002)); gn.gain.exponentialRampToValueAtTime(0.0001, t + dur); }
    s.connect(f); f.connect(gn); route(gn, o); s.start(t, off); s.stop(t + dur + 0.05);
  };
  /* Klavier (additiv: Teiltöne mit eigenem Abklingen, leicht gespreizt); soft = Filzklavier */
  A.piano = (t, note, vel = 0.5, dur = 2.4, o = {}) => {
    const f = midi(note), soft = o.soft ? 0.72 : 1, hi = clamp((note - 48) / 40);
    [1, 2, 3, 4, 5, 6].forEach((k, i) => { const g0 = vel * [0.5, 0.26, 0.14, 0.08, 0.045, 0.025][i] * (i ? soft : 1) * (1 - hi * 0.1 * i); if (f * k > 9000) return; A.tone(t, dur * (i ? 1 / (1 + i * 0.55) : 1) * (1 - hi * 0.4), f * k * (1 + 0.00035 * k * k), 'sine', g0, { decay: true, att: o.soft ? 0.012 : 0.004, cut: 12000, pan: o.pan ?? (note - 66) / 60, wet: i ? 0 : (o.wet ?? 0.5), dly: i ? 0 : (o.dly ?? 0), bus: o.bus }); });
    A.noise(t, 0.03, 1800, 600, vel * (o.soft ? 0.015 : 0.04), { type: 'bandpass', q: 1 });
  };
  A.pad = (t, dur, notes, gain, o = {}) => notes.forEach((n, i) => [-9, 9].forEach((d, k) => A.tone(t, dur, midi(n), o.wave ?? 'sawtooth', gain, { det: d + (i % 2 ? 3 : -3), att: o.att ?? 0.5, rel: o.rel ?? 0.7, cut: o.cut ?? 900, cut1: o.cut1, q: 0.5, pan: k ? 0.5 : -0.5, wet: o.wet ?? 0.5, bus: o.bus })));
  A.pluck = (t, note, gain, o = {}) => { A.tone(t, o.dur ?? 0.3, midi(note), 'sawtooth', gain, { decay: true, att: 0.003, cut: o.cut ?? 3800, cut1: 500, cutT: 0.16, q: 2.5, pan: o.pan, wet: o.wet ?? 0.25, dly: o.dly ?? 0.3, bus: o.bus }); A.tone(t, o.dur ?? 0.3, midi(note), 'square', gain * 0.4, { decay: true, att: 0.003, cut: 2200, cut1: 400, cutT: 0.12, pan: o.pan, bus: o.bus }); };
  A.bell = (t, note, gain, o = {}) => { A.tone(t, o.dur ?? 2.2, midi(note), 'sine', gain, { decay: true, att: 0.002, cut: 14000, pan: o.pan, wet: 0.7, dly: o.dly ?? 0.25 }); A.tone(t, (o.dur ?? 2.2) * 0.45, midi(note) * 3.01, 'sine', gain * 0.28, { decay: true, att: 0.002, cut: 14000, pan: o.pan, wet: 0.6 }); A.tone(t, (o.dur ?? 2.2) * 0.25, midi(note) * 5.4, 'sine', gain * 0.1, { decay: true, att: 0.002, cut: 14000, pan: o.pan, wet: 0.5 }); };
  A.bass = (t, dur, note, gain, o = {}) => { A.tone(t, dur, midi(note), 'sawtooth', gain, { att: 0.006, rel: 0.05, cut: o.cut ?? 700, cut1: o.cut1 ?? 220, cutT: dur, q: 3, bus: o.bus }); A.tone(t, dur, midi(note), 'sine', gain * 1.1, { att: 0.006, rel: 0.05, cut: 400, bus: o.bus }); };
  A.sub = (t, dur, note, gain, o = {}) => { A.tone(t, dur, midi(note), 'sine', gain, { att: o.att ?? 0.06, rel: o.rel ?? 0.3, cut: 300, bus: o.bus }); A.tone(t, dur, midi(note + 12), 'triangle', gain * 0.3, { att: o.att ?? 0.06, rel: o.rel ?? 0.3, cut: 600, bus: o.bus }); };
  A.kick = (t, g0 = 1, o = {}) => {
    if (t < W0 || t >= W1) return; if (!o.soft) A.noise(t, 0.018, 5000, 3000, 0.22 * g0); t -= W0; const os = ac.createOscillator(); os.frequency.setValueAtTime(o.f0 ?? 165, t); os.frequency.exponentialRampToValueAtTime(o.f1 ?? 46, t + 0.11);
    const gn = ac.createGain(); gn.gain.setValueAtTime(g0, t); gn.gain.exponentialRampToValueAtTime(0.001, t + (o.dec ?? 0.36)); let n = gn;
    if (o.lp) { const f = ac.createBiquadFilter(); f.type = 'lowpass'; f.frequency.value = o.lp; gn.connect(f); n = f; }
    os.connect(gn); n.connect(master); os.start(t); os.stop(t + (o.dec ?? 0.36) + 0.02);
    if (o.duck) { duck.gain.setValueAtTime(o.duck, t); duck.gain.linearRampToValueAtTime(1, t + B * 0.46); }
  };
  A.clap = (t, g0 = 0.3) => { [0, 0.011, 0.023].forEach((d) => A.noise(t + d, 0.03, 1500, 1100, g0 * 0.8, { type: 'bandpass', q: 1.2 })); A.noise(t + 0.03, 0.2, 1700, 700, g0, { type: 'bandpass', q: 0.9, wet: 0.5 }); };
  A.snare = (t, g0 = 0.3) => { A.noise(t, 0.2, 3200, 1200, g0, { type: 'bandpass', q: 0.8, wet: 0.4 }); A.tone(t, 0.12, 196, 'triangle', g0 * 0.6, { decay: true, cut: 1800 }); };
  A.hat = (t, g0 = 0.08, d = 0.035, pan = 0) => A.noise(t, d, 8500, 10500, g0, { pan });
  A.shaker = (t, g0 = 0.03, pan = 0) => A.noise(t, 0.07, 5200, 6800, g0, { type: 'bandpass', q: 1.4, att: 0.02, pan });
  A.taiko = (t, note = 38, g0 = 0.6) => { if (t < W0 || t >= W1) return; A.noise(t, 0.09, 900, 200, g0 * 0.35, { type: 'lowpass', wet: 0.5 }); t -= W0; const os = ac.createOscillator(); os.frequency.setValueAtTime(midi(note) * 1.7, t); os.frequency.exponentialRampToValueAtTime(midi(note), t + 0.14); const gn = ac.createGain(); gn.gain.setValueAtTime(g0, t); gn.gain.exponentialRampToValueAtTime(0.001, t + 0.8); os.connect(gn); route(gn, { wet: 0.6 }); os.start(t); os.stop(t + 0.85); };
  A.impact = (t, g0 = 1) => { A.kick(t, 1.0 * g0, { f0: 120, f1: 42, dec: 1.1, soft: true }); A.noise(t, 2.4, 1400, 70, 0.4 * g0, { type: 'lowpass', wet: 0.8 }); A.noise(t, 0.6, 6000, 2000, 0.12 * g0, { wet: 0.6 }); };
  A.riser = (t, dur, g0 = 0.22) => A.noise(t, dur, 300, 8000, g0, { type: 'bandpass', q: 2.2, swell: true, wet: 0.6 });
  A.whoosh = (t, g0 = 0.18, dur = 0.5) => A.noise(t - dur * 0.7, dur, 400, 5000, g0, { type: 'bandpass', q: 1.2, swell: true, wet: 0.5 });
  A.swell = (t1, dur, notes, g0 = 0.05) => notes.forEach((n) => { const ta = Math.max(0, t1 - dur); if (t1 - ta < 0.2 || t1 >= DUR || ta < W0 || ta >= W1) return; const t = ta - W0, te = t1 - W0; const os = ac.createOscillator(); os.type = 'sawtooth'; os.frequency.value = midi(n); const f = ac.createBiquadFilter(); f.type = 'lowpass'; f.frequency.setValueAtTime(300, t); f.frequency.exponentialRampToValueAtTime(3200, te); const gn = ac.createGain(); gn.gain.setValueAtTime(0.0001, t); gn.gain.exponentialRampToValueAtTime(g0, te - 0.02); gn.gain.exponentialRampToValueAtTime(0.0001, te + 0.06); os.connect(f); f.connect(gn); route(gn, { wet: 0.7 }); os.start(t); os.stop(te + 0.1); });
  A.braam = (t, dur, note, g0 = 0.2) => { if (t < W0 || t >= W1) return; A.sub(t, dur, note, g0 * 0.9, { att: 0.04, rel: dur * 0.5 }); t -= W0; [-14, -5, 0, 6, 13].forEach((d) => { const os = ac.createOscillator(); os.type = 'sawtooth'; os.frequency.value = midi(note); os.detune.value = d; const f = ac.createBiquadFilter(); f.type = 'lowpass'; f.Q.value = 1.2; f.frequency.setValueAtTime(260, t); f.frequency.exponentialRampToValueAtTime(1300, t + 0.25); f.frequency.exponentialRampToValueAtTime(380, t + dur); const gn = ac.createGain(); env(gn, t, 0.06, g0, dur, dur * 0.5); os.connect(f); f.connect(gn); gn.connect(shaper); os.start(t); os.stop(t + dur + 0.05); }); };
  A.chime = (t, notes = [74, 77, 81, 86], g0 = 0.07, gap = 0.09) => notes.forEach((n, i) => A.bell(t + i * gap, n, g0, { pan: i % 2 ? 0.4 : -0.4, dur: 2.6 }));
  A.mel = (t0, ch, fn, o = {}) => CH[ch].mel.forEach(([b, n, l]) => { if (o.skip && o.skip(b)) return; fn(t0 + b * B, n + (o.oct ?? 0), l * B); });

  const sc = REEL.scenes;
  sc.forEach((s, si) => {
    const sect0 = SECT[s.id], prog = progFor(s.bars), last = si === sc.length - 1, nextSect = last ? null : SECT[sc[si + 1].id];
    for (let k = 0; k < s.bars; k++) {
      const t0 = s.t0 + k * BAR, cn = prog[k], c = CH[cn], lastBar = k === s.bars - 1, sect = barSect(s, k);
      if (MOOD === 'cine') {
        const full = sect === 'main' || sect === 'drop', E = { intro: 0.5, intro2: 0.7, build: 0.85, soft: 0.75, main: 1, break: 0.8, drop: 1.15, outro: 0.8 }[sect];
        A.pad(t0, BAR + 0.6, c.pad, 0.03 * E, { cut: full ? 1500 : sect === 'intro' ? 520 : 950, cut1: sect === 'build' ? 2000 : undefined, att: 0.7, rel: 0.9 });
        if (!full) A.sub(t0, BAR, c.bass, sect === 'intro' ? 0.08 : 0.11, { att: 0.12, rel: 0.5 }); // im vollen Satz trägt der Achtel-Bass
        if (sect === 'intro') { if (k % 2 === 0) A.piano(t0, c.mel[0][1], 0.3, 3.4, { wet: 0.9 }); A.piano(t0 + 2 * B, c.arp[2], 0.2, 3, { wet: 0.9 }); }
        if (sect === 'intro2' || sect === 'break' || sect === 'outro') A.mel(t0, cn, (t, n, l) => A.piano(t, n, 0.5, Math.max(1.8, l * 2), { wet: 0.75, dly: 0.2 }));
        if (sect === 'break') { A.pad(t0, BAR + 0.6, c.pad.map((n) => n + 12), 0.012, { cut: 2400, att: 0.9 }); [0, 1, 2, 3].forEach((b) => A.bell(t0 + (b + 0.5) * B, c.arp[b] + 12, 0.03, { pan: b % 2 ? 0.5 : -0.5 })); }
        if (sect !== 'intro' && sect !== 'break') for (let e = 0; e < 8; e++) A.pluck(t0 + (e * B) / 2, c.arp[[0, 2, 1, 2, 3, 2, 1, 2][e]] - 12, (sect === 'outro' ? 0.05 : 0.08) * E * (e % 2 ? 0.75 : 1), { cut: full ? 3600 : 2200, pan: e % 2 ? 0.3 : -0.3, dly: 0.35 });
        if (sect === 'build' || full || sect === 'soft') { A.kick(t0, sect === 'soft' ? 0.55 : 0.8, { f0: 140, f1: 42, dec: 0.5 }); A.taiko(t0 + 2.5 * B, 38, 0.3 * E); if (lastBar && sect === 'build') [3, 3.25, 3.5, 3.75].forEach((b, i) => A.taiko(t0 + b * B, 38 + i * 2, 0.3 + i * 0.07)); }
        if (full) {
          A.clap(t0 + 2 * B, 0.26); for (let e = 0; e < 8; e++) A.hat(t0 + (e * B) / 2, e % 2 ? 0.07 : 0.045, 0.03, e % 2 ? 0.3 : -0.3);
          for (let e = 0; e < 8; e++) A.bass(t0 + (e * B) / 2, B / 2 - 0.02, c.bass + (e % 2 ? 12 : 0), 0.1, { cut: sect === 'drop' ? 1100 : 750 });
          A.mel(t0, cn, (t, n, l) => { A.piano(t, n, 0.5, Math.max(1.6, l * 2), { wet: 0.6 }); if (sect === 'drop') [-7, 7].forEach((d, i) => A.tone(t, l * 0.95, midi(n + 12), 'sawtooth', 0.065, { att: 0.02, rel: 0.12, cut: 3200, det: d, wet: 0.5, dly: 0.35, pan: i ? 0.2 : -0.2 })); });
          if (sect === 'drop') { A.kick(t0 + 2.5 * B, 0.6, { f0: 140, f1: 42, dec: 0.4 }); if (k % 2 === 0) A.braam(t0, BAR * 0.9, c.bass, 0.14); for (let e = 0; e < 16; e++) A.pluck(t0 + (e * B) / 4, c.arp[e % 4] + (e % 8 > 3 ? 12 : 0), 0.034, { cut: 5600, pan: e % 2 ? 0.6 : -0.6, dur: 0.18 }); }
        }
        if (sect === 'soft') A.mel(t0, cn, (t, n, l) => A.piano(t, n, 0.4, Math.max(1.6, l * 2), { wet: 0.7 }), { skip: (b) => b > 2 });
        if (lastBar && !last && (sect === 'build' || sect === 'break' || nextSect === 'drop')) { A.riser(t0, BAR, 0.2); A.swell(t0 + BAR, BAR * 0.8, CH.Dm.pad, 0.03); }
      } else if (MOOD === 'drive') {
        const drums = sect !== 'break' && !(sect === 'intro' && k < 2), full = sect === 'main' || sect === 'drop' || sect === 'build', E = { intro: 0.7, intro2: 0.9, build: 0.95, soft: 0.85, main: 1, break: 0.75, drop: 1.1, outro: 0.9 }[sect];
        A.pad(t0, BAR + 0.2, c.pad, 0.032 * E, { cut: sect === 'intro' ? 500 : full ? 2200 : 1300, cut1: sect === 'intro' ? 1800 : undefined, att: 0.05, rel: 0.25, wet: 0.35, bus: duck });
        for (let b = 0; b < 4; b++) {
          const tb = t0 + b * B;
          if (sect === 'intro' && k < 2) A.kick(tb, 0.7, { lp: 300 + (k * 4 + b) * 180, soft: true });
          if (drums) { A.kick(tb, 0.85, { duck: 0.28 }); A.hat(tb + B / 2, 0.13, 0.09, 0.15); if (sect !== 'intro2' || b % 2) { A.hat(tb + B / 4, 0.045, 0.025, -0.3); A.hat(tb + (3 * B) / 4, 0.045, 0.025, 0.3); } if (b % 2) A.clap(tb, sect === 'outro' ? 0.2 : 0.28); }
          /* rollender Bass in Sechzehnteln (ohne die Eins: dort steht die Bassdrum) */
          if (sect !== 'intro' || k >= 2) [1, 2, 3].forEach((e) => A.bass(tb + (e * B) / 4, B / 4 - 0.012, c.bass + (e === 2 ? 12 : 0), 0.12 * E, { cut: sect === 'drop' ? 1500 : 950, cut1: 260, bus: duck }));
          else A.bass(tb + B / 2, B / 2 - 0.02, c.bass, 0.11, { cut: 300 + (k * 4 + b) * 120, bus: duck });
          if (full || sect === 'soft' || sect === 'break') for (let e = 0; e < 4; e++) { const st = b * 4 + e; A.pluck(tb + (e * B) / 4, c.arp[[0, 1, 2, 3, 2, 1][st % 6]] + (st % 8 > 5 ? 12 : 0), (sect === 'break' ? 0.06 : 0.048) * E, { cut: sect === 'drop' ? 5600 : 4000, pan: e % 2 ? 0.5 : -0.5, dur: 0.16, bus: sect === 'break' ? master : duck }); }
        }
        if (sect === 'intro2') [0, 1, 2].forEach((b) => c.pad.forEach((n) => A.tone(t0 + b * B, 0.22, midi(n + 12), 'sawtooth', 0.065, { decay: true, cut: 4200, cut1: 900, cutT: 0.2, wet: 0.4, dly: 0.25 })));
        if (sect === 'main' || sect === 'drop') A.mel(t0, cn, (t, n, l) => { [-8, 8].forEach((d, i) => A.tone(t, l * 0.9, midi(n + (sect === 'drop' ? 12 : 0)), 'sawtooth', sect === 'drop' ? 0.075 : 0.056, { att: 0.012, rel: 0.1, cut: sect === 'drop' ? 4200 : 2600, det: d, wet: 0.4, dly: 0.4, pan: i ? 0.25 : -0.25 })); A.tone(t, l * 0.9, midi(n), 'square', 0.03, { att: 0.012, rel: 0.1, cut: 2400 }); });
        if (sect === 'drop' && k % 4 === 3) [3, 3.5].forEach((b) => A.snare(t0 + b * B, 0.22));
        if (sect === 'break') { A.mel(t0, cn, (t, n, l) => A.piano(t, n + 12, 0.3, Math.max(1.2, l * 1.6), { wet: 0.7, dly: 0.3 })); if (lastBar) for (let e = 0; e < 16; e++) A.snare(t0 + (e * B) / 4, 0.06 + e * 0.014); else for (let e = 0; e < 4; e++) A.snare(t0 + e * B, 0.1); }
        if (lastBar && !last) { A.riser(t0 + (sect === 'break' ? 0 : BAR / 2), sect === 'break' ? BAR : BAR / 2, 0.2); if (sect !== 'break') [3.5, 3.75].forEach((b) => A.snare(t0 + b * B, 0.2)); }
      } else {
        const E = { intro: 0.7, intro2: 0.85, build: 0.95, soft: 0.9, main: 1, break: 0.9, drop: 1.08, outro: 0.85 }[sect], rhythm = sect === 'main' || sect === 'drop' || sect === 'build';
        A.pad(t0, BAR + 1.0, c.pad, 0.019 * E, { wave: 'triangle', cut: 1400, att: 1.0, rel: 1.2, wet: 0.7 });
        A.pad(t0, BAR + 1.0, [c.pad[0] - 12, c.pad[1]], 0.012 * E, { cut: 620, att: 1.1, rel: 1.2 });
        if (sect !== 'intro') A.sub(t0, BAR - 0.1, c.bass, 0.085, { att: 0.2, rel: 0.6 });
        /* Filzklavier: gebrochener Akkord in Achteln, darüber das Motiv */
        const pat = sect === 'intro' ? [0, null, 2, null, 1, null, 3, null] : [0, 2, 1, 2, 3, 2, 1, 2];
        pat.forEach((ix, e) => { if (ix !== null) A.piano(t0 + (e * B) / 2, c.arp[ix] - 12, (e % 4 === 0 ? 0.3 : 0.2) * E, 2.6, { soft: true, wet: 0.7 }); });
        if (sect !== 'intro') A.mel(t0, cn, (t, n, l) => A.piano(t, n, 0.34 * E, Math.max(2.4, l * 2.2), { soft: true, wet: 0.8, dly: 0.18 }), { skip: sect === 'intro2' || sect === 'outro' ? (b) => b === 1.5 : undefined });
        if (rhythm) { A.kick(t0, 0.42, { f0: 110, f1: 44, dec: 0.5, soft: true }); A.kick(t0 + 2.5 * B, 0.26, { f0: 110, f1: 44, dec: 0.4, soft: true }); for (let e = 0; e < 8; e++) A.shaker(t0 + (e * B) / 2, e % 2 ? 0.05 : 0.03, e % 2 ? 0.4 : -0.4); }
        if (sect === 'drop' || sect === 'break') [0.5, 1.5, 2.5, 3.5].forEach((b, i) => A.bell(t0 + b * B, c.arp[(i * 2 + 1) % 4] + 12, 0.042, { pan: i % 2 ? 0.5 : -0.5 }));
      }
    }
    /* Akzente auf den Bildwechseln */
    if (si > 0) {
      if (MOOD === 'cine') { A.whoosh(s.t0, 0.14, 0.9); A.impact(s.t0, sect0 === 'drop' ? 0.9 : sect0 === 'break' ? 0.7 : 0.45); }
      else if (MOOD === 'drive') { A.whoosh(s.t0, 0.2, 0.45); A.noise(s.t0, 1.4, 9000, 5000, 0.14, { wet: 0.5 }); if (sect0 === 'drop') A.impact(s.t0, 0.6); }
      else A.chime(s.t0, [CH.Dm.arp[1] + 12, CH.Dm.arp[2] + 12], 0.035, 0.18);
    }
    /* besondere Momente: Zeichen steht, Gold, Reise-Stationen, Schluss-Lockup */
    if (s.id === 'logo') { const tl = s.t0 + (MOOD === 'drive' ? 2 * BAR : s.D * 0.6); A.chime(tl, [74, 77, 81, 86], MOOD === 'calm' ? 0.05 : 0.07); if (MOOD !== 'calm') A.impact(tl, MOOD === 'drive' ? 0.8 : 0.6); if (MOOD === 'cine') A.swell(tl, 2.2, CH.Dm.pad, 0.03); if (MOOD === 'drive') A.riser(s.t0 + BAR, BAR, 0.24); }
    if (s.id === 'award') A.chime(s.t0 + (MOOD === 'drive' ? B : 0.5), [74, 77, 81, 84, 86, 89], 0.06, 0.07);
    if (s.id === 'journey') { const jb = OPT.journey.bars; let acc = 0; for (let i = 1; i < jb.length; i++) { acc += jb[i - 1]; const t = s.t0 + acc * BAR; if (MOOD === 'cine') A.taiko(t, 33, 0.4); else if (MOOD === 'drive') A.noise(t, 0.5, 8000, 4000, 0.08, { wet: 0.4 }); else A.bell(t, 81, 0.03, { pan: i % 2 ? 0.3 : -0.3 }); } }
    if (s.id === 'outro') { const tb = s.t0 + (MOOD === 'drive' ? 2 * B : Math.min(2.6, s.D * 0.3)); A.chime(tb, [74, 77, 81, 86], 0.06); const te = s.t0 + s.D - BAR; A.pad(te, BAR, [38, 50, 57, 62, 64], 0.02, { cut: 1600, att: 0.3, rel: BAR * 0.6, wet: 0.8 }); A.piano(te, 62, 0.3, 3, { wet: 0.9 }); A.piano(te, 74, 0.25, 3, { wet: 0.9 }); if (MOOD === 'drive') A.impact(te, 0.5); }
  });
  const buf = await ac.startRendering();
  return [buf.getChannelData(0), buf.getChannelData(1)];
}

async function makeMusic() {
  const SR = M_SR, n = Math.ceil(DUR * SR), sumL = new Float32Array(n), sumR = new Float32Array(n);
  /* Abschnitte auf Taktgrenzen, je rund 15 Sekunden */
  const WIN = Math.max(4, Math.round(15 / BAR)) * BAR;
  for (let w0 = 0; w0 < DUR - 0.001; w0 += WIN) {
    const [l, r] = await musicWindow(w0, Math.min(DUR, w0 + WIN)), o = Math.round(w0 * SR), m = Math.min(l.length, n - o);
    for (let i = 0; i < m; i++) { sumL[o + i] += l[i]; sumR[o + i] += r[i]; }
  }
  /* Master über das Ganze: Pegel, Tiefensperre (unter 30 Hz ist nur Hub, kein Ton), leichte Höhenanhebung, Kompressor, Blenden */
  const mc = new OfflineAudioContext(2, n, SR), mb = mc.createBuffer(2, n, SR); mb.copyToChannel(sumL, 0); mb.copyToChannel(sumR, 1);
  const src = mc.createBufferSource(); src.buffer = mb;
  const pre = mc.createGain(); pre.gain.value = 0.5;
  const hpf = mc.createBiquadFilter(); hpf.type = 'highpass'; hpf.frequency.value = 30; hpf.Q.value = 0.7;
  const shelf = mc.createBiquadFilter(); shelf.type = 'highshelf'; shelf.frequency.value = 3200; shelf.gain.value = MOOD === 'drive' ? 2.5 : MOOD === 'cine' ? 4 : 4.5;
  const comp = mc.createDynamicsCompressor(); comp.threshold.value = -14; comp.knee.value = 8; comp.ratio.value = 3.5; comp.attack.value = 0.006; comp.release.value = 0.22;
  const out = mc.createGain(); src.connect(pre); pre.connect(hpf); hpf.connect(shelf); shelf.connect(comp); comp.connect(out); out.connect(mc.destination);
  out.gain.setValueAtTime(0.0001, 0); out.gain.exponentialRampToValueAtTime(1, MOOD === 'drive' ? 0.05 : 0.4);
  out.gain.setValueAtTime(1, DUR - (MOOD === 'drive' ? 0.6 : 1.5)); out.gain.linearRampToValueAtTime(0, DUR - 0.03);
  src.start(0);
  const done = await mc.startRendering(), L = done.getChannelData(0), R = done.getChannelData(1);
  /* Spitzenpegel auf −1 dBFS begrenzen (die Lautheit stellt ffmpeg beim Rendern ein) */
  let pk = 0; for (let i = 0; i < n; i++) pk = Math.max(pk, Math.abs(L[i]), Math.abs(R[i])); const nrm = pk > 0 ? 0.89 / pk : 1;
  const wv = new DataView(new ArrayBuffer(44 + n * 4));
  const ws = (o, s) => { for (let i = 0; i < s.length; i++) wv.setUint8(o + i, s.charCodeAt(i)); };
  ws(0, 'RIFF'); wv.setUint32(4, 36 + n * 4, true); ws(8, 'WAVE'); ws(12, 'fmt '); wv.setUint32(16, 16, true); wv.setUint16(20, 1, true); wv.setUint16(22, 2, true); wv.setUint32(24, SR, true); wv.setUint32(28, SR * 4, true); wv.setUint16(32, 4, true); wv.setUint16(34, 16, true); ws(36, 'data'); wv.setUint32(40, n * 4, true);
  for (let i = 0; i < n; i++) { wv.setInt16(44 + i * 4, clamp(L[i] * nrm, -1, 1) * 32767, true); wv.setInt16(46 + i * 4, clamp(R[i] * nrm, -1, 1) * 32767, true); }
  const bytes = new Uint8Array(wv.buffer); let bin = '';
  for (let i = 0; i < bytes.length; i += 0x8000) bin += String.fromCharCode.apply(null, bytes.subarray(i, i + 0x8000));
  return btoa(bin);
}
