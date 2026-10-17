'use client';

import { useRef, useState, type CSSProperties, type KeyboardEvent, type ReactNode } from 'react';
import { EText } from '../cms/editing';
import { inkOn } from '../lib/color';
import { useT } from '../i18n/LocaleProvider';
import { useSite } from '../settings/SiteProvider';
import { useMotionOk } from './motion';
import { Reveal } from './Reveal';
import { Device, kickerStyle, okHex, screenOf, STORY_DEFAULT_COLOR, type ScreenData } from './Story';
import styles from './story.module.css';

/**
 * App-Galerie (neu, nicht im Prototyp): alle Ausführungen einer App auf einen Blick — Desktop, Telefon, Browser,
 * Browser-Erweiterungen (Chrome-/Safari-Popup, Seitenleiste). Darstellung als Register (eine Ansicht, Umschalter)
 * oder als Raster (alle nebeneinander). Screens wie überall in den Story-Widgets: nachgebaut oder eigener Screenshot.
 */

export interface GalleryItem extends ScreenData {
  label?: string;
  device?: string;
  caption?: string;
}

/** Angedeuteter Seiteninhalt hinter Erweiterungen (Dekoration). */
function FauxPage() {
  return (
    <div aria-hidden style={{ padding: '22px 24px', display: 'flex', flexDirection: 'column', gap: 12 }}>
      <div style={{ width: '46%', height: 18, borderRadius: 6, background: '#d9dde6' }} />
      {[92, 84, 88, 60].map((w, i) => (
        <div key={i} style={{ width: `${w}%`, height: 10, borderRadius: 5, background: '#e5e8ef' }} />
      ))}
      <div style={{ width: '70%', aspectRatio: '16 / 7', borderRadius: 10, background: '#e9ecf2', marginTop: 6 }} />
    </div>
  );
}

const dots = (
  <span aria-hidden style={{ display: 'flex', gap: 6 }}>
    {['#ff5f57', '#febc2e', '#28c840'].map((c) => (
      <span key={c} style={{ width: 10, height: 10, borderRadius: '50%', background: c }} />
    ))}
  </span>
);

/** Rahmen je Ausführung. h = Höhe der Inhaltsfläche. */
export function AppFrame({ kind, label, h, children }: { kind: string; label?: string; h: string; children: ReactNode }) {
  if (kind === 'phone') return <Device kind="phone">{children}</Device>;
  if (kind === 'browser')
    return (
      <Device kind="browser" style={{ width: '100%' }}>
        {children}
      </Device>
    );
  const shell: CSSProperties = {
    width: '100%',
    borderRadius: 14,
    overflow: 'hidden',
    background: '#101318',
    boxShadow: '0 0 0 1px rgba(255,255,255,0.12) inset, 0 40px 80px -30px rgba(0,0,0,0.55)',
  };
  const body: CSSProperties = { height: h, position: 'relative', overflow: 'hidden', background: '#f6f7fb', color: '#141821' };
  if (kind === 'desktop')
    return (
      <div style={shell}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '9px 12px', background: '#1d2129' }}>
          {dots}
          <span style={{ flex: 1, textAlign: 'center', fontSize: 12, fontWeight: 600, color: '#c9d1dd', marginRight: 46 }}>{label}</span>
        </div>
        <div style={body}>{children}</div>
      </div>
    );
  // Browser mit Erweiterung: Chrome (Popup unter dem Puzzle-Symbol), Safari (Popup mit Pfeil), Seitenleiste
  const safari = kind === 'safari';
  const bar = (
    <div style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '8px 12px', background: safari ? '#e8e9ed' : '#202329' }}>
      {dots}
      <span
        aria-hidden
        style={{
          flex: 1,
          height: 24,
          borderRadius: safari ? 7 : 999,
          background: safari ? '#fff' : '#33373f',
          margin: safari ? '0 12%' : 0,
        }}
      />
      <span aria-hidden style={{ fontSize: 13, color: safari ? '#5b6270' : '#c9d1dd' }}>
        {kind === 'sidebar' ? '▥' : '⧉'}
      </span>
    </div>
  );
  return (
    <div style={{ ...shell, background: safari ? '#e8e9ed' : '#101318' }}>
      {bar}
      <div style={{ ...body, display: 'flex' }}>
        <div style={{ flex: 1, minWidth: 0 }}>
          <FauxPage />
        </div>
        {kind === 'sidebar' ? (
          <div style={{ width: 'min(42%, 340px)', position: 'relative', borderLeft: '1px solid #d9dde6' }}>{children}</div>
        ) : (
          <div
            className={styles.popup}
            style={{ top: 8, right: safari ? '18%' : 12, width: 'min(300px, 72%)', height: 'calc(100% - 16px)' }}
          >
            {children}
          </div>
        )}
      </div>
    </div>
  );
}

export function StoryGallery({
  kicker,
  title,
  text,
  items,
  color,
  layout,
  path,
}: {
  kicker?: string;
  title?: string;
  text?: string;
  items: GalleryItem[];
  color?: string;
  layout: string;
  path: string;
}) {
  const { mob } = useSite();
  const t = useT();
  const motion = useMotionOk();
  const accent = okHex(color) ?? STORY_DEFAULT_COLOR;
  const [cur, setCur] = useState(0);
  const tabsRef = useRef<HTMLDivElement>(null);
  const idBase = path.replace(/[^a-zA-Z0-9]/g, '-');
  const active = Math.min(cur, Math.max(0, items.length - 1));
  const frameFor = (it: GalleryItem, i: number, compact: boolean) => {
    const kind = it.device || 'phone';
    const h = compact ? '300px' : mob ? '380px' : 'min(56vh, 520px)';
    const wide = kind !== 'phone';
    return (
      <div
        style={{
          width: wide ? '100%' : compact ? 'min(220px, 70vw)' : mob ? 'min(260px, 72vw)' : undefined,
          maxWidth: wide ? (compact ? undefined : 980) : undefined,
          margin: '0 auto',
          // Telefon mittig (der Rahmen hat eine feste Breite)
          ...(wide ? null : { display: 'flex', flexDirection: 'column', alignItems: 'center' }),
        }}
      >
        <AppFrame kind={kind} label={it.label} h={h}>
          {screenOf(it, accent)}
        </AppFrame>
        {it.caption && (
          <p style={{ fontSize: 14.5, lineHeight: 1.55, color: 'var(--muted)', margin: '14px auto 0', maxWidth: 560, textAlign: 'center' }}>
            <EText path={`${path}.items.${i}.caption`} value={it.caption} multiline />
          </p>
        )}
      </div>
    );
  };
  const onKey = (e: KeyboardEvent) => {
    const d = e.key === 'ArrowRight' ? 1 : e.key === 'ArrowLeft' ? -1 : 0;
    if (!d || !items.length) return;
    e.preventDefault();
    const next = (active + d + items.length) % items.length;
    setCur(next);
    tabsRef.current?.querySelectorAll<HTMLButtonElement>('[role="tab"]')[next]?.focus();
  };
  return (
    <div>
      {(kicker || title || text) && (
        <Reveal style={{ maxWidth: 760, margin: '0 auto 30px', textAlign: 'center' }}>
          {kicker && (
            <div style={kickerStyle}>
              <EText path={`${path}.kicker`} value={kicker} />
            </div>
          )}
          {title && (
            <h2
              style={{
                fontSize: mob ? 32 : 'clamp(36px, 4.6vw, 60px)',
                fontWeight: 800,
                letterSpacing: '-0.035em',
                lineHeight: 1.04,
                margin: '12px 0 0',
              }}
            >
              <EText path={`${path}.title`} value={title} />
            </h2>
          )}
          {text && (
            <p style={{ fontSize: mob ? 16 : 18, lineHeight: 1.65, color: 'var(--muted)', margin: '16px 0 0' }}>
              <EText path={`${path}.text`} value={text} multiline />
            </p>
          )}
        </Reveal>
      )}
      {layout === 'raster' ? (
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: `repeat(auto-fit, minmax(${mob ? 260 : 320}px, 1fr))`,
            gap: mob ? 28 : 36,
            alignItems: 'start',
          }}
        >
          {items.map((it, i) => (
            <Reveal key={i} delay={i * 80}>
              <div style={{ ...kickerStyle, textAlign: 'center', marginBottom: 14 }}>
                <EText path={`${path}.items.${i}.label`} value={it.label} />
              </div>
              {frameFor(it, i, true)}
            </Reveal>
          ))}
        </div>
      ) : (
        <>
          <div style={{ display: 'flex', justifyContent: 'center', marginBottom: mob ? 22 : 30 }}>
            <div ref={tabsRef} role="tablist" aria-label={title || t('story.views')} className={styles.tabs} onKeyDown={onKey}>
              {items.map((it, i) => (
                <button
                  key={i}
                  type="button"
                  role="tab"
                  id={`${idBase}-tab-${i}`}
                  aria-selected={i === active}
                  aria-controls={`${idBase}-panel`}
                  tabIndex={i === active ? 0 : -1}
                  className={styles.tab}
                  onClick={() => setCur(i)}
                  style={i === active ? { background: accent, color: inkOn(accent) } : undefined}
                >
                  {it.label || `${i + 1}`}
                </button>
              ))}
            </div>
          </div>
          {items[active] && (
            <div
              key={active}
              role="tabpanel"
              id={`${idBase}-panel`}
              aria-labelledby={`${idBase}-tab-${active}`}
              className={motion ? styles.gIn : undefined}
            >
              {frameFor(items[active], active, false)}
            </div>
          )}
        </>
      )}
    </div>
  );
}
