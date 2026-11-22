/* Trailer — Benchmark-Looks nach Jahrgang: 97 (b97), 99 (b99), 2000 (b2k), 2001 (b01), 2003 (b03), 2005 (b05) — der Trailer als Benchmark-Lauf.
   Jedes Kapitel ist ein „Test“: hinten eine eigene 3D-Szene aus dem GLX-Engine (gl/glx.js, gl/glx-tests.js), davor die Inhalte als
   Einblendung im Raster des Looks, am Ende ein Ergebnis-Bildschirm mit den belegten Zahlen, dann Lockup, Claim und Kontakt.
   Vorbild ist die Machart der 3D-Benchmarks des jeweiligen Jahrgangs — Szenen, Namen und Oberfläche sind eigene.

   Look   Bildspeicher            Technik (siehe gl/glx.js)                                     Rahmen
   97     640×360, hart ×3        Licht je Ecke, 16 bit mit Dithering                           Winkel in den Ecken
   99     800×450, weich          wie 97, Auftakt mit Drahtgitter                               durchgehende Bänder oben und unten
   2000   960×540, hart ×2        mehr Polygone, 32 bit                                         Felder mit heller Oberkante
   2001   1024×576, weich         Licht je Bildpunkt, Normal-Maps, Spiegelbecken, proj. Schatten gläserne Felder, Haarlinie
   2003   1024×576, weich         Shadow Maps, Glanz-Maps, Glühen                               Breitbild mit schwarzen Balken
   2005   1280×720, weich         weiche Schatten, großer Helligkeitsumfang, Brechung           Lichtverläufe, Punkte als Fortschritt
   Die Looks ab 99 (außer 97) beginnen mit einem Intro (TH.intro): eine Montage aus ihren Tests, auf den Schlag geschnitten, ohne Rahmen —
   sie endet auf logoLock(D) im Titel (Lockup, Name und Rolle, Zeile mit dem Look).

   Was eingeblendet wird, ist wahr: 30 Bilder pro Sekunde (Bildrate des Videos), die wirklich gezeichneten Dreiecke der Szene, Größe und
   Farbtiefe des Bildspeichers, die laufende Zeit. Keine Messwerte, keine Punktzahlen. Inhalte und Wortlaut kommen aus data.js.
   Marke: Das Zeichen steht immer flach und frontal in der 2D-Ebene (nie gedreht, nie perspektivisch, nie als 3D-Objekt), die 3D-Szene
   läuft dahinter; die Farben der Produktfamilie treten nur als Lichter auf. */
(() => {
  'use strict';
  /* je Look: Breite des Bildspeichers, weich hochskalieren?, Gestalt des Rahmens, Jahr für die Titelzeile */
  const LKS = { 97: { w: 640, hud: 'eck', yr: '97' }, 99: { w: 800, soft: true, hud: 'band', yr: '99' }, '2k': { w: 960, hud: 'kante', yr: '2000' }, '01': { w: 1024, soft: true, hud: 'glas', yr: '2001' }, '03': { w: 1024, soft: true, hud: 'kino', yr: '2003' }, '05': { w: 1280, soft: true, hud: 'licht', yr: '2005' } };
  const STS = {
    eck: { ink: BR.cream, soft: '#B4B9D0', acc: BR.orange, panel: 'rgba(4,7,20,0.8)', edge: BR.orange, rail: 'rgba(246,241,232,0.28)' },
    band: { ink: BR.cream, soft: '#B4B9D0', acc: BR.orange, panel: 'rgba(6,10,28,0.88)', edge: BR.orange, rail: 'rgba(246,241,232,0.28)' },
    kante: { ink: BR.cream, soft: BR.mutedDark, acc: BR.orange, panel: 'rgba(18,15,13,0.8)', edge: 'rgba(246,241,232,0.55)', rail: 'rgba(246,241,232,0.22)' },
    glas: { ink: BR.cream, soft: '#B4B9D0', acc: BR.orange, panel: 'rgba(11,16,38,0.62)', edge: 'rgba(246,241,232,0.4)', rail: 'rgba(246,241,232,0.25)' },
    kino: { ink: BR.cream, soft: BR.mutedDark, acc: BR.orange, panel: 'rgba(10,8,7,0.76)', edge: BR.orange, rail: 'rgba(246,241,232,0.22)' },
    licht: { ink: BR.cream, soft: '#C9C2B4', acc: BR.orange, panel: 'rgba(12,10,9,0.8)', edge: 'rgba(246,241,232,0.6)', rail: 'rgba(246,241,232,0.22)' },
  };
  let L97 = false, LOW = false, LK = LKS['2k'], HS = 'kante', PW = 960, PH = 540, S = 0.5, hud = null, hc = null, ST = null, UI = null, X = null, cuts = [];
  let jList = [], jT0 = [], jDur = [], gates = [], plates = [], labSeq = [], siteSeq = [], originSeq = [], heroSeq = [], rise = 0.6;
  const GATE = 50, SUNX = 0.7; // Sonne rechts außen: ihr Schein bleibt neben dem Lockup
  const UIS = {
    de: { test: 'Test', polys: 'Polygone', results: 'Ergebnisse', music: 'Musik: Web Audio', fps: 'Bilder/s', tests: 'Tests', dur: 'Dauer' },
    en: { test: 'Test', polys: 'polygons', results: 'Results', music: 'Music: Web Audio', fps: 'frames/s', tests: 'tests', dur: 'duration' },
  };
  const smooth01 = (x) => { x = clamp(x); return x * x * (3 - 2 * x); };

  /* ---------- Vorbereitung ---------- */
  async function init() {
    LK = LKS[TH.look] ?? LKS['2k']; HS = LK.hud; L97 = TH.look === '97'; LOW = L97 || TH.look === '99'; PW = LK.w; PH = (PW * 9) / 16; S = PW / W; UI = UIS[LANG]; X = window.GLX;
    X.init({ width: PW, height: PH, look: TH.look, images: IMG, colors: BR });
    hud = document.createElement('canvas'); hud.width = PW; hud.height = PH; hc = hud.getContext('2d');
    ST = STS[HS];
    rise = X.test.orbit.rise(SUNX);
    /* Reise: Stationen wie in scJourney (Takte je Station), je Station ein Tor mit der Jahreszahl */
    const oj = OPT.journey, sj = SCENES.find((s) => s.id === 'journey');
    jList = journeyPick(oj.n); jDur = (oj.bars ?? jList.map(() => (sj ? sj.D : 4 * BAR) / jList.length / BAR)).map((b) => b * BAR); jT0 = jDur.map((_, k) => jDur.slice(0, k).reduce((a, b) => a + b, 0));
    gates = jList.map((it, i) => ({ tex: yearTex(it.y), z: (i + 1) * GATE }));
    /* Stack: die vier Schwerpunkte groß auf den Schlag, die übrigen Technologien klein dazwischen */
    const ss = SCENES.find((s) => s.id === 'stack');
    if (ss) {
      const rest = STACK_ROWS.flat().filter((n) => !STACK_FOCUS.includes(n)), nb = Math.round(ss.D / B), step = Math.max(2, Math.floor((nb - 3) / STACK_FOCUS.length));
      plates = STACK_FOCUS.map((n, i) => ({ tex: wordTex(n, true), t: (3 + i * step) * B, big: true }));
      rest.forEach((n, i) => plates.push({ tex: wordTex(n, false), t: B * 1.5 + ((i + 0.5) / rest.length) * (ss.D - B), big: false }));
    }
    /* Bildfolgen der Bildschirm-Tests: so viele, wie in die Szene passen (etwa eines je Sekunde) */
    const pick = (list, D, min = 3) => { const n = clamp(Math.round(D / 1.05), Math.min(min, list.length), list.length); return Array.from({ length: n }, (_, k) => list[Math.floor((k * list.length) / n)]); };
    const sl = SCENES.find((s) => s.id === 'labs');
    if (sl) { const per = clamp(Math.round(((OPT.labs.more ? 0.72 : 1) * sl.D) / 1.05 / LABS.length), 1, 5); labSeq = LABS.flatMap((lab, li) => lab.shots.filter((k) => IMG[k]).slice(0, per).map((key) => ({ key, aspect: 16 / 9, lab: li }))); }
    const sv = SCENES.find((s) => s.id === 'site');
    if (sv) siteSeq = pick([{ key: 'siteBeyond', top: 0 }, { key: 'siteHome', top: 0 }, { key: 'siteMob', aspect: 0.5, top: 0 }, { key: 'siteLabs', top: 0 }, { key: 'siteStory', top: 0 }, { key: 'siteHome', top: 1 }, { key: 'siteBeyond', top: 0.35 }, { key: 'siteLabs', top: 0.5 }, { key: 'siteStory', top: 0.3 }].filter((q) => IMG[q.key]), sv.D, 3);
    if (TH.intro) prepIntro();
    originSeq = ORIGIN.filter((q) => IMG[q.img]).map((q) => ({ key: q.img, aspect: 1.36, it: q }));
    heroSeq = HERO.filter(([m]) => IMG[`hero_${m}_6`]).map((h) => ({ key: `hero_${h[0]}_6`, aspect: 0.5625, it: h }));
  }
  function yearTex(y) {
    const w = LOW ? 256 : 512, h = w / 2;
    return X.texCanvas(X.cv(w, h, (c) => {
      c.textAlign = 'center'; c.font = `800 ${h * 0.66}px ${MAN}`; const gr = c.createLinearGradient(0, h * 0.18, 0, h * 0.82); gr.addColorStop(0, BR.apricot); gr.addColorStop(0.55, BR.orange); gr.addColorStop(1, BR.signal);
      c.fillStyle = gr; c.fillText(y, w / 2, h * 0.74); c.fillStyle = BR.cream; c.fillRect(0, h * 0.04, w, h * 0.035); c.fillRect(0, h * 0.925, w, h * 0.035);
    }), { aspect: 2 });
  }
  function wordTex(str, big) {
    const h = LOW ? (big ? 64 : 40) : big ? 128 : 72, font = `${big ? 800 : 600} ${h * 0.7}px ${MAN}`, m = X.cv(4, 4).getContext('2d'); m.font = font; const w = Math.ceil(m.measureText(str).width + h * 0.5);
    return X.texCanvas(X.cv(w, h, (c) => { c.font = font; c.fillStyle = big ? BR.cream : '#B4B9D0'; c.fillText(str, h * 0.25, h * 0.72); if (big) { c.fillStyle = BR.orange; c.fillRect(h * 0.25, h * 0.88, w - h * 0.5, h * 0.06); } }), { mip: false });
  }

  /* ---------- Einblendungen: gezeichnet mit den Helfern aus core.js auf die kleine Fläche (Maße wie im HD-Bild, 1920×1080) ---------- */
  function drawHud(fn) { const keep = g; g = hc; g.save(); g.setTransform(1, 0, 0, 1, 0, 0); g.clearRect(0, 0, PW, PH); g.setTransform(S, 0, 0, S, 0, 0); try { fn(); } finally { g.restore(); g = keep; } }
  const sn = (v) => Math.round(v * S) / S; // auf das Raster des Bildspeichers
  const u = 3; // eine Rasterzeile von Look 97 in HD-Maßen
  /* Feld hinter Text, je Look anders: 97 mit Winkeln in den Ecken, 99 mit orangem Balken links, 2000 mit heller Oberkante,
     2001 gläsern mit runder Haarlinie, 2003 mit oranger Unterkante, 2005 als Verlauf, der nach rechts ausläuft */
  function box(x, y, w, h, a = 1) {
    x = sn(x); y = sn(y); w = sn(w); h = sn(h); if (a <= 0) return;
    if (HS === 'glas') { g.save(); g.globalAlpha *= a; rr(x, y, w, h, 18); g.fillStyle = ST.panel; g.fill(); g.strokeStyle = ST.edge; g.lineWidth = 2; g.stroke(); g.restore(); return; }
    if (HS === 'licht') { g.save(); g.globalAlpha *= a; const gr = g.createLinearGradient(x, 0, x + w, 0); gr.addColorStop(0, ST.panel); gr.addColorStop(0.62, ST.panel); gr.addColorStop(1, 'rgba(12,10,9,0.5)'); g.fillStyle = gr; g.fillRect(x, y, w, h); g.fillStyle = ST.edge; g.fillRect(x, y, 2, h); g.restore(); return; }
    g.save(); g.globalAlpha *= a; g.fillStyle = ST.panel; g.fillRect(x, y, w, h); g.fillStyle = ST.edge;
    if (HS === 'band') g.fillRect(x, y, 2 * u, h); else if (HS === 'kino') g.fillRect(x, y + h - u, w, u); else
    if (L97) { const t = u, l = 8 * u; for (const [cx, cy, sx, sy] of [[x, y, 1, 1], [x + w, y, -1, 1], [x, y + h, 1, -1], [x + w, y + h, -1, -1]]) { g.fillRect(sx < 0 ? cx - l : cx, sy < 0 ? cy - t : cy, l, t); g.fillRect(sx < 0 ? cx - t : cx, sy < 0 ? cy - l : cy, t, l); } } else g.fillRect(x, y, w, 2);
    g.restore();
  }
  const mono = (str, x, y, o = {}) => label(str, x, y, { size: o.size ?? 30, color: o.color ?? ST.ink, alpha: o.alpha, align: o.align, track: o.track ?? 0.08, weight: o.weight ?? 500 });
  const monoW = (str, size = 30, weight = 500) => measure(str.toUpperCase(), size, weight, MONO, size * 0.08);
  const beat = (lt, b, d = 0.22) => eOut(seg(lt, b * B, b * B + d)); // erscheint auf Schlag b
  const fitm = (str, max, size, min, weight = 500, fam = MAN) => Math.max(min, fit(str, max, size, weight, fam)); // passt an, aber nie kleiner als min
  const clipX = (x, w, fn) => { g.save(); g.beginPath(); g.rect(x, 0, w, H); g.clip(); fn(); g.restore(); };
  const tc = (x) => `${String(Math.floor(x / 60)).padStart(2, '0')}:${String(Math.floor(x % 60)).padStart(2, '0')}`;
  /* Farbtiefe des Bildspeichers, wie sie wirklich ist: 16 bit (gedithert), 32 bit oder Halbfloat für den großen Helligkeitsumfang */
  const bits = () => (LOW ? '16 Bit' : X.hdr ? 'HDR 64 Bit' : '32 Bit');
  /* Titel in zwei Teilen: erster Manrope, zweiter Instrument Serif kursiv in Orange (wie titlePair in scenes.js) */
  function pair(a, b, x, y, maxW, size, lt, b0 = 1) {
    const ts = fit(`${a} ${b}`, maxW, size, 700), w = layoutLine(tokens(a), ts, { weight: 700 }).width;
    drawLine(tokens(a), x, y, ts, seg(lt, b0 * B, b0 * B + 0.3), { style: 'mask', color: ST.ink, weight: 700 });
    drawLine(tokens(b, { serif: true }), x + w + ts * 0.3, y, ts, seg(lt, (b0 + 1) * B, (b0 + 1) * B + 0.3), { style: 'mask', color: ST.acc });
    return ts;
  }
  /* Rahmen des Laufs: Test und Kapitel, Bildrate, Dreiecke, Bildspeicher, Zeit, Fortschritt mit den Grenzen der Tests — je Look anders gestaltet.
     Mit Intro zählt der Auftakt nicht als Test. */
  function chrome(t, s, tris, a) {
    if (a <= 0.01) return; g.save(); g.globalAlpha = a;
    const off = TH.intro ? 1 : 0, n = SCENES.length - off, lab = `${UI.test} ${String(s.i + 1 - off).padStart(2, '0')}/${String(n).padStart(2, '0')}`, chap = T.chapters[s.id] ?? '', lw = monoW(lab, 30, 700), k = Math.exp(-(t - s.t0) * 5);
    const pl = `${fmtInt(tris, LANG)} ${UI.polys}`, bf = `${PW}×${PH} · ${bits()}`, tm = `${tc(t)} / ${tc(DUR + 0.01)}`, tests = SCENES.filter((q) => q.i >= off), tA = tests[0].t0, pos = (x0, w, tt) => sn(x0 + (w * (tt - tA)) / (DUR - tA));
    const scrim = (h, top) => { const gr = g.createLinearGradient(0, top ? 0 : H - h, 0, top ? h : H); gr.addColorStop(top ? 0 : 1, 'rgba(0,0,0,0.6)'); gr.addColorStop(top ? 1 : 0, 'rgba(0,0,0,0)'); g.fillStyle = gr; g.fillRect(0, top ? 0 : H - h, W, h); };
    if (HS === 'band') {
      /* 99: zwei durchgehende Bänder */
      g.fillStyle = 'rgba(4,7,22,0.92)'; g.fillRect(0, 0, W, 66); g.fillRect(0, H - 66, W, 66);
      if (k > 0.03) { g.fillStyle = rgba(BR.orange, 0.5 * k); g.fillRect(0, 0, sn(lw + monoW(chap) + 132), 66); }
      g.fillStyle = ST.acc; g.fillRect(0, 66, W, u); g.fillRect(0, H - 66 - u, W, u);
      mono(lab, 48, 45, { color: ST.acc, weight: 700 }); mono(chap, 48 + lw + 36, 45); mono(`30 FPS · ${pl} · ${bf}`, W - 48, 45, { align: 'right' });
      mono(tm, 48, H - 22); const x0 = sn(48 + monoW(tm) + 48), bw = W - 48 - x0, by = sn(H - 39);
      g.fillStyle = ST.rail; g.fillRect(x0, by, bw, 2 * u); g.fillStyle = ST.acc; g.fillRect(x0, by, pos(0, bw, t), 2 * u); g.fillStyle = ST.ink; for (const q of tests) if (q.t0 > tA) g.fillRect(pos(x0, bw, q.t0), by - u, u, 4 * u);
    } else if (HS === 'glas') {
      /* 2001: keine Felder — eine orange Linie mit zwei Zeilen links, die Bildrate groß rechts, unten eine Haarlinie mit Marke */
      scrim(230, true); scrim(170, false);
      g.fillStyle = ST.acc; g.fillRect(60, 48, 4, 88); mono(lab, 86, 78, { size: 26, color: ST.acc, weight: 700 }); text(chap, 86, 130, { size: 46, weight: 700, color: ST.ink, ls: -0.5 });
      text('30', W - 150, 118, { size: 88, weight: 500, align: 'right', color: ST.ink, ls: -3 }); mono('FPS', W - 60, 118, { align: 'right', color: ST.acc, weight: 700 }); mono(pl, W - 60, 160, { align: 'right', size: 26 }); mono(bf, W - 60, 196, { align: 'right', size: 26, color: ST.soft });
      const x0 = 60, bw = W - 120 - monoW(tm, 26) - 40, by = sn(H - 60);
      g.fillStyle = ST.rail; g.fillRect(x0, by, bw, 2); for (const q of tests) g.fillRect(pos(x0, bw, q.t0), by - 8, 2, 18);
      g.fillStyle = ST.acc; g.fillRect(x0, by - 1, pos(0, bw, t), 4); g.beginPath(); g.arc(x0 + pos(0, bw, t), by + 1, 9, 0, 7); g.fill();
      mono(tm, W - 60, H - 50, { align: 'right', size: 26 });
    } else if (HS === 'kino') {
      /* 2003: Breitbild — die Angaben stehen in den schwarzen Balken, der Fortschritt läuft auf der Kante */
      g.fillStyle = '#000'; g.fillRect(0, 0, W, 132); g.fillRect(0, H - 132, W, 132);
      mono(lab, 60, 82, { color: ST.acc, weight: 700 }); mono(chap, 60 + lw + 36, 82); mono(`30 FPS  ·  ${pl}  ·  ${bf}`, W - 60, 82, { align: 'right', color: ST.soft });
      mono(tm, 60, H - 56); const by = sn(H - 132);
      g.fillStyle = ST.rail; g.fillRect(0, by, W, u); g.fillStyle = ST.acc; g.fillRect(0, by, pos(0, W, t), u + 1); g.fillStyle = ST.ink; for (const q of tests) if (q.t0 > tA) g.fillRect(pos(0, W, q.t0), by, u, 14);
      if (k > 0.03) { g.fillStyle = rgba(BR.orange, 0.8 * k); g.fillRect(0, 129, sn(W * (1 - k)), 3); }
    } else if (HS === 'licht') {
      /* 2005: Lichtverläufe statt Felder, die Tests als Punktreihe */
      scrim(250, true); scrim(190, false);
      mono(lab, 60, 76, { size: 26, color: ST.soft }); text(chap, 60, 130, { size: 50, weight: 600, color: ST.ink, ls: -0.8 }); g.fillStyle = ST.acc; g.fillRect(60, 150, sn(120 + 200 * k), 3);
      text('30', W - 148, 122, { size: 96, weight: 500, align: 'right', color: ST.ink, ls: -4, alpha: 0.92 }); mono('FPS', W - 60, 122, { align: 'right', color: ST.acc, weight: 700 }); mono(pl, W - 60, 164, { align: 'right', size: 26 }); mono(bf, W - 60, 200, { align: 'right', size: 26, color: ST.soft });
      mono(tm, 60, H - 52, { size: 26 });
      const gap = Math.min(40, 900 / tests.length), x0 = W / 2 - ((tests.length - 1) * gap) / 2;
      tests.forEach((q, i) => { const on = q.i === s.i, done = q.i < s.i; g.beginPath(); g.arc(x0 + i * gap, H - 62, on ? 10 : 6, 0, 7); if (on) { g.fillStyle = ST.acc; g.fill(); } else if (done) { g.fillStyle = ST.ink; g.fill(); } else { g.strokeStyle = ST.rail; g.lineWidth = 2; g.stroke(); } });
      if (s.i < SCENES.length) { const q = (t - s.t0) / s.D, xi = x0 + (s.i - off) * gap; g.strokeStyle = ST.acc; g.lineWidth = 3; g.beginPath(); g.arc(xi, H - 62, 17, -Math.PI / 2, -Math.PI / 2 + q * Math.PI * 2); g.stroke(); }
    } else {
      box(48, 42, lw + monoW(chap) + 78, 66);
      if (k > 0.03 && s.i > 0) { g.fillStyle = rgba(BR.orange, 0.5 * k); g.fillRect(48, 42, sn(lw + monoW(chap) + 78), 66); }
      mono(lab, 66, 87, { color: ST.acc, weight: 700 }); mono(chap, 66 + lw + 42, 87);
      const bw = Math.max(monoW(pl), monoW(bf), 300) + 36;
      box(W - 48 - bw, 42, bw, 156);
      mono('30 FPS', W - 66, 93, { size: 42, weight: 700, color: ST.acc, align: 'right' }); mono(pl, W - 66, 138, { align: 'right' }); mono(bf, W - 66, 178, { align: 'right', color: ST.soft });
      box(48, H - 108, monoW(tm) + 36, 48); mono(tm, 66, H - 73);
      const x0 = 48, bwid = W - 96, by = sn(H - 42);
      g.fillStyle = ST.rail; g.fillRect(x0, by, bwid, 2 * u); g.fillStyle = ST.acc; g.fillRect(x0, by, sn((bwid * t) / DUR), 2 * u);
      g.fillStyle = ST.ink; for (const q of SCENES) if (q.i > 0) g.fillRect(sn(x0 + (bwid * q.t0) / DUR), by - u, u, 4 * u);
    }
    g.restore();
  }

  /* ---------- Intro (Looks mit TH.intro): Montage aus den Tests des Looks, dann der Titel ---------- */
  /* Reihenfolge der Tests in der Montage (der erste, längste Schnitt zeigt die Szene, die den Jahrgang ausmacht) und der Zeitpunkt, an dem jeder gut aussieht */
  const SEQ = { 99: ['moon', 'tunnel', 'hall', 'gold', 'galaxy', 'screens'], '2k': ['tunnel', 'moon', 'hall', 'gold', 'galaxy', 'screens'], '01': ['pool', 'moon', 'hall', 'orbit', 'gold', 'tunnel'], '03': ['orrery', 'pool', 'moon', 'tunnel', 'hall', 'gold'], '05': ['station', 'orrery', 'pool', 'moon', 'hall', 'gold'] };
  const OFF = { moon: 5, tunnel: 2, hall: 3, gold: 2, galaxy: 5, screens: 3.2, pool: 4, orrery: 3, station: 5.5, orbit: 7 };
  const SLOW = () => (TH.look === '01' ? 0.45 : TH.look === '05' ? 0.6 : 1);
  /* Schnitte in Schlägen: vom Titel rückwärts gezählt werden sie länger — zum Titel hin also kürzer (2001 und 2005 lassen sich Zeit) */
  function prepIntro() {
    const tL = logoLock(SCENES[0].D), nb = Math.round(tL / B), want = SLOW() < 1 ? [2, 2, 4, 4, 8, 8, 8, 8, 8] : [1, 1, 1, 1, 2, 2, 2, 4, 4, 4, 8, 8, 8, 8], len = [], seq = SEQ[TH.look];
    let sum = 0; for (const w of want) { if (sum >= nb) break; const n = Math.min(w, nb - sum); len.unshift(n); sum += n; }
    if (sum < nb) len[0] += nb - sum;
    if (len.length > 2 && len[0] < len[1]) len.splice(0, 2, len[0] + len[1]); // kein kurzer Rest am Anfang
    let b = 0; cuts = len.map((n, k) => { const c = { t0: b * B, t1: (b + n) * B, id: seq[k % seq.length], k }; b += n; return c; });
  }
  const cutAt = (lt) => cuts.find((q) => lt < q.t1) ?? cuts[cuts.length - 1];
  const INTRO = {
    d3(lt, D) {
      const tL = logoLock(D);
      /* Titel: ruhiger Mondhorizont, die Sonne steht rechts außen — ihr Licht bleibt neben dem Lockup */
      if (lt >= tL) { X.test.orbit.draw(lt - tL + 20, D, { sunX: SUNX, calm: true, sun: rise + (1 - rise) * (0.3 + 0.45 * ((lt - tL) / (D - tL))) }); return; }
      const c = cutAt(lt), q = lt - c.t0, dur = c.t1 - c.t0, test = X.test[c.id] ?? X.test.orbit;
      /* 99: jeder Schnitt beginnt als Drahtgitter und wird zur Fläche */
      if (TH.look === '99') { const w = q / dur; X.wireC = [1, 0.47, 0.09]; X.wireK = w < 0.5 ? 1 : clamp(1 - (w - 0.5) * 5) * 0.9; }
      test.draw(OFF[c.id] + c.k * 1.9 + q * SLOW(), test.dur, c.id === 'screens' ? { images: labSeq } : c.id === 'orbit' ? { sun: 0.85 } : {});
    },
    /* Lichtblitz auf der Szene: zum Titel bei allen; an den Schnitten bei 2000 und 2003, bei 99 beim Wechsel vom Gitter zur Fläche */
    flash(lt, D) {
      const tL = logoLock(D); if (lt >= tL) return 0.36 * Math.exp(-(lt - tL) * 7);
      const c = cutAt(lt), q = lt - c.t0, dur = c.t1 - c.t0;
      if (TH.look === '99') return q >= dur / 2 ? 0.4 * Math.exp(-(q - dur / 2) * 11) : 0;
      return (TH.look === '2k' || TH.look === '03') && c.k > 0 ? (TH.look === '2k' ? 0.5 : 0.3) * Math.exp(-q * 10) : 0;
    },
    /* Abblenden: vor dem Titel ins Schwarz; 2001 und 2005 tauchen an jedem Schnitt kurz ab */
    dip(lt, D) {
      const tL = logoLock(D); if (lt >= tL) return 0;
      const c = cutAt(lt), q = lt - c.t0, dur = c.t1 - c.t0, soft = SLOW() < 1 ? Math.max(1 - seg(q, 0, c.k ? 0.28 : 0.9), seg(q, dur - 0.22, dur)) : 0;
      return Math.max(soft, seg(lt, tL - 0.6, tL - 0.32)); // schwarz, bevor das Zeichen erscheint
    },
    /* Bildausschnitt: 99 springt beim Wechsel zur Fläche nach vorn, 2000 und 2003 zucken am Schnitt, 2001 fährt langsam heran, 2005 langsam zurück */
    zoom(lt, D) {
      const tL = logoLock(D); if (lt >= tL - 0.62) return 1;
      const c = cutAt(lt), q = lt - c.t0, dur = c.t1 - c.t0;
      return TH.look === '99' ? (q >= dur / 2 ? 1 + 0.16 * Math.exp(-(q - dur / 2) * 8) : 1) : TH.look === '01' ? 1 + 0.06 * (q / dur) : TH.look === '05' ? 1.07 - 0.07 * (q / dur) : 1 + 0.05 * Math.exp(-q * 9);
    },
    /* Nachbearbeitung: 2003 glüht stärker, 2005 öffnet die Blende langsam (aus dem Dunkel in das Licht) */
    post(lt, D) { const tL = logoLock(D); return { bloom: TH.look === '03' && lt < tL ? 1.7 : TH.look === '05' && lt < tL ? 1.35 : 1, expo: TH.look === '05' && cuts.length ? lerp(0.22, 1, smooth01(lt / (cuts[0].t1 * 0.8))) : 1 }; },
    chrome() { return 0; },
    bars(lt) { return (HS === 'kino' ? 132 : 100) * eOut(seg(lt, 0, 0.5)); },
    hud(lt, D) {
      const tL = logoLock(D), cx = W / 2, cy = 462, m = 150, pm = seg(lt, tL - 0.3, tL);
      /* das Zeichen kommt mit dem Reveal der Marke aus dem Schwarz und steht auf dem Schlag; dann die Wortmarke, Name und Rolle, die Zeile mit dem Look */
      if (pm > 0) lockup(cx, cy, m, BR.cream, { pm, pw: seg(lt, tL + 0.04, tL + 0.5) });
      if (lt < tL) return;
      const t2 = lt - tL, tag = `${NAME} · ${ROLE}`, yl = `Benchmark ${LK.yr}`, wl = monoW(yl, 36, 700) + 84, y0 = cy + m * 0.5;
      text(tag, cx, y0 + 96, { size: fit(tag, W - 420, 34, 500, MONO), weight: 500, fam: MONO, align: 'center', color: ST.soft, alpha: beat(t2, 1) });
      box(cx - wl / 2, y0 + 150, wl, 68, beat(t2, 2)); mono(yl, cx, y0 + 197, { size: 36, weight: 700, color: ST.acc, align: 'center', alpha: beat(t2, 2) });
    },
  };

  /* ---------- die Tests: d3 zeichnet die 3D-Szene, hud die Inhalte ---------- */
  /* Hintergrund je Look, wo er wechselt: der Claim steht vor der Szene, die den Jahrgang ausmacht */
  const back = (lt, D, o) => { const id = o[TH.look] ?? o.x, q = typeof id === 'string' ? [id, {}] : id; X.test[q[0]].draw(lt, D, q[1]); };
  const SC = {
    /* Auftakt: Mondhorizont. Der Sweep des Zeichens läuft als Lader, daneben die Daten des Laufs; auf dem Schlag tritt die Sonne über den Rand
       und das Zeichen wird zum Lockup. */
    logo: {
      d3(lt, D) { const tL = logoLock(D); X.test.orbit.draw(lt, D, { sunX: SUNX, calm: true, sun: lt < tL ? rise * 0.985 * (lt / tL) : rise * 0.985 + (1 - rise) * 0.7 * smooth01((lt - tL) / Math.max(1, D - tL)) + 0.03 * seg(lt, tL, tL + 0.3) }); },
      flash(lt, D) { const tL = logoLock(D); return lt >= tL ? 0.32 * Math.exp(-(lt - tL) * 7) : 0; },
      chrome(lt, D) { const tL = logoLock(D); return lerp(1, 0.4, seg(lt, tL - 0.1, tL + 0.3)); },
      hud(lt, D) {
        const tL = logoLock(D), cx = W / 2, cy = 500, hBig = 240, m = 150, pl = E_REVEAL(seg(lt, tL, tL + 0.5));
        const size = 0.9275 * m, mw = (m * 28) / 24, total = mw + 0.46 * m + wordmarkWidth(size), x0 = cx - total / 2, zx = lerp(cx, x0 + mw / 2, pl), zh = lerp(hBig, m, pl);
        if (lt < tL - 0.15) zeichenSweep(cx, cy, hBig, (lt % (2 * B)) / (2 * B));
        else { const k = seg(lt, tL - 0.15, tL); g.save(); g.globalAlpha = 1 - k; zeichenSweep(cx, cy, hBig, 1); g.restore(); g.save(); g.globalAlpha = k; zeichen(zx, cy, zh); g.restore(); }
        /* Daten des Laufs (alle wahr): Technik und Bildspeicher, Zahl der Tests und Dauer, Bildrate und Musik */
        const ia = 1 - seg(lt, tL - 0.3, tL), lines = [`WebGL · ${PW}×${PH} · ${L97 ? 16 : 32} Bit`, `${SCENES.length} ${UI.tests} · ${UI.dur} ${tc(DUR)}`, `30 ${UI.fps} · ${UI.music}`];
        if (ia > 0) lines.forEach((ln, i) => mono(ln, 66, 790 + i * 48, { alpha: ia * beat(lt, 1 + i * 2), color: i ? ST.ink : ST.acc }));
        if (pl > 0) {
          const edge = zx + (zh * 28) / 48 + 0.2 * m;
          g.save(); g.beginPath(); g.rect(edge, 0, W - edge, H); g.clip(); wordmark(x0 + mw + 0.46 * m, cy + size * 0.345, size, BR.cream, { p: seg(pl, 0.25, 1) }); g.restore();
          const pt = eOut(seg(lt, tL + 0.5, tL + 0.9)), tag = `${NAME} · ${ROLE} · ${FOCUS.join(', ')}`;
          text(tag, cx, cy + m * 0.5 + 96, { size: fit(tag, W - 300, 32, 500, MONO), weight: 500, fam: MONO, align: 'center', color: ST.soft, alpha: pt });
        }
      },
    },
    /* Anspruch: Partikel-Galaxie rechts, der Claim links */
    claim: {
      d3(lt, D) { back(lt, D, { x: ['galaxy', { side: 8.5 }], '01': ['pool', { side: 5 }], '03': ['orrery', { side: 5.2 }], '05': 'station' }); },
      hud(lt) {
        const x = 130, y0 = 500;
        /* ab 2001 steht der Claim vor einer hellen Szene: ein dunkler Verlauf von links hält ihn lesbar */
        if (X.cfg.pp) { const gr = g.createLinearGradient(0, 0, 1250, 0); gr.addColorStop(0, 'rgba(8,7,6,0.78)'); gr.addColorStop(0.55, 'rgba(8,7,6,0.6)'); gr.addColorStop(1, 'rgba(8,7,6,0)'); g.fillStyle = gr; g.fillRect(0, HS === 'kino' ? 132 : 0, 1250, HS === 'kino' ? H - 264 : H); }
        mono(T.claimKicker, x, y0 - 190, { color: ST.acc, alpha: beat(lt, 0) });
        drawLine(tokens(CLAIM[0]), x, y0, 156, seg(lt, B, B + 0.35), { style: 'mask', color: ST.ink });
        drawLine(tokens(CLAIM[1], { serif: true }), x, y0 + 172, 156, seg(lt, 2 * B, 2 * B + 0.35), { style: 'mask', color: ST.acc });
        text(T.claimSub.join(' '), x + 4, y0 + 280, { size: 48, weight: 500, color: ST.soft, alpha: beat(lt, 4, 0.4) });
      },
    },
    /* Person: Glaskugeln unter farbigen Lichtern; links wer, rechts die Kennzahlen */
    person: {
      d3(lt, D) { back(lt, D, { x: 'hall', '03': 'pool', '05': 'orrery' }); },
      hud(lt) {
        const x = 138;
        box(96, 228, 1050, 690, beat(lt, 0));
        mono(T.personKicker, x, 292, { color: ST.acc, alpha: beat(lt, 0) });
        const ns = fit(NAME, 960, 128, 800, MAN, -0.03);
        drawLine(tokens(NAME), x, 430, ns, seg(lt, B * 0.5, B * 0.5 + 0.35), { style: 'mask', color: ST.ink });
        text(ROLE, x + 4, 500, { size: 46, weight: 500, color: ST.soft, alpha: beat(lt, 2) });
        let px = x; FOCUS.concat([T.place]).forEach((f, i) => { px += pill(f, px, 578, { alpha: beat(lt, 3 + i * 0.5), size: 30, stroke: i === 3 ? ST.acc : 'rgba(246,241,232,0.3)', fill: 'rgba(246,241,232,0.08)', color: ST.ink }) + 14; });
        const per = 2 * B, ri = Math.floor(Math.max(0, lt - 4 * B) / per), rp = (Math.max(0, lt - 4 * B) % per) / per;
        mono('→ ' + T.roles[ri % T.roles.length], x + 4, 668, { color: ST.acc, alpha: Math.min(seg(rp, 0, 0.15), 1 - seg(rp, 0.88, 1)) * beat(lt, 4) });
        const pc = seg(lt, 5 * B, 5 * B + 1.2), val = SEC0 - (1 - eOut5(pc)) * 9.5e5 + Math.floor(lt);
        text(fmtInt(val, LANG), x, 806, { size: 96, weight: 700, fam: MONO, color: ST.ink, alpha: eOut(pc), ls: -3 });
        text(T.secLabel, x + 4, 868, { size: fit(T.secLabel, 960, 32, 500), weight: 500, color: ST.soft, alpha: beat(lt, 6) });
        const rx = 1290;
        box(rx - 42, 228, 580, 560, beat(lt, 2));
        T.stats.forEach(([a, b], i) => { const p = beat(lt, 2 + i), y = 356 + i * 176; text(a, rx, y, { size: 112, weight: 800, color: i === 0 ? ST.acc : ST.ink, alpha: p, ls: -4 }); text(b, rx + measure(a, 112, 800, MAN, -4) + 22, y, { size: 38, weight: 500, color: ST.soft, alpha: p }); });
      },
    },
    /* Stack: Tunnelflug, die Technologien kommen als Tafeln entgegen — die vier Schwerpunkte groß und auf den Schlag */
    stack: {
      d3(lt, D) { X.test.tunnel.draw(lt, D, { plates, pulse: 0.55 + 0.45 * Math.exp(-(lt % B) * 5) }); },
      hud(lt, D) {
        const x = 138, more = D >= 3 * BAR - 0.01;
        box(96, more ? 668 : 716, 1290, more ? 250 : 202, beat(lt, 0));
        mono(T.stackKicker, x, more ? 730 : 778, { color: ST.acc, alpha: beat(lt, 0) });
        text(T.stackTitle[0], x, more ? 800 : 848, { size: 54, weight: 700, color: ST.ink, alpha: beat(lt, 1) });
        text(T.stackTitle[1], x + measure(T.stackTitle[0], 54, 700) + 18, more ? 800 : 848, { size: fit(T.stackTitle[1], 1190 - measure(T.stackTitle[0], 54, 700), 54 * 1.14, 400, SER, 0, true), weight: 400, fam: SER, italic: true, color: ST.acc, alpha: beat(lt, 2) });
        if (more) mono(`${T.stackNext}: ${STACK_NEXT.join(' · ')}`, x, 876, { color: ST.soft, alpha: beat(lt, 6) });
      },
    },
    /* Reise: Flug über die Mondlandschaft, je Station ein Tor mit der Jahreszahl. Die Kamera bremst vor dem Tor ab (die Zahl steht dann groß
       im Bild) und fliegt zum Stationswechsel — auf die Eins — darunter hindurch zum nächsten. */
    journey: {
      st(lt) { let i = 0; for (let k = 0; k < jList.length; k++) if (lt >= jT0[k]) i = k; return { i, q: lt - jT0[i], Ds: jDur[i] }; },
      d3(lt, D) { const { i, q, Ds } = this.st(lt); X.test.moon.draw(lt, D, { gates, pos: (i + 1 - Math.pow(1 - clamp(q / Ds), 2.2)) * GATE - 9, aim: OPT.journey.steps ? -2.4 : OPT.journey.blurb ? 0.9 : 2.5 }); }, // hohes Textfeld: Blick tiefer, das Tor rückt nach oben
      hud(lt) {
        const { i, q } = this.st(lt), o = OPT.journey, it = jList[i], tx = it[LANG], n = jList.length, x = 138, a = eOut(seg(q, 0, 0.2));
        const steps = o.steps && it.st ? it.st[LANG] : [], bl = o.blurb ? wrapLines(tx[3], 1010, 32, 500) : [], hh = 236 + bl.length * 46 + (steps.length ? steps.length * 50 + 16 : 0), y0 = 918 - hh;
        box(96, y0, 1110, hh, beat(lt, 0));
        mono(`${String(i + 1).padStart(2, '0')}/${String(n).padStart(2, '0')} · ${T.journeyKicker}`, x, y0 + 62, { color: ST.acc, alpha: beat(lt, 0) });
        g.save(); g.globalAlpha = a;
        text(it.y, x - 2, y0 + 158, { size: 92, weight: 800, color: ST.acc, ls: -3 });
        const yw = measure(it.y, 92, 800, MAN, -3) + 30;
        text(tx[0], x + yw, y0 + 150, { size: fit(tx[0], 1020 - yw, 62, 800, MAN, -0.02), weight: 800, color: ST.ink, ls: -1 });
        mono(`${tx[1]} · ${tx[2]}`, x, y0 + 208, { color: ST.soft, size: fit(`${tx[1]} · ${tx[2]}`.toUpperCase(), 1010, 30, 500, MONO, 0.08) });
        bl.forEach((ln, k) => text(ln, x, y0 + 262 + k * 46, { size: 32, weight: 500, color: ST.ink, alpha: eOut(seg(q, 0.15 + k * 0.08, 0.4 + k * 0.08)) }));
        g.restore();
        steps.forEach((str, k) => { const ps = eOut(seg(q, BAR + k * 2 * B, BAR + k * 2 * B + 0.22)), yy = y0 + 262 + bl.length * 46 + 16 + k * 50; if (ps <= 0) return; g.save(); g.globalAlpha = ps; g.translate(x - 13, yy - 35); g.fillStyle = ST.acc; g.fill(ZP.slash); g.restore(); text(str, x + 34, yy, { size: fit(str, 980, 32, 600), weight: 600, color: ST.ink, alpha: ps }); });
        /* Liste der Stationen rechts: wie die Testliste eines Benchmarks, die laufende hervorgehoben */
        const rx = W - 48 - 250, ry = 236;
        box(rx, ry, 250, n * 54 + 30, beat(lt, 1));
        jList.forEach((s2, k) => { const on = k === i, done = k < i, yy = ry + 58 + k * 54; if (on) { g.fillStyle = rgba(BR.orange, 0.22 * beat(lt, 1)); g.fillRect(sn(rx), sn(yy - 38), 250, 54); } mono(`${on ? '▸' : done ? '·' : ' '} ${s2.y}`, rx + 30, yy, { color: on ? ST.acc : done ? ST.ink : ST.soft, weight: on ? 700 : 500, alpha: beat(lt, 1) }); });
      },
    },
    /* Gold: drei Goldringe mit Environment-Map; links die Auszeichnung */
    award: {
      d3(lt, D) { X.test.gold.draw(lt, D, { side: 3.4 }); },
      hud(lt, D) {
        const x = 138;
        box(96, 250, 980, D > 2 * BAR ? 640 : 560, beat(lt, 0));
        mono(T.awardKicker, x, 314, { color: ST.acc, alpha: beat(lt, 0) });
        const pg = seg(lt, B, B + 0.25), sc = lerp(1.35, 1, eOut5(pg));
        g.save(); g.translate(x + 240, 480); g.scale(sc, sc); g.translate(-(x + 240), -480); text('Gold', x - 6, 548, { size: 230 * 1.14, weight: 400, fam: SER, italic: true, color: glassFill(370, 560), alpha: eOut(pg) }); g.restore();
        text(T.awardTop, x, 656, { size: 60, weight: 800, color: ST.ink, alpha: beat(lt, 2), ls: -1.5 });
        text(T.awardCat, x, 712, { size: 36, weight: 600, color: ST.soft, alpha: beat(lt, 3) });
        text(T.awardWhat, x, 762, { size: fit(T.awardWhat, 900, 36, 500), weight: 500, color: ST.soft, alpha: beat(lt, 3) });
        if (D > 2 * BAR) text(T.awardNote, x, 840, { size: fit(T.awardNote, 900, 38, 400, SER, 0, true), weight: 400, fam: SER, italic: true, color: ST.acc, alpha: beat(lt, 5) });
      },
    },
    /* Labs: Flug an Bildschirmen mit den Spielszenen vorbei; unten das Lab, das gerade vorn ist — danach die übrigen Projekte */
    labs: {
      d1(D) { return OPT.labs.more ? D * 0.72 : D; },
      d3(lt, D) { X.test.screens.draw(lt, D, { images: labSeq, row: true }); },
      hud(lt, D) {
        const x = 138, D1 = this.d1(D), ph2 = OPT.labs.more ? seg(lt, D1 - 0.2, D1 + 0.3) : 0, n = labSeq.length;
        box(96, 228, 1130, 168, beat(lt, 0));
        mono(T.labsKicker, x, 290, { color: ST.acc, alpha: beat(lt, 0) });
        pair(T.labsTitle[0], T.labsTitle[1], x, 362, 1040, 60, lt);
        box(W - 48 - 380, 228, 380, 168, beat(lt, 2));
        text(String(LABS_COUNT), W - 66 - monoW(T.labsCount) - 20, 368, { size: 132, weight: 800, align: 'right', color: ST.acc, alpha: beat(lt, 2), ls: -5 }); mono(T.labsCount, W - 66, 366, { align: 'right', alpha: beat(lt, 2) });
        if (n && ph2 < 1) {
          const k = X.test.screens.index(Math.min(lt, D1), D, n), lab = LABS[labSeq[k].lab], lines = OPT.labs.desc ? wrapLines(lab[LANG][1], 1010, 32, 500) : [], hh = 170 + lines.length * 46, y0 = 918 - hh;
          g.save(); g.globalAlpha = (1 - ph2) * beat(lt, 3);
          box(96, y0, 1110, hh);
          mono(`${lab[LANG][0]} · ${lab.d}`, x, y0 + 60, { color: ST.acc });
          text(lab.name, x, y0 + 132, { size: 62, weight: 800, color: ST.ink, ls: -1 });
          lines.forEach((ln, q) => text(ln, x, y0 + 186 + q * 46, { size: 32, weight: 500, color: ST.soft }));
          g.restore();
        }
        if (ph2 > 0) {
          /* die übrigen Projekte: als laufender Text umbrochen */
          const str = LABS_MORE.join('  ·  '), lines = wrapLines(str, W - 2 * x, 38, 600), hh = 110 + lines.length * 58, y0 = 918 - hh;
          box(96, y0, W - 192, hh, ph2);
          mono(T.labsMore, x, y0 + 60, { color: ST.acc, alpha: ph2 });
          lines.forEach((ln, q) => text(ln, x, y0 + 126 + q * 58, { size: 38, weight: 600, color: ST.ink, alpha: eOut(seg(lt, D1 + 0.1 + q * B * 0.5, D1 + 0.35 + q * B * 0.5)) }));
        }
        /* SPREE|FALL zeigt Karten aus OpenStreetMap — der Hinweis steht, solange dessen Bilder im Lauf sind */
        if (labSeq.some((q) => LABS[q.lab].credit)) { const w = monoW(T.osm, 27) + 36, cy = HS === 'band' ? H - 132 : HS === 'glas' || HS === 'licht' ? H - 170 : HS === 'kino' ? H - 198 : H - 108; box(W - 48 - w, cy, w, 48, beat(lt, 3)); mono(T.osm, W - 66, cy + 33, { size: 27, align: 'right', color: ST.ink, alpha: beat(lt, 3) }); }
      },
    },
    /* Plattform: Look 2000 fliegt an Ansichten der neuen Website vorbei; Look 97 zeigt sie als 2D-Test (ein Bild scrollt und zoomt, kleinere ziehen darüber) */
    site: {
      d3(lt, D) { if (L97) X.test.blit.draw(lt, D, { images: ['siteBeyond', 'siteHome', 'siteLabs', 'siteStory'].filter((k) => IMG[k]) }); else X.test.screens.draw(lt, D, { images: siteSeq, row: true }); },
      hud(lt) {
        const x = 138, desc = OPT.site.desc ? wrapLines(T.siteDesc, 700, 32, 500) : [];
        let rows = 1, px = 0; T.siteChips.forEach((c) => { const w = measure(c, 28, 600) + 42 + 12; if (px + w > 720) { rows++; px = 0; } px += w; });
        const hh = 372 + desc.length * 46 + (desc.length ? 20 : 0) + rows * 66, y0 = Math.max(228, 918 - hh);
        box(96, y0, 800, hh, beat(lt, 0));
        mono(T.siteKicker, x, y0 + 62, { color: ST.acc, alpha: beat(lt, 0) });
        drawLine(tokens(T.siteTitle[0]), x, y0 + 176, 96, seg(lt, B, B + 0.3), { style: 'mask', color: ST.ink });
        drawLine(tokens(T.siteTitle[1], { serif: true }), x, y0 + 176 + 102, fit(T.siteTitle[1], 640, 96, 400, SER, 0, true), seg(lt, 2 * B, 2 * B + 0.3), { style: 'mask', color: ST.acc });
        let yy = y0 + 350;
        desc.forEach((ln, k) => text(ln, x + 2, yy + k * 46, { size: 32, weight: 500, color: ST.soft, alpha: eOut(seg(lt, 3 * B + k * 0.08, 3 * B + 0.3 + k * 0.08)) }));
        yy += desc.length * 46 + (desc.length ? 20 : 0); px = x;
        T.siteChips.forEach((c, i) => { const w = measure(c, 28, 600) + 42; if (px + w > x + 720) { px = x; yy += 66; } px += pill(c, px, yy + 8, { size: 28, alpha: beat(lt, 3 + i * 0.5), stroke: i === 0 ? ST.acc : 'rgba(246,241,232,0.3)', fill: 'rgba(246,241,232,0.08)', color: ST.ink }) + 12; });
      },
    },
    /* Schluss: erst der Ergebnis-Bildschirm mit den belegten Zahlen, dann Lockup, Claim und Kontakt über dem Mondhorizont */
    outro: {
      tR(D) { const n = Math.round(D / BAR); return (n >= 6 ? 3 : n >= 4 ? 2 : 1) * BAR; },
      d3(lt, D) { X.test.orbit.draw(lt + 40, D, { sunX: SUNX, calm: true, sun: rise + (1 - rise) * (0.25 + 0.6 * (lt / D)) }); },
      flash(lt, D) { const tR = this.tR(D); return lt >= tR ? 0.28 * Math.exp(-(lt - tR) * 7) : 0; },
      chrome(lt, D) { const tR = this.tR(D); return lerp(1, 0.4, seg(lt, tR - 0.1, tR + 0.2)); },
      hud(lt, D) {
        const tR = this.tR(D), cx = W / 2;
        if (lt < tR) {
          const rows = [[T.stats[0][0], T.stats[0][1]], [T.stats[1][0], T.stats[1][1]], [String(LABS_COUNT), T.labsKicker], ['Gold', `${T.awardTop} · ${T.awardCat}`]], x0 = 400, bw = W - 2 * x0 + 120, step = tR / BAR > 1.5 ? B : B * 0.5;
          box(x0 - 60, 230, bw, 640, beat(lt, 0, 0.15));
          mono(UI.results, x0, 302, { size: 36, weight: 700, color: ST.acc, alpha: beat(lt, 0, 0.15) }); mono(NAME, x0 + bw - 120, 302, { align: 'right', color: ST.soft, alpha: beat(lt, 0, 0.15) });
          rows.forEach(([v, l], i) => {
            const p = eOut(seg(lt, step * (0.5 + i), step * (0.5 + i) + 0.18)), y = 426 + i * 124;
            g.fillStyle = rgba(BR.cream, 0.22 * p); g.fillRect(sn(x0), sn(y - 96), sn((bw - 120) * p), u);
            if (v === 'Gold') text(v, x0 - 4, y, { size: 96 * 1.14, weight: 400, fam: SER, italic: true, color: ST.acc, alpha: p }); else text(v, x0, y, { size: 96, weight: 800, color: i === 0 ? ST.acc : ST.ink, alpha: p, ls: -3 });
            text(l, x0 + 330, y - 8, { size: fit(l, bw - 120 - 330, 42, 500), weight: 500, color: ST.soft, alpha: p });
          });
          return;
        }
        const t2 = lt - tR, cy = 400, m = 120;
        lockup(cx, cy, m, BR.cream, { pm: seg(t2, 0.04, 0.4), pw: seg(t2, B, B + 0.4) });
        drawLine([...tokens(CLAIM[0], { weight: 700 }), ...tokens(CLAIM[1], { serif: true, color: ST.acc })], cx, cy + 200, 76, seg(t2, 2 * B, 2 * B + 0.3), { style: 'mask', color: ST.ink, align: 'center', weight: 700 });
        text(T.outroSub.join(' '), cx, cy + 268, { size: 38, weight: 500, align: 'center', color: ST.soft, alpha: beat(t2, 3) });
        const ws = LINKS.map((s2) => monoW(s2)), gap = 66, tot = ws.reduce((s2, w) => s2 + w + gap, -gap), pl = beat(t2, 4); let px = cx - tot / 2;
        box(cx - tot / 2 - 36, 842, tot + 72, 62, pl);
        LINKS.forEach((s2, i) => { mono(s2, px, 884, { color: i === 0 ? ST.ink : ST.soft, alpha: pl }); px += ws[i] + gap; });
      },
    },

    /* ---------- übrige Kapitel: Liste oder Text über einem Test ---------- */
    /* Anfänge: die frühen Websites als Bildschirme */
    origin: {
      d3(lt, D) { X.test.screens.draw(lt, D, { images: originSeq, row: true }); },
      hud(lt, D) {
        const x = 138; box(96, 228, 1420, 226, beat(lt, 0));
        mono(T.originKicker, x, 290, { color: ST.acc, alpha: beat(lt, 0) });
        T.originTitle.forEach((ln, k) => text(ln, x, 358 + k * 62, { size: fit(ln, 1330, 52, 700), weight: 700, color: k ? ST.acc : ST.ink, alpha: beat(lt, 1 + k) }));
        if (originSeq.length) { const it = originSeq[X.test.screens.index(lt, D, originSeq.length)].it; box(96, 760, 900, 158, beat(lt, 2)); mono(`${it.y} · ${it[LANG][1]}`, x, 820, { color: ST.acc, alpha: beat(lt, 2) }); text(it[LANG][0], x, 886, { size: fit(it[LANG][0], 810, 54, 800), weight: 800, color: ST.ink, alpha: beat(lt, 2) }); }
      },
    },
    /* Schwerpunkte: drei Spalten über dem Tunnel */
    focus: {
      d3(lt, D) { X.test.tunnel.draw(lt, D, { speed: 8 }); },
      hud(lt) {
        const x = 138; box(96, 228, W - 192, 690, beat(lt, 0));
        mono(T.focusKicker, x, 292, { color: ST.acc, alpha: beat(lt, 0) });
        pair(T.focusTitle[0], T.focusTitle[1], x, 392, 1500, 84, lt);
        FOCUS_AREAS.forEach((f, i) => { const p = beat(lt, 3 + i * 2), cx = x + i * 560, tx = f[LANG]; mono(f.icon, cx, 500, { size: 44, weight: 700, color: ST.acc, alpha: p }); text(tx[0], cx, 574, { size: fit(tx[0], 500, 44, 800), weight: 800, color: ST.ink, alpha: p }); wrapLines(tx[1], 500, 31, 500).forEach((ln, k) => text(ln, cx, 634 + k * 46, { size: 31, weight: 500, color: ST.soft, alpha: p })); });
      },
    },
    /* Projekte: Werkliste in zwei Spalten über der Mondlandschaft */
    works: {
      d3(lt, D) { X.test.moon.draw(lt, D, { pos: 16 * lt }); },
      hud(lt, D) {
        const x = 138, cw = 800; box(96, 220, W - 192, 706, beat(lt, 0));
        mono(T.worksKicker, x, 280, { color: ST.acc, alpha: beat(lt, 0) });
        pair(T.worksTitle[0], T.worksTitle[1], x, 356, 1560, 62, lt);
        [WORKS.frei, WORKS.beruf].forEach((col, c) => {
          const cx = x + c * (cw + 44), t0 = c ? Math.min(D * 0.4, 4 * BAR) : BAR;
          mono(T.worksCols[c], cx, 428, { color: ST.acc, alpha: eOut(seg(lt, t0 - 0.3, t0)) });
          col.forEach((r, i) => { const p = eOut(seg(lt, t0 + i * B * 0.5, t0 + i * B * 0.5 + 0.2)), y = 480 + i * 50, nm = LANG === 'en' ? r[4] : r[3], ty = LANG === 'en' ? r[6] : r[5]; mono(r[0], cx, y, { color: ST.soft, alpha: p, size: 27, track: 0.02 }); const ns = fitm(nm, 330, 31, 25, 700), nw = measure(nm, ns, 700), tw = cw - 138 - nw - 16; text(nm, cx + 138, y, { size: ns, weight: 700, color: ST.ink, alpha: p }); clipX(cx, cw, () => text(ty, cx + 138 + nw + 16, y, { size: fitm(ty, tw, 28, 23), weight: 500, color: ST.soft, alpha: p })); });
        });
      },
    },
    /* Labs in Zahlen: Kennzahlen und alle 21 Projekte */
    labsAll: {
      d3(lt, D) { X.test.galaxy.draw(lt, D, { dist: 36 }); },
      hud(lt) {
        const x = 138; box(96, 220, W - 192, 706, beat(lt, 0));
        mono(T.labsAllKicker, x, 280, { color: ST.acc, alpha: beat(lt, 0) });
        pair(T.labsAllTitle[0], T.labsAllTitle[1], x, 356, 760, 62, lt);
        LAB_STATS.forEach((v, i) => { const p = beat(lt, 2 + i), sx = 960 + i * 212; text(v, sx, 338, { size: fit(v, 190, 62, 800), weight: 800, color: ST.acc, alpha: p, ls: -1.5 }); mono(T.labStatLabels[i], sx, 380, { size: fit(T.labStatLabels[i].toUpperCase(), 196, 24, 500, MONO, 0.08), color: ST.soft, alpha: p }); });
        LABS_ALL.forEach((r, i) => { const c = Math.floor(i / 7), p = beat(lt, 6 + i * 0.5), cx = x + c * 560, y = 462 + (i % 7) * 66, ty = LANG === 'en' ? r[4] : r[3]; text(r[2], cx, y, { size: fitm(r[2], 520, 31, 26, 700), weight: 700, color: ST.ink, alpha: p }); clipX(cx, 530, () => text(ty, cx, y + 29, { size: fitm(ty, 520, 25, 22), weight: 500, color: ST.soft, alpha: p })); });
      },
    },
    /* Hero-Animationen: Bildfolgen als hohe Bildschirme */
    hero: {
      d3(lt, D) { X.test.screens.draw(lt, D, { images: heroSeq, row: true }); },
      hud(lt, D) {
        const x = 138; box(96, 228, 1100, 168, beat(lt, 0));
        mono(T.heroKicker, x, 290, { color: ST.acc, alpha: beat(lt, 0) });
        pair(T.heroTitle[0], T.heroTitle[1], x, 362, 1010, 60, lt);
        if (heroSeq.length) { const h = heroSeq[X.test.screens.index(lt, D, heroSeq.length)].it, nm = LANG === 'en' && h[2] ? h[2] : h[1]; box(96, 800, measure(nm, 54, 800) + 84, 118, beat(lt, 2)); text(nm, x, 880, { size: 54, weight: 800, color: ST.ink, alpha: beat(lt, 2) }); }
      },
    },
    /* Zitat aus den Labs */
    quote: {
      d3(lt, D, s) { const t0 = lt + (s.id === 'quote2' ? 30 : 0); back(t0, D, { x: ['galaxy', { dist: 40 }], '01': 'pool', '03': 'orrery', '05': s.id === 'quote2' ? 'pool' : 'orrery' }); },
      hud(lt, D, s) {
        const q = QUOTES[(OPT[s.id] ?? {}).i ?? 0], cx = W / 2, size = 72 * 1.14, str = LANG === 'en' ? `“${q.en}”` : `„${q.de}“`;
        const lines = wrapLines(str, 1300, size, 400, SER), lh = size * 1.16, hh = lines.length * lh + 210, y0 = 540 - hh / 2;
        box(cx - 730, y0, 1460, hh, beat(lt, 0));
        mono(T.quoteKicker, cx, y0 + 66, { color: ST.acc, align: 'center', alpha: beat(lt, 0) });
        lines.forEach((ln, k) => text(ln, cx, y0 + 152 + k * lh, { size, weight: 400, fam: SER, italic: true, align: 'center', color: ST.ink, alpha: beat(lt, 1 + k * 2, 0.4) }));
        mono(`— ${LANG === 'en' ? q.byEn ?? q.by : q.by}`, cx, y0 + hh - 44, { color: ST.acc, align: 'center', alpha: beat(lt, 1 + lines.length * 2) });
      },
    },
    /* Produktfamilie: fünf Glaskugeln, jede unter ihrem Licht; darunter flach die Kacheln der Marke */
    family: {
      d3(lt, D) { X.test.hall.draw(lt, D, { row: true, colors: [X.C.orange, X.C.flow, X.C.nova, X.C.buddy, X.C.ivy] }); },
      hud(lt) {
        mono(T.familyKicker, W / 2, 300, { color: ST.acc, align: 'center', alpha: beat(lt, 0) });
        const items = [{ key: 'ld', name: 'loona! designs', tag: LANG === 'en' ? 'platform' : 'plattform' }, ...FAMILY], sz = 132;
        items.forEach((it, i) => {
          const px = W / 2 + (i - 2) * 318, cy = 742, a = beat(lt, i);
          if (it.key === 'ld') zeichenTile(px, cy, sz, { alpha: a, edge: 'rgba(255,255,255,0.18)' }); else familyTile(px, cy, sz, it.key, a);
          if (it.key === 'ld') { g.save(); g.globalAlpha = a; wordmark(px - wordmarkWidth(34) / 2, cy + sz / 2 + 58, 34, BR.cream); g.restore(); } else text(it.name, px, cy + sz / 2 + 58, { size: 36, weight: 700, align: 'center', color: ST.ink, alpha: a });
          mono(it.tag, px, cy + sz / 2 + 104, { size: 26, color: ST.soft, align: 'center', alpha: a });
        });
      },
    },
    /* Zertifikate: alle zehn als Liste */
    certs: {
      d3(lt, D) { X.test.galaxy.draw(lt + 60, D, { dist: 34, side: -6 }); },
      hud(lt) {
        const x = 138, lx = 560, lw = W - 138 - lx, rh = 64, y0 = 262; box(96, 220, W - 192, 706, beat(lt, 0));
        mono(T.certsKicker, x, 290, { color: ST.acc, alpha: beat(lt, 0) });
        text(T.certsTitle[0], x - 10, 610, { size: 300, weight: 800, color: glassFill(390, 620), alpha: beat(lt, 1), ls: -14 });
        text(T.certsTitle[1], x, 700, { size: 62, weight: 400, fam: SER, italic: true, color: ST.ink, alpha: beat(lt, 2) });
        CERTS.forEach((c, i) => {
          const a = beat(lt, 1 + i * 0.5), y = y0 + i * rh, by = LANG === 'en' && c.byEn ? c.byEn : c.by, bw = measure(by, 28, 500) + 20;
          g.fillStyle = rgba(BR.cream, 0.2 * a); g.fillRect(sn(lx), sn(y), sn(lw * a), u);
          mono(c.d, lx, y + 43, { size: 26, color: ST.acc, alpha: a });
          text(c[LANG], lx + 160, y + 44, { size: fit(c[LANG], lw - 170 - bw, 31, 700), weight: 700, color: ST.ink, alpha: a });
          text(by, lx + lw, y + 44, { size: 28, weight: 500, color: ST.soft, alpha: a, align: 'right' });
        });
      },
    },
  };
  SC.quote2 = SC.quote;

  /* ---------- ein Bild ---------- */
  function render(t) {
    const s = CUR ?? sceneAt(t), lt = clamp(t - s.t0, 0, s.D), D = s.D, intro = s.id === 'logo' && !!TH.intro, sc = intro ? INTRO : SC[s.id] ?? SC.claim;
    X.begin(); sc.d3(lt, D, s); const tris = X.stats.tris;
    drawHud(() => { sc.hud(lt, D, s); chrome(t, s, tris, sc.chrome ? sc.chrome(lt, D) : 1); });
    /* Wechsel der Tests als harter Schnitt durchs Schwarz; Auf- und Abblende des Films wie in finish() */
    let k = 0; if (s.i > 0) k = Math.max(k, 1 - seg(lt, 0, 0.18)); if (s.i < SCENES.length - 1) k = Math.max(k, seg(lt, D - 0.1, D));
    k = Math.max(k, 1 - eOut(seg(t, 0, 0.25)), eIn(seg(t, DUR - 0.5, DUR - 0.05)));
    const fl = sc.flash ? sc.flash(lt, D) : 0, po = sc.post ? sc.post(lt, D) : {}, zoom = sc.zoom ? sc.zoom(lt, D) : 1;
    /* das Abtauchen des Intros trifft nur die Szene, nicht das Zeichen darüber: als dunkler Lichtblitz */
    const dip = sc.dip ? sc.dip(lt, D) : 0;
    X.end({ hud, flash: dip > fl ? [0, 0, 0, dip] : [0.965, 0.945, 0.91, fl], fade: [0, 0, 0, k], bloom: po.bloom, expo: po.expo });
    g.imageSmoothingEnabled = !!LK.soft;
    if (zoom > 1.0005) { const sw = PW / zoom, sh = PH / zoom; g.drawImage(X.canvas, (PW - sw) / 2, (PH - sh) / 2, sw, sh, 0, 0, W, H); } else g.drawImage(X.canvas, 0, 0, W, H);
    /* Intro: Balken oben und unten (Kinoformat) */
    if (sc.bars) { const hb = sc.bars(lt, D); g.fillStyle = '#000'; g.fillRect(0, 0, W, hb); g.fillRect(0, H - hb, W, hb); }
  }
  RETRO.gl = { init, render };
})();
