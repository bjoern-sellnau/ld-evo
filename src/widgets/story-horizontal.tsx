import { StoryHorizontal } from '@/site/story/Story';
import { color, defineWidget, list, text, textarea } from './define';

export default defineWidget({
  id: 'story-horizontal',
  label: 'Story: Seitwärts',
  icon: '⇆',
  group: 'Story',
  description: 'Beim Runterscrollen fahren die Karten seitlich durchs Bild (Desktop); mobil und ohne Animationen wischbar.',
  fields: {
    items: list(
      {
        icon: text({ label: 'Symbol', max: 4 }),
        kicker: text({ label: 'Kicker', max: 40 }),
        title: text({ label: 'Titel', max: 80 }),
        text: textarea({ label: 'Text', max: 400 }),
        color: color({ label: 'Farbe' }),
      },
      { label: 'Karten', itemLabel: 'Karte' },
    ),
  },
  render: ({ items, path }) => <StoryHorizontal items={items ?? []} path={path} />,
});
