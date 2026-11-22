/* GLX — kleiner WebGL-Engine in der Machart der 3D-Benchmarks von 1997 bis 2005.
   Rohes WebGL 1, kein Framework, keine Netz-Abhängigkeit — und unabhängig vom Trailer: Größe, Look, Farben und Bilder kommen als
   Parameter. Die Szenen („Tests“) stehen in glx-tests.js. Alles ist reine Funktion der Zeit (kein Zustand von Bild zu Bild).

   Looks (Jahrgänge) und ihre Technik
     '97'  Licht je Ecke (Gouraud), Nebel, bilineare Texturen bis 256 px, additive Leuchtpunkte, Lens Flares, 16-bit-Farbe mit Dithering
     '99'  wie 97, dazu ist die Auflösung frei wählbar (gedacht: um 800×450, weich hochskaliert); 16 bit mit Dithering
     '2k'  mehr Polygone, Texturen bis 512 px, 32 bit, Environment-Mapping je Ecke
     '01'  Licht je Bildpunkt mit Normal-Maps (Tangenten je Ecke), Glanzlichter, spiegelnde Flächen mit Wellen (Spiegelbild in eigener
           Textur), auf den Boden projizierte Schatten (Stencil), mehr Polygone
     '03'  dazu Schatten aus einer Shadow Map (Tiefe in RGBA verpackt — braucht keine Erweiterung), Glanz-Maps, Glühen (Bloom) als Nachbearbeitung
     '05'  weiche Schatten (16 Proben), Bild mit großem Helligkeitsumfang (Halbfloat-Ziel, wenn vorhanden) mit Bloom und Tonwertkurve,
           Brechung hinter Glas (Kopie des Bildes), dichtere Geometrie, Texturen bis 1024 px
   Nichts davon braucht Technik, die nur offline geht; '01' und '03' sind für Echtzeit auf Grafik-Hardware ausgelegt.

   Schnittstelle
     <script src="gl/glx.js"></script><script src="gl/glx-tests.js"></script>
     GLX.init({ width, height, look: '97' | '99' | '2k' | '01' | '03' | '05', canvas?, images?, colors? })   (auch erneut, auf neuer Fläche)
     GLX.canvas            die Zeichenfläche (width × height; der Aufrufer skaliert hoch)
     GLX.tests             [{ id, name: { de, en }, dur, draw(lt, D, opts) }] — die Tests des gewählten Looks; auch GLX.test[id]
     GLX.begin()           Bild beginnen (Zähler auf null)
     test.draw(lt, D, o)   eine Szene zeichnen
     GLX.end({ hud?, flash?, fade?, bloom?, expo? })   Bild abschließen: Glühen und Tonwertkurve (je nach Look), flash [r, g, b, a] hellt nur die
                           3D-Szene auf, dann die optionale 2D-Fläche (Canvas in Puffergröße) darüber — sie bekommt kein Glühen —, fade
                           [r, g, b, a] blendet alles, zum Schluss das Dithering (Looks 97 und 99). bloom / expo = Faktoren (Standard 1).
     GLX.stats.tris        Dreiecke des letzten Bildes (wirklich gezeichnete, Leuchtpunkte zählen als zwei; Schatten- und Spiegelbild-Durchgänge zählen mit)
     GLX.texCanvas(canvas) Textur aus einer Zeichenfläche (z. B. Schrift), für opts wie plates / gates
     GLX.cfg               Fähigkeiten des Looks: { lvl 0…5, pp (Licht je Bildpunkt), shadow: 'planar' | 'map', bloom, tone, hdr … }
   Für eigene Tests (siehe glx-tests.js): GLX.camera, GLX.light, GLX.fog, GLX.clear, GLX.draw(mesh, model, material), GLX.wire,
     GLX.spr (Leuchtpunkte), GLX.mirror (Spiegelung am Boden), GLX.shadow(dir, mitte, radius, fn) (Shadow Map), GLX.planar (projizierter
     Schatten), GLX.reflect(fn) + GLX.water(…) (Spiegelbild + Wellenfläche), GLX.grab() + GLX.glass(…) (Brechung).
   Beispiel (Echtzeit): gl-test.html */
window.GLX = (() => {
  'use strict';
  const clamp = (x, a = 0, b = 1) => Math.max(a, Math.min(b, x));
  const lerp = (a, b, k) => a + (b - a) * k;
  const smooth = (x) => { x = clamp(x); return x * x * (3 - 2 * x); };
  const hash = (n) => { const s = Math.sin(n * 127.1 + 311.7) * 43758.5453; return s - Math.floor(s); };
  const hex = (h) => { const n = parseInt(h.slice(1), 16); return [((n >> 16) & 255) / 255, ((n >> 8) & 255) / 255, (n & 255) / 255]; };
  const isPot = (n) => (n & (n - 1)) === 0;

  /* ---------- Matrizen (spaltenweise wie in WebGL) ---------- */
  const M = {
    id: () => new Float32Array([1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1]),
    mul(a, b) { const o = new Float32Array(16); for (let c = 0; c < 4; c++) for (let r = 0; r < 4; r++) o[c * 4 + r] = a[r] * b[c * 4] + a[4 + r] * b[c * 4 + 1] + a[8 + r] * b[c * 4 + 2] + a[12 + r] * b[c * 4 + 3]; return o; },
    persp(fovy, asp, n, f) { const t = 1 / Math.tan(fovy / 2), o = new Float32Array(16); o[0] = t / asp; o[5] = t; o[10] = (f + n) / (n - f); o[11] = -1; o[14] = (2 * f * n) / (n - f); return o; },
    ortho(r, n, f) { const o = new Float32Array(16); o[0] = 1 / r; o[5] = 1 / r; o[10] = -2 / (f - n); o[14] = -(f + n) / (f - n); o[15] = 1; return o; },
    look(e, c, up) {
      let zx = e[0] - c[0], zy = e[1] - c[1], zz = e[2] - c[2], l = Math.hypot(zx, zy, zz) || 1; zx /= l; zy /= l; zz /= l;
      let xx = up[1] * zz - up[2] * zy, xy = up[2] * zx - up[0] * zz, xz = up[0] * zy - up[1] * zx; l = Math.hypot(xx, xy, xz) || 1; xx /= l; xy /= l; xz /= l;
      const yx = zy * xz - zz * xy, yy = zz * xx - zx * xz, yz = zx * xy - zy * xx;
      return new Float32Array([xx, yx, zx, 0, xy, yy, zy, 0, xz, yz, zz, 0, -(xx * e[0] + xy * e[1] + xz * e[2]), -(yx * e[0] + yy * e[1] + yz * e[2]), -(zx * e[0] + zy * e[1] + zz * e[2]), 1]);
    },
    /* Verschieben · Drehen (erst Z, dann X, dann Y) · Skalieren */
    trs(t = [0, 0, 0], r = [0, 0, 0], s = 1) {
      const sx = typeof s === 'number' ? s : s[0], sy = typeof s === 'number' ? s : s[1], sz = typeof s === 'number' ? s : s[2];
      const cx = Math.cos(r[0]), sxr = Math.sin(r[0]), cy = Math.cos(r[1]), syr = Math.sin(r[1]), cz = Math.cos(r[2]), szr = Math.sin(r[2]);
      /* R = Ry · Rx · Rz */
      const r00 = cy * cz + syr * sxr * szr, r01 = -cy * szr + syr * sxr * cz, r02 = syr * cx;
      const r10 = cx * szr, r11 = cx * cz, r12 = -sxr;
      const r20 = -syr * cz + cy * sxr * szr, r21 = syr * szr + cy * sxr * cz, r22 = cy * cx;
      return new Float32Array([r00 * sx, r10 * sx, r20 * sx, 0, r01 * sy, r11 * sy, r21 * sy, 0, r02 * sz, r12 * sz, r22 * sz, 0, t[0], t[1], t[2], 1]);
    },
  };

  /* Fähigkeiten je Look. lvl = Stufe der Geometrie/Technik; hi = die Tests nehmen ihre feineren Netze (ab 2000). */
  const LOOKS = {
    97: { lvl: 0, hi: false, tex: 256, dither: true },
    99: { lvl: 1, hi: false, tex: 256, dither: true },
    '2k': { lvl: 2, hi: true, tex: 512 },
    '01': { lvl: 3, hi: true, tex: 512, pp: true, shadow: 'planar', ds: true },
    '03': { lvl: 4, hi: true, tex: 512, pp: true, shadow: 'map', pcf: 4, smap: 1024, bloom: 0.85, ds: true },
    '05': { lvl: 5, hi: true, tex: 1024, pp: true, shadow: 'map', pcf: 16, smap: 2048, bloom: 1, tone: true, hdr: true, refr: true, ds: true },
  };
  const X = {
    canvas: null, gl: null, look: '2k', hi: true, lvl: 2, cfg: LOOKS['2k'], W: 0, H: 0, stats: { tris: 0, draws: 0 }, tests: [], test: {}, C: {}, images: {},
    util: { clamp, lerp, smooth, hash, hex, M }, _setup: [], _tests: [],
    cam: { eye: [0, 0, 0], view: M.id(), proj: M.id(), vp: M.id(), right: [1, 0, 0], up: [0, 1, 0], fwd: [0, 0, -1], fov: 1 },
  };
  let gl, P = {}, fbo, sceneTex, hudTex, white, flatN, quadBuf, mirror = false, hfType = 0, clearC = [0, 0, 0];
  let sh = null, shPass = false, shReady = false, shM = M.id(), refl = null, grabT = null, bloomA = null, bloomB = null;
  const L = { amb: [1, 1, 1], dir: [0, 1, 0], dirC: [0, 0, 0], pts: [] }, F = { c: [0, 0, 0], a: 0, b: 0 };

  /* ---------- Shader ---------- */
  const NL = 6;
  /* Licht je Ecke (Looks 97, 99, 2000) */
  const VS_MESH = `
attribute vec3 aPos; attribute vec3 aNor; attribute vec2 aUV; attribute vec3 aCol;
uniform mat4 uVP, uModel, uView;
uniform vec3 uAmb, uDirL, uDirC, uEye, uTint;
uniform vec3 uLP[${NL}]; uniform vec3 uLC[${NL}]; uniform float uLR[${NL}];
uniform float uUnlit, uSpec, uFogA, uFogB; uniform vec2 uUVS, uUVO;
varying vec3 vCol; varying vec3 vSpec; varying vec2 vUV; varying vec2 vEnv; varying float vFog;
void main() {
  vec4 wp = uModel * vec4(aPos, 1.0);
  vec3 n = normalize((uModel * vec4(aNor, 0.0)).xyz);
  /* Licht je Ecke: Umgebung + ein Richtungslicht + Punktlichter mit quadratischem Abfall bis zur Reichweite */
  vec3 c = uAmb + uDirC * max(dot(n, uDirL), 0.0);
  for (int i = 0; i < ${NL}; i++) { vec3 d = uLP[i] - wp.xyz; float l = length(d); float k = max(0.0, 1.0 - l / uLR[i]); c += uLC[i] * max(dot(n, d / max(l, 0.001)), 0.0) * k * k; }
  vCol = mix(c, vec3(1.0), uUnlit) * aCol * uTint;
  vec3 v = normalize(uEye - wp.xyz);
  vSpec = uDirC * pow(max(dot(n, normalize(v + uDirL)), 0.0), 28.0) * uSpec;
  /* Kugel-Abbildung der Umgebung (Sphere Map), je Ecke gerechnet */
  vec3 r = (uView * vec4(reflect(-v, n), 0.0)).xyz;
  float m = 2.0 * sqrt(r.x * r.x + r.y * r.y + (r.z + 1.0) * (r.z + 1.0)) + 0.0001;
  vEnv = r.xy / m + 0.5;
  vUV = aUV * uUVS + uUVO;
  vec4 vp = uView * wp;
  vFog = uFogB > 0.0 ? clamp((uFogB - length(vp.xyz)) / (uFogB - uFogA), 0.0, 1.0) : 1.0;
  gl_Position = uVP * wp;
}`;
  const FS_MESH = `
precision mediump float;
uniform sampler2D uTex, uEnvT; uniform float uUseTex, uEnvK, uEnvAdd, uAlpha; uniform vec3 uFogC, uEnvTint;
varying vec3 vCol; varying vec3 vSpec; varying vec2 vUV; varying vec2 vEnv; varying float vFog;
void main() {
  vec4 t = mix(vec4(1.0), texture2D(uTex, vUV), uUseTex);
  vec3 c = t.rgb * vCol;
  vec3 e = texture2D(uEnvT, vEnv).rgb * uEnvTint;
  c = mix(c, e, uEnvK) + e * uEnvAdd + vSpec;
  gl_FragColor = vec4(mix(uFogC, c, vFog), uAlpha);
}`;
  /* Licht je Bildpunkt (ab Look 2001): Normal-Map im Tangentenraum, Glanzlicht, Umgebung mit Fresnel, Shadow Map (ab 2003) */
  const HP = '#ifdef GL_FRAGMENT_PRECISION_HIGH\nprecision highp float;\n#else\nprecision mediump float;\n#endif\n';
  const VS_PIX = `
attribute vec3 aPos; attribute vec3 aNor; attribute vec2 aUV; attribute vec3 aCol; attribute vec3 aTan;
uniform mat4 uVP, uModel, uView, uShM; uniform float uFogA, uFogB; uniform vec2 uUVS, uUVO;
varying vec3 vW; varying vec3 vN; varying vec3 vT; varying vec3 vCol; varying vec2 vUV; varying float vFog; varying float vTw; varying vec4 vSh;
void main() {
  vec4 wp = uModel * vec4(aPos, 1.0);
  vW = wp.xyz; vN = (uModel * vec4(aNor, 0.0)).xyz; vT = (uModel * vec4(aTan, 0.0)).xyz; vTw = dot(aTan, aTan) > 0.6 ? 1.0 : -1.0;
  vCol = aCol; vUV = aUV * uUVS + uUVO; vSh = uShM * wp;
  vec4 vp = uView * wp;
  vFog = uFogB > 0.0 ? clamp((uFogB - length(vp.xyz)) / (uFogB - uFogA), 0.0, 1.0) : 1.0;
  gl_Position = uVP * wp;
}`;
  const SH_FN = `
float unpk(vec4 c) { return dot(c, vec4(1.0, 1.0 / 255.0, 1.0 / 65025.0, 1.0 / 16581375.0)); }
float shTap(vec2 uv, float z) { return step(z, unpk(texture2D(uShT, uv))); }
float shadow(vec4 q) {
  vec3 p = q.xyz / q.w;
  if (p.x < 0.0 || p.x > 1.0 || p.y < 0.0 || p.y > 1.0 || p.z > 1.0) return 1.0;
  float z = p.z - uShBias;
#if PCF == 16
  /* weiche Kante: 4 × 4 Proben über mehrere Texel */
  float s = 0.0;
  for (int i = 0; i < 4; i++) for (int j = 0; j < 4; j++) s += shTap(p.xy + (vec2(float(i), float(j)) - 1.5) * uShTexel * 1.7, z);
  return s / 16.0;
#else
  /* harte Kante, sauber gezogen: 2 × 2 Proben, bilinear gewichtet */
  vec2 g = p.xy / uShTexel - 0.5, f = fract(g), b = (floor(g) + 0.5) * uShTexel;
  float a = shTap(b, z), c = shTap(b + vec2(uShTexel, 0.0), z), d = shTap(b + vec2(0.0, uShTexel), z), e = shTap(b + vec2(uShTexel), z);
  return mix(mix(a, c, f.x), mix(d, e, f.x), f.y);
#endif
}`;
  const FS_PIX = (shadow, pcf) => `${HP}#define PCF ${pcf}
uniform sampler2D uTex, uNrm, uGloss, uEnvT, uShT;
uniform mat4 uView;
uniform vec3 uAmb, uDirL, uDirC, uEye, uTint, uFogC, uEnvTint;
uniform vec3 uLP[${NL}]; uniform vec3 uLC[${NL}]; uniform float uLR[${NL}];
uniform float uUseTex, uBump, uSpec, uShine, uUseGloss, uEnvK, uEnvAdd, uFres, uAlpha, uShK, uShTexel, uShBias, uEmis;
varying vec3 vW; varying vec3 vN; varying vec3 vT; varying vec3 vCol; varying vec2 vUV; varying float vFog; varying float vTw; varying vec4 vSh;
${shadow ? SH_FN : ''}
void main() {
  vec4 t = mix(vec4(1.0), texture2D(uTex, vUV), uUseTex);
  vec3 N = normalize(vN), T = normalize(vT - N * dot(N, vT) + vec3(0.00001, 0.0, 0.0)), B = cross(N, T) * vTw;
  vec3 nm = texture2D(uNrm, vUV).xyz * 2.0 - 1.0;
  vec3 n = normalize(T * nm.x * uBump + B * nm.y * uBump + N * nm.z);
  vec3 v = normalize(uEye - vW);
  float gls = mix(1.0, texture2D(uGloss, vUV).r, uUseGloss), sh = 1.0;
  float ndl = max(dot(n, uDirL), 0.0);
  ${shadow ? 'if (uShK > 0.0 && ndl > 0.0) sh = mix(1.0, shadow(vSh), uShK);' : ''}
  vec3 dif = uAmb + uDirC * ndl * sh;
  vec3 spc = uDirC * pow(max(dot(n, normalize(v + uDirL)), 0.0), uShine) * sh * step(0.0001, ndl);
  for (int i = 0; i < ${NL}; i++) {
    vec3 d = uLP[i] - vW; float l = length(d); float k = max(0.0, 1.0 - l / uLR[i]);
    if (k > 0.0) { k *= k; vec3 ld = d / max(l, 0.001); dif += uLC[i] * max(dot(n, ld), 0.0) * k; spc += uLC[i] * pow(max(dot(n, normalize(v + ld)), 0.0), uShine) * k; }
  }
  vec3 c = t.rgb * vCol * uTint * dif + spc * uSpec * gls + t.rgb * uTint * uEmis;
  vec3 r = (uView * vec4(reflect(-v, n), 0.0)).xyz;
  float m = 2.0 * sqrt(r.x * r.x + r.y * r.y + (r.z + 1.0) * (r.z + 1.0)) + 0.0001;
  vec3 e = texture2D(uEnvT, r.xy / m + 0.5).rgb * uEnvTint;
  float fr = uFres + (1.0 - uFres) * pow(1.0 - max(dot(n, v), 0.0), 5.0);
  c = mix(c, e, uEnvK * fr) + e * uEnvAdd * fr;
  gl_FragColor = vec4(mix(uFogC, c, vFog), uAlpha);
}`;
  /* Tiefe aus Sicht des Lichts, in RGBA verpackt (Shadow Map ohne Erweiterung) */
  const VS_DEPTH = `attribute vec3 aPos; uniform mat4 uVP, uModel; varying float vZ; void main() { gl_Position = uVP * uModel * vec4(aPos, 1.0); vZ = gl_Position.z / gl_Position.w * 0.5 + 0.5; }`;
  const FS_DEPTH = `${HP}varying float vZ; void main() { vec4 e = fract(clamp(vZ, 0.0, 0.9999) * vec4(1.0, 255.0, 65025.0, 16581375.0)); e -= e.yzww * vec4(1.0 / 255.0, 1.0 / 255.0, 1.0 / 255.0, 0.0); gl_FragColor = e; }`;
  /* Wellenfläche: Spiegelbild aus eigener Textur, verzerrt durch zwei laufende Normal-Maps und Ringe um eine Mitte; Fresnel, Glanzlicht */
  const VS_WATER = `
attribute vec3 aPos; uniform mat4 uVP, uModel, uView; uniform float uFogA, uFogB;
varying vec3 vW; varying vec4 vClip; varying float vFog;
void main() { vec4 wp = uModel * vec4(aPos, 1.0); vW = wp.xyz; vClip = uVP * wp; vec4 vp = uView * wp; vFog = uFogB > 0.0 ? clamp((uFogB - length(vp.xyz)) / (uFogB - uFogA), 0.0, 1.0) : 1.0; gl_Position = vClip; }`;
  const FS_WATER = `${HP}
uniform sampler2D uRefl, uNrm; uniform vec3 uEye, uDirL, uDirC, uDeep, uFogC, uTint; uniform vec4 uRip; uniform vec2 uCtr; uniform float uTime, uScale, uBump, uDist, uFres, uSpec;
varying vec3 vW; varying vec4 vClip; varying float vFog;
void main() {
  vec2 suv = vClip.xy / vClip.w * 0.5 + 0.5;
  vec3 a = texture2D(uNrm, vW.xz * uScale + uTime * vec2(0.031, 0.019)).xyz * 2.0 - 1.0, b = texture2D(uNrm, vW.xz * uScale * 1.7 - uTime * vec2(0.021, 0.034) + 0.37).xyz * 2.0 - 1.0;
  vec2 dv = vW.xz - uCtr; float d = length(dv);
  vec2 g = dv / max(d, 0.001) * cos(d * uRip.x - uTime * uRip.y) * uRip.z / (1.0 + d * uRip.w);
  vec3 n = normalize(vec3((a.x + b.x) * uBump + g.x, 1.0, (a.y + b.y) * uBump + g.y));
  vec3 v = normalize(uEye - vW);
  float fr = uFres + (1.0 - uFres) * pow(1.0 - max(dot(n, v), 0.0), 5.0);
  vec3 c = mix(uDeep, texture2D(uRefl, suv + n.xz * uDist).rgb * uTint, fr) + uDirC * pow(max(dot(n, normalize(v + uDirL)), 0.0), 220.0) * uSpec;
  gl_FragColor = vec4(mix(uFogC, c, vFog), 1.0);
}`;
  /* Glas mit Brechung: der Hintergrund kommt aus einer Kopie des bisherigen Bildes, verschoben nach der Normale; dazu Spiegelung mit Fresnel */
  const VS_GLASS = `
attribute vec3 aPos; attribute vec3 aNor; uniform mat4 uVP, uModel;
varying vec3 vW; varying vec3 vN;
void main() { vec4 wp = uModel * vec4(aPos, 1.0); vW = wp.xyz; vN = (uModel * vec4(aNor, 0.0)).xyz; gl_Position = uVP * wp; }`;
  const FS_GLASS = `${HP}
uniform sampler2D uGrab, uEnvT; uniform mat4 uView; uniform vec3 uEye, uTint, uDirL, uDirC; uniform vec2 uRes; uniform float uRefr, uFres, uSpec, uEnvK;
varying vec3 vW; varying vec3 vN;
void main() {
  vec3 n = normalize(vN), v = normalize(uEye - vW); if (dot(n, v) < 0.0) n = -n;
  vec3 nv = (uView * vec4(n, 0.0)).xyz;
  vec3 bg = texture2D(uGrab, gl_FragCoord.xy / uRes - nv.xy * uRefr * (1.0 - nv.z * 0.6)).rgb * uTint;
  vec3 r = (uView * vec4(reflect(-v, n), 0.0)).xyz; float m = 2.0 * sqrt(r.x * r.x + r.y * r.y + (r.z + 1.0) * (r.z + 1.0)) + 0.0001;
  vec3 e = texture2D(uEnvT, r.xy / m + 0.5).rgb * uEnvK;
  float fr = uFres + (1.0 - uFres) * pow(1.0 - max(dot(n, v), 0.0), 4.0);
  gl_FragColor = vec4(mix(bg, e, fr) + uDirC * pow(max(dot(n, normalize(v + uDirL)), 0.0), 90.0) * uSpec, 1.0);
}`;
  const VS_SPR = `
attribute vec3 aPos; attribute vec2 aUV; attribute vec4 aCol;
uniform mat4 uVP, uView; uniform float uFogA, uFogB, uMirY;
varying vec2 vUV; varying vec4 vCol;
void main() {
  vUV = aUV;
  vec3 p = vec3(aPos.x, aPos.y * uMirY, aPos.z);
  float f = 1.0;
  if (uFogB > 0.0) { vec4 vp = uView * vec4(p, 1.0); f = clamp((uFogB - length(vp.xyz)) / (uFogB - uFogA), 0.0, 1.0); }
  vCol = aCol * f;
  gl_Position = uVP * vec4(p, 1.0);
}`;
  /* Texturen der Leuchtpunkte sind vormultipliziert; Farbe × Deckkraft kommt je Ecke dazu */
  const FS_SPR = `
precision mediump float;
uniform sampler2D uTex; varying vec2 vUV; varying vec4 vCol;
void main() { vec4 t = texture2D(uTex, vUV); gl_FragColor = vec4(t.rgb * vCol.rgb * vCol.a, t.a * vCol.a); }`;
  const VS_POST = `attribute vec2 aPos; varying vec2 vUV; void main() { vUV = aPos * 0.5 + 0.5; gl_Position = vec4(aPos, 0.0, 1.0); }`;
  /* Abschluss: (Glühen dazu, Tonwertkurve,) Lichtblitz auf die Szene, 2D-Fläche darüber, Blende, dann bei 16 bit auf 5-6-5 mit geordnetem Dithering */
  const FS_POST = (bloom, tone) => `
precision mediump float;
uniform sampler2D uScene, uHud${bloom ? ', uBloom' : ''}; uniform float uUseHud, uDither${bloom ? ', uBloomK' : ''}${tone ? ', uExpo' : ''}; uniform vec4 uFade, uFlash;
varying vec2 vUV;
float b2(vec2 a) { a = floor(a); return fract(a.x / 2.0 + a.y * a.y * 0.75); }
float b4(vec2 a) { return b2(0.5 * a) * 0.25 + b2(a); }
void main() {
  vec3 c = texture2D(uScene, vUV).rgb;
  ${bloom ? 'c += texture2D(uBloom, vUV).rgb * uBloomK;' : ''}
  ${tone ? 'c *= uExpo; c = clamp((c * (2.51 * c + 0.03)) / (c * (2.43 * c + 0.59) + 0.14), 0.0, 1.0);' : ''}
  c = mix(c, uFlash.rgb, uFlash.a);
  if (uUseHud > 0.5) { vec4 h = texture2D(uHud, vUV); c = h.rgb + c * (1.0 - h.a); }
  c = mix(c, uFade.rgb, uFade.a);
  if (uDither > 0.5) { vec3 q = vec3(31.0, 63.0, 31.0); c = floor(c * q + b4(gl_FragCoord.xy)) / q; }
  gl_FragColor = vec4(c, 1.0);
}`;
  /* Glühen: helle Stellen herausziehen (Viertelgröße), dann in zwei Richtungen weichzeichnen */
  const FS_BRIGHT = `precision mediump float; uniform sampler2D uScene; uniform vec2 uTexel; uniform float uThr, uGain; varying vec2 vUV;
void main() { vec3 c = (texture2D(uScene, vUV + uTexel * vec2(-1.0, -1.0)).rgb + texture2D(uScene, vUV + uTexel * vec2(1.0, -1.0)).rgb + texture2D(uScene, vUV + uTexel * vec2(-1.0, 1.0)).rgb + texture2D(uScene, vUV + uTexel).rgb) * 0.25;
  float l = max(c.r, max(c.g, c.b)); gl_FragColor = vec4(c * max(l - uThr, 0.0) / max(l, 0.0001) * uGain, 1.0); }`;
  const FS_BLUR = `precision mediump float; uniform sampler2D uScene; uniform vec2 uDir; varying vec2 vUV;
void main() { vec3 c = texture2D(uScene, vUV).rgb * 0.227 + (texture2D(uScene, vUV + uDir * 1.385).rgb + texture2D(uScene, vUV - uDir * 1.385).rgb) * 0.316 + (texture2D(uScene, vUV + uDir * 3.231).rgb + texture2D(uScene, vUV - uDir * 3.231).rgb) * 0.0703; gl_FragColor = vec4(c, 1.0); }`;
  const FS_COPY = `precision mediump float; uniform sampler2D uScene; varying vec2 vUV; void main() { gl_FragColor = texture2D(uScene, vUV); }`;
  function prog(vs, fs, attrs) {
    const mk = (type, src) => { const s = gl.createShader(type); gl.shaderSource(s, src); gl.compileShader(s); if (!gl.getShaderParameter(s, gl.COMPILE_STATUS)) throw new Error('GLX Shader: ' + gl.getShaderInfoLog(s)); return s; };
    const p = gl.createProgram(); gl.attachShader(p, mk(gl.VERTEX_SHADER, vs)); gl.attachShader(p, mk(gl.FRAGMENT_SHADER, fs));
    attrs.forEach((a, i) => gl.bindAttribLocation(p, i, a)); gl.linkProgram(p);
    if (!gl.getProgramParameter(p, gl.LINK_STATUS)) throw new Error('GLX Programm: ' + gl.getProgramInfoLog(p));
    const cache = {}; return { p, u: (n) => (n in cache ? cache[n] : (cache[n] = gl.getUniformLocation(p, n))) };
  }
  const texParams = (min, mag) => { for (const [k, v] of [[gl.TEXTURE_MIN_FILTER, min], [gl.TEXTURE_MAG_FILTER, mag], [gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE], [gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE]]) gl.texParameteri(gl.TEXTURE_2D, k, v); };
  /* Zeichenziel: Farbtextur (+ Tiefe: 0 keine, 1 = 16 bit, 2 = Tiefe mit Stencil) */
  function target(w, h, depth, filter, type) {
    const t = gl.createTexture(); gl.bindTexture(gl.TEXTURE_2D, t); gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, w, h, 0, gl.RGBA, type ?? gl.UNSIGNED_BYTE, null); texParams(filter, filter);
    const f = gl.createFramebuffer(); gl.bindFramebuffer(gl.FRAMEBUFFER, f); gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0, gl.TEXTURE_2D, t, 0);
    if (depth) { const rb = gl.createRenderbuffer(); gl.bindRenderbuffer(gl.RENDERBUFFER, rb); gl.renderbufferStorage(gl.RENDERBUFFER, depth === 2 ? gl.DEPTH_STENCIL : gl.DEPTH_COMPONENT16, w, h); gl.framebufferRenderbuffer(gl.FRAMEBUFFER, depth === 2 ? gl.DEPTH_STENCIL_ATTACHMENT : gl.DEPTH_ATTACHMENT, gl.RENDERBUFFER, rb); }
    const ok = gl.checkFramebufferStatus(gl.FRAMEBUFFER) === gl.FRAMEBUFFER_COMPLETE; gl.bindFramebuffer(gl.FRAMEBUFFER, null);
    return ok ? { t, f, w, h } : null;
  }

  /* ---------- Aufbau ---------- */
  const DEF = { orange: '#FF7816', apricot: '#FFB366', signal: '#FF4D1C', ink: '#171310', night: '#0B1026', cream: '#F6F1E8', sky: '#9CC8F2', flow: '#A78BFA', nova: '#38BDF8', buddy: '#F472B6', ivy: '#3DDC84' };
  X.init = (o = {}) => {
    X.W = o.width ?? 960; X.H = o.height ?? 540; X.look = LOOKS[o.look] ? String(o.look) : '2k'; X.cfg = LOOKS[X.look]; X.hi = X.cfg.hi; X.lvl = X.cfg.lvl; X.images = o.images ?? {};
    for (const k of Object.keys(DEF)) X.C[k] = hex((o.colors && o.colors[k]) || DEF[k]);
    const c = o.canvas ?? document.createElement('canvas'); c.width = X.W; c.height = X.H; X.canvas = c;
    gl = X.gl = c.getContext('webgl', { antialias: false, alpha: false, depth: false, stencil: false, preserveDrawingBuffer: true, premultipliedAlpha: false });
    if (!gl) throw new Error('GLX: kein WebGL');
    const cf = X.cfg;
    P = {
      mesh: prog(VS_MESH, FS_MESH, ['aPos', 'aNor', 'aUV', 'aCol']),
      spr: prog(VS_SPR, FS_SPR, ['aPos', 'aUV', 'aCol']),
      post: prog(VS_POST, FS_POST(!!cf.bloom, !!cf.tone), ['aPos']),
    };
    if (cf.pp) { P.pix = prog(VS_PIX, FS_PIX(cf.shadow === 'map', cf.pcf ?? 4), ['aPos', 'aNor', 'aUV', 'aCol', 'aTan']); P.water = prog(VS_WATER, FS_WATER, ['aPos']); }
    if (cf.shadow === 'map') P.depth = prog(VS_DEPTH, FS_DEPTH, ['aPos']);
    if (cf.bloom) { P.bright = prog(VS_POST, FS_BRIGHT, ['aPos']); P.blur = prog(VS_POST, FS_BLUR, ['aPos']); }
    if (cf.refr) { P.glass = prog(VS_GLASS, FS_GLASS, ['aPos', 'aNor']); P.copy = prog(VS_POST, FS_COPY, ['aPos']); }
    /* Szene in eine Textur (mit Tiefenpuffer), der Abschluss kopiert sie auf die Zeichenfläche. Großer Helligkeitsumfang: Halbfloat, wenn es geht. */
    hfType = 0;
    if (cf.hdr) { const e = gl.getExtension('OES_texture_half_float'); gl.getExtension('EXT_color_buffer_half_float'); if (e) hfType = e.HALF_FLOAT_OES; }
    let sc = hfType ? target(X.W, X.H, 2, gl.NEAREST, hfType) : null; if (!sc) { hfType = 0; sc = target(X.W, X.H, cf.ds ? 2 : 1, gl.NEAREST); }
    if (!sc) throw new Error('GLX: Framebuffer unvollständig');
    fbo = sc.f; sceneTex = sc.t; X.hdr = !!hfType;
    sh = cf.shadow === 'map' ? target(cf.smap, cf.smap, 1, gl.NEAREST) : null; shReady = false; shPass = false;
    refl = cf.pp ? target(X.W >> 1, X.H >> 1, 1, gl.LINEAR) : null;
    grabT = cf.refr ? target(X.W, X.H, 0, gl.LINEAR) : null;
    bloomA = cf.bloom ? target(X.W >> 2, X.H >> 2, 0, gl.LINEAR) : null; bloomB = cf.bloom ? target(X.W >> 2, X.H >> 2, 0, gl.LINEAR) : null;
    hudTex = gl.createTexture(); gl.bindTexture(gl.TEXTURE_2D, hudTex); texParams(gl.NEAREST, gl.NEAREST);
    quadBuf = gl.createBuffer(); gl.bindBuffer(gl.ARRAY_BUFFER, quadBuf); gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 3, -1, -1, 3]), gl.STATIC_DRAW);
    sprBuf = gl.createBuffer(); gl.bindBuffer(gl.ARRAY_BUFFER, sprBuf); gl.bufferData(gl.ARRAY_BUFFER, SB.byteLength, gl.DYNAMIC_DRAW);
    white = X.texCanvas(X.cv(4, 4, (x) => { x.fillStyle = '#fff'; x.fillRect(0, 0, 4, 4); }));
    flatN = X.texCanvas(X.cv(4, 4, (x) => { x.fillStyle = 'rgb(128,128,255)'; x.fillRect(0, 0, 4, 4); }));
    imgCache.clear(); mirror = false;
    /* Tests des Looks: jeder Test nennt die Stufe, ab der es ihn gibt */
    X.tests = X._tests.filter((t) => X.lvl >= (t.min ?? 0)); X.test = {}; for (const t of X.tests) X.test[t.id] = t;
    for (const f of X._setup) f();
    return X;
  };
  X.cv = (w, h, fn) => { const c = document.createElement('canvas'); c.width = w; c.height = h; const x = c.getContext('2d'); if (fn) fn(x, w, h); return c; };

  /* ---------- Texturen ---------- */
  X.texCanvas = (src, o = {}) => {
    const t = gl.createTexture(); gl.bindTexture(gl.TEXTURE_2D, t);
    gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, true); gl.pixelStorei(gl.UNPACK_PREMULTIPLY_ALPHA_WEBGL, true);
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, src);
    const pot = isPot(src.width) && isPot(src.height), mip = pot && (o.mip ?? true);
    if (mip) gl.generateMipmap(gl.TEXTURE_2D);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, mip ? (o.tri ? gl.LINEAR_MIPMAP_LINEAR : gl.LINEAR_MIPMAP_NEAREST) : gl.LINEAR); gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, o.nearest ? gl.NEAREST : gl.LINEAR);
    const wrap = pot && o.repeat ? gl.REPEAT : gl.CLAMP_TO_EDGE; gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, wrap); gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, wrap);
    return { t, w: src.width, h: src.height, aspect: o.aspect ?? src.width / src.height };
  };
  /* Bild aus images als Textur: auf Zweierpotenz verkleinert (je nach Look bis 256, 512 oder 1024 px). aspect = Ausschnitt in dieser Proportion
     über die volle Breite, top = 0 … 1 wie weit unten er bei hohen Bildern sitzt. */
  const imgCache = new Map();
  X.imgTex = (key, o = {}) => {
    const id = `${key}|${o.aspect ?? ''}|${o.top ?? 0}|${o.repeat ? 'r' : ''}`; if (imgCache.has(id)) return imgCache.get(id);
    const img = X.images[key]; let tex;
    if (!img || !img.width) tex = Object.assign({}, white, { aspect: o.aspect ?? 1.6, missing: true });
    else {
      const iw = img.naturalWidth || img.width, ih = img.naturalHeight || img.height, asp = o.aspect ?? iw / ih, ch = Math.min(ih, iw / asp), cw = Math.min(iw, ch * asp), sy = (ih - ch) * (o.top ?? 0), sx = (iw - cw) / 2;
      const max = X.cfg.tex, tw = max, th = asp >= 1.3 ? max / 2 : max;
      tex = X.texCanvas(X.cv(tw, th, (x) => { x.imageSmoothingQuality = 'high'; x.drawImage(img, sx, sy, cw, ch, 0, 0, tw, th); }), { repeat: o.repeat, aspect: asp, tri: X.lvl >= 3 });
    }
    imgCache.set(id, tex); return tex;
  };

  /* ---------- Geometrie ---------- */
  /* Netz aus Listen: pos (xyz), nor (xyz), uv, col (rgb, sonst weiß), idx. 14 Zahlen je Ecke: dazu die Tangente (Richtung wachsender u),
     aus den Dreiecken gerechnet — ihre Länge trägt den Drehsinn (1 = rechts-, 0,5 = linkshändig), für die Normal-Maps ab Look 2001. */
  X.mesh = (d) => {
    const n = d.pos.length / 3, v = new Float32Array(n * 14), tn = new Float32Array(n * 3), bt = new Float32Array(n * 3), p = d.pos, uv = d.uv;
    if (uv) for (let i = 0; i < d.idx.length; i += 3) {
      const a = d.idx[i], b = d.idx[i + 1], c = d.idx[i + 2], x1 = p[b * 3] - p[a * 3], y1 = p[b * 3 + 1] - p[a * 3 + 1], z1 = p[b * 3 + 2] - p[a * 3 + 2], x2 = p[c * 3] - p[a * 3], y2 = p[c * 3 + 1] - p[a * 3 + 1], z2 = p[c * 3 + 2] - p[a * 3 + 2];
      const u1 = uv[b * 2] - uv[a * 2], v1 = uv[b * 2 + 1] - uv[a * 2 + 1], u2 = uv[c * 2] - uv[a * 2], v2 = uv[c * 2 + 1] - uv[a * 2 + 1], det = u1 * v2 - u2 * v1; if (Math.abs(det) < 1e-12) continue;
      const r = 1 / det, tx = (x1 * v2 - x2 * v1) * r, ty = (y1 * v2 - y2 * v1) * r, tz = (z1 * v2 - z2 * v1) * r, bx = (x2 * u1 - x1 * u2) * r, by = (y2 * u1 - y1 * u2) * r, bz = (z2 * u1 - z1 * u2) * r;
      for (const k of [a, b, c]) { tn[k * 3] += tx; tn[k * 3 + 1] += ty; tn[k * 3 + 2] += tz; bt[k * 3] += bx; bt[k * 3 + 1] += by; bt[k * 3 + 2] += bz; }
    }
    for (let i = 0; i < n; i++) {
      const nx = d.nor ? d.nor[i * 3] : 0, ny = d.nor ? d.nor[i * 3 + 1] : 1, nz = d.nor ? d.nor[i * 3 + 2] : 0;
      let tx = tn[i * 3], ty = tn[i * 3 + 1], tz = tn[i * 3 + 2]; const dt = tx * nx + ty * ny + tz * nz; tx -= nx * dt; ty -= ny * dt; tz -= nz * dt; let tl = Math.hypot(tx, ty, tz);
      if (tl < 1e-6) { if (Math.abs(ny) < 0.9) { tx = nz; ty = 0; tz = -nx; } else { tx = 1; ty = 0; tz = 0; } tl = Math.hypot(tx, ty, tz) || 1; }
      const w = (ny * tz - nz * ty) * bt[i * 3] + (nz * tx - nx * tz) * bt[i * 3 + 1] + (nx * ty - ny * tx) * bt[i * 3 + 2] < 0 ? 0.5 : 1;
      v[i * 14] = p[i * 3]; v[i * 14 + 1] = p[i * 3 + 1]; v[i * 14 + 2] = p[i * 3 + 2]; v[i * 14 + 3] = nx; v[i * 14 + 4] = ny; v[i * 14 + 5] = nz;
      v[i * 14 + 6] = uv ? uv[i * 2] : 0; v[i * 14 + 7] = uv ? uv[i * 2 + 1] : 0;
      v[i * 14 + 8] = d.col ? d.col[i * 3] : 1; v[i * 14 + 9] = d.col ? d.col[i * 3 + 1] : 1; v[i * 14 + 10] = d.col ? d.col[i * 3 + 2] : 1;
      v[i * 14 + 11] = (tx / tl) * w; v[i * 14 + 12] = (ty / tl) * w; v[i * 14 + 13] = (tz / tl) * w;
    }
    if (n > 65535) throw new Error('GLX: Netz zu groß');
    const vb = gl.createBuffer(); gl.bindBuffer(gl.ARRAY_BUFFER, vb); gl.bufferData(gl.ARRAY_BUFFER, v, gl.STATIC_DRAW);
    const ib = gl.createBuffer(); gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, ib); gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, new Uint16Array(d.idx), gl.STATIC_DRAW);
    return { vb, ib, n: d.idx.length, tris: d.idx.length / 3, idx: d.idx };
  };
  X.geo = {
    /* Kugel: seg Längen-, ring Breitenschritte; Pole auf der y-Achse; u läuft um die Achse */
    sphere(seg, ring, r = 1) {
      const pos = [], nor = [], uv = [], idx = [];
      for (let j = 0; j <= ring; j++) for (let i = 0; i <= seg; i++) { const a = (i / seg) * Math.PI * 2, b = (j / ring) * Math.PI, x = Math.sin(b) * Math.cos(a), y = Math.cos(b), z = Math.sin(b) * Math.sin(a); pos.push(x * r, y * r, z * r); nor.push(x, y, z); uv.push(1 - i / seg, 1 - j / ring); }
      for (let j = 0; j < ring; j++) for (let i = 0; i < seg; i++) { const a = j * (seg + 1) + i, b = a + seg + 1; idx.push(a, a + 1, b, a + 1, b + 1, b); }
      return X.mesh({ pos, nor, uv, idx });
    },
    torus(R, r, seg, side) {
      const pos = [], nor = [], uv = [], idx = [];
      for (let j = 0; j <= seg; j++) for (let i = 0; i <= side; i++) { const a = (j / seg) * Math.PI * 2, b = (i / side) * Math.PI * 2, cx = Math.cos(a), cz = Math.sin(a), nx = Math.cos(b) * cx, ny = Math.sin(b), nz = Math.cos(b) * cz; pos.push(cx * R + nx * r, ny * r, cz * R + nz * r); nor.push(nx, ny, nz); uv.push((j / seg) * 8, i / side); }
      for (let j = 0; j < seg; j++) for (let i = 0; i < side; i++) { const a = j * (side + 1) + i, b = a + side + 1; idx.push(a, a + 1, b, a + 1, b + 1, b); }
      return X.mesh({ pos, nor, uv, idx });
    },
    /* Quader um den Ursprung, je Seite eigene Ecken (harte Kanten) */
    box(w, h, d) {
      const pos = [], nor = [], uv = [], idx = [], f = [[1, 0, 0], [-1, 0, 0], [0, 1, 0], [0, -1, 0], [0, 0, 1], [0, 0, -1]];
      f.forEach((n) => {
        const u = n[0] ? [0, 0, -n[0]] : n[1] ? [1, 0, 0] : [n[2], 0, 0], v = [n[1] * u[2] - n[2] * u[1], n[2] * u[0] - n[0] * u[2], n[0] * u[1] - n[1] * u[0]], b = pos.length / 3;
        for (const [a, c] of [[-1, -1], [1, -1], [1, 1], [-1, 1]]) { pos.push(((n[0] + u[0] * a + v[0] * c) * w) / 2, ((n[1] + u[1] * a + v[1] * c) * h) / 2, ((n[2] + u[2] * a + v[2] * c) * d) / 2); nor.push(...n); uv.push((a + 1) / 2, (c + 1) / 2); }
        idx.push(b, b + 1, b + 2, b, b + 2, b + 3);
      });
      return X.mesh({ pos, nor, uv, idx });
    },
    /* Säule: Mantel von y = 0 bis h; cap = mit Deckel oben */
    cyl(r, h, side, vr = 4, cap = false) {
      const pos = [], nor = [], uv = [], idx = [], ring = 4;
      for (let j = 0; j <= ring; j++) for (let i = 0; i <= side; i++) { const a = (i / side) * Math.PI * 2; pos.push(Math.cos(a) * r, (j / ring) * h, Math.sin(a) * r); nor.push(Math.cos(a), 0, Math.sin(a)); uv.push((i / side) * 2, (j / ring) * vr); }
      for (let j = 0; j < ring; j++) for (let i = 0; i < side; i++) { const a = j * (side + 1) + i, b = a + side + 1; idx.push(a, b, a + 1, a + 1, b, b + 1); }
      if (cap) { const c = pos.length / 3; pos.push(0, h, 0); nor.push(0, 1, 0); uv.push(0.5, 0.5); for (let i = 0; i <= side; i++) { const a = (i / side) * Math.PI * 2; pos.push(Math.cos(a) * r, h, Math.sin(a) * r); nor.push(0, 1, 0); uv.push(0.5 + Math.cos(a) * 0.5, 0.5 + Math.sin(a) * 0.5); } for (let i = 0; i < side; i++) idx.push(c, c + 2 + i, c + 1 + i); }
      return X.mesh({ pos, nor, uv, idx });
    },
    /* Ebene in der xz-Fläche (Normale +y), n × n Felder, damit das Licht je Ecke etwas zu tun hat */
    plane(size, n, rep = 1) {
      const pos = [], nor = [], uv = [], idx = [];
      for (let j = 0; j <= n; j++) for (let i = 0; i <= n; i++) { pos.push((i / n - 0.5) * size, 0, (j / n - 0.5) * size); nor.push(0, 1, 0); uv.push((i / n) * rep, (j / n) * rep); }
      for (let j = 0; j < n; j++) for (let i = 0; i < n; i++) { const a = j * (n + 1) + i, b = a + n + 1; idx.push(a, b, a + 1, a + 1, b, b + 1); }
      return X.mesh({ pos, nor, uv, idx });
    },
    /* Kreisring in der xz-Fläche (Normale +y) von Radius r0 bis r1; r0 = 0 ergibt eine Scheibe */
    ring(r0, r1, seg, rings = 1, rep = 1) {
      const pos = [], nor = [], uv = [], idx = [];
      for (let j = 0; j <= rings; j++) for (let i = 0; i <= seg; i++) { const a = (i / seg) * Math.PI * 2, r = r0 + ((r1 - r0) * j) / rings; pos.push(Math.cos(a) * r, 0, Math.sin(a) * r); nor.push(0, 1, 0); uv.push((Math.cos(a) * r * rep) / r1, (Math.sin(a) * r * rep) / r1); }
      for (let j = 0; j < rings; j++) for (let i = 0; i < seg; i++) { const a = j * (seg + 1) + i, b = a + seg + 1; idx.push(a, a + 1, b, a + 1, b + 1, b); }
      return X.mesh({ pos, nor, uv, idx });
    },
    /* Rechteck in der xy-Fläche (Normale +z), Mitte im Ursprung */
    quad(w = 1, h = 1) { return X.mesh({ pos: [-w / 2, -h / 2, 0, w / 2, -h / 2, 0, w / 2, h / 2, 0, -w / 2, h / 2, 0], nor: [0, 0, 1, 0, 0, 1, 0, 0, 1, 0, 0, 1], uv: [0, 0, 1, 0, 1, 1, 0, 1], idx: [0, 1, 2, 0, 2, 3] }); },
  };

  /* ---------- Kamera, Licht, Nebel ---------- */
  X.camera = (eye, target, fovDeg = 55, roll = 0, near = 0.4, far = 460) => {
    const c = X.cam, f = [target[0] - eye[0], target[1] - eye[1], target[2] - eye[2]], fl = Math.hypot(...f) || 1; f[0] /= fl; f[1] /= fl; f[2] /= fl;
    /* Rollen: die Hochachse um die Blickrichtung drehen */
    let up = [0, 1, 0]; if (roll) { const s = Math.sin(roll), co = Math.cos(roll), cr = [f[1] * up[2] - f[2] * up[1], f[2] * up[0] - f[0] * up[2], f[0] * up[1] - f[1] * up[0]]; up = [up[0] * co + cr[0] * s, up[1] * co + cr[1] * s, up[2] * co + cr[2] * s]; }
    c.eye = eye.slice(); c.fov = (fovDeg * Math.PI) / 180; c.view = M.look(eye, target, up); c.proj = M.persp(c.fov, X.W / X.H, near, far); c.vp = M.mul(c.proj, c.view);
    c.right = [c.view[0], c.view[4], c.view[8]]; c.up = [c.view[1], c.view[5], c.view[9]]; c.fwd = f;
  };
  X.light = (o) => { L.amb = o.amb ?? [0.2, 0.2, 0.2]; L.dir = o.dir ?? [0, 1, 0]; const l = Math.hypot(...L.dir) || 1; L.dir = L.dir.map((v) => v / l); L.dirC = o.dirC ?? [0, 0, 0]; L.pts = (o.pts ?? []).slice(0, NL); };
  X.fog = (c, a, b) => { F.c = c; F.a = a; F.b = b; };
  /* Spiegelung an der Bodenfläche y = 0 (für glänzende Böden): Geometrie, Lichter und Auge werden gespiegelt */
  X.mirror = (on) => { mirror = !!on; };
  X.clear = (c) => { clearC = c; gl.clearColor(c[0], c[1], c[2], 1); gl.depthMask(true); if (X.cfg.ds && !shPass) { gl.stencilMask(255); gl.clearStencil(0); gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT | gl.STENCIL_BUFFER_BIT); } else gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT); };
  /* Punkt in Bildkoordinaten (−1 … 1); null, wenn hinter der Kamera */
  X.project = (p) => { const m = X.cam.vp, w = m[3] * p[0] + m[7] * p[1] + m[11] * p[2] + m[15]; if (w <= 0.001) return null; return [(m[0] * p[0] + m[4] * p[1] + m[8] * p[2] + m[12]) / w, (m[1] * p[0] + m[5] * p[1] + m[9] * p[2] + m[13]) / w, w]; };

  /* ---------- Zeichnen: Netze ---------- */
  const MIR = M.trs([0, 0, 0], [0, 0, 0], [1, -1, 1]);
  const lp = new Float32Array(NL * 3), lc = new Float32Array(NL * 3), lr = new Float32Array(NL);
  const bindMesh = (mesh, n) => {
    gl.bindBuffer(gl.ARRAY_BUFFER, mesh.vb); gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, mesh.ib);
    for (let i = 0; i < 5; i++) if (i < n) gl.enableVertexAttribArray(i); else gl.disableVertexAttribArray(i);
    gl.vertexAttribPointer(0, 3, gl.FLOAT, false, 56, 0); if (n > 1) gl.vertexAttribPointer(1, 3, gl.FLOAT, false, 56, 12);
    if (n > 2) { gl.vertexAttribPointer(2, 2, gl.FLOAT, false, 56, 24); gl.vertexAttribPointer(3, 3, gl.FLOAT, false, 56, 32); } if (n > 4) gl.vertexAttribPointer(4, 3, gl.FLOAT, false, 56, 44);
  };
  const tex = (unit, t, loc) => { gl.activeTexture(gl.TEXTURE0 + unit); gl.bindTexture(gl.TEXTURE_2D, t); gl.uniform1i(loc, unit); };
  /* Material m: tex, tint, unlit, alpha, blend ('none' | 'alpha' | 'add'), env + envK / envAdd / envTint, spec, uvS / uvO, cull, depthTest,
     depthWrite, fog. Ab Look 2001 (Licht je Bildpunkt) zusätzlich: nrm (Normal-Map) + bump, gloss (Glanz-Map), shine (Schärfe des Glanzlichts),
     fres (Fresnel-Grundwert; 1 = aus), emis (Eigenleuchten), cast / recv (wirft / empfängt Schatten), vtx = Licht je Ecke erzwingen. */
  X.draw = (mesh, model, m = {}) => {
    if (shPass) {
      /* Durchgang für die Shadow Map: nur Tiefe, nur was Schatten wirft */
      if ((m.blend ?? 'none') !== 'none' || m.cast === false || m.unlit) return;
      const u = P.depth.u; bindMesh(mesh, 1); gl.uniformMatrix4fv(u('uModel'), false, model ?? M.id());
      const cull = m.cull ?? 'back'; if (cull === 'none') gl.disable(gl.CULL_FACE); else { gl.enable(gl.CULL_FACE); gl.cullFace(gl.FRONT); gl.frontFace(gl.CCW); }
      gl.drawElements(gl.TRIANGLES, mesh.n, gl.UNSIGNED_SHORT, 0); X.stats.tris += mesh.tris; X.stats.draws++; return;
    }
    if (X.wireK >= 1) { X.wire(mesh, model, X.wireC, 1); return; }
    const pp = X.cfg.pp && !m.unlit && !m.vtx, p = pp ? P.pix : P.mesh, u = p.u; gl.useProgram(p.p);
    bindMesh(mesh, pp ? 5 : 4);
    const my = mirror ? -1 : 1, c = X.cam;
    gl.uniformMatrix4fv(u('uVP'), false, c.vp); gl.uniformMatrix4fv(u('uView'), false, c.view); gl.uniformMatrix4fv(u('uModel'), false, mirror ? M.mul(MIR, model ?? M.id()) : model ?? M.id());
    gl.uniform3f(u('uEye'), c.eye[0], c.eye[1], c.eye[2]);
    gl.uniform3fv(u('uAmb'), L.amb); gl.uniform3f(u('uDirL'), L.dir[0], L.dir[1] * my, L.dir[2]); gl.uniform3fv(u('uDirC'), L.dirC);
    for (let i = 0; i < NL; i++) { const q = L.pts[i]; lp[i * 3] = q ? q.p[0] : 0; lp[i * 3 + 1] = q ? q.p[1] * my : 0; lp[i * 3 + 2] = q ? q.p[2] : 0; lc[i * 3] = q ? q.c[0] : 0; lc[i * 3 + 1] = q ? q.c[1] : 0; lc[i * 3 + 2] = q ? q.c[2] : 0; lr[i] = q ? q.r : 1; }
    gl.uniform3fv(u('uLP[0]'), lp); gl.uniform3fv(u('uLC[0]'), lc); gl.uniform1fv(u('uLR[0]'), lr);
    const blend = m.blend ?? 'none', tint = m.tint ?? [1, 1, 1], fog = m.fog ?? true;
    gl.uniform3fv(u('uTint'), tint); gl.uniform1f(u('uSpec'), m.spec ?? 0);
    gl.uniform1f(u('uFogA'), F.a); gl.uniform1f(u('uFogB'), fog ? F.b : 0); gl.uniform3fv(u('uFogC'), blend === 'add' ? [0, 0, 0] : F.c);
    gl.uniform2fv(u('uUVS'), m.uvS ?? [1, 1]); gl.uniform2fv(u('uUVO'), m.uvO ?? [0, 0]);
    gl.uniform1f(u('uUseTex'), m.tex ? 1 : 0); gl.uniform1f(u('uEnvK'), m.envK ?? 0); gl.uniform1f(u('uEnvAdd'), m.envAdd ?? 0); gl.uniform3fv(u('uEnvTint'), m.envTint ?? [1, 1, 1]); gl.uniform1f(u('uAlpha'), m.alpha ?? 1);
    tex(0, (m.tex ?? white).t, u('uTex')); tex(1, (m.env ?? white).t, u('uEnvT'));
    if (pp) {
      tex(2, (m.nrm ?? flatN).t, u('uNrm')); tex(3, (m.gloss ?? white).t, u('uGloss'));
      gl.uniform1f(u('uBump'), m.nrm ? m.bump ?? 1 : 0); gl.uniform1f(u('uUseGloss'), m.gloss ? 1 : 0); gl.uniform1f(u('uShine'), m.shine ?? 32); gl.uniform1f(u('uFres'), m.fres ?? 1); gl.uniform1f(u('uEmis'), m.emis ?? 0);
      const on = sh && shReady && !mirror && m.recv !== false;
      if (sh) { tex(4, sh.t, u('uShT')); gl.uniformMatrix4fv(u('uShM'), false, shM); gl.uniform1f(u('uShK'), on ? (m.recv ?? 1) : 0); gl.uniform1f(u('uShTexel'), 1 / sh.w); gl.uniform1f(u('uShBias'), shBias); }
    } else gl.uniform1f(u('uUnlit'), m.unlit ? 1 : 0);
    gl.activeTexture(gl.TEXTURE0);
    if (blend === 'none') gl.disable(gl.BLEND); else { gl.enable(gl.BLEND); gl.blendFunc(gl.SRC_ALPHA, blend === 'add' ? gl.ONE : gl.ONE_MINUS_SRC_ALPHA); }
    if (m.depthTest ?? true) gl.enable(gl.DEPTH_TEST); else gl.disable(gl.DEPTH_TEST);
    gl.depthMask(m.depthWrite ?? blend === 'none');
    const cull = m.cull ?? 'back';
    if (cull === 'none') gl.disable(gl.CULL_FACE); else { gl.enable(gl.CULL_FACE); gl.cullFace(cull === 'front' ? gl.FRONT : gl.BACK); gl.frontFace(mirror ? gl.CW : gl.CCW); }
    if (m.once) { gl.enable(gl.STENCIL_TEST); gl.stencilFunc(gl.EQUAL, 0, 255); gl.stencilOp(gl.KEEP, gl.KEEP, gl.INCR); gl.enable(gl.POLYGON_OFFSET_FILL); gl.polygonOffset(-2, -4); }
    gl.drawElements(gl.TRIANGLES, mesh.n, gl.UNSIGNED_SHORT, 0);
    if (m.once) { gl.disable(gl.STENCIL_TEST); gl.disable(gl.POLYGON_OFFSET_FILL); }
    X.stats.tris += mesh.tris; X.stats.draws++;
    if (X.wireK > 0) X.wire(mesh, model, X.wireC, X.wireK);
  };
  /* Drahtgitter eines Netzes (Kanten der Dreiecke), additiv. GLX.wireK (0 … 1, je Bild neu zu setzen) legt es über alle Netze; ab 1 erscheint nur noch das Gitter. */
  X.wire = (mesh, model, col = [1, 1, 1], alpha = 1) => {
    if (shPass) return;
    if (!mesh.lb) { const seen = new Set(), l = []; for (let i = 0; i < mesh.idx.length; i += 3) for (const [a, b] of [[mesh.idx[i], mesh.idx[i + 1]], [mesh.idx[i + 1], mesh.idx[i + 2]], [mesh.idx[i + 2], mesh.idx[i]]]) { const k = a < b ? a * 65536 + b : b * 65536 + a; if (!seen.has(k)) { seen.add(k); l.push(a, b); } } mesh.lb = gl.createBuffer(); gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, mesh.lb); gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, new Uint16Array(l), gl.STATIC_DRAW); mesh.ln = l.length; }
    const u = P.mesh.u, c = X.cam; gl.useProgram(P.mesh.p); bindMesh(mesh, 4); gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, mesh.lb);
    gl.uniformMatrix4fv(u('uVP'), false, c.vp); gl.uniformMatrix4fv(u('uView'), false, c.view); gl.uniformMatrix4fv(u('uModel'), false, mirror ? M.mul(MIR, model ?? M.id()) : model ?? M.id());
    gl.uniform3f(u('uEye'), c.eye[0], c.eye[1], c.eye[2]); gl.uniform3fv(u('uAmb'), [1, 1, 1]); gl.uniform3fv(u('uDirC'), [0, 0, 0]); gl.uniform3fv(u('uDirL'), [0, 1, 0]);
    lc.fill(0); lr.fill(1); gl.uniform3fv(u('uLP[0]'), lp); gl.uniform3fv(u('uLC[0]'), lc); gl.uniform1fv(u('uLR[0]'), lr);
    gl.uniform3fv(u('uTint'), col); gl.uniform1f(u('uUnlit'), 1); gl.uniform1f(u('uSpec'), 0); gl.uniform1f(u('uFogA'), F.a); gl.uniform1f(u('uFogB'), F.b); gl.uniform3fv(u('uFogC'), [0, 0, 0]);
    gl.uniform2fv(u('uUVS'), [1, 1]); gl.uniform2fv(u('uUVO'), [0, 0]); gl.uniform1f(u('uUseTex'), 0); gl.uniform1f(u('uEnvK'), 0); gl.uniform1f(u('uEnvAdd'), 0); gl.uniform3fv(u('uEnvTint'), [1, 1, 1]); gl.uniform1f(u('uAlpha'), alpha);
    tex(0, white.t, u('uTex')); tex(1, white.t, u('uEnvT')); gl.activeTexture(gl.TEXTURE0);
    gl.enable(gl.BLEND); gl.blendFunc(gl.SRC_ALPHA, gl.ONE); gl.enable(gl.DEPTH_TEST); gl.depthMask(false); gl.disable(gl.CULL_FACE);
    gl.drawElements(gl.LINES, mesh.ln, gl.UNSIGNED_SHORT, 0); X.stats.draws++;
  };

  /* ---------- Schatten ---------- */
  /* Shadow Map (ab Look 2003): fn zeichnet, was Schatten wirft; danach empfangen alle mit Licht je Bildpunkt gezeichneten Flächen den
     Schatten des Richtungslichts. dir = Richtung zum Licht, mitte + radius = der Bereich, den die Karte abdeckt. Ohne Shadow Map: nichts. */
  let shBias = 0.003;
  X.shadow = (dir, ctr, rad, fn, bias = 0.003) => {
    if (!sh) return false;
    const l = Math.hypot(...dir) || 1, d = dir.map((v) => v / l), up = Math.abs(d[1]) > 0.95 ? [1, 0, 0] : [0, 1, 0];
    /* die Mitte auf das Texelraster der Karte einrasten: wandert sie mit der Kamera, flimmern die Schattenkanten sonst */
    const v0 = M.look([d[0], d[1], d[2]], [0, 0, 0], up), tx = (2 * rad) / sh.w, rx = [v0[0], v0[4], v0[8]], ry = [v0[1], v0[5], v0[9]];
    const cx = ctr[0] * rx[0] + ctr[1] * rx[1] + ctr[2] * rx[2], cy = ctr[0] * ry[0] + ctr[1] * ry[1] + ctr[2] * ry[2], dx = Math.round(cx / tx) * tx - cx, dy = Math.round(cy / tx) * tx - cy;
    ctr = [ctr[0] + rx[0] * dx + ry[0] * dy, ctr[1] + rx[1] * dx + ry[1] * dy, ctr[2] + rx[2] * dx + ry[2] * dy];
    const eye = [ctr[0] + d[0] * rad * 2, ctr[1] + d[1] * rad * 2, ctr[2] + d[2] * rad * 2], vp = M.mul(M.ortho(rad, 0.1, rad * 4), M.look(eye, ctr, up));
    shM = M.mul(new Float32Array([0.5, 0, 0, 0, 0, 0.5, 0, 0, 0, 0, 0.5, 0, 0.5, 0.5, 0.5, 1]), vp); shBias = bias;
    gl.bindFramebuffer(gl.FRAMEBUFFER, sh.f); gl.viewport(0, 0, sh.w, sh.h); gl.clearColor(1, 1, 1, 1); gl.depthMask(true); gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
    gl.useProgram(P.depth.p); gl.uniformMatrix4fv(P.depth.u('uVP'), false, vp); gl.disable(gl.BLEND); gl.enable(gl.DEPTH_TEST);
    shPass = true; sn = 0; try { fn(); } finally { shPass = false; sn = 0; }
    gl.bindFramebuffer(gl.FRAMEBUFFER, fbo); gl.viewport(0, 0, X.W, X.H); shReady = true; return true;
  };
  /* Projizierter Schatten (Look 2001): das Netz flach auf die Ebene y = h gedrückt, entlang des Richtungslichts, einmal je Bildpunkt (Stencil) */
  X.planar = (mesh, model, h = 0, alpha = 0.5) => {
    if (X.cfg.shadow !== 'planar' || shPass || mirror || L.dir[1] < 0.05) return;
    const kx = L.dir[0] / L.dir[1], kz = L.dir[2] / L.dir[1], pm = new Float32Array([1, 0, 0, 0, -kx, 0, -kz, 0, 0, 0, 1, 0, h * kx, h + 0.01, h * kz, 1]);
    X.draw(mesh, M.mul(pm, model ?? M.id()), { unlit: true, tint: [0, 0, 0], alpha, blend: 'alpha', cull: 'none', once: true });
  };

  /* ---------- Spiegelbild und Wellenfläche (ab Look 2001) ---------- */
  /* fn zeichnet die Szene über der Ebene y = 0; sie landet gespiegelt in einer eigenen Textur (halbe Größe). */
  X.reflect = (fn) => {
    if (!refl || shPass) return false;
    gl.bindFramebuffer(gl.FRAMEBUFFER, refl.f); gl.viewport(0, 0, refl.w, refl.h); gl.clearColor(clearC[0], clearC[1], clearC[2], 1); gl.depthMask(true); gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
    const keep = mirror; mirror = true; try { fn(); } finally { mirror = keep; }
    gl.bindFramebuffer(gl.FRAMEBUFFER, fbo); gl.viewport(0, 0, X.W, X.H); return true;
  };
  /* Wellenfläche auf y = 0: mesh (z. B. geo.ring oder geo.plane), o: nrm (Normal-Map der Wellen), time, scale, bump, dist (Verzerrung),
     fres, deep (Farbe in der Tiefe), tint, spec, ctr [x, z] + rip [Frequenz, Tempo, Stärke, Abklingen] für Ringe um eine Mitte */
  X.water = (mesh, model, o = {}) => {
    if (!refl || shPass || mirror) return;
    const u = P.water.u, c = X.cam; gl.useProgram(P.water.p); bindMesh(mesh, 1);
    gl.uniformMatrix4fv(u('uVP'), false, c.vp); gl.uniformMatrix4fv(u('uView'), false, c.view); gl.uniformMatrix4fv(u('uModel'), false, model ?? M.id());
    gl.uniform3f(u('uEye'), c.eye[0], c.eye[1], c.eye[2]); gl.uniform3fv(u('uDirL'), L.dir); gl.uniform3fv(u('uDirC'), L.dirC);
    gl.uniform3fv(u('uDeep'), o.deep ?? [0.01, 0.015, 0.03]); gl.uniform3fv(u('uTint'), o.tint ?? [1, 1, 1]); gl.uniform3fv(u('uFogC'), F.c); gl.uniform1f(u('uFogA'), F.a); gl.uniform1f(u('uFogB'), F.b);
    gl.uniform4fv(u('uRip'), o.rip ?? [0, 0, 0, 0]); gl.uniform2fv(u('uCtr'), o.ctr ?? [0, 0]); gl.uniform1f(u('uTime'), o.time ?? 0); gl.uniform1f(u('uScale'), o.scale ?? 0.08);
    gl.uniform1f(u('uBump'), o.bump ?? 0.12); gl.uniform1f(u('uDist'), o.dist ?? 0.03); gl.uniform1f(u('uFres'), o.fres ?? 0.25); gl.uniform1f(u('uSpec'), o.spec ?? 1);
    tex(0, refl.t, u('uRefl')); tex(1, (o.nrm ?? flatN).t, u('uNrm')); gl.activeTexture(gl.TEXTURE0);
    gl.disable(gl.BLEND); gl.enable(gl.DEPTH_TEST); gl.depthMask(true); gl.disable(gl.CULL_FACE);
    gl.drawElements(gl.TRIANGLES, mesh.n, gl.UNSIGNED_SHORT, 0); X.stats.tris += mesh.tris; X.stats.draws++;
  };

  /* ---------- Brechung (Look 2005) ---------- */
  const fullQuad = () => { gl.bindBuffer(gl.ARRAY_BUFFER, quadBuf); gl.enableVertexAttribArray(0); for (let i = 1; i < 5; i++) gl.disableVertexAttribArray(i); gl.vertexAttribPointer(0, 2, gl.FLOAT, false, 8, 0); gl.disable(gl.DEPTH_TEST); gl.disable(gl.BLEND); gl.disable(gl.CULL_FACE); gl.depthMask(false); gl.drawArrays(gl.TRIANGLES, 0, 3); };
  /* Kopie des bisher gezeichneten Bildes ziehen — danach zeichnet GLX.glass Glas, hinter dem sich das Bild bricht. false, wenn der Look das nicht kann. */
  X.grab = () => {
    if (!grabT || shPass || mirror) return false;
    gl.bindFramebuffer(gl.FRAMEBUFFER, grabT.f); gl.viewport(0, 0, grabT.w, grabT.h); gl.useProgram(P.copy.p); tex(0, sceneTex, P.copy.u('uScene')); fullQuad();
    gl.bindFramebuffer(gl.FRAMEBUFFER, fbo); gl.viewport(0, 0, X.W, X.H); return true;
  };
  /* Glas: o.refr (Stärke der Brechung), tint, env + envK, fres, spec */
  X.glass = (mesh, model, o = {}) => {
    if (!grabT || shPass || mirror) return;
    const u = P.glass.u, c = X.cam; gl.useProgram(P.glass.p); bindMesh(mesh, 2);
    gl.uniformMatrix4fv(u('uVP'), false, c.vp); gl.uniformMatrix4fv(u('uView'), false, c.view); gl.uniformMatrix4fv(u('uModel'), false, model ?? M.id());
    gl.uniform3f(u('uEye'), c.eye[0], c.eye[1], c.eye[2]); gl.uniform3fv(u('uDirL'), L.dir); gl.uniform3fv(u('uDirC'), L.dirC); gl.uniform3fv(u('uTint'), o.tint ?? [0.9, 0.95, 1]);
    gl.uniform2f(u('uRes'), X.W, X.H); gl.uniform1f(u('uRefr'), o.refr ?? 0.05); gl.uniform1f(u('uFres'), o.fres ?? 0.06); gl.uniform1f(u('uSpec'), o.spec ?? 1); gl.uniform1f(u('uEnvK'), o.envK ?? 1);
    tex(0, grabT.t, u('uGrab')); tex(1, (o.env ?? white).t, u('uEnvT')); gl.activeTexture(gl.TEXTURE0);
    gl.disable(gl.BLEND); gl.enable(gl.DEPTH_TEST); gl.depthMask(true); gl.enable(gl.CULL_FACE); gl.cullFace(gl.BACK); gl.frontFace(gl.CCW);
    gl.drawElements(gl.TRIANGLES, mesh.n, gl.UNSIGNED_SHORT, 0); X.stats.tris += mesh.tris; X.stats.draws++;
  };

  /* ---------- Zeichnen: Leuchtpunkte und freie Rechtecke (gesammelt, dann in einem Zug) ---------- */
  const MAXS = 16000, SB = new Float32Array(MAXS * 6 * 9); let sn = 0, sprBuf;
  const put = (x, y, z, u, v, r, g, b, a) => { const o = sn * 9; SB[o] = x; SB[o + 1] = y; SB[o + 2] = z; SB[o + 3] = u; SB[o + 4] = v; SB[o + 5] = r; SB[o + 6] = g; SB[o + 7] = b; SB[o + 8] = a; sn++; };
  X.spr = {
    /* vier Ecken (gegen den Uhrzeigersinn ab unten links), Farbe, Deckkraft, Texturausschnitt */
    quad(p, r, g, b, a, u0 = 0, v0 = 0, u1 = 1, v1 = 1) {
      if (sn + 6 > MAXS * 6) return;
      put(p[0], p[1], p[2], u0, v0, r, g, b, a); put(p[3], p[4], p[5], u1, v0, r, g, b, a); put(p[6], p[7], p[8], u1, v1, r, g, b, a);
      put(p[0], p[1], p[2], u0, v0, r, g, b, a); put(p[6], p[7], p[8], u1, v1, r, g, b, a); put(p[9], p[10], p[11], u0, v1, r, g, b, a);
    },
    /* zur Kamera gedrehtes Rechteck um (x, y, z), halbe Breite sx, halbe Höhe sy, Drehung rot */
    add(x, y, z, sx, sy, r, g, b, a, rot = 0) {
      const R = X.cam.right, U = X.cam.up, co = Math.cos(rot), si = Math.sin(rot);
      const ax = (R[0] * co + U[0] * si) * sx, ay = (R[1] * co + U[1] * si) * sx, az = (R[2] * co + U[2] * si) * sx, bx = (U[0] * co - R[0] * si) * sy, by = (U[1] * co - R[1] * si) * sy, bz = (U[2] * co - R[2] * si) * sy;
      this.quad([x - ax - bx, y - ay - by, z - az - bz, x + ax - bx, y + ay - by, z + az - bz, x + ax + bx, y + ay + by, z + az + bz, x - ax + bx, y - ay + by, z - az + bz], r, g, b, a);
    },
    /* Rechteck in Bildkoordinaten (−1 … 1), für Lens Flares und 2D-Tests; flush mit { screen: true } */
    ndc(x, y, sx, sy, r, g, b, a, rot = 0, uv) {
      const co = Math.cos(rot), si = Math.sin(rot), k = X.H / X.W, ax = co * sx, ay = si * sx, bx = -si * sy, by = co * sy;
      this.quad([x + (-ax - bx) * k, y - ay - by, 0, x + (ax - bx) * k, y + ay - by, 0, x + (ax + bx) * k, y + ay + by, 0, x + (-ax + bx) * k, y - ay + by, 0], r, g, b, a, ...(uv ?? []));
    },
    /* mode: 'add' (Licht addiert sich) oder 'alpha' */
    flush(tex0, mode = 'add', o = {}) {
      if (!sn) return;
      if (shPass || (mirror && o.screen)) { sn = 0; return; }
      const p = P.spr, u = p.u; gl.useProgram(p.p);
      gl.bindBuffer(gl.ARRAY_BUFFER, sprBuf); gl.bufferSubData(gl.ARRAY_BUFFER, 0, SB.subarray(0, sn * 9));
      for (let i = 0; i < 3; i++) gl.enableVertexAttribArray(i); gl.disableVertexAttribArray(3); gl.disableVertexAttribArray(4);
      gl.vertexAttribPointer(0, 3, gl.FLOAT, false, 36, 0); gl.vertexAttribPointer(1, 2, gl.FLOAT, false, 36, 12); gl.vertexAttribPointer(2, 4, gl.FLOAT, false, 36, 20);
      gl.uniformMatrix4fv(u('uVP'), false, o.screen ? M.id() : X.cam.vp); gl.uniformMatrix4fv(u('uView'), false, X.cam.view);
      gl.uniform1f(u('uFogA'), F.a); gl.uniform1f(u('uFogB'), o.fog && !o.screen ? F.b : 0); gl.uniform1f(u('uMirY'), mirror ? -1 : 1);
      gl.activeTexture(gl.TEXTURE0); gl.bindTexture(gl.TEXTURE_2D, (tex0 ?? white).t); gl.uniform1i(u('uTex'), 0);
      gl.enable(gl.BLEND); gl.blendFunc(gl.ONE, mode === 'add' ? gl.ONE : gl.ONE_MINUS_SRC_ALPHA);
      if ((o.depth ?? true) && !o.screen) gl.enable(gl.DEPTH_TEST); else gl.disable(gl.DEPTH_TEST);
      gl.depthMask(false); gl.disable(gl.CULL_FACE);
      gl.drawArrays(gl.TRIANGLES, 0, sn);
      X.stats.tris += sn / 3; X.stats.draws++; sn = 0;
    },
  };

  /* ---------- Bild beginnen und abschließen ---------- */
  X.begin = () => { X.wireK = 0; X.wireC = [1, 1, 1]; gl.bindFramebuffer(gl.FRAMEBUFFER, fbo); gl.viewport(0, 0, X.W, X.H); X.stats.tris = 0; X.stats.draws = 0; mirror = false; shPass = false; shReady = false; sn = 0; X.fog([0, 0, 0], 0, 0); X.light({ amb: [1, 1, 1] }); };
  X.end = (o = {}) => {
    const cf = X.cfg;
    if (cf.bloom) {
      /* helle Stellen in Viertelgröße, zweimal in beiden Richtungen weichgezeichnet (der zweite Gang breiter) */
      const pass = (prog0, dst, src, set) => { gl.bindFramebuffer(gl.FRAMEBUFFER, dst.f); gl.viewport(0, 0, dst.w, dst.h); gl.useProgram(prog0.p); tex(0, src, prog0.u('uScene')); set(prog0.u); fullQuad(); };
      pass(P.bright, bloomA, sceneTex, (u) => { gl.uniform2f(u('uTexel'), 1 / X.W, 1 / X.H); gl.uniform1f(u('uThr'), cf.tone ? 1.0 : 0.62); gl.uniform1f(u('uGain'), cf.tone ? 0.55 : 1.5); });
      for (const k of [1, 2.2]) { pass(P.blur, bloomB, bloomA.t, (u) => gl.uniform2f(u('uDir'), k / bloomA.w, 0)); pass(P.blur, bloomA, bloomB.t, (u) => gl.uniform2f(u('uDir'), 0, k / bloomA.h)); }
    }
    gl.bindFramebuffer(gl.FRAMEBUFFER, null); gl.viewport(0, 0, X.W, X.H);
    const p = P.post, u = p.u; gl.useProgram(p.p); gl.disable(gl.DEPTH_TEST); gl.disable(gl.BLEND); gl.disable(gl.CULL_FACE); gl.depthMask(false);
    gl.bindBuffer(gl.ARRAY_BUFFER, quadBuf); gl.enableVertexAttribArray(0); for (let i = 1; i < 5; i++) gl.disableVertexAttribArray(i); gl.vertexAttribPointer(0, 2, gl.FLOAT, false, 8, 0);
    gl.activeTexture(gl.TEXTURE0); gl.bindTexture(gl.TEXTURE_2D, sceneTex); gl.uniform1i(u('uScene'), 0);
    if (cf.bloom) { tex(2, bloomA.t, u('uBloom')); gl.uniform1f(u('uBloomK'), cf.bloom * (o.bloom ?? 1)); }
    if (cf.tone) gl.uniform1f(u('uExpo'), o.expo ?? 1);
    gl.activeTexture(gl.TEXTURE1); gl.bindTexture(gl.TEXTURE_2D, hudTex); gl.uniform1i(u('uHud'), 1);
    if (o.hud) { gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, true); gl.pixelStorei(gl.UNPACK_PREMULTIPLY_ALPHA_WEBGL, true); gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, o.hud); }
    gl.uniform1f(u('uUseHud'), o.hud ? 1 : 0); gl.uniform1f(u('uDither'), o.dither ?? cf.dither ? 1 : 0); gl.uniform4fv(u('uFade'), o.fade ?? [0, 0, 0, 0]); gl.uniform4fv(u('uFlash'), o.flash ?? [0, 0, 0, 0]);
    gl.drawArrays(gl.TRIANGLES, 0, 3);
    gl.activeTexture(gl.TEXTURE0);
  };
  return X;
})();
