'use client';

import { diffDocs, wordDiff } from '../diff';
import type { FieldDef } from '../schema';

/** Zeigt, was sich zwischen einer Version (vorher) und dem aktuellen Stand im Editor (nachher) geändert hat. */
export function DiffView({ before, after, fields }: { before: unknown; after: unknown; fields: FieldDef[] }) {
  const changes = diffDocs(before, after);
  const label = (path: string) => {
    const [head, ...rest] = path.split('.');
    const f = fields.find((x) => x.key === head);
    return [f?.label ?? head, ...rest.map((r) => (/^\d+$/.test(r) ? `#${Number(r) + 1}` : r))].join(' › ');
  };
  if (!changes.length) return <p className="f-help">Keine Unterschiede zum aktuellen Stand.</p>;
  return (
    <ul className="f-diff" aria-label="Unterschiede zum aktuellen Stand">
      {changes.map((c) => (
        <li key={c.path}>
          <div className="f-diff-path">
            {label(c.path)} <span className="f-help">· {c.kind === 'added' ? 'neu' : c.kind === 'removed' ? 'entfernt' : 'geändert'}</span>
          </div>
          <div className="f-diff-text">
            {c.kind === 'changed' ? (
              wordDiff(c.before!, c.after!).map((s, i) =>
                s.op === '=' ? <span key={i}>{s.t}</span> : s.op === '+' ? <ins key={i}>{s.t}</ins> : <del key={i}>{s.t}</del>,
              )
            ) : c.kind === 'added' ? (
              <ins>{c.after}</ins>
            ) : (
              <del>{c.before}</del>
            )}
          </div>
        </li>
      ))}
    </ul>
  );
}
