'use client';

import { createContext, useContext, useLayoutEffect, useRef, useState, type CSSProperties, type ReactNode } from 'react';
import { isSafeHref, type RichBlock, type RichInline, type RichText } from '@/cms/schema';
import { RichTextView } from './RichTextView';

/**
 * WYSIWYG-Bausteine für die LD-Flow-Vorschau. Ohne EditProvider rendern sie exakt den bisherigen Text (kein
 * zusätzliches DOM) — die öffentliche Site bleibt unverändert. In der Vorschau werden die Texte direkt auf der
 * Seite editierbar; Änderungen gehen per Callback an den Editor.
 */

export interface EditApi {
  set(path: string, value: unknown): void;
}

const EditCtx = createContext<EditApi | null>(null);

export function EditProvider({ api, children }: { api: EditApi; children: ReactNode }) {
  return <EditCtx.Provider value={api}>{children}</EditCtx.Provider>;
}

export const useEditing = () => useContext(EditCtx) !== null;

const editStyle: CSSProperties = { outline: '1px dashed color-mix(in srgb, #A78BFA 70%, transparent)', outlineOffset: 3, cursor: 'text' };

/** Editierbarer Text. multiline = Absätze mit Zeilenumbrüchen erlaubt. */
export function EText({ path, value, multiline = false }: { path: string; value: string | undefined; multiline?: boolean }) {
  const ed = useContext(EditCtx);
  if (!ed) return <>{value ?? ''}</>;
  return <EditableText api={ed} path={path} value={value ?? ''} multiline={multiline} />;
}

function EditableText({ api, path, value, multiline }: { api: EditApi; path: string; value: string; multiline: boolean }) {
  const ref = useRef<HTMLSpanElement>(null);
  // Unkontrolliert während des Tippens (sonst springt der Cursor); von außen kommende Änderungen übernehmen.
  useLayoutEffect(() => {
    const el = ref.current;
    if (el && document.activeElement !== el && el.innerText !== value) el.innerText = value;
  }, [value]);
  return (
    <span
      ref={ref}
      role="textbox"
      aria-label={`Feld ${path}`}
      aria-multiline={multiline}
      contentEditable="plaintext-only"
      suppressContentEditableWarning
      data-flow-field={path}
      spellCheck
      style={{ ...editStyle, whiteSpace: multiline ? 'pre-wrap' : undefined }}
      onKeyDown={(e) => {
        if (!multiline && e.key === 'Enter') e.preventDefault();
      }}
      onInput={(e) => {
        const t = e.currentTarget.innerText.replace(/ /g, ' ');
        api.set(path, multiline ? t.replace(/\n$/, '') : t.replace(/\n/g, ' '));
      }}
    />
  );
}

// ---------------------------------------------------------------------------------------------------------------
// Rich Text
// ---------------------------------------------------------------------------------------------------------------

/** Editierbarer Rich Text (Absätze, H2/H3, Listen, Zitat, fett/kursiv/Code/Link) — gespeichert als JSON. */
export function ERich({ path, value, style }: { path: string; value: RichText | undefined; style?: CSSProperties }) {
  const ed = useContext(EditCtx);
  if (!ed) return <RichTextView value={value ?? []} style={style} />;
  return <EditableRich api={ed} path={path} value={value ?? []} style={style} />;
}

function EditableRich({ api, path, value, style }: { api: EditApi; path: string; value: RichText; style?: CSSProperties }) {
  const ref = useRef<HTMLDivElement>(null);
  const [focus, setFocus] = useState(false);
  useLayoutEffect(() => {
    const el = ref.current;
    if (!el || document.activeElement === el || el.contains(document.activeElement)) return;
    if (JSON.stringify(domToRich(el)) === JSON.stringify(value)) return;
    el.replaceChildren(...richToDom(value.length ? value : [{ type: 'p', c: [{ t: '' }] }]));
  }, [value]);
  const emit = () => ref.current && api.set(path, domToRich(ref.current));
  const cmd = (c: string, arg?: string) => {
    ref.current?.focus();
    document.execCommand(c, false, arg);
    emit();
  };
  const btn: CSSProperties = {
    font: '600 12px/1 var(--ld-font-sans),sans-serif',
    color: '#F2F5FA',
    background: 'transparent',
    border: 0,
    padding: '6px 8px',
    borderRadius: 6,
    cursor: 'pointer',
  };
  return (
    <div style={{ position: 'relative' }}>
      {focus && (
        <div
          role="toolbar"
          aria-label="Textformat"
          onMouseDown={(e) => e.preventDefault()}
          style={{
            position: 'sticky',
            top: 76,
            zIndex: 80,
            display: 'inline-flex',
            gap: 2,
            marginBottom: 8,
            padding: 3,
            borderRadius: 10,
            background: 'rgba(20,16,32,0.92)',
            border: '1px solid rgba(167,139,250,0.5)',
            boxShadow: '0 8px 24px rgba(0,0,0,0.35)',
          }}
        >
          <button type="button" style={btn} onClick={() => cmd('formatBlock', 'P')}>
            ¶
          </button>
          <button type="button" style={btn} onClick={() => cmd('formatBlock', 'H2')}>
            H2
          </button>
          <button type="button" style={btn} onClick={() => cmd('formatBlock', 'H3')}>
            H3
          </button>
          <button type="button" style={{ ...btn, fontWeight: 800 }} onClick={() => cmd('bold')}>
            B
          </button>
          <button type="button" style={{ ...btn, fontStyle: 'italic' }} onClick={() => cmd('italic')}>
            I
          </button>
          <button type="button" style={btn} onClick={() => cmd('insertUnorderedList')}>
            • Liste
          </button>
          <button type="button" style={btn} onClick={() => cmd('insertOrderedList')}>
            1. Liste
          </button>
          <button type="button" style={btn} onClick={() => cmd('formatBlock', 'BLOCKQUOTE')}>
            “ Zitat
          </button>
          <button
            type="button"
            style={btn}
            onClick={() => {
              const href = window.prompt('Link (https://…, /pfad, mailto:…)');
              if (href === null) return;
              if (href === '') cmd('unlink');
              else if (isSafeHref(href)) cmd('createLink', href);
              else window.alert('Nur https://, mailto:, tel:, /pfad oder #anker.');
            }}
          >
            Link
          </button>
        </div>
      )}
      <div
        ref={ref}
        role="textbox"
        aria-multiline
        aria-label={`Feld ${path}`}
        contentEditable
        suppressContentEditableWarning
        data-flow-field={path}
        style={{ ...style, ...editStyle, minHeight: 40 }}
        onFocus={() => setFocus(true)}
        onBlur={() => {
          setFocus(false);
          emit();
        }}
        onInput={emit}
        onPaste={(e) => {
          // Nur Text einfügen — keine fremden Styles/Skripte aus der Zwischenablage.
          e.preventDefault();
          document.execCommand('insertText', false, e.clipboardData.getData('text/plain'));
        }}
      />
    </div>
  );
}

function inlineToDom(c: RichInline[]): Node[] {
  return c.map((x) => {
    let n: Node = document.createTextNode(x.t);
    if (x.code) n = wrap('code', n);
    if (x.i) n = wrap('em', n);
    if (x.b) n = wrap('strong', n);
    if (x.href) {
      const a = document.createElement('a');
      a.setAttribute('href', x.href);
      a.appendChild(n);
      n = a;
    }
    return n;
  });
}

function wrap(tag: string, n: Node): Node {
  const el = document.createElement(tag);
  el.appendChild(n);
  return el;
}

export function richToDom(v: RichText): Node[] {
  return v.map((b) => {
    if (b.type === 'ul' || b.type === 'ol') {
      const l = document.createElement(b.type);
      for (const it of b.items) {
        const li = document.createElement('li');
        li.append(...inlineToDom(it));
        l.appendChild(li);
      }
      return l;
    }
    const tb = b as Extract<RichBlock, { c: RichInline[] }>;
    const el = document.createElement(tb.type === 'quote' ? 'blockquote' : tb.type);
    el.append(...inlineToDom(tb.c));
    return el;
  });
}

/** DOM → Rich-Text-JSON mit Allowlist; unbekannte Elemente werden zu Text, unsichere Links verworfen. */
export function domToRich(root: HTMLElement): RichText {
  const out: RichText = [];
  const inline = (node: Node, marks: Omit<RichInline, 't'>, acc: RichInline[]) => {
    if (node.nodeType === Node.TEXT_NODE) {
      const t = (node.textContent ?? '').replace(/ /g, ' ');
      if (t) acc.push({ t, ...marks });
      return;
    }
    if (!(node instanceof HTMLElement)) return;
    const tag = node.tagName;
    if (tag === 'BR') {
      acc.push({ t: '\n', ...marks });
      return;
    }
    const m = { ...marks };
    if (tag === 'B' || tag === 'STRONG') m.b = true;
    if (tag === 'I' || tag === 'EM') m.i = true;
    if (tag === 'CODE') m.code = true;
    if (tag === 'A') {
      const href = node.getAttribute('href') ?? '';
      if (isSafeHref(href)) m.href = href;
    }
    node.childNodes.forEach((c) => inline(c, m, acc));
  };
  const merge = (acc: RichInline[]) =>
    acc.reduce<RichInline[]>((r, x) => {
      const last = r[r.length - 1];
      if (last && last.b === x.b && last.i === x.i && last.code === x.code && last.href === x.href) last.t += x.t;
      else r.push({ ...x });
      return r;
    }, []);
  let loose: RichInline[] = [];
  const flush = () => {
    const c = merge(loose);
    if (c.some((x) => x.t.trim())) out.push({ type: 'p', c });
    loose = [];
  };
  root.childNodes.forEach((n) => {
    if (n instanceof HTMLElement && /^(P|DIV|H1|H2|H3|H4|BLOCKQUOTE|UL|OL)$/.test(n.tagName)) {
      flush();
      if (n.tagName === 'UL' || n.tagName === 'OL') {
        const items: RichInline[][] = [];
        n.querySelectorAll(':scope > li').forEach((li) => {
          const acc: RichInline[] = [];
          li.childNodes.forEach((c) => inline(c, {}, acc));
          items.push(merge(acc));
        });
        out.push({ type: n.tagName === 'UL' ? 'ul' : 'ol', items });
        return;
      }
      const acc: RichInline[] = [];
      n.childNodes.forEach((c) => inline(c, {}, acc));
      const c = merge(acc);
      const type =
        n.tagName === 'H1' || n.tagName === 'H2'
          ? 'h2'
          : n.tagName === 'H3' || n.tagName === 'H4'
            ? 'h3'
            : n.tagName === 'BLOCKQUOTE'
              ? 'quote'
              : 'p';
      if (c.some((x) => x.t.trim()) || type !== 'p') out.push({ type, c });
    } else inline(n, {}, loose);
  });
  flush();
  return out;
}

/** Hilfsfunktion für Editor und Vorschau: Wert unter "a.b.0.c" setzen (unveränderlich). */
export function setAtPath<T>(obj: T, path: string, value: unknown): T {
  const keys = path.split('.');
  const rec = (o: unknown, i: number): unknown => {
    const k = keys[i];
    const isIdx = /^\d+$/.test(k);
    const base: Record<string, unknown> | unknown[] = Array.isArray(o) ? [...o] : { ...((o as Record<string, unknown>) ?? {}) };
    const cur = (base as Record<string, unknown>)[k];
    (base as Record<string, unknown>)[k] = i === keys.length - 1 ? value : rec(cur ?? (isIdx ? {} : {}), i + 1);
    return base;
  };
  return rec(obj, 0) as T;
}
