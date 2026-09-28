'use client';

import { useEffect, useId, useRef, useState, type CSSProperties, type ReactNode } from 'react';
import { useEditing } from '@/site/cms/editing';

type State = { kind: 'idle' | 'sending' | 'sent' } | { kind: 'error'; text: string; field?: string };

const input: CSSProperties = {
  width: '100%',
  boxSizing: 'border-box',
  padding: '11px 13px',
  borderRadius: 12,
  border: '1px solid var(--border)',
  background: 'var(--card)',
  color: 'var(--ink)',
  font: 'inherit',
  fontSize: 15,
};
const label: CSSProperties = { display: 'block', fontSize: 13, fontWeight: 600, color: 'var(--ink)', marginBottom: 6 };

/**
 * Kontaktformular des Widgets „Kontakt“ → POST /api/contact (src/app/(flow)/api/contact/route.ts).
 * Honeypot „website“ ist für Menschen unsichtbar; im LD-Flow-Editor wird nichts abgeschickt.
 */
export function ContactForm({
  submitLabel,
  success,
  notice,
  accent,
}: {
  submitLabel: ReactNode;
  success: ReactNode;
  notice: ReactNode;
  accent: string;
}) {
  const editing = useEditing();
  const [state, setState] = useState<State>({ kind: 'idle' });
  const shownAt = useRef(0);
  const uid = useId(); // mehrere Formulare auf einer Seite → eindeutige IDs
  useEffect(() => {
    shownAt.current = Date.now();
  }, []);
  if (state.kind === 'sent')
    return (
      <p
        role="status"
        style={{
          margin: 0,
          padding: '18px 20px',
          borderRadius: 16,
          background: 'var(--card)',
          border: '1px solid var(--border)',
          color: 'var(--ink)',
        }}
      >
        {success}
      </p>
    );
  const err = state.kind === 'error' ? state : null;
  return (
    <form
      noValidate={false}
      onSubmit={async (e) => {
        e.preventDefault();
        if (editing) return;
        const fd = new FormData(e.currentTarget);
        setState({ kind: 'sending' });
        try {
          const res = await fetch(`${process.env.NEXT_PUBLIC_BASE_PATH ?? ''}/api/contact`, {
            method: 'POST',
            headers: { 'content-type': 'application/json' },
            body: JSON.stringify({ ...Object.fromEntries(fd), page: window.location.pathname, shownAt: shownAt.current }),
          });
          const data = (await res.json().catch(() => null)) as { ok?: boolean; error?: string; field?: string } | null;
          if (data?.ok) setState({ kind: 'sent' });
          else
            setState({ kind: 'error', text: data?.error ?? 'Senden gerade nicht möglich — bitte per E-Mail melden.', field: data?.field });
        } catch {
          setState({ kind: 'error', text: 'Senden gerade nicht möglich — bitte per E-Mail melden.' });
        }
      }}
      style={{ display: 'grid', gap: 14 }}
    >
      <div style={{ display: 'grid', gap: 14, gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))' }}>
        <div>
          <label htmlFor={`${uid}-name`} style={label}>
            Name
          </label>
          <input
            id={`${uid}-name`}
            name="name"
            required
            maxLength={120}
            autoComplete="name"
            style={input}
            aria-invalid={err?.field === 'name' || undefined}
          />
        </div>
        <div>
          <label htmlFor={`${uid}-email`} style={label}>
            E-Mail
          </label>
          <input
            id={`${uid}-email`}
            name="email"
            type="email"
            required
            maxLength={200}
            autoComplete="email"
            style={input}
            aria-invalid={err?.field === 'email' || undefined}
          />
        </div>
      </div>
      <div>
        <label htmlFor={`${uid}-msg`} style={label}>
          Nachricht
        </label>
        <textarea
          id={`${uid}-msg`}
          name="message"
          required
          minLength={10}
          maxLength={5000}
          rows={6}
          style={{ ...input, resize: 'vertical' }}
          aria-invalid={err?.field === 'message' || undefined}
        />
      </div>
      {/* Honeypot: aus dem Layout und dem Vorlesebaum genommen */}
      <div aria-hidden style={{ position: 'absolute', left: -10000, width: 1, height: 1, overflow: 'hidden' }}>
        <label>
          Website <input name="website" tabIndex={-1} autoComplete="off" />
        </label>
      </div>
      <p style={{ margin: 0, fontSize: 12.5, lineHeight: 1.6, color: 'var(--soft)' }}>{notice}</p>
      {err && (
        <p role="alert" style={{ margin: 0, fontSize: 14, color: 'var(--ink)', borderLeft: `3px solid ${accent}`, paddingLeft: 10 }}>
          {err.text}
        </p>
      )}
      <div>
        <button
          type="submit"
          disabled={state.kind === 'sending' || editing}
          title={editing ? 'Im Editor wird nichts verschickt' : undefined}
          style={{
            appearance: 'none',
            border: 'none',
            borderRadius: 999,
            padding: '12px 22px',
            // wie das CTA-Widget: Akzent + passende Schriftfarbe aus den Tokens (Kontrast ≥ 4.5:1)
            background: 'var(--accent)',
            color: 'var(--on-accent)',
            font: 'inherit',
            fontWeight: 700,
            fontSize: 14.5,
            cursor: 'pointer',
            opacity: state.kind === 'sending' ? 0.7 : 1,
          }}
        >
          {state.kind === 'sending' ? 'Sende …' : submitLabel}
        </button>
      </div>
    </form>
  );
}
