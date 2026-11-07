import { createElement } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { describe, expect, it } from 'vitest';
import type { Project } from '@content/projects';
import { HOME } from '@content/home';
import { HOME as HOME_EN } from '@content/en/home';
import { QUALIFICATIONS } from '@content/about';
import { BEYOND_PARTS, DEFAULT_SETTINGS, SETTINGS_CODECS, beyondParts, readSettings } from '@/site/settings/schema';
import { THEME_BOOT_SCRIPT } from '@/site/settings/applyBody';
import { labStats } from '@/site/beyond/Beyond';
import { LabCover, coverKind, hueOf, seededRandom } from '@/site/beyond/LabCover';
import { HERO_MODES } from '@/site/hero/modes';
import { readFileSync } from 'node:fs';

/** Design-Richtung „Beyond“ (Entwurf „Path to Beyond“): Einstellungen, Boot-Script, Kennzahlen, generatives Cover. */
describe('Design-Richtung Beyond', () => {
  it('Standard ist „Klassisch“ — kein Beyond-Element aktiv', () => {
    expect(DEFAULT_SETTINGS.design).toBe('klassisch');
    expect(Object.values(beyondParts(DEFAULT_SETTINGS)).some(Boolean)).toBe(false);
  });

  it('„Beyond“ schaltet alles an, „Mix“ folgt der Einzelwahl (fehlend = an)', () => {
    expect(Object.values(beyondParts({ design: 'beyond', designMix: { orb: false } })).every(Boolean)).toBe(true);
    const mix = beyondParts({ design: 'mix', designMix: { orb: false, lab: false } });
    expect(mix.orb).toBe(false);
    expect(mix.lab).toBe(false);
    expect(BEYOND_PARTS.filter((p) => mix[p])).toHaveLength(BEYOND_PARTS.length - 2);
  });

  it('Speicherung: unbekannte Werte → Klassisch, Klassisch wird nicht gespeichert', () => {
    const read = (v: Record<string, string>) => readSettings({ getItem: (k) => v[k] ?? null });
    expect(read({ 'ld-design': 'beyond' }).design).toBe('beyond');
    expect(read({ 'ld-design': '<script>' }).design).toBe('klassisch');
    expect(read({ 'ld-design': 'mix', 'ld-designmix': 'kaputt{' }).designMix).toEqual({});
    expect(SETTINGS_CODECS.design.write('klassisch')).toBeNull();
  });

  it('Boot-Script setzt die CSS-Klassen vor dem ersten Bild (kein Farbblitz)', () => {
    const run = (store: Record<string, string>) => {
      const cls = new Set<string>();
      const body = { classList: { add: (c: string) => cls.add(c) }, setAttribute() {}, removeAttribute() {} };
      new Function('localStorage', 'document', 'location', 'setTimeout', THEME_BOOT_SCRIPT)(
        { getItem: (k: string) => store[k] ?? null },
        { body },
        { pathname: '/projekte', search: '' },
        () => 0,
      );
      return [...cls].filter((c) => c.startsWith('bx-')).sort();
    };
    expect(run({})).toEqual([]);
    expect(run({ 'ld-design': 'beyond' })).toEqual(['bx-farben', 'bx-raster', 'bx-schrift']);
    expect(run({ 'ld-design': 'mix', 'ld-designmix': '{"farben":false}' })).toEqual(['bx-raster', 'bx-schrift']);
    expect(run({ 'ld-design': 'mix', 'ld-designmix': 'kaputt{' })).toEqual(['bx-farben', 'bx-raster', 'bx-schrift']);
  });

  it('Kennzahlen der Labs kommen aus den Inhalten (nicht aus dem Entwurf)', () => {
    const p = (id: string, datum: string, tool: string, link?: string) => ({ id, kind: 'labs', datum, tool, link }) as Project;
    const s = labStats([
      p('a', '04/2026', 'Claude Code · Opus 4.7', 'https://example.org'),
      p('b', '03/2026', 'Claude Code · Claude Design'),
      p('c', '10/2026', ''),
      { id: 'x', kind: 'projekte', datum: '01/2001', tool: 'Flash' } as Project,
    ]);
    expect(s).toEqual({ total: 3, online: 1, since: '03/2026', tools: 3 });
  });

  it('Startinhalte: Beyond-Texte in DE und EN mit gleicher Struktur; keine ungeprüften Kennzahlen', () => {
    expect(HOME.bxFocus).toHaveLength(HOME_EN.bxFocus!.length);
    expect(HOME.bxMarquee).toEqual(HOME_EN.bxMarquee);
    // „Im Web seit 2001“, „9 Zertifikate“, „7 Experimente“ aus dem Entwurf stehen nicht fest im Text
    const all = JSON.stringify([HOME, HOME_EN]);
    expect(all).not.toMatch(/2001|9 Zertifikate|7 KI-Experimente/);
    expect(QUALIFICATIONS.length).toBeGreaterThan(0);
  });

  it('Generatives Cover: deterministisch, Farbton aus der Projektfarbe, Art aus der Kategorie', () => {
    const a = seededRandom('corefall');
    const b = seededRandom('corefall');
    expect([a(), a()]).toEqual([b(), b()]);
    expect(hueOf('#19A7FF')).toBe(203);
    expect(hueOf('#888888')).toBe(210);
    expect(coverKind('Browser-Spiel')).toBe('game');
    expect(coverKind('KI-Experiment')).toBe('tool');
    expect(coverKind('Website')).toBe('web');
    const html = renderToStaticMarkup(createElement(LabCover, { id: 'covert', color: '#FF7816', kind: 'game' }));
    expect(html).toMatch(/^<svg[^>]*aria-hidden="true"/);
    expect(html).toContain('id="bxc-covert-bg"');
    expect(html).not.toContain('NaN');
  });

  it('„LD retro“ ist eine Hero-Animation (ohne Canvas) und in der Auswahl', () => {
    expect(HERO_MODES.retro.renderer).toBe('orb');
    const panel = readFileSync('src/site/overlays/SettingsPanel.tsx', 'utf8');
    expect(panel).toContain("['retro', 'LD retro']");
    expect(panel).toMatch(/const NO_PAL = \[[^\]]*'retro'/);
  });
});
