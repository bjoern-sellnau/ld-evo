'use client';

import { useActionState } from 'react';
import { LoonaLockup } from '@/components/brand';
import Link from 'next/link';
import { forgotPasswordAction, loginAction, resetPasswordAction, secondFactorAction, setupAction, type ActionState } from '../actions';

function Brand() {
  return (
    <div style={{ marginBottom: 26 }}>
      <LoonaLockup product="flow" markSize={34} />
    </div>
  );
}

export function LoginForm({ next, notice }: { next: string; notice?: string }) {
  const [state, action, pending] = useActionState<ActionState, FormData>(loginAction, undefined);
  return (
    <form action={action} className="f-card" aria-labelledby="login-title">
      <Brand />
      <h1 id="login-title" style={{ fontSize: 20, margin: '0 0 18px' }}>
        Anmelden
      </h1>
      {notice && !state?.error && (
        <p className="f-msg ok" role="status">
          {notice}
        </p>
      )}
      {state?.error && (
        <p className="f-msg error" role="alert">
          {state.error}
        </p>
      )}
      <input type="hidden" name="next" value={next} />
      <div className="f-field">
        <label htmlFor="email">E-Mail</label>
        <input id="email" name="email" type="email" autoComplete="username" required autoFocus />
      </div>
      <div className="f-field">
        <label htmlFor="password">Passwort</label>
        <input id="password" name="password" type="password" autoComplete="current-password" required />
      </div>
      <button className="f-btn primary" type="submit" disabled={pending} style={{ width: '100%', justifyContent: 'center' }}>
        {pending ? 'Prüfe …' : 'Anmelden'}
      </button>
      <p style={{ margin: '14px 0 0', textAlign: 'center' }}>
        <Link href="/flow/forgot" className="f-help">
          Passwort vergessen?
        </Link>
      </p>
    </form>
  );
}

export function SetupForm({ tokenHint }: { tokenHint: string }) {
  const [state, action, pending] = useActionState<ActionState, FormData>(setupAction, undefined);
  return (
    <form action={action} className="f-card" aria-labelledby="setup-title">
      <Brand />
      <h1 id="setup-title" style={{ fontSize: 20, margin: '0 0 6px' }}>
        LD Flow einrichten
      </h1>
      <p className="f-help" style={{ margin: '0 0 18px' }}>
        Lege das erste Admin-Konto an. Zum Schutz vor Übernahme brauchst du das Setup-Token: {tokenHint}
      </p>
      {state?.error && (
        <p className="f-msg error" role="alert">
          {state.error}
        </p>
      )}
      <div className="f-field">
        <label htmlFor="token">Setup-Token</label>
        <input id="token" name="token" type="password" autoComplete="off" required />
      </div>
      <div className="f-field">
        <label htmlFor="name">Name</label>
        <input id="name" name="name" type="text" autoComplete="name" required />
      </div>
      <div className="f-field">
        <label htmlFor="email">E-Mail</label>
        <input id="email" name="email" type="email" autoComplete="username" required />
      </div>
      <div className="f-field">
        <label htmlFor="password">Passwort</label>
        <input id="password" name="password" type="password" autoComplete="new-password" minLength={10} required />
        <span className="f-help">Mindestens 10 Zeichen — am besten eine Passphrase.</span>
      </div>
      <div className="f-field">
        <label htmlFor="password2">Passwort wiederholen</label>
        <input id="password2" name="password2" type="password" autoComplete="new-password" minLength={10} required />
      </div>
      <button className="f-btn primary" type="submit" disabled={pending} style={{ width: '100%', justifyContent: 'center' }}>
        {pending ? 'Lege an …' : 'Admin anlegen'}
      </button>
    </form>
  );
}

export function ForgotForm() {
  const [state, action, pending] = useActionState<ActionState, FormData>(forgotPasswordAction, undefined);
  return (
    <form action={action} className="f-card" aria-labelledby="forgot-title">
      <Brand />
      <h1 id="forgot-title" style={{ fontSize: 20, margin: '0 0 6px' }}>
        Passwort vergessen
      </h1>
      <p className="f-help" style={{ margin: '0 0 18px' }}>
        Wir schicken dir einen Link, mit dem du ein neues Passwort setzt. Ohne eingerichteten Mailversand kann ein Admin dir den Link unter
        „Nutzer“ erzeugen.
      </p>
      {state?.error && (
        <p className="f-msg error" role="alert">
          {state.error}
        </p>
      )}
      {state?.message ? (
        <p className="f-msg ok" role="status">
          {state.message}
        </p>
      ) : (
        <>
          <div className="f-field">
            <label htmlFor="email">E-Mail</label>
            <input id="email" name="email" type="email" autoComplete="username" required autoFocus />
          </div>
          <button className="f-btn primary" type="submit" disabled={pending} style={{ width: '100%', justifyContent: 'center' }}>
            {pending ? 'Sende …' : 'Link anfordern'}
          </button>
        </>
      )}
      <p style={{ margin: '14px 0 0', textAlign: 'center' }}>
        <Link href="/flow/login" className="f-help">
          ← Zur Anmeldung
        </Link>
      </p>
    </form>
  );
}

export function ResetForm({ token }: { token: string | null }) {
  const [state, action, pending] = useActionState<ActionState, FormData>(resetPasswordAction, undefined);
  if (!token)
    return (
      <div className="f-card">
        <Brand />
        <h1 style={{ fontSize: 20, margin: '0 0 12px' }}>Link ungültig</h1>
        <p className="f-msg error" role="alert">
          Der Link ist ungültig oder abgelaufen (1 Stunde gültig, nur einmal verwendbar).
        </p>
        <Link href="/flow/forgot" className="f-btn">
          Neuen Link anfordern
        </Link>
      </div>
    );
  return (
    <form action={action} className="f-card" aria-labelledby="reset-title">
      <Brand />
      <h1 id="reset-title" style={{ fontSize: 20, margin: '0 0 18px' }}>
        Neues Passwort
      </h1>
      {state?.error && (
        <p className="f-msg error" role="alert">
          {state.error}
        </p>
      )}
      <input type="hidden" name="token" value={token} />
      <div className="f-field">
        <label htmlFor="rp-pw">Neues Passwort</label>
        <input id="rp-pw" name="password" type="password" autoComplete="new-password" minLength={10} required autoFocus />
      </div>
      <div className="f-field">
        <label htmlFor="rp-pw2">Wiederholen</label>
        <input id="rp-pw2" name="password2" type="password" autoComplete="new-password" minLength={10} required />
      </div>
      <button className="f-btn primary" type="submit" disabled={pending} style={{ width: '100%', justifyContent: 'center' }}>
        {pending ? 'Speichere …' : 'Passwort setzen'}
      </button>
    </form>
  );
}

export function SecondFactorForm({ next }: { next: string }) {
  const [state, action, pending] = useActionState<ActionState, FormData>(secondFactorAction, undefined);
  return (
    <form action={action} className="f-card" aria-labelledby="tfa-title">
      <Brand />
      <h1 id="tfa-title" style={{ fontSize: 20, margin: '0 0 6px' }}>
        Bestätigungscode
      </h1>
      <p className="f-help" style={{ margin: '0 0 18px' }}>
        6-stelliger Code aus deiner Authenticator-App — oder einer deiner Wiederherstellungscodes (xxxx-xxxx).
      </p>
      {state?.error && (
        <p className="f-msg error" role="alert">
          {state.error}
        </p>
      )}
      <input type="hidden" name="next" value={next} />
      <div className="f-field">
        <label htmlFor="tfa-code">Code</label>
        <input
          id="tfa-code"
          name="code"
          type="text"
          inputMode="text"
          autoComplete="one-time-code"
          autoCapitalize="off"
          spellCheck={false}
          maxLength={20}
          required
          autoFocus
        />
      </div>
      <button className="f-btn primary" type="submit" disabled={pending} style={{ width: '100%', justifyContent: 'center' }}>
        {pending ? 'Prüfe …' : 'Bestätigen'}
      </button>
      <p style={{ margin: '14px 0 0', textAlign: 'center' }}>
        <Link href="/flow/login" className="f-help">
          ← Abbrechen
        </Link>
      </p>
    </form>
  );
}
