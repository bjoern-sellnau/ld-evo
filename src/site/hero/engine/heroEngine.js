// @ts-nocheck
/**
 * Hero-Animationen (WebGL + Canvas 2D) — Methoden 1:1 aus design/design_handoff_loona_site/Loona Site V2.dc.html,
 * Zeilen 1611–3802 (ensureLava … hex01) sowie resolvePal/lum. NICHT von Hand editieren: per
 * `node scripts/extract-hero-engine.mjs` neu erzeugen. Der Adapter (Konstruktor, state, setState, isSafari)
 * ersetzt die DC-Komponente des Prototyps; die Shader-GLSL-Strings und Render-Loops bleiben unverändert.
 *
 * Erwartet im DOM: #ld-hero (Container), #ld-lava-canvas (WebGL) und #ld-orbit-canvas (2D).
 */
export class HeroEngine {
  /**
   * @param {() => object} getState  liefert { page, heroAnim, anim, heroCfg, fpsHalf, perfMode, auroraPre, mxCine, mxT1, mxT2, mxSize, cineDone }
   * @param {(patch: object) => void} onState  empfängt State-Änderungen der Engine (z. B. cineDone)
   */
  constructor(getState, onState) {
    this._getState = getState;
    this._onState = onState;
    this._heroVis = true;
  }

  get state() {
    return this._getState();
  }

  setState(patch) {
    this._onState(patch);
  }

  isSafari() {
    if (this._safariCached === undefined) {
      const ua = navigator.userAgent;
      this._safariCached = /Safari/.test(ua) && !/Chrome|CriOS|FxiOS|Edg|Android/.test(ua);
    }
    return this._safariCached;
  }

  /** Aufräumen beim Unmount (Prototyp: componentWillUnmount). */
  destroy() {
    this.stopLava();
    if (this._io) this._io.disconnect();
    this._io = null;
    this._ioEl = null;
  }

  // ---- ab hier Prototyp-Code (unverändert) ----
  ensureLava() {
    let mode = this.state.heroAnim || 'flow';
    if (mode === 'mesh') mode = 'ribbon';
    if (mode === 'portal') mode = 'flow';
    const isFx = ['lava', 'aurora', 'orbit', 'ribbon', 'blackhole', 'nova', 'plasma', 'fire', 'matrix', 'rain', 'swarm', 'firefly', 'shooting', 'snow', 'clouds', 'storm', 'ink', 'grid', 'matrix2', 'helix', 'comet', 'galaxy', 'ocean', 'storm2', 'hourglass', 'fireworks'].indexOf(mode) !== -1;
    const is2d = ['orbit', 'matrix', 'rain', 'swarm', 'firefly', 'shooting', 'snow'].includes(mode);
    const active = this.state.page === 'hallo' && isFx && ((this.state.anim ?? true) !== false || !is2d);
    const cv = document.getElementById(['orbit', 'matrix', 'rain', 'swarm', 'firefly', 'shooting', 'snow', 'matrix2', 'helix', 'comet', 'galaxy', 'ocean', 'storm2', 'hourglass', 'fireworks'].includes(mode) ? 'ld-orbit-canvas' : 'ld-lava-canvas');
    if (!active || !cv || (this._fxFail && this._fxFail[mode])) { this.stopLava(); return; }
    if (this._glCanvas === cv && this._raf && this._fxMode === mode) return;
    this.stopLava();
    this._fxMode = mode;
    if (mode === 'orbit') this.startOrbit(cv); else if (mode === 'matrix') this.startMatrix(cv); else if (mode === 'rain') this.startRain(cv); else if (mode === 'swarm') this.startSwarm(cv); else if (mode === 'firefly') this.startFirefly(cv); else if (mode === 'shooting') this.startShooting(cv); else if (mode === 'snow') this.startSnow(cv); else if (mode === 'matrix2') this.startMatrix2(cv); else if (mode === 'helix') this.startHelix(cv); else if (mode === 'comet') this.startComet(cv); else if (mode === 'galaxy') this.startGalaxy(cv); else if (mode === 'ocean') this.startOcean(cv); else if (mode === 'storm2') this.startThunder(cv); else if (mode === 'hourglass') this.startHourglass(cv); else if (mode === 'fireworks') this.startFireworks(cv); else this.startLava(cv, mode);
  }

  startLava(cv, mode) {
    let gl = null;
    try { gl = cv.getContext('webgl', { antialias: true, alpha: true, depth: false, preserveDrawingBuffer: true, powerPreference: 'low-power' }) || cv.getContext('experimental-webgl'); } catch (e) {}
    if (!gl) { (this._fxFail = this._fxFail || {})[mode] = true; return; }
    const vs = 'attribute vec2 p;void main(){gl_Position=vec4(p,0.0,1.0);}';
    const fsLava = [
      'precision highp float;',
      'uniform vec2 u_res;uniform float u_time;uniform vec3 u_p1;uniform vec3 u_p2;uniform vec3 u_p3;uniform vec3 u_p4;',
      'float hash(float n){return fract(sin(n)*43758.5453123);}',
      'void main(){',
      ' vec2 uv=gl_FragCoord.xy/u_res.xy;',
      ' float aspect=u_res.x/max(u_res.y,1.0);',
      ' vec2 p=vec2((uv.x-0.5)*aspect,uv.y);',
      ' float t=u_time;',
      ' const int N=7;',
      ' float field=0.0;float warm=0.0;',
      ' for(int i=0;i<N;i++){',
      '  float fi=float(i);',
      '  float s1=hash(fi*1.73+1.0);float s2=hash(fi*3.11+5.0);float s3=hash(fi*5.57+9.0);',
      '  float ph=fract(t*(0.032+s1*0.042)+s1);',
      '  float y=0.5-0.62*cos(ph*6.28318);',
      '  float x=(s2-0.5)*aspect*0.84+sin(t*(0.09+s3*0.15)+fi)*0.09*aspect;',
      '  float rad=0.058+s2*0.052+0.012*sin(t*0.6+fi*2.0);',
      '  vec2 d=p-vec2(x,y);',
      '  float c=(rad*rad)/(dot(d,d)+0.0011);',
      '  field+=c;warm+=c*s3;',
      ' }',
      ' float dy=p.y+0.13;field+=0.05/(dy*dy+0.02);',
      ' warm=warm/max(field,0.0001);',
      ' vec3 bg=mix(vec3(0.05,0.02,0.08),vec3(0.014,0.006,0.03),uv.y);',
      ' vec3 hot=mix(u_p1,u_p2,clamp(warm*1.5,0.0,1.0));',
      ' hot=mix(hot,u_p3,smoothstep(0.45,0.85,warm));',
      ' hot=mix(hot,u_p4,smoothstep(0.74,1.0,warm));',
      ' float m=smoothstep(1.0,2.3,field);',
      ' float edge=smoothstep(0.72,1.15,field)*(1.0-smoothstep(1.7,2.7,field));',
      ' vec3 col=bg;',
      ' col=mix(col,hot,m);',
      ' col+=edge*hot*0.42;',
      ' col+=pow(m,4.0)*vec3(1.0,0.88,0.66)*0.18;',
      ' col+=smoothstep(0.65,1.7,field)*hot*0.03;',
      ' float vig=smoothstep(0.0,0.30,uv.x)*smoothstep(1.0,0.70,uv.x);',
      ' col*=mix(0.83,1.0,vig);',
      ' col+=(hash(dot(gl_FragCoord.xy,vec2(0.7,0.31))+t)-0.5)*0.016;',
      ' col*=0.95;',
      ' gl_FragColor=vec4(max(col,0.0),1.0);',
      '}'
    ].join('\n');
    const glslNoise = [
      'float h(vec2 p){return fract(sin(dot(p,vec2(127.1,311.7)))*43758.5453);}',
      'float n(vec2 p){vec2 i=floor(p);vec2 f=fract(p);f=f*f*(3.0-2.0*f);return mix(mix(h(i),h(i+vec2(1.0,0.0)),f.x),mix(h(i+vec2(0.0,1.0)),h(i+vec2(1.0,1.0)),f.x),f.y);}',
      'float fbm(vec2 p){float v=0.0;float a=0.5;for(int i=0;i<4;i++){v+=a*n(p);p*=2.03;a*=0.5;}return v;}'
    ].join('\n');
    const fsAurora = [
      'precision highp float;',
      'uniform vec2 u_res;uniform float u_time;uniform float u_var;uniform vec3 u_p1;uniform vec3 u_p3;uniform vec3 u_p4;',
      glslNoise,
      'void main(){',
      ' vec2 uv=gl_FragCoord.xy/u_res.xy;',
      ' float t=u_time*0.055;',
      ' float x=uv.x*2.6;',
      ' float sway=fbm(vec2(x*0.7+t*1.6,uv.y*0.5))*1.7;',
      ' float band=fbm(vec2(x*1.8+sway-t*2.4,uv.y*0.30-t*0.9));',
      ' float curt=fbm(vec2(x*4.2-t*1.7,t*0.6+uv.y*0.2));',
      ' float glow=pow(band,1.7)*(0.45+0.75*curt)*smoothstep(0.02,0.42,uv.y);',
      ' vec3 a1=mix(u_p1,vec3(0.12,0.95,0.55),u_var);',
      ' vec3 a2=mix(u_p3,vec3(0.10,0.78,0.75),u_var);',
      ' vec3 a3=mix(u_p4,vec3(0.45,0.32,0.92),u_var);',
      ' vec3 aur=mix(a1,a2,clamp(uv.y*1.5-0.1,0.0,1.0));',
      ' aur=mix(aur,a3,smoothstep(0.5,0.95,uv.y));',
      ' vec3 bgA=mix(vec3(0.012,0.045,0.09),vec3(0.004,0.035,0.05),u_var);',
      ' vec3 bgB=mix(vec3(0.003,0.012,0.035),vec3(0.002,0.010,0.025),u_var);',
      ' vec3 bg=mix(bgA,bgB,uv.y);',
      ' vec3 col=bg+aur*glow*2.2;',
      ' col+=mix(vec3(1.0,0.82,0.55),vec3(0.75,1.0,0.85),u_var)*pow(glow,2.6)*0.7;',
      ' float st=step(0.998,h(floor(gl_FragCoord.xy/1.5)));',
      ' col+=st*(0.2+0.4*h(floor(gl_FragCoord.xy)))*smoothstep(0.5,0.95,uv.y)*(0.6+0.4*sin(u_time*1.4+h(floor(gl_FragCoord.xy))*40.0));',
      ' col+=(h(gl_FragCoord.xy+u_time)-0.5)*0.015;',
      ' gl_FragColor=vec4(max(col,0.0),1.0);',
      '}'
    ].join('\n');
    const fsRibbon = [
      'precision highp float;',
      'uniform vec2 u_res;uniform float u_time;uniform float u_cx;uniform float u_cy;uniform float u_scale;uniform float u_ang;uniform float u_bgT;uniform vec3 u_p0;uniform vec3 u_p1;uniform vec3 u_p2;uniform vec3 u_p3;uniform vec3 u_p4;',
      'float h(vec2 p){return fract(sin(dot(p,vec2(127.1,311.7)))*43758.5453);}',
      'void main(){',
      ' vec2 uv0=gl_FragCoord.xy/u_res.xy;',
      ' float asp=u_res.x/max(u_res.y,1.0);',
      ' vec2 pc=vec2((uv0.x-0.5)*asp,uv0.y-0.5);',
      ' float ca=cos(u_ang);float sa=sin(u_ang);',
      ' vec2 pr=vec2(pc.x*ca-pc.y*sa,pc.x*sa+pc.y*ca);',
      ' vec2 uv=vec2(pr.x/asp+0.5,pr.y+0.5);',
      ' float t=u_time*0.55;',
      ' float sc=max(u_scale,0.2);',
      ' float x=uv.x-(u_cx-0.5);',
      ' vec3 col=mix(u_p0,u_p1,clamp(uv0.y*0.9+0.04*sin(t*0.2),0.0,1.0));',
      ' vec3 base=mix(u_p2,u_p3,clamp(x*1.4-0.2+0.15*sin(t*0.3),0.0,1.0));',
      ' base=mix(base,u_p4,smoothstep(0.55,1.05,x+0.1*sin(t*0.25)));',
      ' float yc2=u_cy+(0.15*sin(x*3.4+t*0.7+1.9)+0.05*sin(x*7.0-t*0.45+1.0))*sc;',
      ' float fold2=cos(x*5.2-t*0.9+2.2);',
      ' float w2=(0.028+0.085*abs(fold2))*sc;',
      ' float in2=smoothstep(w2,w2-0.016*sc,abs(uv.y-yc2));',
      ' vec3 ghost=mix(base*0.55+vec3(0.10,0.03,0.10),base,smoothstep(-0.3,0.3,fold2));',
      ' float yc=u_cy+(0.16*sin(x*3.4+t*0.7)+0.05*sin(x*7.0-t*0.45))*sc;',
      ' float fold=cos(x*5.2-t*0.9);',
      ' float w=(0.055+0.150*abs(fold))*sc;',
      ' float dy=uv.y-yc;',
      ' float ns=dy/max(w,0.001);',
      ' float inR=smoothstep(w,w-0.02*sc,abs(dy));',
      ' float front=smoothstep(-0.25,0.25,fold);',
      ' vec3 backCol=base*0.52+vec3(0.10,0.03,0.12);',
      ' vec3 rib=mix(backCol,base,front);',
      ' rib*=0.80+0.34*sqrt(max(0.0,1.0-ns*ns));',
      ' rib+=vec3(1.0,0.97,0.90)*pow(max(0.0,1.0-abs(ns+0.35*fold)),6.0)*0.38;',
      ' rib+=base*smoothstep(0.72,1.0,abs(ns))*0.28;',
      ' float gA=in2*0.34*(1.0-inR);',
      ' if(u_bgT>0.5){',
      '  vec3 rgbP=ghost*gA+rib*inR;',
      '  float aP=min(gA+inR,1.0);',
      '  gl_FragColor=vec4(rgbP,aP);',
      ' } else {',
      '  float shd=smoothstep(w+0.11,w,abs(dy-0.05))*(1.0-inR);',
      '  col*=1.0-0.12*shd;',
      '  col=mix(col,ghost,gA);',
      '  col=mix(col,rib,inR);',
      '  col+=(h(gl_FragCoord.xy)-0.5)*0.02;',
      '  gl_FragColor=vec4(col,1.0);',
      ' }',
      '}'
    ].join('\n');
    const fsHole = [
      'precision highp float;',
      'uniform vec2 u_res;uniform float u_time;uniform float u_cx;uniform float u_cy;uniform float u_scale;uniform vec3 u_p0;uniform vec3 u_p2;uniform vec3 u_p4;',
      glslNoise,
      'void main(){',
      ' vec2 uv=gl_FragCoord.xy/u_res.xy;',
      ' vec2 p=uv-vec2(u_cx,u_cy);',
      ' p.x*=u_res.x/u_res.y;',
      ' float r=length(p)/u_scale;',
      ' float a=atan(p.y,p.x);',
      ' float t=u_time;',
      ' float swirl=a+t*0.45+0.38/max(r,0.05);',
      ' float turb=fbm(vec2(swirl*1.6,r*8.0-t*0.7));',
      ' float disk=smoothstep(0.34,0.17,r)*smoothstep(0.055,0.12,r)*(0.35+1.1*turb);',
      ' float dop=1.0+0.75*cos(a+0.8);',
      ' vec3 hot=mix(u_p2,u_p0,clamp(turb*1.3,0.0,1.0));',
      ' vec3 col=hot*disk*dop*1.5;',
      ' col+=vec3(1.0,0.92,0.72)*exp(-abs(r-0.118)*120.0)*1.3;',
      ' col+=u_p4*0.10*exp(-r*2.2);',
      ' col*=smoothstep(0.088,0.108,r);',
      ' float st=step(0.9985,h(floor(gl_FragCoord.xy/1.5)));',
      ' col+=st*0.4*smoothstep(0.4,0.9,r);',
      ' col+=(h(gl_FragCoord.xy+t)-0.5)*0.015;',
      ' gl_FragColor=vec4(max(col,0.0),1.0);',
      '}'
    ].join('\n');
    const fsNova = [
      'precision highp float;',
      'uniform vec2 u_res;uniform float u_time;uniform float u_cx;uniform float u_cy;uniform float u_scale;uniform vec3 u_p1;uniform vec3 u_p2;uniform vec3 u_p3;uniform vec3 u_p4;',
      glslNoise,
      'void main(){',
      ' vec2 uv=gl_FragCoord.xy/u_res.xy;',
      ' vec2 p=uv-vec2(u_cx,u_cy);',
      ' p.x*=u_res.x/u_res.y;',
      ' float r=length(p)/u_scale;',
      ' float a=atan(p.y,p.x);',
      ' float t=u_time;',
      ' float core=exp(-r*13.0)*2.1;',
      ' float ph=fract(t*0.14);',
      ' float shock=exp(-abs(r-ph)*24.0)*(1.0-ph)*1.5;',
      ' float ph2=fract(t*0.14+0.5);',
      ' float shock2=exp(-abs(r-ph2)*24.0)*(1.0-ph2)*0.8;',
      ' float rays=pow(abs(cos(a*7.0+t*0.15)),16.0)*exp(-r*3.0)*0.9;',
      ' float neb=fbm(vec2(a*2.2+t*0.1,r*6.0-t*0.5))*exp(-r*1.8);',
      ' vec3 col=core*vec3(1.0,0.93,0.78);',
      ' col+=shock*mix(u_p2,u_p3,ph);',
      ' col+=shock2*u_p4;',
      ' col+=rays*u_p1;',
      ' col+=neb*u_p4*0.55;',
      ' float st=step(0.9982,h(floor(gl_FragCoord.xy/1.5)));',
      ' col+=st*0.4*smoothstep(0.35,0.9,r);',
      ' col+=(h(gl_FragCoord.xy+t)-0.5)*0.015;',
      ' gl_FragColor=vec4(max(col,0.0),1.0);',
      '}'
    ].join('\n');
    const fsGrid = [
      'precision highp float;',
      'uniform vec2 u_res;uniform float u_time;uniform vec3 u_p0;uniform vec3 u_p1;uniform vec3 u_p2;uniform vec3 u_p4;',
      glslNoise,
      'void main(){',
      ' vec2 uv=gl_FragCoord.xy/u_res.xy;',
      ' float aspect=u_res.x/max(u_res.y,1.0);',
      ' float t=u_time;',
      ' float horizon=0.58;',
      ' vec3 col=mix(vec3(0.03,0.01,0.07),vec3(0.10,0.02,0.16),pow(1.0-abs(uv.y-horizon),3.0));',
      // Retro-Sonne über dem Horizont (Scanline-Streifen)
      ' vec2 sun=vec2(0.5*aspect,horizon+0.16);',
      ' vec2 sp=vec2(uv.x*aspect,uv.y);',
      ' float sd=length((sp-sun)*vec2(1.0,1.25));',
      ' float sunM=smoothstep(0.15,0.148,sd);',
      ' float stripes=smoothstep(0.4,0.6,0.5+0.5*sin((uv.y-horizon)*95.0));',
      ' sunM*=mix(1.0,stripes,smoothstep(0.16,0.02,uv.y-horizon));',
      ' vec3 sunCol=mix(u_p1,u_p0,clamp((uv.y-horizon)/0.3,0.0,1.0));',
      ' col+=sunCol*sunM;',
      ' col+=sunCol*0.35*exp(-sd*7.0);',
      // Grid-Ebene unterhalb des Horizonts, perspektivisch, nach vorn scrollend
      ' if(uv.y<horizon){',
      '  float depth=(horizon-uv.y)/horizon;',
      '  float pz=1.0/max(depth,0.012);',
      '  float gx=(uv.x-0.5)*aspect*pz;',
      '  float gz=pz*0.9+t*2.4;',
      '  float lx=abs(fract(gx*0.9)-0.5);',
      '  float lz=abs(fract(gz)-0.5);',
      '  float lw=0.5-min(0.035*pz,0.42);',
      '  float glow=smoothstep(lw,0.5,max(lx,0.0))+smoothstep(lw,0.5,max(lz,0.0));',
      '  glow=clamp(glow,0.0,1.4)*pow(depth,1.15);',
      '  vec3 gcol=mix(u_p2,u_p4,clamp(fbm(vec2(gx*0.3,gz*0.2))*1.3,0.0,1.0));',
      '  col=mix(col,vec3(0.015,0.005,0.03),0.85);',
      '  col+=gcol*glow*1.15;',
      '  float pulse=exp(-abs(fract(gz*0.25-t*0.35)-0.5)*14.0);',
      '  col+=u_p0*pulse*pow(depth,1.3)*0.8*smoothstep(lw,0.5,lz);',
      ' }',
      // Sterne über dem Horizont
      ' float st=step(0.9984,h(floor(gl_FragCoord.xy/1.5)))*smoothstep(horizon,horizon+0.25,uv.y);',
      ' col+=st*0.5;',
      ' col+=(h(gl_FragCoord.xy+t)-0.5)*0.014;',
      ' gl_FragColor=vec4(max(col,0.0),1.0);',
      '}'
    ].join('\n');
    const fsInk = [
      'precision highp float;',
      'uniform vec2 u_res;uniform float u_time;uniform vec3 u_p0;uniform vec3 u_p1;uniform vec3 u_p2;uniform vec3 u_p4;',
      glslNoise,
      'void main(){',
      ' vec2 uv=gl_FragCoord.xy/u_res.xy;',
      ' float aspect=u_res.x/max(u_res.y,1.0);',
      ' vec2 p=vec2(uv.x*aspect,uv.y);',
      ' float t=u_time*0.07;',
      // Tinte in Wasser: domain-warped fbm — Schlieren wirbeln ineinander
      ' vec2 q=vec2(fbm(p*1.6+vec2(t*1.3,t*0.6)),fbm(p*1.6+vec2(5.2-t*0.8,1.3+t*1.1)));',
      ' vec2 r=vec2(fbm(p*1.9+q*2.4+vec2(1.7+t*0.9,9.2)),fbm(p*1.9+q*2.4+vec2(8.3-t*1.2,2.8)));',
      ' float f=fbm(p*2.1+r*2.6);',
      // Papier/Wasser-Grund: sehr helles Elfenbein
      ' vec3 col=vec3(0.955,0.945,0.925);',
      ' col-=0.03*fbm(p*7.0);',
      // Tintenschlieren in Palettenfarben, nach Wirbeltiefe gemischt
      ' float d1=smoothstep(0.30,0.62,f);',
      ' float d2=smoothstep(0.48,0.78,fbm(p*2.4+r*3.1+vec2(3.3,1.1)));',
      ' float d3=smoothstep(0.55,0.9,fbm(p*1.2+q*1.8+vec2(7.7,4.4)));',
      ' col=mix(col,u_p2*0.9,d1*0.75);',
      ' col=mix(col,u_p1,d2*0.8);',
      ' col=mix(col,u_p4*0.55,d3*0.85);',
      // dunkler Tintenkern in den dichtesten Wirbeln + heller Randsaum
      ' float core=smoothstep(0.68,0.95,f*0.55+d2*0.45);',
      ' col=mix(col,u_p4*0.18,core*0.9);',
      ' float rim=smoothstep(0.26,0.34,f)*(1.0-smoothstep(0.34,0.48,f));',
      ' col+=u_p0*rim*0.18;',
      ' col+=(h(gl_FragCoord.xy+u_time)-0.5)*0.012;',
      ' gl_FragColor=vec4(clamp(col,0.0,1.0),1.0);',
      '}'
    ].join('\n');
    const fsStorm = [
      'precision highp float;',
      'uniform vec2 u_res;uniform float u_time;uniform vec3 u_p0;uniform vec3 u_p1;uniform vec3 u_p2;uniform vec3 u_p4;',
      glslNoise,
      'void main(){',
      ' vec2 uv=gl_FragCoord.xy/u_res.xy;',
      ' float aspect=u_res.x/max(u_res.y,1.0);',
      ' vec2 p=vec2(uv.x*aspect,uv.y);',
      ' float t=u_time;',
      // Sturm: schnelle, peitschende Vorhänge — mehrere Bänder mit starkem Warp
      ' vec3 col=mix(vec3(0.008,0.02,0.045),vec3(0.02,0.045,0.09),uv.y);',
      ' for(int i=0;i<3;i++){',
      '  float fi=float(i);',
      '  float warp=fbm(vec2(p.x*1.3+t*(0.55+fi*0.2),fi*3.7+t*0.24));',
      '  float band=uv.y-(0.32+fi*0.17)-0.20*sin(p.x*1.9+t*(1.1+fi*0.35)+fi*2.2)-0.16*(warp-0.5);',
      '  float cur=exp(-band*band*26.0);',
      '  float rip=fbm(vec2(p.x*4.5+t*(1.6+fi*0.5),band*7.0-t*0.9));',
      '  cur*=0.55+0.75*rip;',
      '  float flick=0.75+0.45*sin(t*(2.3+fi)+rip*7.0);',
      '  vec3 bc=mix(u_p1,u_p2,clamp(fi*0.5,0.0,1.0));',
      '  bc=mix(bc,u_p0,rip*0.30);',
      '  col+=bc*cur*flick*0.55;',
      '  col+=u_p4*cur*cur*0.22;',
      ' }',
      // Strahlen-Spikes nach oben (Vorhang-Fasern)
      ' float ray=pow(max(0.0,fbm(vec2(p.x*9.0,t*0.5))-0.42),2.0)*smoothstep(0.9,0.25,uv.y);',
      ' col+=u_p1*ray*0.5;',
      // Sterne + Boden-Silhouette
      ' float st=step(0.9982,h(floor(gl_FragCoord.xy/1.6)));',
      ' col+=st*0.4*smoothstep(0.4,0.1,uv.y*0.0+fract(h(floor(gl_FragCoord.xy/1.6))*7.0));',
      ' float ground=smoothstep(0.085,0.075,uv.y+0.02*fbm(vec2(p.x*2.4,0.5)));',
      ' col=mix(col,vec3(0.004,0.01,0.02),ground);',
      ' col+=(h(gl_FragCoord.xy+t)-0.5)*0.015;',
      ' gl_FragColor=vec4(max(col,0.0),1.0);',
      '}'
    ].join('\n');
    const fsClouds = [
      'precision highp float;',
      'uniform vec2 u_res;uniform float u_time;uniform vec3 u_p0;uniform vec3 u_p2;uniform vec3 u_p4;',
      glslNoise,
      'void main(){',
      ' vec2 uv=gl_FragCoord.xy/u_res.xy;',
      ' float aspect=u_res.x/max(u_res.y,1.0);',
      ' vec2 p=vec2(uv.x*aspect,uv.y);',
      ' float t=u_time*0.09;',
      // Zeitraffer: zwei Wolkenschichten ziehen mit unterschiedlichem Tempo, Formen morphen
      ' float c1=fbm(vec2(p.x*1.5-t*2.2,p.y*2.6+t*0.25));',
      ' c1+=0.5*fbm(vec2(p.x*3.4-t*3.6,p.y*5.2-t*0.4));',
      ' c1=c1/1.5;',
      ' float c2=fbm(vec2(p.x*0.9-t*1.1+7.3,p.y*1.7+t*0.15+3.1));',
      // Himmel: Palette [4]=Zenit, [2]=Horizont, [0]=Sonnenglut
      ' vec3 sky=mix(u_p2,u_p4,pow(uv.y,0.8));',
      ' vec2 sun=vec2(0.78*aspect,0.24);',
      ' float sd=length(p-sun);',
      ' sky+=u_p0*0.35*exp(-sd*2.6);',
      // ferne Schicht: weich, bläulich-schattiert
      ' float m2=smoothstep(0.42,0.75,c2);',
      ' vec3 farCol=mix(sky,mix(u_p4*0.5+vec3(0.32),vec3(0.86,0.88,0.94),0.55),m2*0.55);',
      // nahe Schicht: dichte Quellwolken mit Licht von der Sonne
      ' float m1=smoothstep(0.48,0.82,c1);',
      ' float shade=fbm(vec2(p.x*2.2-t*2.2+0.15,p.y*3.8+0.2));',
      ' vec3 cloudLit=mix(vec3(0.94,0.94,0.97),u_p0,0.28*exp(-sd*1.8));',
      ' vec3 cloudShd=mix(u_p4*0.45+vec3(0.18),cloudLit,smoothstep(0.2,0.8,1.0-shade*0.9));',
      ' vec3 col=mix(farCol,cloudShd,m1);',
      // Kanten-Glow an Wolkenrändern Richtung Sonne
      ' float edge=smoothstep(0.40,0.52,c1)*(1.0-smoothstep(0.52,0.72,c1));',
      ' col+=u_p0*edge*0.35*exp(-sd*1.4);',
      ' col+=(h(gl_FragCoord.xy+u_time)-0.5)*0.012;',
      ' gl_FragColor=vec4(max(col,0.0),1.0);',
      '}'
    ].join('\n');
    const fsPlasma = [
      'precision highp float;',
      'uniform vec2 u_res;uniform float u_time;uniform vec3 u_p0;uniform vec3 u_p1;uniform vec3 u_p2;uniform vec3 u_p3;uniform vec3 u_p4;',
      'vec3 ramp(float x){x=clamp(x,0.0,1.0);vec3 c=mix(u_p4,u_p3,smoothstep(0.0,0.28,x));c=mix(c,u_p2,smoothstep(0.26,0.52,x));c=mix(c,u_p1,smoothstep(0.5,0.76,x));c=mix(c,u_p0,smoothstep(0.74,1.0,x));return c;}',
      'void main(){',
      ' vec2 p=(gl_FragCoord.xy-0.5*u_res)/min(u_res.x,u_res.y);',
      ' p*=3.1;',
      ' float t=u_time*0.55;',
      ' float v=0.0;',
      ' v+=sin(p.x*1.8+t);',
      ' v+=sin(1.7*(p.x*sin(t*0.5)+p.y*cos(t*0.33))+t);',
      ' vec2 c=p+vec2(0.6*sin(t*0.4),0.6*cos(t*0.37));',
      ' v+=sin(length(c)*3.0-t*1.1);',
      ' v+=sin(p.y*1.6-t*0.8);',
      ' float bands=fract(p.x*0.6);',
      ' v+=0.6*sin(10.0*bands*0.0+t);',
      ' v*=0.22;',
      ' float x=0.5+0.5*sin(v*3.14159+t*0.15);',
      ' vec3 col=ramp(x);',
      ' float peak=pow(max(0.0,sin(v*3.14159)),3.0);',
      ' col+=peak*0.14;',
      ' float vig=smoothstep(1.25,0.35,length(p));',
      ' col*=mix(0.82,1.06,vig);',
      ' col+=(fract(sin(dot(gl_FragCoord.xy,vec2(12.9898,78.233)))*43758.5453+t)-0.5)*0.02;',
      ' gl_FragColor=vec4(max(col,0.0),1.0);',
      '}'
    ].join('\n');
    const fsFire = [
      'precision highp float;',
      'uniform vec2 u_res;uniform float u_time;uniform float u_spark;uniform float u_smoke;uniform vec3 u_spcol;uniform vec3 u_smcol;uniform vec3 u_p0;uniform vec3 u_p1;uniform vec3 u_p2;uniform vec3 u_p3;uniform vec3 u_p4;',
      glslNoise,
      'void main(){',
      ' vec2 uv=gl_FragCoord.xy/u_res.xy;',
      ' float aspect=u_res.x/max(u_res.y,1.0);',
      ' vec2 p=vec2(uv.x*aspect,uv.y);',
      ' float t=u_time;',
      // aufsteigende Turbulenz: Rauschfelder scrollen nach unten -> Flammen steigen
      ' float d1=fbm(vec2(p.x*3.2, p.y*2.4 - t*1.6));',
      ' float d2=fbm(vec2(p.x*6.5 + 3.1, p.y*4.2 - t*2.7));',
      ' float turb=d1*0.65 + d2*0.35;',
      // seitliches Flackern
      ' float sway=sin(p.y*4.0 - t*2.2)*0.03 + fbm(vec2(p.x*1.5, t*0.6))*0.06;',
      ' float xw=p.x + sway;',
      // Flammenhöhe: unten heiß, verjüngt nach oben, mit Turbulenz moduliert
      ' float base=1.0 - uv.y;',
      ' float flame=base*1.35 + turb*0.9 - 0.55;',
      // Zungen entlang der Breite (mittige Betonung, Rand kühler)
      ' float cx=1.0 - smoothstep(0.0, 0.62, abs(uv.x-0.5));',
      ' flame*=mix(0.55, 1.15, cx);',
      ' flame=clamp(flame,0.0,1.0);',
      // Hitze-Rampe: dunkel -> glut(p3) -> rot(p2) -> orange(p1) -> gelb/weiß(p0)
      ' vec3 col=mix(u_p4*0.15, u_p3, smoothstep(0.06,0.30,flame));',
      ' col=mix(col, u_p2, smoothstep(0.28,0.52,flame));',
      ' col=mix(col, u_p1, smoothstep(0.5,0.74,flame));',
      ' col=mix(col, u_p0, smoothstep(0.72,0.94,flame));',
      ' col+=u_p0*pow(flame,6.0)*0.5;',
      // Funken: aufsteigende Glut-Embers in 2 Tiefen — Drift, Glüh-Halo, Flackern, Höhen-Fade
      ' vec3 emberCol=vec3(0.0);',
      ' for(int L=0;L<2;L++){',
      '  float fl=float(L);',
      '  float sc=10.0+fl*8.0;',
      '  vec2 ec=vec2(xw*sc, uv.y*sc + t*(2.3+fl*1.4));',
      '  vec2 gid=floor(ec); vec2 gp=fract(ec)-0.5;',
      '  float r0=n(gid+fl*17.3);',
      '  float exists=step(1.0-u_spark*(0.9-fl*0.3), r0);',
      '  float rx=n(gid+3.1); float ry=n(gid+7.7);',
      '  vec2 off=vec2((rx-0.5)*0.55, (ry-0.5)*0.55);',
      '  off.x += sin(uv.y*7.0 + r0*40.0 + t*(2.0+rx*2.5))*(0.12+uv.y*0.22);',
      '  float dd=length((gp-off)*vec2(1.0,1.15));',
      '  float cool=1.0-uv.y*0.6;',
      '  float sz=mix(0.04,0.10,rx)*cool;',
      '  float core=smoothstep(sz,sz*0.15,dd);',
      '  float halo=smoothstep(sz*3.5,sz,dd)*0.35;',
      '  float tw=0.5+0.5*sin(t*(6.0+r0*9.0)+r0*50.0);',
      '  float fade=smoothstep(0.04,0.18,uv.y)*(1.0-smoothstep(0.82,1.12,uv.y))*cool;',
      '  emberCol+=(core+halo*0.7)*exists*mix(0.45,1.0,tw)*fade*(1.15-fl*0.4);',
      ' }',
      ' col+=u_spcol*emberCol*0.95;',
      // Rauch: wabernde fbm-Schwaden, die oben aufsteigen und abdunkeln
      ' float smk=fbm(vec2(xw*2.6 + sin(t*0.3)*0.3, uv.y*2.2 - t*0.9));',
      ' smk=smoothstep(0.42,0.92,smk);',
      ' float smkMask=smoothstep(0.34,0.8,uv.y)*(1.0-smoothstep(0.95,1.1,uv.y))*smk*u_smoke;',
      ' vec3 smokeCol=u_smcol;',
      ' col=mix(col, smokeCol, smkMask);',
      // Fuß-Glut + dunkler Zenit
      ' col+=u_p1*0.25*smoothstep(0.28,0.0,uv.y);',
      ' col*=smoothstep(1.02,0.55,uv.y);',
      ' col+=(h(gl_FragCoord.xy+t)-0.5)*0.02;',
      ' gl_FragColor=vec4(max(col,0.0),1.0);',
      '}'
    ].join('\n');
    const fs = mode === 'aurora' ? fsAurora : mode === 'ribbon' ? fsRibbon : mode === 'blackhole' ? fsHole : mode === 'nova' ? fsNova : mode === 'clouds' ? fsClouds : mode === 'storm' ? fsStorm : mode === 'ink' ? fsInk : mode === 'grid' ? fsGrid : mode === 'plasma' ? fsPlasma : mode === 'fire' ? fsFire : fsLava;
    const mk = (ty, src) => { const sh = gl.createShader(ty); gl.shaderSource(sh, src); gl.compileShader(sh); return sh; };
    const prog = gl.createProgram();
    const shV = mk(gl.VERTEX_SHADER, vs);
    const shF = mk(gl.FRAGMENT_SHADER, fs);
    gl.attachShader(prog, shV);
    gl.attachShader(prog, shF);
    gl.linkProgram(prog);
    if (!gl.getProgramParameter(prog, gl.LINK_STATUS)) {
      console.error('LD hero shader "' + mode + '" link failed:', gl.getProgramInfoLog(prog) || '', gl.getShaderInfoLog(shF) || '', gl.getShaderInfoLog(shV) || '');
      (this._fxFail = this._fxFail || {})[mode] = true;
      return;
    }
    gl.useProgram(prog);
    const buf = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, buf);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 3, -1, -1, 3]), gl.STATIC_DRAW);
    const loc = gl.getAttribLocation(prog, 'p');
    gl.enableVertexAttribArray(loc);
    gl.vertexAttribPointer(loc, 2, gl.FLOAT, false, 0, 0);
    const uRes = gl.getUniformLocation(prog, 'u_res');
    const uTime = gl.getUniformLocation(prog, 'u_time');
    const uVar = gl.getUniformLocation(prog, 'u_var');
    const uCx = gl.getUniformLocation(prog, 'u_cx');
    const uCy = gl.getUniformLocation(prog, 'u_cy');
    const uScale = gl.getUniformLocation(prog, 'u_scale');
    const uAng = gl.getUniformLocation(prog, 'u_ang');
    const uBgT = gl.getUniformLocation(prog, 'u_bgT');
    const uSpark = gl.getUniformLocation(prog, 'u_spark');
    const uSpcol = gl.getUniformLocation(prog, 'u_spcol');
    const uSmoke = gl.getUniformLocation(prog, 'u_smoke');
    const uSmcol = gl.getUniformLocation(prog, 'u_smcol');
    const uPs = [gl.getUniformLocation(prog, 'u_p0'), gl.getUniformLocation(prog, 'u_p1'), gl.getUniformLocation(prog, 'u_p2'), gl.getUniformLocation(prog, 'u_p3'), gl.getUniformLocation(prog, 'u_p4')];
    this._gl = gl; this._glProg = prog; this._glCanvas = cv;
    this._glStart = performance.now();
    const loop = () => {
      if (this._gl !== gl) return;
      if (this._heroVis === false || document.hidden) { this._raf = requestAnimationFrame(loop); return; }
      if (this.state.fpsHalf && (this._frameN = (this._frameN || 0) + 1) % 2) { this._raf = requestAnimationFrame(loop); return; }
      const dpr = this.heroDpr();
      const w = Math.max(2, Math.round(cv.clientWidth * dpr));
      const h = Math.max(2, Math.round(cv.clientHeight * dpr));
      if (cv.width !== w || cv.height !== h) { cv.width = w; cv.height = h; gl.viewport(0, 0, w, h); }
      gl.uniform2f(uRes, cv.width, cv.height);
      let tSec;
      if ((this.state.anim ?? true) === false) {
        if (this._pauseT == null) this._pauseT = (performance.now() - this._glStart) / 1000;
        tSec = this._pauseT;
      } else {
        if (this._pauseT != null) { this._glStart = performance.now() - this._pauseT * 1000; this._pauseT = null; }
        tSec = (performance.now() - this._glStart) / 1000;
      }
      gl.uniform1f(uTime, tSec);
      if (uVar) gl.uniform1f(uVar, this.state.auroraPre === 'borealis' ? 1.0 : 0.0);
      const cc = (this.state.heroCfg || {})[mode] || {};
      if (uCx) {
        const by = mode === 'blackhole' ? 0.47 : mode === 'ribbon' ? 0.5 : 0.46;
        gl.uniform1f(uCx, 0.5 + ((cc.x ?? 50) - 50) / 100);
        gl.uniform1f(uCy, by - ((cc.y ?? 50) - 50) / 100);
        gl.uniform1f(uScale, Math.max(0.25, (cc.s ?? 100) / 100));
      }
      if (uAng) gl.uniform1f(uAng, ((cc.a ?? 50) - 50) * 0.9 * 0.0174533);
      if (uBgT) gl.uniform1f(uBgT, cc.t ? 1.0 : 0.0);
      if (uSpark) gl.uniform1f(uSpark, 0.02 + ((cc.sp ?? 50) / 100) * 0.20);
      if (uSpcol) { const sc3 = this.hex01(cc.spc || this.resolvePal(cc)[0]); gl.uniform3f(uSpcol, sc3[0], sc3[1], sc3[2]); }
      if (uSmoke) gl.uniform1f(uSmoke, ((cc.sm ?? 50) / 100) * 1.1);
      if (uSmcol) { const sm3 = this.hex01(cc.smc || '#151318'); gl.uniform3f(uSmcol, sm3[0], sm3[1], sm3[2]); }
      if (uPs[0] || uPs[1] || uPs[2] || uPs[3] || uPs[4]) {
        const pal = this.resolvePal(cc);
        for (let pi = 0; pi < 5; pi++) {
          if (!uPs[pi]) continue;
          const pc3 = this.hex01(pal[pi]);
          gl.uniform3f(uPs[pi], pc3[0], pc3[1], pc3[2]);
        }
      }
      gl.drawArrays(gl.TRIANGLES, 0, 3);
      this._raf = requestAnimationFrame(loop);
    };
    this._raf = requestAnimationFrame(loop);
  }

  heroDpr() {
    const d = window.devicePixelRatio || 1;
    if (this.isSafari()) return Math.min(d, 1.25); // iPad/iPhone: Speicherdruck vermeiden (Safari-Auto-Reload)
    return this.state.perfMode ? Math.min(d, 1.35) : Math.min(d, 2);
  }

  startSnow(cv) {
    const ctx = cv.getContext('2d');
    if (!ctx) return;
    const token = { snow: true };
    this._gl = token;
    this._glCanvas = cv;
    const hex2rgb = (h) => [parseInt(h.slice(1, 3), 16), parseInt(h.slice(3, 5), 16), parseInt(h.slice(5, 7), 16)];
    let flakes = null, drift = null, W = 0, H = 0;
    // 3 Tiefenebenen: fern (klein, langsam, unscharf-blass) → nah (groß, schnell)
    const mkFlake = (dpr, fresh) => {
      const depth = Math.random();
      return {
        x: Math.random() * W,
        y: fresh ? -8 * dpr : Math.random() * H,
        depth: depth,
        r: (0.7 + depth * 2.6) * dpr,
        sp: (0.35 + depth * 1.15) * dpr,
        wob: Math.random() * 6.28,
        ws: 0.4 + Math.random() * 0.9,
        amp: (6 + depth * 16) * dpr,
      };
    };
    const loop = () => {
      if (this._gl !== token) return;
      if (this._heroVis === false || document.hidden) { this._raf = requestAnimationFrame(loop); return; }
      if (this.state.fpsHalf && (this._frameN = (this._frameN || 0) + 1) % 2) { this._raf = requestAnimationFrame(loop); return; }
      const dpr = this.heroDpr();
      const w = Math.max(2, Math.round(cv.clientWidth * dpr));
      const h = Math.max(2, Math.round(cv.clientHeight * dpr));
      const cc = (this.state.heroCfg || {}).snow || {};
      const pal = this.resolvePal(cc);
      const cSky1 = hex2rgb(pal[4]);
      const cSky2 = hex2rgb(pal[3]);
      const cLight = hex2rgb(pal[0]);
      if (cv.width !== w || cv.height !== h || !flakes) {
        cv.width = w; cv.height = h; W = w; H = h;
        const n = Math.round(Math.min(320, (W / dpr / 1440) * 260));
        flakes = [];
        for (let i = 0; i < n; i++) flakes.push(mkFlake(dpr, false));
      }
      const t = performance.now() / 1000;
      // Winterabend-Himmel: abgedunkelte Palettenfarben + warmer Laternenschein unten links
      const g = ctx.createLinearGradient(0, 0, 0, H);
      g.addColorStop(0, 'rgb(' + Math.round(cSky1[0] * 0.16) + ',' + Math.round(cSky1[1] * 0.18) + ',' + Math.round(cSky1[2] * 0.28) + ')');
      g.addColorStop(1, 'rgb(' + Math.round(cSky2[0] * 0.24) + ',' + Math.round(cSky2[1] * 0.26) + ',' + Math.round(cSky2[2] * 0.36) + ')');
      ctx.fillStyle = g;
      ctx.fillRect(0, 0, W, H);
      const lg = ctx.createRadialGradient(W * 0.16, H * 0.92, 0, W * 0.16, H * 0.92, W * 0.34);
      lg.addColorStop(0, 'rgba(' + cLight[0] + ',' + cLight[1] + ',' + cLight[2] + ',0.12)');
      lg.addColorStop(1, 'rgba(' + cLight[0] + ',' + cLight[1] + ',' + cLight[2] + ',0)');
      ctx.fillStyle = lg;
      ctx.fillRect(0, 0, W, H);
      // Schneedecke unten (weiche Hügel)
      ctx.fillStyle = 'rgba(235,240,250,0.10)';
      ctx.beginPath();
      ctx.moveTo(0, H);
      for (let x = 0; x <= W + 40; x += 40 * dpr) {
        ctx.lineTo(x, H - (10 + Math.sin(x * 0.004 / dpr + 1.7) * 7) * dpr);
      }
      ctx.lineTo(W, H);
      ctx.closePath();
      ctx.fill();
      // Böen: global driftende Seitwärtsbewegung, wechselt langsam
      drift = Math.sin(t * 0.14) * 0.5 + Math.sin(t * 0.037 + 2.2) * 0.35;
      for (let i = 0; i < flakes.length; i++) {
        const f = flakes[i];
        f.wob += f.ws * 0.016;
        f.y += f.sp;
        f.x += Math.sin(f.wob) * 0.22 * dpr * f.depth + drift * f.depth * 1.1 * dpr;
        if (f.x < -10) f.x = W + 10; if (f.x > W + 10) f.x = -10;
        if (f.y > H + 8 * dpr) { flakes[i] = mkFlake(dpr, true); continue; }
        const a = 0.28 + f.depth * 0.6;
        // ferne Flocken leicht bläulich, nahe fast weiß
        const mix = f.depth;
        const r = Math.round(200 + mix * 55), gg = Math.round(210 + mix * 45), b = Math.round(228 + mix * 27);
        ctx.fillStyle = 'rgba(' + r + ',' + gg + ',' + b + ',' + a + ')';
        ctx.beginPath(); ctx.arc(f.x, f.y, f.r, 0, 6.283); ctx.fill();
        // Glanz auf großen nahen Flocken
        if (f.depth > 0.8) {
          ctx.fillStyle = 'rgba(255,255,255,' + (a * 0.5) + ')';
          ctx.beginPath(); ctx.arc(f.x - f.r * 0.3, f.y - f.r * 0.3, f.r * 0.35, 0, 6.283); ctx.fill();
        }
      }
      this._raf = requestAnimationFrame(loop);
    };
    this._raf = requestAnimationFrame(loop);
  }

  startShooting(cv) {
    const ctx = cv.getContext('2d');
    if (!ctx) return;
    const token = { shooting: true };
    this._gl = token;
    this._glCanvas = cv;
    const hex2rgb = (h) => [parseInt(h.slice(1, 3), 16), parseInt(h.slice(3, 5), 16), parseInt(h.slice(5, 7), 16)];
    let stars = null, meteors = null, W = 0, H = 0, nextAt = 0;
    const mkMeteor = (dpr, burst) => {
      const ang = (18 + Math.random() * 20) * Math.PI / 180; // flach von links-oben nach rechts-unten
      const sp = (9 + Math.random() * 8) * dpr;
      return {
        x: Math.random() * W * 0.9 - W * 0.1,
        y: Math.random() * H * 0.38 - H * 0.12,
        vx: Math.cos(ang) * sp,
        vy: Math.sin(ang) * sp,
        len: (90 + Math.random() * 160) * dpr,
        life: 1,
        decay: 0.008 + Math.random() * 0.01,
        w: (1 + Math.random() * 1.4) * dpr,
        hue: Math.random(),
        delay: burst ? Math.random() * 30 : 0,
      };
    };
    const loop = () => {
      if (this._gl !== token) return;
      if (this._heroVis === false || document.hidden) { this._raf = requestAnimationFrame(loop); return; }
      if (this.state.fpsHalf && (this._frameN = (this._frameN || 0) + 1) % 2) { this._raf = requestAnimationFrame(loop); return; }
      const dpr = this.heroDpr();
      const w = Math.max(2, Math.round(cv.clientWidth * dpr));
      const h = Math.max(2, Math.round(cv.clientHeight * dpr));
      const cc = (this.state.heroCfg || {}).shooting || {};
      const pal = this.resolvePal(cc);
      const cA = hex2rgb(pal[0]);
      const cB = hex2rgb(pal[2]);
      const t = performance.now();
      if (cv.width !== w || cv.height !== h || !stars) {
        cv.width = w; cv.height = h; W = w; H = h;
        stars = [];
        const n = Math.round((W / dpr / 1440) * 210);
        for (let i = 0; i < n; i++) stars.push({ x: Math.random() * W, y: Math.random() * H, r: (0.4 + Math.random() * 0.9) * dpr, tw: Math.random() * 6.28, ts: 0.4 + Math.random() * 1.6, tint: Math.random() < 0.18 });
        meteors = [mkMeteor(dpr, false)];
        nextAt = t + 600;
      }
      // Himmel: tiefes Blau mit Milchstraßen-Schimmer diagonal
      const g = ctx.createLinearGradient(0, 0, 0, H);
      g.addColorStop(0, '#04070F');
      g.addColorStop(1, '#0A0F1E');
      ctx.fillStyle = g;
      ctx.fillRect(0, 0, W, H);
      const mw = ctx.createLinearGradient(0, H * 0.7, W, H * 0.1);
      mw.addColorStop(0, 'rgba(120,140,190,0)');
      mw.addColorStop(0.5, 'rgba(120,140,190,0.055)');
      mw.addColorStop(1, 'rgba(120,140,190,0)');
      ctx.fillStyle = mw;
      ctx.fillRect(0, 0, W, H);
      // Fixsterne mit Funkeln
      const ts = t / 1000;
      for (const st of stars) {
        const tw = 0.45 + 0.55 * Math.pow(Math.sin(st.tw + ts * st.ts) * 0.5 + 0.5, 2);
        const c = st.tint ? cA : [225, 232, 246];
        ctx.fillStyle = 'rgba(' + c[0] + ',' + c[1] + ',' + c[2] + ',' + (0.75 * tw) + ')';
        ctx.beginPath(); ctx.arc(st.x, st.y, st.r * (0.8 + tw * 0.4), 0, 6.283); ctx.fill();
      }
      // Sternschnuppen: gelegentlich einzeln, selten ein kleiner Schauer
      if (t > nextAt) {
        const burst = Math.random() < 0.18;
        const cnt = burst ? 2 + ((Math.random() * 2) | 0) : 1;
        for (let i = 0; i < cnt; i++) meteors.push(mkMeteor(dpr, burst));
        nextAt = t + 1400 + Math.random() * 2600;
      }
      ctx.lineCap = 'round';
      ctx.globalCompositeOperation = 'lighter';
      for (let i = meteors.length - 1; i >= 0; i--) {
        const m = meteors[i];
        if (m.delay > 0) { m.delay--; continue; }
        const c = m.hue < 0.55 ? [235, 240, 250] : m.hue < 0.85 ? cA : cB;
        const tailX = m.x - (m.vx / Math.hypot(m.vx, m.vy)) * m.len * m.life;
        const tailY = m.y - (m.vy / Math.hypot(m.vx, m.vy)) * m.len * m.life;
        const tg = ctx.createLinearGradient(tailX, tailY, m.x, m.y);
        tg.addColorStop(0, 'rgba(' + c[0] + ',' + c[1] + ',' + c[2] + ',0)');
        tg.addColorStop(0.7, 'rgba(' + c[0] + ',' + c[1] + ',' + c[2] + ',' + (0.30 * m.life) + ')');
        tg.addColorStop(1, 'rgba(' + c[0] + ',' + c[1] + ',' + c[2] + ',' + (0.9 * m.life) + ')');
        ctx.strokeStyle = tg;
        ctx.lineWidth = m.w * m.life;
        ctx.beginPath(); ctx.moveTo(tailX, tailY); ctx.lineTo(m.x, m.y); ctx.stroke();
        // Kopf-Glow
        const hg = ctx.createRadialGradient(m.x, m.y, 0, m.x, m.y, 7 * dpr * m.life);
        hg.addColorStop(0, 'rgba(255,255,255,' + (0.85 * m.life) + ')');
        hg.addColorStop(0.4, 'rgba(' + c[0] + ',' + c[1] + ',' + c[2] + ',' + (0.4 * m.life) + ')');
        hg.addColorStop(1, 'rgba(' + c[0] + ',' + c[1] + ',' + c[2] + ',0)');
        ctx.fillStyle = hg;
        ctx.beginPath(); ctx.arc(m.x, m.y, 7 * dpr * m.life, 0, 6.283); ctx.fill();
        m.x += m.vx; m.y += m.vy;
        m.life -= m.decay;
        if (m.life <= 0 || m.x - m.len > W + 40 || m.y - m.len > H + 40) meteors.splice(i, 1);
      }
      ctx.globalCompositeOperation = 'source-over';
      this._raf = requestAnimationFrame(loop);
    };
    this._raf = requestAnimationFrame(loop);
  }

  startFirefly(cv) {
    const ctx = cv.getContext('2d');
    if (!ctx) return;
    const token = { firefly: true };
    this._gl = token;
    this._glCanvas = cv;
    const hex2rgb = (h) => [parseInt(h.slice(1, 3), 16), parseInt(h.slice(3, 5), 16), parseInt(h.slice(5, 7), 16)];
    let F = null, W = 0, H = 0;
    // Sommernacht: Wiese unten, Glühwürmchen mit Puls-Blinken (Kuramoto-artige Sync-Tendenz)
    const mkF = (dpr) => ({
      x: Math.random() * W,
      y: H * (0.25 + Math.random() * 0.72),
      wx: Math.random() * 6.28, wy: Math.random() * 6.28,
      wsx: 0.15 + Math.random() * 0.4, wsy: 0.12 + Math.random() * 0.35,
      amp: (10 + Math.random() * 34) * dpr,
      ph: Math.random() * 6.28,          // Blink-Phase
      pf: 0.35 + Math.random() * 0.3,    // Blink-Frequenz
      sz: (1.1 + Math.random() * 1.9) * dpr,
      depth: 0.45 + Math.random() * 0.55, // Parallaxe/Helligkeit
    });
    const loop = () => {
      if (this._gl !== token) return;
      if (this._heroVis === false || document.hidden) { this._raf = requestAnimationFrame(loop); return; }
      if (this.state.fpsHalf && (this._frameN = (this._frameN || 0) + 1) % 2) { this._raf = requestAnimationFrame(loop); return; }
      const dpr = this.heroDpr();
      const w = Math.max(2, Math.round(cv.clientWidth * dpr));
      const h = Math.max(2, Math.round(cv.clientHeight * dpr));
      const cc = (this.state.heroCfg || {}).firefly || {};
      const pal = this.resolvePal(cc);
      const glow = hex2rgb(pal[0]);
      const glow2 = hex2rgb(pal[1]);
      const moon = hex2rgb(pal[2]);
      if (cv.width !== w || cv.height !== h || !F) {
        cv.width = w; cv.height = h; W = w; H = h;
        const n = Math.round(Math.min(90, (W / dpr / 1440) * 72));
        F = [];
        for (let i = 0; i < n; i++) F.push(mkF(dpr));
      }
      const t = performance.now() / 1000;
      // Nachthimmel-Verlauf + Mondschein oben rechts
      const g = ctx.createLinearGradient(0, 0, 0, H);
      g.addColorStop(0, '#060B14');
      g.addColorStop(0.62, '#08101B');
      g.addColorStop(1, '#0A1410');
      ctx.fillStyle = g;
      ctx.fillRect(0, 0, W, H);
      const mg = ctx.createRadialGradient(W * 0.82, H * 0.14, 0, W * 0.82, H * 0.14, W * 0.3);
      mg.addColorStop(0, 'rgba(' + moon[0] + ',' + moon[1] + ',' + moon[2] + ',0.10)');
      mg.addColorStop(1, 'rgba(' + moon[0] + ',' + moon[1] + ',' + moon[2] + ',0)');
      ctx.fillStyle = mg;
      ctx.fillRect(0, 0, W, H);
      // Gras-Silhouetten unten (zwei Ebenen, leicht schwankend)
      for (let layer = 0; layer < 2; layer++) {
        const yBase = H * (0.9 + layer * 0.055);
        const alpha = layer === 0 ? 0.5 : 0.85;
        ctx.fillStyle = 'rgba(3,6,5,' + alpha + ')';
        ctx.beginPath();
        ctx.moveTo(0, H);
        const seg = 26 * dpr;
        for (let x = 0; x <= W + seg; x += seg) {
          const sway = Math.sin(t * (0.5 - layer * 0.15) + x * 0.011 / dpr + layer * 3) * 5 * dpr;
          const hgt = (Math.sin(x * 0.037 / dpr + layer * 7.3) * 0.5 + 0.5) * 26 * dpr + 8 * dpr;
          ctx.lineTo(x, yBase - hgt + sway);
        }
        ctx.lineTo(W, H);
        ctx.closePath();
        ctx.fill();
      }
      // Sync-Tendenz: globale mittlere Phase zieht individuelle Phasen leicht an
      let sx = 0, sy = 0;
      for (const f of F) { sx += Math.cos(f.ph); sy += Math.sin(f.ph); }
      const meanPh = Math.atan2(sy / F.length, sx / F.length);
      ctx.globalCompositeOperation = 'lighter';
      for (const f of F) {
        f.wx += f.wsx * 0.016; f.wy += f.wsy * 0.016;
        const x = f.x + Math.sin(f.wx) * f.amp + Math.sin(f.wy * 0.6) * f.amp * 0.4;
        const y = f.y + Math.sin(f.wy) * f.amp * 0.55 + Math.cos(f.wx * 0.7) * f.amp * 0.25;
        f.ph += f.pf * 0.016 * 6.28 * 0.2;
        let dPh = meanPh - f.ph;
        while (dPh > 3.1416) dPh -= 6.283;
        while (dPh < -3.1416) dPh += 6.283;
        f.ph += dPh * 0.0035; // sanfte Synchronisation
        const blink = Math.pow(Math.max(0, Math.sin(f.ph)), 3);
        if (blink < 0.02) continue;
        const c = f.depth > 0.72 ? glow : glow2;
        const r = f.sz * (2.2 + blink * 2.6) * f.depth;
        const halo = ctx.createRadialGradient(x, y, 0, x, y, r * 4);
        halo.addColorStop(0, 'rgba(' + c[0] + ',' + c[1] + ',' + c[2] + ',' + (0.5 * blink * f.depth) + ')');
        halo.addColorStop(0.35, 'rgba(' + c[0] + ',' + c[1] + ',' + c[2] + ',' + (0.16 * blink * f.depth) + ')');
        halo.addColorStop(1, 'rgba(' + c[0] + ',' + c[1] + ',' + c[2] + ',0)');
        ctx.fillStyle = halo;
        ctx.beginPath(); ctx.arc(x, y, r * 4, 0, 6.283); ctx.fill();
        ctx.fillStyle = 'rgba(255,255,240,' + (0.75 * blink) + ')';
        ctx.beginPath(); ctx.arc(x, y, Math.max(0.8 * dpr, r * 0.28), 0, 6.283); ctx.fill();
      }
      ctx.globalCompositeOperation = 'source-over';
      this._raf = requestAnimationFrame(loop);
    };
    this._raf = requestAnimationFrame(loop);
  }

  startSwarm(cv) {
    const ctx = cv.getContext('2d');
    if (!ctx) return;
    const token = { swarm: true };
    this._gl = token;
    this._glCanvas = cv;
    const hex2rgb = (h) => [parseInt(h.slice(1, 3), 16), parseInt(h.slice(3, 5), 16), parseInt(h.slice(5, 7), 16)];
    let P = null, W = 0, H = 0;
    // Boids mit 3 Attraktoren auf Lissajous-Bahnen; Spatial-Grid für Nachbarschaft
    const mkP = (dpr) => ({
      x: Math.random() * W, y: Math.random() * H,
      vx: (Math.random() - 0.5) * 2 * dpr, vy: (Math.random() - 0.5) * 2 * dpr,
      ci: Math.random() < 0.14 ? 0 : Math.random() < 0.5 ? 1 : Math.random() < 0.7 ? 2 : 3,
      sz: (0.9 + Math.random() * 1.7),
    });
    const loop = () => {
      if (this._gl !== token) return;
      if (this._heroVis === false || document.hidden) { this._raf = requestAnimationFrame(loop); return; }
      if (this.state.fpsHalf && (this._frameN = (this._frameN || 0) + 1) % 2) { this._raf = requestAnimationFrame(loop); return; }
      const dpr = this.heroDpr();
      const w = Math.max(2, Math.round(cv.clientWidth * dpr));
      const h = Math.max(2, Math.round(cv.clientHeight * dpr));
      const cc = (this.state.heroCfg || {}).swarm || {};
      const pal = this.resolvePal(cc);
      const cols = [hex2rgb(pal[0]), hex2rgb(pal[1]), hex2rgb(pal[2]), hex2rgb(pal[4])];
      if (cv.width !== w || cv.height !== h || !P) {
        cv.width = w; cv.height = h; W = w; H = h;
        const n = Math.round(Math.min(340, (W / dpr / 1440) * 300));
        P = [];
        for (let i = 0; i < n; i++) P.push(mkP(dpr));
        ctx.fillStyle = '#05070D';
        ctx.fillRect(0, 0, W, H);
      }
      // Trail-Fade
      ctx.fillStyle = 'rgba(5,7,13,0.16)';
      ctx.fillRect(0, 0, W, H);
      const t = performance.now() / 1000;
      const att = [
        { x: W * (0.5 + 0.33 * Math.sin(t * 0.21)), y: H * (0.45 + 0.3 * Math.sin(t * 0.33 + 1.2)) },
        { x: W * (0.5 + 0.36 * Math.sin(t * 0.16 + 2.6)), y: H * (0.5 + 0.32 * Math.cos(t * 0.24)) },
        { x: W * (0.5 + 0.3 * Math.cos(t * 0.28 + 4.1)), y: H * (0.42 + 0.3 * Math.sin(t * 0.19 + 3.4)) },
      ];
      // Spatial-Grid
      const cell = 46 * dpr;
      const gw = Math.ceil(W / cell), gh = Math.ceil(H / cell);
      const grid = new Array(gw * gh);
      for (let i = 0; i < P.length; i++) {
        const p = P[i];
        const gi = Math.min(gw - 1, Math.max(0, (p.x / cell) | 0)) + Math.min(gh - 1, Math.max(0, (p.y / cell) | 0)) * gw;
        (grid[gi] || (grid[gi] = [])).push(p);
      }
      const maxV = 2.6 * dpr;
      for (let i = 0; i < P.length; i++) {
        const p = P[i];
        // Attraktor-Zug (jeder Boid folgt "seinem" Attraktor)
        const a = att[i % 3];
        let dx = a.x - p.x, dy = a.y - p.y;
        const dist = Math.hypot(dx, dy) || 1;
        p.vx += (dx / dist) * 0.055 * dpr;
        p.vy += (dy / dist) * 0.055 * dpr;
        // Nachbarn: Separation + Alignment (nur eigene Zelle — billig)
        const gi = Math.min(gw - 1, Math.max(0, (p.x / cell) | 0)) + Math.min(gh - 1, Math.max(0, (p.y / cell) | 0)) * gw;
        const near = grid[gi];
        if (near && near.length > 1) {
          let sx = 0, sy = 0, ax = 0, ay = 0, cnt = 0;
          for (let k = 0; k < near.length && k < 9; k++) {
            const q = near[k];
            if (q === p) continue;
            const qx = p.x - q.x, qy = p.y - q.y;
            const d2 = qx * qx + qy * qy;
            if (d2 < (18 * dpr) * (18 * dpr) && d2 > 0.01) { const d = Math.sqrt(d2); sx += qx / d; sy += qy / d; }
            ax += q.vx; ay += q.vy; cnt++;
          }
          p.vx += sx * 0.09 * dpr + (cnt ? (ax / cnt - p.vx) * 0.045 : 0);
          p.vy += sy * 0.09 * dpr + (cnt ? (ay / cnt - p.vy) * 0.045 : 0);
        }
        // Wirbel um Attraktor (leichte Tangentialkraft → Murmuration-Look)
        p.vx += (-dy / dist) * 0.028 * dpr;
        p.vy += (dx / dist) * 0.028 * dpr;
        const v = Math.hypot(p.vx, p.vy);
        if (v > maxV) { p.vx = (p.vx / v) * maxV; p.vy = (p.vy / v) * maxV; }
        p.x += p.vx; p.y += p.vy;
        if (p.x < -20) p.x = W + 20; if (p.x > W + 20) p.x = -20;
        if (p.y < -20) p.y = H + 20; if (p.y > H + 20) p.y = -20;
        const c = cols[p.ci];
        const sp = Math.min(1, v / maxV);
        ctx.fillStyle = 'rgba(' + c[0] + ',' + c[1] + ',' + c[2] + ',' + (0.5 + sp * 0.45) + ')';
        const s = p.sz * dpr * (0.8 + sp * 0.5);
        ctx.fillRect(p.x - s / 2, p.y - s / 2, s, s);
      }
      // Glow um Attraktoren
      for (const a of att) {
        const g = ctx.createRadialGradient(a.x, a.y, 0, a.x, a.y, 60 * dpr);
        const c0 = cols[0];
        g.addColorStop(0, 'rgba(' + c0[0] + ',' + c0[1] + ',' + c0[2] + ',0.05)');
        g.addColorStop(1, 'rgba(' + c0[0] + ',' + c0[1] + ',' + c0[2] + ',0)');
        ctx.fillStyle = g;
        ctx.beginPath(); ctx.arc(a.x, a.y, 60 * dpr, 0, 6.283); ctx.fill();
      }
      this._raf = requestAnimationFrame(loop);
    };
    this._raf = requestAnimationFrame(loop);
  }

  startRain(cv) {
    const ctx = cv.getContext('2d');
    if (!ctx) return;
    const token = { rain: true };
    this._gl = token;
    this._glCanvas = cv;
    const hex2rgb = (h) => [parseInt(h.slice(1, 3), 16), parseInt(h.slice(3, 5), 16), parseInt(h.slice(5, 7), 16)];
    let drops = null, streaks = null, W = 0, H = 0;
    const mkDrop = (dpr, fresh) => ({
      x: Math.random() * W,
      y: fresh ? -10 : Math.random() * H,
      r: (1.2 + Math.random() * 2.6) * dpr,
      vy: 0,
      slide: Math.random() < 0.3,
      wob: Math.random() * 6.28,
      life: 220 + Math.random() * 400,
    });
    const loop = () => {
      if (this._gl !== token) return;
      if (this._heroVis === false || document.hidden) { this._raf = requestAnimationFrame(loop); return; }
      if (this.state.fpsHalf && (this._frameN = (this._frameN || 0) + 1) % 2) { this._raf = requestAnimationFrame(loop); return; }
      const dpr = this.heroDpr();
      const w = Math.max(2, Math.round(cv.clientWidth * dpr));
      const h = Math.max(2, Math.round(cv.clientHeight * dpr));
      const cc = (this.state.heroCfg || {}).rain || {};
      const pal = this.resolvePal(cc);
      const cTop = hex2rgb(pal[3]);
      const cBot = hex2rgb(pal[4]);
      const cHi = hex2rgb(pal[0]);
      if (cv.width !== w || cv.height !== h || !drops) {
        cv.width = w; cv.height = h; W = w; H = h;
        drops = [];
        const n = Math.round((W / dpr / 1440) * 110);
        for (let i = 0; i < n; i++) drops.push(mkDrop(dpr, false));
        streaks = [];
        for (let i = 0; i < 26; i++) streaks.push({ x: Math.random() * W, y: Math.random() * H, len: (30 + Math.random() * 110) * dpr, sp: (2.2 + Math.random() * 4) * dpr, w: (0.7 + Math.random() * 1.1) * dpr });
      }
      // Abendlicht hinter beschlagenem Glas: weicher Verlauf + Bokeh-Lichter
      const g = ctx.createLinearGradient(0, 0, 0, H);
      g.addColorStop(0, 'rgb(' + Math.round(cTop[0] * 0.22) + ',' + Math.round(cTop[1] * 0.22) + ',' + Math.round(cTop[2] * 0.30) + ')');
      g.addColorStop(1, 'rgb(' + Math.round(cBot[0] * 0.10) + ',' + Math.round(cBot[1] * 0.10) + ',' + Math.round(cBot[2] * 0.16) + ')');
      ctx.fillStyle = g;
      ctx.fillRect(0, 0, W, H);
      const t = performance.now() / 1000;
      for (let i = 0; i < 7; i++) {
        const bx = (i * 0.147 + 0.06) * W + Math.sin(t * 0.1 + i * 2.1) * 14 * dpr;
        const by = (0.18 + ((i * 37) % 50) / 100) * H;
        const br = (26 + (i % 4) * 16) * dpr;
        const bo = ctx.createRadialGradient(bx, by, 0, bx, by, br);
        const bc = i % 3 === 0 ? cHi : i % 3 === 1 ? pal.map ? hex2rgb(pal[2]) : cTop : cTop;
        bo.addColorStop(0, 'rgba(' + bc[0] + ',' + bc[1] + ',' + bc[2] + ',' + (0.16 + 0.05 * Math.sin(t * 0.7 + i)) + ')');
        bo.addColorStop(1, 'rgba(' + bc[0] + ',' + bc[1] + ',' + bc[2] + ',0)');
        ctx.fillStyle = bo;
        ctx.beginPath(); ctx.arc(bx, by, br, 0, 6.283); ctx.fill();
      }
      // Laufstreifen (ablaufendes Wasser)
      ctx.lineCap = 'round';
      for (const st of streaks) {
        const sg = ctx.createLinearGradient(st.x, st.y - st.len, st.x, st.y);
        sg.addColorStop(0, 'rgba(255,255,255,0)');
        sg.addColorStop(1, 'rgba(' + cHi[0] + ',' + cHi[1] + ',' + cHi[2] + ',0.20)');
        ctx.strokeStyle = sg;
        ctx.lineWidth = st.w;
        ctx.beginPath(); ctx.moveTo(st.x, st.y - st.len); ctx.lineTo(st.x, st.y); ctx.stroke();
        st.y += st.sp;
        if (st.y - st.len > H) { st.y = -10; st.x = Math.random() * W; st.len = (30 + Math.random() * 110) * dpr; st.sp = (2.2 + Math.random() * 4) * dpr; }
      }
      // Tropfen auf der Scheibe
      for (let i = 0; i < drops.length; i++) {
        const d = drops[i];
        d.wob += 0.04;
        if (d.slide) {
          d.vy = Math.min(d.vy + 0.012 * dpr, (0.5 + d.r * 0.16));
          d.y += d.vy;
          d.x += Math.sin(d.wob) * 0.3 * dpr;
        }
        d.life -= 1;
        if (d.y > H + 10 || d.life < 0) { drops[i] = mkDrop(dpr, d.y > H); continue; }
        const rr = d.r;
        // Tropfenkörper: dunkler Kern (Refraktion), heller Rand, Glanzpunkt
        const body = ctx.createRadialGradient(d.x, d.y, rr * 0.1, d.x, d.y, rr);
        body.addColorStop(0, 'rgba(' + Math.round(cTop[0] * 0.5) + ',' + Math.round(cTop[1] * 0.5) + ',' + Math.round(cTop[2] * 0.6) + ',0.55)');
        body.addColorStop(0.75, 'rgba(' + cHi[0] + ',' + cHi[1] + ',' + cHi[2] + ',0.22)');
        body.addColorStop(1, 'rgba(' + cHi[0] + ',' + cHi[1] + ',' + cHi[2] + ',0.05)');
        ctx.fillStyle = body;
        ctx.beginPath(); ctx.arc(d.x, d.y, rr, 0, 6.283); ctx.fill();
        ctx.fillStyle = 'rgba(255,255,255,' + (0.35 + rr / dpr * 0.06) + ')';
        ctx.beginPath(); ctx.arc(d.x - rr * 0.32, d.y - rr * 0.35, rr * 0.22, 0, 6.283); ctx.fill();
      }
      this._raf = requestAnimationFrame(loop);
    };
    this._raf = requestAnimationFrame(loop);
  }

  startFireworks(cv) {
    const ctx = cv.getContext('2d');
    if (!ctx) return;
    const token = { fireworks: true };
    this._gl = token;
    this._glCanvas = cv;
    const hex2rgb = (h) => [parseInt(h.slice(1, 3), 16), parseInt(h.slice(3, 5), 16), parseInt(h.slice(5, 7), 16)];
    let W = 0, H = 0;
    let rockets = [], sparks = [], stars = null;
    let nextLaunch = 0;
    const loop = () => {
      if (this._gl !== token) return;
      if (this._heroVis === false || document.hidden) { this._raf = requestAnimationFrame(loop); return; }
      if (this.state.fpsHalf && (this._frameN = (this._frameN || 0) + 1) % 2) { this._raf = requestAnimationFrame(loop); return; }
      const dpr = this.heroDpr();
      const w = Math.max(2, Math.round(cv.clientWidth * dpr));
      const h = Math.max(2, Math.round(cv.clientHeight * dpr));
      const cc = (this.state.heroCfg || {}).fireworks || {};
      const pal = this.resolvePal(cc);
      if (cv.width !== w || cv.height !== h || !stars) {
        cv.width = w; cv.height = h; W = w; H = h;
        rockets = []; sparks = [];
        stars = [];
        for (let i = 0; i < 60; i++) stars.push({ x: Math.random() * W, y: Math.random() * H * 0.8, r: (0.4 + Math.random() * 0.8) * dpr, ph: Math.random() * 6.28 });
        ctx.fillStyle = '#050510';
        ctx.fillRect(0, 0, W, H);
      }
      const t = performance.now();
      // Trail-Fade statt Vollclear
      ctx.globalCompositeOperation = 'source-over';
      ctx.fillStyle = 'rgba(4,4,12,0.16)';
      ctx.fillRect(0, 0, W, H);
      // Sterne
      for (const st of stars) {
        ctx.fillStyle = 'rgba(255,255,255,' + (0.05 + 0.05 * Math.sin(t / 900 + st.ph)).toFixed(3) + ')';
        ctx.fillRect(st.x, st.y, st.r, st.r);
      }
      // Stadt-Silhouette unten
      ctx.fillStyle = 'rgba(2,3,8,0.9)';
      ctx.fillRect(0, H * 0.96, W, H * 0.04);
      // Start neuer Raketen
      if (t > nextLaunch && rockets.length < 3) {
        const col = hex2rgb(pal[Math.floor(Math.random() * 5)]);
        rockets.push({
          x: W * (0.15 + Math.random() * 0.7), y: H * 0.98,
          vx: (Math.random() - 0.5) * 0.9 * dpr, vy: -(5.2 + Math.random() * 2.4) * dpr,
          targetY: H * (0.16 + Math.random() * 0.3), col: col, big: Math.random() < 0.25,
        });
        nextLaunch = t + 700 + Math.random() * 1500;
      }
      ctx.globalCompositeOperation = 'lighter';
      // Raketen
      for (let i = rockets.length - 1; i >= 0; i--) {
        const r = rockets[i];
        r.x += r.vx; r.y += r.vy; r.vy += 0.045 * dpr;
        ctx.strokeStyle = 'rgba(' + r.col[0] + ',' + r.col[1] + ',' + r.col[2] + ',0.8)';
        ctx.lineWidth = 1.6 * dpr;
        ctx.beginPath(); ctx.moveTo(r.x, r.y); ctx.lineTo(r.x - r.vx * 2.4, r.y - r.vy * 2.4); ctx.stroke();
        if (Math.random() < 0.5) sparks.push({ x: r.x, y: r.y, vx: (Math.random() - 0.5) * 0.6 * dpr, vy: 0.4 * dpr, life: 0.5, dec: 0.06, col: [255, 220, 160], sz: 1 });
        if (r.y <= r.targetY || r.vy > -0.6 * dpr) {
          // Explosion
          const n = r.big ? 110 : 64;
          const ring = Math.random() < 0.35;
          for (let k = 0; k < n; k++) {
            const a = (k / n) * 6.283 + Math.random() * 0.12;
            const sp = ring ? (2.6 + Math.random() * 0.5) : (0.6 + Math.random() * 3.2);
            const col2 = Math.random() < 0.22 ? hex2rgb(pal[Math.floor(Math.random() * 5)]) : r.col;
            sparks.push({
              x: r.x, y: r.y,
              vx: Math.cos(a) * sp * dpr, vy: Math.sin(a) * sp * dpr,
              life: 1, dec: 0.008 + Math.random() * 0.012,
              col: col2, sz: r.big ? 1.5 : 1.2, twinkle: Math.random() < 0.3,
            });
          }
          // Blitz-Glow
          const gg = ctx.createRadialGradient(r.x, r.y, 0, r.x, r.y, (r.big ? 120 : 80) * dpr);
          gg.addColorStop(0, 'rgba(' + r.col[0] + ',' + r.col[1] + ',' + r.col[2] + ',0.35)');
          gg.addColorStop(1, 'rgba(' + r.col[0] + ',' + r.col[1] + ',' + r.col[2] + ',0)');
          ctx.fillStyle = gg;
          ctx.beginPath(); ctx.arc(r.x, r.y, (r.big ? 120 : 80) * dpr, 0, 6.283); ctx.fill();
          rockets.splice(i, 1);
        }
      }
      // Funken
      const cap = 900;
      if (sparks.length > cap) sparks.splice(0, sparks.length - cap);
      for (let i = sparks.length - 1; i >= 0; i--) {
        const p = sparks[i];
        p.x += p.vx; p.y += p.vy;
        p.vx *= 0.985; p.vy = p.vy * 0.985 + 0.028 * dpr;
        p.life -= p.dec;
        if (p.life <= 0 || p.y > H) { sparks.splice(i, 1); continue; }
        const a2 = p.twinkle ? p.life * (0.5 + 0.5 * Math.sin(t / 60 + p.x)) : p.life;
        ctx.fillStyle = 'rgba(' + p.col[0] + ',' + p.col[1] + ',' + p.col[2] + ',' + Math.max(0, a2).toFixed(3) + ')';
        const s2 = p.sz * dpr * (0.7 + p.life * 0.6);
        ctx.fillRect(p.x - s2 / 2, p.y - s2 / 2, s2, s2);
      }
      ctx.globalCompositeOperation = 'source-over';
      this._raf = requestAnimationFrame(loop);
    };
    this._raf = requestAnimationFrame(loop);
  }

  startHourglass(cv) {
    const ctx = cv.getContext('2d');
    if (!ctx) return;
    const token = { hourglass: true };
    this._gl = token;
    this._glCanvas = cv;
    const hex2rgb = (h) => [parseInt(h.slice(1, 3), 16), parseInt(h.slice(3, 5), 16), parseInt(h.slice(5, 7), 16)];
    const ease = (v) => v < 0 ? 0 : v > 1 ? 1 : v * v * (3 - 2 * v);
    const CYCLE = 20; // s pro Durchlauf inkl. Flip
    let W = 0, H = 0, grains = null, motes = null;
    const loop = () => {
      if (this._gl !== token) return;
      if (this._heroVis === false || document.hidden) { this._raf = requestAnimationFrame(loop); return; }
      if (this.state.fpsHalf && (this._frameN = (this._frameN || 0) + 1) % 2) { this._raf = requestAnimationFrame(loop); return; }
      const dpr = this.heroDpr();
      const w = Math.max(2, Math.round(cv.clientWidth * dpr));
      const h = Math.max(2, Math.round(cv.clientHeight * dpr));
      const cc = (this.state.heroCfg || {}).hourglass || {};
      const pal = this.resolvePal(cc);
      const cSand = hex2rgb(pal[0]), cGlow = hex2rgb(pal[1]), cGlass = hex2rgb(pal[2]), cD = hex2rgb(pal[4]);
      if (cv.width !== w || cv.height !== h || !grains) {
        cv.width = w; cv.height = h; W = w; H = h;
        grains = [];
        motes = [];
        for (let i = 0; i < 26; i++) motes.push({ x: Math.random() * W, y: Math.random() * H, r: (0.5 + Math.random()) * dpr, sp: (0.05 + Math.random() * 0.1) * dpr, ph: Math.random() * 6.28 });
      }
      const t = performance.now() / 1000;
      const p = (t % CYCLE) / CYCLE;
      const pSand = ease(Math.min(p / 0.9, 1));       // Sandfluss-Fortschritt
      const rot = p > 0.9 ? ease((p - 0.9) / 0.1) * Math.PI : 0; // Flip am Ende
      // Hintergrund
      const bg = ctx.createLinearGradient(0, 0, 0, H);
      bg.addColorStop(0, 'rgb(' + Math.round(cD[0] * 0.10) + ',' + Math.round(cD[1] * 0.10) + ',' + Math.round(cD[2] * 0.15) + ')');
      bg.addColorStop(1, 'rgb(' + Math.round(cD[0] * 0.05) + ',' + Math.round(cD[1] * 0.05) + ',' + Math.round(cD[2] * 0.08) + ')');
      ctx.fillStyle = bg;
      ctx.fillRect(0, 0, W, H);
      for (const m of motes) {
        m.y -= m.sp;
        if (m.y < -4) { m.y = H + 4; m.x = Math.random() * W; }
        ctx.fillStyle = 'rgba(' + cD[0] + ',' + cD[1] + ',' + cD[2] + ',' + (0.05 + 0.04 * Math.sin(t + m.ph)).toFixed(3) + ')';
        ctx.beginPath(); ctx.arc(m.x, m.y, m.r, 0, 6.283); ctx.fill();
      }
      const cx = W * 0.5, cy = H * 0.46;
      const S = Math.min(W, H) * 0.60;
      const hh = S / 2, hw = S * 0.30;
      const neck = 3 * dpr, gap = 5 * dpr;
      ctx.save();
      ctx.translate(cx, cy); ctx.rotate(rot); ctx.translate(-cx, -cy);
      // Glas-Silhouette (2 Trichter)
      const glassPath = (top) => {
        const sy = top ? -1 : 1;
        ctx.beginPath();
        ctx.moveTo(cx - hw, cy + sy * -hh * -1 * 0); // placeholder, wird unten ersetzt
      };
      // oberer Trichter
      const topPath = () => {
        ctx.beginPath();
        ctx.moveTo(cx - hw, cy - hh);
        ctx.lineTo(cx + hw, cy - hh);
        ctx.bezierCurveTo(cx + hw, cy - hh * 0.45, cx + neck * 3, cy - gap * 3, cx + neck, cy - gap);
        ctx.lineTo(cx - neck, cy - gap);
        ctx.bezierCurveTo(cx - neck * 3, cy - gap * 3, cx - hw, cy - hh * 0.45, cx - hw, cy - hh);
        ctx.closePath();
      };
      const botPath = () => {
        ctx.beginPath();
        ctx.moveTo(cx - hw, cy + hh);
        ctx.lineTo(cx + hw, cy + hh);
        ctx.bezierCurveTo(cx + hw, cy + hh * 0.45, cx + neck * 3, cy + gap * 3, cx + neck, cy + gap);
        ctx.lineTo(cx - neck, cy + gap);
        ctx.bezierCurveTo(cx - neck * 3, cy + gap * 3, cx - hw, cy + hh * 0.45, cx - hw, cy + hh);
        ctx.closePath();
      };
      // Sand oben (Level sinkt)
      topPath(); ctx.save(); ctx.clip();
      const topLevel = cy - hh * 0.82 + (hh * 0.82 - gap) * pSand;
      ctx.fillStyle = 'rgba(' + cSand[0] + ',' + cSand[1] + ',' + cSand[2] + ',0.85)';
      ctx.fillRect(cx - hw, topLevel, hw * 2, cy - gap - topLevel + 2);
      // leichte Mulde in der Mitte
      ctx.fillStyle = 'rgba(0,0,0,0.25)';
      ctx.beginPath(); ctx.ellipse(cx, topLevel, hw * 0.34 * (1 - pSand * 0.5), 6 * dpr, 0, 0, 6.283); ctx.fill();
      ctx.restore();
      // Sand unten (Haufen wächst)
      botPath(); ctx.save(); ctx.clip();
      const botTop = cy + hh * 0.92 - (hh * 0.92 - gap * 2) * pSand;
      ctx.fillStyle = 'rgba(' + cSand[0] + ',' + cSand[1] + ',' + cSand[2] + ',0.85)';
      ctx.beginPath();
      ctx.moveTo(cx - hw, cy + hh);
      ctx.lineTo(cx - hw, Math.min(botTop + hh * 0.14, cy + hh));
      ctx.quadraticCurveTo(cx, botTop - hh * 0.10, cx + hw, Math.min(botTop + hh * 0.14, cy + hh));
      ctx.lineTo(cx + hw, cy + hh);
      ctx.closePath(); ctx.fill();
      ctx.restore();
      // fallender Strahl + Körner
      if (pSand < 1 && rot === 0) {
        ctx.strokeStyle = 'rgba(' + cSand[0] + ',' + cSand[1] + ',' + cSand[2] + ',0.75)';
        ctx.lineWidth = 2 * dpr;
        ctx.beginPath(); ctx.moveTo(cx, cy - gap); ctx.lineTo(cx, botTop - hh * 0.08); ctx.stroke();
        if (grains.length < 70 && Math.random() < 0.85) {
          grains.push({ x: cx + (Math.random() - 0.5) * 2.4 * dpr, y: cy - gap, vy: (1.6 + Math.random() * 1.4) * dpr, vx: (Math.random() - 0.5) * 0.5 * dpr, end: botTop - hh * 0.06 });
        }
      }
      ctx.fillStyle = 'rgba(' + cGlow[0] + ',' + cGlow[1] + ',' + cGlow[2] + ',0.9)';
      for (let i2 = grains.length - 1; i2 >= 0; i2--) {
        const g2 = grains[i2];
        g2.y += g2.vy; g2.x += g2.vx; g2.vy += 0.05 * dpr;
        if (g2.y >= g2.end || rot > 0) { grains.splice(i2, 1); continue; }
        ctx.fillRect(g2.x, g2.y, 1.4 * dpr, 1.4 * dpr);
      }
      // Glas-Kontur + Rahmen
      ctx.strokeStyle = 'rgba(' + cGlass[0] + ',' + cGlass[1] + ',' + cGlass[2] + ',0.45)';
      ctx.lineWidth = 1.6 * dpr;
      topPath(); ctx.stroke();
      botPath(); ctx.stroke();
      ctx.strokeStyle = 'rgba(' + cGlass[0] + ',' + cGlass[1] + ',' + cGlass[2] + ',0.8)';
      ctx.lineWidth = 4 * dpr;
      ctx.beginPath(); ctx.moveTo(cx - hw * 1.14, cy - hh); ctx.lineTo(cx + hw * 1.14, cy - hh); ctx.stroke();
      ctx.beginPath(); ctx.moveTo(cx - hw * 1.14, cy + hh); ctx.lineTo(cx + hw * 1.14, cy + hh); ctx.stroke();
      // Glanzlicht auf dem Glas
      ctx.strokeStyle = 'rgba(255,255,255,0.10)';
      ctx.lineWidth = 3 * dpr;
      ctx.beginPath(); ctx.moveTo(cx - hw * 0.7, cy - hh * 0.9); ctx.bezierCurveTo(cx - hw * 0.72, cy - hh * 0.4, cx - neck * 4, cy - gap * 4, cx - neck * 1.6, cy - gap * 1.4); ctx.stroke();
      ctx.restore();
      // Puls-Glow am Hals beim Rinnen
      if (rot === 0 && pSand < 1) {
        const gg = ctx.createRadialGradient(cx, cy, 0, cx, cy, 22 * dpr);
        gg.addColorStop(0, 'rgba(' + cGlow[0] + ',' + cGlow[1] + ',' + cGlow[2] + ',' + (0.10 + 0.05 * Math.sin(t * 5)).toFixed(3) + ')');
        gg.addColorStop(1, 'rgba(' + cGlow[0] + ',' + cGlow[1] + ',' + cGlow[2] + ',0)');
        ctx.fillStyle = gg;
        ctx.beginPath(); ctx.arc(cx, cy, 22 * dpr, 0, 6.283); ctx.fill();
      }
      // Partikel-Uhr: aktuelle Zeit unter der Sanduhr
      const now = new Date();
      const hhmm = String(now.getHours()).padStart(2, '0') + ':' + String(now.getMinutes()).padStart(2, '0');
      ctx.textAlign = 'center'; ctx.textBaseline = 'top';
      ctx.font = Math.round(13 * dpr) + 'px "JetBrains Mono", monospace';
      ctx.fillStyle = 'rgba(' + cGlass[0] + ',' + cGlass[1] + ',' + cGlass[2] + ',0.55)';
      ctx.fillText(hhmm, cx, cy + hh + 18 * dpr);
      this._raf = requestAnimationFrame(loop);
    };
    this._raf = requestAnimationFrame(loop);
  }

  startThunder(cv) {
    const ctx = cv.getContext('2d');
    if (!ctx) return;
    const token = { thunder: true };
    this._gl = token;
    this._glCanvas = cv;
    const hex2rgb = (h) => [parseInt(h.slice(1, 3), 16), parseInt(h.slice(3, 5), 16), parseInt(h.slice(5, 7), 16)];
    let W = 0, H = 0, drops = null, clouds = null, bolts = null, flash = 0, nextBolt = 0;
    // Blitz als rekursiver Pfad mit Verzweigungen
    const mkBolt = (dpr, x0) => {
      const segs = [];
      const walk = (x, y, ang, wgt, depth) => {
        while (y < H * (0.72 + Math.random() * 0.2) && wgt > 0.25) {
          const len = (14 + Math.random() * 26) * dpr;
          const nx = x + Math.sin(ang) * len;
          const ny = y + Math.cos(ang) * len * 0.9;
          segs.push({ x1: x, y1: y, x2: nx, y2: ny, w: wgt });
          x = nx; y = ny;
          ang += (Math.random() - 0.5) * 0.9;
          ang *= 0.82;
          if (depth < 3 && Math.random() < 0.16) walk(x, y, ang + (Math.random() < 0.5 ? 0.8 : -0.8), wgt * 0.45, depth + 1);
        }
      };
      walk(x0, H * (0.06 + Math.random() * 0.1), (Math.random() - 0.5) * 0.5, 1, 0);
      return { segs: segs, life: 1, x: x0 };
    };
    const loop = () => {
      if (this._gl !== token) return;
      if (this._heroVis === false || document.hidden) { this._raf = requestAnimationFrame(loop); return; }
      if (this.state.fpsHalf && (this._frameN = (this._frameN || 0) + 1) % 2) { this._raf = requestAnimationFrame(loop); return; }
      const dpr = this.heroDpr();
      const w = Math.max(2, Math.round(cv.clientWidth * dpr));
      const h = Math.max(2, Math.round(cv.clientHeight * dpr));
      const cc = (this.state.heroCfg || {}).storm2 || {};
      const pal = this.resolvePal(cc);
      const cBolt = hex2rgb(pal[0]), cCloud = hex2rgb(pal[4]), cRain = hex2rgb(pal[2]);
      const t = performance.now();
      if (cv.width !== w || cv.height !== h || !drops) {
        cv.width = w; cv.height = h; W = w; H = h;
        drops = [];
        const n = Math.round((W / dpr / 1440) * 220);
        for (let i = 0; i < n; i++) drops.push({ x: Math.random() * W, y: Math.random() * H, sp: (4.5 + Math.random() * 4) * dpr, len: (9 + Math.random() * 12) * dpr, deep: Math.random() < 0.4 });
        clouds = [];
        for (let i = 0; i < 7; i++) clouds.push({ x: Math.random() * W, y: H * (0.04 + Math.random() * 0.16), r: (70 + Math.random() * 120) * dpr, sp: (0.06 + Math.random() * 0.1) * dpr * (Math.random() < 0.5 ? 1 : -1), ph: Math.random() * 6.28 });
        bolts = [];
        nextBolt = t + 900;
      }
      // Himmel: schweres Gewitter-Dunkel + Flash-Aufhellung
      flash = Math.max(0, flash - 0.055);
      const fl = flash * flash;
      const sky = ctx.createLinearGradient(0, 0, 0, H);
      sky.addColorStop(0, 'rgb(' + Math.round(10 + cCloud[0] * 0.10 + 70 * fl) + ',' + Math.round(12 + cCloud[1] * 0.10 + 72 * fl) + ',' + Math.round(20 + cCloud[2] * 0.16 + 80 * fl) + ')');
      sky.addColorStop(1, 'rgb(' + Math.round(4 + 26 * fl) + ',' + Math.round(5 + 27 * fl) + ',' + Math.round(10 + 32 * fl) + ')');
      ctx.fillStyle = sky;
      ctx.fillRect(0, 0, W, H);
      // Wolkendecke (weiche dunkle Ballen, von Blitzen von innen erhellt)
      for (const c2 of clouds) {
        c2.x += c2.sp;
        if (c2.x < -c2.r) c2.x = W + c2.r;
        if (c2.x > W + c2.r) c2.x = -c2.r;
        const lit = 0.10 + 0.5 * fl + 0.04 * Math.sin(t / 1000 + c2.ph);
        const cg = ctx.createRadialGradient(c2.x, c2.y, 0, c2.x, c2.y, c2.r);
        cg.addColorStop(0, 'rgba(' + Math.round(cCloud[0] * 0.5 + 90 * fl) + ',' + Math.round(cCloud[1] * 0.5 + 90 * fl) + ',' + Math.round(cCloud[2] * 0.6 + 95 * fl) + ',' + lit.toFixed(3) + ')');
        cg.addColorStop(1, 'rgba(6,8,14,0)');
        ctx.fillStyle = cg;
        ctx.beginPath(); ctx.arc(c2.x, c2.y, c2.r, 0, 6.283); ctx.fill();
      }
      // Blitz auslösen
      if (t > nextBolt) {
        bolts.push(mkBolt(dpr, W * (0.12 + Math.random() * 0.76)));
        flash = 1;
        if (Math.random() < 0.35) bolts.push(mkBolt(dpr, W * (0.12 + Math.random() * 0.76)));
        nextBolt = t + 1600 + Math.random() * 3800;
      }
      // Blitze zeichnen (Glow + Kern), schnelles Ausfaden mit Flackern
      ctx.globalCompositeOperation = 'lighter';
      ctx.lineCap = 'round';
      for (let i2 = bolts.length - 1; i2 >= 0; i2--) {
        const b2 = bolts[i2];
        b2.life -= 0.07;
        if (b2.life <= 0) { bolts.splice(i2, 1); continue; }
        const flick = b2.life * (0.7 + 0.3 * Math.random());
        for (const pass of [{ w: 7, a: 0.16, col: cBolt }, { w: 2.4, a: 0.85, col: [255, 255, 255] }]) {
          ctx.strokeStyle = 'rgba(' + pass.col[0] + ',' + pass.col[1] + ',' + pass.col[2] + ',' + (pass.a * flick).toFixed(3) + ')';
          for (const sg of b2.segs) {
            ctx.lineWidth = pass.w * sg.w * dpr;
            ctx.beginPath(); ctx.moveTo(sg.x1, sg.y1); ctx.lineTo(sg.x2, sg.y2); ctx.stroke();
          }
        }
        // Einschlags-Glow am Boden
        const gnd = ctx.createRadialGradient(b2.x, H * 0.86, 0, b2.x, H * 0.86, 80 * dpr);
        gnd.addColorStop(0, 'rgba(' + cBolt[0] + ',' + cBolt[1] + ',' + cBolt[2] + ',' + (0.12 * flick).toFixed(3) + ')');
        gnd.addColorStop(1, 'rgba(' + cBolt[0] + ',' + cBolt[1] + ',' + cBolt[2] + ',0)');
        ctx.fillStyle = gnd;
        ctx.fillRect(b2.x - 80 * dpr, H * 0.86 - 80 * dpr, 160 * dpr, 160 * dpr);
      }
      ctx.globalCompositeOperation = 'source-over';
      // Regen (2 Tiefen, windschräg; heller bei Flash)
      ctx.lineCap = 'butt';
      const wind = 0.18;
      for (const d2 of drops) {
        d2.y += d2.sp;
        d2.x -= d2.sp * wind;
        if (d2.y > H + 20) { d2.y = -20; d2.x = Math.random() * (W + W * wind); }
        const a2 = (d2.deep ? 0.10 : 0.20) + 0.25 * fl;
        ctx.strokeStyle = 'rgba(' + cRain[0] + ',' + cRain[1] + ',' + cRain[2] + ',' + a2.toFixed(3) + ')';
        ctx.lineWidth = (d2.deep ? 0.8 : 1.2) * dpr;
        ctx.beginPath();
        ctx.moveTo(d2.x, d2.y);
        ctx.lineTo(d2.x - d2.len * wind, d2.y - d2.len);
        ctx.stroke();
      }
      // Boden-Silhouette
      ctx.fillStyle = 'rgba(2,3,6,0.92)';
      ctx.fillRect(0, H * 0.93, W, H * 0.07);
      this._raf = requestAnimationFrame(loop);
    };
    this._raf = requestAnimationFrame(loop);
  }

  startOcean(cv) {
    const ctx = cv.getContext('2d');
    if (!ctx) return;
    const token = { ocean: true };
    this._gl = token;
    this._glCanvas = cv;
    const hex2rgb = (h) => [parseInt(h.slice(1, 3), 16), parseInt(h.slice(3, 5), 16), parseInt(h.slice(5, 7), 16)];
    let W = 0, H = 0, spray = null;
    const loop = () => {
      if (this._gl !== token) return;
      if (this._heroVis === false || document.hidden) { this._raf = requestAnimationFrame(loop); return; }
      if (this.state.fpsHalf && (this._frameN = (this._frameN || 0) + 1) % 2) { this._raf = requestAnimationFrame(loop); return; }
      const dpr = this.heroDpr();
      const w = Math.max(2, Math.round(cv.clientWidth * dpr));
      const h = Math.max(2, Math.round(cv.clientHeight * dpr));
      const cc = (this.state.heroCfg || {}).ocean || {};
      const pal = this.resolvePal(cc);
      const cMoon = hex2rgb(pal[0]), cCrest = hex2rgb(pal[1]), cWat = hex2rgb(pal[2]), cD = hex2rgb(pal[4]);
      if (cv.width !== w || cv.height !== h || !spray) {
        cv.width = w; cv.height = h; W = w; H = h;
        spray = [];
      }
      const t = performance.now() / 1000;
      // Nachthimmel
      const sky = ctx.createLinearGradient(0, 0, 0, H * 0.55);
      sky.addColorStop(0, 'rgb(' + Math.round(cD[0] * 0.08) + ',' + Math.round(cD[1] * 0.09) + ',' + Math.round(cD[2] * 0.16) + ')');
      sky.addColorStop(1, 'rgb(' + Math.round(cD[0] * 0.16) + ',' + Math.round(cD[1] * 0.18) + ',' + Math.round(cD[2] * 0.28) + ')');
      ctx.fillStyle = sky;
      ctx.fillRect(0, 0, W, H * 0.55);
      // Mond + Glow
      const mx = W * 0.72, my = H * 0.2;
      const mg = ctx.createRadialGradient(mx, my, 0, mx, my, 90 * dpr);
      mg.addColorStop(0, 'rgba(' + cMoon[0] + ',' + cMoon[1] + ',' + cMoon[2] + ',0.30)');
      mg.addColorStop(1, 'rgba(' + cMoon[0] + ',' + cMoon[1] + ',' + cMoon[2] + ',0)');
      ctx.fillStyle = mg;
      ctx.beginPath(); ctx.arc(mx, my, 90 * dpr, 0, 6.283); ctx.fill();
      ctx.fillStyle = 'rgba(250,246,235,0.92)';
      ctx.beginPath(); ctx.arc(mx, my, 13 * dpr, 0, 6.283); ctx.fill();
      // Wellen-Ebenen: hinten ruhig/hell (Mondlicht), vorn dunkler/größer
      const layers = 5;
      const horizon = H * 0.52;
      for (let li = 0; li < layers; li++) {
        const f = li / (layers - 1);
        const yBase = horizon + (H * 0.46) * Math.pow(f, 1.25);
        const amp = (5 + 26 * f) * dpr;
        const k1 = (0.006 - 0.0022 * f) / dpr, k2 = k1 * 2.7;
        const sp1 = 0.5 + f * 0.75, sp2 = 0.9 + f * 1.1;
        const yAt = (x) => yBase + Math.sin(x * k1 + t * sp1 + li * 2.1) * amp + Math.sin(x * k2 - t * sp2 + li * 0.7) * amp * 0.45;
        // Wasserfläche
        const mixc = (a, b, m2) => Math.round(a + (b - a) * m2);
        const top = [mixc(cWat[0], cD[0], f * 0.75), mixc(cWat[1], cD[1], f * 0.75), mixc(cWat[2], cD[2], f * 0.75)];
        const wg = ctx.createLinearGradient(0, yBase - amp, 0, yBase + H * 0.2);
        wg.addColorStop(0, 'rgba(' + top[0] + ',' + top[1] + ',' + top[2] + ',' + (0.5 + f * 0.5).toFixed(2) + ')');
        wg.addColorStop(1, 'rgba(' + Math.round(top[0] * 0.35) + ',' + Math.round(top[1] * 0.35) + ',' + Math.round(top[2] * 0.4) + ',' + (0.6 + f * 0.4).toFixed(2) + ')');
        ctx.fillStyle = wg;
        ctx.beginPath();
        ctx.moveTo(0, H);
        const step = Math.max(6, Math.round(9 * dpr));
        for (let x = 0; x <= W + step; x += step) ctx.lineTo(x, yAt(x));
        ctx.lineTo(W, H);
        ctx.closePath();
        ctx.fill();
        // Schaumkrone
        ctx.strokeStyle = 'rgba(' + cCrest[0] + ',' + cCrest[1] + ',' + cCrest[2] + ',' + (0.12 + 0.2 * f).toFixed(2) + ')';
        ctx.lineWidth = (0.8 + f * 1.3) * dpr;
        ctx.beginPath();
        for (let x = 0; x <= W + step; x += step) {
          const y = yAt(x);
          if (x === 0) ctx.moveTo(x, y); else ctx.lineTo(x, y);
        }
        ctx.stroke();
        // Mond-Glitzerpfad auf hinteren Ebenen
        if (li < 2) {
          ctx.globalCompositeOperation = 'lighter';
          for (let gx = mx - 60 * dpr; gx < mx + 60 * dpr; gx += step) {
            if (Math.random() < 0.35) {
              const gy = yAt(gx + Math.sin(t * 2 + gx) * 4);
              ctx.fillStyle = 'rgba(' + cMoon[0] + ',' + cMoon[1] + ',' + cMoon[2] + ',' + (0.10 + Math.random() * 0.16).toFixed(3) + ')';
              ctx.fillRect(gx, gy + 1 * dpr, (2 + Math.random() * 5) * dpr, 1.2 * dpr);
            }
          }
          ctx.globalCompositeOperation = 'source-over';
        }
        // Gischt an steilen Kämmen der vorderen Ebene
        if (li === layers - 1 && Math.random() < 0.3 && spray.length < 120) {
          const sx2 = Math.random() * W;
          spray.push({ x: sx2, y: yAt(sx2), vx: (Math.random() - 0.5) * 0.8 * dpr, vy: -(0.6 + Math.random() * 1.1) * dpr, life: 1 });
        }
      }
      // Gischt-Partikel
      for (let i2 = spray.length - 1; i2 >= 0; i2--) {
        const p2 = spray[i2];
        p2.x += p2.vx; p2.y += p2.vy; p2.vy += 0.04 * dpr; p2.life -= 0.02;
        if (p2.life <= 0) { spray.splice(i2, 1); continue; }
        ctx.fillStyle = 'rgba(' + cCrest[0] + ',' + cCrest[1] + ',' + cCrest[2] + ',' + (0.35 * p2.life).toFixed(3) + ')';
        ctx.fillRect(p2.x, p2.y, 1.4 * dpr, 1.4 * dpr);
      }
      this._raf = requestAnimationFrame(loop);
    };
    this._raf = requestAnimationFrame(loop);
  }

  startGalaxy(cv) {
    const ctx = cv.getContext('2d');
    if (!ctx) return;
    const token = { galaxy: true };
    this._gl = token;
    this._glCanvas = cv;
    const hex2rgb = (h) => [parseInt(h.slice(1, 3), 16), parseInt(h.slice(3, 5), 16), parseInt(h.slice(5, 7), 16)];
    let W = 0, H = 0, stars = null, bgStars = null;
    const TILT = 0.42; // Neigung der Scheibe (y gestaucht)
    const loop = () => {
      if (this._gl !== token) return;
      if (this._heroVis === false || document.hidden) { this._raf = requestAnimationFrame(loop); return; }
      if (this.state.fpsHalf && (this._frameN = (this._frameN || 0) + 1) % 2) { this._raf = requestAnimationFrame(loop); return; }
      const dpr = this.heroDpr();
      const w = Math.max(2, Math.round(cv.clientWidth * dpr));
      const h = Math.max(2, Math.round(cv.clientHeight * dpr));
      const cc = (this.state.heroCfg || {}).galaxy || {};
      const pal = this.resolvePal(cc);
      const cCore = hex2rgb(pal[0]), cArm = hex2rgb(pal[2]), cHot = hex2rgb(pal[1]), cD = hex2rgb(pal[4]);
      if (cv.width !== w || cv.height !== h || !stars) {
        cv.width = w; cv.height = h; W = w; H = h;
        // Galaxis-Sterne: r ~ Exponentialverteilung, Winkel-Offset formt 2 logarithmische Spiralarme
        stars = [];
        const n = Math.round(Math.min(1500, (W / dpr / 1440) * 1300));
        const Rmax = Math.min(W, H) * 0.52;
        for (let i = 0; i < n; i++) {
          const rr = Math.pow(Math.random(), 1.7) * Rmax;
          const arm = Math.random() < 0.5 ? 0 : Math.PI;
          const spread = (Math.random() + Math.random() + Math.random() - 1.5) * (0.24 + 0.3 * (rr / Rmax));
          const a0 = arm + Math.log(rr / (Rmax * 0.06) + 1) * 2.4 + spread;
          stars.push({
            r: rr, a0: a0,
            om: 0.055 / (0.25 + rr / Rmax),      // differentielle Rotation: innen schneller
            sz: (0.5 + Math.random() * 1.3) * dpr,
            hot: Math.random() < 0.16,
            dust: Math.random() < 0.08,
            tw: Math.random() * 6.28,
          });
        }
        bgStars = [];
        for (let i = 0; i < 90; i++) bgStars.push({ x: Math.random() * W, y: Math.random() * H, r: (0.3 + Math.random() * 0.7) * dpr, tw: Math.random() * 6.28 });
        ctx.fillStyle = '#02040A';
        ctx.fillRect(0, 0, W, H);
      }
      const t = performance.now() / 1000;
      ctx.fillStyle = 'rgba(2,4,10,0.28)';
      ctx.fillRect(0, 0, W, H);
      // Hintergrund-Fixsterne
      for (const b of bgStars) {
        const a = 0.15 + 0.15 * Math.sin(b.tw + t);
        ctx.fillStyle = 'rgba(215,225,245,' + a.toFixed(3) + ')';
        ctx.fillRect(b.x, b.y, b.r, b.r);
      }
      const cx = W * 0.62, cy = H * 0.44;
      // Halo + Kern-Bulge
      ctx.globalCompositeOperation = 'lighter';
      const halo = ctx.createRadialGradient(cx, cy, 0, cx, cy, Math.min(W, H) * 0.3);
      halo.addColorStop(0, 'rgba(' + cCore[0] + ',' + cCore[1] + ',' + cCore[2] + ',0.20)');
      halo.addColorStop(0.35, 'rgba(' + cD[0] + ',' + cD[1] + ',' + cD[2] + ',0.06)');
      halo.addColorStop(1, 'rgba(' + cD[0] + ',' + cD[1] + ',' + cD[2] + ',0)');
      ctx.fillStyle = halo;
      ctx.beginPath(); ctx.arc(cx, cy, Math.min(W, H) * 0.3, 0, 6.283); ctx.fill();
      // Sterne der Scheibe (differentielle Rotation hält die Spiralform lebendig)
      for (const s2 of stars) {
        const a = s2.a0 + t * s2.om * 3.2;
        const x = cx + Math.cos(a) * s2.r;
        const y = cy + Math.sin(a) * s2.r * TILT;
        if (x < -8 || x > W + 8 || y < -8 || y > H + 8) continue;
        if (s2.dust) {
          // Staubbänder: dunkle weiche Flecken auf den Armen
          ctx.globalCompositeOperation = 'source-over';
          ctx.fillStyle = 'rgba(2,4,10,0.16)';
          ctx.beginPath(); ctx.arc(x, y, s2.sz * 3.2, 0, 6.283); ctx.fill();
          ctx.globalCompositeOperation = 'lighter';
          continue;
        }
        const depth = 0.45 + 0.55 * ((Math.sin(a) + 1) / 2) * 0.4 + 0.4;
        const twk = 0.55 + 0.45 * Math.sin(s2.tw + t * 1.3);
        const c3 = s2.hot ? cHot : (s2.r < Math.min(W, H) * 0.12 ? cCore : cArm);
        const alpha = (s2.hot ? 0.8 : 0.5) * twk * Math.min(1, depth);
        ctx.fillStyle = 'rgba(' + c3[0] + ',' + c3[1] + ',' + c3[2] + ',' + alpha.toFixed(3) + ')';
        ctx.beginPath(); ctx.arc(x, y, s2.sz * (s2.hot ? 1.25 : 1), 0, 6.283); ctx.fill();
      }
      // heller Kern
      const core = ctx.createRadialGradient(cx, cy, 0, cx, cy, 22 * dpr);
      core.addColorStop(0, 'rgba(255,252,244,0.85)');
      core.addColorStop(0.4, 'rgba(' + cCore[0] + ',' + cCore[1] + ',' + cCore[2] + ',0.4)');
      core.addColorStop(1, 'rgba(' + cCore[0] + ',' + cCore[1] + ',' + cCore[2] + ',0)');
      ctx.fillStyle = core;
      ctx.beginPath(); ctx.arc(cx, cy, 22 * dpr, 0, 6.283); ctx.fill();
      ctx.globalCompositeOperation = 'source-over';
      this._raf = requestAnimationFrame(loop);
    };
    this._raf = requestAnimationFrame(loop);
  }

  startComet(cv) {
    const ctx = cv.getContext('2d');
    if (!ctx) return;
    const token = { comet: true };
    this._gl = token;
    this._glCanvas = cv;
    const hex2rgb = (h) => [parseInt(h.slice(1, 3), 16), parseInt(h.slice(3, 5), 16), parseInt(h.slice(5, 7), 16)];
    let W = 0, H = 0, stars = null, dust = null, cph = 0;
    const loop = () => {
      if (this._gl !== token) return;
      if (this._heroVis === false || document.hidden) { this._raf = requestAnimationFrame(loop); return; }
      if (this.state.fpsHalf && (this._frameN = (this._frameN || 0) + 1) % 2) { this._raf = requestAnimationFrame(loop); return; }
      const dpr = this.heroDpr();
      const w = Math.max(2, Math.round(cv.clientWidth * dpr));
      const h = Math.max(2, Math.round(cv.clientHeight * dpr));
      const cc = (this.state.heroCfg || {}).comet || {};
      const pal = this.resolvePal(cc);
      const cCore = hex2rgb(pal[0]), cTail = hex2rgb(pal[1]), cIon = hex2rgb(pal[2]), cD = hex2rgb(pal[4]);
      if (cv.width !== w || cv.height !== h || !stars) {
        cv.width = w; cv.height = h; W = w; H = h;
        stars = [];
        const n = Math.round((W / dpr / 1440) * 150);
        for (let i = 0; i < n; i++) stars.push({ x: Math.random() * W, y: Math.random() * H, r: (0.4 + Math.random() * 0.8) * dpr, tw: Math.random() * 6.28, ts: 0.5 + Math.random() * 1.4 });
        dust = [];
        ctx.fillStyle = '#030509';
        ctx.fillRect(0, 0, W, H);
      }
      const t = performance.now() / 1000;
      // Trail-Fade statt Vollclear: der Schweif entsteht aus der Bewegungsspur
      ctx.fillStyle = 'rgba(3,5,9,0.10)';
      ctx.fillRect(0, 0, W, H);
      // Sterne (schwach, unter dem Fade kaum flackernd)
      for (const st of stars) {
        const twk = 0.35 + 0.3 * Math.sin(st.tw + t * st.ts);
        ctx.fillStyle = 'rgba(210,220,240,' + (twk * 0.25).toFixed(3) + ')';
        ctx.fillRect(st.x, st.y, st.r, st.r);
      }
      // Komet auf elliptischer Bahn quer durchs Bild (Lissajous, nie exakt gleich)
      cph = t * 0.16;
      const cx = W * (0.5 + 0.42 * Math.sin(cph));
      const cy = H * (0.42 + 0.26 * Math.sin(cph * 1.7 + 1.3));
      const vx = Math.cos(cph) * 0.42, vy = Math.cos(cph * 1.7 + 1.3) * 0.26 * 1.7;
      const vlen = Math.hypot(vx, vy) || 1;
      const bx = -vx / vlen, by = -vy / vlen; // Schweifrichtung = entgegen Flugrichtung
      // Staub-Partikel emittieren (Staubschweif: driftet + verglüht)
      for (let e2 = 0; e2 < 5; e2++) {
        dust.push({
          x: cx + (Math.random() - 0.5) * 6 * dpr, y: cy + (Math.random() - 0.5) * 6 * dpr,
          vx: (bx * (0.6 + Math.random() * 1.1) + (Math.random() - 0.5) * 0.5) * dpr,
          vy: (by * (0.6 + Math.random() * 1.1) + (Math.random() - 0.5) * 0.5) * dpr,
          life: 1, dec: 0.006 + Math.random() * 0.012, r: (0.8 + Math.random() * 1.8) * dpr,
        });
      }
      if (dust.length > 900) dust.splice(0, dust.length - 900);
      ctx.globalCompositeOperation = 'lighter';
      // Ionenschweif: gerader, schmaler Strahl mit Wellen-Flackern
      const ionLen = Math.min(W, H) * 0.55;
      const seg2 = 26;
      ctx.lineCap = 'round';
      for (let i2 = 0; i2 < seg2; i2++) {
        const f2 = i2 / seg2, f3 = (i2 + 1) / seg2;
        const wob = Math.sin(t * 3 + i2 * 0.7) * 3 * dpr * f2;
        const px1 = cx + bx * ionLen * f2 - by * wob, py1 = cy + by * ionLen * f2 + bx * wob;
        const px2 = cx + bx * ionLen * f3 - by * wob, py2 = cy + by * ionLen * f3 + bx * wob;
        ctx.strokeStyle = 'rgba(' + cIon[0] + ',' + cIon[1] + ',' + cIon[2] + ',' + (0.30 * (1 - f2)).toFixed(3) + ')';
        ctx.lineWidth = Math.max(0.8, (3.2 * (1 - f2))) * dpr;
        ctx.beginPath(); ctx.moveTo(px1, py1); ctx.lineTo(px2, py2); ctx.stroke();
      }
      // Staubschweif zeichnen
      for (let i3 = dust.length - 1; i3 >= 0; i3--) {
        const d2 = dust[i3];
        d2.x += d2.vx; d2.y += d2.vy;
        d2.vx *= 0.995; d2.vy *= 0.995;
        d2.life -= d2.dec;
        if (d2.life <= 0) { dust.splice(i3, 1); continue; }
        const mixT = 1 - d2.life;
        const r2 = Math.round(cCore[0] + (cTail[0] - cCore[0]) * mixT);
        const g2 = Math.round(cCore[1] + (cTail[1] - cCore[1]) * mixT);
        const b2 = Math.round(cCore[2] + (cTail[2] - cCore[2]) * mixT);
        ctx.fillStyle = 'rgba(' + r2 + ',' + g2 + ',' + b2 + ',' + (0.34 * d2.life).toFixed(3) + ')';
        ctx.beginPath(); ctx.arc(d2.x, d2.y, d2.r * (0.6 + d2.life * 0.7), 0, 6.283); ctx.fill();
      }
      // Koma + Kern
      const koma = ctx.createRadialGradient(cx, cy, 0, cx, cy, 26 * dpr);
      koma.addColorStop(0, 'rgba(255,255,255,0.9)');
      koma.addColorStop(0.25, 'rgba(' + cCore[0] + ',' + cCore[1] + ',' + cCore[2] + ',0.55)');
      koma.addColorStop(1, 'rgba(' + cCore[0] + ',' + cCore[1] + ',' + cCore[2] + ',0)');
      ctx.fillStyle = koma;
      ctx.beginPath(); ctx.arc(cx, cy, 26 * dpr, 0, 6.283); ctx.fill();
      ctx.globalCompositeOperation = 'source-over';
      // Dezenter Nebelschleier aus Palette[5] unten
      const ng = ctx.createLinearGradient(0, H * 0.75, 0, H);
      ng.addColorStop(0, 'rgba(' + cD[0] + ',' + cD[1] + ',' + cD[2] + ',0)');
      ng.addColorStop(1, 'rgba(' + cD[0] + ',' + cD[1] + ',' + cD[2] + ',0.05)');
      ctx.fillStyle = ng;
      ctx.fillRect(0, H * 0.75, W, H * 0.25);
      this._raf = requestAnimationFrame(loop);
    };
    this._raf = requestAnimationFrame(loop);
  }

  startHelix(cv) {
    const ctx = cv.getContext('2d');
    if (!ctx) return;
    const token = { helix: true };
    this._gl = token;
    this._glCanvas = cv;
    const hex2rgb = (h) => [parseInt(h.slice(1, 3), 16), parseInt(h.slice(3, 5), 16), parseInt(h.slice(5, 7), 16)];
    let W = 0, H = 0, motes = null;
    const loop = () => {
      if (this._gl !== token) return;
      if (this._heroVis === false || document.hidden) { this._raf = requestAnimationFrame(loop); return; }
      if (this.state.fpsHalf && (this._frameN = (this._frameN || 0) + 1) % 2) { this._raf = requestAnimationFrame(loop); return; }
      const dpr = this.heroDpr();
      const w = Math.max(2, Math.round(cv.clientWidth * dpr));
      const h = Math.max(2, Math.round(cv.clientHeight * dpr));
      const cc = (this.state.heroCfg || {}).helix || {};
      const pal = this.resolvePal(cc);
      const cA = hex2rgb(pal[0]), cB = hex2rgb(pal[2]), cR = hex2rgb(pal[1]), cD = hex2rgb(pal[4]);
      if (cv.width !== w || cv.height !== h || !motes) {
        cv.width = w; cv.height = h; W = w; H = h;
        motes = [];
        const n = Math.round((W / dpr / 1440) * 60);
        for (let i = 0; i < n; i++) motes.push({ x: Math.random() * W, y: Math.random() * H, r: (0.5 + Math.random()) * dpr, sp: (0.06 + Math.random() * 0.16) * dpr, ph: Math.random() * 6.28 });
      }
      const t = performance.now() / 1000;
      // Labor-Nacht: tiefdunkler Verlauf mit leichtem Farbstich aus Palette[5]
      const g = ctx.createLinearGradient(0, 0, 0, H);
      g.addColorStop(0, 'rgb(' + Math.round(cD[0] * 0.10) + ',' + Math.round(cD[1] * 0.10) + ',' + Math.round(cD[2] * 0.16) + ')');
      g.addColorStop(1, 'rgb(' + Math.round(cD[0] * 0.05) + ',' + Math.round(cD[1] * 0.05) + ',' + Math.round(cD[2] * 0.09) + ')');
      ctx.fillStyle = g;
      ctx.fillRect(0, 0, W, H);
      // Schwebende Staub-Motes
      for (const m of motes) {
        m.y -= m.sp;
        if (m.y < -4) { m.y = H + 4; m.x = Math.random() * W; }
        const a = 0.05 + 0.05 * Math.sin(t * 0.8 + m.ph);
        ctx.fillStyle = 'rgba(' + cD[0] + ',' + cD[1] + ',' + cD[2] + ',' + a.toFixed(3) + ')';
        ctx.beginPath(); ctx.arc(m.x + Math.sin(t * 0.3 + m.ph) * 6 * dpr, m.y, m.r, 0, 6.283); ctx.fill();
      }
      // Helix: horizontal liegend, sanft rotierend; 2 Stränge + Basenpaar-Sprossen
      const cy = H * 0.46;
      const ampl = H * 0.20;
      const segs = Math.round(W / (7 * dpr));
      const omega = t * 0.7;
      const kx = 4.6 / W; // ~4.6 Wellen über die Breite
      const pts = [[], []];
      for (let i = 0; i <= segs; i++) {
        const x = (i / segs) * W;
        const phx = x * kx * 6.28;
        for (let s2 = 0; s2 < 2; s2++) {
          const ph = phx + omega + s2 * Math.PI;
          pts[s2].push({ x: x, y: cy + Math.sin(ph) * ampl, z: Math.cos(ph) });
        }
      }
      ctx.lineCap = 'round';
      // Sprossen (Basenpaare) zuerst — alle ~9 Segmente
      for (let i = 0; i <= segs; i += 9) {
        const p1 = pts[0][i], p2 = pts[1][i];
        if (!p1 || !p2) continue;
        const depth = (p1.z + 1) / 2;
        const a = 0.12 + 0.3 * Math.abs(p1.z);
        const grad = ctx.createLinearGradient(p1.x, p1.y, p2.x, p2.y);
        grad.addColorStop(0, 'rgba(' + cA[0] + ',' + cA[1] + ',' + cA[2] + ',' + a.toFixed(3) + ')');
        grad.addColorStop(1, 'rgba(' + cB[0] + ',' + cB[1] + ',' + cB[2] + ',' + a.toFixed(3) + ')');
        ctx.strokeStyle = grad;
        ctx.lineWidth = (1 + depth * 1.6) * dpr;
        ctx.beginPath(); ctx.moveTo(p1.x, p1.y); ctx.lineTo(p2.x, p2.y); ctx.stroke();
        // Nukleotid-Knoten an den Enden
        for (const [p, c3] of [[p1, cA], [p2, cB]]) {
          const rr = (1.2 + ((p.z + 1) / 2) * 2.2) * dpr;
          ctx.fillStyle = 'rgba(' + c3[0] + ',' + c3[1] + ',' + c3[2] + ',' + (0.35 + 0.55 * ((p.z + 1) / 2)).toFixed(3) + ')';
          ctx.beginPath(); ctx.arc(p.x, p.y, rr, 0, 6.283); ctx.fill();
        }
      }
      // Stränge: hinten zuerst, vorne zuletzt (Tiefensortierung pro Segment-Stück)
      for (const front of [false, true]) {
        for (let s2 = 0; s2 < 2; s2++) {
          const col = s2 === 0 ? cA : cB;
          ctx.beginPath();
          let drawing = false;
          for (let i = 0; i <= segs; i++) {
            const p = pts[s2][i];
            const isFront = p.z >= 0;
            if (isFront === front) {
              if (!drawing) { ctx.moveTo(p.x, p.y); drawing = true; }
              else ctx.lineTo(p.x, p.y);
            } else drawing = false;
          }
          ctx.strokeStyle = 'rgba(' + col[0] + ',' + col[1] + ',' + col[2] + ',' + (front ? 0.85 : 0.28) + ')';
          ctx.lineWidth = (front ? 2.6 : 1.6) * dpr;
          ctx.stroke();
        }
      }
      // Glow-Puls wandert als Transkriptions-Lichtpunkt den vorderen Strang entlang
      const pu = (t * 0.09) % 1;
      const pi = Math.round(pu * segs);
      const pp = pts[0][pi];
      if (pp && pp.z >= 0) {
        const pg = ctx.createRadialGradient(pp.x, pp.y, 0, pp.x, pp.y, 30 * dpr);
        pg.addColorStop(0, 'rgba(' + cR[0] + ',' + cR[1] + ',' + cR[2] + ',0.5)');
        pg.addColorStop(1, 'rgba(' + cR[0] + ',' + cR[1] + ',' + cR[2] + ',0)');
        ctx.fillStyle = pg;
        ctx.beginPath(); ctx.arc(pp.x, pp.y, 30 * dpr, 0, 6.283); ctx.fill();
      }
      this._raf = requestAnimationFrame(loop);
    };
    this._raf = requestAnimationFrame(loop);
  }

  startMatrix2(cv) {
    // Cyberpunk-Titelsequenz: Glyphen-Drift -> Konvergenz -> Chrom-Titel-Assembly -> Scan -> Subtitle -> Ruhe -> Dissolve (Loop ~16s)
    const ctx = cv.getContext('2d');
    if (!ctx) return;
    const token = { m2: true };
    this._gl = token;
    this._glCanvas = cv;
    this._cineFlagged = false;
    if (this.state.cineDone) setTimeout(() => this.setState({ cineDone: false }), 0);
    const hex2rgb = (h) => [parseInt(h.slice(1, 3), 16), parseInt(h.slice(3, 5), 16), parseInt(h.slice(5, 7), 16)];
    const chars = 'アイウエオカキクケコ01<>{}=+*#$';
    const DUR = 16;
    const ease = (v) => v < 0 ? 0 : v > 1 ? 1 : v * v * (3 - 2 * v);
    let P = null, W = 0, H = 0, t0 = 0, lastKey = '', yTop = 0, yBot = 0;
    const buildTargets = (dpr) => {
      const sizeF = Math.max(0.4, Math.min(2.2, (this.state.mxSize ?? 100) / 100));
      const t1 = this.state.mxT1 ?? 'Bjoern Sellnau';
      const t2 = this.state.mxT2 ?? 'Das Web. Meine Leidenschaft.';
      const off = document.createElement('canvas');
      off.width = W; off.height = H;
      const oc = off.getContext('2d', { willReadFrequently: true });
      const f1 = Math.min(W / (Math.max(t1.length, 1) * 0.68), H * 0.16) * sizeF;
      const f2 = Math.min(W / (Math.max(t2.length, 1) * 0.68), H * 0.07) * sizeF;
      oc.textAlign = 'center'; oc.textBaseline = 'middle';
      oc.fillStyle = '#fff';
      oc.font = '700 ' + Math.round(f1) + 'px "JetBrains Mono", monospace';
      oc.fillText(t1, W / 2, H * 0.42);
      oc.font = '600 ' + Math.round(f2) + 'px "JetBrains Mono", monospace';
      oc.fillText(t2, W / 2, H * 0.42 + f1 * 0.78 + f2);
      const data = oc.getImageData(0, 0, W, H).data;
      const step = Math.max(3, Math.round(2.6 * dpr));
      const T = [];
      const ySplit = H * 0.42 + f1 * 0.55;
      yTop = H; yBot = 0;
      for (let y = 0; y < H; y += step) {
        for (let x = 0; x < W; x += step) {
          if (data[(y * W + x) * 4 + 3] > 128) {
            T.push({ x: x, y: y, sub: y > ySplit });
            if (y < yTop) yTop = y;
            if (y > yBot) yBot = y;
          }
        }
      }
      const skip = Math.ceil(T.length / 4200);
      return skip > 1 ? T.filter((q, qi) => qi % skip === 0) : T;
    };
    const loop = () => {
      if (this._gl !== token) return;
      if (this._heroVis === false || document.hidden) { this._raf = requestAnimationFrame(loop); return; }
      if (this.state.fpsHalf && (this._frameN = (this._frameN || 0) + 1) % 2) { this._raf = requestAnimationFrame(loop); return; }
      const dpr = this.heroDpr();
      const w = Math.max(2, Math.round(cv.clientWidth * dpr));
      const h = Math.max(2, Math.round(cv.clientHeight * dpr));
      const cc = (this.state.heroCfg || {}).matrix2 || {};
      const pal = this.resolvePal(cc);
      const em = hex2rgb(pal[1]);
      const emHi = hex2rgb(pal[0]);
      const key = w + 'x' + h + '|' + (this.state.mxT1 || '') + '|' + (this.state.mxT2 || '') + '|' + (this.state.mxSize ?? 100);
      if (cv.width !== w || cv.height !== h || !P || key !== lastKey) {
        cv.width = w; cv.height = h; W = w; H = h; lastKey = key;
        const T = buildTargets(dpr);
        P = T.map((tg) => ({ tx: tg.x, ty: tg.y, sub: tg.sub, x: Math.random() * W, y: Math.random() * H, g: chars[(Math.random() * chars.length) | 0], d: Math.random() }));
        t0 = performance.now();
        ctx.fillStyle = '#020403';
        ctx.fillRect(0, 0, W, H);
      }
      const el = ((performance.now() - t0) / 1000) % DUR;
      if (!this._cineFlagged && el > 9.5) { this._cineFlagged = true; this.setState({ cineDone: true }); }
      ctx.fillStyle = 'rgba(2,4,3,0.3)';
      ctx.fillRect(0, 0, W, H);
      // Holo-Kreis (sehr dezent, rotiert langsam)
      const cxm = W / 2, cym = (yTop + yBot) / 2 || H * 0.45;
      const rot = el * 0.08;
      ctx.strokeStyle = 'rgba(' + em[0] + ',' + em[1] + ',' + em[2] + ',0.05)';
      ctx.lineWidth = 1.2 * dpr;
      for (let si = 0; si < 5; si++) {
        ctx.beginPath();
        ctx.arc(cxm, cym, Math.min(W, H) * 0.34, rot + si * 1.35, rot + si * 1.35 + 0.9);
        ctx.stroke();
      }
      const pAsm = ease((el - 2.5) / 3.2);
      const pSub = ease((el - 5.6) / 2.2);
      const pDis = ease((el - 14) / 1.9);
      ctx.font = Math.round(9 * dpr) + 'px "JetBrains Mono", monospace';
      const crawl = el < 6.4;
      for (const p of P) {
        const pa = p.sub ? pSub : pAsm;
        const k2 = pa * (1 - pDis);
        const ang = (1 - k2) * 2.6 * (p.d > 0.5 ? 1 : -1);
        const dx0 = p.x - p.tx, dy0 = p.y - p.ty;
        const ca = Math.cos(ang), sa = Math.sin(ang);
        let x = p.tx + (dx0 * ca - dy0 * sa) * (1 - k2);
        let y = p.ty + (dx0 * sa + dy0 * ca) * (1 - k2);
        if (k2 < 0.9) {
          x += Math.sin(el * 0.55 + p.d * 6.28) * 9 * dpr * (1 - k2);
          y += Math.cos(el * 0.42 + p.d * 9.42) * 7 * dpr * (1 - k2);
        }
        if (k2 >= 0.97) {
          if (crawl && p.d > 0.93 && Math.random() < 0.25) {
            ctx.fillStyle = 'rgba(' + emHi[0] + ',' + emHi[1] + ',' + emHi[2] + ',0.9)';
            ctx.fillText(chars[(Math.random() * chars.length) | 0], x, y);
          } else {
            const relY = (yBot > yTop) ? (p.ty - yTop) / (yBot - yTop) : 0.5;
            let g2 = 215 - 95 * relY + (p.d * 30 - 15);
            if (relY < 0.25) g2 += (0.25 - relY) * 120;
            g2 = Math.max(60, Math.min(250, g2));
            const s2 = 2.1 * dpr;
            ctx.fillStyle = 'rgb(' + Math.round(g2 * 0.92) + ',' + Math.round(g2) + ',' + Math.round(g2 * 0.95) + ')';
            ctx.fillRect(x - s2 / 2, y - s2 / 2, s2, s2);
          }
        } else {
          const a2 = 0.25 + p.d * 0.6;
          if (p.d < 0.12) {
            ctx.fillStyle = 'rgba(' + em[0] + ',' + em[1] + ',' + em[2] + ',' + a2.toFixed(2) + ')';
            ctx.fillText(p.g, x, y);
          } else {
            const s3 = (0.9 + p.d * 1.4) * dpr;
            ctx.fillStyle = 'rgba(' + em[0] + ',' + em[1] + ',' + em[2] + ',' + a2.toFixed(2) + ')';
            ctx.fillRect(x - s3 / 2, y - s3 / 2, s3, s3);
          }
        }
      }
      // Emerald-Scan-Sweep ueber den fertigen Titel
      if (el > 6 && el < 7.3) {
        const sxp = ((el - 6) / 1.3) * (W * 1.3) - W * 0.15;
        const bw = W * 0.11;
        ctx.globalCompositeOperation = 'lighter';
        const sg = ctx.createLinearGradient(sxp - bw, 0, sxp + bw, 0);
        sg.addColorStop(0, 'rgba(' + emHi[0] + ',' + emHi[1] + ',' + emHi[2] + ',0)');
        sg.addColorStop(0.5, 'rgba(' + emHi[0] + ',' + emHi[1] + ',' + emHi[2] + ',0.34)');
        sg.addColorStop(1, 'rgba(' + emHi[0] + ',' + emHi[1] + ',' + emHi[2] + ',0)');
        ctx.fillStyle = sg;
        ctx.fillRect(sxp - bw, Math.max(0, yTop - 20 * dpr), bw * 2, (yBot - yTop) + 40 * dpr);
        ctx.globalCompositeOperation = 'source-over';
      }
      // Weicher Emerald-Innenglow in der Ruhephase (pulsierend)
      if (el > 7.3 && pDis < 0.5) {
        const pulse = 0.5 + 0.5 * Math.sin(el * 1.5);
        ctx.globalCompositeOperation = 'lighter';
        const ig = ctx.createLinearGradient(0, Math.max(0, yTop - 14 * dpr), 0, yBot + 14 * dpr);
        ig.addColorStop(0, 'rgba(' + em[0] + ',' + em[1] + ',' + em[2] + ',0)');
        ig.addColorStop(0.5, 'rgba(' + em[0] + ',' + em[1] + ',' + em[2] + ',' + (0.04 + 0.03 * pulse).toFixed(3) + ')');
        ig.addColorStop(1, 'rgba(' + em[0] + ',' + em[1] + ',' + em[2] + ',0)');
        ctx.fillStyle = ig;
        ctx.fillRect(0, Math.max(0, yTop - 14 * dpr), W, (yBot - yTop) + 28 * dpr);
        ctx.globalCompositeOperation = 'source-over';
      }
      // Wandernder Spekular-Reflex in der Ruhephase
      if (el > 7.5 && pDis < 0.2) {
        const rp = ((el - 7.5) / 5.5) % 1;
        const rx = rp * W * 1.2 - W * 0.1;
        ctx.globalCompositeOperation = 'lighter';
        const rg = ctx.createLinearGradient(rx - W * 0.07, 0, rx + W * 0.07, 0);
        rg.addColorStop(0, 'rgba(255,255,255,0)');
        rg.addColorStop(0.5, 'rgba(255,255,255,0.07)');
        rg.addColorStop(1, 'rgba(255,255,255,0)');
        ctx.fillStyle = rg;
        ctx.fillRect(rx - W * 0.07, Math.max(0, yTop - 12 * dpr), W * 0.14, (yBot - yTop) + 24 * dpr);
        ctx.globalCompositeOperation = 'source-over';
      }
      // 1-Frame-Glitch: horizontale Slice-Verschiebung
      if (Math.random() < 0.018 && el > 2) {
        const ys = (Math.random() * H) | 0;
        const hs = Math.max(3, (Math.random() * 7 * dpr) | 0);
        const dxo = ((Math.random() - 0.5) * 18 * dpr) | 0;
        try { ctx.drawImage(cv, 0, ys, W, hs, dxo, ys, W, hs); } catch (e3) {}
      }
      // CRT-Scanlines + spärliches Analog-Rauschen
      ctx.fillStyle = 'rgba(0,0,0,0.16)';
      const lh = Math.max(2, Math.round(1.5 * dpr));
      for (let yl = 0; yl < H; yl += lh * 2) ctx.fillRect(0, yl, W, lh * 0.55);
      ctx.fillStyle = 'rgba(' + em[0] + ',' + em[1] + ',' + em[2] + ',0.05)';
      for (let ni = 0; ni < 36; ni++) ctx.fillRect(Math.random() * W, Math.random() * H, dpr, dpr);
      this._raf = requestAnimationFrame(loop);
    };
    this._raf = requestAnimationFrame(loop);
  }

  startMatrix(cv) {
    const ctx = cv.getContext('2d');
    if (!ctx) return;
    const token = { matrix: true };
    this._gl = token;
    this._glCanvas = cv;
    const chars = 'アイウエオカキクケコサシスセソタチツテトナニヌネノハヒフヘホ0123456789ABCDEFLOONA!<>/{}=+*#$';
    const hex2rgb = (h) => [parseInt(h.slice(1, 3), 16), parseInt(h.slice(3, 5), 16), parseInt(h.slice(5, 7), 16)];
    let cols = null, W = 0, H = 0, fs = 0;
    const t0 = performance.now();
    this._cineFlagged = false;
    if (this.state.cineDone) setTimeout(() => this.setState({ cineDone: false }), 0);
    const loop = () => {
      if (this._gl !== token) return;
      if (this._heroVis === false || document.hidden) { this._raf = requestAnimationFrame(loop); return; }
      if (this.state.fpsHalf && (this._frameN = (this._frameN || 0) + 1) % 2) { this._raf = requestAnimationFrame(loop); return; }
      const dpr = this.heroDpr();
      const w = Math.max(2, Math.round(cv.clientWidth * dpr));
      const h = Math.max(2, Math.round(cv.clientHeight * dpr));
      const cc = (this.state.heroCfg || {}).matrix || {};
      const pal = this.resolvePal(cc);
      const main = hex2rgb(pal[1]);
      const head = hex2rgb(pal[0]);
      const deep = hex2rgb(pal[4]);
      if (cv.width !== w || cv.height !== h || !cols) {
        cv.width = w; cv.height = h; W = w; H = h;
        fs = Math.round(17 * dpr);
        const n = Math.ceil(W / (fs * 0.72));
        cols = [];
        const first = (n * (0.35 + Math.random() * 0.3)) | 0;
        for (let i = 0; i < n; i++) cols.push({ y: -fs, sp: (i === first ? 0.42 : 0.55 + Math.random() * 0.95) * fs * 0.32, deepC: Math.random() < 0.22, wait: i === first ? 0 : 100 + Math.random() * 760 });
        ctx.fillStyle = '#040705';
        ctx.fillRect(0, 0, W, H);
        ctx.textBaseline = 'top';
      }
      ctx.fillStyle = 'rgba(4,7,5,0.085)';
      ctx.fillRect(0, 0, W, H);
      ctx.font = '600 ' + fs + 'px "JetBrains Mono", monospace';
      for (let i = 0; i < cols.length; i++) {
        const c = cols[i];
        if (c.wait > 0) { c.wait--; continue; }
        const x = i * fs * 0.72;
        const g1 = chars[(Math.random() * chars.length) | 0];
        const g2 = chars[(Math.random() * chars.length) | 0];
        const rgb = c.deepC ? deep : main;
        // Trail-Glyphe eine Position hinter dem Kopf
        ctx.fillStyle = 'rgba(' + rgb[0] + ',' + rgb[1] + ',' + rgb[2] + ',0.85)';
        ctx.fillText(g1, x, c.y - fs);
        // heller Kopf
        ctx.fillStyle = 'rgba(' + head[0] + ',' + head[1] + ',' + head[2] + ',0.95)';
        ctx.fillText(g2, x, c.y);
        c.y += c.sp;
        if (c.y > H + fs * 2 && Math.random() < 0.04) { c.y = Math.random() * H * -0.4; c.sp = (0.55 + Math.random() * 0.95) * fs * 0.32; c.deepC = Math.random() < 0.22; }
      }
      // Cinematic-Intro: Buchstabe fuer Buchstabe einfaden, dann Fly-to-Camera; danach Text 2
      if (this.state.mxCine !== false) {
        const el = (performance.now() - t0) / 1000;
        const sizeF = Math.max(0.4, Math.min(2.2, (this.state.mxSize ?? 100) / 100));
        const specs = [
          { txt: this.state.mxT1 ?? 'Bjoern Sellnau', a: 3.2, b: 7.4 },
          { txt: this.state.mxT2 ?? 'Das Web. Meine Leidenschaft.', a: 8.4, b: 13.2 },
        ];
        if (!this._cineFlagged && el > 13.4) { this._cineFlagged = true; this.setState({ cineDone: true }); }
        for (const sp2 of specs) {
          if (!sp2.txt || el < sp2.a || el > sp2.b) continue;
          const elT = el - sp2.a;
          const flyStart = 1.9;
          const flying = elT > flyStart;
          const pr2 = flying ? (elT - flyStart) / (sp2.b - sp2.a - flyStart) : 0;
          const gA = flying ? Math.min(1, (1 - pr2) / 0.28) : 1;
          const scale = 1 + 0.8 * pr2;
          const base = Math.min(W / (sp2.txt.length * 0.62), H * 0.14) * sizeF;
          ctx.save();
          ctx.translate(W / 2, H * 0.44);
          ctx.scale(scale, scale);
          ctx.textAlign = 'center';
          ctx.textBaseline = 'middle';
          ctx.font = '600 ' + Math.round(base) + 'px "JetBrains Mono", monospace';
          const chW = ctx.measureText('M').width;
          const x0 = -((sp2.txt.length - 1) * chW) / 2;
          const stag = 1.2 / sp2.txt.length;
          ctx.shadowColor = 'rgba(' + head[0] + ',' + head[1] + ',' + head[2] + ',' + (0.85 * gA).toFixed(3) + ')';
          ctx.shadowBlur = 26 * dpr;
          for (let ci = 0; ci < sp2.txt.length; ci++) {
            const aCh = flying ? 1 : Math.max(0, Math.min(1, (elT - ci * stag) / 0.35));
            if (aCh <= 0) continue;
            ctx.fillStyle = 'rgba(246,255,249,' + (0.92 * gA * aCh).toFixed(3) + ')';
            ctx.fillText(sp2.txt[ci], x0 + ci * chW, 0);
          }
          ctx.shadowBlur = 0;
          ctx.restore();
        }
      }
      this._raf = requestAnimationFrame(loop);
    };
    this._raf = requestAnimationFrame(loop);
  }

  startOrbit(cv) {
    const ctx = cv.getContext('2d');
    if (!ctx) return;
    const token = { orbit: true };
    this._gl = token; this._glCanvas = cv;
    const P = [];
    const ORB = [];
    let W = 0, H = 0;
    const rnd = (a, b) => a + Math.random() * (b - a);
    const TILT = -0.32;
    const init = () => {
      P.length = 0; ORB.length = 0;
      const NP = Math.round(Math.min(70, Math.max(28, W / 34)));
      for (let i = 0; i < NP; i++) P.push({ x: rnd(0, W), y: rnd(0, H), vx: rnd(-0.12, 0.12), vy: rnd(-0.08, 0.08), r: rnd(0.8, 2.0), tw: rnd(0, 6.28) });
      const rings = [0.34, 0.56, 0.8];
      for (let k = 0; k < rings.length; k++) {
        const cnt = 2 + k;
        for (let m = 0; m < cnt; m++) ORB.push({ f: rings[k], u: rnd(0, 6.28), sp: rnd(0.1, 0.22) * (k === 1 ? -1 : 1) });
      }
    };
    const loop = () => {
      if (this._gl !== token) return;
      if (this._heroVis === false || document.hidden) { this._raf = requestAnimationFrame(loop); return; }
      if (this.state.fpsHalf && (this._frameN = (this._frameN || 0) + 1) % 2) { this._raf = requestAnimationFrame(loop); return; }
      const dpr = this.heroDpr();
      const w = Math.max(2, Math.round(cv.clientWidth * dpr));
      const hh = Math.max(2, Math.round(cv.clientHeight * dpr));
      if (cv.width !== w || cv.height !== hh) { cv.width = w; cv.height = hh; W = w; H = hh; init(); }
      ctx.clearRect(0, 0, W, H);
      const t = performance.now() / 1000;
      const cfgO = (this.state.heroCfg || {}).orbit || {};
      const cx = W * (0.66 + ((cfgO.x ?? 50) - 50) / 100);
      const cy = H * (0.42 + ((cfgO.y ?? 50) - 50) / 100);
      const sF = Math.max(0.25, (cfgO.s ?? 100) / 100);
      for (const p of P) {
        p.x += p.vx * dpr; p.y += p.vy * dpr;
        if (p.x < -20) p.x = W + 20; if (p.x > W + 20) p.x = -20;
        if (p.y < -20) p.y = H + 20; if (p.y > H + 20) p.y = -20;
      }
      const LINK = 130 * dpr;
      ctx.lineWidth = 1 * dpr;
      for (let i = 0; i < P.length; i++) {
        for (let j = i + 1; j < P.length; j++) {
          const a = P[i], b = P[j];
          const dx = a.x - b.x, dy = a.y - b.y;
          const d2 = dx * dx + dy * dy;
          if (d2 < LINK * LINK) {
            const al = (1 - Math.sqrt(d2) / LINK) * 0.14;
            ctx.strokeStyle = 'rgba(255,178,36,' + al.toFixed(3) + ')';
            ctx.beginPath(); ctx.moveTo(a.x, a.y); ctx.lineTo(b.x, b.y); ctx.stroke();
          }
        }
      }
      for (const p of P) {
        const tw = 0.55 + 0.45 * Math.sin(t * 1.8 + p.tw);
        ctx.fillStyle = 'rgba(255,214,140,' + (0.16 + 0.3 * tw).toFixed(3) + ')';
        ctx.beginPath(); ctx.arc(p.x, p.y, p.r * dpr, 0, 6.283); ctx.fill();
      }
      const cosT = Math.cos(TILT), sinT = Math.sin(TILT);
      const R = Math.min(W * 0.42, H * 0.72) * sF;
      const rings = [0.34, 0.56, 0.8];
      for (let k = 0; k < rings.length; k++) {
        ctx.strokeStyle = 'rgba(255,178,36,' + (0.16 - k * 0.035).toFixed(3) + ')';
        ctx.lineWidth = 1.2 * dpr;
        ctx.beginPath();
        ctx.ellipse(cx, cy, R * rings[k], R * rings[k] * 0.42, TILT, 0, 6.283);
        ctx.stroke();
      }
      const g = ctx.createRadialGradient(cx, cy, 0, cx, cy, 26 * dpr * sF);
      g.addColorStop(0, 'rgba(255,214,140,0.9)');
      g.addColorStop(0.35, 'rgba(255,178,36,0.35)');
      g.addColorStop(1, 'rgba(255,178,36,0)');
      ctx.fillStyle = g;
      ctx.beginPath(); ctx.arc(cx, cy, 26 * dpr * sF, 0, 6.283); ctx.fill();
      for (const o of ORB) {
        o.u += o.sp * 0.016;
        for (let k2 = 5; k2 >= 0; k2--) {
          const uu = o.u - k2 * 0.05 * (o.sp > 0 ? 1 : -1);
          const rx = R * o.f;
          const lx = rx * Math.cos(uu), ly = rx * 0.42 * Math.sin(uu);
          const x = cx + lx * cosT - ly * sinT;
          const y = cy + lx * sinT + ly * cosT;
          const al = k2 === 0 ? 0.95 : (0.35 * (1 - k2 / 6));
          const rr2 = (k2 === 0 ? 2.6 : 1.6) * dpr;
          ctx.fillStyle = k2 === 0 ? 'rgba(255,225,170,' + al.toFixed(2) + ')' : 'rgba(255,178,36,' + al.toFixed(2) + ')';
          ctx.beginPath(); ctx.arc(x, y, rr2, 0, 6.283); ctx.fill();
        }
      }
      this._raf = requestAnimationFrame(loop);
    };
    this._raf = requestAnimationFrame(loop);
  }

  stopLava() {
    if (this._raf) { cancelAnimationFrame(this._raf); this._raf = null; }
    if (this._gl) { try { const lc = this._gl.getExtension('WEBGL_lose_context'); if (lc) lc.loseContext(); } catch (e) {} }
    this._gl = null; this._glCanvas = null; this._fxMode = null;
  }

  attachHeroObserver() {
    const el = document.getElementById('ld-hero');
    if (el === this._ioEl) return;
    if (this._io) { this._io.disconnect(); this._io = null; }
    this._ioEl = el || null;
    if (el && typeof IntersectionObserver !== 'undefined') {
      this._heroVis = true;
      this._io = new IntersectionObserver((es) => {
        if (es.length) this._heroVis = es[es.length - 1].isIntersecting;
      }, { rootMargin: '160px 0px 160px 0px' });
      this._io.observe(el);
    } else {
      this._heroVis = el ? true : false;
    }
  }

  pals() {
    return {
      amber: ['#FFD36E', '#FFB224', '#FF7A2F', '#FF5E8A', '#7A4ADB'],
      ocean: ['#8FF5E4', '#38C6F4', '#2F7AD6', '#5E5AE6', '#8A4ADB'],
      candy: ['#FFD6E8', '#FF8AC2', '#FF5E8A', '#C44ADB', '#7A4ADB'],
      forest: ['#EAFFB0', '#A8E063', '#4CAF50', '#1F8A5B', '#0F5F46'],
      mono: ['#F5F7FA', '#C9D4E0', '#8A97A8', '#55606E', '#2A323C'],
    };
  }

  hex01(hx) {
    return [parseInt(hx.slice(1, 3), 16) / 255, parseInt(hx.slice(3, 5), 16) / 255, parseInt(hx.slice(5, 7), 16) / 255];
  }

  resolvePal(cfg) {
    cfg = cfg || {};
    if (cfg.pal === 'custom' && Array.isArray(cfg.cust) && cfg.cust.length === 5) return cfg.cust;
    return this.pals()[cfg.pal] || this.pals().amber;
  }

  lum(hex) {
    const r = parseInt(hex.slice(1, 3), 16) / 255, g = parseInt(hex.slice(3, 5), 16) / 255, b = parseInt(hex.slice(5, 7), 16) / 255;
    return 0.2126 * r + 0.7152 * g + 0.0722 * b;
  }
}
