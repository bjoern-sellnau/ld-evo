/* Genre-Fassungen der beiden Kino-Trailer (Wunsch vom 27.11.2026): ?g=action|thriller|comedy|horror|epos|helden.
   Die Drehbücher (kino-a.js, kino-b.js) bleiben dieselben — das Genre bringt Tempo (scenes.js), Farben, Grund, Schriftbild, Schnitt und
   Kamera, einen Bildlook, eigene Zwischentafeln und eigene Musik (kino-musik.js). „epos“ ist die Fassung in der Machart großer
   Zeit-Epen (schmale gesperrte Schrift, kaltes Stahlblau, tickende Uhr, der sehr tiefe „Braam“), „helden“ die in der Machart eines
   Helden-Finales (entsättigte Rückblenden, Asche, Tafeln zerfallen zu Staub, vom Klavier zum großen Satz). Nachempfunden ist jeweils
   nur die Machart — keine fremden Namen, Figuren, Schriftzüge, Bilder oder Tonfolgen.
   Regeln der Marke: Verzerrungen (Störstreifen, Farbsäume, Zeilenmuster) laufen nie über Szenen mit dem Zeichen (Auftakt, Abspann);
   das Zeichen bleibt orange, ungedreht und ohne Effekte. Inhalte: die Zwischentafeln stützen sich auf belegte Angaben (data.js,
   Story-Seite „LD Beyond“, Fotokarte „Foto folgt“ der Über-mich-Seite); Pointen und Dramatisierungen sind als solche erkennbar. */
'use strict';
if (GENRE) (() => {
  const G = GENRE, F = KB ? 'b' : 'a';
  /* ---------- Zwischentafeln und Schlusszeilen ---------- */
  const TXT_G = {
    action: {
      a: { de: { career: ['20 Jahre.', 'Eine Laufbahn.'], craft: ['4 Technologien.', 'Ein Fokus.'], labs: ['Und er ist noch nicht fertig.'] }, en: { career: ['20 years.', 'One career.'], craft: ['4 technologies.', 'One focus.'], labs: ['And he is not done yet.'] } },
      b: { de: { turn: ['Eine Plattform.', 'Ein System.'], steps: ['Vier Schritte.', 'Kein Code.'], inside: ['Sechs Gründe.'] }, en: { turn: ['One platform.', 'One system.'], steps: ['Four steps.', 'No code.'], inside: ['Six reasons.'] } },
    },
    thriller: {
      a: { de: { career: ['2004 war es ein Hobby.', '2007 wurde es ernst.'], craft: ['Er hinterlässt Spuren.', 'Zehn davon mit Zertifikat.'], labs: ['Seit März 2026', 'laufen die Experimente.'] }, en: { career: ['In 2004 it was a hobby.', 'In 2007 it got serious.'], craft: ['He leaves traces.', 'Ten of them certified.'], labs: ['Since March 2026', 'the experiments are running.'] } },
      b: { de: { turn: ['Du bist schon drin.'], stage: ['Jede Seite ist ein Test.'], steps: ['Was du siehst,', 'wird veröffentlicht.'], inside: ['Zwei-Faktor-Anmeldung.', 'Niemand kommt einfach so rein.'] }, en: { turn: ['You’re already in.'], stage: ['Every page is a test.'], steps: ['What you see', 'is what gets published.'], inside: ['Two-factor sign-in.', 'Nobody just walks in.'] } },
    },
    comedy: {
      /* „Foto folgt“: so steht es auf der Fotokarte der Über-mich-Seite (Aufnahme vom 26.11.2026) */
      a: { de: { begin: ['Diese Geschichte beginnt mit Flash.', 'Ja. Flash.'], career: { lines: ['Das bin ich.', '(Foto folgt.)'], at: 1.1, freeze: true, per: 1.6 }, gold: ['Dann gab es Gold.', 'In der Schweiz. Für Mobile.'], craft: ['Er sammelt Zertifikate.', 'Andere sammeln Briefmarken.'], labs: ['21 Labs in neun Monaten.', 'Er hätte auch schlafen können.'], soon: 'Fortsetzung folgt' },
        en: { begin: ['This story begins with Flash.', 'Yes. Flash.'], career: { lines: ['That’s me.', '(Photo coming.)'], at: 1.1, freeze: true, per: 1.6 }, gold: ['Then came gold.', 'In Switzerland. For mobile.'], craft: ['He collects certificates.', 'Others collect stamps.'], labs: ['21 labs in nine months.', 'He could have slept instead.'], soon: 'To be continued' } },
      /* „2006 . ein neuer Anfang“ steht in der Kopfzeile der eigenen Seite von 2006 (assets/old_ld2006.webp) */
      b: { de: { turn: ['2006 stand dort: „ein neuer Anfang“.', '2027: noch einer.'], steps: ['Ändern macht Spaß.', 'Steht so im Konzept.'], inside: ['Geprüft mit axe.', '(Das ist ein Prüfwerkzeug.)'] }, en: { turn: ['In 2006 it said: “a new beginning”.', '2027: another one.'], steps: ['Changing it is fun.', 'It says so in the concept.'], inside: ['Tested with axe.', '(That’s a testing tool.)'] } },
    },
    horror: {
      a: { de: { begin: ['Es begann mit Flash.', 'Flash ist tot.', 'Er nicht.'], career: ['Er hat Dinge gesehen.', 'ColdFusion. XHTML. Winzige Screens.'], craft: ['Der Zähler läuft.', 'Er hält nicht an.'], labs: ['Die Experimente laufen.', 'Zuschauen erlaubt.'], soon: 'Es kommt' },
        en: { begin: ['It began with Flash.', 'Flash is dead.', 'He is not.'], career: ['He has seen things.', 'ColdFusion. XHTML. Tiny screens.'], craft: ['The counter is running.', 'It does not stop.'], labs: ['The experiments are running.', 'Watching allowed.'], soon: 'It is coming' } },
      b: { de: { turn: ['Es wächst.', 'Mit jeder Seite.'], stage: ['Du bist schon drin.'], steps: ['Was du siehst,', 'wird veröffentlicht.'], inside: ['Es spricht zwei Sprachen.'], comes: 'Es kommt' }, en: { turn: ['It grows.', 'With every page.'], stage: ['You’re already in.'], steps: ['What you see', 'is what gets published.'], inside: ['It speaks two languages.'], comes: 'It is coming' } },
    },
    epos: {
      a: { de: { begin: ['Zeit ist relativ.', 'Erfahrung nicht.'], career: ['Über 600 Millionen Sekunden', 'im Dienst des Webs.'], labs: ['Was als Experiment beginnt,', 'bleibt selten eines.'] }, en: { begin: ['Time is relative.', 'Experience is not.'], career: ['More than 600 million seconds', 'in the service of the web.'], labs: ['What begins as an experiment', 'rarely stays one.'] } },
      b: { de: { stage: ['Was du siehst,', 'ist die Bühne.'], steps: ['Was du nicht siehst,', 'ist der Regieraum.'], inside: ['Ein klares System', 'schlägt hundert Einfälle.'] }, en: { stage: ['What you see', 'is the stage.'], steps: ['What you don’t see', 'is the control room.'], inside: ['A clear system', 'beats a hundred ideas.'] } },
    },
    helden: {
      a: { de: { begin: ['Alles hat einen Anfang.'], career: ['Zwanzig Jahre.', 'Jede Station zählt.'], labs: ['Jetzt kommt alles zusammen.'], soon: 'Die Reise geht weiter' }, en: { begin: ['Everything has a beginning.'], career: ['Twenty years.', 'Every station counts.'], labs: ['Now it all comes together.'], soon: 'The journey continues' } },
      b: { de: { turn: ['Jedes System braucht einen Anfang.'], stage: ['Eine Bühne.', 'Viele Seiten.'], steps: ['Vier Schritte.'], inside: ['Sechs Kräfte.', 'Eine Plattform.'] }, en: { turn: ['Every system needs a beginning.'], stage: ['One stage.', 'Many pages.'], steps: ['Four steps.'], inside: ['Six powers.', 'One platform.'] } },
    },
    /* Countdown: stiller Teaser mit wenigen Tafeln; die Uhr am Schluss steht in kino.js (KS.clock) */
    countdown: {
      a: { de: { career: ['Zwanzig Jahre.'], labs: ['Und es geht weiter.'] }, en: { career: ['Twenty years.'], labs: ['And it goes on.'] } },
      b: { de: { turn: ['Die neue Website.'], kicker: 'Die neue Website' }, en: { turn: ['The new website.'], kicker: 'The new website' } },
    },
  }[G][F][LANG];
  KGX.cards = {};
  for (const [id, v] of Object.entries(TXT_G)) { if (id === 'soon') KA.soon = v; else if (id === 'comes') KBT.comes = v; else if (id === 'kicker') KBT.kicker = v; else KGX.cards[id] = { per: { action: 0.85, thriller: 1.6, comedy: 1.5, horror: 1.4, epos: 2.0, helden: 2.3, countdown: 2.6 }[G], ...(Array.isArray(v) ? { lines: v } : v) }; }

  /* ---------- Farben ---------- */
  const PAL = {
    action: { a: { bg: '#080504', soft: '#C9BBA6', mute: '#8A7F70', cool: BR.signal, warm: BR.apricot }, b: { warm: '#ff8a3c' } },
    thriller: { a: { bg: '#02080a', ink: '#DCEBEE', soft: '#8FADB3', mute: '#5F7B82', cool: BR.nova, warm: BR.nova, hi: BR.nova }, b: { soft: '#8fa0b8' } },
    comedy: { a: { light: true, bg: BR.cream, ink: BR.ink, soft: BR.text2, mute: BR.meta, cool: BR.apricot, warm: BR.orange, hi: BR.glassDark, gold: '#C8791F' }, b: {} },
    horror: { a: { bg: '#050203', ink: '#E9E2D6', soft: '#A39A8C', mute: '#6E665C', cool: BR.signal, warm: BR.signal, hi: BR.signal }, b: { acc: '#ff4d1c', soft: '#8f8a92', cool: '#ff4d1c', warm: '#ff4d1c' } },
    epos: { a: { bg: '#05070a', ink: '#E6EBF2', soft: '#9AA8B8', mute: '#6B7888', cool: BR.sky, warm: '#C9D6E6', hi: '#C9D6E6' }, b: { acc: '#9cc8f2', soft: '#94a3b6' } },
    helden: { a: { bg: '#06070a', ink: '#ECEAE6', soft: '#A8A6A2', mute: '#74726E', cool: BR.sky, warm: BR.apricot }, b: { soft: '#98a2b2' } },
    countdown: { a: { bg: '#040506', ink: '#E8E6E1', soft: '#A09E99', mute: '#6C6A66', cool: BR.sky, warm: BR.apricot }, b: { soft: '#93a1b8' } },
  }[G][F];
  Object.assign(KL, { hi: BR.apricot }, PAL);
  const LOGO = (s) => s && (s.id === 'studio' || s.id === 'end');   // Szenen mit dem Zeichen: keine Verzerrungen
  const flick = (t) => { const f = Math.floor(t * 30); return 0.5 + 0.25 * Math.sin(t * 3.1) + 0.25 * Math.sin(t * 5.3 + 1) + (hash(Math.floor(t * 2.2) * 9.1) > 0.86 && hash(f * 1.7) > 0.5 ? 1.2 : 0); };
  /* Zustand des laufenden Bildes (setzt cam zurück): Störung, Abdunklung, „Pop“ */
  let GL = 0, DIP = 0, POP = 0;

  /* ---------- Grund ---------- */
  const ASH = Array.from({ length: 110 }, (_, i) => ({ x: hash(i * 3.3 + 1), y: hash(i * 5.1 + 2), s: 0.8 + hash(i * 7.7 + 3) * 2.6, d: 0.3 + hash(i * 2.9 + 4) * 0.7, ph: hash(i * 1.7 + 5) * 6.283 }));
  if (G === 'action') KGX.dust = (t, a = 1) => { /* Funken: steigen schnell, schwanken, glühen */
    g.save(); g.globalCompositeOperation = 'lighter';
    for (const p of ASH) { const y = KBO - ((p.y * KH + t * (110 + 260 * p.d)) % (KH + 40)), x = (p.x * W + Math.sin(t * (0.9 + p.d) + p.ph) * 46 + t * 30 * p.d) % W, al = (0.35 + 0.65 * Math.abs(Math.sin(t * 2.2 * p.d + p.ph))) * a * 0.75 * clamp((KBO - y) / 220 + 0.25); g.fillStyle = rgba(p.d > 0.7 ? BR.apricot : BR.orange, al); g.fillRect(x, y, p.s * 1.1, p.s * (2.2 + 3 * p.d)); }
    g.restore();
  };
  if (G === 'helden') KGX.dust = (t, a = 1) => { /* Asche: treibt langsam nach rechts oben */
    g.save();
    for (const p of ASH) { const x = (p.x * W + t * (26 + 60 * p.d)) % (W + 30) - 15, y = KT + ((((p.y * KH - t * (8 + 22 * p.d) + Math.sin(t * 0.7 + p.ph) * 18) % KH) + KH) % KH), al = (0.25 + 0.5 * (0.5 + 0.5 * Math.sin(t * (0.6 + p.d) + p.ph))) * a * 0.55; g.fillStyle = rgba(p.d > 0.75 ? BR.apricot : '#B9B4AC', al); g.beginPath(); g.ellipse(x, y, p.s * 1.3, p.s * 0.7, p.ph + t * 0.4, 0, 7); g.fill(); }
    g.restore();
  };
  if (G === 'comedy' && !KB) KGX.dust = () => {};
  /* Ringe der Epos-Fassung: dünne Kreise um die Bildmitte mit wandernden Marken, dazu ein Zeiger, der auf jedem Schlag weiterspringt */
  const rings = (t, a = 1) => {
    g.save(); g.lineWidth = 1.2;
    for (let q = 0; q < 6; q++) { const r = 190 + q * 150, an = t * (q % 2 ? 0.05 : -0.035) * (1 + q * 0.2) + q; g.strokeStyle = rgba(BR.sky, (0.13 - q * 0.014) * a); g.beginPath(); g.arc(W / 2, KCY, r, an, an + Math.PI * (1.25 + 0.1 * q)); g.stroke(); for (let m = 0; m < 12; m++) { const am = an + (m * Math.PI) / 6; g.beginPath(); g.moveTo(W / 2 + Math.cos(am) * (r - 6), KCY + Math.sin(am) * (r - 6)); g.lineTo(W / 2 + Math.cos(am) * (r + 6), KCY + Math.sin(am) * (r + 6)); g.stroke(); } }
    const tick = Math.floor(t / B), ah = -Math.PI / 2 + ((tick + eOut5(clamp((t / B - tick) * 5))) * Math.PI) / 30; g.strokeStyle = rgba('#E6EBF2', 0.2 * a); g.lineWidth = 1.5; g.beginPath(); g.moveTo(W / 2, KCY); g.lineTo(W / 2 + Math.cos(ah) * 880, KCY + Math.sin(ah) * 880); g.stroke();
    g.restore();
  };
  const BG_A = {
    action(t, o) { g.fillStyle = '#000'; g.fillRect(0, 0, W, H); const gr = g.createRadialGradient(W / 2, KCY, 60, W / 2, KCY, W * 0.6); gr.addColorStop(0, '#1d1611'); gr.addColorStop(1, '#040302'); g.fillStyle = gr; g.fillRect(0, KT, W, KH); glow(W * (0.16 + 0.03 * Math.sin(t * 0.4)), KBO + 40, 820, BR.signal, 0.2); glow(W * 0.86, KT - 40, 760, BR.apricot, 0.1); glow(W * 0.5, KBO + 260, 900, BR.orange, 0.12 + 0.05 * Math.sin(t * 2.1)); kDust(t, o.dust ?? 1); },
    thriller(t, o) { g.fillStyle = '#000'; g.fillRect(0, 0, W, H); const gr = g.createLinearGradient(0, KT, 0, KBO); gr.addColorStop(0, '#071c22'); gr.addColorStop(1, '#010506'); g.fillStyle = gr; g.fillRect(0, KT, W, KH); glow(W * 0.5, KT - 220, 900, BR.nova, 0.09); const x = ((t * 90) % (W + 600)) - 300, sg = g.createLinearGradient(x - 220, 0, x + 220, 0); sg.addColorStop(0, 'rgba(156,200,242,0)'); sg.addColorStop(0.5, 'rgba(156,200,242,0.05)'); sg.addColorStop(1, 'rgba(156,200,242,0)'); g.fillStyle = sg; g.fillRect(x - 220, KT, 440, KH); },
    comedy(t) { g.fillStyle = BR.cream; g.fillRect(0, KT, W, KH); g.save(); g.globalAlpha = 0.5; glow(W * (0.14 + 0.03 * Math.sin(t * 0.5)), KT + 120, 620, BR.apricot, 0.5, false); glow(W * (0.88 + 0.02 * Math.cos(t * 0.4)), KBO - 80, 700, BR.ghostL, 0.9, false); g.restore(); g.fillStyle = 'rgba(23,19,16,0.05)'; for (let y = KT + 30; y < KBO; y += 46) for (let x = 30 + ((y / 46) % 2) * 23; x < W; x += 46) { g.beginPath(); g.arc(x, y, 2, 0, 7); g.fill(); } },
    horror(t) { g.fillStyle = '#000'; g.fillRect(0, 0, W, H); const gr = g.createRadialGradient(W / 2, KCY, 40, W / 2, KCY, W * 0.56); gr.addColorStop(0, '#140608'); gr.addColorStop(1, '#020101'); g.fillStyle = gr; g.fillRect(0, KT, W, KH); glow(W * 0.5, KBO + 200, 900, BR.signal, 0.07 + 0.05 * flick(t)); kDustDef(t, 0.5, '#E9E2D6'); },
    epos(t, o) { g.fillStyle = '#000'; g.fillRect(0, 0, W, H); const gr = g.createRadialGradient(W / 2, KCY, 80, W / 2, KCY, W * 0.62); gr.addColorStop(0, '#111a26'); gr.addColorStop(1, '#030507'); g.fillStyle = gr; g.fillRect(0, KT, W, KH); rings(t, o.rings ?? 1); glow(W * 0.5, KT - 260, 900, BR.sky, 0.08); kDustDef(t, 0.5, '#C9D6E6'); },
    countdown(t, o) { g.fillStyle = '#000'; g.fillRect(0, 0, W, H); const gr = g.createRadialGradient(W / 2, KCY, 60, W / 2, KCY, W * 0.6); gr.addColorStop(0, '#0e1014'); gr.addColorStop(1, '#020203'); g.fillStyle = gr; g.fillRect(0, KT, W, KH); glow(W * 0.5, KBO + 260, 900, BR.apricot, 0.08); kDustDef(t, 0.45, '#E8E6E1'); },
    helden(t, o) { g.fillStyle = '#000'; g.fillRect(0, 0, W, H); const gr = g.createLinearGradient(0, KT, 0, KBO); gr.addColorStop(0, '#0d1016'); gr.addColorStop(1, '#050608'); g.fillStyle = gr; g.fillRect(0, KT, W, KH); glow(W * 0.5, KBO + 240, 980, BR.apricot, 0.13); glow(W * 0.5, KT - 280, 900, BR.sky, 0.07); kDust(t, o.dust ?? 1); },
  };
  /* die Schwebeteilchen der Grundfassung (kDust ist bei Action und Helden ersetzt) */
  const kDustDef = (t, a, col) => { g.save(); for (const p of KDUST) { const x = (((p.x + t * 14 * p.d) % W) + W) % W, y = KT + ((((p.y * KH - t * 5 * p.d) % KH) + KH) % KH), al = (0.2 + 0.8 * (0.5 + 0.5 * Math.sin(t * (0.5 + p.d) + p.ph))) * p.d * a * 0.5; g.fillStyle = rgba(col, al); g.beginPath(); g.arc(x, y, p.s, 0, 7); g.fill(); } g.restore(); };
  KGX.bg = (t, o) => { if (KB) return false; BG_A[G](t, o); return true; };
  /* „LD Beyond“ behält seinen Grund (Nachtblau, Raster) — das Genre legt nur Licht dazu */
  KGX.bgEnd = (t, o) => {
    if (G === 'action') { glow(W * 0.85, KBO + 120, 760, BR.signal, 0.14); glow(W * 0.1, KBO + 200, 700, BR.orange, 0.1); }
    else if (G === 'thriller') { const x = ((t * 110) % (W + 600)) - 300, sg = g.createLinearGradient(x - 200, 0, x + 200, 0); sg.addColorStop(0, 'rgba(156,200,242,0)'); sg.addColorStop(0.5, 'rgba(156,200,242,0.06)'); sg.addColorStop(1, 'rgba(156,200,242,0)'); g.fillStyle = sg; g.fillRect(x - 200, KT, 400, KH); }
    else if (G === 'comedy') { [BR.flow, BR.nova, BR.buddy, BR.ivy].forEach((c, q) => glow(W * (0.14 + q * 0.24) + Math.sin(t * 0.6 + q * 1.7) * 90, (q % 2 ? KBO + 60 : KT - 60) + Math.cos(t * 0.5 + q) * 40, 520, c, 0.13)); }
    else if (G === 'horror') { g.fillStyle = 'rgba(8,0,0,0.35)'; g.fillRect(0, KT, W, KH); glow(W * 0.5, KBO + 220, 900, '#ff4d1c', 0.1 + 0.07 * flick(t)); }
    else if (G === 'epos') { g.fillStyle = 'rgba(4,6,10,0.3)'; g.fillRect(0, KT, W, KH); rings(t, o.rings ?? 0.9); }
    else if (G === 'helden') { glow(W * 0.5, KBO + 240, 980, BR.apricot, 0.1); }
    else if (G === 'countdown') { g.fillStyle = 'rgba(3,4,8,0.28)'; g.fillRect(0, KT, W, KH); }
  };

  /* ---------- Schriftbild ---------- */
  const isHead = (o) => (o.fam ?? KL.head) === KL.head && (o.size ?? 60) >= 40 && !o.plain;
  KGX.text = (str, o) => {
    let n = o;
    if (KL.light && !o.onImg && (o.grad || o.col === BR.apricot || o.col === BR.cream)) { n = { ...o }; if (o.grad) n.grad = o.grad[0][1] === '#FFF3D6' ? [[0, '#D98A1F'], [1, '#8A4A0C']] : [[0, BR.ink], [1, '#4A4038']]; if (o.col === BR.apricot) n.col = KL.hi; else if (o.col === BR.cream) n.col = KL.ink; }
    if (!isHead(o)) return [str, n];
    n = n === o ? { ...o } : n; n.kg = true;
    if (G === 'action') { n.w = 800; n.sz = 0.92; str = str.toUpperCase(); }
    else if (G === 'thriller') { n.w = 300; n.track = (o.track ?? 0) + 0.1; n.sz = 0.8; str = str.toUpperCase(); }
    else if (G === 'horror') { if (KB) { n.w = 300; n.track = (o.track ?? 0) + 0.05; n.sz = 0.92; } else { n.fam = SER; n.it = true; n.w = 400; n.sz = 1.12; n.track = 0; } }
    else if (G === 'epos') { n.w = 200; n.track = (o.track ?? 0) + 0.26; n.sz = 0.72; str = str.toUpperCase(); }
    else if (G === 'countdown') { n.w = 500; n.track = (o.track ?? 0) + 0.14; n.sz = 0.78; str = str.toUpperCase(); if (!o.grad && !o.col && !o.stroke) n.grad = [[0, '#FFFFFF'], [1, '#B9BEC8']]; }
    else if (G === 'helden') { n.w = 700; n.track = (o.track ?? 0) + 0.05; n.sz = 0.86; str = str.toUpperCase(); if (!o.grad && !o.col && !o.stroke) n.grad = [[0, '#FFFFFF'], [0.5, '#D9DEE6'], [1, '#7C8797']]; }
    return [str, n];
  };
  /* Action: nach rechts geneigt; Horror: die Schrift zittert leicht */
  if (G === 'action') KGX.tf = (x, y, size, o) => { if (o.kg) g.transform(1, 0, -0.16, 1, 0.16 * y, 0); };
  if (G === 'horror') KGX.tf = (x, y, size, o) => { if (o.kg) { const f = Math.floor(KTIME * 30); g.translate((hash(f * 1.3 + size) - 0.5) * 2.4, (hash(f * 2.1 + size) - 0.5) * 1.8); } };
  /* Farbsäume an großer Schrift, solange eine Störung läuft (Thriller, Horror) */
  if (G === 'horror' || G === 'thriller') KGX.ghost = (str, x, y, size, o) => { const d = (G === 'horror' ? 1.2 + 2.2 * Math.max(0, flick(KTIME) - 1) : 0) + GL * 9; if (!o.kg || size < 64 || d < 0.6) return; g.save(); g.globalCompositeOperation = 'lighter'; g.globalAlpha *= 0.5; g.fillStyle = '#ff2a2a'; g.fillText(str, x - d, y); g.fillStyle = '#22d3ff'; g.fillText(str, x + d, y); g.restore(); };

  /* ---------- Schnitt, Kamera, Bildlook ---------- */
  KGX.punch = { action: 1.9, thriller: 0.4, comedy: 1, horror: 0.8, epos: 0.3, helden: 0.6, countdown: 0.25 }[G];
  /* Komödie: das Bild federt herein, statt zu stoßen */
  if (G === 'comedy') KGX.punchFn = (tl, amt, fn) => { const k = 1 + 0.06 * (1 - eBack(clamp(tl / 0.38))); g.save(); g.translate(W / 2, KCY); g.scale(k, k); g.translate(-W / 2, -KCY); fn(); g.restore(); };
  KGX.cut = (tl, a) => {
    if (G === 'action') { const k = a * 0.85 * Math.exp(-tl * 10); if (k > KFL) { KFL = k; KFLC = BR.apricot; } }
    else if (G === 'thriller') { GL = Math.max(GL, Math.min(1, a * 1.8) * Math.exp(-tl * 16)); if (a >= 0.4 && tl < 0.07) DIP = Math.max(DIP, 0.8); }
    else if (G === 'comedy') { if (tl < 0.3) POP = Math.max(POP, 1 - tl / 0.3); }
    else if (G === 'horror') { GL = Math.max(GL, Math.min(1, a * 1.6) * Math.exp(-tl * 9)); if (a >= 0.6 && tl < 0.07) DIP = Math.max(DIP, 0.55); }
    else if (G === 'epos') { const k = a * 0.7 * Math.exp(-tl * 2.6); if (k > KFL) { KFL = k; KFLC = '#CFE0F5'; } }
    else if (G === 'countdown') { const k = a * 0.32 * Math.exp(-tl * 3.5); if (k > KFL) { KFL = k; KFLC = '#FFF1DC'; } }
    else { const k = a * 0.55 * Math.exp(-tl * 6); if (k > KFL) { KFL = k; KFLC = '#FFF1DC'; } }
    return true;
  };
  KGX.cam = (t, s, lt) => {
    GL = 0; DIP = 0; POP = 0;
    const logo = LOGO(s);
    if (G === 'action') { /* Handkamera, auf jedem Schnitt ein Ruck */
      const P = kPlan(s); let last = 0; for (const [x] of P.hitsT) if (x <= lt) last = Math.max(last, x); const k = (logo ? 0.3 : 1) * (1 + 3.2 * Math.exp(-(lt - last) * 7));
      g.translate((Math.sin(t * 13.1) + Math.sin(t * 7.3 + 1)) * 2.0 * k, (Math.cos(t * 11.7) + Math.sin(t * 5.9)) * 1.5 * k);
    } else if (G === 'horror' && !logo) { const z = 1.012 + 0.008 * Math.sin(t * 0.9); g.translate(W / 2, KCY); g.scale(z, z); g.translate(-W / 2 + Math.sin(t * 0.37) * 5, -KCY); }
    else if (G === 'epos' || (G === 'countdown' && s.id !== 'clock')) { const z = 1 + 0.014 * (lt / s.D); g.translate(W / 2, KCY); g.scale(z, z); g.translate(-W / 2, -KCY); }
  };
  /* Bildlook auf Fotos und Bildschirmaufnahmen */
  const grade = (x, y, w, h, sat, tint, dim) => { g.save(); if (sat < 1) { g.globalCompositeOperation = 'saturation'; g.globalAlpha = 1 - sat; g.fillStyle = '#808080'; g.fillRect(x, y, w, h); } if (tint) { g.globalCompositeOperation = 'multiply'; g.globalAlpha = 1; g.fillStyle = tint; g.fillRect(x, y, w, h); } if (dim) { g.globalCompositeOperation = 'source-over'; g.globalAlpha = dim; g.fillStyle = '#000'; g.fillRect(x, y, w, h); } g.restore(); };
  KGX.img = { action: (x, y, w, h) => grade(x, y, w, h, 1, '#FFE6D2', 0), thriller: (x, y, w, h) => grade(x, y, w, h, 0.4, '#CFE0F0', 0.06), comedy: null, horror: (x, y, w, h) => grade(x, y, w, h, 0.35, '#E3B3A8', 0.16), epos: (x, y, w, h) => grade(x, y, w, h, 0.28, '#C8D6E6', 0.06), helden: (x, y, w, h) => grade(x, y, w, h, 0.18, '#EFE6DA', 0.08), countdown: (x, y, w, h) => grade(x, y, w, h, 0.3, '#E9E4DC', 0.1) }[G];
  /* Störstreifen: waagerechte Bänder des fertigen Bildes versetzt noch einmal gezeichnet */
  const slices = (t, k, n) => { const f = Math.floor(t * 30); g.save(); g.globalCompositeOperation = 'source-over'; for (let q = 0; q < n; q++) { const y = KT + Math.floor(hash(f * 3.1 + q * 7.7) * (KH - 60)), h = 8 + Math.floor(hash(f * 5.3 + q) * 54), dx = Math.round((hash(f * 1.9 + q * 3.3) - 0.5) * 150 * k); if (dx) g.drawImage(cv, 0, y, W, h, dx, y, W, h); } g.restore(); };
  KGX.post = (t, s, lt) => {
    const logo = LOGO(s);
    if (G === 'thriller') { if (!logo && GL > 0.08) slices(t, GL, 5); if (DIP > 0) { g.fillStyle = `rgba(0,0,0,${DIP})`; g.fillRect(0, KT, W, KH); } }
    else if (G === 'horror') {
      /* gelegentliche kurze Störung (höchstens eine je knapper Sekunde), Flackern der Helligkeit in kleinen Schritten */
      const burst = !logo && hash(Math.floor(t / 0.95) * 4.7) > 0.72 && (t % 0.95) < 0.13 ? 0.7 : 0, k = Math.max(GL, burst);
      if (!logo && k > 0.08) { slices(t, k, 7); g.save(); g.globalAlpha = 0.28 * k; g.globalCompositeOperation = 'lighter'; const f = Math.floor(t * 30); for (let y = KT - Math.floor(hash(f) * 256); y < KBO; y += 512) for (let x = -Math.floor(hash(f + 2) * 256); x < W; x += 512) g.drawImage(KGRAIN, x, y, 512, 512); g.restore(); }
      g.fillStyle = `rgba(0,0,0,${clamp(0.05 + 0.05 * (1 - flick(t)) + DIP, 0, 0.7)})`; g.fillRect(0, KT, W, KH);
    } else if (G === 'comedy' && POP > 0.02) { /* „Pop“: ein Ring springt aus der Mitte */
      const r = lerp(120, 1500, eOut(1 - POP)); g.save(); g.strokeStyle = rgba(KB ? BR.nova : BR.orange, 0.55 * POP); g.lineWidth = 34 * POP; g.beginPath(); g.arc(W / 2, KCY, r, 0, 7); g.stroke(); g.restore();
    }
  };
  KGX.vig = { action: 0.72, thriller: 0.7, comedy: KB ? 0.5 : 0.1, horror: 0.82, epos: 0.66, helden: 0.66, countdown: 0.74 }[G];
  KGX.grain = { action: 0.06, thriller: 0.05, comedy: 0.03, horror: 0.075, epos: 0.05, helden: 0.06, countdown: 0.05 }[G];
  /* Zeilenmuster der Horror-Fassung (wie ein altes Videoband) */
  const SCAN = (() => { const c = mkLayer(4, 4); c.fillStyle = 'rgba(0,0,0,0.5)'; c.fillRect(0, 0, 4, 2); return c.canvas; })();
  const tc = (t) => { const f = Math.floor(t * 30), p = (v) => String(v).padStart(2, '0'); return `${p(Math.floor(f / 1800))}:${p(Math.floor(f / 30) % 60)}:${p(f % 30)}`; };
  KGX.overlay = (t, s) => {
    const logo = LOGO(s);
    if (G === 'action' && !logo) { g.save(); g.globalCompositeOperation = 'soft-light'; const gr = g.createLinearGradient(0, KT, W, KBO); gr.addColorStop(0, 'rgba(20,150,170,0.22)'); gr.addColorStop(0.5, 'rgba(0,0,0,0)'); gr.addColorStop(1, 'rgba(255,120,22,0.24)'); g.fillStyle = gr; g.fillRect(0, KT, W, KH); g.restore(); }
    else if (G === 'thriller') { /* Sucher: Ecken und laufender Zeitcode des Trailers */
      g.save(); g.strokeStyle = 'rgba(220,230,240,0.5)'; g.lineWidth = 2; const m = 54, L = 38; for (const [x, y, dx, dy] of [[m, KT + m - 14, 1, 1], [W - m, KT + m - 14, -1, 1], [m, KBO - m + 14, 1, -1], [W - m, KBO - m + 14, -1, -1]]) { g.beginPath(); g.moveTo(x + dx * L, y); g.lineTo(x, y); g.lineTo(x, y + dy * L); g.stroke(); } g.restore();
      text(`TC ${tc(t)}`, W - 84, KT + 74, { size: 17, weight: 500, fam: KL.mono, align: 'right', ls: 2.5, color: 'rgba(220,230,240,0.6)' });
      if (!logo) { const y = KT + ((t * 70) % KH); g.fillStyle = 'rgba(156,200,242,0.05)'; g.fillRect(0, y, W, 2); }
    } else if (G === 'horror') {
      if (!logo) { g.save(); g.fillStyle = g.createPattern(SCAN, 'repeat'); g.globalAlpha = 0.36; g.fillRect(0, KT, W, KH); g.restore(); const y = KT + ((t * 46) % (KH + 160)) - 80; g.fillStyle = 'rgba(255,255,255,0.035)'; g.fillRect(0, y, W, 42); }
      text('▶ PLAY', 84, KT + 76, { size: 22, weight: 700, fam: KL.mono, ls: 3, color: 'rgba(240,240,240,0.7)' }); text(tc(t), W - 84, KT + 76, { size: 22, weight: 700, fam: KL.mono, align: 'right', ls: 3, color: 'rgba(240,240,240,0.7)' });
      const v = g.createRadialGradient(W / 2, KCY, KH * 0.45, W / 2, KCY, W * 0.6); v.addColorStop(0, 'rgba(60,0,0,0)'); v.addColorStop(1, 'rgba(60,0,0,0.32)'); g.fillStyle = v; g.fillRect(0, KT, W, KH);
    } else if (G === 'epos' && !KB && !logo && s.id !== 'craft') { /* die Zeit läuft mit: der Sekundenzähler der Website klein am unteren Rand */
      text(fmtInt(SEC0 + 4 * 24 * 3600 + t, LANG), W / 2, KBO - 34, { size: 17, weight: 500, fam: KL.mono, align: 'center', ls: 5, color: 'rgba(201,214,230,0.5)' });
    }
  };

  /* ---------- Zwischentafeln ---------- */
  const fitHead = (s, size, o = {}) => kFit(s, 1560, size, { w: KL.headW, fam: KL.head, ...o });
  const CARD = {
    /* Action: jede Zeile allein, groß und geneigt, mit Schlag */
    action(c, t, d) { const n = c.lines.length, per = d / n, i = Math.min(n - 1, Math.floor(t / per)), tl = t - i * per, s = c.lines[i], size = fitHead(s, 170, { w: 800 }), sc = lerp(1.3, 1, eOut5(seg(tl, 0, 0.28))) * (1 + 0.03 * (tl / per)); kFlare(W / 2, KCY + 10, 1000, i % 2 ? KL.cool : KL.warm, 0.6 * Math.exp(-tl * 3) + 0.08); g.save(); g.translate(W / 2, KCY); g.scale(sc, sc); g.translate(-W / 2, -KCY); kText(s, W / 2, KCY + size * 0.33, { size, w: 800, alpha: seg(tl, 0, 0.05) }); g.restore(); kCutFlash(tl, 0.5); },
    /* Thriller: getippt, Zeile für Zeile, mit Schreibmarke */
    thriller(c, t, d) { const n = c.lines.length, per = d / n, size = Math.min(...c.lines.map((s) => fitHead(s, 84))), lh = size * 1.5, y0 = KCY - ((n - 1) * lh) / 2 + size * 0.28, out = 1 - eIn(seg(t, d - 0.3, d)); g.save(); g.globalAlpha = out; c.lines.forEach((s, i) => { const k = clamp(((t - i * per) * 30) / s.length), cut = s.slice(0, Math.round(s.length * k)); if (!cut) return; const wFull = kMeasure(s, size, {}), x = W / 2 - wFull / 2; kText(cut, x, y0 + i * lh, { size, align: 'left' }); if (k < 1 || (i === n - 1 && Math.floor(t * 2.5) % 2 === 0)) { const wc = kMeasure(cut, size, {}); g.fillStyle = rgba(BR.sky, 0.9); g.fillRect(x + wc + size * 0.16, y0 + i * lh - size * 0.62, size * 0.09, size * 0.74); } }); g.restore(); },
    /* Komödie: erste Zeile springt herein, die Pointe kommt spät und schief — bei „freeze“ über dem angehaltenen Bild mit Kreis um die Bildmitte */
    comedy(c, t, d) {
      const n = c.lines.length, t2 = d * (n > 2 ? 0.4 : 0.52), out = 1 - eIn(seg(t, d - 0.22, d)), dark = !KL.light;
      if (c.freeze) { g.save(); g.fillStyle = dark ? 'rgba(4,6,12,0.84)' : 'rgba(246,241,232,0.93)'; g.beginPath(); g.rect(0, KT, W, KH); g.ellipse(W / 2, KCY - 30, 430, 140, 0, 0, 7); g.fill('evenodd'); const p = eOut(seg(t, 0.05, 0.5)); g.strokeStyle = BR.orange; g.lineWidth = 7; g.lineCap = 'round'; g.beginPath(); g.ellipse(W / 2, KCY - 30, 440, 148, -0.03, -1.9, -1.9 + Math.PI * 2.08 * p); g.stroke(); g.restore(); }
      const yb = c.freeze ? KBO - 150 : KCY - (n - 1) * 46;
      c.lines.forEach((s, i) => { const at = i === 0 ? 0.04 : i === n - 1 ? t2 : t2 * 0.5, p = clamp((t - at) / 0.34); if (p <= 0) return; const last = i === n - 1 && n > 1, size = last ? kFit(s, 1500, c.freeze ? 62 : 74, { w: 400, fam: SER, it: true }) : fitHead(s, c.freeze ? 78 : 96, { w: 800 }), k = eBack(p), rot = (last ? 0.022 : -0.018) * (i % 2 ? -1 : 1), y = yb + i * (c.freeze ? 78 : 112) + (last ? 6 : 0); g.save(); g.globalAlpha = out * clamp(p * 3); g.translate(W / 2, y); g.rotate(rot); g.scale(k, k); if (last) kText(s, 0, 0, { size, w: 400, fam: SER, it: true, col: dark ? BR.apricot : KL.hi, plain: true }); else kText(s, 0, 0, { size, w: 800, plain: true }); g.restore(); });
    },
    /* Horror: Zeilen tauchen flackernd auf, die letzte springt mit einer Störung ins Bild */
    horror(c, t, d) { const n = c.lines.length, per = d / n, size = Math.min(...c.lines.map((s) => fitHead(s, 84))), lh = size * 1.42 * (KB ? 1 : 1.12), y0 = KCY - ((n - 1) * lh) / 2 + size * 0.3, out = 1 - eIn(seg(t, d - 0.25, d)); c.lines.forEach((s, i) => { const tl = t - i * per, last = i === n - 1 && n > 1; if (tl <= 0) return; const a = last ? 1 : eOut(seg(tl, 0, 0.9)) * (0.72 + 0.28 * Math.min(1, flick(KTIME + i))); if (last) kCutFlash(tl, 0.7); kText(s, W / 2, y0 + i * lh, { size, alpha: a * out, col: last ? BR.signal : undefined }); }); },
    /* Epos: schmale gesperrte Zeilen, langsam */
    epos(c, t, d) { const n = c.lines.length, size = Math.min(...c.lines.map((s) => fitHead(s, 80))), lh = size * 1.25, y0 = KCY - ((n - 1) * lh) / 2 + size * 0.2, out = 1 - eIn(seg(t, d - 0.6, d)), sc = 1 + 0.04 * (t / d); g.save(); g.translate(W / 2, KCY); g.scale(sc, sc); g.translate(-W / 2, -KCY); c.lines.forEach((s, i) => kText(s, W / 2, y0 + i * lh, { size, alpha: eOut(seg(t, 0.2 + i * (d * 0.28), 1.3 + i * (d * 0.28))) * out, track: 0.02 * (t / d) })); g.restore(); kCutFlash(t, 0.5); },
    /* Helden: Zeilen stehen ruhig — und zerfallen zum Ende von links nach rechts zu Staub */
    helden(c, t, d) {
      const n = c.lines.length, size = Math.min(...c.lines.map((s) => fitHead(s, 92))), lh = size * 1.3, y0 = KCY - ((n - 1) * lh) / 2 + size * 0.22, dz = seg(t, d * 0.62, d), wMax = Math.max(...c.lines.map((s) => kMeasure(s, size, {}))), x0 = W / 2 - wMax / 2 - 40, edge = x0 + (wMax + 80) * eIO(dz);
      g.save(); if (dz > 0) { g.beginPath(); g.rect(edge, KT, W, KH); g.clip(); } c.lines.forEach((s, i) => kText(s, W / 2, y0 + i * lh, { size, alpha: eOut(seg(t, 0.15 + i * 0.5, 1.0 + i * 0.5)) })); g.restore();
      if (dz > 0) { g.save(); for (let q = 0; q < 420; q++) { const px = x0 + hash(q * 1.31) * (wMax + 80); if (px > edge) continue; const age = (edge - px) / (wMax + 80) + 0.02, py = y0 - size * 0.8 + hash(q * 2.77) * (n * lh), x = px + age * (260 + 420 * hash(q * 3.9)), y = py - age * (60 + 190 * hash(q * 5.3)) + Math.sin(age * 9 + q) * 10, al = clamp(1 - age * 1.5) * 0.85; if (al <= 0) continue; g.fillStyle = rgba(hash(q * 7.1) > 0.8 ? BR.apricot : '#D9DEE6', al); g.fillRect(x, y, 1.5 + 2.5 * hash(q * 9.7), 1.5 + 2 * hash(q * 4.1)); } g.restore(); }
    },
  };
  /* Countdown: eine ruhige Zeile, langsam ein- und ausgeblendet */
  CARD.countdown = (c, t, d) => { const n = c.lines.length, size = Math.min(...c.lines.map((s) => fitHead(s, 104))), lh = size * 1.3, y0 = KCY - ((n - 1) * lh) / 2 + size * 0.24, out = 1 - eIn(seg(t, d - 0.7, d)), sc = 1 + 0.035 * (t / d); g.save(); g.translate(W / 2, KCY); g.scale(sc, sc); g.translate(-W / 2, -KCY); c.lines.forEach((s, i) => kText(s, W / 2, y0 + i * lh, { size, alpha: eOut(seg(t, 0.25 + i * 0.6, 1.3 + i * 0.6)) * out })); g.restore(); };
  KGX.card = (c, t, d, s) => CARD[G](c, t, d, s);
})();
