import { EText } from '@/site/cms/editing';
import { TabsView } from '@/site/widgets/Tabs';
import { defineWidget, list, text, textarea } from './define';

export default defineWidget({
  id: 'tabs',
  label: 'Tabs',
  icon: '⊟',
  group: 'Layout',
  description: 'Inhalte in Reitern (Pfeiltasten wechseln, barrierefrei nach WAI-ARIA).',
  fields: {
    items: list(
      { label: text({ label: 'Reiter', max: 40, inline: true }), text: textarea({ label: 'Inhalt', max: 4000, inline: true }) },
      { label: 'Reiter', itemLabel: 'Reiter' },
    ),
  },
  render: ({ items, path, accent }) => (
    <TabsView
      accent={accent}
      tabs={(items ?? []).map((it, i) => ({
        label: <EText path={`${path}.items.${i}.label`} value={it.label} />,
        panel: (
          <p style={{ margin: 0, fontSize: 15, lineHeight: 1.75, color: 'var(--muted)', whiteSpace: 'pre-line' }}>
            <EText path={`${path}.items.${i}.text`} value={it.text} multiline />
          </p>
        ),
      }))}
    />
  ),
});
