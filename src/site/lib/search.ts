/**
 * Volltextsuche der Site (Suche-Overlay, ⌘K) — ohne Abhängigkeiten, rein aus den veröffentlichten Inhalten im
 * Browser. Jedes Suchwort muss vorkommen (Groß-/Kleinschreibung, Akzente und ß egal); Treffer im Titel zählen
 * mehr als in Stichworten, die mehr als im Fließtext. Liefert je Treffer einen kurzen Ausschnitt mit Fundstelle.
 */

export interface SearchField {
  text: string;
  /** 10 = Titel, 4 = Stichworte/Kurztext, 1 = Fließtext */
  w: number;
}
export interface SearchDoc {
  label: string;
  kind: string;
  href: string;
  fields: SearchField[];
}
export interface SearchHit {
  label: string;
  kind: string;
  href: string;
  snippet?: { before: string; match: string; after: string };
}

/** Vergleichsform: klein, ohne Akzente, ß → ss. Länge bleibt je Zeichen erhalten (außer ß), daher Index über Map. */
export function fold(s: string): string {
  return s.toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '').replace(/ß/g, 'ss');
}

/** Position im Original zu einer Fundstelle im gefalteten Text (für den Ausschnitt). */
function origIndex(orig: string, foldedIdx: number): number {
  let f = 0;
  for (let i = 0; i < orig.length; i++) {
    if (f >= foldedIdx) return i;
    f += fold(orig[i]).length;
  }
  return orig.length;
}

function snippetOf(text: string, token: string): SearchHit['snippet'] {
  const fi = fold(text).indexOf(token);
  if (fi < 0) return undefined;
  const start = origIndex(text, fi);
  const end = origIndex(text, fi + token.length);
  const from = Math.max(0, start - 36);
  const to = Math.min(text.length, end + 60);
  return {
    before: (from > 0 ? '…' : '') + text.slice(from, start).replace(/^\S*\s/, from > 0 ? '' : '$&'),
    match: text.slice(start, end),
    after: text.slice(end, to) + (to < text.length ? '…' : ''),
  };
}

export function search(docs: SearchDoc[], query: string, limit = 10): SearchHit[] {
  const tokens = fold(query).split(/\s+/).filter(Boolean);
  if (!tokens.length) return docs.slice(0, limit).map(({ label, kind, href }) => ({ label, kind, href }));
  const scored: { hit: SearchHit; score: number; order: number }[] = [];
  docs.forEach((d, order) => {
    const folded = d.fields.map((f) => ({ ...f, f: fold(f.text) }));
    let score = 0;
    for (const t of tokens) {
      const best = Math.max(0, ...folded.filter((f) => f.f.includes(t)).map((f) => f.w));
      if (!best) return; // jedes Wort muss vorkommen
      score += best;
    }
    if (fold(d.label).startsWith(tokens[0])) score += 5;
    // Ausschnitt nur, wenn der Titel das erste Wort nicht selbst enthält — dann zeigt er die Fundstelle im Text.
    const inLabel = fold(d.label).includes(tokens[0]);
    const src = inLabel ? undefined : folded.filter((f) => f.w < 10 && f.f.includes(tokens[0])).sort((a, b) => b.w - a.w)[0];
    scored.push({
      hit: { label: d.label, kind: d.kind, href: d.href, ...(src ? { snippet: snippetOf(src.text, tokens[0]) } : {}) },
      score,
      order,
    });
  });
  return scored
    .sort((a, b) => b.score - a.score || a.order - b.order)
    .slice(0, limit)
    .map((s) => s.hit);
}
