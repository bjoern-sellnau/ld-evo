import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';
import { SETTINGS_INFO, settingInfo } from '@/site/overlays/settingsInfo';

const src = readFileSync('src/site/overlays/SettingsPanel.tsx', 'utf8');
/** Alle festen Beschriftungen von Optionen im Panel: Row, Toggle, Schalterliste, Expander, Menü-Werkzeuge. */
const labels = [
  ...src.matchAll(/<(?:Row|Toggle|Expander) label="([^"]+)"/g),
  ...src.matchAll(/\{ label: '([^']+)', key: '/g),
  ...src.matchAll(/\['(?:theme|search|anim|settings|side|contact)', '([^']+)'\]/g),
].map((m) => m[1]);

describe('Info-Tooltips der Einstellungen', () => {
  it('findet die Optionen im Panel', () => {
    expect(labels.length).toBeGreaterThan(60);
  });
  it('jede Option hat eine Erklärung', () => {
    expect(labels.filter((l) => !SETTINGS_INFO[l])).toEqual([]);
  });
  it('jede Erklärung gehört zu einer Option und ist zweisprachig', () => {
    for (const [k, v] of Object.entries(SETTINGS_INFO)) {
      expect(labels, k).toContain(k);
      expect(v.de.length, k).toBeGreaterThan(10);
      expect(v.en.length, k).toBeGreaterThan(10);
    }
  });
  it('liefert die Sprache passend', () => {
    expect(settingInfo('Blur', 'en')).toMatch(/Blur behind/);
    expect(settingInfo('Blur', 'de')).toMatch(/Weichzeichnung/);
    expect(settingInfo('Unbekannt', 'de')).toBeUndefined();
  });
});
