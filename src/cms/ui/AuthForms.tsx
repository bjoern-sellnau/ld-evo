'use client';

import { useActionState } from 'react';
import { LoonaLockup } from '@/components/brand';
import { loginAction, setupAction, type ActionState } from '../actions';

function Brand() {
  return (
    <div style={{ marginBottom: 26 }}>
      <LoonaLockup product="flow" markSize={34} />
    </div>
  );
}

export function LoginForm({ next }: { next: string }) {
  const [state, action, pending] = useActionState<ActionState, FormData>(loginAction, undefined);
  return (
    <form action={action} className="f-card" aria-labelledby="login-title">
      <Brand />
      <h1 id="login-title" style={{ fontSize: 20, margin: '0 0 18px' }}>
        Anmelden
      </h1>
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
