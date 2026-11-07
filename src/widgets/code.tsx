import { CodeBlock } from '@/site/blocks/Tech';
import { choice, defineWidget, text, textarea, toggle } from './define';

export default defineWidget({
  id: 'code',
  label: 'Code',
  icon: '</>',
  group: 'Design & Technik',
  description: 'Codeausschnitt mit Hervorhebung, Dateiname und Kopieren-Knopf.',
  fields: {
    filename: text({ label: 'Dateiname', max: 80, inline: true }),
    lang: choice(
      [
        ['ts', 'TypeScript'],
        ['tsx', 'TSX'],
        ['js', 'JavaScript'],
        ['css', 'CSS'],
        ['html', 'HTML'],
        ['json', 'JSON'],
        ['bash', 'Shell'],
        ['text', 'Text'],
      ],
      { label: 'Sprache' },
    ),
    code: textarea({ label: 'Code', max: 6000 }),
    caption: text({ label: 'Bildunterschrift', max: 200, inline: true }),
  },
  controls: { numbers: toggle('Zeilennummern', { default: true }) },
  render: ({ filename, lang, code, caption, controls, path }) => (
    <CodeBlock code={code} lang={lang ?? 'text'} filename={filename} caption={caption} numbers={controls.numbers} path={path} />
  ),
});
