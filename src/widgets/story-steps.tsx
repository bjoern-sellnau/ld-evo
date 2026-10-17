import { StorySteps } from '@/site/story/Story';
import { SCREEN_OPTIONS } from '@/site/story/options';
import { choice, color, defineWidget, list, media, segment, strings, text, textarea } from './define';

export default defineWidget({
  id: 'story-steps',
  label: 'Story: Scrollytelling',
  icon: '⇅',
  group: 'Story',
  description: 'Schritte scrollen vorbei, das Gerät bleibt stehen und wechselt passend den Screen. Mobil: Schritt + Gerät untereinander.',
  fields: {
    color: color({ label: 'App-Farbe' }),
    steps: list(
      {
        icon: text({ label: 'Symbol', max: 4, help: 'Emoji oder Zeichen' }),
        title: text({ label: 'Titel', max: 120 }),
        text: textarea({ label: 'Text', max: 600 }),
        screen: choice(SCREEN_OPTIONS, { label: 'Screen' }),
        screenTitle: text({ label: 'Screen-Titel', max: 30 }),
        rows: strings({ label: 'Zeilen („Beschriftung | Wert | Zusatz“)', max: 10 }),
        image: media({ label: 'Eigener Screenshot (ersetzt den Screen)' }),
      },
      { label: 'Schritte', itemLabel: 'Schritt' },
    ),
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
  render: ({ steps, color: c, controls, path }) => (
    <StorySteps steps={steps ?? []} color={c} side={controls.side} device={controls.device} path={path} />
  ),
});
