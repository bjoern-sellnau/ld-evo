import { LinkCards } from '@/site/blocks/Structure';
import { choice, defineWidget, link, list, text } from './define';

export default defineWidget({
  id: 'link-cards',
  label: 'Link-Karten',
  icon: '↗',
  group: 'Struktur',
  description: 'Karten für Live-Demo, Download, Code, Doku oder weiterführende Links.',
  fields: {
    items: list(
      {
        title: text({ label: 'Titel', max: 80, inline: true }),
        desc: text({ label: 'Beschreibung', max: 200, inline: true }),
        href: link({ label: 'Link' }),
        kind: choice(
          [
            ['link', 'Link'],
            ['demo', 'Live-Demo'],
            ['download', 'Download'],
            ['code', 'Code'],
            ['doku', 'Doku'],
          ],
          { label: 'Art' },
        ),
      },
      { label: 'Karten', itemLabel: 'Karte' },
    ),
  },
  render: ({ items, path, accent }) => <LinkCards items={items ?? []} path={path} accent={accent} />,
});
