import { Space_Grotesk } from 'next/font/google';

/** Space Grotesk 500/700 (README §2), selbst gehostet via next/font, swap + metrik-angepasster Fallback gegen CLS. */
export const spaceGrotesk = Space_Grotesk({
  subsets: ['latin'],
  weight: ['500', '700'],
  display: 'swap',
  fallback: ['system-ui', 'sans-serif'],
  variable: '--loona-font-space-grotesk',
});
