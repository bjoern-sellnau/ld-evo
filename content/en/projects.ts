/**
 * Projekte, Labs und Archiv — englische Fassung (Übersetzungsentwurf) von content/projects.ts.
 * Gleiche Struktur/IDs wie die deutsche Datei; übersetzt sind nur Texte. Wird in LD Flow als ENTWURF angelegt und
 * erst nach Prüfung veröffentlicht.
 */

import type { Project, ProjectKind } from '../projects';

export const PROJECTS: Project[] = [
  {
    "id": "corefall",
    "kind": "labs",
    "kat": "Game",
    "tag": "AI EXPERIMENT",
    "datum": "05/2026",
    "name": "Corefall",
    "mono": "CF",
    "color": "#C2410C",
    "featured": true,
    "link": "https://bjoern-sellnau.github.io/core-fall/",
    "tool": "Claude Code · Opus 4.7 · Claude Design",
    "desc": "A 6DoF shooter in the vein of Descent — full freedom of movement, retro soul, modern stack.",
    "ueberblick": "A 6DoF shooter in the spirit of Descent: fly, roll, yaw — full freedom of movement in every direction, right in the browser.",
    "ansatz": "Built as an AI experiment: Claude Code with Opus 4.7 as pair programmer, Claude Design for the visual direction. Iterative — playable core first, then feel, then polish.",
    "stack": [
      "Claude Code",
      "Opus 4.7",
      "Claude Design",
      "JavaScript",
      "Canvas/WebGL"
    ],
    "ergebnis": "Playable in the browser. The fastest way to grasp what AI-assisted game development feels like in 2026.",
    "zitat": "Six degrees of freedom don't forgive sloppy math.",
    "learnings": "Quaternions early, UI late — and game feel happens in the last ten percent. The AI partner speeds up the first ninety.",
    "status": "● playable · in progress"
  },
  {
    "id": "covert",
    "kind": "labs",
    "kat": "Game",
    "tag": "AI EXPERIMENT",
    "datum": "04/2026",
    "name": "Covert Operations",
    "mono": "CO",
    "color": "#14532D",
    "featured": true,
    "link": "https://bjoern-sellnau.github.io/Covert-Operations/",
    "tool": "Claude Code · Opus 4.7 · Claude Design",
    "desc": "Top-down, iso and FPS shooter in one — one playing field, many perspectives.",
    "ueberblick": "One shooter, three perspectives: top-down, isometric and first-person — the same playing field, switchable.",
    "ansatz": "Switching perspectives as an architecture exercise: one game logic, several renderers. Claude Code handled the grunt work, the decisions stayed human.",
    "stack": [
      "Claude Code",
      "Opus 4.7",
      "Claude Design",
      "JavaScript",
      "Canvas"
    ],
    "ergebnis": "Playable in the browser — and the blueprint for the Arena spin-off.",
    "zitat": "One game logic, three cameras — architecture pays off in perspectives.",
    "learnings": "Keeping renderers swappable costs one day and saves three. Switching perspectives isn't a feature, it's an architecture test.",
    "status": "● playable · in progress"
  },
  {
    "id": "openbooking",
    "kind": "archiv",
    "kat": "Professional",
    "tag": "LEAD FRONTEND",
    "datum": "2016–2020",
    "name": "OpenBooking",
    "mono": "OB",
    "color": "#1E3A5F",
    "featured": true,
    "tool": "PIXELTEX GmbH · OpenBooking AG",
    "desc": "Hotel & accommodation meta search — Lead Developer Frontend & Mobile Solutions.",
    "ueberblick": "The hotel and accommodation meta search by PIXELTEX and OpenBooking AG.",
    "ansatz": "From September 2016, responsible as Lead Developer for Frontend and Mobile Solutions — architecture, implementation, delivery.",
    "stack": [
      "JavaScript",
      "Frontend architecture",
      "Mobile",
      "Node"
    ],
    "ergebnis": "Four years of ownership of the most visible part of the product.",
    "zitat": "Meta search means: other people's data, your own responsibility.",
    "learnings": "Being lead means typing less and deciding more — and setting standards that work even without you."
  },
  {
    "id": "egov",
    "kind": "archiv",
    "kat": "Professional",
    "tag": "ENTERPRISE",
    "datum": "since 2026",
    "name": "E-Government & Customs",
    "mono": "EG",
    "color": "#0F2137",
    "featured": false,
    "tool": "Materna SE — #TeamMaterna",
    "desc": "Public sector applications at Materna. Details under NDA.",
    "ueberblick": "Specialist applications for the public sector — e-government and customs — as a Senior Developer at Materna.",
    "ansatz": "React and TypeScript in an enterprise setting: long-lived, accessible, maintainable. The NDA doesn't allow more.",
    "stack": [
      "React",
      "TypeScript",
      "Enterprise",
      "Public Sector"
    ],
    "ergebnis": "Software that public administration actually uses.",
    "zitat": "Government software is good when nobody talks about it.",
    "learnings": "Accessibility and maintainability are features, not requirements imposed from outside — in the public sector, longevity determines value."
  },
  {
    "id": "neuewebsite",
    "kind": "projekte",
    "kat": "Website",
    "tag": "RELAUNCH",
    "datum": "coming soon",
    "name": "New Website",
    "mono": "L!",
    "color": "#D97706",
    "featured": true,
    "tool": "Claude Code · Claude Design",
    "desc": "The relaunch of loona-designs.de — Liquid Glass, View Transitions and AI in the process.",
    "ueberblick": "After the DesignUpdates of 2011, 2015 and 2016, the biggest cut yet: loona-designs.de is being rethought — as a portfolio platform with projects, labs and blog.",
    "ansatz": "Designed over many iterations with Claude Code and Claude Design — from the 50-styles experiment to Stripe-inspired waves to the Liquid Glass system.",
    "stack": [
      "Claude Code",
      "Claude Design",
      "React",
      "View Transitions"
    ],
    "ergebnis": "Online soon — you're looking at a draft of it right now.",
    "zitat": "Your own website is the most honest project: no client, no excuses.",
    "learnings": "Relaunches fail from too many ideas — one clear system beats a hundred brainstorms.",
    "status": "online soon"
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
    "linkLabel": "View live ↗",
    "tool": "Coda 2 · HTML5",
    "desc": "The Loona! redesign from 2016 — online since March 12, 2016, still in service today.",
    "ueberblick": "The platform's third big DesignUpdate — leaner, more responsive, content-focused. Still the live version of loona-designs.de today.",
    "ansatz": "Handcrafted in the editor (Coda 2 for Mac) — HTML5, CSS3 and deliberately little JavaScript.",
    "stack": [
      "HTML5",
      "CSS3",
      "JavaScript",
      "Coda 2"
    ],
    "ergebnis": "Ten years in service — longevity as proof of quality.",
    "zitat": "Ten years online is the best Lighthouse score.",
    "learnings": "Simple tech ages most gracefully — the fewer dependencies, the longer a site lives.",
    "status": "online since 12 Mar 2016"
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
    "desc": "DesignUpdate 2015 — online from April 26, 2015.",
    "ueberblick": "The predecessor of today's design — a year of polish between two big updates.",
    "ansatz": "Iteration instead of a rebuild: typography, grid and color palette reworked, the foundation stayed.",
    "stack": [
      "HTML5",
      "CSS3",
      "JavaScript"
    ],
    "ergebnis": "Replaced by DesignUpdate 2016 after just under a year.",
    "zitat": "Some versions are bridges — important, even if you only cross them briefly.",
    "learnings": "Short iteration cycles on your own site keep the craft warm.",
    "status": "online 26 Apr 2015 – 2016"
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
    "desc": "DesignUpdate 2011 — online from August 19, 2011.",
    "ueberblick": "The first big redesign after saying goodbye to Flash — the platform moves into the HTML/CSS world.",
    "ansatz": "Away from Flash, toward clean markup — the zeitgeist of 2011, consistently executed.",
    "stack": [
      "XHTML",
      "CSS",
      "JavaScript",
      "ColdFusion / Railo"
    ],
    "ergebnis": "Four years online, then came 2015.",
    "zitat": "Saying goodbye to Flash was a fresh start.",
    "learnings": "Technology switches work best on your own project — before you recommend them to clients.",
    "status": "online 19 Aug 2011 – 2015"
  },
  {
    "id": "autowerkstatt",
    "kind": "projekte",
    "kat": "Website",
    "tag": "CLIENT PROJECT",
    "datum": "2007–2012",
    "name": "Die Autowerkstatt",
    "mono": "AW",
    "color": "#374151",
    "featured": false,
    "tool": "XHTML · PHP",
    "desc": "Client website — five years online, from August 2007 to August 2012.",
    "ueberblick": "Website for an auto repair shop — services, contact, directions. Solid craftsmanship for a craft business.",
    "ansatz": "Classic structure with a focus on findability and easy maintenance.",
    "stack": [
      "XHTML",
      "CSS",
      "PHP"
    ],
    "ergebnis": "Five years reliably on the web.",
    "zitat": "Good tradesman websites are like good repair shops: unfussy and dependable.",
    "learnings": "Small client projects teach the essentials: listen, deliver, be patient.",
    "status": "online 2007–2012"
  },
  {
    "id": "cattshop",
    "kind": "projekte",
    "kat": "Shop",
    "tag": "CONCEPT",
    "datum": "2006",
    "name": "CATT Shop + CMS",
    "mono": "CS",
    "color": "#5B21B6",
    "featured": false,
    "tool": "Photoshop · PHP",
    "desc": "Online shop concept with its own CMS for the computer service CATT.",
    "ueberblick": "Shop concept with product view and a matching admin CMS — created as a concept.",
    "ansatz": "Design and system architecture from a single source — from screen design to data structure.",
    "stack": [
      "Photoshop",
      "XHTML",
      "PHP",
      "MySQL"
    ],
    "ergebnis": "It stayed a concept — the shop-system thinking stayed too.",
    "zitat": "Even unpublished work pays into the account.",
    "learnings": "Concepts are practice rooms: whoever designs shops later understands billing systems faster.",
    "status": "Concept",
    "gallery": [
      {
        "src": "/projekte/cattshop/1.webp",
        "alt": "Online shop concept “CATT Shop” (2006): product detail with cart"
      }
    ]
  },
  {
    "id": "ld2006",
    "kind": "projekte",
    "kat": "Website",
    "tag": "PERSONAL PROJECT",
    "datum": "2006",
    "name": "Loona! Designs 'ld2006'",
    "mono": "06",
    "color": "#9A3412",
    "featured": false,
    "tool": "Flash · ActionScript 2",
    "desc": "The Loona! website from 2006 — splash screen, home page, about us.",
    "ueberblick": "The platform version from the year the company was founded — with a splash screen, as was proper in 2006.",
    "ansatz": "Flash-inspired aesthetics, loving details — the web as a stage.",
    "stack": [
      "Flash",
      "ActionScript 2",
      "XHTML"
    ],
    "ergebnis": "A time capsule of the Flash era — screenshots in the archive.",
    "zitat": "Splash screens were our View Transitions.",
    "learnings": "Aesthetics age, care doesn't — the attention to detail from 2006 still holds up today.",
    "status": "Archive",
    "gallery": [
      {
        "src": "/projekte/ld2006/1.webp",
        "alt": "Loona! Designs ld2006: home page with news and Covert Operations banner"
      },
      {
        "src": "/projekte/ld2006/2.webp",
        "alt": "ld2006: intro page “what the web can be”"
      },
      {
        "src": "/projekte/ld2006/3.webp",
        "alt": "ld2006: about page with skills"
      }
    ]
  },
  {
    "id": "fahrschule",
    "kind": "projekte",
    "kat": "Design",
    "tag": "CONCEPT",
    "datum": "2006",
    "name": "Driving School (fictional)",
    "mono": "FS",
    "color": "#065F46",
    "featured": false,
    "tool": "Photoshop · XHTML",
    "desc": "Homepage concept for a fictional driving school — two home page variants.",
    "ueberblick": "Free design project: a driving school website that never existed — two variants of the home page.",
    "ansatz": "A finger exercise in layout and imagery, without a client brief.",
    "stack": [
      "Photoshop",
      "XHTML",
      "CSS"
    ],
    "ergebnis": "A portfolio piece from the early years.",
    "zitat": "Fictional clients are the most patient.",
    "learnings": "Free work shows your own signature more clearly than any brief.",
    "status": "Concept",
    "gallery": [
      {
        "src": "/projekte/fahrschule/1.webp",
        "alt": "Driving school concept (2006): home page with licence classes and dates"
      },
      {
        "src": "/projekte/fahrschule/2.webp",
        "alt": "Driving school concept: layout grid with header and gallery area"
      }
    ]
  },
  {
    "id": "catt2005",
    "kind": "projekte",
    "kat": "Website",
    "tag": "CLIENT PROJECT",
    "datum": "2005",
    "name": "CATT Service",
    "mono": "CT",
    "color": "#6D28D9",
    "featured": false,
    "tool": "XHTML · PHP",
    "desc": "Homepage for the computer service CATT.",
    "ueberblick": "Company website for a computer service — services and contact, clearly presented.",
    "ansatz": "Clean screen design, lean markup — craftsmanship from 2005.",
    "stack": [
      "XHTML",
      "CSS",
      "PHP"
    ],
    "ergebnis": "Online for several years; offline today.",
    "zitat": "Every client site is a small promise.",
    "learnings": "IT service providers as clients sharpen your own precision — they look at the details.",
    "status": "no longer online",
    "gallery": [
      {
        "src": "/projekte/catt2005/1.webp",
        "alt": "CATT Service (2005): home page with services"
      }
    ]
  },
  {
    "id": "hannoback",
    "kind": "projekte",
    "kat": "Website",
    "tag": "CLIENT PROJECT",
    "datum": "2005",
    "name": "Hannoback",
    "mono": "HB",
    "color": "#92400E",
    "featured": false,
    "tool": "PHP · MySQL",
    "desc": "Homepage with a custom-built MiniCMS for Hannoback.de.",
    "ueberblick": "Client website plus MiniCMS — editing your own content, long before that was a given.",
    "ansatz": "A small, tailor-made CMS instead of off-the-shelf software — exactly as much system as needed.",
    "stack": [
      "PHP",
      "MySQL",
      "XHTML"
    ],
    "ergebnis": "The client could edit content themselves — support effort close to zero.",
    "zitat": "The best CMS is the one the client understands.",
    "learnings": "Build tools to the user's measure — a lesson that carries from MiniCMS to WorkBench.",
    "status": "no longer online",
    "gallery": [
      {
        "src": "/projekte/hannoback/1.webp",
        "alt": "Hannoback (2005): catalogue of used machines"
      }
    ]
  },
  {
    "id": "yayci",
    "kind": "projekte",
    "kat": "Shop",
    "tag": "CLIENT PROJECT",
    "datum": "2004",
    "name": "Computer Handel Yayci",
    "mono": "YA",
    "color": "#1D4ED8",
    "featured": false,
    "tool": "PHP · MySQL",
    "desc": "A complete online shop — home page, categories, info bar.",
    "ueberblick": "A full online shop for a computer retailer — from the home page to the category overview.",
    "ansatz": "Shop logic, categories and admin built independently — 2004, without a framework safety net.",
    "stack": [
      "PHP",
      "MySQL",
      "XHTML",
      "CSS"
    ],
    "ergebnis": "The first big e-commerce job.",
    "zitat": "Without frameworks, you learn what frameworks do.",
    "learnings": "Building e-commerce from scratch makes every later shop system self-explanatory.",
    "status": "no longer online",
    "gallery": [
      {
        "src": "/projekte/yayci/1.webp",
        "alt": "Computer Handel Yayci (2004): home page with deal of the day"
      },
      {
        "src": "/projekte/yayci/2.webp",
        "alt": "Yayci online shop: computer category"
      },
      {
        "src": "/projekte/yayci/3.webp",
        "alt": "Yayci online shop: home page with daily price"
      }
    ]
  },
  {
    "id": "cot2003",
    "kind": "projekte",
    "kat": "Game",
    "tag": "FLASH 5 GAME",
    "datum": "2003",
    "name": "Covert Operations Tournament",
    "mono": "CO",
    "color": "#166534",
    "featured": true,
    "tool": "Flash 5 · ActionScript",
    "desc": "Flash 5 game from 2003 — the ancestor of today's Covert Operations series.",
    "ueberblick": "A tournament shooter in Flash 5 — and the namesake: 23 years later, Covert Operations returns as an AI experiment.",
    "ansatz": "Timeline, MovieClips and ActionScript — game development with the tools of 2003.",
    "stack": [
      "Flash 5",
      "ActionScript"
    ],
    "ergebnis": "The start of a series that lives on in 2026.",
    "zitat": "Some ideas wait 23 years for their sequel.",
    "learnings": "Game feel is timeless — the tools change, the fascination doesn't.",
    "status": "Archive — sequel 2026"
  },
  {
    "id": "egermann",
    "kind": "projekte",
    "kat": "Website",
    "tag": "CLIENT PROJECT",
    "datum": "2002",
    "name": "RA Egermann",
    "mono": "RE",
    "color": "#334155",
    "featured": false,
    "tool": "HTML · CSS",
    "desc": "Homepage for a law firm — one of the first client projects.",
    "ueberblick": "Law firm website from 2002 — the start of client work, while still in training.",
    "ansatz": "Seriousness over gimmicks: clear structure, calm design.",
    "stack": [
      "HTML",
      "CSS"
    ],
    "ergebnis": "The first time being responsible for a professional's public presence.",
    "zitat": "Lawyers teach you diligence — inevitably.",
    "learnings": "Professional restraint is a design discipline, too.",
    "status": "no longer online"
  },
  {
    "id": "arena",
    "kind": "labs",
    "kat": "Game",
    "tag": "AI EXPERIMENT",
    "datum": "05/2026",
    "name": "Covert Operations Arena",
    "mono": "CA",
    "color": "#7F1D1D",
    "featured": true,
    "tool": "Claude Code · Opus 4.8",
    "desc": "The arena FPS spin-off of Covert Operations — faster, denser, louder.",
    "ueberblick": "The arena shooter spin-off of Covert Operations: smaller maps, higher pace.",
    "ansatz": "Continued as an experiment with Opus 4.8 — what does a model leap change about the development flow?",
    "stack": [
      "Claude Code",
      "Opus 4.8",
      "JavaScript"
    ],
    "ergebnis": "Work in progress — the workbench is open.",
    "zitat": "Speed is a feature — in the development process, too.",
    "learnings": "A model leap changes the dialog more than the code: sharper questions, shorter loops."
  },
  {
    "id": "deathgrid",
    "kind": "labs",
    "kat": "Game",
    "tag": "AI EXPERIMENT",
    "datum": "05/2026",
    "name": "Death Grid 3D",
    "mono": "DG",
    "color": "#18181B",
    "featured": true,
    "tool": "Antigravity 2",
    "desc": "Retro-style shooter in the finest Doom tradition — grid, sprites, adrenaline.",
    "ueberblick": "A retro shooter like Doom: raycasting aesthetics, sprites, pace.",
    "ansatz": "Experiment with Antigravity 2 — different tool, same question: how far does AI-assisted prototyping go?",
    "stack": [
      "Antigravity 2",
      "JavaScript",
      "Canvas"
    ],
    "ergebnis": "Work in progress.",
    "zitat": "Constraints from 1993, tools from 2026.",
    "learnings": "Retro aesthetics force clarity — in design as in code. Telling a story with few pixels teaches priorities."
  },
  {
    "id": "workbench",
    "kind": "labs",
    "kat": "Tool",
    "tag": "TOOL",
    "datum": "05/2026",
    "name": "LD WorkBench",
    "mono": "WB",
    "color": "#B45309",
    "featured": true,
    "tool": "Claude Code · Opus 4.7",
    "desc": "Managing timesheets and notes — the tool everyday life ordered.",
    "ueberblick": "Timesheets and notes in one place — the tool my own everyday life ordered.",
    "ansatz": "With Claude Code (Opus 4.7) from need to usable tool — personal need as the best requirements document.",
    "stack": [
      "Claude Code",
      "Opus 4.7",
      "React",
      "TypeScript"
    ],
    "ergebnis": "Work in progress — in daily personal use.",
    "zitat": "Personal need is the most honest requirements document.",
    "learnings": "Tools mature fastest when you have to put up with them yourself every day."
  },
  {
    "id": "buddy",
    "kind": "labs",
    "kat": "Tool",
    "tag": "TOOL",
    "datum": "03/2026",
    "name": "LD Buddy",
    "mono": "LB",
    "color": "#4C1D95",
    "featured": false,
    "tool": "Claude Code · Opus 4.5–4.7",
    "desc": "Managing finances, orders and more — the personal assistant.",
    "ueberblick": "The personal assistant: managing finances, orders and more.",
    "ansatz": "Grown across several Opus versions (4.5–4.7) — a long-term experiment in AI-assisted product development.",
    "stack": [
      "Claude Code",
      "Opus 4.5–4.7",
      "React"
    ],
    "ergebnis": "Work in progress.",
    "zitat": "An assistant is good when it's boringly reliable.",
    "learnings": "Building across model versions shows what really holds up: your own structure, not the tool."
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
    "desc": "Design explorations for the new Loona! Designs website — this one.",
    "ueberblick": "Design explorations for the relaunch of loona-designs.de — the page you're looking at right now is one of the results.",
    "ansatz": "Think through many directions in parallel, filter ruthlessly — from the 50-styles experiment to the Stripe-inspired wave hero.",
    "stack": [
      "Claude Code",
      "Opus 4.8",
      "Design Systems"
    ],
    "ergebnis": "Work in progress — you're looking at it right now.",
    "zitat": "Fifty ideas, so that one remains.",
    "learnings": "Filtering ruthlessly is part of the design — not its failure. The path from 50 styles to one system was the real design."
  },
  {
    "id": "ldbuddy",
    "kind": "projekte",
    "kat": "App",
    "tag": "DESKTOP APP",
    "datum": "10/2026",
    "name": "LD Buddy",
    "mono": "LB",
    "color": "#BE185D",
    "featured": false,
    "tool": "Tauri 2 · Next.js",
    "desc": "Desktop app for everyday admin (Tauri 2 + Next.js): finances, orders, news, collections, household budget, shopping lists and bookmarks — with Chrome and Safari extensions, a mobile companion app and a link to LD NotchBuddy.",
    "ueberblick": "Seven little apps for seven little jobs — LD Buddy brings them together in one calm interface.",
    "ansatz": "Daily routines first, features second: what do you need in the morning, on the go, in the evening?",
    "stack": [
      "Tauri 2",
      "Next.js",
      "Chrome-Extension",
      "Safari-Extension",
      "Companion-App",
      "LD NotchBuddy"
    ],
    "ergebnis": "In progress — this story page shows the ideas.",
    "zitat": "The best everyday app is the one you forget until you need it.",
    "learnings": "Calm is a feature.",
    "layout": "story",
    "brand": "buddy",
    "brandName": "LD Buddy.",
    "homeLabel": "Loona! Designs",
    "story": [
      {
        "type": "story-hero",
        "_id": "ldbuddy01",
        "kicker": "LD BUDDY · DESKTOP APP",
        "title": "Your everyday.",
        "title2": "One buddy.",
        "text": "Finances, orders, news, collections, household budget, shopping lists and bookmarks — in one desktop app that thinks along instead of nagging. Plus extensions for Chrome and Safari and a mobile companion app.",
        "chips": [
          "Finances",
          "Orders",
          "News",
          "Collection",
          "Budget",
          "Shopping lists",
          "Bookmarks"
        ],
        "cue": "Scroll",
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
          "Accounts at a glance",
          "Track parcels",
          "Share lists",
          "Set budgets",
          "Collect & value",
          "Read later",
          "Works offline",
          "No ads"
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
        "kicker": "WHY",
        "text": "Seven apps for seven little things? LD Buddy brings everyday admin into one place — fast, private and so tidy you actually enjoy opening it."
      },
      {
        "type": "story-scene",
        "_id": "ldbuddy15",
        "kicker": "EVERYWHERE YOU ARE",
        "title": "Desktop first. Browser and phone along for the ride.",
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
                  "title": "Desktop app",
                  "text": "LD Buddy's home — built with Tauri 2 and Next.js.",
                  "size": "l",
                  "color": "#BE185D",
                  "screen": "dashboard",
                  "rows": [
                    "Spent in October | €1,284 | €",
                    "Parcels on the way | 3 | 📦",
                    "Shopping list | 6 open | 🛒",
                    "Read later | 4 | 🔖"
                  ]
                },
                {
                  "icon": "🧩",
                  "title": "Chrome extension",
                  "text": "Send bookmarks, orders and prices straight from the browser to Buddy.",
                  "size": "s"
                },
                {
                  "icon": "🧭",
                  "title": "Safari extension",
                  "text": "The same for Safari.",
                  "size": "s"
                },
                {
                  "icon": "📱",
                  "title": "Companion app",
                  "text": "Along on mobile: tick off the list, check a parcel, capture a receipt.",
                  "size": "s",
                  "color": "#9D174D"
                },
                {
                  "icon": "✨",
                  "title": "LD NotchBuddy",
                  "text": "Connected to the new LD NotchBuddy. app.",
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
        "kicker": "ALL VIEWS",
        "title": "Click through, please.",
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
              "text": "Same data, five faces — pick a view.",
              "color": "#BE185D",
              "items": [
                {
                  "label": "Desktop",
                  "device": "desktop",
                  "screen": "dashboard",
                  "screenTitle": "Today",
                  "rows": [
                    "Spent in October | €1,284 | €",
                    "Parcels on the way | 3 | 📦",
                    "Shopping list | 6 open | 🛒",
                    "Read later | 4 | 🔖"
                  ],
                  "caption": "The desktop app (Tauri 2 + Next.js) — home of every area."
                },
                {
                  "label": "Mobile",
                  "device": "phone",
                  "screen": "liste",
                  "screenTitle": "Groceries",
                  "rows": [
                    "Oat milk | 2× | ✓",
                    "Bananas | 1 kg",
                    "Coffee | 500 g | ✓",
                    "Bread | 1",
                    "Tomatoes | 6"
                  ],
                  "caption": "The companion app on the go: tick off, check, capture."
                },
                {
                  "label": "Reading list",
                  "device": "sidebar",
                  "screen": "lesezeichen",
                  "screenTitle": "Read later",
                  "rows": [
                    "Clean Architecture | martinfowler.com | M",
                    "Liquid glass explained | 6 min | L",
                    "Tauri 2.0 | tauri.app | T",
                    "Recipes: autumn | 12 min | R"
                  ],
                  "caption": "Reading-list extension as a side panel: save articles, read them later in peace."
                },
                {
                  "label": "Chrome",
                  "device": "chrome",
                  "screen": "bestellungen",
                  "screenTitle": "Orders",
                  "rows": [
                    "Headphones | Tue | 2",
                    "Running shoes | Mon | 3",
                    "Monstera | today | 0"
                  ],
                  "caption": "Chrome extension: send an order or price to Buddy in one click."
                },
                {
                  "label": "Safari",
                  "device": "safari",
                  "screen": "lesezeichen",
                  "screenTitle": "Save",
                  "rows": [
                    "This page | save now | +",
                    "Price alert | from €79 | €",
                    "Add to collection | Vinyl | ♫"
                  ],
                  "caption": "Safari extension: the same for Safari on the Mac."
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
        "kicker": "WHAT IT FEELS LIKE",
        "title": "A day with LD Buddy",
        "text": "From the first coffee to the couch — Buddy shows up when you need it and stays quiet when you don't.",
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
                  "title": "7:30 am — balance with your coffee",
                  "text": "One glance is enough: what came in, what went out, what's due this week. Without five banking apps.",
                  "screen": "finanzen",
                  "screenTitle": "Finances",
                  "rows": [
                    "Balance | €2,481.20",
                    "Salary | +€3,150.00 | €",
                    "Rent | -€950.00 | ⌂",
                    "Groceries | -€64.80 | G",
                    "Streaming | -€12.99 | ▶"
                  ]
                },
                {
                  "icon": "🛒",
                  "title": "The shopping list that thinks along",
                  "text": "Shared with the family, sorted by supermarket aisle — and Buddy suggests what's running out.",
                  "screen": "liste",
                  "screenTitle": "Groceries",
                  "rows": [
                    "Oat milk | 2× | ✓",
                    "Bananas | 1 kg",
                    "Coffee | 500 g | ✓",
                    "Bread | 1",
                    "Tomatoes | 6",
                    "Dish soap | 1"
                  ]
                },
                {
                  "icon": "📦",
                  "title": "Parcels without tracking chaos",
                  "text": "Orders land in Buddy automatically — with status, delivery date and a reminder for the return window.",
                  "screen": "bestellungen",
                  "screenTitle": "Orders",
                  "rows": [
                    "Headphones | Tue | 2",
                    "Running shoes | Mon | 3",
                    "Book: Clean Code | Fri | 1",
                    "Monstera | today | 0"
                  ]
                },
                {
                  "icon": "📰",
                  "title": "News that actually concerns you",
                  "text": "No endless feed: only updates about your places, devices and topics — bundled once a day.",
                  "screen": "feed",
                  "screenTitle": "Today",
                  "rows": [
                    "Update available for your router | Tech | 5 min",
                    "Farmers market opens longer | Local | 2 h",
                    "Track works this weekend | Commute | today"
                  ]
                },
                {
                  "icon": "🔖",
                  "title": "Bookmarks for later — actually for later",
                  "text": "Share links from any app; Buddy keeps them with a preview and reminds you on Sunday.",
                  "screen": "lesezeichen",
                  "screenTitle": "Bookmarks",
                  "rows": [
                    "View Transitions in depth | web.dev | V",
                    "Recipe: roasted vegetables | bbcgoodfood.com | R",
                    "Tax return 2026 | elster.de | E",
                    "Hike Saxon Switzerland | komoot | W"
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
        "kicker": "EVERYTHING IN ONE PLACE",
        "title": "Seven areas. One interface.",
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
                  "title": "Finances",
                  "text": "All accounts and cards in one place, subscriptions detected automatically.",
                  "size": "l",
                  "color": "#BE185D",
                  "screen": "finanzen",
                  "rows": [
                    "This month | €1,284.50",
                    "Subscriptions | -€42.96 | ↻",
                    "Fuel | -€71.20 | F",
                    "Refund | +€23.00 | +"
                  ]
                },
                {
                  "icon": "📒",
                  "title": "Household budget",
                  "text": "Budgets per category — with a heads-up before it gets tight.",
                  "size": "t",
                  "screen": "haushalt",
                  "rows": [
                    "Groceries | €312 | 78",
                    "Home | €950 | 100",
                    "Leisure | €140 | 56",
                    "Transport | €96 | 40"
                  ]
                },
                {
                  "icon": "🛒",
                  "title": "Shopping lists",
                  "text": "Shared, sorted, synced instantly.",
                  "size": "s"
                },
                {
                  "icon": "📦",
                  "title": "Orders",
                  "text": "Status and return windows at a glance.",
                  "size": "s"
                },
                {
                  "icon": "🗞️",
                  "title": "News",
                  "text": "One calm daily digest instead of a hundred push notifications.",
                  "size": "w",
                  "color": "#0E7490"
                },
                {
                  "icon": "🧩",
                  "title": "Collection",
                  "text": "Vinyl, LEGO, plants — all catalogued.",
                  "size": "s"
                },
                {
                  "icon": "🔖",
                  "title": "Bookmarks",
                  "text": "Read later without forgetting.",
                  "size": "s"
                },
                {
                  "icon": "🔒",
                  "title": "Private by default",
                  "text": "Data stays on your device, sync is end-to-end encrypted, no ads.",
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
        "kicker": "HOUSEHOLD BUDGET",
        "title": "Budgets that don't feel like going without",
        "text": "Buddy sorts spending into categories automatically and shows where there's room left — friendly, not finger-wagging.",
        "bullets": [
          "Categories detected automatically",
          "A heads-up before a budget breaks",
          "Monthly recap as a little story"
        ],
        "color": "#0F766E",
        "screen": "haushalt",
        "screenTitle": "October",
        "rows": [
          "Groceries | €312 | 78",
          "Home | €950 | 100",
          "Leisure | €140 | 56",
          "Transport | €96 | 40",
          "Clothing | €230 | 92"
        ],
        "controls": {
          "side": "links",
          "device": "phone"
        }
      },
      {
        "type": "story-scene",
        "_id": "ldbuddy09",
        "kicker": "COLLECTION",
        "title": "Your treasures, finally sorted.",
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
            "kicker": "SCAN",
            "title": "Snap it, Buddy does the rest",
            "text": "Barcode, cover or label — title, value and condition fill themselves in.",
            "color": "#7C2D12"
          },
          {
            "icon": "🎧",
            "kicker": "COLLECT",
            "title": "Vinyl, LEGO, plants",
            "text": "Your own collections with fields that fit you."
          },
          {
            "icon": "📈",
            "kicker": "VALUE",
            "title": "What is it worth?",
            "text": "Price history of your collection — no spreadsheets.",
            "color": "#065F46"
          },
          {
            "icon": "🤝",
            "kicker": "SHARE",
            "title": "Swap instead of buying twice",
            "text": "Share lists with friends, mark duplicates."
          },
          {
            "icon": "🔔",
            "kicker": "WISHLIST",
            "title": "Alerts for bargains",
            "text": "Buddy pings you when something on your wishlist turns up cheap.",
            "color": "#9D174D"
          }
        ]
      },
      {
        "type": "story-scene",
        "_id": "ldbuddy11",
        "kicker": "BY THE NUMBERS",
        "title": "Fewer apps, more calm.",
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
                  "label": "areas in one app"
                },
                {
                  "value": "0",
                  "label": "ad banners"
                },
                {
                  "value": "100 %",
                  "label": "usable offline"
                },
                {
                  "value": "2.4 s",
                  "label": "to your first list"
                }
              ]
            }
          ]
        }
      },
      {
        "type": "story-scene",
        "_id": "ldbuddy13",
        "kicker": "IN THE WORKS",
        "title": "Ready for less clutter?",
        "text": "LD Buddy is being built at loona! designs right now. Curious, want to weigh in or test it? Drop me a line.",
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
              "label": "See all projects",
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
    "kat": "Game",
    "tag": "GAME ENGINE",
    "datum": "10/2026",
    "name": "COE",
    "mono": "CO",
    "color": "#14532D",
    "featured": false,
    "tool": "Claude Code · JavaScript · WebGL",
    "desc": "Covert Operations Engine — one game engine, many genres: FPS, stealth, arcade racer and open world. With sample games from Battlefield Warfare to Ghetto Gangz.",
    "ueberblick": "“Covert Operations” grew into an engine: the same game logic drives shooters, stealth, racing and an open city.",
    "ansatz": "Core first (physics, input, AI, camera), genres as modules on top.",
    "stack": [
      "JavaScript",
      "WebGL",
      "Claude Code",
      "Custom physics",
      "Enemy AI"
    ],
    "ergebnis": "In progress — this story page shows the samples.",
    "zitat": "An engine is only done when the second game no longer needs to change it.",
    "learnings": "Genres share more than you think — camera and input make the difference.",
    "layout": "story",
    "story": [
      {
        "type": "story-hero",
        "_id": "coe01",
        "kicker": "COE · COVERT OPERATIONS ENGINE",
        "title": "One engine.",
        "title2": "Every genre.",
        "text": "Shoot, sneak, race, roam — the Covert Operations Engine powers every sample game. Same physics, same AI, a different camera.",
        "chips": [
          "FPS",
          "Stealth",
          "Arcade-Racer",
          "Open World",
          "Top-Down",
          "ISO"
        ],
        "cue": "Scroll",
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
        "kicker": "IN NUMBERS",
        "title": "One core, many games.",
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
                  "label": "engine"
                },
                {
                  "value": "4",
                  "label": "sample games"
                },
                {
                  "value": "5",
                  "label": "cameras"
                },
                {
                  "value": "0",
                  "label": "installs needed"
                }
              ]
            }
          ]
        }
      },
      {
        "type": "story-scene",
        "_id": "coe04",
        "kicker": "THE SAMPLES",
        "title": "Scroll through four games.",
        "text": "The game on the left, the scene on the right — scrolling switches the game.",
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
                  "text": "FPS with squads, vehicles and destructible cover.",
                  "screen": "spiel",
                  "rows": [
                    "Battlefield Warfare | Sector 3 – Harbour | fps",
                    "Health | 86 | ♥",
                    "Ammo | 24/120 | ▮",
                    "Squad | 4/4 | ⚑"
                  ]
                },
                {
                  "icon": "🏙️",
                  "title": "Ghetto Gangz",
                  "text": "Open world in the spirit of GTA: a city, vehicles, wanted level.",
                  "screen": "spiel",
                  "rows": [
                    "Ghetto Gangz | North district | stadt",
                    "Wanted | ★★☆ | ⚠",
                    "Cash | $ 2.340 | $",
                    "Rep | 61% | ♛"
                  ]
                },
                {
                  "icon": "🏁",
                  "title": "Racer",
                  "text": "Arcade racer: drift, nitro, shortcuts.",
                  "screen": "spiel",
                  "rows": [
                    "Racer | Lap 2/3 | rennen",
                    "Position | 2/8 | ⚑",
                    "Speed | 214 km/h | ⏱",
                    "Nitro | 70 % | ⚡"
                  ]
                },
                {
                  "icon": "🦅",
                  "title": "Raptor: Shadow of Vengeance",
                  "text": "Stealth: light, noise and the guards’ view cones.",
                  "screen": "spiel",
                  "rows": [
                    "Raptor: Shadow of Vengeance | Warehouse | stealth",
                    "Visible | 12% | ◐",
                    "Noise | quiet | ♪",
                    "Target | 1/3 | ⌖"
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
        "kicker": "WHY",
        "text": "Every game starts from scratch? Not with COE. Movement, hits, enemies and vehicles exist once — the games only tell what becomes of them."
      },
      {
        "type": "story-horizontal",
        "_id": "coe07",
        "items": [
          {
            "icon": "🎮",
            "kicker": "CAMERA",
            "title": "FPS, top-down, ISO, chase",
            "text": "Switchable at runtime — same scene, different view.",
            "color": "#14532D"
          },
          {
            "icon": "🧠",
            "kicker": "ENEMY AI",
            "title": "Patrol to retreat",
            "text": "Search, attack, take cover, call for backup."
          },
          {
            "icon": "💥",
            "kicker": "PHYSICS",
            "title": "Hits that feel right",
            "text": "Ballistics, recoil, destructible objects.",
            "color": "#7C2D12"
          },
          {
            "icon": "🚗",
            "kicker": "VEHICLES",
            "title": "From tank to drift car",
            "text": "One driving model, many tunings."
          },
          {
            "icon": "⚙️",
            "kicker": "TOGGLES",
            "title": "Per-game settings",
            "text": "Blood, destructible terrain, difficulty.",
            "color": "#1E3A8A"
          }
        ]
      },
      {
        "type": "story-scene",
        "_id": "coe08",
        "kicker": "IN PROGRESS",
        "title": "Up for a round?",
        "text": "COE is being built at loona! designs. Covert Operations is already playable in the browser.",
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
              "label": "See all labs",
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
    "tag": "MAC APP",
    "datum": "10/2026",
    "name": "LD NotchBuddy",
    "mono": "NB",
    "color": "#9D174D",
    "featured": false,
    "tool": "Swift · macOS · LD Buddy",
    "desc": "The MacBook notch as a Dynamic Island: limits for Claude Code and Antigravity, active agents, music, calendar, Pomodoro, clipboard, drop shelf and system stats — plus finances and orders from LD Buddy.",
    "ueberblick": "The cut-out at the top of the screen is unused space. NotchBuddy turns it into a small status hub.",
    "ansatz": "Icons first, expand on demand — never in the way, always one glance away.",
    "stack": [
      "Swift",
      "macOS",
      "LD Buddy",
      "Claude Code",
      "Antigravity"
    ],
    "ergebnis": "In progress — this story page shows the ideas.",
    "zitat": "The best place for status is where you look anyway.",
    "learnings": "Show less, choose better.",
    "layout": "story",
    "brand": "buddy",
    "brandName": "LD NotchBuddy.",
    "homeLabel": "Loona! Designs",
    "story": [
      {
        "type": "story-hero",
        "_id": "notchbuddy01",
        "kicker": "LD NOTCHBUDDY · MAC APP",
        "title": "Your notch.",
        "title2": "Now with purpose.",
        "text": "Like the Dynamic Island on iPhone — right under your MacBook’s notch. Icons at rest, one click expands the island.",
        "chips": [
          "Claude Code",
          "Antigravity",
          "Agents",
          "Music",
          "Pomodoro",
          "System"
        ],
        "cue": "Scroll",
        "c1": "#F472B6",
        "c2": "#38BDF8",
        "c3": "#A78BFA",
        "device": "desktop",
        "screen": "notch",
        "screenTitle": "LD NotchBuddy",
        "rows": [
          "Claude Code | 72% | ✳",
          "Antigravity | 38% | ◭",
          "Active agents | 3 | ⚙",
          "Music | Apple Music | ♫",
          "Pomodoro | 18:42 | ◷",
          "Battery | 84% | ▮",
          "Finances | -€1,284 | €",
          "Parcels | 3 on the way | 📦"
        ],
        "controls": {
          "layout": "geraet"
        }
      },
      {
        "type": "story-ticker",
        "_id": "notchbuddy02",
        "items": [
          "Limits at a glance",
          "Watch agents",
          "Control music",
          "See meetings",
          "Pomodoro",
          "Drop shelf, no saving",
          "CPU · GPU · RAM",
          "Finances from LD Buddy"
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
        "title": "Know how much is left.",
        "text": "The 5-hour window, the week, the day: NotchBuddy shows your AI tools’ limits — and changes color before you run low.",
        "bullets": [
          "Limits and status for Claude Code",
          "Antigravity in the same glance",
          "Active agents with a ping when they finish"
        ],
        "color": "#BE185D",
        "screen": "limits",
        "screenTitle": "Limits",
        "rows": [
          "Claude Code | 72% | 5-hour window",
          "Claude Code | 41% | Week",
          "Antigravity | 38% | today",
          "Agents | 3 | active"
        ],
        "controls": {
          "side": "links",
          "device": "phone"
        }
      },
      {
        "type": "story-scene",
        "_id": "notchbuddy04",
        "kicker": "ALL ISLANDS",
        "title": "Four views, one glance.",
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
                  "label": "Island",
                  "device": "desktop",
                  "screen": "notch",
                  "screenTitle": "LD NotchBuddy",
                  "rows": [
                    "Claude Code | 72% | ✳",
                    "Antigravity | 38% | ◭",
                    "Active agents | 3 | ⚙",
                    "Music | Apple Music | ♫",
                    "Pomodoro | 18:42 | ◷",
                    "Battery | 84% | ▮",
                    "Finances | -€1,284 | €",
                    "Parcels | 3 on the way | 📦"
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
                    "Memory | 18.2 / 32 GB | 57",
                    "Network | ↓ 12 MB/s | 40",
                    "Battery | 84% | 84",
                    "CPU cores | 40 62 18 77 25 90 33 12 55 48"
                  ]
                },
                {
                  "label": "From LD Buddy",
                  "device": "desktop",
                  "screen": "finanzen",
                  "screenTitle": "Finances",
                  "rows": [
                    "This month | €1,284.50",
                    "Subscriptions | -€42.96 | ↻",
                    "Salary | +€3,150.00 | €"
                  ]
                },
                {
                  "label": "Orders",
                  "device": "desktop",
                  "screen": "bestellungen",
                  "screenTitle": "Orders",
                  "rows": [
                    "Headphones | Tue | 2",
                    "Running shoes | Mon | 3",
                    "Monstera | today | 0"
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
        "kicker": "ALL IN",
        "title": "What fits under the notch",
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
                  "title": "Music",
                  "text": "Control Apple Music & co. without switching windows.",
                  "size": "w",
                  "color": "#9D174D"
                },
                {
                  "icon": "📅",
                  "title": "Calendar",
                  "text": "Next meeting with a countdown.",
                  "size": "s"
                },
                {
                  "icon": "◷",
                  "title": "Pomodoro",
                  "text": "Focus time right in the island.",
                  "size": "s"
                },
                {
                  "icon": "📋",
                  "title": "Clipboard",
                  "text": "Recent entries, one click to paste.",
                  "size": "s"
                },
                {
                  "icon": "📥",
                  "title": "Drop shelf",
                  "text": "Park files for a moment — without saving them.",
                  "size": "s"
                },
                {
                  "icon": "⚙",
                  "title": "Agents",
                  "text": "Active agents with progress.",
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
        "kicker": "IN PROGRESS",
        "title": "Soon under your notch?",
        "text": "LD NotchBuddy is being built at loona! designs — as a companion to LD Buddy.",
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
              "label": "See all projects",
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
    "tag": "PLATFORM",
    "datum": "10/2026",
    "name": "LD Beyond",
    "mono": "LB",
    "color": "#6D28D9",
    "featured": false,
    "tool": "Next.js · SQLite · Claude Code",
    "desc": "The new version of loona-designs — the LD Beyond platform with the LD Flow CMS: story pages, liquid glass, multilingual content and widgets to build with.",
    "ueberblick": "You are inside it right now: LD Beyond is the website you are reading — and the platform behind it.",
    "ansatz": "One system instead of many pages: content as building blocks, maintained in LD Flow.",
    "stack": [
      "Next.js",
      "SQLite",
      "LD Flow",
      "View Transitions",
      "Claude Code"
    ],
    "ergebnis": "Live and growing — this page is an example itself.",
    "zitat": "Your own website is the most honest project.",
    "learnings": "A clear system beats a hundred ideas.",
    "layout": "story",
    "story": [
      {
        "type": "story-hero",
        "_id": "ldbeyond01",
        "kicker": "LD BEYOND · PLATFORM",
        "title": "You’re already in.",
        "title2": "LD Beyond.",
        "text": "The new version of loona-designs: a platform for portfolio, labs and magazine — maintained in its own CMS, LD Flow. This page is built with exactly that system.",
        "chips": [
          "Liquid Glass",
          "LD Flow",
          "Widgets",
          "Bilingual"
        ],
        "cue": "Scroll",
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
        "kicker": "WHY",
        "text": "A website nobody touches goes stale. LD Beyond is built so that changing it is fun — right on the page, without code."
      },
      {
        "type": "story-scene",
        "_id": "ldbeyond03",
        "kicker": "HOW THIS PAGE IS MADE",
        "title": "From blank page to story.",
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
                  "title": "Pick blocks",
                  "text": "Opening, scenes, scrollytelling, gallery — as widgets in LD Flow.",
                  "screen": "editor",
                  "screenTitle": "LD Beyond",
                  "rows": [
                    "Story: Opening | Your day. | ✦",
                    "Story: Scene | A day with LD Buddy | ▭",
                    "Story: App gallery | All views | ▦",
                    "Story: Numbers | Fewer apps | #",
                    "Button | All projects | →"
                  ]
                },
                {
                  "icon": "✎",
                  "title": "Write right on the page",
                  "text": "Text is edited in the preview — what you see is what gets published.",
                  "screen": "editor",
                  "screenTitle": "LD Beyond",
                  "rows": [
                    "Button | All projects | →",
                    "Story: Numbers | Fewer apps | #",
                    "Story: App gallery | All views | ▦",
                    "Story: Scene | A day with LD Buddy | ▭",
                    "Story: Opening | Your day. | ✦"
                  ]
                },
                {
                  "icon": "◐",
                  "title": "Bilingual",
                  "text": "German and English per document, translations as drafts.",
                  "screen": "feed",
                  "screenTitle": "DE · EN",
                  "rows": [
                    "German | live | Story",
                    "English | draft | Story",
                    "Versions | 12 | History"
                  ]
                },
                {
                  "icon": "↗",
                  "title": "Publish",
                  "text": "Now or scheduled — with versions to restore.",
                  "screen": "dashboard",
                  "screenTitle": "loona-designs",
                  "rows": [
                    "Projects | 16 | ▦",
                    "Labs | 8 | ⚗",
                    "Articles | 23 | ✎",
                    "Languages | DE · EN | ◐"
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
        "kicker": "TWO PARTS",
        "title": "The stage and the control room.",
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
                    "Projects | 16 | ▦",
                    "Labs | 8 | ⚗",
                    "Articles | 23 | ✎",
                    "Languages | DE · EN | ◐"
                  ],
                  "caption": "The stage: portfolio, labs, the .Tech magazine and story pages like this one."
                },
                {
                  "label": "LD Flow",
                  "device": "browser",
                  "screen": "editor",
                  "screenTitle": "LD Buddy",
                  "rows": [
                    "Story: Opening | Your day. | ✦",
                    "Story: Scene | A day with LD Buddy | ▭",
                    "Story: App gallery | All views | ▦",
                    "Story: Numbers | Fewer apps | #",
                    "Button | All projects | →"
                  ],
                  "caption": "The control room: LD Flow — pick blocks, write right on the page, publish."
                },
                {
                  "label": "Mobile",
                  "device": "phone",
                  "screen": "feed",
                  "screenTitle": ".Tech",
                  "rows": [
                    "Liquid glass on the web | 6 min | Design",
                    "Building story pages | 8 min | LD Flow",
                    "Auto Contrast Fix 2 | 4 min | A11y"
                  ],
                  "caption": "Mobile with its own tab bar — simulated as a phone view on desktop too."
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
        "kicker": "WHAT’S INSIDE",
        "title": "Platform and CMS in one.",
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
                  "text": "Glass with real refraction — and auto contrast so everything stays readable.",
                  "size": "l",
                  "color": "#6D28D9",
                  "screen": "dashboard",
                  "rows": [
                    "Contrast | ≥ 4.5:1 | ✓",
                    "Views | 4 | ▭",
                    "Transitions | 20+ | ↺",
                    "Hero animations | 30+ | ✦"
                  ]
                },
                {
                  "icon": "▦",
                  "title": "Widgets",
                  "text": "Custom blocks with defineWidget.",
                  "size": "s"
                },
                {
                  "icon": "🌐",
                  "title": "Bilingual",
                  "text": "German and English, paths per language.",
                  "size": "s"
                },
                {
                  "icon": "🔒",
                  "title": "Secure",
                  "text": "Two-factor sign-in, CSP with nonces, prepared SQL.",
                  "size": "w",
                  "color": "#1E1B4B"
                },
                {
                  "icon": "♿",
                  "title": "Accessible",
                  "text": "Tested with axe, WCAG 2.2 AA.",
                  "size": "s"
                },
                {
                  "icon": "⚡",
                  "title": "Fast",
                  "text": "Load-time budgets in CI.",
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
        "kicker": "IN PROGRESS",
        "title": "Curious for more?",
        "text": "LD Beyond keeps growing — every new story page is a test for the system.",
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
              "label": "See all projects",
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
