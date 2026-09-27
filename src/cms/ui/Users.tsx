'use client';

import { useActionState, useTransition } from 'react';
import { changePasswordAction, createUserAction, deleteUserAction, updateUserAction, type ActionState } from '../actions';

export interface UserRow {
  id: string;
  email: string;
  name: string;
  role: 'admin' | 'editor';
  disabled: number;
  createdAt: number;
}

function Msg({ s }: { s: ActionState }) {
  if (s?.error)
    return (
      <p className="f-msg error" role="alert">
        {s.error}
      </p>
    );
  if (s?.message)
    return (
      <p className="f-msg ok" role="status">
        {s.message}
      </p>
    );
  return null;
}

export function UsersAdmin({ users, meId }: { users: UserRow[]; meId: string }) {
  const [state, create, pending] = useActionState<ActionState, FormData>(createUserAction, undefined);
  const [busy, start] = useTransition();
  const run = (fn: () => Promise<{ ok: boolean; error?: string }>) =>
    start(async () => {
      const r = await fn();
      if (!r.ok) window.alert(r.error);
    });
  return (
    <>
      <div className="f-card" style={{ padding: 0, overflowX: 'auto', marginBottom: 18 }}>
        <table className="f-table">
          <thead>
            <tr>
              <th>Name</th>
              <th>E-Mail</th>
              <th>Rolle</th>
              <th>Status</th>
              <th aria-label="Aktionen" />
            </tr>
          </thead>
          <tbody>
            {users.map((u) => (
              <tr key={u.id}>
                <td>
                  {u.name}
                  {u.id === meId && <span className="f-help"> (du)</span>}
                </td>
                <td>{u.email}</td>
                <td>
                  <select
                    className="f-input"
                    style={{ width: 'auto' }}
                    aria-label={`Rolle von ${u.name}`}
                    value={u.role}
                    disabled={busy}
                    onChange={(e) => run(() => updateUserAction(u.id, { role: e.target.value as 'admin' | 'editor' }))}
                  >
                    <option value="editor">Redaktion</option>
                    <option value="admin">Admin</option>
                  </select>
                </td>
                <td>{u.disabled ? <span className="f-badge off">gesperrt</span> : <span className="f-badge live">aktiv</span>}</td>
                <td style={{ whiteSpace: 'nowrap' }}>
                  <button
                    className="f-btn sm"
                    type="button"
                    disabled={busy}
                    onClick={() => run(() => updateUserAction(u.id, { disabled: !u.disabled }))}
                  >
                    {u.disabled ? 'Entsperren' : 'Sperren'}
                  </button>{' '}
                  <button
                    className="f-btn sm"
                    type="button"
                    disabled={busy}
                    onClick={() => {
                      const pw = window.prompt(`Neues Passwort für ${u.name} (mind. 10 Zeichen). Alle Sitzungen werden beendet.`);
                      if (pw) run(() => updateUserAction(u.id, { password: pw }));
                    }}
                  >
                    Passwort setzen
                  </button>{' '}
                  {u.id !== meId && (
                    <button
                      className="f-btn sm danger"
                      type="button"
                      disabled={busy}
                      onClick={() => window.confirm(`${u.name} löschen?`) && run(() => deleteUserAction(u.id))}
                    >
                      Löschen
                    </button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <form action={create} className="f-card" aria-labelledby="nu-title" style={{ maxWidth: 520 }}>
        <h2 id="nu-title" style={{ margin: '0 0 14px', fontSize: 16 }}>
          Nutzer anlegen
        </h2>
        <Msg s={state} />
        <div className="f-field">
          <label htmlFor="nu-name">Name</label>
          <input id="nu-name" name="name" type="text" required />
        </div>
        <div className="f-field">
          <label htmlFor="nu-email">E-Mail</label>
          <input id="nu-email" name="email" type="email" required autoComplete="off" />
        </div>
        <div className="f-field">
          <label htmlFor="nu-pw">Start-Passwort</label>
          <input id="nu-pw" name="password" type="password" minLength={10} required autoComplete="new-password" />
          <span className="f-help">Mindestens 10 Zeichen; die Person kann es unter „Mein Konto“ ändern.</span>
        </div>
        <div className="f-field">
          <label htmlFor="nu-role">Rolle</label>
          <select id="nu-role" name="role" defaultValue="editor">
            <option value="editor">Redaktion — Inhalte & Medien</option>
            <option value="admin">Admin — zusätzlich Nutzer & Löschen</option>
          </select>
        </div>
        <button className="f-btn primary" type="submit" disabled={pending}>
          Anlegen
        </button>
      </form>
    </>
  );
}

export function PasswordForm() {
  const [state, action, pending] = useActionState<ActionState, FormData>(changePasswordAction, undefined);
  return (
    <form action={action} className="f-card" style={{ maxWidth: 460 }} aria-labelledby="pw-title">
      <h2 id="pw-title" style={{ margin: '0 0 14px', fontSize: 16 }}>
        Passwort ändern
      </h2>
      <Msg s={state} />
      <div className="f-field">
        <label htmlFor="pw-cur">Aktuelles Passwort</label>
        <input id="pw-cur" name="current" type="password" autoComplete="current-password" required />
      </div>
      <div className="f-field">
        <label htmlFor="pw-new">Neues Passwort</label>
        <input id="pw-new" name="next" type="password" autoComplete="new-password" minLength={10} required />
      </div>
      <div className="f-field">
        <label htmlFor="pw-new2">Neues Passwort wiederholen</label>
        <input id="pw-new2" name="next2" type="password" autoComplete="new-password" minLength={10} required />
      </div>
      <button className="f-btn primary" type="submit" disabled={pending}>
        Ändern
      </button>
    </form>
  );
}
