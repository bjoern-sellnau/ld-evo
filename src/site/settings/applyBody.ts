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
  cl.toggle('ldfocus', s.focusStrong);
  cl.toggle('ldlinkline', s.linkLine);
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
// Live-Build-Hero (hero/extra/build.ts): Startseite schon vor dem ersten Bild verstecken, sonst blitzt sie kurz auf.
export const THEME_BOOT_SCRIPT = `try{var t=localStorage.getItem('ld-theme');if(t==='light')document.body.classList.add('light');if(localStorage.getItem('ld-anim')==='off')document.body.classList.add('still');if(localStorage.getItem('ld-splash')==='off')document.body.classList.add('ldnosplash');var h=/^([/]en)?[/]?$/.test(location.pathname.slice(${JSON.stringify(process.env.NEXT_PUBLIC_BASE_PATH ?? '')}.length)),s2=h&&(localStorage.getItem('ld-splash')!=='off'&&localStorage.getItem('ld-splashanim')==='terminal2'||/[?&]splash=terminal2/.test(location.search));if(h&&localStorage.getItem('ld-anim')!=='off'&&(s2||/^build/.test(localStorage.getItem('ld-heroanim')||''))){var b=document.body;b.setAttribute('data-ldbuild','');if(s2)b.setAttribute('data-ldsplash2','');setTimeout(function(){b.removeAttribute('data-ldbuild');b.removeAttribute('data-ldsplash2')},120000)}}catch(e){}`;
