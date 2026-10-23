/**
 * Renderer der zusätzlichen Hero-Animationen (Metadaten: meta.ts). Wird per dynamischem import() erst geladen, wenn
 * einer dieser Modi aktiv ist. Alle Modi nutzen die Hero-Palette des Modus (Einstellungen → Farben, 5 Farben).
 *  - WebGL: Vollbild-Fragment-Shader mit Rausch-/Paletten-Helfern (preserveDrawingBuffer für den Auto-Kontrast).
 *  - Canvas 2D: Partikel, Simulationen (Game of Life, Gray-Scott), generative Linien.
 * runExtra() übernimmt Größe, Sichtbarkeit (nur sichtbar + Tab aktiv), „30 fps“ und „Animationen aus“ (Standbild).
 */

// Zweite Welle (Wunsch vom 17.10.2026) in eigener Datei, nutzt die Helfer von hier (Zyklus nur zur Laufzeit)
import { BUILD_2D, SPLASH_2D } from './build';
import { HORIZON_SHADERS } from './horizons';
import { MORE_2D, MORE_SHADERS } from './renderers2';

export type Rgb = [number, number, number];

export interface ExtraRenderer {
  frame(t: number, dt: number): void;
  resize?(w: number, h: number): void;
  dispose?(): void;
  /** Wie viele Schritte das Standbild bei „Animationen aus“ braucht (Simulationen > 1). */
  still?: number;
}

export const hexRgb = (h: string): Rgb => {
  const x = h.replace('#', '');
  const v = x.length === 3 ? [...x].map((c) => c + c).join('') : x.padEnd(6, '0');
  return [parseInt(v.slice(0, 2), 16), parseInt(v.slice(2, 4), 16), parseInt(v.slice(4, 6), 16)];
};

/* ------------------------------------------------------------------------------------------------ WebGL ----------- */

const VS = 'attribute vec2 p;void main(){gl_Position=vec4(p,0.0,1.0);}';
const FS_HEAD = `precision highp float;
uniform vec2 u_res;uniform float u_time;uniform vec3 u_p[5];uniform vec3 u_mouse;
float hash(float n){return fract(sin(n)*43758.5453123);}
float hash1(vec2 p){return fract(sin(dot(p,vec2(127.1,311.7)))*43758.5453);}
vec2 hash2(vec2 p){return fract(sin(vec2(dot(p,vec2(127.1,311.7)),dot(p,vec2(269.5,183.3))))*43758.5453);}
float noise(vec2 p){vec2 i=floor(p);vec2 f=fract(p);vec2 u=f*f*(3.0-2.0*f);
 return mix(mix(hash1(i),hash1(i+vec2(1.0,0.0)),u.x),mix(hash1(i+vec2(0.0,1.0)),hash1(i+vec2(1.0,1.0)),u.x),u.y);}
float fbm(vec2 p){float v=0.0;float a=0.5;for(int i=0;i<5;i++){v+=a*noise(p);p=p*2.03+vec2(1.7,9.2);a*=0.5;}return v;}
vec3 pal(float x){x=clamp(x,0.0,1.0)*4.0;vec3 c=mix(u_p[0],u_p[1],clamp(x,0.0,1.0));c=mix(c,u_p[2],clamp(x-1.0,0.0,1.0));
 c=mix(c,u_p[3],clamp(x-2.0,0.0,1.0));return mix(c,u_p[4],clamp(x-3.0,0.0,1.0));}
vec3 palw(float x){return pal(abs(fract(x*0.5)*2.0-1.0));}
`;

const SHADERS: Record<string, string> = {
  // Kaleidoskop: 8-fach gespiegeltes, verwirbeltes Rauschen
  kaleido: `void main(){vec2 uv=(gl_FragCoord.xy-0.5*u_res)/u_res.y;float t=u_time*0.12;
 float r=length(uv);float a=atan(uv.y,uv.x);float k=6.28318/8.0;a=mod(a,k);a=abs(a-k*0.5);
 vec2 p=vec2(cos(a),sin(a))*r*2.2+vec2(t,t*0.6);float w=fbm(p*1.4-t);float n=fbm(p*2.0+w*1.8);
 vec3 col=palw(n*1.6+r*0.4+t*0.15)*(0.25+1.1*n*n);col+=palw(n+0.5)*pow(n,6.0)*1.2;
 col*=smoothstep(1.35,0.05,r);gl_FragColor=vec4(col*0.9,1.0);}`,
  // Hypertunnel: Flug durch Ringe und Speichen
  tunnel: `void main(){vec2 uv=(gl_FragCoord.xy-0.5*u_res)/u_res.y;float r=max(length(uv),0.001);
 float a=atan(uv.y,uv.x)/6.28318;float z=0.32/r+u_time*0.45;float ring=pow(0.5+0.5*sin(z*9.0),6.0);
 float sp=pow(0.5+0.5*sin(a*36.0+z*0.8),10.0);float n=fbm(vec2(a*12.0,z*0.7));
 vec3 col=palw(z*0.06+a*0.5)*(ring*0.9+sp*0.6+n*0.25);col*=smoothstep(0.02,0.45,r)*1.3;
 col+=palw(z*0.05)*0.08/(r*6.0+0.4);gl_FragColor=vec4(col,1.0);}`,
  // Glasmosaik: wandernde Voronoi-Zellen wie Kirchenfenster
  mosaic: `void main(){vec2 uv=gl_FragCoord.xy/u_res.y*5.0;vec2 i=floor(uv);vec2 f=fract(uv);
 float md=8.0;float md2=8.0;vec2 mid=vec2(0.0);
 for(int y=-1;y<=1;y++){for(int x=-1;x<=1;x++){vec2 g=vec2(float(x),float(y));vec2 o=hash2(i+g);
  o=0.5+0.42*sin(u_time*0.35+6.28318*o);vec2 d=g+o-f;float dd=dot(d,d);
  if(dd<md){md2=md;md=dd;mid=i+g;}else if(dd<md2){md2=dd;}}}
 float edge=smoothstep(0.0,0.08,sqrt(md2)-sqrt(md));float h=hash1(mid);
 float glow=0.55+0.45*sin(u_time*0.8+h*12.0);vec3 col=pal(h)*(0.35+0.65*glow)*edge;
 col*=0.75+0.35*fbm(uv*3.0+u_time*0.1);col+=(1.0-edge)*vec3(0.02,0.018,0.03);gl_FragColor=vec4(col,1.0);}`,
  // Topografie: wandernde Höhenlinien
  topo: `void main(){vec2 p=gl_FragCoord.xy/u_res.y*2.2;float t=u_time*0.04;
 float n=fbm(p+vec2(t,t*0.7)+fbm(p*1.3-t)*0.8);float d=abs(fract(n*16.0)-0.5)*2.0;
 float line=smoothstep(0.8,0.97,d);float major=smoothstep(0.9,0.99,abs(fract(n*4.0)-0.5)*2.0);
 vec3 col=pal(n)*line*0.85+pal(n+0.15)*major*0.6+pal(n)*0.04;gl_FragColor=vec4(col,1.0);}`,
  // Flüssigmetall: gespiegelte Chromwellen in Palettenfarben
  metal: `void main(){vec2 p=gl_FragCoord.xy/u_res.y*1.6;float t=u_time*0.12;
 vec2 q=vec2(fbm(p+t),fbm(p-t+3.1));float n=fbm(p+2.2*q+t*0.5);float s=sin(n*14.0+t*2.0);
 vec3 base=mix(vec3(0.05),vec3(0.9),smoothstep(-0.7,1.0,s));vec3 col=base*mix(vec3(1.0),pal(n*1.2),0.6);
 col+=pow(max(s,0.0),24.0)*0.7;col*=0.8;gl_FragColor=vec4(col,1.0);}`,
  // Prisma: ein Lichtstrahl fächert in Spektralbänder auf
  prism: `void main(){vec2 uv=gl_FragCoord.xy/u_res;float t=u_time*0.25;vec3 col=vec3(0.0);
 float sx=0.42;float beam=exp(-pow((uv.y-0.5-0.03*sin(t))/0.006,2.0))*smoothstep(sx,0.0,uv.x);col+=vec3(1.0)*beam*0.9;
 for(int i=0;i<7;i++){float fi=float(i)/6.0;float spread=(fi-0.5)*0.55*(uv.x-sx);
  float y=0.5+spread+0.04*sin(t+fi*3.0+uv.x*4.0);float w=0.006+0.05*max(uv.x-sx,0.0);
  float b=exp(-pow((uv.y-y)/w,2.0))*smoothstep(sx-0.02,sx+0.06,uv.x);col+=pal(fi)*b*0.75;}
 vec2 c=vec2(sx,0.5);vec2 d=(uv-c)*vec2(u_res.x/u_res.y,1.0);float tri=step(abs(d.x)*1.7,0.12-d.y*0.0)*step(abs(d.y),0.14-abs(d.x)*1.2);
 col+=vec3(0.12,0.13,0.18)*tri+vec3(0.3)*tri*pow(fbm(d*20.0+t),3.0);col+=pal(0.5)*0.03;gl_FragColor=vec4(col,1.0);}`,
  // Moiré: zwei wandernde Ringsysteme überlagern sich
  moire: `void main(){vec2 p=(gl_FragCoord.xy-0.5*u_res)/u_res.y;float t=u_time*0.25;
 vec2 c1=vec2(sin(t)*0.45,cos(t*0.7)*0.22);vec2 c2=vec2(-sin(t*0.8)*0.45,sin(t*0.5)*0.26);
 float a=sin(length(p-c1)*95.0);float b=sin(length(p-c2)*95.0);float m=smoothstep(0.2,1.0,a*b);
 vec3 col=palw(length(p)*0.8-t*0.2)*m*0.85+palw(t*0.1)*0.04;col*=smoothstep(1.2,0.2,length(p));gl_FragColor=vec4(col,1.0);}`,
};

export function glMode(body: string) {
  return (cv: HTMLCanvasElement, pal: readonly string[], ptr?: Pointer): ExtraRenderer | null => {
    let gl: WebGLRenderingContext | null = null;
    try {
      gl = cv.getContext('webgl', {
        alpha: false,
        antialias: false,
        depth: false,
        preserveDrawingBuffer: true,
        powerPreference: 'low-power',
      });
    } catch {
      gl = null;
    }
    if (!gl) return null;
    const sh = (type: number, src: string) => {
      const s = gl!.createShader(type)!;
      gl!.shaderSource(s, src);
      gl!.compileShader(s);
      return gl!.getShaderParameter(s, gl!.COMPILE_STATUS) ? s : null;
    };
    const vs = sh(gl.VERTEX_SHADER, VS);
    const fs = sh(gl.FRAGMENT_SHADER, FS_HEAD + body);
    if (!vs || !fs) return null;
    const pr = gl.createProgram()!;
    gl.attachShader(pr, vs);
    gl.attachShader(pr, fs);
    gl.linkProgram(pr);
    if (!gl.getProgramParameter(pr, gl.LINK_STATUS)) return null;
    gl.useProgram(pr);
    const buf = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, buf);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 3, -1, -1, 3]), gl.STATIC_DRAW);
    const loc = gl.getAttribLocation(pr, 'p');
    gl.enableVertexAttribArray(loc);
    gl.vertexAttribPointer(loc, 2, gl.FLOAT, false, 0, 0);
    const uRes = gl.getUniformLocation(pr, 'u_res');
    const uTime = gl.getUniformLocation(pr, 'u_time');
    const uMouse = gl.getUniformLocation(pr, 'u_mouse');
    // Zeiger weich nachziehen (Shader bekommen Gerätepixel, y von unten)
    let mx = 0.62;
    let my = 0.5;
    gl.uniform3fv(gl.getUniformLocation(pr, 'u_p'), new Float32Array(pal.flatMap((h) => hexRgb(h).map((v) => v / 255))));
    return {
      resize(w, h) {
        gl!.viewport(0, 0, w, h);
      },
      frame(t) {
        gl!.uniform2f(uRes, cv.width, cv.height);
        gl!.uniform1f(uTime, t);
        if (uMouse) {
          const dpr = cv.width / Math.max(1, cv.clientWidth);
          const tx = ptr?.active ? ptr.x / Math.max(1, cv.clientWidth) : 0.62 + 0.18 * Math.sin(t * 0.3);
          const ty = ptr?.active ? 1 - ptr.y / Math.max(1, cv.clientHeight) : 0.5 + 0.2 * Math.sin(t * 0.23);
          mx += (tx - mx) * 0.12;
          my += (ty - my) * 0.12;
          gl!.uniform3f(uMouse, mx * cv.clientWidth * dpr, my * cv.clientHeight * dpr, ptr?.active ? 1 : 0);
        }
        gl!.drawArrays(gl!.TRIANGLES, 0, 3);
      },
      dispose() {
        gl!.getExtension('WEBGL_lose_context')?.loseContext();
      },
    };
  };
}

/* --------------------------------------------------------------------------------------------- Canvas 2D ---------- */

export interface Ctx2D {
  g: CanvasRenderingContext2D;
  /** Größe in CSS-Pixeln (der Kontext ist bereits auf devicePixelRatio skaliert). */
  W: () => number;
  H: () => number;
  pal: Rgb[];
  /** Palettenfarbe i (0..4, gebrochen = gemischt) mit Deckkraft a. */
  col: (i: number, a?: number) => string;
  bg: string;
  /** Zeiger (Maus/Finger) relativ zum Canvas in CSS-Pixeln; active = in den letzten 2 s bewegt. */
  ptr: Pointer;
  /** Modus-Einstellungen aus dem Einstellungs-Panel (heroCfg[modus], z. B. Wetter-Vorschau). */
  cfg: Record<string, unknown>;
  /** Der Canvas selbst (z. B. für seine Lage auf der Seite). */
  cv?: HTMLCanvasElement;
}
export type Mode2D = (c: Ctx2D) => ExtraRenderer;

export interface Pointer {
  x: number;
  y: number;
  vx: number;
  vy: number;
  active: boolean;
}

export const rand = (a = 0, b = 1) => a + Math.random() * (b - a);

/** Wertrauschen (für Strömungsfeld & Co.), deterministisch. */
export const vnoise = (() => {
  const h = (x: number, y: number) => {
    const s = Math.sin(x * 127.1 + y * 311.7) * 43758.5453;
    return s - Math.floor(s);
  };
  return (x: number, y: number) => {
    const xi = Math.floor(x);
    const yi = Math.floor(y);
    const xf = x - xi;
    const yf = y - yi;
    const u = xf * xf * (3 - 2 * xf);
    const v = yf * yf * (3 - 2 * yf);
    const a = h(xi, yi) + (h(xi + 1, yi) - h(xi, yi)) * u;
    const b = h(xi, yi + 1) + (h(xi + 1, yi + 1) - h(xi, yi + 1)) * u;
    return a + (b - a) * v;
  };
})();

export const fade = (c: Ctx2D, a: number) => {
  c.g.globalCompositeOperation = 'source-over';
  c.g.fillStyle = c.bg.replace('ALPHA', String(a));
  c.g.fillRect(0, 0, c.W(), c.H());
};

const MODES_2D: Record<string, Mode2D> = {
  // Strömungsfeld: Tausende Teilchen folgen einem langsam drehenden Rauschfeld und ziehen Schlieren
  flowfield: (c) => {
    const N = 900;
    let ps: { x: number; y: number; i: number; life: number }[] = [];
    const seed = () =>
      (ps = Array.from({ length: N }, (_, k) => ({
        x: rand(0, c.W()),
        y: rand(0, c.H()),
        i: (k % 5) + rand(0, 0.9),
        life: rand(60, 260),
      })));
    seed();
    return {
      resize: seed,
      still: 120,
      frame(t) {
        fade(c, 0.07);
        c.g.globalCompositeOperation = 'lighter';
        c.g.lineWidth = 1.4;
        for (const p of ps) {
          const a = vnoise(p.x * 0.0022 + t * 0.03, p.y * 0.0022 - t * 0.02) * Math.PI * 4;
          const nx = p.x + Math.cos(a) * 1.6;
          const ny = p.y + Math.sin(a) * 1.6;
          c.g.strokeStyle = c.col(p.i, 0.6);
          c.g.beginPath();
          c.g.moveTo(p.x, p.y);
          c.g.lineTo(nx, ny);
          c.g.stroke();
          p.x = nx;
          p.y = ny;
          if (--p.life < 0 || p.x < 0 || p.y < 0 || p.x > c.W() || p.y > c.H()) {
            p.x = rand(0, c.W());
            p.y = rand(0, c.H());
            p.life = rand(60, 260);
          }
        }
      },
    };
  },

  // Klangfiguren (Chladni): Sand sammelt sich auf den Knotenlinien einer schwingenden Platte; alle 7 s neuer Ton
  chladni: (c) => {
    const N = 3200;
    const ps = Array.from({ length: N }, () => ({ x: Math.random(), y: Math.random(), i: rand(0, 4) }));
    const modes = [
      [1, 2],
      [2, 3],
      [3, 5],
      [1, 4],
      [4, 5],
      [2, 5],
      [3, 4],
      [5, 6],
    ];
    const f = (x: number, y: number, n: number, m: number) =>
      Math.cos(n * Math.PI * x) * Math.cos(m * Math.PI * y) - Math.cos(m * Math.PI * x) * Math.cos(n * Math.PI * y);
    return {
      still: 160,
      frame(t) {
        const k = Math.floor(t / 7) % modes.length;
        const [n, m] = modes[k];
        fade(c, 0.35);
        c.g.globalCompositeOperation = 'lighter';
        const s = Math.min(c.W(), c.H()) * 0.92;
        const ox = (c.W() - s) / 2;
        const oy = (c.H() - s) / 2;
        for (const p of ps) {
          const v = Math.abs(f(p.x, p.y, n, m));
          p.x += rand(-1, 1) * v * 0.022;
          p.y += rand(-1, 1) * v * 0.022;
          p.x = Math.min(1, Math.max(0, p.x));
          p.y = Math.min(1, Math.max(0, p.y));
          c.g.fillStyle = c.col(p.i, 0.95);
          c.g.fillRect(ox + p.x * s, oy + p.y * s, 2, 2);
        }
      },
    };
  },

  // Neon-Leben: Conways Game of Life mit Leuchtspuren, säht sich nach, wenn es erstarrt
  life: (c) => {
    const S = 11;
    let cols = 0;
    let rows = 0;
    let a = new Uint8Array(0);
    let age = new Uint16Array(0);
    let acc = 0;
    let last = -1;
    const seed = () => {
      cols = Math.ceil(c.W() / S);
      rows = Math.ceil(c.H() / S);
      a = new Uint8Array(cols * rows).map(() => (Math.random() < 0.28 ? 1 : 0));
      age = new Uint16Array(cols * rows);
    };
    seed();
    const step = () => {
      const b = new Uint8Array(cols * rows);
      let alive = 0;
      for (let y = 0; y < rows; y++)
        for (let x = 0; x < cols; x++) {
          let n = 0;
          for (let dy = -1; dy <= 1; dy++)
            for (let dx = -1; dx <= 1; dx++) if (dx || dy) n += a[((y + dy + rows) % rows) * cols + ((x + dx + cols) % cols)];
          const i = y * cols + x;
          b[i] = n === 3 || (n === 2 && a[i]) ? 1 : 0;
          age[i] = b[i] ? Math.min(age[i] + 1, 999) : 0;
          alive += b[i];
        }
      a = b;
      // erstarrt/ausgestorben → ein paar Gleiter-Keime streuen
      if (alive < cols * rows * 0.04 || alive === last) for (let k = 0; k < cols * rows * 0.06; k++) a[(Math.random() * a.length) | 0] = 1;
      last = alive;
    };
    return {
      resize: seed,
      still: 30,
      frame(_t, dt) {
        acc += dt;
        if (acc > 0.11) {
          acc = 0;
          step();
        }
        fade(c, 0.22);
        c.g.globalCompositeOperation = 'lighter';
        for (let i = 0; i < a.length; i++)
          if (a[i]) {
            const x = (i % cols) * S;
            const y = Math.floor(i / cols) * S;
            c.g.fillStyle = c.col(Math.min(4, age[i] * 0.35), 0.85);
            c.g.fillRect(x + 1.5, y + 1.5, S - 3, S - 3);
          }
      },
    };
  },

  // Turing-Muster: echte Reaktion-Diffusion (Gray-Scott), Korallen- und Fingerabdruck-Strukturen wachsen
  turing: (c) => {
    const w = 180;
    let h = 100;
    let A = new Float32Array(0);
    let B = new Float32Array(0);
    const off = document.createElement('canvas');
    const og = off.getContext('2d')!;
    let img: ImageData;
    const lut: Rgb[] = Array.from({ length: 256 }, (_, i) => {
      const x = (i / 255) * 4;
      const k = Math.min(3, Math.floor(x));
      const f = x - k;
      const p = c.pal[k];
      const q = c.pal[Math.min(4, k + 1)];
      return [p[0] + (q[0] - p[0]) * f, p[1] + (q[1] - p[1]) * f, p[2] + (q[2] - p[2]) * f];
    });
    const seed = () => {
      h = Math.max(40, Math.round((w * c.H()) / Math.max(1, c.W())));
      A = new Float32Array(w * h).fill(1);
      B = new Float32Array(w * h);
      for (let k = 0; k < 26; k++) {
        const cx = (Math.random() * w) | 0;
        const cy = (Math.random() * h) | 0;
        for (let y = -3; y <= 3; y++) for (let x = -3; x <= 3; x++) B[((cy + y + h) % h) * w + ((cx + x + w) % w)] = 1;
      }
      off.width = w;
      off.height = h;
      img = og.createImageData(w, h);
    };
    seed();
    // Gray-Scott nach Karl Sims: 3x3-Laplace (Nachbarn 0,2, Diagonalen 0,05), dA = 1, dB = 0,5, F/K = Korallen
    const F = 0.0545;
    const K = 0.062;
    const step = () => {
      const nA = new Float32Array(w * h);
      const nB = new Float32Array(w * h);
      for (let y = 0; y < h; y++) {
        const ym = ((y - 1 + h) % h) * w;
        const yp = ((y + 1) % h) * w;
        const yc = y * w;
        for (let x = 0; x < w; x++) {
          const xm = (x - 1 + w) % w;
          const xp = (x + 1) % w;
          const i = yc + x;
          const lapA =
            (A[yc + xm] + A[yc + xp] + A[ym + x] + A[yp + x]) * 0.2 + (A[ym + xm] + A[ym + xp] + A[yp + xm] + A[yp + xp]) * 0.05 - A[i];
          const lapB =
            (B[yc + xm] + B[yc + xp] + B[ym + x] + B[yp + x]) * 0.2 + (B[ym + xm] + B[ym + xp] + B[yp + xm] + B[yp + xp]) * 0.05 - B[i];
          const abb = A[i] * B[i] * B[i];
          nA[i] = A[i] + (lapA - abb + F * (1 - A[i]));
          nB[i] = B[i] + (0.5 * lapB + abb - (K + F) * B[i]);
        }
      }
      A = nA;
      B = nB;
    };
    return {
      resize: seed,
      still: 40,
      frame() {
        for (let k = 0; k < 10; k++) step();
        const d = img.data;
        for (let i = 0; i < w * h; i++) {
          const v = Math.max(0, Math.min(255, (B[i] * 3.2 * 255) | 0));
          const [r, g, b] = lut[v];
          const k = v / 255;
          d[i * 4] = r * k;
          d[i * 4 + 1] = g * k;
          d[i * 4 + 2] = b * k;
          d[i * 4 + 3] = 255;
        }
        og.putImageData(img, 0, 0);
        c.g.globalCompositeOperation = 'source-over';
        c.g.imageSmoothingEnabled = true;
        c.g.drawImage(off, 0, 0, c.W(), c.H());
      },
    };
  },

  // Harmonograph: gedämpfte Pendel zeichnen Spiralfiguren, danach neue Figur
  harmonograph: (c) => {
    let P: number[] = [];
    let T = 0;
    const reset = () => {
      const r = () => [rand(1.98, 2.02) * (Math.random() < 0.5 ? 1 : 1.5), rand(0, Math.PI * 2), rand(0.002, 0.006)];
      P = [...r(), ...r(), ...r(), ...r()];
      T = 0;
    };
    reset();
    const pos = (t: number) => {
      const s = Math.min(c.W(), c.H()) * 0.22;
      const e = (i: number) => Math.sin(t * P[i] + P[i + 1]) * Math.exp(-P[i + 2] * t);
      return [c.W() * 0.5 + s * (e(0) + e(3)), c.H() * 0.5 + s * (e(6) + e(9))];
    };
    return {
      resize: reset,
      still: 200,
      frame() {
        fade(c, 0.012);
        c.g.globalCompositeOperation = 'lighter';
        c.g.lineWidth = 1.4;
        for (let k = 0; k < 12; k++) {
          const [x0, y0] = pos(T);
          T += 0.05;
          const [x1, y1] = pos(T);
          c.g.strokeStyle = c.col((T * 0.01) % 4, 0.9);
          c.g.beginPath();
          c.g.moveTo(x0, y0);
          c.g.lineTo(x1, y1);
          c.g.stroke();
        }
        if (T > 900) reset();
      },
    };
  },

  // Pendelwelle: 24 Pendel mit leicht verschiedenen Perioden bilden Schlangen, Wellen und Chaos
  pendulum: (c) => {
    const N = 24;
    return {
      frame(t) {
        fade(c, 0.28);
        c.g.globalCompositeOperation = 'lighter';
        const cycle = 60;
        for (let i = 0; i < N; i++) {
          const f = (51 + i) / cycle;
          const x = c.W() * (0.08 + (0.84 * i) / (N - 1));
          const y = c.H() * 0.48 + Math.sin(2 * Math.PI * f * t) * c.H() * 0.3;
          const col = (i / (N - 1)) * 4;
          c.g.strokeStyle = c.col(col, 0.12);
          c.g.beginPath();
          c.g.moveTo(x, c.H() * 0.08);
          c.g.lineTo(x, y);
          c.g.stroke();
          const gr = c.g.createRadialGradient(x, y, 0, x, y, 18);
          gr.addColorStop(0, c.col(col, 0.95));
          gr.addColorStop(1, c.col(col, 0));
          c.g.fillStyle = gr;
          c.g.beginPath();
          c.g.arc(x, y, 18, 0, Math.PI * 2);
          c.g.fill();
        }
      },
    };
  },

  // Platinenstrom: Leiterbahnen mit 45°-Knicken, Strompulse rasen mit Leuchtkopf darüber
  circuit: (c) => {
    let paths: { pts: [number, number][]; len: number; col: number }[] = [];
    let pulses: { p: number; s: number; d: number }[] = [];
    const build = () => {
      const G = 22;
      paths = [];
      for (let k = 0; k < 46; k++) {
        let x = Math.round(rand(0, c.W()) / G) * G;
        let y = Math.round(rand(0, c.H()) / G) * G;
        const pts: [number, number][] = [[x, y]];
        let dir = (Math.random() * 8) | 0;
        for (let s = 0; s < 14; s++) {
          if (Math.random() < 0.35) dir = (dir + (Math.random() < 0.5 ? 1 : 7)) % 8;
          const a = (dir * Math.PI) / 4;
          x += Math.round(Math.cos(a)) * G * ((1 + Math.random() * 3) | 0);
          y += Math.round(Math.sin(a)) * G * ((1 + Math.random() * 3) | 0);
          pts.push([x, y]);
        }
        let len = 0;
        for (let i = 1; i < pts.length; i++) len += Math.hypot(pts[i][0] - pts[i - 1][0], pts[i][1] - pts[i - 1][1]);
        paths.push({ pts, len, col: rand(0, 4) });
      }
      pulses = paths.map(() => ({ p: rand(0, 1), s: rand(0.08, 0.22), d: 0 }));
    };
    build();
    const at = (pa: (typeof paths)[number], f: number): [number, number] => {
      let d = f * pa.len;
      for (let i = 1; i < pa.pts.length; i++) {
        const [x0, y0] = pa.pts[i - 1];
        const [x1, y1] = pa.pts[i];
        const l = Math.hypot(x1 - x0, y1 - y0);
        if (d <= l) return [x0 + ((x1 - x0) * d) / Math.max(l, 1), y0 + ((y1 - y0) * d) / Math.max(l, 1)];
        d -= l;
      }
      return pa.pts[pa.pts.length - 1];
    };
    return {
      resize: build,
      frame(_t, dt) {
        fade(c, 1);
        c.g.globalCompositeOperation = 'lighter';
        c.g.lineWidth = 1.4;
        paths.forEach((pa, k) => {
          c.g.strokeStyle = c.col(pa.col, 0.24);
          c.g.beginPath();
          pa.pts.forEach(([x, y], i) => (i ? c.g.lineTo(x, y) : c.g.moveTo(x, y)));
          c.g.stroke();
          const [ex, ey] = pa.pts[pa.pts.length - 1];
          c.g.fillStyle = c.col(pa.col, 0.35);
          c.g.fillRect(ex - 2.5, ey - 2.5, 5, 5);
          const pu = pulses[k];
          pu.p += pu.s * dt;
          if (pu.p > 1.25) pu.p = -0.1;
          for (let j = 0; j < 10; j++) {
            const f = pu.p - j * 0.012;
            if (f < 0 || f > 1) continue;
            const [x, y] = at(pa, f);
            c.g.fillStyle = c.col(pa.col, (1 - j / 10) * 0.9);
            c.g.beginPath();
            c.g.arc(x, y, j ? 2 : 4, 0, Math.PI * 2);
            c.g.fill();
          }
        });
      },
    };
  },

  // Sternbilder: driftende Sterne verbinden sich zu Konstellationen, die sich lösen und neu bilden
  plexus: (c) => {
    let ns: { x: number; y: number; vx: number; vy: number; i: number; tw: number }[] = [];
    const seed = () =>
      (ns = Array.from({ length: Math.round((c.W() * c.H()) / 9000) }, () => ({
        x: rand(0, c.W()),
        y: rand(0, c.H()),
        vx: rand(-0.18, 0.18),
        vy: rand(-0.12, 0.12),
        i: rand(0, 4),
        tw: rand(0, 6),
      })));
    seed();
    return {
      resize: seed,
      frame(t) {
        fade(c, 1);
        c.g.globalCompositeOperation = 'lighter';
        const D = 130;
        for (let a = 0; a < ns.length; a++) {
          const p = ns[a];
          p.x = (p.x + p.vx + c.W()) % c.W();
          p.y = (p.y + p.vy + c.H()) % c.H();
          for (let b = a + 1; b < ns.length; b++) {
            const q = ns[b];
            const d = Math.hypot(p.x - q.x, p.y - q.y);
            if (d < D) {
              c.g.strokeStyle = c.col((p.i + q.i) / 2, (1 - d / D) * 0.6);
              c.g.beginPath();
              c.g.moveTo(p.x, p.y);
              c.g.lineTo(q.x, q.y);
              c.g.stroke();
            }
          }
          const r = 1.6 + 1.6 * (0.5 + 0.5 * Math.sin(t * 2 + p.tw));
          c.g.fillStyle = c.col(p.i, 0.95);
          c.g.beginPath();
          c.g.arc(p.x, p.y, r, 0, Math.PI * 2);
          c.g.fill();
        }
      },
    };
  },

  // Seifenblasen: schillernde Blasen steigen auf, wabern und zerplatzen in Funken
  bubbles: (c) => {
    type B = { x: number; y: number; r: number; v: number; ph: number; i: number };
    let bs: B[] = [];
    let sparks: { x: number; y: number; vx: number; vy: number; l: number; i: number }[] = [];
    const mk = (y = rand(c.H(), c.H() * 1.4)): B => ({
      x: rand(0, c.W()),
      y,
      r: rand(14, 62),
      v: rand(0.25, 0.8),
      ph: rand(0, 6),
      i: rand(0, 4),
    });
    const seed = () => (bs = Array.from({ length: 26 }, () => mk(rand(0, c.H()))));
    seed();
    return {
      resize: seed,
      frame(t) {
        fade(c, 1);
        c.g.globalCompositeOperation = 'lighter';
        bs.forEach((b, k) => {
          b.y -= b.v;
          b.x += Math.sin(t * 0.9 + b.ph) * 0.4;
          const wob = 1 + 0.05 * Math.sin(t * 3 + b.ph);
          const rx = b.r * wob;
          const ry = b.r / wob;
          const gr = c.g.createRadialGradient(b.x, b.y, rx * 0.55, b.x, b.y, rx);
          gr.addColorStop(0, c.col(b.i, 0));
          gr.addColorStop(0.8, c.col((b.i + 1.5) % 4, 0.16));
          gr.addColorStop(1, c.col((b.i + 3) % 4, 0.5));
          c.g.fillStyle = gr;
          c.g.beginPath();
          c.g.ellipse(b.x, b.y, rx, ry, 0, 0, Math.PI * 2);
          c.g.fill();
          c.g.fillStyle = 'rgba(255,255,255,0.55)';
          c.g.beginPath();
          c.g.ellipse(b.x - rx * 0.35, b.y - ry * 0.4, rx * 0.16, ry * 0.08, -0.6, 0, Math.PI * 2);
          c.g.fill();
          if (b.y < c.H() * rand(0.05, 0.4) && Math.random() < 0.01) {
            for (let s = 0; s < 14; s++) {
              const a = rand(0, Math.PI * 2);
              sparks.push({
                x: b.x + Math.cos(a) * rx,
                y: b.y + Math.sin(a) * ry,
                vx: Math.cos(a) * rand(1, 3),
                vy: Math.sin(a) * rand(1, 3),
                l: 1,
                i: b.i,
              });
            }
            bs[k] = mk();
          } else if (b.y < -b.r) bs[k] = mk();
        });
        sparks = sparks.filter((s) => (s.l -= 0.03) > 0);
        for (const s of sparks) {
          s.x += s.vx;
          s.y += s.vy;
          c.g.fillStyle = c.col(s.i, s.l);
          c.g.fillRect(s.x, s.y, 2, 2);
        }
      },
    };
  },

  // Mandala: gegenläufig rotierende Blütenblatt-Kränze, die atmen
  mandala: (c) => ({
    frame(t) {
      fade(c, 0.25);
      c.g.globalCompositeOperation = 'lighter';
      const cx = c.W() * 0.62;
      const cy = c.H() * 0.5;
      const R = Math.min(c.W(), c.H()) * 0.46;
      for (let L = 0; L < 6; L++) {
        const n = 6 + L * 3;
        const r = R * (0.18 + L * 0.15) * (1 + 0.06 * Math.sin(t * 0.8 + L));
        const rot = t * 0.08 * (L % 2 ? -1 : 1) + L;
        c.g.strokeStyle = c.col(L * 0.75, 0.55);
        c.g.fillStyle = c.col(L * 0.75, 0.06);
        c.g.lineWidth = 1.2;
        for (let k = 0; k < n; k++) {
          const a = rot + (k * Math.PI * 2) / n;
          c.g.save();
          c.g.translate(cx, cy);
          c.g.rotate(a);
          c.g.beginPath();
          c.g.moveTo(r * 0.55, 0);
          c.g.quadraticCurveTo(r * 0.8, r * 0.22, r, 0);
          c.g.quadraticCurveTo(r * 0.8, -r * 0.22, r * 0.55, 0);
          c.g.fill();
          c.g.stroke();
          c.g.restore();
        }
      }
    },
  }),

  // Seidenfäden: hunderte Sinuskurven weben ein schimmerndes Tuch
  silk: (c) => ({
    frame(t) {
      fade(c, 0.2);
      c.g.globalCompositeOperation = 'lighter';
      c.g.lineWidth = 1;
      const N = 46;
      for (let k = 0; k < N; k++) {
        const f = k / N;
        c.g.strokeStyle = c.col(f * 4, 0.18);
        c.g.beginPath();
        for (let x = 0; x <= c.W(); x += 8) {
          const u = x / c.W();
          const y =
            c.H() * 0.5 +
            Math.sin(u * 4.2 + t * 0.5 + f * 2.4) * c.H() * 0.22 * Math.sin(t * 0.13 + f * 3) +
            Math.sin(u * 9 - t * 0.7 + f * 6) * c.H() * 0.05 +
            (f - 0.5) * c.H() * 0.25 * Math.cos(u * 2 + t * 0.2);
          if (x) c.g.lineTo(x, y);
          else c.g.moveTo(x, y);
        }
        c.g.stroke();
      }
    },
  }),

  // Zellteilung: Zellen wachsen, schnüren sich ein und teilen sich
  cells: (c) => {
    type Cell = { x: number; y: number; r: number; g: number; vx: number; vy: number; i: number; split: number };
    let cs: Cell[] = [];
    const mk = (x: number, y: number, i: number): Cell => ({
      x,
      y,
      r: rand(12, 26),
      g: rand(0.05, 0.1),
      vx: rand(-0.2, 0.2),
      vy: rand(-0.2, 0.2),
      i,
      split: 0,
    });
    const seed = () => (cs = Array.from({ length: 16 }, () => mk(rand(0, c.W()), rand(0, c.H()), rand(0, 4))));
    seed();
    return {
      resize: seed,
      frame() {
        fade(c, 1);
        c.g.globalCompositeOperation = 'lighter';
        const next: Cell[] = [];
        for (const k of cs) {
          k.x += k.vx;
          k.y += k.vy;
          if (k.x < 0 || k.x > c.W()) k.vx *= -1;
          if (k.y < 0 || k.y > c.H()) k.vy *= -1;
          if (k.split > 0) {
            k.split += 0.012;
            if (k.split >= 1) {
              const a = rand(0, Math.PI * 2);
              if (cs.length + next.length < 60) {
                next.push(mk(k.x + Math.cos(a) * k.r * 0.5, k.y + Math.sin(a) * k.r * 0.5, (k.i + 0.6) % 4));
                k.vx = -Math.cos(a) * 0.3;
                k.vy = -Math.sin(a) * 0.3;
              }
              k.r *= 0.62;
              k.split = 0;
            }
          } else {
            k.r += k.g;
            if (k.r > 34) k.split = 0.001;
          }
          // Einschnürung als zwei Kerne während der Teilung
          const off = k.split * k.r * 0.6;
          for (const sgn of k.split > 0 ? [-1, 1] : [0]) {
            const x = k.x + sgn * off;
            const gr = c.g.createRadialGradient(x, k.y, 0, x, k.y, k.r);
            gr.addColorStop(0, c.col(k.i, 0.1));
            gr.addColorStop(0.75, c.col(k.i, 0.28));
            gr.addColorStop(0.95, c.col(k.i, 0.85));
            gr.addColorStop(1, c.col(k.i, 0));
            c.g.fillStyle = gr;
            c.g.beginPath();
            c.g.arc(x, k.y, k.r * (k.split > 0 ? 0.8 : 1), 0, Math.PI * 2);
            c.g.fill();
            c.g.fillStyle = c.col((k.i + 2) % 4, 0.8);
            c.g.beginPath();
            c.g.arc(x, k.y, k.r * 0.18, 0, Math.PI * 2);
            c.g.fill();
          }
        }
        cs = cs.concat(next);
        if (cs.length >= 60) cs = cs.filter(() => Math.random() > 0.5);
      },
    };
  },

  // LD-Partikel: Tausende Teilchen formen das LD-Monogramm, zerstieben und finden wieder zusammen
  ldswarm: (c) => {
    let ps: { x: number; y: number; tx: number; ty: number; vx: number; vy: number; i: number }[] = [];
    const build = () => {
      const off = document.createElement('canvas');
      const w = Math.max(1, Math.round(c.W()));
      const h = Math.max(1, Math.round(c.H()));
      off.width = w;
      off.height = h;
      const og = off.getContext('2d')!;
      // Negativraum des LD-Monogramms (Pfade wie LoonaNegative / assets/negative-space-demo.svg)
      const s = Math.min(w, h) / 46;
      og.setTransform(s, 0, 0, s, w * 0.68 - 22 * s, h * 0.56 - 23 * s);
      og.fill(new Path2D('M8 11H16V27H19L22 35H8Z'));
      og.fill(new Path2D('M21 11H24A12 12 0 0 1 24 35L21 27Z'));
      const d = og.getImageData(0, 0, w, h).data;
      const pts: [number, number][] = [];
      const step = Math.max(3, Math.round(Math.min(w, h) / 120));
      for (let y = 0; y < h; y += step) for (let x = 0; x < w; x += step) if (d[(y * w + x) * 4 + 3] > 128) pts.push([x, y]);
      ps = pts.map(([tx, ty]) => ({ x: rand(0, w), y: rand(0, h), tx, ty, vx: 0, vy: 0, i: (tx / w) * 4 }));
    };
    build();
    return {
      resize: build,
      still: 200,
      frame(t) {
        fade(c, 0.3);
        c.g.globalCompositeOperation = 'lighter';
        const ph = t % 9;
        const burst = ph > 6.2 && ph < 6.35;
        for (const p of ps) {
          if (burst) {
            const a = rand(0, Math.PI * 2);
            p.vx += Math.cos(a) * rand(4, 12);
            p.vy += Math.sin(a) * rand(4, 12);
          }
          const pull = ph > 6.2 && ph < 7.6 ? 0.002 : 0.02;
          p.vx = (p.vx + (p.tx - p.x) * pull) * 0.9;
          p.vy = (p.vy + (p.ty - p.y) * pull) * 0.9;
          p.x += p.vx + Math.sin(t * 2 + p.ty * 0.05) * 0.2;
          p.y += p.vy;
          c.g.fillStyle = c.col(p.i, 0.95);
          c.g.fillRect(p.x - 1, p.y - 1, 2.4, 2.4);
        }
      },
    };
  },
};

/* ------------------------------------------------------------------------------------------------ Lauf ------------ */

const factory = (
  mode: string,
  cv: HTMLCanvasElement,
  pal: readonly string[],
  bgHex: string,
  ptr: Pointer,
  cfg: Record<string, unknown>,
): ExtraRenderer | null => {
  const shader = SHADERS[mode] ?? MORE_SHADERS[mode] ?? HORIZON_SHADERS[mode];
  if (shader) return glMode(shader)(cv, pal, ptr);
  const m = MODES_2D[mode] ?? MORE_2D[mode] ?? BUILD_2D[mode] ?? SPLASH_2D[mode];
  if (!m) return null;
  const g = cv.getContext('2d');
  if (!g) return null;
  const rgb = pal.map(hexRgb);
  const [br, bgc, bb] = hexRgb(bgHex);
  const size = { w: 1, h: 1 };
  const ctx: Ctx2D = {
    g,
    W: () => size.w,
    H: () => size.h,
    pal: rgb,
    bg: `rgba(${br},${bgc},${bb},ALPHA)`,
    ptr,
    cfg,
    cv,
    col: (i, a = 1) => {
      const x = Math.max(0, Math.min(4, i));
      const k = Math.min(3, Math.floor(x));
      const f = x - k;
      const p = rgb[k];
      const q = rgb[k + 1];
      return `rgba(${Math.round(p[0] + (q[0] - p[0]) * f)},${Math.round(p[1] + (q[1] - p[1]) * f)},${Math.round(p[2] + (q[2] - p[2]) * f)},${a})`;
    },
  };
  const r = m(ctx);
  const inner = r.resize;
  return {
    ...r,
    resize(w, h) {
      const dpr = w / Math.max(1, cv.clientWidth);
      size.w = cv.clientWidth;
      size.h = cv.clientHeight;
      g.setTransform(dpr, 0, 0, dpr, 0, 0);
      g.globalCompositeOperation = 'source-over';
      g.fillStyle = `rgb(${br},${bgc},${bb})`;
      g.fillRect(0, 0, size.w, size.h);
      inner?.(w, h);
    },
  };
};

/**
 * Startet einen Modus im Canvas. anim=false: einmal bis zum Standbild rechnen und stehen lassen.
 * Liefert eine Stopp-Funktion (räumt RAF, Beobachter und WebGL-Kontext auf).
 */
export function runExtra(
  cv: HTMLCanvasElement,
  mode: string,
  pal: readonly string[],
  opts: { anim: boolean; fpsHalf: boolean; bg: string; cfg?: Record<string, unknown> },
): () => void {
  // Zeiger für die interaktiven Modi: Maus und Finger (der Canvas selbst liegt unter dem Hero-Text)
  const ptr: Pointer = { x: 0, y: 0, vx: 0, vy: 0, active: false };
  let idle: ReturnType<typeof setTimeout> | undefined;
  const onMove = (e: PointerEvent) => {
    const b = cv.getBoundingClientRect();
    const x = e.clientX - b.left;
    const y = e.clientY - b.top;
    ptr.vx = ptr.active ? x - ptr.x : 0;
    ptr.vy = ptr.active ? y - ptr.y : 0;
    ptr.x = x;
    ptr.y = y;
    ptr.active = y >= 0 && y <= b.height;
    clearTimeout(idle);
    idle = setTimeout(() => (ptr.active = false), 2000);
  };
  window.addEventListener('pointermove', onMove, { passive: true });
  const r = factory(mode, cv, pal, opts.bg, ptr, opts.cfg ?? {});
  if (!r) {
    window.removeEventListener('pointermove', onMove);
    return () => {};
  }
  const DPR = Math.min(window.devicePixelRatio || 1, 1.5);
  const fit = () => {
    const w = Math.max(1, Math.round(cv.clientWidth * DPR));
    const h = Math.max(1, Math.round(cv.clientHeight * DPR));
    if (cv.width !== w || cv.height !== h) {
      cv.width = w;
      cv.height = h;
      r.resize?.(w, h);
      return true;
    }
    return false;
  };
  fit();
  r.resize?.(cv.width, cv.height);

  const drawStill = () => {
    const n = r.still ?? 1;
    for (let i = 0; i < n; i++) r.frame(6 + i / 60, 1 / 60);
  };
  if (!opts.anim) {
    drawStill();
    const ro = new ResizeObserver(() => fit() && drawStill());
    ro.observe(cv);
    return () => {
      ro.disconnect();
      window.removeEventListener('pointermove', onMove);
      clearTimeout(idle);
      r.dispose?.();
    };
  }

  let raf = 0;
  let visible = true;
  let last = performance.now();
  let t = 0;
  let odd = false;
  const io = new IntersectionObserver(([e]) => (visible = e.isIntersecting));
  io.observe(cv);
  const ro = new ResizeObserver(() => fit());
  ro.observe(cv);
  const loop = (now: number) => {
    raf = requestAnimationFrame(loop);
    const dt = Math.min(0.1, (now - last) / 1000);
    last = now;
    if (!visible || document.hidden) return;
    odd = !odd;
    if (opts.fpsHalf && odd) return;
    t += opts.fpsHalf ? dt * 2 : dt;
    r.frame(t, opts.fpsHalf ? dt * 2 : dt);
  };
  raf = requestAnimationFrame(loop);
  return () => {
    cancelAnimationFrame(raf);
    window.removeEventListener('pointermove', onMove);
    clearTimeout(idle);
    io.disconnect();
    ro.disconnect();
    r.dispose?.();
  };
}
