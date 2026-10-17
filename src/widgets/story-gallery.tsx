import { StoryGallery } from '@/site/story/Gallery';
import { DEVICE_OPTIONS, SCREEN_OPTIONS } from '@/site/story/options';
import { choice, color, defineWidget, list, media, segment, strings, text, textarea } from './define';

export default defineWidget({
  id: 'story-gallery',
  label: 'Story: App-Galerie',
  icon: '▦',
  group: 'Story',
  description:
    'Alle Ausführungen einer App auf einen Blick — Desktop, Telefon, Browser, Erweiterungen (Chrome, Safari, Seitenleiste). Als Register mit Umschalter oder als Raster.',
  fields: {
    kicker: text({ label: 'Kicker', max: 80, inline: true }),
    title: text({ label: 'Titel', max: 120, inline: true }),
    text: textarea({ label: 'Text', max: 600, inline: true }),
    color: color({ label: 'App-Farbe' }),
    items: list(
      {
        label: text({ label: 'Name (Register)', max: 40 }),
        device: choice(DEVICE_OPTIONS, { label: 'Gerät' }),
        screen: choice(SCREEN_OPTIONS, { label: 'Screen' }),
        screenTitle: text({ label: 'Screen-Titel', max: 30 }),
        rows: strings({ label: 'Zeilen („Beschriftung | Wert | Zusatz“)', max: 10 }),
        image: media({ label: 'Eigener Screenshot (ersetzt den Screen)' }),
        caption: textarea({ label: 'Bildunterschrift', max: 300 }),
      },
      { label: 'Ansichten', itemLabel: 'Ansicht' },
    ),
  },
  controls: {
    layout: segment(
      [
        ['register', 'Register'],
        ['raster', 'Raster (alle)'],
      ],
      { label: 'Darstellung' },
    ),
  },
  render: ({ kicker, title, text: t, color: c, items, controls, path }) => (
    <StoryGallery kicker={kicker} title={title} text={t} color={c} items={items ?? []} layout={controls.layout} path={path} />
  ),
});
