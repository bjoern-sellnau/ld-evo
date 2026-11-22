/* GLX — kleiner WebGL-Engine in der Machart der 3D-Benchmarks um 1997 – 2000: Low-Poly, Licht je Ecke (Gouraud), Nebel,
   bilineare Texturen kleiner Auflösung, additive Leuchtpunkte, Lens Flares, Environment-Mapping, keine Kantenglättung.
   Rohes WebGL 1, kein Framework, keine Netz-Abhängigkeit — und unabhängig vom Trailer: Größe, Look, Farben und Bilder kommen als
   Parameter. Die Szenen („Tests“) stehen in glx-tests.js.

   Schnittstelle
     <script src="gl/glx.js"></script><script src="gl/glx-tests.js"></script>
     GLX.init({ width, height, look: '97' | '2k', canvas?, images?: { name: HTMLImageElement | Canvas }, colors?: { night: '#…', … } })
       look '97' → 16-bit-Farbe mit geordnetem Dithering (RGB565), gröbere Modelle, Texturen bis 256 px
       look '2k' → 32 bit, mehr Polygone, Texturen bis 512 px
     GLX.canvas            die Zeichenfläche (width × height; ohne Glättung hochskalieren)
     GLX.tests             [{ id, name: { de, en }, dur, draw(lt, D, opts) }] — auch GLX.test[id]
     GLX.begin()           Bild beginnen (Zähler auf null)
     test.draw(lt, D, o)   eine Szene zeichnen: reine Funktion der lokalen Zeit lt (Sekunden) und der Dauer D — kein Zustand von Bild zu Bild
     GLX.end({ hud?, flash?, fade? })   Bild abschließen: flash [r, g, b, a] hellt nur die 3D-Szene auf, dann die optionale 2D-Fläche (Canvas in
                           Puffergröße) darüber, fade [r, g, b, a] blendet alles, zum Schluss das Dithering (Look 97)
     GLX.stats.tris        Dreiecke des letzten Bildes (wirklich gezeichnete, Leuchtpunkte zählen als zwei)
     GLX.texCanvas(canvas) Textur aus einer Zeichenfläche (z. B. Schrift), für opts wie plates / gates
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

  const X = {
    canvas: null, gl: null, look: '2k', hi: true, W: 0, H: 0, stats: { tris: 0, draws: 0 }, tests: [], test: {}, C: {}, images: {},
    util: { clamp, lerp, smooth, hash, hex, M }, _setup: [],
    cam: { eye: [0, 0, 0], view: M.id(), proj: M.id(), vp: M.id(), right: [1, 0, 0], up: [0, 1, 0], fwd: [0, 0, -1], fov: 1 },
  };
  let gl, P = {}, fbo, sceneTex, hudTex, white, quadBuf, mirror = false;
  const L = { amb: [1, 1, 1], dir: [0, 1, 0], dirC: [0, 0, 0], pts: [] }, F = { c: [0, 0, 0], a: 0, b: 0 };

  /* ---------- Shader ---------- */
  const NL = 6;
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
  const VS_SPR = `
attribute vec3 aPos; attribute vec2 aUV; attribute vec4 aCol;
uniform mat4 uVP, uView; uniform float uFogA, uFogB;
varying vec2 vUV; varying vec4 vCol;
void main() {
  vUV = aUV;
  float f = 1.0;
  if (uFogB > 0.0) { vec4 vp = uView * vec4(aPos, 1.0); f = clamp((uFogB - length(vp.xyz)) / (uFogB - uFogA), 0.0, 1.0); }
  vCol = aCol * f;
  gl_Position = uVP * vec4(aPos, 1.0);
}`;
  /* Texturen der Leuchtpunkte sind vormultipliziert; Farbe × Deckkraft kommt je Ecke dazu */
  const FS_SPR = `
precision mediump float;
uniform sampler2D uTex; varying vec2 vUV; varying vec4 vCol;
void main() { vec4 t = texture2D(uTex, vUV); gl_FragColor = vec4(t.rgb * vCol.rgb * vCol.a, t.a * vCol.a); }`;
  const VS_POST = `attribute vec2 aPos; varying vec2 vUV; void main() { vUV = aPos * 0.5 + 0.5; gl_Position = vec4(aPos, 0.0, 1.0); }`;
  /* Abschluss: 2D-Fläche darüber, Blende, dann bei Look 97 auf 5-6-5 Bit mit geordnetem Dithering (4×4-Bayer) */
  const FS_POST = `
precision mediump float;
uniform sampler2D uScene, uHud; uniform float uUseHud, uDither; uniform vec4 uFade, uFlash;
varying vec2 vUV;
float b2(vec2 a) { a = floor(a); return fract(a.x / 2.0 + a.y * a.y * 0.75); }
float b4(vec2 a) { return b2(0.5 * a) * 0.25 + b2(a); }
void main() {
  vec3 c = mix(texture2D(uScene, vUV).rgb, uFlash.rgb, uFlash.a);
  if (uUseHud > 0.5) { vec4 h = texture2D(uHud, vUV); c = h.rgb + c * (1.0 - h.a); }
  c = mix(c, uFade.rgb, uFade.a);
  if (uDither > 0.5) { vec3 q = vec3(31.0, 63.0, 31.0); c = floor(c * q + b4(gl_FragCoord.xy)) / q; }
  gl_FragColor = vec4(c, 1.0);
}`;
  function prog(vs, fs, attrs) {
    const mk = (type, src) => { const s = gl.createShader(type); gl.shaderSource(s, src); gl.compileShader(s); if (!gl.getShaderParameter(s, gl.COMPILE_STATUS)) throw new Error('GLX Shader: ' + gl.getShaderInfoLog(s)); return s; };
    const p = gl.createProgram(); gl.attachShader(p, mk(gl.VERTEX_SHADER, vs)); gl.attachShader(p, mk(gl.FRAGMENT_SHADER, fs));
    attrs.forEach((a, i) => gl.bindAttribLocation(p, i, a)); gl.linkProgram(p);
    if (!gl.getProgramParameter(p, gl.LINK_STATUS)) throw new Error('GLX Programm: ' + gl.getProgramInfoLog(p));
    const cache = {}; return { p, u: (n) => (n in cache ? cache[n] : (cache[n] = gl.getUniformLocation(p, n))) };
  }

  /* ---------- Aufbau ---------- */
  const DEF = { orange: '#FF7816', apricot: '#FFB366', signal: '#FF4D1C', ink: '#171310', night: '#0B1026', cream: '#F6F1E8', sky: '#9CC8F2', flow: '#A78BFA', nova: '#38BDF8', buddy: '#F472B6', ivy: '#3DDC84' };
  X.init = (o = {}) => {
    X.W = o.width ?? 960; X.H = o.height ?? 540; X.look = o.look === '97' ? '97' : '2k'; X.hi = X.look === '2k'; X.images = o.images ?? {};
    for (const k of Object.keys(DEF)) X.C[k] = hex((o.colors && o.colors[k]) || DEF[k]);
    const c = o.canvas ?? document.createElement('canvas'); c.width = X.W; c.height = X.H; X.canvas = c;
    gl = X.gl = c.getContext('webgl', { antialias: false, alpha: false, depth: false, stencil: false, preserveDrawingBuffer: true, premultipliedAlpha: false });
    if (!gl) throw new Error('GLX: kein WebGL');
    P = {
      mesh: prog(VS_MESH, FS_MESH, ['aPos', 'aNor', 'aUV', 'aCol']),
      spr: prog(VS_SPR, FS_SPR, ['aPos', 'aUV', 'aCol']),
      post: prog(VS_POST, FS_POST, ['aPos']),
    };
    /* Szene in eine Textur (mit Tiefenpuffer), der Abschluss kopiert sie auf die Zeichenfläche */
    sceneTex = gl.createTexture(); gl.bindTexture(gl.TEXTURE_2D, sceneTex);
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, X.W, X.H, 0, gl.RGBA, gl.UNSIGNED_BYTE, null);
    for (const [k, v] of [[gl.TEXTURE_MIN_FILTER, gl.NEAREST], [gl.TEXTURE_MAG_FILTER, gl.NEAREST], [gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE], [gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE]]) gl.texParameteri(gl.TEXTURE_2D, k, v);
    const rb = gl.createRenderbuffer(); gl.bindRenderbuffer(gl.RENDERBUFFER, rb); gl.renderbufferStorage(gl.RENDERBUFFER, gl.DEPTH_COMPONENT16, X.W, X.H);
    fbo = gl.createFramebuffer(); gl.bindFramebuffer(gl.FRAMEBUFFER, fbo);
    gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0, gl.TEXTURE_2D, sceneTex, 0); gl.framebufferRenderbuffer(gl.FRAMEBUFFER, gl.DEPTH_ATTACHMENT, gl.RENDERBUFFER, rb);
    if (gl.checkFramebufferStatus(gl.FRAMEBUFFER) !== gl.FRAMEBUFFER_COMPLETE) throw new Error('GLX: Framebuffer unvollständig');
    gl.bindFramebuffer(gl.FRAMEBUFFER, null);
    hudTex = gl.createTexture(); gl.bindTexture(gl.TEXTURE_2D, hudTex);
    for (const [k, v] of [[gl.TEXTURE_MIN_FILTER, gl.NEAREST], [gl.TEXTURE_MAG_FILTER, gl.NEAREST], [gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE], [gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE]]) gl.texParameteri(gl.TEXTURE_2D, k, v);
    quadBuf = gl.createBuffer(); gl.bindBuffer(gl.ARRAY_BUFFER, quadBuf); gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 3, -1, -1, 3]), gl.STATIC_DRAW);
    sprBuf = gl.createBuffer(); gl.bindBuffer(gl.ARRAY_BUFFER, sprBuf); gl.bufferData(gl.ARRAY_BUFFER, SB.byteLength, gl.DYNAMIC_DRAW);
    white = X.texCanvas(X.cv(4, 4, (x) => { x.fillStyle = '#fff'; x.fillRect(0, 0, 4, 4); }));
    imgCache.clear();
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
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, mip ? gl.LINEAR_MIPMAP_NEAREST : gl.LINEAR); gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, o.nearest ? gl.NEAREST : gl.LINEAR);
    const wrap = pot && o.repeat ? gl.REPEAT : gl.CLAMP_TO_EDGE; gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, wrap); gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, wrap);
    return { t, w: src.width, h: src.height, aspect: o.aspect ?? src.width / src.height };
  };
  /* Bild aus images als Textur: auf Zweierpotenz verkleinert (Look 97 bis 256 px, sonst 512 px). aspect = Ausschnitt in dieser Proportion
     über die volle Breite, top = 0 … 1 wie weit unten er bei hohen Bildern sitzt. */
  const imgCache = new Map();
  X.imgTex = (key, o = {}) => {
    const id = `${key}|${o.aspect ?? ''}|${o.top ?? 0}|${o.repeat ? 'r' : ''}`; if (imgCache.has(id)) return imgCache.get(id);
    const img = X.images[key]; let tex;
    if (!img || !img.width) tex = Object.assign({}, white, { aspect: o.aspect ?? 1.6, missing: true });
    else {
      const iw = img.naturalWidth || img.width, ih = img.naturalHeight || img.height, asp = o.aspect ?? iw / ih, ch = Math.min(ih, iw / asp), cw = Math.min(iw, ch * asp), sy = (ih - ch) * (o.top ?? 0), sx = (iw - cw) / 2;
      const max = X.hi ? 512 : 256, tw = max, th = asp >= 1.3 ? max / 2 : max;
      tex = X.texCanvas(X.cv(tw, th, (x) => { x.imageSmoothingQuality = 'high'; x.drawImage(img, sx, sy, cw, ch, 0, 0, tw, th); }), { repeat: o.repeat, aspect: asp });
    }
    imgCache.set(id, tex); return tex;
  };

  /* ---------- Geometrie ---------- */
  /* Netz aus Listen: pos (xyz), nor (xyz), uv, col (rgb, sonst weiß), idx. 11 Zahlen je Ecke. */
  X.mesh = (d) => {
    const n = d.pos.length / 3, v = new Float32Array(n * 11);
    for (let i = 0; i < n; i++) {
      v[i * 11] = d.pos[i * 3]; v[i * 11 + 1] = d.pos[i * 3 + 1]; v[i * 11 + 2] = d.pos[i * 3 + 2];
      v[i * 11 + 3] = d.nor ? d.nor[i * 3] : 0; v[i * 11 + 4] = d.nor ? d.nor[i * 3 + 1] : 1; v[i * 11 + 5] = d.nor ? d.nor[i * 3 + 2] : 0;
      v[i * 11 + 6] = d.uv ? d.uv[i * 2] : 0; v[i * 11 + 7] = d.uv ? d.uv[i * 2 + 1] : 0;
      v[i * 11 + 8] = d.col ? d.col[i * 3] : 1; v[i * 11 + 9] = d.col ? d.col[i * 3 + 1] : 1; v[i * 11 + 10] = d.col ? d.col[i * 3 + 2] : 1;
    }
    if (n > 65535) throw new Error('GLX: Netz zu groß');
    const vb = gl.createBuffer(); gl.bindBuffer(gl.ARRAY_BUFFER, vb); gl.bufferData(gl.ARRAY_BUFFER, v, gl.STATIC_DRAW);
    const ib = gl.createBuffer(); gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, ib); gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, new Uint16Array(d.idx), gl.STATIC_DRAW);
    return { vb, ib, n: d.idx.length, tris: d.idx.length / 3 };
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
    /* Säule: Mantel von y = 0 bis h */
    cyl(r, h, side, vr = 4) {
      const pos = [], nor = [], uv = [], idx = [], ring = 4;
      for (let j = 0; j <= ring; j++) for (let i = 0; i <= side; i++) { const a = (i / side) * Math.PI * 2; pos.push(Math.cos(a) * r, (j / ring) * h, Math.sin(a) * r); nor.push(Math.cos(a), 0, Math.sin(a)); uv.push((i / side) * 2, (j / ring) * vr); }
      for (let j = 0; j < ring; j++) for (let i = 0; i < side; i++) { const a = j * (side + 1) + i, b = a + side + 1; idx.push(a, b, a + 1, a + 1, b, b + 1); }
      return X.mesh({ pos, nor, uv, idx });
    },
    /* Ebene in der xz-Fläche (Normale +y), n × n Felder, damit das Licht je Ecke etwas zu tun hat */
    plane(size, n, rep = 1) {
      const pos = [], nor = [], uv = [], idx = [];
      for (let j = 0; j <= n; j++) for (let i = 0; i <= n; i++) { pos.push((i / n - 0.5) * size, 0, (j / n - 0.5) * size); nor.push(0, 1, 0); uv.push((i / n) * rep, (j / n) * rep); }
      for (let j = 0; j < n; j++) for (let i = 0; i < n; i++) { const a = j * (n + 1) + i, b = a + n + 1; idx.push(a, b, a + 1, a + 1, b, b + 1); }
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
  X.clear = (c) => { gl.clearColor(c[0], c[1], c[2], 1); gl.depthMask(true); gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT); };
  /* Punkt in Bildkoordinaten (−1 … 1); null, wenn hinter der Kamera */
  X.project = (p) => { const m = X.cam.vp, w = m[3] * p[0] + m[7] * p[1] + m[11] * p[2] + m[15]; if (w <= 0.001) return null; return [(m[0] * p[0] + m[4] * p[1] + m[8] * p[2] + m[12]) / w, (m[1] * p[0] + m[5] * p[1] + m[9] * p[2] + m[13]) / w, w]; };

  /* ---------- Zeichnen: Netze ---------- */
  const MIR = M.trs([0, 0, 0], [0, 0, 0], [1, -1, 1]);
  const lp = new Float32Array(NL * 3), lc = new Float32Array(NL * 3), lr = new Float32Array(NL);
  X.draw = (mesh, model, m = {}) => {
    const p = P.mesh, u = p.u; gl.useProgram(p.p);
    gl.bindBuffer(gl.ARRAY_BUFFER, mesh.vb); gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, mesh.ib);
    for (let i = 0; i < 4; i++) gl.enableVertexAttribArray(i);
    gl.vertexAttribPointer(0, 3, gl.FLOAT, false, 44, 0); gl.vertexAttribPointer(1, 3, gl.FLOAT, false, 44, 12); gl.vertexAttribPointer(2, 2, gl.FLOAT, false, 44, 24); gl.vertexAttribPointer(3, 3, gl.FLOAT, false, 44, 32);
    const my = mirror ? -1 : 1, c = X.cam;
    gl.uniformMatrix4fv(u('uVP'), false, c.vp); gl.uniformMatrix4fv(u('uView'), false, c.view); gl.uniformMatrix4fv(u('uModel'), false, mirror ? M.mul(MIR, model ?? M.id()) : model ?? M.id());
    gl.uniform3f(u('uEye'), c.eye[0], c.eye[1], c.eye[2]);
    gl.uniform3fv(u('uAmb'), L.amb); gl.uniform3f(u('uDirL'), L.dir[0], L.dir[1] * my, L.dir[2]); gl.uniform3fv(u('uDirC'), L.dirC);
    for (let i = 0; i < NL; i++) { const q = L.pts[i]; lp[i * 3] = q ? q.p[0] : 0; lp[i * 3 + 1] = q ? q.p[1] * my : 0; lp[i * 3 + 2] = q ? q.p[2] : 0; lc[i * 3] = q ? q.c[0] : 0; lc[i * 3 + 1] = q ? q.c[1] : 0; lc[i * 3 + 2] = q ? q.c[2] : 0; lr[i] = q ? q.r : 1; }
    gl.uniform3fv(u('uLP[0]'), lp); gl.uniform3fv(u('uLC[0]'), lc); gl.uniform1fv(u('uLR[0]'), lr);
    const blend = m.blend ?? 'none', tint = m.tint ?? [1, 1, 1], fog = m.fog ?? true;
    gl.uniform3fv(u('uTint'), tint); gl.uniform1f(u('uUnlit'), m.unlit ? 1 : 0); gl.uniform1f(u('uSpec'), m.spec ?? 0);
    gl.uniform1f(u('uFogA'), F.a); gl.uniform1f(u('uFogB'), fog ? F.b : 0); gl.uniform3fv(u('uFogC'), blend === 'add' ? [0, 0, 0] : F.c);
    gl.uniform2fv(u('uUVS'), m.uvS ?? [1, 1]); gl.uniform2fv(u('uUVO'), m.uvO ?? [0, 0]);
    gl.uniform1f(u('uUseTex'), m.tex ? 1 : 0); gl.uniform1f(u('uEnvK'), m.envK ?? 0); gl.uniform1f(u('uEnvAdd'), m.envAdd ?? 0); gl.uniform3fv(u('uEnvTint'), m.envTint ?? [1, 1, 1]); gl.uniform1f(u('uAlpha'), m.alpha ?? 1);
    gl.activeTexture(gl.TEXTURE0); gl.bindTexture(gl.TEXTURE_2D, (m.tex ?? white).t); gl.uniform1i(u('uTex'), 0);
    gl.activeTexture(gl.TEXTURE1); gl.bindTexture(gl.TEXTURE_2D, (m.env ?? white).t); gl.uniform1i(u('uEnvT'), 1);
    if (blend === 'none') gl.disable(gl.BLEND); else { gl.enable(gl.BLEND); gl.blendFunc(gl.SRC_ALPHA, blend === 'add' ? gl.ONE : gl.ONE_MINUS_SRC_ALPHA); }
    if (m.depthTest ?? true) gl.enable(gl.DEPTH_TEST); else gl.disable(gl.DEPTH_TEST);
    gl.depthMask(m.depthWrite ?? blend === 'none');
    const cull = m.cull ?? 'back';
    if (cull === 'none') gl.disable(gl.CULL_FACE); else { gl.enable(gl.CULL_FACE); gl.cullFace(cull === 'front' ? gl.FRONT : gl.BACK); gl.frontFace(mirror ? gl.CW : gl.CCW); }
    gl.drawElements(gl.TRIANGLES, mesh.n, gl.UNSIGNED_SHORT, 0);
    X.stats.tris += mesh.tris; X.stats.draws++;
  };

  /* ---------- Zeichnen: Leuchtpunkte und freie Rechtecke (gesammelt, dann in einem Zug) ---------- */
  const MAXS = 9000, SB = new Float32Array(MAXS * 6 * 9); let sn = 0, sprBuf;
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
    flush(tex, mode = 'add', o = {}) {
      if (!sn) return;
      const p = P.spr, u = p.u; gl.useProgram(p.p);
      gl.bindBuffer(gl.ARRAY_BUFFER, sprBuf); gl.bufferSubData(gl.ARRAY_BUFFER, 0, SB.subarray(0, sn * 9));
      for (let i = 0; i < 3; i++) gl.enableVertexAttribArray(i); gl.disableVertexAttribArray(3);
      gl.vertexAttribPointer(0, 3, gl.FLOAT, false, 36, 0); gl.vertexAttribPointer(1, 2, gl.FLOAT, false, 36, 12); gl.vertexAttribPointer(2, 4, gl.FLOAT, false, 36, 20);
      gl.uniformMatrix4fv(u('uVP'), false, o.screen ? M.id() : X.cam.vp); gl.uniformMatrix4fv(u('uView'), false, X.cam.view);
      gl.uniform1f(u('uFogA'), F.a); gl.uniform1f(u('uFogB'), o.fog && !o.screen ? F.b : 0);
      gl.activeTexture(gl.TEXTURE0); gl.bindTexture(gl.TEXTURE_2D, (tex ?? white).t); gl.uniform1i(u('uTex'), 0);
      gl.enable(gl.BLEND); gl.blendFunc(gl.ONE, mode === 'add' ? gl.ONE : gl.ONE_MINUS_SRC_ALPHA);
      if ((o.depth ?? true) && !o.screen) gl.enable(gl.DEPTH_TEST); else gl.disable(gl.DEPTH_TEST);
      gl.depthMask(false); gl.disable(gl.CULL_FACE);
      gl.drawArrays(gl.TRIANGLES, 0, sn);
      X.stats.tris += sn / 3; X.stats.draws++; sn = 0;
    },
  };

  /* ---------- Bild beginnen und abschließen ---------- */
  X.begin = () => { gl.bindFramebuffer(gl.FRAMEBUFFER, fbo); gl.viewport(0, 0, X.W, X.H); X.stats.tris = 0; X.stats.draws = 0; mirror = false; sn = 0; X.fog([0, 0, 0], 0, 0); X.light({ amb: [1, 1, 1] }); };
  X.end = (o = {}) => {
    gl.bindFramebuffer(gl.FRAMEBUFFER, null); gl.viewport(0, 0, X.W, X.H);
    const p = P.post, u = p.u; gl.useProgram(p.p); gl.disable(gl.DEPTH_TEST); gl.disable(gl.BLEND); gl.disable(gl.CULL_FACE); gl.depthMask(false);
    gl.bindBuffer(gl.ARRAY_BUFFER, quadBuf); gl.enableVertexAttribArray(0); for (let i = 1; i < 4; i++) gl.disableVertexAttribArray(i); gl.vertexAttribPointer(0, 2, gl.FLOAT, false, 8, 0);
    gl.activeTexture(gl.TEXTURE0); gl.bindTexture(gl.TEXTURE_2D, sceneTex); gl.uniform1i(u('uScene'), 0);
    gl.activeTexture(gl.TEXTURE1); gl.bindTexture(gl.TEXTURE_2D, hudTex); gl.uniform1i(u('uHud'), 1);
    if (o.hud) { gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, true); gl.pixelStorei(gl.UNPACK_PREMULTIPLY_ALPHA_WEBGL, true); gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, o.hud); }
    gl.uniform1f(u('uUseHud'), o.hud ? 1 : 0); gl.uniform1f(u('uDither'), o.dither ?? !X.hi ? 1 : 0); gl.uniform4fv(u('uFade'), o.fade ?? [0, 0, 0, 0]); gl.uniform4fv(u('uFlash'), o.flash ?? [0, 0, 0, 0]);
    gl.drawArrays(gl.TRIANGLES, 0, 3);
    gl.activeTexture(gl.TEXTURE0);
  };
  return X;
})();
