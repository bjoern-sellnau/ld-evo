/**
 * Grund der Countdown-Heros (neu, Wunsch vom 28.11.2026): schwarze Fläche, Schein hinter der Uhr, der mit jeder Sekunde
 * aufleuchtet, ein schmaler Lichtstreifen auf dem Ticken und ruhiger Staub — wie in der Uhr-Szene der Countdown-Teaser
 * (Branch `reel`, quelle-trailer/kino.js → KS.clock). Die Ziffern selbst sind echtes Markup (CountdownHero.tsx):
 * scharf in jeder Größe und für Screenreader lesbar. Der Schein richtet sich nach der Lage der Anzeige im Dokument.
 */
import { COUNTDOWN_ANCHOR, COUNTDOWN_MODES, countdownCfg, type CountdownMode } from '../countdown';
import { hexRgb, rand, type Ctx2D, type ExtraRenderer, type Mode2D } from './renderers';

const TAU = Math.PI * 2;

const ground = (c: Ctx2D, mode: CountdownMode): ExtraRenderer => {
  const [r, gr, b] = hexRgb(countdownCfg(mode, c.cfg).color);
  const col = (a: number) => `rgba(${r},${gr},${b},${a})`;
  // Staub: heller als die Uhrfarbe, damit er auch bei dunklen Farben sichtbar bleibt
  const dustCol = (a: number) =>
    `rgba(${Math.round((r + 255 * 2) / 3)},${Math.round((gr + 255 * 2) / 3)},${Math.round((b + 255 * 2) / 3)},${a})`;
  const dust = Array.from({ length: 64 }, () => ({ x: rand(), y: rand(), z: rand(0.35, 1), p: rand(0, TAU), v: rand(0.004, 0.012) }));
  return {
    frame(t) {
      const g = c.g;
      const W = c.W();
      const H = c.H();
      g.globalCompositeOperation = 'source-over';
      g.fillStyle = '#000';
      g.fillRect(0, 0, W, H);
      // Lage der Anzeige relativ zur Zeichenfläche (ohne Markup: Bildmitte)
      const el = document.getElementById(COUNTDOWN_ANCHOR)?.getBoundingClientRect();
      const box = c.cv?.getBoundingClientRect();
      const cx = el && box ? el.left + el.width / 2 - box.left : W / 2;
      const cy = el && box ? el.top + el.height / 2 - box.top : H * 0.5;
      const span = el ? el.width : W * 0.5;
      // „Animationen aus“: ruhiges Standbild ohne Sekundenpuls
      const still = document.body.classList.contains('still');
      const fr = still ? 1 : (Date.now() % 1000) / 1000;
      const pulse = still ? 0.35 : Math.exp(-fr * 4.5);
      g.globalCompositeOperation = 'lighter';
      // Schein hinter der Uhr
      const R = span * (0.62 + 0.1 * pulse);
      const glow = g.createRadialGradient(cx, cy, 0, cx, cy, R);
      glow.addColorStop(0, col(0.16 + 0.16 * pulse));
      glow.addColorStop(0.45, col(0.05 + 0.05 * pulse));
      glow.addColorStop(1, col(0));
      g.fillStyle = glow;
      g.fillRect(cx - R, cy - R, R * 2, R * 2);
      // Lichtstreifen quer durch die Anzeige, nur im Augenblick des Tickens
      const fl = still ? 0 : 0.5 * Math.exp(-fr * 6);
      if (fl > 0.01) {
        const L = span * 0.82;
        const streak = g.createLinearGradient(cx - L, 0, cx + L, 0);
        streak.addColorStop(0, col(0));
        streak.addColorStop(0.5, col(fl));
        streak.addColorStop(1, col(0));
        g.fillStyle = streak;
        g.fillRect(cx - L, cy - 1, L * 2, 2);
        g.globalAlpha = 0.22;
        g.fillRect(cx - L, cy - 5, L * 2, 10);
        g.globalAlpha = 1;
      }
      // Staub
      for (const d of dust) {
        const x = ((d.x + t * d.v * 0.6) % 1) * W;
        const y = ((d.y + 1 - ((t * d.v) % 1)) % 1) * H;
        g.fillStyle = dustCol((0.1 + 0.16 * (0.5 + 0.5 * Math.sin(t * 0.7 + d.p))) * d.z);
        g.beginPath();
        g.arc(x, y, 0.6 + d.z * 0.9, 0, TAU);
        g.fill();
      }
      g.globalCompositeOperation = 'source-over';
    },
  };
};

export const COUNTDOWN_2D: Record<string, Mode2D> = Object.fromEntries(
  (Object.keys(COUNTDOWN_MODES) as CountdownMode[]).map((mode) => [mode, (c: Ctx2D) => ground(c, mode)]),
);
