/**
 * „Live-Build“-Hero (neu, nicht im Prototyp — Wunsch vom 18.10.2026): Die Seite ist schwarz, ein Terminal erscheint
 * und die Startseite wird gebaut. Sobald eine Komponente fertig ist, erscheint das echte Element der Seite.
 *  - code:   man sieht (gekürzt) den echten Code der Komponenten, wie er getippt wird
 *  - agents: Coding-Agents arbeiten parallel an je einer Komponente; fertig → Komponente erscheint
 * Je zwei Tempi: normal und „Timeshift“ (beginnt normal, wird dann immer schneller).
 *
 * Kopplung an die Seite: body[data-ldbuild] = Liste der fertigen Teile (z. B. "nav title cta"). Versteckt wird per
 * CSS (site.css, „Live-Build“) nur, solange das Attribut steht; die Elemente tragen data-ldb="…" (HalloPage), die
 * Navigation/Fußzeile werden über ihre Container erfasst. Sicherheitsnetze: „Animationen aus“ → sofort alles da;
 * Klick, Taste oder Scrollen → überspringen; Abbau des Renderers → Attribut weg; Boot-Script gibt nach 120 s alles frei.
 *
 * Dramaturgie (Wunsch: „als baue man die Seite gerade“): erst nichts, dann öffnet sich das Terminal, der Cursor blinkt,
 * dann wird langsam getippt; jedes Element erscheint erst, wenn sein Code fertig ist.
 */
import type { Ctx2D, ExtraRenderer, Mode2D } from './renderers';

const TAU = Math.PI * 2;
const PARTS = ['nav', 'kicker', 'title', 'role', 'intro', 'cta', 'scroll', 'stats', 'featured', 'news', 'footer'] as const;
type Part = (typeof PARTS)[number];

const monoFont = () => {
  const f = typeof document !== 'undefined' ? getComputedStyle(document.body).getPropertyValue('--ld-font-mono').trim() : '';
  return f ? `${f}, ui-monospace, monospace` : 'ui-monospace, SFMono-Regular, Menlo, monospace';
};
const clamp01 = (x: number) => Math.max(0, Math.min(1, x));
/** Sichtbare Canvas-Texte in der Seitensprache (Renderer hat keinen Zugriff auf useT). */
const L = (de: string, en: string) => (typeof document !== 'undefined' && document.documentElement.lang.startsWith('en') ? en : de);

/** Zeitachse: normal = Echtzeit; Timeshift = Tempo steigt linear (nach 10 s etwa dreifach). */
const clockOf = (shift: boolean) => (t: number) => (shift ? t + (t * t) / 40 : t);
/** Ablauf: so lange schwarz, dann öffnet sich das Fenster (OPEN s), dann blinkt der Cursor bis zum ersten Tastendruck. */
const BLACK = 1.8;
const OPEN = 0.9;
const TYPE_AT = BLACK + OPEN + 1.4;
const easeOut = (x: number) => 1 - Math.pow(1 - x, 3);
/**
 * Fenster „aufziehen“ (leicht wachsen + einblenden). Gibt die Deckkraft zurück; am Ende endFrame() aufrufen.
 * crtP ≥ 0: Schluss-Effekt „Röhren-Monitor aus“ (Einstellung) — erst fällt das Bild zu einer Linie zusammen, dann
 * schrumpft die Linie zum Punkt.
 */
const openWindow = (c: Ctx2D, f: { x: number; y: number; w: number; h: number }, tau: number, crtP = -1) => {
  const o = easeOut(clamp01((tau - BLACK) / OPEN));
  const g = c.g;
  g.save();
  const cx = f.x + f.w / 2;
  const cy = f.y + f.h / 2;
  const sc = 0.9 + 0.1 * o;
  const { sx, sy } = crtScale(crtP);
  g.translate(cx, cy);
  g.scale(sc * sx, sc * sy);
  g.translate(-cx, -cy);
  return o;
};
const easeIn = (x: number) => x * x * x;
const crtScale = (p: number) =>
  p < 0
    ? { sx: 1, sy: 1 }
    : {
        sy: p < 0.45 ? Math.max(0.006, 1 - easeIn(p / 0.45)) : 0.006,
        sx: p < 0.45 ? 1 : Math.max(0.002, 1 - easeIn(clamp01((p - 0.45) / 0.3))),
      };
/** Bildaufbau abschließen; beim Röhren-Effekt das Bild überstrahlen und Linie/Punkt nachglühen lassen. */
const endFrame = (c: Ctx2D, f: { x: number; y: number; w: number; h: number }, crtP: number) => {
  const g = c.g;
  if (crtP >= 0) {
    g.globalAlpha = 1;
    g.fillStyle = `rgba(230,242,255,${Math.min(1, crtP * 2.4) * 0.92})`;
    g.fillRect(f.x, f.y, f.w, f.h);
  }
  g.globalAlpha = 1;
  g.restore();
  if (crtP < 0.4) return;
  // Linie bzw. Punkt mit Nachglühen
  const { sx } = crtScale(crtP);
  const cx = f.x + f.w / 2;
  const cy = f.y + f.h / 2;
  const fade = 1 - clamp01((crtP - 0.8) / 0.55);
  const lw = Math.max(3, f.w * sx);
  const glow = g.createRadialGradient(cx, cy, 0, cx, cy, Math.max(24, lw * 0.6));
  glow.addColorStop(0, `rgba(210,232,255,${0.55 * fade})`);
  glow.addColorStop(1, 'rgba(210,232,255,0)');
  g.fillStyle = glow;
  g.fillRect(cx - lw, cy - lw, lw * 2, lw * 2);
  g.fillStyle = `rgba(255,255,255,${fade})`;
  g.fillRect(cx - lw / 2, cy - 1.5, lw, 3);
};

/** Steuert body[data-ldbuild] (siehe Dateikopf). */
function pageLink(onSkip: () => void) {
  const body = document.body;
  const done = new Set<Part>();
  let live = !body.classList.contains('still');
  const write = () => {
    if (live) body.dataset.ldbuild = [...done].join(' ');
  };
  const skip = () => onSkip();
  const onScroll = () => window.scrollY > 80 && onSkip();
  if (live) {
    write();
    window.addEventListener('pointerdown', skip, { passive: true });
    window.addEventListener('keydown', skip);
    window.addEventListener('scroll', onScroll, { passive: true });
  }
  const unlisten = () => {
    window.removeEventListener('pointerdown', skip);
    window.removeEventListener('keydown', skip);
    window.removeEventListener('scroll', onScroll);
  };
  let endTimer: ReturnType<typeof setTimeout> | undefined;
  return {
    show(p: Part) {
      if (done.has(p)) return;
      done.add(p);
      write();
    },
    /** Alles fertig: letzte Einblendung auslaufen lassen, dann Attribut entfernen (Seite wieder ganz normal). */
    finish() {
      if (!live) return;
      for (const p of PARTS) done.add(p);
      write();
      live = false;
      unlisten();
      endTimer = setTimeout(() => delete body.dataset.ldbuild, 1300);
    },
    dispose() {
      unlisten();
      clearTimeout(endTimer);
      delete body.dataset.ldbuild;
    },
  };
}

/** Terminal-Fenster: Desktop rechts neben dem Hero-Text, schmal über die ganze Breite. */
const frameOf = (c: Ctx2D) => {
  const W = c.W();
  const H = c.H();
  const wide = W > 760;
  // Der Canvas beginnt über dem Bildschirmrand (Hero-Fläche top −140): Fenster unter die Menüleiste setzen und
  // innerhalb des sichtbaren Bereichs bzw. vor der Ausblend-Maske (68 %) enden lassen.
  const cv = document.getElementById('ld-extra-canvas');
  const off = cv ? cv.getBoundingClientRect().top + window.scrollY : -140;
  const top = Math.max(0, 96 - off);
  // Während des Baus ist die Fläche bildschirmhoch und ohne Maske (site.css) — dann bis zum unteren Rand
  const building = document.body.hasAttribute('data-ldbuild');
  const bottom = Math.min(building ? H - 20 : H * 0.66, window.innerHeight - off - 36);
  const w = wide ? Math.min(W * 0.44, 640) : W - 28;
  // Position aus den Einstellungen (Regler „Links / Rechts“, „Oben / Unten“, je 0–100); ohne Wert wie bisher:
  // Desktop rechts neben dem Hero-Text, oben unter der Menüleiste, so hoch wie möglich.
  const tx = typeof c.cfg.tx === 'number' ? c.cfg.tx / 100 : null;
  const ty = typeof c.cfg.ty === 'number' ? c.cfg.ty / 100 : null;
  const x = tx !== null ? 14 + (W - 28 - w) * tx : wide ? W * 0.5 : 14;
  const full = Math.max(160, bottom - top);
  const h = ty !== null ? Math.min(full, Math.max(200, (bottom - top) * 0.6)) : full;
  const y = ty !== null ? top + Math.max(0, bottom - top - h) * ty : top;
  return { wide, x, y, w, h };
};
const windowChrome = (c: Ctx2D, f: ReturnType<typeof frameOf>, title: string, alpha: number) => {
  const g = c.g;
  g.globalAlpha = alpha;
  g.fillStyle = 'rgba(12,14,20,0.96)';
  g.beginPath();
  g.roundRect(f.x, f.y, f.w, f.h, 12);
  g.fill();
  g.strokeStyle = 'rgba(255,255,255,0.12)';
  g.lineWidth = 1;
  g.stroke();
  g.fillStyle = 'rgba(255,255,255,0.04)';
  g.beginPath();
  g.roundRect(f.x, f.y, f.w, 30, [12, 12, 0, 0]);
  g.fill();
  ['#ff5f57', '#febc2e', '#28c840'].forEach((col, i) => {
    g.fillStyle = col;
    g.beginPath();
    g.arc(f.x + 16 + i * 15, f.y + 15, 4.5, 0, TAU);
    g.fill();
  });
  g.font = `12px ${monoFont()}`;
  g.fillStyle = 'rgba(220,226,236,0.7)';
  g.textAlign = 'center';
  g.fillText(title, f.x + f.w / 2, f.y + 19);
  g.textAlign = 'left';
};

/* ----------------------------------------------------------------------------------- Variante 1: Code ------- */

type Kind = 'cmd' | 'code' | 'ok' | 'info' | 'gap' | 'tab';
interface Line {
  k: Kind;
  s: string;
  /** Diese Teile erscheinen auf der Seite, sobald die Zeile fertig getippt ist. */
  show?: Part[];
}
/** Zeile mit Zeitplan; tab = Terminal-Tab, in dem sie steht (k: 'tab' wechselt den Tab, s = '1' | '2'). */
type Row = Line & { at: number; end: number; tab: string };
// Gekürzte Auszüge des echten Codes (src/site/nav/SiteNav.tsx, src/site/pages/HalloPage.tsx, src/site/cards/*,
// src/site/chrome/SiteFooter.tsx) — „…“ markiert ausgelassene Stellen.
const SCRIPT: Line[] = [
  { k: 'cmd', s: '$ cd ld-evo && nvim src/site/nav/SiteNav.tsx' },
  { k: 'code', s: 'export function SiteNav() {' },
  { k: 'code', s: '  const t = useT();' },
  { k: 'code', s: '  return (' },
  { k: 'code', s: '    <nav aria-label={t(\'nav.main\')} className="ldnavvt">' },
  { k: 'code', s: "      <Link href={href('/')}><LoonaLockup /></Link>" },
  { k: 'code', s: '      {items.map((it) => <NavLink key={it.path} {...it} />)}' },
  { k: 'code', s: '    </nav>', show: ['nav'] },
  { k: 'code', s: '}' },
  { k: 'ok', s: '"SiteNav.tsx" 214L written' },
  { k: 'gap', s: '' },
  { k: 'cmd', s: '$ nvim src/site/pages/HalloPage.tsx' },
  { k: 'code', s: 'export function HalloPage() {' },
  { k: 'code', s: '  const { home } = useContent();' },
  { k: 'code', s: '  return (' },
  { k: 'code', s: '    <div id="ld-hero">' },
  { k: 'code', s: '      <EText path="kicker" value={home.kicker} />', show: ['kicker'] },
  { k: 'code', s: '      <h1>' },
  { k: 'code', s: '        <EText path="titleLine1" value={home.titleLine1} />' },
  { k: 'code', s: '        <EText path="titleLine2" value={home.titleLine2} />' },
  { k: 'code', s: '      </h1>', show: ['title'] },
  { k: 'code', s: '      <span aria-live="polite">{role}</span>', show: ['role'] },
  { k: 'code', s: '      <p><EText path="intro" value={home.intro} multiline /></p>', show: ['intro'] },
  { k: 'code', s: "      <Button href='/projekte'>{t('home.ctaProjects')}</Button>" },
  { k: 'code', s: "      <Button onClick={hallo}>{t('home.ctaHello')}</Button>", show: ['cta'] },
  { k: 'code', s: '      <ScrollIndicator hidden={scrolled} />', show: ['scroll'] },
  { k: 'code', s: '    </div>' },
  { k: 'code', s: '    <CareerCounter value={seconds} fx={s.counterFx} />', show: ['stats'] },
  { k: 'code', s: '    <section aria-labelledby="featured-title">' },
  { k: 'code', s: '      {featured.map((p) => <ProjectCard key={p.id} p={p} />)}' },
  { k: 'code', s: '    </section>', show: ['featured'] },
  { k: 'code', s: '    <section aria-labelledby="news-title">' },
  { k: 'code', s: '      {news.map((a) => <NewsCard key={a.id} a={a} />)}' },
  { k: 'code', s: '    </section>', show: ['news'] },
  { k: 'code', s: '}' },
  { k: 'ok', s: '"HalloPage.tsx" 484L written' },
  { k: 'gap', s: '' },
  { k: 'cmd', s: '$ nvim src/site/chrome/SiteFooter.tsx' },
  { k: 'code', s: '    <footer id="fuss">' },
  { k: 'code', s: '      <LoonaTile /> <LanguageSwitch />' },
  { k: 'code', s: '    </footer>', show: ['footer'] },
  { k: 'ok', s: '"SiteFooter.tsx" 96L written' },
  { k: 'gap', s: '' },
  { k: 'cmd', s: '$ npm run dev' },
  { k: 'info', s: '▲ Next.js 16 · Local: http://localhost:3000' },
  { k: 'ok', s: '✓ Ready in 1.2s' },
];
const CPS = { cmd: 16, code: 40 }; // Zeichen je Sekunde (normal) — bewusst Tipp-Tempo
const PAUSE: Record<Kind, number> = { cmd: 0.8, code: 0.12, ok: 0.9, info: 0.5, gap: 0.5, tab: 0.9 };

const timeline = (script: Line[]): Row[] => {
  let at = TYPE_AT; // erst öffnet sich das Terminal
  let tab = '1';
  return script.map((l) => {
    const typed = l.k === 'cmd' || l.k === 'code';
    const dur = typed ? l.s.length / CPS[l.k as 'cmd' | 'code'] : 0;
    if (l.k === 'tab') tab = l.s;
    const row = { ...l, at, end: at + dur, tab };
    at = row.end + PAUSE[l.k];
    return row;
  });
};

/*
 * Variante „Dev-Server zuerst“ (Wunsch vom 18.10.2026): Tab 1 startet den Dev-Server, dann geht es in Tab 2 zum Code.
 * Gebaut wird nur, was man oben auf der Seite sieht — Menü, Hero, Hero-Fußleiste (Zähler) und Scroll-Hinweis; Featured,
 * News und Fußzeile erscheinen erst am Ende mit. Zum Schluss zurück in Tab 1: der Server hat neu kompiliert.
 */
const SCRIPT_DEV: Line[] = [
  { k: 'cmd', s: '$ cd ld-evo && npm run dev' },
  { k: 'info', s: '▲ Next.js 16 (Turbopack)' },
  { k: 'info', s: '  - Local:   http://localhost:3000' },
  { k: 'ok', s: '✓ Ready in 1.1s' },
  { k: 'info', s: '○ Compiling / …' },
  { k: 'ok', s: '✓ Compiled / in 820ms' },
  { k: 'info', s: 'GET / 200 in 912ms' },
  { k: 'tab', s: '2' },
  { k: 'cmd', s: '$ nvim src/site/nav/SiteNav.tsx' },
  { k: 'code', s: 'export function SiteNav() {' },
  { k: 'code', s: '  const t = useT();' },
  { k: 'code', s: '  return (' },
  { k: 'code', s: '    <nav aria-label={t(\'nav.main\')} className="ldnavvt">' },
  { k: 'code', s: "      <Link href={href('/')}><LoonaLockup /></Link>" },
  { k: 'code', s: '      {items.map((it) => <NavLink key={it.path} {...it} />)}' },
  { k: 'code', s: '    </nav>', show: ['nav'] },
  { k: 'code', s: '}' },
  { k: 'ok', s: '"SiteNav.tsx" written' },
  { k: 'gap', s: '' },
  { k: 'cmd', s: '$ nvim src/site/pages/HalloPage.tsx' },
  { k: 'code', s: 'export function HalloPage() {' },
  { k: 'code', s: '  const { home } = useContent();' },
  { k: 'code', s: '  return (' },
  { k: 'code', s: '    <div id="ld-hero">' },
  { k: 'code', s: '      <EText path="kicker" value={home.kicker} />', show: ['kicker'] },
  { k: 'code', s: '      <h1>' },
  { k: 'code', s: '        <EText path="titleLine1" value={home.titleLine1} />' },
  { k: 'code', s: '        <EText path="titleLine2" value={home.titleLine2} />' },
  { k: 'code', s: '      </h1>', show: ['title'] },
  { k: 'code', s: '      <span aria-live="polite">{role}</span>', show: ['role'] },
  { k: 'code', s: '      <p><EText path="intro" value={home.intro} multiline /></p>', show: ['intro'] },
  { k: 'code', s: "      <Button href='/projekte'>{t('home.ctaProjects')}</Button>" },
  { k: 'code', s: "      <Button onClick={hallo}>{t('home.ctaHello')}</Button>", show: ['cta'] },
  { k: 'code', s: '      <ScrollIndicator hidden={scrolled} />', show: ['scroll'] },
  { k: 'code', s: '    </div>' },
  { k: 'code', s: '    <div className="hero-footer">' },
  { k: 'code', s: '      <CareerCounter value={seconds} fx={s.counterFx} />' },
  { k: 'code', s: '      <Stat value="18+" label={t(\'home.years\')} />' },
  { k: 'code', s: '    </div>', show: ['stats'] },
  { k: 'ok', s: '"HalloPage.tsx" written' },
  { k: 'tab', s: '1' },
  { k: 'ok', s: '✓ Compiled / in 96ms' },
  { k: 'info', s: 'GET / 200 in 38ms' },
];

const tokColor = (c: Ctx2D, tok: string) =>
  /^(import|from|export|function|const|return)$/.test(tok)
    ? c.col(0, 0.95)
    : /^['"]/.test(tok)
      ? c.col(2, 0.95)
      : /^[A-Z]/.test(tok)
        ? c.col(3, 0.95)
        : /^[<>/{}()=[\]]/.test(tok)
          ? 'rgba(160,172,190,0.85)'
          : 'rgba(228,233,242,0.92)';

const codeMode =
  (shift: boolean, script: Line[] = SCRIPT): Mode2D =>
  (c) => {
    const rows = timeline(script);
    const tabbed = rows.some((r) => r.k === 'tab');
    let hmrAt = -9; // letzte Einblendung — Tab 1 (Dev-Server) blinkt dann kurz („Hot Reload“)
    const END = rows[rows.length - 1].end + 1.2;
    const clock = clockOf(shift);
    let skipped = false;
    let finished = false;
    const link = pageLink(() => (skipped = true));
    let shownTo = -1;
    let doneAt = -1;
    return {
      still: 1,
      dispose: () => link.dispose(),
      frame(t) {
        const still = document.body.classList.contains('still');
        const tau = skipped || still ? END + 10 : clock(t);
        // Seite: alle Teile der fertig getippten Zeilen zeigen
        for (let i = shownTo + 1; i < rows.length && rows[i].end <= tau; i++) {
          if (rows[i].show) hmrAt = rows[i].end;
          rows[i].show?.forEach((p) => link.show(p));
          shownTo = i;
        }
        if (!finished && tau >= END) {
          finished = true;
          doneAt = t;
          link.finish();
        }

        const g = c.g;
        g.globalCompositeOperation = 'source-over';
        // durchsichtig: Während des Baus liegt die Fläche ÜBER dem Hero (site.css), schwarz ist der Seitenhintergrund;
        // danach liegt sie wieder dahinter und ihr eigener Hintergrund ist schwarz.
        g.clearRect(0, 0, c.W(), c.H());
        const f = frameOf(c);
        // fertig: Terminal tritt zurück (schmal liegt es hinter dem Hero-Text)
        // Schluss: Terminal tritt zurück (schmal liegt es hinter dem Hero-Text) — oder schaltet ab wie ein Röhren-Monitor
        const crtP = c.cfg.crt && finished ? (still ? 9 : (t - doneAt) / 0.9) : -1;
        if (crtP > 1.4) return;
        const back = finished && crtP < 0 ? clamp01((t - doneAt) / 1.2) : 0;
        // frei platziert (Regler): am Ende ganz ausblenden — danach schrumpft die Fläche wieder auf Hero-Höhe
        const fade = typeof c.cfg.ty === 'number' ? 1 : f.wide ? 0.45 : 0.8;
        const alpha = openWindow(c, f, tau, crtP) * (1 - back * fade);
        windowChrome(c, f, 'zsh — ld-evo', alpha);

        const fs = f.wide ? 13 : 11.5;
        g.font = `${fs}px ${monoFont()}`;
        const lh = fs * 1.62;
        const maxCols = Math.floor((f.w - 28) / (fs * 0.6));
        // Tabs: aktiver Tab = letzter Wechsel bis jetzt; gezeigt werden nur seine Zeilen
        let active = '1';
        for (const r of rows) if (r.k === 'tab' && r.at <= tau) active = r.s;
        const top = tabbed ? 30 + 28 : 30;
        if (tabbed) {
          const labels: [string, string][] = [
            ['1', 'npm run dev'],
            ['2', 'nvim'],
          ];
          g.font = `${fs * 0.88}px ${monoFont()}`;
          labels.forEach(([id, txt], i) => {
            const tw = Math.min(170, (f.w - 28) / 2);
            const tx0 = f.x + 10 + i * (tw + 6);
            const on = id === active;
            g.fillStyle = on ? 'rgba(255,255,255,0.09)' : 'rgba(255,255,255,0.025)';
            g.beginPath();
            g.roundRect(tx0, f.y + 34, tw, 21, 6);
            g.fill();
            // „Hot Reload“: Server-Tab leuchtet kurz grün, wenn eine Komponente fertig ist
            const hot = id === '1' && active !== '1' && tau - hmrAt < 0.9;
            g.fillStyle = hot ? 'rgb(40,200,64)' : on ? c.col(1, 0.95) : 'rgba(170,180,196,0.45)';
            g.beginPath();
            g.arc(tx0 + 10, f.y + 44.5, 3, 0, TAU);
            g.fill();
            g.fillStyle = on ? 'rgba(240,244,250,0.95)' : 'rgba(170,180,196,0.7)';
            g.fillText(`${id}  ${txt}`, tx0 + 19, f.y + 48.5);
          });
          g.font = `${fs}px ${monoFont()}`;
        }
        const vis = rows.filter((r) => r.at <= tau && r.k !== 'tab' && (!tabbed || r.tab === active));
        const fit = Math.floor((f.h - top - 16) / lh);
        const from = Math.max(0, vis.length - fit);
        let y = f.y + top + lh;
        vis.slice(from).forEach((r, i, arr) => {
          const typing = (r.k === 'cmd' || r.k === 'code') && tau < r.end;
          const n = typing ? Math.floor(((tau - r.at) / (r.end - r.at)) * r.s.length) : r.s.length;
          const txt = r.s.slice(0, Math.min(n, maxCols));
          let x = f.x + 14;
          if (r.k === 'code') {
            for (const tok of txt.match(/'[^']*'?|"[^"]*"?|\w+|\s+|./g) ?? []) {
              g.fillStyle = tokColor(c, tok);
              g.fillText(tok, x, y);
              x += g.measureText(tok).width;
            }
          } else {
            g.fillStyle = r.k === 'cmd' ? 'rgba(240,244,250,0.96)' : r.k === 'ok' ? c.col(2, 0.95) : 'rgba(170,180,196,0.85)';
            g.fillText(txt, x, y);
            x += g.measureText(txt).width;
          }
          // Cursor am Ende der letzten Zeile
          if (i === arr.length - 1 && Math.floor(t * 2.2) % 2 === 0) {
            g.fillStyle = c.col(1, 0.95);
            g.fillRect(x + 1, y - fs + 2, fs * 0.55, fs + 1);
          }
          y += lh;
        });
        // Hinweis: überspringen
        if (!finished && !still) {
          g.font = `11px ${monoFont()}`;
          g.fillStyle = 'rgba(200,208,222,0.55)';
          g.textAlign = 'right';
          g.fillText((shift ? 'timeshift ▸▸ · ' : '') + L('Klick = überspringen', 'click = skip'), f.x + f.w - 12, f.y + f.h + 18);
          g.textAlign = 'left';
        }
        endFrame(c, f, crtP);
      },
    } satisfies ExtraRenderer;
  };

/* ---------------------------------------------------------------------------------- Variante 2: Agents ------ */

interface Agent {
  comp: string;
  show: Part[];
  start: number;
  dur: number;
  steps: string[];
}
const AGENTS: Agent[] = [
  {
    comp: 'SiteNav',
    show: ['nav'],
    start: 1.2,
    dur: 5.2,
    steps: ['Read design/Site.dc.html', 'Plan Glas-Menü + Links', 'Write SiteNav.tsx', 'Test a11y (axe)'],
  },
  {
    comp: 'Hero',
    show: ['kicker', 'title', 'role'],
    start: 1.8,
    dur: 7.4,
    steps: ['Read content/home.ts', 'Write HalloPage.tsx · Hero', 'Kontrast prüfen ≥ 4.5:1', 'Test Pixelvergleich'],
  },
  {
    comp: 'Intro + CTA',
    show: ['intro', 'cta', 'scroll'],
    start: 2.6,
    dur: 6.6,
    steps: ['Read dict.ts (DE/EN)', 'Write Buttons', 'Test Fokus + Tastatur'],
  },
  {
    comp: 'Stats',
    show: ['stats'],
    start: 3.4,
    dur: 5.8,
    steps: ['Read CareerCounter.tsx', 'Write Sekundenzähler', 'Test Animationen aus'],
  },
  {
    comp: 'Featured',
    show: ['featured'],
    start: 4.0,
    dur: 7.6,
    steps: ['Read LD Flow · projects', 'Write ProjectCard', 'Optimize Bilder (AVIF)', 'Test LCP'],
  },
  {
    comp: 'News + Footer',
    show: ['news', 'footer'],
    start: 4.8,
    dur: 7.2,
    steps: ['Read .Tech · articles', 'Write NewsCard', 'Write SiteFooter', 'Test Links'],
  },
];
const SPIN = ['⠋', '⠙', '⠹', '⠸', '⠼', '⠴', '⠦', '⠧', '⠇', '⠏'];

const agentsMode =
  (shift: boolean): Mode2D =>
  (c) => {
    const END = Math.max(...AGENTS.map((a) => a.start + a.dur)) + 1.4;
    const clock = clockOf(shift);
    let skipped = false;
    let finished = false;
    let doneAt = -1;
    const link = pageLink(() => (skipped = true));
    return {
      still: 1,
      dispose: () => link.dispose(),
      frame(t) {
        const still = document.body.classList.contains('still');
        const tau = skipped || still ? END + 10 : clock(t);
        for (const a of AGENTS) if (tau >= a.start + a.dur) a.show.forEach((p) => link.show(p));
        if (!finished && tau >= END) {
          finished = true;
          doneAt = t;
          link.finish();
        }

        const g = c.g;
        g.globalCompositeOperation = 'source-over';
        // durchsichtig: Während des Baus liegt die Fläche ÜBER dem Hero (site.css), schwarz ist der Seitenhintergrund;
        // danach liegt sie wieder dahinter und ihr eigener Hintergrund ist schwarz.
        g.clearRect(0, 0, c.W(), c.H());
        const f = frameOf(c);
        // Schluss: Terminal tritt zurück (schmal liegt es hinter dem Hero-Text) — oder schaltet ab wie ein Röhren-Monitor
        const crtP = c.cfg.crt && finished ? (still ? 9 : (t - doneAt) / 0.9) : -1;
        if (crtP > 1.4) return;
        const back = finished && crtP < 0 ? clamp01((t - doneAt) / 1.2) : 0;
        // frei platziert (Regler): am Ende ganz ausblenden — danach schrumpft die Fläche wieder auf Hero-Höhe
        const fade = typeof c.cfg.ty === 'number' ? 1 : f.wide ? 0.45 : 0.8;
        const alpha = openWindow(c, f, tau, crtP) * (1 - back * fade);
        windowChrome(c, f, 'claude — orchestrator', alpha);

        const fs = f.wide ? 12.5 : 11;
        const mono = monoFont();
        g.font = `${fs}px ${mono}`;
        const nDone = AGENTS.filter((a) => tau >= a.start + a.dur).length;
        g.fillStyle = 'rgba(240,244,250,0.95)';
        // Auftrag wird erst getippt, dann starten die Agenten
        const ask = L('> baue die Startseite — eine Komponente je Agent', '> build the home page — one component per agent');
        const typed = Math.max(0, Math.floor((tau - TYPE_AT) * 18));
        g.fillText(ask.slice(0, typed), f.x + 14, f.y + 50);
        if (tau < AGENTS[0].start) {
          if (typed >= ask.length || Math.floor(t * 2.2) % 2 === 0) {
            g.fillStyle = c.col(1, 0.95);
            g.fillRect(f.x + 15 + g.measureText(ask.slice(0, typed)).width, f.y + 50 - fs + 2, fs * 0.55, fs + 1);
          }
          endFrame(c, f, crtP);
          return;
        }
        g.fillStyle = nDone === AGENTS.length ? c.col(2, 0.95) : c.col(1, 0.95);
        g.fillText(
          nDone === AGENTS.length
            ? `✓ ${AGENTS.length}/${AGENTS.length} ${L('Agents fertig · Build ok', 'agents done · build ok')}`
            : `${SPIN[Math.floor(t * 12) % SPIN.length]} ${nDone}/${AGENTS.length} ${L('Agents fertig', 'agents done')}`,
          f.x + 14,
          f.y + 50 + fs * 1.7,
        );

        // Raster der Agenten-Karten
        const cols = f.wide || f.w > 520 ? 2 : 1;
        const gx = 10;
        const top = f.y + 50 + fs * 3;
        const rowsN = Math.ceil(AGENTS.length / cols);
        const cw = (f.w - 28 - gx * (cols - 1)) / cols;
        const ch = Math.min(fs * 7.4, (f.y + f.h - 14 - top - gx * (rowsN - 1)) / rowsN);
        if (ch < fs * 3.2) {
          // zu wenig Höhe (schmal): kompakte Liste, je Agent eine Zeile mit Balken
          const rh = Math.min(fs * 2.6, (f.y + f.h - 14 - top) / AGENTS.length);
          AGENTS.forEach((a, i) => {
            const y = top + i * rh + fs;
            const p = clamp01((tau - a.start) / a.dur);
            const started = tau >= a.start;
            const ok = p >= 1;
            g.font = `${fs}px ${mono}`;
            g.fillStyle = ok ? c.col(2, 0.95) : started ? 'rgba(240,244,250,0.95)' : 'rgba(170,180,196,0.6)';
            const mark = ok ? '✓' : started ? SPIN[(Math.floor(t * 12) + i) % SPIN.length] : '○';
            g.fillText(`${mark} agent-${i + 1} · ${a.comp}`, f.x + 14, y);
            g.fillStyle = 'rgba(255,255,255,0.08)';
            g.fillRect(f.x + 14, y + fs * 0.5, f.w - 28, 2);
            g.fillStyle = ok ? 'rgb(40,200,64)' : c.col(i % 5, 0.95);
            g.fillRect(f.x + 14, y + fs * 0.5, (f.w - 28) * p, 2);
          });
          endFrame(c, f, crtP);
          return;
        }
        AGENTS.forEach((a, i) => {
          const x = f.x + 14 + (i % cols) * (cw + gx);
          const y = top + Math.floor(i / cols) * (ch + gx);
          const p = clamp01((tau - a.start) / a.dur);
          const started = tau >= a.start;
          const ok = p >= 1;
          g.fillStyle = ok ? 'rgba(40,200,64,0.08)' : 'rgba(255,255,255,0.035)';
          g.beginPath();
          g.roundRect(x, y, cw, ch, 9);
          g.fill();
          g.strokeStyle = ok ? 'rgba(40,200,64,0.45)' : started ? c.col(i % 5, 0.5) : 'rgba(255,255,255,0.08)';
          g.stroke();
          // Kopf: Agent n · Komponente
          g.font = `600 ${fs}px ${mono}`;
          g.fillStyle = started ? 'rgba(240,244,250,0.95)' : 'rgba(170,180,196,0.6)';
          const head = `${ok ? '✓' : started ? SPIN[(Math.floor(t * 12) + i) % SPIN.length] : '○'} agent-${i + 1} · ${a.comp}`;
          g.fillText(head.slice(0, Math.floor((cw - 16) / (fs * 0.62))), x + 9, y + fs * 1.5);
          // aktueller Schritt
          g.font = `${fs * 0.92}px ${mono}`;
          const k = Math.min(a.steps.length - 1, Math.floor(p * a.steps.length));
          const stepTxt = !started
            ? L('wartet …', 'waiting …')
            : ok
              ? L('fertig → erscheint auf der Seite', 'done → appears on the page')
              : `⏺ ${a.steps[k]}`;
          g.fillStyle = ok ? c.col(2, 0.95) : 'rgba(200,208,222,0.82)';
          g.fillText(stepTxt.slice(0, Math.floor((cw - 16) / (fs * 0.56))), x + 9, y + fs * 3.1);
          if (ch > fs * 5 && started && !ok && k > 0) {
            g.fillStyle = 'rgba(160,170,186,0.55)';
            g.fillText(`  ⎿ ${a.steps[k - 1]} ✓`.slice(0, Math.floor((cw - 16) / (fs * 0.56))), x + 9, y + fs * 4.5);
          }
          // Fortschrittsbalken
          const by = y + ch - 12;
          g.fillStyle = 'rgba(255,255,255,0.08)';
          g.fillRect(x + 9, by, cw - 18, 3);
          g.fillStyle = ok ? 'rgb(40,200,64)' : c.col(i % 5, 0.95);
          g.fillRect(x + 9, by, (cw - 18) * p, 3);
        });
        if (!finished && !still) {
          g.font = `11px ${mono}`;
          g.fillStyle = 'rgba(200,208,222,0.55)';
          g.textAlign = 'right';
          g.fillText((shift ? 'timeshift ▸▸ · ' : '') + L('Klick = überspringen', 'click = skip'), f.x + f.w - 12, f.y + f.h + 18);
          g.textAlign = 'left';
        }
        endFrame(c, f, crtP);
      },
    } satisfies ExtraRenderer;
  };

export const BUILD_2D: Record<string, Mode2D> = {
  buildcode: codeMode(false),
  buildcodets: codeMode(true),
  buildserver: codeMode(false, SCRIPT_DEV),
  buildserverts: codeMode(true, SCRIPT_DEV),
  buildagents: agentsMode(false),
  buildagentsts: agentsMode(true),
};
export const BUILD_KEYS = Object.keys(BUILD_2D);
export const BUILD_PARTS = PARTS;
