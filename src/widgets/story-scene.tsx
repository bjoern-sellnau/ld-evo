import { StoryScene } from '@/site/story/Story';
import { REVEAL_OPTIONS } from '@/site/story/options';
import { color, defineWidget, segment, slot, text, textarea, toggle } from './define';

export default defineWidget({
  id: 'story-scene',
  label: 'Story: Szene',
  icon: '◩',
  group: 'Story',
  description: 'Kapitel-Fläche mit Farbe/Verlauf, optional bildschirmhoch, mit Einblend-Effekt — beliebige Widgets hinein.',
  fields: {
    kicker: text({ label: 'Kicker', max: 80, inline: true }),
    title: text({ label: 'Titel', max: 120, inline: true }),
    text: textarea({ label: 'Text', max: 800, inline: true }),
    c1: color({ label: 'Farbe 1' }),
    c2: color({ label: 'Farbe 2 (Verlauf)' }),
  },
  controls: {
    bg: segment(
      [
        ['keiner', 'Ohne'],
        ['karte', 'Karte'],
        ['farbe', 'Farbe'],
        ['verlauf', 'Verlauf'],
        ['dunkel', 'Dunkel'],
      ],
      { label: 'Fläche', default: 'karte' },
    ),
    width: segment(
      [
        ['inhalt', 'Inhalt'],
        ['breit', 'Breit'],
        ['voll', 'Voll'],
      ],
      { label: 'Breite', default: 'breit' },
    ),
    height: segment(
      [
        ['auto', 'Auto'],
        ['screen', 'Bildschirm'],
      ],
      { label: 'Höhe' },
    ),
    effect: segment(REVEAL_OPTIONS, { label: 'Einblenden', default: 'hoch' }),
    align: segment(
      [
        ['links', 'Links'],
        ['mitte', 'Mitte'],
      ],
      { label: 'Kopf' },
    ),
    glow: toggle('Leuchten', { default: true }),
  },
  slots: { inhalt: slot('*', { label: 'Inhalt' }) },
  render: ({ controls, slots, ...p }) => (
    <StoryScene
      {...p}
      bg={controls.bg}
      height={controls.height}
      effect={controls.effect}
      align={controls.align}
      glow={controls.glow}
      width={controls.width}
    >
      {slots.inhalt}
    </StoryScene>
  ),
});
