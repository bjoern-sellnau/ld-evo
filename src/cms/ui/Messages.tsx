'use client';

import { useTransition } from 'react';
import { deleteMessageAction, markMessageAction } from '../actions';
import type { MessageRow } from '../repo';

/** Nachrichten aus dem Kontaktformular-Widget. Inhalte sind Nutzereingaben → nur als Text rendern. */
export function Messages({ items }: { items: MessageRow[] }) {
  const [busy, start] = useTransition();
  const run = (fn: () => Promise<{ ok: boolean; error?: string }>) =>
    start(async () => {
      const r = await fn();
      if (!r.ok) window.alert(r.error);
    });
  if (!items.length)
    return (
      <div className="f-card">
        <p className="f-help" style={{ margin: 0 }}>
          Noch keine Nachrichten. Das Widget „Kontaktformular“ lässt sich auf jeder Seite einfügen.
        </p>
      </div>
    );
  return (
    <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'grid', gap: 12 }}>
      {items.map((m) => (
        <li key={m.id} className="f-card" style={{ borderLeft: m.read ? undefined : '3px solid var(--f-accent)' }}>
          <div className="f-row" style={{ justifyContent: 'space-between', alignItems: 'baseline' }}>
            <strong>
              {m.name} · <a href={`mailto:${encodeURIComponent(m.email).replace('%40', '@')}`}>{m.email}</a>
            </strong>
            <span className="f-help">
              {new Date(m.createdAt).toLocaleString('de-DE')}
              {m.page && ` · ${m.page}`}
              {!m.read && ' · neu'}
            </span>
          </div>
          <p style={{ whiteSpace: 'pre-wrap', margin: '10px 0 12px', lineHeight: 1.6 }}>{m.message}</p>
          <div className="f-row">
            <button className="f-btn sm" type="button" disabled={busy} onClick={() => run(() => markMessageAction(m.id, !m.read))}>
              {m.read ? 'Als ungelesen markieren' : 'Als gelesen markieren'}
            </button>
            <button
              className="f-btn sm danger"
              type="button"
              disabled={busy}
              onClick={() => window.confirm('Nachricht löschen?') && run(() => deleteMessageAction(m.id))}
            >
              Löschen
            </button>
          </div>
        </li>
      ))}
    </ul>
  );
}
