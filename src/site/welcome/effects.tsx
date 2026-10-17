'use client';

import { useEffect, useRef, useState } from 'react';
import styles from './welcome.module.css';

/**
 * Weitere Welcome-Effekte (Wunsch vom 17.10.2026): Risse, Brennen, Countdown-Tür. Gezeichnet auf Canvas über der schon
 * gerenderten neuen Startseite; das Bild der alten Website wird wie object-fit: cover, oben ausgerichtet, gezeichnet.
 */

type Img = HTMLImageElement;

function useImage(src: string) {
  const [img, setImg] = useState<Img | null>(null);
  useEffect(() => {
    const im = new Image();
    im.onload = () => setImg(im);
    im.src = src;
  }, [src]);
  return img;
}

/** Canvas in Bildschirmgröße (scharf bis 2× DPR), liefert Kontext in CSS-Pixeln. */
function fitCanvas(cv: HTMLCanvasElement) {
  const dpr = Math.min(2, window.devicePixelRatio || 1);
  const W = window.innerWidth;
  const H = window.innerHeight;
  cv.width = Math.round(W * dpr);
  cv.height = Math.round(H * dpr);
  const g = cv.getContext('2d')!;
  g.setTransform(dpr, 0, 0, dpr, 0, 0);
  return { g, W, H };
}

function drawCover(g: CanvasRenderingContext2D, im: Img, W: number, H: number) {
  const s = Math.max(W / im.naturalWidth, H / im.naturalHeight);
  const bw = im.naturalWidth * s;
  g.drawImage(im, (W - bw) / 2, 0, bw, im.naturalHeight * s);
}

/** Deterministischer Zufall (gleiche Risse bei jedem Neuzeichnen). */
function rng(seed: number) {
  let s = seed >>> 0;
  return () => (s = (s * 1664525 + 1013904223) >>> 0) / 4294967296;
}

/* ---------------------------------------------------------------------------------------------- Risse --------- */

/**
 * Risse: vom Einschlagpunkt laufen Risse sternförmig aus (0–0,9 s), die Seite zittert kurz, dann brechen die Scherben
 * heraus und fallen (1,1–2,6 s) — darunter die neue Seite.
 */
export function Cracks({ src }: { src: string }) {
  const ref = useRef<HTMLCanvasElement>(null);
  const im = useImage(src);
  useEffect(() => {
    const cv = ref.current;
    if (!cv || !im) return;
    const { g, W, H } = fitCanvas(cv);
    const R = rng(7);
    const cx = W * 0.52;
    const cy = H * 0.42;
    const N = 16;
    const rings = [0, 0.09, 0.22, 0.42, 0.75, 1.6].map((f) => f * Math.hypot(W, H));
    // Radiale Risse als Punktlisten je Ring (leicht verwackelt)
    const rad = Array.from({ length: N }, (_, k) => {
      const a0 = (k / N) * Math.PI * 2 + R() * 0.25;
      return rings.map((r, j) => {
        const a = a0 + (j ? (R() - 0.5) * 0.18 : 0);
        const rr = r * (j ? 0.9 + R() * 0.2 : 1);
        return [cx + Math.cos(a) * rr, cy + Math.sin(a) * rr] as [number, number];
      });
    });
    // Scherben zwischen zwei Radialen und zwei Ringen
    const shards: { poly: [number, number][]; c: [number, number]; vx: number; vy: number; vr: number; delay: number }[] = [];
    for (let k = 0; k < N; k++)
      for (let j = 0; j < rings.length - 1; j++) {
        const a = rad[k];
        const b = rad[(k + 1) % N];
        const poly: [number, number][] = [a[j], a[j + 1], b[j + 1], b[j]];
        const c: [number, number] = [(a[j][0] + b[j + 1][0]) / 2, (a[j][1] + b[j + 1][1]) / 2];
        const dx = c[0] - cx;
        const dy = c[1] - cy;
        const d = Math.hypot(dx, dy) || 1;
        shards.push({
          poly,
          c,
          vx: (dx / d) * (60 + R() * 120),
          vy: (dy / d) * 40 - 80 * R(),
          vr: (R() - 0.5) * 2.4,
          delay: j * 0.09 + R() * 0.12,
        });
      }
    const t0 = performance.now();
    let raf = 0;
    const frame = (now: number) => {
      const t = (now - t0) / 1000;
      g.clearRect(0, 0, W, H);
      if (t < 1.1) {
        const shake = t > 0.85 ? Math.sin(t * 90) * 3 : 0;
        g.save();
        g.translate(shake, 0);
        drawCover(g, im, W, H);
        const grow = Math.min(1, t / 0.9);
        g.lineCap = 'round';
        for (const pts of rad) {
          const total = pts.length - 1;
          const upto = grow * total;
          for (const [col, w, off] of [
            ['rgba(255,255,255,0.75)', 1, 1],
            ['rgba(10,14,22,0.85)', 1.6, 0],
          ] as const) {
            g.strokeStyle = col;
            g.lineWidth = w;
            g.beginPath();
            g.moveTo(pts[0][0] + off, pts[0][1] + off);
            for (let i = 1; i <= Math.ceil(upto); i++) {
              const f = Math.min(1, upto - (i - 1));
              const x = pts[i - 1][0] + (pts[i][0] - pts[i - 1][0]) * f;
              const y = pts[i - 1][1] + (pts[i][1] - pts[i - 1][1]) * f;
              g.lineTo(x + off, y + off);
            }
            g.stroke();
          }
        }
        // Ringrisse, sobald die Radialen weit genug sind
        g.strokeStyle = 'rgba(10,14,22,0.7)';
        g.lineWidth = 1.2;
        for (let j = 1; j < 4; j++) {
          if (grow * (rings.length - 1) < j + 0.5) continue;
          g.beginPath();
          rad.forEach((pts, k) => (k ? g.lineTo(pts[j][0], pts[j][1]) : g.moveTo(pts[j][0], pts[j][1])));
          g.closePath();
          g.stroke();
        }
        // Einschlag
        const rg = g.createRadialGradient(cx, cy, 0, cx, cy, 40);
        rg.addColorStop(0, 'rgba(255,255,255,0.9)');
        rg.addColorStop(1, 'rgba(255,255,255,0)');
        g.fillStyle = rg;
        g.fillRect(cx - 40, cy - 40, 80, 80);
        g.restore();
      } else {
        for (const s of shards) {
          const tt = Math.max(0, t - 1.1 - s.delay);
          const dx = s.vx * tt;
          const dy = s.vy * tt + 0.5 * 1800 * tt * tt;
          if (s.c[1] + dy > H + 400) continue;
          g.save();
          g.translate(s.c[0] + dx, s.c[1] + dy);
          g.rotate(s.vr * tt);
          g.translate(-s.c[0], -s.c[1]);
          g.beginPath();
          s.poly.forEach(([x, y], i) => (i ? g.lineTo(x, y) : g.moveTo(x, y)));
          g.closePath();
          g.clip();
          drawCover(g, im, W, H);
          g.strokeStyle = 'rgba(255,255,255,0.5)';
          g.lineWidth = 1;
          g.stroke();
          g.restore();
        }
      }
      if (t < 2.7) raf = requestAnimationFrame(frame);
    };
    raf = requestAnimationFrame(frame);
    return () => cancelAnimationFrame(raf);
  }, [im]);
  return <canvas ref={ref} aria-hidden className={styles.pixel} />;
}

/* ---------------------------------------------------------------------------------------------- Brennen ------- */

/**
 * Brennen: von zwei Glutpunkten frisst sich eine Feuerkante durch die alte Seite — verkohlter Rand, glühende Kante,
 * aufsteigende Funken; dahinter die neue Seite.
 */
export function Burn({ src }: { src: string }) {
  const ref = useRef<HTMLCanvasElement>(null);
  const im = useImage(src);
  useEffect(() => {
    const cv = ref.current;
    if (!cv || !im) return;
    const { g, W, H } = fitCanvas(cv);
    const R = rng(11);
    const GW = 160;
    const GH = Math.max(60, Math.round((GW * H) / W));
    // Rauschen (Wertrauschen, 3 Oktaven) + Abstand zu zwei Glutpunkten → „Brennzeit“ je Zelle, 0..1
    const hash = (x: number, y: number) => {
      const s = Math.sin(x * 127.1 + y * 311.7) * 43758.5453;
      return s - Math.floor(s);
    };
    const vn = (x: number, y: number) => {
      const xi = Math.floor(x);
      const yi = Math.floor(y);
      const xf = x - xi;
      const yf = y - yi;
      const u = xf * xf * (3 - 2 * xf);
      const v = yf * yf * (3 - 2 * yf);
      const a = hash(xi, yi) + (hash(xi + 1, yi) - hash(xi, yi)) * u;
      const b = hash(xi, yi + 1) + (hash(xi + 1, yi + 1) - hash(xi, yi + 1)) * u;
      return a + (b - a) * v;
    };
    const seeds = [
      [0.3 + R() * 0.15, 0.7 + R() * 0.2],
      [0.7 + R() * 0.15, 0.3 + R() * 0.2],
    ];
    const T = new Float32Array(GW * GH);
    let max = 0;
    for (let y = 0; y < GH; y++)
      for (let x = 0; x < GW; x++) {
        const nx = x / GW;
        const ny = y / GH;
        const d = Math.min(...seeds.map(([sx, sy]) => Math.hypot((nx - sx) * (W / H), ny - sy)));
        const n = vn(nx * 6, ny * 6) * 0.5 + vn(nx * 13, ny * 13) * 0.3 + vn(nx * 27, ny * 27) * 0.2;
        const v = d * 0.75 + n * 0.35;
        T[y * GW + x] = v;
        max = Math.max(max, v);
      }
    for (let i = 0; i < T.length; i++) T[i] /= max;
    const mask = document.createElement('canvas');
    mask.width = GW;
    mask.height = GH;
    const mg = mask.getContext('2d')!;
    const glow = document.createElement('canvas');
    glow.width = GW;
    glow.height = GH;
    const gg = glow.getContext('2d')!;
    const md = mg.createImageData(GW, GH);
    const gd = gg.createImageData(GW, GH);
    const embers: { x: number; y: number; vx: number; vy: number; life: number }[] = [];
    const t0 = performance.now();
    let raf = 0;
    const DUR = 2.5;
    const frame = (now: number) => {
      const t = (now - t0) / 1000;
      const p = -0.05 + (t / DUR) * 1.2;
      for (let i = 0; i < T.length; i++) {
        const v = T[i] - p;
        // Maske: unverbrannt 1, an der Kante weich auf 0
        const a = v > 0.05 ? 1 : v > 0 ? v / 0.05 : 0;
        md.data[i * 4 + 3] = a * 255;
        // Verkohlung (dunkel) kurz vor der Kante, Glut genau an der Kante
        const char = v > 0 && v < 0.12 ? 1 - v / 0.12 : 0;
        const ember = v > -0.015 && v < 0.025 ? 1 - Math.abs(v - 0.005) / 0.02 : 0;
        gd.data[i * 4] = 255;
        gd.data[i * 4 + 1] = 120 + ember * 110;
        gd.data[i * 4 + 2] = 30 + ember * 60;
        gd.data[i * 4 + 3] = Math.max(0, Math.min(255, ember * 255));
        // Verkohlung im Rotkanal der Maske merken (charLayer macht daraus eine dunkle Schicht)
        md.data[i * 4] = char * 255;
        if (ember > 0.6 && Math.random() < 0.004)
          embers.push({
            x: ((i % GW) / GW) * W,
            y: (Math.floor(i / GW) / GH) * H,
            vx: (Math.random() - 0.5) * 30,
            vy: -40 - Math.random() * 80,
            life: 1,
          });
      }
      mg.putImageData(md, 0, 0);
      gg.putImageData(gd, 0, 0);
      g.globalCompositeOperation = 'source-over';
      g.clearRect(0, 0, W, H);
      drawCover(g, im, W, H);
      // Verkohlung: Bild an der Kante abdunkeln (Maske mit Rotkanal als Deckkraft-Hinweis → Schatten-Pass)
      g.globalCompositeOperation = 'source-atop';
      g.save();
      g.filter = 'blur(3px)';
      g.globalAlpha = 0.9;
      g.drawImage(charLayer(md, GW, GH), 0, 0, W, H);
      g.restore();
      // Ausschneiden
      g.globalCompositeOperation = 'destination-in';
      g.imageSmoothingEnabled = true;
      g.drawImage(mask, 0, 0, W, H);
      // Glut
      g.globalCompositeOperation = 'lighter';
      g.save();
      g.filter = 'blur(4px)';
      g.drawImage(glow, 0, 0, W, H);
      g.restore();
      g.drawImage(glow, 0, 0, W, H);
      for (const e of embers) {
        e.x += e.vx / 60;
        e.y += e.vy / 60;
        e.life -= 1 / 70;
        g.fillStyle = `rgba(255,${160 + e.life * 80},80,${Math.max(0, e.life)})`;
        g.fillRect(e.x, e.y, 2.2, 2.2);
      }
      g.globalCompositeOperation = 'source-over';
      if (t < DUR + 0.3) raf = requestAnimationFrame(frame);
    };
    const cl = document.createElement('canvas');
    cl.width = GW;
    cl.height = GH;
    const cg = cl.getContext('2d')!;
    const cd = cg.createImageData(GW, GH);
    function charLayer(m: ImageData, w: number, h: number) {
      for (let i = 0; i < w * h; i++) {
        cd.data[i * 4] = 18;
        cd.data[i * 4 + 1] = 9;
        cd.data[i * 4 + 2] = 3;
        cd.data[i * 4 + 3] = m.data[i * 4];
      }
      cg.putImageData(cd, 0, 0);
      return cl;
    }
    raf = requestAnimationFrame(frame);
    return () => cancelAnimationFrame(raf);
  }, [im]);
  return <canvas ref={ref} aria-hidden className={styles.pixel} />;
}

/* ---------------------------------------------------------------------------------------------- Tür ----------- */

/**
 * Countdown-Tür: die alte Seite klebt auf einer zweiflügeligen Tür. Während der Countdown läuft, wachsen feine Risse
 * an der Mittelfuge und den Rändern, durch die Fuge dringt immer mehr Licht. Bei 0 (oder auf Klick) schwingen die
 * Flügel auf — dahinter die neue Seite.
 */
export function Door({ src, open, total, left }: { src: string; open: boolean; total: number; left: number }) {
  const ref = useRef<HTMLCanvasElement>(null);
  // Risse wachsen mit der vergangenen Zeit (0..1)
  const grown = total ? 1 - left / total : 1;
  useEffect(() => {
    const cv = ref.current;
    if (!cv || open) return;
    const { g, W, H } = fitCanvas(cv);
    const R = rng(23);
    g.clearRect(0, 0, W, H);
    const crack = (x: number, y: number, ang: number, len: number, depth: number) => {
      let px = x;
      let py = y;
      g.beginPath();
      g.moveTo(px, py);
      const steps = Math.max(2, Math.round(len / 14));
      for (let i = 0; i < steps; i++) {
        ang += (R() - 0.5) * 0.9;
        px += Math.cos(ang) * 14;
        py += Math.sin(ang) * 14;
        g.lineTo(px, py);
        if (depth < 2 && R() < 0.18) {
          const sx = px;
          const sy = py;
          g.stroke();
          crack(sx, sy, ang + (R() < 0.5 ? 0.8 : -0.8), len * 0.4, depth + 1);
          g.beginPath();
          g.moveTo(px, py);
        }
      }
      g.stroke();
    };
    // Ausgangspunkte: entlang der Mittelfuge und der Ränder; je mehr Zeit vergangen, desto mehr und längere Risse
    const n = Math.round(6 + grown * 34);
    for (let i = 0; i < n; i++) {
      const onSeam = R() < 0.6;
      const side = R() < 0.5 ? -1 : 1;
      const x = onSeam ? W / 2 : side < 0 ? 0 : W;
      const y = R() * H;
      const ang = onSeam ? (side < 0 ? Math.PI : 0) + (R() - 0.5) * 1.2 : (side < 0 ? 0 : Math.PI) + (R() - 0.5) * 1.2;
      const len = (30 + R() * 160) * (0.3 + grown);
      g.strokeStyle = 'rgba(255,255,255,0.55)';
      g.lineWidth = 1;
      g.save();
      g.translate(0.8, 0.8);
      crack(x, y, ang, len, 0);
      g.restore();
      g.strokeStyle = 'rgba(12,14,20,0.8)';
      g.lineWidth = 1.3;
      crack(x, y, ang, len, 0);
    }
  }, [grown, open]);
  // Jeder Flügel zeigt seine Hälfte des ganzen Bildes: innen eine bildschirmbreite Fläche mit cover, oben ausgerichtet
  const leaf = (sideLeft: boolean) => (
    <div className={sideLeft ? styles.leafL : styles.leafR}>
      <div
        style={{
          position: 'absolute',
          top: 0,
          bottom: 0,
          width: '200%',
          left: sideLeft ? 0 : '-100%',
          backgroundImage: `url("${src}")`,
          backgroundSize: 'cover',
          backgroundPosition: '50% 0',
          backgroundRepeat: 'no-repeat',
        }}
      />
    </div>
  );
  return (
    <div
      aria-hidden
      className={[styles.door, open ? styles.doorOpen : ''].join(' ')}
      style={{ ['--glow' as string]: String(0.15 + grown * 0.85) }}
    >
      {leaf(true)}
      {leaf(false)}
      <div className={styles.seam} />
      <canvas ref={ref} className={styles.pixel} style={{ opacity: open ? 0 : 1 }} />
      {!open && (
        <div className={styles.count}>
          <span>{left}</span>
        </div>
      )}
    </div>
  );
}
