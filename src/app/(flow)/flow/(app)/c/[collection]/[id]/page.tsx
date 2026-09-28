import { notFound } from 'next/navigation';
import { getCurrentUser } from '@/cms/auth';
import { getDoc, listDocs, listRevisions, workingCopy } from '@/cms/repo';
import { COLLECTIONS } from '@/cms/schema';
import { DocEditor } from '@/cms/ui/DocEditor';

export async function generateMetadata({ params }: { params: Promise<{ collection: string; id: string }> }) {
  const { collection, id } = await params;
  return { title: `${COLLECTIONS[collection]?.singular ?? 'Eintrag'} ${id}` };
}

export default async function Page({ params }: { params: Promise<{ collection: string; id: string }> }) {
  const { collection, id } = await params;
  const def = COLLECTIONS[collection];
  if (!def) notFound();
  const user = await getCurrentUser();
  const row = await getDoc(collection, id);
  if (!row || !user) notFound();
  const doc = workingCopy(row);
  const projects = (await listDocs('projects')).map((r) => ({ id: r.id, title: String(workingCopy(r).name ?? r.id) }));
  return (
    <DocEditor
      key={`${collection}/${id}`}
      collection={collection}
      id={id}
      initial={doc}
      live={!!row.published}
      hasDraft={!!row.draft}
      isAdmin={user.role === 'admin'}
      relations={{ projects }}
      revisions={await listRevisions(collection, id)}
      publicHref={def.href({ ...doc, id })}
      scheduledAt={row.publishAt}
    />
  );
}
