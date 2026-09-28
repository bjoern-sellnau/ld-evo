import { serializeJsonLd } from './seo';

/**
 * Strukturierte Daten (schema.org). Einzige erlaubte Stelle für <script> mit Inhalten aus dem CMS — der Inhalt ist
 * reines JSON (type="application/ld+json", wird nicht ausgeführt) und über serializeJsonLd escaped.
 */
export function JsonLd({ data }: { data: object }) {
  return <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: serializeJsonLd(data) }} />;
}
