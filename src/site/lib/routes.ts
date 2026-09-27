import type { Article } from '@content/articles';
import type { Project } from '@content/projects';

/** Detail-Routen: Labs unter /labs, alles andere (Projekte, Archiv) unter /projekte. */
export const projectHref = (p: Pick<Project, 'id' | 'kind'>) => (p.kind === 'labs' ? `/labs/${p.id}` : `/projekte/${p.id}`);
export const articleHref = (a: Pick<Article, 'id'>) => `/tech/${a.id}`;
