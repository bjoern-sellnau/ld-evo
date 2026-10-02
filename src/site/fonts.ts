import { Instrument_Sans, JetBrains_Mono } from 'next/font/google';

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
