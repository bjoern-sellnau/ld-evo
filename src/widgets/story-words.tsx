import { StoryWords } from '@/site/story/Story';
import { defineWidget, text, textarea } from './define';

export default defineWidget({
  id: 'story-words',
  label: 'Story: Wort für Wort',
  icon: '❝',
  group: 'Story',
  description: 'Großer Satz, der sich beim Scrollen Wort für Wort einfärbt — für Haltung und Botschaft.',
  fields: {
    kicker: text({ label: 'Kicker', max: 80, inline: true }),
    text: textarea({ label: 'Satz', max: 400, required: true }),
  },
  render: (p) => <StoryWords {...p} />,
});
