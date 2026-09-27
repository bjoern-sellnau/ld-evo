/**
 * „Über mich“ — 1:1 aus design/design_handoff_loona_site/Loona Site V2.dc.html (renderVals: tools, skillGroups,
 * quals, stationen, loonaProjekte; Rail-Ziele uDefs, Bildzuordnung imgIdx/captions). Extrahiert per Auswertung.
 * Fließtexte (Intro, Vita) stehen im Markup und liegen deshalb in ABOUT_TEXT.
 */

export interface StationProject {
  name: string;
  anchor: string;
  zeit: string;
  desc: string;
  stack: string[];
}

export interface Station {
  firma: string;
  anchor: string;
  rolle: string;
  zeit: string;
  desc: string;
  projekte: StationProject[];
}

export interface Qualification {
  datum: string;
  name: string;
  von: string;
}

export interface RailTarget {
  id: string;
  label: string;
  /** Firma (7 px Punkt) */
  sub?: boolean;
  /** Projekt (5 px Punkt) */
  proj?: boolean;
}

export const TOOLS: string[] = [
  "VS Code",
  "TablePlus",
  "Jira & Confluence",
  "GitLab & GitHub",
  "Slack",
  "iTerm2 + Oh My ZSH",
  "Chrome DevTools",
  "Mobile Geräte & Browser (Testing)"
];

export const SKILL_GROUPS: { titel: string; chips: string[] }[] = [
  {
    "titel": "Frontend",
    "chips": [
      "React",
      "React Hooks",
      "Next.js",
      "React Native",
      "Styled-Components",
      "Redux",
      "Webpack",
      "Responsive / Adaptive Design",
      "Mobile First",
      "Konzepte, Design & Trends"
    ]
  },
  {
    "titel": "Sprachen & Markup",
    "chips": [
      "TypeScript",
      "JavaScript",
      "HTML5",
      "CSS3",
      "JSON",
      "XML"
    ]
  },
  {
    "titel": "Backend & Daten",
    "chips": [
      "Node",
      "GraphQL",
      "MongoDB",
      "MySQL",
      "Postgres",
      "CouchDB",
      "Lucee / Railo / ColdFusion / OpenBD",
      "PHP"
    ]
  },
  {
    "titel": "Testing & Gerade dabei",
    "chips": [
      "Jest",
      "React Testing Library",
      "Rust",
      "Tauri 2",
      "Turborepo",
      "Tailwind + Twin"
    ]
  }
];

export const QUALIFICATIONS: Qualification[] = [
  {
    "datum": "03/2026",
    "name": "Introduction to Agent Skills",
    "von": "Anthropic"
  },
  {
    "datum": "03/2026",
    "name": "Claude Code in Action",
    "von": "Anthropic"
  },
  {
    "datum": "11/2025",
    "name": "KI-Spezialist im Unternehmen",
    "von": "Scaly Academy"
  },
  {
    "datum": "12/2024",
    "name": "Stripe Certified Professional Developer",
    "von": "Stripe"
  },
  {
    "datum": "12/2024",
    "name": "Stripe Certified Billing Developer",
    "von": "Stripe"
  },
  {
    "datum": "12/2024",
    "name": "Stripe Certified Associate Developer",
    "von": "Stripe"
  },
  {
    "datum": "03/2019",
    "name": "Ausbilder nach AEVO — Fachinformatiker Anwendungsentwicklung",
    "von": "IHK Berlin"
  },
  {
    "datum": "08/2015",
    "name": "StrongLoop Certified Node Developer (SCND)",
    "von": "StrongLoop by IBM"
  },
  {
    "datum": "06/2010",
    "name": "Adobe Certified Expert — Advanced ColdFusion 8",
    "von": "Adobe"
  },
  {
    "datum": "06/2002",
    "name": "Staatl. gepr. Technischer Assistent für Informatik (ITA)",
    "von": "Ausbildung"
  }
];

export const STATIONS: Station[] = [
  {
    "firma": "Materna SE",
    "anchor": "st-materna",
    "rolle": "Senior Developer",
    "zeit": "seit 05/2026",
    "desc": "Public Sector, E-Government, Zoll — Enterprise-Webanwendungen im #TeamMaterna.",
    "projekte": [
      {
        "name": "E-Government- & Zoll-Fachanwendungen",
        "anchor": "p-egov",
        "zeit": "seit 2026",
        "desc": "React und TypeScript im Enterprise-Umfeld — langlebig, barrierearm, wartbar. Details unter NDA.",
        "stack": [
          "React",
          "TypeScript",
          "Enterprise"
        ]
      }
    ]
  },
  {
    "firma": "Code-b Agile Websolutions",
    "anchor": "st-codeb",
    "rolle": "Software Engineer — React",
    "zeit": "05/2020 – 01/2026",
    "desc": "Knapp sechs Jahre agile React-Produktentwicklung — Medien, Community und Automotive.",
    "projekte": [
      {
        "name": "The Pioneer",
        "anchor": "p-pioneer",
        "zeit": "2020 – 2021 & 2025 – 2026",
        "desc": "Web-Plattform des Medien-Startups — React-Frontend, in zwei Etappen.",
        "stack": [
          "React",
          "Styled-Components",
          "GraphQL"
        ]
      },
      {
        "name": "The Pioneer App",
        "anchor": "p-pioneerapp",
        "zeit": "2023 – 2026",
        "desc": "Die Medien-App — mobile Produktentwicklung über drei Jahre.",
        "stack": [
          "React Native",
          "TypeScript",
          "GraphQL"
        ]
      },
      {
        "name": "Tabletop Herald App",
        "anchor": "p-tthapp",
        "zeit": "2024 – 2025",
        "desc": "Community-App rund ums Tabletop-Hobby.",
        "stack": [
          "React Native",
          "TypeScript"
        ]
      },
      {
        "name": "Tabletop Herald Web",
        "anchor": "p-tthweb",
        "zeit": "2024 – 2025",
        "desc": "Der Web-Auftritt zur App — geteilte Logik, eigenes Interface.",
        "stack": [
          "React",
          "Next.js",
          "TypeScript"
        ]
      },
      {
        "name": "BMW Neuwagensuche",
        "anchor": "p-bmw",
        "zeit": "2022 – 2023",
        "desc": "Fahrzeugsuche-Frontend im BMW-Web-Ökosystem — Team Lead (ca. 0,5 Jahre) und Tech Lead (ca. 1 Jahr).",
        "stack": [
          "React",
          "TypeScript",
          "REST"
        ]
      }
    ]
  },
  {
    "firma": "PIXELTEX GmbH",
    "anchor": "st-pixeltex",
    "rolle": "Web Engineer",
    "zeit": "09/2007 – 2020",
    "desc": "Webagentur, gegründet in Hannover — Ende 2011 gemeinsam nach Berlin gezogen. Über 12 Jahre vom Agentur-Allrounder zum Lead; 2019/2020 zusätzlich Ausbilder eines Fachinformatik-Azubis.",
    "projekte": [
      {
        "name": "Gadmin 4.0",
        "anchor": "p-gadmin",
        "zeit": "2007 – 2020",
        "desc": "CMS des Schweizer Tourismus — das Content-Management-System hinter MySwitzerland, über 13 Jahre gewachsen und betreut.",
        "stack": [
          "ColdFusion / Railo",
          "JavaScript",
          "MySQL"
        ]
      },
      {
        "name": "OpenBooking Frontend",
        "anchor": "p-openbooking",
        "zeit": "2015 – 2020",
        "desc": "Hotel- & Unterkunfts-Meta-Suche von PIXELTEX und OpenBooking AG — ab 2016 als Lead Developer Frontend & Mobile Solutions.",
        "stack": [
          "JavaScript",
          "Frontend-Architektur",
          "Mobile",
          "Node"
        ]
      },
      {
        "name": "Partnersites",
        "anchor": "p-partnersites",
        "zeit": "2007 – 2020",
        "desc": "White-Label-Ableger der Plattform für Partner.",
        "stack": [
          "JavaScript",
          "CSS3",
          "CMS"
        ]
      },
      {
        "name": "Myswitzerland",
        "anchor": "p-mys",
        "zeit": "2007 – 2020",
        "desc": "Projekte für MySwitzerland.com — die Plattform von Schweiz Tourismus.",
        "stack": [
          "JavaScript",
          "HTML5",
          "ColdFusion / Railo"
        ]
      },
      {
        "name": "Mys Mobile 2017",
        "anchor": "p-mys2017",
        "zeit": "2016 – 2019",
        "desc": "Die neu aufgebaute mobile Ausgabe von MySwitzerland — Anbieter-Auswahl und Gespräche geführt, im November das Projekt kurzfristig übernommen und nach 5 Monaten Crunch im April 2017 den Best of Swiss Web Award in Gold („Mobile Web\") geholt.",
        "stack": [
          "JavaScript",
          "Mobile First",
          "CSS3"
        ]
      },
      {
        "name": "Mys Mobile 2010",
        "anchor": "p-mys2010",
        "zeit": "2010 – 2016",
        "desc": "Die erste mobile MySwitzerland-Ausgabe — Mobile Web, als es noch neu war.",
        "stack": [
          "JavaScript",
          "XHTML",
          "Mobile"
        ]
      },
      {
        "name": "STnet",
        "anchor": "p-stnet",
        "zeit": "",
        "desc": "Plattform-Arbeit im Schweiz-Tourismus-Umfeld.",
        "stack": [
          "JavaScript",
          "ColdFusion / Railo"
        ]
      }
    ]
  }
];

export const LOONA_PROJECTS: StationProject[] = [
  {
    "name": "Portfolio Platform",
    "anchor": "p-portfolio",
    "zeit": "laufend",
    "desc": "Das Schaufenster — die Website, die du gerade ansiehst.",
    "stack": [
      "React",
      "Design",
      "KI-Workflow"
    ]
  },
  {
    "name": "Technologie Platform",
    "anchor": "p-techplattform",
    "zeit": "laufend",
    "desc": "Spielwiese für neue Stacks, Werkzeuge und Ideen.",
    "stack": [
      "Rust",
      "Tauri 2",
      "Turborepo"
    ]
  },
  {
    "name": "Meine Firma",
    "anchor": "p-firma",
    "zeit": "2006 – 2007",
    "desc": "Ein Jahr Selbstständigkeit unter der Marke Loona! Designs.",
    "stack": [
      "Web",
      "Design",
      "Flash"
    ]
  },
  {
    "name": "Experimente",
    "anchor": "p-experimente",
    "zeit": "seit 2001",
    "desc": "Von Flash-Demos bis zu KI-Spielen — alles, was neugierig macht.",
    "stack": [
      "Flash",
      "JavaScript",
      "Claude Code"
    ]
  }
];

/** Punkt-Rail rechts (Scroll-Spy, 26 Ziele). */
export const ABOUT_RAIL: RailTarget[] = [
  {
    "id": "u-intro",
    "label": "Intro"
  },
  {
    "id": "u-vita",
    "label": "Vita"
  },
  {
    "id": "u-werkzeuge",
    "label": "Werkzeuge"
  },
  {
    "id": "u-skills",
    "label": "Skills"
  },
  {
    "id": "u-zertifikate",
    "label": "Zertifikate"
  },
  {
    "id": "st-materna",
    "label": "Materna",
    "sub": true
  },
  {
    "id": "p-egov",
    "label": "E-Government & Zoll",
    "proj": true
  },
  {
    "id": "st-codeb",
    "label": "Code-b",
    "sub": true
  },
  {
    "id": "p-pioneer",
    "label": "The Pioneer",
    "proj": true
  },
  {
    "id": "p-pioneerapp",
    "label": "The Pioneer App",
    "proj": true
  },
  {
    "id": "p-tthapp",
    "label": "Tabletop Herald App",
    "proj": true
  },
  {
    "id": "p-tthweb",
    "label": "Tabletop Herald Web",
    "proj": true
  },
  {
    "id": "p-bmw",
    "label": "BMW Neuwagensuche",
    "proj": true
  },
  {
    "id": "st-pixeltex",
    "label": "PIXELTEX",
    "sub": true
  },
  {
    "id": "p-gadmin",
    "label": "Gadmin 4.0",
    "proj": true
  },
  {
    "id": "p-openbooking",
    "label": "OpenBooking Frontend",
    "proj": true
  },
  {
    "id": "p-partnersites",
    "label": "Partnersites",
    "proj": true
  },
  {
    "id": "p-mys",
    "label": "Myswitzerland",
    "proj": true
  },
  {
    "id": "p-mys2017",
    "label": "Mys Mobile 2017",
    "proj": true
  },
  {
    "id": "p-mys2010",
    "label": "Mys Mobile 2010",
    "proj": true
  },
  {
    "id": "p-stnet",
    "label": "STnet",
    "proj": true
  },
  {
    "id": "u-loona",
    "label": "Loona! Designs"
  },
  {
    "id": "p-portfolio",
    "label": "Portfolio Platform",
    "proj": true
  },
  {
    "id": "p-techplattform",
    "label": "Technologie Platform",
    "proj": true
  },
  {
    "id": "p-firma",
    "label": "Meine Firma",
    "proj": true
  },
  {
    "id": "p-experimente",
    "label": "Experimente",
    "proj": true
  }
];

/** Welches der sieben Bilder links zu welchem Abschnitt gehört. */
export const ABOUT_IMAGE_FOR: Record<string, number> = {
  "u-intro": 0,
  "u-vita": 0,
  "u-werkzeuge": 1,
  "u-skills": 1,
  "u-zertifikate": 2,
  "st-materna": 4,
  "p-egov": 4,
  "st-codeb": 5,
  "p-pioneer": 5,
  "p-pioneerapp": 5,
  "p-tthapp": 5,
  "p-tthweb": 5,
  "p-bmw": 5,
  "st-pixeltex": 6,
  "p-gadmin": 6,
  "p-openbooking": 6,
  "p-partnersites": 6,
  "p-mys": 6,
  "p-mys2017": 6,
  "p-mys2010": 6,
  "p-stnet": 6,
  "u-loona": 3,
  "p-portfolio": 3,
  "p-techplattform": 3,
  "p-firma": 3,
  "p-experimente": 3
};

export const ABOUT_CAPTIONS: string[] = [
  "Björn — Berlin",
  "Werkzeuge & Setup",
  "Stationen & Arbeit",
  "Loona! Designs — seit 2001",
  "Materna SE — seit 2026",
  "Code-b — 2020 bis 2026",
  "PIXELTEX — 2007 bis 2020"
];

/** Rail des Impressums. */
export const IMPRINT_RAIL: RailTarget[] = [
  {
    "id": "i-impressum",
    "label": "Impressum"
  },
  {
    "id": "i-datenschutz",
    "label": "Datenschutz"
  },
  {
    "id": "i-verant",
    "label": "Verantwortlicher",
    "sub": true
  },
  {
    "id": "i-daten",
    "label": "Daten & Zwecke",
    "sub": true
  },
  {
    "id": "i-rechte",
    "label": "Ihre Rechte",
    "sub": true
  },
  {
    "id": "i-cookies",
    "label": "Cookies",
    "sub": true
  },
  {
    "id": "i-hosting",
    "label": "Hosting & Logs",
    "sub": true
  }
];

/** Fließtexte aus dem Markup der Über-mich-Seite (Prototyp Zeile 734 ff.). */
export const ABOUT_TEXT = {
  "introKicker": "ÜBER MICH — INTRO",
  "introTitle": "Vom Flash-Kid zum Senior Engineer — ohne die Neugier zu verlieren.",
  "intro": "Ich entwickle seit vielen Jahren Web-, App- und Software-Lösungen mit Schwerpunkt auf Frontend und Mobile. Mein technologischer Fokus liegt auf React, Next.js, TypeScript und React Native, ergänzt durch Erfahrung in komplexen Projekten und technischer Teamführung. Ein von mir mitentwickeltes Projekt wurde mit dem Best of Swiss Web Award in Gold ausgezeichnet.",
  "vita": [
    "Ich bin 44 Jahre alt und arbeite als Full-Stack React-, Software-, App- und Web Engineer in Berlin. Mein Ziel war und ist es bis heute, mich kontinuierlich weiterzuentwickeln, mein Wissen zu erweitern und die Freude am Coden jeden Tag neu zu entdecken. In den letzten Jahren wuchs zudem der Wunsch, dieses Wissen zu teilen — weshalb ich 2019 die Ausbildung zum Ausbilder nach AEVO (IHK Berlin) absolvierte und seitdem die Qualifikation besitze, Fachinformatiker für Anwendungsentwicklung auszubilden.",
    "Meine Begeisterung für das Web begann früh und verfestigte sich während meiner Ausbildung zum Technischen Assistenten für Informatik. Anfangs beschäftigte ich mich mit Design und Entwicklung auf Basis von Adobe Flash und ActionScript. Mit der Zeit verlagerte sich mein Fokus auf moderne Web- und App-Technologien wie React, Next.js, React Native, GraphQL, JavaScript, TypeScript, HTML5, CSS3, JSON, XML, MongoDB und MySQL.",
    "In meiner beruflichen Laufbahn konnte ich an zahlreichen spannenden Projekten mitwirken — von touristischen Plattformen über Medienportale bis hin zu Lösungen in der Automobilbranche. Diese Erfahrungen haben meinen technischen Blick geschärft und meine Leidenschaft für hochwertige Software weiter gestärkt.",
    "Heute kombiniere ich langjährige Praxiserfahrung mit einem klaren technischen Fokus und dem Anspruch, sauberen, wartbaren und performanten Code zu schreiben — egal ob für Web, Mobile oder komplexe Fullstack-Umgebungen."
  ],
  "loona": "Ein Jahr lang meine Firma (2006–2007) — vor allem aber seit 2001 meine Plattform, um neue Techniken und Konzepte auszuprobieren, eigene Ideen zu verwirklichen und vielleicht den einen oder anderen zu inspirieren. Aktuell: KI-Experimente mit Claude Code."
};

/**
 * Bilder der linken Spalte (Reihenfolge = Index aus ABOUT_IMAGE_FOR). Der Prototyp zeigt Unsplash-Stockfotos;
 * laut Site-README wird kein Stock ausgeliefert → src bleibt leer, bis eigene Fotos hinterlegt sind
 * (public/ueber-mich/…). Bis dahin erscheint der Platzhalter-Text.
 */
export const ABOUT_IMAGES: { slot: string; placeholder: string; src?: string; alt?: string }[] = [
  {
    "slot": "ueber-portrait",
    "placeholder": "Dein Porträt hierher ziehen"
  },
  {
    "slot": "ueber-werkzeuge",
    "placeholder": "Schreibtisch / Setup-Foto"
  },
  {
    "slot": "ueber-arbeit",
    "placeholder": "Arbeit / Team / Konferenz"
  },
  {
    "slot": "ueber-loona",
    "placeholder": "Loona! — z. B. der Mond"
  },
  {
    "slot": "ueber-materna",
    "placeholder": "Materna — Büro / Team / Projekt"
  },
  {
    "slot": "ueber-codeb",
    "placeholder": "Code-b — Team / Projekte"
  },
  {
    "slot": "ueber-pixeltex",
    "placeholder": "PIXELTEX — Agentur-Zeit"
  }
];
