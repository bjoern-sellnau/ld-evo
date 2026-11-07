/**
 * Startseite „Hallo“ — englische Fassung (Übersetzungsentwurf) von content/home.ts.
 * Gleiche Struktur wie die deutsche Datei; übersetzt sind nur Texte (Name, Featured-IDs bleiben). Wird in LD Flow
 * als ENTWURF angelegt und erst nach Prüfung veröffentlicht.
 */
import type { HomeContent } from '../home';

export const HOME: HomeContent = {
  kicker: '#TeamMaterna — Public Sector | E-Government | Customs',
  titleLine1: 'The web.',
  titleLine2: 'My passion.',
  name: 'Björn Sellnau',
  roles: [
    'Senior Full-Stack / Senior Software Engineer : Frontend',
    'Senior React Engineer',
    'React Native Engineer',
    'Senior Full-Stack : Frontend',
    'Senior Nextjs Engineer',
    'Senior Node Engineer',
    'IT Trainer (AEVO): IT Specialist — Application Development',
  ],
  intro: 'Senior Full-Stack / Software Engineer — React, TypeScript, Web & Mobile. For 18+ years I’ve been building things for the web that last.',
  featured: ['corefall', 'covert', 'neuewebsite'],
  welcomeOld: {
    src: '/welcome/alte-startseite.webp',
    alt: 'The previous home page of loona-designs.de: blue header with logo and “What the web can be”, menu, qualifications and a portrait with the Loona logo',
  },
  // Migration (Terminal) seit 30.10.2026 — vorher Kacheln
  welcomeEffect: 'migrate',
  bxLine1: 'What the web',
  bxLine2: 'can be.',
  bxMarquee: ['React', 'Next.js', 'TypeScript', 'Node.js', 'React Native', 'Claude Code', 'GraphQL', 'MongoDB'],
  bxFocus: [
    {
      icon: '</>',
      title: 'Frontend engineering',
      text: 'Interfaces with React, Next.js, TypeScript and React Native — accessible and maintainable. Before that: ColdFusion and Flash.',
    },
    {
      icon: '✦',
      title: 'AI-assisted development',
      text: 'Claude Code, Agent Skills and co.: what works, where are the limits? The answers end up in the Labs.',
    },
    {
      icon: '↗',
      title: 'Passing on knowledge',
      text: 'Since March 2019 a certified trainer (AEVO) for IT specialists in application development.',
    },
  ],
  bxCtaTitle: 'Fancy a chat?',
  bxCtaText: 'React, Next.js, AI-assisted development or the good old Flash days: I’m happy to hear from you.',
};
