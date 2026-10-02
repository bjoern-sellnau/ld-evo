import { EText } from '@/site/cms/editing';
import { mono } from '@/site/cards/ProjectCard';
import { defineWidget, segment, text, textarea } from './define';

export default defineWidget({
  id: 'quote',
  label: 'Zitat',
  icon: '“',
  group: 'Text',
  fields: { text: textarea({ label: 'Zitat', max: 600, inline: true }), by: text({ label: 'Quelle', max: 120, inline: true }) },
  controls: {
    style: segment(
      [
        ['karte', 'Karte'],
        ['gross', 'Groß'],
      ],
      { label: 'Stil' },
    ),
  },
  render: ({ text: t, by, path, controls, accent }) => (
    <blockquote
      style={
        controls.style === 'gross'
          ? {
              margin: '12px 0',
              textAlign: 'center',
              fontSize: 26,
              lineHeight: 1.35,
              fontWeight: 600,
              fontStyle: 'italic',
              color: 'var(--ink)',
            }
          : {
              margin: 0,
              padding: '22px 26px',
              borderRadius: 18,
              background: 'var(--card)',
              border: '1px solid var(--border)',
              fontSize: 19,
              lineHeight: 1.55,
              fontStyle: 'italic',
              color: 'var(--ink)',
            }
      }
    >
      „<EText path={`${path}.text`} value={t} multiline />“
      {by !== undefined && (
        <footer
          style={{
            fontFamily: mono,
            fontSize: 10.5,
            fontStyle: 'normal',
            color: controls.style === 'gross' ? accent : 'var(--soft)',
            marginTop: 10,
          }}
        >
          — <EText path={`${path}.by`} value={by} />
        </footer>
      )}
    </blockquote>
  ),
});
