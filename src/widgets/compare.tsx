import { Compare } from '@/site/blocks/Media';
import { defineWidget, media, segment, text } from './define';

export default defineWidget({
  id: 'compare',
  label: 'Vorher / Nachher',
  icon: '◧',
  group: 'Medien',
  description: 'Zwei Bilder übereinander mit Schieberegler (Maus, Finger, Pfeiltasten) — z. B. alter und neuer Entwurf.',
  fields: {
    before: media({ label: 'Bild „Vorher“' }),
    after: media({ label: 'Bild „Nachher“' }),
    beforeLabel: text({ label: 'Beschriftung links', max: 30, inline: true, help: 'Leer = „Vorher“' }),
    afterLabel: text({ label: 'Beschriftung rechts', max: 30, inline: true, help: 'Leer = „Nachher“' }),
    caption: text({ label: 'Bildunterschrift', max: 200, inline: true }),
  },
  controls: {
    ratio: segment(
      [
        ['16-9', '16:9'],
        ['4-3', '4:3'],
        ['1-1', '1:1'],
        ['21-9', '21:9'],
      ],
      { label: 'Format' },
    ),
  },
  render: ({ before, after, beforeLabel, afterLabel, caption, controls, path }) => (
    <Compare
      before={before}
      after={after}
      beforeLabel={beforeLabel}
      afterLabel={afterLabel}
      caption={caption}
      ratio={controls.ratio}
      path={path}
    />
  ),
});
