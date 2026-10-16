import { StoryNumbers } from '@/site/story/Story';
import { defineWidget, list, text } from './define';

export default defineWidget({
  id: 'story-numbers',
  label: 'Story: Zahlen',
  icon: '№',
  group: 'Story',
  description: 'Große Kennzahlen, die beim Hereinscrollen hochzählen (z. B. „12.500+“, „99,9 %“).',
  fields: {
    items: list(
      { value: text({ label: 'Wert', max: 16 }), label: text({ label: 'Beschriftung', max: 80 }) },
      { label: 'Zahlen', itemLabel: 'Zahl' },
    ),
  },
  render: ({ items }) => <StoryNumbers items={items ?? []} />,
});
