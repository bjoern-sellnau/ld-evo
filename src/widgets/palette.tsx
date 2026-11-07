import { Palette } from '@/site/blocks/Tech';
import { color, defineWidget, list, text } from './define';

export default defineWidget({
  id: 'palette',
  label: 'Farbpalette',
  icon: '◐',
  group: 'Design & Technik',
  description: 'Farbfelder mit Hex-Wert zum Kopieren und Kontrast gegen Weiß/Schwarz (WCAG).',
  fields: {
    items: list(
      {
        name: text({ label: 'Name', max: 40, inline: true }),
        hex: color({ label: 'Farbe' }),
        note: text({ label: 'Verwendung', max: 120, inline: true }),
      },
      { label: 'Farben', itemLabel: 'Farbe' },
    ),
  },
  render: ({ items, path }) => <Palette items={items ?? []} path={path} />,
});
