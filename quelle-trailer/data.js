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
  { y: '2004', de: ['Erste Pixel im Netz', 'Flash & ActionScript', 'Loona! Designs', 'Flash-Intros, Pixel-Buttons und die Erkenntnis: Das Web ist meine Bühne.'], en: ['First pixels on the web', 'Flash & ActionScript', 'Loona! Designs', 'Flash intros, pixel buttons and the realization: the web is my stage.'] },
  { y: '2007', de: ['PIXELTEX: Der Profi-Start', 'Web Engineer', 'PIXELTEX GmbH', 'Vom Hobby zum Beruf: Kundenprojekte, CMS, ColdFusion — und Gadmin wächst.'], en: ['PIXELTEX: Going pro', 'Web Engineer', 'PIXELTEX GmbH', 'From hobby to profession: client projects, CMS, ColdFusion — and Gadmin grows.'] },
  { y: '2010', de: ['Mobile, bevor es cool war', 'Mobile Web', 'MySwitzerland', 'Mys Mobile 2010: Schweiz Tourismus in der Hosentasche — XHTML, winzige Screens, große Wirkung.'], en: ['Mobile before it was cool', 'Mobile Web', 'MySwitzerland', 'Mys Mobile 2010: Switzerland Tourism in your pocket — XHTML, tiny screens, big impact.'] },
  { y: '2016', de: ['Lead: OpenBooking', 'Lead Frontend & Mobile', 'OpenBooking AG', 'Hotel-Meta-Suche: Architektur, Frontend, Mobile — ab 2016 als Lead Developer.'], en: ['Lead: OpenBooking', 'Lead Frontend & Mobile', 'OpenBooking AG', 'Hotel meta search: architecture, frontend, mobile — as lead developer from 2016.'] },
  { y: '2019', de: ['Ausbilder nach AEVO', 'IT-Ausbilder (IHK)', 'PIXELTEX GmbH', 'Wissen weitergeben wird offiziell: Ausbilderschein und der erste eigene Azubi.'], en: ['Certified trainer (AEVO)', 'IT Trainer (IHK)', 'PIXELTEX GmbH', 'Passing on knowledge becomes official: trainer certificate and my first apprentice.'] },
  { y: '2020', de: ['React im Produkt-Takt', 'Software Engineer — React', 'Code-b', 'The Pioneer, BMW Neuwagensuche, Tabletop Herald — agile Produktentwicklung in React.'], en: ['React at product pace', 'Software Engineer — React', 'Code-b', 'The Pioneer, BMW new-car search, Tabletop Herald — agile product development in React.'] },
  { y: '2023', de: ['Apps, die bleiben', 'React Native Engineer', 'The Pioneer', 'Die Pioneer-App reift: New Architecture, GraphQL, tägliche Releases für anspruchsvolle Leser.'], en: ['Apps that last', 'React Native Engineer', 'The Pioneer', 'The Pioneer app matures: New Architecture, GraphQL, daily releases for demanding readers.'] },
  { y: '2026', de: ['Materna & die neue Loona!', 'Senior Developer', 'Materna SE', 'Public Sector, E-Government, Zoll — Enterprise-Webanwendungen im #TeamMaterna.'], en: ['Materna & the new Loona!', 'Senior Developer', 'Materna SE', 'Public sector, e-government, customs — enterprise web applications in #TeamMaterna.'] },
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
  { id: 'covert', name: 'Covert Operations', d: '04/2026', shots: ['coModes', 'coTitle', 'coBoot'], de: ['Spiel', 'Top-Down-, ISO- und FPS-Shooter in einem — ein Spielfeld, viele Perspektiven.'], en: ['Game', 'Top-down, iso and FPS shooter in one — one playing field, many perspectives.'] },
  { id: 'spreefall', name: 'SPREE\u2009|\u2009FALL', d: '2026', shots: ['sfTitle', 'sfGate', 'sfTower', 'sfReichstag', 'sfSpree', 'sfNight'], credit: true, de: ['Spiel', 'Open-World-Shooter in Berlin — aus OpenStreetMap generiert, eigener WebGL2-Renderer.'], en: ['Game', 'Open-world shooter in Berlin — generated from OpenStreetMap, custom WebGL2 renderer.'] },
];
const LABS_MORE = ['Covert Operations Arena', 'Death Grid 3D', 'COE', 'LD WorkBench', 'LD Buddy', 'LD NotchBuddy', 'LD Beyond'];
const LABS_COUNT = 12; // Einträge mit kind 'labs' in content/projects.ts

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
    outroSub: ['Das Web.', 'Meine Leidenschaft.'],
    chapters: { logo: 'Auftakt', claim: 'Anspruch', person: 'Person', origin: 'Anfänge', stack: 'Stack', journey: 'Reise', award: 'Gold', labs: 'Labs', site: 'Plattform', family: 'Familie', certs: 'Zertifikate', outro: 'Kontakt' },
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
    outroSub: ['The web.', 'My passion.'],
    chapters: { logo: 'Opening', claim: 'Claim', person: 'Person', origin: 'Early days', stack: 'Stack', journey: 'Journey', award: 'Gold', labs: 'Labs', site: 'Platform', family: 'Family', certs: 'Certificates', outro: 'Contact' },
  },
};

/* Bilder (eigene Projekt-Screenshots; Herkunft im README) */
Object.assign(SRC, {
  yayci: 'assets/old_yayci.webp', catt: 'assets/old_catt2005.webp', hanno: 'assets/old_hannoback.webp', ld2006: 'assets/old_ld2006.webp', cattshop: 'assets/old_cattshop.webp', fahrschule: 'assets/old_fahrschule.webp',
  cfTitle: 'assets/g_core-fall-menu.jpg', cf00: 'assets/g_cf-play00.jpg', cf13: 'assets/g_cf-play13.jpg', cf15: 'assets/g_cf-play15.jpg', cf18: 'assets/g_cf-play18.jpg',
  coTitle: 'assets/g_co-menu.jpg', coModes: 'assets/g_co-q1.jpg', coBoot: 'assets/g_co-step4.jpg',
  sfTitle: 'assets/sf_ui-01-title.jpg', sfGate: 'assets/sf_01-pariser-platz.jpg', sfTower: 'assets/sf_07-tv-tower.jpg', sfReichstag: 'assets/sf_05-reichstag.jpg', sfSpree: 'assets/sf_12-spree.jpg', sfNight: 'assets/sf_09-night.jpg',
  siteHome: 'assets/site_home.jpg', siteBeyond: 'assets/site_beyond.jpg', siteLabs: 'assets/site_labs.jpg', siteStory: 'assets/site_story.jpg', siteMob: 'assets/site_mob.jpg',
});
