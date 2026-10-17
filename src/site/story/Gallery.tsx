'use client';

import { useRef, useState, type KeyboardEvent } from 'react';
import { EText } from '../cms/editing';
import { inkOn } from '../lib/color';
import { useT } from '../i18n/LocaleProvider';
import { useSite } from '../settings/SiteProvider';
import { useMotionOk } from './motion';
import { Reveal } from './Reveal';
import { AppFrame, kickerStyle, okHex, screenOf, STORY_DEFAULT_COLOR, type ScreenData } from './Story';
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
