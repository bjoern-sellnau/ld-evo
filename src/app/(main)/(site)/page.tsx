import type { Metadata } from 'next';
import { HalloPage } from '@/site/pages/HalloPage';
import { JsonLd } from '@/site/seo/JsonLd';
import { PERSON, SITE_URL, absUrl, alternatesFor } from '@/site/seo/seo';

export const metadata: Metadata = { alternates: alternatesFor('/') };

export default function Page() {
  return (
    <>
      <JsonLd
        data={{
          '@context': 'https://schema.org',
          '@graph': [
            { ...PERSON, '@id': `${SITE_URL}/#person`, url: absUrl('/') },
            { '@type': 'WebSite', name: 'Loona! Designs', url: absUrl('/'), inLanguage: 'de', author: { '@id': `${SITE_URL}/#person` } },
          ],
        }}
      />
      <HalloPage />
    </>
  );
}
