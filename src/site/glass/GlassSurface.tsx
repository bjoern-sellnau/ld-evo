import type { CSSProperties, ElementType, HTMLAttributes, ReactNode } from 'react';

export interface GlassSurfaceProps extends HTMLAttributes<HTMLElement> {
  as?: ElementType;
  /** border-radius aller Schichten, z. B. '999px' (Pille) oder 'var(--radL,22px)' (Panel). */
  radius?: string;
  /** Sheen + Noise + Kantenlicht-Linie (nur Nav-Pille im Prototyp). */
  sheen?: boolean;
  /** Schlichtere Inset-Schatten wie Tab-Bar und Zurück-Pille. */
  lite?: boolean;
  children?: ReactNode;
}

/**
 * Liquid-Glass-Material (Site-README §Glas-Material; Markup der Nav-Pille im Prototyp):
 * Basis (Gradient-Film über --glass, Border, Inset-Highlights) → Sheen → Noise → Frost → Edge → Rim → Kantenlicht.
 * Body-Klassen (flat, noblur, refr, fluent …) schalten die Schichten per CSS (src/site/styles/site.css).
 * Wie im Prototyp bildet die Fläche selbst KEINEN Stacking-Context: Die Schichten mit negativem z-index liegen
 * unter dem getönten Hintergrund. Der Elternteil (z. B. die fixierte Nav) muss den Stacking-Context stellen.
 */
export function GlassSurface({
  as: Tag = 'div',
  radius = 'var(--radL,22px)',
  sheen = false,
  lite = false,
  style,
  children,
  ...rest
}: GlassSurfaceProps) {
  const r: CSSProperties = { borderRadius: radius };
  return (
    <Tag
      {...rest}
      style={{
        position: 'relative',
        borderRadius: radius,
        background: 'linear-gradient(180deg,var(--glassg1),var(--glassg2)),var(--glass)',
        border: '1px solid var(--glassbrd)',
        boxShadow: lite
          ? 'inset 0 1.5px 1px var(--glasshi),inset 0 -9px 14px -11px rgba(0,0,0,0.35),var(--shadow)'
          : 'inset 0 1.5px 1px var(--glasshi),inset 0 -1px 1px rgba(255,255,255,0.07),inset 1px 0 1px rgba(255,255,255,0.09),inset -1px 0 1px rgba(255,255,255,0.09),inset 0 -9px 14px -11px rgba(0,0,0,0.35),var(--shadow)',
        transition: '--glassTint 0.5s ease,--glassPct 0.5s ease',
        ...style,
      }}
    >
      {sheen && (
        <>
          <div
            data-ldglow="1"
            aria-hidden
            style={{
              ...r,
              position: 'absolute',
              inset: 0,
              zIndex: -1,
              background:
                'linear-gradient(115deg,transparent 18%,rgba(255,255,255,0.2) 30%,rgba(255,255,255,0.04) 38%,transparent 45%),radial-gradient(120% 90% at 12% 0%,rgba(255,255,255,0.15),transparent 55%)',
              backgroundSize: '240% 100%,100% 100%',
              animation: 'ldSheen 12s ease-in-out infinite alternate',
              pointerEvents: 'none',
            }}
          />
          <div data-ldnoise="1" aria-hidden style={{ ...r, position: 'absolute', inset: 0, pointerEvents: 'none' }} />
        </>
      )}
      <div data-ldfrost="1" aria-hidden style={r} />
      <div data-ldedge="1" aria-hidden style={r} />
      <div data-ldrim="1" aria-hidden style={r} />
      {sheen && (
        <div
          aria-hidden
          style={{
            position: 'absolute',
            top: 0,
            left: 12,
            right: 12,
            height: 1,
            background: 'linear-gradient(90deg,transparent,var(--glasshi),transparent)',
            borderRadius: 999,
            pointerEvents: 'none',
          }}
        />
      )}
      {children}
    </Tag>
  );
}
