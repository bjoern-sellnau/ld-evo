import Link from 'next/link';
import { getCurrentUser } from '@/cms/auth';
import { counts, listScheduled } from '@/cms/repo';
import { COLLECTIONS, PAGE_TEMPLATES } from '@/cms/schema';

export const metadata = { title: 'Dashboard' };

export default async function Page() {
  const user = await getCurrentUser();
  const c = await counts();
  const scheduled = await listScheduled();
  return (
    <>
      <div className="f-head">
        <div>
          <div className="f-kicker">LD Flow. — cms · loona! designs</div>
          <h1>Hallo {user?.name.split(' ')[0]}.</h1>
        </div>
        <span className="f-row">
          <Link className="f-btn" href="/flow/guide">
            Guide öffnen
          </Link>
          <Link className="f-btn primary" href="/flow/c/pages">
            + Neue Seite
          </Link>
        </span>
      </div>
      <div className="f-grid">
        {Object.values(COLLECTIONS).map((def) => {
          const s = c[def.id];
          return (
            <Link
              key={def.id}
              href={def.kind === 'singleton' ? `/flow/c/${def.id}/${def.id}` : `/flow/c/${def.id}`}
              className="f-card f-tile"
            >
              <h2>{def.label}</h2>
              <p>
                {def.kind === 'singleton' ? 'Einzelseite' : `${s?.n ?? 0} Einträge`}
                {s?.drafts ? ` · ${s.drafts} mit Entwurf` : ''}
                {s?.offline && def.kind !== 'singleton' ? ` · ${s.offline} offline` : ''}
                {s?.enDrafts ? ` · EN: ${s.enDrafts} ${s.enDrafts === 1 ? 'Übersetzung' : 'Übersetzungen'} offen` : ''}
              </p>
            </Link>
          );
        })}
      </div>
      {scheduled.length > 0 && (
        <div className="f-card" style={{ marginTop: 22 }}>
          <div className="f-kicker">Geplant</div>
          <ul style={{ listStyle: 'none', padding: 0, margin: '8px 0 0' }}>
            {scheduled.map((s) => (
              <li
                key={`${s.collection}/${s.id}/${s.locale}`}
                className="f-row"
                style={{ justifyContent: 'space-between', padding: '6px 0' }}
              >
                <Link href={`/flow/c/${s.collection}/${s.id}${s.locale === 'de' ? '' : `?lang=${s.locale}`}`}>
                  {COLLECTIONS[s.collection]?.singular ?? s.collection} · {s.id}
                  {s.locale !== 'de' && ` · ${s.locale.toUpperCase()}`}
                </Link>
                <span className="f-help">
                  {new Date(s.publishAt).toLocaleString('de-DE', {
                    dateStyle: 'medium',
                    timeStyle: 'short',
                    // Server rendert → Zeitzone explizit (Standard: Berlin), sonst stünde hier UTC.
                    timeZone: process.env.LDFLOW_TZ ?? 'Europe/Berlin',
                  })}{' '}
                  · {s.publishBy ?? '—'}
                </span>
              </li>
            ))}
          </ul>
        </div>
      )}
      <div className="f-card" style={{ marginTop: 22 }}>
        <div className="f-kicker">So funktioniert’s</div>
        <ol style={{ margin: '8px 0 0', paddingLeft: 18, color: 'var(--f-muted)', lineHeight: 1.8 }}>
          <li>Eintrag öffnen — links das Formular, rechts die echte Seite als Live-Vorschau.</li>
          <li>Violett gestrichelte Texte direkt in der Vorschau anklicken und tippen (WYSIWYG).</li>
          <li>Änderungen werden automatisch als Entwurf gespeichert; „Veröffentlichen“ bringt sie live.</li>
          <li>
            Neue Seiten: unter „Seiten“ anlegen und einen Seitentyp wählen (
            {Object.values(PAGE_TEMPLATES)
              .map((t) => t.label)
              .join(', ')}
            ).
          </li>
        </ol>
      </div>
    </>
  );
}
