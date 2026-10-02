import type { ComponentType, ReactNode } from 'react';
import type { FieldDef, MediaRef, RichText } from '@/cms/schema';

/**
 * LD Flow — Widgets: eigene Komponenten für den Seiten-Baukasten.
 *
 *   export default defineWidget({
 *     id: 'pricing-card', label: 'Preiskarte', icon: '€',
 *     fields:   { title: text({ inline: true }), price: text() },          // Formular + Validierung + Speicher
 *     controls: { variant: segment(['hell', 'dunkel']), glow: toggle('Hervorheben') }, // Buttons in der Werkzeugleiste
 *     slots:    { inhalt: slot('*') },                                        // verschachtelte Widgets
 *     render:   ({ title, price, controls, slots, path }) => …,              // normale React-Komponente
 *   });
 *
 * Datei in src/widgets/ ablegen → `npm run widgets` (läuft vor dev/build automatisch) nimmt sie in die Registry auf.
 * Widgets entstehen nur im Code: Redakteur:innen konfigurieren und kombinieren, können aber kein Script einschleusen.
 */

// ---------------------------------------------------------------------------------------------------------------
// Feld-Builder (Wert-Typ als Phantom-Typ, damit `render` typisierte Props bekommt)
// ---------------------------------------------------------------------------------------------------------------

/** Omit, das über die Union verteilt (sonst gingen typ-spezifische Felder verloren). */
export type FieldSpec = FieldDef extends infer T ? (T extends unknown ? Omit<T, 'key'> : never) : never;

type Opt = { label?: string; help?: string; required?: boolean; inline?: boolean };

export interface FieldBuilder<T> {
  /** Felddefinition ohne `key` (der kommt aus dem Objektschlüssel). */
  def: FieldSpec;
  /** Nur für die Typableitung. */
  readonly __t?: T;
}

const fb = <T>(def: FieldSpec): FieldBuilder<T> => ({ def });

export const text = (o: Opt & { max?: number } = {}) => fb<string | undefined>({ type: 'text', label: o.label ?? '', ...o });
export const textarea = (o: Opt & { max?: number } = {}) => fb<string | undefined>({ type: 'textarea', label: o.label ?? '', ...o });
export const richtext = (o: Opt = {}) => fb<RichText | undefined>({ type: 'richtext', label: o.label ?? '', ...o });
export const color = (o: Opt = {}) => fb<string | undefined>({ type: 'color', label: o.label ?? '', ...o });
export const link = (o: Opt = {}) => fb<string | undefined>({ type: 'url', label: o.label ?? '', ...o });
export const media = (o: Opt = {}) => fb<MediaRef | undefined>({ type: 'media', label: o.label ?? '', ...o });
export const gallery = (o: Opt = {}) => fb<(MediaRef | null)[] | undefined>({ type: 'gallery', label: o.label ?? '', ...o });
export const strings = (o: Opt & { max?: number } = {}) => fb<string[] | undefined>({ type: 'strings', label: o.label ?? '', ...o });
export const number = (o: Opt & { min?: number; max?: number } = {}) =>
  fb<number | undefined>({ type: 'number', label: o.label ?? '', ...o });
export const checkbox = (o: Opt = {}) => fb<boolean | undefined>({ type: 'boolean', label: o.label ?? '', ...o });
export const choice = <V extends string>(options: readonly (readonly [V, string])[], o: Opt = {}) =>
  fb<V | undefined>({ type: 'select', label: o.label ?? '', options: options.map(([v, l]) => [v, l] as [string, string]), ...o });
export const relations = (collection: string, o: Opt = {}) =>
  fb<string[] | undefined>({ type: 'relations', label: o.label ?? '', collection, ...o });
export const list = <F extends Record<string, FieldBuilder<unknown>>>(fields: F, o: Opt & { itemLabel?: string } = {}) =>
  fb<Values<F>[] | undefined>({
    type: 'list',
    label: o.label ?? '',
    itemLabel: o.itemLabel ?? 'Eintrag',
    fields: toFieldDefs(fields),
    ...o,
  });

export type Values<F extends Record<string, FieldBuilder<unknown>>> = { [K in keyof F]: F[K] extends FieldBuilder<infer T> ? T : never };

export function toFieldDefs(fields: Record<string, FieldBuilder<unknown>>): FieldDef[] {
  return Object.entries(fields).map(([key, b]) => ({ ...b.def, key, label: b.def.label || key }) as FieldDef);
}

// ---------------------------------------------------------------------------------------------------------------
// Controls = Buttons in der Werkzeugleiste über dem Widget (nur vorgegebene Varianten, keine freien Werte)
// ---------------------------------------------------------------------------------------------------------------

export type ControlDef =
  { kind: 'segment'; label: string; options: [string, string][]; default: string } | { kind: 'toggle'; label: string; default: boolean };

export interface ControlBuilder<T> {
  def: ControlDef;
  readonly __t?: T;
}

/** Segment-Buttons, z. B. segment([['hell','Hell'],['dunkel','Dunkel']]) oder kurz segment(['hell','dunkel']). */
export function segment<V extends string>(
  options: readonly (V | readonly [V, string])[],
  o: { label?: string; default?: V } = {},
): ControlBuilder<V> {
  const opts = options.map((x) => (typeof x === 'string' ? ([x, x] as [string, string]) : ([x[0], x[1]] as [string, string])));
  return { def: { kind: 'segment', label: o.label ?? '', options: opts, default: o.default ?? opts[0][0] } };
}

export function toggle(label: string, o: { default?: boolean } = {}): ControlBuilder<boolean> {
  return { def: { kind: 'toggle', label, default: o.default ?? false } };
}

export type ControlValues<C extends Record<string, ControlBuilder<unknown>>> = {
  [K in keyof C]: C[K] extends ControlBuilder<infer T> ? T : never;
};

/** Controls als Felder (für Validierung und Formular). */
export function controlFieldDefs(controls: Record<string, ControlDef>): FieldDef[] {
  return Object.entries(controls).map(([key, c]) =>
    c.kind === 'segment' ? { key, label: c.label || key, type: 'select', options: c.options } : { key, label: c.label, type: 'boolean' },
  );
}

// ---------------------------------------------------------------------------------------------------------------
// Slots = Bereiche für verschachtelte Widgets
// ---------------------------------------------------------------------------------------------------------------

export interface SlotDef {
  label: string;
  /** '*' = alle Widgets, sonst erlaubte Widget-IDs. */
  allow: '*' | string[];
  max?: number;
}

export const slot = (allow: '*' | string[] = '*', o: { label?: string; max?: number } = {}): SlotDef => ({
  allow,
  label: o.label ?? '',
  max: o.max,
});

// ---------------------------------------------------------------------------------------------------------------
// defineWidget
// ---------------------------------------------------------------------------------------------------------------

export interface WidgetRenderProps {
  /** Pfad des Widgets im Dokument (für EText/ERich: `${path}.feld`). */
  path: string;
  /** Akzentfarbe des umgebenden Seitentyps. */
  accent: string;
}

export interface WidgetDef<
  F extends Record<string, FieldBuilder<unknown>> = Record<string, FieldBuilder<unknown>>,
  C extends Record<string, ControlBuilder<unknown>> = Record<string, ControlBuilder<unknown>>,
  S extends Record<string, SlotDef> = Record<string, SlotDef>,
> {
  id: string;
  label: string;
  /** Kurzes Symbol (Emoji/Zeichen) für Auswahl und Werkzeugleiste. */
  icon: string;
  description?: string;
  /** Gruppe in der Widget-Auswahl. */
  group?: 'Text' | 'Medien' | 'Layout' | 'Inhalte' | 'Aktion';
  fields?: F;
  controls?: C;
  slots?: S;
  render: ComponentType<Values<F> & WidgetRenderProps & { controls: ControlValues<C>; slots: { [K in keyof S]: ReactNode } }>;
}

/** Laufzeitform in der Registry. */
export interface RegisteredWidget {
  id: string;
  label: string;
  icon: string;
  description?: string;
  group: string;
  fields: FieldDef[];
  controls: Record<string, ControlDef>;
  controlFields: FieldDef[];
  slots: Record<string, SlotDef>;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  render: ComponentType<any>;
}

export function defineWidget<
  F extends Record<string, FieldBuilder<unknown>> = Record<never, FieldBuilder<unknown>>,
  C extends Record<string, ControlBuilder<unknown>> = Record<never, ControlBuilder<unknown>>,
  S extends Record<string, SlotDef> = Record<never, SlotDef>,
>(w: WidgetDef<F, C, S>): RegisteredWidget {
  if (!/^[a-z][a-z0-9-]{1,40}$/.test(w.id)) throw new Error(`Widget-ID ungültig: ${w.id}`);
  const controls = Object.fromEntries(Object.entries(w.controls ?? {}).map(([k, c]) => [k, c.def]));
  const slots = Object.fromEntries(Object.entries(w.slots ?? {}).map(([k, s]) => [k, { ...s, label: s.label || k }]));
  return {
    id: w.id,
    label: w.label,
    icon: w.icon,
    description: w.description,
    group: w.group ?? 'Inhalte',
    fields: toFieldDefs(w.fields ?? {}),
    controls,
    controlFields: controlFieldDefs(controls),
    slots,
    render: w.render,
  };
}

/** Standardwerte der Controls (für neue Widgets und fehlende Werte). */
export function controlDefaults(w: RegisteredWidget): Record<string, unknown> {
  return Object.fromEntries(Object.entries(w.controls).map(([k, c]) => [k, c.default]));
}
