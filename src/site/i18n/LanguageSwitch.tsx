'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import type { CSSProperties } from 'react';
import { useLocale } from './LocaleProvider';
import { switchLocalePath, type Locale } from './locale';

/** Name der Sprache in ihrer eigenen Sprache (so findet man die eigene Sprache immer). */
export const LANGUAGE_NAME: Record<Locale, string> = { de: 'Deutsch', en: 'English' };

/**
 * Link auf dieselbe Seite in der anderen Sprache (Routentabelle, src/site/i18n/locale.ts). Die Sprachen haben
 * getrennte Root-Layouts (<html lang>) — Next lädt beim Wechsel die Seite neu. Beschriftung in der Zielsprache,
 * mit passendem lang/hreflang (WCAG 3.1.2).
 */
export function LanguageSwitch({
  variant = 'link',
  className,
  style,
}: {
  variant?: 'link' | 'mono';
  className?: string;
  style?: CSSProperties;
}) {
  const locale = useLocale();
  const pathname = usePathname();
  const to: Locale = locale === 'de' ? 'en' : 'de';
  return (
    <Link
      href={switchLocalePath(pathname, to)}
      hrefLang={to}
      lang={to}
      className={className}
      style={{ color: 'inherit', ...(variant === 'mono' ? { textDecoration: 'none' } : {}), ...style }}
    >
      {variant === 'mono' ? to.toUpperCase() : LANGUAGE_NAME[to]}
    </Link>
  );
}
