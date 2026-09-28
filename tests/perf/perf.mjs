/**
 * Ladezeit der Hauptseiten wie Lighthouse „mobil“: 390×844, CPU 4× gedrosselt, Netz „schnelles 4G“ (9 Mbit/s,
 * 150 ms RTT), kalter Cache. Misst LCP, CLS, TBT (Summe der Long-Task-Anteile > 50 ms bis 5 s nach Laden) sowie
 * übertragene Bytes (gesamt und JavaScript) und vergleicht mit den Budgets unten.
 *   npm run build && npx next start -p 3123
 *   npm run test:perf
 * Hinweis: Chromium in CI/Container ist langsamer als ein echtes Telefon mit derselben Drosselung — Budgets mit Reserve.
 */
import { chromium } from '@playwright/test';

const U = process.env.BASE_URL ?? 'http://localhost:3123';
const PAGES = ['/', '/projekte', '/tech', '/reise', '/ueber-mich', '/projekte/neuewebsite', '/tech/a1'];
/** Budgets je Seite (Web-Vitals „gut“: LCP ≤ 2,5 s, CLS ≤ 0,1; TBT ≤ 200 ms ist Lighthouse „gut“). */
const BUDGET = {
  lcp: Number(process.env.BUDGET_LCP ?? 2500),
  cls: 0.1,
  tbt: Number(process.env.BUDGET_TBT ?? 600),
  jsKB: 450,
  totalKB: 1200,
};
/**
 * Begründete Ausnahmen je Seite. /reise: Die Intro-Animation des Prototyps (LD Timeline.dc.html) zählt die Stationen
 * 2004 → 2026 durch; dabei ändern die Jahres-Einträge Breite/Höhe — gewollte Bewegung, gemessen ~0,34. Ein Umbau auf
 * Transforms wäre ein Design-Eingriff; mit „Animationen aus“ bzw. reduzierter Bewegung entfällt das Intro.
 */
const EXCEPTIONS = { '/reise': { cls: 0.4 } };

const b = await chromium.launch({ executablePath: process.env.CHROMIUM ?? '/opt/pw-browsers/chromium' });
let failed = 0;
const rows = [];
for (const route of PAGES) {
  const ctx = await b.newContext({ viewport: { width: 390, height: 844 }, isMobile: true, hasTouch: true, deviceScaleFactor: 2 });
  await ctx.addInitScript(() => {
    localStorage.setItem('ld-cookie', 'ok');
    const w = window;
    w.__perf = { lcp: 0, cls: 0, long: [] };
    new PerformanceObserver((l) => l.getEntries().forEach((e) => (w.__perf.lcp = e.startTime))).observe({
      type: 'largest-contentful-paint',
      buffered: true,
    });
    new PerformanceObserver((l) => l.getEntries().forEach((e) => !e.hadRecentInput && (w.__perf.cls += e.value))).observe({
      type: 'layout-shift',
      buffered: true,
    });
    new PerformanceObserver((l) => l.getEntries().forEach((e) => w.__perf.long.push([e.startTime, e.duration]))).observe({
      type: 'longtask',
      buffered: true,
    });
  });
  const p = await ctx.newPage();
  const cdp = await ctx.newCDPSession(p);
  await cdp.send('Network.enable');
  await cdp.send('Network.setCacheDisabled', { cacheDisabled: true });
  await cdp.send('Network.emulateNetworkConditions', {
    offline: false,
    latency: 150,
    downloadThroughput: (9 * 1024 * 1024) / 8,
    uploadThroughput: (1.5 * 1024 * 1024) / 8,
  });
  await cdp.send('Emulation.setCPUThrottlingRate', { rate: 4 });
  let js = 0;
  let total = 0;
  cdp.on('Network.loadingFinished', (e) => (total += e.encodedDataLength));
  const types = new Map();
  cdp.on('Network.responseReceived', (e) => types.set(e.requestId, e.type));
  cdp.on('Network.loadingFinished', (e) => types.get(e.requestId) === 'Script' && (js += e.encodedDataLength));
  await p.goto(U + route, { waitUntil: 'load' });
  await p.waitForTimeout(5000);
  // LCP endet mit der ersten Eingabe — hier keine; Werte lesen.
  const m = await p.evaluate(() => {
    const w = window;
    const fcp = performance.getEntriesByName('first-contentful-paint')[0]?.startTime ?? 0;
    const tbt = w.__perf.long.filter(([s]) => s >= fcp).reduce((a, [, d]) => a + Math.max(0, d - 50), 0);
    return { lcp: Math.round(w.__perf.lcp), cls: Math.round(w.__perf.cls * 1000) / 1000, tbt: Math.round(tbt), fcp: Math.round(fcp) };
  });
  const r = { route, ...m, jsKB: Math.round(js / 1024), totalKB: Math.round(total / 1024) };
  const limits = { ...BUDGET, ...(EXCEPTIONS[route] ?? {}) };
  const over = Object.entries(limits)
    .filter(([k, v]) => r[k] > v)
    .map(([k]) => k);
  if (over.length) failed++;
  rows.push({ ...r, budget: over.length ? `✗ ${over.join(', ')}` : '✓' });
  await ctx.close();
}
await b.close();
console.table(rows);
console.log(
  `Budgets: LCP ≤ ${BUDGET.lcp} ms · CLS ≤ ${BUDGET.cls} · TBT ≤ ${BUDGET.tbt} ms · JS ≤ ${BUDGET.jsKB} KB · gesamt ≤ ${BUDGET.totalKB} KB`,
);
process.exit(failed ? 1 : 0);
