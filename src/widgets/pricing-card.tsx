import { EText } from '@/site/cms/editing';
import { mono } from '@/site/cards/ProjectCard';
import detailStyles from '@/site/pages/detail.module.css';
import { defineWidget, link, segment, strings, text, toggle } from './define';
import { LocalLink } from '@/site/i18n/LocalLink';

/** Beispiel-Widget aus dem Guide: Felder + Controls + Inline-Editing in einer Datei. */
export default defineWidget({
  id: 'pricing-card',
  label: 'Preiskarte',
  icon: '€',
  group: 'Aktion',
  description: 'Angebot mit Preis, Leistungen und Button.',
  fields: {
    title: text({ label: 'Titel', max: 60, inline: true }),
    price: text({ label: 'Preis', max: 16, inline: true, help: 'z. B. ab 1.200 €' }),
    note: text({ label: 'Hinweis', max: 80, inline: true }),
    features: strings({ label: 'Leistungen', max: 12 }),
    ctaLabel: text({ label: 'Button-Text', max: 40, inline: true }),
    cta: link({ label: 'Button-Ziel' }),
  },
  controls: {
    variant: segment(
      [
        ['hell', 'Hell'],
        ['dunkel', 'Dunkel'],
        ['akzent', 'Akzent'],
      ],
      { label: 'Variante' },
    ),
    highlight: toggle('Hervorheben'),
  },
  render: ({ title, price, note, features, ctaLabel, cta, path, controls, accent }) => {
    const dark = controls.variant === 'dunkel';
    const acc = controls.variant === 'akzent';
    const ink = dark ? '#F2F5FA' : acc ? 'var(--on-accent)' : 'var(--ink)';
    return (
      <div
        style={{
          position: 'relative',
          borderRadius: 22,
          padding: 26,
          color: ink,
          background: dark ? '#0B1322' : acc ? 'var(--accent)' : 'var(--card)',
          border: `1px solid ${controls.highlight ? accent : 'var(--border)'}`,
          boxShadow: controls.highlight
            ? `0 0 0 3px color-mix(in srgb, ${accent} 25%, transparent), 0 18px 40px -16px ${accent}`
            : undefined,
        }}
      >
        <div style={{ fontFamily: mono, fontSize: 10.5, letterSpacing: '0.16em', opacity: 0.8, textTransform: 'uppercase' }}>
          <EText path={`${path}.title`} value={title} />
        </div>
        <div style={{ fontSize: 36, fontWeight: 800, letterSpacing: '-0.03em', marginTop: 10 }}>
          <EText path={`${path}.price`} value={price} />
        </div>
        {note !== undefined && (
          <div style={{ fontSize: 13, opacity: 0.75, marginTop: 4 }}>
            <EText path={`${path}.note`} value={note} />
          </div>
        )}
        <ul style={{ listStyle: 'none', padding: 0, margin: '18px 0 0', display: 'grid', gap: 8, fontSize: 14.5 }}>
          {(features ?? []).map((f) => (
            <li key={f} style={{ display: 'flex', gap: 10 }}>
              <span aria-hidden style={{ color: acc ? ink : accent }}>
                ✓
              </span>
              {f}
            </li>
          ))}
        </ul>
        {cta && (
          <LocalLink
            href={cta}
            className={detailStyles.pill}
            style={{
              marginTop: 22,
              background: acc ? 'var(--on-accent)' : 'var(--accent)',
              color: acc ? 'var(--accent)' : 'var(--on-accent)',
            }}
          >
            <EText path={`${path}.ctaLabel`} value={ctaLabel ?? 'Anfragen'} />
          </LocalLink>
        )}
      </div>
    );
  },
});
