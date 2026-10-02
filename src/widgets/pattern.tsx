import { useContent } from '@/site/content/ContentProvider';
import { NoEdit } from '@/site/cms/editing';
import { PatternScope, WidgetList, type Block } from '@/site/cms/Widgets';
import { mono } from '@/site/cards/ProjectCard';
import { defineWidget, text } from './define';

function PatternRef({ id }: { id?: string }) {
  const { patterns } = useContent();
  const p = patterns.find((x) => x.id === id);
  if (!p) return <Note text={`VORLAGE „${id ?? ''}“ NICHT GEFUNDEN`} />;
  // Globale Vorlagen werden in „Vorlagen“ bearbeitet — hier nur angezeigt.
  return (
    <PatternScope id={p.id} fallback={<Note text="VORLAGE VERWEIST AUF SICH SELBST" />}>
      <NoEdit>
        <WidgetList blocks={p.blocks as Block[]} path={`__pattern.${p.id}`} />
      </NoEdit>
    </PatternScope>
  );
}

function Note({ text }: { text: string }) {
  return (
    <div
      style={{ fontFamily: mono, fontSize: 10, color: 'var(--soft)', padding: 12, border: '1px dashed var(--border)', borderRadius: 12 }}
    >
      {text}
    </div>
  );
}

export default defineWidget({
  id: 'pattern',
  label: 'Globale Vorlage',
  icon: '🔗',
  group: 'Layout',
  description: 'Verweis auf eine globale Vorlage — Änderungen an der Vorlage wirken auf allen Seiten.',
  fields: { ref: text({ label: 'Vorlage (Kennung)', max: 64, help: 'Kennung aus „Vorlagen“' }) },
  render: ({ ref }) => <PatternRef id={ref} />,
});
