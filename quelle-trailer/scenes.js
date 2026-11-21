/* Trailer — Stimmungen (Themes), Hintergründe und Szenen. Jede Szene: fn(lt, D) mit lokaler Zeit lt und Dauer D (Sekunden). */
'use strict';
const Q = new URLSearchParams(location.search);
const LEN = [60, 90, 120].includes(+Q.get('len')) ? +Q.get('len') : 60;
const MOOD = ['cine', 'drive', 'calm'].includes(Q.get('mood')) ? Q.get('mood') : 'cine';
const LANG = Q.get('lang') === 'en' ? 'en' : 'de';
const T = TXT[LANG];

/* Drei Stimmungen auf den Gründen der Marke: Nacht (Mondhimmel), Tinte, Creme */
const THEMES = {
  cine: { name: 'cinematic', bpm: 96, dark: true, bg: BR.night, ink: BR.cream, soft: '#B4B9D0', mute: '#7C83A3', line: 'rgba(246,241,232,0.16)', accent: BR.orange, accentText: BR.orange, card: 'rgba(255,255,255,0.055)', style: 'rise', inDur: 1.0, pace: 1, top: 170, bot: 910, td: 0.9 },
  drive: { name: 'treibend', bpm: 128, dark: true, bg: BR.ink, ink: BR.cream, soft: BR.mutedDark, mute: '#8A8273', line: 'rgba(246,241,232,0.15)', accent: BR.orange, accentText: BR.orange, card: 'rgba(246,241,232,0.06)', style: 'mask', inDur: 0.36, pace: 0.42, top: 96, bot: 984, td: 0.6 },
  calm: { name: 'ruhig', bpm: 80, dark: false, bg: BR.cream, ink: BR.ink, soft: BR.text2, mute: BR.meta, line: BR.line, accent: BR.orange, accentText: BR.glassDark, card: 'rgba(255,255,255,0.7)', style: 'fade', inDur: 1.3, pace: 1.15, top: 110, bot: 970, td: 1.2 },
};
const TH = THEMES[MOOD];
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
function bg(t, o) { if (MOOD === 'cine') bgNight(t, o); else if (MOOD === 'drive') bgInk(t, o); else bgCream(t, o); }

/* ---------- Bausteine ---------- */
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
  bg(lt, { warm: 0.1 });
  const cx = W / 2, cy = CY - 30, hBig = 240, m = 150;
  const tLock = MOOD === 'drive' ? 2 * BAR : D * 0.6; // ab hier wird das Zeichen zum Lockup
  const pl = E_REVEAL(seg(lt, tLock, tLock + (MOOD === 'drive' ? 0.5 : 1.1)));
  /* Lichtblitz auf dem Schlag — hinter dem Zeichen (kein Effekt auf dem Zeichen selbst) */
  if (MOOD === 'drive' && lt >= tLock) { const f = Math.exp(-(lt - tLock) * 7); g.fillStyle = rgba(BR.cream, 0.3 * f); g.fillRect(0, 0, W, H); }
  const size = 0.9275 * m, mw = (m * 28) / 24, total = mw + 0.46 * m + wordmarkWidth(size), x0 = cx - total / 2;
  const zx = lerp(cx, x0 + mw / 2, pl), zh = lerp(hBig, m, pl);
  if (MOOD === 'cine') {
    glow(cx, cy, 620, BR.apricot, 0.08 * (1 - pl));
    const p = seg(lt, 0.35, tLock - 0.25);
    if (p < 1) introTransform(cx, cy, hBig * 2, p); else zeichen(zx, cy, zh);
  } else if (MOOD === 'drive') {
    if (lt < tLock - 0.15) { const loop = (lt % (2 * B)) / (2 * B); zeichenSweep(cx, cy, hBig, loop); }
    else { const k = seg(lt, tLock - 0.15, tLock); g.save(); g.globalAlpha = 1 - k; zeichenSweep(cx, cy, hBig, 1); g.restore(); g.save(); g.globalAlpha = k; zeichen(zx, cy, zh); g.restore(); }
  } else {
    const p = seg(lt, 0.7, 2.5); if (p < 1) zeichenReveal(cx, cy, hBig, p); else zeichen(zx, cy, zh);
  }
  if (pl > 0) {
    wordmark(x0 + mw + 0.46 * m, cy + size * 0.345, size, TH.ink, { p: seg(pl, 0.25, 1) });
    const pt = seg(lt, tLock + (MOOD === 'drive' ? 0.5 : 1.0), tLock + (MOOD === 'drive' ? 0.9 : 2.0));
    const tag = `${NAME} · ${ROLE} · ${FOCUS.join(', ')}`;
    text(tag, cx, cy + m * 0.5 + 92 + (1 - eOut(pt)) * 10, { size: 24, weight: 500, fam: MONO, align: 'center', color: TH.soft, alpha: eOut(pt) });
  }
}

/* ---------- Szene: Anspruch ---------- */
function scClaim(lt, D) {
  bg(lt);
  const size = 176;
  if (MOOD === 'cine') {
    skyMoon(W * 0.76, CY - 20, 250, eIO(seg(lt, 0, D)), eOut(seg(lt, 0, 1.6)));
    const x = 190, y = CY - 40;
    kicker(T.claimKicker, x, y - size * 0.95, pin(lt, 0));
    drawLine(tokens(CLAIM[0]), x, y, size, pin(lt, 1, 1.2), { style: 'rise', color: TH.ink });
    g.save(); g.fillStyle = glassFill(y + 40, y + size * 1.15);
    drawLine(tokens(CLAIM[1], { serif: true }), x, y + size * 1.06, size, pin(lt, 3, 1.2), { style: 'rise', color: g.fillStyle }); g.restore();
    text(T.claimSub.join(' '), x + 6, y + size * 1.06 + 96, { size: 40, weight: 500, color: TH.soft, alpha: eOut(pin(lt, 6)) });
  } else if (MOOD === 'drive') {
    const cx = W / 2, y = CY - 20, toks = [...tokens(CLAIM[0]), ...tokens(CLAIM[1], { serif: true, color: BR.orange })];
    /* je Schlag ein Wort; die Zeile steht nach fünf Schlägen */
    const L1 = layoutLine(tokens(CLAIM[0]), size), L2 = layoutLine(tokens(CLAIM[1], { serif: true }), size);
    const at = (i) => seg(lt, i * B, i * B + 0.2);
    let k = 0;
    L1.items.forEach((it) => { const q = at(k++); if (q > 0) { g.save(); const px = cx - L1.width / 2 + it.x + it.w / 2; g.translate(px, y - 50); g.scale(lerp(1.4, 1, eOut5(q)), lerp(1.4, 1, eOut5(q))); g.translate(-px, -(y - 50)); text(it.t, cx - L1.width / 2 + it.x, y, { size: it.sz, weight: 800, ls: it.ls, color: TH.ink, alpha: seg(q, 0, 0.4) }); g.restore(); } });
    L2.items.forEach((it) => { const q = at(k++); if (q > 0) { g.save(); const px = cx - L2.width / 2 + it.x + it.w / 2; g.translate(px, y + size); g.scale(lerp(1.4, 1, eOut5(q)), lerp(1.4, 1, eOut5(q))); g.translate(-px, -(y + size)); text(it.t, cx - L2.width / 2 + it.x, y + size * 1.06, { size: it.sz, weight: 400, fam: SER, italic: true, color: BR.orange, alpha: seg(q, 0, 0.4) }); g.restore(); } });
    void toks;
    kicker(T.claimKicker, cx, y - size * 0.98, seg(lt, 0, 0.3), 'center');
    const ps = seg(lt, 6 * B, 6 * B + 0.3);
    if (ps > 0) { const str = T.claimSub.join(' '), w = measure(str, 40, 700) + 56; g.save(); g.globalAlpha = ps; g.fillStyle = BR.cream; rr(cx - w / 2, y + size * 1.06 + 50, w * E_WIPE(ps), 66, 8); g.fill(); g.beginPath(); g.rect(cx - w / 2, y + size * 1.06 + 50, w * E_WIPE(ps), 66); g.clip(); text(str, cx, y + size * 1.06 + 97, { size: 40, weight: 700, color: BR.ink, align: 'center' }); g.restore(); }
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
  const per = MOOD === 'drive' ? 2 * B : MOOD === 'cine' ? BAR : BAR * 0.9, ri = Math.floor(Math.max(0, lt - 1.2) / per), rp = (Math.max(0, lt - 1.2) % per) / per;
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
    const p = MOOD === 'drive' ? seg(lt, (2 + i) * B, (2 + i) * B + 0.22) : pin(lt, 3 + i * 1.6);
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
  const speed = MOOD === 'drive' ? 240 : MOOD === 'cine' ? 70 : 34, size = 92, y0 = top + 340, dy = (TH.bot - 110 - y0) / 2;
  STACK_ROWS.forEach((row, r) => {
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
  });
  /* weiche Ränder */
  [0, 1].forEach((k) => { const gr = g.createLinearGradient(k ? W - 220 : 0, 0, k ? W : 220, 0); gr.addColorStop(k ? 1 : 0, TH.bg); gr.addColorStop(k ? 0 : 1, rgba(TH.bg, 0)); g.fillStyle = gr; g.fillRect(k ? W - 220 : 0, y0 - size, 220, dy * 2 + size * 1.4); });
  const pn = eOut(pin(lt, 7)); label(T.stackNext + ' — ' + STACK_NEXT.join(' · '), W - 180, top + 30, { size: 20, color: TH.soft, alpha: pn, align: 'right', track: 0.08 });
}

/* ---------- Szene: Reise ---------- */
function journeyPick(n) { const order = ['2004', '2007', '2016', '2026', '2020', '2010', '2019', '2023']; const keep = order.slice(0, clamp(n, 4, 8)); return JOURNEY.filter((j) => keep.includes(j.y)); }
function scJourney(lt, D, o) {
  bg(lt);
  const list = journeyPick(o.n), n = list.length, Ds = D / n, i = clamp(Math.floor(lt / Ds), 0, n - 1), q = lt - i * Ds;
  const x = 180, top = TH.top + 40, railY = TH.bot - 70;
  kicker(T.journeyKicker, x, top + 30, pin(lt, 0));
  label(`${String(i + 1).padStart(2, '0')} / ${String(n).padStart(2, '0')}`, W - 180, top + 30, { size: 20, color: TH.soft, align: 'right', alpha: eOut(pin(lt, 1)) });
  const inD = MOOD === 'drive' ? 0.2 : MOOD === 'cine' ? 0.7 : 0.9, outD = MOOD === 'drive' ? 0 : MOOD === 'cine' ? 0.35 : 0.5;
  const a = seg(q, 0, inD), b = i < n - 1 && outD > 0 ? seg(q, Ds - outD, Ds) : 0, al = eOut(a) * (1 - b);
  const it = list[i], tx = it[LANG], yY = CY + 70;
  /* Jahr groß */
  g.save(); g.globalAlpha = al;
  const ySize = 320, dy = MOOD === 'drive' ? 0 : (1 - eOut5(a)) * 60 - b * 40;
  if (MOOD === 'drive') { const sc = lerp(1.18, 1, eOut5(a)); g.translate(x, yY); g.scale(sc, sc); g.translate(-x, -yY); }
  g.fillStyle = MOOD === 'calm' ? TH.ink : glassFill(yY - ySize * 0.75, yY + 10);
  setFont(ySize, 800); g.letterSpacing = -0.045 * ySize + 'px'; g.fillText(it.y, x - 10, yY + dy);
  g.restore();
  /* Titel, Rolle, Kurztext */
  const cx = 930, cw = 810, ts = fit(tx[0], cw, 92, 800, MAN, -0.03);
  drawLine(tokens(tx[0]), cx, yY - 150, ts, MOOD === 'drive' ? seg(q, 0.05, 0.3) : seg(q, 0.1, 0.1 + inD * 1.2), { style: TH.style, color: TH.ink, out: b });
  label(`${tx[1]} · ${tx[2]}`, cx + 2, yY - 84, { size: 24, color: TH.accentText, alpha: eOut(seg(q, 0.2 * TH.pace, 0.2 * TH.pace + inD)) * (1 - b), track: 0.1 });
  if (o.blurb) para(tx[3], cx + 2, yY - 26, cw, 30, { color: TH.soft, p: seg(q, 0.35 * TH.pace, 0.35 * TH.pace + inD * 1.4), alpha: 1 - b, lh: 1.42 });
  /* Zeitstrahl */
  const x1 = x, x2 = W - 180, pos = (k) => lerp(x1, x2, n === 1 ? 0 : k / (n - 1));
  const mk = lerp(pos(Math.max(0, i - 1)), pos(i), i === 0 ? 1 : E_SWEEP(seg(q, 0, MOOD === 'drive' ? 0.25 : 0.8)));
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
  const gs = 210, pg = MOOD === 'drive' ? seg(lt, B, B + 0.25) : pin(lt, 1.5, 1.3);
  g.save(); const fill = glassFill(cy - 170, cy - 10);
  if (MOOD === 'drive') { const sc = lerp(1.5, 1, eOut5(pg)); g.translate(cx, cy - 70); g.scale(sc, sc); g.translate(-cx, -(cy - 70)); }
  text('Gold', cx, cy - 6 + (MOOD === 'drive' ? 0 : (1 - eOut5(pg)) * 40), { size: gs * SERIF_SCALE, weight: 400, fam: SER, italic: true, align: 'center', color: fill, alpha: eOut(pg) });
  g.restore();
  const p2 = pin(lt, 4), p3 = pin(lt, 5.5), p4 = pin(lt, 7);
  text(T.awardTop, cx, cy + 84 + (1 - eOut(p2)) * 14, { size: 52, weight: 800, align: 'center', color: TH.ink, alpha: eOut(p2), ls: -1.5 });
  text(T.awardCat, cx, cy + 132, { size: 27, weight: 600, align: 'center', color: TH.soft, alpha: eOut(p3) });
  text(T.awardWhat, cx, cy + 170, { size: 27, weight: 500, align: 'center', color: TH.soft, alpha: eOut(p3) });
  text(T.awardNote, cx, cy + 226, { size: 31, weight: 400, fam: SER, italic: true, align: 'center', color: TH.accentText, alpha: eOut(p4) });
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
  const cut = MOOD === 'drive' ? B : MOOD === 'cine' ? BAR / 2 : BAR;
  LABS.forEach((L, i) => {
    const a = eOut(pin(lt, 3 + i * 1.2)) * (1 - ph2); if (a <= 0) return;
    const on = i === act, k = on ? eOut(seg(lt - i * per, 0, 0.5)) : 1 - eOut(seg(lt - (i + 1) * per, 0, 0.4)), on01 = i === act ? k : i < act ? k : 0;
    const cx = x0 + i * (cw + gap), sc = 1 + 0.045 * on01;
    g.save(); g.globalAlpha = a; g.translate(cx + cw / 2, y + ch / 2 + (1 - a) * 50 - ph2 * 40); g.scale(sc, sc); g.translate(-(cx + cw / 2), -(y + ch / 2));
    g.save(); g.shadowColor = TH.dark ? 'rgba(0,0,0,0.5)' : 'rgba(23,19,16,0.18)'; g.shadowBlur = 40; g.shadowOffsetY = 18; g.fillStyle = '#000'; rr(cx, y, cw, ch, 18); g.fill(); g.restore();
    const lt2 = Math.max(0, lt - i * per), si = on ? Math.floor(lt2 / cut) % L.shots.length : 0, sp = on ? (lt2 % cut) / cut : 1;
    imgCover(IMG[L.shots[si]], cx, y, cw, ch, 18, { zoom: 1.04 + 0.05 * sp });
    if (on && MOOD !== 'drive' && sp < 0.25) { g.save(); g.globalAlpha *= 1 - sp / 0.25; imgCover(IMG[L.shots[(si + L.shots.length - 1) % L.shots.length]], cx, y, cw, ch, 18, { zoom: 1.09 }); g.restore(); }
    if (!on) { g.fillStyle = rgba(TH.dark ? '#000000' : BR.cream, TH.dark ? 0.42 : 0.35); rr(cx, y, cw, ch, 18); g.fill(); }
    g.strokeStyle = on ? TH.accent : TH.line; g.lineWidth = on ? 3 : 1.5; rr(cx, y, cw, ch, 18); g.stroke();
    label(`${L[LANG][0]} · ${L.d}`, cx + 4, y + ch + 40, { size: 17, color: TH.accentText, track: 0.1 });
    text(L.name, cx + 2, y + ch + 86, { size: 40, weight: 800, color: TH.ink, ls: -1 });
    if (o.desc) para(L[LANG][1], cx + 4, y + ch + 124, cw - 10, 22, { color: TH.soft, lh: 1.4, alpha: on ? 1 : 0.6 });
    if (L.credit && on) label(T.osm, cx + 14, y + ch - 16, { size: 13, color: 'rgba(255,255,255,0.85)', track: 0.04 });
    g.restore();
  });
  if (ph2 > 0) {
    const cy = (y + TH.bot) / 2 - 50; label(T.labsMore, W / 2, cy - 84, { size: 24, color: TH.soft, align: 'center', alpha: eOut(ph2) });
    const rows = [LABS_MORE.slice(0, 4), LABS_MORE.slice(4)];
    rows.forEach((row, r) => { const ws = row.map((s) => measure(s, 46, 600) + 69), tot = ws.reduce((s, w) => s + w + 20, -20); let px = (W - tot) / 2; row.forEach((s, i) => { const a = eOut(seg(lt, D1 + 0.1 + (r * 4 + i) * 0.09 * (MOOD === 'drive' ? 0.6 : 1), D1 + 0.6 + (r * 4 + i) * 0.09)); g.save(); g.translate(0, (1 - a) * 24); px += pill(s, px, cy + r * 118, { size: 46, alpha: a, stroke: s === 'LD Beyond' ? TH.accent : undefined }) + 20; g.restore(); }); });
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
  T.siteChips.forEach((c, i) => { const a = eOut(MOOD === 'drive' ? seg(lt, (2 + i * 0.5) * B, (2 + i * 0.5) * B + 0.2) : pin(lt, 5 + i * 0.6)); const w = measure(c, 22, 600) + 33; if (px + w > x + 570) { px = x; py += 58; } /* bleibt links vom Telefon */ px += pill(c, px, py, { size: 22, alpha: a, stroke: i === 0 ? TH.accent : undefined }) + 10; });
  /* Browser mit der neuen Website: Ansichten wechseln, jede fährt langsam nach unten */
  const views = ['siteBeyond', 'siteHome', 'siteLabs', 'siteStory'].filter((k) => IMG[k]);
  const bx = 850, bw = 930, bh = 600, by = CY - bh / 2 + 6, pb = eOut(pin(lt, 2, 1.3));
  const per = Math.max(D / Math.min(views.length || 1, o.views ?? 4), 1.2), vi = Math.floor(lt / per) % Math.max(1, views.length), vp = (lt % per) / per;
  g.save(); g.globalAlpha = pb; g.translate(0, (1 - pb) * 60);
  browser(IMG[views[vi]], bx, by, bw, bh, { dark: true, url: 'loona-designs.de', scroll: eIO(vp) * 0.55, shadow: TH.dark ? 'rgba(0,0,0,0.6)' : 'rgba(23,19,16,0.22)' });
  if (vp < 0.18 && views.length > 1 && lt > per) { g.save(); g.globalAlpha *= 1 - vp / 0.18; browser(IMG[views[(vi + views.length - 1) % views.length]], bx, by, bw, bh, { dark: true, url: 'loona-designs.de', scroll: 0.55, blur: 0 }); g.restore(); }
  g.restore();
  const pp = eOut(pin(lt, 4, 1.3)); if (IMG.siteMob) { g.save(); g.translate(0, (1 - pp) * 80); phone(IMG.siteMob, bx + 10, by + bh - 170, 190, { alpha: pp, scroll: eIO(seg(lt, 1, D)) * 0.5 }); g.restore(); }
}

/* ---------- Szene: Produktfamilie (nur 120 s) ---------- */
function scFamily(lt, D) {
  bg(lt);
  const cx = W / 2, cy = CY - 30;
  kicker(T.familyKicker, cx, cy - 230, pin(lt, 0), 'center');
  const items = [{ key: 'ld', name: 'loona! designs', tag: 'plattform' }, ...FAMILY], n = items.length, sz = 170, step = 310, x0 = cx - ((n - 1) * step) / 2;
  items.forEach((it, i) => {
    const p = MOOD === 'drive' ? seg(lt, i * B, i * B + 0.25) : pin(lt, 1 + i * 1.3), a = eOut(p), px = x0 + i * step, dy = (1 - eOut5(p)) * 50;
    if (it.key === 'ld') badge(px, cy + dy, sz, { alpha: a, moon: seg(lt, 1.2, 2.3), edge: TH.dark ? 'rgba(255,255,255,0.14)' : undefined });
    else { familyTile(px, cy + dy, sz, it.key, a); if (TH.dark) { g.save(); g.globalAlpha = a; g.strokeStyle = 'rgba(255,255,255,0.14)'; g.lineWidth = 1.5; rr(px - sz / 2, cy + dy - sz / 2, sz, sz, sz * 0.22); g.stroke(); g.restore(); } }
    if (it.key === 'ld') { g.save(); g.globalAlpha = a; const ws = 30; wordmark(px - wordmarkWidth(ws) / 2, cy + sz / 2 + 62, ws, TH.ink); g.restore(); }
    else text(it.name, px, cy + sz / 2 + 62, { size: 30, weight: 700, align: 'center', color: TH.ink, alpha: a });
    label(LANG === 'en' && it.tag === 'plattform' ? 'platform' : it.tag, px, cy + sz / 2 + 100, { size: 17, color: TH.soft, align: 'center', alpha: a, track: 0.1 });
  });
}

/* ---------- Szene: Zertifikate ---------- */
function scCerts(lt, D) {
  bg(lt);
  const x = 180, top = TH.top + 40;
  kicker(T.certsKicker, x, top + 30, pin(lt, 0));
  const p1 = pin(lt, 1, 1.2);
  g.save(); g.fillStyle = MOOD === 'calm' ? BR.orange : glassFill(CY - 190, CY + 110);
  text(T.certsTitle[0], x - 14, CY + 110 + (1 - eOut5(p1)) * 50, { size: 400, weight: 800, color: g.fillStyle, alpha: eOut(p1), ls: -18 }); g.restore();
  text(T.certsTitle[1], x, CY + 196, { size: 64, weight: 400, fam: SER, italic: true, color: TH.ink, alpha: eOut(pin(lt, 3)) });
  const lx = 800, lw = W - 180 - lx, rh = (TH.bot - TH.top - 60) / CERTS.length, y0 = TH.top + 34;
  CERTS.forEach((c, i) => {
    const p = MOOD === 'drive' ? seg(lt, (1 + i * 0.5) * B, (1 + i * 0.5) * B + 0.2) : seg(lt, 0.5 + i * (Math.min(D * 0.5, 3.4) / CERTS.length), 1.3 + i * (Math.min(D * 0.5, 3.4) / CERTS.length)), a = eOut(p), y = y0 + i * rh;
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
  bg(lt, { warm: 0.12 });
  const cx = W / 2, cy = CY - 70;
  const tB = MOOD === 'drive' ? 2 * B : Math.min(2.6, D * 0.3); // bis hier steht das Badge (Mondphase), dann Lockup
  const pb = seg(lt, 0, MOOD === 'drive' ? 0.25 : 0.9), swap = seg(lt, tB, tB + (MOOD === 'drive' ? 0.25 : 0.7));
  if (swap < 1) { const sc = lerp(0.86, 1, eOut5(pb)); badge(cx, cy, 250 * sc, { alpha: eOut(pb) * (1 - swap), moon: seg(lt, MOOD === 'drive' ? B : 0.7, MOOD === 'drive' ? B + 0.5 : 1.7), edge: TH.dark ? 'rgba(255,255,255,0.14)' : undefined }); }
  if (swap > 0) {
    const m = 120;
    g.save(); g.globalAlpha = swap; lockup(cx, cy, m, TH.ink, { pw: seg(swap, 0.2, 1) }); g.restore();
    const t2 = lt - tB, st = MOOD === 'drive' ? B : 0.6;
    const pcl = seg(t2, st, st + TH.inDur), y1 = cy + 190;
    const toks = [...tokens(CLAIM[0], { weight: 700 }), ...tokens(CLAIM[1], { serif: true, color: TH.accent })];
    drawLine(toks, cx, y1, 72, pcl, { style: TH.style === 'mask' ? 'mask' : 'fade', color: TH.ink, align: 'center', weight: 700 });
    text(T.outroSub.join(' '), cx, y1 + 62, { size: 32, weight: 500, align: 'center', color: TH.soft, alpha: eOut(seg(t2, st * 2, st * 2 + TH.inDur)) });
    const pl = eOut(seg(t2, st * 3, st * 3 + TH.inDur)), ly = TH.bot - 60;
    hair(cx - 520 * pl, ly - 52, cx + 520 * pl, pl);
    const ws = LINKS.map((s) => measure(s.toUpperCase(), 20, 500, MONO, 20 * 0.08)), gapL = 60, tot = ws.reduce((s, w) => s + w + gapL, -gapL); let px = cx - tot / 2;
    LINKS.forEach((s, i) => { label(s, px, ly, { size: 20, color: i === 0 ? TH.ink : TH.soft, alpha: pl, track: 0.08 }); px += ws[i] + gapL; });
  }
}
