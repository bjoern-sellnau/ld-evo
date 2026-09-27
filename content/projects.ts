/**
 * Projekte, Labs und Archiv — 1:1 aus design/design_handoff_loona_site/Loona Site V2.dc.html (data() → P).
 * Extrahiert per Ausführung der Prototyp-Methode; Reihenfolge = Listen-Reihenfolge im Prototyp.
 * Abgeleitete Werte (Textfarbe auf Cover) berechnet die Site zur Laufzeit.
 */

/** 'archiv' = berufliche Projekte, die nur über Über mich/Suche-frei verlinkt werden (nicht in Katalog-Listen). */
export type ProjectKind = 'projekte' | 'labs' | 'archiv';

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
    "learnings": "Quaternionen früh, UI spät — und Spielgefühl entsteht in den letzten zehn Prozent. Der KI-Partner beschleunigt die ersten neunzig."
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
    "learnings": "Renderer austauschbar zu halten kostet einen Tag und spart drei. Perspektivwechsel ist kein Feature, sondern ein Architekturtest."
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
    "status": "online seit 03/2016"
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
    "status": "abgelöst 2016"
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
    "status": "abgelöst 2015"
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
    "status": "Entwurf"
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
    "status": "Archiv"
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
    "status": "Entwurf"
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
    "status": "nicht mehr online"
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
    "status": "nicht mehr online"
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
    "status": "nicht mehr online"
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
  }
];

export const projectById = (id: string) => PROJECTS.find((p) => p.id === id);
export const projectsOf = (kind: ProjectKind) => PROJECTS.filter((p) => p.kind === kind);
