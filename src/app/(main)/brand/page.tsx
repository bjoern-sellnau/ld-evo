import type { Metadata } from 'next';
import type { ReactNode } from 'react';
import {
  IntroTransform,
  LOONA_PRODUCTS,
  LOONA_PRODUCT_KEYS,
  LoonaLockup,
  LoonaMark,
  LoonaTile,
  LoonaZeichen,
  SlashWipe,
  type LoonaZeichenProps,
} from '@/components/brand';
import { brandTextPairs } from '@/lib/brand-contrast';
import styles from './brand.module.css';

export const metadata: Metadata = { title: 'Brand — Loona! Designs' };

const MARK_SIZES = [16, 32, 48, 120] as const;
const BADGE_SIZES = [24, 48, 96, 160] as const;

/** Töne der Kernmarke auf ihrem Umfeld (Brand-README „Adaptives Prinzip“). */
const TONES: { tone: LoonaZeichenProps['tone']; label: string; bg: string; size?: number }[] = [
  { tone: 'orange', label: 'orange · Tinte', bg: 'var(--loona-ink)' },
  { tone: 'orange', label: 'orange · Creme', bg: '#F6F1E8' },
  { tone: 'cream', label: 'cream · Orange', bg: '#FF7816' },
  { tone: 'white', label: 'white · Fremdfarbe', bg: '#2F7FD6' },
  { tone: 'ink', label: 'ink · hell', bg: '#FFFFFF' },
  { tone: 'glass', label: 'glass · Tinte (≥ 48 px)', bg: 'var(--loona-ink)', size: 72 },
];

/** Logo-Animationen (Brand-README „Animationen“) als Vorführschleifen wie im Brand Kit 7a/8a. */
const ANIMS: { name: string; meaning: string; node: ReactNode }[] = [
  { name: 'Sweep', meaning: 'es lädt · 1,5 s ∞', node: <LoonaZeichen variant="motion" motion="sweep" size={64} decorative /> },
  {
    name: 'Füllstand',
    meaning: 'Fortschritt · --progress',
    node: <LoonaZeichen variant="motion" motion="progress" ground="dark" loop size={64} decorative />,
  },
  { name: 'Blinken', meaning: 'Seite baut · 1,1 s steps(1)', node: <LoonaZeichen variant="motion" motion="blink" size={64} decorative /> },
  { name: 'Mondphase', meaning: 'Badge wird aktiv · 0,9 s', node: <LoonaTile product="ld" motion="moonphase" loop size={88} decorative /> },
  { name: 'Reveal', meaning: 'Intro · 1,2 s', node: <LoonaZeichen motion="reveal" loop size={64} decorative /> },
  { name: 'Hover', meaning: 'Zeichen → Bewegtes Zeichen', node: <LoonaZeichen motion="hover" loop size={64} decorative /> },
  {
    name: 'Slash-Wipe',
    meaning: 'Seitenwechsel · 0,6 s',
    node: (
      <SlashWipe loop width={168} height={105} style={{ display: 'block', borderRadius: 8, background: '#F6F1E8' }}>
        <rect x={6} y={8} width={20} height={3} rx={1.5} fill="#D9D2C5" />
        <rect x={6} y={14} width={30} height={2} rx={1} fill="#E3DCCF" />
        <rect x={6} y={19} width={26} height={2} rx={1} fill="#E3DCCF" />
      </SlashWipe>
    ),
  },
  { name: 'Alt → Neu', meaning: 'Intro-Motiv · 6 s', node: <IntroTransform loop size={120} title="Transformation Alt → Neu" /> },
];

export default function BrandPage() {
  const pairs = brandTextPairs();

  return (
    <div className={styles.shell}>
      <main className={styles.page}>
        <header className={styles.header}>
          <LoonaLockup markSize={56} tagline />
          <p className={styles.kicker}>Brand-System 2026-10 · Familie: Logo-Handoff v1.0</p>
        </header>

        <section className={styles.product} aria-labelledby="brand-core">
          <h2 id="brand-core" className={styles.title}>
            Kernmarke <span className={styles.meta}>Zeichen 28 × 24 · Badge 64, rx 14 · #FF7816</span>
          </h2>
          <div className={styles.grid}>
            <div className={`${styles.panel} ${styles.dark}`}>
              <h3 className={styles.label}>Zeichen · Primär</h3>
              <div className={styles.row}>
                {MARK_SIZES.map((s) => (
                  <figure key={s} className={styles.fig}>
                    <LoonaZeichen size={s} />
                    <figcaption>{s}px</figcaption>
                  </figure>
                ))}
              </div>
            </div>
            <div className={`${styles.panel} ${styles.neutral}`}>
              <h3 className={styles.label}>Badge · immer auf Tinte</h3>
              <div className={styles.row}>
                {BADGE_SIZES.map((s) => (
                  <figure key={s} className={styles.fig}>
                    <LoonaZeichen variant="badge" size={s} />
                    <figcaption>{s}px</figcaption>
                  </figure>
                ))}
              </div>
            </div>
            <div className={`${styles.panel} ${styles.light}`}>
              <h3 className={styles.label}>Bewegtes Zeichen · nur Zustände</h3>
              <div className={styles.row}>
                <figure className={styles.fig}>
                  <LoonaZeichen variant="motion" size={72} />
                  <figcaption>Zeichen</figcaption>
                </figure>
                <figure className={styles.fig}>
                  <LoonaZeichen variant="motionBadge" size={96} />
                  <figcaption>Badge-Umkehr</figcaption>
                </figure>
              </div>
            </div>
            <div className={`${styles.panel} ${styles.dark}`}>
              <h3 className={styles.label}>Töne · adaptiv</h3>
              <div className={styles.row}>
                {TONES.map((t) => (
                  <figure key={t.label} className={styles.fig}>
                    <span className={styles.chip} style={{ background: t.bg }}>
                      <LoonaZeichen tone={t.tone} size={t.size ?? 40} decorative />
                    </span>
                    <figcaption>{t.label}</figcaption>
                  </figure>
                ))}
              </div>
            </div>
            <div className={`${styles.panel} ${styles.dark}`}>
              <h3 className={styles.label}>Wortmarke · dunkel</h3>
              <LoonaLockup theme="dark" markSize={40} />
            </div>
            <div className={`${styles.panel} ${styles.light}`}>
              <h3 className={styles.label}>Wortmarke · hell</h3>
              <LoonaLockup theme="light" markSize={40} />
            </div>
          </div>
        </section>

        <section className={styles.product} aria-labelledby="brand-anim">
          <h2 id="brand-anim" className={styles.title}>
            Animationen <span className={styles.meta}>stehen bei „Animationen aus“ / prefers-reduced-motion</span>
          </h2>
          <div className={styles.grid}>
            {ANIMS.map((a) => (
              <div key={a.name} className={`${styles.panel} ${styles.dark}`}>
                <h3 className={styles.label}>
                  {a.name} · {a.meaning}
                </h3>
                {a.node}
              </div>
            ))}
          </div>
        </section>

        {LOONA_PRODUCT_KEYS.map((key) => {
          const p = LOONA_PRODUCTS[key];
          return (
            <section key={key} className={styles.product} aria-labelledby={`brand-${key}`}>
              <h2 id={`brand-${key}`} className={styles.title}>
                {p.name}{' '}
                <span className={styles.meta}>
                  {key === 'ld' ? 'Zeichen 28 × 24' : `W ${p.width}`} · {p.color} / {p.deep}
                </span>
              </h2>

              <div className={styles.grid}>
                <div className={`${styles.panel} ${styles.dark}`}>
                  <h3 className={styles.label}>Mark · dunkel</h3>
                  <div className={styles.row}>
                    {MARK_SIZES.map((s) => (
                      <figure key={s} className={styles.fig}>
                        <LoonaMark product={key} size={s} />
                        <figcaption>{s}px</figcaption>
                      </figure>
                    ))}
                  </div>
                </div>
                <div className={`${styles.panel} ${styles.light}`}>
                  <h3 className={styles.label}>Mark · hell</h3>
                  <div className={styles.row}>
                    {MARK_SIZES.map((s) => (
                      <figure key={s} className={styles.fig}>
                        <LoonaMark product={key} size={s} tone="ink" />
                        <figcaption>{s}px</figcaption>
                      </figure>
                    ))}
                  </div>
                </div>
                <div className={`${styles.panel} ${styles.dark}`}>
                  <h3 className={styles.label}>Lockup · dark</h3>
                  <LoonaLockup product={key} theme="dark" />
                </div>
                <div className={`${styles.panel} ${styles.light}`}>
                  <h3 className={styles.label}>Lockup · light</h3>
                  <LoonaLockup product={key} theme="light" />
                </div>
                <div className={`${styles.panel} ${styles.neutral}`}>
                  <h3 className={styles.label}>Kachel (Badge-Format) · Ink / Farbe</h3>
                  <div className={styles.row}>
                    <LoonaTile product={key} variant="ink" size={96} />
                    <LoonaTile product={key} variant="color" size={96} />
                    <LoonaTile product={key} variant="ink" size={46} />
                    <LoonaTile product={key} variant="color" size={46} />
                  </div>
                </div>
              </div>
            </section>
          );
        })}

        <section className={styles.product} aria-labelledby="brand-contrast">
          <h2 id="brand-contrast" className={styles.title}>
            Kontrast (Ziel ≥ 4.5:1)
          </h2>
          <table className={styles.table}>
            <thead>
              <tr>
                <th scope="col">Kombination</th>
                <th scope="col">Muster</th>
                <th scope="col">Verhältnis</th>
              </tr>
            </thead>
            <tbody>
              {pairs.map((c) => (
                <tr key={c.label}>
                  <td>{c.label}</td>
                  <td>
                    <span className={styles.swatch} style={{ color: c.fg, background: c.bg }}>
                      Aa
                    </span>
                  </td>
                  <td className={c.ratio >= 4.5 ? styles.pass : styles.fail}>{c.ratio.toFixed(2)}:1</td>
                </tr>
              ))}
            </tbody>
          </table>
        </section>
      </main>
    </div>
  );
}
