/**
 * LD Flow. — Inhaltsmodell (client- und serverseitig nutzbar, ohne Seiteneffekte).
 *
 * Alles, was das CMS bearbeiten kann, ist hier deklarativ beschrieben: Collections (Projekte, Artikel, …),
 * Singletons (Startseite, Über mich), Seiten-Templates und Inhaltsblöcke. Das Admin-Formular, die Validierung
 * auf dem Server und die WYSIWYG-Vorschau lesen dieselben Definitionen. Einen neuen Seitentyp anlegen =
 * einen Eintrag in PAGE_TEMPLATES ergänzen und in src/site/cms/PageRenderer.tsx eine Darstellung registrieren
 * (siehe docs/LD-FLOW.md).
 */

import { WIDGETS } from '@/widgets';
import { controlDefaults } from '@/widgets/define';
import { isSafeHref, isSafeMediaSrc } from './safe';
import { LOCALE_RESERVED_SLUGS } from '@/site/i18n/locale';

export { isSafeHref, isSafeMediaSrc };

// ---------------------------------------------------------------------------------------------------------------
// Felder
// ---------------------------------------------------------------------------------------------------------------

interface FieldBase {
  key: string;
  label: string;
  help?: string;
  required?: boolean;
  /** In der Vorschau direkt auf der Seite editierbar (WYSIWYG). */
  inline?: boolean;
}

export type FieldDef =
  | (FieldBase & { type: 'text'; max?: number })
  | (FieldBase & { type: 'textarea'; max?: number })
  | (FieldBase & { type: 'richtext' })
  | (FieldBase & { type: 'color' })
  | (FieldBase & { type: 'select'; options: [string, string][] })
  | (FieldBase & { type: 'boolean' })
  | (FieldBase & { type: 'number'; min?: number; max?: number })
  | (FieldBase & { type: 'url' })
  | (FieldBase & { type: 'media' })
  | (FieldBase & { type: 'gallery' })
  | (FieldBase & { type: 'strings'; max?: number })
  | (FieldBase & { type: 'paragraphs' })
  | (FieldBase & { type: 'list'; fields: FieldDef[]; itemLabel: string })
  | (FieldBase & { type: 'blocks'; allowed: '*' | string[] })
  | (FieldBase & { type: 'relations'; collection: string });

export type FieldType = FieldDef['type'];

// ---------------------------------------------------------------------------------------------------------------
// Rich Text: strukturiertes JSON statt HTML — die Site rendert es über React (kein innerHTML, keine XSS-Fläche).
// ---------------------------------------------------------------------------------------------------------------

export interface RichInline {
  t: string;
  b?: true;
  i?: true;
  code?: true;
  href?: string;
}

export type RichBlock = { type: 'p' | 'h2' | 'h3' | 'quote'; c: RichInline[] } | { type: 'ul' | 'ol'; items: RichInline[][] };

export type RichText = RichBlock[];

export interface MediaRef {
  src: string;
  alt: string;
}

export const SLUG_RE = /^[a-z0-9](?:[a-z0-9-]{0,62}[a-z0-9])?$/;
const COLOR_RE = /^#[0-9a-fA-F]{6}$/;

// ---------------------------------------------------------------------------------------------------------------
// Blöcke & Seiten-Templates
// ---------------------------------------------------------------------------------------------------------------

/** Seiten-Inhalte bestehen aus Widgets (src/widgets/*.tsx, Registry in src/widgets/index.ts). */
export { WIDGETS } from '@/widgets';

export interface PageTemplateDef {
  id: string;
  label: string;
  description: string;
  fields: FieldDef[];
}

/** Seitentypen für frei angelegte Seiten (Collection „pages“). */
export const PAGE_TEMPLATES: Record<string, PageTemplateDef> = {
  standard: {
    id: 'standard',
    label: 'Standardseite',
    description: 'Kicker, Titel, Einleitung und frei kombinierbare Blöcke — im Look der Über-mich-/Impressum-Seiten.',
    fields: [
      { key: 'kicker', label: 'Kicker', type: 'text', max: 80, inline: true },
      { key: 'intro', label: 'Einleitung', type: 'textarea', max: 1200, inline: true },
      {
        key: 'blocks',
        label: 'Inhalt',
        type: 'blocks',
        allowed: '*',
      },
    ],
  },
  cover: {
    id: 'cover',
    label: 'Cover-Seite',
    description: 'Farbiger Kopf wie die Projekt-Detailseiten (Cover-Farbe + Mono-Kürzel), darunter Blöcke.',
    fields: [
      { key: 'kicker', label: 'Kicker', type: 'text', max: 80, inline: true },
      { key: 'intro', label: 'Einleitung', type: 'textarea', max: 1200, inline: true },
      { key: 'color', label: 'Cover-Farbe', type: 'color', required: true },
      { key: 'mono', label: 'Mono-Kürzel', type: 'text', max: 4 },
      {
        key: 'blocks',
        label: 'Inhalt',
        type: 'blocks',
        allowed: '*',
      },
    ],
  },
};

// ---------------------------------------------------------------------------------------------------------------
// Collections
// ---------------------------------------------------------------------------------------------------------------

export interface CollectionDef {
  id: string;
  label: string;
  singular: string;
  /** singleton = genau ein Dokument (id = Collection-ID). */
  kind: 'collection' | 'singleton';
  titleField: string;
  subtitleField?: string;
  /** Neue Dokumente erlaubt (ID = Slug in der URL, nach dem Anlegen fest). */
  creatable: boolean;
  fields: FieldDef[];
  /** Öffentliche URL eines Dokuments (für „Ansehen“ und die Vorschau). */
  href: (doc: Record<string, unknown>) => string | null;
}

const PROJECT_FIELDS: FieldDef[] = [
  { key: 'name', label: 'Name', type: 'text', max: 80, required: true, inline: true },
  {
    key: 'kind',
    label: 'Bereich',
    type: 'select',
    options: [
      ['projekte', 'Projekte'],
      ['labs', 'Labs'],
      ['archiv', 'Archiv (nur über Suche/Über mich)'],
    ],
    required: true,
  },
  { key: 'kat', label: 'Kategorie (Filter)', type: 'text', max: 40, required: true },
  { key: 'tag', label: 'Kicker', type: 'text', max: 40, inline: true },
  { key: 'datum', label: 'Datum', type: 'text', max: 20, help: 'z. B. 05/2026' },
  { key: 'mono', label: 'Mono-Kürzel', type: 'text', max: 4 },
  { key: 'color', label: 'Cover-Farbe', type: 'color', required: true },
  { key: 'featured', label: 'Auf der Startseite hervorheben', type: 'boolean' },
  { key: 'status', label: 'Status-Zeile', type: 'text', max: 80 },
  { key: 'link', label: 'Link', type: 'url' },
  { key: 'linkLabel', label: 'Link-Beschriftung', type: 'text', max: 60 },
  { key: 'tool', label: 'Werkzeuge (Zeile)', type: 'text', max: 160, inline: true },
  { key: 'desc', label: 'Kurzbeschreibung', type: 'textarea', max: 400, inline: true },
  { key: 'ueberblick', label: '01 Die Ausgangslage', type: 'textarea', max: 4000, inline: true },
  { key: 'ansatz', label: '02 Der Ansatz', type: 'textarea', max: 4000, inline: true },
  { key: 'stack', label: '03 Die Werkzeuge', type: 'strings', max: 16 },
  { key: 'ergebnis', label: '04 Das Ergebnis', type: 'textarea', max: 4000, inline: true },
  { key: 'zitat', label: 'Zitat', type: 'textarea', max: 400, inline: true },
  { key: 'learnings', label: '05 Gelernt', type: 'textarea', max: 4000, inline: true },
  { key: 'gallery', label: '06 Eindrücke', type: 'gallery' },
];

const ARTICLE_FIELDS: FieldDef[] = [
  { key: 'titel', label: 'Titel', type: 'text', max: 160, required: true, inline: true },
  { key: 'kat', label: 'Kategorie', type: 'text', max: 40, required: true },
  { key: 'datum', label: 'Datum', type: 'text', max: 20, help: 'z. B. 06/2026' },
  { key: 'teaser', label: 'Teaser', type: 'textarea', max: 400, inline: true },
  { key: 'color', label: 'Cover-Farbe', type: 'color', required: true },
  { key: 'pinned', label: 'Als News auf der Startseite', type: 'boolean' },
  { key: 'draft', label: 'Badge „Entwurf“ anzeigen (noindex)', type: 'boolean' },
  { key: 'body', label: 'Text', type: 'paragraphs', inline: true },
  { key: 'gallery', label: 'Galerie', type: 'gallery' },
];

const JOURNEY_FIELDS: FieldDef[] = [
  { key: 'year', label: 'Jahr', type: 'number', min: 1990, max: 2100, required: true },
  { key: 'title', label: 'Titel', type: 'text', max: 80, required: true },
  { key: 'role', label: 'Rolle', type: 'text', max: 60 },
  { key: 'partner', label: 'Partner', type: 'text', max: 60 },
  { key: 'metric', label: 'Kennzahl', type: 'text', max: 8 },
  { key: 'metricLabel', label: 'Kennzahl-Beschriftung', type: 'text', max: 40 },
  { key: 'caption', label: 'Bildzeile', type: 'text', max: 80 },
  { key: 'blurb', label: 'Kurztext (Karte)', type: 'textarea', max: 300 },
  { key: 'story', label: 'Geschichte (Panel)', type: 'textarea', max: 1200 },
  { key: 'stack', label: 'Tech-Stack (max. 5)', type: 'strings', max: 5 },
  { key: 'shot', label: 'Karten-Screenshot', type: 'media' },
  { key: 'insights', label: 'Einblicke (2 Bilder)', type: 'gallery' },
  {
    key: 'steps',
    label: 'Zwischenschritte',
    type: 'list',
    itemLabel: 'Schritt',
    fields: [
      { key: 't', label: 'Titel', type: 'text', max: 80 },
      { key: 'd', label: 'Datum', type: 'text', max: 20 },
      // Prototyp: eigene Einblick-Slots je Zwischenschritt (`ld-mini-<jahr>-s<i>-1|2`); leer → Einblicke der Station.
      {
        key: 'images',
        label: 'Einblicke dieses Schritts (optional)',
        type: 'gallery',
        help: 'Leer lassen, um die Einblicke der Station zu zeigen.',
      },
    ],
  },
];

const PAGE_BASE_FIELDS: FieldDef[] = [
  { key: 'title', label: 'Titel', type: 'text', max: 120, required: true, inline: true },
  {
    key: 'template',
    label: 'Seitentyp',
    type: 'select',
    options: Object.values(PAGE_TEMPLATES).map((t) => [t.id, t.label]),
    required: true,
  },
  { key: 'description', label: 'SEO-Beschreibung', type: 'textarea', max: 300 },
];

const HOME_FIELDS: FieldDef[] = [
  { key: 'kicker', label: 'Status-Pill', type: 'text', max: 80, inline: true },
  { key: 'titleLine1', label: 'Headline Zeile 1', type: 'text', max: 40, inline: true },
  { key: 'titleLine2', label: 'Headline Zeile 2', type: 'text', max: 40, inline: true },
  { key: 'name', label: 'Name', type: 'text', max: 60, inline: true },
  { key: 'roles', label: 'Rotierende Rollen', type: 'strings', max: 12 },
  { key: 'intro', label: 'Einleitung', type: 'textarea', max: 400, inline: true },
  { key: 'featured', label: 'Featured-Projekte', type: 'relations', collection: 'projects' },
];

const STATION_PROJECT_FIELDS: FieldDef[] = [
  { key: 'name', label: 'Name', type: 'text', max: 120 },
  { key: 'anchor', label: 'Anker', type: 'text', max: 40, help: 'z. B. p-egov' },
  { key: 'zeit', label: 'Zeitraum', type: 'text', max: 40 },
  { key: 'desc', label: 'Beschreibung', type: 'textarea', max: 800 },
  { key: 'stack', label: 'Stack', type: 'strings', max: 16 },
  { key: 'railLabel', label: 'Rail-Beschriftung (optional)', type: 'text', max: 40 },
];

const NAV_FIELDS: FieldDef[] = [
  {
    key: 'items',
    label: 'Menüpunkte',
    type: 'list',
    itemLabel: 'Menüpunkt',
    help: 'Desktop-Leiste in dieser Reihenfolge. Die mobile Tab-Leiste (Projekte · Über mich · Home · Labs · Menü) ist fest; „Im mobilen Menü“ zeigt den Punkt zusätzlich im Vollbild-Menü.',
    fields: [
      { key: 'label', label: 'Beschriftung', type: 'text', max: 30, required: true },
      { key: 'href', label: 'Ziel', type: 'url', required: true, help: '/pfad, #anker oder https://…' },
      { key: 'menuLabel', label: 'Beschriftung im mobilen Menü (optional)', type: 'text', max: 60 },
      { key: 'inMenu', label: 'Im mobilen Menü', type: 'boolean' },
    ],
  },
];

const IMPRINT_FIELDS: FieldDef[] = [
  { key: 'kicker', label: 'Kicker', type: 'text', max: 60 },
  { key: 'title', label: 'Titel', type: 'text', max: 80 },
  { key: 'owner', label: 'Anbieter', type: 'text', max: 120 },
  { key: 'address', label: 'Anschrift', type: 'strings', max: 6 },
  { key: 'email', label: 'E-Mail', type: 'text', max: 120 },
  { key: 'notice', label: 'Hinweis', type: 'textarea', max: 1000 },
  {
    key: 'sections',
    label: 'Abschnitte (Datenschutz)',
    type: 'list',
    itemLabel: 'Abschnitt',
    help: 'Rechtstexte: Änderungen nur nach Prüfung. Links im Text als [Linktext](https://…).',
    fields: [
      { key: 'id', label: 'Anker', type: 'text', max: 40 },
      { key: 'rail', label: 'Rail-Beschriftung', type: 'text', max: 40 },
      { key: 'sub', label: 'Unterpunkt in der Rail', type: 'boolean' },
      {
        key: 'blocks',
        label: 'Inhalt',
        type: 'list',
        itemLabel: 'Absatz',
        fields: [
          {
            key: 'kind',
            label: 'Art',
            type: 'select',
            options: [
              ['p', 'Absatz'],
              ['h2', 'Überschrift groß'],
              ['h3', 'Überschrift'],
              ['box', 'Kasten (eine Zeile pro Zeile)'],
              ['credit', 'Quellen-Link (klein)'],
            ],
          },
          { key: 'text', label: 'Text', type: 'textarea', max: 6000 },
          { key: 'href', label: 'Link (nur Quellen-Link)', type: 'url' },
        ],
      },
    ],
  },
];

const ABOUT_FIELDS: FieldDef[] = [
  { key: 'introKicker', label: 'Intro-Kicker', type: 'text', max: 60, inline: true },
  { key: 'introTitle', label: 'Intro-Titel', type: 'text', max: 160, inline: true },
  { key: 'intro', label: 'Intro', type: 'textarea', max: 1500, inline: true },
  { key: 'vita', label: 'Vita', type: 'paragraphs', inline: true },
  { key: 'tools', label: 'Werkzeuge', type: 'strings', max: 30 },
  {
    key: 'skills',
    label: 'Skills',
    type: 'list',
    itemLabel: 'Gruppe',
    fields: [
      { key: 'titel', label: 'Titel', type: 'text', max: 60 },
      { key: 'chips', label: 'Einträge', type: 'strings', max: 30 },
    ],
  },
  {
    key: 'qualifications',
    label: 'Zertifikate',
    type: 'list',
    itemLabel: 'Zertifikat',
    fields: [
      { key: 'datum', label: 'Datum', type: 'text', max: 20 },
      { key: 'name', label: 'Name', type: 'text', max: 160 },
      { key: 'von', label: 'Aussteller', type: 'text', max: 80 },
    ],
  },
  { key: 'loona', label: 'Loona!-Text', type: 'textarea', max: 800, inline: true },
  {
    key: 'images',
    label: 'Bilder (linke Spalte)',
    type: 'list',
    itemLabel: 'Bild',
    help: 'Feste Abschnitte: Porträt (Intro/Vita), Werkzeuge (Werkzeuge/Skills), Arbeit (Zertifikate), Loona!. Stationen haben ihr Bild direkt an der Station.',
    fields: [
      { key: 'slot', label: 'Slot', type: 'text', max: 40 },
      { key: 'image', label: 'Bild', type: 'media' },
      { key: 'caption', label: 'Bildzeile', type: 'text', max: 80 },
    ],
  },
  {
    key: 'stations',
    label: 'Stationen',
    type: 'list',
    itemLabel: 'Station',
    help: 'Reihenfolge = Anzeige. Die Punkt-Rail rechts entsteht automatisch aus Stationen und Projekten.',
    fields: [
      { key: 'firma', label: 'Firma', type: 'text', max: 80 },
      { key: 'anchor', label: 'Anker (URL-Fragment)', type: 'text', max: 40, help: 'z. B. st-materna' },
      { key: 'rolle', label: 'Rolle', type: 'text', max: 80 },
      { key: 'zeit', label: 'Zeitraum', type: 'text', max: 40 },
      { key: 'desc', label: 'Beschreibung', type: 'textarea', max: 800 },
      { key: 'railLabel', label: 'Rail-Beschriftung (optional)', type: 'text', max: 40 },
      { key: 'image', label: 'Bild', type: 'media' },
      { key: 'caption', label: 'Bildzeile', type: 'text', max: 80 },
      { key: 'placeholder', label: 'Platzhalter ohne Bild', type: 'text', max: 80 },
      {
        key: 'projekte',
        label: 'Projekte',
        type: 'list',
        itemLabel: 'Projekt',
        fields: STATION_PROJECT_FIELDS,
      },
    ],
  },
  {
    key: 'loonaProjects',
    label: 'Loona!-Projekte',
    type: 'list',
    itemLabel: 'Projekt',
    fields: STATION_PROJECT_FIELDS,
  },
];

export const COLLECTIONS: Record<string, CollectionDef> = {
  navigation: {
    id: 'navigation',
    label: 'Navigation',
    singular: 'Navigation',
    kind: 'singleton',
    titleField: 'items',
    creatable: false,
    fields: NAV_FIELDS,
    href: () => '/',
  },
  imprint: {
    id: 'imprint',
    label: 'Impressum & Datenschutz',
    singular: 'Impressum',
    kind: 'singleton',
    titleField: 'title',
    creatable: false,
    fields: IMPRINT_FIELDS,
    href: () => '/impressum',
  },
  patterns: {
    id: 'patterns',
    label: 'Vorlagen',
    singular: 'Vorlage',
    kind: 'collection',
    titleField: 'title',
    creatable: true,
    fields: [
      { key: 'title', label: 'Name', type: 'text', max: 80, required: true },
      {
        key: 'global',
        label: 'Global — als Verweis einfügbar (Änderungen wirken überall)',
        type: 'boolean',
      },
      { key: 'blocks', label: 'Inhalt', type: 'blocks', allowed: '*' },
    ],
    href: () => null,
  },
  home: {
    id: 'home',
    label: 'Startseite',
    singular: 'Startseite',
    kind: 'singleton',
    titleField: 'titleLine2',
    creatable: false,
    fields: HOME_FIELDS,
    href: () => '/',
  },
  about: {
    id: 'about',
    label: 'Über mich',
    singular: 'Über mich',
    kind: 'singleton',
    titleField: 'introTitle',
    creatable: false,
    fields: ABOUT_FIELDS,
    href: () => '/ueber-mich',
  },
  projects: {
    id: 'projects',
    label: 'Projekte & Labs',
    singular: 'Projekt',
    kind: 'collection',
    titleField: 'name',
    subtitleField: 'kind',
    creatable: true,
    fields: PROJECT_FIELDS,
    href: (d) => (d.kind === 'labs' ? `/labs/${d.id}` : `/projekte/${d.id}`),
  },
  articles: {
    id: 'articles',
    label: '.Tech-Artikel',
    singular: 'Artikel',
    kind: 'collection',
    titleField: 'titel',
    subtitleField: 'kat',
    creatable: true,
    fields: ARTICLE_FIELDS,
    href: (d) => `/tech/${d.id}`,
  },
  journey: {
    id: 'journey',
    label: 'Meine Reise',
    singular: 'Station',
    kind: 'collection',
    titleField: 'title',
    subtitleField: 'year',
    creatable: true,
    fields: JOURNEY_FIELDS,
    href: () => '/reise',
  },
  pages: {
    id: 'pages',
    label: 'Seiten',
    singular: 'Seite',
    kind: 'collection',
    titleField: 'title',
    subtitleField: 'template',
    creatable: true,
    fields: PAGE_BASE_FIELDS,
    href: (d) => `/${d.id}`,
  },
};

/** Felder eines Dokuments — bei Seiten inkl. der Template-Felder. */
export function fieldsFor(collection: string, doc?: Record<string, unknown>): FieldDef[] {
  const def = COLLECTIONS[collection];
  if (!def) return [];
  if (collection !== 'pages') return def.fields;
  const tpl = PAGE_TEMPLATES[String(doc?.template ?? 'standard')] ?? PAGE_TEMPLATES.standard;
  return [...def.fields, ...tpl.fields];
}

/** Slugs, die als Seiten-ID tabu sind (bestehende Routen). */
export const RESERVED_SLUGS = new Set([
  'vorlage',
  'projekte',
  'labs',
  'tech',
  'ueber-mich',
  'impressum',
  'reise',
  'brand',
  'orbit',
  'flow',
  'flow-preview',
  'media',
  'health',
  'flow-cron',
  'api',
  '_next',
  // Sprachpräfix und englische Abschnittsnamen (src/site/i18n/locale.ts)
  ...LOCALE_RESERVED_SLUGS,
]);

// ---------------------------------------------------------------------------------------------------------------
// Validierung (Server: vor jedem Schreiben; Client: für Fehlermeldungen)
// ---------------------------------------------------------------------------------------------------------------

export type Errors = Record<string, string>;

const MAX_TEXT = 300;
const MAX_TEXTAREA = 20000;

function cleanString(v: unknown): string | null {
  if (typeof v !== 'string') return null;
  // Steuerzeichen außer Zeilenumbruch/Tab entfernen.
  return v.replace(/[\u0000-\u0008\u000B\u000C\u000E-\u001F\u007F]/g, '');
}

export function validateRichText(v: unknown): RichText | null {
  if (!Array.isArray(v) || v.length > 400) return null;
  const inl = (arr: unknown): RichInline[] | null => {
    if (!Array.isArray(arr) || arr.length > 400) return null;
    const out: RichInline[] = [];
    for (const x of arr) {
      if (!x || typeof x !== 'object') return null;
      const o = x as Record<string, unknown>;
      const t = cleanString(o.t);
      if (t === null || t.length > 10000) return null;
      const r: RichInline = { t };
      if (o.b === true) r.b = true;
      if (o.i === true) r.i = true;
      if (o.code === true) r.code = true;
      if (o.href !== undefined) {
        if (typeof o.href !== 'string' || o.href.length > 2000 || !isSafeHref(o.href)) return null;
        r.href = o.href;
      }
      out.push(r);
    }
    return out;
  };
  const out: RichText = [];
  for (const b of v) {
    if (!b || typeof b !== 'object') return null;
    const o = b as Record<string, unknown>;
    if (o.type === 'p' || o.type === 'h2' || o.type === 'h3' || o.type === 'quote') {
      const c = inl(o.c);
      if (!c) return null;
      out.push({ type: o.type, c });
    } else if (o.type === 'ul' || o.type === 'ol') {
      if (!Array.isArray(o.items) || o.items.length > 200) return null;
      const items: RichInline[][] = [];
      for (const it of o.items) {
        const c = inl(it);
        if (!c) return null;
        items.push(c);
      }
      out.push({ type: o.type, items });
    } else return null;
  }
  return out;
}

function validateMedia(v: unknown): MediaRef | null | undefined {
  if (v === null || v === undefined || v === '') return null;
  if (typeof v !== 'object') return undefined;
  const o = v as Record<string, unknown>;
  const src = cleanString(o.src);
  const alt = cleanString(o.alt ?? '');
  if (!src || alt === null || src.length > 2000 || alt.length > 300 || !isSafeMediaSrc(src)) return undefined;
  return { src, alt };
}

export function validateField(f: FieldDef, raw: unknown, path: string, errors: Errors): unknown {
  const fail = (msg: string) => {
    errors[path] = msg;
    return undefined;
  };
  const empty = raw === undefined || raw === null || raw === '';
  if (empty && f.type !== 'boolean') {
    if (f.required) return fail('Pflichtfeld');
    if (f.type === 'strings' || f.type === 'paragraphs' || f.type === 'list' || f.type === 'blocks' || f.type === 'relations') return [];
    if (f.type === 'richtext') return [];
    if (f.type === 'gallery') return [];
    return undefined;
  }
  switch (f.type) {
    case 'text':
    case 'textarea': {
      const s = cleanString(raw);
      if (s === null) return fail('Text erwartet');
      const max = f.max ?? (f.type === 'text' ? MAX_TEXT : MAX_TEXTAREA);
      const val = f.type === 'text' ? s.replace(/\s*\n\s*/g, ' ') : s;
      if (val.length > max) return fail(`Höchstens ${max} Zeichen`);
      if (f.required && !val.trim()) return fail('Pflichtfeld');
      return val;
    }
    case 'color': {
      if (typeof raw !== 'string' || !COLOR_RE.test(raw)) return fail('Farbe als #RRGGBB');
      return raw.toUpperCase();
    }
    case 'select': {
      if (typeof raw !== 'string' || !f.options.some(([v]) => v === raw)) return fail('Ungültige Auswahl');
      return raw;
    }
    case 'boolean':
      return raw === true || raw === 'true' || raw === 'on';
    case 'number': {
      const n = typeof raw === 'number' ? raw : Number(raw);
      if (!Number.isFinite(n)) return fail('Zahl erwartet');
      if (f.min !== undefined && n < f.min) return fail(`Mindestens ${f.min}`);
      if (f.max !== undefined && n > f.max) return fail(`Höchstens ${f.max}`);
      return n;
    }
    case 'url': {
      const s = cleanString(raw);
      if (!s || s.length > 2000 || !isSafeHref(s)) return fail('Link muss mit https://, mailto:, / oder # beginnen');
      return s;
    }
    case 'media': {
      const m = validateMedia(raw);
      if (m === undefined) return fail('Ungültiges Bild');
      if (f.required && !m) return fail('Pflichtfeld');
      return m ?? undefined;
    }
    case 'gallery': {
      if (!Array.isArray(raw) || raw.length > 3) return fail('Höchstens 3 Bilder');
      const out: (MediaRef | null)[] = [];
      for (const x of raw) {
        const m = validateMedia(x);
        if (m === undefined) return fail('Ungültiges Bild');
        out.push(m);
      }
      return out;
    }
    case 'strings':
    case 'paragraphs':
    case 'relations': {
      if (!Array.isArray(raw)) return fail('Liste erwartet');
      const max = f.type === 'strings' ? (f.max ?? 50) : 200;
      if (raw.length > max) return fail(`Höchstens ${max} Einträge`);
      const out: string[] = [];
      for (const x of raw) {
        const s = cleanString(x);
        if (s === null) return fail('Text erwartet');
        const lim = f.type === 'paragraphs' ? MAX_TEXTAREA : MAX_TEXT;
        if (s.length > lim) return fail(`Eintrag zu lang (max. ${lim})`);
        if (f.type === 'relations' && !SLUG_RE.test(s)) return fail('Ungültige Referenz');
        out.push(f.type === 'paragraphs' ? s : s.trim());
      }
      return f.type === 'paragraphs' ? out.filter((s) => s.trim()) : out.filter(Boolean);
    }
    case 'richtext': {
      const r = validateRichText(raw);
      if (!r) return fail('Ungültiger Text');
      return r;
    }
    case 'list': {
      if (!Array.isArray(raw) || raw.length > 200) return fail('Liste erwartet');
      return raw.map((item, i) => validateObject(f.fields, item, `${path}.${i}`, errors));
    }
    case 'blocks':
      return validateBlocks(raw, f.allowed, path, errors, 0);
  }
}

const MAX_DEPTH = 6;

/** Widgets validieren: Felder, Controls (nur vorgegebene Varianten) und Slots rekursiv. */
function validateBlocks(raw: unknown, allowed: '*' | string[], path: string, errors: Errors, depth: number): unknown[] | undefined {
  if (!Array.isArray(raw) || raw.length > 200) {
    errors[path] = 'Blöcke erwartet';
    return undefined;
  }
  if (depth > MAX_DEPTH) {
    errors[path] = 'Zu tief verschachtelt';
    return undefined;
  }
  const out: unknown[] = [];
  raw.forEach((item, i) => {
    const o = (item && typeof item === 'object' ? item : {}) as Record<string, unknown>;
    const type = String(o.type ?? '');
    const w = WIDGETS[type];
    const p = `${path}.${i}`;
    if (!w || (allowed !== '*' && !allowed.includes(type))) {
      errors[p] = 'Unbekanntes oder hier nicht erlaubtes Widget';
      return;
    }
    const id = typeof o._id === 'string' && /^[a-z0-9]{6,24}$/.test(o._id) ? o._id : randomId();
    const block: Record<string, unknown> = { type, _id: id, ...validateObject(w.fields, o, p, errors) };
    if (w.controlFields.length)
      block.controls = { ...controlDefaults(w), ...validateObject(w.controlFields, o.controls, `${p}.controls`, errors) };
    const slotNames = Object.keys(w.slots);
    if (slotNames.length) {
      const src = (o.slots && typeof o.slots === 'object' ? o.slots : {}) as Record<string, unknown>;
      const slots: Record<string, unknown> = {};
      for (const name of slotNames) {
        const def = w.slots[name];
        const v = validateBlocks(src[name] ?? [], def.allow, `${p}.slots.${name}`, errors, depth + 1);
        if (v && def.max !== undefined && v.length > def.max) errors[`${p}.slots.${name}`] = `Höchstens ${def.max} Elemente`;
        slots[name] = v ?? [];
      }
      block.slots = slots;
    }
    out.push(block);
  });
  return out;
}

/** Neues Widget mit Standardwerten (Controls, leere Slots). */
export function newBlock(type: string): Record<string, unknown> {
  const w = WIDGETS[type];
  const b: Record<string, unknown> = { type, _id: randomId() };
  if (!w) return b;
  if (w.controlFields.length) b.controls = controlDefaults(w);
  if (Object.keys(w.slots).length) b.slots = Object.fromEntries(Object.keys(w.slots).map((k) => [k, []]));
  return b;
}

export function validateObject(fields: FieldDef[], raw: unknown, prefix: string, errors: Errors): Record<string, unknown> {
  const src = (raw && typeof raw === 'object' ? raw : {}) as Record<string, unknown>;
  const out: Record<string, unknown> = {};
  for (const f of fields) {
    const v = validateField(f, src[f.key], prefix ? `${prefix}.${f.key}` : f.key, errors);
    if (v !== undefined) out[f.key] = v;
  }
  return out;
}

/** Validiert ein komplettes Dokument einer Collection; Unbekanntes wird verworfen. */
export function validateDoc(collection: string, raw: unknown): { value: Record<string, unknown>; errors: Errors } {
  const errors: Errors = {};
  const fields = fieldsFor(collection, (raw ?? {}) as Record<string, unknown>);
  const value = validateObject(fields, raw, '', errors);
  return { value, errors };
}

export function randomId(): string {
  const a = new Uint8Array(8);
  globalThis.crypto.getRandomValues(a);
  return Array.from(a, (x) => x.toString(36).padStart(2, '0'))
    .join('')
    .slice(0, 12);
}

/** Leeres Dokument mit Standardwerten (für „Neu“). */
export function emptyDoc(collection: string, template = 'standard'): Record<string, unknown> {
  const base: Record<string, unknown> = collection === 'pages' ? { template } : {};
  for (const f of fieldsFor(collection, base)) {
    if (f.key in base) continue;
    if (f.type === 'boolean') base[f.key] = false;
    else if (f.type === 'color') base[f.key] = '#2A1B4A';
    else if (f.type === 'select') base[f.key] = f.options[0][0];
    else if (f.type === 'number') base[f.key] = f.min ?? 0;
    else if (['strings', 'paragraphs', 'list', 'blocks', 'relations', 'gallery', 'richtext'].includes(f.type)) base[f.key] = [];
    else base[f.key] = '';
  }
  return base;
}
