import { EText } from '@/site/cms/editing';
import { mono } from '@/site/cards/ProjectCard';
import { defineWidget, text } from './define';

export default defineWidget({
  id: 'chapter',
  label: 'Kapitel-Kopf',
  icon: '§',
  group: 'Text',
  description: '„01 DIE AUSGANGSLAGE“ — wie auf den Projektseiten.',
  fields: { n: text({ label: 'Nummer', max: 4, help: 'z. B. 01' }), label: text({ label: 'Titel', max: 80, inline: true }) },
  render: ({ n, label, path, accent }) => (
    <h2 style={{ display: 'flex', gap: 14, alignItems: 'baseline', margin: '20px 0 0', fontWeight: 400 }}>
      <span style={{ fontFamily: mono, fontSize: 11, color: 'var(--soft)' }}>{n}</span>
      <span style={{ fontFamily: mono, fontSize: 10.5, letterSpacing: '0.18em', color: accent, textTransform: 'uppercase' }}>
        <EText path={`${path}.label`} value={label} />
      </span>
    </h2>
  ),
});
