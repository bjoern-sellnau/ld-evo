/**
 * Stationen der Reise-Seite (LD Timeline) — generiert von scripts/extract-journey.mjs aus
 * design/design_handoff_loona_site/LD Timeline.dc.html (stations()). Nicht von Hand editieren; Pflege später im CMS.
 * Bilder (Karten-Screenshot, Einblicke je Station/Zwischenschritt) sind optional und kommen aus dem CMS.
 */

export interface JourneyStep {
  t: string;
  d: string;
}

export interface JourneyStation {
  year: number;
  title: string;
  role: string;
  partner: string;
  metric: string;
  metricLabel: string;
  caption: string;
  blurb: string;
  story: string;
  stack: string[];
  steps: JourneyStep[];
}

export const JOURNEY: JourneyStation[] = [
  {
    "year": 2004,
    "title": "Erste Pixel im Netz",
    "role": "Flash & ActionScript",
    "partner": "Loona! Designs",
    "metric": "1",
    "metricLabel": "ERSTE EIGENE SITE",
    "caption": "Flash-Ära · Hannover",
    "blurb": "Flash-Intros, Pixel-Buttons und die Erkenntnis: Das Web ist meine Bühne.",
    "story": "Mit Flash MX und ActionScript 2 entstehen unter der Marke Loona! Designs die ersten Experimente — Timeline-Denken, Tweens, viel Neugier. Der Grundstein für alles Weitere.",
    "stack": [
      "Flash MX",
      "ActionScript 2",
      "HTML",
      "CSS",
      "Photoshop"
    ],
    "steps": [
      {
        "t": "Erste eigene Site online",
        "d": "2004"
      },
      {
        "t": "Flash-Games & Experimente",
        "d": "2004–2005"
      },
      {
        "t": "Erste Kundenprojekte als Loona!",
        "d": "2005–2007"
      }
    ]
  },
  {
    "year": 2007,
    "title": "PIXELTEX: Der Profi-Start",
    "role": "Web Engineer",
    "partner": "PIXELTEX GmbH",
    "metric": "09/07",
    "metricLabel": "KARRIERESTART",
    "caption": "Agentur-Alltag · Hannover",
    "blurb": "Vom Hobby zum Beruf: Kundenprojekte, CMS, ColdFusion — und Gadmin wächst.",
    "story": "Im September 2007 beginnt die Agentur-Zeit: Kundenprojekte, das hauseigene Gadmin-System und der lange Abschied von Flash Richtung HTML und JavaScript.",
    "stack": [
      "ColdFusion",
      "JavaScript",
      "MySQL",
      "jQuery",
      "CSS"
    ],
    "steps": [
      {
        "t": "Start bei PIXELTEX",
        "d": "09.2007"
      },
      {
        "t": "Gadmin 4.0 — CMS Schweizer Tourismus",
        "d": "ab 2007"
      },
      {
        "t": "Umzug der Agentur nach Berlin",
        "d": "Ende 2011"
      }
    ]
  },
  {
    "year": 2010,
    "title": "Mobile, bevor es cool war",
    "role": "Mobile Web",
    "partner": "MySwitzerland",
    "metric": "2010",
    "metricLabel": "ERSTE MOBILE AUSGABE",
    "caption": "Mys Mobile · Schweiz Tourismus",
    "blurb": "Mys Mobile 2010: Schweiz Tourismus in der Hosentasche — XHTML, winzige Screens, große Wirkung.",
    "story": "Die erste mobile Ausgabe von MySwitzerland.com — gebaut, als Mobile Web noch Pionierarbeit war. Sechs Jahre im Einsatz, gefolgt vom Neuaufbau 2017.",
    "stack": [
      "Mobile Web",
      "XHTML",
      "JavaScript",
      "CSS",
      "Performance"
    ],
    "steps": [
      {
        "t": "Mys Mobile 2010 live",
        "d": "2010"
      },
      {
        "t": "Sechs Jahre im Einsatz",
        "d": "bis 2016"
      }
    ]
  },
  {
    "year": 2016,
    "title": "Lead: OpenBooking",
    "role": "Lead Frontend & Mobile",
    "partner": "OpenBooking AG",
    "metric": "5 J.",
    "metricLabel": "META-SUCHE VERANTWORTET",
    "caption": "OpenBooking · Berlin",
    "blurb": "Hotel-Meta-Suche: Architektur, Frontend, Mobile — ab 2016 als Lead Developer.",
    "story": "Die Hotel- und Unterkunfts-Meta-Suche von PIXELTEX und der OpenBooking AG: ab September 2016 Verantwortung für Frontend und Mobile Solutions — Architektur, Umsetzung, Auslieferung.",
    "stack": [
      "JavaScript",
      "Frontend-Arch",
      "Node",
      "Mobile",
      "REST"
    ],
    "steps": [
      {
        "t": "Lead Frontend & Mobile Solutions",
        "d": "09.2016"
      },
      {
        "t": "Mys Mobile 2017: Projekt übernommen",
        "d": "11.2016"
      },
      {
        "t": "Best of Swiss Web Award — Gold",
        "d": "04.2017"
      }
    ]
  },
  {
    "year": 2019,
    "title": "Ausbilder nach AEVO",
    "role": "IT-Ausbilder (IHK)",
    "partner": "PIXELTEX GmbH",
    "metric": "AEVO",
    "metricLabel": "IHK BERLIN",
    "caption": "Ausbildung · Berlin",
    "blurb": "Wissen weitergeben wird offiziell: Ausbilderschein und der erste eigene Azubi.",
    "story": "Seit März 2019 Ausbilder nach AEVO für Fachinformatiker in der Anwendungsentwicklung. Die Überraschung: Erklären deckt auf, wo man selbst nur Gewohnheit statt Verständnis hat.",
    "stack": [
      "AEVO",
      "Mentoring",
      "Didaktik",
      "Code-Reviews",
      "IHK"
    ],
    "steps": [
      {
        "t": "AEVO-Schein — IHK Berlin",
        "d": "03.2019"
      },
      {
        "t": "Erster eigener Azubi",
        "d": "2019"
      }
    ]
  },
  {
    "year": 2020,
    "title": "React im Produkt-Takt",
    "role": "Software Engineer — React",
    "partner": "Code-b",
    "metric": "6",
    "metricLabel": "JAHRE PRODUKT-REACT",
    "caption": "Code-b · Berlin",
    "blurb": "The Pioneer, BMW Neuwagensuche, Tabletop Herald — agile Produktentwicklung in React.",
    "story": "Knapp sechs Jahre agile Produktentwicklung: Medien-Plattformen, Automotive-Suchen, Community-Apps — React, React Native, GraphQL und Tests, die halten.",
    "stack": [
      "React",
      "Redux",
      "GraphQL",
      "Styled-Comp.",
      "Jest"
    ],
    "steps": [
      {
        "t": "Start bei Code-b",
        "d": "05.2020"
      },
      {
        "t": "The Pioneer — Web-Plattform",
        "d": "2020–2021"
      },
      {
        "t": "BMW Neuwagensuche — Team/Tech Lead",
        "d": "2022–2023"
      }
    ]
  },
  {
    "year": 2023,
    "title": "Apps, die bleiben",
    "role": "React Native Engineer",
    "partner": "The Pioneer",
    "metric": "3",
    "metricLabel": "JAHRE MEDIEN-APP",
    "caption": "The Pioneer App",
    "blurb": "Die Pioneer-App reift: New Architecture, GraphQL, tägliche Releases für anspruchsvolle Leser.",
    "story": "Drei Jahre mobile Produktentwicklung an der Medien-App: Migration auf die New Architecture, geteilte Logik mit dem Web, Releases im Wochentakt.",
    "stack": [
      "React Native",
      "TypeScript",
      "GraphQL",
      "New Arch",
      "CI/CD"
    ],
    "steps": [
      {
        "t": "The Pioneer App — mobile Entwicklung",
        "d": "ab 2023"
      },
      {
        "t": "Tabletop Herald App & Web",
        "d": "2024–2025"
      },
      {
        "t": "Migration New Architecture",
        "d": "2025"
      }
    ]
  },
  {
    "year": 2026,
    "title": "Materna & die neue Loona!",
    "role": "Senior Developer",
    "partner": "Materna SE",
    "metric": "18+",
    "metricLabel": "JAHRE IM WEB",
    "caption": "#TeamMaterna · E-Government",
    "blurb": "Public Sector bei Materna — und nebenan entsteht mit KI die neue loona-designs.tech.",
    "story": "E-Government und Zoll bei Materna — langlebig, barrierearm, wartbar. Und auf der eigenen Werkbank: der KI-gestützte Relaunch von Loona! Designs, den du gerade erlebst.",
    "stack": [
      "React",
      "TypeScript",
      "Claude Code",
      "Enterprise",
      "Rust"
    ],
    "steps": [
      {
        "t": "Ende Code-b",
        "d": "01.2026"
      },
      {
        "t": "KI-Experimente",
        "d": "ab 03.2026"
      },
      {
        "t": "Materna SE",
        "d": "ab 05.2026"
      }
    ]
  }
];
