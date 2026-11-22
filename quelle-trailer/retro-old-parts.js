/* Trailer — Retro-Look „Demo 90“: die Parts (ein Part je Szene) und der Bildaufbau.
   Inhalte und Wortlaute kommen wie in den anderen Stimmungen aus data.js (T, JOURNEY, LABS …) — nur eben als Parts einer Demo gesetzt:
   Text im Pixel-Font, Effekte im 320×180-Raster, Übergänge über die Palette (Blitz auf Weiß, Blende nach Schwarz, Blockauflösung).
   Jeder Part ist fn(lt, D, o, t): lokale Zeit, Dauer, Optionen der Szene (OPT) und die Zeit des ganzen Trailers; er darf einen
   zusätzlichen Blitz 0…1 zurückgeben. Bewegungen und Einsätze liegen auf dem Schlag (B) bzw. dem Takt (BAR).
   Marke: Das Zeichen steht frontal und unverzerrt im Raster, bekommt keinen Schatten und blitzt nicht mit; die Wortmarke ist einfarbig;
   hinter Auftakt, Produktfamilie und Schluss bleibt der Grund ruhig. Die Farben der Produktfamilie kommen nur als Lichter vor
   (Kupferbalken, Vektorbälle) und auf ihren eigenen Kacheln.
   Nicht gezeigt wird das Telefon der Plattform-Szene: 390 Punkte Seitenbreite lassen sich in diesem Raster nicht lesbar abbilden. */
'use strict';
(() => {
  const { FW, FH, fb, C, FONT: F, setc, ramp, rect, pset, frame, blit, tw, text, wrap, fitFont, stamp, sprite, pic, usePal, PARTS } = OS;
  const UC = new Map(), U = (s) => { let v = UC.get(s); if (v === undefined) { v = OS.up(s); UC.set(s, v); } return v; };
  const SH = C.SHADE; // Schattenfarbe unter Text
  /* Schriftverläufe über die Glyphenhöhe: Silber (128–135) und Gold (136–143), dazu die Kantenfarben */
  const SIL = (h) => Array.from({ length: h }, (_, k) => 128 + (((k * 8) / h) | 0)), GLD = (h) => Array.from({ length: h }, (_, k) => 136 + (((k * 8) / h) | 0));
  const BSIL = [C.WHITE, 135], BGLD = [136, 143];
  /* Takt */
  const onBeat = (lt, i, d = 0.1) => seg(lt, i * B, i * B + d);
  const bp = (t, k = 5) => Math.exp(-(((t % B) + B) % B) * k);
  /* Verläufe für Kupferbalken und Bälle in den Lichtfarben der Produktfamilie: 96–127 (je 8 Stufen: Flow, Nova, Buddy, Ivy) */
  const LIGHTS = [BR.flow, BR.nova, BR.buddy, BR.ivy];
  const lightRamps = () => LIGHTS.forEach((c, k) => ramp(96 + k * 8, 8, ['#06040E', c]));
  /* Verlauf auf den Schlag aufhellen (Palette): k = Anteil zum Weiß hin */
  const pulse = (i0, n, k) => { if (k <= 0.01) return; for (let i = i0; i < i0 + n; i++) { const c = OS.getc(i); setc(i, [c[0] + (255 - c[0]) * k, c[1] + (255 - c[1]) * k, c[2] + (255 - c[2]) * k]); } };
  /* Schreibmaschine: Zeichen je Sekunde ab Zeitpunkt t0 */
  const typed = (str, lt, t0, cps = 60) => clamp(Math.floor((lt - t0) * cps), 0, str.length);
  /* Kopfzeile eines Parts: Kicker in Orange (Schreibmaschine) */
  const kicker = (str, x, y, lt, o = {}) => text(U(str), x, y, F.s, C.ORANGE, { shadow: SH, n: typed(U(str), lt, 0, 90), ...o });
  /* dunkler Kasten über einem Effekt: die Farben 32–95 werden auf ihre dunkle Kopie 160–223 umgelegt (Palettentrick statt Transparenz) */
  function shadeBox(x, y, w, h) { const x0 = Math.max(0, x | 0), x1 = Math.min(FW, (x + w) | 0), y0 = Math.max(0, y | 0), y1 = Math.min(FH, (y + h) | 0); for (let yy = y0; yy < y1; yy++) for (let i = yy * FW + x0; i < yy * FW + x1; i++) { const v = fb[i]; if (v >= 32 && v < 96) fb[i] = v + 128; } }
  const darkCopy = (k = 0.32) => { for (let i = 32; i < 96; i++) { const c = OS.getc(i); setc(i + 128, [c[0] * k, c[1] * k, c[2] * k]); } };
  /* Aufzählungszeichen in Slash-Form (Steigung wie der Slash der Marke, nur als Pixelstrich) */
  function slashDot(x, y, c = C.ORANGE) { for (let k = 0; k < 6; k++) { pset(x + (k >> 1), y + k, c); pset(x + (k >> 1) + 1, y + k, c); } }
  /* Rahmenlinien oben und unten (Kupferlinie aus dem Orange-Verlauf) */
  function rails(y0 = 0, y1 = FH - 1, t = 0) { for (let x = 0; x < FW; x++) { const c = C.OR + 2 + Math.round(2.5 + 2.5 * Math.sin(x * 0.05 + t * 3)); fb[y0 * FW + x] = c; fb[y1 * FW + x] = c; } }
  /* Zeichen (Primärzeichen) ins Raster: Mitte (cx, cy), Höhe h in Punkten; p < 1: Reveal der Marke */
  function mark(cx, cy, h, p = 1, alpha = 1) { const w = (h * 28) / 24; stamp(() => { if (p >= 1) zeichen(cx, cy, h, '#fff'); else zeichenReveal(cx, cy, h, p, '#fff'); }, cx - w / 2 - 16, cy - h / 2 - 14, w + 32, h + 28, C.OR, 8, alpha); }
  /* Lockup im Raster: Zeichenhöhe m, mittig um (cx, cy). pm = Reveal des Zeichens, pw = der Wortmarke. Maße wie lockup() in core.js. */
  function lockupPx(cx, cy, m, pm = 1, pw = 1) {
    const size = 0.9275 * m, gap = 0.46 * m, mw = (m * 28) / 24, ww = wordmarkWidth(size), x0 = Math.round(cx - (mw + gap + ww) / 2);
    mark(x0 + mw / 2, cy, m, pm);
    if (pw > 0) stamp(() => wordmark(x0 + mw + gap, cy + size * 0.345, size, '#fff', { p: pw }), x0 + mw + gap - 3, cy - size, ww + 8, size * 1.7, C.CR, 8);
    return { x0, w: mw + gap + ww };
  }

  /* ================= Auftakt ================= */
  /* „Entpacken“: ein Schlag lang flackern Streifen wie beim Laden einer Demo — hier in gedeckten Tönen der Marke */
  function decrunch(t) {
    const f = Math.floor(t * 30), cols = [C.NIGHT, C.INK, C.NIGHT2, C.OR, C.OR + 1, C.BLK, C.CR, C.OR + 2];
    for (let y = 0; y < FH;) { const hgt = 1 + Math.floor(hash(f * 13.7 + y * 3.1) * 6), c = cols[Math.floor(hash(f * 7.9 + y * 1.3) * cols.length)]; rect(0, y, FW, hgt, c); y += hgt; }
  }
  PARTS.logo = (lt, D, o, t) => {
    lightRamps();
    if (lt < B) { decrunch(t); return 0; }
    const tL = logoLock(D), cx = 160, cy = 76, m = 36, pl = E_REVEAL(seg(lt, tL, tL + 0.5)), locked = lt >= tL;
    /* Sternenflug, um das Zeichen bleibt es frei; nach dem Einrasten wird er ruhig */
    OS.stars(t, locked ? 0.06 : 0.3, 170, locked ? [8, 44, 304, 96] : [cx - 60, cy - 46, 120, 92]);
    /* Kupferbalken oben und unten, sie pendeln im Takt */
    const sw = locked ? 0.35 : 1;
    [[C.OR, 0], [96, 1.3], [104, 2.6]].forEach(([i0, ph], k) => { const dy = Math.sin((t / (2 * B)) * Math.PI + ph) * 7 * sw; /* eine Schwingung je Takt */ OS.copper(14 + k * 2 + dy, 9, i0); OS.copper(FH - 15 - k * 2 - dy, 9, i0); });
    const size = 0.9275 * m, mw = (m * 28) / 24, total = mw + 0.46 * m + wordmarkWidth(size), x0 = Math.round(cx - total / 2);
    const zx = Math.round(lerp(cx, x0 + mw / 2, pl)), zh = Math.round(lerp(72, m, pl));
    if (!locked && lt < tL - 0.12) {
      /* Sweep der Marke (Lade-Animation), je zwei Schläge ein Durchlauf */
      const loop = ((lt - B) % (2 * B)) / (2 * B); stamp(() => zeichenSweep(cx, cy, 72, loop, '#fff'), cx - 44, cy - 38, 88, 76, C.OR, 8);
    } else mark(zx, cy, zh);
    if (pl > 0) {
      const edge = zx + (zh * 28) / 48 + 0.2 * m, pw = seg(pl, 0.25, 1);
      if (pw > 0) stamp(() => wordmark(x0 + mw + 0.46 * m, cy + size * 0.345, size, '#fff', { p: pw }), edge, cy - size, FW - edge - 4, size * 1.7, C.CR, 8);
      const t1 = tL + 0.5, n1 = U(NAME), n2 = U(ROLE), n3 = U(FOCUS.join(' · '));
      text(n1, cx, cy + 34, F.sb, C.CREAM, { align: 'c', n: typed(n1, lt, t1, 50) });
      text(n2, cx, cy + 46, F.s, C.SOFT, { align: 'c', n: typed(n2, lt, t1 + 0.25, 80) });
      text(n3, cx, cy + 57, F.s, C.ORANGE, { align: 'c', n: typed(n3, lt, t1 + 0.6, 80) });
    }
    /* Blitz beim Einrasten: hinter dem Zeichen — sein Orange-Verlauf blitzt nicht mit */
    OS.noFlash = [C.OR, C.ORANGE];
    return locked ? Math.exp(-(lt - tL) * 9) * 0.7 : 0;
  };

  /* ================= Anspruch ================= */
  const SCR = () => U(T.scroller);
  function scroller(t, yc, o = {}) { OS.sineScroll(SCR(), t, yc, F.mb, GLD(14), { amp: o.amp ?? 4, shadow: SH, speed: 84 }); }
  PARTS.claim = (lt, D, o, t) => {
    /* Plasma in 40 Farbstufen (144–183) — die Stufen sollen als Bänder sichtbar sein —, oben und unten ein schwarzer Rand mit Kupferlinie */
    ramp(144, 40, [BR.night, '#2A1C5E', '#6B2A68', '#9A4410', '#3A1F5C', BR.night]);
    pulse(144, 40, 0.16 * bp(t)); OS.plasma(t, 144, 40, 12, 168); rails(12, 167, t);
    kicker(T.claimKicker, 160, 22, lt, { align: 'c' });
    const w1 = CLAIM[0].split(' '), w2 = CLAIM[1].split(' '); let k = 0;
    const lineOf = (words, y, f, col, bev) => { const full = U(words.join(' ')), x0 = Math.round(160 - tw(full, f) / 2); let x = x0; words.forEach((w) => { const s = U(w), q = onBeat(lt, k++, 0.12); if (q > 0) text(s, x, y - Math.round((1 - eOut5(q)) * 10), f, col, { shadow: SH, bevel: bev }); x += (s.length + 1) * f.adv; }); };
    lineOf(w1, 42, F.l, SIL(28), BSIL);
    lineOf(w2, 78, F.lb, GLD(28), BGLD);
    const ps = onBeat(lt, 6, 0.25);
    if (ps > 0) { const s = U(T.claimSub.join(' ')), w = tw(s, F.sb) + 12, ww = Math.round(w * E_WIPE(ps)); rect(160 - w / 2, 116, ww, 13, C.CREAM); text(s, 160 - w / 2 + 6, 119, F.sb, C.INK, { n: Math.floor((ww - 6) / F.sb.adv) }); }
    scroller(t, 152);
    return 0;
  };

  /* ================= Person ================= */
  PARTS.person = (lt, D, o, t) => {
    OS.stars(t, 0.1, 120);
    OS.solid(t * 0.9, 270, 44, 28 + 3 * bp(t), C.CR, C.OR, 8);
    kicker(T.personKicker, 10, 8, lt);
    const nm = U(NAME); text(nm, 10, 20, F.mb, SIL(14), { shadow: SH, n: typed(nm, lt, 0.1, 40) });
    const rl = U(ROLE); text(rl, 10, 40, F.s, C.SOFT, { n: typed(rl, lt, 0.4, 90) });
    /* Schwerpunkte und Ort als Kästchen */
    let px = 10; FOCUS.concat([T.place]).forEach((w, i) => { const s = U(w), q = onBeat(lt, 1 + i * 0.5); if (q <= 0) return; const ww = tw(s, F.s) + 8; frame(px, 51, ww, 11, i === 3 ? C.ORANGE : C.DIM); text(s, px + 4, 53, F.s, i === 3 ? C.ORANGE : C.CREAM); px += ww + 4; });
    /* wechselnde Rolle (wie auf der Startseite), alle zwei Schläge */
    if (lt > BAR) { const ri = Math.floor((lt - BAR) / (2 * B)), s = U('→ ' + T.roles[ri % T.roles.length]); text(s, 10, 68, F.s, C.ORANGE, { n: typed(s, (lt - BAR) % (2 * B), 0, 70) }); }
    /* Kennzahlen: je Schlag eine */
    const xs = [10, 92, 170];
    T.stats.forEach(([a, b], i) => { const q = onBeat(lt, 2 + i, 0.12); if (q <= 0) return; const s = U(a); text(s, xs[i], 84 - Math.round((1 - eOut5(q)) * 8), F.l, i === 0 ? GLD(28) : SIL(28), { shadow: SH, bevel: i === 0 ? BGLD : BSIL }); text(U(b), xs[i] + 1, 116, F.s, C.SOFT); });
    /* Sekundenzähler */
    const pc = seg(lt, 1.5 * B, 1.5 * B + 0.8), val = SEC0 - (1 - eOut5(pc)) * 9.5e5 + Math.floor(lt);
    if (pc > 0) { text(U(fmtInt(val, LANG)), 10, 132, F.mb, SIL(14), { shadow: SH }); wrap(U(T.secLabel), 50).forEach((ln, i) => text(ln, 10, 151 + i * 9, F.s, C.MUTE, { n: typed(ln, lt, 2 * B + i * 0.4, 80) })); }
    return 0;
  };

  /* ================= Stack ================= */
  PARTS.stack = (lt, D, o, t) => {
    ramp(32, 16, [[0, '#04060F'], [0.25, '#0B1026'], [0.6, '#1B1E4A'], [1, '#3A2468']]);
    OS.roto(t, 32, 0, FH, bp(t, 6));
    kicker(T.stackKicker, 10, 8, lt);
    text(U(T.stackTitle[0]), 10, 19, F.s, C.SOFT, { shadow: SH });
    const tt = U(T.stackTitle[1]); text(tt, 10, 29, fitFont(tt, 300, [F.sb, F.s]), C.CREAM, { shadow: SH, n: typed(tt, lt, 0.2, 70) });
    /* drei Laufbänder auf der Sinuswelle, abwechselnd nach links und rechts; die Fokus-Technologien hell, der Rest zurückgenommen */
    STACK_ROWS.forEach((row, r) => {
      const q = onBeat(lt, 1 + r, 0.2); if (q <= 0) return;
      const f = F.mb, items = row.map((w) => U(w)), sep = 3 * f.adv, widths = items.map((s) => s.length * f.adv), total = widths.reduce((a, w) => a + w + sep, 0);
      let x = -((((lt * 62 * (r % 2 ? -1 : 1) + r * 90) % total) + total) % total), yc = 56 + r * 36;
      for (let rep = 0; rep < 3 && x < FW; rep++) items.forEach((s, i) => {
        if (x + widths[i] > 0 && x < FW) { const foc = STACK_FOCUS.includes(row[i]); text(s, x, yc, f, foc ? SIL(14) : C.DIM, { shadow: SH, wave: (ci) => Math.sin((x + ci * f.adv) * 0.035 + t * 3 + r) * 5 }); slashDot(Math.round(x + widths[i] + f.adv), yc + 4 + Math.round(Math.sin((x + widths[i] + f.adv) * 0.035 + t * 3 + r) * 5)); }
        x += widths[i] + sep;
      });
    });
    const pn = onBeat(lt, 5, 0.2); if (pn > 0) wrap(U(T.stackNext + ' — ' + STACK_NEXT.join(' · ')), 50).forEach((ln, i) => text(ln, 160, 160 + i * 9, F.s, C.SOFT, { align: 'c', shadow: SH }));
    return 0;
  };

  /* ================= Reise ================= */
  PARTS.journey = (lt, D, o, t) => {
    const list = journeyPick(o.n), n = list.length;
    const durs = (o.bars ?? list.map(() => D / n / BAR)).map((b) => b * BAR), t0s = durs.map((_, k) => durs.slice(0, k).reduce((a, b) => a + b, 0));
    let i = 0; for (let k = 0; k < n; k++) if (lt >= t0s[k]) i = k;
    const q = lt - t0s[i], it = list[i], tx = it[LANG];
    /* Tunnel: vier Tiefenstufen × 16 Farben; die Textfläche liegt in einem abgedunkelten Kasten */
    for (let s = 0; s < 4; s++) { const k = 0.3 + s * 0.22; ramp(32 + s * 16, 16, [[0, [8 * k, 10 * k, 30 * k]], [0.45, [40 * k, 34 * k, 110 * k]], [0.8, [120 * k, 60 * k, 130 * k]], [1, [255 * k, 130 * k, 40 * k]]]); }
    pulse(32, 64, 0.1 * bp(t)); darkCopy(0.3); OS.tunnel(t, 32);
    const yT = o.steps ? 52 : 84;
    /* ohne Kurztext bleibt der Tunnel zwischen Titel und Zeitstrahl offen */
    if (o.blurb || o.steps) shadeBox(0, yT - 6, FW, 186 - yT); else { shadeBox(0, yT - 6, FW, 40); shadeBox(0, 156, FW, 24); }
    kicker(T.journeyKicker, 12, 8, lt);
    text(`${String(i + 1).padStart(2, '0')} / ${String(n).padStart(2, '0')}`, 308, 8, F.s, C.SOFT, { align: 'r', shadow: SH });
    /* Jahr groß — fällt auf die Eins */
    const a = seg(q, 0, 0.16), fy = o.steps ? F.lb : F.xl, yy = o.steps ? 20 : 22;
    text(it.y, 12, yy - Math.round((1 - eOut5(a)) * 12), fy, GLD(fy.h), { shadow: SH, bevel: BGLD });
    const ttl = U(tx[0]), ft = fitFont(ttl, 300, [F.mb, F.m, F.sb]); text(ttl, 12, yT, ft, C.CREAM, { shadow: SH, n: typed(ttl, q, 0.05, 70) });
    let y = yT + ft.h + 4;
    wrap(U(`${tx[1]} · ${tx[2]}`), 50).forEach((ln) => { text(ln, 12, y, F.s, C.ORANGE, { shadow: SH, n: typed(ln, q, 0.25, 90) }); y += 9; });
    y += 3;
    if (o.blurb) wrap(U(tx[3]), 50).forEach((ln, k) => { text(ln, 12, y, F.s, C.SOFT, { n: typed(ln, q, 0.45 + k * 0.35, 110) }); y += 9; });
    if (o.steps && it.st) { y += 3; it.st[LANG].forEach((str, k) => { const t1 = BAR + k * 2 * B; if (q < t1) return; slashDot(12, y, C.ORANGE); wrap(U(str), 48).forEach((ln, j) => { text(ln, 22, y, F.s, C.CREAM, { n: typed(ln, q, t1 + j * 0.3, 110) }); y += 9; }); y += 1; }); }
    /* Zeitstrahl */
    const x1 = 16, x2 = 304, ry = 165, pos = (k) => Math.round(lerp(x1, x2, n === 1 ? 0 : k / (n - 1))), mk = Math.round(lerp(pos(Math.max(0, i - 1)), pos(i), i === 0 ? 1 : E_SWEEP(seg(q, 0, 0.25))));
    rect(x1, ry, x2 - x1, 1, C.DIM); rect(x1, ry, mk - x1, 1, C.ORANGE);
    list.forEach((s, k) => { const on = k <= i, px = pos(k); rect(px - 1, ry - 1, 3, 3, on ? C.ORANGE : C.DIM); text(s.y, px, ry + 5, F.s, k === i ? C.CREAM : C.DIM, { align: 'c' }); });
    const pr = Math.round(1 + bp(t)); rect(mk - pr - 1, ry - pr - 1, pr * 2 + 3, pr * 2 + 3, C.APR); rect(mk - 1, ry - 1, 3, 3, C.WHITE);
    return i > 0 ? Math.exp(-q * 12) * 0.5 : 0;
  };

  /* ================= Auszeichnung ================= */
  /* Strahlenkranz: Winkel je Punkt in 16 Stufen — die Palette läuft um, dadurch dreht er sich */
  const BAY = [0, 8, 2, 10, 12, 4, 14, 6, 3, 11, 1, 9, 15, 7, 13, 5];
  /* zum Rand hin löst sich der Kranz im Raster auf (geordnetes Dithering statt weicher Blende) */
  const RAYS = new Uint8Array(FW * FH); for (let y = 0; y < FH; y++) for (let x = 0; x < FW; x++) { const d = Math.hypot(x - 160, (y - 56) * 1.15) / 150; RAYS[y * FW + x] = d < 0.5 + 0.5 * ((BAY[(y & 3) * 4 + (x & 3)] + 0.5) / 16) ? ((Math.atan2(y - 56, x - 160) / 6.283185307 + 1) * 96) & 15 : 255; }
  PARTS.award = (lt, D, o, t) => {
    /* Grund: Tinte. Feuer 32–95, Strahlen 96–111 (umlaufend), Gold 112–127 (umlaufender Glanz); bei nur einem Takt läuft alles doppelt so schnell */
    setc(0, BR.ink); const kb = D < 2 * BAR - 0.01 ? 0.5 : 1;
    ramp(32, 64, [[0, BR.ink], [0.07, '#3A0A02'], [0.2, '#B4320A'], [0.4, BR.orange], [0.7, BR.apricot], [1, '#FFF3DC']]);
    for (let k = 0; k < 16; k++) { const p = ((k + t * 5) % 16) / 16, v = p < 0.5 ? 0.35 + 0.65 * Math.sin(p * 2 * Math.PI) ** 2 : 0.35; setc(96 + k, [23 + 40 * v, 19 + 16 * v, 16 + 2 * v]); }
    for (let k = 0; k < 16; k++) { const p = (((k / 16 - t * 0.55) % 1) + 1) % 1, gold = [[90, 52, 8], [255, 179, 102], [255, 240, 205], [255, 120, 22], [122, 58, 6], [90, 52, 8]], f = p * 5, a = gold[Math.floor(f)], b = gold[Math.min(5, Math.floor(f) + 1)], qq = f - Math.floor(f); setc(112 + k, [lerp(a[0], b[0], qq), lerp(a[1], b[1], qq), lerp(a[2], b[2], qq)]); }
    for (let i = 0; i < FW * 124; i++) if (RAYS[i] !== 255) fb[i] = 96 + RAYS[i];
    OS.fire(t, 32, FH + 12);
    kicker(T.awardKicker, 160, 10, lt, { align: 'c' });
    const pg = onBeat(lt, kb, 0.14);
    if (pg > 0) text('GOLD', 160, 24 - Math.round((1 - eOut5(pg)) * 14), F.xl, Array.from({ length: 56 }, (_, k) => 112 + (((k * 16) / 56) | 0)), { align: 'c', shadow: SH, bevel: [C.WHITE, C.OR + 2] });
    const s1 = U(T.awardTop), p2 = onBeat(lt, 2 * kb, 0.15); if (p2 > 0) text(s1, 160, 86, F.m, SIL(14), { align: 'c', shadow: SH, n: typed(s1, lt, 2 * kb * B, 60 / kb) });
    const p3 = onBeat(lt, 3 * kb, 0.2); if (p3 > 0) { text(U(T.awardCat), 160, 105, F.s, C.CREAM, { align: 'c', shadow: SH }); text(U(T.awardWhat), 160, 115, F.s, C.CREAM, { align: 'c', shadow: SH }); }
    const p4 = onBeat(lt, 4.5 * kb, 0.2); if (p4 > 0) { const s = U(T.awardNote); text(s, 160, 127, F.s, C.APR, { align: 'c', shadow: SH, n: typed(s, lt, 4.5 * kb * B, 90 / kb) }); }
    return lt >= kb * B ? Math.exp(-(lt - kb * B) * 9) * 0.6 : 0;
  };

  /* ================= Bildfolgen: Labs, Anfänge, Hero-Animationen ================= */
  /* Links die Liste, rechts ein Bild in eigener 112-Farben-Palette (168 × 94, o.pw/o.ph für ein kleineres), darunter optional ein Text.
     items: [{ name, sub, shots: [Schlüssel in IMG], credit }]; act = aktiver Eintrag, shot = Bild des aktiven Eintrags */
  function show(items, act, shot, lt, o = {}) {
    const PW = o.pw ?? 168, PH = o.ph ?? 94, PX = 312 - PW, PY = o.py ?? 40;
    const it = items[act], p = pic(it.shots[shot % it.shots.length], PW, PH);
    usePal(p);
    frame(PX - 2, PY - 2, PW + 4, PH + 4, C.ORANGE); frame(PX - 1, PY - 1, PW + 2, PH + 2, C.BLK);
    if (p) blit(p.idx, PW, PH, PX, PY); else rect(PX, PY, PW, PH, C.NIGHT2);
    const pitch = o.pitch ?? Math.min(26, Math.floor(100 / items.length)), y0 = o.y0 ?? PY;
    items.forEach((x, i) => {
      const on = i === act, y = y0 + i * pitch, q = o.rowIn ? o.rowIn(i) : 1; if (q <= 0) return;
      if (on) { rect(4, y - 2, PX - 10, (x.sub ? 18 : 9) + 2, C.NIGHT2); rect(4, y - 2, 2, (x.sub ? 18 : 9) + 2, C.ORANGE); }
      if (x.sub) text(U(x.sub), 10, y, F.s, on ? C.ORANGE : C.DKOR);
      const nm = U(x.name); text(nm, 10, y + (x.sub ? 9 : 0), fitFont(nm, PX - 18, on ? [F.sb, F.s] : [F.s]), on ? C.CREAM : C.MUTE);
    });
    if (o.below) wrap(U(o.below), 50).forEach((ln, i) => text(ln, 10, PY + PH + 8 + i * 9, F.s, C.SOFT, { n: typed(ln, o.belowT ?? 9, i * 0.3, 140) }));
    if (it.credit) text(U(it.credit), 312, o.below ? 169 : PY + PH + 8, F.s, C.MUTE, { align: 'r' });
  }
  /* zwei Titelzeilen: erste Creme, zweite Orange */
  function title2(pair, x, y, lt, f = F.sb) { const a = U(pair[0]), b = U(pair[1]), fa = fitFont(a, 300, [f, F.s]); text(a, x, y, fa, C.CREAM, { n: typed(a, lt, 0.1, 70) }); text(b, x, y + fa.h + 3, fitFont(b, 300, [f, F.s]), C.ORANGE, { n: typed(b, lt, 0.45, 70) }); }
  PARTS.labs = (lt, D, o, t) => {
    OS.copper(3, 5, C.OR, 5);
    kicker(T.labsKicker, 10, 8, lt); title2(T.labsTitle, 10, 18, lt);
    const pc = onBeat(lt, 2, 0.14); if (pc > 0) { const s = String(LABS_COUNT); text(s, 312, 6 - Math.round((1 - eOut5(pc)) * 8), F.lb, GLD(28), { align: 'r', bevel: BGLD }); text(U(T.labsCount), 312 - tw(s, F.lb) - 4, 26, F.s, C.SOFT, { align: 'r' }); }
    const more = o.more, D1 = more ? D * 0.72 : D;
    if (!more || lt < D1) {
      const per = D1 / 3, act = clamp(Math.floor(lt / per), 0, 2), L = LABS[act], shot = Math.floor(Math.max(0, lt - act * per) / B);
      const items = LABS.map((x) => ({ name: x.name, sub: `${x[LANG][0]} · ${x.d}`, shots: x.shots, credit: x.credit ? T.osm : null }));
      show(items, act, shot, lt, { pitch: 30, y0: 46, below: o.desc ? L[LANG][1] : null, belowT: lt - act * per, pw: o.desc ? 168 : 192, ph: o.desc ? 94 : 108 });
      return act > 0 ? Math.exp(-(lt - act * per) * 12) * 0.4 : 0;
    }
    /* die übrigen Projekte: zwei Spalten, eins nach dem anderen */
    const q = lt - D1; text(U(T.labsMore), 10, 44, F.sb, C.ORANGE, { n: typed(U(T.labsMore), q, 0, 60) });
    LABS_MORE.forEach((str, k) => { const t1 = 0.15 + k * Math.min(0.08, (D - D1 - 0.8) / LABS_MORE.length); if (q < t1) return; const col = k % 2, row = k >> 1, x = 10 + col * 156, y = 58 + row * 12; slashDot(x, y); text(U(str), x + 8, y, F.s, C.CREAM, { n: typed(U(str), q, t1, 120) }); });
    return Math.exp(-q * 12) * 0.4;
  };
  PARTS.origin = (lt, D, o, t) => {
    OS.copper(3, 5, 96, 5); lightRamps();
    kicker(T.originKicker, 10, 8, lt); title2(T.originTitle, 10, 18, lt, F.s);
    const per = D / ORIGIN.length, act = clamp(Math.floor(lt / per), 0, ORIGIN.length - 1);
    show(ORIGIN.map((x) => ({ name: x[LANG][0], sub: `${x.y} · ${x[LANG][1]}`, shots: [x.img] })), act, 0, lt, { pitch: 21, y0: 44, pw: 136, ph: 102, py: 46 });
    return act > 0 ? Math.exp(-(lt - act * per) * 12) * 0.4 : 0;
  };
  PARTS.hero = (lt, D, o, t) => {
    OS.copper(3, 5, 104, 5); lightRamps();
    kicker(T.heroKicker, 10, 8, lt); title2(T.heroTitle, 10, 18, lt);
    const per = D / HERO.length, act = clamp(Math.floor(lt / per), 0, HERO.length - 1), fr = Math.floor(((lt - act * per) / per) * HERO_FRAMES);
    const items = HERO.map((h) => ({ name: LANG === 'en' && h[2] ? h[2] : h[1], shots: Array.from({ length: HERO_FRAMES }, (_, i) => `hero_${h[0]}_${i}`) }));
    show(items, act, clamp(fr, 0, HERO_FRAMES - 1), lt, { pitch: 9, y0: 44 });
    return 0;
  };

  /* ================= Plattform ================= */
  PARTS.site = (lt, D, o, t) => {
    OS.copper(3, 5, C.OR, 5);
    kicker(T.siteKicker, 10, 8, lt);
    const a = U(T.siteTitle[0]), b = U(T.siteTitle[1]); text(a, 10, 18, F.m, C.CREAM, { n: typed(a, lt, 0.05, 50) }); text(b, 10 + tw(a, F.m) + 12, 18, F.m, C.ORANGE, { n: typed(b, lt, 0.3, 50) });
    /* Merkmale links, je halbem Schlag eines */
    T.siteChips.forEach((c, i) => { const q = onBeat(lt, 1 + i * 0.5); if (q <= 0) return; const y = 44 + i * 12; slashDot(10, y, i === 0 ? C.ORANGE : C.DKOR); text(U(c), 18, y, F.s, i === 0 ? C.CREAM : C.SOFT); });
    /* Browserfenster: die Ansichten der neuen Website wechseln, jede fährt nach unten */
    const views = ['siteBeyond', 'siteHome', 'siteLabs', 'siteStory'].filter((k) => IMG[k]), bw = 170, bh = o.desc ? 88 : 100, bx = 142, by = 47;
    const per = Math.max(D / Math.min(views.length || 1, o.views ?? 4), 1.2), vi = Math.floor(lt / per) % Math.max(1, views.length), vp = (lt % per) / per, p = views.length ? pic(views[vi], bw, 0) : null;
    usePal(p);
    frame(bx - 2, by - 9, bw + 4, bh + 11, C.DIM); rect(bx - 1, by - 8, bw + 2, 8, C.NIGHT2); [C.SIG, C.APR, C.DIM].forEach((c, k) => rect(bx + 2 + k * 5, by - 6, 3, 3, c));
    text('LOONA-DESIGNS.DE', bx + bw / 2, by - 8, F.s, C.MUTE, { align: 'c' });
    if (p) blit(p.idx, p.w, p.h, bx, by, { sy: Math.round(eIO(vp) * 0.55 * Math.max(0, p.h - bh)), w: bw, h: bh }); else rect(bx, by, bw, bh, C.NIGHT2);
    if (o.desc) wrap(U(T.siteDesc), 50).forEach((ln, i) => text(ln, 10, 146 + i * 9, F.s, C.SOFT, { n: typed(ln, lt, B + i * 0.4, 120) }));
    else { OS.copper(155, 3, C.OR, 5); scroller(t, 166, { amp: 3 }); }
    return vi > 0 && lt > per ? Math.exp(-(lt % per) * 12) * 0.35 : 0;
  };

  /* ================= Textseiten: Schwerpunkte, Zitate ================= */
  PARTS.focus = (lt, D, o, t) => {
    ramp(32, 64, [BR.night, '#1E1A52', '#3D2466', '#141B3F', BR.night]); darkCopy(0.4);
    OS.plasma(t * 0.6, 32, 64, 0, FH); shadeBox(0, 36, FW, 108); rails(36, 143, t);
    kicker(T.focusKicker, 10, 8, lt); const tt = U(T.focusTitle.join(' ')); text(tt, 10, 18, F.m, C.CREAM, { shadow: SH, n: typed(tt, lt, 0.1, 50) });
    const per = D / FOCUS_AREAS.length, i = clamp(Math.floor(lt / per), 0, FOCUS_AREAS.length - 1), q = lt - i * per, fa = FOCUS_AREAS[i][LANG];
    text(`${String(i + 1).padStart(2, '0')} / ${String(FOCUS_AREAS.length).padStart(2, '0')}`, 308, 8, F.s, C.SOFT, { align: 'r', shadow: SH });
    const h = U(fa[0]), fh = fitFont(h, 296, [F.mb, F.m]); text(h, 12, 48, fh, GLD(14), { shadow: SH, n: typed(h, q, 0, 50) });
    wrap(U(fa[1]), 49).forEach((ln, k) => text(ln, 12, 72 + k * 11, F.s, C.CREAM, { shadow: SH, n: typed(ln, q, 0.4 + k * 0.45, 90) }));
    FOCUS_AREAS.forEach((x, k) => rect(12 + k * 14, 132, 10, 3, k === i ? C.ORANGE : C.DIM));
    scroller(t, 162, { amp: 3 });
    return i > 0 ? Math.exp(-q * 12) * 0.4 : 0;
  };
  function quotePart(lt, D, o, t) {
    lightRamps();
    /* Vektorbälle in den Lichtfarben der Produktfamilie kreisen um den Text */
    const list = []; for (let k = 0; k < 12; k++) { const a = t * 0.8 + (k / 12) * 6.283, z = Math.sin(a); list.push([160 + Math.cos(a) * 152, 94 + z * 80 + Math.sin(t * 1.7 + k) * 2, z, z > 0.3 ? 6 : z > -0.3 ? 5 : 4, 96 + (k % 4) * 8, 8]); }
    OS.sky(t, 60); OS.balls(list.filter((b) => b[2] <= 0));
    const Q = QUOTES[o.i ?? 0], lines = wrap(U(Q[LANG]), 23), y0 = 92 - (lines.length * 18) / 2;
    kicker(T.quoteKicker, 10, 8, lt);
    lines.forEach((ln, k) => text(ln, 160, y0 + k * 18, F.m, C.CREAM, { align: 'c', shadow: SH, n: typed(ln, lt, 0.3 + k * 0.5, 45) }));
    const by = U('— ' + (LANG === 'en' && Q.byEn ? Q.byEn : Q.by)); text(by, 160, y0 + lines.length * 18 + 6, F.s, C.ORANGE, { align: 'c', n: typed(by, lt, 0.3 + lines.length * 0.5, 60) });
    OS.balls(list.filter((b) => b[2] > 0));
    return 0;
  }
  PARTS.quote = quotePart; PARTS.quote2 = quotePart;

  /* ================= Listen: Projekte, Labs in Zahlen, Zertifikate ================= */
  PARTS.works = (lt, D, o, t) => {
    ramp(32, 16, [[0, '#04060F'], [0.3, '#0B1026'], [0.7, '#15183A'], [1, '#2A1C4E']]); OS.roto(t * 0.5, 32, 0, FH, bp(t, 6) * 0.5);
    kicker(T.worksKicker, 10, 8, lt); const a = U(T.worksTitle.join(' ')); text(a, 10, 18, fitFont(a, 300, [F.sb, F.s]), C.CREAM, { shadow: SH, n: typed(a, lt, 0.1, 60) });
    /* zwei Seiten: erst die freien Projekte, dann die Stationen im Beruf; je Schlag eine Zeile */
    const half = D / 2, pg = lt < half ? 0 : 1, q = lt - pg * half, list = pg ? WORKS.beruf : WORKS.frei;
    text(U(T.worksCols[pg]), 10, 31, F.sb, C.ORANGE, { shadow: SH, n: typed(U(T.worksCols[pg]), q, 0, 60) });
    text(`${pg + 1} / 2`, 308, 31, F.s, C.SOFT, { align: 'r', shadow: SH });
    let y = 43;
    list.forEach((w, k) => {
      const t1 = 0.3 + k * Math.min(B, (half - 1.5) / list.length); if (q < t1) return;
      const yr = U(w[0]), nm = U(LANG === 'en' ? w[4] : w[3]), ty = U(LANG === 'en' ? w[6] : w[5]);
      text(yr, 10, y, F.s, C.APR, { shadow: SH }); text(nm, 58, y, F.s, C.CREAM, { shadow: SH, n: typed(nm, q, t1, 110) });
      if (58 + tw(nm, F.s) + 10 + tw(ty, F.s) <= 310) text(ty, 310, y, F.s, C.MUTE, { align: 'r', shadow: SH }); else { y += 8; text(ty, 310, y, F.s, C.MUTE, { align: 'r', shadow: SH }); }
      y += 9;
    });
    return pg && q < 0.4 ? Math.exp(-q * 12) * 0.4 : 0;
  };
  PARTS.labsAll = (lt, D, o, t) => {
    OS.stars(t, 0.08, 100);
    kicker(T.labsAllKicker, 10, 6, lt); const a = U(T.labsAllTitle[0]), b = U(T.labsAllTitle[1]); text(a, 10, 16, F.m, C.CREAM, { shadow: SH }); text(b, 10 + tw(a, F.m) + 12, 16, F.m, C.ORANGE, { shadow: SH });
    /* Kennzahlen: je Schlag eine */
    LAB_STATS.forEach((v, k) => { const q = onBeat(lt, 1 + k, 0.12); if (q <= 0) return; const x = [10, 66, 172, 246][k]; text(U(v), x, 38 - Math.round((1 - eOut5(q)) * 6), F.mb, GLD(14), { shadow: SH }); wrap(U(T.labStatLabels[k]), k === 2 ? 10 : 12).forEach((ln, j) => text(ln, x, 55 + j * 8, F.s, C.SOFT)); });
    rect(10, 74, 300, 1, C.DIM);
    /* alle 21: zwei Spalten, eins nach dem anderen */
    const n = LABS_ALL.length, rowsN = Math.ceil(n / 2), step = Math.min(0.5 * B, (D - 2 * BAR) / n);
    LABS_ALL.forEach((L, k) => { const t1 = BAR + k * step; if (lt < t1) return; const col = k < rowsN ? 0 : 1, row = col ? k - rowsN : k, x = 10 + col * 156, y = 79 + row * 9; slashDot(x, y, C.ORANGE); const s = U(L[2]); text(s, x + 8, y, F.s, C.CREAM, { n: typed(s, lt, t1, 110) }); });
    return 0;
  };
  PARTS.certs = (lt, D, o, t) => {
    lightRamps(); OS.sky(t, 70);
    kicker(T.certsKicker, 10, 8, lt); const a = U(T.certsTitle[0]), b = U(T.certsTitle[1]); text(a, 10, 18, F.m, GLD(14)); text(b, 10 + tw(a, F.m) + 12, 18, F.m, C.CREAM);
    /* Rolltext wie ein Abspann: alle zehn laufen nach oben durch das Fenster (Start mit den ersten, Schluss mit den letzten); an den Rändern dunkeln die Zeilen ab */
    const y0 = 40, y1 = 174, blocks = CERTS.map((c) => ({ lines: wrap(U(c[LANG]), 50), meta: U(`${c.d} · ${LANG === 'en' && c.byEn ? c.byEn : c.by}`) }));
    const total = blocks.reduce((s, bk) => s + bk.lines.length * 9 + 9 + 8, 0), off = lerp(8, y1 - y0 - total + 2, eIO(seg(lt, 0.8, D - 0.6)) * 0.4 + seg(lt, 0.8, D - 0.6) * 0.6);
    let y = y0 + off;
    blocks.forEach((bk) => { if (y > y0 + 2 && y < y1 - 8) slashDot(10, Math.round(y), C.ORANGE); bk.lines.forEach((ln) => { if (y > y0 - 8 && y < y1) text(ln, 18, Math.round(y), F.s, C.CREAM, { y0, y1 }); y += 9; }); if (y > y0 - 8 && y < y1) text(bk.meta, 18, Math.round(y), F.s, C.ORANGE, { y0, y1 }); y += 17; });
    for (let k = 0; k < 8; k++) for (const yy of [y0 + k, y1 - 1 - k]) for (let i = yy * FW; i < yy * FW + FW; i++) { const v = fb[i]; if (v > C.CR && v <= C.CREAM) fb[i] = Math.max(C.CR + 1, v - (7 - k)); else if (v > C.OR && v <= C.ORANGE) fb[i] = Math.max(C.OR + 1, v - (7 - k)); }
    OS.copper(37, 3, 96, 4); OS.copper(176, 3, 96, 4);
    return 0;
  };

  /* ================= Produktfamilie ================= */
  let TILES = null;
  PARTS.family = (lt, D, o, t) => {
    if (!TILES) { OS.basePal(); TILES = { ld: sprite(() => zeichenTile(20, 20, 40), 40, 40), ...Object.fromEntries(FAMILY.map((f) => [f.key, sprite(() => familyTile(18, 18, 36, f.key), 36, 36)])) }; }
    OS.sky(t, 70, [100, 20, 120, 70]);
    kicker(T.familyKicker, 160, 8, lt, { align: 'c' });
    const q0 = onBeat(lt, 0, 0.15);
    if (q0 > 0) { blit(TILES.ld.idx, 40, 40, 140, 22, { key: 255 }); text('LOONA! DESIGNS', 160, 68, F.sb, C.CREAM, { align: 'c' }); text(U(LANG === 'en' ? 'platform' : 'plattform'), 160, 79, F.s, C.SOFT, { align: 'c' }); }
    FAMILY.forEach((f, i) => { const q = onBeat(lt, 1 + i, 0.15); if (q <= 0) return; const cx = 52 + i * 72, dy = Math.round((1 - eOut5(q)) * 8); blit(TILES[f.key].idx, 36, 36, cx - 18, 100 + dy, { key: 255 }); text(U(f.name), cx, 142, F.sb, C.CREAM, { align: 'c' }); text(U(f.tag), cx, 153, F.s, C.SOFT, { align: 'c' }); });
    return 0;
  };

  /* ================= Kontakt ================= */
  PARTS.outro = (lt, D, o, t) => {
    lightRamps(); OS.sky(t, 80, [10, 14, 300, 62]);
    lockupPx(160, 44, 36, seg(lt, 0.04, 0.4), seg(lt, B, B + 0.4));
    const t2 = lt - B, a = U(CLAIM[0]), b = U(CLAIM[1]), wa = tw(a, F.m), wb = tw(b, F.m), x0 = Math.round(160 - (wa + 12 + wb) / 2);
    if (t2 > B) { text(a, x0, 82, F.m, C.CREAM, { n: typed(a, t2, B, 50) }); text(b, x0 + wa + 12, 82, F.m, C.ORANGE, { n: typed(b, t2, B + 0.25, 50) }); }
    if (t2 > 2 * B) { const s = U(T.outroSub.join(' ')); text(s, 160, 102, F.s, C.SOFT, { align: 'c', n: typed(s, t2, 2 * B, 70) }); }
    if (t2 > 3 * B) { const pl = seg(t2, 3 * B, 3 * B + 0.3); rect(160 - 130 * pl, 114, 260 * pl, 1, C.DIM); text(U(LINKS[0]), 160, 120, F.sb, C.CREAM, { align: 'c', n: typed(U(LINKS[0]), t2, 3 * B, 60) }); text(U(LINKS[1]), 160, 131, F.s, C.SOFT, { align: 'c', n: typed(U(LINKS[1]), t2, 3 * B + 0.3, 90) }); text(U(LINKS[2]), 160, 140, F.s, C.SOFT, { align: 'c', n: typed(U(LINKS[2]), t2, 3 * B + 0.6, 90) }); }
    OS.copper(151, 3, 96, 4); OS.copper(178, 3, 104, 4); scroller(t, 165, { amp: 3 });
    return 0;
  };

  /* ================= Bildaufbau ================= */
  /* Übergang in eine Szene hinein: flash = Schnitt mit Blitz auf dem Schlag, fade = durch Schwarz, blocks = Blockauflösung */
  const TRANS = { claim: 'flash', person: 'blocks', stack: 'flash', journey: 'flash', award: 'fade', labs: 'blocks', site: 'flash', outro: 'fade', origin: 'blocks', focus: 'fade', works: 'flash', quote: 'fade', quote2: 'fade', labsAll: 'flash', hero: 'blocks', family: 'fade', certs: 'blocks' };
  RETRO.old = {
    init: async () => { OS.basePal(); },
    render: (t) => {
      const s = sceneAt(t), lt = clamp(t - s.t0, 0, s.D), next = SCENES[s.i + 1];
      OS.basePal(); OS.cls(0);
      let flash = (PARTS[s.id] ?? PARTS.claim)(lt, s.D, OPT[s.id] ?? {}, t) || 0, fade = 0;
      const kin = TRANS[s.id] ?? 'flash', kout = next ? TRANS[next.id] ?? 'flash' : null, rem = s.D - lt;
      if (s.i > 0) { if (kin === 'flash') flash = Math.max(flash, Math.exp(-lt * 14) * 0.55); else if (kin === 'fade') fade = 1 - seg(lt, 0, 0.3); else OS.blocks(1 - seg(lt, 0, 0.35), s.i); }
      if (kout === 'fade') fade = Math.max(fade, 1 - seg(rem, 0, 0.3)); else if (kout === 'blocks') OS.blocks(1 - seg(rem, 0, 0.3), s.i + 1);
      /* Auf- und Abblende des ganzen Trailers */
      fade = Math.max(fade, 1 - eOut(seg(t, 0, 0.25)), eIn(seg(t, DUR - 0.5, DUR - 0.05)));
      OS.present(fade, flash);
    },
  };
})();
