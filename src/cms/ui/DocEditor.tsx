'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useCallback, useEffect, useLayoutEffect, useRef, useState, useTransition } from 'react';
import { setAtPath } from '@/site/cms/editing';
import {
  cancelScheduleAction,
  copyFromGermanAction,
  deleteDocAction,
  discardDraftAction,
  publishAction,
  restoreRevisionAction,
  revisionAction,
  saveDraftAction,
  savePatternAction,
  scheduleAction,
  unpublishAction,
} from '../actions';
import { COLLECTIONS, fieldsFor, type Errors } from '../schema';
import { DiffView } from './DiffView';
import { Field, type Relations } from './Fields';
import type { TranslationState } from '../repo';
import type { Locale } from '@/site/i18n/locale';

type Doc = Record<string, unknown>;
const DESKTOP_W = 1280;
type SaveState = 'saved' | 'dirty' | 'saving' | 'error';

export interface EditorProps {
  collection: string;
  id: string;
  /** Sprache dieser Fassung (de = Original, en = Übersetzung). */
  locale: Locale;
  /** Englisch: gibt es schon einen eigenen Entwurf/eine Live-Fassung? Sonst ist `initial` die deutsche Arbeitskopie. */
  startedTranslation: boolean;
  /** Stand der englischen Übersetzung (für den Sprachumschalter). */
  translation?: TranslationState;
  initial: Doc;
  live: boolean;
  hasDraft: boolean;
  isAdmin: boolean;
  relations: Relations;
  revisions: { rid: number; createdAt: number; createdBy: string | null }[];
  publicHref: string | null;
  /** Geplantes Veröffentlichen (ms) — null, wenn nichts geplant ist. */
  scheduledAt: number | null;
  /** Stand beim Laden (updated_at) — für den Konfliktschutz beim Speichern. */
  rev: number;
}

/**
 * Dokument-Editor: links das Formular, rechts die echte Seite als Live-Vorschau (iframe, gleicher Ursprung).
 * Formular ↔ Vorschau synchronisieren per postMessage; Texte lassen sich direkt in der Vorschau bearbeiten.
 * Jede Änderung wird nach 1,2 s als Entwurf gespeichert; „Veröffentlichen“ bringt sie live.
 */
export function DocEditor(props: EditorProps) {
  const { collection, id, locale, isAdmin, relations, revisions, publicHref, translation } = props;
  const en = locale !== 'de';
  const def = COLLECTIONS[collection];
  const router = useRouter();
  const [doc, setDoc] = useState<Doc>(props.initial);
  const [save, setSave] = useState<SaveState>('saved');
  const [live, setLive] = useState(props.live);
  const [hasDraft, setHasDraft] = useState(props.hasDraft);
  const [scheduledAt, setScheduledAt] = useState(props.scheduledAt);
  const [planOpen, setPlanOpen] = useState(false);
  const [compare, setCompare] = useState<{ rid: number; data: Doc } | null>(null);
  const [errors, setErrors] = useState<Errors>({});
  const [msg, setMsg] = useState<{ kind: 'ok' | 'error'; text: string } | null>(null);
  const [device, setDevice] = useState<'desktop' | 'mobile'>('desktop');
  const [busy, start] = useTransition();
  const frame = useRef<HTMLIFrameElement>(null);
  // Desktop-Vorschau in echter Desktop-Breite rendern und auf die Spalte herunterskalieren.
  const box = useRef<HTMLDivElement>(null);
  const [scale, setScale] = useState(1);
  const [boxH, setBoxH] = useState(0);
  useEffect(() => {
    const el = box.current;
    if (!el) return;
    const ro = new ResizeObserver(() => {
      setScale(Math.min(1, el.clientWidth / DESKTOP_W));
      setBoxH(el.clientHeight);
    });
    ro.observe(el);
    return () => ro.disconnect();
  }, []);
  // Neuester Stand für Autosave/Nachrichten; change() setzt ihn zusätzlich sofort (vor dem nächsten Rendern).
  const docRef = useRef(doc);
  useLayoutEffect(() => {
    docRef.current = doc;
  });
  // Konfliktschutz: bekannter Stand; bei Konflikt pausiert das automatische Speichern, bis entschieden ist.
  const revRef = useRef<number | undefined>(props.rev);
  const [conflict, setConflict] = useState<{ by: string | null; at: number } | null>(null);
  const conflictRef = useRef(false);
  /** Ergebnis einer Schreib-Action auswerten: neuen Stand merken bzw. Konflikt anzeigen. */
  const track = (res: { ok: boolean; rev?: number; conflict?: { by: string | null; at: number } }) => {
    if (res.ok && typeof res.rev === 'number') revRef.current = res.rev;
    if (!res.ok && res.conflict) {
      conflictRef.current = true;
      setConflict(res.conflict);
    }
  };
  const timer = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);
  const saveSeq = useRef(0);

  const post = useCallback((d: Doc) => {
    frame.current?.contentWindow?.postMessage({ type: 'ldflow:doc', doc: d }, window.location.origin);
  }, []);

  const saveNow = useCallback(
    async (force = false) => {
      clearTimeout(timer.current);
      if (conflictRef.current && !force) return setSave('dirty');
      const seq = ++saveSeq.current;
      setSave('saving');
      const res = await saveDraftAction(collection, id, docRef.current, force ? undefined : revRef.current, locale);
      track(res);
      if (force && res.ok) {
        conflictRef.current = false;
        setConflict(null);
      }
      if (seq !== saveSeq.current) return; // neuere Änderung unterwegs
      if (res.ok) {
        setSave('saved');
        setHasDraft(true);
        setErrors({});
      } else {
        setSave('error');
        setErrors(('errors' in res && res.errors) || {});
        // Konflikte erklärt das Banner — keine zweite Meldung.
        if (!('conflict' in res && res.conflict)) setMsg({ kind: 'error', text: res.error });
      }
    },
    [collection, id, locale],
  );

  const change = useCallback(
    (next: Doc, fromPreview = false) => {
      setDoc(next);
      docRef.current = next;
      if (!fromPreview) post(next);
      setSave('dirty');
      clearTimeout(timer.current);
      timer.current = setTimeout(() => void saveNow(), 1200);
    },
    [post, saveNow],
  );

  // Nachrichten aus der Vorschau
  useEffect(() => {
    const on = (e: MessageEvent) => {
      if (e.origin !== window.location.origin || e.source !== frame.current?.contentWindow) return;
      const d = e.data as { type?: string; path?: string; value?: unknown };
      if (d?.type === 'ldflow:ready') post(docRef.current);
      if (d?.type === 'ldflow:set' && typeof d.path === 'string') change(setAtPath(docRef.current, d.path, d.value), true);
      // „⚙ Einstellungen“ in der Werkzeugleiste: zum Widget im Formular springen und kurz hervorheben.
      if (d?.type === 'ldflow:focus' && typeof d.path === 'string') {
        const el = document.querySelector<HTMLElement>(`[data-flow-path="${CSS.escape(d.path)}"]`);
        if (el) {
          el.scrollIntoView({ behavior: 'smooth', block: 'start' });
          el.animate([{ boxShadow: '0 0 0 3px #A78BFA' }, { boxShadow: '0 0 0 0 transparent' }], { duration: 1400 });
          el.querySelector<HTMLElement>('input,textarea,select,button')?.focus({ preventScroll: true });
        }
      }
      // „☆ Als Vorlage speichern“
      const pd = e.data as { type?: string; block?: unknown };
      if (pd?.type === 'ldflow:pattern' && pd.block) {
        const title = window.prompt('Name der Vorlage (z. B. „Preis-Abschnitt“):');
        if (!title) return;
        const global = window.confirm(
          'Als GLOBALE Vorlage speichern?\n\nOK = global: kann als Verweis eingefügt werden, Änderungen wirken überall.\nAbbrechen = normale Vorlage: wird beim Einfügen kopiert.',
        );
        void savePatternAction(title, global, pd.block).then((res) => {
          if (res.ok && 'patterns' in res) {
            frame.current?.contentWindow?.postMessage({ type: 'ldflow:patterns', patterns: res.patterns }, window.location.origin);
            setMsg({ kind: 'ok', text: `Vorlage „${title}“ gespeichert — im „+“-Menü unter Vorlagen.` });
          } else if (!res.ok) setMsg({ kind: 'error', text: res.error });
        });
      }
    };
    window.addEventListener('message', on);
    return () => window.removeEventListener('message', on);
  }, [change, post]);

  // Ungespeichertes nicht verlieren
  useEffect(() => {
    const warn = (e: BeforeUnloadEvent) => {
      if (save === 'dirty' || save === 'saving') e.preventDefault();
    };
    window.addEventListener('beforeunload', warn);
    return () => window.removeEventListener('beforeunload', warn);
  }, [save]);

  // ⌘S / Strg+S = sofort speichern
  useEffect(() => {
    const k = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 's') {
        e.preventDefault();
        void saveNow();
      }
    };
    document.addEventListener('keydown', k);
    return () => document.removeEventListener('keydown', k);
  }, [saveNow]);

  const publish = () =>
    start(async () => {
      clearTimeout(timer.current);
      const res = await publishAction(collection, id, docRef.current, conflictRef.current ? -1 : revRef.current, locale);
      track(res);
      if (res.ok) {
        setLive(true);
        setHasDraft(false);
        setScheduledAt(null);
        setSave('saved');
        setErrors({});
        setMsg({ kind: 'ok', text: 'Veröffentlicht — die Site ist aktualisiert.' });
      } else {
        setErrors(('errors' in res && res.errors) || {});
        setMsg({ kind: 'error', text: res.error });
      }
    });

  const schedule = (at: number) =>
    start(async () => {
      clearTimeout(timer.current);
      const res = await scheduleAction(collection, id, at, docRef.current, conflictRef.current ? -1 : revRef.current, locale);
      track(res);
      if (res.ok) {
        setScheduledAt(at);
        setHasDraft(true);
        setSave('saved');
        setErrors({});
        setPlanOpen(false);
        setMsg({ kind: 'ok', text: `Geplant für ${fmtDate(at)}. Spätere Änderungen am Entwurf gehen mit.` });
      } else {
        setErrors(('errors' in res && res.errors) || {});
        setMsg({ kind: 'error', text: res.error });
      }
    });

  const act = (fn: () => Promise<{ ok: boolean; error?: string }>, okText: string, after?: () => void) =>
    start(async () => {
      const res = await fn();
      if (res.ok) {
        setMsg({ kind: 'ok', text: okText });
        after?.();
      } else setMsg({ kind: 'error', text: res.error ?? 'Fehler' });
    });

  const fields = fieldsFor(collection, doc);
  const title = (typeof doc[def.titleField] === 'string' ? (doc[def.titleField] as string) : '') || def.singular || id;
  const status =
    save === 'saving'
      ? 'Speichere …'
      : save === 'dirty'
        ? 'Ungespeichert'
        : save === 'error'
          ? 'Nicht gespeichert'
          : hasDraft
            ? 'Entwurf gespeichert'
            : 'Alles live';

  return (
    <div className="f-editor">
      <section className="f-editor-form" aria-label="Formular">
        <div className="f-editor-bar">
          <div className="f-row" style={{ justifyContent: 'space-between' }}>
            <Link href={def.kind === 'singleton' ? '/flow' : `/flow/c/${collection}`} className="f-btn sm ghost">
              ← {def.kind === 'singleton' ? 'Dashboard' : def.label}
            </Link>
            <span className="f-row" style={{ gap: 6 }}>
              {live ? <span className="f-badge live">● Live</span> : <span className="f-badge off">○ Offline</span>}
              <span className={`f-badge ${hasDraft || save !== 'saved' ? 'draft' : ''}`} aria-live="polite">
                {status}
              </span>
            </span>
          </div>
          <h1 style={{ margin: 0, fontSize: 19, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{title}</h1>
          <LanguageTabs collection={collection} id={id} locale={locale} translation={translation} />
          {en && (
            <TranslationHint
              started={props.startedTranslation}
              live={live}
              outdated={!!translation?.outdated}
              busy={busy}
              onCopy={() =>
                window.confirm(
                  'Englischen Entwurf mit der deutschen Fassung überschreiben? (Bilder und Struktur werden übernommen, Texte danach übersetzen.)',
                ) &&
                act(
                  () => copyFromGermanAction(collection, id, locale),
                  'Deutsche Fassung übernommen.',
                  () => window.location.reload(),
                )
              }
            />
          )}
          <div className="f-row">
            <button className="f-btn primary" type="button" onClick={publish} disabled={busy}>
              Veröffentlichen
            </button>
            <button className="f-btn" type="button" onClick={() => void saveNow()} disabled={busy || save === 'saving'} title="⌘S / Strg+S">
              Entwurf speichern
            </button>
            <button className="f-btn ghost" type="button" onClick={() => setPlanOpen((o) => !o)} aria-expanded={planOpen} disabled={busy}>
              Planen …
            </button>
            {hasDraft && live && (
              <button
                className="f-btn ghost"
                type="button"
                disabled={busy}
                onClick={() =>
                  window.confirm('Entwurf verwerfen und zur Live-Fassung zurückkehren?') &&
                  act(
                    () => discardDraftAction(collection, id, locale),
                    'Entwurf verworfen.',
                    () => window.location.reload(),
                  )
                }
              >
                Verwerfen
              </button>
            )}
          </div>
          {conflict && (
            <div className="f-msg error" role="alert" style={{ margin: 0 }}>
              <strong>{conflict.by ?? 'Jemand'}</strong> hat diesen Eintrag um {fmtDate(conflict.at)} geändert. Automatisches Speichern ist
              angehalten, damit nichts überschrieben wird.
              <span className="f-row" style={{ marginTop: 8, gap: 8 }}>
                <button className="f-btn sm" type="button" onClick={() => window.location.reload()}>
                  Neu laden (meine Änderungen verwerfen)
                </button>
                <button
                  className="f-btn sm danger"
                  type="button"
                  disabled={busy}
                  onClick={() => window.confirm('Die Fassung der anderen Person überschreiben?') && void saveNow(true)}
                >
                  Trotzdem speichern
                </button>
              </span>
            </div>
          )}
          {planOpen && <PlanForm busy={busy} onPlan={schedule} />}
          {scheduledAt && (
            <p className="f-row f-help" style={{ margin: 0, gap: 8 }}>
              <span className="f-badge draft">⏱ Geplant: {fmtDate(scheduledAt)}</span>
              <button
                className="f-btn sm ghost"
                type="button"
                disabled={busy}
                onClick={() =>
                  act(
                    () => cancelScheduleAction(collection, id, locale),
                    'Zeitplan aufgehoben — der Entwurf bleibt erhalten.',
                    () => setScheduledAt(null),
                  )
                }
              >
                Zeitplan aufheben
              </button>
            </p>
          )}
          {msg && (
            <p className={`f-msg ${msg.kind}`} role={msg.kind === 'error' ? 'alert' : 'status'} style={{ margin: 0 }}>
              {msg.text}
            </p>
          )}
        </div>
        <div className="f-editor-fields">
          {fields.map((f) => (
            <Field
              key={f.key}
              f={f}
              value={doc[f.key]}
              path={f.key}
              errors={errors}
              relations={relations}
              onChange={(v) => change({ ...docRef.current, [f.key]: v })}
            />
          ))}
          <details className="f-group" style={{ marginTop: 24 }}>
            <summary style={{ cursor: 'pointer', fontWeight: 600 }}>Versionen ({revisions.length})</summary>
            {revisions.length === 0 && <p className="f-help">Noch keine älteren Versionen — sie entstehen bei jedem Veröffentlichen.</p>}
            <ul style={{ listStyle: 'none', padding: 0, margin: '10px 0 0' }}>
              {revisions.map((r) => (
                <li
                  key={r.rid}
                  className="f-row"
                  style={{ justifyContent: 'space-between', flexWrap: 'wrap', padding: '6px 0', borderTop: '1px solid var(--f-line)' }}
                >
                  <span className="f-help">
                    {new Date(r.createdAt).toLocaleString('de-DE')} · {r.createdBy ?? '—'}
                  </span>
                  <span className="f-row" style={{ gap: 6 }}>
                    <button
                      className="f-btn sm ghost"
                      type="button"
                      disabled={busy}
                      aria-expanded={compare?.rid === r.rid}
                      onClick={() =>
                        compare?.rid === r.rid
                          ? setCompare(null)
                          : start(async () => {
                              const res = await revisionAction(collection, id, r.rid, locale);
                              if (res.ok) setCompare({ rid: r.rid, data: (res as { data: Doc }).data });
                              else setMsg({ kind: 'error', text: res.error });
                            })
                      }
                    >
                      {compare?.rid === r.rid ? 'Vergleich schließen' : 'Vergleichen'}
                    </button>
                    <button
                      className="f-btn sm"
                      type="button"
                      disabled={busy}
                      onClick={() =>
                        window.confirm('Diese Version als Entwurf laden? (Danach prüfen und veröffentlichen.)') &&
                        act(
                          () => restoreRevisionAction(collection, id, r.rid, locale),
                          'Version geladen.',
                          () => window.location.reload(),
                        )
                      }
                    >
                      Als Entwurf laden
                    </button>
                  </span>
                  {compare?.rid === r.rid && (
                    <div style={{ flexBasis: '100%' }}>
                      <p className="f-help f-diff-legend" style={{ margin: '6px 0 0' }}>
                        Diese Version → aktueller Stand im Editor: <ins>hinzugekommen</ins> · <del>weggefallen</del>
                      </p>
                      <DiffView before={compare.data} after={doc} fields={fields} />
                    </div>
                  )}
                </li>
              ))}
            </ul>
          </details>
          {(def.kind === 'collection' || (en && live)) && (
            <div className="f-group" style={{ marginTop: 12 }}>
              <div className="f-group-head">Gefahrenzone</div>
              <div className="f-row">
                {live && (
                  <button
                    className="f-btn sm"
                    type="button"
                    disabled={busy}
                    onClick={() =>
                      window.confirm(
                        en
                          ? 'Englische Fassung von der Site nehmen? /en zeigt dann wieder die deutsche. Der Inhalt bleibt als Entwurf erhalten.'
                          : 'Von der Site nehmen? Der Inhalt bleibt als Entwurf erhalten.',
                      ) &&
                      act(
                        () => unpublishAction(collection, id, locale).then((r) => (track(r), r)),
                        'Offline genommen.',
                        () => {
                          setLive(false);
                          setHasDraft(true);
                        },
                      )
                    }
                  >
                    Offline nehmen
                  </button>
                )}
                {isAdmin && !en && def.kind === 'collection' && (
                  <button
                    className="f-btn sm danger"
                    type="button"
                    disabled={busy}
                    onClick={() =>
                      window.confirm(`„${title}“ endgültig löschen — in allen Sprachen? Das lässt sich nicht rückgängig machen.`) &&
                      act(
                        () => deleteDocAction(collection, id),
                        'Gelöscht.',
                        () => router.push(`/flow/c/${collection}`),
                      )
                    }
                  >
                    Löschen
                  </button>
                )}
              </div>
            </div>
          )}
        </div>
      </section>
      <section className="f-preview" aria-label="Live-Vorschau">
        <div className="f-preview-bar">
          <span>
            Live-Vorschau <span className="f-badge inline">WYSIWYG</span> — gestrichelte Texte direkt anklicken und tippen
          </span>
          <span className="f-row" style={{ gap: 4 }}>
            <button className="f-btn sm" type="button" aria-pressed={device === 'desktop'} onClick={() => setDevice('desktop')}>
              Desktop
            </button>
            <button className="f-btn sm" type="button" aria-pressed={device === 'mobile'} onClick={() => setDevice('mobile')}>
              Mobil
            </button>
            {publicHref && live && (
              <a className="f-btn sm ghost" href={publicHref} target="_blank" rel="noopener">
                Live ansehen ↗
              </a>
            )}
          </span>
        </div>
        <div ref={box} className={`f-preview-frame ${device}`}>
          <iframe
            ref={frame}
            src={`${en ? '/en' : ''}/flow-preview/${collection}/${id}`}
            title="Vorschau"
            onLoad={() => post(docRef.current)}
            style={
              device === 'desktop' && scale < 1
                ? {
                    width: DESKTOP_W,
                    height: boxH / scale,
                    flex: 'none',
                    transform: `scale(${scale})`,
                    transformOrigin: '0 0',
                    alignSelf: 'flex-start',
                  }
                : undefined
            }
          />
        </div>
      </section>
    </div>
  );
}

/** DE | EN — Umschalter zwischen Original und Übersetzung (eigene URL je Sprache: ?lang=en). */
function LanguageTabs({
  collection,
  id,
  locale,
  translation,
}: {
  collection: string;
  id: string;
  locale: Locale;
  translation?: TranslationState;
}) {
  const state = !translation || translation.state === 'none' ? 'fehlt' : translation.state === 'live' ? 'live' : 'Entwurf';
  return (
    <nav className="f-row" aria-label="Sprache der Fassung" style={{ gap: 6 }}>
      <Link href={`/flow/c/${collection}/${id}`} className="f-btn sm" aria-current={locale === 'de' ? 'page' : undefined}>
        Deutsch <span className="f-help">· Original</span>
      </Link>
      <Link href={`/flow/c/${collection}/${id}?lang=en`} className="f-btn sm" aria-current={locale === 'en' ? 'page' : undefined}>
        English <span className="f-help">· {state}</span>
        {translation?.outdated && <span className="f-badge draft">veraltet</span>}
      </Link>
    </nav>
  );
}

/** Hinweise im englischen Editor: Rückfall, veraltete Übersetzung, „Aus Deutsch übernehmen“. */
function TranslationHint({
  started,
  live,
  outdated,
  busy,
  onCopy,
}: {
  started: boolean;
  live: boolean;
  outdated: boolean;
  busy: boolean;
  onCopy: () => void;
}) {
  return (
    <div className="f-msg" role="note" style={{ margin: 0 }}>
      {!started
        ? 'Noch keine englische Fassung — hier steht die deutsche als Ausgangspunkt. Beim ersten Speichern entsteht der englische Entwurf.'
        : live
          ? 'Englische Fassung. Änderungen gehen erst mit „Veröffentlichen“ live.'
          : 'Englischer Entwurf — noch nicht veröffentlicht. Bis dahin zeigt die englische Site (/en) die deutsche Fassung.'}
      {outdated && ' Achtung: Die deutsche Fassung wurde nach der letzten englischen Veröffentlichung geändert — Übersetzung prüfen.'}
      <span className="f-row" style={{ marginTop: 8 }}>
        <button className="f-btn sm ghost" type="button" disabled={busy} onClick={onCopy}>
          Aus Deutsch übernehmen
        </button>
      </span>
    </div>
  );
}

const fmtDate = (ms: number) => new Date(ms).toLocaleString('de-DE', { dateStyle: 'medium', timeStyle: 'short' });

/** `datetime-local` erwartet lokale Zeit ohne Zone: YYYY-MM-DDTHH:MM. */
function localInput(ms: number) {
  const d = new Date(ms);
  const p = (n: number) => String(n).padStart(2, '0');
  return `${d.getFullYear()}-${p(d.getMonth() + 1)}-${p(d.getDate())}T${p(d.getHours())}:${p(d.getMinutes())}`;
}

/** Zeitpunkt wählen (lokale Zeit des Browsers) — der Server prüft Mindestvorlauf und Höchstdauer. */
function PlanForm({ busy, onPlan }: { busy: boolean; onPlan: (at: number) => void }) {
  const [value, setValue] = useState(() => localInput(Date.now() + 60 * 60 * 1000));
  return (
    <form
      className="f-row"
      style={{ gap: 8, alignItems: 'flex-end' }}
      onSubmit={(e) => {
        e.preventDefault();
        const at = new Date(value).getTime();
        if (Number.isFinite(at)) onPlan(at);
      }}
    >
      <div className="f-field" style={{ margin: 0 }}>
        <label htmlFor="plan-at">Veröffentlichen am</label>
        <input id="plan-at" type="datetime-local" value={value} onChange={(e) => setValue(e.target.value)} required />
      </div>
      <button className="f-btn" type="submit" disabled={busy}>
        Einplanen
      </button>
    </form>
  );
}
