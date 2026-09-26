import type { Metadata } from 'next';
import { LOONA_PRODUCTS, LOONA_PRODUCT_KEYS, LoonaLockup, LoonaMark, LoonaTile } from '@/components/brand';
import { brandTextPairs } from '@/lib/brand-contrast';
import styles from './brand.module.css';

export const metadata: Metadata = { title: 'Brand — Loona! Designs' };

const MARK_SIZES = [16, 32, 48, 120] as const;

export default function BrandPage() {
  const pairs = brandTextPairs();

  return (
    <main className={styles.page}>
      <header className={styles.header}>
        <LoonaLockup markSize={56} />
        <p className={styles.kicker}>Logo-System · Handoff v1.0</p>
      </header>

      {LOONA_PRODUCT_KEYS.map((key) => {
        const p = LOONA_PRODUCTS[key];
        return (
          <section key={key} className={styles.product} aria-labelledby={`brand-${key}`}>
            <h2 id={`brand-${key}`} className={styles.title}>
              {p.name} <span className={styles.meta}>W {p.width} · {p.color} / {p.deep}</span>
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
                <h3 className={styles.label}>Kachel · Ink / Farbe</h3>
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
  );
}
