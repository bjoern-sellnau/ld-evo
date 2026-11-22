/* Trailer — Retro-Look „Demo 90“ (Stimmung old): Kern.
   Machart wie eine PC-/Amiga-Demo der frühen Neunziger: ein Bildspeicher von 320 × 180 Punkten mit Farbpalette (256 Einträge, Blenden und
   Farbläufe über die Palette, Ausgabe mit 6 Bit je Kanal wie am VGA-DAC), ohne Glättung ×6 auf 1920 × 1080 gebracht. Schrift ist ein eigener
   Pixel-Font (5 × 7, hier im Code gezeichnet), die großen Schnitte entstehen daraus durch Fettung und Kantenglättung (EPX/Scale2x).
   Die Effekte sind die der Zeit — Sternenflug, Kupferbalken, Plasma, Tunnel, Rotozoomer, Feuer, Vektorkörper, Vektorbälle, Sinus-Scroller,
   Bilder in 256 Farben — und werden aus der Zeit t gerechnet (kein Zustand von Bild zu Bild; das Feuer rechnet seine letzten Schritte nach).
   Zeichen und Wortmarke kommen aus den Formen des Brand-Systems (core.js), nur eben in dieses Raster gesetzt: frontal, unverzerrt, ohne Effekt.
   Die Parts (Inhalte je Szene) stehen in retro-old-parts.js. */
'use strict';
const OS = (() => {
  const FW = 320, FH = 180, N = FW * FH;
  const fb = new Uint8Array(N), pal = new Uint32Array(256), outPal = new Uint32Array(256);
  const cvs = document.createElement('canvas'); cvs.width = FW; cvs.height = FH;
  const cctx = cvs.getContext('2d'), idata = cctx.createImageData(FW, FH), px32 = new Uint32Array(idata.data.buffer);

  /* ---------- Palette ---------- */
  const rgb = (h) => { const n = parseInt(h.slice(1), 16); return [(n >> 16) & 255, (n >> 8) & 255, n & 255]; };
  const col3 = (c) => (typeof c === 'string' ? rgb(c) : c);
  const setc = (i, c) => { const [r, gg, b] = col3(c); pal[i] = ((255 << 24) | ((b & 255) << 16) | ((gg & 255) << 8) | (r & 255)) >>> 0; };
  const getc = (i) => { const c = pal[i]; return [c & 255, (c >> 8) & 255, (c >> 16) & 255]; };
  /* Farbverlauf in n Palette-Einträge ab i0; stops: Farben gleichmäßig verteilt oder [[Position 0…1, Farbe], …] */
  function ramp(i0, n, stops) {
    const st = stops.map((s, k) => (Array.isArray(s) && s.length === 2 && typeof s[1] !== 'number' ? [s[0], col3(s[1])] : [k / (stops.length - 1), col3(s)]));
    for (let i = 0; i < n; i++) {
      const p = n === 1 ? 0 : i / (n - 1); let k = 0; while (k < st.length - 2 && p > st[k + 1][0]) k++;
      const [pa, ca] = st[k], [pb, cb] = st[k + 1], q = clamp((p - pa) / (pb - pa || 1));
      setc(i0 + i, [Math.round(lerp(ca[0], cb[0], q)), Math.round(lerp(ca[1], cb[1], q)), Math.round(lerp(ca[2], cb[2], q))]);
    }
  }
  /* Feste Einträge 0–31 (Marke): Schwarz, Nacht, Tinte, Creme-Verlauf (3–10), Orange-Verlauf (11–18), Lichter der Produktfamilie.
     32–95 und 96–127: Verläufe des jeweiligen Effekts; 128–135 und 136–143: Schriftverläufe (Silber, Gold), wie man große Demo-Schriften
     von oben nach unten einfärbte; 144–255: Bildpalette (112 Farben) oder ein langer Effektverlauf. */
  const C = { BG: 0, BLK: 0, NIGHT: 1, INK: 2, CR: 3, CREAM: 10, OR: 11, ORANGE: 18, APR: 19, SIG: 20, FLOW: 21, NOVA: 22, BUDDY: 23, IVY: 24, WHITE: 25, SOFT: 26, MUTE: 27, DKOR: 28, NIGHT2: 29, DIM: 30, SHADE: 31 };
  function basePal() {
    /* Der Grund ist die Nacht der Marke (Eintrag 0) — auch Ränder und aufgelöste Blöcke; die Verläufe für Creme und Orange beginnen dort,
       damit geglättete Kanten (Zeichen, Wortmarke) sauber im Grund auslaufen */
    setc(0, BR.night); setc(1, BR.night); setc(2, BR.ink);
    ramp(3, 8, [BR.night, BR.cream]); ramp(11, 8, [BR.night, BR.orange]);
    setc(19, BR.apricot); setc(20, BR.signal); setc(21, BR.flow); setc(22, BR.nova); setc(23, BR.buddy); setc(24, BR.ivy);
    setc(25, '#FFFFFF'); setc(26, '#B4B9D0'); setc(27, '#7C83A3'); setc(28, BR.glassDark); setc(29, '#161D3D'); setc(30, '#565C7C'); setc(31, '#05070F');
    ramp(128, 8, ['#FFFFFF', BR.cream, '#D9D2C4', '#B4B9D0', '#8389AB']); ramp(136, 8, ['#FFE3CC', BR.apricot, BR.orange, '#D9600E', '#9A4208']);
  }
  /* Bild ausgeben. fade 0…1 blendet die Palette nach Schwarz, flash 0…1 nach Weiß; 6 Bit je Kanal wie am VGA-DAC.
     api.noFlash = [von, bis] nimmt Einträge vom Blitz aus — der Orange-Verlauf des Zeichens blitzt nie mit (kein Effekt auf dem Zeichen). */
  function present(fade = 0, flash = 0) {
    const f = 1 - clamp(fade), w = clamp(flash), nf = api.noFlash; api.noFlash = null;
    for (let i = 0; i < 256; i++) {
      const c = pal[i]; let r = c & 255, gg = (c >> 8) & 255, b = (c >> 16) & 255;
      if (w > 0 && !(nf && i >= nf[0] && i <= nf[1])) { r += (255 - r) * w; gg += (255 - gg) * w; b += (255 - b) * w; }
      outPal[i] = (0xFF000000 | (((b * f) & 0xFC) << 16) | (((gg * f) & 0xFC) << 8) | ((r * f) & 0xFC)) >>> 0;
    }
    for (let i = 0; i < N; i++) px32[i] = outPal[fb[i]];
    cctx.putImageData(idata, 0, 0);
    g.imageSmoothingEnabled = false; g.drawImage(cvs, 0, 0, W, H);
  }

  /* ---------- Zeichnen im Raster ---------- */
  const cls = (c = 0) => fb.fill(c);
  function rect(x, y, w, h, c) {
    x = Math.round(x); y = Math.round(y); w = Math.round(w); h = Math.round(h);
    const x0 = Math.max(0, x), x1 = Math.min(FW, x + w), y0 = Math.max(0, y), y1 = Math.min(FH, y + h);
    if (x1 <= x0) return; for (let yy = y0; yy < y1; yy++) fb.fill(c, yy * FW + x0, yy * FW + x1);
  }
  const pset = (x, y, c) => { x |= 0; y |= 0; if (x >= 0 && x < FW && y >= 0 && y < FH) fb[y * FW + x] = c; };
  function frame(x, y, w, h, c) { rect(x, y, w, 1, c); rect(x, y + h - 1, w, 1, c); rect(x, y, 1, h, c); rect(x + w - 1, y, 1, h, c); }
  function line(x0, y0, x1, y1, c) {
    x0 = Math.round(x0); y0 = Math.round(y0); x1 = Math.round(x1); y1 = Math.round(y1);
    const dx = Math.abs(x1 - x0), dy = -Math.abs(y1 - y0), sx = x0 < x1 ? 1 : -1, sy = y0 < y1 ? 1 : -1; let e = dx + dy;
    for (let i = 0; i < 2000; i++) { pset(x0, y0, c); if (x0 === x1 && y0 === y1) break; const e2 = 2 * e; if (e2 >= dy) { e += dy; x0 += sx; } if (e2 <= dx) { e += dx; y0 += sy; } }
  }
  /* gefülltes Dreieck (zeilenweise) */
  function tri(ax, ay, bx, by, cx, cy, c) {
    if (ay > by) { [ax, ay, bx, by] = [bx, by, ax, ay]; } if (ay > cy) { [ax, ay, cx, cy] = [cx, cy, ax, ay]; } if (by > cy) { [bx, by, cx, cy] = [cx, cy, bx, by]; }
    const y0 = Math.max(0, Math.ceil(ay)), y1 = Math.min(FH - 1, Math.floor(cy));
    for (let y = y0; y <= y1; y++) {
      const ta = cy === ay ? 0 : (y - ay) / (cy - ay), xa = ax + (cx - ax) * ta;
      const xb = y < by ? (by === ay ? ax : ax + (bx - ax) * ((y - ay) / (by - ay))) : (cy === by ? bx : bx + (cx - bx) * ((y - by) / (cy - by)));
      const l = Math.max(0, Math.ceil(Math.min(xa, xb))), r = Math.min(FW - 1, Math.floor(Math.max(xa, xb)));
      if (r >= l) fb.fill(c, y * FW + l, y * FW + r + 1);
    }
  }
  /* Indexbild kopieren; key = durchsichtiger Index (−1: keiner) */
  function blit(src, sw, sh, dx, dy, o = {}) {
    const sx0 = o.sx ?? 0, sy0 = o.sy ?? 0, w = o.w ?? sw, h = o.h ?? sh, key = o.key ?? -1; dx = Math.round(dx); dy = Math.round(dy);
    for (let y = 0; y < h; y++) {
      const yy = dy + y, sy = sy0 + y; if (yy < 0 || yy >= FH || sy < 0 || sy >= sh) continue;
      for (let x = 0; x < w; x++) { const xx = dx + x, sx = sx0 + x; if (xx < 0 || xx >= FW || sx < 0 || sx >= sw) continue; const v = src[sy * sw + sx]; if (v !== key) fb[yy * FW + xx] = v; }
    }
  }

  /* ---------- Pixel-Font 5 × 7 (eigene Glyphen) ---------- */
  const GL = {
    A: '01110 10001 10001 11111 10001 10001 10001', B: '11110 10001 10001 11110 10001 10001 11110', C: '01110 10001 10000 10000 10000 10001 01110',
    D: '11110 10001 10001 10001 10001 10001 11110', E: '11111 10000 10000 11110 10000 10000 11111', F: '11111 10000 10000 11110 10000 10000 10000',
    G: '01110 10001 10000 10011 10001 10001 01110', H: '10001 10001 10001 11111 10001 10001 10001', I: '01110 00100 00100 00100 00100 00100 01110',
    J: '00111 00010 00010 00010 00010 10010 01100', K: '10001 10010 10100 11000 10100 10010 10001', L: '10000 10000 10000 10000 10000 10000 11111',
    M: '10001 11011 10101 10101 10001 10001 10001', N: '10001 11001 11001 10101 10011 10011 10001', O: '01110 10001 10001 10001 10001 10001 01110',
    P: '11110 10001 10001 11110 10000 10000 10000', Q: '01110 10001 10001 10001 10101 10010 01101', R: '11110 10001 10001 11110 10100 10010 10001',
    S: '01111 10000 10000 01110 00001 00001 11110', T: '11111 00100 00100 00100 00100 00100 00100', U: '10001 10001 10001 10001 10001 10001 01110',
    V: '10001 10001 10001 10001 10001 01010 00100', W: '10001 10001 10001 10101 10101 11011 10001', X: '10001 10001 01010 00100 01010 10001 10001',
    Y: '10001 10001 01010 00100 00100 00100 00100', Z: '11111 00001 00010 00100 01000 10000 11111',
    0: '01110 10001 10011 10101 11001 10001 01110', 1: '00100 01100 00100 00100 00100 00100 01110', 2: '01110 10001 00001 00110 01000 10000 11111',
    3: '11110 00001 00001 01110 00001 00001 11110', 4: '00010 00110 01010 10010 11111 00010 00010', 5: '11111 10000 11110 00001 00001 10001 01110',
    6: '00110 01000 10000 11110 10001 10001 01110', 7: '11111 00001 00010 00100 01000 01000 01000', 8: '01110 10001 10001 01110 10001 10001 01110',
    9: '01110 10001 10001 01111 00001 00010 01100',
    ' ': '00000 00000 00000 00000 00000 00000 00000', '.': '00000 00000 00000 00000 00000 01100 01100', ',': '00000 00000 00000 00000 01100 00100 01000',
    ':': '00000 01100 01100 00000 01100 01100 00000', ';': '00000 01100 01100 00000 01100 00100 01000', '!': '00100 00100 00100 00100 00100 00000 00100',
    '?': '01110 10001 00001 00010 00100 00000 00100', '-': '00000 00000 00000 01110 00000 00000 00000', '+': '00000 00100 00100 11111 00100 00100 00000',
    '/': '00001 00001 00010 00100 01000 10000 10000', '\\': '10000 10000 01000 00100 00010 00001 00001', '(': '00010 00100 01000 01000 01000 00100 00010',
    ')': '01000 00100 00010 00010 00010 00100 01000', "'": '00100 00100 01000 00000 00000 00000 00000', '"': '01010 01010 01010 00000 00000 00000 00000',
    '&': '01100 10010 10100 01000 10101 10010 01101', '%': '11000 11001 00010 00100 01000 10011 00011', '#': '01010 01010 11111 01010 11111 01010 01010',
    '*': '00000 00100 10101 01110 10101 00100 00000', '=': '00000 00000 11111 00000 11111 00000 00000', '<': '00010 00100 01000 10000 01000 00100 00010',
    '>': '01000 00100 00010 00001 00010 00100 01000', _: '00000 00000 00000 00000 00000 00000 11111', '|': '00100 00100 00100 00100 00100 00100 00100',
    '@': '01110 10001 10111 10101 10111 10000 01110', '·': '00000 00000 00000 01100 01100 00000 00000', '—': '00000 00000 00000 11111 00000 00000 00000',
    '°': '01100 10010 10010 01100 00000 00000 00000', '→': '00000 00100 00010 11111 00010 00100 00000',
    /* Umlaute in voller Versalhöhe: die Punkte sitzen in den Ecken der obersten Zeile (wie bei Punktmatrix-Anzeigen) */
    'Ä': '10001 01110 10001 10001 11111 10001 10001', 'Ö': '10001 01110 10001 10001 10001 10001 01110', 'Ü': '10001 00000 10001 10001 10001 10001 01110',
    '█': '11111 11111 11111 11111 11111 11111 11111',
  };
  /* Zeichen, die der Font nicht hat, auf vorhandene abbilden; Text immer in Versalien (ß wird dabei zu SS) */
  const MAPC = { '–': '-', '„': '"', '“': '"', '”': '"', '‘': "'", '’': "'", '‚': "'", ' ': ' ', ' ': ' ', '…': '.', 'À': 'A', 'Á': 'A', 'É': 'E', 'È': 'E', '×': 'X', '•': '·', '✦': '*', '↗': '>', '©': '(C)' };
  const up = (s) => Array.from(String(s).toUpperCase()).map((ch) => (GL[ch] ? ch : MAPC[ch] ?? '?')).join('');
  function mkFont(w, h, glyphs, gap) { return { w, h, adv: w + gap, gap, g: glyphs }; }
  const F5 = (() => { const m = {}; for (const [ch, s] of Object.entries(GL)) { const a = new Uint8Array(35); s.split(' ').forEach((row, y) => { for (let x = 0; x < 5; x++) a[y * 5 + x] = row[x] === '1' ? 1 : 0; }); m[ch] = a; } return mkFont(5, 7, m, 1); })();
  /* fett: jede Spalte einen Punkt nach rechts verdoppelt */
  function bold(f) { const m = {}, w = f.w + 1; for (const [ch, a] of Object.entries(f.g)) { const o = new Uint8Array(w * f.h); for (let y = 0; y < f.h; y++) for (let x = 0; x < f.w; x++) if (a[y * f.w + x]) { o[y * w + x] = 1; o[y * w + x + 1] = 1; } m[ch] = o; } return mkFont(w, f.h, m, f.gap); }
  /* doppelte Größe mit geglätteten Schrägen (EPX / Scale2x) */
  function epx(f) {
    const m = {}, w = f.w, h = f.h, W2 = w * 2;
    for (const [ch, a] of Object.entries(f.g)) {
      const o = new Uint8Array(W2 * h * 2), at = (x, y) => (x < 0 || y < 0 || x >= w || y >= h ? 0 : a[y * w + x]);
      for (let y = 0; y < h; y++) for (let x = 0; x < w; x++) {
        const P = at(x, y), A = at(x, y - 1), Bq = at(x + 1, y), Cq = at(x - 1, y), D = at(x, y + 1);
        let p1 = P, p2 = P, p3 = P, p4 = P;
        if (Cq === A && Cq !== D && A !== Bq) p1 = A; if (A === Bq && A !== Cq && Bq !== D) p2 = Bq; if (D === Cq && D !== Bq && Cq !== A) p3 = Cq; if (Bq === D && Bq !== A && D !== Cq) p4 = D;
        const i = y * 2 * W2 + x * 2; o[i] = p1; o[i + 1] = p2; o[i + W2] = p3; o[i + W2 + 1] = p4;
      }
      m[ch] = o;
    }
    return mkFont(W2, h * 2, m, f.gap * 2);
  }
  const F5B = bold(F5), F10 = epx(F5), F10B = epx(F5B), F20 = epx(F10), F20B = epx(F10B), F40B = epx(F20B);
  const FONT = { s: F5, sb: F5B, m: F10, mb: F10B, l: F20, lb: F20B, xl: F40B };
  const tw = (str, f, sp = 0) => (str.length ? str.length * (f.adv + sp) - f.gap - sp : 0);
  /* Text setzen (str schon in Versalien, siehe up). col: Palettenindex oder Feld mit einem Index je Glyphenzeile (Verlauf).
     o.align l|c|r, o.shadow Index für einen Schatten rechts unten, o.n nur die ersten n Zeichen (Schreibmaschine),
     o.bevel [hell, dunkel] für Kanten oben/unten, o.wave (i) → Versatz je Zeichen, o.y0/o.y1 Zeilenbereich (Ausschnitt). */
  function text(str, x, y, f, col, o = {}) {
    const sp = o.sp ?? 0, wd = tw(str, f, sp); x = Math.round(o.align === 'c' ? x - wd / 2 : o.align === 'r' ? x - wd : x); y = Math.round(y);
    const n = Math.min(str.length, o.n ?? 1e9), y0c = o.y0 ?? 0, y1c = o.y1 ?? FH, arr = typeof col !== 'number';
    if (api.chk && !o.wave && o.y1 === undefined && (x < 0 || x + wd > FW || y < 0 || y + f.h > FH)) api.chk.push(`${str} @${x},${y} Breite ${wd}`); // Prüfhilfe: Text außerhalb des Bilds
    for (let pass = o.shadow !== undefined ? 0 : 1; pass < 2; pass++) {
      const ox = pass === 0 ? 1 : 0, oy = pass === 0 ? 1 : 0;
      for (let i = 0; i < n; i++) {
        const a = f.g[str[i]] ?? f.g['?']; const gx = x + i * (f.adv + sp) + ox, gy = y + oy + (o.wave ? Math.round(o.wave(i)) : 0);
        if (gx + f.w < 0 || gx >= FW) continue;
        for (let yy = 0; yy < f.h; yy++) {
          const py = gy + yy; if (py < y0c || py >= y1c || py < 0 || py >= FH) continue;
          for (let xx = 0; xx < f.w; xx++) {
            if (!a[yy * f.w + xx]) continue; const px = gx + xx; if (px < 0 || px >= FW) continue;
            let c = pass === 0 ? o.shadow : arr ? col[yy] : col;
            if (pass === 1 && o.bevel) { if (yy === 0 || !a[(yy - 1) * f.w + xx]) c = o.bevel[0]; else if (yy === f.h - 1 || !a[(yy + 1) * f.w + xx]) c = o.bevel[1]; }
            fb[py * FW + px] = c;
          }
        }
      }
    }
    return wd;
  }
  /* Umbruch nach Zeichenzahl */
  function wrap(str, max) { const out = []; let ln = ''; for (const w of str.split(' ')) { const tt = ln ? ln + ' ' + w : w; if (tt.length > max && ln) { out.push(ln); ln = w; } else ln = tt; } if (ln) out.push(ln); return out; }
  /* größter Schnitt aus der Liste, der in die Breite passt */
  const fitFont = (str, max, list) => list.find((f) => tw(str, f) <= max) ?? list[list.length - 1];
  /* Verlauf über die Glyphenzeilen: n Zeilen aus dem Palettenbereich i0…i1 */
  const rows = (n, i0, i1) => Array.from({ length: n }, (_, k) => Math.round(lerp(i0, i1, n === 1 ? 0 : k / (n - 1))));

  /* ---------- Formen der Marke ins Raster (über eine kleine Canvas, dann als Deckung in einen Palettenverlauf) ---------- */
  const scv = document.createElement('canvas'); scv.width = FW; scv.height = FH; const sctx = scv.getContext('2d', { willReadFrequently: true });
  /* fn zeichnet mit den Funktionen aus core.js (g zeigt solange auf die kleine Canvas). Die Deckung jedes Punkts wählt die Stufe im Verlauf
     i0…i0+lv−1 — so entsteht die Kantenglättung der Pixelgrafik; alpha < 1 blendet über die Stufen (Palette). */
  function stamp(fn, x0, y0, w, h, i0, lv, alpha = 1) {
    x0 = Math.max(0, Math.floor(x0)); y0 = Math.max(0, Math.floor(y0)); w = Math.min(FW - x0, Math.ceil(w)); h = Math.min(FH - y0, Math.ceil(h)); if (w <= 0 || h <= 0) return;
    const keep = g; g = sctx; g.save(); g.setTransform(1, 0, 0, 1, 0, 0); g.clearRect(x0, y0, w, h); g.beginPath(); g.rect(x0, y0, w, h); g.clip(); fn(); g.restore(); g = keep;
    const d = sctx.getImageData(x0, y0, w, h).data;
    for (let y = 0; y < h; y++) for (let x = 0; x < w; x++) { const a = (d[(y * w + x) * 4 + 3] / 255) * alpha; if (a < 0.16) continue; fb[(y0 + y) * FW + x0 + x] = i0 + Math.min(lv - 1, Math.round(a * (lv - 1))); }
  }
  /* farbige Kleingrafik (Kacheln der Produktfamilie): einmal zeichnen, jeden Punkt auf den nächsten der festen Einträge 0–31 legen */
  function sprite(fn, w, h) {
    const keep = g; g = sctx; g.save(); g.setTransform(1, 0, 0, 1, 0, 0); g.clearRect(0, 0, w, h); fn(); g.restore(); g = keep;
    const d = sctx.getImageData(0, 0, w, h).data, out = new Uint8Array(w * h).fill(255), cand = []; for (let i = 0; i < 32; i++) cand.push(getc(i));
    for (let i = 0; i < w * h; i++) { if (d[i * 4 + 3] < 128) continue; let best = 0, bd = 1e9; for (let k = 0; k < 32; k++) { const c = cand[k], e = (c[0] - d[i * 4]) ** 2 + (c[1] - d[i * 4 + 1]) ** 2 + (c[2] - d[i * 4 + 2]) ** 2; if (e < bd) { bd = e; best = k; } } out[i] = best; }
    return { idx: out, w, h };
  }

  /* ---------- Bilder in 256 Farben ---------- */
  /* Bild auf w × h bringen (Ausschnitt mittig, wie object-fit: cover; h = 0: ganze Höhe im Seitenverhältnis), mit Median-Schnitt eine eigene
     Palette von nc Farben suchen und gerastert (Bayer 4 × 4) darauf abbilden. Ergebnis: Indizes ab base und die Palette dazu. */
  const BAYER = [0, 8, 2, 10, 12, 4, 14, 6, 3, 11, 1, 9, 15, 7, 13, 5];
  const PICS = new Map();
  function quant(img, w, h, nc = 112, base = 144) {
    const c = document.createElement('canvas'); if (!h) h = Math.round((img.height / img.width) * w); c.width = w; c.height = h; const x = c.getContext('2d');
    const s = Math.max(w / img.width, h / img.height), iw = img.width * s, ih = img.height * s; x.imageSmoothingQuality = 'high'; x.drawImage(img, (w - iw) / 2, (h - ih) / 2, iw, ih);
    const d = x.getImageData(0, 0, w, h).data, n = w * h;
    /* Median-Schnitt über eine Stichprobe */
    const step = Math.max(1, Math.floor(n / 6000)), pts = []; for (let i = 0; i < n; i += step) pts.push([d[i * 4], d[i * 4 + 1], d[i * 4 + 2]]);
    let boxes = [pts];
    while (boxes.length < nc) {
      let bi = -1, br = 0, bax = 0;
      boxes.forEach((bx, k) => { if (bx.length < 2) return; for (let a = 0; a < 3; a++) { let mn = 255, mx = 0; for (const p of bx) { if (p[a] < mn) mn = p[a]; if (p[a] > mx) mx = p[a]; } const r = (mx - mn) * Math.sqrt(bx.length); if (r > br) { br = r; bi = k; bax = a; } } });
      if (bi < 0) break; const bx = boxes[bi]; bx.sort((p, q) => p[bax] - q[bax]); const mid = bx.length >> 1; boxes.splice(bi, 1, bx.slice(0, mid), bx.slice(mid));
    }
    const colors = boxes.map((bx) => { let r = 0, gg = 0, b = 0; for (const p of bx) { r += p[0]; gg += p[1]; b += p[2]; } const k = Math.max(1, bx.length); return [Math.round(r / k), Math.round(gg / k), Math.round(b / k)]; });
    while (colors.length < nc) colors.push([0, 0, 0]);
    const cache = new Int16Array(32768).fill(-1), idx = new Uint8Array(n);
    for (let y = 0; y < h; y++) for (let xx = 0; xx < w; xx++) {
      const i = y * w + xx, t = (BAYER[(y & 3) * 4 + (xx & 3)] - 7.5) * 1.3;
      const r = clamp(d[i * 4] + t, 0, 255) >> 3, gg = clamp(d[i * 4 + 1] + t, 0, 255) >> 3, b = clamp(d[i * 4 + 2] + t, 0, 255) >> 3, key = (r << 10) | (gg << 5) | b;
      let v = cache[key];
      if (v < 0) { let bd = 1e9; const R = (r << 3) + 4, G = (gg << 3) + 4, Bv = (b << 3) + 4; for (let k = 0; k < colors.length; k++) { const cc = colors[k], e = (cc[0] - R) ** 2 + (cc[1] - G) ** 2 + (cc[2] - Bv) ** 2; if (e < bd) { bd = e; v = k; } } cache[key] = v; }
      idx[i] = base + v;
    }
    return { idx, w, h, pal: colors, base };
  }
  /* Bild aus IMG (oder ein Bildobjekt) einmal umrechnen und merken */
  function pic(key, w, h, nc = 112, base = 144) { const id = `${typeof key === 'string' ? key : key.src}|${w}|${h}|${nc}|${base}`; if (!PICS.has(id)) { const img = typeof key === 'string' ? IMG[key] : key; PICS.set(id, img ? quant(img, w, h, nc, base) : null); } return PICS.get(id); }
  const usePal = (p) => { if (p) p.pal.forEach((c, i) => setc(p.base + i, c)); };

  /* ---------- Effekte ---------- */
  const SIN = new Float32Array(1024); for (let i = 0; i < 1024; i++) SIN[i] = Math.sin((i / 1024) * 6.283185307);
  /* Sternenflug: n Sterne kommen aus der Tiefe; Helligkeit nach Nähe aus dem Creme-Verlauf. hole = [x, y, w, h] bleibt frei. */
  function stars(t, speed = 0.25, n = 180, hole = null) {
    for (let i = 0; i < n; i++) {
      const z = 1 - ((hash(i * 7.3 + 2) + t * speed * (0.6 + hash(i * 1.7) * 0.8)) % 1), k = 0.09 / (z * 0.96 + 0.04);
      const x = FW / 2 + (hash(i * 3.1) - 0.5) * FW * 3.2 * k, y = FH / 2 + (hash(i * 5.7 + 1) - 0.5) * FW * 3.2 * k;
      if (x < 0 || x >= FW || y < 0 || y >= FH) continue; if (hole && x >= hole[0] && x < hole[0] + hole[2] && y >= hole[1] && y < hole[1] + hole[3]) continue;
      const c = C.CR + 1 + Math.min(6, Math.floor((1 - z) * 8)); pset(x, y, c); if (z < 0.22) { pset(x + 1, y, c); if (z < 0.1) { pset(x, y + 1, c); pset(x + 1, y + 1, c); } }
    }
  }
  /* ruhiger Sternenhimmel: feste Punkte, einzelne funkeln */
  function sky(t, n = 90, hole = null) {
    for (let i = 0; i < n; i++) {
      const x = Math.floor(hash(i * 3.3 + 9) * FW), y = Math.floor(hash(i * 6.1 + 4) * FH); if (hole && x >= hole[0] && x < hole[0] + hole[2] && y >= hole[1] && y < hole[1] + hole[3]) continue;
      const tw2 = 0.5 + 0.5 * Math.sin(t * (1 + hash(i) * 3) + i); pset(x, y, C.CR + 1 + Math.round(hash(i * 2.2) * 3 + tw2 * 2.4));
    }
  }
  /* Kupferbalken: volle Breite, Helligkeit über die Höhe aus einem Verlauf (i0 dunkel … i0+lv−1 hell) */
  function copper(yc, hgt, i0, lv = 8) { yc = Math.round(yc); for (let k = 0; k < hgt; k++) { const y = yc - (hgt >> 1) + k; if (y < 0 || y >= FH) continue; const s = Math.sin(((k + 0.5) / hgt) * Math.PI); fb.fill(i0 + Math.min(lv - 1, Math.floor(s * lv)), y * FW, y * FW + FW); } }
  /* Plasma: vier Sinusflächen, Farbe = Summe + Farblauf im Verlauf i0…i0+n−1 */
  const PLD = new Uint8Array(N); for (let y = 0; y < FH; y++) for (let x = 0; x < FW; x++) PLD[y * FW + x] = (Math.hypot(x - FW / 2, (y - FH / 2) * 1.2) * 3.4) & 255;
  function plasma(t, i0, n, y0 = 0, y1 = FH) {
    const a = t * 70, b = t * 47, c = t * 31, sh = (t * n * 0.22) | 0;
    for (let y = y0; y < y1; y++) {
      const sy = 128 + 127 * SIN[((y * 9 + b) | 0) & 1023], o = y * FW;
      for (let x = 0; x < FW; x++) {
        const v = 128 + 127 * SIN[((x * 5 + a) | 0) & 1023] + sy + 128 + 127 * SIN[(((x + y) * 4 + c) | 0) & 1023] + 128 + 127 * SIN[((PLD[o + x] * 4 - a) | 0) & 1023];
        fb[o + x] = i0 + ((((v * n) >> 10) + sh) % n);
      }
    }
  }
  /* Tunnel: Winkel und Tiefe je Punkt aus Tabellen (doppelte Größe, damit die Mitte wandern kann); Muster in Kacheln, 4 Tiefenstufen × 16 Farben */
  const TW2 = FW * 2, TH2 = FH * 2, TANG = new Uint8Array(TW2 * TH2), TDEP = new Uint8Array(TW2 * TH2), TSH = new Uint8Array(TW2 * TH2);
  for (let y = 0; y < TH2; y++) for (let x = 0; x < TW2; x++) { const dx = x - FW, dy = (y - FH) * 1.1, d = Math.hypot(dx, dy) + 0.001, i = y * TW2 + x; TANG[i] = ((Math.atan2(dy, dx) / 6.283185307) * 256) & 255; TDEP[i] = (5200 / d) & 255; TSH[i] = Math.min(3, Math.floor(d / 22)); }
  const TTEX = new Uint8Array(1024); for (let v = 0; v < 32; v++) for (let u = 0; u < 32; u++) { const e = Math.min(u & 15, 15 - (u & 15), v & 15, 15 - (v & 15)); TTEX[v * 32 + u] = ((u >> 4) ^ (v >> 4)) & 1 ? 4 + Math.min(11, e * 2) : Math.min(6, e); }
  function tunnel(t, i0, y0 = 0, y1 = FH) {
    const ox = Math.round(FW / 2 + Math.sin(t * 0.9) * 70), oy = Math.round(FH / 2 + Math.cos(t * 0.7) * 38), du = (t * 24) | 0, dv = (t * 70) | 0;
    for (let y = y0; y < y1; y++) { const o = y * FW, ti = (y + oy) * TW2 + ox; for (let x = 0; x < FW; x++) { const k = ti + x; fb[o + x] = i0 + TSH[k] * 16 + TTEX[(((TDEP[k] + dv) & 31) << 5) | (((TANG[k] + du) >> 1) & 31)]; } }
  }
  /* Rotozoomer: gekacheltes Muster (64 × 64, Werte 0–15), gedreht und gezoomt; kick stößt den Zoom an (auf den Schlag) */
  const RTEX = new Uint8Array(4096); for (let v = 0; v < 64; v++) for (let u = 0; u < 64; u++) { const q = ((u >> 5) ^ (v >> 5)) & 1, dg = (u + v) & 15, e = Math.min(u & 31, 31 - (u & 31), v & 31, 31 - (v & 31)); RTEX[v * 64 + u] = e < 2 ? 1 : q ? 4 + (dg < 4 ? 6 : dg < 8 ? 3 : 0) : 2 + (dg < 3 ? 3 : 0); }
  function roto(t, i0, y0 = 0, y1 = FH, kick = 0) {
    const a = t * 0.5, z = (1.5 + Math.sin(t * 0.8) * 0.9) * (1 - 0.22 * kick), c = Math.cos(a) * z, s = Math.sin(a) * z, u0 = t * 40, v0 = t * 25;
    for (let y = y0; y < y1; y++) { const o = y * FW, yy = y - FH / 2; let u = u0 - (FW / 2) * c - yy * s, v = v0 - (FW / 2) * s + yy * c; for (let x = 0; x < FW; x++) { fb[o + x] = i0 + RTEX[((v & 63) << 6) | (u & 63)]; u += c; v += s; } }
  }
  /* Feuer: der klassische Zellautomat. Damit das Bild nur von der Zeit abhängt, werden die letzten 70 Schritte aus dem Stand nachgerechnet. */
  const FIH = 56, FIRE = new Float32Array(FW * (FIH + 2));
  function fire(t, i0, yb = FH, heat = 1) {
    const f = Math.floor(t * 30); FIRE.fill(0);
    for (let s = f - 70; s <= f; s++) {
      /* Glutnester: wenige Punkte breit und zwei Schritte lang, dazu ein Flackern je Punkt — daraus wachsen die Zungen */
      for (let x = 0; x < FW; x++) { const cell = hash((x >> 2) * 3.7 + (s >> 1) * 11.3), hot = (cell > 0.5 ? 255 : cell > 0.3 ? 130 : 0) * (0.75 + 0.25 * hash(x * 1.3 + s * 7.7)) * heat; FIRE[FIH * FW + x] = hot; FIRE[(FIH + 1) * FW + x] = hot; }
      for (let y = 0; y < FIH; y++) { const o = y * FW, b1 = o + FW, b2 = b1 + FW; for (let x = 0; x < FW; x++) { const l = x ? x - 1 : x, rr2 = x < FW - 1 ? x + 1 : x; const v = (FIRE[b1 + l] + FIRE[b1 + x] + FIRE[b1 + rr2] + FIRE[b2 + x]) * 0.2385 - 0.9; FIRE[o + x] = v > 0 ? v : 0; } }
    }
    for (let y = 0; y < FIH; y++) { const yy = yb - FIH + y; if (yy < 0 || yy >= FH) continue; const o = y * FW, d = yy * FW; for (let x = 0; x < FW; x++) { const v = FIRE[o + x] >> 2; if (v > 1) fb[d + x] = i0 + Math.min(63, v); } }
  }
  /* Vektorkörper (Ikosaeder), flach schattiert; die Flächen wechseln zwischen zwei Verläufen (je lv Stufen) */
  const ICO = (() => { const p = (1 + Math.sqrt(5)) / 2, v = [[-1, p, 0], [1, p, 0], [-1, -p, 0], [1, -p, 0], [0, -1, p], [0, 1, p], [0, -1, -p], [0, 1, -p], [p, 0, -1], [p, 0, 1], [-p, 0, -1], [-p, 0, 1]].map((q) => { const l = Math.hypot(...q); return q.map((c) => c / l); });
    const f = [[0, 11, 5], [0, 5, 1], [0, 1, 7], [0, 7, 10], [0, 10, 11], [1, 5, 9], [5, 11, 4], [11, 10, 2], [10, 7, 6], [7, 1, 8], [3, 9, 4], [3, 4, 2], [3, 2, 6], [3, 6, 8], [3, 8, 9], [4, 9, 5], [2, 4, 11], [6, 2, 10], [8, 6, 7], [9, 8, 1]]; return { v, f }; })();
  function solid(t, cx, cy, R, iA, iB, lv = 8) {
    const ax = t * 0.9, ay = t * 1.3, az = t * 0.5, ca = Math.cos(ax), sa = Math.sin(ax), cb = Math.cos(ay), sb = Math.sin(ay), cc = Math.cos(az), sc = Math.sin(az);
    const P = ICO.v.map(([x, y, z]) => { const y1 = y * ca - z * sa, z1 = y * sa + z * ca, x2 = x * cb + z1 * sb, z2 = -x * sb + z1 * cb, x3 = x2 * cc - y1 * sc, y3 = x2 * sc + y1 * cc, k = 3.2 / (3.2 + z2); return [cx + x3 * R * k, cy + y3 * R * k, x3, y3, z2]; });
    ICO.f.forEach(([a, b, c], fi) => {
      const A = P[a], Bp = P[b], Cp = P[c];
      const ux = Bp[2] - A[2], uy = Bp[3] - A[3], uz = Bp[4] - A[4], vx = Cp[2] - A[2], vy = Cp[3] - A[3], vz = Cp[4] - A[4];
      let nx = uy * vz - uz * vy, ny = uz * vx - ux * vz, nz = ux * vy - uy * vx; const l = Math.hypot(nx, ny, nz) || 1; nx /= l; ny /= l; nz /= l;
      /* Flächennormale nach außen richten (vom Mittelpunkt weg), Rückseiten weglassen */
      const mx = A[2] + Bp[2] + Cp[2], my = A[3] + Bp[3] + Cp[3], mz = A[4] + Bp[4] + Cp[4]; if (nx * mx + ny * my + nz * mz < 0) { nx = -nx; ny = -ny; nz = -nz; }
      if (nz > 0.05) return;
      const li = clamp(nx * -0.45 + ny * -0.6 + nz * -0.66) ** 0.8;
      tri(A[0], A[1], Bp[0], Bp[1], Cp[0], Cp[1], (fi & 1 ? iB : iA) + Math.min(lv - 1, Math.floor(li * lv)));
    });
  }
  /* Vektorbälle: schattierte Kugel-Sprites (Radius r, lv Stufen) auf Punkten im Raum, von hinten nach vorn */
  const BALLS = {};
  function ball(r, lv) { const k = `${r}|${lv}`; if (!BALLS[k]) { const d = r * 2 + 1, a = new Uint8Array(d * d).fill(255); for (let y = 0; y < d; y++) for (let x = 0; x < d; x++) { const dx = (x - r) / (r + 0.3), dy = (y - r) / (r + 0.3), q = dx * dx + dy * dy; if (q > 1) continue; const z = Math.sqrt(1 - q), li = clamp(-dx * 0.5 - dy * 0.6 + z * 0.62); a[y * d + x] = Math.min(lv - 1, Math.floor(li * li * lv * 1.15)); } BALLS[k] = { a, d }; } return BALLS[k]; }
  function balls(list) { // [x, y, z, r, i0, lv]
    list.sort((p, q) => q[2] - p[2]);
    for (const [x, y, , r, i0, lv] of list) { const s = ball(r, lv), x0 = Math.round(x) - r, y0 = Math.round(y) - r; for (let yy = 0; yy < s.d; yy++) { const py = y0 + yy; if (py < 0 || py >= FH) continue; for (let xx = 0; xx < s.d; xx++) { const v = s.a[yy * s.d + xx]; if (v === 255) continue; const px = x0 + xx; if (px >= 0 && px < FW) fb[py * FW + px] = i0 + v; } } }
  }
  /* Sinus-Scroller: Lauftext, jede Bildspalte für sich auf der Welle versetzt; Farbe je Glyphenzeile aus cols */
  function sineScroll(str, t, yc, f, cols, o = {}) {
    const speed = o.speed ?? 96, amp = o.amp ?? 8, len = str.length * f.adv, off = (((t * speed) % len) + len) % len;
    for (let x = 0; x < FW; x++) {
      const sx = (x + off) % len, ci = Math.floor(sx / f.adv), gx = Math.floor(sx - ci * f.adv); if (gx >= f.w) continue;
      const a = f.g[str[ci]] ?? f.g['?'], y0 = Math.round(yc - f.h / 2 + Math.sin(x * (o.freq ?? 0.045) + t * (o.rate ?? 3.2)) * amp);
      for (let yy = 0; yy < f.h; yy++) { if (!a[yy * f.w + gx]) continue; const py = y0 + yy; if (py < 0 || py >= FH) continue; if (o.shadow !== undefined && py + 1 < FH && x + 1 < FW) fb[(py + 1) * FW + x + 1] = o.shadow; fb[py * FW + x] = cols[yy]; }
    }
  }
  /* Blockauflösung: p 0…1 — Anteil der 8 × 8-Blöcke, die schwarz sind (Reihenfolge fest gewürfelt) */
  function blocks(p, seed = 0) { if (p <= 0) return; for (let by = 0; by < FH; by += 8) for (let bx = 0; bx < FW; bx += 8) if (hash(bx * 0.73 + by * 1.91 + seed * 5.3) < p) rect(bx, by, 8, 8, 0); }

  const api = { FW, FH, fb, pal, C, FONT, setc, getc, ramp, basePal, present, cls, rect, pset, frame, line, tri, blit, up, tw, text, wrap, fitFont, rows, stamp, sprite, quant, pic, usePal, stars, sky, copper, plasma, tunnel, roto, fire, solid, balls, ball, sineScroll, blocks, PARTS: {}, chk: null, noFlash: null };
  return api;
})();
