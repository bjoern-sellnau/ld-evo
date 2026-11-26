/* Kino-Trailer „LD Beyond“ (Stimmung kb, 112 BPM) — Drehbuch.
   Ablauf: Auftakt („loona! designs zeigt“) → Ausgangslage („Eine Website, die man nie anfasst, veraltet.“ — dazu die eigene Seite von
   2006 mit ihrem Satz „what the web can be“) → Wende (der Mond des Beyond-Designs geht auf: „so gebaut, dass Ändern Spaß macht“) →
   die Bühne (Portfolio, Labs, .Tech-Magazin, Story-Seiten, Mobil) → der Regieraum LD Flow (vier Schritte vom leeren Blatt zur Story) →
   was drinsteckt (sechs Eigenschaften, dazu die Hero-Animationen) → Stille mit Zitat → Titel → „2027“ mit Abspann-Block.
   Wortlaut aus der Story-Seite des Projekts „LD Beyond“ (ld-evo: content/projects.ts und content/en/projects.ts) und der Startseite im
   Beyond-Design (content/home.ts: „What the web can be.“); „kommt 2027“ nach Angabe von Bjoern Sellnau (22.11.2026). Bilder: Aufnahmen
   der Website im Beyond-Design und von LD Flow aus einem lokalen Build von ld-evo (26.11.2026, assets/kino/). */
'use strict';
const KBT = {
  de: {
    prem: ['Eine Website, die man nie anfasst,', 'veraltet.'], old: ['2006', 'Eigene Website'], next: ['Der Anspruch ist geblieben.', 'Zeit für eine neue Version.'],
    turn: ['LD Beyond ist so gebaut,', 'dass Ändern Spaß macht.', 'Direkt auf der Seite. Ohne Code.'], kicker: 'Die neue Version von loona-designs',
    stage: ['Die Bühne.', 'Portfolio, Labs, .Tech-Magazin und Story-Seiten.'], /* Unterzeilen: die Überschriften der Website selbst (src/site/i18n/dict.ts) bzw. der Story-Seite */
    pages: [['Portfolio', 'kProj', 'Ausgewählte Arbeiten.'], ['Labs', 'kLabs', 'Experimente in Arbeit — zuschauen erlaubt.'], ['.Tech-Magazin', 'kTech', '.Tech, frisch gepinnt.'], ['Story-Seiten', 'kStory', 'Auftakt, Szenen, Scrollytelling, Galerie.'], ['Mobil', 'mob', 'Mit eigener Tab-Leiste.']],
    room: ['Der Regieraum.', 'LD Flow', 'Vom leeren Blatt zur Story.'],
    steps: [['Bausteine wählen', 'Auftakt, Szenen, Scrollytelling, Galerie — als Widgets in LD Flow.'], ['Direkt auf der Seite schreiben', 'Texte ändert man in der Vorschau — was du siehst, wird veröffentlicht.'], ['Zweisprachig', 'Deutsch und Englisch je Dokument, Übersetzungen als Entwurf.'], ['Veröffentlichen', 'Sofort oder geplant — mit Versionen zum Zurückholen.']],
    inside: ['Was drinsteckt', 'Plattform und CMS in einem.'],
    feats: [['Liquid Glass', 'Glas mit echter Lichtbrechung — und Auto-Kontrast, damit alles lesbar bleibt.'], ['Widgets', 'Eigene Bausteine mit defineWidget.'], ['Zweisprachig', 'Deutsch und Englisch, Pfade je Sprache.'], ['Sicher', 'Zwei-Faktor-Anmeldung, CSP mit Nonces, vorbereitete SQL-Abfragen.'], ['Barrierearm', 'Geprüft mit axe, WCAG 2.2 AA.'], ['Schnell', 'Ladezeit-Budgets in der CI.']],
    quote: ['„Die eigene Website', 'ist das ehrlichste Projekt.“'], comes: 'Kommt',
    bill: [[['s', 'loona! designs zeigt'], ['b', 'LD Beyond.'], ['s', 'mit dem CMS'], ['b', 'LD Flow']], [['s', 'gebaut mit'], ['b', 'Next.js'], ['b', 'SQLite'], ['b', 'View Transitions'], ['b', 'Claude Code']], [['s', 'mit'], ['b', 'Story-Seiten'], ['b', 'Liquid Glass'], ['b', 'Widgets'], ['s', 'in'], ['b', 'Deutsch und Englisch']], [['s', 'geprüft mit'], ['b', 'axe · WCAG 2.2 AA'], ['s', 'Bild'], ['b', 'Canvas'], ['s', 'Musik'], ['b', 'Web Audio']]],
  },
  en: {
    prem: ['A website nobody touches', 'goes stale.'], old: ['2006', 'Own website'], next: ['The ambition stayed.', 'Time for a new version.'],
    turn: ['LD Beyond is built', 'so that changing it is fun.', 'Right on the page. Without code.'], kicker: 'The new version of loona-designs',
    stage: ['The stage.', 'Portfolio, labs, .Tech magazine and story pages.'], pages: [['Portfolio', 'kProj', 'Selected work.'], ['Labs', 'kLabs', 'Experiments in progress — watching allowed.'], ['.Tech magazine', 'kTech', '.Tech, freshly pinned.'], ['Story pages', 'kStory', 'Opening, scenes, scrollytelling, gallery.'], ['Mobile', 'mob', 'With its own tab bar.']],
    room: ['The control room.', 'LD Flow', 'From blank page to story.'],
    steps: [['Pick blocks', 'Opening, scenes, scrollytelling, gallery — as widgets in LD Flow.'], ['Write right on the page', 'Text is edited in the preview — what you see is what gets published.'], ['Bilingual', 'German and English per document, translations as drafts.'], ['Publish', 'Now or scheduled — with versions to restore.']],
    inside: ['What’s inside', 'Platform and CMS in one.'],
    feats: [['Liquid Glass', 'Glass with real refraction — and auto contrast so everything stays readable.'], ['Widgets', 'Custom blocks with defineWidget.'], ['Bilingual', 'German and English, paths per language.'], ['Secure', 'Two-factor sign-in, CSP with nonces, prepared SQL.'], ['Accessible', 'Tested with axe, WCAG 2.2 AA.'], ['Fast', 'Load-time budgets in CI.']],
    quote: ['“Your own website', 'is the most honest project.”'], comes: 'Coming',
    bill: [[['s', 'loona! designs presents'], ['b', 'LD Beyond.'], ['s', 'with the CMS'], ['b', 'LD Flow']], [['s', 'built with'], ['b', 'Next.js'], ['b', 'SQLite'], ['b', 'View Transitions'], ['b', 'Claude Code']], [['s', 'featuring'], ['b', 'Story pages'], ['b', 'Liquid Glass'], ['b', 'Widgets'], ['s', 'in'], ['b', 'German and English']], [['s', 'tested with'], ['b', 'axe · WCAG 2.2 AA'], ['s', 'picture'], ['b', 'Canvas'], ['s', 'music'], ['b', 'Web Audio']]],
  },
}[LANG];
const KB_HERO = ['aurora', 'blackhole', 'galaxy', 'nova', 'plasma', 'tunnel', 'prism'];
/* LD Flow je Schritt: Aufnahme und Ausschnitt (Zoom und Lage) — gezeigt wird der Teil des Editors, um den es geht. Die Seitenleiste
   mit dem Testnutzer der Aufnahme liegt außerhalb der Ausschnitte. Schritt 4 blendet von „Planen …“ zur Meldung „Veröffentlicht“. */
const KB_FLOW = [
  { k: 'kFlowEd2', z0: 1.22, z1: 1.36, px: 0.62, py: 0.5 },
  { k: 'kFlowWys', z0: 1.4, z1: 1.55, px: 0.95, py: 0.12 },
  { k: 'kFlowSpr', z0: 1.3, z1: 1.42, px: 0.45, py: 0.08 },
  { k: 'kFlowPlan', k2: 'kFlowPub', z0: 1.5, z1: 1.62, px: 0.42, py: 0.04 },
];
if (KINO && KB) Object.assign(SRC, {
  kHero: `assets/kino/hero_${LANG}.jpg`, kHeroDe: 'assets/kino/hero_de.jpg', kHeroEn: 'assets/kino/hero_en.jpg', kHome: `assets/kino/home_${LANG}.jpg`,
  kProj: `assets/kino/projekte_${LANG}.jpg`, kLabs: `assets/kino/labs_${LANG}.jpg`, kTech: `assets/kino/tech_${LANG}.jpg`, kStory: `assets/kino/story_${LANG}.jpg`,
  kMob1: `assets/kino/mob1_${LANG}.jpg`, kMob2: `assets/kino/mob2_${LANG}.jpg`, kMob3: `assets/kino/mob3_${LANG}.jpg`, kGlass: 'assets/kino/glass_de.jpg', kGlass2: 'assets/kino/glass2_de.jpg',
  kFlowEd2: 'assets/kino/flow_editor2.jpg', kFlowWys: 'assets/kino/flow_wysiwyg.jpg', kFlowSpr: 'assets/kino/flow_sprache.jpg', kFlowPlan: 'assets/kino/flow_plan.jpg', kFlowPub: 'assets/kino/flow_publish.jpg', kFlowDash: 'assets/kino/flow_dash.jpg',
  ...Object.fromEntries(KB_HERO.flatMap((m) => Array.from({ length: HERO_FRAMES }, (_, i) => [`hero_${m}_${i}`, `assets/hero/${m}/f${String(i).padStart(2, '0')}.jpg`]))),
});

/* Der Mond des Beyond-Designs (Orb-Hero der Startseite): dunkle Scheibe mit blauem Lichtrand. ang = Richtung des Lichts, lit = Helligkeit */
function kbOrb(cx, cy, R, o = {}) {
  const a = o.a ?? 1, ang = o.ang ?? -2.5, lit = o.lit ?? 1, off = R * (o.off ?? 0.075);
  glow(cx, cy, R * 2.7, KL.acc, 0.3 * a * lit); glow(cx + Math.cos(ang) * R * 0.5, cy + Math.sin(ang) * R * 0.5, R * 1.7, '#3fb6ff', 0.3 * a * lit);
  g.save(); g.globalAlpha *= a;
  const gr = g.createRadialGradient(cx, cy, R * 0.8, cx, cy, R); gr.addColorStop(0, '#0d3b66'); gr.addColorStop(0.55, KL.acc); gr.addColorStop(0.93, '#bfe6ff'); gr.addColorStop(1, 'rgba(191,230,255,0)');
  g.fillStyle = gr; g.beginPath(); g.arc(cx, cy, R, 0, 7); g.fill();
  const dx = cx - Math.cos(ang) * off, dy = cy - Math.sin(ang) * off, gd = g.createRadialGradient(dx, dy, R * 0.2, dx, dy, R * 0.9); gd.addColorStop(0, '#03050a'); gd.addColorStop(0.9, '#05080f'); gd.addColorStop(1, 'rgba(5,8,15,0.0)');
  g.fillStyle = '#04060b'; g.beginPath(); g.arc(dx, dy, R * 0.86, 0, 7); g.fill(); g.fillStyle = gd; g.beginPath(); g.arc(dx, dy, R * 0.9, 0, 7); g.fill();
  g.restore();
}
/* blauer Schein über einem Bildhintergrund */
function kbBg2(t) { glow(W * 0.5, KT - 60, 900, KL.acc, 0.14); kDust(t, 0.5, '#9cc8f2'); }
/* Überschrift mit Kicker links unten im Bild */
function kbCaption(kick, head, sub, t, o = {}) {
  const x = o.x ?? 170, y = o.y ?? KBO - 96, size = kFit(head, o.max ?? 1100, o.size ?? 96, { w: 600, fam: UNB, track: -0.02 });
  kLabel(kick, x, y - size - 22, { size: 20, align: 'left', track: 0.26, col: KL.acc, alpha: eOut(seg(t, 0.02, 0.3)) });
  g.save(); g.beginPath(); g.rect(0, y - size * 1.05, W, size * 1.4); g.clip(); kText(head, x, y + (1 - E_REVEAL(seg(t, 0.03, 0.45))) * size * 1.2, { size, w: 600, fam: UNB, track: -0.02, align: 'left' }); g.restore();
  if (sub) wrapLines(sub, o.max ?? 1100, 30, 400, GEI).forEach((ln, r) => kText(ln, x + 4, y + 54 + r * 42, { size: 30, w: 400, fam: GEI, align: 'left', col: KL.soft, alpha: eOut(seg(t, 0.25 + r * 0.1, 0.7 + r * 0.1)) }));
}

/* ---------- Ausgangslage ---------- */
KS.premise = {
  sec: 'piano',
  plan(D, bars) { const cuts = kSplit(D, bars >= 5 ? [2.2, 2.0, 1.8] : bars >= 4 ? [1.5, 1.3, 1.2] : [1.15, 1.0, 0.85]); return { cuts, hits: cuts.slice(1, -1).map((c) => [c, 0.2]) }; },
  draw(lt, D, P) {
    const { i, t, d } = kAt(P.cuts, lt);
    if (i === 0) {
      kbBg(lt, { grid: 0.35, top: 0.05 });
      const s1 = kFit(KBT.prem[0], 1500, 52, { w: 500, fam: UNB });
      kCard([{ s: KBT.prem[0], size: s1, w: 500, fam: UNB, col: KL.soft, lh: 1.8 }, { s: KBT.prem[1], size: 132, w: 700, fam: UNB, track: -0.02, at: Math.min(1.5, d * 0.36), grow: 0.012 }], t, d, { inD: 0.8, outD: 0.5 });
    } else if (i === 1) {
      /* die eigene Seite von 2006 — ihr Satz „what the web can be“ steht oben im Bild; Fahrt auf diese Zeile */
      g.fillStyle = '#000'; g.fillRect(0, KT, W, KH);
      const a = eOut(seg(t, 0, 0.5)) * (1 - eIn(seg(t, d - 0.4, d)));
      g.save(); g.globalAlpha = a; kShot(IMG.ld2006, t, d, { z0: 1.5, z1: 2.1, x0: 0.5, x1: 0.44, y0: 0.2, y1: 0.07, sat: 0.5, dim: 0.42, tint: '#b9cdea', ease: true }); g.restore();
      kShade({ a: 0.9, h: 380 });
      kLabel(`${KBT.old[0]} · Loona! Designs · ${KBT.old[1]}`, 170, KBO - 110, { size: 20, align: 'left', track: 0.26, col: KL.acc, alpha: a });
      kText('„what the web can be“', 170, KBO - 48, { size: 56, w: 400, fam: SER, it: true, align: 'left', alpha: a * eOut(seg(t, 0.4, 1.2)) });
    } else {
      kbBg(lt, { grid: 0.6, top: 0.1 });
      kCard([{ s: KBT.next[0], size: kFit(KBT.next[0], 1400, 50, { w: 500, fam: UNB }), w: 500, fam: UNB, col: KL.soft, lh: 1.7 }, { s: KBT.next[1], size: kFit(KBT.next[1], 1560, 80, { w: 600, fam: UNB, track: -0.02 }), w: 600, fam: UNB, track: -0.02, at: Math.min(1.1, d * 0.3), grow: 0.012 }], t, d, { inD: 0.7, outD: 0.4 });
    }
  },
};

/* ---------- Wende: der Mond geht auf ---------- */
KS.turn = {
  sec: 'pulse', flash: 0.35,
  plan(D, bars) { const cuts = kSplit(D, bars >= 7 ? [5, 2] : bars >= 5 ? [3.4, 1.6] : bars >= 3 ? [2, 1] : [1.25, 0.75], B); return { cuts, hits: [[cuts[1], 1]] }; },
  draw(lt, D, P) {
    const { i, t, d } = kAt(P.cuts, lt);
    if (i === 0) {
      const f = Math.min(1, d / 9), up = eOut5(seg(t, 0, d * 0.75)), R = 250, ox = W * 0.81, oy = lerp(KBO + R * 0.9, KCY + 10, up);
      kbBg(lt, { grid: eOut(seg(t, 0.3, 2.5 * f + 0.5)), top: 0.06 + 0.1 * up, gx: 0.81 });
      kbOrb(ox, oy, R, { ang: -2.5 + 0.25 * (t / d), lit: 0.5 + 0.5 * up });
      kFlare(ox - R * 0.72, oy - R * 0.55, 520, '#7fd0ff', 0.55 * up * (0.7 + 0.3 * Math.sin(t * 1.3)));
      const x = 170, s2 = kFit(KBT.turn[1], 1010, 78, { w: 600, fam: UNB, track: -0.02 }), t1 = 0.5 * f, t2 = t1 + Math.max(B * 2, 1.4 * f), t3 = t2 + Math.max(B * 2, 1.6 * f), out = 1 - eIn(seg(t, d - 0.3, d));
      g.save(); g.globalAlpha = out;
      kText(KBT.turn[0], x, KCY - 60, { size: kFit(KBT.turn[0], 1000, 44, { w: 500, fam: UNB }), w: 500, fam: UNB, align: 'left', col: KL.soft, alpha: eOut(seg(t, t1, t1 + 0.7)) });
      g.save(); g.beginPath(); g.rect(0, KCY - 40, W, s2 * 1.5); g.clip(); kText(KBT.turn[1], x, KCY + 44 + (1 - E_REVEAL(seg(t, t2, t2 + 0.7))) * s2 * 1.3, { size: s2, w: 600, fam: UNB, align: 'left', track: -0.02 }); g.restore();
      if (d > 3.4) kText(KBT.turn[2], x + 4, KCY + 122, { size: 36, w: 400, fam: GEI, align: 'left', col: KL.acc, alpha: eOut(seg(t, t3, t3 + 0.7)) });
      g.restore();
    } else {
      kPunch(t, 0.03, () => kShot(IMG.kHero, t, d, { z0: 1.0, z1: 1.07, y0: 0.42, y1: 0.42 }));
      kShade({ a: 0.75, h: 300 });
      kLabel(KBT.kicker, 170, KBO - 60, { size: 22, align: 'left', track: 0.28, col: KL.ink, alpha: eOut(seg(t, 0.1, 0.5)) });
      kCutFlash(t, 0.7, '#bfe4ff');
    }
  },
};

/* ---------- Die Bühne: die Seiten ---------- */
KS.stage = {
  sec: 'lift', flash: 0.4,
  plan(D, bars) {
    const all = bars >= 4, pg = all ? KBT.pages : [KBT.pages[0], KBT.pages[1], KBT.pages[3], KBT.pages[4]], w = bars >= 9 ? [4, 6, 7, 6, 7, 6] : bars >= 7 ? [3, 5, 5, 5, 5, 5] : all ? [1, 3, 3, 3, 3, 3] : [2, 2, 2, 2];
    const cuts = kSplit(D, w); return { cuts, pg, intro: all, hits: cuts.slice(1, -1).map((c) => [c, 0.9]) };
  },
  draw(lt, D, P) {
    const { i, t, d } = kAt(P.cuts, lt);
    if (P.intro && i === 0) {
      kBlurBg('kHome', { a: 0.6, dim: 0.5, z: 1.1 + 0.05 * (t / d) }); kbBg2(lt);
      kLabel('LD Beyond', W / 2, KCY - 130, { size: 22, track: 0.4, col: KL.acc, alpha: eOut(seg(t, 0.05, 0.4)) });
      const sc = lerp(1.14, 1, eOut5(seg(t, 0, 0.5))); g.save(); g.translate(W / 2, KCY); g.scale(sc, sc); g.translate(-W / 2, -KCY); kText(KBT.stage[0], W / 2, KCY + 50, { size: kFit(KBT.stage[0], 1500, 170, { w: 700, fam: UNB, track: -0.02 }), w: 700, fam: UNB, track: -0.02, alpha: seg(t, 0, 0.08) }); g.restore();
      if (d > 1.6) kText(KBT.stage[1], W / 2, KCY + 130, { size: 34, w: 400, fam: GEI, col: KL.soft, alpha: eOut(seg(t, 0.4, 1.0)) });
      return;
    }
    const k = i - (P.intro ? 1 : 0), [name, key, sub] = P.pg[k], idx = `${String(k + 1).padStart(2, '0')} / ${String(P.pg.length).padStart(2, '0')}`;
    if (key === 'mob') {
      kBlurBg('kHome', { a: 0.7, dim: 0.42, z: 1.15 }); kbBg2(lt);
      ['kMob1', 'kMob2', 'kMob3'].forEach((m, q) => { const p = eOut5(seg(t, q * 0.12, q * 0.12 + 0.6)), w = 290; kPhone(IMG[m], 1010 + q * 322, KCY + (q === 1 ? -14 : 22) + (1 - p) * 260 - 10 * (t / d), w, { alpha: seg(t, q * 0.12, q * 0.12 + 0.2) }); });
    } else {
      /* die Seite als großes Fenster, das unten aus dem Bild läuft; sie fährt nach unten. Dahinter weich dieselbe Seite als Licht. */
      kBlurBg(key, { a: 0.55, dim: 0.5, z: 1.12 + 0.04 * (t / d) }); kbBg2(lt);
      const img = IMG[key], px = 720, pw = W - 110 - px, py = KT + 64 + (1 - eOut5(seg(t, 0, 0.6))) * 120, ph = KBO - py + 40;
      g.save(); g.globalAlpha = seg(t, 0, 0.15); g.save(); g.shadowColor = 'rgba(0,0,0,0.7)'; g.shadowBlur = 80; g.fillStyle = '#05070c'; rr(px, py, pw, ph, 22); g.fill(); g.restore();
      if (img) { const sc = pw / img.width, ih = img.height * sc, sy = Math.min(Math.max(0, ih - ph), 250 * d) * eIO(seg(t, 0.25, d)); g.save(); rr(px, py, pw, ph, 22); g.clip(); g.drawImage(img, px, py - sy, pw, ih); g.restore(); }
      g.strokeStyle = 'rgba(148,178,220,0.3)'; g.lineWidth = 1.5; rr(px, py, pw, ph, 22); g.stroke(); g.restore();
    }
    kbCaption(`LD Beyond · ${idx}`, name, sub, t, key === 'mob' ? { max: 640, size: 84, y: KCY + 40 } : { max: 520, size: 78, y: KCY + 40 });
    kCutFlash(t, 0.45, '#bfe4ff');
  },
};

/* ---------- Der Regieraum: LD Flow in vier Schritten ---------- */
KS.steps = {
  sec: 'drive', flash: 0.5,
  plan(D, bars) { const intro = bars >= 5, w = bars >= 9 ? [4, 8, 8, 8, 8] : bars >= 7 ? [4, 6, 6, 6, 6] : intro ? [2, 4.5, 4.5, 4.5, 4.5] : [3, 3, 3, 3], cuts = kSplit(D, w); return { cuts, intro, hits: cuts.slice(1, -1).map((c) => [c, 0.9]) }; },
  draw(lt, D, P) {
    const { i, t, d } = kAt(P.cuts, lt);
    if (P.intro && i === 0) {
      kBlurBg('kFlowDash', { a: 0.5, dim: 0.55, z: 1.1 + 0.05 * (t / d) }); kbBg2(lt);
      kLabel(KBT.room[1], W / 2, KCY - 130, { size: 22, track: 0.4, col: KL.acc, alpha: eOut(seg(t, 0.05, 0.4)) });
      const sc = lerp(1.14, 1, eOut5(seg(t, 0, 0.5))); g.save(); g.translate(W / 2, KCY); g.scale(sc, sc); g.translate(-W / 2, -KCY); kText(KBT.room[0], W / 2, KCY + 46, { size: kFit(KBT.room[0], 1560, 150, { w: 700, fam: UNB, track: -0.02 }), w: 700, fam: UNB, track: -0.02, alpha: seg(t, 0, 0.08) }); g.restore();
      kText(KBT.room[2], W / 2, KCY + 128, { size: 36, w: 400, fam: GEI, col: KL.soft, alpha: eOut(seg(t, 0.35, 0.9)) });
      return;
    }
    const k = i - (P.intro ? 1 : 0), [head, body] = KBT.steps[k], F = KB_FLOW[k], long = d > 2.6;
    kbBg(lt, { grid: 0.8, top: 0.12, gx: 0.72 });
    /* rechts das Fenster mit LD Flow, leichte Fahrt nach vorn */
    const bw = 1090, bh = 650, bx = W - 110 - bw, by = KCY - bh / 2, p = eOut5(seg(t, 0, 0.55)), sc = 1 + 0.035 * (t / d);
    glow(bx + bw / 2, KCY, 760, KL.acc, 0.2);
    const zz = lerp(F.z0, F.z1, t / d), x2 = F.k2 ? seg(t / d, 0.5, 0.58) : 0;
    g.save(); g.translate(bx + bw / 2 + (1 - p) * 90, KCY); g.scale(sc, sc); g.translate(-(bx + bw / 2), -KCY); browser(IMG[F.k], bx, by, bw, bh, { dark: true, alpha: seg(t, 0, 0.18), bar: 38, r: 14, url: 'LD Flow.', blur: 70, shadow: 'rgba(0,0,0,0.65)', zoom: zz, px: F.px, py: F.py });
    if (x2 > 0) browser(IMG[F.k2], bx, by, bw, bh, { dark: true, alpha: x2, bar: 38, r: 14, url: 'LD Flow.', blur: 0, shadow: 'rgba(0,0,0,0)', zoom: zz, px: F.px, py: F.py });
    g.restore();
    /* links Schritt, Titel, Text */
    const x = 130, max = 540, hs = kFit(head, max, 58, { w: 600, fam: UNB, track: -0.02 }), lines = hs < 40 ? wrapLines(head, max, 46, 600, UNB, -0.02) : [head], sz = hs < 40 ? 46 : hs, y0 = KCY - (long ? 40 : 10) - (lines.length - 1) * sz * 0.6;
    kText(String(k + 1).padStart(2, '0'), x, y0 - sz - 26, { size: 34, w: 700, fam: UNB, align: 'left', col: KL.acc, alpha: seg(t, 0, 0.1) });
    kLabel(`${KBT.room[1]} · ${KBT.room[0].replace(/\.$/, '')}`, x + 78, y0 - sz - 30, { size: 17, align: 'left', track: 0.24, col: KL.mute, alpha: eOut(seg(t, 0.05, 0.4)) });
    lines.forEach((ln, r) => { g.save(); g.beginPath(); g.rect(0, y0 + r * sz * 1.18 - sz * 1.05, bx - 30, sz * 1.4); g.clip(); kText(ln, x, y0 + r * sz * 1.18 + (1 - E_REVEAL(seg(t, 0.04 + r * 0.08, 0.5 + r * 0.08))) * sz * 1.2, { size: sz, w: 600, fam: UNB, align: 'left', track: -0.02 }); g.restore(); });
    if (long) wrapLines(body, max, 30, 400, GEI).forEach((ln, r) => kText(ln, x + 2, y0 + (lines.length - 1) * sz * 1.18 + 62 + r * 42, { size: 30, w: 400, fam: GEI, align: 'left', col: KL.soft, alpha: eOut(seg(t, 0.3 + r * 0.1, 0.8 + r * 0.1)) }));
    for (let q = 0; q < 4; q++) { g.fillStyle = q <= k ? KL.acc : 'rgba(148,178,220,0.2)'; g.fillRect(x + q * 58, KBO - 92, 46, 4); }
    kCutFlash(t, 0.4, '#bfe4ff');
  },
};

/* ---------- Was drinsteckt ---------- */
/* Hintergrund je Eigenschaft: einfache Bewegtgrafik in den Farben des Beyond-Designs */
function kbFx(i, t, d) {
  const k = t / d;
  if (i === 0) { /* Liquid Glass: die echte Glas-Navigation der Seite — hell über dem Hero, dunkel über den Projektkarten (Auto-Kontrast) */
    kbBg(t, { grid: 0.8, top: 0.14 });
    [['kGlass', 113, 48, 3225, 168, KCY - 292, -1], ['kGlass2', 113, 53, 3225, 158, KCY + 206, 1]].forEach(([key, sx, sy, sw, sh, y, dir], q) => {
      const img = IMG[key]; if (!img) return; const w = 1520, h = (w * sh) / sw, p = eOut5(seg(t, q * 0.1, q * 0.1 + 0.55)), x = W / 2 - w / 2 + dir * ((1 - p) * 420 + 26 * k);
      g.save(); g.globalAlpha = seg(t, q * 0.1, q * 0.1 + 0.15); g.save(); g.shadowColor = 'rgba(25,167,255,0.35)'; g.shadowBlur = 50; g.fillStyle = '#05070c'; rr(x, y, w, h, h / 2); g.fill(); g.restore();
      g.save(); rr(x, y, w, h, h / 2); g.clip(); g.drawImage(img, sx, sy, sw, sh, x, y, w, h);
      const lx = lerp(x - 200, x + w + 200, clamp(k * 1.3 - q * 0.15)), sg = g.createLinearGradient(lx - 120, 0, lx + 120, 0); sg.addColorStop(0, 'rgba(255,255,255,0)'); sg.addColorStop(0.5, 'rgba(255,255,255,0.22)'); sg.addColorStop(1, 'rgba(255,255,255,0)'); g.fillStyle = sg; g.fillRect(lx - 120, y, 240, h); g.restore();
      g.strokeStyle = 'rgba(200,225,255,0.35)'; g.lineWidth = 1.5; rr(x, y, w, h, h / 2); g.stroke(); g.restore();
    });
  } else if (i === 1) { /* Widgets: Bausteine setzen sich zu einer Seite zusammen */
    kbBg(t, { grid: 1, top: 0.14 });
    const B0 = [[0, 0, 12, 2], [0, 2.3, 7, 3], [7.3, 2.3, 4.7, 3], [0, 5.6, 4, 2.4], [4.3, 5.6, 3.6, 2.4], [8.2, 5.6, 3.8, 2.4]], u = 92, ox = W / 2 - 6 * u, oy = KCY - 4 * u;
    B0.forEach(([bx, by, bw, bh], q) => { const p = eOut5(seg(t, q * 0.07, q * 0.07 + 0.45)), dir = q % 2 ? 1 : -1; g.save(); g.globalAlpha = 0.9 * p; rr(ox + bx * u + dir * (1 - p) * 320, oy + by * u, bw * u, bh * u, 18); g.fillStyle = q === 0 ? 'rgba(25,167,255,0.16)' : 'rgba(148,178,220,0.07)'; g.fill(); g.strokeStyle = q === 0 ? 'rgba(25,167,255,0.8)' : 'rgba(148,178,220,0.3)'; g.lineWidth = 2; g.stroke(); g.restore(); });
    g.fillStyle = 'rgba(5,7,12,0.55)'; g.fillRect(0, KT, W, KH);
  } else if (i === 2) { /* Zweisprachig: deutsche und englische Startseite, die Trennlinie wandert */
    const sx = lerp(W * 0.38, W * 0.62, eIO(k)); kShot(IMG.kHeroDe, t, d, { z0: 1.03, z1: 1.03, y0: 0.42 }); g.save(); g.beginPath(); g.rect(sx, KT, W - sx, KH); g.clip(); kShot(IMG.kHeroEn, t, d, { z0: 1.03, z1: 1.03, y0: 0.42 }); g.restore();
    g.fillStyle = 'rgba(5,7,12,0.62)'; g.fillRect(0, KT, W, KH); g.fillStyle = KL.acc; g.fillRect(sx - 1.5, KT, 3, KH); glow(sx, KCY, 300, KL.acc, 0.3);
    kLabel('DE', sx - 34, KT + 64, { size: 22, align: 'right', col: KL.ink, track: 0.2 }); kLabel('EN', sx + 34, KT + 64, { size: 22, align: 'left', col: KL.ink, track: 0.2 });
  } else if (i === 3) { /* Sicher: Ringe schließen sich */
    kbBg(t, { grid: 0.7, top: 0.1 });
    for (let q = 0; q < 4; q++) { const p = eOut5(seg(t, q * 0.08, q * 0.08 + 0.6)), r = 150 + q * 110, a0 = -Math.PI / 2 + q * 0.7 + t * (q % 2 ? 0.25 : -0.2); g.save(); g.strokeStyle = `rgba(25,167,255,${0.55 - q * 0.11})`; g.lineWidth = 3; g.beginPath(); g.arc(W / 2, KCY, r, a0, a0 + Math.PI * 2 * p * (q === 3 ? 0.82 : 0.999)); g.stroke(); g.restore(); }
    g.fillStyle = 'rgba(5,7,12,0.45)'; g.fillRect(0, KT, W, KH);
  } else if (i === 4) { /* Barrierearm: „AA“ groß im Hintergrund */
    kbBg(t, { grid: 0.7, top: 0.12 });
    kText('AA', W / 2, KCY + 230, { size: 640, w: 700, fam: UNB, track: 0.02, stroke: 3, col: 'rgba(25,167,255,0.3)', alpha: eOut(seg(t, 0, 0.5)) });
  } else { /* Schnell: Lichtstreifen */
    kbBg(t, { grid: 0.6, top: 0.1 });
    for (let q = 0; q < 14; q++) { const y = KT + 40 + hash(q * 3.1) * (KH - 80), sp = 1500 + hash(q * 5.7) * 2600, len = 240 + hash(q * 2.3) * 520, x = ((t * sp + hash(q * 7.7) * 3000) % (W + len * 2)) - len, gr = g.createLinearGradient(x, 0, x + len, 0); gr.addColorStop(0, 'rgba(25,167,255,0)'); gr.addColorStop(1, `rgba(140,210,255,${0.25 + 0.4 * hash(q * 1.7)})`); g.fillStyle = gr; g.fillRect(x, y, len, 2 + (q % 3)); }
    g.fillStyle = 'rgba(5,7,12,0.3)'; g.fillRect(0, KT, W, KH);
  }
}
const kFitB = (str, max, size) => { if (kMeasure(str, size, { w: 400, fam: GEI }) <= max) return str; const cut = str.split(' — ')[0]; return cut + (/[.!?]$/.test(cut) ? '' : '.'); };
KS.inside = {
  sec: 'peak', flash: 0.6,
  plan(D, bars) { const intro = bars >= 6, w = bars >= 8 ? [2, 4, 4, 4, 4, 4, 4, 6] : intro ? [2, 3, 3, 3, 3, 3, 3, 4] : bars >= 4 ? [2, 2, 2, 2, 2, 2, 4] : [1, 1, 1, 1, 1, 1, 2], cuts = kSplit(D, w, B / 2); return { cuts, intro, hits: cuts.slice(1, -1).map((c) => [c, 0.7]) }; },
  draw(lt, D, P) {
    const { i, t, d } = kAt(P.cuts, lt), k = i - (P.intro ? 1 : 0);
    if (P.intro && i === 0) {
      kbBg(lt, { grid: 1, top: 0.16 });
      kLabel(KBT.inside[0], W / 2, KCY - 70, { size: 24, track: 0.4, col: KL.acc });
      kText(KBT.inside[1], W / 2, KCY + 40, { size: kFit(KBT.inside[1], 1600, 86, { w: 600, fam: UNB, track: -0.02 }), w: 600, fam: UNB, track: -0.02, alpha: seg(t, 0, 0.08) });
      return;
    }
    if (k >= 6) {
      /* Hero-Animationen: sieben Karten mit dem mobilen Hero der Seite, in jeder läuft eine andere Animation; die Überschrift darunter */
      kbBg(lt, { grid: 0.7, top: 0.16 });
      const n = KB_HERO.length, cw = 214, ch = (cw * 16) / 9, gap = 26, x0 = W / 2 - (n * cw + (n - 1) * gap) / 2, fr = Math.floor(lt * 12), long = d > 2.4, yb = KT + (long ? 44 : 66);
      KB_HERO.forEach((m, q) => { const p = eOut5(seg(t, q * 0.05, q * 0.05 + 0.5)), x = x0 + q * (cw + gap), y = yb + (q % 2 ? 22 : 0) + (1 - p) * (q % 2 ? 160 : -160) - 12 * (t / d); g.save(); g.globalAlpha = seg(t, q * 0.05, q * 0.05 + 0.14); g.save(); g.shadowColor = 'rgba(0,0,0,0.6)'; g.shadowBlur = 40; g.shadowOffsetY = 16; g.fillStyle = '#05070c'; rr(x, y, cw, ch, 22); g.fill(); g.restore(); imgCover(IMG[`hero_${m}_${(fr + q * 3) % HERO_FRAMES}`], x, y, cw, ch, 22); g.strokeStyle = 'rgba(200,225,255,0.28)'; g.lineWidth = 1.5; rr(x, y, cw, ch, 22); g.stroke(); g.restore(); });
      const hy = KBO - (long ? 118 : 92), hs = kFit(T.heroKicker, 1500, long ? 84 : 76, { w: 700, fam: UNB, track: -0.02 });
      g.save(); g.beginPath(); g.rect(0, hy - hs * 1.05, W, hs * 1.4); g.clip(); kText(T.heroKicker, W / 2, hy + (1 - E_REVEAL(seg(t, 0.1, 0.55))) * hs * 1.2, { size: hs, w: 700, fam: UNB, track: -0.02 }); g.restore();
      if (long) kText(T.heroTitle.join(' '), W / 2, hy + 52, { size: 32, w: 400, fam: GEI, col: KL.soft, alpha: eOut(seg(t, 0.4, 0.9)) });
      kCutFlash(t, 0.5, '#bfe4ff');
      return;
    }
    const [head, body] = KBT.feats[k];
    kPunch(t, 0.03, () => {
      kbFx(k, t, d);
      const size = kFit(head, 1560, 180, { w: 700, fam: UNB, track: -0.03 }), sc = lerp(1.16, 1, eOut5(seg(t, 0, 0.35))) * (1 + 0.03 * (t / d));
      g.save(); g.translate(W / 2, KCY); g.scale(sc, sc); g.translate(-W / 2, -KCY); kText(head, W / 2, KCY + size * 0.3, { size, w: 700, fam: UNB, track: -0.03, alpha: seg(t, 0, 0.06) }); g.restore();
      if (d > 1.25) kText(kFitB(body, 1500, 32), W / 2, KCY + 150, { size: 32, w: 400, fam: GEI, col: KL.ink, alpha: 0.9 * eOut(seg(t, 0.2, 0.6)) });
      kLabel(`${KBT.inside[0]} · ${String(k + 1).padStart(2, '0')} / 06`, W / 2, KT + 80, { size: 20, track: 0.32, col: KL.acc });
    });
    kCutFlash(t, 0.45, '#bfe4ff');
  },
};

/* ---------- Stille ---------- */
if (KB) KS.stop = {
  sec: 'stop',
  draw(lt, D) {
    kbBg(lt, { grid: 0.25, top: 0.04, dust: 0.4 });
    const f = Math.min(1, D / 6), s = kFit(KBT.quote[1], 1500, 84, { w: 400, fam: SER, it: true });
    kCard([{ s: KBT.quote[0], size: s, w: 400, fam: SER, it: true, col: KL.soft, at: 0.5 * f, grow: 0.008 }, { s: KBT.quote[1], size: s, w: 400, fam: SER, it: true, at: 1.6 * f, grow: 0.008 }], lt, D, { inD: 1.0 * f + 0.2, outD: 0.5, push: 0.03 });
  },
};

/* ---------- Titel ---------- */
if (KB) KS.title = {
  sec: 'title', flash: 0.95,
  draw(lt, D) {
    const f = Math.min(1, D / 10), sc = 1 + 0.05 * (lt / D), R = 760, oy = KBO + 560 - 26 * eOut(seg(lt, 0, D)), ty = KCY - 40;
    kbBg(lt, { grid: 0.9, top: 0.16 });
    g.save(); g.translate(W / 2, KCY); g.scale(sc, sc); g.translate(-W / 2, -KCY);
    /* der Mond steht groß unter dem Bild — sein Lichtrand ist der Horizont, über dem der Titel steht */
    kbOrb(W / 2, oy, R, { ang: -Math.PI / 2, off: 0.022, lit: 0.8 + 0.3 * Math.exp(-lt * 1.2) });
    kFlare(W / 2 + 180 * Math.sin(lt * 0.21), oy - R + 6, 900, '#8fd6ff', 0.85 * Math.exp(-lt * 1.0) + 0.3);
    const ts = kFit('LD Beyond.', 1480, 230, { w: 700, fam: UNB, track: -0.03 }), s1 = lerp(1.12, 1, eOut5(seg(lt, 0, 0.9)));
    kSweep(() => { g.save(); g.translate(W / 2, ty); g.scale(s1, s1); g.translate(-W / 2, -ty); kText('LD Beyond.', W / 2, ty + ts * 0.32, { size: ts, w: 700, fam: UNB, track: -0.03, alpha: seg(lt, 0, 0.08) }); g.restore(); }, seg(lt, 0.4, 2.0), '#8fd6ff', 0.95);
    /* Claim der Startseite im Beyond-Design: „the web“ im Akzentblau */
    const cs = 46, a2 = eOut(seg(lt, 2 * B * f + 0.3, 2 * B * f + 1.1)), parts = [['What ', KL.ink], ['the web ', KL.acc], ['can be.', KL.ink]], ws = parts.map(([s]) => kMeasure(s.trim(), cs, { w: 500, fam: UNB }) + (s.endsWith(' ') ? cs * 0.34 : 0)); let x = W / 2 - ws.reduce((p, c) => p + c, 0) / 2;
    parts.forEach(([s, c], q) => { kText(s.trim(), x, ty + ts * 0.32 + 92, { size: cs, w: 500, fam: UNB, align: 'left', col: c, alpha: a2 }); x += ws[q]; });
    kLabel(KBT.kicker, W / 2, ty - ts * 0.5 - 44, { size: 21, track: 0.36, col: KL.soft, alpha: eOut(seg(lt, BAR * f, BAR * f + 0.8)) });
    g.restore();
  },
};

/* ---------- 2027 und Abspann ---------- */
if (KB) KS.end = {
  sec: 'tail',
  draw(lt, D) {
    kbBg(lt, { grid: 0.7, top: 0.14 });
    const short = D < 5, f = Math.min(1, D / 9), a = eOut(seg(lt, 0, 0.5));
    g.save(); g.globalAlpha = a;
    const yy = short ? KCY - 60 : KT + 210, ys = short ? 190 : 150;
    kLabel(KBT.comes, W / 2, yy - ys * 0.86, { size: 22, track: 0.5, col: KL.acc, alpha: eOut(seg(lt, 0.1, 0.6)) });
    const s1 = lerp(1.12, 1, eOut5(seg(lt, 0, 0.7))); g.save(); g.translate(W / 2, yy - ys * 0.3); g.scale(s1, s1); g.translate(-W / 2, -(yy - ys * 0.3)); kText('2027', W / 2, yy, { size: ys, w: 700, fam: UNB, track: 0.02, alpha: seg(lt, 0, 0.1) }); g.restore();
    if (!short) kBilling(KBT.bill, W / 2, yy + 96, { size: 44, p: seg(lt, 0.9 * f, 3.2 * f) });
    else kBilling(KBT.bill.slice(0, 1), W / 2, yy + 84, { size: 40, p: seg(lt, 0.4, 1.2) });
    lockup(W / 2, KBO - (short ? 130 : 118), short ? 58 : 54, KL.ink, { pm: seg(lt, short ? 0.8 : 2.2 * f, short ? 1.8 : 2.2 * f + 1.2), pw: seg(lt, short ? 1.2 : 2.2 * f + 0.5, short ? 2.0 : 2.2 * f + 1.5) });
    kLabel(LINKS[0], W / 2, KBO - 50, { size: 20, track: 0.3, col: KL.ink, alpha: eOut(seg(lt, short ? 1.4 : 3.0 * f, short ? 2.0 : 3.0 * f + 0.8)) });
    g.restore();
  },
};
