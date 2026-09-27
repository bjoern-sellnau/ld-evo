import { EText } from '@/site/cms/editing';
import { mono } from '@/site/cards/ProjectCard';
import { Placeholder } from './image';
import { defineWidget, media, segment, text, toggle } from './define';

export default defineWidget({
  id: 'video',
  label: 'Video',
  icon: '▶',
  group: 'Medien',
  description: 'Eigenes Video (MP4/WebM aus der Mediathek) — kein Tracking durch Drittanbieter.',
  fields: {
    video: media({ label: 'Video' }),
    poster: media({ label: 'Vorschaubild' }),
    caption: text({ label: 'Bildunterschrift', max: 200, inline: true }),
  },
  controls: {
    mode: segment(
      [
        ['player', 'Player'],
        ['loop', 'Loop stumm'],
      ],
      { label: 'Modus' },
    ),
    ratio: segment(
      [
        ['16-9', '16:9'],
        ['4-3', '4:3'],
        ['1-1', '1:1'],
      ],
      { label: 'Format' },
    ),
    round: toggle('Abgerundet', { default: true }),
  },
  render: ({ video, poster, caption, path, controls }) =>
    video ? (
      <figure style={{ margin: 0 }}>
        <video
          src={video.src}
          poster={poster?.src}
          aria-label={video.alt || caption || 'Video'}
          controls={controls.mode === 'player'}
          autoPlay={controls.mode === 'loop'}
          muted={controls.mode === 'loop'}
          loop={controls.mode === 'loop'}
          playsInline
          preload="metadata"
          style={{
            width: '100%',
            display: 'block',
            aspectRatio: controls.ratio.replace('-', ' / '),
            objectFit: 'cover',
            borderRadius: controls.round ? 18 : 0,
            border: '1px solid var(--border)',
            background: '#000',
          }}
        />
        {caption !== undefined && (
          <figcaption style={{ fontFamily: mono, fontSize: 10.5, color: 'var(--soft)', marginTop: 10 }}>
            <EText path={`${path}.caption`} value={caption} />
          </figcaption>
        )}
      </figure>
    ) : (
      <Placeholder label="Video wählen" />
    ),
});
