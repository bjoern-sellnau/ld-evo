import { Facts } from '@/site/blocks/Data';
import { defineWidget, link, list, text } from './define';

export default defineWidget({
  id: 'facts',
  label: 'Steckbrief',
  icon: '☰',
  group: 'Daten',
  description: 'Eckdaten als Raster (Kunde, Rolle, Zeitraum, Team …), Werte optional verlinkt.',
  fields: {
    items: list(
      {
        label: text({ label: 'Bezeichnung', max: 40, inline: true }),
        value: text({ label: 'Wert', max: 120, inline: true }),
        href: link({ label: 'Link (optional)' }),
      },
      { label: 'Eckdaten', itemLabel: 'Eintrag' },
    ),
  },
  render: ({ items, path, accent }) => <Facts items={items ?? []} path={path} accent={accent} />,
});
