'use client';

import { useId, type ReactNode } from 'react';
import { EditProvider, ERich } from '@/site/cms/editing';
import { WIDGETS, newBlock, type FieldDef, type MediaRef, type RichText, type Errors } from '../schema';
import { MediaField } from './Media';

/**
 * Formular-Felder für LD Flow, rekursiv aus den Felddefinitionen (src/cms/schema.ts) erzeugt.
 * Jedes Feld bekommt seinen Wert und meldet den neuen Wert — das Dokument setzt der Editor zusammen.
 */

export interface Relations {
  [collection: string]: { id: string; title: string }[];
}

interface FieldProps {
  f: FieldDef;
  value: unknown;
  onChange: (v: unknown) => void;
  path: string;
  errors: Errors;
  relations: Relations;
}

function Wrap({
  f,
  id,
  path,
  errors,
  children,
  group,
}: {
  f: FieldDef;
  id: string;
  path: string;
  errors: Errors;
  children: ReactNode;
  group?: boolean;
}) {
  const err = errors[path];
  const Label = group ? 'div' : 'label';
  return (
    <div className="f-field" role={group ? 'group' : undefined} aria-labelledby={group ? `${id}-l` : undefined}>
      <Label {...(group ? { id: `${id}-l`, className: 'f-label' } : { htmlFor: id })}>
        {f.label}
        {f.required && <span aria-hidden>*</span>}
        {f.inline && (
          <span className="f-badge inline" title="Auch direkt in der Vorschau editierbar" aria-hidden>
            WYSIWYG
          </span>
        )}
      </Label>
      {children}
      {f.help && <span className="f-help">{f.help}</span>}
      {err && (
        <span className="f-err" role="alert">
          {err}
        </span>
      )}
    </div>
  );
}

export function Field({ f, value, onChange, path, errors, relations }: FieldProps) {
  const id = useId();
  const invalid = errors[path] ? true : undefined;
  switch (f.type) {
    case 'text':
    case 'url':
      return (
        <Wrap f={f} id={id} path={path} errors={errors}>
          <input
            id={id}
            type="text"
            inputMode={f.type === 'url' ? 'url' : undefined}
            value={String(value ?? '')}
            maxLength={f.type === 'text' ? f.max : 2000}
            aria-invalid={invalid}
            onChange={(e) => onChange(e.target.value)}
          />
        </Wrap>
      );
    case 'textarea':
      return (
        <Wrap f={f} id={id} path={path} errors={errors}>
          <textarea
            id={id}
            value={String(value ?? '')}
            maxLength={f.max}
            aria-invalid={invalid}
            onChange={(e) => onChange(e.target.value)}
          />
        </Wrap>
      );
    case 'number':
      return (
        <Wrap f={f} id={id} path={path} errors={errors}>
          <input
            id={id}
            type="number"
            min={f.min}
            max={f.max}
            value={value === undefined || value === null ? '' : String(value)}
            aria-invalid={invalid}
            onChange={(e) => onChange(e.target.value === '' ? undefined : Number(e.target.value))}
          />
        </Wrap>
      );
    case 'color':
      return (
        <Wrap f={f} id={id} path={path} errors={errors}>
          <div className="f-row">
            <input
              type="color"
              aria-label={`${f.label} wählen`}
              value={/^#[0-9a-fA-F]{6}$/.test(String(value)) ? String(value) : '#000000'}
              onChange={(e) => onChange(e.target.value.toUpperCase())}
              style={{ width: 44, height: 38, padding: 2, borderRadius: 8, border: '1px solid var(--f-line2)', background: 'var(--f-bg2)' }}
            />
            <input
              id={id}
              type="text"
              value={String(value ?? '')}
              aria-invalid={invalid}
              onChange={(e) => onChange(e.target.value)}
              style={{ flex: 1 }}
            />
          </div>
        </Wrap>
      );
    case 'select':
      return (
        <Wrap f={f} id={id} path={path} errors={errors}>
          <select id={id} value={String(value ?? '')} aria-invalid={invalid} onChange={(e) => onChange(e.target.value)}>
            {f.options.map(([v, l]) => (
              <option key={v} value={v}>
                {l}
              </option>
            ))}
          </select>
        </Wrap>
      );
    case 'boolean':
      return (
        <div className="f-field">
          <label className="f-label" style={{ cursor: 'pointer' }}>
            <input
              type="checkbox"
              checked={value === true}
              onChange={(e) => onChange(e.target.checked)}
              style={{ width: 16, height: 16 }}
            />
            {f.label}
          </label>
        </div>
      );
    case 'strings':
      return (
        <Wrap f={f} id={id} path={path} errors={errors}>
          <textarea
            id={id}
            value={((value as string[]) ?? []).join('\n')}
            aria-invalid={invalid}
            aria-describedby={`${id}-h`}
            onChange={(e) => onChange(e.target.value.split('\n'))}
            onBlur={(e) =>
              onChange(
                e.target.value
                  .split('\n')
                  .map((s) => s.trim())
                  .filter(Boolean),
              )
            }
            style={{ minHeight: 70 }}
          />
          <span className="f-help" id={`${id}-h`}>
            Ein Eintrag pro Zeile{f.max ? ` (max. ${f.max})` : ''}.
          </span>
        </Wrap>
      );
    case 'paragraphs': {
      const arr = (value as string[]) ?? [];
      return (
        <Wrap f={f} id={id} path={path} errors={errors} group>
          {arr.map((p, i) => (
            <div key={i} className="f-group" style={{ padding: 8 }}>
              <div className="f-group-head">
                <span>Absatz {i + 1}</span>
                <ItemTools
                  i={i}
                  n={arr.length}
                  onMove={(j) => onChange(move(arr, i, j))}
                  onRemove={() => onChange(arr.filter((_, k) => k !== i))}
                />
              </div>
              <textarea
                aria-label={`Absatz ${i + 1}`}
                value={p}
                onChange={(e) => onChange(arr.map((x, k) => (k === i ? e.target.value : x)))}
              />
            </div>
          ))}
          <button className="f-btn sm" type="button" onClick={() => onChange([...arr, ''])}>
            + Absatz
          </button>
        </Wrap>
      );
    }
    case 'richtext':
      return (
        <Wrap f={f} id={id} path={path} errors={errors} group>
          <div className="f-rich">
            <EditProvider api={{ set: (_p, v) => onChange(v) }}>
              <ERich path={path} value={value as RichText} />
            </EditProvider>
          </div>
        </Wrap>
      );
    case 'media':
      return (
        <Wrap f={f} id={id} path={path} errors={errors} group>
          <MediaField value={(value as MediaRef | null) ?? null} onChange={onChange} label={f.label} />
        </Wrap>
      );
    case 'gallery': {
      const arr = [0, 1, 2].map((i) => ((value as (MediaRef | null)[]) ?? [])[i] ?? null);
      return (
        <Wrap f={f} id={id} path={path} errors={errors} group>
          {arr.map((m, i) => (
            <div key={i} className="f-group" style={{ padding: 8 }}>
              <div className="f-group-head">{i === 0 ? 'Breit' : `Klein ${i}`}</div>
              <MediaField
                value={m}
                label={`${f.label} ${i + 1}`}
                onChange={(v) => onChange(trimNulls(arr.map((x, k) => (k === i ? v : x)) as (MediaRef | null)[]))}
              />
            </div>
          ))}
        </Wrap>
      );
    }
    case 'relations': {
      const arr = (value as string[]) ?? [];
      const opts = relations[f.collection] ?? [];
      const title = (rid: string) => opts.find((o) => o.id === rid)?.title ?? rid;
      return (
        <Wrap f={f} id={id} path={path} errors={errors}>
          <div className="f-chips">
            {arr.map((rid, i) => (
              <span key={rid} className="f-chip">
                {title(rid)}
                <button
                  type="button"
                  aria-label={`${title(rid)} nach vorn`}
                  disabled={i === 0}
                  onClick={() => onChange(move(arr, i, i - 1))}
                >
                  ←
                </button>
                <button type="button" aria-label={`${title(rid)} entfernen`} onClick={() => onChange(arr.filter((x) => x !== rid))}>
                  ✕
                </button>
              </span>
            ))}
          </div>
          <select
            id={id}
            value=""
            onChange={(e) => e.target.value && onChange([...arr, e.target.value])}
            aria-label={`${f.label} hinzufügen`}
          >
            <option value="">+ hinzufügen …</option>
            {opts
              .filter((o) => !arr.includes(o.id))
              .map((o) => (
                <option key={o.id} value={o.id}>
                  {o.title}
                </option>
              ))}
          </select>
        </Wrap>
      );
    }
    case 'list': {
      const arr = (value as Record<string, unknown>[]) ?? [];
      return (
        <Wrap f={f} id={id} path={path} errors={errors} group>
          {arr.map((item, i) => (
            <div key={i} className="f-group">
              <div className="f-group-head">
                <span>
                  {f.itemLabel} {i + 1}
                </span>
                <ItemTools
                  i={i}
                  n={arr.length}
                  onMove={(j) => onChange(move(arr, i, j))}
                  onRemove={() => onChange(arr.filter((_, k) => k !== i))}
                />
              </div>
              {f.fields.map((sf) => (
                <Field
                  key={sf.key}
                  f={sf}
                  value={item?.[sf.key]}
                  path={`${path}.${i}.${sf.key}`}
                  errors={errors}
                  relations={relations}
                  onChange={(v) => onChange(arr.map((x, k) => (k === i ? { ...x, [sf.key]: v } : x)))}
                />
              ))}
            </div>
          ))}
          <button className="f-btn sm" type="button" onClick={() => onChange([...arr, {}])}>
            + {f.itemLabel}
          </button>
        </Wrap>
      );
    }
    case 'blocks':
      return (
        <Wrap f={f} id={id} path={path} errors={errors} group>
          <BlocksEditor value={value} onChange={onChange} allowed={f.allowed} path={path} errors={errors} relations={relations} />
        </Wrap>
      );
  }
}

type BlockVal = Record<string, unknown> & {
  type: string;
  _id?: string;
  controls?: Record<string, unknown>;
  slots?: Record<string, BlockVal[]>;
};

/** Widget-Liste im Formular (rekursiv für Slots). data-flow-path = Sprungziel für „Einstellungen“ aus der Vorschau. */
function BlocksEditor({
  value,
  onChange,
  allowed,
  path,
  errors,
  relations,
}: {
  value: unknown;
  onChange: (v: unknown) => void;
  allowed: '*' | string[];
  path: string;
  errors: Errors;
  relations: Relations;
}) {
  const arr = (value as BlockVal[]) ?? [];
  const opts = Object.values(WIDGETS).filter((w) => allowed === '*' || allowed.includes(w.id));
  const set = (i: number, b: BlockVal) => onChange(arr.map((x, k) => (k === i ? b : x)));
  return (
    <>
      {arr.map((b, i) => {
        const w = WIDGETS[b.type];
        const p = `${path}.${i}`;
        return (
          <div key={b._id ?? i} className="f-group" data-flow-path={p}>
            <div className="f-group-head">
              <span>
                <span aria-hidden>{w?.icon} </span>
                {w?.label ?? b.type}
              </span>
              <ItemTools
                i={i}
                n={arr.length}
                onMove={(j) => onChange(move(arr, i, j))}
                onRemove={() => onChange(arr.filter((_, k) => k !== i))}
              />
            </div>
            {errors[p] && <span className="f-err">{errors[p]}</span>}
            {w && Object.keys(w.controls).length > 0 && (
              <div className="f-row" style={{ marginBottom: 12 }}>
                {Object.entries(w.controls).map(([ck, c]) => {
                  const cur = b.controls?.[ck] ?? c.default;
                  return c.kind === 'toggle' ? (
                    <button
                      key={ck}
                      type="button"
                      className="f-btn sm"
                      aria-pressed={cur === true}
                      onClick={() => set(i, { ...b, controls: { ...b.controls, [ck]: !cur } })}
                    >
                      {c.label}
                    </button>
                  ) : (
                    <span key={ck} className="f-row" role="group" aria-label={c.label || ck} style={{ gap: 2 }}>
                      {c.options.map(([v, l]) => (
                        <button
                          key={v}
                          type="button"
                          className="f-btn sm"
                          aria-pressed={cur === v}
                          onClick={() => set(i, { ...b, controls: { ...b.controls, [ck]: v } })}
                        >
                          {l}
                        </button>
                      ))}
                    </span>
                  );
                })}
              </div>
            )}
            {w?.fields.map((sf: FieldDef) => (
              <Field
                key={sf.key}
                f={sf}
                value={b[sf.key]}
                path={`${p}.${sf.key}`}
                errors={errors}
                relations={relations}
                onChange={(v) => set(i, { ...b, [sf.key]: v })}
              />
            ))}
            {w &&
              Object.entries(w.slots).map(([sk, sd]) => (
                <div key={sk} className="f-field" role="group" aria-label={sd.label}>
                  <div className="f-label">↳ {sd.label}</div>
                  <div style={{ borderLeft: '2px solid rgba(167,139,250,0.35)', paddingLeft: 10 }}>
                    <BlocksEditor
                      value={b.slots?.[sk] ?? []}
                      onChange={(v) => set(i, { ...b, slots: { ...b.slots, [sk]: v as BlockVal[] } })}
                      allowed={sd.allow}
                      path={`${p}.slots.${sk}`}
                      errors={errors}
                      relations={relations}
                    />
                  </div>
                </div>
              ))}
          </div>
        );
      })}
      <select
        value=""
        aria-label="Widget hinzufügen"
        onChange={(e) => {
          const t = e.target.value;
          if (t) onChange([...arr, newBlock(t)]);
        }}
      >
        <option value="">+ Widget hinzufügen …</option>
        {opts.map((w) => (
          <option key={w.id} value={w.id}>
            {w.icon} {w.label}
          </option>
        ))}
      </select>
    </>
  );
}

function ItemTools({ i, n, onMove, onRemove }: { i: number; n: number; onMove: (j: number) => void; onRemove: () => void }) {
  return (
    <span className="f-row" style={{ gap: 2 }}>
      <button className="f-btn sm ghost" type="button" aria-label="Nach oben" disabled={i === 0} onClick={() => onMove(i - 1)}>
        ↑
      </button>
      <button className="f-btn sm ghost" type="button" aria-label="Nach unten" disabled={i === n - 1} onClick={() => onMove(i + 1)}>
        ↓
      </button>
      <button className="f-btn sm ghost" type="button" aria-label="Entfernen" onClick={onRemove}>
        ✕
      </button>
    </span>
  );
}

function move<T>(arr: T[], i: number, j: number): T[] {
  if (j < 0 || j >= arr.length) return arr;
  const a = [...arr];
  [a[i], a[j]] = [a[j], a[i]];
  return a;
}

function trimNulls(a: (MediaRef | null)[]) {
  const out = [...a];
  while (out.length && !out[out.length - 1]) out.pop();
  return out;
}
