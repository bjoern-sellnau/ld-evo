import { Geist, Geist_Mono, Instrument_Sans, JetBrains_Mono, Unbounded } from 'next/font/google';

/** Site-Schriften (Site-README §Typografie): Instrument Sans 400–700 inkl. italic, JetBrains Mono 400–700. */
export const instrumentSans = Instrument_Sans({
  subsets: ['latin'],
  weight: ['400', '500', '600', '700'],
  style: ['normal', 'italic'],
  display: 'swap',
  variable: '--ld-font-sans',
});

export const jetbrainsMono = JetBrains_Mono({
  subsets: ['latin'],
  weight: ['400', '500', '600', '700'],
  display: 'swap',
  variable: '--ld-font-mono',
});

/**
 * Design-Richtung „Beyond“ (Entwurf github.com/bjoern-sellnau/ld-path-to-beyond, src/app/layout.tsx): Unbounded für
 * Überschriften, Geist + Geist Mono für Text. Ohne Preload — geladen wird erst, wenn „Schrift & Verlauf“ an ist.
 */
export const bxDisplay = Unbounded({
  subsets: ['latin'],
  weight: ['500', '600', '700'],
  display: 'swap',
  preload: false,
  fallback: ['system-ui', 'sans-serif'],
  variable: '--bx-font-display',
});

export const bxSans = Geist({
  subsets: ['latin'],
  display: 'swap',
  preload: false,
  fallback: ['system-ui', 'sans-serif'],
  variable: '--bx-font-sans',
});

export const bxMono = Geist_Mono({
  subsets: ['latin'],
  display: 'swap',
  preload: false,
  fallback: ['ui-monospace', 'monospace'],
  variable: '--bx-font-mono',
});
