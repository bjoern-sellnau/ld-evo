import { Team } from '@/site/blocks/Structure';
import { defineWidget, link, list, media, text, textarea } from './define';

export default defineWidget({
  id: 'team',
  label: 'Team / Rollen',
  icon: '☺',
  group: 'Struktur',
  description: 'Beteiligte mit Foto (sonst Initialen), Rolle, kurzem Text und optionalem Link.',
  fields: {
    items: list(
      {
        name: text({ label: 'Name', max: 60, inline: true }),
        role: text({ label: 'Rolle', max: 60, inline: true }),
        photo: media({ label: 'Foto' }),
        text: textarea({ label: 'Text', max: 400, inline: true }),
        href: link({ label: 'Link (optional)' }),
      },
      { label: 'Personen', itemLabel: 'Person' },
    ),
  },
  render: ({ items, path, accent }) => <Team items={items ?? []} path={path} accent={accent} />,
});
