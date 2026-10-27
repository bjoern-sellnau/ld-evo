import { Manrope, Space_Grotesk } from 'next/font/google';

/**
 * Space Grotesk 500/700 (Logo-Handoff README §2): nur noch Lockups der Produktfamilie (LD Flow., LD Nova. …),
 * selbst gehostet via next/font, swap + metrik-angepasster Fallback gegen CLS. Ohne Preload — die Site-Seiten
 * brauchen sie nicht mehr, geladen wird sie erst, wo ein Produkt-Lockup steht.
 */
export const spaceGrotesk = Space_Grotesk({
  subsets: ['latin'],
  weight: ['500', '700'],
  display: 'swap',
  preload: false,
  fallback: ['system-ui', 'sans-serif'],
  variable: '--loona-font-space-grotesk',
});

/** Manrope 500/800 — Wortmarke „loona! designs“ (Brand-System 2026-10, README „Wortmarke“). */
export const manrope = Manrope({
  subsets: ['latin'],
  weight: ['500', '800'],
  display: 'swap',
  fallback: ['system-ui', 'sans-serif'],
  variable: '--loona-font-manrope',
});
