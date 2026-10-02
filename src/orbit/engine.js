// @ts-nocheck
// Generiert von scripts/extract-orbit.mjs aus design/design_handoff_shader_wallpapers/Shader Wallpapers.html — nicht von Hand editieren.
/**
 * Startet das Wallpaper (Host-Script des Prototyps). Erwartet ORBIT_MARKUP im DOM.
 * @param {{ interFamily?: string }} [opts]
 * @returns {{ selectShader: (i: number) => void, readonly current: number } | undefined}
 */
export function mountOrbit(opts = {}) {
  const INTER = opts.interFamily || '"Inter"';
  // a11y: Zustand am Container (CSS) und aria-expanded an der Combobox.
  const setPickerOpen = (v) => {
    picker.dataset.open = v;
    pickerControl.setAttribute('aria-expanded', v);
  };
  const canvas = document.getElementById('stage');
  const gl = canvas.getContext('webgl', { antialias: false, premultipliedAlpha: false });
  if(!gl){
    document.body.innerHTML = '<div style="color:#fff;font-family:sans-serif;padding:40px">WebGL is required to view this wallpaper.</div>';
    return;
  }

  const SHADERS = [
    { id:1, name:'Liquid Chrome',    desc:'An iridescent flow-map. The cursor pulls the metal; clicks tear shimmering folds through the surface.' },
    { id:2, name:'Plasma Bloom',     desc:'Stacked sine waves form a colorful field. A warm bloom follows the cursor; clicks burst pink and violet rings outward.' },
    { id:3, name:'Voronoi Crystals', desc:'Cellular crystal lattice that bends toward the cursor. Edges glow brighter where you point; clicks send cracks of light through the cells.' },
    { id:4, name:'Ripple Pond',      desc:'Calm water under a warm sky. Move slowly to leave a trail; click anywhere to drop a stone and watch the rings cross.' },
    { id:5, name:'Event Horizon',    desc:'A small black hole bends light around your cursor. The accretion disk reacts to clicks, spitting matter into the spiral.' },
    { id:6, name:'Mesh Gradient',    desc:'Six soft color blobs blended into a smooth gradient. The blob nearest your cursor follows it; clicks shimmer the whole field.' },
    { id:7, name:'Portal',           desc:'A swirling tunnel opens at your cursor. Click to send a pulse down the throat — rings ripple inward, sparks streak across the mouth.' },
    { id:8, name:'Aurora',           desc:'Northern lights drift over a starry sky. The cursor pushes the curtains; clicks send green and magenta pulses across the horizon.' },
    { id:9, name:'Lava Lamp',        desc:'Molten blobs rise and merge inside warm glass. The cursor draws them toward you; clicks split off new bursts and shake the field.' },
    { id:10, name:'Stripe Alt',      desc:'Chunky retro diagonal stripes with halftone dots. The cursor bends the angle; clicks shove waves across the field.' },
    { id:11, name:'Stripe Neu',      desc:'Smooth iridescent stripes that bend around the cursor. Clicks send shimmering pulses through the bands.' },
    { id:12, name:'Lava Lamp 2.0',   desc:'Modern lava lamp: blobs cascade downward in your chosen color. Adds a typewriter caption that fades through configurable lines.' },
    { id:13, name:'Fabric Wave',     desc:'A flowing silk gradient, à la Stripe. Soft folds drift across the surface in cyan, green, and amber. The cursor lifts the cloth; clicks send ripples through it.' },
  ];

  // ---- compile helpers ----
  function compile(src, type){
    const sh = gl.createShader(type);
    gl.shaderSource(sh, src);
    gl.compileShader(sh);
    if(!gl.getShaderParameter(sh, gl.COMPILE_STATUS)){
      console.error('Shader compile error', gl.getShaderInfoLog(sh), src);
      throw new Error(gl.getShaderInfoLog(sh));
    }
    return sh;
  }
  function link(vs, fs){
    const p = gl.createProgram();
    gl.attachShader(p, vs); gl.attachShader(p, fs);
    gl.linkProgram(p);
    if(!gl.getProgramParameter(p, gl.LINK_STATUS)){
      console.error('Link error', gl.getProgramInfoLog(p));
      throw new Error(gl.getProgramInfoLog(p));
    }
    return p;
  }

  const vsSrc = document.getElementById('vs').textContent;
  const commonSrc = document.getElementById('fs-common').textContent;

  const vs = compile(vsSrc, gl.VERTEX_SHADER);

  const programs = SHADERS.map(s => {
    const fsSrc = commonSrc + '\n' + document.getElementById('fs-' + s.id).textContent;
    const fs = compile(fsSrc, gl.FRAGMENT_SHADER);
    const prog = link(vs, fs);
    return {
      ...s,
      program: prog,
      u_resolution:   gl.getUniformLocation(prog, 'u_resolution'),
      u_mouse:        gl.getUniformLocation(prog, 'u_mouse'),
      u_mouseSmooth:  gl.getUniformLocation(prog, 'u_mouseSmooth'),
      u_time:         gl.getUniformLocation(prog, 'u_time'),
      u_clicks:       gl.getUniformLocation(prog, 'u_clicks[0]'),
      u_text:         gl.getUniformLocation(prog, 'u_text'),
      u_textStrength: gl.getUniformLocation(prog, 'u_textStrength'),
      u_textAspect:   gl.getUniformLocation(prog, 'u_textAspect'),
      u_textMerge:    gl.getUniformLocation(prog, 'u_textMerge'),
      u_lavaColor:    gl.getUniformLocation(prog, 'u_lavaColor'),
      u_heater:       gl.getUniformLocation(prog, 'u_heater'),
      a_position:     gl.getAttribLocation(prog, 'a_position'),
    };
  });

  // fullscreen quad
  const buf = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, buf);
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1,-1, 1,-1, -1,1, -1,1, 1,-1, 1,1]), gl.STATIC_DRAW);

  // ---- state ----
  let dpr = Math.min(window.devicePixelRatio || 1, 1.75);
  let W=0, H=0;
  function resize(){
    dpr = Math.min(window.devicePixelRatio || 1, 1.75);
    W = Math.floor(window.innerWidth * dpr);
    H = Math.floor(window.innerHeight * dpr);
    canvas.width = W; canvas.height = H;
    canvas.style.width = window.innerWidth+'px';
    canvas.style.height = window.innerHeight+'px';
    document.getElementById('resolution').textContent =
      window.innerWidth + '×' + window.innerHeight;
  }
  window.addEventListener('resize', resize);
  resize();

  // mouse: raw and smoothed (in pixels, gl coord origin is bottom-left so we'll flip Y)
  const mouse = { x: W*0.5, y: H*0.5 };
  const mouseSmooth = { x: W*0.5, y: H*0.5 };

  // hint dim
  const hint = document.getElementById('hint');
  let hinted = false;
  function dimHint(){ if(!hinted){ hinted = true; hint.classList.add('dim'); } }

  function setMouseFromEvent(e){
    const rect = canvas.getBoundingClientRect();
    const xCss = (e.clientX - rect.left);
    const yCss = (e.clientY - rect.top);
    mouse.x = xCss * dpr;
    mouse.y = (rect.height - yCss) * dpr; // flip Y for gl
    dimHint();
  }
  window.addEventListener('mousemove', setMouseFromEvent, { passive: true });
  window.addEventListener('touchmove', e => {
    if(e.touches[0]) setMouseFromEvent(e.touches[0]);
  }, { passive: true });
  window.addEventListener('touchstart', e => {
    if(e.touches[0]){
      setMouseFromEvent(e.touches[0]);
      addClick(mouse.x, mouse.y, 1.0);
    }
  }, { passive: true });

  // ---- click ripples ----
  const MAX_CLICKS = 8;
  // each entry is [x, y, birthTime, strength] in pixels and seconds
  const clicks = new Float32Array(MAX_CLICKS * 4);
  let clickCursor = 0;
  function addClick(px, py, strength){
    const idx = clickCursor % MAX_CLICKS;
    clicks[idx*4 + 0] = px;
    clicks[idx*4 + 1] = py;
    clicks[idx*4 + 2] = scaledTime;
    clicks[idx*4 + 3] = strength;
    clickCursor++;
  }

  canvas.addEventListener('mousedown', (e) => {
    setMouseFromEvent(e);
    addClick(mouse.x, mouse.y, 1.0);
  });
  // gentle continuous trickle while dragging
  let dragging = false;
  canvas.addEventListener('mousedown', () => dragging = true);
  window.addEventListener('mouseup',   () => dragging = false);

  // keyboard nav 1..5
  window.addEventListener('keydown', (e) => {
    const n = parseInt(e.key, 10);
    if(n >= 1 && n <= 9 && n <= SHADERS.length){ selectShader(n - 1); }
    if(e.key === 'ArrowRight'){ selectShader((current+1) % SHADERS.length); }
    if(e.key === 'ArrowLeft'){  selectShader((current+SHADERS.length-1) % SHADERS.length); }
  });

  // ---- combobox UI ----
  const picker        = document.getElementById('picker');
  const pickerControl = document.getElementById('pickerControl');
  const pickerMenu    = document.getElementById('pickerMenu');
  const pickerSwatch  = document.getElementById('pickerSwatch');
  const pickerName    = document.getElementById('pickerName');
  const pickerNum     = document.getElementById('pickerNum');
  const wpName = document.getElementById('wpName');
  const wpDesc = document.getElementById('wpDesc');
  const wpNum  = document.getElementById('wpNum');
  let current = 0;
  let focusIdx = 0;

  const pad = (n) => (n<10?'0':'') + n;

  SHADERS.forEach((s, i) => {
    const li = document.createElement('li');
    li.className = 'opt';
    li.setAttribute('role', 'option');
    li.setAttribute('aria-selected', i===0 ? 'true' : 'false');
    li.dataset.index = i;
    li.innerHTML = `
      <span class="swatch sw-${s.id}"></span>
      <span class="name">${s.name}</span>
      <span class="num">${pad(i+1)}</span>
    `;
    li.addEventListener('click', () => { selectShader(i); closeMenu(); });
    li.addEventListener('mouseenter', () => setFocus(i));
    pickerMenu.appendChild(li);
  });

  function openMenu(){
    setPickerOpen('true');
    setFocus(current);
    // scroll focused into view
    const el = pickerMenu.children[current];
    if(el) el.scrollIntoView({ block: 'nearest' });
  }
  function closeMenu(){
    setPickerOpen('false');
  }
  function toggleMenu(){
    if(picker.dataset.open === 'true') closeMenu();
    else openMenu();
  }
  function setFocus(i){
    focusIdx = (i + SHADERS.length) % SHADERS.length;
    [...pickerMenu.children].forEach((el, idx) => {
      el.dataset.focus = idx === focusIdx ? 'true' : 'false';
    });
  }

  pickerControl.addEventListener('click', toggleMenu);
  pickerControl.addEventListener('keydown', (e) => {
    const open = picker.dataset.open === 'true';
    if(e.key === 'Enter' || e.key === ' '){
      e.preventDefault();
      if(open){ selectShader(focusIdx); closeMenu(); }
      else openMenu();
    } else if(e.key === 'ArrowDown'){
      e.preventDefault();
      if(!open) openMenu(); else setFocus(focusIdx + 1);
    } else if(e.key === 'ArrowUp'){
      e.preventDefault();
      if(!open) openMenu(); else setFocus(focusIdx - 1);
    } else if(e.key === 'Escape'){
      closeMenu();
    } else if(e.key === 'Home'){
      if(open){ e.preventDefault(); setFocus(0); }
    } else if(e.key === 'End'){
      if(open){ e.preventDefault(); setFocus(SHADERS.length - 1); }
    }
  });
  // close on outside click
  document.addEventListener('mousedown', (e) => {
    if(!picker.contains(e.target)) closeMenu();
  });

  function selectShader(i){
    if(i === current){ return; }
    current = i;
    // update combobox visuals
    [...pickerMenu.children].forEach((el, idx) => {
      el.setAttribute('aria-selected', idx === i ? 'true' : 'false');
    });
    pickerSwatch.className = 'swatch sw-' + SHADERS[i].id;
    pickerName.textContent = SHADERS[i].name;
    pickerNum.textContent  = pad(i+1);

    // typewriter visibility depends on shader
    if(SHADERS[i].id === 12 && captionLines.length){
      // reset to start cleanly on switch
      twTyped = '';
      twTextEl.textContent = '';
      twPhase = 'typing';
      twPhaseStart = performance.now()/1000;
      twEl.classList.add('visible');
    } else {
      twEl.classList.remove('visible');
    }

    // fade swap title/desc
    wpName.classList.add('hidden');
    wpDesc.classList.add('hidden');
    setTimeout(() => {
      wpName.textContent = SHADERS[i].name;
      wpDesc.textContent = SHADERS[i].desc;
      wpNum.textContent  = `${pad(i+1)} / ${pad(SHADERS.length)}`;
      wpName.classList.remove('hidden');
      wpDesc.classList.remove('hidden');
    }, 240);
  }

  // initialize swatch on first paint
  pickerSwatch.className = 'swatch sw-' + SHADERS[0].id;

  // ---- clock ----
  const clockEl = document.getElementById('clock');
  function tickClock(){
    const d = new Date();
    const hh = String(d.getHours()).padStart(2,'0');
    const mm = String(d.getMinutes()).padStart(2,'0');
    const ss = String(d.getSeconds()).padStart(2,'0');
    clockEl.textContent = `${hh}:${mm}:${ss}`;
  }
  tickClock();
  setInterval(tickClock, 1000);

  // ---- settings / tweaks ----
  const defaults = { speed: 1, mouse: 1, bright: 1, sat: 1, contrast: 1, hue: 0, blur: 0 };
  const tweaks = { ...defaults };

  const settingsBtn   = document.getElementById('settingsBtn');
  const settingsPanel = document.getElementById('settingsPanel');
  const settingsClose = document.getElementById('settingsClose');
  const settingsReset = document.getElementById('settingsReset');

  function applyFilter(){
    canvas.style.filter =
      `brightness(${tweaks.bright.toFixed(3)}) ` +
      `saturate(${tweaks.sat.toFixed(3)}) ` +
      `contrast(${tweaks.contrast.toFixed(3)}) ` +
      `hue-rotate(${tweaks.hue.toFixed(0)}deg) ` +
      `blur(${tweaks.blur.toFixed(1)}px)`;
  }
  applyFilter();

  function openSettings(){
    settingsPanel.classList.add('open');
    settingsBtn.setAttribute('aria-pressed','true');
  }
  function closeSettings(){
    settingsPanel.classList.remove('open');
    settingsBtn.setAttribute('aria-pressed','false');
  }
  settingsBtn.addEventListener('click', () => {
    if(settingsPanel.classList.contains('open')) closeSettings(); else openSettings();
  });
  settingsClose.addEventListener('click', closeSettings);

  function bindSlider(id, key, fmt){
    const el = document.getElementById(id);
    const val = document.getElementById('val' + key.charAt(0).toUpperCase()+key.slice(1));
    el.addEventListener('input', () => {
      tweaks[key] = parseFloat(el.value);
      if(val) val.textContent = fmt(tweaks[key]);
      applyFilter();
    });
    // initial label
    if(val) val.textContent = fmt(tweaks[key]);
  }
  bindSlider('tSpeed',    'speed',    v => v.toFixed(2)+'×');
  bindSlider('tMouse',    'mouse',    v => v.toFixed(2));
  bindSlider('tBright',   'bright',   v => v.toFixed(2));
  bindSlider('tSat',      'sat',      v => v.toFixed(2));
  bindSlider('tContrast', 'contrast', v => v.toFixed(2));
  bindSlider('tHue',      'hue',      v => Math.round(v)+'°');
  bindSlider('tBlur',     'blur',     v => v.toFixed(1)+'px');

  // ---- text-as-blob (Lava Lamp): rising texts on a timer ----
  const TEX_SIZE = 512;
  // World-uv range that the text texture spans (must match shader's texSize)
  const TEXT_WORLD = 1.6;
  // World y where blobs spawn / despawn
  const SPAWN_Y   = -0.95;
  const DESPAWN_Y =  0.95;
  // rise speed in world-uv per scaled-second (matches lava ambience)
  const RISE_SPEED = 0.075;

  const textCanvas = document.createElement('canvas');
  textCanvas.width = textCanvas.height = TEX_SIZE;
  const tctx = textCanvas.getContext('2d');

  const textTex = gl.createTexture();
  gl.bindTexture(gl.TEXTURE_2D, textTex);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
  gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, true);
  gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, textCanvas);

  let textQueue   = [];  // array of strings to cycle through
  let queueCursor = 0;
  let textSize     = 1.0;
  let textDepth    = 0.5;
  let textStrength = 1.0;
  let textInterval = 4.0; // seconds (scaled)
  let textWobble   = 1.0; // blob-like wobble multiplier
  let textPersp    = 0.0; // legacy (unused; kept for safety)
  let perspX       = 0.0;
  let perspY       = 0.0;
  let perspZ       = 0.0;
  let perspRandom  = false;
  let textMerge    = 0.10;

  // Lava color (used by shader 12 — Lava Lamp 2.0)
  let lavaColor = [1.0, 0.55, 0.30]; // warm peach by default
  let heaterOn = false;
  function hexToRgb01(hex){
    const n = parseInt(hex.replace('#',''), 16);
    return [(n>>16 & 0xff)/255, (n>>8 & 0xff)/255, (n & 0xff)/255];
  }

  // Active rising blobs: { text, spawnTime (scaledTime), xJit }
  let activeBlobs = [];
  let nextSpawnTime = 0;
  let lastTexUpload = -1;

  function setQueueFromText(raw){
    const lines = raw.split('\n').map(l => l.trim()).filter(l => l.length > 0);
    const newQueue = lines;
    // if list changed, reset cursor
    if(newQueue.join('\u241F') !== textQueue.join('\u241F')){
      textQueue = newQueue;
      queueCursor = 0;
    }
  }

  function spawnNext(now){
    if(textQueue.length === 0) return;
    const text = textQueue[queueCursor % textQueue.length];
    queueCursor++;
    const xJit = (Math.sin(queueCursor*1.7) * 0.5 + Math.cos(queueCursor*2.3)*0.5) * 0.18;
    // pre-roll random perspective offsets per blob (used when perspRandom is on)
    const rx = (Math.random()*2 - 1);
    const ry = (Math.random()*2 - 1);
    const rz = (Math.random()*2 - 1);
    activeBlobs.push({ text, spawnTime: now, xJit, rx, ry, rz });
  }

  function updateBlobs(now){
    activeBlobs = activeBlobs.filter(b => {
      const y = SPAWN_Y + (now - b.spawnTime) * RISE_SPEED;
      return y <= DESPAWN_Y + 0.2;
    });
    if(textQueue.length > 0 && now >= nextSpawnTime){
      spawnNext(now);
      nextSpawnTime = now + Math.max(0.4, textInterval);
    } else if(textQueue.length === 0){
      nextSpawnTime = now + 0.5;
    }
  }

  function drawTextLayer(text, cx, cy, baseFs, alpha){
    let fs = baseFs;
    tctx.font = `900 ${fs}px ${INTER}, system-ui, sans-serif`;
    const maxW = TEX_SIZE * 0.78;
    let w = tctx.measureText(text).width;
    if(w > maxW){
      fs = fs * (maxW / w);
      tctx.font = `900 ${fs}px ${INTER}, system-ui, sans-serif`;
    }
    tctx.globalAlpha = alpha;
    tctx.fillText(text, cx, cy);
    return fs;
  }

  function renderTextTexture(now){
    tctx.fillStyle = '#000';
    tctx.globalAlpha = 1;
    tctx.fillRect(0, 0, TEX_SIZE, TEX_SIZE);
    if(activeBlobs.length === 0){
      gl.bindTexture(gl.TEXTURE_2D, textTex);
      gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, textCanvas);
      return;
    }
    tctx.fillStyle = '#fff';
    tctx.textAlign = 'center';
    tctx.textBaseline = 'middle';
    const baseFs = 160 * textSize;

    for(const b of activeBlobs){
      const age = now - b.spawnTime;
      const worldY = SPAWN_Y + age * RISE_SPEED;
      // blob-like behavior: sway + size pulse + slight rotation
      const swayAmt = (0.05 + 0.06*textWobble);
      const sway = Math.sin(age * (0.8 + b.xJit*2) + b.xJit*10) * swayAmt;
      const worldX = b.xJit*0.6 + sway;
      const pulse = 1.0 + textWobble * 0.10 * Math.sin(age*1.7 + b.xJit*8);
      const rot   = textWobble * 0.06 * Math.sin(age*0.6 + b.xJit*5);

      // Map world (uv) -> texture pixel space
      const tx = (worldX / TEXT_WORLD + 0.5) * TEX_SIZE;
      const ty = (1 - (worldY / TEXT_WORLD + 0.5)) * TEX_SIZE;

      // 3D extrusion: draw stacked offset copies behind, then bright top
      const depthLayers = Math.round(2 + textDepth * 16);
      const depthOffset = (1 + textDepth * 3);
      // perspective skew: vanishing point shift based on textPersp
      const px = perspRandom ? b.rx : perspX;
      const py = perspRandom ? b.ry : perspY;
      const pz = perspRandom ? b.rz : perspZ;
      // animated drift on the values so it feels alive
      const driftX = px * 0.55 + (textWobble*0.05)*Math.sin(age*0.7 + b.xJit*4);
      const driftY = py * 0.45 + (textWobble*0.04)*Math.cos(age*0.6 + b.xJit*5);
      const driftZ = pz * 0.9  + rot;
      tctx.save();
      // anchor transform at the blob center
      tctx.translate(tx, ty);
      // perspective: combined skew-X (camera yaw) + skew-Y (camera pitch)
      tctx.transform(1, driftY, driftX, 1, 0, 0);
      // Z rotation (in-plane / camera roll)
      tctx.rotate(driftZ);
      tctx.scale(pulse, pulse);
      const fs = baseFs;
      tctx.shadowColor = 'rgba(255,255,255,0.9)';
      tctx.shadowBlur = Math.max(6, fs * 0.14);
      for(let i = depthLayers; i > 0; i--){
        const ox = i * depthOffset * 0.35;
        const oy = i * depthOffset * 0.55;
        const a = 0.18 + 0.5*(1 - i/depthLayers);
        drawTextLayer(b.text, ox, oy, fs, a);
      }
      tctx.shadowBlur = Math.max(4, fs * 0.08);
      drawTextLayer(b.text, 0, 0, fs, 1.0);
      tctx.shadowBlur = 0;
      tctx.globalAlpha = 0.6;
      drawTextLayer(b.text, -0.6, -1.2, fs, 0.6);
      tctx.restore();
    }
    tctx.globalAlpha = 1;
    tctx.shadowBlur = 0;

    gl.bindTexture(gl.TEXTURE_2D, textTex);
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, textCanvas);
  }

  function textStrengthEffective(){
    if(activeBlobs.length === 0) return 0.0;
    return textStrength;
  }

  const tText = document.getElementById('tText');
  const tTextSize = document.getElementById('tTextSize');
  const tTextStrength = document.getElementById('tTextStrength');
  const tTextInterval = document.getElementById('tTextInterval');
  const tTextDepth = document.getElementById('tTextDepth');
  const tTextWobble = document.getElementById('tTextWobble');
  const tTextPersp  = document.getElementById('tPerspX'); // legacy alias
  const tPerspX = document.getElementById('tPerspX');
  const tPerspY = document.getElementById('tPerspY');
  const tPerspZ = document.getElementById('tPerspZ');
  const tPerspRandom = document.getElementById('tPerspRandom');
  const tTextMerge = document.getElementById('tTextMerge');
  const valTextSize = document.getElementById('valTextSize');
  const valTextStrength = document.getElementById('valTextStrength');
  const valTextInterval = document.getElementById('valTextInterval');
  const valTextDepth = document.getElementById('valTextDepth');
  const valTextWobble = document.getElementById('valTextWobble');
  const valPerspX = document.getElementById('valPerspX');
  const valPerspY = document.getElementById('valPerspY');
  const valPerspZ = document.getElementById('valPerspZ');
  const valTextMerge = document.getElementById('valTextMerge');

  tText.addEventListener('input', () => {
    const prevEmpty = textQueue.length === 0;
    setQueueFromText(tText.value);
    // if we just got our first text, spawn immediately
    if(prevEmpty && textQueue.length > 0){
      nextSpawnTime = scaledTime; // spawn next tick
    }
  });
  tTextSize.addEventListener('input', () => {
    textSize = parseFloat(tTextSize.value);
    valTextSize.textContent = textSize.toFixed(2);
  });
  tTextStrength.addEventListener('input', () => {
    textStrength = parseFloat(tTextStrength.value);
    valTextStrength.textContent = textStrength.toFixed(2);
  });
  tTextInterval.addEventListener('input', () => {
    textInterval = parseFloat(tTextInterval.value);
    valTextInterval.textContent = textInterval.toFixed(1) + 's';
  });
  tTextDepth.addEventListener('input', () => {
    textDepth = parseFloat(tTextDepth.value);
    valTextDepth.textContent = textDepth.toFixed(2);
  });
  tTextWobble.addEventListener('input', () => {
    textWobble = parseFloat(tTextWobble.value);
    valTextWobble.textContent = textWobble.toFixed(2);
  });
  tPerspX.addEventListener('input', () => {
    perspX = parseFloat(tPerspX.value);
    valPerspX.textContent = perspX.toFixed(2);
  });
  tPerspY.addEventListener('input', () => {
    perspY = parseFloat(tPerspY.value);
    valPerspY.textContent = perspY.toFixed(2);
  });
  tPerspZ.addEventListener('input', () => {
    perspZ = parseFloat(tPerspZ.value);
    valPerspZ.textContent = perspZ.toFixed(2);
  });
  tPerspRandom.addEventListener('change', () => {
    perspRandom = tPerspRandom.checked;
  });
  tTextMerge.addEventListener('input', () => {
    textMerge = parseFloat(tTextMerge.value);
    valTextMerge.textContent = textMerge.toFixed(2);
  });

  // ---- Lava Lamp 2.0: color + typewriter caption ----
  const tLavaColor = document.getElementById('tLavaColor');
  lavaColor = hexToRgb01(tLavaColor.value);
  tLavaColor.addEventListener('input', () => {
    lavaColor = hexToRgb01(tLavaColor.value);
  });
  const tHeater = document.getElementById('tHeater');
  tHeater.addEventListener('change', () => {
    heaterOn = tHeater.checked;
  });

  const twEl     = document.getElementById('typewriter');
  const twTextEl = document.getElementById('twText');
  const twCursor = document.getElementById('twCursor');
  const tCaption = document.getElementById('tCaption');
  const tTwSpeed = document.getElementById('tTwSpeed');
  const tTwHold  = document.getElementById('tTwHold');
  const tTwSize  = document.getElementById('tTwSize');
  const tTwX     = document.getElementById('tTwX');
  const tTwY     = document.getElementById('tTwY');
  const tTwColor = document.getElementById('tTwColor');
  const valTwSpeed = document.getElementById('valTwSpeed');
  const valTwHold  = document.getElementById('valTwHold');
  const valTwSize  = document.getElementById('valTwSize');
  const valTwX     = document.getElementById('valTwX');
  const valTwY     = document.getElementById('valTwY');

  let captionLines = [];
  let twSpeed = 22;   // chars per second
  let twHold  = 2.0;  // seconds after fully typed
  let twIndex = 0;
  let twPhase = 'idle'; // idle | typing | hold | fadeout
  let twPhaseStart = 0; // performance.now()/1000
  let twTyped = '';

  function applyTwStyle(){
    twEl.style.left     = tTwX.value + '%';
    twEl.style.top      = tTwY.value + '%';
    twEl.style.fontSize = tTwSize.value + 'px';
    twEl.style.color    = tTwColor.value;
  }
  applyTwStyle();

  function setCaption(){
    captionLines = tCaption.value
      .split('\n')
      .map(l => l.replace(/\s+$/,''))
      .filter(l => l.length > 0);
    twIndex = 0;
    twTyped = '';
    twTextEl.textContent = '';
    twPhase = captionLines.length ? 'typing' : 'idle';
    twPhaseStart = performance.now()/1000;
    twEl.classList.toggle('visible', captionLines.length > 0 && programs[current].id === 12);
  }

  tCaption.addEventListener('input', setCaption);
  tTwSpeed.addEventListener('input', () => {
    twSpeed = parseFloat(tTwSpeed.value);
    valTwSpeed.textContent = Math.round(twSpeed) + ' cps';
  });
  tTwHold.addEventListener('input', () => {
    twHold = parseFloat(tTwHold.value);
    valTwHold.textContent = twHold.toFixed(1) + 's';
  });
  tTwSize.addEventListener('input', () => {
    valTwSize.textContent = tTwSize.value + 'px';
    applyTwStyle();
  });
  tTwX.addEventListener('input', () => {
    valTwX.textContent = tTwX.value + '%';
    applyTwStyle();
  });
  tTwY.addEventListener('input', () => {
    valTwY.textContent = tTwY.value + '%';
    applyTwStyle();
  });
  tTwColor.addEventListener('input', applyTwStyle);

  function tickTypewriter(){
    if(captionLines.length === 0 || programs[current].id !== 12){
      twEl.classList.remove('visible');
      return;
    }
    twEl.classList.add('visible');
    const now = performance.now()/1000;
    const dt  = now - twPhaseStart;
    const cur = captionLines[twIndex % captionLines.length];

    if(twPhase === 'typing'){
      const total = Math.min(cur.length, Math.floor(dt * twSpeed));
      if(total !== twTyped.length){
        twTyped = cur.slice(0, total);
        twTextEl.textContent = twTyped;
      }
      if(total >= cur.length){
        twPhase = 'hold';
        twPhaseStart = now;
      }
    } else if(twPhase === 'hold'){
      if(dt >= twHold){
        twPhase = 'fadeout';
        twPhaseStart = now;
        twEl.classList.remove('visible');
      }
    } else if(twPhase === 'fadeout'){
      if(dt >= 0.6){ // matches CSS transition
        twIndex = (twIndex + 1) % captionLines.length;
        twTyped = '';
        twTextEl.textContent = '';
        twPhase = 'typing';
        twPhaseStart = now;
        // small delay before fade-in
        setTimeout(() => twEl.classList.add('visible'), 50);
      }
    }
  }

  settingsReset.addEventListener('click', () => {
    Object.assign(tweaks, defaults);
    document.getElementById('tSpeed').value    = defaults.speed;
    document.getElementById('tMouse').value    = defaults.mouse;
    document.getElementById('tBright').value   = defaults.bright;
    document.getElementById('tSat').value      = defaults.sat;
    document.getElementById('tContrast').value = defaults.contrast;
    document.getElementById('tHue').value      = defaults.hue;
    document.getElementById('tBlur').value     = defaults.blur;
    document.getElementById('valSpeed').textContent    = defaults.speed.toFixed(2)+'×';
    document.getElementById('valMouse').textContent    = defaults.mouse.toFixed(2);
    document.getElementById('valBright').textContent   = defaults.bright.toFixed(2);
    document.getElementById('valSat').textContent      = defaults.sat.toFixed(2);
    document.getElementById('valContrast').textContent = defaults.contrast.toFixed(2);
    document.getElementById('valHue').textContent      = defaults.hue+'°';
    document.getElementById('valBlur').textContent     = defaults.blur.toFixed(1)+'px';
    applyFilter();
  });

  // ---- render loop ----
  const startTime = performance.now() * 0.001;
  let scaledTime = 0;
  let lastFrameTs = performance.now() * 0.001;

  function frame(){
    const now = performance.now() * 0.001;
    const dt = Math.min(now - lastFrameTs, 0.1);
    lastFrameTs = now;
    scaledTime += dt * tweaks.speed;

    // update rising text blobs + re-render text texture (throttled)
    if(programs[current].id === 9 || programs[current].id === 12){
      updateBlobs(scaledTime);
      if(scaledTime - lastTexUpload > 0.033){ // ~30fps
        renderTextTexture(scaledTime);
        lastTexUpload = scaledTime;
      }
    }

    // typewriter (Lava Lamp 2.0)
    tickTypewriter();

    // ease mouse
    mouseSmooth.x += (mouse.x - mouseSmooth.x) * 0.08;
    mouseSmooth.y += (mouse.y - mouseSmooth.y) * 0.08;

    // apply mouse-influence: lerp from screen center toward actual mouse
    const cx = W*0.5, cy = H*0.5;
    const mFx = cx + (mouse.x - cx) * tweaks.mouse;
    const mFy = cy + (mouse.y - cy) * tweaks.mouse;
    const sFx = cx + (mouseSmooth.x - cx) * tweaks.mouse;
    const sFy = cy + (mouseSmooth.y - cy) * tweaks.mouse;

    // continuous mini clicks while dragging — softer
    if(dragging && Math.random() < 0.18){
      addClick(mouse.x, mouse.y, 0.35);
    }

    gl.viewport(0, 0, W, H);

    const sh = programs[current];
    gl.useProgram(sh.program);

    gl.bindBuffer(gl.ARRAY_BUFFER, buf);
    gl.enableVertexAttribArray(sh.a_position);
    gl.vertexAttribPointer(sh.a_position, 2, gl.FLOAT, false, 0, 0);

    gl.uniform2f(sh.u_resolution, W, H);
    gl.uniform2f(sh.u_mouse, mFx, mFy);
    gl.uniform2f(sh.u_mouseSmooth, sFx, sFy);
    gl.uniform1f(sh.u_time, scaledTime);
    gl.uniform4fv(sh.u_clicks, clicks);

    // text texture binding (lava lamp uses it; others ignore via u_textStrength=0)
    if(sh.u_text){
      gl.activeTexture(gl.TEXTURE0);
      gl.bindTexture(gl.TEXTURE_2D, textTex);
      gl.uniform1i(sh.u_text, 0);
    }
    if(sh.u_textStrength){
      // only the lava lamps (id=9, 12) actually use text blobs
      const isLava = (programs[current].id === 9 || programs[current].id === 12);
      const enable = isLava ? textStrengthEffective() : 0.0;
      gl.uniform1f(sh.u_textStrength, enable);
    }
    if(sh.u_textAspect){
      gl.uniform2f(sh.u_textAspect, W/H, 1.0);
    }
    if(sh.u_textMerge){
      gl.uniform1f(sh.u_textMerge, textMerge);
    }
    if(sh.u_lavaColor){
      gl.uniform3f(sh.u_lavaColor, lavaColor[0], lavaColor[1], lavaColor[2]);
    }
    if(sh.u_heater){
      gl.uniform1f(sh.u_heater, heaterOn ? 1.0 : 0.0);
    }

    gl.drawArrays(gl.TRIANGLES, 0, 6);
    requestAnimationFrame(frame);
  }
  requestAnimationFrame(frame);
  return {
    selectShader,
    get current() {
      return current;
    },
  };
}
