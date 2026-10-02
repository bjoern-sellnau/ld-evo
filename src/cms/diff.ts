/**
 * Versionsvergleich für LD Flow (ohne Abhängigkeiten): Dokumente werden zu „Pfad → Text“ abgeflacht und verglichen;
 * geänderte Texte zusätzlich wortweise (LCS). Rich Text zählt als ein Textfeld (Klartext).
 */

export type Change = { path: string; kind: 'added' | 'removed' | 'changed'; before?: string; after?: string };
export type Seg = { op: '=' | '+' | '-'; t: string };

const RICH_TYPES = new Set(['p', 'h2', 'h3', 'quote', 'ul', 'ol']);
type Inline = { t?: unknown };

/** Rich Text (src/cms/schema.ts: Array aus {type, c} bzw. {type, items}) → Klartext, ein Block je Zeile. */
function richText(v: unknown): string | null {
  if (!Array.isArray(v) || !v.length || !v.every((b) => b && typeof b === 'object' && RICH_TYPES.has((b as { type?: string }).type ?? '')))
    return null;
  const line = (xs: Inline[] = []) => xs.map((x) => (typeof x.t === 'string' ? x.t : '')).join('');
  return v
    .map((b: { c?: Inline[]; items?: Inline[][] }) => (b.items ? b.items.map((it) => `• ${line(it)}`).join('\n') : line(b.c)))
    .join('\n');
}

export function flatten(v: unknown, prefix = '', out = new Map<string, string>()): Map<string, string> {
  const rt = richText(v);
  if (rt !== null) out.set(prefix, rt);
  else if (Array.isArray(v)) v.forEach((x, i) => flatten(x, prefix ? `${prefix}.${i}` : String(i), out));
  else if (v && typeof v === 'object')
    for (const [k, x] of Object.entries(v)) {
      if (k === '_id') continue; // interne Widget-IDs sind für Menschen ohne Bedeutung
      flatten(x, prefix ? `${prefix}.${k}` : k, out);
    }
  else if (v !== undefined && v !== null && v !== '') out.set(prefix, String(v));
  return out;
}

export function diffDocs(before: unknown, after: unknown): Change[] {
  const a = flatten(before);
  const b = flatten(after);
  const out: Change[] = [];
  for (const [p, v] of a) {
    if (!b.has(p)) out.push({ path: p, kind: 'removed', before: v });
    else if (b.get(p) !== v) out.push({ path: p, kind: 'changed', before: v, after: b.get(p) });
  }
  for (const [p, v] of b) if (!a.has(p)) out.push({ path: p, kind: 'added', after: v });
  const order = [...b.keys(), ...a.keys()];
  return out.sort((x, y) => order.indexOf(x.path) - order.indexOf(y.path));
}

/** Wortweiser Vergleich (LCS). Sehr lange Texte (> 1500 Wörter) → ganz ersetzt, damit die Ansicht schnell bleibt. */
export function wordDiff(before: string, after: string): Seg[] {
  const A = before.split(/(\s+)/);
  const B = after.split(/(\s+)/);
  if (A.length * B.length > 1500 * 1500)
    return [
      { op: '-', t: before },
      { op: '+', t: after },
    ];
  const n = A.length;
  const m = B.length;
  const L = Array.from({ length: n + 1 }, () => new Uint16Array(m + 1));
  for (let i = n - 1; i >= 0; i--)
    for (let j = m - 1; j >= 0; j--) L[i][j] = A[i] === B[j] ? L[i + 1][j + 1] + 1 : Math.max(L[i + 1][j], L[i][j + 1]);
  const segs: Seg[] = [];
  const push = (op: Seg['op'], t: string) => {
    const last = segs[segs.length - 1];
    if (last?.op === op) last.t += t;
    else segs.push({ op, t });
  };
  let i = 0;
  let j = 0;
  while (i < n && j < m) {
    if (A[i] === B[j]) {
      push('=', A[i]);
      i++;
      j++;
    } else if (L[i + 1][j] >= L[i][j + 1]) push('-', A[i++]);
    else push('+', B[j++]);
  }
  while (i < n) push('-', A[i++]);
  while (j < m) push('+', B[j++]);
  return segs;
}
