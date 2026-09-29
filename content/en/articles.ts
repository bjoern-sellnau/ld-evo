/**
 * .Tech-Artikel — englische Fassung (Übersetzungsentwurf) von content/articles.ts.
 * Gleiche Struktur/IDs wie die deutsche Datei; übersetzt sind nur Texte. Wird in LD Flow als ENTWURF angelegt und
 * erst nach Prüfung veröffentlicht.
 * Kategorien (kat): KI → AI, AUSBILDUNG → TRAINING, KARRIERE → CAREER; alle übrigen unverändert.
 */

import type { Article } from '../articles';

export const ARTICLES: Article[] = [
  {
    "id": "a1",
    "kat": "AI",
    "datum": "06/2026",
    "titel": "Seven experiments, one toolbox: my year with Claude Code",
    "teaser": "From 6D shooter to workbench — what AI pair programming really changes day to day.",
    "color": "#2A1B4A",
    "body": [
      "Seven projects in six months — not because I type faster, but because the friction between an idea and the first playable build has gotten smaller. Claude Code handles the grunt work; the decisions stay with me.",
      "The biggest lesson: AI doesn't replace architecture. Without a target picture, you get fast code heading the wrong way. With one, you get speed.",
      "Two of the experiments — Corefall and Covert Operations — are publicly playable. The rest is maturing on the workbench. This article is a draft and will be updated with real numbers."
    ],
    "pinned": true,
    "draft": true
  },
  {
    "id": "a2",
    "kat": "FRONTEND",
    "datum": "05/2026",
    "titel": "From Flash to React: 18 years of frontend, one constant",
    "teaser": "Technologies come and go — the curiosity stays. A short trip through time.",
    "color": "#0E3B2E",
    "body": [
      "I started out with Flash and ActionScript — timeline, tweens, stage. Sounds like archaeology today, but it taught me to think in states and transitions.",
      "In 2015, React felt like déjà vu: components instead of MovieClips, props instead of parameters, but the same idea — building interfaces from small, manageable parts.",
      "The constant across 18 years isn't the technology but the mindset: understanding why something works — not just that it works. (Draft, to be expanded.)"
    ],
    "pinned": true,
    "draft": true
  },
  {
    "id": "a3",
    "kat": "TRAINING",
    "datum": "04/2026",
    "titel": "Teaching means learning twice — AEVO in practice",
    "teaser": "I've been training IT apprentices since 2019. Here's what that does to my own code.",
    "color": "#7A2E12",
    "body": [
      "Since March 2019, I've been a certified trainer under AEVO (IHK Berlin). The most surprising effect: explaining exposes the spots where you rely on habit rather than understanding.",
      "An apprentice doesn't ask what a useEffect does — they ask why. And there's no memorized answer to \"why\".",
      "Passing on knowledge isn't a side job; it's quality assurance for your own thinking. (Draft — examples from my training work to follow.)"
    ],
    "pinned": true,
    "draft": true
  },
  {
    "id": "a4",
    "kat": "A11Y",
    "datum": "06/2026",
    "titel": "Accessible by default — what BITV really means day to day",
    "teaser": "In the public sector, accessibility isn't optional. Notes from practice.",
    "color": "#14532D",
    "body": [
      "Accessibility isn't an audit at the end but a decision at the start: semantic HTML, focus order, contrast — before the first component exists.",
      "The surprise: what's built for screen readers gets better for everyone. Keyboard navigation uncovers UX flaws that mouse users only sense subconsciously. (Draft)"
    ],
    "pinned": false,
    "draft": true
  },
  {
    "id": "a5",
    "kat": "REACT",
    "datum": "03/2026",
    "titel": "React Server Components in a real project — worth the rebuild?",
    "teaser": "RSC sounds great. But does the gain justify the migration cost?",
    "color": "#153B50",
    "body": [
      "Server Components solve a real problem: loading data where it lives. But rebuilding a grown project isn't a refactor — it's an architecture change.",
      "My rule of thumb: new projects yes, existing projects only if there's a real payload problem. (Draft — measurements to follow.)"
    ],
    "pinned": false,
    "draft": true
  },
  {
    "id": "a6",
    "kat": "TYPESCRIPT",
    "datum": "02/2026",
    "titel": "TypeScript strict: the five flags that really hurt",
    "teaser": "strict: true is easy to say — and then noExplicitAny hits the legacy code.",
    "color": "#1E3A6E",
    "body": [
      "strictNullChecks finds real bugs, noImplicitAny finds laziness, exactOptionalPropertyTypes finds team debates.",
      "The path for legacy projects: flag by flag, folder by folder — never all at once. (Draft)"
    ],
    "pinned": false,
    "draft": true
  },
  {
    "id": "a7",
    "kat": "FRONTEND",
    "datum": "02/2026",
    "titel": "View Transitions: page changes like in native apps",
    "teaser": "The View Transition API turns navigations into animations — almost for free.",
    "color": "#3B2A6E",
    "body": [
      "startViewTransition is the biggest UX improvement in years: elements morph between pages instead of hard-cutting — this very website uses exactly that.",
      "Pitfalls: view-transition-name + backdrop-filter only partly get along in Chromium. A chapter of its own. (Draft)"
    ],
    "pinned": false,
    "draft": true
  },
  {
    "id": "a8",
    "kat": "CSS",
    "datum": "01/2026",
    "titel": "Liquid Glass in CSS — what works, what's marketing",
    "teaser": "Recreating Apple's glass look: backdrop-filter can do a lot, but not everything.",
    "color": "#0F4C5C",
    "body": [
      "Frost, saturation, edge highlights: all doable. Real refraction (displacement) is only possible with SVG filters — and backdrop-filter still doesn't render those.",
      "The practical trick: masked edge rings with their own backdrop-filter as a sibling layer. (Draft with code examples from this relaunch.)"
    ],
    "pinned": false,
    "draft": true
  },
  {
    "id": "a9",
    "kat": "TOOLING",
    "datum": "01/2026",
    "titel": "Learning Rust as a JS developer: week one, honestly",
    "teaser": "The borrow checker and me — a relationship with a rocky start.",
    "color": "#6E2A1B",
    "body": [
      "After 18 years of dynamic languages, Rust feels like driving lessons after years on a bike: everything deliberate, everything explicit, everything correct.",
      "But: cargo is the best tooling experience in a long time, and the error messages teach better than any tutorial. (Draft)"
    ],
    "pinned": false,
    "draft": true
  },
  {
    "id": "a10",
    "kat": "TOOLING",
    "datum": "12/2025",
    "titel": "Tauri 2 instead of Electron? A field report",
    "teaser": "Desktop apps with a web stack — just 10 MB instead of 150 MB.",
    "color": "#4A2617",
    "body": [
      "Tauri 2 gets a lot right: small binaries, a real OS WebView, a Rust backend with a clean IPC boundary. Mobile support is the game changer.",
      "To be honest: the ecosystem is younger than Electron's, and if you need native Node modules, you're stuck. (Draft)"
    ],
    "pinned": false,
    "draft": true
  },
  {
    "id": "a11",
    "kat": "TOOLING",
    "datum": "11/2025",
    "titel": "Turborepo day to day: a monorepo without headaches",
    "teaser": "Remote caching and task pipelines — what really sticks after setup.",
    "color": "#1F2937",
    "body": [
      "The promise holds: builds someone has already built, nobody builds again. A cache hit is the best feeling of the workday.",
      "The real work is discipline at the package.json boundaries — Turborepo just makes sloppiness visible faster. (Draft)"
    ],
    "pinned": false,
    "draft": true
  },
  {
    "id": "a12",
    "kat": "MOBILE",
    "datum": "10/2025",
    "titel": "React Native: migrating to the New Architecture without drama",
    "teaser": "Fabric, TurboModules, Bridgeless — migrating a real app.",
    "color": "#0D3B66",
    "body": [
      "The key was order: update dependencies first, then feature flags, then measure. Not the other way around.",
      "Result: noticeably smoother lists, but the real win is a clean dependency state. (Draft — from my work on media and community apps.)"
    ],
    "pinned": false,
    "draft": true
  },
  {
    "id": "a13",
    "kat": "BACKEND",
    "datum": "09/2025",
    "titel": "GraphQL or REST? The wrong question",
    "teaser": "The right question: who owns the schema — and who suffers when it changes?",
    "color": "#5B2A86",
    "body": [
      "GraphQL shines when many clients need different views. REST shines when caching and simplicity rule. Both at once is rarely the answer.",
      "My experience from media projects: the schema is a contract — whoever breaks it pays. No matter the paradigm. (Draft)"
    ],
    "pinned": false,
    "draft": true
  },
  {
    "id": "a14",
    "kat": "TESTING",
    "datum": "08/2025",
    "titel": "Out with Jest, in with Vitest? An honest look at the testing stack",
    "teaser": "Faster, yes — but migration has hidden costs.",
    "color": "#065F46",
    "body": [
      "Vitest feels like Jest after three espressos: same API, half the wait. For Vite projects, a no-brainer.",
      "But: snapshots, mocks and CI setups don't come along for free. If you migrate, do it in one go. (Draft)"
    ],
    "pinned": false,
    "draft": true
  },
  {
    "id": "a15",
    "kat": "CSS",
    "datum": "07/2025",
    "titel": "Styled-Components after the hype: maintenance instead of magic",
    "teaser": "CSS-in-JS is aging. What I'd do differently today.",
    "color": "#831843",
    "body": [
      "Styled-Components taught us to think in components — and left us with runtime costs. The trend is clearly toward zero-runtime.",
      "Where I stand for now: new work with CSS variables + a utility approach, and no panicked rewrites of existing code. (Draft)"
    ],
    "pinned": false,
    "draft": true
  },
  {
    "id": "a16",
    "kat": "REACT",
    "datum": "06/2025",
    "titel": "Next.js App Router: three patterns that stuck",
    "teaser": "After the experimenting: what has proven itself day to day.",
    "color": "#111827",
    "body": [
      "First: think of layouts as data boundaries. Second: Server Actions for forms, nothing else. Third: Client Components as leaves, never as roots.",
      "Everything else was a fad for me — these three hold up. (Draft)"
    ],
    "pinned": false,
    "draft": true
  },
  {
    "id": "a17",
    "kat": "WEB",
    "datum": "05/2025",
    "titel": "Why I still have DevTools open every single day",
    "teaser": "No framework replaces understanding what the browser really does.",
    "color": "#92400E",
    "body": [
      "Performance tab, Layers, Coverage: the best bug fixes of recent years didn't start in the editor but in the profiler.",
      "If you only think in frameworks, you debug symptoms. The browser shows causes. (Draft)"
    ],
    "pinned": false,
    "draft": true
  },
  {
    "id": "a18",
    "kat": "TRAINING",
    "datum": "04/2025",
    "titel": "Onboarding apprentices: the first week decides",
    "teaser": "No HelloWorld — a real ticket on day three.",
    "color": "#9A3412",
    "body": [
      "Nothing is more demotivating than exercises nobody needs. My approach: a small real ticket, a real review, a real deployment — in week one.",
      "The fear of breaking something only goes away once you've experienced that broken things can be fixed. (Draft)"
    ],
    "pinned": false,
    "draft": true
  },
  {
    "id": "a19",
    "kat": "CAREER",
    "datum": "03/2025",
    "titel": "From ActionScript to TypeScript: what Flash taught me",
    "teaser": "The timeline is dead; thinking in states lives on.",
    "color": "#7F1D1D",
    "body": [
      "Flash was sandbox, stage and IDE all at once. Anyone who built interfaces there learned state machines before the term existed in frontend.",
      "ActionScript 3 was my first typed JavaScript — in 2015, TypeScript felt like coming home. (Draft)"
    ],
    "pinned": false,
    "draft": true
  },
  {
    "id": "a20",
    "kat": "TEAM",
    "datum": "02/2025",
    "titel": "Code reviews nobody hates",
    "teaser": "Reviews are communication, not a courtroom. A few rules.",
    "color": "#334155",
    "body": [
      "Rule one: never \"why did you…\", always \"what do you think about…\". Rule two: mark nits as nits. Rule three: praise is part of the review.",
      "And the most important one: big PRs are a planning mistake, not a review problem. (Draft)"
    ],
    "pinned": false,
    "draft": true
  },
  {
    "id": "a21",
    "kat": "WEB",
    "datum": "01/2025",
    "titel": "Mobile First is dead, long live Content First",
    "teaser": "Breakpoints follow the content — not device classes from 2012.",
    "color": "#0E7490",
    "body": [
      "I've been building mobile versions since 2010 — back then for MySwitzerland, today responsive by default. The device classes of that era no longer exist.",
      "What remains: the content decides when a layout breaks. Container queries finally make that formal. (Draft)"
    ],
    "pinned": false,
    "draft": true
  },
  {
    "id": "a22",
    "kat": "AI",
    "datum": "12/2024",
    "titel": "AI pair programming: prompts are the new refactoring",
    "teaser": "Describe it badly, get bad code — faster than ever before.",
    "color": "#4C1D95",
    "body": [
      "The quality of generated code mirrors the quality of the requirement. AI punishes vague tickets mercilessly — and rewards clear architectural guidelines.",
      "My workflow: first the target picture in prose, then interfaces, then let it generate. Never the other way around. (Draft)"
    ],
    "pinned": false,
    "draft": true
  },
  {
    "id": "a23",
    "kat": "CAREER",
    "datum": "11/2024",
    "titel": "18 years of web development: what stays, what goes",
    "teaser": "Technologies rotate, principles remain. Taking stock.",
    "color": "#F2E8D5",
    "body": [
      "Gone: Flash, jQuery, Bower, CoffeeScript, three CSS methodologies and what feels like ten build tools. Still here: HTTP, HTML, curiosity.",
      "The most honest insight: maintainability beats elegance. Every time. (Draft)"
    ],
    "pinned": false,
    "draft": true
  }
];

export const articleById = (id: string) => ARTICLES.find((a) => a.id === id);
export const pinnedArticles = () => ARTICLES.filter((a) => a.pinned);
