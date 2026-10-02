import { notFound } from 'next/navigation';
import { getCurrentUser } from '@/cms/auth';
import { getDoc, listDocs, listRevisions, translationStates, workingCopy } from '@/cms/repo';
import { COLLECTIONS } from '@/cms/schema';
import { DocEditor } from '@/cms/ui/DocEditor';
import { isLocale, localizePath } from '@/site/i18n/locale';

type Props = { params: Promise<{ collection: string; id: string }>; searchParams: Promise<{ lang?: string }> };

export async function generateMetadata({ params }: Props) {
  const { collection, id } = await params;
  return { title: `${COLLECTIONS[collection]?.singular ?? 'Eintrag'} ${id}` };
}

/**
 * Editor je Sprache (?lang=en). Deutsch ist das Original; Englisch hat eigenen Entwurf, eigene Live-Fassung,
 * Versionen und Zeitplan. Gibt es noch keine englische Fassung, startet der Editor mit der deutschen Arbeitskopie —
 * beim ersten Speichern entsteht der englische Entwurf.
 */
export default async function Page({ params, searchParams }: Props) {
  const { collection, id } = await params;
  const lang = (await searchParams).lang;
  const locale = isLocale(lang) ? lang : 'de';
  const def = COLLECTIONS[collection];
  if (!def) notFound();
  const user = await getCurrentUser();
  const de = await getDoc(collection, id, 'de');
  if (!de || !user) notFound();
  const own = locale === 'de' ? de : await getDoc(collection, id, locale);
  const started = !!own && !!(own.draft || own.published);
  const row = started ? own! : de;
  const doc = workingCopy(row);
  const projects = (await listDocs('projects')).map((r) => ({ id: r.id, title: String(workingCopy(r).name ?? r.id) }));
  const tr = (await translationStates(collection, 'en'))[id];
  const href = def.href({ ...doc, id });
  return (
    <DocEditor
      key={`${collection}/${id}/${locale}`}
      collection={collection}
      id={id}
      locale={locale}
      initial={doc}
      live={started && !!row.published}
      hasDraft={started && !!row.draft}
      startedTranslation={started}
      translation={tr}
      isAdmin={user.role === 'admin'}
      relations={{ projects }}
      revisions={started ? await listRevisions(collection, id, locale) : []}
      publicHref={href ? localizePath(href, locale) : null}
      scheduledAt={started ? row.publishAt : null}
      rev={own ? own.updatedAt : 0}
    />
  );
}
