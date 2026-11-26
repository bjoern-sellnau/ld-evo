/* Kino-Trailer „Über mich · 20 Jahre Erfahrung“ (Stimmung ka, 96 BPM) — Drehbuch.
   Ablauf: Auftakt (Freigabe-Tafel, „loona! designs zeigt“) → Anfänge (2004 – 2006, „Das Web ist meine Bühne.“) → Laufbahn 2007 – 2026 als
   Schnittfolge auf den Schlag → Gold 2017 → Handwerk (Fokus, Zertifikate, Sekundenzähler) → Stille („Vom Flash-Kid zum Senior Engineer —
   ohne die Neugier zu verlieren.“) → Labs als schnelle Montage → Titel → Abspann-Block.
   Alle Angaben aus data.js (Stationen nach den Angaben von Bjoern Sellnau vom 21./22.11.2026). „20 Jahre Erfahrung“ ist der gewünschte
   Titel (26.11.2026); die Zählung „Jahr 01 … 20“ läuft über die Kalenderjahre 2007 bis 2026 — 2026 ist das zwanzigste Berufsjahr
   (Start 09/2007). */
'use strict';
const KA = {
  de: { true: 'Nach einer wahren Geschichte', insight: 'Und eine Erkenntnis:', stage: 'Das Web ist meine Bühne.', year: 'Jahr', focus: 'Mein Fokus', title: ['20 Jahre', 'Erfahrung'], soon: 'Demnächst', gold: 'Gold',
    bill: [[['s', 'loona! designs zeigt'], ['b', 'Bjoern Sellnau'], ['s', 'in'], ['b', '20 Jahre Erfahrung']], [['s', 'mit'], ['b', 'React'], ['b', 'Next.js'], ['b', 'TypeScript'], ['b', 'React Native'], ['b', 'Node'], ['b', 'GraphQL']], [['s', 'ausgezeichnet mit'], ['b', 'Gold · Best of Swiss Web 2017']], [['s', 'Ausbilder nach'], ['b', 'AEVO'], ['s', 'dazu'], ['b', '10 Zertifikate']], [['s', 'Bild'], ['b', 'Canvas'], ['s', 'Musik'], ['b', 'Web Audio'], ['s', 'ohne'], ['b', 'Samples']]] },
  en: { true: 'Based on a true story', insight: 'And one realization:', stage: 'The web is my stage.', year: 'Year', focus: 'My focus', title: ['20 years', 'of experience'], soon: 'Coming soon', gold: 'Gold',
    bill: [[['s', 'loona! designs presents'], ['b', 'Bjoern Sellnau'], ['s', 'in'], ['b', '20 Years of Experience']], [['s', 'with'], ['b', 'React'], ['b', 'Next.js'], ['b', 'TypeScript'], ['b', 'React Native'], ['b', 'Node'], ['b', 'GraphQL']], [['s', 'winner of'], ['b', 'Gold · Best of Swiss Web 2017']], [['s', 'certified trainer'], ['b', 'AEVO'], ['s', 'plus'], ['b', '10 certificates']], [['s', 'picture'], ['b', 'Canvas'], ['s', 'music'], ['b', 'Web Audio'], ['s', 'no'], ['b', 'samples']]] },
}[LANG];
const kJ = (y) => JOURNEY.find((x) => x.y === y);

/* ---------- Anfänge ---------- */
KS.begin = {
  sec: 'piano',
  plan(D, bars) { const sh = bars >= 4 ? ['true', 'old', 'line'] : ['old', 'line'], cuts = kSplit(D, bars >= 5 ? [1.5, 2.2, 2.3] : bars >= 4 ? [1, 1.4, 1.6] : [1.25, 1.75]); return { sh, cuts, hits: cuts.slice(1, -1).map((c) => [c, 0.2]) }; },
  draw(lt, D, P) {
    const { i, t, d } = kAt(P.cuts, lt), kind = P.sh[i];
    kaBg(lt, { cool: 0.08, warm: 0.05, mid: 0.7 });
    if (kind === 'true') kCard([{ s: KA.true.toUpperCase(), size: 38, w: 600, track: 0.42 }], t, d, { inD: 0.9 });
    else if (kind === 'old') {
      /* drei freie Projekte der Anfangsjahre, nacheinander im Fenster */
      const list = [ORIGIN[0], ORIGIN[2], ORIGIN[3]], n = list.length, q = clamp((t / d) * n, 0, n - 0.001), ix = Math.floor(q), fr = q - ix, o = list[ix], a = eOut(seg(t, 0, 0.6)) * (1 - eIn(seg(t, d - 0.4, d)));
      const bw = 780, bh = 580, bx = W - 170 - bw, by = KCY - bh / 2, sc = 1 + 0.04 * (t / d);
      g.save(); g.globalAlpha = a; g.translate(bx + bw / 2, KCY); g.scale(sc, sc); g.translate(-(bx + bw / 2), -KCY);
      browser(IMG[o.img], bx, by, bw, bh, { dark: true, alpha: 1, blur: 80 });
      if (fr < 0.14 && ix > 0) { g.save(); g.globalAlpha = a * (1 - fr / 0.14); browser(IMG[list[ix - 1].img], bx, by, bw, bh, { dark: true, blur: 0 }); g.restore(); }
      /* Bild leicht zurücknehmen — die Seiten von damals sind sehr hell */
      g.fillStyle = 'rgba(4,6,15,0.22)'; rr(bx, by, bw, bh, 16); g.fill();
      g.restore();
      const J = kJ('2004')[LANG], x = 170, hs = kFit(J[0], 760, 76, { w: 800, fam: MAN, track: -0.02 });
      kLabel(T.originKicker, x, KCY - 110, { size: 20, align: 'left', alpha: a, track: 0.2 });
      kText(J[0], x, KCY - 10, { size: hs, w: 800, fam: MAN, track: -0.02, align: 'left', alpha: a * eOut(seg(t, 0.15, 0.9)) });
      kText(J[1], x, KCY + 52, { size: 34, w: 500, fam: MAN, align: 'left', col: KL.soft, alpha: a * eOut(seg(t, 0.5, 1.2)) });
      kLabel(`${o.y} · ${o[LANG][0]} · ${o[LANG][1]}`, x, KCY + 150, { size: 18, align: 'left', alpha: a * 0.9, track: 0.14, col: BR.apricot });
    } else {
      kCard([{ s: KA.insight, size: 40, w: 500, fam: MAN, col: KL.soft, lh: 1.9 }, { s: KA.stage, size: 118, w: 400, fam: SER, it: true, at: Math.min(1.0, d * 0.25), grow: 0.01 }], t, d, { inD: 1.0, outD: 0.6 });
      kFlare(W / 2, KCY + 120, 700, KL.warm, 0.25 * eOut(seg(t, 1.0, 2.2)) * (1 - seg(t, d - 0.6, d)));
    }
  },
};

/* ---------- Laufbahn 2007 – 2026 ---------- */
function kaTimeline(y, year, prev, tl, a) {
  /* zwanzig Marken = zwanzig Kalenderjahre 2007 … 2026; die Füllung läuft bis zum Jahr der Station */
  const x0 = 300, x1 = W - 300, xs = (yr) => lerp(x0, x1, (yr - 2007) / 19), cur = lerp(prev, year, eOut5(seg(tl, 0, 0.55)));
  g.save(); g.globalAlpha *= a; g.fillStyle = rgba(BR.cream, 0.16); g.fillRect(x0, y - 1, x1 - x0, 2); g.fillStyle = BR.orange; g.fillRect(x0, y - 1.5, xs(cur) - x0, 3);
  for (let yr = 2007; yr <= 2026; yr++) { const on = yr <= cur + 0.01; g.fillStyle = on ? rgba(BR.cream, 0.9) : rgba(BR.cream, 0.28); g.fillRect(xs(yr) - 1, y - (on ? 9 : 6), 2, on ? 18 : 12); }
  g.fillStyle = BR.orange; g.beginPath(); g.arc(xs(cur), y, 7, 0, 7); g.fill(); glow(xs(cur), y, 46, BR.orange, 0.5);
  g.restore();
  kLabel('2007', x0 - 26, y + 7, { size: 18, align: 'right', track: 0.14, alpha: a, col: KL.mute }); kLabel('2026', x1 + 26, y + 7, { size: 18, align: 'left', track: 0.14, alpha: a, col: KL.mute });
}
KS.career = {
  sec: 'pulse',
  plan(D, bars) {
    const st = bars >= 5 ? ['2007', '2010', '2016', '2019', '2020', '2023', '2026'] : ['2007', '2010', '2016', '2020', '2023', '2026'];
    const cuts = kSplit(D, bars >= 10 ? [6, 5, 6, 5, 6, 5, 7] : bars >= 8 ? [5, 4, 5, 4, 5, 4, 5] : bars >= 5 ? [3, 3, 3, 3, 3, 2, 3] : [2, 2, 2, 2, 2, 2]);
    return { st, cuts, hits: cuts.slice(0, -1).map((c) => [c, 0.9]) };
  },
  draw(lt, D, P) {
    const { i, t, d } = kAt(P.cuts, lt), y = P.st[i], J = kJ(y)[LANG], yr = +y, prev = i ? +P.st[i - 1] : 2007, long = d > 3.2;
    kaBg(lt, { cool: 0.12, warm: 0.06 });
    kPunch(t, 0.03, () => {
      const sl = eOut5(seg(t, 0, 0.4)), a = seg(t, 0, 0.07), sc = lerp(1.16, 1, sl) * (1 + 0.025 * (t / d)), yc = KCY - (long ? 46 : 26);
      /* Lichtstreifen zieht mit dem Schnitt durch */
      kFlare(lerp(W * 0.15, W * 0.85, eOut(seg(t, 0, 0.7))), yc - 10, 900, i % 2 ? KL.warm : KL.cool, 0.55 * (1 - seg(t, 0.1, 0.9)) + 0.1);
      g.save(); g.translate(W / 2, yc); g.scale(sc, sc); g.translate(-W / 2, -yc);
      kText(y, W / 2, yc + 108, { size: 310, w: 800, fam: MAN, track: -0.02, grad: [[0, '#FFFFFF'], [0.55, BR.cream], [1, rgba(BR.cream, 0.45)]], alpha: a });
      g.restore();
      kLabel(`${KA.year} ${String(yr - 2006).padStart(2, '0')} / 20`, W / 2, KT + 86, { size: 22, track: 0.36, col: BR.apricot, alpha: eOut(seg(t, 0.05, 0.4)) });
      const ty = yc + 196, ts = kFit(J[0], 1400, 62, { w: 800, fam: MAN, track: -0.01 });
      g.save(); g.beginPath(); g.rect(0, ty - 70, W, 96); g.clip(); kText(J[0], W / 2, ty + (1 - E_REVEAL(seg(t, 0.08, 0.5))) * 80, { size: ts, w: 800, fam: MAN, track: -0.01 }); g.restore();
      kLabel(`${J[1]} · ${J[2]}`, W / 2, ty + 54, { size: 21, track: 0.22, alpha: eOut(seg(t, 0.25, 0.7)) });
      if (long) kText(kFitLine(J[3], 1300, 28), W / 2, ty + 106, { size: 28, w: 500, fam: MAN, col: KL.mute, alpha: eOut(seg(t, 0.6, 1.3)) });
    });
    kaTimeline(KBO - 64, yr, prev, t, eOut(seg(lt, 0, 0.5)));
    if (i) kCutFlash(t, 0.4);
  },
};
/* Satz auf eine Zeile kürzen: bis zum ersten Gedankenstrich oder Doppelpunkt, wenn er sonst nicht passt */
function kFitLine(str, max, size) { if (measure(str, size, 500, MAN) <= max) return str; const cut = str.split(/ — |: /)[0]; return measure(cut, size, 500, MAN) <= max ? cut + (/[.!?]$/.test(cut) ? '' : '.') : cut; }

/* ---------- Gold ---------- */
KS.gold = {
  sec: 'lift', flash: 0.55,
  draw(lt, D) {
    kaBg(lt, { cool: 0.05, warm: 0.16 });
    const cy = KCY - 112, R = 196, sc = 1 + 0.04 * (lt / D), f = Math.min(1, D / 5), out = 1 - eIn(seg(lt, D - 0.35, D));
    g.save(); g.globalAlpha = out; g.translate(W / 2, KCY); g.scale(sc, sc); g.translate(-W / 2, -KCY);
    glow(W / 2, cy, 560, BR.apricot, 0.2 * eOut(seg(lt, 0, 0.8)));
    kLaurel(W / 2, cy, R, BR.apricot, 0.95, eOut(seg(lt, 0.05 * f, 1.0 * f)));
    kLabel(T.awardKicker, W / 2, cy - 58, { size: 17, track: 0.4, col: KL.soft, alpha: eOut(seg(lt, 0.2 * f, 0.8 * f)) });
    const p = seg(lt, 0.1 * f, 0.5 * f);
    kSweep(() => { g.save(); const s2 = lerp(1.25, 1, eOut5(p)); g.translate(W / 2, cy + 10); g.scale(s2, s2); g.translate(-W / 2, -(cy + 10)); kText(KA.gold.toUpperCase(), W / 2, cy + 44, { size: 92, w: 800, fam: MAN, track: 0.1, grad: [[0, '#FFF3D6'], [0.5, BR.apricot], [1, '#C8791F']], alpha: seg(lt, 0.1 * f, 0.2 * f) }); g.restore(); }, seg(lt, 0.5 * f, 1.7 * f), '#FFFFFF', 0.85);
    kText(T.awardTop, W / 2, cy + R + 112, { size: 68, w: 800, fam: MAN, track: -0.01, alpha: eOut(seg(lt, 0.45 * f, 1.1 * f)) });
    kLabel(`${T.awardCat} · ${T.awardWhat}`, W / 2, cy + R + 168, { size: 21, track: 0.2, alpha: eOut(seg(lt, 0.8 * f, 1.5 * f)) });
    if (D > 4.5) kLabel(T.awardNote, W / 2, cy + R + 212, { size: 16, track: 0.18, col: KL.mute, alpha: eOut(seg(lt, 1.5, 2.3)) });
    g.restore();
    kFlare(W / 2, cy + 10, 760, BR.apricot, 0.5 * Math.exp(-lt * 1.6));
  },
};

/* ---------- Handwerk: Fokus, Zertifikate, Sekunden ---------- */
KS.craft = {
  sec: 'drive', flash: 0.4,
  /* ein Takt (30 s): nur die vier Wörter des Fokus */
  plan(D, bars) { const cuts = kSplit(D, bars >= 6 ? [2, 2, 2, 2, 7, 9] : bars >= 5 ? [2, 2, 2, 2, 5, 7] : bars >= 3 ? [1, 1, 1, 1, 4, 4] : bars >= 2 ? [1, 1, 1, 1, 2, 2] : [1, 1, 1, 1]); return { cuts, hits: cuts.slice(0, -1).map((c, i) => [c, i < 4 ? 0.9 : 0.6]) }; },
  draw(lt, D, P) {
    const { i, t, d } = kAt(P.cuts, lt);
    kaBg(lt, { cool: 0.14, warm: 0.07 });
    if (i < 4) {
      const wd = STACK_FOCUS[i], size = kFit(wd, 1500, 250, { w: 800, fam: MAN, track: -0.03 });
      kPunch(t, 0.04, () => {
        kFlare(W / 2, KCY + 6, 980, i % 2 ? KL.cool : KL.warm, 0.5 * Math.exp(-t * 2.5) + 0.08);
        const sc = lerp(1.22, 1, eOut5(seg(t, 0, 0.35))) * (1 + 0.03 * (t / d));
        g.save(); g.translate(W / 2, KCY); g.scale(sc, sc); g.translate(-W / 2, -KCY); kText(wd, W / 2, KCY + size * 0.34, { size, w: 800, fam: MAN, track: -0.03, grad: [[0, '#FFFFFF'], [1, rgba(BR.cream, 0.7)]], alpha: seg(t, 0, 0.06) }); g.restore();
        kLabel(KA.focus, W / 2, KT + 86, { size: 22, track: 0.36, col: BR.apricot });
        for (let q = 0; q < 4; q++) { g.fillStyle = q === i ? BR.orange : rgba(BR.cream, 0.25); g.beginPath(); g.arc(W / 2 + (q - 1.5) * 34, KBO - 76, q === i ? 7 : 5, 0, 7); g.fill(); }
      });
      kCutFlash(t, 0.3);
    } else if (i === 4) {
      /* zehn Zertifikate: Zahl links, die Liste baut sich rechts auf */
      const a = 1 - eIn(seg(t, d - 0.3, d)), x = 250;
      g.save(); g.globalAlpha = a;
      kText(T.certsTitle[0], x, KCY + 120, { size: 400, w: 800, fam: MAN, align: 'left', track: -0.04, grad: [[0, '#FFFFFF'], [1, rgba(BR.cream, 0.5)]], alpha: seg(t, 0, 0.08) });
      kText(T.certsTitle[1], x + 8, KCY + 210, { size: 66, w: 400, fam: SER, it: true, align: 'left', alpha: eOut(seg(t, 0.15, 0.6)) });
      const lx = 800, n = CERTS.length, lh = 54, y0 = KCY - ((n - 1) * lh) / 2 + 8, st = Math.min(0.14, (d * 0.55) / n);
      CERTS.forEach((c, r) => { const p = eOut(seg(t, 0.1 + r * st, 0.1 + r * st + 0.35)); if (p <= 0) return; kLabel(c.d, lx, y0 + r * lh, { size: 17, align: 'left', track: 0.12, col: BR.apricot, alpha: p }); const nm = c[LANG]; text(nm, lx + 130 + (1 - p) * 24, y0 + r * lh, { size: fit(nm, 760, 27, 600, MAN), weight: 600, color: KL.ink, alpha: p }); });
      g.restore();
      kCutFlash(t, 0.35);
    } else {
      /* Sekunden im Dienst des Webs — der Zähler der Website läuft weiter */
      const [l1, l2] = T.secLabel.split(' — '), a = 1 - eIn(seg(t, d - 0.3, d)), num = fmtInt(SEC0 + 4 * 24 * 3600 + lt * 1, LANG), sc = 1 + 0.035 * (t / d);
      g.save(); g.globalAlpha = a; g.translate(W / 2, KCY); g.scale(sc, sc); g.translate(-W / 2, -KCY);
      kText(num, W / 2, KCY + 34, { size: 190, w: 700, fam: MONO, track: -0.02, grad: [[0, '#FFFFFF'], [1, rgba(BR.cream, 0.6)]], alpha: seg(t, 0, 0.08) });
      kLabel(l1, W / 2, KCY + 124, { size: 26, track: 0.3, col: KL.ink, alpha: eOut(seg(t, 0.15, 0.7)) });
      if (l2) kText(l2.replace(/\.$/, '') + '.', W / 2, KCY + 180, { size: 34, w: 400, fam: SER, it: true, col: KL.soft, alpha: eOut(seg(t, 0.4, 1.1)) });
      g.restore();
      kFlare(W / 2, KCY + 64, 880, KL.cool, 0.3 * Math.exp(-t * 2) + 0.06);
      kCutFlash(t, 0.35);
    }
  },
};

/* ---------- Stille ---------- */
KS.stop = {
  sec: 'stop',
  draw(lt, D) {
    kaBg(lt, { cool: 0.04, warm: 0.03, mid: 0.45, dust: 0.6 });
    const f = Math.min(1, D / 6.5), s1 = kFit(T.originTitle[0], 1500, 70, { w: 400, fam: SER, it: true });
    kCard([{ s: T.originTitle[0], size: s1, w: 400, fam: SER, it: true, col: KL.soft, at: 0.5 * f, grow: 0.008 }, { s: T.originTitle[1], size: s1 * 1.18, w: 400, fam: SER, it: true, at: 2.1 * f, grow: 0.008 }], lt, D, { inD: 1.1 * f + 0.2, outD: 0.5, push: 0.03 });
  },
};

/* ---------- Labs: Montage ---------- */
const KA_LABS = ['cfTitle', 'coP3', 'sfGate', 'cf13', 'coP6', 'sfTower', 'cf15', 'coP1', 'sfNight', 'cf18', 'coP5', 'sfReichstag', 'cf00', 'coP2', 'sfSpree', 'coP7', 'sfTitle', 'coModes', 'coP4', 'cf13'];
KS.labs = {
  sec: 'peak', flash: 0.7,
  plan(D, bars) {
    const mon = bars >= 7 ? [2, 2, 2, 2, 1, 1, 1, 1, 1, 1, 1, 1, 0.5, 0.5, 0.5, 0.5, 0.5, 0.5, 0.5, 0.5] : bars >= 5 ? [2, 2, 1, 1, 1, 1, 1, 1, 0.5, 0.5, 0.5, 0.5, 0.5, 0.5] : bars >= 3 ? [1, 1, 1, 1, 1, 1, 0.5, 0.5, 0.5, 0.5] : [1, 1, 1, 1, 0.5, 0.5, 0.5, 0.5];
    const open = bars >= 7 ? 4 : bars >= 5 ? 3 : 2, end = bars >= 5 ? 4 : bars >= 3 ? 2 : 0, w = [open, ...mon, ...(end ? [end] : [])], cuts = kSplit(D, w, B / 2);
    return { cuts, n: mon.length, end: !!end, hits: cuts.slice(1, -1).map((c, i) => [c, w[i + 1] >= 1 ? 0.55 : 0.3]) };
  },
  draw(lt, D, P) {
    const { i, t, d } = kAt(P.cuts, lt);
    if (i === 0) {
      kaBg(lt, { cool: 0.16, warm: 0.08 });
      kPunch(t, 0.04, () => { const sc = lerp(1.2, 1, eOut5(seg(t, 0, 0.4))) * (1 + 0.03 * (t / d)); g.save(); g.translate(W / 2, KCY); g.scale(sc, sc); g.translate(-W / 2, -KCY); kText(T.labsAllTitle[0].toUpperCase(), W / 2, KCY + 62, { size: 250, w: 800, fam: MAN, track: 0.01, grad: [[0, '#FFFFFF'], [1, rgba(BR.cream, 0.6)]], alpha: seg(t, 0, 0.06) }); g.restore(); kLabel(T.labsAllTitle[1].replace(/\.$/, ''), W / 2, KCY + 150, { size: 28, track: 0.4, col: BR.apricot, alpha: eOut(seg(t, 0.2, 0.6)) }); });
      kFlare(W / 2, KCY + 10, 1000, KL.warm, 0.5 * Math.exp(-t * 2.2));
      return;
    }
    if (P.end && i === P.cuts.length - 2) {
      kaBg(lt, { cool: 0.1, warm: 0.1 });
      kCard([{ s: T.labsTitle[0].toUpperCase(), size: 60, w: 800, fam: MAN, track: 0.12 }, { s: T.labsTitle[1].toUpperCase(), size: 60, w: 800, fam: MAN, track: 0.12, col: BR.apricot, at: B }], t, d, { inD: 0.3, outD: 0.2, push: 0.05, stag: 0 });
      kCutFlash(t, 0.4);
      return;
    }
    const key = KA_LABS[(i - 1) % KA_LABS.length], lab = LABS.find((l) => l.shots.includes(key)), h1 = hash(i * 3.7), h2 = hash(i * 5.3 + 1), inw = i % 2 === 0;
    kPunch(t, d < B * 0.8 ? 0.02 : 0.035, () => kShot(IMG[key], t, d, { z0: inw ? 1.04 : 1.2, z1: inw ? 1.2 : 1.06, x0: 0.3 + 0.4 * h1, x1: 0.3 + 0.4 * h2, y0: 0.4 + 0.2 * h2, y1: 0.4 + 0.2 * h1 }));
    kShade({ a: 0.8, h: 300 });
    if (lab) { kText(lab.name, 170, KBO - 76, { size: 54, w: 800, fam: MAN, align: 'left', track: -0.01 }); kLabel(`Lab · ${lab.d}`, 170, KBO - 36, { size: 18, align: 'left', track: 0.24, col: BR.apricot }); if (lab.credit) kLabel(T.osm, W - 170, KBO - 36, { size: 15, align: 'right', track: 0.1, col: rgba(BR.cream, 0.75) }); }
    /* Einstellungen unter einem Schlag schneiden hart, ohne Blitz — mehr als drei Blitze je Sekunde wären zu unruhig */
    if (d >= B * 0.8) kCutFlash(t, 0.36);
  },
};

/* ---------- Titel ---------- */
KS.title = {
  sec: 'title', flash: 0.95,
  draw(lt, D) {
    kaBg(lt, { cool: 0.12, warm: 0.1 });
    const f = Math.min(1, D / 9), sc = 1 + 0.05 * (lt / D), y1 = KCY + 46, big = KA.title[0].toUpperCase(), sm = KA.title[1].toUpperCase();
    g.save(); g.translate(W / 2, KCY); g.scale(sc, sc); g.translate(-W / 2, -KCY);
    kFlare(W / 2, y1 + 40, 1100, KL.warm, 0.75 * Math.exp(-lt * 1.3) + 0.14);
    const s1 = lerp(1.14, 1, eOut5(seg(lt, 0, 0.9)));
    kSweep(() => { g.save(); g.translate(W / 2, y1 - 60); g.scale(s1, s1); g.translate(-W / 2, -(y1 - 60)); kText(big, W / 2, y1, { size: 236, w: 800, fam: MAN, track: 0.02, grad: [[0, '#FFFFFF'], [0.6, BR.cream], [1, rgba(BR.cream, 0.55)]], alpha: seg(lt, 0, 0.08) }); g.restore(); }, seg(lt, 0.4, 2.2), '#FFFFFF', 0.9);
    /* zweite Zeile auf die Breite der ersten gesperrt */
    const w1 = kMeasure(big, 236, { w: 800, fam: MAN, track: 0.02 }), s2 = 84, base = kMeasure(sm, s2, { w: 700, fam: MAN }), tr = clamp((w1 - base) / ((sm.length - 1) * s2), 0.02, 0.9);
    kText(sm, W / 2, y1 + 112, { size: s2, w: 700, fam: MAN, track: tr, col: BR.apricot, alpha: eOut(seg(lt, 2 * B * f, 2 * B * f + 0.7)) });
    kText(NAME.toUpperCase(), W / 2, y1 - 232, { size: 40, w: 700, fam: MAN, track: 0.5, alpha: eOut(seg(lt, BAR * f, BAR * f + 0.8)) });
    kLabel(ROLE, W / 2, y1 + 200, { size: 22, track: 0.3, alpha: eOut(seg(lt, 1.5 * BAR * f, 1.5 * BAR * f + 0.8)) });
    g.restore();
  },
};

/* ---------- Abspann ---------- */
KS.end = {
  sec: 'tail',
  draw(lt, D) {
    kaBg(lt, { cool: 0.08, warm: 0.07, mid: 0.8 });
    const short = D < 3.2, f = Math.min(1, D / 8), a = eOut(seg(lt, 0, 0.5));
    g.save(); g.globalAlpha = a;
    if (short) {
      lockup(W / 2, KCY - 60, 100, KL.ink, { pm: seg(lt, 0.05, 0.8), pw: seg(lt, 0.3, 1.0) });
      kBilling(KA.bill.slice(0, 1), W / 2, KCY + 110, { size: 40, p: seg(lt, 0.3, 1.0) });
      kLabel(LINKS[0], W / 2, KBO - 70, { size: 22, track: 0.3, col: KL.ink, alpha: eOut(seg(lt, 0.6, 1.2)) });
    } else {
      lockup(W / 2, KT + 132, 78, KL.ink, { pm: seg(lt, 0.2 * f, 1.4 * f), pw: seg(lt, 0.8 * f, 1.8 * f) });
      const hB = kBilling(KA.bill, W / 2, KCY - 78, { size: 44, p: seg(lt, 1.0 * f, 3.4 * f) });
      kLabel(`${KA.soon} · LD Beyond. · 2027`, W / 2, KCY - 78 + hB + 22, { size: 22, track: 0.36, col: BR.apricot, alpha: eOut(seg(lt, 3.2 * f, 4.2 * f)) });
      const ws = LINKS.map((s) => kMeasure(s.toUpperCase(), 19, { w: 500, fam: MONO, track: 0.1 })), gap = 72, tot = ws.reduce((x, w) => x + w + gap, -gap); let px = W / 2 - tot / 2; const pl = eOut(seg(lt, 2.2 * f, 3.2 * f));
      LINKS.forEach((s, i) => { kLabel(s, px, KBO - 56, { size: 19, track: 0.1, align: 'left', col: i === 0 ? KL.ink : KL.soft, alpha: pl }); px += ws[i] + gap; });
    }
    g.restore();
  },
};
