/* Trailer — Fakten und Texte (DE/EN). Quellen (geprüft 21. und 22.11.2026):
   - Angaben von Bjoern Sellnau (Rückmeldungen vom 21. und 22.11.2026): Laufbahn, Projektliste, altes Logo — sie gehen den
     Website-Inhalten vor, wo sich beides widerspricht
   - ld-evo, Branch master: content/home.ts, about.ts, journey.ts, projects.ts und content/en/* (Wortlaut),
     src/site/i18n/dict.ts (Zähler-Zeile), src/site/pages/HalloPage.tsx (18+ Jahre, 10 Zertifikate, Berlin & Remote)
   - Brand-System 2026-10 (docs/design_handoff_loona_brand/README.md): Wortmarke, Unterzeile, Schreibweise „Bjoern Sellnau“
   - Logo-Handoff v1.0 (Produktfamilie: LD Flow, LD Nova, LD Buddy, LD Ivy mit Unterzeilen)
   - Best of Swiss Web 2017: wie im README dieses Branches belegt (Gewinnerlisten; Gold, Kategorie Mobile)
   - SPREE|FALL: Repo ld-spreefall (README, Screenshots), Kartendaten © OpenStreetMap-Mitwirkende
   Nichts davon ist geschätzt; Kennzahlen stammen aus den Inhalten (10 Zertifikate) und aus der Projektliste (21 Projekte). */
'use strict';
const NAME = 'Bjoern Sellnau';
const ROLE = 'Senior Fullstack & Software Engineer';
const FOCUS = ['React', 'Mobile', 'TypeScript'];
const CLAIM = ['What the web', 'can be.'];
const LINKS = ['loona-designs.de', 'linkedin.com/in/bjoern-sellnau', 'github.com/bjoern-sellnau'];
/* Sekunden seit 01.09.2007, 09:00 (MESZ) bis 22.11.2026, 12:00 (MEZ) — wie der Zähler der Website */
const SEC0 = (Date.UTC(2026, 10, 22, 11, 0, 0) - Date.UTC(2007, 8, 1, 7, 0, 0)) / 1000;

const STACK_ROWS = [
  ['React', 'React Hooks', 'Next.js', 'React Native', 'Styled-Components', 'Redux', 'Webpack'],
  ['TypeScript', 'JavaScript', 'HTML5', 'CSS3', 'JSON', 'XML', 'Jest', 'React Testing Library'],
  ['Node', 'GraphQL', 'MongoDB', 'MySQL', 'Postgres', 'CouchDB', 'ColdFusion', 'PHP'],
];
const STACK_FOCUS = ['React', 'Next.js', 'TypeScript', 'React Native'];
const STACK_NEXT = ['Rust', 'Tauri 2', 'Turborepo', 'Tailwind + Twin'];

const JOURNEY = [
  /* Stationen und Etappen: Angaben von Bjoern Sellnau (21. und 22.11.2026) gehen den Website-Inhalten vor, wo sie sich widersprechen:
     Ausbildung 2000 – 2002; vor 2007 keine Kundenprojekte (nie Geld damit verdient); ab 09/2007 angestellt bei PIXELTEX (Hannover),
     Umzug der Agentur nach Berlin 11/2011; Mys Mobile: 01–09/2016 Beratung und Anbieterauswahl, 11/2016 übernommen, Award 2017;
     Ende PIXELTEX 04/2020; Code-b ab 05/2020 (The Pioneer Website bis 2021, BMW Neuwagensuche 2022 – 06/2023 als Teamleiter und
     Tech Lead, The Pioneer App 07–12/2023, Tabletop Herald 2024 – 04/2025, The Pioneer 04/2025 – 01/2026); Materna seit 05/2026;
     KI seit 03/2026; LD Beyond. kommt 2027. Titel und übrige Kurztexte wie in content/journey.ts. */
  { y: '2000', de: ['Die Ausbildung', 'Technischer Assistent für Informatik', '2000 – 2002', 'Hier verfestigt sich die Begeisterung fürs Web — Abschluss im Juni 2002.'], en: ['The training', 'Technical assistant for computer science', '2000 – 2002', 'This is where the enthusiasm for the web takes hold — graduation in June 2002.'], st: { de: ['Loona! Designs: Plattform seit 2001', 'Abschluss 06/2002 (ITA)', '2002/03: erste Websites und ein Flash-Spiel'], en: ['Loona! Designs: platform since 2001', 'Graduated 06/2002 (ITA)', '2002/03: first websites and a Flash game'] } },
  { y: '2004', de: ['Erste Pixel im Netz', 'Flash & ActionScript', 'Loona! Designs', 'Flash-Intros, Pixel-Buttons und die Erkenntnis: Das Web ist meine Bühne.'], en: ['First pixels on the web', 'Flash & ActionScript', 'Loona! Designs', 'Flash intros, pixel buttons and the realization: the web is my stage.'], st: { de: ['Erste eigene Site online', 'Flash-Games & Experimente', 'Websites & Shops als freie Projekte — unbezahlt'], en: ['First own site online', 'Flash games & experiments', 'Websites & shops as personal projects — unpaid'] } },
  { y: '2007', de: ['PIXELTEX: Der Profi-Start', 'Web Engineer', 'PIXELTEX GmbH', 'Vom Hobby zum Beruf: ab September 2007 angestellt bei PIXELTEX in Hannover — CMS, ColdFusion, und Gadmin wächst.'], en: ['PIXELTEX: Going pro', 'Web Engineer', 'PIXELTEX GmbH', 'From hobby to profession: employed at PIXELTEX in Hannover from September 2007 — CMS, ColdFusion, and Gadmin grows.'], st: { de: ['09/2007: Start bei PIXELTEX in Hannover', 'Gadmin 4.0 — CMS Schweizer Tourismus', '11/2011: Umzug der Agentur nach Berlin'], en: ['09/2007: joined PIXELTEX in Hannover', 'Gadmin 4.0 — CMS for Switzerland Tourism', '11/2011: the agency moves to Berlin'] } },
  { y: '2010', de: ['Mobile, bevor es cool war', 'Mobile Web', 'MySwitzerland', 'Mys Mobile 2010: Schweiz Tourismus in der Hosentasche — XHTML, winzige Screens, große Wirkung.'], en: ['Mobile before it was cool', 'Mobile Web', 'MySwitzerland', 'Mys Mobile 2010: Switzerland Tourism in your pocket — XHTML, tiny screens, big impact.'], st: { de: ['Mys Mobile 2010 live', 'Sechs Jahre im Einsatz'], en: ['Mys Mobile 2010 live', 'Six years in service'] } },
  { y: '2016', de: ['Lead: OpenBooking', 'Lead Frontend & Mobile', 'OpenBooking AG', 'Hotel-Meta-Suche: Architektur, Frontend, Mobile — ab 2016 als Lead Developer.'], en: ['Lead: OpenBooking', 'Lead Frontend & Mobile', 'OpenBooking AG', 'Hotel meta search: architecture, frontend, mobile — as lead developer from 2016.'], st: { de: ['01–09/2016: Beratung & Anbieterauswahl (Mys Mobile)', '11/2016: Mys Mobile übernommen', '04/2017: Best of Swiss Web Award — Gold'], en: ['01–09/2016: consulting & vendor selection (Mys Mobile)', '11/2016: took over Mys Mobile', '04/2017: Best of Swiss Web Award — Gold'] } },
  { y: '2019', de: ['Ausbilder nach AEVO', 'IT-Ausbilder (IHK)', 'PIXELTEX GmbH', 'Wissen weitergeben wird offiziell: Ausbilderschein und der erste eigene Azubi.'], en: ['Certified trainer (AEVO)', 'IT trainer (IHK)', 'PIXELTEX GmbH', 'Passing on knowledge becomes official: trainer certificate and my first apprentice.'], st: { de: ['AEVO-Schein — IHK Berlin', 'Erster eigener Azubi', '04/2020: Ende der PIXELTEX-Ära'], en: ['AEVO certificate — IHK Berlin', 'My first apprentice', '04/2020: end of the PIXELTEX era'] } },
  { y: '2020', de: ['React im Produkt-Takt', 'Software Engineer — React', 'Code-b', 'The Pioneer mit Next.js, GraphQL, TypeScript und Node — danach die BMW Neuwagensuche.'], en: ['React at product pace', 'Software Engineer — React', 'Code-b', 'The Pioneer with Next.js, GraphQL, TypeScript and Node — then the BMW new-car search.'], st: { de: ['05/2020: Start bei Code-b — The Pioneer Website (bis 2021)', '2022 – 06/2023: BMW Neuwagensuche', 'Teamleiter (03–09/2022), dann Tech Lead (bis 06/2023)'], en: ['05/2020: joined Code-b — The Pioneer website (until 2021)', '2022 – 06/2023: BMW new-car search', 'Team lead (03–09/2022), then tech lead (until 06/2023)'] } },
  { y: '2023', de: ['Apps, die bleiben', 'React Native Engineer', 'The Pioneer', 'The Pioneer App und Tabletop Herald mit React Native — dazu die Websites mit Next.js.'], en: ['Apps that last', 'React Native Engineer', 'The Pioneer', 'The Pioneer App and Tabletop Herald with React Native — plus the websites with Next.js.'], st: { de: ['07–12/2023: The Pioneer App (React Native, GraphQL)', '2024 – 04/2025: Tabletop Herald — Website & Mobile App', '04/2025 – 01/2026: The Pioneer App & Website'], en: ['07–12/2023: The Pioneer App (React Native, GraphQL)', '2024 – 04/2025: Tabletop Herald — website & mobile app', '04/2025 – 01/2026: The Pioneer App & website'] } },
  { y: '2026', de: ['Materna & die neue Loona!', 'Software Developer', 'Materna SE', 'Public Sector, E-Government, Zoll — seit Mai 2026 bei Materna. 2027 kommt LD Beyond.'], en: ['Materna & the new Loona!', 'Software Developer', 'Materna SE', 'Public sector, e-government, customs — at Materna since May 2026. LD Beyond. arrives in 2027.'], st: { de: ['Seit 03/2026: KI — Claude Code, Gemini mit Antigravity, Claude Design', 'Seit 05/2026: Materna', '2027: LD Beyond. — Loona! Designs Beyond.'], en: ['Since 03/2026: AI — Claude Code, Gemini with Antigravity, Claude Design', 'Since 05/2026: Materna', '2027: LD Beyond. — Loona! Designs Beyond.'] } },
];
/* Auswahl für die 60-s-Fassung */
const JOURNEY_SHORT = ['2004', '2007', '2016', '2020', '2026'];

const ORIGIN = [
  { y: '2004', img: 'yayci', de: ['Computer Handel Yayci', 'Onlineshop'], en: ['Computer Handel Yayci', 'Online shop'] },
  { y: '2005', img: 'catt', de: ['CATT Service', 'Website'], en: ['CATT Service', 'Website'] },
  { y: '2005', img: 'hanno', de: ['Hannoback', 'Website mit MiniCMS'], en: ['Hannoback', 'Website with MiniCMS'] },
  { y: '2006', img: 'ld2006', de: ['Loona! Designs „ld2006“', 'Eigenprojekt'], en: ['Loona! Designs ‘ld2006’', 'Personal project'] },
  { y: '2006', img: 'cattshop', de: ['CATT Shop + CMS', 'Entwurf'], en: ['CATT Shop + CMS', 'Concept'] },
  { y: '2006', img: 'fahrschule', de: ['Fahrschule (fiktiv)', 'Entwurf'], en: ['Driving School (fictional)', 'Concept'] },
];

const CERTS = [
  { d: '03/2026', de: 'Introduction to Agent Skills', en: 'Introduction to Agent Skills', by: 'Anthropic' },
  { d: '03/2026', de: 'Claude Code in Action', en: 'Claude Code in Action', by: 'Anthropic' },
  { d: '11/2025', de: 'KI-Spezialist im Unternehmen', en: 'AI Specialist in the Enterprise', by: 'Scaly Academy' },
  { d: '12/2024', de: 'Stripe Certified Professional Developer', en: 'Stripe Certified Professional Developer', by: 'Stripe' },
  { d: '12/2024', de: 'Stripe Certified Billing Developer', en: 'Stripe Certified Billing Developer', by: 'Stripe' },
  { d: '12/2024', de: 'Stripe Certified Associate Developer', en: 'Stripe Certified Associate Developer', by: 'Stripe' },
  { d: '03/2019', de: 'Ausbilder nach AEVO — Fachinformatiker Anwendungsentwicklung', en: 'Certified Trainer (AEVO) — IT Specialist, Application Development', by: 'IHK Berlin' },
  { d: '08/2015', de: 'StrongLoop Certified Node Developer (SCND)', en: 'StrongLoop Certified Node Developer (SCND)', by: 'StrongLoop by IBM' },
  { d: '06/2010', de: 'Adobe Certified Expert — Advanced ColdFusion 8', en: 'Adobe Certified Expert — Advanced ColdFusion 8', by: 'Adobe' },
  { d: '06/2002', de: 'Staatl. gepr. Technischer Assistent für Informatik (ITA)', en: 'State-Certified Technical Assistant for Computer Science (ITA)', by: 'Ausbildung', byEn: 'Vocational training' },
];

const LABS = [
  { id: 'corefall', name: 'Corefall', d: '05/2026', shots: ['cfTitle', 'cf00', 'cf13', 'cf15', 'cf18'], de: ['Spiel', '6D-Shooter à la Descent — volle Bewegungsfreiheit, Retro-Seele, moderner Stack.'], en: ['Game', 'A 6DoF shooter in the vein of Descent — full freedom of movement, retro soul, modern stack.'] },
  { id: 'covert', name: 'Covert Operations', d: '04/2026', shots: ['coP1', 'coP2', 'coP3', 'coP4', 'coP5', 'coP6', 'coP7', 'coModes'], /* Spielszenen (Top-Down, Ego-Sicht, ISO), lokal aus dem Repo aufgenommen; das Menü zum Schluss */ de: ['Spiel', 'Top-Down-, ISO- und FPS-Shooter in einem — ein Spielfeld, viele Perspektiven.'], en: ['Game', 'Top-down, iso and FPS shooter in one — one playing field, many perspectives.'] },
  { id: 'spreefall', name: 'SPREE\u2009|\u2009FALL', d: '2026', shots: ['sfTitle', 'sfGate', 'sfTower', 'sfReichstag', 'sfSpree', 'sfNight'], credit: true, de: ['Spiel', 'Open-World-Shooter in Berlin — aus OpenStreetMap generiert, eigener WebGL2-Renderer.'], en: ['Game', 'Open-world shooter in Berlin — generated from OpenStreetMap, custom WebGL2 renderer.'] },
];
/* Projektliste nach Angaben von Bjoern Sellnau (22.11.2026) — 21 Projekte seit 03/2026; die Website führt davon bisher zwölf */
const LABS_MORE = ['COE', 'Covert Operations Arena', 'Death Grid 3D', 'Xenon-6', 'Descent Bullettime', 'Quarry', 'COI', 'Command & Conquest', 'Trance Maker', 'LD Buddy', 'LD Notch Buddy', 'LD Finder Buddy', 'LD Docker Buddy', 'LD MyRoom', 'LD Evergreen / Ivy', 'LD WorkBench', 'LD Evo', 'LD Beyond.'];
const LABS_COUNT = 21;

/* ---------- nur lange Fassung (300 s) ---------- */
/* Schwerpunkte der Startseite (content/home.ts, bxFocus) */
const FOCUS_AREAS = [
  { icon: '</>', de: ['Frontend Engineering', 'Oberflächen mit React, Next.js, TypeScript und React Native — barrierearm und wartbar. Davor: ColdFusion und Flash.'], en: ['Frontend engineering', 'Interfaces with React, Next.js, TypeScript and React Native — accessible and maintainable. Before that: ColdFusion and Flash.'] },
  { icon: '✦', de: ['KI-gestützte Entwicklung', 'Claude Code, Agent Skills und Co.: Was funktioniert, wo sind die Grenzen? Die Antworten landen in den Labs.'], en: ['AI-assisted development', 'Claude Code, Agent Skills and co.: what works, where are the limits? The answers end up in the Labs.'] },
  { icon: '↗', de: ['Wissen weitergeben', 'Seit März 2019 Ausbilder nach AEVO für Fachinformatiker in der Anwendungsentwicklung.'], en: ['Passing on knowledge', 'Since March 2019 a certified trainer (AEVO) for IT specialists in application development.'] },
];
/* Werkliste in zwei Spalten (Jahr, Kürzel, Farbe, Name DE, Name EN, Art DE, Art EN). Links die freien Projekte — vor 2007 gab es
   keine Kundenprojekte (Angabe 22.11.2026); Namen, Jahre und Farben aus content/projects.ts. Rechts die Stationen im Beruf nach den
   Angaben vom 22.11.2026 (Kacheln ohne eigene Projektfarbe in neutralem Ton). */
const WORKS = {
  frei: [
    ['2002', 'RE', '#334155', 'RA Egermann', 'RA Egermann', 'Website', 'Website'],
    ['2003', 'CO', '#166534', 'Covert Operations Tournament', 'Covert Operations Tournament', 'Flash-5-Spiel', 'Flash 5 game'],
    ['2004', 'YA', '#1D4ED8', 'Computer Handel Yayci', 'Computer Handel Yayci', 'Onlineshop', 'Online shop'],
    ['2005', 'CT', '#6D28D9', 'CATT Service', 'CATT Service', 'Website', 'Website'],
    ['2005', 'HB', '#92400E', 'Hannoback', 'Hannoback', 'Website mit MiniCMS', 'Website with MiniCMS'],
    ['2006', '06', '#9A3412', 'Loona! Designs „ld2006“', 'Loona! Designs ‘ld2006’', 'Eigene Website', 'Own website'],
    ['2006', 'CS', '#5B21B6', 'CATT Shop + CMS', 'CATT Shop + CMS', 'Entwurf', 'Concept'],
    ['2011–16', '16', '#0E7490', 'DesignUpdates', 'DesignUpdates', 'Redesigns der eigenen Website', 'Redesigns of my own site'],
  ],
  beruf: [
    ['2007', 'GA', '#3F3B34', 'Gadmin 4.0', 'Gadmin 4.0', 'CMS · PIXELTEX', 'CMS · PIXELTEX'],
    ['2010', 'MY', '#3F3B34', 'Mys Mobile', 'Mys Mobile', 'Mobile Web · Schweiz Tourismus', 'Mobile web · Switzerland Tourism'],
    ['2016–17', 'MY', '#3F3B34', 'Relaunch Mys Mobile', 'Mys Mobile relaunch', 'Gold · Best of Swiss Web 2017', 'Gold · Best of Swiss Web 2017'],
    ['2016–20', 'OB', '#1E3A5F', 'OpenBooking', 'OpenBooking', 'Lead Frontend & Mobile', 'Lead frontend & mobile'],
    ['2020–21', 'TP', '#3F3B34', 'The Pioneer Website', 'The Pioneer website', 'Next.js, GraphQL · Code-b', 'Next.js, GraphQL · Code-b'],
    ['2022–23', 'BM', '#3F3B34', 'BMW Neuwagensuche', 'BMW new-car search', 'Teamleiter, dann Tech Lead', 'Team lead, then tech lead'],
    ['2023–26', 'TP', '#3F3B34', 'The Pioneer App', 'The Pioneer App', 'React Native, GraphQL', 'React Native, GraphQL'],
    ['2024–25', 'TH', '#3F3B34', 'Tabletop Herald', 'Tabletop Herald', 'Website & Mobile App', 'Website & mobile app'],
    ['2026', 'EG', '#0F2137', 'E-Government & Zoll', 'E-Government & Customs', 'Materna · seit 05/2026', 'Materna · since 05/2026'],
  ],
};
/* Alle 21 Labs (Kürzel, Farbe, Name, Art DE, Art EN). Farbe aus content/projects.ts bzw. dem Logo-Handoff (LD Ivy), wo es eine gibt —
   sonst neutral. Beschreibungen nach den Angaben vom 22.11.2026. */
const LABS_ALL = [
  ['LB', '#BE185D', 'LD Buddy', 'Alltags-App mit Thin Clients', 'Everyday app with thin clients'],
  ['CO', '#14532D', 'COE', 'Game Engine · 16+ Modi', 'Game engine · 16+ modes'],
  ['NB', '#9D174D', 'LD Notch Buddy', 'Mac-App an der Notch', 'Mac app at the notch'],
  ['FB', '#2B2723', 'LD Finder Buddy', 'Finder-Favoriten', 'Finder favourites'],
  ['DB', '#2B2723', 'LD Docker Buddy', 'Docker-Helfer', 'Docker helper'],
  ['MR', '#2B2723', 'LD MyRoom', 'Raumplanung', 'Room planning'],
  ['IV', '#3DDC84', 'LD Evergreen / Ivy', 'App bei Fibro & Rheuma', 'App for fibro & rheumatism'],
  ['CO', '#14532D', 'Covert Operations', 'Top-Down, ISO, First Person', 'Top-down, iso, first person'],
  ['CA', '#7F1D1D', 'Covert Operations Arena', 'Arena-Shooter', 'Arena shooter'],
  ['CF', '#C2410C', 'Core Fall', '360°-Shooter à la Descent', 'Descent-like 360° shooter'],
  ['DG', '#18181B', 'Death Grid 3D', 'Retro-Arcade-Shooter', 'Retro arcade shooter'],
  ['SF', '#2B2723', 'Spree Fall', 'Shooter in Berlin · OSM', 'Shooter in Berlin · OSM'],
  ['X6', '#2B2723', 'Xenon-6', 'À la Descent · Antigravity', 'Descent-like · Antigravity'],
  ['BT', '#2B2723', 'Descent Bullettime', 'Shooter mit Bullet-Time', 'Bullet-time shooter'],
  ['QU', '#2B2723', 'Quarry', 'Shooter à la Descent', 'Descent-like shooter'],
  ['CI', '#2B2723', 'COI', 'Covert Operations Instincts', 'Covert Operations Instincts'],
  ['CC', '#2B2723', 'Command & Conquest', 'Echtzeit-Strategie', 'Real-time strategy'],
  ['TM', '#2B2723', 'Trance Maker', 'Musikprogramm', 'Music app'],
  ['WB', '#B45309', 'LD WorkBench', 'Zeiterfassung & Tasks', 'Time tracking & tasks'],
  ['EV', '#2B2723', 'LD Evo', 'Prototyp für LD Beyond.', 'Prototype for LD Beyond.'],
  ['LB', '#6D28D9', 'LD Beyond.', 'Die neue Website · 2027', 'The new website · 2027'],
];
/* Kennzahlen nach den Angaben vom 22.11.2026: Projekte, Start, Spielmodi der COE, KI-Werkzeuge (Claude Code, Gemini mit Antigravity, Claude Design) */
const LAB_STATS = ['21', '03/2026', '16+', '3'];
/* Zitate aus den Lab-Einträgen (content/projects.ts, Feld „zitat“) */
const QUOTES = [
  { de: 'Eine Spiellogik, drei Kameras — Architektur zahlt sich in Perspektiven aus.', en: 'One game logic, three cameras — architecture pays off in perspectives.', by: 'Covert Operations' },
  { de: 'Die eigene Website ist das ehrlichste Projekt: kein Kunde, keine Ausreden.', en: 'Your own website is the most honest project: no client, no excuses.', by: 'Neue Webseite', byEn: 'New Website' },
];
/* Hero-Animationen der neuen Website (Namen aus SettingsPanel.tsx und hero/extra/meta.ts); Bildfolgen aus den Aufnahmen von Reel 3 */
const HERO = [['aurora', 'Aurora'], ['blackhole', 'Blackhole'], ['galaxy', 'Galaxie', 'Galaxy'], ['nova', 'Supernova'], ['ocean', 'Ozeanwellen', 'Ocean waves'], ['plasma', 'Plasma'], ['kaleido', 'Kaleidoskop', 'Kaleidoscope'], ['fireworks', 'Feuerwerk', 'Fireworks'], ['tunnel', 'Hypertunnel'], ['metal', 'Flüssigmetall', 'Liquid metal'], ['prism', 'Prisma', 'Prism'], ['storm2', 'Blitzgewitter', 'Thunderstorm'], ['aurum', 'Aurum'], ['viola', 'Viola']];
const HERO_FRAMES = 12;

const FAMILY = [
  { key: 'flow', name: 'LD Flow.', tag: 'cms' },
  { key: 'nova', name: 'LD Nova.', tag: 'design system' },
  { key: 'buddy', name: 'LD Buddy.', tag: 'app' },
  { key: 'ivy', name: 'LD Ivy.', tag: 'evergreen' },
];

const TXT = {
  de: {
    claimKicker: 'Plattform & Online-Portfolio · seit 2001',
    claimSub: ['Das Web.', 'Meine Leidenschaft.'],
    personKicker: 'Wer dahinter steckt',
    roles: ['Senior React Engineer', 'React Native Engineer', 'Senior Node Engineer', 'IT-Ausbilder (AEVO)'],
    place: 'Berlin',
    secLabel: 'Sekunden im Dienst des Webs — läuft seit September 2007.',
    stats: [['18+', 'Jahre'], ['10', 'Zertifikate'], ['Berlin', '& Remote']],
    originKicker: '2004 – 2006 · Anfänge · freie Projekte',
    originTitle: ['Vom Flash-Kid zum Senior Engineer —', 'ohne die Neugier zu verlieren.'],
    stackKicker: 'Technologien',
    stackTitle: ['Mein Fokus:', 'React, Next.js, TypeScript, React Native.'],
    stackNext: 'Gerade dabei',
    journeyKicker: 'Die Reise',
    awardKicker: 'Auszeichnung',
    awardTop: 'Best of Swiss Web 2017',
    awardCat: 'Kategorie Mobile',
    awardWhat: 'Relaunch Mobile MySwitzerland.com',
    awardNote: 'Technik vorgegeben 2016 · Projekt übernommen 11/2016',
    labsKicker: 'Labs · seit 03/2026',
    labsTitle: ['Experimente in Arbeit —', 'zuschauen erlaubt.'], // Wortlaut der Labs-Seite (dict.ts, catalog.labsTitle)
    labsMore: 'Außerdem',
    labsCount: 'Labs',
    osm: 'Kartendaten © OpenStreetMap-Mitwirkende',
    siteKicker: 'LD Beyond. · 2027',
    siteTitle: ['Das neue', 'Loona! Designs.'], // Wortlaut nach Rückmeldung vom 22.11.2026
    /* Die Features sind kein Baukasten für Besucher: Bjoern Sellnau legt fest, was läuft — sie zeigen, was möglich ist (Rückmeldung 22.11.2026) */
    siteDesc: 'Loona! Designs Beyond. kommt 2027 — mit dem CMS LD Flow. Story-Seiten, Hero-Animationen, Liquid Glass und Widgets zeigen, was möglich ist.',
    siteChips: ['LD Flow CMS', 'Story-Seiten', 'Liquid Glass', 'DE / EN', 'Widgets', '70+ Hero-Animationen'],
    familyKicker: 'Produktfamilie',
    certsKicker: 'Weiterbildung',
    certsTitle: ['10', 'Zertifikate.'],
    focusKicker: 'Schwerpunkte',
    focusTitle: ['Woran ich', 'arbeite.'],
    worksKicker: 'Projekte · 2002 – heute',
    worksTitle: ['Von den ersten Websites', 'bis E-Government.'],
    worksCols: ['Freie Projekte · unbezahlt', 'Im Beruf · seit 09/2007'],
    labsAllKicker: 'Labs in Zahlen',
    labsAllTitle: ['21 Labs', 'seit 03/2026.'],
    labStatLabels: ['Projekte', 'Seit', 'Spielmodi in COE', 'KI-Werkzeuge'],
    heroKicker: '70+ Hero-Animationen',
    heroTitle: ['Sie zeigen,', 'was möglich ist.'],
    quoteKicker: 'Aus den Labs',
    outroSub: ['Das Web.', 'Meine Leidenschaft.'],
    /* Lauftext der Demoszene-Fassung (nur belegte Angaben; „+++“ trennt wie in alten Demos) */
    scroller: 'LOONA! DESIGNS +++ BJOERN SELLNAU +++ SENIOR FULLSTACK & SOFTWARE ENGINEER +++ REACT · NEXT.JS · TYPESCRIPT · REACT NATIVE +++ IM NETZ SEIT 2001 +++ GOLD: BEST OF SWISS WEB 2017 +++ 21 LABS SEIT 03/2026 +++ DIESER TRAILER LAEUFT IM BROWSER: CANVAS UND WEB AUDIO, MUSIK OHNE SAMPLES +++ LOONA-DESIGNS.DE +++ ',
    chapters: { logo: 'Auftakt', claim: 'Anspruch', person: 'Person', origin: 'Anfänge', stack: 'Stack', journey: 'Reise', award: 'Gold', labs: 'Labs', site: 'Plattform', family: 'Familie', certs: 'Zertifikate', outro: 'Kontakt', focus: 'Schwerpunkte', works: 'Projekte', labsAll: 'Labs in Zahlen', hero: 'Hero-Animationen', quote: 'Zitat', quote2: 'Zitat' },
  },
  en: {
    claimKicker: 'Platform & online portfolio · since 2001',
    claimSub: ['The web.', 'My passion.'],
    personKicker: 'The person behind it',
    roles: ['Senior React Engineer', 'React Native Engineer', 'Senior Node Engineer', 'IT Trainer (AEVO)'],
    place: 'Berlin',
    secLabel: 'seconds in the service of the web — running since September 2007.',
    stats: [['18+', 'years'], ['10', 'certificates'], ['Berlin', '& remote']],
    originKicker: '2004 – 2006 · Early days · personal projects',
    originTitle: ['From Flash kid to senior engineer —', 'without losing the curiosity.'],
    stackKicker: 'Technologies',
    stackTitle: ['My focus:', 'React, Next.js, TypeScript, React Native.'],
    stackNext: 'Currently exploring',
    journeyKicker: 'The journey',
    awardKicker: 'Award',
    awardTop: 'Best of Swiss Web 2017',
    awardCat: 'Category: Mobile',
    awardWhat: 'Mobile relaunch of MySwitzerland.com',
    awardNote: 'Tech direction 2016 · took over the project 11/2016',
    labsKicker: 'Labs · since 03/2026',
    labsTitle: ['Experiments in progress —', 'watching allowed.'],
    labsMore: 'Also',
    labsCount: 'Labs',
    osm: 'Map data © OpenStreetMap contributors',
    siteKicker: 'LD Beyond. · 2027',
    siteTitle: ['The new', 'Loona! Designs.'],
    siteDesc: 'Loona! Designs Beyond. arrives in 2027 — with the LD Flow CMS. Story pages, hero animations, liquid glass and widgets show what is possible.',
    siteChips: ['LD Flow CMS', 'Story pages', 'Liquid Glass', 'DE / EN', 'Widgets', '70+ hero animations'],
    familyKicker: 'Product family',
    certsKicker: 'Certifications',
    certsTitle: ['10', 'certificates.'],
    focusKicker: 'Focus',
    focusTitle: ['What I', 'work on.'],
    worksKicker: 'Projects · 2002 – today',
    worksTitle: ['From the first websites', 'to e-government.'],
    worksCols: ['Personal projects · unpaid', 'Career · since 09/2007'],
    labsAllKicker: 'Labs in numbers',
    labsAllTitle: ['21 labs', 'since 03/2026.'],
    labStatLabels: ['Projects', 'Since', 'Game modes in COE', 'AI tools'],
    heroKicker: '70+ hero animations',
    heroTitle: ['They show', 'what is possible.'],
    quoteKicker: 'From the labs',
    outroSub: ['The web.', 'My passion.'],
    scroller: 'LOONA! DESIGNS +++ BJOERN SELLNAU +++ SENIOR FULLSTACK & SOFTWARE ENGINEER +++ REACT · NEXT.JS · TYPESCRIPT · REACT NATIVE +++ ONLINE SINCE 2001 +++ GOLD: BEST OF SWISS WEB 2017 +++ 21 LABS SINCE 03/2026 +++ THIS TRAILER RUNS IN THE BROWSER: CANVAS AND WEB AUDIO, MUSIC WITHOUT SAMPLES +++ LOONA-DESIGNS.DE +++ ',
    chapters: { logo: 'Opening', claim: 'Claim', person: 'Person', origin: 'Early days', stack: 'Stack', journey: 'Journey', award: 'Gold', labs: 'Labs', site: 'Platform', family: 'Family', certs: 'Certificates', outro: 'Contact', focus: 'Focus', works: 'Projects', labsAll: 'Labs in numbers', hero: 'Hero animations', quote: 'Quote', quote2: 'Quote' },
  },
};

/* Feste Elemente der mobilen Startseite (Aufnahme 390 × 844 CSS-Pixel am 22.11.2026, Bilder mit 6 px Rand): Sie bleiben im Telefon stehen,
   während die Seite scrollt — wie auf dem Gerät. Maße aus getBoundingClientRect der Aufnahme. */
const MOB_FIX = { vw: 390, vh: 844, pad: 6, top: { x: 161.5, y: 16, w: 67, h: 56 }, bar: { x: 15, y: 766, w: 360, h: 60 } };

/* Bilder (eigene Projekt-Screenshots; Herkunft im README) */
Object.assign(SRC, {
  yayci: 'assets/old_yayci.webp', catt: 'assets/old_catt2005.webp', hanno: 'assets/old_hannoback.webp', ld2006: 'assets/old_ld2006.webp', cattshop: 'assets/old_cattshop.webp', fahrschule: 'assets/old_fahrschule.webp',
  cfTitle: 'assets/g_core-fall-menu.jpg', cf00: 'assets/g_cf-play00.jpg', cf13: 'assets/g_cf-play13.jpg', cf15: 'assets/g_cf-play15.jpg', cf18: 'assets/g_cf-play18.jpg',
  coModes: 'assets/g_co-q1.jpg', coP1: 'assets/g_co-play1.jpg', coP2: 'assets/g_co-play2.jpg', coP3: 'assets/g_co-play3.jpg', coP4: 'assets/g_co-play4.jpg', coP5: 'assets/g_co-play5.jpg', coP6: 'assets/g_co-play6.jpg', coP7: 'assets/g_co-play7.jpg',
  sfTitle: 'assets/sf_ui-01-title.jpg', sfGate: 'assets/sf_01-pariser-platz.jpg', sfTower: 'assets/sf_07-tv-tower.jpg', sfReichstag: 'assets/sf_05-reichstag.jpg', sfSpree: 'assets/sf_12-spree.jpg', sfNight: 'assets/sf_09-night.jpg',
  oldLogo: 'assets/old_logo.png',
  siteHome: 'assets/site_home.jpg', siteBeyond: 'assets/site_beyond.jpg', siteLabs: 'assets/site_labs.jpg', siteStory: 'assets/site_story.jpg',
  /* mobile Startseite ohne ihre festen Elemente; schwebendes Logo und Tab-Leiste einzeln (freigestellt) */
  siteMob: 'assets/site_mob.jpg', siteMobTop: 'assets/site_mob_top.png', siteMobBar: 'assets/site_mob_bar.png',
  ...(new URLSearchParams(location.search).get('len') === '300' ? Object.fromEntries(HERO.flatMap(([m]) => Array.from({ length: HERO_FRAMES }, (_, i) => [`hero_${m}_${i}`, `assets/hero/${m}/f${String(i).padStart(2, '0')}.jpg`]))) : {}),
});
