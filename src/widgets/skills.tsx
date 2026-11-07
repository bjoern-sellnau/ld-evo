import { Skills } from '@/site/blocks/Data';
import { defineWidget, list, number, text } from './define';

export default defineWidget({
  id: 'skills',
  label: 'Skills / Anteile',
  icon: '▤',
  group: 'Daten',
  description: 'Fortschrittsbalken 0–100 % mit Bezeichnung, z. B. Anteile am Projekt oder Erfahrung.',
  fields: {
    items: list(
      {
        label: text({ label: 'Bezeichnung', max: 60, inline: true }),
        value: number({ label: 'Wert (%)', min: 0, max: 100 }),
        note: text({ label: 'Anmerkung', max: 120, inline: true }),
      },
      { label: 'Einträge', itemLabel: 'Eintrag' },
    ),
  },
  render: ({ items, path, accent }) => <Skills items={items ?? []} path={path} accent={accent} />,
});
