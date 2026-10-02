/**
 * „Über mich“ — englische Fassung (Übersetzungsentwurf) von content/about.ts.
 * Gleiche Struktur/Anker wie die deutsche Datei; übersetzt sind nur Texte. Wird in LD Flow als ENTWURF angelegt und
 * erst nach Prüfung veröffentlicht.
 */
import type { Qualification, RailTarget, Station, StationProject } from '../about';

export const TOOLS: string[] = [
  "VS Code",
  "TablePlus",
  "Jira & Confluence",
  "GitLab & GitHub",
  "Slack",
  "iTerm2 + Oh My ZSH",
  "Chrome DevTools",
  "Mobile devices & browsers (testing)"
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
      "Concepts, Design & Trends"
    ]
  },
  {
    "titel": "Languages & Markup",
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
    "titel": "Backend & Data",
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
    "titel": "Testing & Currently Exploring",
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
    "name": "AI Specialist in the Enterprise",
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
    "name": "Certified Trainer (AEVO) — IT Specialist, Application Development",
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
    "name": "State-Certified Technical Assistant for Computer Science (ITA)",
    "von": "Vocational training"
  }
];

export const STATIONS: Station[] = [
  {
    "firma": "Materna SE",
    "anchor": "st-materna",
    "rolle": "Senior Developer",
    "zeit": "since 05/2026",
    "desc": "Public sector, e-government, customs — enterprise web applications in #TeamMaterna.",
    "projekte": [
      {
        "name": "E-Government & Customs Applications",
        "anchor": "p-egov",
        "zeit": "since 2026",
        "desc": "React and TypeScript in an enterprise setting — long-lived, accessible, maintainable. Details under NDA.",
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
    "desc": "Almost six years of agile React product development — media, community and automotive.",
    "projekte": [
      {
        "name": "The Pioneer",
        "anchor": "p-pioneer",
        "zeit": "2020 – 2021 & 2025 – 2026",
        "desc": "Web platform of the media startup — React frontend, in two stages.",
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
        "desc": "The media app — mobile product development over three years.",
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
        "desc": "Community app all about the tabletop hobby.",
        "stack": [
          "React Native",
          "TypeScript"
        ]
      },
      {
        "name": "Tabletop Herald Web",
        "anchor": "p-tthweb",
        "zeit": "2024 – 2025",
        "desc": "The website for the app — shared logic, its own interface.",
        "stack": [
          "React",
          "Next.js",
          "TypeScript"
        ]
      },
      {
        "name": "BMW New Car Search",
        "anchor": "p-bmw",
        "zeit": "2022 – 2023",
        "desc": "Vehicle search frontend in the BMW web ecosystem — team lead (approx. 0.5 years) and tech lead (approx. 1 year).",
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
    "desc": "Web agency founded in Hanover — moved to Berlin together at the end of 2011. Over 12 years from agency all-rounder to lead; in 2019/2020 also trainer of an IT apprentice.",
    "projekte": [
      {
        "name": "Gadmin 4.0",
        "anchor": "p-gadmin",
        "zeit": "2007 – 2020",
        "desc": "CMS of Swiss tourism — the content management system behind MySwitzerland, grown and maintained over 13 years.",
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
        "desc": "Hotel & accommodation meta search by PIXELTEX and OpenBooking AG — from 2016 as Lead Developer Frontend & Mobile Solutions.",
        "stack": [
          "JavaScript",
          "Frontend architecture",
          "Mobile",
          "Node"
        ]
      },
      {
        "name": "Partnersites",
        "anchor": "p-partnersites",
        "zeit": "2007 – 2020",
        "desc": "White-label offshoots of the platform for partners.",
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
        "desc": "Projects for MySwitzerland.com — the platform of Switzerland Tourism.",
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
        "desc": "The rebuilt mobile edition of MySwitzerland — selected vendors and led the talks, took over the project at short notice in November and, after 5 months of crunch, won the Best of Swiss Web Award in Gold (“Mobile Web”) in April 2017.",
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
        "desc": "The first mobile edition of MySwitzerland — mobile web back when it was still new.",
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
        "desc": "Platform work in the Switzerland Tourism environment.",
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
    "zeit": "ongoing",
    "desc": "The showcase — the website you're looking at right now.",
    "stack": [
      "React",
      "Design",
      "AI workflow"
    ]
  },
  {
    "name": "Technology Platform",
    "anchor": "p-techplattform",
    "zeit": "ongoing",
    "desc": "A playground for new stacks, tools and ideas.",
    "stack": [
      "Rust",
      "Tauri 2",
      "Turborepo"
    ]
  },
  {
    "name": "My Company",
    "anchor": "p-firma",
    "zeit": "2006 – 2007",
    "desc": "One year of self-employment under the Loona! Designs brand.",
    "stack": [
      "Web",
      "Design",
      "Flash"
    ]
  },
  {
    "name": "Experiments",
    "anchor": "p-experimente",
    "zeit": "since 2001",
    "desc": "From Flash demos to AI games — anything that sparks curiosity.",
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
    "label": "Bio"
  },
  {
    "id": "u-werkzeuge",
    "label": "Tools"
  },
  {
    "id": "u-skills",
    "label": "Skills"
  },
  {
    "id": "u-zertifikate",
    "label": "Certificates"
  },
  {
    "id": "st-materna",
    "label": "Materna",
    "sub": true
  },
  {
    "id": "p-egov",
    "label": "E-Government & Customs",
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
    "label": "BMW New Car Search",
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
    "label": "Technology Platform",
    "proj": true
  },
  {
    "id": "p-firma",
    "label": "My Company",
    "proj": true
  },
  {
    "id": "p-experimente",
    "label": "Experiments",
    "proj": true
  }
];

/** Welches der sieben Bilder links zu welchem Abschnitt gehört (unverändert aus der deutschen Fassung). */
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
  "Tools & Setup",
  "Career & Work",
  "Loona! Designs — since 2001",
  "Materna SE — since 2026",
  "Code-b — 2020 to 2026",
  "PIXELTEX — 2007 to 2020"
];

/** Rail des Impressums. */
export const IMPRINT_RAIL: RailTarget[] = [
  {
    "id": "i-impressum",
    "label": "Legal notice"
  },
  {
    "id": "i-datenschutz",
    "label": "Privacy"
  },
  {
    "id": "i-verant",
    "label": "Controller",
    "sub": true
  },
  {
    "id": "i-daten",
    "label": "Data & Purposes",
    "sub": true
  },
  {
    "id": "i-rechte",
    "label": "Your Rights",
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

/** Fließtexte der Über-mich-Seite (Typ identisch zur deutschen Fassung). */
export const ABOUT_TEXT: typeof import('../about').ABOUT_TEXT = {
  "introKicker": "ABOUT ME — INTRO",
  "introTitle": "From Flash kid to senior engineer — without losing the curiosity.",
  "intro": "I've been building web, app and software solutions for many years, with a focus on frontend and mobile. My core technologies are React, Next.js, TypeScript and React Native, complemented by experience in complex projects and technical team leadership. A project I co-developed won the Best of Swiss Web Award in Gold.",
  "vita": [
    "I'm 44 years old and work as a full-stack React, software, app and web engineer in Berlin. My goal has always been — and still is — to keep growing, expand my knowledge and rediscover the joy of coding every day. In recent years I also felt a growing wish to share that knowledge — which is why in 2019 I completed the AEVO trainer qualification (IHK Berlin) and have since been qualified to train IT specialists in application development.",
    "My enthusiasm for the web started early and took hold during my training as a technical assistant for computer science. At first I worked on design and development based on Adobe Flash and ActionScript. Over time my focus shifted to modern web and app technologies such as React, Next.js, React Native, GraphQL, JavaScript, TypeScript, HTML5, CSS3, JSON, XML, MongoDB and MySQL.",
    "Over the course of my career I've contributed to many exciting projects — from tourism platforms and media portals to solutions in the automotive industry. These experiences have sharpened my technical eye and further strengthened my passion for high-quality software.",
    "Today I combine many years of hands-on experience with a clear technical focus and the aim of writing clean, maintainable and performant code — whether for web, mobile or complex full-stack environments."
  ],
  "loona": "My company for one year (2006–2007) — but above all, since 2001, my platform for trying out new techniques and concepts, bringing my own ideas to life and maybe inspiring someone along the way. Currently: AI experiments with Claude Code."
};

/**
 * Bilder der linken Spalte (Reihenfolge = Index aus ABOUT_IMAGE_FOR). src bleibt leer wie in der deutschen Fassung,
 * bis eigene Fotos hinterlegt sind; übersetzt sind nur die Platzhalter-Texte.
 */
export const ABOUT_IMAGES: { slot: string; placeholder: string; src?: string; alt?: string }[] = [
  {
    "slot": "ueber-portrait",
    "placeholder": "Drag your portrait here"
  },
  {
    "slot": "ueber-werkzeuge",
    "placeholder": "Desk / setup photo"
  },
  {
    "slot": "ueber-arbeit",
    "placeholder": "Work / team / conference"
  },
  {
    "slot": "ueber-loona",
    "placeholder": "Loona! — e.g. the moon"
  },
  {
    "slot": "ueber-materna",
    "placeholder": "Materna — office / team / project"
  },
  {
    "slot": "ueber-codeb",
    "placeholder": "Code-b — team / projects"
  },
  {
    "slot": "ueber-pixeltex",
    "placeholder": "PIXELTEX — agency years"
  }
];
