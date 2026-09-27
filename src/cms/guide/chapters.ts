/**
 * Inhalt des LD-Flow-Guides (/flow/guide). Reine Daten — die Darstellung liegt in src/cms/ui/Guide.tsx.
 * Kapitel ergänzen = Eintrag in CHAPTERS. `source`-Knoten zeigen echten Code aus dem Repo (live gelesen).
 * Inline-Format in Texten: **fett**, `code`, [Linktext](/pfad).
 */

export type GuideNode =
  | { t: 'p'; text: string }
  | { t: 'h'; text: string }
  | { t: 'list'; items: string[] }
  | { t: 'callout'; kind: 'info' | 'tip' | 'warn'; title?: string; text: string }
  | { t: 'code'; lang?: string; title?: string; code: string }
  | { t: 'source'; file: string; from?: number; to?: number; match?: string; lines?: number; note?: string }
  | { t: 'files'; items: [string, string][] }
  | { t: 'table'; head: string[]; rows: string[][] }
  | { t: 'steps'; id: string; title: string; items: string[] }
  | { t: 'prompt'; title: string; text: string }
  | { t: 'quiz'; id: string; q: string; options: string[]; answer: number; why: string }
  | { t: 'diagram'; kind: 'layers' | 'dataflow' | 'editor' | 'widget' | 'request' }
  | { t: 'more'; title: string; nodes: GuideNode[] };

/** Schlüssel eines Code-Ausschnitts (Server liest, Client zeigt). */
export const sourceKey = (n: Extract<GuideNode, { t: 'source' }>) =>
  `${n.file}|${n.from ?? ''}|${n.to ?? ''}|${n.match ?? ''}|${n.lines ?? ''}`;

export interface Chapter {
  id: string;
  n: string;
  title: string;
  lead: string;
  minutes: number;
  nodes: GuideNode[];
}

export const CHAPTERS: Chapter[] = [
  // ---------------------------------------------------------------------------------------------------------------
  {
    id: 'start',
    n: '00',
    title: 'Start hier',
    lead: 'Was in diesem Repo steckt, wie die Teile zusammenhängen und wie du diesen Guide am besten nutzt.',
    minutes: 5,
    nodes: [
      {
        t: 'p',
        text: 'Das Repo **ld-evo** enthält vier Dinge, die sich eine Codebasis teilen: die **Website** (Portfolio), das CMS **LD Flow.**, den **Widget-Baukasten** und die **ORBIT-OS-Wallpapers**. Dazu die **Logo-Bibliothek** der Marke.',
      },
      { t: 'diagram', kind: 'layers' },
      {
        t: 'table',
        head: ['Teil', 'URL', 'Ordner', 'Wofür'],
        rows: [
          [
            'Website',
            '/, /projekte, /labs, /tech, /ueber-mich, /reise',
            'src/app/(main), src/site',
            'Das Portfolio — 1:1 nach dem Prototyp',
          ],
          ['LD Flow.', '/flow', 'src/app/(flow), src/cms', 'Inhalte pflegen, WYSIWYG, Nutzer, Medien'],
          ['Widgets', '(in Seiten)', 'src/widgets', 'Eigene Komponenten für den Seiten-Baukasten'],
          ['ORBIT OS', '/orbit', 'src/app/(orbit), src/orbit', '13 interaktive Shader-Wallpapers'],
          ['Marke', '/brand', 'src/components/brand', 'Logo-Komponenten (LD, Flow, Nova, Buddy, Ivy)'],
        ],
      },
      { t: 'h', text: 'So nutzt du den Guide' },
      {
        t: 'list',
        items: [
          'Kapitel der Reihe nach — jedes baut auf dem vorigen auf. Oben rechts im Kapitel: „Als gelesen markieren“.',
          '**Code-Ausschnitte** sind echt: sie werden beim Öffnen aus dem Repo gelesen und sind damit immer aktuell.',
          '**Übungen** haben Checklisten, dein Fortschritt bleibt im Browser gespeichert.',
          '**AI-Prompts** (violette Kästen) kannst du kopieren und in Claude Code o. ä. einfügen — sie enthalten schon den nötigen Kontext.',
          'Die Kurzfassung für AI-Assistenten liegt in `CLAUDE.md` im Repo-Root — wird von Claude Code automatisch gelesen.',
        ],
      },
      {
        t: 'callout',
        kind: 'tip',
        title: 'Der wichtigste Grundsatz',
        text: '**Quellen prüfen, nichts erfinden.** Design-Werte (Farben, Maße, Texte) kommen aus den Handoffs in `design/` und `docs/`. Große Teile (Hero-Shader, Splash-Skizze, Reise-Daten, ORBIT) werden per Skript 1:1 aus den Prototypen erzeugt — geändert wird der Generator, nicht das Ergebnis.',
      },
      {
        t: 'quiz',
        id: 'q-start',
        q: 'Du willst einen Hero-Shader anpassen. Wo änderst du?',
        options: [
          'Direkt in src/site/hero/engine/heroEngine.js',
          'Im Prototyp bzw. im Generator scripts/extract-hero-engine.mjs',
          'In next.config.ts',
        ],
        answer: 1,
        why: 'heroEngine.js ist generiert — beim nächsten Lauf von extract-hero-engine.mjs wäre deine Änderung weg. Änderungen gehören in die Quelle (Prototyp) oder als dokumentierte Korrektur in den Generator.',
      },
    ],
  },
  // ---------------------------------------------------------------------------------------------------------------
  {
    id: 'stack',
    n: '01',
    title: 'Tech-Stack & Grundbegriffe',
    lead: 'Next.js 16, React Server Components, Server Actions, View Transitions, WebGL — was das ist und wie wir es nutzen.',
    minutes: 10,
    nodes: [
      {
        t: 'table',
        head: ['Baustein', 'Version / Art', 'Einsatz hier'],
        rows: [
          ['Next.js', '16 (App Router)', 'Routing, Rendering, Server Actions, Proxy'],
          ['React', '19', 'UI; Server- und Client-Komponenten'],
          ['TypeScript', '5', 'überall (Ausnahme: generierte Prototyp-Engines als .js)'],
          ['SQLite', 'node:sqlite (in Node eingebaut)', 'Datenbank von LD Flow — keine Zusatzpakete'],
          ['CSS', 'Custom Properties + CSS Modules', 'kein UI-Framework; Werte 1:1 aus dem Prototyp'],
          ['Tests', 'Vitest, Playwright (Chromium)', 'Unit, Pixel, End-to-End'],
        ],
      },
      { t: 'h', text: 'Server Components vs. Client Components' },
      {
        t: 'p',
        text: "In Next 16 ist jede Datei unter `src/app` standardmäßig eine **Server Component**: sie läuft auf dem Server, darf direkt auf die Datenbank zugreifen und schickt nur HTML/RSC-Daten an den Browser. Dateien mit `'use client'` sind **Client Components** — sie laufen zusätzlich im Browser und dürfen Hooks (`useState`, `useEffect`), Events und `localStorage` nutzen.",
      },
      {
        t: 'list',
        items: [
          '**Server:** alle Routen/Layouts, das Laden der Inhalte (`getSiteContent()` im Site-Layout), das komplette LD-Flow-Backend.',
          '**Client:** die Seiten-Komponenten der Site (`src/site/pages/*`), weil Einstellungen (localStorage), Shader, Auto-Kontrast und Animationen den Browser brauchen.',
          'Die Grenze: Server-Layout lädt Daten → übergibt sie per `ContentProvider` an die Client-Seiten.',
        ],
      },
      {
        t: 'source',
        file: 'src/app/(main)/(site)/layout.tsx',
        note: 'Server-Layout: lädt Inhalte, reicht sie an Client-Komponenten weiter.',
      },
      { t: 'h', text: 'Server Actions' },
      {
        t: 'p',
        text: "Funktionen mit `'use server'` (siehe `src/cms/actions.ts`) kann der Browser wie normale Funktionen aufrufen — Next macht daraus einen POST-Request. **Wichtig:** sie sind wie öffentliche Endpunkte zu behandeln, deshalb prüft jede Funktion im Datenzugriff (`repo.ts`) Login und Rolle selbst.",
      },
      { t: 'h', text: 'Rendering & Aktualisierung' },
      {
        t: 'p',
        text: "Die Site wird beim Build **statisch vorgerendert** (schnell, cachebar). Veröffentlicht man in LD Flow, ruft die Action `revalidatePath('/', 'layout')` — Next erzeugt die Seiten beim nächsten Aufruf neu. Neue Projekte/Seiten, die es beim Build noch nicht gab, rendert Next beim ersten Aufruf.",
      },
      { t: 'h', text: 'View Transitions' },
      {
        t: 'p',
        text: 'Seitenwechsel (Karte → Detail-Morph, Iris, Fade, Slide …) nutzen die **View Transitions API des Browsers** direkt über `runVt()` in `src/site/vt/runVt.ts` — mit Watchdog und einem Ersatz-Effekt für Safari, 1:1 wie im Prototyp. React/Next bieten inzwischen ein deklaratives `<ViewTransition>`; eine Umstellung würde Code sparen, ist aber ein eigener, sorgfältig zu prüfender Schritt.',
      },
      { t: 'source', file: 'src/site/vt/runVt.ts', lines: 40, note: 'Zentraler Einstieg für alle Übergänge.' },
      { t: 'h', text: 'WebGL vs. WebGPU' },
      {
        t: 'p',
        text: 'Hero-Shader und ORBIT-Wallpapers sind **WebGL 1 / GLSL**, unverändert aus den Handoffs. WebGPU wäre eine Neuschreibung aller Shader in WGSL und bräuchte trotzdem einen WebGL-Ersatz, weil es nicht in allen Browsern/Geräten verfügbar ist. Für Vollbild-Fragment-Shader bringt es kaum Tempo — sinnvoll erst für rechenintensive Effekte (z. B. Partikel mit Compute-Shadern).',
      },
      {
        t: 'quiz',
        id: 'q-stack',
        q: 'Eine Server Action ist nur über einen Button im Admin erreichbar. Muss sie trotzdem den Login prüfen?',
        options: ['Nein, der Button ist ja nur im Admin sichtbar', 'Ja — Actions sind per POST direkt aufrufbar'],
        answer: 1,
        why: 'Sichtbarkeit in der UI ist kein Schutz. Deshalb prüft jede Funktion in src/cms/repo.ts requireUser() selbst.',
      },
    ],
  },
  // ---------------------------------------------------------------------------------------------------------------
  {
    id: 'site',
    n: '02',
    title: 'Die Website',
    lead: 'Vom Layout über Einstellungen, Glas und Shader bis zu den Seiten — wie der Prototyp in React übersetzt ist.',
    minutes: 15,
    nodes: [
      {
        t: 'files',
        items: [
          ['src/app/(main)/layout.tsx', 'Root-Layout: Schriften, Metadaten, Boot-Script (Theme vor dem ersten Paint)'],
          ['src/app/(main)/(site)/layout.tsx', 'Site-Layout: Inhalte laden, Provider, Nav, Overlays, Splash'],
          ['src/site/settings/SiteProvider.tsx', 'Zentraler Zustand: Einstellungen, Viewport, Overlays, Navigation mit View Transition'],
          ['src/site/settings/schema.ts', 'Alle Einstellungen mit ihren localStorage-Keys (ld-theme, ld-heroanim, …)'],
          ['src/site/pages/*', 'Die Seiten: Hallo, Katalog, Case Study, Artikel, Tech, Über mich, Impressum, Reise'],
          ['src/site/glass/*', 'Liquid Glass: Flächen, Refraktion (SVG-Displacement), Auto-Kontrast'],
          ['src/site/hero/*', 'Hero: Modi, Paletten, Engine (generiert) + useHeroShader'],
          ['src/site/styles/site.css', 'Globale Styles aus dem Prototyp (Tokens, Keyframes, Glas-Layer)'],
          ['src/components/brand/*', 'Logo-Komponenten, pixelgenau gegen die Handoff-Assets getestet'],
        ],
      },
      { t: 'h', text: 'Einstellungen' },
      {
        t: 'p',
        text: 'Alle Optionen aus dem Einstellungs-Panel (Theme, Animationen, Glas, Hero-Modus, Mobile-Nav, …) sind in `src/site/settings/schema.ts` beschrieben — mit denselben localStorage-Keys wie im Prototyp. `SiteProvider` liest sie nach der Hydration, schreibt Änderungen zurück und setzt Body-Klassen (`applyBody`).',
      },
      { t: 'source', file: 'src/site/settings/schema.ts', match: 'export interface Settings', lines: 30 },
      { t: 'h', text: 'Wie eine Seite aufgebaut ist' },
      {
        t: 'p',
        text: 'Eine Route (z. B. `src/app/(main)/(site)/projekte/[slug]/page.tsx`) ist dünn: Daten holen, Metadaten setzen, Seiten-Komponente rendern. Die eigentliche Seite (`CaseStudyPage`) ist eine Client-Komponente, liest Einstellungen per `useSite()` und Inhalte per `useContent()`.',
      },
      { t: 'source', file: 'src/app/(main)/(site)/projekte/[slug]/page.tsx' },
      { t: 'h', text: 'Generierte Teile' },
      {
        t: 'table',
        head: ['Ergebnis', 'Generator', 'Quelle'],
        rows: [
          ['src/site/hero/engine/heroEngine.js', 'scripts/extract-hero-engine.mjs', 'Loona Site V2.dc.html (Engine-Methoden)'],
          ['src/site/splash/sketchMarkup.ts', 'scripts/extract-splash-sketch.mjs', 'Loona Site V2.dc.html (Sketch-Splash)'],
          ['content/journey.ts', 'scripts/extract-journey.mjs', 'LD Timeline.dc.html (stations())'],
          ['src/orbit/*', 'scripts/extract-orbit.mjs', 'Shader Wallpapers.html'],
          ['src/widgets/index.ts', 'scripts/gen-widgets.mjs', 'Dateien in src/widgets/'],
        ],
      },
      {
        t: 'callout',
        kind: 'warn',
        text: 'Keine Scroll-Sperren auf `body` (die Reise-Seite sperrt nur ihren eigenen Wrapper), echte `<button>`s, „Animationen aus“ und `prefers-reduced-motion` respektieren. Das sind Lehren aus den Prototyp-Nachträgen.',
      },
      {
        t: 'prompt',
        title: 'AI: Design-Detail 1:1 aus dem Prototyp übernehmen',
        text: 'Lies CLAUDE.md. Im Prototyp design/design_handoff_loona_site/Loona Site V2.dc.html ist <ELEMENT> so umgesetzt: <WAS DIR AUFFÄLLT>. Finde die exakten Werte (Markup + renderVals + CSS im helmet), vergleiche mit unserer Umsetzung in src/site/…, und passe nur die Abweichungen an. Keine Werte erfinden; zitiere die Prototyp-Zeilen im Kommentar. Danach npm run typecheck && npm test.',
      },
    ],
  },
  // ---------------------------------------------------------------------------------------------------------------
  {
    id: 'data',
    n: '03',
    title: 'Inhalte & Datenfluss',
    lead: 'Wo Inhalte liegen, wie sie auf die Seite kommen und was beim Veröffentlichen passiert.',
    minutes: 8,
    nodes: [
      { t: 'diagram', kind: 'dataflow' },
      {
        t: 'list',
        items: [
          '**Startinhalte:** `content/*.ts` — 1:1 aus den Prototypen extrahiert. Beim allerersten Start übernimmt `src/cms/db.ts` sie in die Datenbank (Seed).',
          '**Datenbank:** `data/flow.db` (oder `LDFLOW_DB`). Pro Dokument eine **veröffentlichte** Fassung und optional ein **Entwurf**.',
          '**Lesen für die Site:** `src/cms/content.ts → getSiteContent()` liefert nur Veröffentlichtes. Fällt die DB aus, nimmt es die Startinhalte (Site bleibt online).',
          '**Weitergabe:** Das Site-Layout gibt alles an den `ContentProvider`; Client-Seiten lesen per `useContent()`.',
          '**Veröffentlichen:** Action → `publishDoc()` (validiert, alte Fassung → Versionen) → `revalidatePath()` → Seiten werden neu erzeugt.',
        ],
      },
      { t: 'source', file: 'src/cms/content.ts', match: 'export function getSiteContent', lines: 16 },
      {
        t: 'callout',
        kind: 'info',
        title: 'Was bewusst im Code bleibt',
        text: 'Impressum/Datenschutz (Rechtstexte), die Firmen-Stationen auf „Über mich“ samt Rail und die Hauptnavigation. Alles andere ist in LD Flow pflegbar.',
      },
      {
        t: 'quiz',
        id: 'q-data',
        q: 'Du änderst content/projects.ts auf einem bereits laufenden Server. Was passiert auf der Site?',
        options: [
          'Die Änderung erscheint sofort',
          'Nichts — die Inhalte leben nach dem ersten Start in der Datenbank',
          'Der Build schlägt fehl',
        ],
        answer: 1,
        why: 'content/*.ts ist nur der Seed für eine leere Datenbank. Danach pflegst du Inhalte in LD Flow (oder per Migration).',
      },
    ],
  },
  // ---------------------------------------------------------------------------------------------------------------
  {
    id: 'flow',
    n: '04',
    title: 'LD Flow — das CMS',
    lead: 'Collections, Entwürfe, Versionen und wie Formular und Live-Vorschau miteinander sprechen.',
    minutes: 12,
    nodes: [
      {
        t: 'files',
        items: [
          ['src/cms/schema.ts', 'Inhaltsmodell: Collections, Singletons, Seitentypen, Feldtypen, Validierung'],
          ['src/cms/db.ts', 'SQLite: Tabellen, Migrationen, Seed, Setup-Token'],
          ['src/cms/auth.ts', 'Login, Sessions, Passwörter, Rate-Limit, Rollen'],
          ['src/cms/repo.ts', 'Datenzugriff: jede Funktion prüft Rechte selbst'],
          ['src/cms/actions.ts', 'Server Actions (dünne Hüllen) + Revalidierung'],
          ['src/cms/ui/*', 'Admin-Oberfläche: Editor, Felder, Medien, Nutzer, Guide'],
          ['src/site/cms/*', 'Vorschau-Seite: Inline-Editing, Widget-Hülle, Seiten-Renderer'],
        ],
      },
      { t: 'h', text: 'Collections & Singletons' },
      {
        t: 'p',
        text: '**Collections** haben viele Einträge (Projekte, Artikel, Reise, Seiten, Vorlagen). **Singletons** genau einen (Startseite, Über mich). Beides ist in `COLLECTIONS` beschrieben — daraus entstehen Formular, Validierung, Liste und Vorschau automatisch.',
      },
      { t: 'source', file: 'src/cms/schema.ts', match: 'const ARTICLE_FIELDS', lines: 12, note: 'So sieht eine Felddefinition aus.' },
      { t: 'h', text: 'Editor ↔ Vorschau' },
      { t: 'diagram', kind: 'editor' },
      {
        t: 'list',
        items: [
          'Die Vorschau ist die **echte Seite** in einem iframe (`/flow-preview/<collection>/<id>`), nur für Angemeldete.',
          "Formular-Änderung → `postMessage({type:'ldflow:doc'})` an die Vorschau.",
          'Tippen in der Vorschau → `ldflow:set` mit Pfad (z. B. `blocks.1.slots.links.0.price`) zurück ans Formular.',
          'Beide Seiten prüfen `origin` und `source` jeder Nachricht — fremde Fenster werden ignoriert.',
          'Nach 1,2 s ohne Tippen: Entwurf speichern. „Veröffentlichen“ validiert vollständig und macht live.',
        ],
      },
      {
        t: 'source',
        file: 'src/site/cms/editing.tsx',
        match: 'export function EText',
        lines: 8,
        note: '`EText`: ohne Editor exakt der bisherige Text, im Editor ein editierbares Feld.',
      },
      {
        t: 'steps',
        id: 'ex-flow',
        title: 'Übung: einmal durch LD Flow',
        items: [
          'Startseite öffnen und in der Vorschau die Headline direkt anklicken und ändern.',
          'Zusehen, wie das Formular links mitläuft und der Status auf „Entwurf gespeichert“ springt.',
          'In einem zweiten Tab die Site öffnen — die Änderung ist noch NICHT live.',
          '„Veröffentlichen“ — jetzt ist sie live. Unter „Versionen“ liegt die alte Fassung.',
          'Die alte Version „Als Entwurf laden“ und wieder veröffentlichen.',
        ],
      },
    ],
  },
  // ---------------------------------------------------------------------------------------------------------------
  {
    id: 'widgets',
    n: '05',
    title: 'Widgets bauen',
    lead: 'Eigene Komponenten für den Baukasten: Felder, Controls (Toolbar-Buttons), Slots und Inline-Editing.',
    minutes: 20,
    nodes: [
      {
        t: 'p',
        text: 'Ein Widget ist **eine Datei** in `src/widgets/`. Sie beschreibt, welche Felder das Widget hat (→ Formular, Validierung, Speicher), welche Varianten es gibt (→ Buttons in der Werkzeugleiste über dem Widget) und ob es andere Widgets aufnehmen kann (→ Slots). Dazu eine ganz normale React-Komponente.',
      },
      { t: 'diagram', kind: 'widget' },
      { t: 'h', text: 'Ein komplettes Beispiel' },
      { t: 'source', file: 'src/widgets/pricing-card.tsx', note: 'Die Preiskarte: Felder + Controls + Inline-Editing.' },
      { t: 'h', text: 'Die Bausteine' },
      {
        t: 'table',
        head: ['Baustein', 'Beispiel', 'Ergebnis'],
        rows: [
          [
            'Felder',
            "text({ inline: true }), textarea(), richtext(), media(), gallery(), link(), color(), strings(), number(), checkbox(), choice([...]), relations('projects'), list({...})",
            'Formular links, Validierung auf dem Server, typisierte Props in render',
          ],
          [
            'Controls',
            "segment([['hell','Hell'],['dunkel','Dunkel']]), toggle('Hervorheben')",
            'Buttons in der Werkzeugleiste; nur vorgegebene Werte werden gespeichert',
          ],
          ['Slots', "slot('*'), slot(['image','video'], { max: 3 })", 'Bereiche, in die weitere Widgets passen (Spalten, Abschnitte)'],
          [
            'render',
            '({ ...felder, controls, slots, path, accent }) => …',
            'Die Komponente; Texte mit <EText path={`${path}.feld`}/> werden WYSIWYG',
          ],
        ],
      },
      { t: 'source', file: 'src/widgets/columns.tsx', note: 'Container-Widget mit Slots.' },
      {
        t: 'callout',
        kind: 'warn',
        title: 'Zwei Regeln, die der Generator prüft',
        text: "1) **Kein `'use client'`** in Widget-Dateien — der Server braucht die Definition zum Validieren. 2) Kein `useState`/`createContext` direkt im Widget; Hooks nur aus Client-Modulen wie `useSite()`/`useContent()`. Brauchst du eigenen Zustand, lege die interaktive Komponente in eine eigene Datei mit `'use client'` (z. B. unter `src/site/`) und importiere sie.",
      },
      {
        t: 'steps',
        id: 'ex-widget',
        title: 'Übung: dein erstes Widget „Testimonial“',
        items: [
          "Datei `src/widgets/testimonial.tsx` anlegen: `export default defineWidget({ id: 'testimonial', label: 'Testimonial', icon: '★', … })`.",
          'Felder: `quote: textarea({ inline: true })`, `name: text({ inline: true })`, `role: text()`, `photo: media()`.',
          "Control: `layout: segment([['links','Foto links'],['oben','Foto oben']])`.",
          'render: Foto + Zitat + Name; Texte mit `<EText path={`${path}.quote`} value={quote} multiline />`.',
          '`npm run widgets` (läuft bei dev/build automatisch) → das Widget erscheint im „+“-Menü.',
          'In LD Flow eine Seite öffnen, Testimonial einfügen, in der Vorschau tippen, Layout-Button wechseln.',
          '`npm test` — der Registry-Test prüft, dass dein Widget sauber registriert ist.',
        ],
      },
      {
        t: 'prompt',
        title: 'AI: neues Widget bauen',
        text: "Lies CLAUDE.md und src/widgets/define.ts sowie src/widgets/pricing-card.tsx als Vorbild. Baue ein neues Widget „<NAME>“ in src/widgets/<id>.tsx: <WAS ES ZEIGEN SOLL>. Felder: <…>. Controls (nur feste Varianten): <…>. Texte, die man direkt auf der Seite ändern soll, mit EText/ERich. Regeln: kein 'use client' in der Widget-Datei, Farben nur über CSS-Variablen der Site (var(--ink), var(--accent) …), mobil einspaltig (useSite().mob). Danach npm run widgets && npm run typecheck && npm test und kurz zeigen, wie es im Editor aussieht.",
      },
      {
        t: 'quiz',
        id: 'q-widget',
        q: 'Warum speichert LD Flow für Controls nur vorgegebene Werte (z. B. „hell/dunkel“) statt freier Farben?',
        options: [
          'Performance',
          'Damit das Design-System konsistent bleibt und niemand CSS einschleusen kann',
          'SQLite kann keine Farben speichern',
        ],
        answer: 1,
        why: 'Controls sind Varianten, die du im Code designst. Die Validierung verwirft alles andere — auch Versuche wie „lila; background:url(…)“.',
      },
    ],
  },
  // ---------------------------------------------------------------------------------------------------------------
  {
    id: 'builder',
    n: '06',
    title: 'Der Baukasten in der Praxis',
    lead: 'Werkzeugleiste, Einfügen, Drag & Drop, Slots, Vorlagen und globale Bausteine.',
    minutes: 8,
    nodes: [
      {
        t: 'table',
        head: ['Aktion', 'Wo', 'Was passiert'],
        rows: [
          ['Widget auswählen', 'Klick in der Vorschau', 'Violetter Rahmen + Werkzeugleiste'],
          ['Variante wechseln', 'Buttons in der Leiste', 'Control-Wert ändert sich, Formular läuft mit'],
          ['Einfügen', '„+“ zwischen Widgets / in leeren Slots', 'Menü mit allen erlaubten Widgets + Vorlagen'],
          [
            'Verschieben',
            '⋮⋮ ziehen oder ↑ ↓',
            'Auch in und aus Slots (Spalten, Abschnitte); funktioniert mit Maus, Touch und Stift, Esc bricht ab',
          ],
          ['Übergeordnetes wählen', '↥ (bei Widgets in Slots)', 'Wählt den Container (z. B. die Spalten) statt des inneren Widgets'],
          ['Duplizieren · Löschen', '⧉ · ✕', 'Kopie bekommt neue IDs'],
          ['Einstellungen', '⚙', 'Springt im Formular zu diesem Widget'],
          ['Als Vorlage', '☆', 'Speichert das Widget (samt Inhalt) als Vorlage'],
        ],
      },
      { t: 'h', text: 'Vorlagen & globale Bausteine' },
      {
        t: 'list',
        items: [
          '**Normale Vorlage:** wird beim Einfügen **kopiert** — danach unabhängig.',
          '**Globale Vorlage:** wird als **Verweis** eingefügt (🔗). Änderst du die Vorlage unter „Vorlagen“, ändert sie sich auf allen Seiten. Auf der Seite selbst ist sie nicht editierbar.',
          '**Start-Vorlage:** beim Anlegen einer Seite wählbar — die Seite beginnt mit deren Widgets.',
          'Zyklen (Vorlage verweist auf sich selbst) werden erkannt und nicht gerendert.',
        ],
      },
      {
        t: 'source',
        file: 'src/site/cms/Widgets.tsx',
        match: 'function mutate',
        lines: 8,
        note: 'Alle Baukasten-Operationen arbeiten auf einer Kopie der ganzen Widget-Liste — so bleiben Pfade auch beim Verschieben zwischen Slots korrekt.',
      },
    ],
  },
  // ---------------------------------------------------------------------------------------------------------------
  {
    id: 'extend',
    n: '07',
    title: 'Erweitern',
    lead: 'Neue Felder, Seitentypen, Inhaltsarten und Seiten — Schritt für Schritt.',
    minutes: 15,
    nodes: [
      {
        t: 'steps',
        id: 'ex-field',
        title: 'Neues Feld für Projekte (z. B. „Kunde“)',
        items: [
          '`content/projects.ts`: im Interface `Project` ergänzen (`kunde?: string`).',
          "`src/cms/schema.ts`: in `PROJECT_FIELDS` `{ key: 'kunde', label: 'Kunde', type: 'text', max: 80, inline: true }`.",
          'Darstellung in `src/site/pages/CaseStudyPage.tsx`, z. B. in den Fakten; Text mit `<EText path="kunde" value={p.kunde} />`.',
          '`npm run typecheck && npm test` — der Test „Startinhalte bestehen das Schema“ muss grün bleiben.',
        ],
      },
      {
        t: 'steps',
        id: 'ex-template',
        title: 'Neuer Seitentyp (Template)',
        items: [
          '`src/cms/schema.ts → PAGE_TEMPLATES`: Eintrag mit `id`, `label`, `description`, `fields` (inkl. `blocks`).',
          '`src/site/cms/PageRenderer.tsx`: Darstellung für `page.template === \'<id>\'`; Inhalt über `<WidgetList blocks={page.blocks} path="blocks" />`.',
          'Anlegen in LD Flow → Seiten → Seitentyp wählen.',
        ],
      },
      {
        t: 'steps',
        id: 'ex-collection',
        title: 'Neue Inhaltsart (Collection, z. B. „Talks“)',
        items: [
          '`src/cms/schema.ts → COLLECTIONS`: Definition mit Feldern, `href` (öffentliche URL).',
          'Typ in `src/cms/types.ts` + `getSiteContent()` in `src/cms/content.ts` erweitern.',
          'Routen: `src/app/(main)/(site)/talks/page.tsx` (Liste) und `talks/[slug]/page.tsx` (Detail).',
          "Vorschau: in `src/site/cms/PreviewClient.tsx` einen `case 'talks'` ergänzen.",
          'Navigation: `src/site/nav/pages.ts`; Admin-Menü: `src/app/(flow)/flow/(app)/layout.tsx`.',
          'Optional Startinhalte in `src/cms/seed.ts`.',
        ],
      },
      {
        t: 'prompt',
        title: 'AI: neue Inhaltsart anlegen',
        text: 'Lies CLAUDE.md und Kapitel „Erweitern“ im LD-Flow-Guide (src/cms/guide/chapters.ts). Lege die Collection „<NAME>“ an mit den Feldern <…>. Folge exakt den Schritten: Schema → Typen → getSiteContent → Routen (Liste + Detail, Look wie <VORBILD-SEITE>) → PreviewClient-Case → Navigation. Nutze vorhandene Komponenten (ProjectCard, Chapter, GallerySlots) statt neuer Styles. Danach typecheck, test und einen kurzen Screenshot-Check der neuen Seiten.',
      },
    ],
  },
  // ---------------------------------------------------------------------------------------------------------------
  {
    id: 'security',
    n: '08',
    title: 'Sicherheit',
    lead: 'Wie LD Flow gegen SQL-Injection, Man-in-the-Middle, Session-Diebstahl, XSS, CSRF und Brute-Force geschützt ist.',
    minutes: 12,
    nodes: [
      { t: 'diagram', kind: 'request' },
      {
        t: 'table',
        head: ['Angriff', 'Schutz', 'Wo im Code'],
        rows: [
          [
            'SQL-Injection',
            'Ausschließlich Prepared Statements mit ?-Platzhaltern; Collection-/Widget-Namen gegen feste Listen; Eingaben validiert (unbekannte Felder verworfen, Längen begrenzt)',
            'src/cms/repo.ts, auth.ts, schema.ts',
          ],
          [
            'Man-in-the-Middle',
            'HTTPS am Server/Proxy (Pflicht); Cookies Secure; Strict-Transport-Security erzwingt HTTPS nach dem ersten Besuch',
            'next.config.ts, auth.ts',
          ],
          [
            'Session-Diebstahl',
            '256-Bit-Zufallstoken; HttpOnly (per JavaScript nicht lesbar); in der DB nur der SHA-256-Hash; 7 Tage gleitend; Logout/Passwortwechsel/Sperren beenden Sessions serverseitig',
            'src/cms/auth.ts',
          ],
          [
            'XSS',
            'Rich Text als JSON, gerendert über React (kein innerHTML); Links nur https/mailto/tel/relativ; Uploads per Magic Bytes (kein SVG) mit Sandbox-CSP',
            'schema.ts, safe.ts, repo.ts, media/[id]/route.ts',
          ],
          ['CSRF', 'SameSite=Lax-Cookie; Next prüft bei Server Actions Origin gegen Host', 'auth.ts, Next'],
          [
            'Brute-Force',
            '5 Fehlversuche pro E-Mail+IP bzw. 20 pro IP → 15 min Sperre; gleich lange Prüfung für unbekannte E-Mails',
            'src/cms/auth.ts',
          ],
          ['Passwörter', 'scrypt mit Salt, Vergleich in konstanter Zeit, mind. 10 Zeichen', 'src/cms/auth.ts'],
          ['Übernahme frischer Instanz', 'Erster Admin nur mit Setup-Token (Datei nur für Server-Betreiber lesbar)', 'db.ts, auth.ts'],
          [
            'Rechte',
            'Jede Datenfunktion prüft Login/Rolle selbst (admin/editor); letzter Admin kann sich nicht aussperren',
            'src/cms/repo.ts',
          ],
          ['Clickjacking', 'Site nur von sich selbst einbettbar (Vorschau), CMS gar nicht', 'next.config.ts'],
        ],
      },
      {
        t: 'source',
        file: 'src/cms/auth.ts',
        match: 'async function createSession',
        lines: 18,
        note: 'Session anlegen: Token ins Cookie, nur der Hash in die DB.',
      },
      {
        t: 'callout',
        kind: 'warn',
        title: 'Noch offen (vor dem Livegang empfohlen)',
        text: 'Zwei-Faktor-Anmeldung (TOTP), Content-Security-Policy für Skripte (Nonces), Übersicht aktiver Sitzungen mit „überall abmelden“, Cookie-Präfix `__Host-`. Und: das Login-Rate-Limit vertraut `X-Forwarded-For` — der Server muss hinter einem Reverse-Proxy stehen, der diesen Header setzt.',
      },
      {
        t: 'prompt',
        title: 'AI: Security-Review einer Änderung',
        text: 'Lies CLAUDE.md und Kapitel „Sicherheit“ im Guide (src/cms/guide/chapters.ts). Prüfe meinen letzten Commit (git diff HEAD~1) gezielt auf: SQL ohne Prepared Statements, Datenfunktionen ohne requireUser(), neue dangerouslySetInnerHTML mit Nutzerdaten, Links/Medien ohne isSafeHref/isSafeMediaSrc, neue Server Actions ohne Validierung. Nenne Fundstellen mit Datei:Zeile und einen konkreten Fix. Nichts ändern, nur berichten.',
      },
    ],
  },
  // ---------------------------------------------------------------------------------------------------------------
  {
    id: 'hosting',
    n: '09',
    title: 'Betrieb & Hosting',
    lead: 'Node-Server, Umgebungsvariablen, HTTPS, Backups — und was GitHub Pages kann (und was nicht).',
    minutes: 8,
    nodes: [
      {
        t: 'steps',
        id: 'ex-deploy',
        title: 'Checkliste Livegang (Node-Server)',
        items: [
          'Server mit Node ≥ 22.13; `npm ci && npm run build && npm start` (Port per `PORT`).',
          'Persistenten Ordner für die Datenbank anlegen und `LDFLOW_DB=/pfad/flow.db` setzen.',
          'Reverse-Proxy mit HTTPS davor (z. B. Caddy/nginx), der `X-Forwarded-For` setzt.',
          'Erster Aufruf von `/flow` → Setup-Token aus `flow-setup-token.txt` neben der DB → Admin anlegen.',
          'Backup einrichten: `sqlite3 flow.db ".backup backup.db"` regelmäßig (eine Datei = alles inkl. Medien).',
          '`NODE_NO_WARNINGS=1` blendet die unkritische SQLite-Warnung aus.',
        ],
      },
      {
        t: 'table',
        head: ['Variable', 'Zweck'],
        rows: [
          ['LDFLOW_DB', 'Pfad der SQLite-Datei (Standard ./data/flow.db)'],
          ['LDFLOW_SETUP_TOKEN', 'optional festes Setup-Token statt generierter Datei'],
          ['LDFLOW_INSECURE_COOKIES', '1 = Cookies ohne Secure (nur lokal/Tests)'],
        ],
      },
      { t: 'h', text: 'GitHub Pages' },
      {
        t: 'p',
        text: 'GitHub Pages liefert nur statische Dateien. Die **Website** lässt sich als statischer Export dorthin bringen (Vorschau), **LD Flow nicht** — es braucht Server, Datenbank und Login. Für ein echtes Deployment: Node-Host wie Render, Fly.io, Railway oder ein eigener Server mit Volume.',
      },
    ],
  },
  // ---------------------------------------------------------------------------------------------------------------
  {
    id: 'quality',
    n: '10',
    title: 'Tests & Qualität',
    lead: 'Welche Tests es gibt, wann du welche laufen lässt und was „fertig“ bedeutet.',
    minutes: 6,
    nodes: [
      {
        t: 'table',
        head: ['Befehl', 'Prüft', 'Wann'],
        rows: [
          ['npm run typecheck', 'TypeScript im ganzen Projekt', 'nach jeder Änderung'],
          [
            'npm test',
            'Unit-Tests: Logo-Geometrie, Tokens/Kontrast, Einstellungen, Schema/Validierung, Auth, Uploads, Widgets',
            'nach jeder Änderung',
          ],
          ['npm run test:visual', 'Pixelvergleich der Logo-Komponenten mit den Handoff-Assets', 'bei Änderungen an src/components/brand'],
          ['npm run test:e2e', 'LD Flow komplett im Browser: Setup, WYSIWYG, Baukasten, Medien, Sicherheit', 'vor Releases (frische DB!)'],
          ['npm run format', 'Prettier', 'vor dem Commit'],
        ],
      },
      {
        t: 'source',
        file: 'tests/unit/cms.test.ts',
        match: 'alle Startinhalte',
        lines: 12,
        note: 'Der wichtigste Wächter: alle Prototyp-Inhalte müssen das CMS-Schema verlustfrei bestehen.',
      },
      {
        t: 'list',
        items: [
          '**Definition of Done:** Build sauber, Typecheck und Tests grün, keine Konsolenfehler, Lighthouse-Barrierefreiheit ≥ 95, jede Einstellung funktioniert und bleibt gespeichert.',
        ],
      },
    ],
  },
  // ---------------------------------------------------------------------------------------------------------------
  {
    id: 'ai',
    n: '11',
    title: 'Mit AI arbeiten',
    lead: 'So leitest du Claude Code & Co. an, damit Änderungen zum Projekt passen.',
    minutes: 10,
    nodes: [
      {
        t: 'list',
        items: [
          '**Kontext zuerst:** `CLAUDE.md` wird automatisch gelesen. Nenne zusätzlich die konkreten Dateien (dieser Guide hat für alles die Pfade).',
          '**Quelle nennen:** „1:1 aus Loona Site V2.dc.html, Zeile …“ statt „mach es schöner“. Das verhindert erfundene Werte.',
          '**Klein schneiden:** ein Widget, ein Feld, ein Bug pro Auftrag. Große Vorhaben erst planen lassen („Mach einen Plan, noch nichts ändern“).',
          '**Prüfen lassen:** jeden Auftrag mit „danach typecheck + test“ beenden; bei UI „mach einen Screenshot“.',
          '**Generierte Dateien:** immer den Generator ändern lassen, nie das Ergebnis.',
          '**Review-Auftrag:** nach größeren Änderungen einen zweiten Durchlauf nur zum Prüfen (Security-Prompt in Kapitel 08).',
        ],
      },
      {
        t: 'prompt',
        title: 'AI: Bug beheben',
        text: 'Lies CLAUDE.md. Bug: <WAS PASSIERT> auf <SEITE/URL>, erwartet: <WAS SOLLTE PASSIEREN>, reproduzierbar mit <SCHRITTEN>. Finde zuerst die Ursache (keine Vermutungen — lies den Code, reproduziere wenn möglich im Browser), erkläre sie in 2–3 Sätzen, dann minimaler Fix. Füge einen Test hinzu, der ohne Fix fehlschlägt. Danach typecheck + test.',
      },
      {
        t: 'prompt',
        title: 'AI: Plan für ein größeres Feature',
        text: 'Lies CLAUDE.md und den LD-Flow-Guide (src/cms/guide/chapters.ts). Ich möchte <FEATURE>. Erstelle einen Plan: betroffene Dateien, neue Dateien, Datenmodell-Änderungen, Sicherheitsaspekte, Tests. Nenne Alternativen mit Empfehlung. Noch nichts ändern.',
      },
      {
        t: 'prompt',
        title: 'AI: Seite im Baukasten gestalten lassen (ohne Code)',
        text: 'In LD Flow gibt es diese Widgets: text, chapter, image, gallery, video, quote, cta, projects, stats, faq, pricing-card, section, columns, pattern. Schlage für eine Seite „<THEMA>“ eine Abfolge von Widgets mit Inhalten vor (Überschriften, Texte, welche Controls/Varianten), als nummerierte Liste, die ich in LD Flow nachbauen kann.',
      },
      {
        t: 'callout',
        kind: 'tip',
        text: 'Je genauer der Auftrag an vorhandene Muster anknüpft („wie pricing-card.tsx“, „Look wie CaseStudyPage“), desto besser passt das Ergebnis ins System.',
      },
    ],
  },
  // ---------------------------------------------------------------------------------------------------------------
  {
    id: 'map',
    n: '12',
    title: 'Dateikarte & Glossar',
    lead: 'Nachschlagen: wo was liegt und was die Begriffe bedeuten.',
    minutes: 4,
    nodes: [
      {
        t: 'files',
        items: [
          ['design/', 'Handoffs: Site-Prototyp, LD Timeline, Shader Wallpapers (Quelle der Wahrheit)'],
          ['docs/', 'Logo-Handoff, LD-FLOW.md (Betrieb/Sicherheit in Kurzform)'],
          ['content/', 'Startinhalte (Seed) — 1:1 aus den Prototypen'],
          ['scripts/', 'Generatoren (Prototyp → Code), Marken-Assets, Widget-Registry'],
          ['src/app/(main)', 'Website-Routen + /brand'],
          ['src/app/(flow)', 'LD Flow Admin (eigenes Root-Layout)'],
          ['src/app/(orbit)', 'ORBIT-Wallpapers (eigenes Root-Layout)'],
          ['src/cms/', 'CMS-Kern: Schema, DB, Auth, Datenzugriff, Actions, Admin-UI, Guide'],
          ['src/site/', 'Site-Komponenten (Client)'],
          ['src/widgets/', 'Baukasten-Widgets'],
          ['src/components/brand/', 'Logo-Bibliothek'],
          ['tests/', 'unit, visual, e2e'],
          ['data/', 'Datenbank + Setup-Token (nie committen)'],
        ],
      },
      {
        t: 'table',
        head: ['Begriff', 'Bedeutung'],
        rows: [
          ['Collection / Singleton', 'Inhaltsart mit vielen Einträgen bzw. genau einem'],
          ['Entwurf / Live', 'Arbeitskopie bzw. veröffentlichte Fassung eines Dokuments'],
          ['Widget', 'Komponente für den Baukasten (defineWidget)'],
          ['Control', 'Variante eines Widgets, als Button in der Werkzeugleiste'],
          ['Slot', 'Bereich in einem Widget, der weitere Widgets aufnimmt'],
          ['Vorlage / global', 'Gespeicherte Widget-Kombination; global = als Verweis eingefügt'],
          ['EText / ERich', 'Macht Text in der Vorschau direkt editierbar'],
          ['Server Action', 'Server-Funktion, vom Browser aufrufbar — prüft Rechte selbst'],
          ['Revalidierung', 'Neu-Erzeugen vorgerenderter Seiten nach dem Veröffentlichen'],
          ['Seed', 'Startinhalte für eine leere Datenbank'],
        ],
      },
    ],
  },
];
