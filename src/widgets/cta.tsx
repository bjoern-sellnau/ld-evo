import Link from 'next/link';
import { EText } from '@/site/cms/editing';
import detailStyles from '@/site/pages/detail.module.css';
import { defineWidget, link, segment, text } from './define';

export default defineWidget({
  id: 'cta',
  label: 'Button',
  icon: '➜',
  group: 'Aktion',
  fields: { label: text({ label: 'Beschriftung', max: 60, required: true, inline: true }), href: link({ label: 'Ziel', required: true }) },
  controls: {
    variant: segment(
      [
        ['akzent', 'Akzent'],
        ['kontur', 'Kontur'],
      ],
      { label: 'Stil' },
    ),
    align: segment(
      [
        ['links', 'Links'],
        ['mitte', 'Mitte'],
      ],
      { label: 'Ausrichtung' },
    ),
  },
  render: ({ label, href, path, controls }) => (
    <div style={{ textAlign: controls.align === 'mitte' ? 'center' : 'left' }}>
      <Link
        href={href || '#'}
        className={detailStyles.pill}
        style={
          controls.variant === 'kontur'
            ? { background: 'transparent', color: 'var(--ink)', border: '1px solid var(--border)' }
            : { background: 'var(--accent)', color: 'var(--on-accent)' }
        }
      >
        <EText path={`${path}.label`} value={label} />
      </Link>
    </div>
  ),
});
