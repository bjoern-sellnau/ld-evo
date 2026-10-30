/**
 * Startseite „Hallo“ — Texte 1:1 aus dem Prototyp (Markup Zeile 370–464, renderVals → roles / featuredCards).
 * Startwerte für das CMS (Singleton „Startseite“); die Site liest die veröffentlichte Fassung aus LD Flow.
 */
export interface HomeContent {
  kicker: string;
  titleLine1: string;
  titleLine2: string;
  name: string;
  roles: string[];
  intro: string;
  /** IDs der Featured-Projekte (Reihenfolge = Anzeige). */
  featured: string[];
  /** Landing Page /welcome (neu, nicht im Prototyp): Screenshot der alten Website, Effekt, Hinweis. */
  welcomeOld?: { src: string; alt?: string };
  welcomeEffect?: string;
  welcomeNote?: string;
}

export const HOME: HomeContent = {
  kicker: '#TeamMaterna — Public Sector | E-Government | Zoll',
  titleLine1: 'Das Web.',
  titleLine2: 'Meine Leidenschaft.',
  name: 'Björn Sellnau',
  roles: [
    'Senior Full-Stack / Senior Software Engineer : Frontend',
    'Senior React Engineer',
    'React Native Engineer',
    'Senior Full-Stack : Frontend',
    'Senior Nextjs Engineer',
    'Senior Node Engineer',
    'IT-Ausbilder (AEVO): Fachinformatiker — Anwendungsentwicklung',
  ],
  intro: 'Senior Full-Stack / Software Engineer — React, TypeScript, Web & Mobile. Seit 18+ Jahren baue ich Dinge fürs Web, die bleiben.',
  featured: ['corefall', 'covert', 'neuewebsite'],
  // Bildschirmfoto der bisherigen Startseite (loona-designs.de/startseite.htm, aufgenommen 17.10.2026, 1440 × 900 @2×)
  welcomeOld: {
    src: '/welcome/alte-startseite.webp',
    alt: 'Die bisherige Startseite von loona-designs.de: blaues Kopfband mit Logo und „What the web can be“, Menü, Qualifikationen und Porträt mit Loona-Logo',
  },
  // Migration (Terminal) seit 30.10.2026 — vorher Kacheln
  welcomeEffect: 'migrate',
};
