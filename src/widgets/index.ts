// Generiert von scripts/gen-widgets.mjs — nicht von Hand editieren. Neues Widget = neue Datei in src/widgets/.
import type { RegisteredWidget } from './define';
import w_chapter from './chapter';
import w_columns from './columns';
import w_cta from './cta';
import w_faq from './faq';
import w_gallery from './gallery';
import w_image from './image';
import w_pattern from './pattern';
import w_pricing_card from './pricing-card';
import w_projects from './projects';
import w_quote from './quote';
import w_section from './section';
import w_stats from './stats';
import w_text from './text';
import w_video from './video';

const list: RegisteredWidget[] = [w_chapter, w_columns, w_cta, w_faq, w_gallery, w_image, w_pattern, w_pricing_card, w_projects, w_quote, w_section, w_stats, w_text, w_video];

export const WIDGETS: Record<string, RegisteredWidget> = {};
for (const w of list) {
  if (WIDGETS[w.id]) throw new Error(`Widget-ID doppelt: ${w.id}`);
  WIDGETS[w.id] = w;
}
