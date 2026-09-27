import type { CSSProperties, ReactNode } from 'react';
import type { RichInline, RichText } from '@/cms/schema';

const mono = 'var(--ld-font-mono),monospace';

function Inline({ c }: { c: RichInline[] }) {
  return (
    <>
      {c.map((x, i) => {
        let n: ReactNode = x.t.includes('\n') ? x.t.split('\n').flatMap((part, k) => (k ? [<br key={k} />, part] : [part])) : x.t;
        if (x.code) n = <code style={{ fontFamily: mono, fontSize: '0.9em' }}>{n}</code>;
        if (x.i) n = <em>{n}</em>;
        if (x.b) n = <strong style={{ color: 'var(--ink)' }}>{n}</strong>;
        if (x.href) {
          const ext = /^https?:/i.test(x.href);
          n = (
            <a href={x.href} style={{ color: 'var(--accent)' }} {...(ext ? { target: '_blank', rel: 'noopener noreferrer' } : {})}>
              {n}
            </a>
          );
        }
        return <span key={i}>{n}</span>;
      })}
    </>
  );
}

const para: CSSProperties = { margin: '0 0 18px', fontSize: 16, lineHeight: 1.75, color: 'var(--muted)' };

/** Rich-Text-JSON aus LD Flow als React-Elemente (kein innerHTML). Typografie wie Artikel-/Detailseiten. */
export function RichTextView({ value, style }: { value: RichText; style?: CSSProperties }) {
  return (
    <div style={style}>
      {value.map((b, i) => {
        switch (b.type) {
          case 'h2':
            return (
              <h2 key={i} style={{ fontSize: 24, fontWeight: 700, letterSpacing: '-0.02em', margin: '36px 0 12px', color: 'var(--ink)' }}>
                <Inline c={b.c} />
              </h2>
            );
          case 'h3':
            return (
              <h3 key={i} style={{ fontSize: 18, fontWeight: 700, margin: '28px 0 10px', color: 'var(--ink)' }}>
                <Inline c={b.c} />
              </h3>
            );
          case 'quote':
            return (
              <blockquote
                key={i}
                style={{
                  margin: '24px 0',
                  paddingLeft: 18,
                  borderLeft: '3px solid var(--accent)',
                  fontSize: 19,
                  lineHeight: 1.55,
                  color: 'var(--ink)',
                  fontStyle: 'italic',
                }}
              >
                <Inline c={b.c} />
              </blockquote>
            );
          case 'ul':
          case 'ol': {
            const L = b.type;
            return (
              <L key={i} style={{ ...para, paddingLeft: 22 }}>
                {b.items.map((it, k) => (
                  <li key={k} style={{ marginBottom: 6 }}>
                    <Inline c={it} />
                  </li>
                ))}
              </L>
            );
          }
          default:
            return (
              <p key={i} style={para}>
                <Inline c={b.c} />
              </p>
            );
        }
      })}
    </div>
  );
}
