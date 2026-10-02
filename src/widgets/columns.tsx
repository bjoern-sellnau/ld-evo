import { useSite } from '@/site/settings/SiteProvider';
import { defineWidget, segment, slot } from './define';

function Cols({ ratio, gap, a, b, c }: { ratio: string; gap: string; a: React.ReactNode; b: React.ReactNode; c: React.ReactNode }) {
  const { mob } = useSite();
  const tpl = { '1-1': '1fr 1fr', '2-1': '2fr 1fr', '1-2': '1fr 2fr', '1-1-1': '1fr 1fr 1fr' }[ratio] ?? '1fr 1fr';
  const three = ratio === '1-1-1';
  return (
    <div style={{ display: 'grid', gridTemplateColumns: mob ? '1fr' : tpl, gap: gap === 'eng' ? 14 : 28, alignItems: 'start' }}>
      <div>{a}</div>
      <div>{b}</div>
      {three && <div>{c}</div>}
    </div>
  );
}

export default defineWidget({
  id: 'columns',
  label: 'Spalten',
  icon: '▥',
  group: 'Layout',
  description: '2 oder 3 Spalten; mobil untereinander.',
  controls: {
    ratio: segment(
      [
        ['1-1', '½ ½'],
        ['2-1', '⅔ ⅓'],
        ['1-2', '⅓ ⅔'],
        ['1-1-1', '⅓ ⅓ ⅓'],
      ],
      { label: 'Aufteilung' },
    ),
    gap: segment(
      [
        ['normal', 'Normal'],
        ['eng', 'Eng'],
      ],
      { label: 'Abstand' },
    ),
  },
  slots: {
    links: slot('*', { label: 'Spalte 1' }),
    mitte: slot('*', { label: 'Spalte 2' }),
    rechts: slot('*', { label: 'Spalte 3 (nur ⅓ ⅓ ⅓)' }),
  },
  render: ({ controls, slots }) => <Cols ratio={controls.ratio} gap={controls.gap} a={slots.links} b={slots.mitte} c={slots.rechts} />,
});
