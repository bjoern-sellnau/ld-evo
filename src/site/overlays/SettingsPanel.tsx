'use client';

import { useId, useState, type CSSProperties, type ReactNode } from 'react';
import { createPortal } from 'react-dom';
import { settingInfo } from './settingsInfo';
import { mono } from '../cards/ProjectCard';
import { heroMode } from '../hero/heroInk';
import { EXTRA_MODES } from '../hero/extra/meta';
import { FAVICONS, faviconUri } from '../settings/favicon';
import { PALETTES, heroCfgOf, resolvePal, type HeroModeCfg, type PaletteName } from '../hero/palettes';
import { SPLASH_REPLAY_EVENT } from '../splash/Splash';
import { useSite } from '../settings/SiteProvider';
import { useContent } from '../content/ContentProvider';
import { canonicalPath } from '../i18n/locale';
import { NAV_PAD_MAX, NAV_PAD_MIN, NAV_PAD_SIDES, SITE_PAGES, navPadFor, pageForPath, type NavPad } from '../nav/pages';
import { ACCENTS, FOOT_COPY_PRESETS, FOOT_TAG_DEFAULT, type Settings } from '../settings/schema';
import { GlassLayers, panelGlass } from './GlassPanel';
import styles from './settings.module.css';
import { useRouter, usePathname } from 'next/navigation';
import { useLocale } from '../i18n/LocaleProvider';
import { switchLocalePath, type Locale } from '../i18n/locale';
import { LANGUAGE_NAME } from '../i18n/LanguageSwitch';

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
  // 20 zusätzliche Modi (neu, nicht im Prototyp): src/site/hero/extra/meta.ts
  ...Object.entries(EXTRA_MODES).map(([k, m]) => [k, m.label] as const),
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
  // Neu (nicht im Prototyp)
  ['tv', 'TV'],
  ['cube', 'Würfel'],
  ['vortex', 'Strudel'],
  ['warp', 'Warp'],
  ['drop', 'Absturz'],
  ['fold', 'Origami'],
  ['jelly', 'Wackelpudding'],
  ['star', 'Stern'],
  ['melt', 'Schmelzen'],
  ['portal', 'Portal'],
] as const;

const HERO_PARTS = [
  { key: 'bar', label: 'Job-Leiste', sk: 'bars', sd: 'glas' },
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
/** Deckkraft eines Hero-Buttons in % (heroParts btn1a/btn2a); Vorgaben wie in heroInk: Glas 14, Liquid 10, Solid 100. */
const btnAlpha = (parts: Record<string, string>, key: string, style: string) =>
  Number(parts[`${key}a`] ?? (style === 'glas' ? 14 : style === 'solid' ? 100 : 10));
const STYLE_OPTS = [
  ['solid', 'Solid'],
  ['ghost', 'Ghost'],
  ['glas', 'Glas'],
  ['liquid', 'Liquid'],
] as const;

/**
 * Beschriftungen des Panels: deutsch im Code (Prototyp), englisch über diese Tabelle. Row/Seg/Toggle/Range übersetzen
 * ihre Texte selbst; unbekannte (Eigennamen wie „Flow“, „Liquid“) bleiben unverändert.
 */
const EN_LABELS: Record<string, string> = {
  'Menü-Elemente': 'Menu elements',
  'Tech-Layout': 'Tech layout',
  'Footer-Marke': 'Footer brand',
  'Footer-Zusatz': 'Footer tagline',
  'Footer-Links': 'Footer links',
  'Eigener Copyright-Text': 'Custom copyright text',
  Symbole: 'Icons',
  Karten: 'Cards',
  Magazin: 'Magazine',
  Info: 'Info',
  'Menü-Abstand': 'Menu padding',
  'Alle Seiten zurücksetzen': 'Reset all pages',
  'Diese Seite zurücksetzen': 'Reset this page',
  'Alle vier gleich': 'All four equal',
  Oben: 'Top',
  Rechts: 'Right',
  Unten: 'Bottom',
  Links: 'Left',
  'Menü-Abstand Oben': 'Menu padding top',
  'Menü-Abstand Rechts': 'Menu padding right',
  'Menü-Abstand Unten': 'Menu padding bottom',
  'Menü-Abstand Links': 'Menu padding left',
  Farbschema: 'Color scheme',
  Suche: 'Search',
  'Animationen an/aus': 'Animations on/off',
  Seitenmenü: 'Side menu',
  Kontakt: 'Contact',
  Werkzeuge: 'Tools',
  Seiten: 'Pages',
  angepasst: 'customized',
  '30 fps Hero': '30 fps hero',
  Akzentfarbe: 'Accent color',
  Animationen: 'Animations',
  Ansicht: 'View',
  'Aurora-Preset': 'Aurora preset',
  'Auto-Kontrast': 'Auto contrast',
  Blitzgewitter: 'Thunderstorm',
  Breite: 'Width',
  'Browser-Farbe': 'Browser color',
  'Browser-Farbe (theme-color)': 'Browser color (theme-color)',
  'Cinematic-Text 1': 'Cinematic text 1',
  'Cinematic-Text 2': 'Cinematic text 2',
  'Cinematic-Texte (Matrix)': 'Cinematic texts (Matrix)',
  'Cover-Farbe': 'Cover color',
  Darstellung: 'Appearance',
  'Detailseiten immer schlicht (Fade)': 'Detail pages always plain (fade)',
  'DNA-Helix': 'DNA helix',
  'Eigene Farbe': 'Custom color',
  'Eigene Hero-Textfarbe': 'Custom hero text color',
  Einstellungen: 'Settings',
  Farben: 'Colors',
  Farbpalette: 'Color palette',
  Feuer: 'Fire',
  Feuerwerk: 'Fireworks',
  'Full-Hero: Stats-Leiste': 'Full hero: stats bar',
  'Funken-Dichte': 'Spark density',
  'Funken-Farbe': 'Spark color',
  Galaxie: 'Galaxy',
  Gerät: 'Device',
  Glas: 'Glass',
  Glühwürmchen: 'Fireflies',
  Größe: 'Size',
  'Hero-Animation': 'Hero animation',
  'Hero-Text': 'Hero text',
  'Hero-Text danach': 'Hero text afterwards',
  'Hintergrund transparent': 'Transparent background',
  'Job-Leiste': 'Job bar',
  Jobtitel: 'Job title',
  Kometenschweif: 'Comet tail',
  'Kontr.': 'Contr.',
  Kontrast: 'Contrast',
  'Kontrast-Schatten': 'Contrast shadow',
  'Fix-2-Stärke': 'Fix 2 strength',
  Kreis: 'Circle',
  'Links / Rechts': 'Left / right',
  Marke: 'Brand',
  'Modern Mobile-Nav': 'Modern mobile nav',
  'Leiste beim Scrollen ausblenden': 'Hide bar while scrolling',
  'Menü beim Scrollen einklappen': 'Collapse menu while scrolling',
  'Logo ohne Schriftzug': 'Logo without wordmark',
  'Kontakt-Button: Auto (Kontrast)': 'Contact button: auto (contrast)',
  'Neon-Grid': 'Neon grid',
  'Nordlicht-Sturm': 'Aurora storm',
  'Oben / Unten': 'Top / bottom',
  Ozeanwellen: 'Ocean waves',
  'Performance-Modus': 'Performance mode',
  'Rauch-Dichte': 'Smoke density',
  'Rauch-Farbe': 'Smoke color',
  Regen: 'Rain',
  Sanduhr: 'Hourglass',
  Schatten: 'Shadows',
  'Schatten-Stärke': 'Shadow strength',
  Schließen: 'Close',
  Schnee: 'Snow',
  'Schw.': 'Black',
  Schwarm: 'Swarm',
  Schwarz: 'Black',
  'Splash-Animation': 'Splash animation',
  'Splash-Screen': 'Splash screen',
  Sternschnuppen: 'Shooting stars',
  'Text-Größe': 'Text size',
  Tintenfluss: 'Ink flow',
  'Titel 1': 'Title 1',
  'Titel 2': 'Title 2',
  Transparenz: 'Transparency',
  Vorhang: 'Curtain',
  Weiß: 'White',
  Winkel: 'Angle',
  Wolken: 'Clouds',
  'LOKAL GESPEICHERT': 'STORED LOCALLY',
  klar: 'clear',
  deckend: 'opaque',
  'Sehr klar': 'Very clear',
  Klar: 'Clear',
  Standard: 'Default',
  Milchig: 'Frosted',
  Deckend: 'Opaque',
  'Hero-Text pro Element': 'Hero text per element',
  Kaleidoskop: 'Kaleidoscope',
  Hypertunnel: 'Hypertunnel',
  Glasmosaik: 'Stained glass',
  Topografie: 'Topography',
  Flüssigmetall: 'Liquid metal',
  Prisma: 'Prism',
  Moiré: 'Moiré',
  Strömungsfeld: 'Flow field',
  Klangfiguren: 'Chladni figures',
  'Neon-Leben': 'Neon life',
  'Turing-Muster': 'Turing patterns',
  Harmonograph: 'Harmonograph',
  Pendelwelle: 'Pendulum wave',
  Platinenstrom: 'Circuit pulse',
  Sternbilder: 'Constellations',
  Seifenblasen: 'Soap bubbles',
  Mandala: 'Mandala',
  Seidenfäden: 'Silk threads',
  Zellteilung: 'Cell division',
  'LD-Partikel': 'LD particles',
  '↳ Deckkraft': '↳ Opacity',
  '↳ Schrift': '↳ Label',
  Schriftfarbe: 'Label color',
  '↳ Textschatten': '↳ Text shadow',
  '↳ Hintergrund': '↳ Background',
  'Ink-Kachel': 'Ink tile',
  'Farb-Kachel': 'Color tile',
  'Cream-Kachel': 'Cream tile',
  'Negativ Orange': 'Negative orange',
  'Negativ Cream': 'Negative cream',
  Hintergrundfarbe: 'Background color',
  Aus: 'Off',
  Textschatten: 'text shadow',
  Schattenfarbe: 'Shadow color',
  Deckkraft: 'Opacity',
  '↳ Stil': '↳ Style',
  Stil: 'style',
  'Default wiederherstellen': 'Restore default',
  Farbe: 'Color',
  Gelb: 'Yellow',
  Blau: 'Blue',
  Sprache: 'Language',
  'Page-Transition': 'Page transition',
  'Zähler-Animation': 'Counter animation',
  'Mobil-Logo': 'Mobile logo',
  'Mobil-Design': 'Mobile design',
  'Logo negativ': 'Negative logo',
  'iPhone-Höhe (430 × 932)': 'iPhone height (430 × 932)',
  'Negativ-Farbe': 'Negative color',
  Ink: 'Ink',
  Cream: 'Cream',
  'Logo only negative (nur LD)': 'Logo only negative (L + D only)',
  'Logo-Farbe: Auto (Kontrast)': 'Logo color: auto (contrast)',
  'Auto (Kontrast)': 'Auto (contrast)',
  Prototyp: 'Prototype',
  Pille: 'Pill',
  Wortmarke: 'Wordmark',
  Kachel: 'Tile',
  'Beim Scrollen': 'On scroll',
  Würfel: 'Cube',
  Strudel: 'Vortex',
  Absturz: 'Drop',
  Wackelpudding: 'Jelly',
  Stern: 'Star',
  Schmelzen: 'Melt',
  'Reise: Bild-Hintergrund': 'Journey: image background',
  Schlicht: 'Plain',
  Walze: 'Rolling',
  Fallblatt: 'Split-flap',
};

function useSl() {
  const locale = useLocale();
  return (de: string) => (locale === 'en' ? (EN_LABELS[de] ?? de) : de);
}

// Welche Modi welche Konfig-Zeilen zeigen (Prototyp: showFxPal / showFxCfg / showFxAng / showFxReset).
const NO_PAL = ['orbit'];
const SIZE_POS = ['flow', 'blackhole', 'nova', 'orbit', 'ribbon'];

/** Einstellungs-Panel (Prototyp Zeile 973–1211). Alle Werte persistieren über den SiteProvider (ld-*-Keys). */
export function SettingsPanel() {
  const site = useSite();
  const { settings: s, set, overlay, setOverlay, mob, isMobile, sideActive, railMode } = site;
  const [partsOpen, setPartsOpen] = useState(false);
  const [navOpen, setNavOpen] = useState(false);
  const { navigation } = useContent();
  const sl = useSl();
  const locale = useLocale();
  const router = useRouter();
  const pathname = usePathname();
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
    ? { top: 88, left: railMode ? 96 : 260 }
    : mob
      ? isMobile
        ? ({ top: 0, bottom: 0, left: 0, right: 0, '--radL': '0px' } as CSSProperties)
        : ({ top: 10, bottom: 'var(--ld-pb, 10px)', left: 'calc(50% - 215px)', '--radL': '32px' } as CSSProperties)
      : { top: 78, left: '50%', transform: 'translateX(-50%)' };

  const switches: { label: string; key: keyof Settings; on: boolean }[] = [
    { label: 'High Contrast', key: 'hc', on: s.hc },
    { label: 'Schatten', key: 'shadowOn', on: s.shadowOn },
    { label: 'Blur', key: 'blurOn', on: s.blurOn },
    { label: 'Refraction', key: 'refrOn', on: s.refrOn },
    { label: 'Auto-Kontrast', key: 'autoC', on: s.autoC },
    { label: 'Opposite Color', key: 'oppC', on: s.oppC },
    { label: 'Kontrast-Schatten', key: 'ctShadow', on: s.ctShadow },
    { label: 'Auto Contrast Fix 2', key: 'ctFix2', on: s.ctFix2 },
    { label: 'Scroll-BG', key: 'scrollBg', on: s.scrollBg },
    { label: 'Cover-Farbe', key: 'coverFull', on: s.coverFull },
    { label: 'Flat', key: 'flat', on: s.flat },
    { label: 'Animationen', key: 'anim', on: s.anim },
    { label: 'Full-Hero', key: 'fullHero', on: s.fullHero },
    { label: 'Full-Hero: Stats-Leiste', key: 'heroStats', on: s.heroStats },
    { label: 'Splash-Screen', key: 'splashOn', on: s.splashOn },
    { label: 'Reise: Bild-Hintergrund', key: 'reiseBg', on: s.reiseBg },
    { label: 'Logo negativ', key: 'logoNeg', on: s.logoNeg },
    { label: 'Logo only negative (nur LD)', key: 'logoBare', on: s.logoBare },
    { label: 'Logo-Farbe: Auto (Kontrast)', key: 'logoAuto', on: s.logoAuto },
    { label: 'Kontakt-Button: Auto (Kontrast)', key: 'ctaAuto', on: s.ctaAuto },
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
          { label: 'Leiste beim Scrollen ausblenden', key: 'scrollHide' as const, on: s.scrollHide },
        ]
      : [
          { label: 'Menü beim Scrollen einklappen', key: 'navCollapse' as const, on: s.navCollapse },
          { label: 'Logo ohne Schriftzug', key: 'logoMarkOnly' as const, on: s.logoMarkOnly },
        ]),
  ];

  return (
    <>
      <div aria-hidden onClick={() => setOverlay(null)} style={{ position: 'fixed', inset: 0, zIndex: 74 }} />
      <div
        role="dialog"
        aria-label={sl('Einstellungen')}
        data-ldown=""
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
          <h2 style={{ fontSize: 14, fontWeight: 700, margin: 0 }}>{sl('Einstellungen')}</h2>
          <span style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <span style={{ fontFamily: mono, fontSize: 9, color: 'var(--soft)' }}>{sl('LOKAL GESPEICHERT')}</span>
            {mob && (
              <button type="button" onClick={() => setOverlay(null)} aria-label={sl('Schließen')} className={styles.close}>
                ✕
              </button>
            )}
          </span>
        </div>
        <div style={{ overflowY: 'auto', flex: 1, minHeight: 0, overscrollBehavior: 'contain', marginRight: -10, paddingRight: 10 }}>
          <Row label="Sprache">
            <Seg
              options={(['de', 'en'] as const).map((l) => [l, LANGUAGE_NAME[l]] as const)}
              value={locale}
              onChange={(v) => {
                setOverlay(null);
                if (v !== locale) router.push(switchLocalePath(pathname, v as Locale));
              }}
              label="Sprache"
            />
          </Row>
          <Row label="Ansicht" column>
            <Seg
              options={[
                ['auto', 'Desktop'],
                ['mobile', 'Mobile'],
                ['wide', 'Wide'],
                ['wide2', 'Wide 2'],
              ]}
              value={s.viewMode === 'desktop' ? 'auto' : s.viewMode}
              onChange={(v) => {
                set('viewMode', v as Settings['viewMode']);
                setOverlay(null);
              }}
              label="Ansicht"
              wrap
            />
          </Row>
          {mob && !isMobile && <FrameRow />}
          {mob && !isMobile && <Toggle label="iPhone-Höhe (430 × 932)" on={s.phoneExact} onToggle={() => toggle('phoneExact')} small />}
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
            <span role="radiogroup" aria-label={sl('Akzentfarbe')} style={{ display: 'flex', gap: 8 }}>
              {ACCENTS.map((a) => {
                const shown = s.theme === 'light' ? a.light : a.dark;
                const on = (s.accentSel || '#FFB224') === a.key;
                return (
                  <button
                    key={a.key}
                    type="button"
                    role="radio"
                    aria-checked={on}
                    title={sl(a.name)}
                    aria-label={sl(a.name)}
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
            <span role="radiogroup" aria-label={sl('Transparenz')} style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <span style={{ fontSize: 9.5, color: 'var(--soft)' }}>{sl('klar')}</span>
              {[1, 2, 3, 4, 5].map((n) => {
                const on = (s.glassLvl || 3) === n;
                return (
                  <button
                    key={n}
                    type="button"
                    role="radio"
                    aria-checked={on}
                    title={sl(['Sehr klar', 'Klar', 'Standard', 'Milchig', 'Deckend'][n - 1])}
                    aria-label={sl(['Sehr klar', 'Klar', 'Standard', 'Milchig', 'Deckend'][n - 1])}
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
              <span style={{ fontSize: 9.5, color: 'var(--soft)' }}>{sl('deckend')}</span>
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
          {mob && (
            <Row label="Mobil-Design" column>
              <Seg
                options={[
                  ['proto', 'Prototyp'],
                  ['app', 'App'],
                  ['appv2', 'App v2'],
                  ['editorial', 'Editorial'],
                  ['lab', 'Lab'],
                ]}
                value={s.mobDesign}
                onChange={(v) => set('mobDesign', v as Settings['mobDesign'])}
                label="Mobil-Design"
                wrap
              />
            </Row>
          )}
          {mob && s.mobDesign === 'proto' && (
            <Row label="Mobil-Logo" column>
              <Seg
                options={[
                  ['pill', 'Pille'],
                  ['wordmark', 'Wortmarke'],
                  ['tile', 'Kachel'],
                  ['scroll', 'Beim Scrollen'],
                ]}
                value={s.mobLogo}
                onChange={(v) => set('mobLogo', v as Settings['mobLogo'])}
                label="Mobil-Logo"
                wrap
              />
            </Row>
          )}
          {s.logoBare && (
            <Row label="Negativ-Farbe">
              <span style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                {/* Auto: Farbe nach gemessenem Hintergrund (Orange, sonst Cream/Ink — src/site/glass/logoContrast.ts) */}
                <button
                  type="button"
                  aria-label={`${sl('Negativ-Farbe')}: ${sl('Auto (Kontrast)')}`}
                  title={sl('Auto (Kontrast)')}
                  aria-pressed={s.logoNegColor === 'auto'}
                  onClick={() => set('logoNegColor', 'auto')}
                  style={{
                    height: 20,
                    padding: '0 7px',
                    borderRadius: 10,
                    border: '1px solid var(--border)',
                    background: 'var(--pill)',
                    color: 'var(--ink)',
                    fontSize: 11,
                    fontWeight: 700,
                    cursor: 'pointer',
                    boxShadow: s.logoNegColor === 'auto' ? '0 0 0 2.5px var(--accent)' : 'none',
                  }}
                >
                  {sl('Auto')}
                </button>
                {[
                  ['#FF7816', 'Orange'],
                  ['#171310', 'Ink'],
                  ['#F7F2EA', 'Cream'],
                  ['#FFB224', 'Gelb'],
                  ['#3B82F6', 'Blau'],
                ].map(([c, n]) => (
                  <button
                    key={c}
                    type="button"
                    aria-label={`${sl('Negativ-Farbe')}: ${sl(n)}`}
                    aria-pressed={s.logoNegColor.toUpperCase() === c}
                    onClick={() => set('logoNegColor', c)}
                    style={{
                      width: 20,
                      height: 20,
                      borderRadius: '50%',
                      border: '1px solid var(--border)',
                      background: c,
                      cursor: 'pointer',
                      boxShadow: s.logoNegColor.toUpperCase() === c ? '0 0 0 2.5px var(--accent)' : 'none',
                    }}
                  />
                ))}
                {/* freie Farbwahl */}
                <input
                  type="color"
                  value={s.logoNegColor === 'auto' ? '#FF7816' : s.logoNegColor}
                  onChange={(e) => set('logoNegColor', e.target.value.toUpperCase())}
                  aria-label={sl('Eigene Farbe')}
                  style={{ width: 26, height: 22, padding: 0, border: 0, background: 'transparent', cursor: 'pointer' }}
                />
              </span>
            </Row>
          )}
          <Row label="Favicon">
            {/* Favicon-Auswahl (neu): Vorschau der Varianten, Auswahl wirkt sofort im Browser-Tab */}
            <span role="radiogroup" aria-label={sl('Favicon')} style={{ display: 'flex', gap: 6, alignItems: 'center' }}>
              {FAVICONS.map((f) => (
                <button
                  key={f.key}
                  type="button"
                  role="radio"
                  aria-checked={s.favicon === f.key}
                  aria-label={sl(f.label)}
                  title={sl(f.label)}
                  onClick={() => set('favicon', f.key)}
                  style={{
                    width: 30,
                    height: 30,
                    padding: 4,
                    borderRadius: 9,
                    cursor: 'pointer',
                    border: `1.5px solid ${s.favicon === f.key ? 'var(--accent)' : 'var(--border)'}`,
                    background: f.key.startsWith('neg') ? '#3A3F4A' : 'transparent',
                  }}
                >
                  <img src={faviconUri(f.svg)} alt="" width={20} height={20} style={{ display: 'block' }} />
                </button>
              ))}
            </span>
          </Row>
          {!mob && (
            <NavSection
              open={navOpen}
              onOpen={() => setNavOpen((o) => !o)}
              navigation={navigation}
              page={pageForPath(canonicalPath(pathname))}
              pathname={canonicalPath(pathname)}
            />
          )}
          <Row label="Zähler-Animation">
            <Seg
              options={[
                ['plain', 'Schlicht'],
                ['roll', 'Walze'],
                ['flap', 'Fallblatt'],
              ]}
              value={s.counterFx}
              onChange={(v) => set('counterFx', v as Settings['counterFx'])}
              label="Zähler-Animation"
            />
          </Row>
          <Row label="Tech-Layout">
            <Seg
              options={[
                ['cards', 'Karten'],
                ['magazin', 'Magazin'],
                ['blog', 'Blog'],
              ]}
              value={s.techLayout}
              onChange={(v) => set('techLayout', v as Settings['techLayout'])}
              label="Tech-Layout"
            />
          </Row>
          <Row label="Footer-Marke">
            <Seg
              options={[
                ['accent', 'Loona!'],
                ['plain', 'Schlicht'],
                ['logo', 'Logo'],
              ]}
              value={s.footBrand}
              onChange={(v) => set('footBrand', v as Settings['footBrand'])}
              label="Footer-Marke"
            />
          </Row>
          <Row label="Footer-Zusatz" column>
            <input
              value={s.footTag}
              onChange={(e) => set('footTag', e.target.value)}
              placeholder={FOOT_TAG_DEFAULT}
              maxLength={80}
              aria-label={sl('Footer-Zusatz')}
              className={styles.text}
            />
          </Row>
          <Row label="Copyright" column>
            <span style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
              {FOOT_COPY_PRESETS.map((c) => (
                <button
                  key={c}
                  type="button"
                  aria-pressed={s.footCopy === c}
                  onClick={() => set('footCopy', c)}
                  className={styles.preset}
                  style={{
                    borderColor: s.footCopy === c ? 'var(--accent)' : 'var(--border)',
                    color: s.footCopy === c ? 'var(--ink)' : 'var(--muted)',
                  }}
                >
                  {c}
                </button>
              ))}
            </span>
            <input
              value={s.footCopy}
              onChange={(e) => set('footCopy', e.target.value)}
              placeholder={sl('Eigener Copyright-Text')}
              maxLength={120}
              aria-label={sl('Eigener Copyright-Text')}
              className={styles.text}
            />
          </Row>
          <Row label="Footer-Links">
            <Seg
              options={[
                ['text', 'Text'],
                ['icons', 'Symbole'],
              ]}
              value={s.footIcons ? 'icons' : 'text'}
              onChange={(v) => set('footIcons', v === 'icons')}
              label="Footer-Links"
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
              <span role="radiogroup" aria-label={sl('Farbpalette')} style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
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
                      aria-label={`${sl('Farbe')} ${i + 1}`}
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
                title={sl('Eigene Farbe')}
                aria-label={sl('Eigene Hero-Textfarbe')}
                className={styles.color}
                style={{ width: 30, height: 26, padding: 1 }}
              />
            </span>
          </Row>
          <Expander label="Hero-Text pro Element" open={partsOpen} onToggle={() => setPartsOpen((o) => !o)} />
          {partsOpen &&
            HERO_PARTS.map((pd) => (
              <div key={pd.key}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 8, padding: '5px 0 5px 10px' }}>
                  <span style={{ fontSize: 11, color: 'var(--soft)', whiteSpace: 'nowrap' }}>{sl(pd.label)}</span>
                  <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                    <Seg
                      options={INK_OPTS}
                      value={s.heroParts[pd.key] || 'auto'}
                      onChange={(v) => setPart(pd.key, v)}
                      label={pd.label}
                      tiny
                    />
                    {/* eigene Farbe je Element (neu): bei Buttons auch die Tönung von Glas/Liquid */}
                    <input
                      type="color"
                      value={(s.heroParts[pd.key] || '').startsWith('#') ? s.heroParts[pd.key] : '#FFB224'}
                      onChange={(e) => setPart(pd.key, e.target.value)}
                      title={sl('Eigene Farbe')}
                      aria-label={`${sl(pd.label)}: ${sl('Eigene Farbe')}`}
                      className={styles.color}
                      style={{ width: 24, height: 20, padding: 1, flex: 'none' }}
                    />
                  </span>
                </div>
                {'sk' in pd && (
                  <div
                    style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 8, padding: '1px 0 8px 22px' }}
                  >
                    <span style={{ fontSize: 10, color: 'var(--soft)', whiteSpace: 'nowrap' }}>{sl('↳ Stil')}</span>
                    <Seg
                      options={STYLE_OPTS}
                      value={s.heroParts[pd.sk] || pd.sd}
                      onChange={(v) => setPart(pd.sk, v)}
                      label={`${sl(pd.label)} ${sl('Stil')}`}
                      tiny
                    />
                  </div>
                )}
                {'sk' in pd && (s.heroParts[pd.sk] || pd.sd) !== 'ghost' && (
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 12, padding: '0 0 8px 22px' }}>
                    <span style={{ fontSize: 10, color: 'var(--soft)', whiteSpace: 'nowrap' }}>{sl('↳ Deckkraft')}</span>
                    <Range
                      min={0}
                      max={100}
                      step={5}
                      value={btnAlpha(s.heroParts, pd.key, s.heroParts[pd.sk] || pd.sd)}
                      onChange={(v) => setPart(`${pd.key}a`, String(v))}
                      label={`${sl(pd.label)} ${sl('Deckkraft')}`}
                    />
                  </div>
                )}
                {'sk' in pd && (
                  <>
                    {/* Beschriftung (neu): eigene Schriftfarbe, Textschatten-Stärke und -Farbe */}
                    <div
                      style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 8, padding: '0 0 8px 22px' }}
                    >
                      <span style={{ fontSize: 10, color: 'var(--soft)', whiteSpace: 'nowrap' }}>{sl('↳ Schrift')}</span>
                      <span style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                        <button
                          type="button"
                          onClick={() => setPart(`${pd.key}l`, '')}
                          aria-pressed={!s.heroParts[`${pd.key}l`]}
                          className={styles.reset}
                          style={{ padding: '2px 9px', fontSize: 10.5, background: !s.heroParts[`${pd.key}l`] ? 'var(--pill)' : undefined }}
                        >
                          {sl('Auto')}
                        </button>
                        <input
                          type="color"
                          value={s.heroParts[`${pd.key}l`] || '#FFFFFF'}
                          onChange={(e) => setPart(`${pd.key}l`, e.target.value)}
                          aria-label={`${sl(pd.label)}: ${sl('Schriftfarbe')}`}
                          title={sl('Schriftfarbe')}
                          className={styles.color}
                          style={{ width: 24, height: 20, padding: 1 }}
                        />
                      </span>
                    </div>
                  </>
                )}
                {pd.key === 'job' && (
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 8, padding: '0 0 8px 22px' }}>
                    {/* Hintergrund (neu): Farbe + Deckkraft; „Aus“ = Standard (Job-Leiste Glas, Jobtitel ohne) */}
                    <span style={{ fontSize: 10, color: 'var(--soft)', whiteSpace: 'nowrap' }}>{sl('↳ Hintergrund')}</span>
                    <span style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                      <button
                        type="button"
                        onClick={() => setPart(`${pd.key}bg`, '')}
                        aria-pressed={!s.heroParts[`${pd.key}bg`]}
                        className={styles.reset}
                        style={{ padding: '2px 9px', fontSize: 10.5, background: !s.heroParts[`${pd.key}bg`] ? 'var(--pill)' : undefined }}
                      >
                        {sl('Aus')}
                      </button>
                      <Range
                        min={0}
                        max={100}
                        step={5}
                        value={Number(s.heroParts[`${pd.key}ba`] ?? 60)}
                        onChange={(v) => setPart(`${pd.key}ba`, String(v))}
                        label={`${sl(pd.label)} ${sl('Deckkraft')}`}
                        max2={90}
                      />
                      <input
                        type="color"
                        value={s.heroParts[`${pd.key}bg`] || '#101A2A'}
                        onChange={(e) => setPart(`${pd.key}bg`, e.target.value)}
                        aria-label={`${sl(pd.label)}: ${sl('Hintergrundfarbe')}`}
                        title={sl('Hintergrundfarbe')}
                        className={styles.color}
                        style={{ width: 24, height: 20, padding: 1 }}
                      />
                    </span>
                  </div>
                )}
                {('sk' in pd || pd.key === 'job') && (
                  <>
                    <div
                      style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 8, padding: '0 0 8px 22px' }}
                    >
                      <span style={{ fontSize: 10, color: 'var(--soft)', whiteSpace: 'nowrap' }}>{sl('↳ Textschatten')}</span>
                      <span style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                        <Range
                          min={0}
                          max={100}
                          step={5}
                          value={Number(s.heroParts[`${pd.key}ts`] ?? 0)}
                          onChange={(v) => setPart(`${pd.key}ts`, String(v))}
                          label={`${sl(pd.label)} ${sl('Textschatten')}`}
                          max2={120}
                        />
                        <input
                          type="color"
                          value={s.heroParts[`${pd.key}tc`] || '#000000'}
                          onChange={(e) => setPart(`${pd.key}tc`, e.target.value)}
                          aria-label={`${sl(pd.label)}: ${sl('Schattenfarbe')}`}
                          title={sl('Schattenfarbe')}
                          className={styles.color}
                          style={{ width: 24, height: 20, padding: 1 }}
                        />
                      </span>
                    </div>
                  </>
                )}
              </div>
            ))}
          {s.ctShadow && (
            <Row label="Schatten-Stärke">
              <Range min={20} max={200} step={10} value={s.ctStrength} onChange={(v) => set('ctStrength', v)} label="Schatten-Stärke" />
            </Row>
          )}
          {s.autoC && s.ctFix2 && !s.ctShadow && (
            <Row label="Fix-2-Stärke">
              <Range min={50} max={150} step={10} value={s.ctFix2Lvl} onChange={(v) => set('ctFix2Lvl', v)} label="Fix-2-Stärke" />
            </Row>
          )}
          {((hm === 'matrix' && s.mxCine) || hm === 'matrix2') && (
            <Row label="Cinematic-Texte (Matrix)" column>
              <input
                value={s.mxT1 ?? ''}
                onChange={(e) => set('mxT1', e.target.value)}
                placeholder="Text 1"
                aria-label={sl('Cinematic-Text 1')}
                className={styles.text}
              />
              <input
                value={s.mxT2 ?? ''}
                onChange={(e) => set('mxT2', e.target.value)}
                placeholder="Text 2"
                aria-label={sl('Cinematic-Text 2')}
                className={styles.text}
              />
              <span style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 12 }}>
                <span style={{ fontSize: 11.5, color: 'var(--soft)', whiteSpace: 'nowrap' }}>{sl('Text-Größe')}</span>
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
                  aria-label={sl('Rauch-Farbe')}
                  className={styles.color}
                  style={{ width: 44 }}
                />
              </Row>
              <Row label="Funken-Farbe">
                <input
                  type="color"
                  value={(cfg.spc as string) || pal[0]}
                  onChange={(e) => setCfg('fire', 'spc', e.target.value)}
                  aria-label={sl('Funken-Farbe')}
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
              {sl('Default wiederherstellen')}
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

/** Beschriftungen der vier Abstands-Regler. */
const PAD_LABEL = { t: 'Oben', r: 'Rechts', b: 'Unten', l: 'Links' } as const;

/** Werkzeuge der Menüleiste, die sich ausblenden lassen (Schlüssel wie in SiteNav/IconRail). */
const NAV_TOOLS = [
  ['theme', 'Farbschema'],
  ['search', 'Suche'],
  ['anim', 'Animationen an/aus'],
  ['settings', 'Einstellungen'],
  ['side', 'Seitenmenü'],
  ['contact', 'Kontakt'],
] as const;

/**
 * Menü-Einstellungen (Desktop/Wide, neu — nicht im Prototyp): welche Einträge/Werkzeuge die Leiste zeigt (ld-navhide)
 * und der Innenabstand der Leiste je Hauptseite (ld-navpad). Die Einstellungen bleiben per Shift+S erreichbar, auch wenn
 * das Zahnrad ausgeblendet ist.
 */
function NavSection({
  open,
  onOpen,
  navigation,
  page,
  pathname,
}: {
  open: boolean;
  onOpen: () => void;
  navigation: { label: string; href: string }[];
  page: string | null;
  pathname: string;
}) {
  const { settings: s, set } = useSite();
  const sl = useSl();
  const hide = s.navHide || {};
  const flip = (key: string) => {
    const next = { ...hide };
    if (next[key]) delete next[key];
    else next[key] = true;
    set('navHide', next);
  };
  const pad = navPadFor(s.navPad, pathname);
  // „Alle vier gleich“: ein Regler bewegt alle vier Werte mit (nur Bedienung, nicht gespeichert)
  const [linked, setLinked] = useState(false);
  const setPad = (side: keyof NavPad, v: number) => {
    if (!page) return;
    const val: NavPad = linked ? { t: v, r: v, b: v, l: v } : { ...pad, [side]: v };
    set('navPad', { ...s.navPad, [page]: val });
  };
  const resetPage = () => {
    if (!page) return;
    const next = { ...s.navPad };
    delete next[page];
    set('navPad', next);
  };
  const custom = SITE_PAGES.filter((p) => s.navPad?.[p.id] !== undefined);
  const hiddenCount = Object.keys(hide).length;
  return (
    <>
      <Expander label="Menü-Elemente" open={open} onToggle={onOpen} extra={hiddenCount > 0 ? ` · −${hiddenCount}` : undefined} />
      {open && (
        <div style={{ paddingLeft: 8, paddingBottom: 8, display: 'flex', flexDirection: 'column', gap: 5 }}>
          <span style={{ display: 'block', fontFamily: mono, fontSize: 9, color: 'var(--soft)', margin: '6px 0 2px' }}>{sl('Seiten')}</span>
          {navigation.map((n) => (
            <Toggle key={n.href} label={n.label} on={!hide[n.href]} onToggle={() => flip(n.href)} small />
          ))}
          <span style={{ display: 'block', fontFamily: mono, fontSize: 9, color: 'var(--soft)', margin: '8px 0 2px' }}>
            {sl('Werkzeuge')}
          </span>
          {NAV_TOOLS.map(([k, label]) => (
            <Toggle key={k} label={label} on={!hide[k]} onToggle={() => flip(k)} small />
          ))}
        </div>
      )}
      {page && (
        <Row label="Menü-Abstand" column>
          {NAV_PAD_SIDES.map((side) => (
            <span key={side} style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <span style={{ fontSize: 11.5, color: 'var(--soft)', width: 52 }}>{sl(PAD_LABEL[side])}</span>
              <Range
                min={NAV_PAD_MIN}
                max={NAV_PAD_MAX}
                step={1}
                value={pad[side]}
                onChange={(v) => setPad(side, v)}
                label={`Menü-Abstand ${PAD_LABEL[side]}`}
                max2={400}
              />
              <span style={{ fontFamily: mono, fontSize: 10, color: 'var(--soft)', minWidth: 34, textAlign: 'right' }}>{pad[side]} px</span>
            </span>
          ))}
          <Toggle label="Alle vier gleich" on={linked} onToggle={() => setLinked((l) => !l)} small />
          {s.navPad?.[page] !== undefined && (
            <span style={{ display: 'flex', justifyContent: 'flex-end' }}>
              <button type="button" onClick={resetPage} className={styles.reset}>
                {sl('Diese Seite zurücksetzen')}
              </button>
            </span>
          )}
        </Row>
      )}
      {custom.length > 0 && (
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 8, padding: '0 0 8px' }}>
          <span style={{ fontSize: 10.5, color: 'var(--soft)' }}>
            {custom.map((p) => p.label).join(' · ')} — {sl('angepasst')}
          </span>
          <button type="button" onClick={() => set('navPad', {})} className={styles.reset}>
            {sl('Alle Seiten zurücksetzen')}
          </button>
        </div>
      )}
    </>
  );
}

/** Telefonrahmen der Desktop-Simulation: Clear/Island/Hole/Notch + Breite bzw. Position. */
function FrameRow() {
  const { settings: s, set } = useSite();
  const sl = useSl();
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
          <span style={{ fontSize: 11.5, color: 'var(--soft)', whiteSpace: 'nowrap' }}>{sl(slider.label)}</span>
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
  const sl = useSl();
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
      <span style={{ fontSize: 12.5, color: 'var(--muted)', whiteSpace: 'nowrap', display: 'inline-flex', alignItems: 'center', gap: 6 }}>
        {sl(label)}
        <InfoTip label={label} />
      </span>
      {children}
    </div>
  );
}

/**
 * Info-„i“ mit Tooltip (neu, nicht im Prototyp): erklärt eine Einstellung (Texte: settingsInfo.ts). Hover/Fokus zeigt,
 * Klick/Tippen schaltet; der Tooltip liegt per Portal über allem, damit ihn der Scrollbereich des Panels nicht abschneidet.
 * Screenreader bekommen den Text immer als Beschreibung.
 */
function InfoTip({ label }: { label: string }) {
  const locale = useLocale();
  const sl = useSl();
  const id = useId();
  const [box, setBox] = useState<DOMRect | null>(null);
  const [pinned, setPinned] = useState(false);
  const text = settingInfo(label, locale);
  if (!text) return null;
  const show = (el: HTMLElement) => setBox(el.getBoundingClientRect());
  const hide = () => {
    setBox(null);
    setPinned(false);
  };
  const W = 240;
  const tipPos: CSSProperties | null = box
    ? {
        left: Math.max(8, Math.min(box.left - 16, window.innerWidth - W - 8)),
        ...(box.bottom + 140 > window.innerHeight ? { bottom: window.innerHeight - box.top + 6 } : { top: box.bottom + 6 }),
      }
    : null;
  return (
    <>
      <button
        type="button"
        aria-label={`${sl('Info')}: ${sl(label)}`}
        aria-describedby={id}
        aria-expanded={!!box}
        className={styles.info}
        onMouseEnter={(e) => show(e.currentTarget)}
        onMouseLeave={() => !pinned && setBox(null)}
        onFocus={(e) => show(e.currentTarget)}
        onBlur={hide}
        onClick={(e) => {
          e.stopPropagation();
          if (pinned) hide();
          else {
            setPinned(true);
            show(e.currentTarget);
          }
        }}
        onKeyDown={(e) => {
          if (e.key === 'Escape' && box) {
            e.stopPropagation();
            e.nativeEvent.stopImmediatePropagation();
            hide();
          }
        }}
      >
        i
      </button>
      <span id={id} hidden>
        {text}
      </span>
      {tipPos &&
        createPortal(
          <span aria-hidden className={styles.tip} style={{ ...tipPos, width: W }}>
            {text}
          </span>,
          document.body,
        )}
    </>
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
  const sl = useSl();
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
        {sl(text)}
      </button>
    );
  };
  if (bare) return <>{options.map(([id, t]) => btn(id, t))}</>;
  return (
    <span
      role="radiogroup"
      aria-label={sl(label)}
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
  const sl = useSl();
  const id = useId();
  if (settingInfo(label, 'de'))
    return (
      <div className={small ? styles.toggleSmall : styles.toggleRow} style={{ cursor: 'default', width: '100%', boxSizing: 'border-box' }}>
        <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}>
          <label htmlFor={id} style={{ fontSize: small ? 11.5 : 12.5, color: small ? 'var(--soft)' : 'var(--muted)', cursor: 'pointer' }}>
            {sl(label)}
          </label>
          <InfoTip label={label} />
        </span>
        <button id={id} type="button" role="switch" aria-checked={on} onClick={onToggle} className={styles.switchBtn}>
          <Knob on={on} small={small} />
        </button>
      </div>
    );
  return (
    <button type="button" role="switch" aria-checked={on} onClick={onToggle} className={small ? styles.toggleSmall : styles.toggleRow}>
      <span style={{ fontSize: small ? 11.5 : 12.5, color: small ? 'var(--soft)' : 'var(--muted)' }}>{sl(label)}</span>
      <Knob on={on} small={small} />
    </button>
  );
}

/**
 * Auf-/Zuklapp-Zeile mit Info-„i“ direkt hinter der Beschriftung. Der Pfeil rechts ist eine zusätzliche, für
 * Tastatur/Screenreader versteckte Klickfläche (kein Button im Button).
 */
function Expander({ label, open, onToggle, extra }: { label: string; open: boolean; onToggle: () => void; extra?: string }) {
  const sl = useSl();
  return (
    <div className={styles.expRow}>
      <button type="button" onClick={onToggle} aria-expanded={open} className={styles.expBtn}>
        {sl(label)}
        {extra && <span style={{ color: 'var(--soft)' }}>{extra}</span>}
      </button>
      <InfoTip label={label} />
      <button type="button" tabIndex={-1} aria-hidden onClick={onToggle} className={styles.expFill}>
        <span style={{ display: 'inline-block', transform: `rotate(${open ? 180 : 0}deg)`, transition: 'transform 0.25s' }}>▾</span>
      </button>
    </div>
  );
}

/** Schalter-Optik (Spur + Knopf) für Toggle. */
function Knob({ on, small }: { on: boolean; small?: boolean }) {
  return (
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
  const sl = useSl();
  return (
    <input
      type="range"
      min={min}
      max={max}
      step={step}
      value={value}
      aria-label={sl(label)}
      onChange={(e) => onChange(parseInt(e.target.value, 10))}
      style={{ flex: 1, maxWidth: max2, accentColor: 'var(--accent)' }}
    />
  );
}
