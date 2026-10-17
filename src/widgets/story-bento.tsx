import { StoryBento } from '@/site/story/Story';
import { SCREEN_OPTIONS } from '@/site/story/options';
import { choice, color, defineWidget, list, strings, text, textarea } from './define';

export default defineWidget({
  id: 'story-bento',
  label: 'Story: Feature-Kacheln',
  icon: '▦',
  group: 'Story',
  description: 'Bento-Raster mit Kacheln in vier Größen, eigener Farbe und optionalem Mini-Screen (bei großen Kacheln).',
  fields: {
    items: list(
      {
        icon: text({ label: 'Symbol', max: 4 }),
        title: text({ label: 'Titel', max: 80 }),
        text: textarea({ label: 'Text', max: 400 }),
        size: choice(
          [
            ['s', 'Klein (1×1)'],
            ['w', 'Breit (2×1)'],
            ['t', 'Hoch (1×2)'],
            ['l', 'Groß (2×2)'],
          ],
          { label: 'Größe' },
        ),
        color: color({ label: 'Farbe' }),
        screen: choice([['keiner', 'Kein Screen'], ...SCREEN_OPTIONS], { label: 'Mini-Screen' }),
        rows: strings({ label: 'Zeilen („Beschriftung | Wert | Zusatz“)', max: 8 }),
      },
      { label: 'Kacheln', itemLabel: 'Kachel' },
    ),
  },
  render: ({ items, path }) => <StoryBento items={items ?? []} path={path} />,
});
