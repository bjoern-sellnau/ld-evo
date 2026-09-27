import { ProjectCard, mono } from '@/site/cards/ProjectCard';
import { useContent } from '@/site/content/ContentProvider';
import { EText } from '@/site/cms/editing';
import { useSite } from '@/site/settings/SiteProvider';
import { defineWidget, relations, segment, text } from './define';

function Cards({ ids, cols }: { ids: string[]; cols: string }) {
  const { projects } = useContent();
  const { mob } = useSite();
  const items = ids.map((id) => projects.find((p) => p.id === id)).filter((p) => !!p);
  return (
    <div style={{ display: 'grid', gridTemplateColumns: mob ? '1fr' : `repeat(${cols === '3' ? 3 : 2},1fr)`, gap: 14 }}>
      {items.map((p) => (
        <ProjectCard key={p.id} p={p} prefix="c-" variant="grid" />
      ))}
    </div>
  );
}

export default defineWidget({
  id: 'projects',
  label: 'Projekt-Karten',
  icon: '◧',
  group: 'Inhalte',
  fields: { title: text({ label: 'Überschrift', max: 80, inline: true }), ids: relations('projects', { label: 'Projekte' }) },
  controls: {
    cols: segment(
      [
        ['2', '2 Spalten'],
        ['3', '3 Spalten'],
      ],
      { label: 'Spalten' },
    ),
  },
  render: ({ title, ids, path, accent, controls }) => (
    <div>
      {title !== undefined && (
        <h2 style={{ fontFamily: mono, fontSize: 10.5, fontWeight: 400, letterSpacing: '0.18em', color: accent, margin: '0 0 16px' }}>
          <EText path={`${path}.title`} value={title} />
        </h2>
      )}
      <Cards ids={ids ?? []} cols={controls.cols} />
    </div>
  ),
});
