import type { Article } from '@content/articles';
import type { HomeContent } from '@content/home';
import type { JourneyStation } from '@content/journey';
import type { Project } from '@content/projects';
import type { MediaRef, RichText } from './schema';

export interface AboutContent {
  introKicker: string;
  introTitle: string;
  intro: string;
  vita: string[];
  loona: string;
  tools: string[];
  skills: { titel: string; chips: string[] }[];
  qualifications: { datum: string; name: string; von: string }[];
  images: { slot: string; image?: MediaRef }[];
}

export type JourneyEntry = JourneyStation & { id: string; shot?: MediaRef; insights?: (MediaRef | null)[] };

/** Widget-Instanz im Dokument (Felder flach, dazu controls/slots). */
export interface Block {
  type: string;
  _id: string;
  controls?: Record<string, unknown>;
  slots?: Record<string, Block[]>;
  [k: string]: unknown;
}

export interface CmsPage {
  id: string;
  title: string;
  template: string;
  description?: string;
  kicker?: string;
  intro?: string;
  color?: string;
  mono?: string;
  blocks?: Block[];
}

/** Alles, was die Client-Komponenten der Site brauchen (einmal im Site-Layout geladen). */
export interface SiteContent {
  home: HomeContent;
  about: AboutContent;
  projects: Project[];
  articles: Article[];
  journey: JourneyEntry[];
  pages: { id: string; title: string }[];
  /** Veröffentlichte Vorlagen (Baukasten). */
  patterns: { id: string; title: string; global?: boolean; blocks: Block[] }[];
}
