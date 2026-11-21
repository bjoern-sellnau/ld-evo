/* Trailer — Fakten und Texte (DE/EN). Quellen (geprüft 21.11.2026):
   - ld-evo, Branch master: content/home.ts, about.ts, journey.ts, projects.ts und content/en/* (Wortlaut),
     src/site/i18n/dict.ts (Zähler-Zeile), src/site/pages/HalloPage.tsx (18+ Jahre, 10 Zertifikate, Berlin & Remote)
   - Brand-System 2026-10 (docs/design_handoff_loona_brand/README.md): Wortmarke, Unterzeile, Schreibweise „Bjoern Sellnau“
   - Logo-Handoff v1.0 (Produktfamilie: LD Flow, LD Nova, LD Buddy, LD Ivy mit Unterzeilen)
   - Best of Swiss Web 2017: wie im README dieses Branches belegt (Gewinnerlisten; Gold, Kategorie Mobile)
   - SPREE|FALL: Repo ld-spreefall (README, Screenshots), Kartendaten © OpenStreetMap-Mitwirkende
   Nichts davon ist geschätzt; Kennzahlen stammen aus den Inhalten (12 Labs, 10 Zertifikate). */
'use strict';
const NAME = 'Bjoern Sellnau';
const ROLE = 'Senior Fullstack & Software Engineer';
const FOCUS = ['React', 'Mobile', 'TypeScript'];
const CLAIM = ['What the web', 'can be.'];
const LINKS = ['loona-designs.de', 'linkedin.com/in/bjoern-sellnau', 'github.com/bjoern-sellnau'];
/* Sekunden seit 01.09.2007, 09:00 (MESZ) bis 21.11.2026, 12:00 (MEZ) — wie der Zähler der Website */
const SEC0 = (Date.UTC(2026, 10, 21, 11, 0, 0) - Date.UTC(2007, 8, 1, 7, 0, 0)) / 1000;

const STACK_ROWS = [
  ['React', 'React Hooks', 'Next.js', 'React Native', 'Styled-Components', 'Redux', 'Webpack'],
  ['TypeScript', 'JavaScript', 'HTML5', 'CSS3', 'JSON', 'XML', 'Jest', 'React Testing Library'],
  ['Node', 'GraphQL', 'MongoDB', 'MySQL', 'Postgres', 'CouchDB', 'ColdFusion', 'PHP'],
];
const STACK_FOCUS = ['React', 'Next.js', 'TypeScript', 'React Native'];
const STACK_NEXT = ['Rust', 'Tauri 2', 'Turborepo', 'Tailwind + Twin'];

const JOURNEY = [
  /* Start der Reise: Ausbildung 2000 – 2002 (Angabe von Bjoern Sellnau, 21.11.2026; Abschluss 06/2002 und Vita-Satz aus about.ts,
     „seit 2001“ ebenfalls about.ts, erstes Kundenprojekt 2002 aus projects.ts „RA Egermann“) */
  { y: '2000', de: ['Die Ausbildung', 'Technischer Assistent für Informatik', '2000 – 2002', 'Hier verfestigt sich die Begeisterung fürs Web — Abschluss im Juni 2002.'], en: ['The training', 'Technical assistant for computer science', '2000 – 2002', 'This is where the enthusiasm for the web takes hold — graduation in June 2002.'], st: { de: ['Loona! Designs: Plattform seit 2001', 'Abschluss 06/2002 (ITA)', '2002: eines der ersten Kundenprojekte'], en: ['Loona! Designs: platform since 2001', 'Graduated 06/2002 (ITA)', '2002: one of the first client projects'] } },
  { y: '2004', de: ['Erste Pixel im Netz', 'Flash & ActionScript', 'Loona! Designs', 'Flash-Intros, Pixel-Buttons und die Erkenntnis: Das Web ist meine Bühne.'], en: ['First pixels on the web', 'Flash & ActionScript', 'Loona! Designs', 'Flash intros, pixel buttons and the realization: the web is my stage.'], st: { de: ['Erste eigene Site online', 'Flash-Games & Experimente', 'Erste Kundenprojekte als Loona!'], en: ['First own site online', 'Flash games & experiments', 'First client projects as Loona!'] } },
  { y: '2007', de: ['PIXELTEX: Der Profi-Start', 'Web Engineer', 'PIXELTEX GmbH', 'Vom Hobby zum Beruf: Kundenprojekte, CMS, ColdFusion — und Gadmin wächst.'], en: ['PIXELTEX: Going pro', 'Web Engineer', 'PIXELTEX GmbH', 'From hobby to profession: client projects, CMS, ColdFusion — and Gadmin grows.'], st: { de: ['Start bei PIXELTEX', 'Gadmin 4.0 — CMS Schweizer Tourismus', 'Umzug der Agentur nach Berlin'], en: ['Joined PIXELTEX', 'Gadmin 4.0 — CMS for Switzerland Tourism', 'Agency moves to Berlin'] } },
  { y: '2010', de: ['Mobile, bevor es cool war', 'Mobile Web', 'MySwitzerland', 'Mys Mobile 2010: Schweiz Tourismus in der Hosentasche — XHTML, winzige Screens, große Wirkung.'], en: ['Mobile before it was cool', 'Mobile Web', 'MySwitzerland', 'Mys Mobile 2010: Switzerland Tourism in your pocket — XHTML, tiny screens, big impact.'], st: { de: ['Mys Mobile 2010 live', 'Sechs Jahre im Einsatz'], en: ['Mys Mobile 2010 live', 'Six years in service'] } },
  { y: '2016', de: ['Lead: OpenBooking', 'Lead Frontend & Mobile', 'OpenBooking AG', 'Hotel-Meta-Suche: Architektur, Frontend, Mobile — ab 2016 als Lead Developer.'], en: ['Lead: OpenBooking', 'Lead Frontend & Mobile', 'OpenBooking AG', 'Hotel meta search: architecture, frontend, mobile — as lead developer from 2016.'], st: { de: ['Lead Frontend & Mobile Solutions', 'Mys Mobile 2017: Projekt übernommen', 'Best of Swiss Web Award — Gold'], en: ['Lead Frontend & Mobile Solutions', 'Mys Mobile 2017: took over the project', 'Best of Swiss Web Award — Gold'] } },
  { y: '2019', de: ['Ausbilder nach AEVO', 'IT-Ausbilder (IHK)', 'PIXELTEX GmbH', 'Wissen weitergeben wird offiziell: Ausbilderschein und der erste eigene Azubi.'], en: ['Certified trainer (AEVO)', 'IT Trainer (IHK)', 'PIXELTEX GmbH', 'Passing on knowledge becomes official: trainer certificate and my first apprentice.'], st: { de: ['AEVO-Schein — IHK Berlin', 'Erster eigener Azubi'], en: ['AEVO certificate — IHK Berlin', 'My first apprentice'] } },
  { y: '2020', de: ['React im Produkt-Takt', 'Software Engineer — React', 'Code-b', 'The Pioneer, BMW Neuwagensuche, Tabletop Herald — agile Produktentwicklung in React.'], en: ['React at product pace', 'Software Engineer — React', 'Code-b', 'The Pioneer, BMW new-car search, Tabletop Herald — agile product development in React.'], st: { de: ['Start bei Code-b', 'The Pioneer — Web-Plattform', 'BMW Neuwagensuche — Team/Tech Lead'], en: ['Joined Code-b', 'The Pioneer — web platform', 'BMW new-car search — team/tech lead'] } },
  { y: '2023', de: ['Apps, die bleiben', 'React Native Engineer', 'The Pioneer', 'Die Pioneer-App reift: New Architecture, GraphQL, tägliche Releases für anspruchsvolle Leser.'], en: ['Apps that last', 'React Native Engineer', 'The Pioneer', 'The Pioneer app matures: New Architecture, GraphQL, daily releases for demanding readers.'], st: { de: ['The Pioneer App — mobile Entwicklung', 'Tabletop Herald App & Web', 'Migration New Architecture'], en: ['The Pioneer App — mobile development', 'Tabletop Herald app & web', 'New Architecture migration'] } },
  { y: '2026', de: ['Materna & die neue Loona!', 'Senior Developer', 'Materna SE', 'Public Sector, E-Government, Zoll — Enterprise-Webanwendungen im #TeamMaterna.'], en: ['Materna & the new Loona!', 'Senior Developer', 'Materna SE', 'Public sector, e-government, customs — enterprise web applications in #TeamMaterna.'], st: { de: ['Ende Code-b', 'KI-Experimente', 'Materna SE'], en: ['Left Code-b', 'AI experiments', 'Materna SE'] } },
];
/* Auswahl für die 60-s-Fassung */
const JOURNEY_SHORT = ['2004', '2007', '2016', '2020', '2026'];

const ORIGIN = [
  { y: '2004', img: 'yayci', de: ['Computer Handel Yayci', 'Kundenprojekt'], en: ['Computer Handel Yayci', 'Client project'] },
  { y: '2005', img: 'catt', de: ['CATT Service', 'Kundenprojekt'], en: ['CATT Service', 'Client project'] },
  { y: '2005', img: 'hanno', de: ['Hannoback', 'Kundenprojekt'], en: ['Hannoback', 'Client project'] },
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
const LABS_MORE = ['Covert Operations Arena', 'Death Grid 3D', 'COE', 'LD WorkBench', 'LD Buddy', 'LD NotchBuddy', 'LD Beyond'];
const LABS_COUNT = 12; // Einträge mit kind 'labs' in content/projects.ts

/* ---------- nur lange Fassung (300 s) ---------- */
/* Schwerpunkte der Startseite (content/home.ts, bxFocus) */
const FOCUS_AREAS = [
  { icon: '</>', de: ['Frontend Engineering', 'Oberflächen mit React, Next.js, TypeScript und React Native — barrierearm und wartbar. Davor: ColdFusion und Flash.'], en: ['Frontend engineering', 'Interfaces with React, Next.js, TypeScript and React Native — accessible and maintainable. Before that: ColdFusion and Flash.'] },
  { icon: '✦', de: ['KI-gestützte Entwicklung', 'Claude Code, Agent Skills und Co.: Was funktioniert, wo sind die Grenzen? Die Antworten landen in den Labs.'], en: ['AI-assisted development', 'Claude Code, Agent Skills and co.: what works, where are the limits? The answers end up in the Labs.'] },
  { icon: '↗', de: ['Wissen weitergeben', 'Seit März 2019 Ausbilder nach AEVO für Fachinformatiker in der Anwendungsentwicklung.'], en: ['Passing on knowledge', 'Since March 2019 a certified trainer (AEVO) for IT specialists in application development.'] },
];
/* Werkliste: die zwölf „Projekte“ und die zwei Archiv-Einträge aus content/projects.ts, chronologisch (Jahr, Kürzel, Farbe, Name, Art) */
const WORKS = [
  ['2002', 'RE', '#334155', 'RA Egermann', 'RA Egermann', 'Kundenprojekt', 'Client project'],
  ['2003', 'CO', '#166534', 'Covert Operations Tournament', 'Covert Operations Tournament', 'Flash-5-Spiel', 'Flash 5 game'],
  ['2004', 'YA', '#1D4ED8', 'Computer Handel Yayci', 'Computer Handel Yayci', 'Onlineshop', 'Online shop'],
  ['2005', 'CT', '#6D28D9', 'CATT Service', 'CATT Service', 'Kundenprojekt', 'Client project'],
  ['2005', 'HB', '#92400E', 'Hannoback', 'Hannoback', 'Website mit MiniCMS', 'Website with MiniCMS'],
  ['2006', 'FS', '#065F46', 'Fahrschule (fiktiv)', 'Driving School (fictional)', 'Entwurf', 'Concept'],
  ['2006', '06', '#9A3412', 'Loona! Designs „ld2006“', 'Loona! Designs ‘ld2006’', 'Eigenprojekt', 'Personal project'],
  ['2006', 'CS', '#5B21B6', 'CATT Shop + CMS', 'CATT Shop + CMS', 'Entwurf', 'Concept'],
  ['2007–2012', 'AW', '#374151', 'Die Autowerkstatt', 'Die Autowerkstatt', 'Kundenprojekt', 'Client project'],
  ['2011', '11', '#1E3A5F', 'DesignUpdate 2011', 'DesignUpdate 2011', 'Redesign', 'Redesign'],
  ['2015', '15', '#155E75', 'DesignUpdate 2015', 'DesignUpdate 2015', 'Redesign', 'Redesign'],
  ['2016', '16', '#0E7490', 'DesignUpdate 2016', 'DesignUpdate 2016', 'Redesign', 'Redesign'],
  ['2016–2020', 'OB', '#1E3A5F', 'OpenBooking', 'OpenBooking', 'Lead Frontend', 'Lead frontend'],
  ['2026', 'EG', '#0F2137', 'E-Government & Zoll', 'E-Government & Customs', 'Enterprise · seit 2026', 'Enterprise · since 2026'],
];
/* Alle zwölf Labs (content/projects.ts, kind 'labs'): Datum, Kürzel, Farbe, Name DE/EN, Art DE/EN */
const LABS_ALL = [
  ['03/2026', 'LB', '#4C1D95', 'LD Buddy', 'LD Buddy', 'Werkzeug', 'Tool'],
  ['04/2026', 'CO', '#14532D', 'Covert Operations', 'Covert Operations', 'Spiel', 'Game'],
  ['05/2026', 'CF', '#C2410C', 'Corefall', 'Corefall', 'Spiel', 'Game'],
  ['05/2026', 'CA', '#7F1D1D', 'Covert Operations Arena', 'Covert Operations Arena', 'Spiel', 'Game'],
  ['05/2026', 'DG', '#18181B', 'Death Grid 3D', 'Death Grid 3D', 'Spiel', 'Game'],
  ['05/2026', 'WB', '#B45309', 'LD WorkBench', 'LD WorkBench', 'Werkzeug', 'Tool'],
  ['05/2026', 'LD', '#F2E8D5', 'LD Website Design Ideas', 'LD Website Design Ideas', 'Design', 'Design'],
  ['10/2026', 'LB', '#BE185D', 'LD Buddy', 'LD Buddy', 'Desktop-App', 'Desktop app'],
  ['10/2026', 'CO', '#14532D', 'COE', 'COE', 'Game Engine', 'Game engine'],
  ['10/2026', 'NB', '#9D174D', 'LD NotchBuddy', 'LD NotchBuddy', 'Mac-App', 'Mac app'],
  ['10/2026', 'LB', '#6D28D9', 'LD Beyond', 'LD Beyond', 'Plattform', 'Platform'],
  ['', 'L!', '#D97706', 'Neue Webseite', 'New Website', 'Relaunch · bald online', 'Relaunch · coming soon'],
];
/* Labs in Zahlen wie auf der Website (Beyond.tsx, labStats): Anzahl, mit Link (online), frühestes Datum, verschiedene Werkzeuge */
const LAB_STATS = { total: 12, online: 2, since: '03/2026', tools: 14 };
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
    originKicker: '2004 – 2006 · Anfänge',
    originTitle: ['Vom Flash-Kid zum Senior Engineer —', 'ohne die Neugier zu verlieren.'],
    stackKicker: 'Technologien',
    stackTitle: ['Mein Fokus:', 'React, Next.js, TypeScript, React Native.'],
    stackNext: 'Gerade dabei',
    journeyKicker: 'Die Reise',
    awardKicker: 'Auszeichnung',
    awardTop: 'Best of Swiss Web 2017',
    awardCat: 'Kategorie Mobile',
    awardWhat: 'Relaunch Mobile MySwitzerland.com',
    awardNote: 'Ein von mir mitentwickeltes Projekt.',
    labsKicker: 'Labs · seit 03/2026',
    labsTitle: ['Experimente in Arbeit —', 'zuschauen erlaubt.'], // Wortlaut der Labs-Seite (dict.ts, catalog.labsTitle)
    labsMore: 'Außerdem',
    labsCount: 'Labs',
    osm: 'Kartendaten © OpenStreetMap-Mitwirkende',
    siteKicker: 'LD Beyond',
    siteTitle: ['Die neue', 'loona-designs.'],
    siteDesc: 'Die Plattform LD Beyond mit dem CMS LD Flow: Story-Seiten, Liquid Glass, Mehrsprachigkeit und Widgets zum Selberbauen.',
    siteChips: ['LD Flow CMS', 'Story-Seiten', 'Liquid Glass', 'DE / EN', 'Widgets', '70+ Hero-Animationen'],
    familyKicker: 'Produktfamilie',
    certsKicker: 'Weiterbildung',
    certsTitle: ['10', 'Zertifikate.'],
    focusKicker: 'Schwerpunkte',
    focusTitle: ['Woran ich', 'arbeite.'],
    worksKicker: 'Projekte · 2002 – 2026',
    worksTitle: ['Von den ersten Kundenprojekten', 'bis E-Government.'],
    labsAllKicker: 'Labs in Zahlen',
    labsAllTitle: ['Zwölf Labs', 'seit 03/2026.'],
    labStatLabels: ['Experimente', 'Online', 'Seit', 'Werkzeuge'],
    heroKicker: '70+ Hero-Animationen',
    heroTitle: ['Eine Startseite,', 'viele Gesichter.'],
    quoteKicker: 'Aus den Labs',
    outroSub: ['Das Web.', 'Meine Leidenschaft.'],
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
    originKicker: '2004 – 2006 · Early days',
    originTitle: ['From Flash kid to senior engineer —', 'without losing the curiosity.'],
    stackKicker: 'Technologies',
    stackTitle: ['My focus:', 'React, Next.js, TypeScript, React Native.'],
    stackNext: 'Currently exploring',
    journeyKicker: 'The journey',
    awardKicker: 'Award',
    awardTop: 'Best of Swiss Web 2017',
    awardCat: 'Category: Mobile',
    awardWhat: 'Mobile relaunch of MySwitzerland.com',
    awardNote: 'A project I co-developed.',
    labsKicker: 'Labs · since 03/2026',
    labsTitle: ['Experiments in progress —', 'watching allowed.'],
    labsMore: 'Also',
    labsCount: 'Labs',
    osm: 'Map data © OpenStreetMap contributors',
    siteKicker: 'LD Beyond',
    siteTitle: ['The new', 'loona-designs.'],
    siteDesc: 'The LD Beyond platform with the LD Flow CMS: story pages, liquid glass, multilingual content and widgets to build with.',
    siteChips: ['LD Flow CMS', 'Story pages', 'Liquid Glass', 'DE / EN', 'Widgets', '70+ hero animations'],
    familyKicker: 'Product family',
    certsKicker: 'Certifications',
    certsTitle: ['10', 'certificates.'],
    focusKicker: 'Focus',
    focusTitle: ['What I', 'work on.'],
    worksKicker: 'Projects · 2002 – 2026',
    worksTitle: ['From the first client projects', 'to e-government.'],
    labsAllKicker: 'Labs in numbers',
    labsAllTitle: ['Twelve labs', 'since 03/2026.'],
    labStatLabels: ['Experiments', 'Online', 'Since', 'Tools'],
    heroKicker: '70+ hero animations',
    heroTitle: ['One home page,', 'many faces.'],
    quoteKicker: 'From the labs',
    outroSub: ['The web.', 'My passion.'],
    chapters: { logo: 'Opening', claim: 'Claim', person: 'Person', origin: 'Early days', stack: 'Stack', journey: 'Journey', award: 'Gold', labs: 'Labs', site: 'Platform', family: 'Family', certs: 'Certificates', outro: 'Contact', focus: 'Focus', works: 'Projects', labsAll: 'Labs in numbers', hero: 'Hero animations', quote: 'Quote', quote2: 'Quote' },
  },
};

/* Bilder (eigene Projekt-Screenshots; Herkunft im README) */
Object.assign(SRC, {
  yayci: 'assets/old_yayci.webp', catt: 'assets/old_catt2005.webp', hanno: 'assets/old_hannoback.webp', ld2006: 'assets/old_ld2006.webp', cattshop: 'assets/old_cattshop.webp', fahrschule: 'assets/old_fahrschule.webp',
  cfTitle: 'assets/g_core-fall-menu.jpg', cf00: 'assets/g_cf-play00.jpg', cf13: 'assets/g_cf-play13.jpg', cf15: 'assets/g_cf-play15.jpg', cf18: 'assets/g_cf-play18.jpg',
  coModes: 'assets/g_co-q1.jpg', coP1: 'assets/g_co-play1.jpg', coP2: 'assets/g_co-play2.jpg', coP3: 'assets/g_co-play3.jpg', coP4: 'assets/g_co-play4.jpg', coP5: 'assets/g_co-play5.jpg', coP6: 'assets/g_co-play6.jpg', coP7: 'assets/g_co-play7.jpg',
  sfTitle: 'assets/sf_ui-01-title.jpg', sfGate: 'assets/sf_01-pariser-platz.jpg', sfTower: 'assets/sf_07-tv-tower.jpg', sfReichstag: 'assets/sf_05-reichstag.jpg', sfSpree: 'assets/sf_12-spree.jpg', sfNight: 'assets/sf_09-night.jpg',
  siteHome: 'assets/site_home.jpg', siteBeyond: 'assets/site_beyond.jpg', siteLabs: 'assets/site_labs.jpg', siteStory: 'assets/site_story.jpg', siteMob: 'assets/site_mob.jpg',
  ...(new URLSearchParams(location.search).get('len') === '300' ? Object.fromEntries(HERO.flatMap(([m]) => Array.from({ length: HERO_FRAMES }, (_, i) => [`hero_${m}_${i}`, `assets/hero/${m}/f${String(i).padStart(2, '0')}.jpg`]))) : {}),
});
