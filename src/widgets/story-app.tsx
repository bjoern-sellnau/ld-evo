import { StoryApp } from '@/site/story/Story';
import { SCREEN_OPTIONS } from '@/site/story/options';
import { choice, color, defineWidget, media, segment, strings, text, textarea } from './define';

export default defineWidget({
  id: 'story-app',
  label: 'Story: App-Feature',
  icon: '▯',
  group: 'Story',
  description: 'Gerät mit nachgebautem App-Screen (oder Screenshot) neben Text und Häkchen-Liste; das Gerät schwebt beim Scrollen.',
  fields: {
    kicker: text({ label: 'Kicker', max: 80, inline: true }),
    title: text({ label: 'Titel', max: 120, inline: true }),
    text: textarea({ label: 'Text', max: 800, inline: true }),
    bullets: strings({ label: 'Häkchen-Liste', max: 8 }),
    color: color({ label: 'App-Farbe' }),
    screen: choice(SCREEN_OPTIONS, { label: 'Screen' }),
    screenTitle: text({ label: 'Screen-Titel', max: 30 }),
    rows: strings({ label: 'Zeilen („Beschriftung | Wert | Zusatz“)', max: 10 }),
    image: media({ label: 'Eigener Screenshot (ersetzt den Screen)' }),
  },
  controls: {
    side: segment(
      [
        ['rechts', 'Gerät rechts'],
        ['links', 'Gerät links'],
      ],
      { label: 'Seite' },
    ),
    device: segment(
      [
        ['phone', 'Telefon'],
        ['browser', 'Browser'],
      ],
      { label: 'Gerät' },
    ),
  },
  render: ({ kicker, title, text: t, bullets, color: c, screen, screenTitle, rows, image, controls, path }) => (
    <StoryApp
      kicker={kicker}
      title={title}
      text={t}
      bullets={bullets}
      color={c}
      data={{ screen, screenTitle, rows, image }}
      side={controls.side}
      device={controls.device}
      path={path}
    />
  ),
});
