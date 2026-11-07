import { Chart } from '@/site/blocks/Data';
import { defineWidget, list, number, segment, text } from './define';

export default defineWidget({
  id: 'chart',
  label: 'Diagramm',
  icon: '▥',
  group: 'Daten',
  description: 'Balken-, Säulen- oder Liniendiagramm aus einer Zahlenreihe — mit Tooltip und Tabellenansicht.',
  fields: {
    title: text({ label: 'Titel', max: 120, inline: true }),
    unit: text({ label: 'Einheit', max: 12, help: 'z. B. %, ms, kB' }),
    items: list(
      { label: text({ label: 'Beschriftung', max: 40, inline: true }), value: number({ label: 'Wert' }) },
      { label: 'Werte', itemLabel: 'Wert' },
    ),
    note: text({ label: 'Quelle / Anmerkung', max: 200, inline: true }),
  },
  controls: {
    kind: segment(
      [
        ['balken', 'Balken'],
        ['saeulen', 'Säulen'],
        ['linie', 'Linie'],
      ],
      { label: 'Art' },
    ),
  },
  render: ({ title, unit, items, note, controls, path, accent }) => (
    <Chart title={title} unit={unit} note={note} items={items ?? []} kind={controls.kind} path={path} accent={accent} />
  ),
});
