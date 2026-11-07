import { KpiCompare } from '@/site/blocks/Data';
import { choice, defineWidget, list, number, text } from './define';

export default defineWidget({
  id: 'kpi',
  label: 'KPI-Vergleich',
  icon: '⇅',
  group: 'Daten',
  description: 'Vorher-/Nachher-Werte mit Veränderung in Prozent — „besser“ oder „schlechter“ steht immer als Wort dabei.',
  fields: {
    items: list(
      {
        label: text({ label: 'Kennzahl', max: 60, inline: true }),
        before: number({ label: 'Vorher' }),
        after: number({ label: 'Nachher' }),
        unit: text({ label: 'Einheit', max: 12 }),
        better: choice(
          [
            ['hoch', 'Höher ist besser'],
            ['niedrig', 'Niedriger ist besser'],
          ],
          { label: 'Richtung' },
        ),
      },
      { label: 'Kennzahlen', itemLabel: 'Kennzahl' },
    ),
  },
  render: ({ items, path, accent }) => <KpiCompare items={items ?? []} path={path} accent={accent} />,
});
