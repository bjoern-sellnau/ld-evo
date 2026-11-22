/* Trailer — Zeitachse je Länge und Stimmung, Übergänge, Rahmen (Chrome) und die Schnittstelle REEL zum Rendern. */
'use strict';

/* Ablauf in Takten (Summe: Cinematic 24/36/48/120 bei 96 BPM, Treibend 32/48/64/160 bei 128 BPM, Ruhig 20/30/40/100 bei 80 BPM,
   Action 40/60/80/200 bei 160 BPM = 60/90/120/300 s). Die Reise läuft je Station ganze Takte (journeyBars), damit die Wechsel auf der Eins liegen. */
const PLANS = {
  cine: {
    60: [['logo', 3], ['claim', 2], ['person', 3], ['stack', 2], ['journey', 4], ['award', 2], ['labs', 3], ['site', 2], ['outro', 3]],
    90: [['logo', 3], ['claim', 2], ['person', 4], ['stack', 3], ['journey', 8], ['award', 2], ['labs', 5], ['site', 3], ['certs', 3], ['outro', 3]],
    120: [['logo', 3], ['claim', 3], ['person', 4], ['origin', 4], ['stack', 3], ['journey', 12], ['award', 2], ['labs', 6], ['site', 4], ['family', 2], ['certs', 2], ['outro', 3]],
    300: [['logo', 4], ['claim', 3], ['person', 5], ['focus', 5], ['origin', 6], ['stack', 4], ['journey', 27], ['award', 4], ['works', 10], ['quote', 3], ['labs', 10], ['labsAll', 6], ['hero', 8], ['site', 8], ['quote2', 3], ['family', 3], ['certs', 5], ['outro', 6]],
  },
  drive: {
    60: [['logo', 3], ['claim', 3], ['person', 4], ['stack', 3], ['journey', 6], ['award', 2], ['labs', 5], ['site', 3], ['outro', 3]],
    90: [['logo', 4], ['claim', 3], ['person', 5], ['stack', 4], ['journey', 8], ['award', 3], ['labs', 8], ['site', 5], ['certs', 4], ['outro', 4]],
    120: [['logo', 4], ['claim', 4], ['person', 5], ['origin', 4], ['stack', 4], ['journey', 16], ['award', 3], ['labs', 8], ['site', 5], ['family', 2], ['certs', 4], ['outro', 5]],
    300: [['logo', 5], ['claim', 4], ['person', 6], ['focus', 6], ['origin', 8], ['stack', 6], ['journey', 36], ['award', 5], ['works', 14], ['quote', 4], ['labs', 14], ['labsAll', 8], ['hero', 12], ['site', 10], ['quote2', 4], ['family', 4], ['certs', 7], ['outro', 7]],
  },
  action: {
    60: [['logo', 4], ['claim', 3], ['person', 5], ['stack', 4], ['journey', 8], ['award', 3], ['labs', 6], ['site', 4], ['outro', 3]],
    90: [['logo', 4], ['claim', 4], ['person', 6], ['stack', 5], ['journey', 12], ['award', 4], ['labs', 10], ['site', 6], ['certs', 5], ['outro', 4]],
    120: [['logo', 4], ['claim', 4], ['person', 6], ['origin', 6], ['stack', 5], ['journey', 18], ['award', 4], ['labs', 11], ['site', 7], ['family', 4], ['certs', 6], ['outro', 5]],
    300: [['logo', 6], ['claim', 5], ['person', 8], ['focus', 8], ['origin', 10], ['stack', 7], ['journey', 45], ['award', 6], ['works', 18], ['quote', 5], ['labs', 18], ['labsAll', 10], ['hero', 15], ['site', 12], ['quote2', 5], ['family', 5], ['certs', 9], ['outro', 8]],
  },
  calm: {
    60: [['logo', 2], ['claim', 2], ['person', 2], ['journey', 4], ['award', 2], ['labs', 3], ['site', 2], ['outro', 3]],
    90: [['logo', 3], ['claim', 2], ['person', 4], ['stack', 3], ['journey', 6], ['award', 2], ['labs', 4], ['site', 3], ['outro', 3]],
    120: [['logo', 2], ['claim', 3], ['person', 4], ['origin', 3], ['stack', 3], ['journey', 9], ['award', 2], ['labs', 4], ['site', 4], ['certs', 3], ['outro', 3]],
    300: [['logo', 3], ['claim', 3], ['person', 4], ['focus', 4], ['origin', 5], ['stack', 3], ['journey', 18], ['award', 3], ['works', 9], ['quote', 3], ['labs', 9], ['labsAll', 5], ['hero', 7], ['site', 7], ['quote2', 3], ['family', 3], ['certs', 5], ['outro', 6]],
  },
};
/* Die fünf neuen Stimmungen (Trance 136, Hardstyle 152, Eurodance 128, Rave 144, Demoszene 120 BPM) bekommen ihren Ablauf aus einer
   Vorlage je Länge: [Szene, Gewicht, Mindesttakte]. Die Takte der Länge (Sekunden × BPM / 240, immer ganzzahlig) werden nach Gewicht
   verteilt. Die 30-Sekunden-Fassung lässt die Anspruch-Szene aus — der Claim steht im Schluss. */
const TEMPLATES = {
  30: [['logo', 2, 2], ['person', 2.2, 2], ['journey', 4, 4], ['award', 1.5, 1], ['labs', 2.8, 2], ['site', 2.2, 2], ['outro', 2.6, 2]],
  60: [['logo', 3, 3], ['claim', 3, 2], ['person', 4, 2], ['stack', 3, 2], ['journey', 6, 4], ['award', 2, 2], ['labs', 5, 3], ['site', 3, 2], ['outro', 3, 3]],
  90: [['logo', 4, 3], ['claim', 3, 2], ['person', 5, 3], ['stack', 4, 2], ['journey', 8, 5], ['award', 3, 2], ['labs', 8, 4], ['site', 5, 3], ['certs', 4, 3], ['outro', 4, 3]],
  120: [['logo', 4, 3], ['claim', 4, 2], ['person', 5, 3], ['origin', 4, 3], ['stack', 4, 3], ['journey', 16, 9], ['award', 3, 2], ['labs', 8, 5], ['site', 5, 3], ['family', 2, 2], ['certs', 4, 3], ['outro', 5, 3]],
  300: [['logo', 5, 4], ['claim', 4, 3], ['person', 6, 4], ['focus', 6, 4], ['origin', 8, 5], ['stack', 6, 4], ['journey', 36, 27], ['award', 5, 3], ['works', 14, 9], ['quote', 4, 3], ['labs', 14, 9], ['labsAll', 8, 5], ['hero', 12, 7], ['site', 10, 7], ['quote2', 4, 3], ['family', 4, 3], ['certs', 7, 5], ['outro', 7, 5]],
};
function autoPlan(tpl, total) {
  const sum = tpl.reduce((a, x) => a + x[1], 0), raw = tpl.map((x) => (x[1] * total) / sum), out = tpl.map((x, i) => Math.max(x[2], Math.floor(raw[i])));
  let diff = total - out.reduce((a, b) => a + b, 0);
  /* fehlende Takte dorthin, wo am meisten zum Soll fehlt; überzählige dort weg, wo am meisten darüber liegt — nie unter das Minimum */
  for (; diff > 0; diff--) { let best = 0; out.forEach((v, i) => { if (raw[i] - v > raw[best] - out[best] + 1e-9) best = i; }); out[best]++; }
  for (; diff < 0; diff++) { let best = -1; out.forEach((v, i) => { if (v > tpl[i][2] && (best < 0 || v - raw[i] > out[best] - raw[best] + 1e-9)) best = i; }); if (best < 0) break; out[best]--; }
  return tpl.map((x, i) => [x[0], out[i]]);
}
const PLAN = PLANS[MOOD]?.[LEN] ?? autoPlan(TEMPLATES[LEN], Math.round((LEN * TH.bpm) / 240));
const NB = PLAN.reduce((s, [, b]) => s + b, 0);
const DUR = NB * BAR; // exakt 30 / 60 / 90 / 120 / 300 s
const FN = { logo: scLogo, claim: scClaim, person: scPerson, origin: scOrigin, stack: scStack, journey: scJourney, award: scAward, labs: scLabs, site: scSite, family: scFamily, certs: scCerts, outro: scOutro, focus: scFocus, works: scWorks, labsAll: scLabsAll, hero: scHero, quote: scQuote, quote2: scQuote };
/* Stationen der Reise: so viele, wie Takte da sind (höchstens 9); übrige Takte verteilt journeyBars auf die gewichtigeren Stationen */
const SCENES = (() => { let b = 0; return PLAN.map(([id, bars], i) => { const s = { id, i, bars, t0: b * BAR, D: bars * BAR, b0: b }; b += bars; return s; }); })();
const jBars = (PLAN.find(([id]) => id === 'journey') || [0, 4])[1];
const OPT = {
  journey: { n: Math.min(9, jBars), bars: journeyBars(Math.min(9, jBars), jBars), blurb: LEN >= 120 || (LEN >= 90 && !FAST), steps: LEN >= 300 },
  labs: { more: LEN >= 90, desc: LEN >= 90 },
  site: { desc: LEN >= 90, views: LEN >= 120 ? 4 : LEN >= 90 ? 3 : 2 },
  quote: { i: 0 },
  quote2: { i: 1 },
};
/* Kennung des Ablaufs: die Musik hängt nur davon ab (Zwischenspeicher beim Rendern) */
const PLAN_KEY = (() => { const str = JSON.stringify([MOOD, PLAN, OPT.journey.bars, 'musik-3']); let h = 5381; for (let i = 0; i < str.length; i++) h = ((h * 33) ^ str.charCodeAt(i)) >>> 0; return h.toString(16).padStart(8, '0'); })();
const sceneAt = (t) => { let s = SCENES[0]; for (const x of SCENES) if (t >= x.t0) s = x; return s; };
function drawScene(s, t) { const lt = clamp(t - s.t0, 0, s.D); CUR = s; FN[s.id](lt, s.D, OPT[s.id] ?? {}); }

/* ---------- Rahmen je Stimmung ---------- */
function chrome(t, s) {
  const idx = `${String(s.i + 1).padStart(2, '0')} / ${String(SCENES.length).padStart(2, '0')}`, chap = T.chapters[s.id];
  if (MOOD === 'cine') {
    /* Kinoformat 2,39 : 1 — Balken oben und unten, darin leise Kapitelangabe */
    const bh = (H - W / 2.39) / 2; g.fillStyle = '#000'; g.fillRect(0, 0, W, bh); g.fillRect(0, H - bh, W, bh);
    if (s.id !== 'logo' && s.id !== 'outro') { label(chap, 190, H - bh / 2 + 7, { size: 16, color: 'rgba(246,241,232,0.5)', track: 0.24 }); label(idx, W - 190, H - bh / 2 + 7, { size: 16, color: 'rgba(246,241,232,0.5)', align: 'right', track: 0.2 }); }
  } else if (MOOD === 'demo') {
    /* Demoszene: Kupferlinien oben und unten, dazwischen unten ein Sinus-Scroller in der Mono-Schrift der Marke */
    const band = (y) => { for (let q = 0; q < 5; q++) { const v = 1 - Math.abs(q - 2) / 2.5; g.fillStyle = `rgb(255,${Math.round(77 + 150 * v)},${Math.round(28 + 110 * v)})`; g.fillRect(0, y + q * 2, W, 2); } };
    g.fillStyle = 'rgba(4,6,16,0.72)'; g.fillRect(0, H - 112, W, 112); band(H - 112); band(22);
    const str = T.scroller, size = 40, cw = size * 0.6 + 4, total = str.length * cw, off = (t * 230) % total;
    g.save(); g.font = `700 ${size}px ${MONO}`; g.textBaseline = 'alphabetic';
    for (let x = W - off - total; x < W; x += total) for (let i = 0; i < str.length; i++) { const px = x + i * cw; if (px < -cw || px > W) continue; const ch = str[i], y = H - 42 + Math.sin(t * 4.2 + px * 0.011) * 15; g.fillStyle = ch === '+' ? BR.orange : BR.cream; g.fillText(ch, px, y); }
    g.restore();
    if (s.id !== 'logo' && s.id !== 'outro') { label(`Part ${String(s.i + 1).padStart(2, '0')} · ${chap}`, 150, 76, { size: 17, color: rgba(BR.cream, 0.6), track: 0.2 }); label(idx, W - 150, 76, { size: 17, color: rgba(BR.cream, 0.6), align: 'right', track: 0.18 }); }
  } else if (FAST) {
    /* Füllstand der Marke als Fortschritt: Kante in Slash-Steigung; Action in Signalorange, mit Szenenmarken und Zeitcode;
       die Tanz-Stimmungen zeigen in der Mitte ihr Tempo */
    const act = MOOD === 'action', dance = ['trance', 'hard', 'euro', 'rave'].includes(MOOD), y = H - 14, w = W * (t / DUR); g.fillStyle = rgba(TH.ink, 0.12); g.fillRect(0, y, W, 14);
    g.fillStyle = act || MOOD === 'hard' ? BR.signal : BR.orange; g.beginPath(); g.moveTo(0, y); g.lineTo(w - 7, y); g.lineTo(w, H); g.lineTo(0, H); g.closePath(); g.fill();
    if (act || dance) { g.fillStyle = rgba(TH.bg, 0.7); for (const x of SCENES) if (x.i > 0) g.fillRect(Math.round((W * x.t0) / DUR) - 1, y, 2, 14); }
    if (s.id !== 'logo' && s.id !== 'outro') {
      label(chap, 150, 62, { size: 17, color: rgba(TH.ink, 0.55), track: 0.22 }); label(idx, W - 150, 62, { size: 17, color: rgba(TH.ink, 0.55), align: 'right', track: 0.18 });
      if (act) { const mm = (v) => `${String(Math.floor(v / 60)).padStart(2, '0')}:${String(Math.floor(v % 60)).padStart(2, '0')}`; label(`${mm(t)} / ${mm(DUR)}`, W / 2, 62, { size: 17, color: rgba(BR.cream, 0.4), align: 'center', track: 0.18 }); }
      if (dance) { /* Tempo mit Schlaglicht: der Punkt leuchtet auf jedem Schlag */ const bp = beatPulse(t, 7), str = `${TH.bpm} BPM`, tw = measure(str, 17, 500, MONO, 17 * 0.18); label(str, W / 2 + 10, 62, { size: 17, color: rgba(TH.ink, 0.45), align: 'center', track: 0.18 }); g.fillStyle = rgba(BR.orange, 0.35 + 0.65 * bp); g.beginPath(); g.arc(W / 2 - tw / 2 - 8, 56, 5 + 2 * bp, 0, 7); g.fill(); }
    }
  } else {
    /* Editorial: Haarlinien-Rahmen und Ecken-Beschriftung */
    g.save(); g.strokeStyle = BR.line; g.lineWidth = 1.5; g.strokeRect(48.75, 48.75, W - 97.5, H - 97.5); g.restore();
    if (s.id !== 'logo' && s.id !== 'outro') {
      label('loona! designs', 84, 90, { size: 15, color: BR.meta, track: 0.16 }); label(chap, W - 84, 90, { size: 15, color: BR.meta, align: 'right', track: 0.16 });
      label(NAME, 84, H - 76, { size: 15, color: BR.meta, track: 0.16 }); label(idx, W - 84, H - 76, { size: 15, color: BR.meta, align: 'right', track: 0.16 });
    }
  }
}
const GRAIN = (() => { const c = mkLayer(256, 256), d = c.createImageData(256, 256); for (let i = 0; i < d.data.length; i += 4) { const v = Math.floor(hash(i * 0.37 + 1) * 255); d.data[i] = d.data[i + 1] = d.data[i + 2] = v; d.data[i + 3] = 255; } c.putImageData(d, 0, 0); return c.canvas; })();
function finish(t) {
  if (MOOD === 'cine') {
    const v = g.createRadialGradient(W / 2, H / 2, H * 0.35, W / 2, H / 2, H * 1.05); v.addColorStop(0, 'rgba(0,0,0,0)'); v.addColorStop(1, 'rgba(0,0,0,0.55)'); g.fillStyle = v; g.fillRect(0, 0, W, H);
    g.save(); g.globalAlpha = 0.035; g.globalCompositeOperation = 'overlay'; const f = Math.floor(t * 30), ox = Math.floor(hash(f) * 256), oy = Math.floor(hash(f + 4) * 256); for (let y = -oy; y < H; y += 256) for (let x = -ox; x < W; x += 256) g.drawImage(GRAIN, x, y); g.restore();
  }
  /* Auf- und Abblende */
  const a = 1 - eOut(seg(t, 0, FAST ? 0.25 : 0.9)), b = eIn(seg(t, DUR - (FAST ? 0.5 : 1.4), DUR - 0.05)), k = Math.max(a, b);
  if (k > 0) { g.fillStyle = TH.dark ? `rgba(0,0,0,${k})` : rgba(BR.cream, k); g.fillRect(0, 0, W, H); }
}

/* ---------- Übergänge ---------- */
const MOS = mkLayer(W / 8, H / 8);
function transition(p, A, Bc) {
  const kind = TH.trans;
  if (kind === 'slash') { slashWipe(A, Bc, p, TH.wipe); return; }
  if (kind === 'cine') {
    /* Überblendung mit leichtem Schub in die Tiefe und einem warmen Lichtschein in der Mitte */
    const e = eIO(p), sp = Math.sin(Math.PI * p);
    g.save(); g.translate(W / 2, H / 2); g.scale(1 + 0.05 * e, 1 + 0.05 * e); g.translate(-W / 2, -H / 2); g.drawImage(A, 0, 0); g.restore();
    g.save(); g.globalAlpha = e; g.translate(W / 2, H / 2); g.scale(1.05 - 0.05 * e, 1.05 - 0.05 * e); g.translate(-W / 2, -H / 2); g.drawImage(Bc, 0, 0); g.restore();
    glow(W / 2, H / 2, 900, BR.apricot, 0.1 * sp);
    return;
  }
  if (kind === 'flash') {
    /* Trance: Überblendung durch einen hellen Schleier — wie ein Lichtwechsel */
    const e = eIO(p), sp = Math.sin(Math.PI * p);
    g.drawImage(A, 0, 0); g.save(); g.globalAlpha = e; g.drawImage(Bc, 0, 0); g.restore();
    g.fillStyle = rgba(BR.apricot, 0.2 * sp); g.fillRect(0, 0, W, H); glow(W / 2, -100, 1300, BR.cream, 0.3 * sp);
    return;
  }
  if (kind === 'punch') {
    /* Hardstyle: das alte Bild springt nach vorn und reißt hell ab, das neue setzt sich auf dem Schlag */
    const h = p < 0.5, q = h ? eIn(p * 2) : 1 - eOut5((p - 0.5) * 2), sc = h ? 1 + 0.2 * q : 1 + 0.1 * q;
    g.save(); g.translate(W / 2, H / 2); g.scale(sc, sc); g.translate(-W / 2, -H / 2); g.drawImage(h ? A : Bc, 0, 0); g.restore();
    g.fillStyle = rgba(BR.cream, 0.55 * q); g.fillRect(0, 0, W, H);
    return;
  }
  if (kind === 'iris') {
    /* Eurodance: Kreisblende mit farbigem Ring */
    const R = eIO(p) * Math.hypot(W, H) * 0.56;
    g.drawImage(A, 0, 0); g.save(); g.beginPath(); g.arc(W / 2, H / 2, R, 0, 7); g.clip(); g.drawImage(Bc, 0, 0); g.restore();
    if (p > 0.02 && p < 0.98) { g.save(); g.lineWidth = 26; g.strokeStyle = TH.wipe; g.beginPath(); g.arc(W / 2, H / 2, R, 0, 7); g.stroke(); g.lineWidth = 8; g.strokeStyle = BR.nova; g.beginPath(); g.arc(W / 2, H / 2, R + 30, 0, 7); g.stroke(); g.restore(); }
    return;
  }
  if (kind === 'mosaic') {
    /* Demoszene: das Bild zerfällt in grobe Blöcke und setzt sich als nächstes wieder zusammen */
    const q = 1 - Math.abs(p * 2 - 1), bs = Math.max(1, Math.round(2 ** (q * 6))), src = p < 0.5 ? A : Bc;
    if (bs <= 1) { g.drawImage(src, 0, 0); return; }
    const w = Math.max(2, Math.round(W / bs)), h = Math.max(2, Math.round(H / bs));
    MOS.save(); MOS.setTransform(1, 0, 0, 1, 0, 0); MOS.imageSmoothingEnabled = true; MOS.clearRect(0, 0, MOS.canvas.width, MOS.canvas.height); MOS.drawImage(src, 0, 0, Math.min(w, MOS.canvas.width), Math.min(h, MOS.canvas.height)); MOS.restore();
    g.save(); g.imageSmoothingEnabled = false; g.drawImage(MOS.canvas, 0, 0, Math.min(w, MOS.canvas.width), Math.min(h, MOS.canvas.height), 0, 0, W, H); g.restore();
    return;
  }
  const e = eIO(p); g.drawImage(A, 0, 0); g.save(); g.globalAlpha = e; g.drawImage(Bc, 0, (1 - e) * 26); g.restore();
}
function render(t) {
  const s = sceneAt(t), TD = TH.td;
  g.save(); g.setTransform(1, 0, 0, 1, 0, 0); g.clearRect(0, 0, W, H);
  /* Übergang liegt mittig auf der Taktgrenze; Treibend: der Slash-Wipe endet auf der Eins */
  let tr = null;
  for (const x of SCENES) if (x.i > 0) { const a = FAST ? x.t0 - TD * 0.55 : x.t0 - TD / 2; if (t >= a && t < a + TD) tr = [x, (t - a) / TD]; }
  if (tr) {
    const [nx, p] = tr, pv = SCENES[nx.i - 1];
    drawInto(LA, () => drawScene(pv, t)); drawInto(LB, () => drawScene(nx, t));
    transition(p, LA.canvas, LB.canvas);
    chrome(t, p < 0.5 ? pv : nx);
  } else {
    /* Action, Hardstyle, Rave: kurzer Stoß am Szenenbeginn — das Bild springt leicht an und kommt sofort zur Ruhe */
    const k = ['action', 'hard', 'rave'].includes(MOOD) && s.i > 0 ? Math.exp(-(t - s.t0) * 9) : 0;
    if (k > 0.02) { g.save(); g.translate(W / 2 + Math.sin(t * 91) * 6 * k, H / 2 + Math.cos(t * 73) * 4 * k); g.scale(1 + 0.035 * k, 1 + 0.035 * k); g.translate(-W / 2, -H / 2); drawScene(s, t); g.restore(); } else drawScene(s, t);
    chrome(t, s);
  }
  finish(t);
  g.restore();
}

window.REEL = {
  DUR, BAR, B, NB, len: LEN, mood: MOOD, lang: LANG, bpm: TH.bpm,
  scenes: SCENES.map((s) => ({ id: s.id, t0: s.t0, D: s.D, bars: s.bars, b0: s.b0 })),
  ready: (async () => {
    await loadAll();
    await Promise.all([[500, MAN], [600, MAN], [700, MAN], [800, MAN], [500, MONO], [700, MONO]].map(([w, f]) => document.fonts.load(`${w} 100px ${f}`)).concat([document.fonts.load(`italic 400 100px ${SER}`)]));
    return `${Object.keys(IMG).length}/${Object.keys(SRC).length} Bilder`;
  })(),
  frame: async (t) => { render(t); return cv.toDataURL('image/jpeg', 0.93).slice(23); },
  still: (t) => { render(t); },
  music: () => (typeof makeMusic === 'function' ? makeMusic() : Promise.resolve(null)),
  /* lange Stücke in Teilen abholen: erst erzeugen (gibt die Länge zurück), dann scheibenweise lesen */
  planKey: PLAN_KEY,
  musicStore: async () => { window.__wav = await makeMusic(); return window.__wav.length; },
  musicSlice: (a, b) => window.__wav.slice(a, b),
};
