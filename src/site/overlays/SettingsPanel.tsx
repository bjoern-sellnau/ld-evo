'use client';

import { useState, type CSSProperties, type ReactNode } from 'react';
import { mono } from '../cards/ProjectCard';
import { heroMode } from '../hero/heroInk';
import { PALETTES, heroCfgOf, resolvePal, type HeroModeCfg, type PaletteName } from '../hero/palettes';
import { SPLASH_REPLAY_EVENT } from '../splash/Splash';
import { useSite } from '../settings/SiteProvider';
import { ACCENTS, type Settings } from '../settings/schema';
import { GlassLayers, panelGlass } from './GlassPanel';
import styles from './settings.module.css';

// Segment-Reihenfolge der Hero-Modi wie im Prototyp (heroSegs).
const HERO_SEGS = [
  ['flow', 'Flow'],
  ['lava', 'Lava'],
  ['aurora', 'Aurora'],
  ['ribbon', 'Ribbon'],
  ['orbit', 'Orbit'],
  ['blackhole', 'Blackhole'],
  ['nova', 'Supernova'],
  ['plasma', 'Plasma'],
  ['fire', 'Feuer'],
  ['matrix', 'Matrix'],
  ['rain', 'Regen'],
  ['swarm', 'Schwarm'],
  ['firefly', 'Glühwürmchen'],
  ['shooting', 'Sternschnuppen'],
  ['snow', 'Schnee'],
  ['clouds', 'Wolken'],
  ['storm', 'Nordlicht-Sturm'],
  ['ink', 'Tintenfluss'],
  ['grid', 'Neon-Grid'],
  ['matrix2', 'Matrix v2'],
  ['helix', 'DNA-Helix'],
  ['comet', 'Kometenschweif'],
  ['galaxy', 'Galaxie'],
  ['ocean', 'Ozeanwellen'],
  ['storm2', 'Blitzgewitter'],
  ['hourglass', 'Sanduhr'],
  ['fireworks', 'Feuerwerk'],
] as const;

const VT_SEGS = [
  ['fade', 'Fade'],
  ['slide', 'Slide'],
  ['zoom', 'Zoom'],
  ['blur', 'Blur'],
  ['wipe', 'Wipe'],
  ['circle', 'Kreis'],
  ['iris', 'Iris'],
  ['curtain', 'Vorhang'],
  ['blinds', 'Blinds'],
  ['split', 'Split'],
  ['diagonal', 'Diagonal'],
  ['flip', 'Flip'],
  ['stack', 'Stack'],
  ['push', 'Push'],
  ['skew', 'Skew'],
  ['spin', 'Spin'],
  ['spring', 'Spring'],
  ['glitch', 'Glitch'],
  ['cinema', 'Cinema'],
  ['swap', 'Swap'],
] as const;

const HERO_PARTS = [
  { key: 'bar', label: 'Job-Leiste' },
  { key: 't1', label: 'Titel 1' },
  { key: 't2', label: 'Titel 2' },
  { key: 'sub', label: 'Name' },
  { key: 'job', label: 'Jobtitel' },
  { key: 'intro', label: 'Intro' },
  { key: 'btn1', label: 'Button 1', sk: 'btn1s', sd: 'solid' },
  { key: 'btn2', label: 'Button 2', sk: 'btn2s', sd: 'ghost' },
] as const;
const INK_OPTS = [
  ['auto', 'Auto'],
  ['white', 'Weiß'],
  ['black', 'Schw.'],
  ['contrast', 'Kontr.'],
] as const;
const STYLE_OPTS = [
  ['solid', 'Solid'],
  ['ghost', 'Ghost'],
  ['glas', 'Glas'],
  ['liquid', 'Liquid'],
] as const;

// Welche Modi welche Konfig-Zeilen zeigen (Prototyp: showFxPal / showFxCfg / showFxAng / showFxReset).
const NO_PAL = ['orbit'];
const SIZE_POS = ['flow', 'blackhole', 'nova', 'orbit', 'ribbon'];

/** Einstellungs-Panel (Prototyp Zeile 973–1211). Alle Werte persistieren über den SiteProvider (ld-*-Keys). */
export function SettingsPanel() {
  const site = useSite();
  const { settings: s, set, overlay, setOverlay, mob, isMobile, sideActive } = site;
  const [partsOpen, setPartsOpen] = useState(false);
  if (overlay !== 'settings') return null;

  const hm = heroMode(s);
  const cfg = heroCfgOf(s.heroCfg, hm);
  const pal = resolvePal(cfg);
  const setCfg = (mode: string, key: string | null, val?: unknown) => {
    const all = { ...s.heroCfg };
    if (key === null) delete all[mode];
    else all[mode] = { ...(all[mode] as HeroModeCfg | undefined), [key]: val };
    set('heroCfg', all);
  };
  const setCustom = (idx?: number, val?: string) => {
    const c = { ...cfg };
    const arr = [...(Array.isArray(c.cust) && c.cust.length === 5 ? c.cust : resolvePal(c))];
    if (idx !== undefined && val) arr[idx] = val;
    set('heroCfg', { ...s.heroCfg, [hm]: { ...c, cust: arr, pal: 'custom' } });
  };
  const setPart = (key: string, val: string) => set('heroParts', { ...s.heroParts, [key]: val });
  const toggle = (key: keyof Settings) => set(key, !s[key] as never);

  const radius = 'var(--radL,22px)';
  const pos: CSSProperties = sideActive
    ? { top: 88, left: 260 }
    : mob
      ? isMobile
        ? ({ top: 0, bottom: 0, left: 0, right: 0, '--radL': '0px' } as CSSProperties)
        : ({ top: 10, bottom: 10, left: 'calc(50% - 215px)', '--radL': '32px' } as CSSProperties)
      : { top: 78, left: '50%', transform: 'translateX(-50%)' };

  const switches: { label: string; key: keyof Settings; on: boolean }[] = [
    { label: 'High Contrast', key: 'hc', on: s.hc },
    { label: 'Schatten', key: 'shadowOn', on: s.shadowOn },
    { label: 'Blur', key: 'blurOn', on: s.blurOn },
    { label: 'Refraction', key: 'refrOn', on: s.refrOn },
    { label: 'Auto-Kontrast', key: 'autoC', on: s.autoC },
    { label: 'Opposite Color', key: 'oppC', on: s.oppC },
    { label: 'Kontrast-Schatten', key: 'ctShadow', on: s.ctShadow },
    { label: 'Scroll-BG', key: 'scrollBg', on: s.scrollBg },
    { label: 'Cover-Farbe', key: 'coverFull', on: s.coverFull },
    { label: 'Flat', key: 'flat', on: s.flat },
    { label: 'Animationen', key: 'anim', on: s.anim },
    { label: 'Full-Hero', key: 'fullHero', on: s.fullHero },
    { label: 'Full-Hero: Stats-Leiste', key: 'heroStats', on: s.heroStats },
    { label: 'Splash-Screen', key: 'splashOn', on: s.splashOn },
    { label: 'Performance-Modus', key: 'perfMode', on: s.perfMode },
    { label: '30 fps Hero', key: 'fpsHalf', on: s.fpsHalf },
    ...(hm === 'matrix'
      ? [
          { label: 'Cinematic (Matrix)', key: 'mxCine' as const, on: s.mxCine },
          { label: 'Hero-Text danach', key: 'mxLater' as const, on: s.mxLater },
        ]
      : []),
    ...(mob
      ? [
          { label: 'Modern Mobile-Nav', key: 'mobModern' as const, on: s.mobModern },
          { label: 'Scrollhide', key: 'scrollHide' as const, on: s.scrollHide },
        ]
      : []),
  ];

  return (
    <>
      <div aria-hidden onClick={() => setOverlay(null)} style={{ position: 'fixed', inset: 0, zIndex: 74 }} />
      <div
        role="dialog"
        aria-label="Einstellungen"
        style={{
          ...panelGlass(radius),
          position: 'fixed',
          ...pos,
          zIndex: 76,
          width: mob ? (isMobile ? 'auto' : 430) : 300,
          display: 'flex',
          flexDirection: 'column',
          maxHeight: mob ? 'none' : 'min(76vh, 660px)',
          boxSizing: 'border-box',
          padding: '18px 18px 14px',
          animation: 'ldPop 0.25s cubic-bezier(0.2,0.9,0.3,1)',
        }}
      >
        <GlassLayers radius={radius} glow />
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12, flex: 'none' }}>
          <h2 style={{ fontSize: 14, fontWeight: 700, margin: 0 }}>Einstellungen</h2>
          <span style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <span style={{ fontFamily: mono, fontSize: 9, color: 'var(--soft)' }}>LOKAL GESPEICHERT</span>
            {mob && (
              <button type="button" onClick={() => setOverlay(null)} aria-label="Schließen" className={styles.close}>
                ✕
              </button>
            )}
          </span>
        </div>
        <div style={{ overflowY: 'auto', flex: 1, minHeight: 0, overscrollBehavior: 'contain', marginRight: -10, paddingRight: 10 }}>
          <Row label="Ansicht">
            <Seg
              options={[
                ['auto', 'Desktop'],
                ['mobile', 'Mobile'],
                ['wide', 'Wide'],
              ]}
              value={s.viewMode === 'desktop' ? 'auto' : s.viewMode}
              onChange={(v) => {
                set('viewMode', v as Settings['viewMode']);
                setOverlay(null);
              }}
              label="Ansicht"
            />
          </Row>
          {mob && !isMobile && <FrameRow />}
          <Row label="Darstellung">
            <Seg
              options={[
                ['dark', 'Dark'],
                ['light', 'Light'],
              ]}
              value={s.theme}
              onChange={(v) => set('theme', v as Settings['theme'])}
              label="Darstellung"
              bold
            />
          </Row>
          <Row label="Browser-Farbe">
            <Seg
              options={[
                ['brand', 'Marke'],
                ['site', 'Site'],
              ]}
              value={s.themeColor}
              onChange={(v) => set('themeColor', v as Settings['themeColor'])}
              label="Browser-Farbe (theme-color)"
            />
          </Row>
          <Row label="Akzentfarbe">
            <span role="radiogroup" aria-label="Akzentfarbe" style={{ display: 'flex', gap: 8 }}>
              {ACCENTS.map((a) => {
                const shown = s.theme === 'light' ? a.light : a.dark;
                const on = (s.accentSel || '#FFB224') === a.key;
                return (
                  <button
                    key={a.key}
                    type="button"
                    role="radio"
                    aria-checked={on}
                    title={a.name}
                    aria-label={a.name}
                    onClick={() => set('accentSel', a.key)}
                    className={styles.swatch}
                    style={{
                      background: shown,
                      boxShadow: on ? `0 0 0 2px var(--cardsolid),0 0 0 4px ${shown}` : '0 0 0 1px var(--border)',
                    }}
                  />
                );
              })}
            </span>
          </Row>
          <Row label="Transparenz">
            <span role="radiogroup" aria-label="Transparenz" style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
              <span style={{ fontSize: 9.5, color: 'var(--soft)' }}>klar</span>
              {[1, 2, 3, 4, 5].map((n) => {
                const on = (s.glassLvl || 3) === n;
                return (
                  <button
                    key={n}
                    type="button"
                    role="radio"
                    aria-checked={on}
                    title={['Sehr klar', 'Klar', 'Standard', 'Milchig', 'Deckend'][n - 1]}
                    aria-label={['Sehr klar', 'Klar', 'Standard', 'Milchig', 'Deckend'][n - 1]}
                    onClick={() => set('glassLvl', n)}
                    className={styles.step}
                    style={{
                      background: `color-mix(in srgb,var(--ink) ${['8%', '20%', '38%', '62%', '90%'][n - 1]},transparent)`,
                      border: `1.5px solid ${on ? 'var(--accent)' : 'var(--border)'}`,
                      boxShadow: on ? '0 0 0 2.5px var(--accent)' : 'none',
                    }}
                  />
                );
              })}
              <span style={{ fontSize: 9.5, color: 'var(--soft)' }}>deckend</span>
            </span>
          </Row>
          <Row label="Material">
            <Seg
              options={[
                ['liquid', 'Liquid'],
                ['glassm', 'Glas'],
                ['fluent', 'Fluent'],
              ]}
              value={s.styleMode}
              onChange={(v) => set('styleMode', v as Settings['styleMode'])}
              label="Material"
              bold
            />
          </Row>
          <Row label="Hero-Animation" column>
            <Seg options={HERO_SEGS} value={hm} onChange={(v) => set('heroAnim', v)} label="Hero-Animation" wrap />
          </Row>
          <Row label="Splash-Animation">
            <Seg
              options={[
                ['logo', 'LD Logo'],
                ['lines', 'Lines'],
                ['sketch', 'Sketch'],
              ]}
              value={s.splashAnim}
              onChange={(v) => {
                set('splashAnim', v);
                window.dispatchEvent(new Event(SPLASH_REPLAY_EVENT));
              }}
              label="Splash-Animation"
            />
          </Row>
          <Row label="Page-Transition" column>
            <Seg options={VT_SEGS} value={s.pageVt || 'fade'} onChange={(v) => set('pageVt', v)} label="Page-Transition" wrap />
            <Toggle label="Detailseiten immer schlicht (Fade)" on={s.detailPlain} onToggle={() => toggle('detailPlain')} small />
          </Row>
          {hm === 'aurora' && (
            <Row label="Aurora-Preset">
              <Seg
                options={[
                  ['current', 'Current'],
                  ['borealis', 'Aurora Borealis'],
                ]}
                value={s.auroraPre}
                onChange={(v) => set('auroraPre', v)}
                label="Aurora-Preset"
              />
            </Row>
          )}
          {!NO_PAL.includes(hm) && (
            <Row label="Farben" column>
              <span role="radiogroup" aria-label="Farbpalette" style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                {(Object.keys(PALETTES) as PaletteName[]).map((pk) => (
                  <button
                    key={pk}
                    type="button"
                    role="radio"
                    aria-checked={(cfg.pal || 'amber') === pk}
                    title={pk}
                    aria-label={pk}
                    onClick={() => setCfg(hm, 'pal', pk)}
                    className={styles.pal}
                    style={{ border: `1.5px solid ${(cfg.pal || 'amber') === pk ? 'var(--accent)' : 'var(--border)'}` }}
                  >
                    {PALETTES[pk].map((c, i) => (
                      <span key={i} style={{ width: 10, height: 10, borderRadius: '50%', background: c }} />
                    ))}
                  </button>
                ))}
                <button
                  type="button"
                  role="radio"
                  aria-checked={cfg.pal === 'custom'}
                  onClick={() => setCustom()}
                  className={styles.pal}
                  style={{
                    border: `1.5px solid ${cfg.pal === 'custom' ? 'var(--accent)' : 'var(--border)'}`,
                    fontSize: 10.5,
                    fontWeight: 700,
                    color: 'var(--muted)',
                    padding: '6px 11px',
                  }}
                >
                  Custom
                </button>
              </span>
              {cfg.pal === 'custom' && (
                <span style={{ display: 'flex', gap: 6, alignItems: 'center', flexWrap: 'wrap' }}>
                  {pal.map((c, i) => (
                    <input
                      key={i}
                      type="color"
                      value={c}
                      aria-label={`Farbe ${i + 1}`}
                      onChange={(e) => setCustom(i, e.target.value)}
                      className={styles.color}
                    />
                  ))}
                </span>
              )}
            </Row>
          )}
          <Row label="Hero-Text">
            <span style={{ display: 'flex', gap: 4, alignItems: 'center', background: 'var(--pill)', borderRadius: 999, padding: 3 }}>
              <Seg
                options={[
                  ['auto', 'Auto'],
                  ['white', 'Weiß'],
                  ['black', 'Schwarz'],
                  ['contrast', 'Kontrast'],
                ]}
                value={s.heroInk}
                onChange={(v) => set('heroInk', v)}
                label="Hero-Text"
                bare
              />
              <input
                type="color"
                value={s.heroInk.startsWith('#') ? s.heroInk : '#FFB224'}
                onChange={(e) => set('heroInk', e.target.value)}
                title="Eigene Farbe"
                aria-label="Eigene Hero-Textfarbe"
                className={styles.color}
                style={{ width: 30, height: 26, padding: 1 }}
              />
            </span>
          </Row>
          <button type="button" onClick={() => setPartsOpen((o) => !o)} aria-expanded={partsOpen} className={styles.rowBtn}>
            <span style={{ fontSize: 12.5, color: 'var(--muted)' }}>Hero-Text pro Element</span>
            <span
              aria-hidden
              style={{ fontSize: 10, color: 'var(--soft)', transform: `rotate(${partsOpen ? 180 : 0}deg)`, transition: 'transform 0.25s' }}
            >
              ▾
            </span>
          </button>
          {partsOpen &&
            HERO_PARTS.map((pd) => (
              <div key={pd.key}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 8, padding: '5px 0 5px 10px' }}>
                  <span style={{ fontSize: 11, color: 'var(--soft)', whiteSpace: 'nowrap' }}>{pd.label}</span>
                  <Seg
                    options={INK_OPTS}
                    value={s.heroParts[pd.key] || 'auto'}
                    onChange={(v) => setPart(pd.key, v)}
                    label={pd.label}
                    tiny
                  />
                </div>
                {'sk' in pd && (
                  <div
                    style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 8, padding: '1px 0 8px 22px' }}
                  >
                    <span style={{ fontSize: 10, color: 'var(--soft)', whiteSpace: 'nowrap' }}>↳ Stil</span>
                    <Seg
                      options={STYLE_OPTS}
                      value={s.heroParts[pd.sk] || pd.sd}
                      onChange={(v) => setPart(pd.sk, v)}
                      label={`${pd.label} Stil`}
                      tiny
                    />
                  </div>
                )}
              </div>
            ))}
          {s.ctShadow && (
            <Row label="Schatten-Stärke">
              <Range min={20} max={200} step={10} value={s.ctStrength} onChange={(v) => set('ctStrength', v)} label="Schatten-Stärke" />
            </Row>
          )}
          {((hm === 'matrix' && s.mxCine) || hm === 'matrix2') && (
            <Row label="Cinematic-Texte (Matrix)" column>
              <input
                value={s.mxT1 ?? ''}
                onChange={(e) => set('mxT1', e.target.value)}
                placeholder="Text 1"
                aria-label="Cinematic-Text 1"
                className={styles.text}
              />
              <input
                value={s.mxT2 ?? ''}
                onChange={(e) => set('mxT2', e.target.value)}
                placeholder="Text 2"
                aria-label="Cinematic-Text 2"
                className={styles.text}
              />
              <span style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 12 }}>
                <span style={{ fontSize: 11.5, color: 'var(--soft)', whiteSpace: 'nowrap' }}>Text-Größe</span>
                <Range min={50} max={200} step={10} value={s.mxSize} onChange={(v) => set('mxSize', v)} label="Text-Größe" max2={160} />
              </span>
            </Row>
          )}
          {hm === 'fire' && (
            <>
              <Row label="Funken-Dichte">
                <Range
                  min={0}
                  max={100}
                  step={5}
                  value={(cfg.sp as number) ?? 50}
                  onChange={(v) => setCfg('fire', 'sp', v)}
                  label="Funken-Dichte"
                />
              </Row>
              <Row label="Rauch-Dichte">
                <Range
                  min={0}
                  max={100}
                  step={5}
                  value={(cfg.sm as number) ?? 50}
                  onChange={(v) => setCfg('fire', 'sm', v)}
                  label="Rauch-Dichte"
                />
              </Row>
              <Row label="Rauch-Farbe">
                <input
                  type="color"
                  value={(cfg.smc as string) || '#151318'}
                  onChange={(e) => setCfg('fire', 'smc', e.target.value)}
                  aria-label="Rauch-Farbe"
                  className={styles.color}
                  style={{ width: 44 }}
                />
              </Row>
              <Row label="Funken-Farbe">
                <input
                  type="color"
                  value={(cfg.spc as string) || pal[0]}
                  onChange={(e) => setCfg('fire', 'spc', e.target.value)}
                  aria-label="Funken-Farbe"
                  className={styles.color}
                  style={{ width: 44 }}
                />
              </Row>
            </>
          )}
          {SIZE_POS.includes(hm) && (
            <>
              <Row label="Größe">
                <Range min={40} max={400} step={5} value={cfg.s ?? 100} onChange={(v) => setCfg(hm, 's', v)} label="Größe" />
              </Row>
              <Row label="Links / Rechts">
                <Range min={0} max={100} step={1} value={cfg.x ?? 50} onChange={(v) => setCfg(hm, 'x', v)} label="Links / Rechts" />
              </Row>
              <Row label="Oben / Unten">
                <Range min={0} max={100} step={1} value={cfg.y ?? 50} onChange={(v) => setCfg(hm, 'y', v)} label="Oben / Unten" />
              </Row>
            </>
          )}
          {hm === 'ribbon' && (
            <>
              <Row label="Winkel">
                <Range min={0} max={100} step={1} value={cfg.a ?? 50} onChange={(v) => setCfg(hm, 'a', v)} label="Winkel" />
              </Row>
              <Toggle label="Hintergrund transparent" on={!!cfg.t} onToggle={() => setCfg(hm, 't', !cfg.t)} />
            </>
          )}
          <div style={{ display: 'flex', justifyContent: 'flex-end', padding: '7px 0', borderTop: '1px solid var(--hair)' }}>
            <button type="button" onClick={() => setCfg(hm, null)} className={styles.reset}>
              Default wiederherstellen
            </button>
          </div>
          {switches.map((sw) => (
            <Toggle key={sw.key} label={sw.label} on={sw.on} onToggle={() => toggle(sw.key)} />
          ))}
        </div>
      </div>
    </>
  );
}

/** Telefonrahmen der Desktop-Simulation: Clear/Island/Hole/Notch + Breite bzw. Position. */
function FrameRow() {
  const { settings: s, set } = useSite();
  const fc = s.frameCfg as { hole?: number; notch?: number; island?: number };
  const slider =
    s.frame === 'hole'
      ? { label: 'Position', min: 8, max: 92, val: fc.hole ?? 26, key: 'hole' }
      : s.frame === 'notch'
        ? { label: 'Breite', min: 120, max: 250, val: fc.notch ?? 158, key: 'notch' }
        : { label: 'Breite', min: 84, max: 190, val: fc.island ?? 118, key: 'island' };
  return (
    <Row label="Gerät" column>
      <Seg
        options={[
          ['clear', 'Clear'],
          ['island', 'Island'],
          ['hole', 'Hole'],
          ['notch', 'Notch'],
        ]}
        value={s.frame}
        onChange={(v) => set('frame', v as Settings['frame'])}
        label="Gerät"
        wrap
        small
      />
      {s.frame !== 'clear' && (
        <span style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 12 }}>
          <span style={{ fontSize: 11.5, color: 'var(--soft)', whiteSpace: 'nowrap' }}>{slider.label}</span>
          <Range
            min={slider.min}
            max={slider.max}
            step={1}
            value={slider.val}
            onChange={(v) => set('frameCfg', { ...s.frameCfg, [slider.key]: v })}
            label={slider.label}
            max2={160}
          />
        </span>
      )}
    </Row>
  );
}

function Row({ label, column, children }: { label: string; column?: boolean; children: ReactNode }) {
  return (
    <div
      style={{
        display: 'flex',
        ...(column
          ? { flexDirection: 'column', alignItems: 'stretch', gap: 8 }
          : { justifyContent: 'space-between', alignItems: 'center', gap: 12 }),
        padding: '9px 0',
        borderTop: '1px solid var(--hair)',
      }}
    >
      <span style={{ fontSize: 12.5, color: 'var(--muted)', whiteSpace: 'nowrap' }}>{label}</span>
      {children}
    </div>
  );
}

function Seg({
  options,
  value,
  onChange,
  label,
  wrap,
  bold,
  small,
  tiny,
  bare,
}: {
  options: readonly (readonly [string, string])[];
  value: string;
  onChange: (v: string) => void;
  label: string;
  wrap?: boolean;
  bold?: boolean;
  small?: boolean;
  tiny?: boolean;
  bare?: boolean;
}) {
  const btn = (id: string, text: string) => {
    const on = value === id;
    return (
      <button
        key={id}
        type="button"
        role="radio"
        aria-checked={on}
        onClick={() => onChange(id)}
        className={styles.seg}
        style={{
          padding: tiny ? '4px 8px' : bold ? '5px 12px' : wrap ? '5px 11px' : '5px 10px',
          fontSize: tiny ? 9.5 : small ? 10.5 : 11,
          fontWeight: bold ? 700 : 600,
          background: on ? 'var(--accent)' : 'transparent',
          color: on ? 'var(--on-accent)' : 'var(--muted)',
          whiteSpace: 'nowrap',
        }}
      >
        {text}
      </button>
    );
  };
  if (bare) return <>{options.map(([id, t]) => btn(id, t))}</>;
  return (
    <span
      role="radiogroup"
      aria-label={label}
      style={{
        display: 'flex',
        gap: tiny ? 2 : 4,
        flexWrap: wrap ? 'wrap' : undefined,
        background: 'var(--pill)',
        borderRadius: wrap ? 16 : 999,
        padding: tiny ? 2 : 3,
      }}
    >
      {options.map(([id, t]) => btn(id, t))}
    </span>
  );
}

function Toggle({ label, on, onToggle, small }: { label: string; on: boolean; onToggle: () => void; small?: boolean }) {
  return (
    <button type="button" role="switch" aria-checked={on} onClick={onToggle} className={small ? styles.toggleSmall : styles.toggleRow}>
      <span style={{ fontSize: small ? 11.5 : 12.5, color: small ? 'var(--soft)' : 'var(--muted)' }}>{label}</span>
      <span
        aria-hidden
        style={{
          width: small ? 40 : 42,
          height: 23,
          borderRadius: 999,
          background: on ? 'var(--accent)' : 'var(--pill)',
          position: 'relative',
          transition: 'background 0.25s',
          flex: 'none',
          display: 'inline-block',
        }}
      >
        <span
          style={{
            position: 'absolute',
            top: small ? 2 : 2.5,
            left: on ? (small ? 19 : 21.5) : small ? 2 : 2.5,
            width: small ? 19 : 18,
            height: small ? 19 : 18,
            borderRadius: '50%',
            background: '#fff',
            transition: 'left 0.25s',
            boxShadow: '0 1px 3px rgba(0,0,0,0.35)',
          }}
        />
      </span>
    </button>
  );
}

function Range({
  min,
  max,
  step,
  value,
  onChange,
  label,
  max2 = 170,
}: {
  min: number;
  max: number;
  step: number;
  value: number;
  onChange: (v: number) => void;
  label: string;
  max2?: number;
}) {
  return (
    <input
      type="range"
      min={min}
      max={max}
      step={step}
      value={value}
      aria-label={label}
      onChange={(e) => onChange(parseInt(e.target.value, 10))}
      style={{ flex: 1, maxWidth: max2, accentColor: 'var(--accent)' }}
    />
  );
}
