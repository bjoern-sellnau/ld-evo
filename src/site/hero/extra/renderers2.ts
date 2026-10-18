/**
 * Zweite Welle zusätzlicher Hero-Animationen (neu, nicht im Prototyp — Wunsch vom 17.10.2026: „baue alle“).
 * Metadaten in meta.ts, Ablauf/Größe/Zeiger in renderers.ts (runExtra). Alle Modi nutzen die Hero-Palette des Modus
 * (5 Farben) und bleiben hinter dem Hero-Text bewusst gedämpft. Zeiger (Maus/Finger) über c.ptr bzw. u_mouse.
 */
import { fade, rand, vnoise, type Ctx2D, type ExtraRenderer, type Mode2D } from './renderers';

const TAU = Math.PI * 2;
const monoFont = () => {
  const f = typeof document !== 'undefined' ? getComputedStyle(document.body).getPropertyValue('--ld-font-mono').trim() : '';
  return f ? `${f}, ui-monospace, monospace` : 'ui-monospace, SFMono-Regular, Menlo, monospace';
};
const ease = (x: number) => (x < 0.5 ? 2 * x * x : 1 - Math.pow(-2 * x + 2, 2) / 2);
const clamp01 = (x: number) => Math.max(0, Math.min(1, x));
/** Rechte Bildhälfte (Desktop) bzw. ganze Fläche (schmal) — dort darf es „lauter“ sein, links steht der Hero-Text. */
const stage = (c: Ctx2D) => {
  const wide = c.W() > 760;
  const x0 = wide ? c.W() * 0.5 : c.W() * 0.06;
  const w = wide ? c.W() * 0.44 : c.W() * 0.88;
  // oben Platz für die Menüleiste lassen
  const y0 = Math.max(c.H() * 0.16, 96);
  return { wide, x0, w, y0, h: Math.max(120, c.H() * 0.84 - y0) };
};
/**
 * Schleier über der Textseite (links auf breiten Bildschirmen, sonst gleichmäßig): hält den Hero-Text lesbar, ohne die
 * Animation rechts zu dämpfen.
 */
const veil = (c: Ctx2D, a = 0.6) => {
  const g = c.g;
  g.globalCompositeOperation = 'source-over';
  if (c.W() > 760) {
    const gr = g.createLinearGradient(0, 0, c.W() * 0.62, 0);
    gr.addColorStop(0, c.bg.replace('ALPHA', String(a)));
    gr.addColorStop(0.7, c.bg.replace('ALPHA', String(a * 0.5)));
    gr.addColorStop(1, c.bg.replace('ALPHA', '0'));
    g.fillStyle = gr;
  } else g.fillStyle = c.bg.replace('ALPHA', String(a * 0.75));
  g.fillRect(0, 0, c.W(), c.H());
};
const roundRect = (g: CanvasRenderingContext2D, x: number, y: number, w: number, h: number, r: number) => {
  g.beginPath();
  g.roundRect(x, y, w, h, r);
};

/* ------------------------------------------------------------------------------------------- WebGL ---------- */

export const MORE_SHADERS: Record<string, string> = {
  // Glas-Lupe: eine Linse aus Glas folgt dem Zeiger, vergrößert das Muster dahinter und bricht es farbig
  lens: `vec3 pat(vec2 uv){float t=u_time*0.05;float n=fbm(uv*2.2+vec2(t,-t));
 float st=smoothstep(0.42,0.5,abs(fract((uv.x+uv.y)*6.0+n*1.5)-0.5));
 return pal(n*1.2)*(0.18+0.5*st)+pal(fract(n+0.3))*0.08;}
void main(){vec2 uv=gl_FragCoord.xy/u_res.y;vec2 m=u_mouse.xy/u_res.y;float R=0.2;vec2 d=uv-m;float r=length(d);
 vec3 col=pat(uv)*0.75;
 if(r<R){float k=r/R;float z=sqrt(1.0-k*k);vec2 off=d*(0.55*(1.0-z));
  vec3 lc=vec3(pat(m+d*0.55-off*1.06).r,pat(m+d*0.55-off).g,pat(m+d*0.55-off*0.94).b)*1.15;
  col=mix(col,lc,smoothstep(1.0,0.96,k));col+=pow(1.0-z,3.0)*0.35;col+=smoothstep(0.86,1.0,k)*smoothstep(1.0,0.97,k)*0.45;
  col+=pow(max(0.0,1.0-length(d/R-vec2(-0.35,0.4))*2.2),3.0)*0.35;}
 else{col*=1.0-0.35*exp(-(r-R)*18.0);}
 gl_FragColor=vec4(col,1.0);}`,
  // Tinte im Wasser: Farbwolken breiten sich langsam aus und verwirbeln (Domain Warping)
  inkwater: `void main(){vec2 p=gl_FragCoord.xy/u_res.y*1.4;float t=u_time*0.06;
 vec2 q=vec2(fbm(p+vec2(0.0,t)),fbm(p+vec2(5.2,1.3)-t));
 vec2 r=vec2(fbm(p+3.0*q+vec2(1.7,9.2)+t*0.7),fbm(p+3.0*q+vec2(8.3,2.8)-t*0.5));
 float n=fbm(p+3.5*r);float dens=smoothstep(0.35,0.95,n);
 vec3 col=mix(vec3(0.015,0.03,0.05),pal(r.x*1.1),dens*0.85);col+=pal(fract(q.y+0.4))*pow(dens,3.0)*0.35;
 col*=0.85+0.15*sin(t*3.0+n*6.0);col*=mix(0.45,1.0,smoothstep(0.15,0.65,gl_FragCoord.x/u_res.x));gl_FragColor=vec4(col,1.0);}`,
};

/* ------------------------------------------------------------------------------------------- Canvas 2D ------ */

/** Ortszeit Berlin und Sonnenauf-/-untergang (Stunden, gebrochen) — für Tageszeit-Himmel und Wetter. */
const berlin = () => {
  const now = new Date();
  const parts = new Intl.DateTimeFormat('de-DE', {
    timeZone: 'Europe/Berlin',
    hour: 'numeric',
    minute: 'numeric',
    hourCycle: 'h23',
  }).formatToParts(now);
  const h = Number(parts.find((p) => p.type === 'hour')?.value ?? 12);
  const m = Number(parts.find((p) => p.type === 'minute')?.value ?? 0);
  // Sonnenauf-/-untergang Berlin (52,52° N), einfache Näherung über die Deklination; Ortszeit inkl. Sommerzeit
  const day = Math.floor(
    (Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate()) - Date.UTC(now.getUTCFullYear(), 0, 0)) / 864e5,
  );
  const decl = 23.44 * Math.sin((TAU * (284 + day)) / 365);
  const lat = (52.52 * Math.PI) / 180;
  const ha = (Math.acos(-Math.tan(lat) * Math.tan((decl * Math.PI) / 180)) * 180) / Math.PI;
  const tzOff = (h - now.getUTCHours() + 24) % 24;
  const noon = 12 - 13.405 / 15 + tzOff;
  return {
    now: h + m / 60,
    rise: noon - ha / 15,
    set: noon + ha / 15,
    label: `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`,
  };
};

/** Zeiger: echter Zeiger, sonst ein langsam wandernder „Geister-Zeiger“ (so lebt die Szene auch ohne Maus). */
const ghost = (c: Ctx2D, t: number) =>
  c.ptr.active
    ? { x: c.ptr.x, y: c.ptr.y, vx: c.ptr.vx, vy: c.ptr.vy }
    : {
        x: c.W() * (0.68 + 0.2 * Math.sin(t * 0.37)),
        y: c.H() * (0.5 + 0.28 * Math.sin(t * 0.53 + 1)),
        vx: Math.cos(t * 0.37) * 3,
        vy: Math.cos(t * 0.53 + 1) * 3,
      };

// 5×7-Pixelschrift für Pixel-Tetris (nur die gebrauchten Zeichen)
const FONT: Record<string, string[]> = {
  W: ['10001', '10001', '10001', '10101', '10101', '11011', '10001'],
  E: ['11111', '10000', '10000', '11110', '10000', '10000', '11111'],
  B: ['11110', '10001', '10001', '11110', '10001', '10001', '11110'],
  '.': ['00000', '00000', '00000', '00000', '00000', '01100', '01100'],
};

export const MORE_2D: Record<string, Mode2D> = {
  // Zeitreise 2007 → heute: rechts eine Website, die sich durch die Web-Epochen rendert
  zeitreise: (c) => {
    const ERAS = ['2007', '2012', '2016', '2020', '2026'];
    const SPAN = 4.2;
    const drawEra = (k: number, t: number) => {
      const g = c.g;
      const { x0, w, y0, h } = stage(c);
      const x = x0;
      g.save();
      if (k === 0) {
        // Web 2.0: Glanz-Kopfband, Chrom-Kugel, Spiegelung
        const hb = g.createLinearGradient(0, y0, 0, y0 + h * 0.2);
        hb.addColorStop(0, '#7cc6ff');
        hb.addColorStop(0.5, '#2a8ee8');
        hb.addColorStop(0.51, '#0a6fd6');
        hb.addColorStop(1, '#0a5fb8');
        g.fillStyle = '#e9eef3';
        roundRect(g, x, y0, w, h, 6);
        g.fill();
        g.fillStyle = hb;
        g.fillRect(x, y0, w, h * 0.2);
        const orb = g.createRadialGradient(x + h * 0.1, y0 + h * 0.08, 2, x + h * 0.1, y0 + h * 0.1, h * 0.075);
        orb.addColorStop(0, '#ffffff');
        orb.addColorStop(0.45, '#3b7fc4');
        orb.addColorStop(1, '#0b1b2e');
        g.fillStyle = orb;
        g.beginPath();
        g.arc(x + h * 0.1, y0 + h * 0.1, h * 0.07, 0, TAU);
        g.fill();
        g.fillStyle = '#ffffff';
        g.fillRect(x + h * 0.2, y0 + h * 0.07, w * 0.42, h * 0.035);
        g.fillStyle = '#00a2ff';
        g.fillRect(x, y0 + h * 0.2, w, h * 0.06);
        for (let i = 0; i < 6; i++) {
          g.fillStyle = i % 2 ? '#c9d6e3' : '#b6c6d6';
          g.fillRect(x + w * 0.06, y0 + h * (0.32 + i * 0.07), w * (0.5 + (0.3 * ((i * 37) % 10)) / 10), h * 0.025);
        }
        g.fillStyle = 'rgba(255,255,255,0.35)';
        g.fillRect(x, y0, w, h * 0.1);
      } else if (k === 1) {
        // Flat/Metro: Kacheln in Vollfarben
        g.fillStyle = '#1f2630';
        roundRect(g, x, y0, w, h, 2);
        g.fill();
        // feste Kacheln [Spalte, Zeile, Breite, Höhe] in einem 4×3-Raster
        const T: [number, number, number, number][] = [
          [0, 0, 2, 1],
          [2, 0, 1, 1],
          [3, 0, 1, 2],
          [0, 1, 1, 1],
          [1, 1, 2, 1],
          [0, 2, 1, 1],
          [1, 2, 1, 1],
          [2, 2, 2, 1],
        ];
        const tw = (w - 20) / 4;
        const th = (h - 20) / 3;
        T.forEach(([cx, cy, cw, ch], i) => {
          g.fillStyle = c.col(i % 5, 0.92);
          g.fillRect(x + 10 + cx * tw + 4, y0 + 10 + cy * th + 4, cw * tw - 8, ch * th - 8);
        });
      } else if (k === 2) {
        // Material: Karten mit Schatten, runder Aktionsknopf
        g.fillStyle = '#eceff1';
        roundRect(g, x, y0, w, h, 4);
        g.fill();
        g.fillStyle = c.col(1);
        g.fillRect(x, y0, w, h * 0.16);
        for (let i = 0; i < 3; i++) {
          g.shadowColor = 'rgba(0,0,0,0.3)';
          g.shadowBlur = 10;
          g.shadowOffsetY = 3;
          g.fillStyle = '#ffffff';
          g.fillRect(x + w * 0.06, y0 + h * (0.22 + i * 0.24), w * 0.88, h * 0.19);
          g.shadowBlur = 0;
          g.shadowOffsetY = 0;
          g.fillStyle = '#cfd8dc';
          g.fillRect(x + w * 0.1, y0 + h * (0.27 + i * 0.24), w * 0.5, h * 0.03);
        }
        g.fillStyle = c.col(3);
        g.beginPath();
        g.arc(x + w * 0.86, y0 + h * 0.92, h * 0.06, 0, TAU);
        g.fill();
      } else if (k === 3) {
        // Dark Mode + Verläufe
        g.fillStyle = '#0d1117';
        roundRect(g, x, y0, w, h, 16);
        g.fill();
        const gr = g.createLinearGradient(x, y0, x + w, y0 + h);
        gr.addColorStop(0, c.col(0, 0.9));
        gr.addColorStop(1, c.col(3, 0.9));
        g.fillStyle = gr;
        roundRect(g, x + w * 0.06, y0 + h * 0.1, w * 0.88, h * 0.36, 14);
        g.fill();
        for (let i = 0; i < 3; i++) {
          g.fillStyle = '#161b22';
          roundRect(g, x + w * (0.06 + i * 0.3), y0 + h * 0.55, w * 0.27, h * 0.34, 12);
          g.fill();
        }
      } else {
        // Liquid Glass: weiche Farbflächen hinter Glasscheiben
        g.save();
        roundRect(g, x, y0, w, h, 26);
        g.clip();
        g.fillStyle = '#0b0e16';
        g.fillRect(x, y0, w, h);
        for (let i = 0; i < 4; i++) {
          const bx = x + w * (0.3 + 0.35 * Math.sin(t * 0.5 + i * 1.7));
          const by = y0 + h * (0.4 + 0.3 * Math.cos(t * 0.4 + i));
          const rg = g.createRadialGradient(bx, by, 0, bx, by, h * 0.45);
          rg.addColorStop(0, c.col(i, 0.85));
          rg.addColorStop(1, c.col(i, 0));
          g.fillStyle = rg;
          g.fillRect(x, y0, w, h);
        }
        g.restore();
        const pane = (px: number, py: number, pw: number, ph: number) => {
          g.fillStyle = 'rgba(255,255,255,0.12)';
          roundRect(g, px, py, pw, ph, 18);
          g.fill();
          g.strokeStyle = 'rgba(255,255,255,0.45)';
          g.lineWidth = 1;
          g.stroke();
        };
        pane(x + w * 0.08, y0 + h * 0.08, w * 0.84, h * 0.12);
        pane(x + w * 0.08, y0 + h * 0.3, w * 0.5, h * 0.55);
        pane(x + w * 0.64, y0 + h * 0.3, w * 0.28, h * 0.26);
      }
      g.restore();
    };
    return {
      still: 1,
      frame(t) {
        const g = c.g;
        g.globalCompositeOperation = 'source-over';
        const k = Math.floor(t / SPAN) % ERAS.length;
        const p = (t % SPAN) / SPAN;
        const bg = g.createLinearGradient(0, 0, 0, c.H());
        bg.addColorStop(0, k === 0 ? '#0c1a2b' : '#070910');
        bg.addColorStop(1, '#05060a');
        g.fillStyle = bg;
        g.fillRect(0, 0, c.W(), c.H());
        drawEra(k, t);
        // Übergang: die nächste Epoche „rendert“ sich zeilenweise über die alte
        if (p > 0.78) {
          const q = ease((p - 0.78) / 0.22);
          const { x0, w, y0, h } = stage(c);
          g.save();
          g.beginPath();
          g.rect(x0 - 4, y0 - 4, w + 8, (h + 8) * q);
          g.clip();
          g.fillStyle = '#05060a';
          g.fillRect(x0 - 4, y0 - 4, w + 8, h + 8);
          drawEra((k + 1) % ERAS.length, t);
          g.restore();
          g.fillStyle = c.col(2, 0.9);
          g.fillRect(x0 - 8, y0 - 4 + (h + 8) * q, w + 16, 2);
        }
        const { x0, w, y0, h } = stage(c);
        g.font = `600 13px ${monoFont()}`;
        g.fillStyle = 'rgba(230,236,245,0.7)';
        g.textAlign = 'right';
        g.fillText(`${ERAS[k]}${p > 0.78 ? ` → ${ERAS[(k + 1) % ERAS.length]}` : ''}`, x0 + w, y0 + h + 26);
        g.textAlign = 'left';
        // schmal liegt alles hinter dem Text: kräftig abdunkeln
        if (!stage(c).wide) veil(c, 0.95);
      },
    };
  },

  // Live-Code: der Code tippt sich selbst, mit Hervorhebung und Cursor
  livecode: (c) => {
    const SRC = [
      "import { useSite } from '../settings/SiteProvider';",
      '',
      'export function Hero({ name, roles }: Props) {',
      '  const { settings } = useSite();',
      '  const [role, setRole] = useState(0);',
      '',
      '  useEffect(() => {',
      '    const id = setInterval(() => setRole((r) => (r + 1) % roles.length), 2800);',
      '    return () => clearInterval(id);',
      '  }, [roles.length]);',
      '',
      '  return (',
      '    <section className="hero" data-anim={settings.anim}>',
      '      <h1>Das Web. <span>Meine Leidenschaft.</span></h1>',
      '      <p>{name} — {roles[role]}</p>',
      "      <Button href='/projekte'>Projekte ansehen</Button>",
      '    </section>',
      '  );',
      '}',
    ].join('\n');
    const KW = /^(import|from|export|function|const|return|useEffect|useState|setInterval|clearInterval)$/;
    const tokColor = (tok: string) =>
      KW.test(tok)
        ? c.col(0, 0.95)
        : /^['"]/.test(tok)
          ? c.col(2, 0.95)
          : /^[A-Z]/.test(tok)
            ? c.col(3, 0.95)
            : /^\d/.test(tok)
              ? c.col(4, 0.95)
              : /^[<>/{}()=[\]]/.test(tok)
                ? 'rgba(160,172,190,0.8)'
                : 'rgba(225,231,240,0.88)';
    const RATE = 38;
    return {
      still: 1,
      frame(t) {
        const g = c.g;
        g.globalCompositeOperation = 'source-over';
        g.fillStyle = '#06080d';
        g.fillRect(0, 0, c.W(), c.H());
        const { wide, x0, w, y0, h } = stage(c);
        const total = SRC.length + RATE * 3;
        const shown = Math.min(SRC.length, Math.floor((t * RATE) % total));
        const txt = SRC.slice(0, shown);
        const fs = wide ? 14 : 12;
        g.font = `${fs}px ${monoFont()}`;
        const lh = fs * 1.7;
        const lines = txt.split('\n');
        const maxLines = Math.floor(h / lh);
        const first = Math.max(0, lines.length - maxLines);
        g.globalAlpha = wide ? 1 : 0.45;
        // Editor-Rahmen
        g.fillStyle = 'rgba(255,255,255,0.03)';
        roundRect(g, x0 - 16, y0 - 40, w + 32, h + 64, 14);
        g.fill();
        g.fillStyle = 'rgba(255,255,255,0.4)';
        g.fillText('Hero.tsx', x0, y0 - 16);
        for (let i = first; i < lines.length; i++) {
          const y = y0 + (i - first + 1) * lh;
          g.fillStyle = 'rgba(120,132,150,0.6)';
          g.textAlign = 'right';
          g.fillText(String(i + 1), x0 - 2, y);
          g.textAlign = 'left';
          let x = x0 + 18;
          for (const tok of lines[i].match(/'[^']*'?|"[^"]*"?|\w+|\s+|./g) ?? []) {
            g.fillStyle = tokColor(tok);
            g.fillText(tok, x, y);
            x += g.measureText(tok).width;
          }
          if (i === lines.length - 1 && Math.floor(t * 2) % 2 === 0) {
            g.fillStyle = c.col(1, 0.95);
            g.fillRect(x + 1, y - fs + 2, fs * 0.55, fs + 2);
          }
        }
        g.globalAlpha = 1;
        if (!wide) veil(c, 0.8);
      },
    };
  },

  // Agent-Terminal: ein Agent liest, ändert, testet — Zeile für Zeile
  agent: (c) => {
    const STEPS: [string, number, number][] = [
      ['> verbessere den Hero der Startseite', 0, 0],
      ['⏺ Read src/site/pages/HalloPage.tsx', 1, 1.2],
      ['⏺ Read src/site/hero/extra/meta.ts', 1, 2.1],
      ['⏺ Edit src/site/hero/extra/renderers2.ts  +214 −3', 3, 3.4],
      ['⏺ Bash npm run typecheck', 1, 4.8],
      ['  ⎿ ok', 2, 5.6],
      ['⏺ Bash npm test', 1, 6.2],
      ['  ⎿ 162 passed', 2, 7.4],
      ['⏺ Bash npm run lint', 1, 8.0],
      ['  ⎿ 0 problems', 2, 8.8],
      ['✻ Done — 3 files changed', 4, 9.6],
    ];
    const LOOP = 13;
    const SPIN = ['·', '✢', '✳', '✶', '✻', '✽'];
    return {
      still: 1,
      frame(t) {
        const g = c.g;
        g.globalCompositeOperation = 'source-over';
        const bg = g.createLinearGradient(0, 0, c.W(), c.H());
        bg.addColorStop(0, '#05070c');
        bg.addColorStop(1, '#0a0812');
        g.fillStyle = bg;
        g.fillRect(0, 0, c.W(), c.H());
        const { wide, x0, w, y0, h } = stage(c);
        const lt = t % LOOP;
        g.globalAlpha = wide ? 1 : 0.5;
        g.fillStyle = 'rgba(14,17,26,0.92)';
        roundRect(g, x0, y0, w, h, 14);
        g.fill();
        g.strokeStyle = 'rgba(255,255,255,0.1)';
        g.stroke();
        ['#ff5f57', '#febc2e', '#28c840'].forEach((col, i) => {
          g.fillStyle = col;
          g.beginPath();
          g.arc(x0 + 18 + i * 16, y0 + 18, 5, 0, TAU);
          g.fill();
        });
        const fs = wide ? 13.5 : 12;
        g.font = `${fs}px ${monoFont()}`;
        const lh = fs * 1.85;
        let y = y0 + 54;
        for (const [txt, kind, at] of STEPS) {
          if (lt < at) break;
          const typed = kind === 0 ? txt.slice(0, Math.floor((lt - at) * 30) + 1) : txt;
          g.fillStyle =
            kind === 0
              ? 'rgba(235,240,248,0.95)'
              : kind === 2
                ? c.col(2, 0.95)
                : kind === 3
                  ? c.col(1, 0.95)
                  : kind === 4
                    ? c.col(0, 1)
                    : 'rgba(200,208,222,0.85)';
          g.fillText(typed.slice(0, Math.floor((w - 36) / (fs * 0.6))), x0 + 18, y);
          y += lh;
          if (y > y0 + h - 20) break;
        }
        if (lt < 9.6) {
          g.fillStyle = c.col(3, 0.95);
          g.fillText(`${SPIN[Math.floor(t * 8) % SPIN.length]} Working…`, x0 + 18, Math.min(y, y0 + h - 20));
        }
        g.globalAlpha = 1;
        if (!wide) veil(c, 0.8);
      },
    };
  },

  // Commit-Galaxie: Projekte als Sternbilder, Commits als Lichtpulse, neue Sterne blitzen auf
  commits: (c) => {
    type Star = { x: number; y: number; r: number; i: number; born: number };
    let clusters: { cx: number; cy: number; stars: Star[]; edges: [number, number][] }[] = [];
    let pulses: { k: number; e: number; p: number }[] = [];
    const build = () => {
      const n = c.W() > 760 ? 8 : 5;
      clusters = Array.from({ length: n }, (_, k) => {
        const cx = c.W() * (c.W() > 760 ? rand(0.42, 0.95) : rand(0.08, 0.92));
        const cy = c.H() * rand(0.12, 0.88);
        const stars: Star[] = Array.from({ length: Math.round(rand(6, 12)) }, () => ({
          x: cx + rand(-70, 70),
          y: cy + rand(-55, 55),
          r: rand(0.8, 2.2),
          i: k % 5,
          born: -10,
        }));
        const edges: [number, number][] = stars.slice(1).map((_, j) => [j + 1, Math.floor(rand(0, j + 1))]);
        return { cx, cy, stars, edges };
      });
    };
    build();
    return {
      resize: build,
      still: 60,
      frame(t, dt) {
        fade(c, 0.35);
        const g = c.g;
        g.globalCompositeOperation = 'lighter';
        // Hintergrundsterne
        for (let i = 0; i < 90; i++) {
          const x = ((i * 977) % 1000) / 1000;
          const y = ((i * 613) % 1000) / 1000;
          g.fillStyle = `rgba(220,230,255,${0.15 + 0.15 * Math.sin(t + i)})`;
          g.fillRect(x * c.W(), y * c.H(), 1.2, 1.2);
        }
        if (Math.random() < dt * 3 && clusters.length) {
          const k = Math.floor(rand(0, clusters.length));
          const cl = clusters[k];
          if (cl.edges.length) pulses.push({ k, e: Math.floor(rand(0, cl.edges.length)), p: 0 });
          // gelegentlich ein „neuer Commit“: Stern wächst dazu
          if (Math.random() < 0.25 && cl.stars.length < 18) {
            const from = Math.floor(rand(0, cl.stars.length));
            cl.stars.push({ x: cl.cx + rand(-80, 80), y: cl.cy + rand(-60, 60), r: rand(1, 2.2), i: k % 5, born: t });
            cl.edges.push([cl.stars.length - 1, from]);
          }
        }
        clusters.forEach((cl) => {
          g.lineWidth = 1;
          for (const [a, b] of cl.edges) {
            g.strokeStyle = c.col(cl.stars[a].i, 0.22);
            g.beginPath();
            g.moveTo(cl.stars[a].x, cl.stars[a].y);
            g.lineTo(cl.stars[b].x, cl.stars[b].y);
            g.stroke();
          }
          for (const s of cl.stars) {
            const fresh = clamp01(1 - (t - s.born) / 1.5);
            g.fillStyle = c.col(s.i, 0.9);
            g.beginPath();
            g.arc(s.x, s.y, s.r + fresh * 6, 0, TAU);
            g.fill();
          }
        });
        pulses = pulses.filter((pu) => {
          pu.p += dt * 0.9;
          const cl = clusters[pu.k];
          const ed = cl?.edges[pu.e];
          if (!ed) return false;
          const [a, b] = ed;
          const x = cl.stars[a].x + (cl.stars[b].x - cl.stars[a].x) * pu.p;
          const y = cl.stars[a].y + (cl.stars[b].y - cl.stars[a].y) * pu.p;
          g.fillStyle = 'rgba(255,255,255,0.9)';
          g.fillRect(x - 1.5, y - 1.5, 3, 3);
          return pu.p < 1;
        });
      },
    };
  },

  // Cursor-Flüssigkeit: der Zeiger rührt in Farbe (ohne Zeiger rührt ein langsamer Geist)
  fluid: (c) => {
    let ps: { x: number; y: number; vx: number; vy: number; i: number }[] = [];
    const seed = () => {
      const n = Math.round(Math.min(2200, (c.W() * c.H()) / 500));
      ps = Array.from({ length: n }, (_, k) => ({ x: rand(0, c.W()), y: rand(0, c.H()), vx: 0, vy: 0, i: (k % 5) + rand(0, 0.8) }));
    };
    seed();
    return {
      resize: seed,
      still: 90,
      frame(t) {
        fade(c, 0.09);
        const g = c.g;
        g.globalCompositeOperation = 'lighter';
        const m = ghost(c, t);
        for (const p of ps) {
          const a = vnoise(p.x * 0.004 + t * 0.05, p.y * 0.004) * TAU * 2;
          p.vx += Math.cos(a) * 0.05;
          p.vy += Math.sin(a) * 0.05;
          const dx = p.x - m.x;
          const dy = p.y - m.y;
          const d2 = dx * dx + dy * dy;
          if (d2 < 140 * 140) {
            const f = 1 - Math.sqrt(d2) / 140;
            p.vx += m.vx * 0.08 * f - dy * 0.0025 * f;
            p.vy += m.vy * 0.08 * f + dx * 0.0025 * f;
          }
          p.vx *= 0.96;
          p.vy *= 0.96;
          p.x = (p.x + p.vx + c.W()) % c.W();
          p.y = (p.y + p.vy + c.H()) % c.H();
          const sp = Math.min(1, Math.hypot(p.vx, p.vy) / 3);
          g.fillStyle = c.col(p.i, 0.12 + 0.4 * sp);
          g.fillRect(p.x, p.y, 1.6 + sp * 1.6, 1.6 + sp * 1.6);
        }
        veil(c, 0.18);
      },
    };
  },

  // Magnetische Zeichen: ein Feld aus Code-Zeichen weicht dem Zeiger aus und federt zurück
  magnet: (c) => {
    const GLYPHS = ['<', '>', '{', '}', '/', '=', ';', 'L', 'D', '0', '1', '*'];
    let cells: { hx: number; hy: number; x: number; y: number; vx: number; vy: number; ch: string; i: number }[] = [];
    const build = () => {
      const gap = c.W() > 760 ? 34 : 28;
      cells = [];
      for (let y = gap / 2; y < c.H(); y += gap)
        for (let x = gap / 2; x < c.W(); x += gap) {
          const k = Math.floor(vnoise(x * 0.01, y * 0.01) * 97 + x + y);
          cells.push({ hx: x, hy: y, x, y, vx: 0, vy: 0, ch: GLYPHS[k % GLYPHS.length], i: (x / c.W()) * 4 });
        }
    };
    build();
    return {
      resize: build,
      still: 40,
      frame(t) {
        const g = c.g;
        g.globalCompositeOperation = 'source-over';
        g.fillStyle = '#05060b';
        g.fillRect(0, 0, c.W(), c.H());
        const m = ghost(c, t);
        g.font = `600 15px ${monoFont()}`;
        g.textAlign = 'center';
        g.textBaseline = 'middle';
        for (const p of cells) {
          const dx = p.x - m.x;
          const dy = p.y - m.y;
          const d = Math.hypot(dx, dy) || 1;
          if (d < 150) {
            const f = (1 - d / 150) * 3.2;
            p.vx += (dx / d) * f;
            p.vy += (dy / d) * f;
          }
          p.vx = (p.vx + (p.hx - p.x) * 0.06) * 0.82;
          p.vy = (p.vy + (p.hy - p.y) * 0.06) * 0.82;
          p.x += p.vx;
          p.y += p.vy;
          const off = Math.min(1, Math.hypot(p.x - p.hx, p.y - p.hy) / 40);
          const wave = 0.5 + 0.5 * Math.sin(t * 1.2 - p.hx * 0.01 - p.hy * 0.006);
          g.fillStyle = c.col(p.i, 0.14 + 0.2 * wave + 0.6 * off);
          g.fillText(p.ch, p.x, p.y);
        }
        g.textAlign = 'left';
        g.textBaseline = 'alphabetic';
      },
    };
  },

  // Pixel-Tetris: Blöcke fallen und bauen „WEB.“, kurz stehen, dann zerfällt alles
  tetris: (c) => {
    const WORD = ['W', 'E', 'B', '.'];
    let cells: { x: number; y: number; i: number }[] = [];
    let size = 16;
    let ox = 0;
    let oy = 0;
    const build = () => {
      const cols = WORD.length * 6 - 1;
      const { x0, w, y0, h } = stage(c);
      size = Math.max(8, Math.floor(Math.min(w / cols, h / 10)));
      ox = x0 + (w - cols * size) / 2;
      oy = y0 + (h - 7 * size) / 2;
      cells = [];
      WORD.forEach((ch, k) =>
        FONT[ch].forEach((row, r) => [...row].forEach((b, col) => b === '1' && cells.push({ x: k * 6 + col, y: r, i: k % 5 }))),
      );
      // unten zuerst, wie beim Stapeln
      cells.sort((a, b) => b.y - a.y || a.x - b.x);
    };
    build();
    const PER = 0.09;
    return {
      resize: build,
      still: 1,
      frame(t) {
        const g = c.g;
        g.globalCompositeOperation = 'source-over';
        g.fillStyle = '#06070c';
        g.fillRect(0, 0, c.W(), c.H());
        const cycle = cells.length * PER + 4;
        const lt = t % cycle;
        const fall = 0.55;
        // Raster
        g.strokeStyle = 'rgba(255,255,255,0.04)';
        for (let x = 0; x <= WORD.length * 6 - 1; x++) {
          g.beginPath();
          g.moveTo(ox + x * size, oy - size * 4);
          g.lineTo(ox + x * size, oy + 7 * size);
          g.stroke();
        }
        cells.forEach((cell, k) => {
          const start = Math.floor(k / 4) * PER * 4;
          const p = clamp01((lt - start) / fall);
          if (p <= 0) return;
          const done = lt > cells.length * PER + 2.6;
          const drop = done ? ease(clamp01((lt - cells.length * PER - 2.6) / 1.2)) : 0;
          const y = oy - size * 10 * (1 - ease(p)) + cell.y * size + drop * (c.H() - oy) * (0.5 + (cell.x % 3) * 0.25);
          g.fillStyle = c.col(cell.i + 0.3, done ? 1 - drop : 1);
          g.fillRect(ox + cell.x * size + 1, y + 1, size - 2, size - 2);
          g.fillStyle = `rgba(255,255,255,${0.25 * (done ? 1 - drop : 1)})`;
          g.fillRect(ox + cell.x * size + 1, y + 1, size - 2, 3);
        });
        if (!stage(c).wide) veil(c, 0.95);
      },
    };
  },

  // Retro-Raycaster: langsamer Gang durch ein Pixel-Labyrinth (Hommage an Death Grid 3D)
  raycast: (c) => {
    const MAP = [
      '1111111111111111',
      '1000000300000001',
      '1011110111101101',
      '1010000100001001',
      '1010220102201011',
      '1000000000000001',
      '1101110111011101',
      '1000010000010001',
      '1033010440010331',
      '1000000000000001',
      '1011101111101101',
      '1000100000100001',
      '1110101220101011',
      '1000000000000001',
      '1111111111111111',
    ];
    const wall = (x: number, y: number) => MAP[Math.floor(y)]?.[Math.floor(x)] ?? '1';
    let px = 1.5;
    let py = 5.5;
    let ang = 0;
    const off = document.createElement('canvas');
    const og = off.getContext('2d')!;
    return {
      still: 1,
      frame(_t, dt) {
        const RW = Math.max(120, Math.round(c.W() / 5));
        const RH = Math.max(70, Math.round(c.H() / 5));
        if (off.width !== RW || off.height !== RH) {
          off.width = RW;
          off.height = RH;
        }
        // Autopilot: geradeaus, vor Wänden in die freiere Richtung drehen
        const look = (a: number) => {
          let d = 0;
          while (d < 6 && wall(px + Math.cos(a) * d, py + Math.sin(a) * d) === '0') d += 0.1;
          return d;
        };
        const ahead = look(ang);
        if (ahead < 1.2) ang += (look(ang + 0.9) > look(ang - 0.9) ? 1 : -1) * dt * 1.6;
        else {
          const sp = dt * 0.9;
          if (wall(px + Math.cos(ang) * 0.4, py) === '0') px += Math.cos(ang) * sp;
          if (wall(px, py + Math.sin(ang) * 0.4) === '0') py += Math.sin(ang) * sp;
        }
        const sky = og.createLinearGradient(0, 0, 0, RH / 2);
        sky.addColorStop(0, '#05060c');
        sky.addColorStop(1, c.col(4, 0.18));
        og.fillStyle = sky;
        og.fillRect(0, 0, RW, RH / 2);
        og.fillStyle = '#0b0b10';
        og.fillRect(0, RH / 2, RW, RH / 2);
        for (let x = 0; x < RW; x++) {
          const a = ang + (x / RW - 0.5) * 1.1;
          let d = 0;
          let hit = '0';
          while (d < 16) {
            d += 0.02;
            hit = wall(px + Math.cos(a) * d, py + Math.sin(a) * d);
            if (hit !== '0') break;
          }
          const corr = d * Math.cos(a - ang);
          const hgt = Math.min(RH, RH / corr);
          const shade = Math.max(0.08, 0.7 - corr / 10);
          og.fillStyle = c.col((Number(hit) - 1) % 5, shade);
          og.fillRect(x, (RH - hgt) / 2, 1, hgt);
        }
        const g = c.g;
        g.globalCompositeOperation = 'source-over';
        g.imageSmoothingEnabled = false;
        g.fillStyle = '#05060c';
        g.fillRect(0, 0, c.W(), c.H());
        g.globalAlpha = 0.5;
        g.drawImage(off, 0, 0, c.W(), c.H());
        g.globalAlpha = 1;
        g.imageSmoothingEnabled = true;
        veil(c, 0.7);
      },
    };
  },

  // 6D-Flug: schwereloser Flug durch einen rollenden Drahtgitter-Tunnel (Hommage an Descent/Corefall)
  descent: (c) => {
    const N = 26;
    return {
      still: 1,
      frame(t) {
        const g = c.g;
        g.globalCompositeOperation = 'source-over';
        g.fillStyle = '#04050a';
        g.fillRect(0, 0, c.W(), c.H());
        const cx = c.W() * (c.W() > 760 ? 0.66 : 0.5);
        const cy = c.H() * 0.5;
        const F = Math.min(c.W(), c.H()) * 0.9;
        const speed = 2.2;
        const pts: [number, number][][] = [];
        for (let i = 0; i < N; i++) {
          const z = N - ((t * speed + i) % N);
          const zz = z + Math.floor(t * speed);
          const roll = zz * 0.08 + t * 0.15;
          const sx = Math.sin(zz * 0.25) * 1.4;
          const sy = Math.cos(zz * 0.19) * 1.0;
          const ring: [number, number][] = [];
          for (let k = 0; k < 4; k++) {
            const a = roll + (k * TAU) / 4 + Math.PI / 4;
            const x = (Math.cos(a) * 2 + sx - Math.sin(t * 0.25) * 1.4) / z;
            const y = (Math.sin(a) * 2 + sy - Math.cos(t * 0.19) * 1.0) / z;
            ring.push([cx + x * F * 0.5, cy + y * F * 0.5]);
          }
          pts.push(ring);
        }
        const order = pts.map((r, i) => ({ r, z: N - ((t * speed + i) % N) })).sort((a, b) => b.z - a.z);
        order.forEach(({ r, z }, j) => {
          const a = clamp01(1 - z / N) * 0.9;
          g.strokeStyle = c.col((j / N) * 4, a);
          g.lineWidth = 1 + (1 - z / N) * 1.5;
          g.beginPath();
          r.forEach(([x, y], k) => (k ? g.lineTo(x, y) : g.moveTo(x, y)));
          g.closePath();
          g.stroke();
          const nx = order[j + 1]?.r;
          if (nx)
            r.forEach(([x, y], k) => {
              g.strokeStyle = c.col((j / N) * 4, a * 0.5);
              g.beginPath();
              g.moveTo(x, y);
              g.lineTo(nx[k][0], nx[k][1]);
              g.stroke();
            });
        });
      },
    };
  },

  // Synthwave-Straße: Neon-Sonne, Bergkette, endloses Gitter
  synthwave: (c) => {
    return {
      still: 1,
      frame(t) {
        const g = c.g;
        const W = c.W();
        const H = c.H();
        const hz = H * 0.58;
        g.globalCompositeOperation = 'source-over';
        const sky = g.createLinearGradient(0, 0, 0, hz);
        sky.addColorStop(0, '#07040f');
        sky.addColorStop(1, '#2a0b33');
        g.fillStyle = sky;
        g.fillRect(0, 0, W, hz);
        // Sonne mit Streifen
        const sx = W * (W > 760 ? 0.7 : 0.5);
        const R = Math.min(W, H) * 0.2;
        const sg = g.createLinearGradient(0, hz - R * 2, 0, hz);
        sg.addColorStop(0, c.col(2));
        sg.addColorStop(1, c.col(3));
        g.save();
        g.beginPath();
        g.arc(sx, hz - R * 0.6, R, 0, TAU);
        g.clip();
        g.fillStyle = sg;
        g.fillRect(sx - R, hz - R * 2, R * 2, R * 2);
        g.fillStyle = '#2a0b33';
        for (let i = 0; i < 7; i++) {
          const y = hz - R * 0.6 + i * R * 0.16 + ((t * 8) % (R * 0.16));
          g.fillRect(sx - R, y, R * 2, 2 + i * 1.3);
        }
        g.restore();
        // Berge
        g.fillStyle = '#12061c';
        g.beginPath();
        g.moveTo(0, hz);
        for (let x = 0; x <= W; x += 20) g.lineTo(x, hz - 20 - 60 * Math.abs(Math.sin(x * 0.006)) * vnoise(x * 0.01, 3));
        g.lineTo(W, hz);
        g.fill();
        // Boden + Gitter
        g.fillStyle = '#05020a';
        g.fillRect(0, hz, W, H - hz);
        g.strokeStyle = c.col(1, 0.75);
        g.lineWidth = 1.2;
        for (let i = 0; i < 18; i++) {
          const z = (i + ((t * 1.4) % 1)) / 18;
          const y = hz + (H - hz) * z * z;
          g.globalAlpha = z;
          g.beginPath();
          g.moveTo(0, y);
          g.lineTo(W, y);
          g.stroke();
        }
        g.globalAlpha = 1;
        for (let k = -16; k <= 16; k++) {
          g.beginPath();
          g.moveTo(sx + k * 8, hz);
          g.lineTo(sx + k * W * 0.12, H);
          g.stroke();
        }
        const glow = g.createLinearGradient(0, hz - 30, 0, hz + 30);
        glow.addColorStop(0, 'rgba(0,0,0,0)');
        glow.addColorStop(0.5, c.col(3, 0.35));
        glow.addColorStop(1, 'rgba(0,0,0,0)');
        g.fillStyle = glow;
        g.fillRect(0, hz - 30, W, 60);
        veil(c, 0.55);
      },
    };
  },

  // Papierschichten: ausgeschnittene Papierlagen mit weichen Schatten, Parallaxe zum Zeiger
  paper: (c) => {
    const L = 6;
    return {
      still: 1,
      frame(t) {
        const g = c.g;
        const W = c.W();
        const H = c.H();
        g.globalCompositeOperation = 'source-over';
        g.fillStyle = '#0a0b12';
        g.fillRect(0, 0, W, H);
        const m = ghost(c, t);
        const mx = (m.x / W - 0.5) * 2;
        const my = (m.y / H - 0.5) * 2;
        for (let l = 0; l < L; l++) {
          const depth = (l + 1) / L;
          const base = H * (0.25 + l * 0.12);
          const ox = mx * 18 * depth;
          const oy = my * 10 * depth;
          g.save();
          g.shadowColor = 'rgba(0,0,0,0.55)';
          g.shadowBlur = 24;
          g.shadowOffsetY = 6;
          g.fillStyle = c.col((l / (L - 1)) * 4, 0.1 + 0.05 * l);
          g.beginPath();
          g.moveTo(-40, H + 40);
          for (let x = -40; x <= W + 40; x += 16) {
            const y =
              base + Math.sin(x * 0.004 + l * 1.3 + t * 0.12) * 40 * (1 - depth * 0.4) + Math.sin(x * 0.011 - l + t * 0.07) * 16 + oy;
            g.lineTo(x + ox, y);
          }
          g.lineTo(W + 40, H + 40);
          g.closePath();
          g.fill();
          g.restore();
        }
        veil(c, 0.45);
      },
    };
  },

  // Tageszeit-Himmel: folgt der Uhrzeit in Berlin (Sonnenstand nach Datum berechnet), nachts Sterne
  sky: (c) => {
    const stars = Array.from({ length: 140 }, () => ({ x: Math.random(), y: Math.random() * 0.7, r: rand(0.5, 1.6), p: rand(0, TAU) }));
    const clouds = Array.from({ length: 6 }, (_, i) => ({
      x: Math.random(),
      y: rand(0.12, 0.5),
      s: rand(0.6, 1.3),
      v: rand(0.004, 0.01),
      i,
    }));
    let info = berlin();
    let next = 0;
    const KEYS: [number, string, string][] = [
      [-1.5, '#040714', '#0a1230'],
      [0, '#1a1c3a', '#b5617a'],
      [1.5, '#123a6b', '#c98a5e'],
      [3, '#0f3d6e', '#2f6fa8'],
    ];
    const mix = (a: string, b: string, f: number) => {
      const p = [1, 3, 5].map((i) => parseInt(a.slice(i, i + 2), 16));
      const q = [1, 3, 5].map((i) => parseInt(b.slice(i, i + 2), 16));
      return `rgb(${p.map((v, i) => Math.round(v + (q[i] - v) * f)).join(',')})`;
    };
    return {
      still: 1,
      frame(t) {
        if (t > next) {
          info = berlin();
          next = t + 30;
        }
        const g = c.g;
        const W = c.W();
        const H = c.H();
        // Abstand zum nächsten Sonnenauf- oder -untergang in Stunden (−: Nacht, +: Tag)
        const s =
          info.now < info.rise
            ? info.now - info.rise
            : info.now > info.set
              ? info.set - info.now
              : Math.min(info.now - info.rise, info.set - info.now);
        let k = 0;
        while (k < KEYS.length - 2 && s > KEYS[k + 1][0]) k++;
        const f = clamp01((s - KEYS[k][0]) / (KEYS[k + 1][0] - KEYS[k][0]));
        const top = mix(KEYS[k][1], KEYS[k + 1][1], f);
        const hor = mix(KEYS[k][2], KEYS[k + 1][2], f);
        g.globalCompositeOperation = 'source-over';
        const sky = g.createLinearGradient(0, 0, 0, H);
        sky.addColorStop(0, top);
        sky.addColorStop(1, hor);
        g.fillStyle = sky;
        g.fillRect(0, 0, W, H);
        const night = clamp01(-s / 1.2);
        for (const st of stars) {
          g.fillStyle = `rgba(235,240,255,${night * (0.4 + 0.4 * Math.sin(t + st.p))})`;
          g.fillRect(st.x * W, st.y * H, st.r, st.r);
        }
        // Sonne bzw. Mond auf einem Bogen
        const day = info.now >= info.rise && info.now <= info.set;
        const prog = day
          ? (info.now - info.rise) / (info.set - info.rise)
          : ((info.now - info.set + 24) % 24) / (24 - (info.set - info.rise));
        const bx = W * (0.15 + 0.75 * prog);
        const by = H * (0.85 - 0.6 * Math.sin(Math.PI * prog));
        const rg = g.createRadialGradient(bx, by, 0, bx, by, day ? 120 : 70);
        rg.addColorStop(0, day ? 'rgba(255,236,190,0.95)' : 'rgba(230,236,255,0.9)');
        rg.addColorStop(0.15, day ? 'rgba(255,214,140,0.6)' : 'rgba(210,220,250,0.35)');
        rg.addColorStop(1, 'rgba(0,0,0,0)');
        g.fillStyle = rg;
        g.fillRect(bx - 130, by - 130, 260, 260);
        for (const cl of clouds) {
          cl.x = (cl.x + cl.v * (1 / 60)) % 1.3;
          const x = (cl.x - 0.15) * W;
          const y = cl.y * H;
          g.fillStyle = day ? 'rgba(255,255,255,0.08)' : 'rgba(150,160,190,0.06)';
          for (let j = 0; j < 4; j++) {
            g.beginPath();
            g.ellipse(x + j * 40 * cl.s, y + Math.sin(j) * 8, 70 * cl.s, 22 * cl.s, 0, 0, TAU);
            g.fill();
          }
        }
        g.font = `600 12px ${monoFont()}`;
        g.fillStyle = 'rgba(235,240,248,0.7)';
        g.textAlign = 'right';
        g.fillText(`Berlin · ${info.label}`, W - 24, H - 22);
        g.textAlign = 'left';
      },
    };
  },

  // Wetter Berlin: echtes Wetter über die eigene Route /api/wetter (keine Besucherdaten an Dritte); ohne Daten ruhig bewölkt.
  // Tag/Nacht: von der Route, sonst aus dem Sonnenstand über Berlin (z. B. GitHub Pages, dort gibt es keine Route).
  // Wetter-Vorschau (Einstellungen): Wetterlage, Tageszeit und Wind fest wählen, um alle Darstellungen zu testen.
  weather: (c) => {
    const pv = typeof c.cfg.wx === 'string' && c.cfg.wx !== 'live' ? c.cfg.wx : null;
    const pvDay = c.cfg.wxDay === 'tag' ? true : c.cfg.wxDay === 'nacht' ? false : null;
    const pvWind = typeof c.cfg.wxWind === 'number' ? c.cfg.wxWind : null;
    type W = { ok: boolean; t?: number; code?: number; day?: boolean; wind?: number };
    let w: W = { ok: false };
    if (typeof fetch !== 'undefined')
      fetch(`${process.env.NEXT_PUBLIC_BASE_PATH ?? ''}/api/wetter`)
        .then((r) => (r.ok ? r.json() : { ok: false }))
        .then((d: W) => (w = d))
        .catch(() => {});
    const sunDay = () => {
      const b = berlin();
      return b.now >= b.rise && b.now < b.set;
    };
    let dayNow = sunDay();
    let nextSun = 0;
    const kind = () => {
      if (pv) return pv;
      const code = w.code ?? 3;
      if (code >= 95) return 'gewitter';
      if ((code >= 71 && code <= 77) || code === 85 || code === 86) return 'schnee';
      if ((code >= 51 && code <= 67) || (code >= 80 && code <= 82)) return 'regen';
      if (code === 45 || code === 48) return 'nebel';
      if (code <= 1) return 'klar';
      return 'wolken';
    };
    const ICON: Record<string, string> = { klar: '☀', wolken: '☁', regen: '☂', schnee: '❄', nebel: '≋', gewitter: 'ϟ' };

    // Wolken-Sprite: viele weiche, überlappende Kreise (Kumulus-Form, unten flacher) — einmal gerendert, dann nur
    // noch skaliert gezeichnet. Je Farbe ein Sprite.
    const sprites = new Map<string, HTMLCanvasElement>();
    const sprite = (col: string) => {
      let cv = sprites.get(col);
      if (cv) return cv;
      cv = document.createElement('canvas');
      cv.width = 360;
      cv.height = 180;
      const sg = cv.getContext('2d')!;
      let seed = 7;
      const r = () => (seed = (seed * 16807) % 2147483647) / 2147483647;
      const puffs: [number, number, number][] = [];
      for (let i = 0; i < 16; i++) {
        const x = 70 + r() * 220;
        const top = 1 - Math.abs(x - 180) / 120; // in der Mitte höher
        puffs.push([x, 118 - r() * 34 * Math.max(0.2, top), 26 + r() * 30 * Math.max(0.4, top)]);
      }
      for (const [x, y, rad] of puffs) {
        const gr = sg.createRadialGradient(x, y, 0, x, y, rad);
        gr.addColorStop(0, col.replace('A)', '0.55)'));
        gr.addColorStop(0.55, col.replace('A)', '0.32)'));
        gr.addColorStop(1, col.replace('A)', '0)'));
        sg.fillStyle = gr;
        sg.beginPath();
        sg.arc(x, y, rad, 0, TAU);
        sg.fill();
      }
      sprites.set(col, cv);
      return cv;
    };
    // Wolken in drei Tiefen (hinten klein/langsam/blass, vorn groß/schneller)
    const clouds = Array.from({ length: 14 }, (_, i) => ({
      x: Math.random() * 1.6,
      y: rand(0.04, 0.42),
      s: rand(0.7, 1.4),
      l: i % 3,
    }));
    const drops: { x: number; y: number; v: number }[] = [];
    let flash = 0;
    let bolt: { x: number; pts: [number, number][] } | null = null;

    return {
      still: 30,
      frame(t, dt) {
        const g = c.g;
        const W = c.W();
        const H = c.H();
        const k = kind();
        if (t > nextSun) {
          dayNow = sunDay();
          nextSun = t + 60;
        }
        const day = pvDay ?? w.day ?? dayNow;
        const wind = (pvWind ?? w.wind ?? 10) / 10;
        const dark = k === 'gewitter' || k === 'regen';
        g.globalCompositeOperation = 'source-over';

        // Himmel je Wetterlage und Tageszeit
        const SKY: Record<string, [string, string, string, string]> = {
          // [Tag oben, Tag unten, Nacht oben, Nacht unten]
          klar: ['#0f3a6a', '#3b7cb8', '#03050d', '#0b1530'],
          wolken: ['#3a4a5e', '#6d7d90', '#06080f', '#141a28'],
          regen: ['#2a3340', '#4a5564', '#04060b', '#10151f'],
          schnee: ['#5a6676', '#9aa5b3', '#0a0d16', '#1d2433'],
          nebel: ['#59626d', '#8a929b', '#0b0e14', '#1e232b'],
          gewitter: ['#151a24', '#2a3140', '#020308', '#0a0d16'],
        };
        const sk = SKY[k] ?? SKY.wolken;
        const sky = g.createLinearGradient(0, 0, 0, H);
        sky.addColorStop(0, day ? sk[0] : sk[2]);
        sky.addColorStop(1, day ? sk[1] : sk[3]);
        g.fillStyle = sky;
        g.fillRect(0, 0, W, H);

        // Sterne nachts (bei klarem/leicht bewölktem Himmel)
        if (!day && (k === 'klar' || k === 'wolken'))
          for (let i = 0; i < 90; i++) {
            const sx = ((Math.sin(i * 91.7) + 1) / 2) * W;
            const sy = ((Math.sin(i * 47.3) + 1) / 2) * H * 0.6;
            g.fillStyle = `rgba(230,236,255,${(0.25 + 0.35 * Math.abs(Math.sin(t * 0.8 + i))) * (k === 'klar' ? 1 : 0.4)})`;
            g.fillRect(sx, sy, 1.4, 1.4);
          }
        // Sonne / Mond (bei Wolken nur als Schimmer dahinter)
        if (k === 'klar' || k === 'wolken') {
          const sx = W * 0.78;
          const sy = H * 0.26;
          const a = k === 'klar' ? 1 : 0.45;
          const rg = g.createRadialGradient(sx, sy, 0, sx, sy, 170);
          rg.addColorStop(0, day ? `rgba(255,236,180,${0.95 * a})` : `rgba(228,234,255,${0.9 * a})`);
          rg.addColorStop(0.18, day ? `rgba(255,205,130,${0.45 * a})` : `rgba(200,212,250,${0.22 * a})`);
          rg.addColorStop(1, 'rgba(0,0,0,0)');
          g.fillStyle = rg;
          g.fillRect(sx - 180, sy - 180, 360, 360);
        }

        // Wolken (nicht bei klarem Himmel; bei Nebel nur wenige, blass)
        if (k !== 'klar') {
          const col =
            k === 'gewitter'
              ? 'rgba(52,58,74,A)'
              : dark
                ? day
                  ? 'rgba(120,130,146,A)'
                  : 'rgba(58,66,82,A)'
                : day
                  ? 'rgba(236,240,246,A)'
                  : 'rgba(92,102,122,A)';
          const sp = sprite(col);
          const n = k === 'nebel' ? 5 : k === 'wolken' ? 10 : clouds.length;
          for (let i = 0; i < n; i++) {
            const cl = clouds[i];
            const depth = 0.55 + cl.l * 0.3; // 0.55 … 1.15
            const x = ((cl.x + t * 0.006 * wind * depth) % 1.6) - 0.3;
            const w2 = 360 * cl.s * depth * (W / 1280 + 0.4);
            const h2 = w2 / 2;
            g.globalAlpha = (k === 'nebel' ? 0.35 : 0.55 + cl.l * 0.2) * (dark ? 1.1 : 1);
            g.drawImage(sp, x * W - w2 / 2, cl.y * H - h2 / 2, w2, h2);
          }
          g.globalAlpha = 1;
        }

        // Nebel: weiche, langsam ziehende Schwaden über der unteren Hälfte + Dunst nach unten dichter
        if (k === 'nebel') {
          const haze = g.createLinearGradient(0, H * 0.25, 0, H);
          haze.addColorStop(0, 'rgba(200,206,214,0)');
          haze.addColorStop(1, day ? 'rgba(206,212,220,0.55)' : 'rgba(120,128,140,0.4)');
          g.fillStyle = haze;
          g.fillRect(0, 0, W, H);
          const sp = sprite(day ? 'rgba(226,230,236,A)' : 'rgba(130,138,150,A)');
          for (let i = 0; i < 7; i++) {
            const depth = 0.6 + (i % 3) * 0.25;
            const x = (((i * 0.37 + t * 0.004 * (0.5 + wind * 0.5) * depth) % 1.8) - 0.4) * W;
            const y = H * (0.38 + i * 0.075) + Math.sin(t * 0.25 + i) * 8;
            const w2 = W * (0.7 + (i % 2) * 0.3);
            g.globalAlpha = 0.5;
            g.drawImage(sp, x - w2 / 2, y - 60, w2, 120); // flach gezogen = Schwade
          }
          g.globalAlpha = 1;
        }

        // Niederschlag
        if (k === 'regen' || k === 'schnee' || k === 'gewitter') {
          const n = k === 'schnee' ? 220 : 380;
          while (drops.length < n) drops.push({ x: rand(0, W), y: rand(-H, H), v: rand(0.7, 1.3) });
          drops.length = n;
          g.strokeStyle = 'rgba(190,210,240,0.35)';
          g.lineWidth = 1;
          for (const d of drops) {
            if (k === 'schnee') {
              d.y += d.v * 40 * dt;
              d.x += Math.sin(t + d.v * 9) * 0.4 + wind * 0.3;
              g.fillStyle = `rgba(245,248,255,${0.5 + d.v * 0.3})`;
              g.beginPath();
              g.arc(d.x, d.y, 1 + d.v, 0, TAU);
              g.fill();
            } else {
              d.y += d.v * 520 * dt;
              d.x += wind * 60 * dt;
              g.beginPath();
              g.moveTo(d.x, d.y);
              g.lineTo(d.x - wind * 3, d.y - 12 * d.v);
              g.stroke();
            }
            if (d.y > H || d.x > W + 40) {
              d.y = rand(-40, 0);
              d.x = rand(-40, W);
            }
          }
        }
        // Gewitter: Blitz mit Verästelung + Aufhellung
        if (k === 'gewitter') {
          if (!bolt && Math.random() < dt * 0.22) {
            const bx = rand(W * 0.45, W * 0.95);
            const pts: [number, number][] = [[bx, 0]];
            let x = bx;
            for (let y = 0; y < H * 0.7; y += rand(18, 36)) pts.push([(x += rand(-22, 22)), y]);
            bolt = { x: bx, pts };
            flash = 1;
          }
          flash = Math.max(0, flash - dt * 2.6);
          if (flash > 0) {
            g.fillStyle = `rgba(220,228,255,${flash * 0.3})`;
            g.fillRect(0, 0, W, H);
            if (bolt && flash > 0.5) {
              g.strokeStyle = `rgba(240,244,255,${flash})`;
              g.lineWidth = 2;
              g.beginPath();
              bolt.pts.forEach(([x, y], i) => (i ? g.lineTo(x, y) : g.moveTo(x, y)));
              g.stroke();
            }
          } else bolt = null;
        }

        // Hero-Text (links) lesbar halten: helle Tageshimmel (Nebel, Schnee, Wolken) links abdunkeln
        veil(c, day ? (k === 'klar' || dark ? 0.35 : 0.6) : 0.2);

        g.font = `600 12px ${monoFont()}`;
        g.fillStyle = 'rgba(235,240,248,0.72)';
        g.textAlign = 'right';
        const live = w.ok && typeof w.t === 'number' ? `Berlin · ${ICON[k]} ${Math.round(w.t)} °C` : 'Berlin';
        // Vorschau deutlich kennzeichnen, damit sie nicht für echtes Wetter gehalten wird
        g.fillText(
          pv || pvDay !== null || pvWind !== null
            ? `${pv ? (ICON[k] ?? '') : ''} ${document.documentElement.lang.startsWith('en') ? 'Preview' : 'Vorschau'} · ${live}`
            : live,
          W - 24,
          H - 22,
        );
        g.textAlign = 'left';
      },
    };
  },
};

/** Für Tests: alle Schlüssel dieser Welle. */
export const MORE_KEYS = [...Object.keys(MORE_SHADERS), ...Object.keys(MORE_2D)];

export type { ExtraRenderer };
