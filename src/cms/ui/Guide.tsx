'use client';

import Link from 'next/link';
import { Fragment, useEffect, useMemo, useState, type ReactNode } from 'react';
import { sourceKey, type Chapter, type GuideNode } from '../guide/chapters';

/**
 * Interaktiver Guide in LD Flow: Kapitel-Navigation mit Fortschritt, echte Code-Ausschnitte, Übungen mit Checklisten,
 * Quiz, kopierbare AI-Prompts. Fortschritt bleibt im Browser (localStorage „ldflow-guide“).
 */

export interface SourceExcerpt {
  file: string;
  from: number;
  code: string;
  missing?: boolean;
}

interface Progress {
  read: string[];
  steps: Record<string, number[]>;
  quiz: Record<string, number>;
}

const KEY = 'ldflow-guide';

function useProgress(): [Progress, (fn: (p: Progress) => Progress) => void] {
  const [p, setP] = useState<Progress>({ read: [], steps: {}, quiz: {} });
  useEffect(() => {
    try {
      const raw = JSON.parse(localStorage.getItem(KEY) || 'null');
      if (raw && typeof raw === 'object') setP({ read: raw.read ?? [], steps: raw.steps ?? {}, quiz: raw.quiz ?? {} });
    } catch {
      // kein Speicher verfügbar → Fortschritt nur für diese Sitzung
    }
  }, []);
  const update = (fn: (p: Progress) => Progress) =>
    setP((prev) => {
      const next = fn(prev);
      try {
        localStorage.setItem(KEY, JSON.stringify(next));
      } catch {
        // ignorieren
      }
      return next;
    });
  return [p, update];
}

export function Guide({ chapters, sources }: { chapters: Chapter[]; sources: Record<string, SourceExcerpt> }) {
  const [progress, update] = useProgress();
  const [cur, setCur] = useState(chapters[0].id);
  const [q, setQ] = useState('');

  useEffect(() => {
    const fromHash = () => {
      const id = window.location.hash.slice(1);
      if (chapters.some((c) => c.id === id)) setCur(id);
    };
    fromHash();
    window.addEventListener('hashchange', fromHash);
    return () => window.removeEventListener('hashchange', fromHash);
  }, [chapters]);

  const go = (id: string) => {
    window.history.replaceState(null, '', `#${id}`);
    setCur(id);
    document.getElementById('guide-top')?.scrollIntoView({ block: 'start' });
  };

  const visible = useMemo(() => {
    const n = q.trim().toLowerCase();
    if (!n) return chapters;
    return chapters.filter((c) => (c.title + ' ' + c.lead + ' ' + JSON.stringify(c.nodes)).toLowerCase().includes(n));
  }, [q, chapters]);

  const idx = chapters.findIndex((c) => c.id === cur);
  const ch = chapters[idx];
  const done = progress.read.length;
  const pct = Math.round((done / chapters.length) * 100);
  const isRead = progress.read.includes(ch.id);

  return (
    <div className="g-wrap" id="guide-top">
      <aside className="g-toc" aria-label="Kapitel">
        <div className="f-kicker">Guide · {pct}% gelesen</div>
        <div className="g-bar" role="progressbar" aria-valuenow={pct} aria-valuemin={0} aria-valuemax={100} aria-label="Fortschritt">
          <span style={{ width: `${pct}%` }} />
        </div>
        <input
          className="f-input"
          type="search"
          placeholder="Im Guide suchen …"
          aria-label="Im Guide suchen"
          value={q}
          onChange={(e) => setQ(e.target.value)}
          style={{ margin: '12px 0' }}
        />
        <ol>
          {visible.map((c) => (
            <li key={c.id}>
              <button type="button" aria-current={c.id === cur ? 'page' : undefined} onClick={() => go(c.id)}>
                <span className="f-mono g-n">{c.n}</span>
                <span className="g-t">{c.title}</span>
                {progress.read.includes(c.id) && (
                  <span className="g-check" aria-label="gelesen">
                    ✓
                  </span>
                )}
              </button>
            </li>
          ))}
          {visible.length === 0 && <li className="f-help">Keine Treffer.</li>}
        </ol>
      </aside>

      <article className="g-main" aria-labelledby="g-title">
        <div className="f-kicker">
          Kapitel {ch.n} · ca. {ch.minutes} min
        </div>
        <div className="g-head">
          <h1 id="g-title">{ch.title}</h1>
          <button
            type="button"
            className={`f-btn sm ${isRead ? '' : 'primary'}`}
            aria-pressed={isRead}
            onClick={() => update((p) => ({ ...p, read: isRead ? p.read.filter((x) => x !== ch.id) : [...p.read, ch.id] }))}
          >
            {isRead ? '✓ Gelesen' : 'Als gelesen markieren'}
          </button>
        </div>
        <p className="g-lead">{ch.lead}</p>
        <Nodes nodes={ch.nodes} sources={sources} progress={progress} update={update} />
        <nav className="g-pager" aria-label="Kapitel blättern">
          {idx > 0 ? (
            <button type="button" className="f-btn" onClick={() => go(chapters[idx - 1].id)}>
              ← {chapters[idx - 1].title}
            </button>
          ) : (
            <span />
          )}
          {idx < chapters.length - 1 && (
            <button
              type="button"
              className="f-btn primary"
              onClick={() => {
                update((p) => (p.read.includes(ch.id) ? p : { ...p, read: [...p.read, ch.id] }));
                go(chapters[idx + 1].id);
              }}
            >
              Weiter: {chapters[idx + 1].title} →
            </button>
          )}
        </nav>
      </article>
    </div>
  );
}

// ---------------------------------------------------------------------------------------------------------------

function Nodes({
  nodes,
  sources,
  progress,
  update,
}: {
  nodes: GuideNode[];
  sources: Record<string, SourceExcerpt>;
  progress: Progress;
  update: (fn: (p: Progress) => Progress) => void;
}) {
  return (
    <>
      {nodes.map((n, i) => (
        <Fragment key={i}>
          <Node n={n} sources={sources} progress={progress} update={update} />
        </Fragment>
      ))}
    </>
  );
}

/** **fett**, `code`, [Text](/pfad) */
function Inline({ text }: { text: string }) {
  const parts: ReactNode[] = [];
  const re = /\*\*([^*]+)\*\*|`([^`]+)`|\[([^\]]+)\]\((\/[^)\s]*)\)/g;
  let last = 0;
  let m: RegExpExecArray | null;
  let k = 0;
  while ((m = re.exec(text))) {
    if (m.index > last) parts.push(text.slice(last, m.index));
    if (m[1]) parts.push(<strong key={k++}>{m[1]}</strong>);
    else if (m[2]) parts.push(<code key={k++}>{m[2]}</code>);
    else if (m[3])
      parts.push(
        <Link key={k++} href={m[4]}>
          {m[3]}
        </Link>,
      );
    last = re.lastIndex;
  }
  if (last < text.length) parts.push(text.slice(last));
  return <>{parts}</>;
}

function Node({
  n,
  sources,
  progress,
  update,
}: {
  n: GuideNode;
  sources: Record<string, SourceExcerpt>;
  progress: Progress;
  update: (fn: (p: Progress) => Progress) => void;
}) {
  switch (n.t) {
    case 'p':
      return (
        <p className="g-p">
          <Inline text={n.text} />
        </p>
      );
    case 'h':
      return <h2 className="g-h">{n.text}</h2>;
    case 'list':
      return (
        <ul className="g-list">
          {n.items.map((x, i) => (
            <li key={i}>
              <Inline text={x} />
            </li>
          ))}
        </ul>
      );
    case 'callout':
      return (
        <div className={`g-callout ${n.kind}`} role="note">
          <span aria-hidden className="g-callout-i">
            {n.kind === 'warn' ? '!' : n.kind === 'tip' ? '★' : 'i'}
          </span>
          <div>
            {n.title && <strong>{n.title}</strong>}
            <div>
              <Inline text={n.text} />
            </div>
          </div>
        </div>
      );
    case 'code':
      return <CodeBox title={n.title} code={n.code} />;
    case 'source': {
      const s = sources[sourceKey(n)];
      if (!s) return null;
      return (
        <CodeBox
          title={s.file}
          sub={s.missing ? 'Datei auf diesem Server nicht vorhanden' : `ab Zeile ${s.from}`}
          note={n.note}
          code={s.code}
          startLine={s.from}
        />
      );
    }
    case 'files':
      return (
        <dl className="g-files">
          {n.items.map(([f, d]) => (
            <div key={f}>
              <dt className="f-mono">{f}</dt>
              <dd>{d}</dd>
            </div>
          ))}
        </dl>
      );
    case 'table':
      return (
        <div className="g-table">
          <table className="f-table">
            <thead>
              <tr>
                {n.head.map((h) => (
                  <th key={h}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {n.rows.map((r, i) => (
                <tr key={i}>
                  {r.map((c, k) => (
                    <td key={k}>{k === 0 ? <strong>{c}</strong> : <Inline text={c} />}</td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      );
    case 'steps': {
      const checked = progress.steps[n.id] ?? [];
      const all = checked.length === n.items.length;
      return (
        <section className={`g-steps ${all ? 'done' : ''}`} aria-label={n.title}>
          <div className="g-steps-head">
            <strong>✎ {n.title}</strong>
            <span className="f-mono f-help">
              {checked.length}/{n.items.length}
            </span>
          </div>
          <ol>
            {n.items.map((x, i) => (
              <li key={i}>
                <label>
                  <input
                    type="checkbox"
                    checked={checked.includes(i)}
                    onChange={(e) =>
                      update((p) => {
                        const cur = p.steps[n.id] ?? [];
                        return { ...p, steps: { ...p.steps, [n.id]: e.target.checked ? [...cur, i] : cur.filter((y) => y !== i) } };
                      })
                    }
                  />
                  <span>
                    <Inline text={x} />
                  </span>
                </label>
              </li>
            ))}
          </ol>
        </section>
      );
    }
    case 'prompt':
      return <PromptBox title={n.title} text={n.text} />;
    case 'quiz': {
      const picked = progress.quiz[n.id];
      return (
        <section className="g-quiz" aria-label="Quiz">
          <strong>? {n.q}</strong>
          <div className="g-quiz-opts">
            {n.options.map((o, i) => {
              const state = picked === undefined ? '' : i === n.answer ? 'right' : i === picked ? 'wrong' : '';
              return (
                <button
                  key={i}
                  type="button"
                  className={`f-btn sm ${state}`}
                  aria-pressed={picked === i}
                  onClick={() => update((p) => ({ ...p, quiz: { ...p.quiz, [n.id]: i } }))}
                >
                  {o}
                </button>
              );
            })}
          </div>
          {picked !== undefined && (
            <p className={`g-quiz-why ${picked === n.answer ? 'right' : 'wrong'}`} role="status">
              {picked === n.answer ? 'Richtig. ' : 'Nicht ganz. '}
              {n.why}
            </p>
          )}
        </section>
      );
    }
    case 'diagram':
      return <Diagram kind={n.kind} />;
    case 'more':
      return (
        <details className="g-more">
          <summary>{n.title}</summary>
          <Nodes nodes={n.nodes} sources={sources} progress={progress} update={update} />
        </details>
      );
  }
}

function useCopy(): [boolean, (t: string) => void] {
  const [ok, setOk] = useState(false);
  return [
    ok,
    (t: string) => {
      void navigator.clipboard?.writeText(t).then(() => {
        setOk(true);
        setTimeout(() => setOk(false), 1600);
      });
    },
  ];
}

function CodeBox({ title, sub, note, code, startLine }: { title?: string; sub?: string; note?: string; code: string; startLine?: number }) {
  const [ok, copy] = useCopy();
  const lines = code.split('\n');
  return (
    <figure className="g-code">
      <figcaption>
        <span>
          {title && <span className="f-mono">{title}</span>} {sub && <span className="f-help">· {sub}</span>}
        </span>
        <button type="button" className="f-btn sm ghost" onClick={() => copy(code)}>
          {ok ? '✓ Kopiert' : 'Kopieren'}
        </button>
      </figcaption>
      {note && <p className="g-code-note">{note}</p>}
      <pre>
        <code>
          {lines.map((l, i) => (
            <span key={i} className="g-line">
              {startLine !== undefined && <span className="g-ln">{startLine + i}</span>}
              {l || ' '}
              {'\n'}
            </span>
          ))}
        </code>
      </pre>
    </figure>
  );
}

function PromptBox({ title, text }: { title: string; text: string }) {
  const [ok, copy] = useCopy();
  return (
    <figure className="g-prompt">
      <figcaption>
        <strong>✦ {title}</strong>
        <button type="button" className="f-btn sm primary" onClick={() => copy(text)}>
          {ok ? '✓ Kopiert' : 'Prompt kopieren'}
        </button>
      </figcaption>
      <p>{text}</p>
      <p className="f-help">Platzhalter in &lt;SPITZEN KLAMMERN&gt; vor dem Absenden ersetzen.</p>
    </figure>
  );
}

// ---------------------------------------------------------------------------------------------------------------
// Diagramme (HTML/CSS, barrierearm: Text bleibt lesbar)
// ---------------------------------------------------------------------------------------------------------------

function Box({ title, sub, tone = 'a' }: { title: string; sub?: string; tone?: 'a' | 'b' | 'c' | 'd' }) {
  return (
    <div className={`g-box ${tone}`}>
      <strong>{title}</strong>
      {sub && <span>{sub}</span>}
    </div>
  );
}

const Arrow = ({ label }: { label?: string }) => (
  <div className="g-arrow" aria-hidden={!label}>
    <span>{label}</span>
  </div>
);

function Diagram({ kind }: { kind: 'layers' | 'dataflow' | 'editor' | 'widget' | 'request' }) {
  if (kind === 'layers')
    return (
      <figure className="g-diagram" aria-label="Aufbau des Repos">
        <div className="g-row">
          <Box title="Website" sub="(main) · src/site" tone="a" />
          <Box title="LD Flow." sub="(flow) · src/cms" tone="b" />
          <Box title="ORBIT OS" sub="(orbit) · src/orbit" tone="c" />
        </div>
        <Arrow label="teilen sich" />
        <div className="g-row">
          <Box title="Widgets" sub="src/widgets" tone="d" />
          <Box title="Inhalte" sub="SQLite ← content/*.ts" tone="d" />
          <Box title="Marke" sub="src/components/brand" tone="d" />
        </div>
        <Arrow label="Quelle der Wahrheit" />
        <div className="g-row">
          <Box title="Handoffs" sub="design/ · docs/ (Prototypen)" tone="c" />
        </div>
      </figure>
    );
  if (kind === 'dataflow')
    return (
      <figure className="g-diagram" aria-label="Datenfluss">
        <div className="g-flow">
          <Box title="content/*.ts" sub="Seed (einmalig)" tone="c" />
          <Arrow label="Erststart" />
          <Box title="SQLite" sub="published + draft" tone="b" />
          <Arrow label="getSiteContent()" />
          <Box title="Site-Layout" sub="Server Component" tone="a" />
          <Arrow label="ContentProvider" />
          <Box title="Seiten" sub="useContent()" tone="a" />
        </div>
        <div className="g-flow" style={{ marginTop: 10 }}>
          <Box title="LD Flow" sub="Veröffentlichen" tone="b" />
          <Arrow label="publishDoc()" />
          <Box title="SQLite" sub="+ Version" tone="b" />
          <Arrow label="revalidatePath()" />
          <Box title="Site" sub="neu erzeugt" tone="a" />
        </div>
      </figure>
    );
  if (kind === 'editor')
    return (
      <figure className="g-diagram" aria-label="Editor und Vorschau">
        <div className="g-flow">
          <Box title="Formular" sub="DocEditor" tone="b" />
          <div className="g-arrows">
            <Arrow label="ldflow:doc →" />
            <Arrow label="← ldflow:set / focus / pattern" />
          </div>
          <Box title="Vorschau-iframe" sub="echte Seite + EText + Widget-Hülle" tone="a" />
        </div>
        <div className="g-flow" style={{ marginTop: 10 }}>
          <Box title="Autosave 1,2 s" sub="saveDraftAction" tone="d" />
          <Arrow />
          <Box title="Veröffentlichen" sub="publishAction" tone="d" />
        </div>
      </figure>
    );
  if (kind === 'widget')
    return (
      <figure className="g-diagram" aria-label="Aufbau eines Widgets">
        <div className="g-flow">
          <Box title="defineWidget()" sub="src/widgets/x.tsx" tone="b" />
          <Arrow />
          <div className="g-col">
            <Box title="fields" sub="→ Formular + Validierung" tone="d" />
            <Box title="controls" sub="→ Toolbar-Buttons" tone="d" />
            <Box title="slots" sub="→ verschachtelte Widgets" tone="d" />
            <Box title="render" sub="→ React-Komponente" tone="d" />
          </div>
          <Arrow label="npm run widgets" />
          <Box title="Registry" sub="src/widgets/index.ts" tone="a" />
        </div>
      </figure>
    );
  return (
    <figure className="g-diagram" aria-label="Weg einer Anfrage">
      <div className="g-flow">
        <Box title="Browser" sub="HTTPS · Cookie HttpOnly/Secure" tone="a" />
        <Arrow label="TLS" />
        <Box title="Reverse-Proxy" sub="HTTPS, X-Forwarded-For" tone="c" />
        <Arrow />
        <Box title="proxy.ts" sub="grobe Umleitung ohne Cookie" tone="d" />
        <Arrow />
        <Box title="Server Action" sub="Origin-Prüfung (Next)" tone="b" />
        <Arrow />
        <Box title="repo.ts" sub="requireUser() + Validierung" tone="b" />
        <Arrow label="Prepared Statement" />
        <Box title="SQLite" tone="b" />
      </div>
    </figure>
  );
}
