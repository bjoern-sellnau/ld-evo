import { notFound, redirect } from 'next/navigation';
import { listDocs, publishedPatterns, workingCopy } from '@/cms/repo';
import { COLLECTIONS, PAGE_TEMPLATES } from '@/cms/schema';
import { CollectionList, type ListRow } from '@/cms/ui/CollectionList';

export default async function Page({ params }: { params: Promise<{ collection: string }> }) {
  const { collection } = await params;
  const def = COLLECTIONS[collection];
  if (!def) notFound();
  if (def.kind === 'singleton') redirect(`/flow/c/${collection}/${collection}`);
  const rows: ListRow[] = (await listDocs(collection)).map((r) => {
    const d = workingCopy(r);
    const sub = def.subtitleField ? d[def.subtitleField] : '';
    return {
      id: r.id,
      title: String(d[def.titleField] ?? ''),
      subtitle: collection === 'pages' ? (PAGE_TEMPLATES[String(sub)]?.label ?? '') : String(sub ?? ''),
      color: typeof d.color === 'string' ? d.color : undefined,
      live: !!r.published,
      draft: !!r.draft,
      updatedAt: r.updatedAt,
      updatedBy: r.updatedBy,
      href: def.href({ ...d, id: r.id }),
    };
  });
  return (
    <>
      <div className="f-head">
        <div>
          <div className="f-kicker">Inhalte</div>
          <h1>{def.label}</h1>
        </div>
      </div>
      <CollectionList
        collection={collection}
        rows={rows}
        creatable={def.creatable}
        singular={def.singular}
        patterns={collection === 'pages' ? publishedPatterns().map((p) => ({ id: p.id, title: String(p.title ?? p.id) })) : []}
      />
    </>
  );
}
