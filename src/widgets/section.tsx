import { defineWidget, segment, slot } from './define';

const BG: Record<string, React.CSSProperties> = {
  keiner: {},
  karte: { background: 'var(--card)', border: '1px solid var(--border)' },
  akzent: {
    background: 'color-mix(in srgb, var(--accent) 14%, transparent)',
    border: '1px solid color-mix(in srgb, var(--accent) 30%, transparent)',
  },
  glas: { background: 'var(--glass)', border: '1px solid var(--glassbrd)', backdropFilter: 'blur(16px)' },
};

export default defineWidget({
  id: 'section',
  label: 'Abschnitt',
  icon: '▭',
  group: 'Layout',
  description: 'Container mit Hintergrund und Innenabstand für beliebige Widgets.',
  controls: {
    bg: segment(
      [
        ['keiner', 'Ohne'],
        ['karte', 'Karte'],
        ['akzent', 'Akzent'],
        ['glas', 'Glas'],
      ],
      { label: 'Hintergrund' },
    ),
    pad: segment(
      [
        ['s', 'S'],
        ['m', 'M'],
        ['l', 'L'],
      ],
      { label: 'Abstand', default: 'm' },
    ),
  },
  slots: { inhalt: slot('*', { label: 'Inhalt' }) },
  render: ({ controls, slots }) => (
    <div style={{ ...BG[controls.bg], borderRadius: 22, padding: controls.bg === 'keiner' ? 0 : { s: 16, m: 28, l: 44 }[controls.pad] }}>
      {slots.inhalt}
    </div>
  ),
});
