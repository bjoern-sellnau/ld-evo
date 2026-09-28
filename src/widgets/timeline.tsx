import { EText } from '@/site/cms/editing';
import { mono } from '@/site/cards/ProjectCard';
import { defineWidget, list, text, textarea } from './define';

export default defineWidget({
  id: 'timeline',
  label: 'Zeitleiste',
  icon: '┆',
  group: 'Inhalte',
  description: 'Senkrechte Zeitleiste mit Datum, Titel und Text (semantisch als geordnete Liste).',
  fields: {
    items: list(
      {
        date: text({ label: 'Datum / Zeitraum', max: 40, inline: true }),
        title: text({ label: 'Titel', max: 120, inline: true }),
        text: textarea({ label: 'Text', max: 1200, inline: true }),
      },
      { label: 'Einträge', itemLabel: 'Eintrag' },
    ),
  },
  render: ({ items, path, accent }) => (
    <ol style={{ listStyle: 'none', margin: 0, padding: 0, position: 'relative' }}>
      {(items ?? []).map((it, i, all) => (
        <li key={i} style={{ position: 'relative', paddingLeft: 30, paddingBottom: i === all.length - 1 ? 0 : 26 }}>
          {/* Linie + Punkt — rein dekorativ */}
          {i < all.length - 1 && (
            <span aria-hidden style={{ position: 'absolute', left: 5, top: 16, bottom: 0, width: 2, background: 'var(--hair)' }} />
          )}
          <span
            aria-hidden
            style={{
              position: 'absolute',
              left: 0,
              top: 5,
              width: 12,
              height: 12,
              borderRadius: '50%',
              background: accent,
              boxShadow: '0 0 0 4px var(--bg)',
            }}
          />
          <div style={{ fontFamily: mono, fontSize: 10.5, letterSpacing: '0.12em', color: accent }}>
            <EText path={`${path}.items.${i}.date`} value={it.date} />
          </div>
          <h3 style={{ margin: '4px 0 0', fontSize: 17, fontWeight: 700, color: 'var(--ink)' }}>
            <EText path={`${path}.items.${i}.title`} value={it.title} />
          </h3>
          <p style={{ margin: '6px 0 0', fontSize: 14.5, lineHeight: 1.7, color: 'var(--muted)', whiteSpace: 'pre-line' }}>
            <EText path={`${path}.items.${i}.text`} value={it.text} multiline />
          </p>
        </li>
      ))}
    </ol>
  ),
});
