/**
 * Echte Liquid-Glass-Refraktion (nur Chromium): pro [data-ldfrost]-Fläche eine SVG-Displacement-Map aus der
 * abgerundeten Rechteck-SDF, 3 Kanäle mit leicht versetzter Stärke (chromatische Aberration), Blur, Sättigung.
 * 1:1 aus dem Prototyp (makeDispMap / refreshGlassFilters, Zeile 1493–1609).
 */
import type { Settings } from '../settings/schema';

const SVG_NS = 'http://www.w3.org/2000/svg';

export function makeDispMap(w: number, h: number, rad: number, bez: number): string {
  const sc = w * h > 150000 ? 0.5 : 1;
  const mw = Math.max(2, Math.round(w * sc)),
    mh = Math.max(2, Math.round(h * sc));
  const cv = document.createElement('canvas');
  cv.width = mw;
  cv.height = mh;
  const ctx = cv.getContext('2d')!;
  const img = ctx.createImageData(mw, mh);
  const hw = mw / 2,
    hh = mh / 2;
  const rr = Math.min(rad * sc, hw, hh);
  const bz = Math.max(2, bez * sc);
  const sd = (px: number, py: number) => {
    const qx = Math.abs(px) - (hw - rr),
      qy = Math.abs(py) - (hh - rr);
    const ax = Math.max(qx, 0),
      ay = Math.max(qy, 0);
    return Math.hypot(ax, ay) + Math.min(Math.max(qx, qy), 0) - rr;
  };
  const data = img.data;
  for (let y = 0; y < mh; y++) {
    for (let x = 0; x < mw; x++) {
      const px = x + 0.5 - hw,
        py = y + 0.5 - hh;
      const d = sd(px, py);
      let vx = 0,
        vy = 0;
      if (d < 0 && d > -bz) {
        const t = -d / bz;
        const m = Math.pow(1 - t, 1.7);
        const nx = sd(px + 1, py) - sd(px - 1, py);
        const ny = sd(px, py + 1) - sd(px, py - 1);
        const nl = Math.hypot(nx, ny) || 1;
        vx = -(nx / nl) * m;
        vy = -(ny / nl) * m;
      }
      const i = (y * mw + x) * 4;
      data[i] = Math.round(128 + vx * 127);
      data[i + 1] = Math.round(128 + vy * 127);
      data[i + 2] = 128;
      data[i + 3] = 255;
    }
  }
  ctx.putImageData(img, 0, 0);
  return cv.toDataURL();
}

export interface RefractionMemo {
  maps: Record<string, string>;
  seq: number;
  timer?: ReturnType<typeof setTimeout>;
}

export function createRefractionMemo(): RefractionMemo {
  return { maps: {}, seq: 0 };
}

export function refreshGlassFilters(s: Pick<Settings, 'refrOn' | 'blurOn' | 'glassLvl'>, memo: RefractionMemo): void {
  const active = !!(window as unknown as { chrome?: unknown }).chrome && s.refrOn !== false;
  document.body.classList.toggle('ldreal', active);
  let defs = document.getElementById('ld-glass-defs') as SVGSVGElement | null;
  if (!active) {
    if (defs) defs.remove();
    document.querySelectorAll<HTMLElement>('[data-ldfrost]').forEach((el) => el.style.removeProperty('--bfMain'));
    memo.maps = {};
    return;
  }
  if (!defs) {
    defs = document.createElementNS(SVG_NS, 'svg');
    defs.id = 'ld-glass-defs';
    defs.setAttribute('aria-hidden', 'true');
    defs.style.cssText = 'position:fixed;width:0;height:0;overflow:hidden;pointer-events:none';
    document.body.appendChild(defs);
  }
  const bodyCS = getComputedStyle(document.body);
  const blurAmt = parseFloat(bodyCS.getPropertyValue('--blurAmt')) || 30;
  const sig = s.blurOn === false ? 0.25 : Math.min(blurAmt, 48) * 0.3;
  const lvl = s.glassLvl || 3;
  let changed = false;
  const seen: Record<string, boolean> = {};
  document.querySelectorAll<HTMLElement>('[data-ldfrost]').forEach((el) => {
    const r = el.getBoundingClientRect();
    const w = Math.round(r.width),
      h = Math.round(r.height);
    if (w < 30 || h < 22) return;
    let id = el.getAttribute('data-ldfid');
    if (!id) {
      id = 'ldf' + ++memo.seq;
      el.setAttribute('data-ldfid', id);
    }
    seen[id] = true;
    const rad = Math.min(parseFloat(getComputedStyle(el).borderTopLeftRadius) || 20, Math.min(w, h) / 2);
    const scale = Math.min(28 + lvl * 10, Math.min(w, h) * 0.75);
    const key = w + 'x' + h + 'r' + Math.round(rad) + 'b' + sig.toFixed(1) + 's' + Math.round(scale);
    if (memo.maps[id] === key) return;
    memo.maps[id] = key;
    changed = true;
    const bez = Math.max(9, Math.min(Math.min(w, h) * 0.34, 24));
    const map = makeDispMap(w, h, rad, bez);
    const old = defs!.querySelector('#' + id);
    if (old) old.remove();
    const f = document.createElementNS(SVG_NS, 'filter');
    f.setAttribute('id', id);
    f.setAttribute('filterUnits', 'userSpaceOnUse');
    f.setAttribute('primitiveUnits', 'userSpaceOnUse');
    f.setAttribute('x', '-4');
    f.setAttribute('y', '-4');
    f.setAttribute('width', String(w + 8));
    f.setAttribute('height', String(h + 8));
    f.setAttribute('color-interpolation-filters', 'sRGB');
    const s1 = (scale * 1.06).toFixed(1),
      s2 = scale.toFixed(1),
      s3 = (scale * 0.94).toFixed(1);
    f.innerHTML =
      '<feImage href="' +
      map +
      '" x="0" y="0" width="' +
      w +
      '" height="' +
      h +
      '" preserveAspectRatio="none" result="m"/>' +
      '<feDisplacementMap in="SourceGraphic" in2="m" scale="' +
      s1 +
      '" xChannelSelector="R" yChannelSelector="G" result="d1"/>' +
      '<feColorMatrix in="d1" type="matrix" values="1 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 1 0" result="c1"/>' +
      '<feDisplacementMap in="SourceGraphic" in2="m" scale="' +
      s2 +
      '" xChannelSelector="R" yChannelSelector="G" result="d2"/>' +
      '<feColorMatrix in="d2" type="matrix" values="0 0 0 0 0 0 1 0 0 0 0 0 0 0 0 0 0 0 1 0" result="c2"/>' +
      '<feDisplacementMap in="SourceGraphic" in2="m" scale="' +
      s3 +
      '" xChannelSelector="R" yChannelSelector="G" result="d3"/>' +
      '<feColorMatrix in="d3" type="matrix" values="0 0 0 0 0 0 0 0 0 0 0 0 1 0 0 0 0 0 1 0" result="c3"/>' +
      '<feBlend in="c1" in2="c2" mode="screen" result="b1"/>' +
      '<feBlend in="b1" in2="c3" mode="screen" result="b2"/>' +
      '<feGaussianBlur in="b2" stdDeviation="' +
      sig.toFixed(2) +
      '" result="bl"/>' +
      '<feColorMatrix in="bl" type="saturate" values="1.7" result="st"/>' +
      '<feComponentTransfer in="st"><feFuncR type="linear" slope="1.05"/><feFuncG type="linear" slope="1.05"/><feFuncB type="linear" slope="1.05"/></feComponentTransfer>';
    defs!.appendChild(f);
    el.style.setProperty('--bfMain', 'url(#' + id + ')');
  });
  for (const flt of [...defs.querySelectorAll('filter')]) {
    if (!seen[flt.id] && !document.querySelector('[data-ldfid="' + flt.id + '"]')) {
      flt.remove();
      delete memo.maps[flt.id];
    }
  }
  if (changed) {
    clearTimeout(memo.timer);
    memo.timer = setTimeout(() => refreshGlassFilters(s, memo), 420);
  }
}
