import type { ImprintBlock, Segment } from '@content/imprint';
import { isSafeHref } from '@/cms/safe';
import type { ImprintBlockCms } from '@/cms/types';

/** CMS-Block → Darstellungsform des Prototyps (Links im Text als [Text](url), nur sichere Ziele). */
export function toImprintBlock(b: ImprintBlockCms): ImprintBlock {
  if (b.kind === 'h2' || b.kind === 'h3') return { h: b.text, size: b.kind === 'h2' ? 24 : 16 };
  if (b.kind === 'box') return { box: b.text.split('\n') };
  if (b.kind === 'credit') return { credit: { href: b.href && isSafeHref(b.href) ? b.href : '#', text: b.text } };
  const segs: Segment[] = [];
  const re = /\[([^\]]+)\]\(([^)\s]+)\)/g;
  let last = 0;
  let m: RegExpExecArray | null;
  while ((m = re.exec(b.text))) {
    if (m.index > last) segs.push(b.text.slice(last, m.index));
    segs.push(isSafeHref(m[2]) ? { href: m[2], text: m[1] } : m[0]);
    last = re.lastIndex;
  }
  if (last < b.text.length) segs.push(b.text.slice(last));
  // Nicht verlinkte Stücke wieder zu einem Text zusammenfassen.
  for (let i = segs.length - 1; i > 0; i--) {
    if (typeof segs[i] === 'string' && typeof segs[i - 1] === 'string')
      segs.splice(i - 1, 2, (segs[i - 1] as string) + (segs[i] as string));
  }
  return { p: segs.length === 1 && typeof segs[0] === 'string' ? segs[0] : segs };
}
