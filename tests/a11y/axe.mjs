/**
 * Barrierefreiheit (axe-core, WCAG 2.0/2.1/2.2 A+AA) über alle Site-Seiten in dunkel und hell sowie die
 * öffentlichen LD-Flow-Seiten. Schwere Verstöße (serious/critical) lassen den Lauf scheitern.
 *   npm run build && npx next start -p 3123   (frische oder bestehende DB, egal)
 *   npm run test:a11y          (BASE_URL=… für einen anderen Server)
 */
import AxeBuilder from '@axe-core/playwright';
import { chromium } from '@playwright/test';

const U = process.env.BASE_URL ?? 'http://localhost:3123';
const SITE = [
  '/',
  '/projekte',
  '/labs',
  '/tech',
  '/reise',
  '/ueber-mich',
  '/impressum',
  '/projekte/neuewebsite',
  '/labs/corefall',
  '/tech/a1',
];
const FLOW = ['/flow/login', '/flow/forgot'];

const b = await chromium.launch({ executablePath: process.env.CHROMIUM ?? '/opt/pw-browsers/chromium' });
let serious = 0;
for (const theme of ['dark', 'light']) {
  const ctx = await b.newContext({ viewport: { width: 1440, height: 900 }, reducedMotion: 'reduce' });
  await ctx.addInitScript((t) => {
    localStorage.setItem('ld-cookie', 'ok');
    localStorage.setItem('ld-splash', 'off');
    if (t === 'light') localStorage.setItem('ld-theme', 'light');
  }, theme);
  const p = await ctx.newPage();
  for (const path of theme === 'dark' ? [...SITE, ...FLOW] : SITE) {
    await p.goto(U + path, { waitUntil: 'networkidle' });
    await p.waitForTimeout(1200); // Einblend-Animationen / Hero
    // Hero-Texte im Auto-Modus nutzen mix-blend-mode: difference — sichtbar entsteht die Gegenfarbe (z. B. #8A94A4 → #756B5B,
    // 5,2:1 auf Weiß). axe rechnet Mischmodi nicht mit und meldete sie fälschlich; daher aus der Prüfung ausgenommen.
    const r = await new AxeBuilder({ page: p })
      .withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa', 'wcag22aa'])
      .exclude('[style*="difference"]')
      .analyze();
    const bad = r.violations.filter((v) => v.impact === 'serious' || v.impact === 'critical');
    const minor = r.violations.length - bad.length;
    console.log(`${bad.length ? '✗' : '✓'} ${theme.padEnd(5)} ${path}${bad.length ? '' : minor ? ` (${minor} leichte Hinweise)` : ''}`);
    for (const v of bad) {
      serious++;
      console.log(`    [${v.impact}] ${v.id}: ${v.help}`);
      for (const n of v.nodes.slice(0, 4))
        console.log(`      – ${n.target.join(' ')}  ${(n.failureSummary ?? '').split('\n').slice(1, 2).join(' ').trim()}`);
      if (v.nodes.length > 4) console.log(`      … ${v.nodes.length - 4} weitere`);
    }
  }
  await ctx.close();
}
await b.close();
console.log(serious ? `\n${serious} schwere Verstöße` : '\nKeine schweren Verstöße.');
process.exit(serious ? 1 : 0);
