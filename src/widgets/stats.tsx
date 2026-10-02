import { mono } from '@/site/cards/ProjectCard';
import { useSite } from '@/site/settings/SiteProvider';
import { defineWidget, list, text } from './define';

function Stats({ items, accent }: { items: { value?: string; label?: string }[]; accent: string }) {
  const { mob } = useSite();
  return (
    <dl
      style={{
        display: 'grid',
        gridTemplateColumns: mob ? '1fr 1fr' : `repeat(${Math.min(4, Math.max(1, items.length))},1fr)`,
        gap: 1,
        background: 'var(--hair)',
        border: '1px solid var(--hair)',
        borderRadius: 14,
        overflow: 'hidden',
        margin: 0,
      }}
    >
      {items.map((it, k) => (
        <div key={k} style={{ background: 'var(--bg)', padding: '14px 16px' }}>
          <dd style={{ margin: 0, fontFamily: mono, fontWeight: 700, fontSize: 22, color: accent }}>{it.value}</dd>
          <dt style={{ fontFamily: mono, fontSize: 9, letterSpacing: '0.14em', color: 'var(--soft)', marginTop: 5 }}>{it.label}</dt>
        </div>
      ))}
    </dl>
  );
}

export default defineWidget({
  id: 'stats',
  label: 'Kennzahlen',
  icon: '#',
  group: 'Inhalte',
  fields: {
    items: list(
      { value: text({ label: 'Wert', max: 16 }), label: text({ label: 'Beschriftung', max: 60 }) },
      { label: 'Kennzahlen', itemLabel: 'Kennzahl' },
    ),
  },
  render: ({ items, accent }) => <Stats items={items ?? []} accent={accent} />,
});
