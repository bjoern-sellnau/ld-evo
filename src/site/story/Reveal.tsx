'use client';

import { useEffect, useRef, useState, type CSSProperties, type ReactNode } from 'react';
import { useMotionOk } from './motion';
import styles from './story.module.css';

export type RevealEffect = 'keiner' | 'hoch' | 'fade' | 'zoom' | 'blur' | 'links' | 'rechts' | 'kippen';

/**
 * Blendet Inhalt beim Hereinscrollen ein. Server und erster Client-Render zeigen alles (kein Layout-Sprung, kein
 * unsichtbarer Inhalt ohne JS); erst wenn Bewegung erlaubt ist, werden Elemente UNTERHALB des Bildschirms versteckt
 * und beim Erreichen animiert. Was schon sichtbar ist, bleibt einfach stehen.
 */
export function Reveal({
  effect = 'hoch',
  delay = 0,
  children,
  style,
  className,
  as: Tag = 'div',
}: {
  effect?: RevealEffect | string;
  delay?: number;
  children: ReactNode;
  style?: CSSProperties;
  className?: string;
  as?: 'div' | 'li' | 'section' | 'span';
}) {
  const ref = useRef<HTMLElement>(null);
  const motion = useMotionOk() && effect !== 'keiner';
  const [state, setState] = useState<'idle' | 'wait' | 'show'>('idle');

  // Nach dem ersten Zeichnen messen (useEffect statt useLayoutEffect): erzwingt kein Layout vor dem ersten Bild.
  // Verstecken betrifft nur Elemente UNTERHALB des Bildschirms — dass sie einen Moment sichtbar waren, sieht niemand.
  useEffect(() => {
    const el = ref.current;
    if (!motion || !el) return;
    const below = el.getBoundingClientRect().top > window.innerHeight * 0.92;
    if (below) setState((s) => (s === 'idle' ? 'wait' : s));
  }, [motion]);

  useEffect(() => {
    const el = ref.current;
    if (state !== 'wait' || !el) return;
    const io = new IntersectionObserver(
      ([e]) => {
        if (e.isIntersecting) {
          setState('show');
          io.disconnect();
        }
      },
      { rootMargin: '0px 0px -10% 0px' },
    );
    io.observe(el);
    return () => io.disconnect();
  }, [state]);

  return (
    <Tag
      ref={ref as never}
      className={[className, motion && state !== 'idle' ? styles.rv : '', state === 'show' ? styles.rvIn : ''].filter(Boolean).join(' ')}
      data-fx={effect}
      style={{ ...style, ...(delay ? ({ '--rv-delay': `${delay}ms` } as CSSProperties) : null) }}
    >
      {children}
    </Tag>
  );
}
