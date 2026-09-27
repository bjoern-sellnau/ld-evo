'use client';

import { useEffect, useRef, type CSSProperties, type ReactNode } from 'react';

/** Glas-Schichten eines Panels (Frost, Edge, Rim + optional Glow) mit gemeinsamem Radius. */
export function GlassLayers({ radius, glow }: { radius: string; glow?: boolean }) {
  return (
    <>
      <div data-ldfrost="1" aria-hidden style={{ borderRadius: radius }} />
      <div data-ldedge="1" aria-hidden style={{ borderRadius: radius }} />
      <div data-ldrim="1" aria-hidden style={{ borderRadius: radius }} />
      {glow && (
        <div
          data-ldglow="1"
          aria-hidden
          style={{
            position: 'absolute',
            inset: 0,
            borderRadius: radius,
            zIndex: -1,
            background:
              'linear-gradient(115deg,transparent 30%,rgba(255,255,255,0.12) 42%,transparent 52%),radial-gradient(120% 80% at 10% 0%,rgba(255,255,255,0.12),transparent 55%)',
            pointerEvents: 'none',
          }}
        />
      )}
    </>
  );
}

export const panelGlass = (radius: string): CSSProperties => ({
  position: 'relative',
  background: 'linear-gradient(180deg,var(--glassg1),var(--glassg2)),var(--glass)',
  border: '1px solid var(--glassbrd)',
  borderRadius: radius,
  boxShadow: 'inset 0 1.5px 1px var(--glasshi),inset 0 -8px 14px -11px rgba(0,0,0,0.25),var(--shadow)',
});

/**
 * Modales Overlay (Suche, Kontakt): Backdrop rgba(5,10,20,0.38), Klick daneben schließt, Pop-Animation.
 * Fokus springt beim Öffnen hinein, Tab bleibt im Dialog, beim Schließen zurück zum Auslöser.
 */
export function ModalOverlay({
  label,
  onClose,
  align,
  width,
  radius,
  padding,
  children,
}: {
  label: string;
  onClose: () => void;
  align: 'top' | 'center';
  width: number;
  radius: string;
  padding?: string;
  children: ReactNode;
}) {
  const panel = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const prev = document.activeElement as HTMLElement | null;
    const el = panel.current;
    el?.querySelector<HTMLElement>('input,textarea,button,a')?.focus({ preventScroll: true });
    const trap = (e: KeyboardEvent) => {
      if (e.key !== 'Tab' || !el) return;
      const f = [...el.querySelectorAll<HTMLElement>('input,textarea,button,a[href]')];
      if (!f.length) return;
      const first = f[0];
      const last = f[f.length - 1];
      if (e.shiftKey && document.activeElement === first) {
        e.preventDefault();
        last.focus();
      } else if (!e.shiftKey && document.activeElement === last) {
        e.preventDefault();
        first.focus();
      }
    };
    document.addEventListener('keydown', trap);
    return () => {
      document.removeEventListener('keydown', trap);
      prev?.focus?.({ preventScroll: true });
    };
  }, []);

  return (
    <div
      onClick={onClose}
      style={{
        position: 'fixed',
        inset: 0,
        background: 'rgba(5,10,20,0.38)',
        zIndex: 80,
        display: 'flex',
        alignItems: align === 'top' ? 'flex-start' : 'center',
        justifyContent: 'center',
        padding: align === 'top' ? '110px 24px 24px' : 24,
      }}
    >
      <div
        ref={panel}
        role="dialog"
        aria-modal="true"
        aria-label={label}
        onClick={(e) => e.stopPropagation()}
        style={{
          ...panelGlass(radius),
          width,
          maxWidth: '94vw',
          overflow: align === 'top' ? 'hidden' : undefined,
          padding,
          animation: 'ldPop 0.28s cubic-bezier(0.2,0.9,0.3,1)',
        }}
      >
        <GlassLayers radius={radius} glow />
        {children}
      </div>
    </div>
  );
}
