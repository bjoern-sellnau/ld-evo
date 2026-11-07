// Generiert von scripts/gen-widgets.mjs — nicht von Hand editieren. Neues Widget = neue Datei in src/widgets/.
import type { RegisteredWidget } from './define';
import w_callout from './callout';
import w_changelog from './changelog';
import w_chapter from './chapter';
import w_chart from './chart';
import w_code from './code';
import w_columns from './columns';
import w_compare from './compare';
import w_contact from './contact';
import w_cta from './cta';
import w_divider from './divider';
import w_facts from './facts';
import w_faq from './faq';
import w_gallery from './gallery';
import w_hotspots from './hotspots';
import w_image from './image';
import w_kpi from './kpi';
import w_link_cards from './link-cards';
import w_mockup from './mockup';
import w_palette from './palette';
import w_pattern from './pattern';
import w_pricing_card from './pricing-card';
import w_projects from './projects';
import w_quote from './quote';
import w_section from './section';
import w_skills from './skills';
import w_split from './split';
import w_stats from './stats';
import w_story_app from './story-app';
import w_story_bento from './story-bento';
import w_story_gallery from './story-gallery';
import w_story_hero from './story-hero';
import w_story_horizontal from './story-horizontal';
import w_story_numbers from './story-numbers';
import w_story_scene from './story-scene';
import w_story_steps from './story-steps';
import w_story_ticker from './story-ticker';
import w_story_words from './story-words';
import w_tabs from './tabs';
import w_team from './team';
import w_techstack from './techstack';
import w_testimonial from './testimonial';
import w_text from './text';
import w_timeline from './timeline';
import w_video from './video';

const list: RegisteredWidget[] = [w_callout, w_changelog, w_chapter, w_chart, w_code, w_columns, w_compare, w_contact, w_cta, w_divider, w_facts, w_faq, w_gallery, w_hotspots, w_image, w_kpi, w_link_cards, w_mockup, w_palette, w_pattern, w_pricing_card, w_projects, w_quote, w_section, w_skills, w_split, w_stats, w_story_app, w_story_bento, w_story_gallery, w_story_hero, w_story_horizontal, w_story_numbers, w_story_scene, w_story_steps, w_story_ticker, w_story_words, w_tabs, w_team, w_techstack, w_testimonial, w_text, w_timeline, w_video];

export const WIDGETS: Record<string, RegisteredWidget> = {};
for (const w of list) {
  if (WIDGETS[w.id]) throw new Error(`Widget-ID doppelt: ${w.id}`);
  WIDGETS[w.id] = w;
}
