'use client';

import Link from 'next/link';
import type { ComponentProps } from 'react';
import { useHref } from './LocaleProvider';

/**
 * next/link mit kanonischem (deutschem) Pfad — wird in die Adresse der aktuellen Sprache übersetzt
 * ('/impressum' → '/en/imprint'). Externe Links und Anker bleiben unverändert. Für Widgets und Inhalte aus LD Flow,
 * die Pfade immer kanonisch speichern.
 */
export function LocalLink({ href, ...rest }: Omit<ComponentProps<typeof Link>, 'href'> & { href: string }) {
  const h = useHref();
  return <Link href={h(href)} {...rest} />;
}
