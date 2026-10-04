'use client';

import { useState, type CSSProperties } from 'react';
import type { CounterFx } from '../settings/schema';
import styles from './counter.module.css';

/**
 * Laufender Sekundenzähler (Startseite, Stats-Leiste). Neu, nicht im Prototyp — Stil in den Einstellungen
 * („Zähler-Animation“, ld-counterfx):
 *  - plain: Ziffern wie im Prototyp
 *  - roll:  jede Ziffer rollt wie eine Walze (Kilometerzähler) nach oben weiter
 *  - flap:  Fallblatt wie Flughafentafel / Klapp-Radiowecker — die obere Hälfte klappt nach unten
 * Ohne Animationen („Animationen aus“ bzw. prefers-reduced-motion) wechseln die Ziffern ohne Bewegung.
 * Ziffern sind von rechts adressiert, damit eine neue Stelle links nicht alle anderen neu startet.
 */
export function CareerCounter({ value, fx, anim, style }: { value: string; fx: CounterFx; anim: boolean; style: CSSProperties }) {
  if (fx === 'plain')
    return (
      <span data-live style={style}>
        {value}
      </span>
    );
  const chars = [...value];
  return (
    <span data-live style={style} className={styles.row}>
      {/* Für Screenreader die Zahl am Stück, die Einzelziffern sind Dekoration. */}
      <span className={styles.sr}>{value}</span>
      <span aria-hidden className={styles.row}>
        {chars.map((c, i) => {
          const key = chars.length - i;
          return /\d/.test(c) ? (
            <Digit key={key} d={c} fx={fx} anim={anim} />
          ) : (
            <span key={`s${key}`} className={styles.sep}>
              {c}
            </span>
          );
        })}
      </span>
    </span>
  );
}

function Digit({ d, fx, anim }: { d: string; fx: 'roll' | 'flap'; anim: boolean }) {
  // Vorheriger Wert für die Übergangsanimation (abgeleiteter Zustand, React-Doku „Storing information from previous renders“).
  const [st, setSt] = useState({ cur: d, prev: d, n: 0 });
  if (st.cur !== d) setSt({ cur: d, prev: st.cur, n: st.n + 1 });
  const { cur, prev, n } = st;
  const moving = anim && n > 0 && prev !== cur;

  if (fx === 'roll')
    return (
      <span className={styles.roll}>
        {moving && (
          <span key={`o${n}`} className={`${styles.rollGlyph} ${styles.rollOut}`}>
            {prev}
          </span>
        )}
        <span key={`i${n}`} className={`${styles.rollGlyph} ${moving ? styles.rollIn : ''}`}>
          {cur}
        </span>
      </span>
    );

  // Fallblatt: statisch oben der neue, unten der alte Wert; darüber klappt das alte obere Blatt weg,
  // danach fällt das neue untere Blatt herunter und deckt den alten Wert ab.
  return (
    <span className={styles.flap}>
      <span className={`${styles.half} ${styles.top}`}>
        <span>{cur}</span>
      </span>
      <span className={`${styles.half} ${styles.bottom}`}>
        <span>{moving ? prev : cur}</span>
      </span>
      {moving && (
        <>
          <span key={`t${n}`} className={`${styles.half} ${styles.top} ${styles.leafTop}`}>
            <span>{prev}</span>
          </span>
          <span key={`b${n}`} className={`${styles.half} ${styles.bottom} ${styles.leafBottom}`}>
            <span>{cur}</span>
          </span>
        </>
      )}
    </span>
  );
}
