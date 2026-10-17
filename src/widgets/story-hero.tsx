import { StoryHero } from '@/site/story/Story';
import { color, defineWidget, strings, text, textarea } from './define';

export default defineWidget({
  id: 'story-hero',
  label: 'Story: Auftakt',
  icon: '✺',
  group: 'Story',
  description:
    'Bildschirmfüllender Einstieg mit Riesen-Titel, Verlaufszeile, Leuchten und Scroll-Hinweis — zieht sich beim Scrollen zurück. Enthält die Seitenüberschrift (h1), daher einmal pro Story.',
  fields: {
    kicker: text({ label: 'Kicker', max: 80, inline: true }),
    title: text({ label: 'Titel', max: 80, inline: true, required: true }),
    title2: text({ label: 'Titel Zeile 2 (Verlauf)', max: 80, inline: true }),
    text: textarea({ label: 'Text', max: 600, inline: true }),
    chips: strings({ label: 'Stichworte', max: 12 }),
    cue: text({ label: 'Scroll-Hinweis', max: 40, inline: true, help: 'z. B. „Scrollen“ — leer = ausgeblendet' }),
    c1: color({ label: 'Farbe 1' }),
    c2: color({ label: 'Farbe 2' }),
    c3: color({ label: 'Farbe 3' }),
  },
  render: (p) => <StoryHero {...p} />,
});
