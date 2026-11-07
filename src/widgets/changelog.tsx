import { Changelog } from '@/site/blocks/Tech';
import { choice, defineWidget, list, strings, text } from './define';

export default defineWidget({
  id: 'changelog',
  label: 'Changelog',
  icon: '⟳',
  group: 'Design & Technik',
  description: 'Versionen mit Datum, Art (Release, Beta, Fix) und Änderungen.',
  fields: {
    items: list(
      {
        version: text({ label: 'Version', max: 20, inline: true }),
        date: text({ label: 'Datum', max: 30, inline: true }),
        title: text({ label: 'Titel', max: 120, inline: true }),
        kind: choice(
          [
            ['release', 'Release'],
            ['beta', 'Beta'],
            ['fix', 'Fix'],
          ],
          { label: 'Art' },
        ),
        items: strings({ label: 'Änderungen', max: 30 }),
      },
      { label: 'Versionen', itemLabel: 'Version' },
    ),
  },
  render: ({ items, path, accent }) => <Changelog items={items ?? []} path={path} accent={accent} />,
});
