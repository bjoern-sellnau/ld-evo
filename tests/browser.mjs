/**
 * Start-Optionen für Chromium in den Browser-Tests: CHROMIUM (Pfad) oder das vorinstallierte /opt/pw-browsers/chromium;
 * fehlt beides (z. B. GitHub Actions nach `npx playwright install chromium`), nimmt Playwright seinen eigenen Browser.
 */
import { existsSync } from 'node:fs';

export function launchOptions() {
  const p = process.env.CHROMIUM ?? '/opt/pw-browsers/chromium';
  return existsSync(p) ? { executablePath: p } : {};
}
