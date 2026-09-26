import { readFileSync } from 'node:fs';
import path from 'node:path';

export const HANDOFF = path.resolve(import.meta.dirname, '../../docs/design_handoff_loona_logo');

export function readAsset(rel: string): string {
  return readFileSync(path.join(HANDOFF, 'assets', rel), 'utf8').replace(/<metadata>[\s\S]*?<\/metadata>/g, '');
}

export interface Shape {
  tag: string;
  attrs: Record<string, string>;
}

const GEOMETRY = ['d', 'transform', 'fill', 'stroke', 'stroke-width', 'cx', 'cy', 'r', 'fill-rule'];

/** Extrahiert <path>/<circle>/<g> mit ihren geometrie-relevanten Attributen in Dokumentreihenfolge. */
export function shapes(svg: string): Shape[] {
  const out: Shape[] = [];
  for (const m of svg.matchAll(/<(path|circle|g)\b([^>]*?)\/?>/g)) {
    const attrs: Record<string, string> = {};
    for (const a of m[2].matchAll(/([\w-]+)="([^"]*)"/g)) {
      if (GEOMETRY.includes(a[1])) attrs[a[1]] = a[1] === 'fill' || a[1] === 'stroke' ? a[2].toUpperCase() : a[2];
    }
    // fill-rule ist bei Pfaden mit nur einer Kontur wirkungslos → nicht vergleichen.
    if (attrs.d && (attrs.d.match(/M/g) ?? []).length < 2) delete attrs['fill-rule'];
    if (m[1] === 'g' && !attrs.transform) continue;
    out.push({ tag: m[1], attrs });
  }
  return out;
}

/** Teilt family-tiles-*.svg in die fünf Kachel-Gruppen (Reihenfolge ld, flow, nova, buddy, ivy). */
export function familyTileSegments(svg: string): string[] {
  const body = svg.replace(/^<svg[^>]*>/, '').replace(/<\/svg>\s*$/, '');
  return body
    .split(/(?=<g transform="translate\(\d+ 0\)">)/)
    .filter((s) => s.startsWith('<g transform="translate('))
    .map((s) => s.replace(/^<g transform="translate\(\d+ 0\)">/, '').replace(/<\/g>$/, ''));
}
