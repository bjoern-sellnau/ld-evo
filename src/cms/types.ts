import type { Article } from '@content/articles';
import type { HomeContent } from '@content/home';
import type { JourneyStation } from '@content/journey';
import type { Project } from '@content/projects';
import type { NavItem } from '@/site/nav/pages';
import type { MediaRef } from './schema';

export interface AboutContent {
  introKicker: string;
  introTitle: string;
  intro: string;
  vita: string[];
  loona: string;
  tools: string[];
  skills: { titel: string; chips: string[] }[];
  qualifications: { datum: string; name: string; von: string }[];
  images: { slot: string; image?: MediaRef; caption?: string }[];
  /** Berufliche Stationen (Rail + Bild je Station werden daraus abgeleitet). */
  stations?: CmsStation[];
  /** Projekte im Loona!-Abschnitt. */
  loonaProjects?: CmsStationProject[];
}

export interface CmsStationProject {
  name: string;
  anchor: string;
  zeit: string;
  desc: string;
  stack: string[];
  /** Beschriftung in der Punkt-Rail (Standard: name). */
  railLabel?: string;
}

export interface CmsStation {
  firma: string;
  anchor: string;
  rolle: string;
  zeit: string;
  desc: string;
  railLabel?: string;
  image?: MediaRef;
  caption?: string;
  /** Platzhaltertext, solange kein Bild gesetzt ist. */
  placeholder?: string;
  projekte: CmsStationProject[];
}

export interface ImprintBlockCms {
  kind: 'h2' | 'h3' | 'p' | 'box' | 'credit';
  /** p: Links als [Text](https://…); box: eine Zeile pro Zeile. */
  text: string;
  href?: string;
}

export interface ImprintContent {
  kicker: string;
  title: string;
  owner: string;
  address: string[];
  email: string;
  notice: string;
  sections: { id: string; rail: string; sub?: boolean; blocks: ImprintBlockCms[] }[];
}

export type JourneyStepEntry = JourneyStation['steps'][number] & { images?: (MediaRef | null)[] };
export type JourneyEntry = Omit<JourneyStation, 'steps'> & {
  id: string;
  shot?: MediaRef;
  insights?: (MediaRef | null)[];
  steps: JourneyStepEntry[];
};

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
  navigation: NavItem[];
  imprint: ImprintContent;
  /** Veröffentlichte Vorlagen (Baukasten). */
  patterns: { id: string; title: string; global?: boolean; blocks: Block[] }[];
}
