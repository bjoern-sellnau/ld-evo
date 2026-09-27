'use client';

import { useState } from 'react';
import { useSite } from '../settings/SiteProvider';
import { ModalOverlay } from './GlassPanel';
import styles from './overlays.module.css';

const MAIL = 'info@loona-designs.de';

/** Kontakt: Name/E-Mail/Nachricht → vorbefülltes mailto:, dazu GitHub/LinkedIn. Markup: Prototyp Zeile 1265 ff. */
export function KontaktPanel() {
  const { overlay, setOverlay } = useSite();
  const [name, setName] = useState('');
  const [mail, setMail] = useState('');
  const [msg, setMsg] = useState('');
  if (overlay !== 'kontakt') return null;

  const href =
    `mailto:${MAIL}?subject=` +
    encodeURIComponent(`Anfrage über loona-designs — ${name || 'Portfolio'}`) +
    '&body=' +
    encodeURIComponent(`${msg}\n\n— ${name}${mail ? ` (${mail})` : ''}`);

  return (
    <ModalOverlay label="Kontakt" onClose={() => setOverlay(null)} align="center" width={440} radius="var(--radL,22px)" padding="26px 28px">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <h2 style={{ fontSize: 21, fontWeight: 700, margin: 0 }}>
          Sag hallo<span style={{ color: 'var(--accent)' }}>.</span>
        </h2>
        <button type="button" onClick={() => setOverlay(null)} aria-label="Schließen" className={styles.close}>
          ✕
        </button>
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginTop: 18 }}>
        <input
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Dein Name"
          aria-label="Dein Name"
          autoComplete="name"
          className={styles.field}
        />
        <input
          value={mail}
          onChange={(e) => setMail(e.target.value)}
          placeholder="Deine E-Mail"
          aria-label="Deine E-Mail"
          type="email"
          autoComplete="email"
          className={styles.field}
        />
        <textarea
          value={msg}
          onChange={(e) => setMsg(e.target.value)}
          placeholder="Worum geht's?"
          aria-label="Nachricht"
          rows={4}
          className={styles.field}
          style={{ resize: 'vertical' }}
        />
        <a href={href} className={styles.send}>
          Nachricht senden ✉
        </a>
        <div style={{ fontSize: 10.5, color: 'var(--soft)', textAlign: 'center' }}>öffnet dein Mail-Programm — an {MAIL}</div>
      </div>
      <div style={{ display: 'flex', gap: 10, marginTop: 16, borderTop: '1px solid var(--hair)', paddingTop: 16 }}>
        <a href="https://github.com/bjoern-sellnau/" target="_blank" rel="noopener noreferrer" className={styles.social}>
          GitHub ↗
        </a>
        <a href="https://www.linkedin.com/in/bjoern-sellnau/" target="_blank" rel="noopener noreferrer" className={styles.social}>
          LinkedIn ↗
        </a>
      </div>
    </ModalOverlay>
  );
}
