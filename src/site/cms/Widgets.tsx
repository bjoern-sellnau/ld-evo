'use client';

import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
  useSyncExternalStore,
  type CSSProperties,
  type PointerEvent as ReactPointerEvent,
  type ReactNode,
} from 'react';
import { WIDGETS, newBlock } from '@/cms/schema';
import type { RegisteredWidget } from '@/widgets/define';
import { useEditing } from './editing';

/**
 * Rendert Widget-Listen (Seiten-Inhalte und Slots). Öffentlich: nur die Komponenten. In der LD-Flow-Vorschau
 * zusätzlich die Widget-Hülle: Klick wählt aus, die Werkzeugleiste zeigt die Controls des Widgets (Buttons aus
 * defineWidget → controls) sowie Verschieben, Duplizieren, Einstellungen, Als Vorlage, Löschen; „+“ fügt ein;
 * Ziehen am Griff verschiebt — auch in und aus Slots.
 */

export interface Block {
  type: string;
  _id: string;
  controls?: Record<string, unknown>;
  slots?: Record<string, Block[]>;
  [k: string]: unknown;
}

export interface Pattern {
  id: string;
  title: string;
  blocks: Block[];
  global?: boolean;
}

/** Bearbeitungsfunktionen (nur in der Vorschau vorhanden). */
export interface WidgetEditApi {
  doc: Record<string, unknown>;
  set(path: string, value: unknown): void;
  focus(path: string): void;
  savePattern(block: Block): void;
  patterns: Pattern[];
}

const WEditCtx = createContext<WidgetEditApi | null>(null);
export const WidgetEditProvider = WEditCtx.Provider;

const AccentCtx = createContext('var(--accent)');

// ---------------------------------------------------------------------------------------------------------------
// Pfad-Hilfen: Operationen laufen auf einer Kopie des Wurzel-Arrays (z. B. „blocks“) und ersetzen es als Ganzes —
// so bleiben Indizes auch bei Verschieben zwischen Listen korrekt.
// ---------------------------------------------------------------------------------------------------------------

function getAt(obj: unknown, path: string): unknown {
  return path.split('.').reduce<unknown>((o, k) => (o && typeof o === 'object' ? (o as Record<string, unknown>)[k] : undefined), obj);
}

function mutate(api: WidgetEditApi, anyPath: string, fn: (root: Record<string, unknown>) => void) {
  const rootKey = anyPath.split('.')[0];
  const clone = structuredClone({ [rootKey]: api.doc[rootKey] ?? [] }) as Record<string, unknown>;
  fn(clone);
  api.set(rootKey, clone[rootKey]);
}

const list = (root: Record<string, unknown>, listPath: string) => {
  const l = getAt(root, listPath);
  return Array.isArray(l) ? (l as Block[]) : null;
};

function reId(b: Block): Block {
  const fresh = newBlock(b.type) as Block;
  return {
    ...b,
    _id: fresh._id,
    slots: b.slots ? Object.fromEntries(Object.entries(b.slots).map(([k, v]) => [k, v.map(reId)])) : undefined,
  };
}

// ---------------------------------------------------------------------------------------------------------------
// Ziehen per Pointer-Events (Maus, Touch, Stift) — HTML5-Drag funktioniert auf Touch-Geräten nicht.
// ---------------------------------------------------------------------------------------------------------------

interface FrameInfo {
  listPath: string;
  index: number;
  allow: '*' | string[];
}
/** Alle sichtbaren Widget-Hüllen: Pfad → Position in ihrer Liste (für das Ablegen). */
const frames = new Map<string, FrameInfo>();

interface DragState {
  src: { list: string; index: number; path: string } | null;
  target: { path: string; where: 'before' | 'after' } | null;
}
let drag: DragState = { src: null, target: null };
const dragSubs = new Set<() => void>();
const setDrag = (d: DragState) => {
  drag = d;
  dragSubs.forEach((f) => f());
};
const useDrag = () =>
  useSyncExternalStore(
    (f) => {
      dragSubs.add(f);
      return () => void dragSubs.delete(f);
    },
    () => drag,
    () => drag,
  );

function startDrag(e: ReactPointerEvent, src: { list: string; index: number; path: string }, api: WidgetEditApi, onDone: () => void) {
  if (e.button !== 0) return;
  e.preventDefault();
  e.stopPropagation();
  setDrag({ src, target: null });
  const prevCursor = document.body.style.cursor;
  document.body.style.cursor = 'grabbing';
  const move = (ev: PointerEvent) => {
    // Rand-Scrollen
    if (ev.clientY < 70) window.scrollBy(0, -14);
    else if (ev.clientY > window.innerHeight - 70) window.scrollBy(0, 14);
    const el = document.elementFromPoint(ev.clientX, ev.clientY)?.closest('[data-widget-path]') as HTMLElement | null;
    const tp = el?.dataset.widgetPath;
    if (!el || !tp || tp === src.path || tp.startsWith(src.path + '.') || !frames.has(tp)) {
      if (drag.target) setDrag({ ...drag, target: null });
      return;
    }
    const r = el.getBoundingClientRect();
    const where = ev.clientY < r.top + r.height / 2 ? 'before' : 'after';
    if (drag.target?.path !== tp || drag.target.where !== where) setDrag({ ...drag, target: { path: tp, where } });
  };
  const end = (commit: boolean) => {
    window.removeEventListener('pointermove', move);
    window.removeEventListener('pointerup', up);
    window.removeEventListener('pointercancel', cancel);
    window.removeEventListener('keydown', key);
    document.body.style.cursor = prevCursor;
    const t = drag.target;
    setDrag({ src: null, target: null });
    onDone();
    if (!commit || !t) return;
    const dest = frames.get(t.path);
    if (!dest) return;
    mutate(api, dest.listPath, (root) => {
      const from = list(root, src.list);
      const to = list(root, dest.listPath);
      if (!from || !to) return;
      const moving = from[src.index];
      if (!moving || (dest.allow !== '*' && !dest.allow.includes(moving.type))) return;
      let at = dest.index + (t.where === 'after' ? 1 : 0);
      from.splice(src.index, 1);
      if (from === to && src.index < at) at--;
      to.splice(at, 0, moving);
    });
  };
  const up = () => end(true);
  const cancel = () => end(false);
  const key = (ev: KeyboardEvent) => ev.key === 'Escape' && end(false);
  window.addEventListener('pointermove', move);
  window.addEventListener('pointerup', up);
  window.addEventListener('pointercancel', cancel);
  window.addEventListener('keydown', key);
}

// ---------------------------------------------------------------------------------------------------------------

export function WidgetList({
  blocks,
  path,
  allow = '*',
  accent,
}: {
  blocks: Block[] | undefined;
  path: string;
  allow?: '*' | string[];
  accent?: string;
}) {
  const parentAccent = useContext(AccentCtx);
  const edit = useContext(WEditCtx);
  const editing = useEditing();
  const items = blocks ?? [];
  const body = (
    <>
      {items.map((b, i) => {
        const w = WIDGETS[b.type];
        if (!w) return null;
        const p = `${path}.${i}`;
        const inner = <WidgetView w={w} b={b} path={p} />;
        return edit && editing ? (
          <WidgetFrame key={b._id} w={w} b={b} path={p} listPath={path} index={i} count={items.length} allow={allow} api={edit}>
            {inner}
          </WidgetFrame>
        ) : (
          <section key={b._id} style={{ marginTop: i === 0 ? 0 : 28 }}>
            {inner}
          </section>
        );
      })}
      {edit && editing && <Inserter api={edit} listPath={path} index={items.length} allow={allow} empty={items.length === 0} />}
    </>
  );
  return <AccentCtx.Provider value={accent ?? parentAccent}>{body}</AccentCtx.Provider>;
}

function WidgetView({ w, b, path }: { w: RegisteredWidget; b: Block; path: string }) {
  const accent = useContext(AccentCtx);
  const Render = w.render;
  const controls = { ...Object.fromEntries(Object.entries(w.controls).map(([k, c]) => [k, c.default])), ...b.controls };
  const slots = Object.fromEntries(
    Object.entries(w.slots).map(([k, s]) => [k, <WidgetList key={k} blocks={b.slots?.[k]} path={`${path}.slots.${k}`} allow={s.allow} />]),
  );
  const values = Object.fromEntries(w.fields.map((f) => [f.key, b[f.key]]));
  return <Render {...values} controls={controls} slots={slots} path={path} accent={accent} />;
}

// ---------------------------------------------------------------------------------------------------------------
// Widget-Hülle (nur Vorschau)
// ---------------------------------------------------------------------------------------------------------------

const violet = '#A78BFA';
const bar: CSSProperties = {
  position: 'absolute',
  left: -1,
  bottom: 'calc(100% + 6px)',
  zIndex: 90,
  display: 'flex',
  flexWrap: 'wrap',
  alignItems: 'center',
  gap: 2,
  padding: 3,
  borderRadius: 10,
  background: 'rgba(20,16,32,0.96)',
  border: `1px solid ${violet}80`,
  boxShadow: '0 10px 28px rgba(0,0,0,0.4)',
  font: '600 12px/1 var(--ld-font-sans),sans-serif',
  color: '#F2EEFB',
  whiteSpace: 'nowrap',
};
const tb = (on = false): CSSProperties => ({
  font: 'inherit',
  color: on ? '#160D2B' : '#F2EEFB',
  background: on ? violet : 'transparent',
  border: 0,
  borderRadius: 7,
  padding: '6px 8px',
  cursor: 'pointer',
});

function WidgetFrame({
  w,
  b,
  path,
  listPath,
  index,
  count,
  allow,
  api,
  children,
}: {
  w: RegisteredWidget;
  b: Block;
  path: string;
  listPath: string;
  index: number;
  count: number;
  allow: '*' | string[];
  api: WidgetEditApi;
  children: ReactNode;
}) {
  const [sel, setSel] = useSelection();
  const [hover, setHover] = useState(false);
  const d = useDrag();
  const dragging = d.src?.path === path;
  const drop = d.target?.path === path ? d.target.where : null;
  const selected = sel === path;
  useEffect(() => {
    frames.set(path, { listPath, index, allow });
    return () => void frames.delete(path);
  }, [path, listPath, index, allow]);
  const parentPath = listPath.includes('.slots.') ? listPath.slice(0, listPath.lastIndexOf('.slots.')) : null;

  const op = (fn: (l: Block[]) => void) =>
    mutate(api, listPath, (root) => {
      const l = list(root, listPath);
      if (l) fn(l);
    });

  return (
    <>
      <Inserter api={api} listPath={listPath} index={index} allow={allow} />
      <section
        data-widget-path={path}
        onClick={(e) => {
          e.stopPropagation();
          setSel(path);
        }}
        onMouseOver={(e) => {
          e.stopPropagation();
          setHover(true);
        }}
        onMouseOut={() => setHover(false)}
        style={{
          position: 'relative',
          marginTop: 12,
          outline: selected ? `2px solid ${violet}` : hover ? `1px dashed ${violet}99` : '1px dashed transparent',
          outlineOffset: 6,
          borderRadius: 6,
          boxShadow: drop === 'before' ? `0 -4px 0 -1px ${violet}` : drop === 'after' ? `0 4px 0 -1px ${violet}` : undefined,
        }}
      >
        {(selected || hover || dragging) && (
          <div
            role="toolbar"
            aria-label={`${w.label} bearbeiten`}
            style={{ ...bar, opacity: selected ? 1 : 0.85 }}
            onClick={(e) => e.stopPropagation()}
          >
            <span
              data-drag-handle
              onPointerDown={(e) => startDrag(e, { list: listPath, index, path }, api, () => setSel(null))}
              title="Ziehen zum Verschieben (Esc bricht ab)"
              style={{ ...tb(), cursor: 'grab', touchAction: 'none' }}
            >
              ⋮⋮
            </span>
            {parentPath && (
              <button
                type="button"
                title="Übergeordnetes Widget auswählen"
                aria-label="Übergeordnetes auswählen"
                style={tb()}
                onClick={() => setSel(parentPath)}
              >
                ↥
              </button>
            )}
            <span style={{ padding: '0 6px' }}>
              {w.icon} {w.label}
            </span>
            {selected &&
              Object.entries(w.controls).map(([ck, c]) => {
                const cur = b.controls?.[ck] ?? c.default;
                return c.kind === 'toggle' ? (
                  <button
                    key={ck}
                    type="button"
                    aria-pressed={cur === true}
                    style={tb(cur === true)}
                    onClick={() => api.set(`${path}.controls.${ck}`, !cur)}
                  >
                    {c.label}
                  </button>
                ) : (
                  <span
                    key={ck}
                    role="group"
                    aria-label={c.label || ck}
                    style={{ display: 'inline-flex', borderLeft: '1px solid #ffffff22', paddingLeft: 2 }}
                  >
                    {c.options.map(([v, l]) => (
                      <button
                        key={v}
                        type="button"
                        aria-pressed={cur === v}
                        style={tb(cur === v)}
                        onClick={() => api.set(`${path}.controls.${ck}`, v)}
                      >
                        {l}
                      </button>
                    ))}
                  </span>
                );
              })}
            {selected && (
              <>
                <span style={{ width: 1, alignSelf: 'stretch', background: '#ffffff22', margin: '0 2px' }} />
                <button
                  type="button"
                  title="Nach oben"
                  aria-label="Nach oben"
                  style={tb()}
                  disabled={index === 0}
                  onClick={() => op((l) => l.splice(index - 1, 0, ...l.splice(index, 1)))}
                >
                  ↑
                </button>
                <button
                  type="button"
                  title="Nach unten"
                  aria-label="Nach unten"
                  style={tb()}
                  disabled={index === count - 1}
                  onClick={() => op((l) => l.splice(index + 1, 0, ...l.splice(index, 1)))}
                >
                  ↓
                </button>
                <button
                  type="button"
                  title="Duplizieren"
                  aria-label="Duplizieren"
                  style={tb()}
                  onClick={() => op((l) => l.splice(index + 1, 0, reId(structuredClone(l[index]))))}
                >
                  ⧉
                </button>
                <button
                  type="button"
                  title="Einstellungen im Formular"
                  aria-label="Einstellungen"
                  style={tb()}
                  onClick={() => api.focus(path)}
                >
                  ⚙
                </button>
                <button
                  type="button"
                  title="Als Vorlage speichern"
                  aria-label="Als Vorlage speichern"
                  style={tb()}
                  onClick={() => api.savePattern(b)}
                >
                  ☆
                </button>
                <button
                  type="button"
                  title="Löschen"
                  aria-label="Löschen"
                  style={{ ...tb(), color: '#FF8A96' }}
                  onClick={() => {
                    op((l) => l.splice(index, 1));
                    setSel(null);
                  }}
                >
                  ✕
                </button>
              </>
            )}
          </div>
        )}
        {children}
      </section>
    </>
  );
}

// ---------------------------------------------------------------------------------------------------------------
// Einfügen („+“ zwischen Widgets)
// ---------------------------------------------------------------------------------------------------------------

function Inserter({
  api,
  listPath,
  index,
  allow,
  empty,
}: {
  api: WidgetEditApi;
  listPath: string;
  index: number;
  allow: '*' | string[];
  empty?: boolean;
}) {
  const [open, setOpen] = useState(false);
  const [hover, setHover] = useState(false);
  const opts = useMemo(() => Object.values(WIDGETS).filter((w) => allow === '*' || allow.includes(w.id)), [allow]);
  const groups = useMemo(() => {
    const g: Record<string, RegisteredWidget[]> = {};
    for (const w of opts) (g[w.group] ??= []).push(w);
    return g;
  }, [opts]);
  const insert = (blocks: Block[]) =>
    mutate(api, listPath, (root) => {
      let l = list(root, listPath);
      if (!l) {
        // Slot existiert noch nicht → anlegen
        const parts = listPath.split('.');
        const key = parts.pop()!;
        const parent = getAt(root, parts.join('.')) as Record<string, unknown> | undefined;
        if (!parent) return;
        parent[key] = [];
        l = parent[key] as Block[];
      }
      l.splice(index, 0, ...blocks);
    });
  const patterns = api.patterns.filter((p) => allow === '*' || p.blocks.every((b) => allow.includes(b.type)));
  return (
    <div
      style={{ position: 'relative', height: empty ? 'auto' : 14, margin: empty ? '8px 0' : '4px 0', zIndex: open ? 95 : 1 }}
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
      onClick={(e) => e.stopPropagation()}
    >
      <button
        type="button"
        aria-label="Widget einfügen"
        aria-expanded={open}
        onClick={() => setOpen((o) => !o)}
        style={{
          display: 'block',
          width: '100%',
          height: empty ? 56 : 14,
          border: empty ? `1px dashed ${violet}` : 0,
          borderRadius: 10,
          background: empty ? `${violet}12` : 'transparent',
          cursor: 'pointer',
          color: violet,
          font: '600 12px var(--ld-font-sans),sans-serif',
          opacity: empty || hover || open ? 1 : 0,
          transition: 'opacity 0.15s',
          backgroundImage: empty ? undefined : `linear-gradient(${violet},${violet})`,
          backgroundSize: '100% 2px',
          backgroundPosition: 'center',
          backgroundRepeat: 'no-repeat',
        }}
      >
        <span style={{ background: '#160D2B', padding: '2px 10px', borderRadius: 999, border: `1px solid ${violet}` }}>
          + {empty ? 'Widget hinzufügen' : ''}
        </span>
      </button>
      {open && (
        <div
          role="menu"
          style={{
            position: 'absolute',
            left: '50%',
            top: '100%',
            transform: 'translateX(-50%)',
            width: 'min(560px, 92vw)',
            maxHeight: 420,
            overflow: 'auto',
            padding: 12,
            borderRadius: 14,
            background: 'rgba(20,16,32,0.98)',
            border: `1px solid ${violet}80`,
            boxShadow: '0 18px 40px rgba(0,0,0,0.5)',
            color: '#F2EEFB',
            font: '13px/1.4 var(--ld-font-sans),sans-serif',
          }}
        >
          {Object.entries(groups).map(([g, ws]) => (
            <div key={g} style={{ marginBottom: 10 }}>
              <div
                style={{
                  font: '600 10px var(--ld-font-mono),monospace',
                  letterSpacing: '0.14em',
                  color: '#8F86A3',
                  margin: '0 0 6px',
                  textTransform: 'uppercase',
                }}
              >
                {g}
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(150px,1fr))', gap: 6 }}>
                {ws.map((w) => (
                  <button
                    key={w.id}
                    role="menuitem"
                    type="button"
                    title={w.description}
                    onClick={() => {
                      insert([newBlock(w.id) as Block]);
                      setOpen(false);
                    }}
                    style={{ ...tb(), textAlign: 'left', background: '#ffffff0a', padding: '9px 10px' }}
                  >
                    <span aria-hidden style={{ marginRight: 6 }}>
                      {w.icon}
                    </span>
                    {w.label}
                  </button>
                ))}
              </div>
            </div>
          ))}
          {patterns.length > 0 && (
            <div>
              <div
                style={{ font: '600 10px var(--ld-font-mono),monospace', letterSpacing: '0.14em', color: '#8F86A3', margin: '4px 0 6px' }}
              >
                VORLAGEN
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(150px,1fr))', gap: 6 }}>
                {patterns.map((p) => (
                  <span key={p.id} style={{ display: 'flex', gap: 4 }}>
                    <button
                      role="menuitem"
                      type="button"
                      title="Als unabhängige Kopie einfügen"
                      onClick={() => {
                        insert(structuredClone(p.blocks).map(reId));
                        setOpen(false);
                      }}
                      style={{ ...tb(), flex: 1, textAlign: 'left', background: '#ffffff0a', padding: '9px 10px' }}
                    >
                      ☆ {p.title}
                    </button>
                    {p.global && (
                      <button
                        role="menuitem"
                        type="button"
                        title="Global einfügen — Änderungen an der Vorlage wirken überall"
                        onClick={() => {
                          insert([{ ...(newBlock('pattern') as Block), ref: p.id }]);
                          setOpen(false);
                        }}
                        style={{ ...tb(), background: '#ffffff0a' }}
                      >
                        🔗
                      </button>
                    )}
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

// ---------------------------------------------------------------------------------------------------------------
// Auswahl (eine pro Vorschau)
// ---------------------------------------------------------------------------------------------------------------

let selected: string | null = null;
const subs = new Set<() => void>();
const subscribe = (f: () => void) => {
  subs.add(f);
  return () => void subs.delete(f);
};
const setSelected = (v: string | null) => {
  selected = v;
  subs.forEach((f) => f());
};

function useSelection(): [string | null, (v: string | null) => void] {
  const v = useSyncExternalStore(
    subscribe,
    () => selected,
    () => null,
  );
  return [v, setSelected];
}

/** Klick ins Leere hebt die Auswahl auf. */
export function clearWidgetSelection() {
  setSelected(null);
}

// ---------------------------------------------------------------------------------------------------------------
// Globale Vorlagen: Zyklus-Schutz (Vorlage A enthält Verweis auf A bzw. A → B → A)
// ---------------------------------------------------------------------------------------------------------------

const PatternStack = createContext<string[]>([]);

export function PatternScope({ id, children, fallback }: { id: string; children: ReactNode; fallback: ReactNode }) {
  const stack = useContext(PatternStack);
  if (stack.includes(id) || stack.length > 4) return <>{fallback}</>;
  return <PatternStack.Provider value={[...stack, id]}>{children}</PatternStack.Provider>;
}
