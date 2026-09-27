'use client';

import Link from 'next/link';
import { useActionState, useTransition } from 'react';
import { createDocAction, moveDocAction, type ActionState } from '../actions';
import { PAGE_TEMPLATES } from '../schema';

export interface ListRow {
  id: string;
  title: string;
  subtitle: string;
  color?: string;
  live: boolean;
  draft: boolean;
  updatedAt: number;
  updatedBy: string | null;
  href: string | null;
}

export function CollectionList({
  collection,
  rows,
  creatable,
  singular,
  patterns = [],
}: {
  collection: string;
  rows: ListRow[];
  creatable: boolean;
  singular: string;
  /** Veröffentlichte Vorlagen als Startpunkt für neue Seiten. */
  patterns?: { id: string; title: string }[];
}) {
  const [state, create, pending] = useActionState<ActionState, FormData>(createDocAction, undefined);
  const [moving, startMove] = useTransition();
  return (
    <>
      {creatable && (
        <form action={create} className="f-card" style={{ marginBottom: 18 }} aria-label={`${singular} anlegen`}>
          <input type="hidden" name="collection" value={collection} />
          <div className="f-row" style={{ alignItems: 'flex-end' }}>
            <div className="f-field" style={{ margin: 0, flex: '1 1 220px' }}>
              <label htmlFor="new-id">Neue Kennung (URL)</label>
              <input
                id="new-id"
                name="id"
                type="text"
                placeholder="z. B. mein-projekt"
                pattern="[a-z0-9](?:[a-z0-9-]{0,62}[a-z0-9])?"
                required
              />
            </div>
            {collection === 'pages' && (
              <div className="f-field" style={{ margin: 0, flex: '1 1 200px' }}>
                <label htmlFor="new-tpl">Seitentyp</label>
                <select id="new-tpl" name="template" defaultValue="standard">
                  {Object.values(PAGE_TEMPLATES).map((t) => (
                    <option key={t.id} value={t.id}>
                      {t.label}
                    </option>
                  ))}
                </select>
              </div>
            )}
            {collection === 'pages' && patterns.length > 0 && (
              <div className="f-field" style={{ margin: 0, flex: '1 1 200px' }}>
                <label htmlFor="new-pattern">Start-Vorlage</label>
                <select id="new-pattern" name="pattern" defaultValue="">
                  <option value="">Leer beginnen</option>
                  {patterns.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.title}
                    </option>
                  ))}
                </select>
              </div>
            )}
            <button className="f-btn primary" type="submit" disabled={pending}>
              + {singular} anlegen
            </button>
          </div>
          {collection === 'pages' && (
            <p className="f-help" style={{ margin: '10px 0 0' }}>
              {Object.values(PAGE_TEMPLATES)
                .map((t) => `${t.label}: ${t.description}`)
                .join(' · ')}
            </p>
          )}
          {state?.error && (
            <p className="f-msg error" role="alert" style={{ margin: '12px 0 0' }}>
              {state.error}
            </p>
          )}
        </form>
      )}
      <div className="f-card" style={{ padding: 0, overflowX: 'auto' }}>
        <table className="f-table">
          <thead>
            <tr>
              <th>Titel</th>
              <th>Kennung</th>
              <th>Status</th>
              <th>Geändert</th>
              <th aria-label="Reihenfolge" />
            </tr>
          </thead>
          <tbody>
            {rows.length === 0 && (
              <tr>
                <td colSpan={5} style={{ color: 'var(--f-soft)' }}>
                  Noch keine Einträge.
                </td>
              </tr>
            )}
            {rows.map((r, i) => (
              <tr key={r.id}>
                <td>
                  <span className="f-row" style={{ flexWrap: 'nowrap' }}>
                    {r.color && <span className="f-swatch" style={{ background: r.color }} aria-hidden />}
                    <Link href={`/flow/c/${collection}/${r.id}`}>{r.title || '(ohne Titel)'}</Link>
                  </span>
                  {r.subtitle && <div className="f-help">{r.subtitle}</div>}
                </td>
                <td className="f-mono" style={{ fontSize: 12, color: 'var(--f-soft)' }}>
                  {r.id}
                </td>
                <td>
                  <span className="f-row">
                    {r.live ? <span className="f-badge live">● Live</span> : <span className="f-badge off">○ Offline</span>}
                    {r.draft && <span className="f-badge draft">Entwurf</span>}
                  </span>
                </td>
                <td style={{ fontSize: 12, color: 'var(--f-soft)', whiteSpace: 'nowrap' }}>
                  {new Date(r.updatedAt).toLocaleString('de-DE', { dateStyle: 'short', timeStyle: 'short' })}
                  {r.updatedBy && <div>{r.updatedBy}</div>}
                </td>
                <td style={{ whiteSpace: 'nowrap' }}>
                  <button
                    className="f-btn sm ghost"
                    type="button"
                    aria-label={`${r.title} nach oben`}
                    disabled={i === 0 || moving}
                    onClick={() => startMove(async () => void (await moveDocAction(collection, r.id, -1)))}
                  >
                    ↑
                  </button>
                  <button
                    className="f-btn sm ghost"
                    type="button"
                    aria-label={`${r.title} nach unten`}
                    disabled={i === rows.length - 1 || moving}
                    onClick={() => startMove(async () => void (await moveDocAction(collection, r.id, 1)))}
                  >
                    ↓
                  </button>
                  {r.href && r.live && (
                    <a
                      className="f-btn sm ghost"
                      href={r.href}
                      target="_blank"
                      rel="noopener"
                      aria-label={`${r.title} auf der Site ansehen`}
                    >
                      ↗
                    </a>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </>
  );
}
