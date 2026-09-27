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
