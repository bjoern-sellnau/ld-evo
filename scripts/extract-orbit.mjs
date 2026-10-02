#!/usr/bin/env node
/**
 * Erzeugt die ORBIT-OS-Shader-Wallpapers aus design/design_handoff_shader_wallpapers/Shader Wallpapers.html:
 *   src/orbit/orbit.css   — <style> (Zeilen 8–478) unverändert; "Inter"/"JetBrains Mono" zuerst über next/font-Variablen
 *   src/orbit/markup.ts   — <body>-Markup inkl. der 15 Shader-<script>-Blöcke (GLSL unverändert bis auf die Naht-Korrektur
 *                           in Shader 05, siehe unten; werden per textContent gelesen)
 *   src/orbit/engine.js   — Host-Script (IIFE) unverändert als mountOrbit(); Canvas-Schrift nutzt die geladene Inter,
 *                           Rückgabe { selectShader, current } für Persistenz (README: „Persist current and all tweak values“)
 * Barrierefreiheit (einzige Abweichungen, Lighthouse): der Open-Zustand des Pickers liegt als data-open am Container,
 * aria-expanded an der Combobox (ARIA verlangt es dort); jeder Regler bekommt den Zeilennamen als aria-label.
 * Aufruf: node scripts/extract-orbit.mjs
 */
import { mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import path from 'node:path';

const root = path.resolve(import.meta.dirname, '..');
const src = readFileSync(path.join(root, 'design/design_handoff_shader_wallpapers/Shader Wallpapers.html'), 'utf8').split('\n');
const L = (a, b) => src.slice(a - 1, b).join('\n');
const expect = (n, s) => {
  if (src[n - 1].trim() !== s) throw new Error(`Zeile ${n}: erwartet ${s}, gefunden ${src[n - 1]}`);
};
expect(7, '<style>');
expect(480, '</style>');
expect(482, '<body>');
expect(1746, '<script>');
expect(1747, '(() => {');
expect(2543, '})();');
expect(2544, '</script>');

const css = L(8, 479)
  .replaceAll('.picker[aria-expanded="true"]', '.picker[data-open="true"]')
  .replaceAll('"Inter"', 'var(--orbit-inter), "Inter"')
  .replaceAll('"JetBrains Mono"', 'var(--orbit-mono), "JetBrains Mono"');
let markup = L(483, 1744)
  .replace('id="picker" aria-expanded="false"', 'id="picker" data-open="false"')
  .replace('role="combobox" tabindex="0"', 'role="combobox" aria-expanded="false" tabindex="0"');
if (!markup.includes('data-open="false"') || !markup.includes('role="combobox" aria-expanded'))
  throw new Error('Picker-Markup nicht gefunden');
// Regler ohne Label: Namen der Zeile als aria-label übernehmen.
markup = markup.replace(/<input id="(t\w+)"/g, (m, id, off) => {
  const names = [...markup.slice(0, off).matchAll(/<span class="name"[^>]*>([^<]+)<\/span>/g)];
  const name = names.length ? names[names.length - 1][1].trim() : id;
  return `<input id="${id}" aria-label="${name}"`;
});
// Fehlerkorrektur Shader 05 „Event Horizon“ (einzige Abweichung im GLSL): `spiral = angle*1.5 + …` mit
// angle = atan(p.y, p.x) springt bei ±π um 1,5·2π = 3π; fbm ist nicht periodisch → waagrechte Naht (auch im
// Prototyp sichtbar). Kurz vor dem Sprung (letzte 0,6 rad) wird zur um 3π verschobenen Probe übergeblendet:
// bei angle = π ergibt das exakt den Wert bei −π, also stetig; überall sonst bleibt das Bild unverändert.
const seamFrom = '  float disk = fbm(vec2(spiral, rr*5.0));';
if (markup.split(seamFrom).length !== 2) throw new Error('Event Horizon: Zeile mit fbm(vec2(spiral, …)) nicht eindeutig gefunden');
markup = markup.replace(
  seamFrom,
  [
    '  float disk = mix(fbm(vec2(spiral, rr*5.0)), fbm(vec2(spiral - 4.71238898*2.0, rr*5.0)),',
    '                   smoothstep(3.14159265 - 0.6, 3.14159265, angle)); // LD: Naht bei ±π geschlossen',
  ].join('\n'),
);
let engine = L(1748, 2542);
const fontCount = (engine.match(/"Inter", system-ui/g) || []).length;
if (fontCount !== 2) throw new Error('Canvas-Schrift: erwartet 2 Stellen');
engine = engine.replaceAll('"Inter", system-ui', '${INTER}, system-ui');
const openCount = (engine.match(/picker\.(set|get)Attribute\('aria-expanded'/g) || []).length;
if (openCount !== 4) throw new Error(`Picker-Zustand: erwartet 4 Stellen, gefunden ${openCount}`);
engine = engine
  .replaceAll("picker.setAttribute('aria-expanded', ", 'setPickerOpen(')
  .replaceAll("picker.getAttribute('aria-expanded')", 'picker.dataset.open');

mkdirSync(path.join(root, 'src/orbit'), { recursive: true });
const gen =
  'Generiert von scripts/extract-orbit.mjs aus design/design_handoff_shader_wallpapers/Shader Wallpapers.html — nicht von Hand editieren.';
writeFileSync(path.join(root, 'src/orbit/orbit.css'), `/* ${gen} */\n${css}\n`);
writeFileSync(path.join(root, 'src/orbit/markup.ts'), `// ${gen}\nexport const ORBIT_MARKUP = ${JSON.stringify(markup)};\n`);
writeFileSync(
  path.join(root, 'src/orbit/engine.js'),
  `// @ts-nocheck
// ${gen}
/**
 * Startet das Wallpaper (Host-Script des Prototyps). Erwartet ORBIT_MARKUP im DOM.
 * @param {{ interFamily?: string }} [opts]
 * @returns {{ selectShader: (i: number) => void, readonly current: number } | undefined}
 */
export function mountOrbit(opts = {}) {
  const INTER = opts.interFamily || '"Inter"';
  // a11y: Zustand am Container (CSS) und aria-expanded an der Combobox.
  const setPickerOpen = (v) => {
    picker.dataset.open = v;
    pickerControl.setAttribute('aria-expanded', v);
  };
${engine}
  return {
    selectShader,
    get current() {
      return current;
    },
  };
}
`,
);
console.log('src/orbit/{orbit.css,markup.ts,engine.js} erzeugt.');
