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
};
