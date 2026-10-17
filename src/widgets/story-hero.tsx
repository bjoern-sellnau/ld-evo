import { StoryHero } from '@/site/story/Story';
import { DEVICE_OPTIONS, SCREEN_OPTIONS } from '@/site/story/options';
import { choice, color, defineWidget, media, segment, strings, text, textarea } from './define';

export default defineWidget({
  id: 'story-hero',
  label: 'Story: Auftakt',
  icon: '✺',
  group: 'Story',
  description:
    'Bildschirmfüllender Einstieg mit Riesen-Titel, Leuchten und Scroll-Hinweis — zieht sich beim Scrollen zurück. Stile: Verlauf, Zentriert, Mit Gerät (Text + App-Screen), Bühne (Farbfläche). Enthält die Seitenüberschrift (h1), daher einmal pro Story.',
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
    device: choice(DEVICE_OPTIONS, { label: 'Gerät (Stil „Mit Gerät“)' }),
    screen: choice(SCREEN_OPTIONS, { label: 'Screen (Stil „Mit Gerät“)' }),
    screenTitle: text({ label: 'Screen-Titel', max: 30 }),
    rows: strings({ label: 'Zeilen („Beschriftung | Wert | Zusatz“)', max: 10 }),
    image: media({ label: 'Eigener Screenshot (ersetzt den Screen)' }),
  },
  controls: {
    layout: segment(
      [
        ['verlauf', 'Verlauf'],
        ['zentriert', 'Zentriert'],
        ['geraet', 'Mit Gerät'],
        ['buehne', 'Bühne (Farbfläche)'],
      ],
      { label: 'Stil' },
    ),
  },
  render: ({ device, screen, screenTitle, rows, image, controls, ...p }) => (
    <StoryHero {...p} layout={controls.layout} device={device} screen={{ screen, screenTitle, rows, image }} />
  ),
});
