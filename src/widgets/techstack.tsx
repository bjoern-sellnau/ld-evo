import { TechStack } from '@/site/blocks/Tech';
import { defineWidget, list, strings, text } from './define';

export default defineWidget({
  id: 'techstack',
  label: 'Tech-Stack',
  icon: '⧉',
  group: 'Design & Technik',
  description: 'Werkzeuge und Technik nach Bereichen gruppiert (Frontend, Backend, Design …).',
  fields: {
    items: list(
      {
        category: text({ label: 'Bereich', max: 40, inline: true }),
        items: strings({ label: 'Einträge', max: 40 }),
        note: text({ label: 'Anmerkung', max: 160, inline: true }),
      },
      { label: 'Bereiche', itemLabel: 'Bereich' },
    ),
  },
  render: ({ items, path, accent }) => <TechStack items={items ?? []} path={path} accent={accent} />,
});
