#!/usr/bin/env node
/**
 * Erzeugt die ORBIT-OS-Shader-Wallpapers aus design/design_handoff_shader_wallpapers/Shader Wallpapers.html:
 *   src/orbit/orbit.css   — <style> (Zeilen 8–478) unverändert; "Inter"/"JetBrains Mono" zuerst über next/font-Variablen
 *   src/orbit/markup.ts   — <body>-Markup inkl. der 15 Shader-<script>-Blöcke (GLSL unverändert, werden per textContent gelesen)
 *   src/orbit/engine.js   — Host-Script (IIFE) unverändert als mountOrbit(); Canvas-Schrift nutzt die geladene Inter,
 *                           Rückgabe { selectShader, current } für Persistenz (README: „Persist current and all tweak values“)
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
  .replaceAll('"Inter"', 'var(--orbit-inter), "Inter"')
  .replaceAll('"JetBrains Mono"', 'var(--orbit-mono), "JetBrains Mono"');
const markup = L(483, 1744);
let engine = L(1748, 2542);
const fontCount = (engine.match(/"Inter", system-ui/g) || []).length;
if (fontCount !== 2) throw new Error('Canvas-Schrift: erwartet 2 Stellen');
engine = engine.replaceAll('"Inter", system-ui', '${INTER}, system-ui');

mkdirSync(path.join(root, 'src/orbit'), { recursive: true });
const gen = 'Generiert von scripts/extract-orbit.mjs aus design/design_handoff_shader_wallpapers/Shader Wallpapers.html — nicht von Hand editieren.';
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
