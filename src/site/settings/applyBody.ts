import { inkOn } from '../lib/color';
import { ACCENTS, type Settings } from './schema';


export function isSafari(): boolean {
  const ua = navigator.userAgent;
  return /Safari/.test(ua) && !/Chrome|CriOS|FxiOS|Edg|Android/.test(ua);
}

/** Body-Klassen + Akzent-Variablen aus den Einstellungen (Prototyp: applyBody). */
export function applyBody(s: Settings, body: HTMLElement = document.body) {
  const cl = body.classList;
  cl.toggle('light', s.theme === 'light');
  cl.toggle('still', !s.anim);
  cl.toggle('ldsafari', isSafari());
  cl.toggle('hc', s.hc);
  cl.toggle('noshadow', !s.shadowOn);
  cl.toggle('flat', s.flat);
  cl.toggle('noblur', !s.blurOn);
  cl.toggle('refr', s.refrOn);
  cl.toggle('glassm', s.styleMode === 'glassm');
  cl.toggle('fluent', s.styleMode === 'fluent');
  for (const n of [1, 2, 4, 5]) cl.toggle(`gl${n}`, s.glassLvl === n);

  const a = s.accentSel;
  if (a && a !== '#FFB224') {
    const m = ACCENTS.find((x) => x.key === a);
    const v = m ? (s.theme === 'light' ? m.light : m.dark) : a;
    body.style.setProperty('--accent', v);
    body.style.setProperty('--on-accent', inkOn(v));
  } else {
    body.style.removeProperty('--accent');
    body.style.removeProperty('--on-accent');
  }
}

/** Marken-Ink aus dem Logo-Handoff (theme-color-Default). */
export const BRAND_THEME_COLOR = '#171310';

/** <meta name="theme-color"> je nach Einstellung: Marken-Ink oder aktueller Seitenhintergrund (--bg). */
export function applyThemeColor(mode: Settings['themeColor'], body: HTMLElement = document.body) {
  const bg = getComputedStyle(body).getPropertyValue('--bg').trim();
  const color = mode === 'site' && bg ? bg : BRAND_THEME_COLOR;
  document.querySelectorAll<HTMLMetaElement>('meta[name="theme-color"]').forEach((m) => (m.content = color));
}

/**
 * Vor dem ersten Paint (inline im <head>): Theme-Klasse setzen, damit Light-Nutzer keinen Dark-Blitz sehen.
 * Der Rest synchronisiert sich nach der Hydration über den SettingsProvider.
 */
export const THEME_BOOT_SCRIPT = `try{var t=localStorage.getItem('ld-theme');if(t==='light')document.body.classList.add('light');if(localStorage.getItem('ld-anim')==='off')document.body.classList.add('still')}catch(e){}`;
