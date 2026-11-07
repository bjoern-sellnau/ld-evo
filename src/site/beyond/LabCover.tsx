/**
 * Generatives Cover (Design-Richtung „Beyond“, Lab-Look) — übernommen aus dem Entwurf „Path to Beyond“
 * (src/components/lab/lab-cover.tsx): deterministischer Zufall aus der ID, Muster je Art (Spiel, Tool, Web).
 * Abweichung: Farbton aus der Projektfarbe (Entwurf: festes `hue` je Experiment), Art aus der Kategorie geschätzt.
 */

/** Deterministischer Zufall aus einem Text — gleiche ID, gleiches Cover (Entwurf: seededRandom). */
export function seededRandom(seed: string) {
  let h = 1779033703 ^ seed.length;
  for (let i = 0; i < seed.length; i++) {
    h = Math.imul(h ^ seed.charCodeAt(i), 3432918353);
    h = (h << 13) | (h >>> 19);
  }
  return () => {
    h = Math.imul(h ^ (h >>> 16), 2246822507);
    h = Math.imul(h ^ (h >>> 13), 3266489909);
    h ^= h >>> 16;
    return (h >>> 0) / 4294967296;
  };
}

/** Farbton (0–359) einer #RRGGBB-Farbe; Grau → 210 (Blau des Entwurfs). */
export function hueOf(hex: string): number {
  const m = /^#?([0-9a-f]{6})$/i.exec(hex.trim());
  if (!m) return 210;
  const [r, g, b] = [0, 2, 4].map((i) => parseInt(m[1].slice(i, i + 2), 16) / 255);
  const max = Math.max(r, g, b);
  const d = max - Math.min(r, g, b);
  if (d < 0.04) return 210;
  const h = max === r ? ((g - b) / d) % 6 : max === g ? (b - r) / d + 2 : (r - g) / d + 4;
  return Math.round((h * 60 + 360) % 360);
}

export type CoverKind = 'game' | 'tool' | 'web';

/** Art aus Kategorie/Kicker: Spiele, Tools/Apps, sonst Web. */
export function coverKind(text: string): CoverKind {
  if (/spiel|game|shooter|arena|tournament/i.test(text)) return 'game';
  if (/tool|app|cms|extension|erweiterung|workbench|\b(ki|ai)\b/i.test(text)) return 'tool';
  return 'web';
}

const W = 400;
const H = 240;

function GamePattern({ hue, rand }: { hue: number; rand: () => number }) {
  const vx = 140 + rand() * 120;
  const vy = 90 + rand() * 60;
  const frames = Array.from({ length: 7 }, (_, i) => {
    const t = Math.pow(0.68, i);
    return { x: vx - vx * t, y: vy - vy * t, w: W * t, h: H * t, o: 0.55 - i * 0.06 };
  });
  const targets = Array.from({ length: 4 }, () => ({ x: vx + (rand() - 0.5) * 220, y: vy + (rand() - 0.5) * 120, r: 2 + rand() * 4 }));
  return (
    <g fill="none" stroke={`hsl(${hue} 90% 66%)`}>
      {[
        [0, 0],
        [W, 0],
        [0, H],
        [W, H],
      ].map(([x, y]) => (
        <line key={`${x}-${y}`} x1={x} y1={y} x2={vx} y2={vy} strokeOpacity={0.25} />
      ))}
      {frames.map((f, i) => (
        <rect key={i} x={f.x} y={f.y} width={f.w} height={f.h} strokeOpacity={f.o} />
      ))}
      {targets.map((t, i) => (
        <g key={i}>
          <circle cx={t.x} cy={t.y} r={t.r * 3} strokeOpacity={0.5} />
          <circle cx={t.x} cy={t.y} r={t.r} fill={`hsl(${hue} 100% 70%)`} stroke="none" />
        </g>
      ))}
    </g>
  );
}

function ToolPattern({ hue, rand }: { hue: number; rand: () => number }) {
  const cells = [];
  for (let r = 0; r < 2; r++)
    for (let c = 0; c < 3; c++) {
      const x = 40 + c * 112;
      const y = 40 + r * 84;
      const bars = Array.from({ length: 5 }, () => 10 + rand() * 40);
      cells.push(
        <g key={`${r}-${c}`}>
          <rect x={x} y={y} width={96} height={70} rx={10} fill={`hsl(${hue} 60% 50% / 0.08)`} stroke={`hsl(${hue} 80% 65% / 0.35)`} />
          {bars.map((b, i) => (
            <rect
              key={i}
              x={x + 14 + i * 15}
              y={y + 58 - b}
              width={8}
              height={b}
              rx={2}
              fill={`hsl(${hue} 90% 65% / ${0.35 + rand() * 0.5})`}
            />
          ))}
        </g>,
      );
    }
  return <g>{cells}</g>;
}

function WebPattern({ hue }: { hue: number }) {
  return (
    <g fill={`hsl(${hue} 70% 60% / 0.1)`} stroke={`hsl(${hue} 85% 68% / 0.5)`}>
      <rect x={50} y={30} width={300} height={190} rx={12} fill={`hsl(${hue} 50% 10% / 0.6)`} />
      <line x1={50} y1={52} x2={350} y2={52} />
      {[64, 76, 88].map((x) => (
        <circle key={x} cx={x} cy={41} r={3.5} stroke="none" fill={`hsl(${hue} 90% 70% / 0.7)`} />
      ))}
      <rect x={70} y={70} width={160} height={14} rx={4} />
      <rect x={70} y={92} width={110} height={8} rx={4} stroke="none" />
      <rect x={70} y={106} width={130} height={8} rx={4} stroke="none" />
      <rect x={245} y={68} width={88} height={60} rx={30} fill={`hsl(${hue} 90% 60% / 0.25)`} />
      {[0, 1, 2].map((i) => (
        <rect key={i} x={70 + i * 90} y={146} width={80} height={56} rx={8} />
      ))}
    </g>
  );
}

/** Dekoratives SVG-Cover (aria-hidden — Name und Kategorie stehen als Text auf der Karte). */
export function LabCover({ id, color, kind }: { id: string; color: string; kind: CoverKind }) {
  const hue = hueOf(color);
  const rand = seededRandom(id);
  const gx = 20 + rand() * 60;
  const gy = 10 + rand() * 50;
  const key = `bxc-${id.replace(/[^a-z0-9-]/gi, '')}`;
  return (
    <svg
      viewBox={`0 0 ${W} ${H}`}
      preserveAspectRatio="xMidYMid slice"
      aria-hidden
      style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', display: 'block' }}
    >
      <defs>
        <linearGradient id={`${key}-bg`} x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor={`hsl(${hue} 55% 7%)`} />
          <stop offset="100%" stopColor={`hsl(${(hue + 40) % 360} 60% 13%)`} />
        </linearGradient>
        <radialGradient id={`${key}-glow`} cx={`${gx}%`} cy={`${gy}%`} r="70%">
          <stop offset="0%" stopColor={`hsl(${hue} 95% 60%)`} stopOpacity="0.55" />
          <stop offset="100%" stopColor={`hsl(${hue} 95% 60%)`} stopOpacity="0" />
        </radialGradient>
        <pattern id={`${key}-dots`} width="16" height="16" patternUnits="userSpaceOnUse">
          <circle cx="1" cy="1" r="0.8" fill="white" fillOpacity="0.08" />
        </pattern>
      </defs>
      <rect width={W} height={H} fill={`url(#${key}-bg)`} />
      <rect width={W} height={H} fill={`url(#${key}-glow)`} />
      <rect width={W} height={H} fill={`url(#${key}-dots)`} />
      {kind === 'game' && <GamePattern hue={hue} rand={rand} />}
      {kind === 'tool' && <ToolPattern hue={hue} rand={rand} />}
      {kind === 'web' && <WebPattern hue={hue} />}
    </svg>
  );
}
