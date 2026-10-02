import { EText } from '@/site/cms/editing';
import { defineWidget, list, text, textarea, toggle } from './define';

export default defineWidget({
  id: 'faq',
  label: 'FAQ / Akkordeon',
  icon: '☰',
  group: 'Text',
  description: 'Fragen und Antworten zum Aufklappen (natives details/summary, barrierefrei).',
  fields: {
    items: list(
      { q: text({ label: 'Frage', max: 200, inline: true }), a: textarea({ label: 'Antwort', max: 3000, inline: true }) },
      { label: 'Einträge', itemLabel: 'Frage' },
    ),
  },
  controls: { firstOpen: toggle('Erste offen') },
  render: ({ items, path, controls, accent }) => (
    <div style={{ borderTop: '1px solid var(--hair)' }}>
      {(items ?? []).map((it, i) => (
        <details key={i} open={controls.firstOpen && i === 0} style={{ borderBottom: '1px solid var(--hair)', padding: '14px 0' }}>
          <summary
            style={{
              cursor: 'pointer',
              fontSize: 16.5,
              fontWeight: 600,
              color: 'var(--ink)',
              listStyle: 'none',
              display: 'flex',
              justifyContent: 'space-between',
              gap: 12,
            }}
          >
            <EText path={`${path}.items.${i}.q`} value={it.q} />
            <span aria-hidden style={{ color: accent }}>
              +
            </span>
          </summary>
          <p style={{ margin: '10px 0 0', fontSize: 15, lineHeight: 1.7, color: 'var(--muted)', whiteSpace: 'pre-line' }}>
            <EText path={`${path}.items.${i}.a`} value={it.a} multiline />
          </p>
        </details>
      ))}
    </div>
  ),
});
