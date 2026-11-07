import { Hotspots } from '@/site/blocks/Media';
import { defineWidget, list, media, number, text, textarea } from './define';

export default defineWidget({
  id: 'hotspots',
  label: 'Bild mit Markierungen',
  icon: '⊕',
  group: 'Medien',
  description: 'Nummerierte Punkte auf einem Bild (z. B. Screenshot) mit Erklärung — zusätzlich als Liste darunter.',
  fields: {
    image: media({ label: 'Bild' }),
    items: list(
      {
        x: number({ label: 'Position waagerecht (%)', min: 0, max: 100 }),
        y: number({ label: 'Position senkrecht (%)', min: 0, max: 100 }),
        title: text({ label: 'Titel', max: 80, inline: true }),
        text: textarea({ label: 'Text', max: 400, inline: true }),
      },
      { label: 'Markierungen', itemLabel: 'Markierung' },
    ),
    caption: text({ label: 'Bildunterschrift', max: 200, inline: true }),
  },
  render: ({ image, items, caption, path }) => <Hotspots image={image} items={items ?? []} caption={caption} path={path} />,
});
