import { ACCENTS, type Settings } from './schema';

/** Text auf Akzentfläche: schwarz/weiß per Luminanz, Schwelle 0.55 (Prototyp: ink()). */
export function inkOn(hex: string): string {
  const r = parseInt(hex.slice(1, 3), 16) / 255;
  const g = parseInt(hex.slice(3, 5), 16) / 255;
  const b = parseInt(hex.slice(5, 7), 16) / 255;
  return 0.2126 * r + 0.7152 * g + 0.0722 * b > 0.55 ? '#141210' : '#FFFFFF';
}

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

/**
 * Vor dem ersten Paint (inline im <head>): Theme-Klasse setzen, damit Light-Nutzer keinen Dark-Blitz sehen.
 * Der Rest synchronisiert sich nach der Hydration über den SettingsProvider.
 */
export const THEME_BOOT_SCRIPT = `try{var t=localStorage.getItem('ld-theme');if(t==='light')document.body.classList.add('light');if(localStorage.getItem('ld-anim')==='off')document.body.classList.add('still')}catch(e){}`;
