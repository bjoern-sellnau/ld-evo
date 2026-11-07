import { Split } from '@/site/blocks/Media';
import { defineWidget, list, media, segment, text, textarea } from './define';

export default defineWidget({
  id: 'split',
  label: 'Split-Screen',
  icon: '◫',
  group: 'Medien',
  description: 'Text-Schritte auf einer Seite, das passende Bild bleibt daneben stehen und wechselt beim Scrollen.',
  fields: {
    items: list(
      {
        kicker: text({ label: 'Kicker', max: 40, inline: true }),
        title: text({ label: 'Titel', max: 120, inline: true }),
        text: textarea({ label: 'Text', max: 900, inline: true }),
        image: media({ label: 'Bild' }),
      },
      { label: 'Schritte', itemLabel: 'Schritt' },
    ),
  },
  controls: {
    side: segment(
      [
        ['rechts', 'Bild rechts'],
        ['links', 'Bild links'],
      ],
      { label: 'Bildseite' },
    ),
  },
  render: ({ items, controls, path, accent }) => <Split items={items ?? []} side={controls.side} path={path} accent={accent} />,
});
