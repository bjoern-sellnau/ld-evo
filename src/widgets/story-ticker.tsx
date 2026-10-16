import { StoryTicker } from '@/site/story/Story';
import { defineWidget, segment, strings, toggle } from './define';

export default defineWidget({
  id: 'story-ticker',
  label: 'Story: Laufband',
  icon: '⇢',
  group: 'Story',
  description: 'Endlos laufende Stichworte als Pillen oder riesige Schrift; pausiert beim Darüberfahren.',
  fields: { items: strings({ label: 'Einträge', max: 24 }) },
  controls: {
    look: segment(
      [
        ['pillen', 'Pillen'],
        ['gross', 'Groß'],
      ],
      { label: 'Stil' },
    ),
    speed: segment(
      [
        ['langsam', 'Langsam'],
        ['mittel', 'Mittel'],
        ['schnell', 'Schnell'],
      ],
      { label: 'Tempo', default: 'mittel' },
    ),
    reverse: toggle('Rückwärts'),
  },
  render: ({ items, controls }) => (
    <StoryTicker items={items ?? []} look={controls.look} speed={controls.speed} reverse={controls.reverse} />
  ),
});
