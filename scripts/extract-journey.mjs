#!/usr/bin/env node
/**
 * Erzeugt content/journey.ts aus design/design_handoff_loona_site/LD Timeline.dc.html:
 * führt stations() des Prototyps aus und schreibt die Daten unverändert. Aufruf: node scripts/extract-journey.mjs
 */
import { readFileSync, writeFileSync } from 'node:fs';
import path from 'node:path';

const root = path.resolve(import.meta.dirname, '..');
const src = readFileSync(path.join(root, 'design/design_handoff_loona_site/LD Timeline.dc.html'), 'utf8');
const m = /  stations\(\) \{\n([\s\S]*?)\n  \}\n/.exec(src);
if (!m) throw new Error('stations() nicht gefunden');
const stations = new Function(m[1])();
if (!Array.isArray(stations) || stations.length !== 8) throw new Error('Erwartet 8 Stationen');
const out = `/**
 * Stationen der Reise-Seite (LD Timeline) — generiert von scripts/extract-journey.mjs aus
 * design/design_handoff_loona_site/LD Timeline.dc.html (stations()). Nicht von Hand editieren; Pflege später im CMS.
 * Bilder (Karten-Screenshot, Einblicke je Station/Zwischenschritt) sind optional und kommen aus dem CMS.
 */

export interface JourneyStep {
  t: string;
  d: string;
}

export interface JourneyStation {
  year: number;
  title: string;
  role: string;
  partner: string;
  metric: string;
  metricLabel: string;
  caption: string;
  blurb: string;
  story: string;
  stack: string[];
  steps: JourneyStep[];
}

export const JOURNEY: JourneyStation[] = ${JSON.stringify(stations, null, 2)};
`;
writeFileSync(path.join(root, 'content/journey.ts'), out);
console.log('content/journey.ts erzeugt.');
