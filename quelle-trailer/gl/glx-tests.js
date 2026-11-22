/* GLX — die Szenen („Tests“): eigene 3D-Bilder aus der Welt der Marke (Mond, Nacht, Glaskugeln, Bildschirme mit den Labs),
   gebaut mit den Mitteln der 3D-Benchmarks um 1997 – 2000. Jede Szene ist eine reine Funktion der Zeit: draw(lt, D, opts) —
   Partikel und Bewegungen rechnen aus lt und einer Streufunktion, nichts wird von Bild zu Bild gemerkt.

   Tests (GLX.tests): orbit (Mondhorizont, Sonnenaufgang mit Lens Flare) · tunnel (Tunnelflug, Punktlichter je Ecke) ·
   moon (Mondlandschaft aus Höhenfunktion, viele Polygone, Nebel) · hall (Glaskugeln mit Environment-Map über spiegelndem Boden) ·
   galaxy (Partikel, additive Blende) · screens (Bildschirme mit Texturen aus images) · gold (Goldringe, Environment-Map) ·
   blit (2D: großes Bild scrollt und zoomt, kleine Bilder darüber).
   opts je Test stehen an der Funktion. Texturen entstehen beim Start aus Zufall und Formeln (keine Dateien außer images). */
(() => {
  'use strict';
  const X = window.GLX, { clamp, lerp, smooth, hash, M } = X.util, TAU = Math.PI * 2;
  const T = {}, G = {};
  let C;
  const mulc = (c, k) => [c[0] * k, c[1] * k, c[2] * k];
  const mixc = (a, b, k) => [lerp(a[0], b[0], k), lerp(a[1], b[1], k), lerp(a[2], b[2], k)];

  /* ---------- Zufall mit Wiederholung (kachelbar) ---------- */
  const vn = (x, y, per, seed = 0) => {
    const xi = Math.floor(x), yi = Math.floor(y), fx = x - xi, fy = y - yi, w = (a, b) => hash((((a % per) + per) % per) * 57.3 + (((b % per) + per) % per) * 131.7 + seed * 17.1);
    const sx = fx * fx * (3 - 2 * fx), sy = fy * fy * (3 - 2 * fy); return lerp(lerp(w(xi, yi), w(xi + 1, yi), sx), lerp(w(xi, yi + 1), w(xi + 1, yi + 1), sx), sy);
  };
  const fbm = (x, y, per, seed = 0) => vn(x, y, per, seed) * 0.5 + vn(x * 2, y * 2, per * 2, seed + 1) * 0.25 + vn(x * 4, y * 4, per * 4, seed + 2) * 0.125 + vn(x * 8, y * 8, per * 8, seed + 3) * 0.0625;
  const wrapd = (d) => d - Math.round(d);
  const pix = (w, h, fn) => X.cv(w, h, (x) => { const d = x.createImageData(w, h); for (let j = 0; j < h; j++) for (let i = 0; i < w; i++) { const c = fn(i / w, j / h, i, j), o = (j * w + i) * 4; d.data[o] = c[0] * 255; d.data[o + 1] = c[1] * 255; d.data[o + 2] = c[2] * 255; d.data[o + 3] = (c[3] ?? 1) * 255; } x.putImageData(d, 0, 0); });
  /* Krater als Helligkeit: Mulde dunkel, Rand hell (q = Abstand / Radius) */
  const crater = (q) => (q < 1 ? -0.2 * (1 - q * q) : 0) + 0.16 * Math.exp(-(((q - 1) / 0.22) ** 2));

  /* ---------- Mondlandschaft: Höhe als kachelbare Funktion ---------- */
  const TS = 192;
  const CRAT = Array.from({ length: 18 }, (_, k) => [hash(k * 3.7 + 1), hash(k * 5.3 + 2), 0.03 + 0.055 * hash(k * 9.1 + 3)]);
  function terrH(x, z) {
    const u = x / TS, v = z / TS;
    let h = 2.4 * Math.sin(TAU * (u + 0.13)) * Math.cos(TAU * (v + 0.4)) + 1.4 * Math.sin(TAU * (2 * u + v + 0.7)) + 0.9 * Math.cos(TAU * (3 * v - 2 * u)) + 0.5 * Math.sin(TAU * (5 * u + 4 * v)) + 0.3 * Math.sin(TAU * (9 * u - 7 * v + 0.3));
    for (const [cu, cv, r] of CRAT) { const q = Math.hypot(wrapd(u - cu), wrapd(v - cv)) / r; if (q < 1.7) h += (q < 1 ? -r * TS * 0.2 * (1 - q * q) : 0) + r * TS * 0.07 * Math.exp(-(((q - 1) / 0.22) ** 2)); }
    /* Schneise entlang x = 0: dort bleibt der Boden eben (Flugbahn, Tore) */
    return h * smooth((Math.abs(wrapd(u) * TS) - 5) / 15);
  }
  const SUN = (() => { const d = [0.45, 0.2, -0.87], l = Math.hypot(...d); return d.map((v) => v / l); })();

  /* ---------- Aufbau: Texturen und Netze ---------- */
  X._setup.push(() => {
    C = X.C; const HI = X.hi;
    T.glow = X.texCanvas(pix(64, 64, (u, v) => [1, 1, 1, Math.pow(clamp(1 - Math.hypot(u - 0.492, v - 0.492) * 2), 2.2)]));
    T.ring = X.texCanvas(pix(64, 64, (u, v) => { const d = Math.hypot(u - 0.492, v - 0.492) * 2; return [1, 1, 1, 0.55 * Math.exp(-(((d - 0.8) / 0.07) ** 2)) + 0.08 * clamp(1 - d / 0.8)]; }));
    T.hex = X.texCanvas(X.cv(64, 64, (x) => { x.fillStyle = 'rgba(255,255,255,0.42)'; x.beginPath(); for (let i = 0; i < 6; i++) x.lineTo(32 + Math.cos((i / 6) * TAU) * 27, 32 + Math.sin((i / 6) * TAU) * 27); x.closePath(); x.fill(); x.strokeStyle = 'rgba(255,255,255,0.5)'; x.lineWidth = 2; x.stroke(); }));
    T.streak = X.texCanvas(pix(128, 16, (u, v) => [1, 1, 1, Math.pow(1 - Math.abs(2 * u - 1), 3) * Math.pow(1 - Math.abs(2 * v - 0.94), 2)]));
    /* Wandplatten des Tunnels: versetzte Bleche mit Kante, Nieten, Streifen */
    T.panel = X.texCanvas(pix(128, 128, (u, v, i, j) => {
      const row = Math.floor(j / 32), px = (i + (row % 2) * 32) % 64, py = j % 32;
      let b = 0.4 + 0.12 * hash(Math.floor((i + (row % 2) * 32) / 64) * 3 + row * 7) + (vn(u * 16, v * 16, 16, 5) - 0.5) * 0.14;
      if (px < 2 || py < 2) b += 0.2; if (px > 61 || py > 29) b -= 0.2;
      if (Math.hypot(Math.min(px, 63 - px) - 6, Math.min(py, 31 - py) - 6) < 2) b += 0.2;
      if (row === 2 && py > 12 && py < 17) b -= 0.16;
      return [b, b, b * 1.05, 1];
    }), { repeat: true });
    T.rock = X.texCanvas(pix(128, 128, (u, v) => { let b = 0.62 + (fbm(u * 8, v * 8, 8, 3) - 0.47) * 0.9; for (let k = 0; k < 9; k++) { const r = 0.035 + 0.06 * hash(k * 4.1 + 7); b += crater(Math.hypot(wrapd(u - hash(k * 2.3 + 1)), wrapd(v - hash(k * 6.7 + 2))) / r) * 0.9; } return [b, b, b, 1]; }), { repeat: true });
    T.tile = X.texCanvas(pix(128, 128, (u, v, i, j) => { const px = i % 64, py = j % 64; let b = 0.5 + 0.14 * hash(Math.floor(i / 64) * 5 + Math.floor(j / 64) * 11) + (vn(u * 32, v * 32, 32, 2) - 0.5) * 0.08 + ((px + py) / 128) * 0.12; if (px < 2 || py < 2) b = 0.12; return [b, b, b * 1.06, 1]; }), { repeat: true });
    T.grid = X.texCanvas(pix(64, 64, (u, v, i, j) => { const l = i < 2 || j < 2 ? 1 : 0, n = vn(u * 8, v * 8, 8, 4) * 0.03; return [0.035 + n + l * 0.16, 0.045 + n + l * 0.2, 0.09 + n + l * 0.34, 1]; }), { repeat: true });
    /* Umgebung als Kugel-Abbildung: Nachthimmel, warmes Band am Horizont, dunkler Boden, zwei Lichter */
    const blob = (u, v, cu, cv, r) => Math.exp(-(((u - cu) ** 2 + (v - cv) ** 2) / (r * r)));
    T.env = X.texCanvas(pix(128, 128, (u, vc) => {
      const y = 1 - vc; let c = y > 0.5 ? mixc([0.5, 0.58, 0.85], [0.03, 0.05, 0.16], smooth((y - 0.5) / 0.42)) : mixc([0.2, 0.15, 0.12], [0.02, 0.02, 0.03], smooth((0.5 - y) / 0.3));
      const band = Math.exp(-(((y - 0.5) / 0.035) ** 2)); c = [c[0] + band * 0.9, c[1] + band * 0.7, c[2] + band * 0.45];
      const a = blob(u, y, 0.3, 0.76, 0.07) * 1.3, b = blob(u, y, 0.72, 0.68, 0.045);
      return [c[0] + a + b * 0.5, c[1] + a * 0.92 + b * 0.7, c[2] + a * 0.8 + b, 1];
    }));
    T.envGold = X.texCanvas(pix(128, 128, (u, vc) => {
      const y = 1 - vc; let c = y > 0.55 ? mixc([1, 0.66, 0.16], [1, 0.95, 0.72], smooth((y - 0.55) / 0.4)) : mixc([1, 0.66, 0.16], [0.1, 0.035, 0.0], smooth((0.55 - y) / 0.42));
      const band = Math.exp(-(((y - 0.6) / 0.03) ** 2)) * 0.8 + Math.exp(-(((y - 0.3) / 0.02) ** 2)) * 0.25, a = blob(u, y, 0.34, 0.74, 0.06) * 1.2;
      return [c[0] + band + a, c[1] + band * 0.9 + a, c[2] + band * 0.6 + a * 0.8, 1];
    }));
    /* Mondoberfläche (Zylinderprojektion, in u kachelbar): Rauschen, dunkle Mare, Krater */
    const MC = Array.from({ length: 46 }, (_, k) => [hash(k * 3.1 + 11), 0.08 + 0.84 * hash(k * 7.7 + 12), 0.012 + 0.04 * hash(k * 5.9 + 13) ** 2]);
    T.moon = X.texCanvas(pix(256, 128, (u, v) => {
      let b = 0.56 + (fbm(u * 8, v * 4, 8, 9) - 0.47) * 0.6 - 0.2 * smooth((fbm(u * 4, v * 2, 4, 21) - 0.45) * 5);
      for (const [cu, cv, r] of MC) { const q = Math.hypot(wrapd(u - cu) * 2, v - cv) / r; if (q < 1.7) b += crater(q); }
      return [b, b * 0.97, b * 0.92, 1];
    }), { repeat: true });

    G.sph = X.geo.sphere(HI ? 28 : 14, HI ? 18 : 9);
    G.sphS = X.geo.sphere(HI ? 16 : 10, HI ? 10 : 6);
    G.big = X.geo.sphere(HI ? 72 : 36, HI ? 36 : 18);
    G.quad = X.geo.quad(1, 1);
    G.box = X.geo.box(1, 1, 1);
    G.floor = X.geo.plane(48, HI ? 28 : 14, 12);
    G.cyl = X.geo.cyl(0.75, 10, HI ? 14 : 8, 5);
    G.tori = [X.geo.torus(3.0, 0.17, HI ? 56 : 28, HI ? 10 : 6), X.geo.torus(2.42, 0.15, HI ? 48 : 24, HI ? 10 : 6), X.geo.torus(1.86, 0.13, HI ? 40 : 20, HI ? 10 : 6)];

    /* Tunnel: ein Abschnitt (lokal z von 0 bis −TL) mit einer Rippe; dazu der Leuchtring auf der Rippe */
    {
      const N = HI ? 16 : 10, zs = HI ? [0, 0.3, 0.6, 0.67, 0.74, 0.81, 1] : [0, 0.6, 0.72, 0.84, 1], rs = HI ? [1, 1, 1, 0.9, 0.84, 0.9, 1] : [1, 1, 0.84, 1, 1];
      const pos = [], nor = [], uv = [], col = [], idx = [];
      zs.forEach((zf, j) => { for (let i = 0; i <= N; i++) { const a = (i / N) * TAU, r = TR * rs[j]; pos.push(Math.cos(a) * r, Math.sin(a) * r, -zf * TL); nor.push(-Math.cos(a), -Math.sin(a), 0); uv.push((i / N) * (N / 2), zf * 2); const d = rs[j] < 0.95 ? 0.55 : 1; col.push(d, d, d); } });
      for (let j = 0; j < zs.length - 1; j++) for (let i = 0; i < N; i++) { const a = j * (N + 1) + i, b = a + N + 1; idx.push(a, b, a + 1, a + 1, b, b + 1); }
      G.tun = X.mesh({ pos, nor, uv, col, idx });
      const p2 = [], n2 = [], i2 = [], z0 = -(HI ? 0.705 : 0.69) * TL, z1 = -(HI ? 0.775 : 0.75) * TL, rr = TR * 0.835;
      for (let i = 0; i <= N; i++) { const a = (i / N) * TAU; for (const z of [z0, z1]) { p2.push(Math.cos(a) * rr, Math.sin(a) * rr, z); n2.push(-Math.cos(a), -Math.sin(a), 0); } }
      for (let i = 0; i < N; i++) { const a = i * 2; i2.push(a, a + 1, a + 2, a + 2, a + 1, a + 3); }
      G.tunRing = X.mesh({ pos: p2, nor: n2, idx: i2 });
    }
    /* Mondlandschaft: eine Kachel mit eingebranntem Sonnenlicht (Licht je Ecke, wie eine Lightmap) */
    {
      const N = HI ? 64 : 32, pos = [], nor = [], uv = [], col = [], idx = [], e = TS / N;
      for (let j = 0; j <= N; j++) for (let i = 0; i <= N; i++) {
        const x = (i / N - 0.5) * TS, z = (j / N - 0.5) * TS, h = terrH(x, z), nx = terrH(x - e, z) - terrH(x + e, z), nz = terrH(x, z - e) - terrH(x, z + e), l = Math.hypot(nx, 2 * e, nz);
        pos.push(x, h, z); nor.push(nx / l, (2 * e) / l, nz / l); uv.push((i / N) * 24, (j / N) * 24);
        const ndl = Math.max(0, (nx * SUN[0] + 2 * e * SUN[1] + nz * SUN[2]) / l), k = 0.8 + 0.4 * vn(i * 0.37, j * 0.37, 1e6, 8);
        col.push((0.07 + 1.9 * ndl) * k, (0.085 + 1.62 * ndl) * k, (0.15 + 1.3 * ndl) * k);
      }
      for (let j = 0; j < N; j++) for (let i = 0; i < N; i++) { const a = j * (N + 1) + i, b = a + N + 1; idx.push(a, b, a + 1, a + 1, b, b + 1); }
      G.terr = X.mesh({ pos, nor, uv, col, idx });
    }
  });
  const TR = 3.3, TL = 8;

  /* ---------- gemeinsame Bausteine ---------- */
  /* Sterne: Leuchtpunkte in festem Abstand um das Auge; px = Größe in Bildpunkten */
  function stars(n, k = 1, seed = 0, upper = false) {
    const e = X.cam.eye, d = 300, s1 = (d * Math.tan(X.cam.fov / 2)) / (X.H / 2);
    for (let i = 0; i < n; i++) {
      const u = hash(i * 3.1 + seed) * 2 - 1, a = hash(i * 7.3 + seed + 1) * TAU, r = Math.sqrt(1 - u * u), y = upper ? Math.abs(u) : u, b = (0.3 + 0.7 * hash(i * 1.7 + seed + 2) ** 2) * k, s = (1.1 + 1.5 * hash(i * 5.9 + seed) ** 3) * s1, w = hash(i * 9.7 + seed);
      X.spr.add(e[0] + r * Math.cos(a) * d, e[1] + y * d, e[2] + r * Math.sin(a) * d, s, s, 1 - 0.25 * w, 0.92, 0.8 + 0.2 * w, b);
    }
    X.spr.flush(T.glow, 'add', { depth: false });
  }
  /* Lens Flare: Schein, Streifen und „Geister“ auf der Linie durch die Bildmitte — in den Lichtfarben der Produktfamilie */
  function flare(wp, col, k = 1) {
    const p = X.project(wp); if (!p || k <= 0) return;
    const [x, y] = p, f = k * clamp(1.5 - Math.max(Math.abs(x), Math.abs(y))); if (f <= 0) return;
    const S = X.spr, hi = X.hi ? 1 : 1.35;
    S.ndc(x, y, 0.6 * hi, 0.6 * hi, col[0], col[1], col[2], 0.5 * f); S.ndc(x, y, 0.17, 0.17, 1, 1, 1, 0.95 * f);
    S.ndc(x * -0.3, y * -0.3, 0.05, 0.05, ...C.orange, 0.35 * f); S.ndc(x * -0.9, y * -0.9, 0.1, 0.1, ...C.apricot, 0.22 * f); S.ndc(x * 0.42, y * 0.42, 0.035, 0.035, ...C.sky, 0.4 * f);
    S.flush(T.glow, 'add', { screen: true });
    S.ndc(x, y, 1.7 * hi, 0.045, col[0], col[1], col[2], 0.55 * f); S.ndc(x, y, 0.55, 0.03, col[0], col[1], col[2], 0.3 * f, Math.PI / 2);
    S.flush(T.streak, 'add', { screen: true });
    S.ndc(x * 0.25, y * 0.25, 0.13, 0.13, ...C.nova, 0.16 * f); S.ndc(x * -1.35, y * -1.35, 0.3, 0.3, ...C.buddy, 0.11 * f);
    S.flush(T.ring, 'add', { screen: true });
    S.ndc(x * 0.6, y * 0.6, 0.075, 0.075, ...C.flow, 0.2 * f); S.ndc(x * -0.55, y * -0.55, 0.17, 0.17, ...C.ivy, 0.1 * f);
    S.flush(T.hex, 'add', { screen: true });
  }
  const NIGHT = [0.012, 0.016, 0.045];
  const reg = (id, de, en, dur, draw, extra = {}) => { const t = { id, name: { de, en }, dur, draw, ...extra }; X.tests.push(t); X.test[id] = t; };

  /* ---------- Mondhorizont: ruhige Szene — der Mond dreht sich unter der Kamera weg, die Sonne geht über dem Rand auf ---------- */
  /* opts: sun = 0 … 1 (Stand der Sonne; sonst steigt sie über die Dauer), sunX = seitliche Lage (Standard −0,2), calm = weniger Licht (hinter dem Logo).
     GLX.test.orbit.rise(sunX) nennt den Stand, bei dem die Sonne über den Rand tritt. */
  const ORB_R = 60, ORB_C = [0, -63.2, -30];
  /* Richtung zur Sonne und Abstand des Sehstrahls vom Mondmittelpunkt — die Sonne erscheint, wenn er über den Rand steigt */
  function orbSun(k, sx, eye) {
    const sd = [sx + 0.06 * k, lerp(-0.2, 0.085, k), -1], sl = Math.hypot(...sd), dir = sd.map((v) => v / sl), m = [ORB_C[0] - eye[0], ORB_C[1] - eye[1], ORB_C[2] - eye[2]], tt = m[0] * dir[0] + m[1] * dir[1] + m[2] * dir[2];
    return { dir, dm: Math.hypot(m[0] - dir[0] * tt, m[1] - dir[1] * tt, m[2] - dir[2] * tt) };
  }
  reg('orbit', 'Mondhorizont', 'Lunar horizon', 12, (lt, D, o = {}) => {
    X.clear(NIGHT);
    const R = ORB_R, mc = ORB_C, eye = [Math.sin(lt * 0.11) * 0.8, 0.25 * Math.sin(lt * 0.17), 7];
    X.camera(eye, [0, -1.6, -30], 46, Math.sin(lt * 0.09) * 0.03);
    stars(X.hi ? 620 : 360, 0.9, 3);
    const k = o.sun ?? smooth(lt / (D * 0.8)), { dir, dm } = orbSun(k, o.sunX ?? -0.2, eye), sun = [eye[0] + dir[0] * 320, eye[1] + dir[1] * 320, eye[2] + dir[2] * 320];
    const vis = smooth((dm - R) / 1.1 + 0.5), dawn = smooth((dm - R + 9) / 9);
    const calm = o.calm ? 0.6 : 1;
    /* Schein hinter dem Rand, schon bevor die Sonne zu sehen ist */
    X.spr.add(sun[0], sun[1], sun[2], 120, 48, 1, 0.55, 0.22, 0.4 * dawn * calm); X.spr.add(sun[0], sun[1], sun[2], 48, 48, 1, 0.8, 0.55, 0.5 * dawn * vis * calm); X.spr.flush(T.glow, 'add', { depth: false });
    X.light({ amb: [0.1, 0.115, 0.19], dir, dirC: mulc([1.7, 1.4, 1.05], 0.35 + 0.65 * dawn), pts: [{ p: [-60, 26, 60], c: [0.7, 0.76, 1.05], r: 300 }] });
    /* Achse des Mondes quer (Pole links und rechts), Drehung zur Kamera hin */
    X.draw(G.big, M.mul(M.trs(mc, [lt * 0.022 + 1, 0, 0], R), M.trs([0, 0, 0], [0, 0.3, Math.PI / 2], 1)), { tex: T.moon, uvS: [3, 2], spec: 0 });
    flare(sun, [1, 0.74, 0.42], vis * calm);
  }, { rise: (sunX = -0.2) => { let a = 0, b = 1; for (let i = 0; i < 24; i++) { const m = (a + b) / 2; if (orbSun(m, sunX, [0, 0, 7]).dm > ORB_R) b = m; else a = m; } return b; } });

  /* ---------- Tunnelflug ---------- */
  /* opts: speed (Einheiten/s), pulse 0 … 1 (Helligkeit der Leuchtringe, z. B. auf den Schlag), plates [{ tex, t, big }] — Tafeln, die zur Zeit t die Kamera erreichen */
  const tunC = (z) => [Math.sin(z * 0.045) * 2.2 + Math.sin(z * 0.021 + 1) * 1.4, Math.cos(z * 0.038) * 1.3 + Math.sin(z * 0.017) * 0.8];
  const TUNV = 14;
  reg('tunnel', 'Tunnelflug', 'Tunnel flight', 14, (lt, D, o = {}) => {
    const v = o.speed ?? TUNV, s = v * lt, zc = -s, c0 = tunC(zc), c1 = tunC(zc - 7), pal = [C.orange, C.flow, C.nova, C.buddy, C.ivy], pulse = o.pulse ?? 0.75 + 0.25 * Math.sin(lt * 5);
    X.clear([0, 0, 0]); X.fog([0, 0, 0], 18, X.hi ? 112 : 84);
    X.camera([c0[0] + Math.sin(lt * 0.9) * 0.5, c0[1] + Math.cos(lt * 0.7) * 0.35, zc], [c1[0], c1[1], zc - 7], 68, (tunC(zc - 12)[0] - c0[0]) * 0.1 + Math.sin(lt * 0.5) * 0.08);
    const k0 = Math.floor(s / TL) - 1, K = X.hi ? 15 : 11, pts = [];
    /* Punktlichter: die beleuchteten Rippen in der Nähe (jede dritte), Farbe nach Abschnitt */
    for (let k = k0; k < k0 + 9 && pts.length < 6; k++) if (((k % 3) + 3) % 3 === 0) { const z = -k * TL - 0.74 * TL, c = tunC(z); pts.push({ p: [c[0], c[1], z], c: mulc(pal[(((k / 3) % 5) + 5) % 5], 1.3 * pulse), r: 14 }); }
    X.light({ amb: [0.14, 0.145, 0.18], dirC: [0, 0, 0], pts });
    for (let k = k0; k < k0 + K; k++) {
      const z0 = -k * TL, a = tunC(z0), b = tunC(z0 - TL), m = M.id(); m[8] = -(b[0] - a[0]) / TL; m[9] = -(b[1] - a[1]) / TL; m[12] = a[0]; m[13] = a[1]; m[14] = z0;
      X.draw(G.tun, m, { tex: T.panel, cull: 'none', tint: [0.95, 0.9, 0.86] });
      const lit = ((k % 3) + 3) % 3 === 0, col = lit ? mulc(pal[(((k / 3) % 5) + 5) % 5], 0.55 + 0.75 * pulse) : [0.1, 0.1, 0.12];
      X.draw(G.tunRing, m, { unlit: true, tint: col, cull: 'none' });
    }
    /* Dunst an den Leuchtringen, Staub im Flug */
    for (const q of pts) X.spr.add(q.p[0], q.p[1], q.p[2], TR * 1.7, TR * 1.7, q.c[0], q.c[1], q.c[2], 0.13 * (X.hi ? 1 : 1.5));
    const n = X.hi ? 150 : 80;
    for (let i = 0; i < n; i++) { const rel = -110 + ((i * (120 / n) + hash(i) * 5 + s) % 120), z = zc + rel, c = tunC(z), a = hash(i * 3.3) * TAU, r = TR * (0.15 + 0.6 * hash(i * 7.1)), sz = 0.03 + 0.05 * hash(i * 2.9); X.spr.add(c[0] + Math.cos(a) * r, c[1] + Math.sin(a) * r, z, sz, sz, 1, 0.93, 0.82, 0.7); }
    X.spr.flush(T.glow, 'add', { fog: true });
    /* Tafeln (z. B. Schrift): stehen quer im Tunnel, die fernste zuerst */
    const pl = (o.plates ?? []).map((p, i) => ({ ...p, i, z: -v * p.t - 2.4 })).filter((p) => p.z - zc < -1.2 && p.z - zc > -(X.hi ? 105 : 80)).sort((a, b) => a.z - b.z);
    for (const p of pl) {
      const c = tunC(p.z), h = p.big ? 1.55 : 0.62, w = h * p.tex.aspect, an = hash(p.i * 3.7) * TAU, ox = p.big ? 0 : Math.cos(an) * 1.75, oy = p.big ? 0 : Math.sin(an) * 1.75 * (Math.sin(an) > 0 ? 1 : 0.55), x = c[0] + ox, y = c[1] + oy, d = zc - p.z, al = clamp((d - 1.2) / 2.2);
      X.spr.quad([x - w / 2, y - h / 2, p.z, x + w / 2, y - h / 2, p.z, x + w / 2, y + h / 2, p.z, x - w / 2, y + h / 2, p.z], 1, 1, 1, al);
      X.spr.flush(p.tex, 'alpha', { fog: true });
    }
  }, { speed: TUNV });

  /* ---------- Mondlandschaft ---------- */
  /* opts: pos = zurückgelegte Strecke (sonst 22 Einheiten/s), gates [{ tex, z }] — Tore mit Tafel bei Strecke z, lights = Lauflichter an der Schneise
     (Standard an), aim = Höhe des Blickziels 30 Einheiten voraus (Standard 2,5; kleiner = Blick nach unten, der Horizont steigt im Bild) */
  reg('moon', 'Mondlandschaft', 'Lunar terrain', 16, (lt, D, o = {}) => {
    const s = o.pos ?? 22 * lt, fogC = [0.02, 0.03, 0.075];
    X.clear(fogC); X.fog(fogC, 34, X.hi ? 165 : 120);
    const eye = [Math.sin(s * 0.021) * 1.3, 2.05 + 0.14 * Math.sin(lt * 1.3), -s];
    X.camera(eye, [Math.sin((s + 30) * 0.021) * 0.7 + 3.2, o.aim ?? 2.5, -s - 30], 58, Math.cos(s * 0.021) * 0.05);
    stars(X.hi ? 420 : 240, 0.85, 9, true);
    const sun = [eye[0] + SUN[0] * 330, eye[1] + SUN[1] * 330, eye[2] + SUN[2] * 330];
    X.spr.add(sun[0], sun[1], sun[2], 165, 57, 1, 0.5, 0.2, 0.34); X.spr.add(sun[0], sun[1], sun[2], 44, 44, 1, 0.82, 0.56, 0.6); X.spr.flush(T.glow, 'add', { depth: false });
    const tx = Math.round(eye[0] / TS), tz = Math.round(eye[2] / TS);
    for (let j = 0; j >= -1; j--) for (let i = -1; i <= 1; i++) X.draw(G.terr, M.trs([(tx + i) * TS, 0, (tz + j) * TS]), { tex: T.rock, unlit: true });
    /* Tore: zwei Pfeiler, ein Balken, dazwischen die Tafel */
    X.light({ amb: [0.1, 0.11, 0.18], dir: SUN, dirC: [1.5, 1.25, 0.95] });
    const gates = (o.gates ?? []).filter((q) => q.z - s > -2 && q.z - s < (X.hi ? 170 : 125)).sort((a, b) => b.z - a.z);
    for (const q of gates) {
      for (const sx of [-1, 1]) X.draw(G.box, M.trs([sx * 4.7, 3.3, -q.z], [0, 0, 0], [0.55, 6.6, 0.55]), { tex: T.panel, tint: [0.8, 0.78, 0.76] });
      X.draw(G.box, M.trs([0, 6.75, -q.z], [0, 0, 0], [9.95, 0.42, 0.55]), { tex: T.panel, tint: [0.8, 0.78, 0.76], uvS: [4, 0.5] });
    }
    /* Lauflichter links und rechts der Schneise: der helle Punkt läuft nach vorn */
    if (o.lights ?? true) {
      const m0 = Math.floor(s / 12);
      for (let m = m0; m < m0 + (X.hi ? 13 : 9); m++) { const ph = (((m * 0.14 - lt * 1.4) % 1) + 1) % 1, b = 0.25 + 0.75 * Math.pow(1 - ph, 5); for (const sx of [-1, 1]) X.spr.add(sx * 6, 0.35, -m * 12, 0.55, 0.55, C.orange[0], C.orange[1], C.orange[2], b); }
    }
    for (const q of gates) for (const sx of [-1, 1]) X.spr.add(sx * 4.7, 6.9, -q.z + 0.3, 1.5, 1.5, C.orange[0], C.orange[1], C.orange[2], 0.7);
    X.spr.flush(T.glow, 'add', { fog: true });
    for (const q of gates) {
      const w = 8.2, h = w / q.tex.aspect, y = 4.55, z = -q.z + 0.05, d = q.z - s, al = clamp((d + 1.5) / 3);
      X.spr.quad([-w / 2, y - h / 2, z, w / 2, y - h / 2, z, w / 2, y + h / 2, z, -w / 2, y + h / 2, z], 1, 1, 1, al); X.spr.flush(q.tex, 'alpha', { fog: true });
    }
    flare(sun, [1, 0.76, 0.46], 0.9);
  });

  /* ---------- Glaskugeln: Halle mit spiegelndem Boden, farbige Punktlichter ---------- */
  /* opts: row = fünf Kugeln in einer Reihe, jede unter ihrem eigenen Licht (Produktfamilie); colors = Lichtfarben */
  reg('hall', 'Glaskugeln', 'Glass spheres', 14, (lt, D, o = {}) => {
    const bgc = [0.01, 0.012, 0.03], cols = o.colors ?? [C.orange, C.flow, C.nova, C.buddy, C.ivy], row = !!o.row;
    X.clear(bgc); X.fog(bgc, 16, 50);
    if (row) X.camera([Math.sin(lt * 0.22) * 3.6, 2.5 + 0.3 * Math.sin(lt * 0.4), 12.2], [0, 1.45, 0], 48);
    else { const a = 0.5 + lt * 0.15; X.camera([Math.sin(a) * 9.6, 3.1 + Math.sin(lt * 0.37) * 0.9, Math.cos(a) * 9.6], [0, 1.8, 0], 56); }
    const sph = row ? cols.slice(0, 5).map((_, k) => ({ p: [(k - 2) * 3.1, 1.5 + 0.12 * Math.sin(lt * 1.6 + k * 1.3), 0], r: 1.12 })) : [{ p: [0, 2.35 + 0.2 * Math.sin(lt * 0.9), 0], r: 1.9 }].concat([0, 1, 2, 3].map((k) => ({ p: [Math.cos(k * TAU / 4 + 0.6) * 5.2, 1.35 + 0.25 * Math.sin(lt * 1.2 + k * 2), Math.sin(k * TAU / 4 + 0.6) * 5.2], r: 1.05 })));
    const pts = row ? sph.map((q, k) => ({ p: [q.p[0], 3.9 + 0.35 * Math.sin(lt * 2 + k), 1.6], c: mulc(cols[k], 1.9), r: 6.8 }))
      : [0, 1, 2, 3, 4].map((k) => ({ p: [Math.cos(lt * 0.6 + (k * TAU) / 5) * (6.4 + Math.sin(lt * 0.4 + k) * 1.5), 2.6 + Math.sin(lt * 0.83 + k * 1.9) * 1.5, Math.sin(lt * 0.6 + (k * TAU) / 5) * (6.4 + Math.cos(lt * 0.3 + k) * 1.5)], c: mulc(cols[k], 1.7), r: 11.5 }));
    X.light({ amb: [0.045, 0.05, 0.085], dir: [-0.4, 1, 0.3], dirC: [0.16, 0.18, 0.26], pts });
    const things = () => {
      for (const sx of [-1, 1]) for (const z of [-15, -5, 5, 15]) X.draw(G.cyl, M.trs([sx * 12.5, 0, z]), { tex: T.panel, tint: [0.9, 0.86, 0.82] });
      sph.forEach((q, k) => {
        X.draw(G.sphS, M.trs(q.p, [0.3, lt * 0.25 + k, 0.2], q.r * 0.56), { tex: T.moon, uvS: [2, 1] });
        X.draw(G.sph, M.trs(q.p, [0, 0, 0], q.r), { env: T.env, envK: 1, alpha: X.hi ? 0.55 : 0.7, blend: 'add', spec: 1.2 });
      });
    };
    X.mirror(true); things(); X.mirror(false);
    X.draw(G.floor, M.id(), { tex: T.tile, alpha: 0.8, blend: 'alpha', depthWrite: true });
    things();
    for (const q of pts) { X.spr.add(q.p[0], q.p[1], q.p[2], 0.9, 0.9, q.c[0], q.c[1], q.c[2], 0.5); X.spr.add(q.p[0], q.p[1], q.p[2], 0.22, 0.22, 1, 1, 1, 0.9); X.spr.add(q.p[0], -q.p[1], q.p[2], 0.9, 0.9, q.c[0], q.c[1], q.c[2], 0.12); }
    X.spr.flush(T.glow, 'add', { fog: true });
  });

  /* ---------- Partikel-Galaxie ---------- */
  /* opts: dist = Abstand der Kamera (Standard 30), side = Motiv seitlich versetzen (> 0 nach rechts) */
  reg('galaxy', 'Partikel-Galaxie', 'Particle galaxy', 14, (lt, D, o = {}) => {
    X.clear([0.008, 0.01, 0.03]);
    const a = 0.4 + lt * 0.07, tilt = 0.48 + 0.12 * Math.sin(lt * 0.21), d = (o.dist ?? 30) - lt * 0.25;
    const sd = o.side ?? 0;
    X.camera([Math.sin(a) * d * Math.cos(tilt), Math.sin(tilt) * d, Math.cos(a) * d * Math.cos(tilt)], [-Math.cos(a) * sd, -0.6, Math.sin(a) * sd], 50);
    stars(X.hi ? 380 : 220, 0.6, 17);
    const n = X.hi ? 6000 : 2400, core = [1, 0.92, 0.78], mid = [1, 0.5, 0.13], out = [0.42, 0.48, 1], bst = X.hi ? 1 : 1.5;
    for (let i = 0; i < n; i++) {
      const r = 0.5 + 15.5 * Math.pow(hash(i), 0.72), th = (i % 2) * Math.PI + r * 0.44 + (hash(i * 1.3 + 5) - 0.5) * (1.9 - r * 0.07) + lt * (0.5 / (0.7 + r * 0.24)), y = (hash(i * 2.7 + 1) - 0.5) * 1.7 * Math.exp(-r * 0.17);
      const t = r / 16, c = t < 0.3 ? mixc(core, mid, t / 0.3) : mixc(mid, out, (t - 0.3) / 0.7), s = (0.07 + 0.2 * hash(i * 4.1 + 2) ** 2) * bst, hot = hash(i * 6.3) > 0.985;
      X.spr.add(Math.cos(th) * r, y, Math.sin(th) * r, hot ? s * 2.2 : s, hot ? s * 2.2 : s, hot ? 0.75 : c[0], hot ? 0.9 : c[1], hot ? 1 : c[2], hot ? 0.9 : 0.5);
    }
    X.spr.add(0, 0, 0, 4.2, 4.2, 1, 0.9, 0.72, 0.6); X.spr.add(0, 0, 0, 9, 9, 1, 0.5, 0.15, 0.22);
    X.spr.flush(T.glow, 'add', { depth: false });
  });

  /* ---------- Bildschirme: Bilder als Texturen, links und rechts der Flugbahn, glänzender Boden ---------- */
  /* opts: images = Liste von Namen aus GLX.images oder { key, aspect, top }; der Flug reicht in D einmal an allen vorbei.
     row = alle Bildschirme rechts der Bahn (die linke Bildhälfte bleibt frei, z. B. für Text) statt abwechselnd links und rechts.
     GLX.test.screens.index(lt, D, n) nennt das Bild, das gerade vorn ist. */
  const SP = 7.2, scrZ = (lt, D, n) => 9 - (lt / D) * (n * SP + 3);
  reg('screens', 'Bildschirme', 'Screens', 16, (lt, D, o = {}) => {
    const list = (o.images ?? []).map((q) => (typeof q === 'string' ? { key: q } : q)), n = Math.max(1, list.length), fogC = [0.014, 0.018, 0.045];
    X.clear(fogC); X.fog(fogC, 12, X.hi ? 60 : 46);
    const z = scrZ(lt, D, n), row = !!o.row;
    if (row) X.camera([-1.6 + Math.sin(lt * 0.5) * 0.3, 2.5 + 0.12 * Math.sin(lt * 0.8), z], [2.2, 2.35, z - 10], 56, Math.sin(lt * 0.4) * 0.025);
    else X.camera([Math.sin(lt * 0.5) * 0.55, 2.35 + 0.12 * Math.sin(lt * 0.8), z], [Math.sin(lt * 0.5 + 0.8) * 1.1, 2.3, z - 10], 56, Math.sin(lt * 0.4) * 0.03);
    stars(X.hi ? 200 : 120, 0.5, 23, true);
    X.light({ amb: [0.3, 0.3, 0.36] });
    const scr = list.map((q, k) => { const side = row || k % 2 ? 1 : -1, tex = X.imgTex(q.key, { aspect: q.aspect ?? 1.6, top: q.top ?? 0 }), h = Math.min(6.2 / tex.aspect, 4.6), w = h * tex.aspect; return { tex, w, h, p: [side * ((row ? 1.9 : 3.3) + w / 2), 0.5 + h / 2 + 0.25 * Math.sin(k * 2.1), -k * SP], ry: -side * (row ? 0.72 : 0.5) }; }).filter((q) => q.p[2] < z + 4 && q.p[2] > z - (X.hi ? 62 : 48)).reverse();
    const things = () => { for (const q of scr) { X.draw(G.quad, M.trs([q.p[0], q.p[1], q.p[2] - 0.04], [0, q.ry, 0], [q.w + 0.22, q.h + 0.22, 1]), { unlit: true, tint: mulc(C.apricot, 0.5), cull: 'none', depthWrite: false }); X.draw(G.quad, M.trs(q.p, [0, q.ry, 0], [q.w, q.h, 1]), { tex: q.tex, unlit: true, cull: 'none' }); } };
    X.mirror(true); things(); X.mirror(false);
    X.draw(G.floor, M.trs([0, 0, Math.round(z / 4) * 4 - 16]), { tex: T.grid, unlit: true, alpha: 0.74, blend: 'alpha', depthWrite: true });
    things();
    for (const q of scr) X.spr.add(q.p[0] * 1.25, q.p[1], q.p[2] - 1.2, q.w * 0.9, q.h * 1.1, C.orange[0], C.orange[1], C.orange[2], 0.1);
    X.spr.flush(T.glow, 'add', { fog: true });
  }, { index: (lt, D, n) => clamp(Math.round((6 - scrZ(lt, D, Math.max(1, n))) / SP), 0, Math.max(0, n - 1)) });

  /* ---------- Goldringe: drei ineinander drehende Ringe mit Environment-Map, Funken ---------- */
  /* opts: side = Motiv seitlich versetzen (> 0 nach rechts) */
  reg('gold', 'Goldringe', 'Gold rings', 12, (lt, D, o = {}) => {
    const bgc = [0.022, 0.014, 0.012];
    X.clear(bgc); X.fog(bgc, 0, 0);
    const a = 0.3 + lt * 0.21;
    const sd = o.side ?? 0;
    X.camera([Math.sin(a) * 9.4, 1.6 + Math.sin(lt * 0.3) * 1.1, Math.cos(a) * 9.4], [-Math.cos(a) * sd, 0, Math.sin(a) * sd], 48);
    stars(X.hi ? 260 : 150, 0.5, 31);
    X.light({ amb: [0.25, 0.17, 0.08], dir: [0.4, 0.8, 0.5], dirC: [1.2, 1.0, 0.7], pts: [{ p: [0, 0, 0], c: [2.2, 1.5, 0.7], r: 7 }] });
    const rot = [[lt * 0.9, lt * 0.31, 0.2], [lt * 0.52 + 1, 0.4, lt * 1.07], [0.6, lt * 1.33, lt * 0.71]];
    G.tori.forEach((t, k) => X.draw(t, M.trs([0, 0, 0], rot[k]), { env: T.envGold, envK: 0.82, tint: [1, 0.74, 0.3], spec: 1.4 }));
    X.draw(G.sphS, M.trs([0, 0, 0], [0, lt, 0], 0.5), { unlit: true, tint: [1, 0.86, 0.6] });
    const n = X.hi ? 420 : 200;
    for (let i = 0; i < n; i++) { const u = hash(i * 3.3) * 2 - 1, an = hash(i * 7.7) * TAU + lt * 0.2, r0 = Math.sqrt(1 - u * u), ph = (hash(i * 1.9) + lt * (0.1 + 0.16 * hash(i * 5.3))) % 1, r = 0.6 + ph * 6.5, s = 0.035 + 0.07 * hash(i * 2.2); X.spr.add(r0 * Math.cos(an) * r, u * r, r0 * Math.sin(an) * r, s, s, 1, 0.74, 0.34, Math.sin(Math.PI * ph) * 0.9); }
    X.spr.add(0, 0, 0, 1.9, 1.9, 1, 0.72, 0.3, 0.75); X.spr.add(0, 0, 0, 5.5, 5.5, 1, 0.5, 0.14, 0.2);
    X.spr.flush(T.glow, 'add');
    flare([0, 0, 0], [1, 0.72, 0.36], 0.55);
  });

  /* ---------- 2D-Test: ein großes Bild scrollt und zoomt bildfüllend, kleinere Bilder ziehen als Flächen darüber ---------- */
  /* opts: images = Namen aus GLX.images (das erste füllt das Bild), top = Ausschnitt des großen Bildes (0 … 1) */
  reg('blit', '2D-Bildlauf', '2D blit', 12, (lt, D, o = {}) => {
    const list = o.images ?? [], asp = X.W / X.H;
    X.clear([0, 0, 0]);
    if (!list.length) return;
    const big = X.imgTex(list[0], { aspect: 1, top: o.top ?? 0, repeat: true }), zoom = 0.62 + 0.3 * Math.sin(lt * 0.7), cu = 0.5 + 0.22 * Math.sin(lt * 0.31), cv = 0.5 + lt * 0.11, hw = (zoom * asp) / 2 / 1.25, hv = zoom / 2;
    X.spr.ndc(0, 0, asp, 1, 0.82, 0.82, 0.86, 1, 0.1 * Math.sin(lt * 0.45), [cu - hw, cv - hv, cu + hw, cv + hv]);
    X.spr.flush(big, 'alpha', { screen: true });
    list.slice(1).forEach((key, k) => {
      const tex = X.imgTex(key, { aspect: 1.6 }), ph = lt * (0.5 + 0.13 * k) + k * 1.9, s = 0.34 + 0.12 * Math.sin(lt * 1.1 + k * 2.3), x = Math.sin(ph) * (1 - s * 0.5), y = Math.cos(ph * 0.77 + k) * (1 - s);
      X.spr.ndc(x, y, s * 1.6 + 0.02, s + 0.02, 1, 0.47, 0.09, 1); X.spr.flush(null, 'alpha', { screen: true });
      X.spr.ndc(x, y, s * 1.6, s, 1, 1, 1, 1); X.spr.flush(tex, 'alpha', { screen: true });
    });
  });
})();
