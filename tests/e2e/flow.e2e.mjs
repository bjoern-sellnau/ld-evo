/**
 * LD Flow — End-to-End-Durchlauf gegen einen laufenden Server mit FRISCHER Datenbank:
 *   npm run build && LDFLOW_DB=/tmp/ldflow-e2e/flow.db npx next start -p 3123
 *   LDFLOW_DB=/tmp/ldflow-e2e/flow.db node tests/e2e/flow.e2e.mjs
 * Prüft Zugriffsschutz, Setup-Token, WYSIWYG-Sync Vorschau ↔ Formular, Veröffentlichen, neue Seite,
 * reservierte Slugs, Medien-Upload inkl. Typprüfung, Logout und Brute-Force-Sperre.
 */
import { chromium } from '@playwright/test';
import { readFileSync } from 'node:fs';
import path from 'node:path';

const U = process.env.BASE_URL ?? 'http://localhost:3123';
const tokenFile = path.join(path.dirname(path.resolve(process.env.LDFLOW_DB ?? 'data/flow.db')), 'flow-setup-token.txt');
const OUT = process.env.SHOTS;
let failed = 0;
const check = (name, ok, detail = '') => {
  console.log(`${ok ? '✓' : '✗'} ${name}${detail ? ` — ${detail}` : ''}`);
  if (!ok) failed++;
};

const b = await chromium.launch({ executablePath: process.env.CHROMIUM ?? '/opt/pw-browsers/chromium' });
const ctx = await b.newContext({ viewport: { width: 1500, height: 950 } });
await ctx.addInitScript(() => {
  localStorage.setItem('ld-cookie', 'ok');
  localStorage.setItem('ld-splash', 'off');
});
const p = await ctx.newPage();
const errs = [];
p.on('pageerror', (e) => errs.push(e.message));
const alert = (pg = p) => pg.locator('.f-msg[role=alert]').first();

await p.goto(U + '/flow');
check('ohne Login → Setup', new URL(p.url()).pathname === '/flow/setup');
await p.goto(U + '/flow-preview/home/home');
check('Vorschau ohne Login umgeleitet', new URL(p.url()).pathname !== '/flow-preview/home/home');
await ctx.addCookies([{ name: 'ldflow_session', value: 'bogus', url: U }]);
let r = await p.goto(U + '/flow-preview/home/home');
check('Vorschau mit falschem Cookie → 404', r.status() === 404);
await ctx.clearCookies();

await p.goto(U + '/flow/setup');
const fillSetup = async (token) => {
  await p.fill('#token', token);
  await p.fill('#name', 'Test Admin');
  await p.fill('#email', 'admin@example.com');
  await p.fill('#password', 'sehr-geheim-123');
  await p.fill('#password2', 'sehr-geheim-123');
  await p.click('button[type=submit]');
};
await fillSetup('falsch');
await alert().waitFor();
check('falsches Setup-Token abgelehnt', (await alert().textContent()).includes('ungültig'));
await fillSetup(readFileSync(tokenFile, 'utf8').trim());
await p.waitForURL(U + '/flow');
check('Setup legt Admin an und meldet an', true);
if (OUT) await p.screenshot({ path: `${OUT}/flow-dashboard.png` });

// WYSIWYG
await p.goto(U + '/flow/c/home/home');
const fr = p.frameLocator('iframe[title=Vorschau]');
const field = fr.locator('[data-flow-field="titleLine1"]');
await field.waitFor({ timeout: 20000 });
await field.click();
await p.keyboard.press('End');
await p.keyboard.type(' Heute.');
await p.waitForTimeout(400);
check('Inline-Edit in der Vorschau → Formular', (await p.getByLabel('Headline Zeile 1').inputValue()) === 'Das Web. Heute.');
await p.getByLabel('Einleitung').fill('Neuer Intro-Text aus dem Formular.');
await p.waitForTimeout(500);
check('Formular → Vorschau', (await fr.locator('[data-flow-field="intro"]').innerText()) === 'Neuer Intro-Text aus dem Formular.');
await p.waitForTimeout(1800);
check('Autosave als Entwurf', (await p.locator('.f-editor-bar [aria-live]').textContent()) === 'Entwurf gespeichert');
if (OUT) await p.screenshot({ path: `${OUT}/flow-editor.png` });
const site = await ctx.newPage();
await site.goto(U + '/');
check('Entwurf ist noch nicht live', !(await site.locator('h1').first().textContent()).includes('Heute'));
await p.getByRole('button', { name: 'Veröffentlichen' }).click();
await p.locator('.f-editor-bar .f-msg.ok').waitFor();
await site.goto(U + '/');
check('Veröffentlicht → Site aktualisiert', (await site.locator('h1').first().textContent()).includes('Das Web. Heute.'));
check('Site ohne Edit-Markierungen', (await site.locator('[data-flow-field]').count()) === 0);

// Neue Seite
await p.goto(U + '/flow/c/pages');
await p.fill('#new-id', 'kontakt-info');
await p.click('text=+ Seite anlegen');
await p.waitForURL(/kontakt-info/);
await p.getByRole('textbox', { name: 'Titel', exact: true }).fill('Kontakt & Info');
await p.getByLabel('Kicker').fill('SEITE AUS LD FLOW');
await p.selectOption('select[aria-label="Block hinzufügen"]', 'quote');
await p.getByRole('textbox', { name: 'Zitat', exact: true }).fill('Gebaut mit LD Flow.');
await p.waitForTimeout(600);
await p.getByRole('button', { name: 'Veröffentlichen' }).click();
await p.locator('.f-editor-bar .f-msg.ok').waitFor();
r = await site.goto(U + '/kontakt-info');
check('neue Seite live', r.status() === 200 && (await site.locator('h1').textContent()) === 'Kontakt & Info');
check('Block gerendert', (await site.locator('blockquote').textContent()).includes('Gebaut mit LD Flow.'));
if (OUT) await site.screenshot({ path: `${OUT}/flow-page.png` });
await p.goto(U + '/flow/c/pages');
await p.fill('#new-id', 'projekte');
await p.click('text=+ Seite anlegen');
await alert().waitFor();
check('reservierter Slug abgelehnt', (await alert().textContent()).includes('reserviert'));

// Medien
await p.goto(U + '/flow/media');
await p.setInputFiles('#up-file', 'public/brand/flow/mark-512.png');
await p.fill('#up-alt', 'Flow-Zeichen');
await p.click('text=Hochladen');
await p.locator('.f-thumb img').first().waitFor();
const src = await p.locator('.f-thumb img').first().getAttribute('src');
r = await site.goto(U + src);
check('Medium ausgeliefert', r.status() === 200 && r.headers()['content-type'] === 'image/png', src);
check('Medium mit Sandbox-CSP', (r.headers()['content-security-policy'] ?? '').includes('sandbox'));
await p.setInputFiles('#up-file', 'package.json');
await p.click('text=Hochladen');
await alert().waitFor();
check('Nicht-Bild abgelehnt', (await alert().textContent()).includes('Nur'));

// Logout + Brute-Force
await p.goto(U + '/flow/account');
await p.click('text=Abmelden');
await p.waitForURL(/\/flow\/login/);
check('Logout', true);
for (let i = 0; i < 6; i++) {
  await p.fill('#email', 'admin@example.com');
  await p.fill('#password', 'falsch' + i);
  await p.click('button[type=submit]');
  await p.waitForTimeout(700); // Server-Antwort abwarten, sonst liest man die vorige Meldung
}
check('Sperre nach Fehlversuchen', (await alert().textContent()).includes('Zu viele'));
check('keine Seitenfehler', errs.length === 0, errs.join(' | '));
await b.close();
process.exit(failed ? 1 : 0);
