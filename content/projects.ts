/**
 * Projekte, Labs und Archiv — 1:1 aus design/design_handoff_loona_site/Loona Site V2.dc.html (data() → P).
 * Extrahiert per Ausführung der Prototyp-Methode; Reihenfolge = Listen-Reihenfolge im Prototyp.
 * Abgeleitete Werte (Textfarbe auf Cover) berechnet die Site zur Laufzeit.
 */

/** 'archiv' = berufliche Projekte, die nur über Über mich/Suche-frei verlinkt werden (nicht in Katalog-Listen). */
export type ProjectKind = 'projekte' | 'labs' | 'archiv';

export interface GalleryImage {
  src: string;
  alt: string;
}

export interface Project {
  id: string;
  kind: ProjectKind;
  /** Filter-Kategorie im Katalog. */
  kat: string;
  /** Kicker auf der Karte, z. B. „KI-EXPERIMENT“. */
  tag: string;
  datum: string;
  name: string;
  /** Mono-Kürzel auf der Cover-Fläche. */
  mono: string;
  /** Cover-Farbe (Karte, Detail-Hero, Cover-Farbe-Vollmodus). */
  color: string;
  featured: boolean;
  link?: string;
  linkLabel?: string;
  status?: string;
  tool: string;
  desc: string;
  /** Kapitel 01 DIE AUSGANGSLAGE */
  ueberblick: string;
  /** Kapitel 02 DER ANSATZ */
  ansatz: string;
  /** Kapitel 03 DIE WERKZEUGE */
  stack: string[];
  /** Kapitel 04 DAS ERGEBNIS */
  ergebnis: string;
  zitat: string;
  /** Kapitel 05 GELERNT */
  learnings: string;
  /** Galerie (bis zu 3 Slots: breit, klein, klein); leere Slots zeigen einen Platzhalter. Bilder kommen aus dem CMS. */
  gallery?: (GalleryImage | null)[];
  /** Detailseite: 'case' = Case Study mit Kapiteln (Prototyp, Standard), 'story' = Scroll-Story aus Widgets (neu). */
  layout?: 'case' | 'story';
  /** Inhalt der Story-Seite: Widgets (src/widgets, Gruppe „Story“ und alle übrigen). */
  story?: StoryBlock[];
  /** Story: Marke im Menü statt des LD-Logos — Loona-Produkt, 'eigenes' (brandLogo) oder 'ld' (Standard). */
  brand?: 'ld' | 'buddy' | 'flow' | 'nova' | 'ivy' | 'eigenes';
  /** Story: eigenes Logo (bei brand = 'eigenes'). */
  brandLogo?: GalleryImage;
  /** Story: optionaler Text neben dem Zeichen, z. B. „LD Buddy“. */
  brandName?: string;
  /** Story: Beschriftung des Menüeintrags zur Startseite (statt LD-Logo), z. B. „Loona! Designs“ oder „Hallo“. */
  homeLabel?: string;
}

/** Widget-Block einer Story — gleiche Form wie Block in src/site/cms/Widgets.tsx. */
export interface StoryBlock {
  type: string;
  _id: string;
  controls?: Record<string, unknown>;
  slots?: Record<string, StoryBlock[]>;
  [k: string]: unknown;
}

export const PROJECTS: Project[] = [
  {
    "id": "corefall",
    "kind": "labs",
    "kat": "Spiel",
    "tag": "KI-EXPERIMENT",
    "datum": "05/2026",
    "name": "Corefall",
    "mono": "CF",
    "color": "#C2410C",
    "featured": true,
    "link": "https://bjoern-sellnau.github.io/core-fall/",
    "tool": "Claude Code · Opus 4.7 · Claude Design",
    "desc": "6D-Shooter à la Descent — volle Bewegungsfreiheit, Retro-Seele, moderner Stack.",
    "ueberblick": "Ein 6D-Shooter im Geist von Descent: fliegen, rollen, gieren — volle Bewegungsfreiheit in alle Richtungen, direkt im Browser.",
    "ansatz": "Gebaut als KI-Experiment: Claude Code mit Opus 4.7 als Pair-Programmer, Claude Design für die visuelle Richtung. Iterativ — spielbarer Kern zuerst, dann Feeling, dann Feinschliff.",
    "stack": [
      "Claude Code",
      "Opus 4.7",
      "Claude Design",
      "JavaScript",
      "Canvas/WebGL"
    ],
    "ergebnis": "Im Browser spielbar. Der schnellste Weg zu begreifen, wie sich KI-gestützte Spielentwicklung 2026 anfühlt.",
    "zitat": "Sechs Freiheitsgrade verzeihen keine unsaubere Mathematik.",
    "learnings": "Quaternionen früh, UI spät — und Spielgefühl entsteht in den letzten zehn Prozent. Der KI-Partner beschleunigt die ersten neunzig.",
    "status": "● spielbar · in Arbeit"
  },
  {
    "id": "covert",
    "kind": "labs",
    "kat": "Spiel",
    "tag": "KI-EXPERIMENT",
    "datum": "04/2026",
    "name": "Covert Operations",
    "mono": "CO",
    "color": "#14532D",
    "featured": true,
    "link": "https://bjoern-sellnau.github.io/Covert-Operations/",
    "tool": "Claude Code · Opus 4.7 · Claude Design",
    "desc": "Top-Down-, ISO- und FPS-Shooter in einem — ein Spielfeld, viele Perspektiven.",
    "ueberblick": "Ein Shooter, drei Perspektiven: Top-Down, isometrisch und First-Person — dasselbe Spielfeld, umschaltbar.",
    "ansatz": "Perspektivwechsel als Architektur-Übung: eine Spiellogik, mehrere Renderer. Claude Code übernahm die Fleißarbeit, die Entscheidungen blieben menschlich.",
    "stack": [
      "Claude Code",
      "Opus 4.7",
      "Claude Design",
      "JavaScript",
      "Canvas"
    ],
    "ergebnis": "Im Browser spielbar — und die Blaupause für den Arena-Ableger.",
    "zitat": "Eine Spiellogik, drei Kameras — Architektur zahlt sich in Perspektiven aus.",
    "learnings": "Renderer austauschbar zu halten kostet einen Tag und spart drei. Perspektivwechsel ist kein Feature, sondern ein Architekturtest.",
    "status": "● spielbar · in Arbeit"
  },
  {
    "id": "openbooking",
    "kind": "archiv",
    "kat": "Beruflich",
    "tag": "LEAD FRONTEND",
    "datum": "2016–2020",
    "name": "OpenBooking",
    "mono": "OB",
    "color": "#1E3A5F",
    "featured": true,
    "tool": "PIXELTEX GmbH · OpenBooking AG",
    "desc": "Hotel- & Unterkunfts-Meta-Suche — Lead Developer Frontend & Mobile Solutions.",
    "ueberblick": "Die Hotel- und Unterkunfts-Meta-Suche von PIXELTEX und der OpenBooking AG.",
    "ansatz": "Ab September 2016 verantwortlich als Lead Developer für Frontend und Mobile Solutions — Architektur, Umsetzung, Auslieferung.",
    "stack": [
      "JavaScript",
      "Frontend-Architektur",
      "Mobile",
      "Node"
    ],
    "ergebnis": "Vier Jahre Verantwortung für den sichtbarsten Teil des Produkts.",
    "zitat": "Meta-Suche heißt: fremde Daten, eigene Verantwortung.",
    "learnings": "Lead sein heißt weniger tippen, mehr entscheiden — und Standards setzen, die auch ohne einen selbst funktionieren."
  },
  {
    "id": "egov",
    "kind": "archiv",
    "kat": "Beruflich",
    "tag": "ENTERPRISE",
    "datum": "seit 2026",
    "name": "E-Government & Zoll",
    "mono": "EG",
    "color": "#0F2137",
    "featured": false,
    "tool": "Materna SE — #TeamMaterna",
    "desc": "Public-Sector-Anwendungen bei Materna. Details unter NDA.",
    "ueberblick": "Fachanwendungen für den Public Sector — E-Government und Zoll — als Senior Developer bei Materna.",
    "ansatz": "React und TypeScript im Enterprise-Umfeld: langlebig, barrierearm, wartbar. Mehr lässt die NDA nicht zu.",
    "stack": [
      "React",
      "TypeScript",
      "Enterprise",
      "Public Sector"
    ],
    "ergebnis": "Software, die Verwaltung wirklich benutzt.",
    "zitat": "Verwaltungssoftware ist dann gut, wenn niemand über sie spricht.",
    "learnings": "Barrierefreiheit und Wartbarkeit sind Features, keine Auflagen — im Public Sector entscheidet Langlebigkeit über Wert."
  },
  {
    "id": "neuewebsite",
    "kind": "projekte",
    "kat": "Website",
    "tag": "RELAUNCH",
    "datum": "bald online",
    "name": "Neue Webseite",
    "mono": "L!",
    "color": "#D97706",
    "featured": true,
    "tool": "Claude Code · Claude Design",
    "desc": "Der Relaunch von loona-designs.de — Liquid Glass, View Transitions und KI im Prozess.",
    "ueberblick": "Nach den DesignUpdates 2011, 2015 und 2016 der größte Schnitt: loona-designs.de wird neu gedacht — als Portfolio-Plattform mit Projekten, Labs und Blog.",
    "ansatz": "Entworfen in vielen Iterationen mit Claude Code und Claude Design — vom 50-Styles-Experiment über Stripe-inspirierte Wellen bis zum Liquid-Glass-System.",
    "stack": [
      "Claude Code",
      "Claude Design",
      "React",
      "View Transitions"
    ],
    "ergebnis": "Bald online — du siehst gerade einen Entwurf davon.",
    "zitat": "Die eigene Website ist das ehrlichste Projekt: kein Kunde, keine Ausreden.",
    "learnings": "Relaunches scheitern an zu vielen Ideen — ein klares System schlägt hundert Einfälle.",
    "status": "bald online"
  },
  {
    "id": "du2016",
    "kind": "projekte",
    "kat": "Website",
    "tag": "REDESIGN",
    "datum": "03/2016",
    "name": "DesignUpdate 2016",
    "mono": "16",
    "color": "#0E7490",
    "featured": true,
    "link": "https://loona-designs.de",
    "linkLabel": "Live ansehen ↗",
    "tool": "Coda 2 · HTML5",
    "desc": "Das Loona!-Redesign von 2016 — online seit 12. März 2016, bis heute im Dienst.",
    "ueberblick": "Das dritte große DesignUpdate der Plattform — schlanker, responsiver, inhaltszentriert. Bis heute die Live-Version von loona-designs.de.",
    "ansatz": "Handgebaut im Editor (Coda 2 für Mac) — HTML5, CSS3 und bewusst wenig JavaScript.",
    "stack": [
      "HTML5",
      "CSS3",
      "JavaScript",
      "Coda 2"
    ],
    "ergebnis": "Zehn Jahre im Dienst — Langlebigkeit als Qualitätsbeweis.",
    "zitat": "Zehn Jahre online ist das beste Lighthouse-Ergebnis.",
    "learnings": "Einfache Technik altert am würdevollsten — je weniger Abhängigkeiten, desto länger lebt eine Seite.",
    "status": "online seit 12.03.2016"
  },
  {
    "id": "du2015",
    "kind": "projekte",
    "kat": "Website",
    "tag": "REDESIGN",
    "datum": "04/2015",
    "name": "DesignUpdate 2015",
    "mono": "15",
    "color": "#155E75",
    "featured": false,
    "tool": "HTML5 · CSS3",
    "desc": "DesignUpdate 2015 — online ab 26. April 2015.",
    "ueberblick": "Der Vorgänger des heutigen Designs — ein Jahr Feinschliff zwischen zwei großen Updates.",
    "ansatz": "Iteration statt Neubau: Typografie, Raster und Farbwelt überarbeitet, die Basis blieb.",
    "stack": [
      "HTML5",
      "CSS3",
      "JavaScript"
    ],
    "ergebnis": "Nach knapp einem Jahr vom DesignUpdate 2016 abgelöst.",
    "zitat": "Manche Versionen sind Brücken — wichtig, auch wenn man nur kurz drübergeht.",
    "learnings": "Kurze Iterationszyklen auf der eigenen Seite halten das Handwerk warm.",
    "status": "online 26.04.2015 – 2016"
  },
  {
    "id": "du2011",
    "kind": "projekte",
    "kat": "Website",
    "tag": "REDESIGN",
    "datum": "08/2011",
    "name": "DesignUpdate 2011",
    "mono": "11",
    "color": "#1E3A5F",
    "featured": false,
    "tool": "XHTML · Railo",
    "desc": "DesignUpdate 2011 — online ab 19. August 2011.",
    "ueberblick": "Das erste große Redesign nach dem Abschied von Flash — die Plattform zieht in die HTML/CSS-Welt.",
    "ansatz": "Weg von Flash, hin zu sauberem Markup — der Zeitgeist von 2011, konsequent umgesetzt.",
    "stack": [
      "XHTML",
      "CSS",
      "JavaScript",
      "ColdFusion / Railo"
    ],
    "ergebnis": "Vier Jahre online, dann kam 2015.",
    "zitat": "Der Abschied von Flash war ein Neuanfang.",
    "learnings": "Technologie-Wechsel gelingen am besten am eigenen Projekt — bevor man sie Kunden empfiehlt.",
    "status": "online 19.08.2011 – 2015"
  },
  {
    "id": "autowerkstatt",
    "kind": "projekte",
    "kat": "Website",
    "tag": "KUNDENPROJEKT",
    "datum": "2007–2012",
    "name": "Die Autowerkstatt",
    "mono": "AW",
    "color": "#374151",
    "featured": false,
    "tool": "XHTML · PHP",
    "desc": "Kundenwebsite — fünf Jahre online, von August 2007 bis August 2012.",
    "ueberblick": "Website für eine Autowerkstatt — Leistungen, Kontakt, Anfahrt. Solide Handwerksarbeit fürs Handwerk.",
    "ansatz": "Klassischer Aufbau mit Fokus auf Auffindbarkeit und Pflegbarkeit.",
    "stack": [
      "XHTML",
      "CSS",
      "PHP"
    ],
    "ergebnis": "Fünf Jahre zuverlässig im Netz.",
    "zitat": "Gute Handwerker-Websites sind wie gute Werkstätten: unaufgeregt und verlässlich.",
    "learnings": "Kleine Kundenprojekte lehren das Wesentliche: zuhören, liefern, warten können.",
    "status": "online 2007–2012"
  },
  {
    "id": "cattshop",
    "kind": "projekte",
    "kat": "Shop",
    "tag": "ENTWURF",
    "datum": "2006",
    "name": "CATT Shop + CMS",
    "mono": "CS",
    "color": "#5B21B6",
    "featured": false,
    "tool": "Photoshop · PHP",
    "desc": "Onlineshop-Entwurf samt eigenem CMS für den Computer-Service CATT.",
    "ueberblick": "Shop-Konzept mit Artikelansicht und passendem Verwaltungs-CMS — als Entwurf entstanden.",
    "ansatz": "Design und Systemarchitektur aus einer Hand — vom Screendesign bis zur Datenstruktur.",
    "stack": [
      "Photoshop",
      "XHTML",
      "PHP",
      "MySQL"
    ],
    "ergebnis": "Blieb Entwurf — das Denken in Shop-Systemen blieb.",
    "zitat": "Auch unveröffentlichte Arbeit zahlt aufs Konto ein.",
    "learnings": "Entwürfe sind Übungsräume: Wer Shops entwirft, versteht später Billing-Systeme schneller.",
    "status": "Entwurf",
    "gallery": [
      {
        "src": "/projekte/cattshop/1.webp",
        "alt": "Onlineshop-Entwurf „CATT Shop“ (2006): Produktdetail mit Warenkorb"
      }
    ]
  },
  {
    "id": "ld2006",
    "kind": "projekte",
    "kat": "Website",
    "tag": "EIGENPROJEKT",
    "datum": "2006",
    "name": "Loona! Designs 'ld2006'",
    "mono": "06",
    "color": "#9A3412",
    "featured": false,
    "tool": "Flash · ActionScript 2",
    "desc": "Die Loona!-Website von 2006 — Splash-Screen, Startseite, Über-uns.",
    "ueberblick": "Die Plattform-Version aus dem Firmenjahr — mit Splash-Screen, wie es sich 2006 gehörte.",
    "ansatz": "Flash-geprägte Ästhetik, liebevolle Details — das Web als Bühne.",
    "stack": [
      "Flash",
      "ActionScript 2",
      "XHTML"
    ],
    "ergebnis": "Zeitkapsel der Flash-Ära — Screenshots im Archiv.",
    "zitat": "Splash-Screens waren unsere View Transitions.",
    "learnings": "Ästhetik altert, Sorgfalt nicht — die Liebe zum Detail von 2006 trägt bis heute.",
    "status": "Archiv",
    "gallery": [
      {
        "src": "/projekte/ld2006/1.webp",
        "alt": "Loona! Designs ld2006: Startseite mit Neuigkeiten und Covert-Operations-Banner"
      },
      {
        "src": "/projekte/ld2006/2.webp",
        "alt": "ld2006: Intro-Seite „what the web can be“"
      },
      {
        "src": "/projekte/ld2006/3.webp",
        "alt": "ld2006: Über-mich-Seite mit Fähigkeiten"
      }
    ]
  },
  {
    "id": "fahrschule",
    "kind": "projekte",
    "kat": "Design",
    "tag": "ENTWURF",
    "datum": "2006",
    "name": "Fahrschule (fiktiv)",
    "mono": "FS",
    "color": "#065F46",
    "featured": false,
    "tool": "Photoshop · XHTML",
    "desc": "Homepage-Entwurf einer fiktiven Fahrschule — zwei Startseiten-Varianten.",
    "ueberblick": "Freies Designprojekt: eine Fahrschul-Website, die es nie gab — zwei Varianten der Startseite.",
    "ansatz": "Fingerübung in Layout und Bildsprache, ohne Kundenbriefing.",
    "stack": [
      "Photoshop",
      "XHTML",
      "CSS"
    ],
    "ergebnis": "Portfolio-Stück der frühen Jahre.",
    "zitat": "Fiktive Kunden sind die geduldigsten.",
    "learnings": "Freie Arbeiten zeigen die eigene Handschrift deutlicher als jedes Briefing.",
    "status": "Entwurf",
    "gallery": [
      {
        "src": "/projekte/fahrschule/1.webp",
        "alt": "Fahrschul-Entwurf (2006): Startseite mit Führerscheinklassen und Terminen"
      },
      {
        "src": "/projekte/fahrschule/2.webp",
        "alt": "Fahrschul-Entwurf: Layout-Raster mit Header- und Galerie-Bereich"
      }
    ]
  },
  {
    "id": "catt2005",
    "kind": "projekte",
    "kat": "Website",
    "tag": "KUNDENPROJEKT",
    "datum": "2005",
    "name": "CATT Service",
    "mono": "CT",
    "color": "#6D28D9",
    "featured": false,
    "tool": "XHTML · PHP",
    "desc": "Homepage für den Computer-Service CATT.",
    "ueberblick": "Firmenauftritt für einen Computer-Service — Leistungen und Kontakt, klar präsentiert.",
    "ansatz": "Sauberes Screendesign, schlankes Markup — Handwerk von 2005.",
    "stack": [
      "XHTML",
      "CSS",
      "PHP"
    ],
    "ergebnis": "Mehrere Jahre online; heute offline.",
    "zitat": "Jede Kundenseite ist ein kleines Versprechen.",
    "learnings": "IT-Dienstleister als Kunden schärfen die eigene Präzision — dort schaut man auf Details.",
    "status": "nicht mehr online",
    "gallery": [
      {
        "src": "/projekte/catt2005/1.webp",
        "alt": "CATT Service (2005): Startseite mit Leistungen"
      }
    ]
  },
  {
    "id": "hannoback",
    "kind": "projekte",
    "kat": "Website",
    "tag": "KUNDENPROJEKT",
    "datum": "2005",
    "name": "Hannoback",
    "mono": "HB",
    "color": "#92400E",
    "featured": false,
    "tool": "PHP · MySQL",
    "desc": "Homepage mit selbst entwickeltem MiniCMS für Hannoback.de.",
    "ueberblick": "Kundenwebsite plus MiniCMS — Inhalte selbst pflegen, lange bevor das selbstverständlich war.",
    "ansatz": "Ein kleines, passgenaues CMS statt Standardsoftware — genau so viel System wie nötig.",
    "stack": [
      "PHP",
      "MySQL",
      "XHTML"
    ],
    "ergebnis": "Der Kunde konnte selbst pflegen — Support-Aufwand nahe null.",
    "zitat": "Das beste CMS ist das, das der Kunde versteht.",
    "learnings": "Werkzeuge auf Nutzermaß bauen — eine Lektion, die von MiniCMS bis WorkBench trägt.",
    "status": "nicht mehr online",
    "gallery": [
      {
        "src": "/projekte/hannoback/1.webp",
        "alt": "Hannoback (2005): Katalog der Gebrauchtmaschinen"
      }
    ]
  },
  {
    "id": "yayci",
    "kind": "projekte",
    "kat": "Shop",
    "tag": "KUNDENPROJEKT",
    "datum": "2004",
    "name": "Computer Handel Yayci",
    "mono": "YA",
    "color": "#1D4ED8",
    "featured": false,
    "tool": "PHP · MySQL",
    "desc": "Kompletter Onlineshop — Startseite, Kategorien, Informationsleiste.",
    "ueberblick": "Ein vollständiger Onlineshop für einen Computerhändler — von der Startseite bis zur Kategorieübersicht.",
    "ansatz": "Shop-Logik, Kategorien und Verwaltung eigenständig umgesetzt — 2004, ohne Framework-Netz.",
    "stack": [
      "PHP",
      "MySQL",
      "XHTML",
      "CSS"
    ],
    "ergebnis": "Der erste große E-Commerce-Auftrag.",
    "zitat": "Ohne Frameworks lernt man, was Frameworks leisten.",
    "learnings": "E-Commerce von Grund auf zu bauen erklärt jedes spätere Shop-System von selbst.",
    "status": "nicht mehr online",
    "gallery": [
      {
        "src": "/projekte/yayci/1.webp",
        "alt": "Computer Handel Yayci (2004): Startseite mit Angebot des Tages"
      },
      {
        "src": "/projekte/yayci/2.webp",
        "alt": "Yayci-Onlineshop: Kategorie Computer"
      },
      {
        "src": "/projekte/yayci/3.webp",
        "alt": "Yayci-Onlineshop: Startseite mit Tagespreis"
      }
    ]
  },
  {
    "id": "cot2003",
    "kind": "projekte",
    "kat": "Spiel",
    "tag": "FLASH 5 GAME",
    "datum": "2003",
    "name": "Covert Operations Tournament",
    "mono": "CO",
    "color": "#166534",
    "featured": true,
    "tool": "Flash 5 · ActionScript",
    "desc": "Flash-5-Spiel von 2003 — der Urahn der heutigen Covert-Operations-Reihe.",
    "ueberblick": "Ein Turnier-Shooter in Flash 5 — und der Namensgeber: 23 Jahre später kehrt Covert Operations als KI-Experiment zurück.",
    "ansatz": "Timeline, MovieClips und ActionScript — Spielentwicklung mit den Mitteln von 2003.",
    "stack": [
      "Flash 5",
      "ActionScript"
    ],
    "ergebnis": "Der Anfang einer Reihe, die 2026 weiterlebt.",
    "zitat": "Manche Ideen warten 23 Jahre auf ihr Sequel.",
    "learnings": "Spielgefühl ist zeitlos — die Werkzeuge ändern sich, die Faszination nicht.",
    "status": "Archiv — Fortsetzung 2026"
  },
  {
    "id": "egermann",
    "kind": "projekte",
    "kat": "Website",
    "tag": "KUNDENPROJEKT",
    "datum": "2002",
    "name": "RA Egermann",
    "mono": "RE",
    "color": "#334155",
    "featured": false,
    "tool": "HTML · CSS",
    "desc": "Homepage für eine Rechtsanwaltskanzlei — eines der ersten Kundenprojekte.",
    "ueberblick": "Kanzlei-Website aus dem Jahr 2002 — der Start in die Kundenarbeit, noch in der Ausbildungszeit.",
    "ansatz": "Seriosität vor Spielerei: klare Struktur, ruhige Gestaltung.",
    "stack": [
      "HTML",
      "CSS"
    ],
    "ergebnis": "Das erste Mal Verantwortung für den Auftritt eines Berufsträgers.",
    "zitat": "Bei Anwälten lernt man Sorgfalt — zwangsläufig.",
    "learnings": "Professionelle Zurückhaltung ist auch eine Design-Disziplin.",
    "status": "nicht mehr online"
  },
  {
    "id": "arena",
    "kind": "labs",
    "kat": "Spiel",
    "tag": "KI-EXPERIMENT",
    "datum": "05/2026",
    "name": "Covert Operations Arena",
    "mono": "CA",
    "color": "#7F1D1D",
    "featured": true,
    "tool": "Claude Code · Opus 4.8",
    "desc": "Der Arena-FPS-Ableger von Covert Operations — schneller, dichter, lauter.",
    "ueberblick": "Der Arena-Shooter-Ableger von Covert Operations: kleinere Maps, höheres Tempo.",
    "ansatz": "Mit Opus 4.8 als Experiment fortgeführt — was ändert ein Modellsprung am Entwicklungsfluss?",
    "stack": [
      "Claude Code",
      "Opus 4.8",
      "JavaScript"
    ],
    "ergebnis": "In Arbeit — die Werkbank ist offen.",
    "zitat": "Tempo ist ein Feature — auch im Entwicklungsprozess.",
    "learnings": "Ein Modellsprung ändert weniger den Code als den Dialog: präzisere Fragen, kürzere Schleifen."
  },
  {
    "id": "deathgrid",
    "kind": "labs",
    "kat": "Spiel",
    "tag": "KI-EXPERIMENT",
    "datum": "05/2026",
    "name": "Death Grid 3D",
    "mono": "DG",
    "color": "#18181B",
    "featured": true,
    "tool": "Antigravity 2",
    "desc": "Retro-Style-Shooter in bester Doom-Tradition — Grid, Sprites, Adrenalin.",
    "ueberblick": "Ein Retro-Shooter wie Doom: Raycasting-Ästhetik, Sprites, Tempo.",
    "ansatz": "Experiment mit Antigravity 2 — anderes Werkzeug, gleiche Frage: wie weit trägt KI-gestütztes Prototyping?",
    "stack": [
      "Antigravity 2",
      "JavaScript",
      "Canvas"
    ],
    "ergebnis": "In Arbeit.",
    "zitat": "Constraints von 1993, Werkzeuge von 2026.",
    "learnings": "Retro-Ästhetik zwingt zu Klarheit — im Design wie im Code. Wer mit wenig Pixeln erzählt, lernt Prioritäten."
  },
  {
    "id": "workbench",
    "kind": "labs",
    "kat": "Werkzeug",
    "tag": "WERKZEUG",
    "datum": "05/2026",
    "name": "LD WorkBench",
    "mono": "WB",
    "color": "#B45309",
    "featured": true,
    "tool": "Claude Code · Opus 4.7",
    "desc": "Timesheets und Notizen verwalten — das Werkzeug, das der Alltag bestellt hat.",
    "ueberblick": "Timesheets und Notizen an einem Ort — das Werkzeug, das der eigene Alltag bestellt hat.",
    "ansatz": "Mit Claude Code (Opus 4.7) vom Bedürfnis zum benutzbaren Tool — Eigenbedarf als bestes Anforderungsdokument.",
    "stack": [
      "Claude Code",
      "Opus 4.7",
      "React",
      "TypeScript"
    ],
    "ergebnis": "In Arbeit — täglich im Eigeneinsatz.",
    "zitat": "Eigenbedarf ist das ehrlichste Anforderungsdokument.",
    "learnings": "Werkzeuge reifen am schnellsten, wenn man sie jeden Tag selbst ertragen muss."
  },
  {
    "id": "buddy",
    "kind": "labs",
    "kat": "Werkzeug",
    "tag": "WERKZEUG",
    "datum": "03/2026",
    "name": "LD Buddy",
    "mono": "LB",
    "color": "#4C1D95",
    "featured": false,
    "tool": "Claude Code · Opus 4.5–4.7",
    "desc": "Finanzen, Bestellungen und mehr verwalten — der persönliche Assistent.",
    "ueberblick": "Der persönliche Assistent: Finanzen, Bestellungen und mehr verwalten.",
    "ansatz": "Über mehrere Opus-Versionen (4.5–4.7) gewachsen — ein Langzeit-Experiment in KI-gestützter Produktentwicklung.",
    "stack": [
      "Claude Code",
      "Opus 4.5–4.7",
      "React"
    ],
    "ergebnis": "In Arbeit.",
    "zitat": "Ein Assistent ist gut, wenn er langweilig zuverlässig ist.",
    "learnings": "Über Modellversionen hinweg zu bauen zeigt, was wirklich trägt: die eigene Struktur, nicht das Werkzeug."
  },
  {
    "id": "designideas",
    "kind": "labs",
    "kat": "Design",
    "tag": "DESIGN",
    "datum": "05/2026",
    "name": "LD Website Design Ideas",
    "mono": "LD",
    "color": "#F2E8D5",
    "featured": false,
    "tool": "Claude Code · Opus 4.8",
    "desc": "Design-Explorationen für die neue Loona!-Designs-Website — diese hier.",
    "ueberblick": "Design-Explorationen für den Relaunch von loona-designs.de — die Seite, die du gerade ansiehst, ist ein Ergebnis davon.",
    "ansatz": "Viele Richtungen parallel denken, hart aussieben — vom 50-Styles-Experiment bis zum Stripe-inspirierten Wave-Hero.",
    "stack": [
      "Claude Code",
      "Opus 4.8",
      "Design Systems"
    ],
    "ergebnis": "In Arbeit — du schaust gerade drauf.",
    "zitat": "Fünfzig Ideen, damit eine bleibt.",
    "learnings": "Hart aussieben ist Teil des Entwurfs — nicht sein Scheitern. Der Weg von 50 Styles zu einem System war der eigentliche Entwurf."
  },
  {
    "id": "ldbuddy",
    "kind": "projekte",
    "kat": "App",
    "tag": "DESKTOP-APP",
    "datum": "10/2026",
    "name": "LD Buddy",
    "mono": "LB",
    "color": "#BE185D",
    "featured": false,
    "tool": "Tauri 2 · Next.js",
    "desc": "Desktop-App für den Alltagskram (Tauri 2 + Next.js): Finanzen, Bestellungen, Neuigkeiten, Sammlung, Haushaltsbuch, Einkaufslisten und Lesezeichen — mit Chrome- und Safari-Extension, mobiler Companion-App und Verbindung zu LD NotchBuddy.",
    "ueberblick": "Sieben kleine Apps für sieben kleine Aufgaben — LD Buddy bündelt sie in einer ruhigen Oberfläche.",
    "ansatz": "Erst die Abläufe eines Tages, dann die Bereiche: Was braucht man morgens, unterwegs, abends?",
    "stack": [
      "Tauri 2",
      "Next.js",
      "Chrome-Extension",
      "Safari-Extension",
      "Companion-App",
      "LD NotchBuddy"
    ],
    "ergebnis": "In Arbeit — diese Story-Seite zeigt die Ideen.",
    "zitat": "Die beste Alltags-App ist die, die man vergisst, bis man sie braucht.",
    "learnings": "Ruhe ist ein Feature.",
    "layout": "story",
    "brand": "buddy",
    "brandName": "LD Buddy.",
    "homeLabel": "Loona! Designs",
    "story": [
      {
        "type": "story-hero",
        "_id": "ldbuddy01",
        "kicker": "LD BUDDY · DESKTOP-APP",
        "title": "Dein Alltag.",
        "title2": "Ein Buddy.",
        "text": "Finanzen, Bestellungen, Neuigkeiten, Sammlungen, Haushaltsbuch, Einkaufslisten und Lesezeichen — in einer Desktop-App, die mitdenkt statt nervt. Dazu Erweiterungen für Chrome und Safari und eine mobile Companion-App.",
        "chips": [
          "Finanzen",
          "Bestellungen",
          "Neuigkeiten",
          "Sammlung",
          "Haushaltsbuch",
          "Einkaufslisten",
          "Lesezeichen"
        ],
        "cue": "Scrollen",
        "c1": "#F472B6",
        "c2": "#A78BFA",
        "c3": "#FB923C",
        "controls": {
          "layout": "verlauf"
        }
      },
      {
        "type": "story-ticker",
        "_id": "ldbuddy02",
        "items": [
          "Konten im Blick",
          "Pakete verfolgen",
          "Listen teilen",
          "Budgets setzen",
          "Sammeln & bewerten",
          "Später lesen",
          "Funktioniert offline",
          "Keine Werbung"
        ],
        "controls": {
          "look": "pillen",
          "speed": "mittel",
          "reverse": false
        }
      },
      {
        "type": "story-words",
        "_id": "ldbuddy03",
        "kicker": "WARUM",
        "text": "Sieben Apps für sieben Kleinigkeiten? LD Buddy bündelt den Alltagskram an einem Ort — schnell, privat und so aufgeräumt, dass man ihn gerne öffnet."
      },
      {
        "type": "story-scene",
        "_id": "ldbuddy15",
        "kicker": "ÜBERALL DABEI",
        "title": "Desktop zuerst. Browser und Telefon im Gepäck.",
        "controls": {
          "bg": "keiner",
          "width": "breit",
          "height": "auto",
          "effect": "hoch",
          "align": "mitte",
          "glow": false
        },
        "slots": {
          "inhalt": [
            {
              "type": "story-bento",
              "_id": "ldbuddy16",
              "items": [
                {
                  "icon": "🖥️",
                  "title": "Desktop-App",
                  "text": "Das Zuhause von LD Buddy — gebaut mit Tauri 2 und Next.js.",
                  "size": "l",
                  "color": "#BE185D",
                  "screen": "dashboard",
                  "rows": [
                    "Ausgaben Oktober | 1.284 € | €",
                    "Pakete unterwegs | 3 | 📦",
                    "Einkaufsliste | 6 offen | 🛒",
                    "Später lesen | 4 | 🔖"
                  ]
                },
                {
                  "icon": "🧩",
                  "title": "Chrome-Extension",
                  "text": "Lesezeichen, Bestellungen und Preise direkt aus dem Browser an Buddy schicken.",
                  "size": "s"
                },
                {
                  "icon": "🧭",
                  "title": "Safari-Extension",
                  "text": "Dasselbe für Safari.",
                  "size": "s"
                },
                {
                  "icon": "📱",
                  "title": "Companion-App",
                  "text": "Mobil dabei: Liste abhaken, Paket prüfen, Beleg festhalten.",
                  "size": "s",
                  "color": "#9D174D"
                },
                {
                  "icon": "✨",
                  "title": "LD NotchBuddy",
                  "text": "Verbindung zur neuen LD NotchBuddy. App.",
                  "size": "s"
                }
              ]
            }
          ]
        }
      },
      {
        "type": "story-scene",
        "_id": "ldbuddy17",
        "kicker": "ALLE ANSICHTEN",
        "title": "Einmal durchklicken, bitte.",
        "controls": {
          "bg": "keiner",
          "width": "breit",
          "height": "auto",
          "effect": "hoch",
          "align": "mitte",
          "glow": false
        },
        "slots": {
          "inhalt": [
            {
              "type": "story-gallery",
              "_id": "ldbuddy18",
              "text": "Dieselben Daten, fünf Gesichter — wähle eine Ansicht.",
              "color": "#BE185D",
              "items": [
                {
                  "label": "Desktop",
                  "device": "desktop",
                  "screen": "dashboard",
                  "screenTitle": "Heute",
                  "rows": [
                    "Ausgaben Oktober | 1.284 € | €",
                    "Pakete unterwegs | 3 | 📦",
                    "Einkaufsliste | 6 offen | 🛒",
                    "Später lesen | 4 | 🔖"
                  ],
                  "caption": "Die Desktop-App (Tauri 2 + Next.js) — das Zuhause aller Bereiche."
                },
                {
                  "label": "Mobile",
                  "device": "phone",
                  "screen": "liste",
                  "screenTitle": "Einkauf",
                  "rows": [
                    "Hafermilch | 2× | ✓",
                    "Bananen | 1 kg",
                    "Kaffee | 500 g | ✓",
                    "Brot | 1",
                    "Tomaten | 6"
                  ],
                  "caption": "Die Companion-App für unterwegs: abhaken, prüfen, festhalten."
                },
                {
                  "label": "Leseliste",
                  "device": "sidebar",
                  "screen": "lesezeichen",
                  "screenTitle": "Später lesen",
                  "rows": [
                    "Clean Architecture | martinfowler.com | M",
                    "Liquid Glass erklärt | 6 Min. | L",
                    "Tauri 2.0 | tauri.app | T",
                    "Rezepte: Herbst | 12 Min. | R"
                  ],
                  "caption": "Leseliste-Erweiterung als Seitenleiste: Artikel merken, später in Ruhe lesen."
                },
                {
                  "label": "Chrome",
                  "device": "chrome",
                  "screen": "bestellungen",
                  "screenTitle": "Bestellungen",
                  "rows": [
                    "Kopfhörer | Di | 2",
                    "Laufschuhe | Mo | 3",
                    "Monstera | heute | 0"
                  ],
                  "caption": "Chrome-Erweiterung: Bestellung oder Preis mit einem Klick an Buddy schicken."
                },
                {
                  "label": "Safari",
                  "device": "safari",
                  "screen": "lesezeichen",
                  "screenTitle": "Merken",
                  "rows": [
                    "Diese Seite | jetzt merken | +",
                    "Preisalarm | ab 79 € | €",
                    "Zur Sammlung | Vinyl | ♫"
                  ],
                  "caption": "Safari-Erweiterung: dasselbe für Safari auf dem Mac."
                }
              ],
              "controls": {
                "layout": "register"
              }
            }
          ]
        }
      },
      {
        "type": "story-scene",
        "_id": "ldbuddy04",
        "kicker": "SO FÜHLT ES SICH AN",
        "title": "Ein Tag mit LD Buddy",
        "text": "Vom ersten Kaffee bis zum Sofa — Buddy ist da, wenn du ihn brauchst, und still, wenn nicht.",
        "c1": "#2A0A1C",
        "c2": "#831843",
        "controls": {
          "bg": "verlauf",
          "width": "breit",
          "height": "auto",
          "effect": "hoch",
          "align": "links",
          "glow": true
        },
        "slots": {
          "inhalt": [
            {
              "type": "story-steps",
              "_id": "ldbuddy05",
              "color": "#BE185D",
              "steps": [
                {
                  "icon": "☕",
                  "title": "07:30 — Kontostand zum Kaffee",
                  "text": "Ein Blick genügt: Was ist reingekommen, was ging raus, was steht diese Woche an. Ohne fünf Banking-Apps.",
                  "screen": "finanzen",
                  "screenTitle": "Finanzen",
                  "rows": [
                    "Kontostand | 2.481,20 €",
                    "Gehalt | +3.150,00 € | €",
                    "Miete | -950,00 € | ⌂",
                    "Supermarkt | -64,80 € | S",
                    "Streaming | -12,99 € | ▶"
                  ]
                },
                {
                  "icon": "🛒",
                  "title": "Die Einkaufsliste, die mitdenkt",
                  "text": "Gemeinsam mit der Familie, sortiert nach Gängen im Markt — und was leer ist, schlägt Buddy von selbst vor.",
                  "screen": "liste",
                  "screenTitle": "Einkauf",
                  "rows": [
                    "Hafermilch | 2× | ✓",
                    "Bananen | 1 kg",
                    "Kaffee | 500 g | ✓",
                    "Brot | 1",
                    "Tomaten | 6",
                    "Spülmittel | 1"
                  ]
                },
                {
                  "icon": "📦",
                  "title": "Pakete ohne Tracking-Chaos",
                  "text": "Bestellungen landen automatisch in Buddy — mit Status, Lieferdatum und Erinnerung an die Rücksendefrist.",
                  "screen": "bestellungen",
                  "screenTitle": "Bestellungen",
                  "rows": [
                    "Kopfhörer | Di | 2",
                    "Laufschuhe | Mo | 3",
                    "Buch: Clean Code | Fr | 1",
                    "Monstera | heute | 0"
                  ]
                },
                {
                  "icon": "📰",
                  "title": "Neuigkeiten, die dich betreffen",
                  "text": "Kein endloser Feed: nur Meldungen zu deinen Orten, Geräten und Themen — gebündelt einmal am Tag.",
                  "screen": "feed",
                  "screenTitle": "Heute",
                  "rows": [
                    "Update für deinen Router verfügbar | Technik | 5 Min.",
                    "Wochenmarkt öffnet länger | Lokal | 2 Std.",
                    "Bauarbeiten am Wochenende | Pendeln | heute"
                  ]
                },
                {
                  "icon": "🔖",
                  "title": "Lesezeichen für später — wirklich für später",
                  "text": "Links aus jeder App teilen, Buddy merkt sie sich mit Vorschau und erinnert dich am Sonntag.",
                  "screen": "lesezeichen",
                  "screenTitle": "Lesezeichen",
                  "rows": [
                    "View Transitions im Detail | web.dev | V",
                    "Rezept: Ofengemüse | chefkoch.de | R",
                    "Steuererklärung 2026 | elster.de | E",
                    "Wanderung Sächsische Schweiz | komoot | W"
                  ]
                }
              ],
              "controls": {
                "side": "rechts",
                "device": "browser"
              }
            }
          ]
        }
      },
      {
        "type": "story-scene",
        "_id": "ldbuddy06",
        "kicker": "ALLES AN EINEM ORT",
        "title": "Sieben Bereiche. Eine Oberfläche.",
        "controls": {
          "bg": "keiner",
          "width": "breit",
          "height": "auto",
          "effect": "hoch",
          "align": "mitte",
          "glow": false
        },
        "slots": {
          "inhalt": [
            {
              "type": "story-bento",
              "_id": "ldbuddy07",
              "items": [
                {
                  "icon": "💳",
                  "title": "Finanzen",
                  "text": "Alle Konten und Karten an einem Ort, Abos automatisch erkannt.",
                  "size": "l",
                  "color": "#BE185D",
                  "screen": "finanzen",
                  "rows": [
                    "Diesen Monat | 1.284,50 €",
                    "Abos | -42,96 € | ↻",
                    "Tanken | -71,20 € | T",
                    "Erstattung | +23,00 € | +"
                  ]
                },
                {
                  "icon": "📒",
                  "title": "Haushaltsbuch",
                  "text": "Budgets je Kategorie — mit Warnung, bevor es knapp wird.",
                  "size": "t",
                  "screen": "haushalt",
                  "rows": [
                    "Lebensmittel | 312 € | 78",
                    "Wohnen | 950 € | 100",
                    "Freizeit | 140 € | 56",
                    "Mobilität | 96 € | 40"
                  ]
                },
                {
                  "icon": "🛒",
                  "title": "Einkaufslisten",
                  "text": "Geteilt, sortiert, sofort synchron.",
                  "size": "s"
                },
                {
                  "icon": "📦",
                  "title": "Bestellungen",
                  "text": "Status und Rücksendefristen im Blick.",
                  "size": "s"
                },
                {
                  "icon": "🗞️",
                  "title": "Neuigkeiten",
                  "text": "Ein ruhiger Tagesüberblick statt hundert Push-Nachrichten.",
                  "size": "w",
                  "color": "#0E7490"
                },
                {
                  "icon": "🧩",
                  "title": "Sammlung",
                  "text": "Vinyl, LEGO, Pflanzen — alles katalogisiert.",
                  "size": "s"
                },
                {
                  "icon": "🔖",
                  "title": "Lesezeichen",
                  "text": "Später lesen, ohne es zu vergessen.",
                  "size": "s"
                },
                {
                  "icon": "🔒",
                  "title": "Privat ab Werk",
                  "text": "Daten bleiben auf deinem Gerät, Sync Ende-zu-Ende verschlüsselt, keine Werbung.",
                  "size": "w",
                  "color": "#111827"
                }
              ]
            }
          ]
        }
      },
      {
        "type": "story-app",
        "_id": "ldbuddy08",
        "kicker": "HAUSHALTSBUCH",
        "title": "Budgets, die nicht nach Verzicht aussehen",
        "text": "Buddy sortiert Ausgaben automatisch in Kategorien und zeigt, wo noch Luft ist — freundlich statt mahnend.",
        "bullets": [
          "Kategorien automatisch erkannt",
          "Hinweis, bevor das Budget reißt",
          "Monatsrückblick als kleine Story"
        ],
        "color": "#0F766E",
        "screen": "haushalt",
        "screenTitle": "Oktober",
        "rows": [
          "Lebensmittel | 312 € | 78",
          "Wohnen | 950 € | 100",
          "Freizeit | 140 € | 56",
          "Mobilität | 96 € | 40",
          "Kleidung | 230 € | 92"
        ],
        "controls": {
          "side": "links",
          "device": "phone"
        }
      },
      {
        "type": "story-scene",
        "_id": "ldbuddy09",
        "kicker": "SAMMLUNG",
        "title": "Deine Schätze, endlich sortiert.",
        "controls": {
          "bg": "keiner",
          "width": "inhalt",
          "height": "auto",
          "effect": "fade",
          "align": "links",
          "glow": false
        },
        "slots": {
          "inhalt": []
        }
      },
      {
        "type": "story-horizontal",
        "_id": "ldbuddy10",
        "items": [
          {
            "icon": "📷",
            "kicker": "SCANNEN",
            "title": "Foto rein, Rest erledigt Buddy",
            "text": "Barcode, Cover oder Etikett — Titel, Wert und Zustand füllen sich selbst.",
            "color": "#7C2D12"
          },
          {
            "icon": "🎧",
            "kicker": "SAMMELN",
            "title": "Vinyl, LEGO, Pflanzen",
            "text": "Eigene Sammlungen mit Feldern, die zu dir passen."
          },
          {
            "icon": "📈",
            "kicker": "WERT",
            "title": "Was ist es wert?",
            "text": "Preisentwicklung deiner Sammlung — ohne Tabellen.",
            "color": "#065F46"
          },
          {
            "icon": "🤝",
            "kicker": "TEILEN",
            "title": "Tauschen statt doppelt kaufen",
            "text": "Listen mit Freunden teilen, Doppelte markieren."
          },
          {
            "icon": "🔔",
            "kicker": "WUNSCHLISTE",
            "title": "Alarm bei Schnäppchen",
            "text": "Buddy meldet sich, wenn ein Wunschteil günstig auftaucht.",
            "color": "#9D174D"
          }
        ]
      },
      {
        "type": "story-scene",
        "_id": "ldbuddy11",
        "kicker": "IN ZAHLEN",
        "title": "Weniger Apps, mehr Ruhe.",
        "c1": "#BE185D",
        "controls": {
          "bg": "dunkel",
          "width": "breit",
          "height": "auto",
          "effect": "zoom",
          "align": "mitte",
          "glow": true
        },
        "slots": {
          "inhalt": [
            {
              "type": "story-numbers",
              "_id": "ldbuddy12",
              "items": [
                {
                  "value": "7",
                  "label": "Bereiche in einer App"
                },
                {
                  "value": "0",
                  "label": "Werbebanner"
                },
                {
                  "value": "100 %",
                  "label": "offline nutzbar"
                },
                {
                  "value": "2,4 s",
                  "label": "bis zur ersten Liste"
                }
              ]
            }
          ]
        }
      },
      {
        "type": "story-scene",
        "_id": "ldbuddy13",
        "kicker": "IN ARBEIT",
        "title": "Bereit für weniger Kram?",
        "text": "LD Buddy entsteht gerade bei loona! designs. Neugierig, mitreden oder testen? Schreib mir.",
        "c1": "#DB2777",
        "c2": "#7C3AED",
        "controls": {
          "bg": "verlauf",
          "width": "voll",
          "height": "screen",
          "effect": "blur",
          "align": "mitte",
          "glow": true
        },
        "slots": {
          "inhalt": [
            {
              "type": "cta",
              "_id": "ldbuddy14",
              "label": "Alle Projekte ansehen",
              "href": "/projekte",
              "controls": {
                "variant": "akzent",
                "align": "mitte"
              }
            }
          ]
        }
      }
    ]
  },
  {
    "id": "coe",
    "kind": "labs",
    "kat": "Spiel",
    "tag": "GAME ENGINE",
    "datum": "10/2026",
    "name": "COE",
    "mono": "CO",
    "color": "#14532D",
    "featured": false,
    "tool": "Claude Code · JavaScript · WebGL",
    "desc": "Covert Operations Engine — eine Spiel-Engine, viele Genres: FPS, Stealth, Arcade-Racer und Open-World. Mit Beispielspielen von Battlefield Warfare bis Ghetto Gangz.",
    "ueberblick": "Aus „Covert Operations“ wurde eine Engine: dieselbe Spiellogik treibt Shooter, Schleichspiel, Rennspiel und offene Stadt.",
    "ansatz": "Kern zuerst (Physik, Eingabe, KI, Kamera), Genres als Module darüber.",
    "stack": [
      "JavaScript",
      "WebGL",
      "Claude Code",
      "Eigene Physik",
      "Gegner-KI"
    ],
    "ergebnis": "In Arbeit — diese Story-Seite zeigt die Beispiele.",
    "zitat": "Eine Engine ist erst fertig, wenn das zweite Spiel nichts mehr umbauen muss.",
    "learnings": "Genres teilen mehr, als man denkt — Kamera und Eingabe sind der Unterschied.",
    "layout": "story",
    "story": [
      {
        "type": "story-hero",
        "_id": "coe01",
        "kicker": "COE · COVERT OPERATIONS ENGINE",
        "title": "Eine Engine.",
        "title2": "Jedes Genre.",
        "text": "Shooter, Schleichen, Rasen, Stadt — die Covert Operations Engine steckt hinter allen Beispielspielen. Gleiche Physik, gleiche KI, andere Kamera.",
        "chips": [
          "FPS",
          "Stealth",
          "Arcade-Racer",
          "Open World",
          "Top-Down",
          "ISO"
        ],
        "cue": "Scrollen",
        "c1": "#14532D",
        "c2": "#052E16",
        "c3": "#EAB308",
        "controls": {
          "layout": "buehne"
        }
      },
      {
        "type": "story-scene",
        "_id": "coe02",
        "kicker": "IN ZAHLEN",
        "title": "Ein Kern, viele Spiele.",
        "controls": {
          "bg": "keiner",
          "width": "inhalt",
          "height": "auto",
          "effect": "zoom",
          "align": "mitte",
          "glow": false
        },
        "slots": {
          "inhalt": [
            {
              "type": "story-numbers",
              "_id": "coe03",
              "items": [
                {
                  "value": "1",
                  "label": "Engine"
                },
                {
                  "value": "4",
                  "label": "Beispielspiele"
                },
                {
                  "value": "5",
                  "label": "Kameras"
                },
                {
                  "value": "0",
                  "label": "Installationen nötig"
                }
              ]
            }
          ]
        }
      },
      {
        "type": "story-scene",
        "_id": "coe04",
        "kicker": "DIE BEISPIELE",
        "title": "Scroll durch vier Spiele.",
        "text": "Links das Spiel, rechts die Szene — beim Scrollen wechselt das Spiel.",
        "c1": "#0B1F12",
        "c2": "#14532D",
        "controls": {
          "bg": "verlauf",
          "width": "breit",
          "height": "auto",
          "effect": "hoch",
          "align": "links",
          "glow": true
        },
        "slots": {
          "inhalt": [
            {
              "type": "story-steps",
              "_id": "coe05",
              "color": "#16A34A",
              "steps": [
                {
                  "icon": "🎯",
                  "title": "Battlefield Warfare",
                  "text": "FPS mit Trupps, Fahrzeugen und zerstörbarer Deckung.",
                  "screen": "spiel",
                  "rows": [
                    "Battlefield Warfare | Sektor 3 – Hafen | fps",
                    "Leben | 86 | ♥",
                    "Munition | 24/120 | ▮",
                    "Trupp | 4/4 | ⚑"
                  ]
                },
                {
                  "icon": "🏙️",
                  "title": "Ghetto Gangz",
                  "text": "Open World à la GTA: eine Stadt, Fahrzeuge, Fahndungslevel.",
                  "screen": "spiel",
                  "rows": [
                    "Ghetto Gangz | Nordviertel | stadt",
                    "Fahndung | ★★☆ | ⚠",
                    "Cash | $ 2.340 | $",
                    "Ruf | 61 % | ♛"
                  ]
                },
                {
                  "icon": "🏁",
                  "title": "Racer",
                  "text": "Arcade-Racer: Drift, Nitro, Abkürzungen.",
                  "screen": "spiel",
                  "rows": [
                    "Racer | Runde 2/3 | rennen",
                    "Position | 2/8 | ⚑",
                    "Speed | 214 km/h | ⏱",
                    "Nitro | 70 % | ⚡"
                  ]
                },
                {
                  "icon": "🦅",
                  "title": "Raptor: Shadow of Vengeance",
                  "text": "Stealth: Licht, Lärm und die Sichtkegel der Wachen.",
                  "screen": "spiel",
                  "rows": [
                    "Raptor: Shadow of Vengeance | Lagerhaus | stealth",
                    "Sichtbar | 12 % | ◐",
                    "Lärm | leise | ♪",
                    "Ziel | 1/3 | ⌖"
                  ]
                }
              ],
              "controls": {
                "side": "rechts",
                "device": "browser"
              }
            }
          ]
        }
      },
      {
        "type": "story-words",
        "_id": "coe06",
        "kicker": "WARUM",
        "text": "Jedes Spiel fängt wieder bei null an? COE nicht. Bewegung, Treffer, Gegner und Fahrzeuge gibt es einmal — die Spiele erzählen nur, was daraus wird."
      },
      {
        "type": "story-horizontal",
        "_id": "coe07",
        "items": [
          {
            "icon": "🎮",
            "kicker": "KAMERA",
            "title": "FPS, Top-Down, ISO, Verfolger",
            "text": "Umschaltbar zur Laufzeit — dieselbe Szene, andere Sicht.",
            "color": "#14532D"
          },
          {
            "icon": "🧠",
            "kicker": "GEGNER-KI",
            "title": "Patrouille bis Rückzug",
            "text": "Suchen, angreifen, Deckung, Verstärkung rufen."
          },
          {
            "icon": "💥",
            "kicker": "PHYSIK",
            "title": "Treffer, die sich anfühlen",
            "text": "Ballistik, Rückstoß, zerstörbare Objekte.",
            "color": "#7C2D12"
          },
          {
            "icon": "🚗",
            "kicker": "FAHRZEUGE",
            "title": "Vom Panzer zum Drift-Auto",
            "text": "Ein Fahrmodell, viele Abstimmungen."
          },
          {
            "icon": "⚙️",
            "kicker": "SCHALTER",
            "title": "Je Spiel einstellbar",
            "text": "Blut, zerstörbares Terrain, Schwierigkeit.",
            "color": "#1E3A8A"
          }
        ]
      },
      {
        "type": "story-scene",
        "_id": "coe08",
        "kicker": "IN ARBEIT",
        "title": "Lust auf eine Runde?",
        "text": "COE entsteht gerade bei loona! designs. Covert Operations ist schon im Browser spielbar.",
        "c1": "#15803D",
        "c2": "#0F172A",
        "controls": {
          "bg": "verlauf",
          "width": "voll",
          "height": "screen",
          "effect": "blur",
          "align": "mitte",
          "glow": true
        },
        "slots": {
          "inhalt": [
            {
              "type": "cta",
              "_id": "coe09",
              "label": "Alle Labs ansehen",
              "href": "/labs",
              "controls": {
                "variant": "akzent",
                "align": "mitte"
              }
            }
          ]
        }
      }
    ]
  },
  {
    "id": "notchbuddy",
    "kind": "projekte",
    "kat": "App",
    "tag": "MAC-APP",
    "datum": "10/2026",
    "name": "LD NotchBuddy",
    "mono": "NB",
    "color": "#9D174D",
    "featured": false,
    "tool": "Swift · macOS · LD Buddy",
    "desc": "Die Notch des MacBooks als Dynamic Island: Limits von Claude Code und Antigravity, aktive Agents, Musik, Kalender, Pomodoro, Zwischenablage, Ablage und Systemwerte — dazu Finanzen und Bestellungen aus LD Buddy.",
    "ueberblick": "Die Aussparung oben im Bildschirm ist ungenutzter Platz. NotchBuddy macht daraus eine kleine Statuszentrale.",
    "ansatz": "Erst Symbole, dann bei Bedarf aufklappen — nie im Weg, immer einen Blick entfernt.",
    "stack": [
      "Swift",
      "macOS",
      "LD Buddy",
      "Claude Code",
      "Antigravity"
    ],
    "ergebnis": "In Arbeit — diese Story-Seite zeigt die Ideen.",
    "zitat": "Der beste Platz für Status ist der, auf den man ohnehin schaut.",
    "learnings": "Weniger anzeigen, besser auswählen.",
    "layout": "story",
    "brand": "buddy",
    "brandName": "LD NotchBuddy.",
    "homeLabel": "Loona! Designs",
    "story": [
      {
        "type": "story-hero",
        "_id": "notchbuddy01",
        "kicker": "LD NOTCHBUDDY · MAC-APP",
        "title": "Deine Notch.",
        "title2": "Jetzt mit Sinn.",
        "text": "Wie die Dynamic Island auf dem iPhone — nur unter der Notch deines MacBooks. Symbole im Ruhezustand, ein Klick klappt die Insel auf.",
        "chips": [
          "Claude Code",
          "Antigravity",
          "Agents",
          "Musik",
          "Pomodoro",
          "System"
        ],
        "cue": "Scrollen",
        "c1": "#F472B6",
        "c2": "#38BDF8",
        "c3": "#A78BFA",
        "device": "desktop",
        "screen": "notch",
        "screenTitle": "LD NotchBuddy",
        "rows": [
          "Claude Code | 72 % | ✳",
          "Antigravity | 38 % | ◭",
          "Agents aktiv | 3 | ⚙",
          "Musik | Apple Music | ♫",
          "Pomodoro | 18:42 | ◷",
          "Akku | 84 % | ▮",
          "Finanzen | -1.284 € | €",
          "Pakete | 3 unterwegs | 📦"
        ],
        "controls": {
          "layout": "geraet"
        }
      },
      {
        "type": "story-ticker",
        "_id": "notchbuddy02",
        "items": [
          "Limits im Blick",
          "Agents beobachten",
          "Musik steuern",
          "Termine sehen",
          "Pomodoro",
          "Ablage ohne Speichern",
          "CPU · GPU · RAM",
          "Finanzen aus LD Buddy"
        ],
        "controls": {
          "look": "pillen",
          "speed": "schnell",
          "reverse": true
        }
      },
      {
        "type": "story-app",
        "_id": "notchbuddy03",
        "kicker": "CLAUDE CODE · ANTIGRAVITY",
        "title": "Wissen, wie viel noch geht.",
        "text": "Das 5-Stunden-Fenster, die Woche, der Tag: NotchBuddy zeigt die Limits deiner KI-Werkzeuge — und färbt sich, bevor es knapp wird.",
        "bullets": [
          "Limits und Status von Claude Code",
          "Antigravity im selben Blick",
          "Aktive Agents mit Meldung, wenn sie fertig sind"
        ],
        "color": "#BE185D",
        "screen": "limits",
        "screenTitle": "Limits",
        "rows": [
          "Claude Code | 72 % | 5-Std.-Fenster",
          "Claude Code | 41 % | Woche",
          "Antigravity | 38 % | heute",
          "Agents | 3 | aktiv"
        ],
        "controls": {
          "side": "links",
          "device": "phone"
        }
      },
      {
        "type": "story-scene",
        "_id": "notchbuddy04",
        "kicker": "ALLE INSELN",
        "title": "Vier Ansichten, ein Blick.",
        "c1": "#1E1B4B",
        "c2": "#831843",
        "controls": {
          "bg": "verlauf",
          "width": "breit",
          "height": "auto",
          "effect": "hoch",
          "align": "mitte",
          "glow": true
        },
        "slots": {
          "inhalt": [
            {
              "type": "story-gallery",
              "_id": "notchbuddy05",
              "color": "#BE185D",
              "items": [
                {
                  "label": "Insel",
                  "device": "desktop",
                  "screen": "notch",
                  "screenTitle": "LD NotchBuddy",
                  "rows": [
                    "Claude Code | 72 % | ✳",
                    "Antigravity | 38 % | ◭",
                    "Agents aktiv | 3 | ⚙",
                    "Musik | Apple Music | ♫",
                    "Pomodoro | 18:42 | ◷",
                    "Akku | 84 % | ▮",
                    "Finanzen | -1.284 € | €",
                    "Pakete | 3 unterwegs | 📦"
                  ]
                },
                {
                  "label": "System",
                  "device": "desktop",
                  "screen": "system",
                  "screenTitle": "System",
                  "rows": [
                    "CPU | 34 % | 34",
                    "GPU | 61 % | 61",
                    "Speicher | 18,2 / 32 GB | 57",
                    "Netzwerk | ↓ 12 MB/s | 40",
                    "Akku | 84 % | 84",
                    "CPU-Kerne | 40 62 18 77 25 90 33 12 55 48"
                  ]
                },
                {
                  "label": "Aus LD Buddy",
                  "device": "desktop",
                  "screen": "finanzen",
                  "screenTitle": "Finanzen",
                  "rows": [
                    "Diesen Monat | 1.284,50 €",
                    "Abos | -42,96 € | ↻",
                    "Gehalt | +3.150,00 € | €"
                  ]
                },
                {
                  "label": "Bestellungen",
                  "device": "desktop",
                  "screen": "bestellungen",
                  "screenTitle": "Bestellungen",
                  "rows": [
                    "Kopfhörer | Di | 2",
                    "Laufschuhe | Mo | 3",
                    "Monstera | heute | 0"
                  ]
                }
              ],
              "controls": {
                "layout": "raster"
              }
            }
          ]
        }
      },
      {
        "type": "story-scene",
        "_id": "notchbuddy06",
        "kicker": "ALLES DRIN",
        "title": "Was unter die Notch passt",
        "controls": {
          "bg": "keiner",
          "width": "inhalt",
          "height": "auto",
          "effect": "fade",
          "align": "mitte",
          "glow": false
        },
        "slots": {
          "inhalt": [
            {
              "type": "story-bento",
              "_id": "notchbuddy07",
              "items": [
                {
                  "icon": "♫",
                  "title": "Musik",
                  "text": "Apple Music & Co. steuern, ohne das Fenster zu wechseln.",
                  "size": "w",
                  "color": "#9D174D"
                },
                {
                  "icon": "📅",
                  "title": "Kalender",
                  "text": "Nächster Termin mit Countdown.",
                  "size": "s"
                },
                {
                  "icon": "◷",
                  "title": "Pomodoro",
                  "text": "Fokuszeit direkt in der Insel.",
                  "size": "s"
                },
                {
                  "icon": "📋",
                  "title": "Zwischenablage",
                  "text": "Die letzten Einträge, ein Klick zum Einfügen.",
                  "size": "s"
                },
                {
                  "icon": "📥",
                  "title": "Ablage",
                  "text": "Dateien kurz parken — ohne sie zu speichern.",
                  "size": "s"
                },
                {
                  "icon": "⚙",
                  "title": "Agents",
                  "text": "Aktive Agents mit Fortschritt.",
                  "size": "w",
                  "color": "#0E7490"
                }
              ]
            }
          ]
        }
      },
      {
        "type": "story-scene",
        "_id": "notchbuddy08",
        "kicker": "IN ARBEIT",
        "title": "Bald unter deiner Notch?",
        "text": "LD NotchBuddy entsteht gerade bei loona! designs — als Begleiter zu LD Buddy.",
        "c1": "#DB2777",
        "c2": "#1E1B4B",
        "controls": {
          "bg": "verlauf",
          "width": "voll",
          "height": "screen",
          "effect": "blur",
          "align": "mitte",
          "glow": true
        },
        "slots": {
          "inhalt": [
            {
              "type": "cta",
              "_id": "notchbuddy09",
              "label": "Alle Projekte ansehen",
              "href": "/projekte",
              "controls": {
                "variant": "akzent",
                "align": "mitte"
              }
            }
          ]
        }
      }
    ]
  },
  {
    "id": "ldbeyond",
    "kind": "projekte",
    "kat": "Website",
    "tag": "PLATTFORM",
    "datum": "10/2026",
    "name": "LD Beyond",
    "mono": "LB",
    "color": "#6D28D9",
    "featured": false,
    "tool": "Next.js · SQLite · Claude Code",
    "desc": "Die neue Version von loona-designs — die Plattform LD Beyond mit dem CMS LD Flow: Story-Seiten, Liquid Glass, Mehrsprachigkeit und Widgets zum Selberbauen.",
    "ueberblick": "Du bist gerade drin: LD Beyond ist die Website, die du liest — und die Plattform dahinter.",
    "ansatz": "Ein System statt vieler Seiten: Inhalte als Bausteine, gepflegt in LD Flow.",
    "stack": [
      "Next.js",
      "SQLite",
      "LD Flow",
      "View Transitions",
      "Claude Code"
    ],
    "ergebnis": "Live im Aufbau — diese Seite ist selbst ein Beispiel.",
    "zitat": "Die eigene Website ist das ehrlichste Projekt.",
    "learnings": "Ein klares System schlägt hundert Einfälle.",
    "layout": "story",
    "story": [
      {
        "type": "story-hero",
        "_id": "ldbeyond01",
        "kicker": "LD BEYOND · PLATTFORM",
        "title": "Du bist schon drin.",
        "title2": "LD Beyond.",
        "text": "Die neue Version von loona-designs: eine Plattform für Portfolio, Labs und Magazin — gepflegt im eigenen CMS LD Flow. Diese Seite ist mit genau diesem System gebaut.",
        "chips": [
          "Liquid Glass",
          "LD Flow",
          "Widgets",
          "Zweisprachig"
        ],
        "cue": "Scrollen",
        "c1": "#A78BFA",
        "c2": "#FF7816",
        "c3": "#38BDF8",
        "controls": {
          "layout": "zentriert"
        }
      },
      {
        "type": "story-words",
        "_id": "ldbeyond02",
        "kicker": "WARUM",
        "text": "Eine Website, die man nie anfasst, veraltet. LD Beyond ist so gebaut, dass Ändern Spaß macht — direkt auf der Seite, ohne Code."
      },
      {
        "type": "story-scene",
        "_id": "ldbeyond03",
        "kicker": "SO ENTSTEHT DIESE SEITE",
        "title": "Vom leeren Blatt zur Story.",
        "controls": {
          "bg": "karte",
          "width": "breit",
          "height": "auto",
          "effect": "hoch",
          "align": "links",
          "glow": false
        },
        "slots": {
          "inhalt": [
            {
              "type": "story-steps",
              "_id": "ldbeyond04",
              "color": "#6D28D9",
              "steps": [
                {
                  "icon": "▦",
                  "title": "Bausteine wählen",
                  "text": "Auftakt, Szenen, Scrollytelling, Galerie — als Widgets in LD Flow.",
                  "screen": "editor",
                  "screenTitle": "LD Beyond",
                  "rows": [
                    "Story: Auftakt | Dein Alltag. | ✦",
                    "Story: Szene | Ein Tag mit LD Buddy | ▭",
                    "Story: App-Galerie | Alle Ansichten | ▦",
                    "Story: In Zahlen | Weniger Apps | #",
                    "Button | Alle Projekte | →"
                  ]
                },
                {
                  "icon": "✎",
                  "title": "Direkt auf der Seite schreiben",
                  "text": "Texte ändert man in der Vorschau — was du siehst, wird veröffentlicht.",
                  "screen": "editor",
                  "screenTitle": "LD Beyond",
                  "rows": [
                    "Button | Alle Projekte | →",
                    "Story: In Zahlen | Weniger Apps | #",
                    "Story: App-Galerie | Alle Ansichten | ▦",
                    "Story: Szene | Ein Tag mit LD Buddy | ▭",
                    "Story: Auftakt | Dein Alltag. | ✦"
                  ]
                },
                {
                  "icon": "◐",
                  "title": "Zweisprachig",
                  "text": "Deutsch und Englisch je Dokument, Übersetzungen als Entwurf.",
                  "screen": "feed",
                  "screenTitle": "DE · EN",
                  "rows": [
                    "Deutsch | live | Story",
                    "Englisch | Entwurf | Story",
                    "Versionen | 12 | Verlauf"
                  ]
                },
                {
                  "icon": "↗",
                  "title": "Veröffentlichen",
                  "text": "Sofort oder geplant — mit Versionen zum Zurückholen.",
                  "screen": "dashboard",
                  "screenTitle": "loona-designs",
                  "rows": [
                    "Projekte | 16 | ▦",
                    "Labs | 8 | ⚗",
                    "Artikel | 23 | ✎",
                    "Sprachen | DE · EN | ◐"
                  ]
                }
              ],
              "controls": {
                "side": "links",
                "device": "browser"
              }
            }
          ]
        }
      },
      {
        "type": "story-scene",
        "_id": "ldbeyond05",
        "kicker": "ZWEI TEILE",
        "title": "Die Bühne und der Regieraum.",
        "c1": "#1E1B4B",
        "controls": {
          "bg": "dunkel",
          "width": "breit",
          "height": "auto",
          "effect": "hoch",
          "align": "mitte",
          "glow": true
        },
        "slots": {
          "inhalt": [
            {
              "type": "story-gallery",
              "_id": "ldbeyond06",
              "color": "#6D28D9",
              "items": [
                {
                  "label": "LD Beyond",
                  "device": "browser",
                  "screen": "dashboard",
                  "screenTitle": "loona-designs",
                  "rows": [
                    "Projekte | 16 | ▦",
                    "Labs | 8 | ⚗",
                    "Artikel | 23 | ✎",
                    "Sprachen | DE · EN | ◐"
                  ],
                  "caption": "Die Bühne: Portfolio, Labs, .Tech-Magazin und Story-Seiten wie diese."
                },
                {
                  "label": "LD Flow",
                  "device": "browser",
                  "screen": "editor",
                  "screenTitle": "LD Buddy",
                  "rows": [
                    "Story: Auftakt | Dein Alltag. | ✦",
                    "Story: Szene | Ein Tag mit LD Buddy | ▭",
                    "Story: App-Galerie | Alle Ansichten | ▦",
                    "Story: In Zahlen | Weniger Apps | #",
                    "Button | Alle Projekte | →"
                  ],
                  "caption": "Der Regieraum: LD Flow — Bausteine wählen, direkt auf der Seite schreiben, veröffentlichen."
                },
                {
                  "label": "Mobile",
                  "device": "phone",
                  "screen": "feed",
                  "screenTitle": ".Tech",
                  "rows": [
                    "Liquid Glass im Web | 6 Min. | Design",
                    "Story-Seiten bauen | 8 Min. | LD Flow",
                    "Auto Contrast Fix 2 | 4 Min. | A11y"
                  ],
                  "caption": "Mobil mit eigener Tab-Leiste — als Telefon-Ansicht auch auf dem Desktop simulierbar."
                }
              ],
              "controls": {
                "layout": "register"
              }
            }
          ]
        }
      },
      {
        "type": "story-scene",
        "_id": "ldbeyond07",
        "kicker": "WAS DRINSTECKT",
        "title": "Plattform und CMS in einem.",
        "controls": {
          "bg": "karte",
          "width": "breit",
          "height": "auto",
          "effect": "hoch",
          "align": "mitte",
          "glow": false
        },
        "slots": {
          "inhalt": [
            {
              "type": "story-bento",
              "_id": "ldbeyond08",
              "items": [
                {
                  "icon": "◐",
                  "title": "Liquid Glass",
                  "text": "Glas mit echter Lichtbrechung — und Auto-Kontrast, damit alles lesbar bleibt.",
                  "size": "l",
                  "color": "#6D28D9",
                  "screen": "dashboard",
                  "rows": [
                    "Kontrast | ≥ 4,5:1 | ✓",
                    "Ansichten | 4 | ▭",
                    "Übergänge | 20+ | ↺",
                    "Hero-Animationen | 30+ | ✦"
                  ]
                },
                {
                  "icon": "▦",
                  "title": "Widgets",
                  "text": "Eigene Bausteine mit defineWidget.",
                  "size": "s"
                },
                {
                  "icon": "🌐",
                  "title": "Zweisprachig",
                  "text": "Deutsch und Englisch, Pfade je Sprache.",
                  "size": "s"
                },
                {
                  "icon": "🔒",
                  "title": "Sicher",
                  "text": "Zwei-Faktor-Anmeldung, CSP mit Nonces, vorbereitete SQL-Abfragen.",
                  "size": "w",
                  "color": "#1E1B4B"
                },
                {
                  "icon": "♿",
                  "title": "Barrierearm",
                  "text": "Geprüft mit axe, WCAG 2.2 AA.",
                  "size": "s"
                },
                {
                  "icon": "⚡",
                  "title": "Schnell",
                  "text": "Ladezeit-Budgets in der CI.",
                  "size": "s"
                }
              ]
            }
          ]
        }
      },
      {
        "type": "story-scene",
        "_id": "ldbeyond09",
        "kicker": "IN ARBEIT",
        "title": "Neugierig auf mehr?",
        "text": "LD Beyond wächst weiter — jede neue Story-Seite ist ein Test für das System.",
        "c1": "#7C3AED",
        "c2": "#C2410C",
        "controls": {
          "bg": "verlauf",
          "width": "voll",
          "height": "screen",
          "effect": "blur",
          "align": "mitte",
          "glow": true
        },
        "slots": {
          "inhalt": [
            {
              "type": "cta",
              "_id": "ldbeyond10",
              "label": "Alle Projekte ansehen",
              "href": "/projekte",
              "controls": {
                "variant": "akzent",
                "align": "mitte"
              }
            }
          ]
        }
      }
    ]
  }
];

export const projectById = (id: string) => PROJECTS.find((p) => p.id === id);
export const projectsOf = (kind: ProjectKind) => PROJECTS.filter((p) => p.kind === kind);
