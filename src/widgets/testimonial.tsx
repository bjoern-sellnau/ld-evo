import { mediaSrcSet } from '@/cms/media';
import { EText } from '@/site/cms/editing';
import { mono } from '@/site/cards/ProjectCard';
import { defineWidget, media, segment, text, textarea } from './define';

export default defineWidget({
  id: 'testimonial',
  label: 'Kundenstimme',
  icon: '❝',
  group: 'Text',
  description: 'Zitat mit Person, Rolle und optionalem Foto.',
  fields: {
    quote: textarea({ label: 'Zitat', max: 800, inline: true }),
    name: text({ label: 'Name', max: 80, inline: true }),
    role: text({ label: 'Rolle / Firma', max: 120, inline: true }),
    photo: media({ label: 'Foto (quadratisch)' }),
  },
  controls: {
    layout: segment(
      [
        ['karte', 'Karte'],
        ['zentriert', 'Zentriert'],
      ],
      { label: 'Layout' },
    ),
  },
  render: ({ quote, name, role, photo, path, controls, accent }) => {
    const center = controls.layout === 'zentriert';
    return (
      <figure
        style={{
          margin: 0,
          padding: center ? '8px 0' : '24px 26px',
          borderRadius: 20,
          background: center ? undefined : 'var(--card)',
          border: center ? undefined : '1px solid var(--border)',
          textAlign: center ? 'center' : 'left',
        }}
      >
        <div aria-hidden style={{ fontSize: 44, lineHeight: 0.6, color: accent, fontWeight: 700, height: 22 }}>
          “
        </div>
        <blockquote
          style={{ margin: '6px 0 0', fontSize: center ? 22 : 18, lineHeight: 1.55, color: 'var(--ink)', whiteSpace: 'pre-line' }}
        >
          <EText path={`${path}.quote`} value={quote} multiline />
        </blockquote>
        <figcaption
          style={{ display: 'flex', alignItems: 'center', gap: 12, marginTop: 18, justifyContent: center ? 'center' : 'flex-start' }}
        >
          {photo?.src && (
            <img
              src={photo.src}
              srcSet={mediaSrcSet(photo.src)}
              sizes="44px"
              alt={photo.alt}
              width={44}
              height={44}
              loading="lazy"
              style={{ borderRadius: '50%', objectFit: 'cover', border: '1px solid var(--border)' }}
            />
          )}
          <span style={{ textAlign: 'left' }}>
            <span style={{ display: 'block', fontWeight: 700, fontSize: 14.5, color: 'var(--ink)' }}>
              <EText path={`${path}.name`} value={name} />
            </span>
            <span
              style={{ display: 'block', fontFamily: mono, fontSize: 10.5, letterSpacing: '0.06em', color: 'var(--soft)', marginTop: 2 }}
            >
              <EText path={`${path}.role`} value={role} />
            </span>
          </span>
        </figcaption>
      </figure>
    );
  },
});
