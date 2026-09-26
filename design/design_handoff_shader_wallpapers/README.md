# Handoff: ORBIT OS – Interactive Shader Wallpapers

## Overview
A fullscreen, interactive WebGL wallpaper system for a futuristic operating system ("ORBIT OS"). Thirteen GPU fragment shaders react in real time to cursor position and clicks. A glass combobox switches effects; a gear button opens a scrollable "Tweaks" panel with global image controls and per-effect options (text-as-metaball blobs, typewriter caption, lava color, heating element).

## About the Design Files
`Shader Wallpapers.html` is a **design reference built in HTML/WebGL 1** — a working prototype showing intended look and behavior. It is not production code to paste in. Recreate it inside the target codebase's existing environment (React/Vue/Svelte/Electron/Tauri/native — whatever the OS shell uses) with its established patterns. If no environment exists, a small Vite + vanilla TS (or React) app with a single `<canvas>` and raw WebGL is the most faithful choice; Three.js/regl are acceptable if already in the stack. The GLSL fragment shaders can be ported verbatim.

## Fidelity
**High-fidelity.** Colors, typography, spacing, glass styling, and all shader math are final. Recreate 1:1. The shader GLSL should be copied as-is (WebGL 1 / GLSL ES 1.00).

## Screens / Views
Single fullscreen view. Layers, bottom to top:

### 1. Canvas (`#stage`)
- `position:fixed; inset:0`, fills viewport. Backing store sized to `devicePixelRatio` capped at **1.75**.
- `cursor: crosshair`.
- CSS `filter` on the canvas is driven by Tweaks: `brightness() saturate() contrast() hue-rotate() blur()`.

### 2. Corner crosshairs
Four 18×18px L-shaped corners, 1px border `rgba(232,236,242,0.28)`, 14px inset from each corner. Decorative, `pointer-events:none`.

### 3. Top OS bar (`.os-top`)
- `position:fixed; top:18px; padding:0 22px`, flex space-between, `pointer-events:none`.
- Text: 12px, uppercase, letter-spacing 0.08em, color `rgba(232,236,242,0.55)`.
- Left: 8px glowing dot (`radial-gradient(circle at 30% 30%, #fff, #6aa3ff 60%, #1a3a7a)`, `box-shadow 0 0 12px rgba(120,170,255,.7)`) + "ORBIT OS · Wallpaper".
- Right: live clock `HH:MM:SS` (tabular-nums), viewport size `W×H`, "v0.1". Gap 18px.

### 4. Center hint (`.hint`)
- Centered, 13px uppercase letter-spacing 0.18em, `rgba(232,236,242,0.55)`, `mix-blend-mode: plus-lighter`.
- Line 1: "Move the cursor · Click to disturb". Line 2 (11px, 0.24em, `rgba(232,236,242,0.28)`, margin-top 8px): "five interactive surfaces".
- Fades to `opacity:0` over **1.2s** on first mousemove.

### 5. Wallpaper title (`.wp-title`)
- `position:fixed; left:24px; bottom:120px`, `mix-blend-mode: plus-lighter`.
- `.num`: mono 11px, letter-spacing 0.22em, uppercase, `rgba(232,236,242,0.28)` — e.g. "01 / 13".
- `.name`: 44px, weight 300, letter-spacing −0.02em, line-height 1.05, margin-top 6px, `text-wrap: balance`.
- `.desc`: 13px, weight 300, line-height 1.5, max-width 360px, margin-top 10px, `rgba(232,236,242,0.55)`.
- On effect change: name+desc fade out (240ms), swap text, fade in.
- ≤720px: name 30px, bottom 110px.

### 6. Picker stack (`.picker-wrap`)
`position:fixed; left:50%; bottom:22px; translateX(-50%)`, flex column, centered, gap 8px.

**Combobox control (`.picker .control`)**
- min-width 280px (220px ≤720px). Flex row, gap 12px, padding 10px 12px.
- Glass: `rgba(14,16,22,0.55)`, 1px `rgba(255,255,255,0.10)`, radius 14px, `backdrop-filter: blur(20px) saturate(140%)`, shadow `0 30px 60px -20px rgba(0,0,0,.6), inset 0 1px 0 rgba(255,255,255,.06)`.
- Contents: 24px swatch (radius 8px, inset stroke `rgba(255,255,255,.14)`) · effect name 13px `#e8ecf2` (ellipsis) · index mono 10px letter-spacing .12em `rgba(232,236,242,.28)` · 12px chevron, rotates 180° when open.
- Hover: border → `rgba(255,255,255,0.22)`. Open: bg `rgba(20,22,30,0.7)`.
- `role="combobox"`, `aria-expanded`, `aria-haspopup="listbox"`.

**Menu (`.picker .menu`)** — opens **upward** (`bottom: calc(100% + 8px)`)
- bg `rgba(14,16,22,0.78)`, same border/radius, blur 24px, padding 6px, `max-height 60vh`, scrollable.
- Enter: opacity 0→1 + translateY(6px→0), 180ms ease.
- Option: flex, gap 10px, padding 8px 10px, radius 10px, 13px, `rgba(232,236,242,.55)`. 20px swatch (radius 6px). Hover/focus: bg `rgba(255,255,255,.05)`, ink `#e8ecf2`. Selected: bg `rgba(255,255,255,.07)`, inset 1px `rgba(255,255,255,.22)`, index in accent `#b9d6ff`.
- `role="listbox"` / `role="option"` with `aria-selected`.

**Gear button (`.settings-btn`)**
- 36×36 circle, same glass, icon 16px (Feather "settings" outline, 1.6 stroke). Color `rgba(232,236,242,.55)`; hover ink; pressed (panel open) accent `#b9d6ff` + strong border. `aria-pressed`.

### 7. Tweaks panel (`.settings-panel`)
- `position:fixed; right:22px; bottom:22px; width:300px; max-height: calc(100vh − 44px)`; flex column. ≤720px: `left/right:16px; bottom:130px`.
- Glass `rgba(14,16,22,0.78)`, 1px `rgba(255,255,255,.10)`, radius 16px, blur 24px, padding `14px 4px 12px 16px`.
- Enter/exit: opacity + translateY(8px), 200ms.
- `.head` (fixed): "TWEAKS" 11px uppercase .18em dim · 14px × close button.
- `.body` (scrolls): thin 8px scrollbar, thumb `rgba(255,255,255,.14)`, hover `.24`, right padding 12px.
- Row: flex column gap 6px, padding 8px 0, top border `rgba(255,255,255,.06)` (none on first). Label 12px ink, value mono 11px faint tabular.
- Range input: 2px track `rgba(255,255,255,.12)`, 14px round thumb `#e8ecf2`, hover scale 1.15.
- Toggle (checkbox): 30×18 pill `rgba(255,255,255,.10)`, 14px knob dim; checked: pill `rgba(185,214,255,.25)`, knob accent, translateX 12px, 200ms.
- Color input: 36×22, radius 6px, 1px glass border.
- Textarea: min-h 56, max-h 140, resize vertical, bg `rgba(255,255,255,.04)`, radius 8px, 12px/1.4, padding 8px 10px; focus border strong.
- Reset button: full-width, 1px glass border, radius 10px, 11px uppercase .12em, "Reset to defaults".
- Section title: 10px uppercase .18em faint, margin 10px 0 4px.

**Rows, in order**
1. Speed — 0…3 ×, step .01, default 1
2. Mouse influence — 0…1.5, default 1
3. Brightness — 0.4…1.6, default 1
4. Saturation — 0…2, default 1
5. Contrast — 0.5…1.6, default 1
6. Hue shift — 0…360°, default 0
7. Blur — 0…24px, step .5, default 0
8. **Reset to defaults** (resets 1–7 only)
9. Text blobs — textarea, "Lava Lamp only" hint; one line = one blob
10. Spawn interval — 0.5…15s, default 4.0
11. Text size — 0.4…2.2, default 1
12. Text depth — 0…1, default 0.5 (3D extrusion)
13. Text strength — 0…2, default 1
14. Blob wobble — 0…2.5, default 1
15. Text merge — 0.02…0.5, default 0.10 (smin k)
16. Perspective X / Y / Z (rot) — −1…1 each, default 0
17. Random per blob — toggle
18. Section "LAVA LAMP 2.0": Lava color (default `#ff8c4d`) · Heating element toggle (default off) · Caption text textarea · Type speed 3…80 cps (22) · Hold time 0.2…10s (2.0) · Caption size 18…160px (56) · Position X/Y 0…100% (50/70) · Caption color (`#ffffff`)

### 8. Typewriter caption (`.typewriter`)
- `position:fixed`, `left/top` in %, `translate(-50%,-50%)`, `pointer-events:none`, `mix-blend-mode: plus-lighter`.
- Font 200 weight, default 56px, letter-spacing −0.02em, line-height 1.05, centered, `text-wrap: balance`, max-width 80vw, `white-space: pre-wrap`, text-shadow `0 6px 30px rgba(0,0,0,.55)`.
- Blinking cursor: inline-block 0.06em × 1em, `steps(1)` 1s.
- Fade in/out via opacity 600ms ease. Only visible while effect 12 is active and caption non-empty.

## Effects (13 fragment shaders)
All share a vertex shader (fullscreen quad) and a common GLSL header providing `u_resolution, u_mouse, u_mouseSmooth, u_time, u_clicks[8], u_text (sampler2D), u_textStrength, u_textAspect, u_textMerge`, hash/value/gradient noise, `fbm`, cosine `palette()`, and `sampleClicks()` (expanding ring + puff per click, 3s life). Shader 12 additionally declares `u_lavaColor (vec3)` and `u_heater (float)`.

| # | Name | Swatch CSS | Key behaviour |
|---|------|-----------|---------------|
| 01 | Liquid Chrome | `linear-gradient(135deg,#dfe4ff,#9fb1ff 35%,#6e57b5 70%,#1c1138)` | domain-warped fbm, iridescent cosine palette; cursor pulls flow; clicks tear folds |
| 02 | Plasma Bloom | radial `#ffe3a3→#ff5dc8→#4b1ea8→#050018` | 4 summed sines; warm bloom under cursor; pink/violet click rings |
| 03 | Voronoi Crystals | conic teal | animated Voronoi F1/F2; cells gravitate to cursor; edge glow boost near cursor & waves |
| 04 | Ripple Pond | radial `#f3c98a→#b9645a→#2a3a55→#07101e` | 5 moving ripple sources + cursor trail; clicks = big rings |
| 05 | Event Horizon | radial white→`#ffd58c`→`#c83a8a`→`#2a0a4a`→black | gravitational lens at cursor, accretion spiral fbm, photon ring |
| 06 | Mesh Gradient | 3 radial blobs over `linear-gradient(135deg,#5b3a9a,#1a2660)` | 6 gaussian colour points; nearest follows cursor (mix .75) |
| 07 | Portal | radial white→`#7df0ff`→`#5a2bd1`→`#1b0848`→black | log-polar tunnel centred on cursor; rings scroll inward |
| 08 | Aurora | dark sky + mint radial | 3 fbm curtains (green/blue/magenta), stars, ground reflection; cursor pushes curtains |
| 09 | Lava Lamp | orange/red radial | 7 rising metaballs (smin k .18), warm glass bg, bubbles; text-blob support |
| 10 | Stripe Alt | 5-colour repeating 45° stripes | chunky retro bands `#f24c40 #f7c72e #3380d9 #1a1a26 #ede0c7`, halftone dots; cursor bends angle |
| 11 | Stripe Neu | `linear-gradient(110deg,#1a0d3a,#6c4cff,#ff5fb3,#ffce6a,#1d2a4f)` | sinusoidal iridescent bands bending toward cursor |
| 12 | Lava Lamp 2.0 | cyan/violet radial on `#0a1230→#04081a` | **convection cycle**: 9 blobs oscillate `y = sin(t·f+φ)·0.7`; temperature shading (hot bottom brighter); optional heater glow + filament at y=−0.78; custom `u_lavaColor` |
| 13 | Fabric Wave | `linear-gradient(120deg,#4f46e5,#06b6d4 35%,#22c55e 65%,#eab308)` | height-field cloth (sines + fbm), finite-difference normal, Lambert + spec (pow 28); 4-stop gradient indigo→cyan→green→amber; cursor lifts sheet |

Full GLSL for each is in the HTML in `<script id="fs-N" type="x-shader/x-fragment">`. Port verbatim.

## Interactions & Behavior
- **Mouse**: `mousemove` on window → `u_mouse` (px, Y flipped for GL). `u_mouseSmooth` eases toward it at 0.08/frame. "Mouse influence" lerps both from screen centre.
- **Click**: `mousedown` on canvas pushes `[x, y, scaledTime, 1.0]` into an 8-slot ring buffer. While dragging, 18% chance per frame to push a soft click (strength .35). Touch: `touchstart` = click, `touchmove` = move.
- **Effect switch**: combobox click/option click, keys `1–9`, `←/→`. Menu keyboard: `↑/↓` move focus, `Enter/Space` select, `Esc` close, `Home/End`. Outside `mousedown` closes.
- **Time**: `scaledTime += min(dt, 0.1) · speed`. Clicks store `scaledTime` so speed changes don't break ripples.
- **Text blobs (effects 9 & 12)**: lines from textarea cycle in order. Each spawn (every *Spawn interval* s) creates `{text, spawnTime, xJit, rx, ry, rz}`. Rendered every ≥33ms into a 512² canvas: black bg, white 900-weight text, shadow glow, N=2+depth·16 extruded copies offset (0.35, 0.55)·(1+depth·3) px per layer. Per-blob transform: translate → `transform(1, driftY, driftX, 1, 0, 0)` (skew X/Y) → rotate(Z) → scale(pulse). Wobble drives sway/pulse/rotation amplitude. `Random per blob` uses rx/ry/rz instead of sliders. Uploaded as `u_text`; shader maps `uv/1.6 + 0.5` and does `field = smin(field, 0.45 − mask·0.9 − (strength−1)·0.12, textMerge)`. Blob world y = −0.95 + age·0.075; despawn at y > 1.15.
- **Typewriter (effect 12)**: states `typing → hold → fadeout → next line`. Typing reveals `floor(dt·cps)` chars; hold `Hold time` s; fade 600ms; next line starts 50ms later. Reset on caption edit or effect switch.
- **Reduced motion**: not implemented — consider honouring `prefers-reduced-motion` by forcing speed 0.

## State Management
```
current: 0..12               // selected effect index
mouse, mouseSmooth: {x,y}    // px, GL-space
clicks: Float32Array(32)     // ring buffer, cursor idx
scaledTime, lastFrameTs
tweaks: {speed, mouse, bright, sat, contrast, hue, blur}
textQueue: string[], queueCursor, activeBlobs[], nextSpawnTime
textSize, textDepth, textStrength, textInterval, textWobble, textMerge
perspX, perspY, perspZ, perspRandom
lavaColor: [r,g,b] 0..1, heaterOn: bool
captionLines: string[], twIndex, twPhase, twPhaseStart, twSpeed, twHold
```
Persist `current` and all tweak values (localStorage or OS settings store) — the prototype does not.

## Design Tokens
```
--ink:               #e8ecf2
--ink-dim:           rgba(232,236,242,0.55)
--ink-faint:         rgba(232,236,242,0.28)
--accent:            #b9d6ff
--glass:             rgba(14,16,22,0.55)
--glass-strong:      rgba(14,16,22,0.78)
--glass-stroke:      rgba(255,255,255,0.10)
--glass-stroke-strong: rgba(255,255,255,0.22)
Font: "Inter", "SF Pro Text", system-ui   (UI)  /  "JetBrains Mono", ui-monospace (indices, values)
Type: 44/30 title · 13 body · 12 controls · 11 caps labels · 10 mono index
Radii: 18 dock · 16 panel · 14 combobox/menu · 12 buttons · 10 options · 8 swatch/textarea · 6 small
Blur: 20px (controls) · 24px (menu/panel), saturate(140%)
Shadow: 0 30px 60px -20px rgba(0,0,0,.6–.7), inset 0 1px 0 rgba(255,255,255,.06)
Motion: 140ms option hover · 180ms menu · 200ms controls/panel · 240ms title swap · 600ms caption fade · 1.2s hint fade
```

## Assets
No external images. Icons are inline SVG (chevron, Feather-style gear, ×). Fonts: Inter / JetBrains Mono (system fallbacks acceptable).

## Files
- `Shader Wallpapers.html` — complete prototype: CSS, markup, 13 GLSL shaders, WebGL host, tweaks, text-blob renderer, typewriter.
