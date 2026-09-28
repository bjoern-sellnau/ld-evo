'use client';

import { useId, useRef, useState, type KeyboardEvent, type ReactNode } from 'react';

/**
 * Tabs nach WAI-ARIA-Muster (tablist/tab/tabpanel): Pfeiltasten wechseln, Pos1/Ende springen, nur der aktive
 * Tab ist per Tab-Taste erreichbar. Inhalte kommen fertig gerendert vom Widget (src/widgets/tabs.tsx).
 */
export function TabsView({ tabs, accent }: { tabs: { label: ReactNode; panel: ReactNode }[]; accent: string }) {
  const [active, setActive] = useState(0);
  const id = useId();
  const refs = useRef<(HTMLButtonElement | null)[]>([]);
  const cur = Math.min(active, Math.max(0, tabs.length - 1));
  const go = (i: number) => {
    const n = (i + tabs.length) % tabs.length;
    setActive(n);
    refs.current[n]?.focus();
  };
  const onKey = (e: KeyboardEvent) => {
    const k = { ArrowRight: cur + 1, ArrowLeft: cur - 1, Home: 0, End: tabs.length - 1 }[e.key];
    // Im LD-Flow-Editor tippt man direkt im Reiter — dort gehören die Pfeiltasten dem Text-Cursor.
    if (k === undefined || (e.target as HTMLElement).isContentEditable) return;
    e.preventDefault();
    go(k);
  };
  if (!tabs.length) return null;
  return (
    <div>
      <div role="tablist" onKeyDown={onKey} style={{ display: 'flex', gap: 4, flexWrap: 'wrap', borderBottom: '1px solid var(--hair)' }}>
        {tabs.map((t, i) => (
          <button
            key={i}
            ref={(el) => {
              refs.current[i] = el;
            }}
            type="button"
            role="tab"
            id={`${id}-t${i}`}
            aria-selected={i === cur}
            aria-controls={`${id}-p${i}`}
            tabIndex={i === cur ? 0 : -1}
            onClick={() => setActive(i)}
            style={{
              appearance: 'none',
              background: 'none',
              border: 'none',
              borderBottom: `2px solid ${i === cur ? accent : 'transparent'}`,
              marginBottom: -1,
              padding: '10px 14px',
              font: 'inherit',
              fontSize: 14.5,
              fontWeight: i === cur ? 700 : 500,
              color: i === cur ? 'var(--ink)' : 'var(--muted)',
              cursor: 'pointer',
            }}
          >
            {t.label}
          </button>
        ))}
      </div>
      {tabs.map((t, i) => (
        <div
          key={i}
          role="tabpanel"
          id={`${id}-p${i}`}
          aria-labelledby={`${id}-t${i}`}
          hidden={i !== cur}
          tabIndex={0}
          style={{ paddingTop: 16 }}
        >
          {t.panel}
        </div>
      ))}
    </div>
  );
}
