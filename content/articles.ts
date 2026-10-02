/**
 * .Tech-Artikel — 1:1 aus design/design_handoff_loona_site/Loona Site V2.dc.html (data() → A).
 * pinned: die drei News der Startseite (Prototyp: A.slice(0, 3)).
 * draft: Der Prototyp zeigt auf JEDEM Artikel das Badge „ENTWURF“; die Texte sind Platzhalter und werden
 * vom Site-Inhaber ersetzt (Site-README „Offene Inhalte“). Beim Finalisieren eines Artikels draft auf false setzen.
 */

import type { GalleryImage } from './projects';

export interface Article {
  id: string;
  kat: string;
  datum: string;
  titel: string;
  teaser: string;
  color: string;
  body: string[];
  pinned: boolean;
  draft: boolean;
  /** Galerie (bis zu 3 Slots: breit, klein, klein); leere Slots zeigen einen Platzhalter. Bilder kommen aus dem CMS. */
  gallery?: (GalleryImage | null)[];
}

export const ARTICLES: Article[] = [
  {
    "id": "a1",
    "kat": "KI",
    "datum": "06/2026",
    "titel": "Sieben Experimente, ein Werkzeugkasten: mein Jahr mit Claude Code",
    "teaser": "Vom 6D-Shooter bis zur Workbench — was KI-Pair-Programming im Alltag wirklich ändert.",
    "color": "#2A1B4A",
    "body": [
      "Sieben Projekte in sechs Monaten — nicht, weil ich schneller tippe, sondern weil die Reibung zwischen Idee und erstem spielbaren Stand kleiner geworden ist. Claude Code übernimmt die Fleißarbeit; die Entscheidungen bleiben bei mir.",
      "Das wichtigste Learning: KI ersetzt keine Architektur. Wer kein Zielbild hat, bekommt schnellen Code in die falsche Richtung. Wer eins hat, bekommt Tempo.",
      "Zwei der Experimente — Corefall und Covert Operations — sind öffentlich spielbar. Der Rest reift auf der Werkbank. Dieser Artikel ist ein Entwurf und wird mit echten Zahlen ergänzt."
    ],
    "pinned": true,
    "draft": true
  },
  {
    "id": "a2",
    "kat": "FRONTEND",
    "datum": "05/2026",
    "titel": "Von Flash zu React: 18 Jahre Frontend, eine Konstante",
    "teaser": "Technologien kommen und gehen — die Neugier bleibt. Eine kleine Zeitreise.",
    "color": "#0E3B2E",
    "body": [
      "Angefangen habe ich mit Flash und ActionScript — Timeline, Tweens, Bühne. Klingt heute wie Archäologie, hat mir aber beigebracht, in Zuständen und Übergängen zu denken.",
      "React fühlte sich 2015 wie ein Déjà-vu an: Komponenten statt MovieClips, Props statt Parameter, aber dieselbe Idee — Interfaces aus kleinen, beherrschbaren Teilen bauen.",
      "Die Konstante über 18 Jahre ist nicht die Technologie, sondern die Haltung: verstehen, warum etwas funktioniert — nicht nur, dass es funktioniert. (Entwurf, wird noch ausgebaut.)"
    ],
    "pinned": true,
    "draft": true
  },
  {
    "id": "a3",
    "kat": "AUSBILDUNG",
    "datum": "04/2026",
    "titel": "Ausbilden heißt zweimal lernen — AEVO in der Praxis",
    "teaser": "Seit 2019 bilde ich Fachinformatiker aus. Was das mit dem eigenen Code macht.",
    "color": "#7A2E12",
    "body": [
      "Seit März 2019 bin ich Ausbilder nach AEVO (IHK Berlin). Der überraschendste Effekt: Erklären deckt die Stellen auf, an denen man selbst nur Gewohnheit statt Verständnis hat.",
      "Ein Azubi fragt nicht, was ein useEffect tut — er fragt, warum. Und auf „warum\" gibt es keine auswendig gelernte Antwort.",
      "Wissen weitergeben ist kein Nebenjob, sondern Qualitätssicherung fürs eigene Denken. (Entwurf — Beispiele aus der Ausbildungszeit folgen.)"
    ],
    "pinned": true,
    "draft": true
  },
  {
    "id": "a4",
    "kat": "A11Y",
    "datum": "06/2026",
    "titel": "Barrierefrei by default — was BITV im Alltag wirklich heißt",
    "teaser": "Im Public Sector ist Barrierefreiheit keine Kür. Notizen aus der Praxis.",
    "color": "#14532D",
    "body": [
      "Barrierefreiheit ist kein Audit am Ende, sondern eine Entscheidung am Anfang: semantisches HTML, Fokus-Reihenfolge, Kontraste — bevor die erste Komponente entsteht.",
      "Die Überraschung: Was für Screenreader gebaut ist, wird für alle besser. Tastaturnavigation deckt UX-Fehler auf, die Maus-Nutzer nur unbewusst spüren. (Entwurf)"
    ],
    "pinned": false,
    "draft": true
  },
  {
    "id": "a5",
    "kat": "REACT",
    "datum": "03/2026",
    "titel": "React Server Components im echten Projekt — lohnt der Umbau?",
    "teaser": "RSC klingt großartig. Aber rechtfertigt der Gewinn die Migrationskosten?",
    "color": "#153B50",
    "body": [
      "Server Components lösen ein echtes Problem: Daten dort laden, wo sie liegen. Aber der Umbau eines gewachsenen Projekts ist kein Refactoring, sondern ein Architekturwechsel.",
      "Meine Faustregel: Neue Projekte ja, Bestandsprojekte nur bei echtem Payload-Problem. (Entwurf — Messwerte folgen.)"
    ],
    "pinned": false,
    "draft": true
  },
  {
    "id": "a6",
    "kat": "TYPESCRIPT",
    "datum": "02/2026",
    "titel": "TypeScript strict: die fünf Flags, die wirklich wehtun",
    "teaser": "strict: true ist leicht gesagt — und dann kommt noExplicitAny im Altcode.",
    "color": "#1E3A6E",
    "body": [
      "strictNullChecks findet echte Bugs, noImplicitAny findet Faulheit, exactOptionalPropertyTypes findet Diskussionen im Team.",
      "Der Weg für Altprojekte: Flag für Flag, Ordner für Ordner — nie alles auf einmal. (Entwurf)"
    ],
    "pinned": false,
    "draft": true
  },
  {
    "id": "a7",
    "kat": "FRONTEND",
    "datum": "02/2026",
    "titel": "View Transitions: Seitenwechsel wie in nativen Apps",
    "teaser": "Die View-Transition-API macht aus Navigationen Animationen — fast gratis.",
    "color": "#3B2A6E",
    "body": [
      "startViewTransition ist die größte UX-Verbesserung seit Jahren: Elemente morphen zwischen Seiten, statt hart zu schneiden — diese Website nutzt genau das.",
      "Stolperfallen: view-transition-name + backdrop-filter vertragen sich in Chromium nur bedingt. Ein Kapitel für sich. (Entwurf)"
    ],
    "pinned": false,
    "draft": true
  },
  {
    "id": "a8",
    "kat": "CSS",
    "datum": "01/2026",
    "titel": "Liquid Glass in CSS — was geht, was ist Marketing",
    "teaser": "Apples Glas-Look nachbauen: backdrop-filter kann viel, aber nicht alles.",
    "color": "#0F4C5C",
    "body": [
      "Frost, Sättigung, Kanten-Highlights: alles machbar. Echte Refraktion (Displacement) können nur SVG-Filter — und die rendert backdrop-filter bis heute nicht.",
      "Der praktikable Trick: maskierte Kanten-Ringe mit eigenem backdrop-filter als Geschwister-Layer. (Entwurf mit Code-Beispielen aus diesem Relaunch.)"
    ],
    "pinned": false,
    "draft": true
  },
  {
    "id": "a9",
    "kat": "TOOLING",
    "datum": "01/2026",
    "titel": "Rust lernen als JS-Entwickler: Woche eins, ehrlich",
    "teaser": "Der Borrow-Checker und ich — eine Beziehung mit Anlaufschwierigkeiten.",
    "color": "#6E2A1B",
    "body": [
      "Nach 18 Jahren dynamischer Sprachen fühlt sich Rust an wie Fahrstunden nach Jahren Fahrrad: alles bewusst, alles explizit, alles korrekt.",
      "Aber: cargo ist das beste Tooling-Erlebnis seit langem, und die Fehlermeldungen erziehen besser als jedes Tutorial. (Entwurf)"
    ],
    "pinned": false,
    "draft": true
  },
  {
    "id": "a10",
    "kat": "TOOLING",
    "datum": "12/2025",
    "titel": "Tauri 2 statt Electron? Ein Erfahrungsbericht",
    "teaser": "Desktop-Apps mit Webstack — nur eben 10 MB statt 150 MB.",
    "color": "#4A2617",
    "body": [
      "Tauri 2 macht vieles richtig: kleine Binaries, echtes OS-WebView, Rust-Backend mit sauberer IPC-Grenze. Mobile-Support ist der Gamechanger.",
      "Ehrlich bleibt: Das Ökosystem ist jünger als Electrons, und wer native Node-Module braucht, bleibt hängen. (Entwurf)"
    ],
    "pinned": false,
    "draft": true
  },
  {
    "id": "a11",
    "kat": "TOOLING",
    "datum": "11/2025",
    "titel": "Turborepo im Alltag: Monorepo ohne Kopfschmerzen",
    "teaser": "Remote Caching und Task-Pipelines — was nach dem Setup wirklich bleibt.",
    "color": "#1F2937",
    "body": [
      "Das Versprechen hält: Builds, die schon jemand gebaut hat, baut niemand nochmal. Der Cache-Hit ist das beste Gefühl des Arbeitstags.",
      "Die eigentliche Arbeit ist Disziplin in den package.json-Grenzen — Turborepo macht Schlamperei nur schneller sichtbar. (Entwurf)"
    ],
    "pinned": false,
    "draft": true
  },
  {
    "id": "a12",
    "kat": "MOBILE",
    "datum": "10/2025",
    "titel": "React Native: die New Architecture ohne Drama migrieren",
    "teaser": "Fabric, TurboModules, Bridgeless — Migration einer echten App.",
    "color": "#0D3B66",
    "body": [
      "Der Schlüssel war Reihenfolge: erst Dependencies aktualisieren, dann Feature-Flags, dann messen. Nicht umgekehrt.",
      "Ergebnis: spürbar flüssigere Listen, aber der eigentliche Gewinn ist ein sauberer Dependency-Stand. (Entwurf — aus der Arbeit an Medien- und Community-Apps.)"
    ],
    "pinned": false,
    "draft": true
  },
  {
    "id": "a13",
    "kat": "BACKEND",
    "datum": "09/2025",
    "titel": "GraphQL oder REST? Die falsche Frage",
    "teaser": "Die richtige Frage: Wer besitzt das Schema — und wer leidet bei Änderungen?",
    "color": "#5B2A86",
    "body": [
      "GraphQL glänzt, wenn viele Clients verschiedene Sichten brauchen. REST glänzt, wenn Caching und Einfachheit regieren. Beides gleichzeitig ist selten die Antwort.",
      "Meine Erfahrung aus Medien-Projekten: Das Schema ist ein Vertrag — wer ihn bricht, zahlt. Egal welches Paradigma. (Entwurf)"
    ],
    "pinned": false,
    "draft": true
  },
  {
    "id": "a14",
    "kat": "TESTING",
    "datum": "08/2025",
    "titel": "Jest raus, Vitest rein? Testing-Stack ehrlich bewertet",
    "teaser": "Schneller ja — aber Migration hat versteckte Kosten.",
    "color": "#065F46",
    "body": [
      "Vitest fühlt sich an wie Jest nach drei Espresso: gleiche API, halbe Wartezeit. Für Vite-Projekte ein No-Brainer.",
      "Aber: Snapshots, Mocks und CI-Setups wandern nicht gratis mit. Wer migriert, sollte es in einem Rutsch tun. (Entwurf)"
    ],
    "pinned": false,
    "draft": true
  },
  {
    "id": "a15",
    "kat": "CSS",
    "datum": "07/2025",
    "titel": "Styled-Components nach dem Hype: Wartung statt Magie",
    "teaser": "CSS-in-JS altert. Was ich heute anders machen würde.",
    "color": "#831843",
    "body": [
      "Styled-Components hat uns Komponenten-Denken beigebracht — und Runtime-Kosten hinterlassen. Der Trend geht klar zu Zero-Runtime.",
      "Mein Zwischenstand: Neues mit CSS-Variablen + Utility-Ansatz, Bestehendes nicht panisch umschreiben. (Entwurf)"
    ],
    "pinned": false,
    "draft": true
  },
  {
    "id": "a16",
    "kat": "REACT",
    "datum": "06/2025",
    "titel": "Next.js App Router: drei Patterns, die geblieben sind",
    "teaser": "Nach dem Experimentieren: was sich im Alltag bewährt hat.",
    "color": "#111827",
    "body": [
      "Erstens: Layouts als Datengrenzen denken. Zweitens: Server Actions für Formulare, sonst nichts. Drittens: Client Components als Blätter, nie als Wurzeln.",
      "Alles andere war bei mir Mode — diese drei tragen. (Entwurf)"
    ],
    "pinned": false,
    "draft": true
  },
  {
    "id": "a17",
    "kat": "WEB",
    "datum": "05/2025",
    "titel": "Warum ich immer noch jeden Tag die DevTools offen habe",
    "teaser": "Kein Framework ersetzt das Verstehen dessen, was der Browser wirklich tut.",
    "color": "#92400E",
    "body": [
      "Performance-Tab, Layers, Coverage: Die besten Bugfixes der letzten Jahre begannen nicht im Editor, sondern im Profiler.",
      "Wer nur im Framework denkt, debuggt Symptome. Der Browser zeigt Ursachen. (Entwurf)"
    ],
    "pinned": false,
    "draft": true
  },
  {
    "id": "a18",
    "kat": "AUSBILDUNG",
    "datum": "04/2025",
    "titel": "Azubis onboarden: die erste Woche entscheidet",
    "teaser": "Kein HelloWorld — ein echtes Ticket am dritten Tag.",
    "color": "#9A3412",
    "body": [
      "Nichts demotiviert mehr als Übungsaufgaben, die niemand braucht. Mein Ansatz: kleines echtes Ticket, echtes Review, echtes Deployment — in Woche eins.",
      "Die Angst, etwas kaputt zu machen, verschwindet nur durch die Erfahrung, dass man Kaputtes reparieren kann. (Entwurf)"
    ],
    "pinned": false,
    "draft": true
  },
  {
    "id": "a19",
    "kat": "KARRIERE",
    "datum": "03/2025",
    "titel": "Von ActionScript zu TypeScript: was Flash mir beibrachte",
    "teaser": "Die Timeline ist tot, das Denken in Zuständen lebt.",
    "color": "#7F1D1D",
    "body": [
      "Flash war Sandbox, Bühne und IDE zugleich. Wer dort Interfaces gebaut hat, hat State-Machines gelernt, bevor es das Wort im Frontend gab.",
      "ActionScript 3 war mein erstes typisiertes JavaScript — TypeScript fühlte sich 2015 wie Heimkehr an. (Entwurf)"
    ],
    "pinned": false,
    "draft": true
  },
  {
    "id": "a20",
    "kat": "TEAM",
    "datum": "02/2025",
    "titel": "Code Reviews, die niemand hasst",
    "teaser": "Reviews sind Kommunikation, kein Gericht. Ein paar Regeln.",
    "color": "#334155",
    "body": [
      "Regel eins: Nie „warum hast du…\", immer „was hältst du von…\". Regel zwei: Nits als Nits markieren. Regel drei: Lob ist Teil des Reviews.",
      "Und die wichtigste: Große PRs sind ein Planungsfehler, kein Review-Problem. (Entwurf)"
    ],
    "pinned": false,
    "draft": true
  },
  {
    "id": "a21",
    "kat": "WEB",
    "datum": "01/2025",
    "titel": "Mobile First ist tot, lang lebe Content First",
    "teaser": "Breakpoints folgen dem Inhalt — nicht Geräteklassen von 2012.",
    "color": "#0E7490",
    "body": [
      "Seit 2010 baue ich mobile Ausgaben — damals für MySwitzerland, heute responsive by default. Die Geräteklassen von damals gibt es nicht mehr.",
      "Was bleibt: Der Inhalt bestimmt, wann ein Layout bricht. Container Queries machen das endlich formal. (Entwurf)"
    ],
    "pinned": false,
    "draft": true
  },
  {
    "id": "a22",
    "kat": "KI",
    "datum": "12/2024",
    "titel": "KI-Pair-Programming: Prompts sind das neue Refactoring",
    "teaser": "Wer schlecht beschreibt, bekommt schlechten Code — schneller als je zuvor.",
    "color": "#4C1D95",
    "body": [
      "Die Qualität des generierten Codes spiegelt die Qualität der Anforderung. KI bestraft vage Tickets gnadenlos — und belohnt klare Architektur-Vorgaben.",
      "Mein Workflow: erst Zielbild in Prosa, dann Interfaces, dann generieren lassen. Nie umgekehrt. (Entwurf)"
    ],
    "pinned": false,
    "draft": true
  },
  {
    "id": "a23",
    "kat": "KARRIERE",
    "datum": "11/2024",
    "titel": "18 Jahre Webentwicklung: was bleibt, was geht",
    "teaser": "Technologien rotieren, Prinzipien bleiben. Eine Zwischenbilanz.",
    "color": "#F2E8D5",
    "body": [
      "Gegangen sind: Flash, jQuery, Bower, CoffeeScript, drei CSS-Methodologien und gefühlt zehn Build-Tools. Geblieben sind: HTTP, HTML, Neugier.",
      "Die ehrlichste Erkenntnis: Wartbarkeit schlägt Eleganz. Jedes Mal. (Entwurf)"
    ],
    "pinned": false,
    "draft": true
  }
];

export const articleById = (id: string) => ARTICLES.find((a) => a.id === id);
export const pinnedArticles = () => ARTICLES.filter((a) => a.pinned);
