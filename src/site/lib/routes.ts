import type { Article } from '@content/articles';
import type { Project } from '@content/projects';

/** Detail-Routen: Labs unter /labs, alles andere (Projekte, Archiv) unter /projekte. */
export const projectHref = (p: Pick<Project, 'id' | 'kind'>) => (p.kind === 'labs' ? `/labs/${p.id}` : `/projekte/${p.id}`);
export const articleHref = (a: Pick<Article, 'id'>) => `/tech/${a.id}`;

const BASE = process.env.NEXT_PUBLIC_BASE_PATH ?? '';
/**
 * Adresse aus der Adresszeile → Site-Pfad, wie ihn router.push erwartet: ohne Basispfad (GitHub-Pages-Vorschau
 * /ld-evo/…) und ohne abschließenden Schrägstrich (trailingSlash im statischen Export).
 */
export function sitePath(p: string, base: string = BASE): string {
  const inner = base && (p === base || p.startsWith(`${base}/`)) ? p.slice(base.length) || '/' : p;
  return inner.length > 1 ? inner.replace(/\/+$/, '') : inner;
}
