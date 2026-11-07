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
  /**
   * Design-Richtung „Beyond“ (neu, Wunsch 07.11.2026): Texte der Beyond-Bausteine. Vorlage: Entwurf „Path to Beyond“
   * (src/app/page.tsx), nur Aussagen übernommen, die diese Inhalte belegen (about.ts, journey.ts). Kennzahlen
   * (Labs, Zertifikate) und die aktuelle Station rechnet die Site aus den übrigen Inhalten.
   */
  bxLine1?: string;
  bxLine2?: string;
  /** „Aktuell“-Leiste; leer = erste berufliche Station aus „Über mich“ (Rolle @ Firma, Zeitraum). */
  bxNow?: string;
  bxNowNote?: string;
  bxMarquee?: string[];
  bxFocus?: { icon?: string; title?: string; text?: string }[];
  bxCtaTitle?: string;
  bxCtaText?: string;
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
  // Claim der alten Startseite (Bildschirmfoto oben, ld2006: „what the web can be“) — wie im Beyond-Entwurf
  bxLine1: 'What the web',
  bxLine2: 'can be.',
  // Laufband: nur Technologien aus about.ts (Skills, „Aktuell“); three.js/Tailwind/Stripe/PostgreSQL aus dem Entwurf
  // sind dort nicht (so) belegt
  bxMarquee: ['React', 'Next.js', 'TypeScript', 'Node.js', 'React Native', 'Claude Code', 'GraphQL', 'MongoDB'],
  bxFocus: [
    {
      icon: '</>',
      title: 'Frontend Engineering',
      // about.ts: Fokus React/Next.js/TypeScript/React Native, „barrierearm, wartbar“; ColdFusion + Flash als Vorgeschichte
      text: 'Oberflächen mit React, Next.js, TypeScript und React Native — barrierearm und wartbar. Davor: ColdFusion und Flash.',
    },
    {
      icon: '✦',
      title: 'KI-gestützte Entwicklung',
      // about.ts: KI-Experimente mit Claude Code, Zertifikat „Introduction to Agent Skills“ (03/2026)
      text: 'Claude Code, Agent Skills und Co.: Was funktioniert, wo sind die Grenzen? Die Antworten landen in den Labs.',
    },
    {
      icon: '↗',
      title: 'Wissen weitergeben',
      // journey.ts (2019): wörtlich
      text: 'Seit März 2019 Ausbilder nach AEVO für Fachinformatiker in der Anwendungsentwicklung.',
    },
  ],
  bxCtaTitle: 'Lust auf Austausch?',
  bxCtaText: 'React, Next.js, KI-gestützte Entwicklung oder alte Flash-Zeiten: Ich freue mich über Nachrichten.',
};
