'use client';

import { useTransition } from 'react';
import { clearErrorsAction, deleteErrorAction } from '../actions';
import type { ErrorRow } from '../repo';

/** Fehler-Eingang (nur Admins). Meldungen können Nutzereingaben enthalten → nur als Text rendern. */
export function Errors({ items }: { items: ErrorRow[] }) {
  const [busy, start] = useTransition();
  const run = (fn: () => Promise<{ ok: boolean; error?: string }>) =>
    start(async () => {
      const r = await fn();
      if (!r.ok) window.alert(r.error);
    });
  const when = (t: number) => new Date(t).toLocaleString('de-DE');
  if (!items.length)
    return (
      <div className="f-card">
        <p className="f-help" style={{ margin: 0 }}>
          Keine Serverfehler. Tritt einer auf (Seite, Server Action, API), erscheint er hier — gleiche Fehler gebündelt mit Zähler. Mit{' '}
          <code>LDFLOW_ALERT_TO</code> kommt zusätzlich eine Mail (höchstens einmal am Tag je Fehler).
        </p>
      </div>
    );
  return (
    <>
      <div className="f-row" style={{ marginBottom: 12, justifyContent: 'space-between' }}>
        <p className="f-help" style={{ margin: 0 }}>
          „Erledigt“ entfernt den Eintrag; tritt der Fehler erneut auf, erscheint er wieder.
        </p>
        <button
          className="f-btn sm danger"
          type="button"
          disabled={busy}
          onClick={() => window.confirm('Alle Einträge entfernen?') && run(() => clearErrorsAction())}
        >
          Alle entfernen
        </button>
      </div>
      <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'grid', gap: 12 }}>
        {items.map((e) => (
          <li key={e.fp} className="f-card" style={{ borderLeft: '3px solid var(--f-danger)' }}>
            <div className="f-row" style={{ justifyContent: 'space-between', alignItems: 'baseline' }}>
              <strong style={{ overflowWrap: 'anywhere' }}>{e.message}</strong>
              <span className="f-help">
                {e.count}× · zuletzt {when(e.lastAt)}
              </span>
            </div>
            <p className="f-help" style={{ margin: '6px 0 10px', overflowWrap: 'anywhere' }}>
              {e.kind && `${e.kind} · `}
              {e.path}
              {e.route && e.route !== e.path && ` (${e.route})`} · seit {when(e.firstAt)}
              {e.digest && ` · Digest ${e.digest}`}
            </p>
            {e.stack && (
              <details style={{ marginBottom: 12 }}>
                <summary>Stack</summary>
                <pre style={{ whiteSpace: 'pre-wrap', fontSize: 12, margin: '8px 0 0', overflowWrap: 'anywhere' }}>{e.stack}</pre>
              </details>
            )}
            <button className="f-btn sm" type="button" disabled={busy} onClick={() => run(() => deleteErrorAction(e.fp))}>
              Erledigt
            </button>
          </li>
        ))}
      </ul>
    </>
  );
}
