import { Callout } from '@/site/blocks/Structure';
import { defineWidget, segment, text, textarea } from './define';

export default defineWidget({
  id: 'callout',
  label: 'Hinweis',
  icon: 'ⓘ',
  group: 'Struktur',
  description: 'Hervorgehobene Box für Info, Tipp, Warnung oder Erfolg — die Art steht immer auch als Wort da.',
  fields: {
    title: text({ label: 'Titel', max: 120, inline: true }),
    text: textarea({ label: 'Text', max: 1200, inline: true }),
  },
  controls: {
    kind: segment(
      [
        ['info', 'Info'],
        ['tipp', 'Tipp'],
        ['warnung', 'Warnung'],
        ['erfolg', 'Erfolg'],
      ],
      { label: 'Art' },
    ),
  },
  render: ({ title, text, controls, path }) => <Callout kind={controls.kind} title={title} text={text} path={path} />,
});
