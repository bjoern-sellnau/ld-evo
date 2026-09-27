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

export type Block =
  | { _id: string; type: 'text'; body?: RichText }
  | { _id: string; type: 'chapter'; n?: string; label?: string }
  | { _id: string; type: 'image'; image?: MediaRef; caption?: string }
  | { _id: string; type: 'gallery'; images?: (MediaRef | null)[] }
  | { _id: string; type: 'quote'; text?: string; by?: string }
  | { _id: string; type: 'cta'; label?: string; href?: string }
  | { _id: string; type: 'projects'; title?: string; ids?: string[] }
  | { _id: string; type: 'stats'; items?: { value?: string; label?: string }[] };

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
}
