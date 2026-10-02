/**
 * Barrierefreiheit (axe-core, WCAG 2.0/2.1/2.2 A+AA). Schwere Verstöße (serious/critical) lassen den Lauf scheitern.
 * - Site: alle Hauptseiten auf Desktop (1440×900) und Mobil (390×844, Touch), jeweils dunkel und hell
 * - LD Flow: öffentliche Seiten und — angemeldet — Dashboard, Editor (inkl. Vorschau-iframe), Listen, Medien,
 *   Nachrichten, Statistik, Nutzer, Konto, Guide
 *   npm run build && LDFLOW_DB=/tmp/a11y/flow.db npx next start -p 3123   (frische DB)
 *   LDFLOW_DB=/tmp/a11y/flow.db npm run test:a11y
 * Anmeldung: mit frischer DB legt der Test per Setup-Token einen Test-Admin an; sonst FLOW_EMAIL/FLOW_PASSWORD setzen
 * (Konto ohne 2FA). Ohne beides wird der angemeldete Teil übersprungen.
 */
import { existsSync, readFileSync } from 'node:fs';
import path from 'node:path';
import AxeBuilder from '@axe-core/playwright';
import { chromium } from '@playwright/test';
import { launchOptions } from '../browser.mjs';

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
  // Englisch (UI übersetzt; Inhalte bis zur Freigabe als deutscher Rückfall mit lang="de")
  '/en',
  '/en/projects',
  '/en/about',
  '/en/journey',
  '/en/imprint',
  '/en/labs/corefall',
];
const FLOW_PUBLIC = ['/flow/login', '/flow/forgot'];
const FLOW_APP = [
  '/flow',
  '/flow/c/home/home',
  '/flow/c/projects',
  '/flow/c/projects/corefall',
  '/flow/c/projects/corefall?lang=en',
  '/flow/media',
  '/flow/messages',
  '/flow/stats',
  '/flow/users',
  '/flow/errors',
  '/flow/account',
  '/flow/guide',
];
const DEVICES = {
  desktop: { viewport: { width: 1440, height: 900 } },
  mobil: { viewport: { width: 390, height: 844 }, isMobile: true, hasTouch: true, deviceScaleFactor: 2 },
};

const b = await chromium.launch(launchOptions());
let serious = 0;

async function audit(p, label) {
  await p.waitForTimeout(1200); // Einblend-Animationen / Hero / Vorschau
  // Hero-Texte im Auto-Modus nutzen mix-blend-mode: difference — sichtbar entsteht die Gegenfarbe (z. B. #8A94A4 → #756B5B,
  // 5,2:1 auf Weiß). axe rechnet Mischmodi nicht mit und meldete sie fälschlich; daher aus der Prüfung ausgenommen.
  const r = await new AxeBuilder({ page: p })
    .withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa', 'wcag22aa'])
    .exclude('[style*="difference"]')
    .analyze();
  const bad = r.violations.filter((v) => v.impact === 'serious' || v.impact === 'critical');
  const minor = r.violations.length - bad.length;
  console.log(`${bad.length ? '✗' : '✓'} ${label}${bad.length ? '' : minor ? ` (${minor} leichte Hinweise)` : ''}`);
  for (const v of bad) {
    serious++;
    console.log(`    [${v.impact}] ${v.id}: ${v.help}`);
    for (const n of v.nodes.slice(0, 4))
      console.log(`      – ${n.target.join(' ')}  ${(n.failureSummary ?? '').split('\n').slice(1, 2).join(' ').trim()}`);
    if (v.nodes.length > 4) console.log(`      … ${v.nodes.length - 4} weitere`);
  }
}

// ---- Site: Gerät × Theme ----
for (const [dev, opts] of Object.entries(DEVICES)) {
  for (const theme of ['dark', 'light']) {
    const ctx = await b.newContext({ ...opts, reducedMotion: 'reduce' });
    await ctx.addInitScript((t) => {
      localStorage.setItem('ld-cookie', 'ok');
      localStorage.setItem('ld-splash', 'off');
      if (t === 'light') localStorage.setItem('ld-theme', 'light');
    }, theme);
    const p = await ctx.newPage();
    for (const route of SITE) {
      await p.goto(U + route, { waitUntil: 'networkidle' });
      await audit(p, `${dev.padEnd(7)} ${theme.padEnd(5)} ${route}`);
    }
    await ctx.close();
  }
}

// ---- LD Flow ----
const ctx = await b.newContext(DEVICES.desktop);
const p = await ctx.newPage();
for (const route of FLOW_PUBLIC) {
  await p.goto(U + route, { waitUntil: 'networkidle' });
  await audit(p, `flow    ${route}`);
}
let email = process.env.FLOW_EMAIL;
let password = process.env.FLOW_PASSWORD;
const tokenFile = process.env.LDFLOW_DB ? path.join(path.dirname(path.resolve(process.env.LDFLOW_DB)), 'flow-setup-token.txt') : '';
await p.goto(U + '/flow');
if (!email && new URL(p.url()).pathname === '/flow/setup' && tokenFile && existsSync(tokenFile)) {
  email = 'a11y@example.com';
  password = 'a11y-test-passwort';
  await audit(p, 'flow    /flow/setup');
  await p.fill('#token', readFileSync(tokenFile, 'utf8').trim());
  await p.fill('#name', 'A11y Test');
  await p.fill('#email', email);
  await p.fill('#password', password);
  await p.fill('#password2', password);
  await p.click('button[type=submit]');
  await p.waitForURL(U + '/flow');
} else if (email && password) {
  await p.goto(U + '/flow/login');
  await p.fill('#email', email);
  await p.fill('#password', password);
  await p.click('button[type=submit]');
  await p.waitForURL(U + '/flow');
}
if (email) {
  for (const route of FLOW_APP) {
    await p.goto(U + route, { waitUntil: 'networkidle' });
    await audit(p, `flow    ${route}`);
  }
} else console.log('– LD Flow angemeldet übersprungen (keine frische DB mit Setup-Token, kein FLOW_EMAIL/FLOW_PASSWORD)');
await ctx.close();

await b.close();
console.log(serious ? `\n${serious} schwere Verstöße` : '\nKeine schweren Verstöße.');
process.exit(serious ? 1 : 0);
