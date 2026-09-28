/**
 * LD Flow — End-to-End-Durchlauf gegen einen laufenden Server mit FRISCHEM Build und FRISCHER Datenbank
 * (next start schreibt revalidierte Seiten nach .next zurück — ein zweiter Lauf braucht erneut `npm run build`):
 *   npm run build && LDFLOW_DB=/tmp/ldflow-e2e/flow.db LDFLOW_SCHEDULER_INTERVAL_MS=2000 npx next start -p 3123
 *   LDFLOW_DB=/tmp/ldflow-e2e/flow.db node tests/e2e/flow.e2e.mjs
 * Prüft Zugriffsschutz, Setup-Token, WYSIWYG-Sync Vorschau ↔ Formular, Veröffentlichen, neue Seite,
 * reservierte Slugs, Navigation, geplantes Veröffentlichen, Medien-Upload inkl. Varianten und Typprüfung,
 * Passwort-Reset, Logout und Brute-Force-Sperre.
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
// Breit genug, dass die Desktop-Vorschau (1280 px) unskaliert bleibt — Playwright rechnet Klicks in skalierten iframes ungenau um.
const ctx = await b.newContext({ viewport: { width: 2000, height: 1000 } });
await ctx.addInitScript(() => {
  localStorage.setItem('ld-cookie', 'ok');
  localStorage.setItem('ld-splash', 'off');
});
if (process.env.TRACE_MSG)
  await ctx.addInitScript(() => {
    window.addEventListener('message', (e) => {
      const d = e.data || {};
      if (!String(d.type || '').startsWith('ldflow')) return;
      const n = d.doc ? (d.doc.blocks || []).map((b) => b.type).join(',') : (d.path ?? '');
      console.log(
        `MSG ${location.pathname.startsWith('/flow-preview') ? 'preview<-' : 'editor<-'} ${d.type} ${n} ${d.path === 'blocks' ? (d.value || []).map((b) => b.type).join(',') : ''}`,
      );
    });
    document.addEventListener(
      'click',
      (e) =>
        console.log(
          `MSG CLICK ${location.pathname.slice(0, 14)} ${e.target?.tagName} ${(e.target?.textContent || '').slice(0, 12)} ${e.target?.closest?.('[data-widget-path]')?.dataset.widgetPath ?? ''}`,
        ),
      true,
    );
  });
const p = await ctx.newPage();
if (process.env.TRACE_MSG) p.on('console', (c) => c.text().startsWith('MSG') && console.log(c.text()));
const errs = [];
p.on('pageerror', (e) => errs.push(e.message));
/** Wartet, bis fn() wahr wird (statt fester Wartezeiten). */
const until = async (fn, ms = 5000) => {
  const end = Date.now() + ms;
  while (Date.now() < end) {
    if (await fn().catch(() => false)) return true;
    await p.waitForTimeout(150);
  }
  return false;
};
/** Menü über einen Button öffnen und warten, bis es sichtbar ist (Layout kann sich gerade verschieben). */
const openMenu = async (frame, button) => {
  for (let i = 0; i < 6; i++) {
    await button.click();
    if (await until(async () => (await frame.getByRole('menu').count()) > 0, 800)) return;
  }
  throw new Error('Menü öffnet nicht');
};
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
await p.selectOption('select[aria-label="Widget hinzufügen"]', 'quote');
await p.getByRole('textbox', { name: 'Zitat', exact: true }).fill('Gebaut mit LD Flow.');
await p.waitForTimeout(600);
await p.getByRole('button', { name: 'Veröffentlichen' }).click();
await p.locator('.f-editor-bar .f-msg.ok').waitFor();
r = await site.goto(U + '/kontakt-info');
check('neue Seite live', r.status() === 200 && (await site.locator('h1').textContent()) === 'Kontakt & Info');
check('Block gerendert', (await site.locator('blockquote').textContent()).includes('Gebaut mit LD Flow.'));

// Navigation: neuer Menüpunkt erscheint sofort in der Vorschau-Leiste, live erst nach dem Veröffentlichen
await p.goto(U + '/flow/c/navigation/navigation');
await fr.locator('nav').first().waitFor({ timeout: 20000 });
await p.getByRole('button', { name: '+ Menüpunkt' }).click();
await p
  .getByLabel(/^Beschriftung\*?$/)
  .last()
  .fill('Info-Seite');
await p
  .getByLabel(/^Ziel\*?$/)
  .last()
  .fill('/kontakt-info');
await until(async () => (await fr.locator('nav a', { hasText: 'Info-Seite' }).count()) > 0);
check('Navigation: Vorschau folgt dem Entwurf', (await fr.locator('nav a', { hasText: 'Info-Seite' }).count()) > 0);
await p.getByRole('button', { name: 'Veröffentlichen' }).click();
await p.locator('.f-editor-bar .f-msg.ok').waitFor();
await site.goto(U + '/impressum');
check('Navigation: Menüpunkt live', (await site.locator('nav a[href$="/kontakt-info"]').count()) > 0);

// Geplantes Veröffentlichen: Entwurf einplanen, Zeitpunkt in der DB vorziehen — der Takt (Server mit
// LDFLOW_SCHEDULER_INTERVAL_MS=2000 starten) bringt ihn ohne weiteres Zutun live.
await p.goto(U + '/flow/c/home/home');
await fr.locator('[data-flow-field="intro"]').waitFor({ timeout: 20000 });
await p.getByLabel('Einleitung').fill('Geplanter Intro-Text.');
await p.getByRole('button', { name: 'Planen …' }).click();
await p.getByRole('button', { name: 'Einplanen' }).click();
await p.locator('.f-editor-bar .f-msg.ok').waitFor();
check('Planen: Zeitplan gesetzt', (await p.locator('.f-editor-bar').textContent()).includes('Geplant:'));
await site.goto(U + '/');
check('Planen: vor dem Zeitpunkt nicht live', !(await site.content()).includes('Geplanter Intro-Text.'));
await p.goto(U + '/flow');
check('Planen: im Dashboard gelistet', (await p.locator('.f-kicker', { hasText: 'Geplant' }).count()) > 0);
{
  const { DatabaseSync } = await import('node:sqlite');
  const sdb = new DatabaseSync(process.env.LDFLOW_DB);
  sdb.prepare("UPDATE docs SET publish_at = ? WHERE collection = 'home'").run(Date.now() - 1000);
  sdb.close();
}
check(
  'Planen: Takt veröffentlicht',
  await until(async () => {
    await site.goto(U + '/');
    return (await site.content()).includes('Geplanter Intro-Text.');
  }, 20000),
);
if (OUT) await site.screenshot({ path: `${OUT}/flow-page.png` });
await p.goto(U + '/flow/c/pages');
await p.fill('#new-id', 'projekte');
await p.click('text=+ Seite anlegen');
await alert().waitFor();
check('reservierter Slug abgelehnt', (await alert().textContent()).includes('reserviert'));

// Widget-Baukasten in der Vorschau
await p.goto(U + '/flow/c/pages/kontakt-info');
const pv = p.frameLocator('iframe[title=Vorschau]');
const w0 = pv.locator('[data-widget-path="blocks.0"]');
await w0.waitFor({ timeout: 20000 });
// Die Hülle wird serverseitig vorgerendert — erst nach der Hydration reagiert sie auf Klicks.
for (let i = 0; i < 20 && !(await pv.getByRole('toolbar').getByRole('button', { name: 'Groß' }).count()); i++) {
  await w0.click({ position: { x: 20, y: 20 } });
  await p.waitForTimeout(300);
}
await pv.getByRole('toolbar').getByRole('button', { name: 'Groß' }).click();
check(
  'Control-Button in der Werkzeugleiste → Formular',
  await until(async () => (await p.locator('[data-flow-path="blocks.0"] [aria-pressed="true"]').allTextContents()).includes('Groß')),
);
await openMenu(pv, pv.getByRole('button', { name: 'Widget einfügen' }).last());
await pv.getByRole('menuitem', { name: /Spalten/ }).click();
await pv.locator('[data-widget-path="blocks.1"]').waitFor();
check(
  'Widget über „+“ eingefügt',
  (await p.locator('[data-flow-path="blocks.1"] .f-group-head').first().textContent()).includes('Spalten'),
);
await openMenu(pv, pv.locator('[data-widget-path="blocks.1"]').getByRole('button', { name: 'Widget einfügen' }).first());
await pv.getByRole('menuitem', { name: /Preiskarte/ }).click();
const price = pv.locator('[data-flow-field="blocks.1.slots.links.0.price"]');
await price.waitFor();
await price.click();
await p.keyboard.type('ab 990 €');
await p.waitForTimeout(400);
check(
  'Widget im Slot + Inline-Edit',
  (await p.locator('[data-flow-path="blocks.1.slots.links.0"] input').nth(1).inputValue()) === 'ab 990 €',
);
await w0.click({ position: { x: 20, y: 20 } });
await pv.getByRole('button', { name: 'Duplizieren' }).click();
await pv.locator('[data-widget-path="blocks.2"]').waitFor();
check('Duplizieren', (await pv.locator('[data-widget-path^="blocks."]:not([data-widget-path*="slots"])').count()) === 3);
// Drag & Drop: Reihenfolge ist jetzt [Zitat, Zitat-Kopie, Spalten] → erstes Zitat ans Ende
await pv.locator('[data-widget-path="blocks.0"]').hover({ position: { x: 20, y: 20 } });
const handle = pv.locator('[data-widget-path="blocks.0"] [data-drag-handle]').first();
await handle.waitFor();
const hb = await handle.boundingBox();
const tbox = await pv.locator('[data-widget-path="blocks.2"]').boundingBox();
// Pointer-Drag in Schritten (funktioniert auch auf Touch-Geräten)
await p.mouse.move(hb.x + hb.width / 2, hb.y + hb.height / 2);
await p.mouse.down();
for (let i = 1; i <= 10; i++) await p.mouse.move(hb.x + 20, hb.y + (tbox.y + tbox.height - 8 - hb.y) * (i / 10), { steps: 3 });
await p.mouse.up();
const head = async (i) => (await p.locator(`[data-flow-path="blocks.${i}"] .f-group-head`).first().textContent()) ?? '';
check('Drag & Drop verschiebt', await until(async () => (await head(1)).includes('Spalten') && (await head(2)).includes('Zitat')));
// Vorlage speichern (global)
let dialogs = 0;
const onDialog = (d) => (dialogs++ === 0 ? d.accept('Preis-Spalten') : d.accept());
p.on('dialog', onDialog);
// Verschachteltes Widget anklicken, dann „↥ Übergeordnetes auswählen“ → die Spalten sind ausgewählt
await pv.locator('[data-widget-path="blocks.1.slots.links.0"]').click({ position: { x: 30, y: 60 } });
await pv.getByRole('button', { name: 'Übergeordnetes auswählen' }).click();
await pv.getByRole('button', { name: 'Als Vorlage speichern' }).click();
await p.locator('.f-editor-bar .f-msg').waitFor();
check(
  'Vorlage gespeichert',
  (await p.locator('.f-editor-bar .f-msg').textContent()).includes('Preis-Spalten'),
  await p.locator('.f-editor-bar .f-msg').textContent(),
);
p.off('dialog', onDialog);
await p.getByRole('button', { name: 'Veröffentlichen' }).click();
await p.waitForTimeout(1500);
await site.goto(U + '/kontakt-info');
check('Widgets live (Preiskarte im Spalten-Slot)', (await site.getByText('ab 990 €').count()) === 1);
check('öffentlich keine Widget-Hülle', (await site.locator('[data-widget-path]').count()) === 0);
await p.goto(U + '/flow/c/pages');
await p.fill('#new-id', 'aus-vorlage');
await p.selectOption('#new-pattern', { label: 'Preis-Spalten' });
await p.click('text=+ Seite anlegen');
await p.waitForURL(/aus-vorlage/);
check('Seite aus Vorlage', (await p.locator('[data-flow-path="blocks.0"] .f-group-head').first().textContent()).includes('Spalten'));
if (OUT) await p.screenshot({ path: `${OUT}/flow-widgets.png` });

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
// Großes Bild (1500 px) → der Browser rechnet WebP-Varianten 640/1280, das Original bleibt PNG
const bigPng = Buffer.from(
  (
    await p.evaluate(() => {
      const c = document.createElement('canvas');
      c.width = 1500;
      c.height = 1000;
      const g = c.getContext('2d');
      g.fillStyle = '#ff9d3c';
      g.fillRect(0, 0, 1500, 1000);
      g.fillStyle = '#1b2230';
      g.fillRect(200, 200, 600, 400);
      return c.toDataURL('image/png');
    })
  ).split(',')[1],
  'base64',
);
await p.setInputFiles('#up-file', { name: 'gross.png', mimeType: 'image/png', buffer: bigPng });
await p.fill('#up-alt', 'Großes Testbild');
await p.click('text=Hochladen');
await until(async () => (await p.locator('.f-thumb img[alt="Großes Testbild"]').count()) > 0, 15000);
const bigSrc = (await p.locator('.f-thumb img[alt="Großes Testbild"]').first().getAttribute('src')).split('?')[0];
const v640 = await ctx.request.get(U + bigSrc + '?w=500');
const v1280 = await ctx.request.get(U + bigSrc + '?w=1000');
const vOrig = await ctx.request.get(U + bigSrc + '?w=2400');
check(
  'Bildvarianten: WebP 640/1280, sonst Original',
  v640.headers()['content-type'] === 'image/webp' &&
    v1280.headers()['content-type'] === 'image/webp' &&
    (await v1280.body()).length !== (await v640.body()).length &&
    vOrig.headers()['content-type'] === 'image/png',
);
await p.setInputFiles('#up-file', 'package.json');
await p.click('text=Hochladen');
await alert().waitFor();
check('Nicht-Bild abgelehnt', (await alert().textContent()).includes('Nur'));

// Passwort vergessen: gleiche Antwort mit/ohne Konto; Admin erzeugt Einmal-Link (kein Mailversand konfiguriert)
await p.goto(U + '/flow/users');
await p.fill('#nu-name', 'Rita Redaktion');
await p.fill('#nu-email', 'rita@example.com');
await p.fill('#nu-pw', 'start-passwort-123');
await p.getByRole('button', { name: 'Anlegen' }).click();
await p.locator('tr', { hasText: 'rita@example.com' }).waitFor();
await p.locator('tr', { hasText: 'rita@example.com' }).getByRole('button', { name: 'Reset-Link' }).click();
await p.getByLabel('Reset-Link').waitFor();
const resetUrl = await p.getByLabel('Reset-Link').inputValue();
check('Reset-Link erzeugt', resetUrl.includes('/flow/reset?token='));
{
  const ctx2 = await b.newContext();
  const q = await ctx2.newPage();
  await q.goto(U + '/flow/login');
  await q.click('text=Passwort vergessen?');
  await q.fill('#email', 'niemand@example.com');
  await q.click('text=Link anfordern');
  const generic = await q.locator('.f-msg.ok').textContent();
  await q.goto(U + '/flow/forgot');
  await q.fill('#email', 'rita@example.com');
  await q.click('text=Link anfordern');
  check('Passwort vergessen: gleiche Antwort mit/ohne Konto', generic === (await q.locator('.f-msg.ok').textContent()));
  await q.goto(resetUrl);
  await q.fill('#rp-pw', 'neues-passwort-456');
  await q.fill('#rp-pw2', 'neues-passwort-456');
  await q.click('text=Passwort setzen');
  await q.waitForURL(U + '/flow');
  check('Reset-Link setzt Passwort und meldet an', true);
  await q.goto(resetUrl);
  check('Reset-Link nur einmal gültig', (await q.locator('text=Link ungültig').count()) > 0);
  await ctx2.close();
}

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
