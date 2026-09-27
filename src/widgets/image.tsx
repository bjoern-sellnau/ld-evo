import { EText } from '@/site/cms/editing';
import { mono } from '@/site/cards/ProjectCard';
import { defineWidget, media, segment, text } from './define';

export default defineWidget({
  id: 'image',
  label: 'Bild',
  icon: '▣',
  group: 'Medien',
  fields: { image: media({ label: 'Bild' }), caption: text({ label: 'Bildunterschrift', max: 200, inline: true }) },
  controls: {
    corners: segment(
      [
        ['rund', 'Rund'],
        ['eckig', 'Eckig'],
      ],
      { label: 'Ecken' },
    ),
  },
  render: ({ image, caption, path, controls }) =>
    image ? (
      <figure style={{ margin: 0 }}>
        <img
          src={image.src}
          alt={image.alt}
          loading="lazy"
          style={{
            width: '100%',
            display: 'block',
            borderRadius: controls.corners === 'eckig' ? 0 : 18,
            border: '1px solid var(--border)',
          }}
        />
        {caption !== undefined && (
          <figcaption style={{ fontFamily: mono, fontSize: 10.5, color: 'var(--soft)', marginTop: 10 }}>
            <EText path={`${path}.caption`} value={caption} />
          </figcaption>
        )}
      </figure>
    ) : (
      <Placeholder label="Bild wählen" />
    ),
});

export function Placeholder({ label }: { label: string }) {
  return (
    <div
      style={{
        height: 160,
        borderRadius: 18,
        border: '1px dashed var(--border)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        fontFamily: mono,
        fontSize: 10,
        letterSpacing: '0.12em',
        color: 'var(--soft)',
      }}
    >
      {label.toUpperCase()}
    </div>
  );
}
