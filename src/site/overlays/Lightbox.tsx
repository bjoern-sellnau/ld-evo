'use client';

import { useCallback, useEffect, useRef, useState, type CSSProperties } from 'react';
import { createPortal } from 'react-dom';
import type { GalleryImage } from '@content/projects';
import { mono } from '../cards/ProjectCard';
import styles from './overlays.module.css';
import { mediaUrl } from '@/cms/media';
import { useT } from '../i18n/LocaleProvider';

interface Anim {
  x: string;
  op: number;
  trans: string;
}
const REST: Anim = { x: '0px', op: 1, trans: 'none' };

const btn: CSSProperties = {
  position: 'absolute',
  borderRadius: 999,
  background: 'rgba(255,255,255,0.12)',
  color: '#FFFFFF',
  display: 'inline-flex',
  alignItems: 'center',
  justifyContent: 'center',
  cursor: 'pointer',
};

/**
 * Vollbild-Lightbox für Galerien (Prototyp: openLightbox / lbNav / lbTouch*, Markup Zeile 304–313):
 * Blättern per ‹/›, Pfeiltasten, Klick aufs Bild; Slide 34 px (0,16 s raus / 0,22 s rein);
 * Swipe horizontal > 48 px blättert, vertikal > 90 px schließt; Esc/✕/Backdrop schließen.
 */
export function Lightbox({ images, start, onClose }: { images: GalleryImage[]; start: number; onClose: () => void }) {
  const t = useT();
  const [idx, setIdx] = useState(start);
  const [anim, setAnim] = useState<Anim>(REST);
  const timers = useRef<ReturnType<typeof setTimeout>[]>([]);
  const touch = useRef<{ x: number; y: number } | null>(null);
  const swiped = useRef(false);
  const closeBtn = useRef<HTMLButtonElement>(null);
  const multi = images.length > 1;

  const nav = useCallback(
    (dir: number) => {
      if (!multi) return;
      timers.current.forEach(clearTimeout);
      setAnim({ x: dir * -34 + 'px', op: 0, trans: 'transform 0.16s ease-in, opacity 0.16s ease-in' });
      timers.current = [
        setTimeout(() => {
          setIdx((i) => (i + dir + images.length) % images.length);
          setAnim({ x: dir * 34 + 'px', op: 0, trans: 'none' });
          timers.current.push(
            setTimeout(
              () => setAnim({ x: '0px', op: 1, trans: 'transform 0.22s cubic-bezier(0.2,0.9,0.3,1), opacity 0.22s ease-out' }),
              30,
            ),
          );
        }, 160),
      ];
    },
    [multi, images.length],
  );

  useEffect(() => {
    const prev = document.activeElement as HTMLElement | null;
    closeBtn.current?.focus();
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        e.stopPropagation();
        onClose();
      } else if (e.key === 'ArrowRight' || e.key === 'ArrowLeft') {
        e.preventDefault();
        nav(e.key === 'ArrowRight' ? 1 : -1);
      }
    };
    document.addEventListener('keydown', onKey);
    const t = timers.current;
    return () => {
      document.removeEventListener('keydown', onKey);
      t.forEach(clearTimeout);
      prev?.focus?.();
    };
  }, [nav, onClose]);

  const close = () => {
    if (!swiped.current) onClose();
  };
  const img = images[idx];

  return createPortal(
    <div
      role="dialog"
      aria-modal="true"
      aria-label={t('gallery.label')}
      onClick={close}
      onTouchStart={(e) => {
        const t = e.touches[0];
        if (t) {
          touch.current = { x: t.clientX, y: t.clientY };
          swiped.current = false;
        }
      }}
      onTouchEnd={(e) => {
        const t = e.changedTouches[0];
        if (!t || !touch.current) return;
        const dx = t.clientX - touch.current.x;
        const dy = t.clientY - touch.current.y;
        if (Math.abs(dx) > 48 && Math.abs(dx) > Math.abs(dy) * 1.4) {
          swiped.current = true;
          nav(dx < 0 ? 1 : -1);
          setTimeout(() => (swiped.current = false), 400);
        } else if (dy > 90 && Math.abs(dy) > Math.abs(dx) * 1.4) {
          swiped.current = true;
          onClose();
        }
        touch.current = null;
      }}
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        zIndex: 210,
        background: 'rgba(4,8,16,0.82)',
        backdropFilter: 'blur(14px)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: 32,
        animation: 'ldPop 0.25s cubic-bezier(0.2,0.9,0.3,1)',
        cursor: 'zoom-out',
        touchAction: 'pan-y',
      }}
    >
      {/* Bild als background-image-Fläche (README: kein <img> mit Template-Hole). */}
      <div
        role="img"
        aria-label={img.alt || t('gallery.image')}
        onClick={(e) => {
          if (swiped.current) {
            e.stopPropagation();
            return;
          }
          if (multi) {
            e.stopPropagation();
            nav(1);
          }
        }}
        style={{
          width: 'min(92vw, 1240px)',
          height: 'min(84vh, 860px)',
          backgroundImage: `url(${JSON.stringify(mediaUrl(img.src, 2400))})`,
          backgroundSize: 'contain',
          backgroundPosition: 'center',
          backgroundRepeat: 'no-repeat',
          cursor: multi ? 'e-resize' : 'zoom-out',
          transform: `translateX(${anim.x})`,
          opacity: anim.op,
          transition: anim.trans,
          filter: 'drop-shadow(0 30px 60px rgba(0,0,0,0.55))',
        }}
      />
      <button
        ref={closeBtn}
        type="button"
        aria-label={t('gallery.close')}
        onClick={(e) => {
          e.stopPropagation();
          close();
        }}
        className={styles.lbBtn}
        style={{ ...btn, top: 22, right: 24, width: 38, height: 38, fontSize: 15 }}
      >
        ✕
      </button>
      {multi && (
        <>
          <button
            type="button"
            aria-label={t('gallery.prev')}
            onClick={(e) => {
              e.stopPropagation();
              nav(-1);
            }}
            className={`${styles.lbBtn} ${styles.lbSide}`}
            style={{ ...btn, left: 22, top: '50%', width: 44, height: 44, fontSize: 20 }}
          >
            ‹
          </button>
          <button
            type="button"
            aria-label={t('gallery.next')}
            onClick={(e) => {
              e.stopPropagation();
              nav(1);
            }}
            className={`${styles.lbBtn} ${styles.lbSide}`}
            style={{ ...btn, right: 22, top: '50%', width: 44, height: 44, fontSize: 20 }}
          >
            ›
          </button>
          <span
            aria-live="polite"
            style={{
              position: 'absolute',
              bottom: 24,
              left: '50%',
              transform: 'translateX(-50%)',
              padding: '6px 14px',
              borderRadius: 999,
              background: 'rgba(255,255,255,0.12)',
              color: '#FFFFFF',
              fontFamily: mono,
              fontSize: 11,
              letterSpacing: '0.1em',
            }}
          >
            {idx + 1} / {images.length}
          </span>
        </>
      )}
    </div>,
    document.body,
  );
}
