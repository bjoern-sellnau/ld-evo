/**
 * LD Flow. — Inhaltsmodell (client- und serverseitig nutzbar, ohne Seiteneffekte).
 *
 * Alles, was das CMS bearbeiten kann, ist hier deklarativ beschrieben: Collections (Projekte, Artikel, …),
 * Singletons (Startseite, Über mich), Seiten-Templates und Inhaltsblöcke. Das Admin-Formular, die Validierung
 * auf dem Server und die WYSIWYG-Vorschau lesen dieselben Definitionen. Einen neuen Seitentyp anlegen =
 * einen Eintrag in PAGE_TEMPLATES ergänzen und in src/site/cms/PageRenderer.tsx eine Darstellung registrieren
 * (siehe docs/LD-FLOW.md).
 */

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
  | (FieldBase & { type: 'blocks'; allowed: string[] })
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

/** Erlaubte Link-Ziele: http(s), mailto, tel, relative Pfade und Anker — kein javascript:, data:, //host. */
export function isSafeHref(href: string): boolean {
  if (/^(https?:\/\/|mailto:|tel:)/i.test(href)) return true;
  if (href.startsWith('/') && !href.startsWith('//')) return true;
  return href.startsWith('#');
}

/** Bildquellen: eigene Medien (/media/…), Dateien aus public/ oder https. */
export function isSafeMediaSrc(src: string): boolean {
  if (/^https:\/\//i.test(src)) return true;
  return src.startsWith('/') && !src.startsWith('//') && !src.includes('..');
}

export const SLUG_RE = /^[a-z0-9](?:[a-z0-9-]{0,62}[a-z0-9])?$/;
const COLOR_RE = /^#[0-9a-fA-F]{6}$/;

// ---------------------------------------------------------------------------------------------------------------
// Blöcke & Seiten-Templates
// ---------------------------------------------------------------------------------------------------------------

export interface BlockDef {
  type: string;
  label: string;
  fields: FieldDef[];
}

export const BLOCKS: Record<string, BlockDef> = {
  text: { type: 'text', label: 'Text', fields: [{ key: 'body', label: 'Text', type: 'richtext', inline: true }] },
  chapter: {
    type: 'chapter',
    label: 'Kapitel-Kopf',
    fields: [
      { key: 'n', label: 'Nummer', type: 'text', max: 4, help: 'z. B. 01' },
      { key: 'label', label: 'Titel', type: 'text', max: 80, inline: true },
    ],
  },
  image: {
    type: 'image',
    label: 'Bild',
    fields: [
      { key: 'image', label: 'Bild', type: 'media' },
      { key: 'caption', label: 'Bildunterschrift', type: 'text', max: 200, inline: true },
    ],
  },
  gallery: { type: 'gallery', label: 'Galerie (1 breit + 2 klein)', fields: [{ key: 'images', label: 'Bilder', type: 'gallery' }] },
  quote: {
    type: 'quote',
    label: 'Zitat',
    fields: [
      { key: 'text', label: 'Zitat', type: 'textarea', max: 600, inline: true },
      { key: 'by', label: 'Quelle', type: 'text', max: 120, inline: true },
    ],
  },
  cta: {
    type: 'cta',
    label: 'Button',
    fields: [
      { key: 'label', label: 'Beschriftung', type: 'text', max: 60, required: true, inline: true },
      { key: 'href', label: 'Ziel', type: 'url', required: true },
    ],
  },
  projects: {
    type: 'projects',
    label: 'Projekt-Karten',
    fields: [
      { key: 'title', label: 'Überschrift', type: 'text', max: 80, inline: true },
      { key: 'ids', label: 'Projekte', type: 'relations', collection: 'projects' },
    ],
  },
  stats: {
    type: 'stats',
    label: 'Kennzahlen',
    fields: [
      {
        key: 'items',
        label: 'Kennzahlen',
        type: 'list',
        itemLabel: 'Kennzahl',
        fields: [
          { key: 'value', label: 'Wert', type: 'text', max: 16 },
          { key: 'label', label: 'Beschriftung', type: 'text', max: 60 },
        ],
      },
    ],
  },
};

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
        allowed: ['text', 'chapter', 'image', 'gallery', 'quote', 'cta', 'projects', 'stats'],
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
        allowed: ['text', 'chapter', 'image', 'gallery', 'quote', 'cta', 'projects', 'stats'],
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
    help: 'Reihenfolge: Porträt, Werkzeuge, Arbeit, Loona!, Materna, Code-b, PIXELTEX',
    fields: [
      { key: 'slot', label: 'Slot', type: 'text', max: 40 },
      { key: 'image', label: 'Bild', type: 'media' },
    ],
  },
];

export const COLLECTIONS: Record<string, CollectionDef> = {
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
  'api',
  '_next',
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
  // eslint-disable-next-line no-control-regex
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
    case 'blocks': {
      if (!Array.isArray(raw) || raw.length > 200) return fail('Blöcke erwartet');
      return raw.map((item, i) => {
        const o = (item && typeof item === 'object' ? item : {}) as Record<string, unknown>;
        const type = String(o.type ?? '');
        const def = BLOCKS[type];
        if (!def || !f.allowed.includes(type)) {
          errors[`${path}.${i}`] = 'Unbekannter Block';
          return undefined;
        }
        const id = typeof o._id === 'string' && /^[a-z0-9]{6,24}$/.test(o._id) ? o._id : randomId();
        return { type, _id: id, ...validateObject(def.fields, o, `${path}.${i}`, errors) };
      });
    }
  }
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
