'use client';

import { useActionState, useState, useTransition } from 'react';
import { beginTotpAction, confirmTotpAction, disableTotpAction, revokeSessionAction, type ActionState } from '../actions';
import type { SessionInfo } from '../auth';
import { QrCode } from './QrCode';

const when = (ms: number | null) => (ms ? new Date(ms).toLocaleString('de-DE', { dateStyle: 'medium', timeStyle: 'short' }) : '—');

/** Grobe, lesbare Gerätebeschreibung aus dem User-Agent (nur Anzeige, keine Sicherheitsentscheidung). */
function device(ua: string): string {
  const b = /Edg\//.test(ua)
    ? 'Edge'
    : /Firefox\//.test(ua)
      ? 'Firefox'
      : /Chrome\//.test(ua)
        ? 'Chrome'
        : /Safari\//.test(ua)
          ? 'Safari'
          : 'Browser';
  const o = /iPhone|iPad/.test(ua)
    ? 'iOS'
    : /Android/.test(ua)
      ? 'Android'
      : /Mac OS X/.test(ua)
        ? 'macOS'
        : /Windows/.test(ua)
          ? 'Windows'
          : /Linux/.test(ua)
            ? 'Linux'
            : '';
  return o ? `${b} · ${o}` : b;
}

export function Sessions({ items }: { items: SessionInfo[] }) {
  const [busy, start] = useTransition();
  const [msg, setMsg] = useState<string | null>(null);
  const run = (handle: string | null) =>
    start(async () => {
      const r = await revokeSessionAction(handle);
      setMsg(
        r.ok ? (handle ? 'Sitzung beendet.' : `${(r as { count: number }).count} andere Sitzung(en) abgemeldet.`) : (r.error ?? 'Fehler'),
      );
    });
  const others = items.filter((s) => !s.current).length;
  return (
    <section className="f-card" aria-labelledby="sess-title" style={{ maxWidth: 720, marginTop: 18 }}>
      <div className="f-row" style={{ justifyContent: 'space-between' }}>
        <h2 id="sess-title" style={{ margin: 0, fontSize: 16 }}>
          Angemeldete Geräte
        </h2>
        <button className="f-btn sm" type="button" disabled={busy || others === 0} onClick={() => run(null)}>
          Überall sonst abmelden
        </button>
      </div>
      {msg && (
        <p className="f-msg ok" role="status" style={{ margin: '12px 0 0' }}>
          {msg}
        </p>
      )}
      <ul style={{ listStyle: 'none', padding: 0, margin: '12px 0 0' }}>
        {items.map((s) => (
          <li
            key={s.handle}
            className="f-row"
            style={{ justifyContent: 'space-between', padding: '8px 0', borderTop: '1px solid var(--f-line)' }}
          >
            <span>
              <strong>{device(s.userAgent)}</strong>
              {s.current && (
                <span className="f-badge live" style={{ marginLeft: 8 }}>
                  diese Sitzung
                </span>
              )}
              <span className="f-help" style={{ display: 'block' }}>
                angemeldet {when(s.createdAt)} · zuletzt aktiv {when(s.lastSeen)}
              </span>
            </span>
            {!s.current && (
              <button className="f-btn sm ghost" type="button" disabled={busy} onClick={() => run(s.handle)}>
                Beenden
              </button>
            )}
          </li>
        ))}
      </ul>
    </section>
  );
}

export function TwoFactor({ enabled, recoveryLeft }: { enabled: boolean; recoveryLeft: number }) {
  const [busy, start] = useTransition();
  const [setup, setSetup] = useState<{ secret: string; uri: string } | null>(null);
  const [codes, setCodes] = useState<string[] | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [code, setCode] = useState('');
  const [offState, off, offPending] = useActionState<ActionState, FormData>(disableTotpAction, undefined);

  if (codes)
    return (
      <section className="f-card" aria-labelledby="tfa-h" style={{ maxWidth: 720, marginTop: 18 }}>
        <h2 id="tfa-h" style={{ margin: '0 0 8px', fontSize: 16 }}>
          Zwei-Faktor-Anmeldung ist aktiv
        </h2>
        <p className="f-msg ok" role="status">
          Bewahre diese Wiederherstellungscodes sicher auf (z. B. im Passwort-Manager). Jeder funktioniert einmal, falls das Telefon fehlt.
          Sie werden nur jetzt angezeigt.
        </p>
        <ul aria-label="Wiederherstellungscodes" style={{ columns: 2, fontFamily: 'ui-monospace, monospace', fontSize: 15, lineHeight: 2 }}>
          {codes.map((c) => (
            <li key={c}>{c}</li>
          ))}
        </ul>
        <button className="f-btn" type="button" onClick={() => void navigator.clipboard?.writeText(codes.join('\n'))}>
          Kopieren
        </button>
      </section>
    );

  if (enabled || offState?.ok)
    return (
      <section className="f-card" aria-labelledby="tfa-h" style={{ maxWidth: 720, marginTop: 18 }}>
        <h2 id="tfa-h" style={{ margin: '0 0 8px', fontSize: 16 }}>
          Zwei-Faktor-Anmeldung {offState?.ok ? 'aus' : <span className="f-badge live">aktiv</span>}
        </h2>
        {offState?.ok ? (
          <p className="f-msg ok" role="status">
            {offState.message}
          </p>
        ) : (
          <>
            <p className="f-help" style={{ marginTop: 0 }}>
              Noch {recoveryLeft} unbenutzte Wiederherstellungscodes. Abschalten nur mit Passwort und aktuellem Code.
            </p>
            {offState?.error && (
              <p className="f-msg error" role="alert">
                {offState.error}
              </p>
            )}
            <form action={off} className="f-row" style={{ alignItems: 'flex-end', gap: 8 }}>
              <div className="f-field" style={{ margin: 0 }}>
                <label htmlFor="off-pw">Passwort</label>
                <input id="off-pw" name="password" type="password" autoComplete="current-password" required />
              </div>
              <div className="f-field" style={{ margin: 0 }}>
                <label htmlFor="off-code">Code</label>
                <input id="off-code" name="code" type="text" autoComplete="one-time-code" maxLength={20} required />
              </div>
              <button className="f-btn danger" type="submit" disabled={offPending}>
                Abschalten
              </button>
            </form>
          </>
        )}
      </section>
    );

  return (
    <section className="f-card" aria-labelledby="tfa-h" style={{ maxWidth: 720, marginTop: 18 }}>
      <h2 id="tfa-h" style={{ margin: '0 0 8px', fontSize: 16 }}>
        Zwei-Faktor-Anmeldung
      </h2>
      <p className="f-help" style={{ marginTop: 0 }}>
        Zusätzlich zum Passwort ein Code aus einer Authenticator-App (z. B. 2FAS, Aegis, Google/Microsoft Authenticator, 1Password).
        Schützt, falls das Passwort in falsche Hände gerät.
      </p>
      {error && (
        <p className="f-msg error" role="alert">
          {error}
        </p>
      )}
      {!setup ? (
        <button
          className="f-btn primary"
          type="button"
          disabled={busy}
          onClick={() =>
            start(async () => {
              const r = await beginTotpAction();
              if (r.ok) setSetup(r as { secret: string; uri: string });
              else setError(r.error);
            })
          }
        >
          Einrichten
        </button>
      ) : (
        <div className="f-row" style={{ alignItems: 'flex-start', gap: 22 }}>
          <QrCode text={setup.uri} label="QR-Code für die Authenticator-App" />
          <form
            style={{ flex: '1 1 260px' }}
            onSubmit={(e) => {
              e.preventDefault();
              setError(null);
              start(async () => {
                const r = await confirmTotpAction(code);
                if (r.ok) setCodes((r as { recovery: string[] }).recovery);
                else setError(r.error);
              });
            }}
          >
            <ol style={{ margin: '0 0 12px', paddingLeft: 18, lineHeight: 1.7 }}>
              <li>QR-Code mit der App scannen.</li>
              <li>
                Oder Schlüssel eingeben:{' '}
                <code aria-label="Schlüssel" style={{ wordBreak: 'break-all' }}>
                  {setup.secret.replace(/(.{4})/g, '$1 ').trim()}
                </code>
              </li>
              <li>Den 6-stelligen Code aus der App eintragen.</li>
            </ol>
            <div className="f-field">
              <label htmlFor="tfa-confirm">Code aus der App</label>
              <input
                id="tfa-confirm"
                inputMode="numeric"
                autoComplete="one-time-code"
                pattern="\d{6}"
                maxLength={6}
                value={code}
                onChange={(e) => setCode(e.target.value.replace(/\D/g, ''))}
                required
              />
            </div>
            <button className="f-btn primary" type="submit" disabled={busy || code.length !== 6}>
              Aktivieren
            </button>
          </form>
        </div>
      )}
    </section>
  );
}
