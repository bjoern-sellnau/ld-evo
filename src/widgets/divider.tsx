import { Divider } from '@/site/blocks/Structure';
import { defineWidget, segment } from './define';

export default defineWidget({
  id: 'divider',
  label: 'Trenner',
  icon: '—',
  group: 'Struktur',
  description: 'Linie, Punkte, Slash-Band, das loona-Zeichen oder nur Abstand.',
  controls: {
    look: segment(
      [
        ['linie', 'Linie'],
        ['punkte', 'Punkte'],
        ['slash', 'Slash'],
        ['zeichen', 'Zeichen'],
        ['leer', 'Nur Abstand'],
      ],
      { label: 'Aussehen' },
    ),
    size: segment(
      [
        ['s', 'S'],
        ['m', 'M'],
        ['l', 'L'],
      ],
      { label: 'Abstand', default: 'm' },
    ),
  },
  render: ({ controls, accent }) => <Divider look={controls.look} size={controls.size} accent={accent} />,
});
