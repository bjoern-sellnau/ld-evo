import { Mockup } from '@/site/blocks/Media';
import { defineWidget, media, segment, text, toggle } from './define';

export default defineWidget({
  id: 'mockup',
  label: 'Geräte-Mockup',
  icon: '▭',
  group: 'Medien',
  description: 'Screenshot in Browser-, Laptop-, Tablet- oder Telefonrahmen; optional leicht geneigt.',
  fields: {
    image: media({ label: 'Screenshot' }),
    url: text({ label: 'Adresse in der Browserleiste', max: 80, help: 'Nur Anzeige, kein Link' }),
    caption: text({ label: 'Bildunterschrift', max: 200, inline: true }),
  },
  controls: {
    frame: segment(
      [
        ['browser', 'Browser'],
        ['laptop', 'Laptop'],
        ['tablet', 'Tablet'],
        ['phone', 'Telefon'],
      ],
      { label: 'Rahmen' },
    ),
    tilt: toggle('Geneigt'),
  },
  render: ({ image, url, caption, controls, path }) => (
    <Mockup image={image} url={url} caption={caption} frame={controls.frame} tilt={controls.tilt} path={path} />
  ),
});
