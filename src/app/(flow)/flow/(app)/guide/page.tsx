import { readFileSync } from 'node:fs';
import path from 'node:path';
import { requireUser } from '@/cms/auth';
import { CHAPTERS, sourceKey, type GuideNode } from '@/cms/guide/chapters';
import { Guide, type SourceExcerpt } from '@/cms/ui/Guide';

export const metadata = { title: 'Guide' };

const ROOT = process.cwd();
const ALLOWED = /^(src|content|scripts|tests|docs)\/[\w\-./()[\]]+$|^(next\.config\.ts|package\.json|CLAUDE\.md)$/;

/** Liest einen Ausschnitt aus dem Repo (nur erlaubte Pfade, kein ..), damit der Guide immer den aktuellen Code zeigt. */
function excerpt(n: Extract<GuideNode, { t: 'source' }>): SourceExcerpt {
  if (!ALLOWED.test(n.file) || n.file.includes('..')) return { file: n.file, from: 1, code: '(Pfad nicht erlaubt)', missing: true };
  let text: string;
  try {
    text = readFileSync(path.join(/* turbopackIgnore: true */ ROOT, n.file), 'utf8');
  } catch {
    return {
      file: n.file,
      from: 1,
      code: `// ${n.file} ist auf diesem Server nicht vorhanden (z. B. reines Produktions-Deployment).`,
      missing: true,
    };
  }
  const lines = text.split('\n');
  let from = n.from ?? 1;
  if (n.match) {
    const i = lines.findIndex((l) => l.includes(n.match!));
    if (i >= 0) from = i + 1;
  }
  const to = n.to ?? (n.lines ? from + n.lines - 1 : lines.length);
  return {
    file: n.file,
    from,
    code: lines
      .slice(from - 1, Math.min(to, lines.length))
      .join('\n')
      .replace(/\s+$/, ''),
  };
}

function collect(nodes: GuideNode[], out: Extract<GuideNode, { t: 'source' }>[] = []) {
  for (const n of nodes) {
    if (n.t === 'source') out.push(n);
    if (n.t === 'more') collect(n.nodes, out);
  }
  return out;
}

export default async function Page() {
  await requireUser(); // u. a. 2FA-Pflicht: ohne 2FA nur „Mein Konto“
  const sources: Record<string, SourceExcerpt> = {};
  for (const ch of CHAPTERS) for (const n of collect(ch.nodes)) sources[sourceKey(n)] = excerpt(n);
  return <Guide chapters={CHAPTERS} sources={sources} />;
}
