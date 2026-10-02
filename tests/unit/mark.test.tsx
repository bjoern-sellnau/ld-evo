import { renderToStaticMarkup } from 'react-dom/server';
import { describe, expect, it } from 'vitest';
import { LOONA_PRODUCTS, LOONA_PRODUCT_KEYS, LoonaLockup, LoonaMark } from '@/components/brand';

describe('LoonaMark — Props', () => {
  it.each(LOONA_PRODUCT_KEYS)('%s: Breite = size · W / 40', (key) => {
    const html = renderToStaticMarkup(<LoonaMark product={key} size={80} />);
    expect(html).toContain(`width="${(80 * LOONA_PRODUCTS[key].width) / 40}"`);
    expect(html).toContain('height="80"');
    expect(html).toContain(`viewBox="0 0 ${LOONA_PRODUCTS[key].width} 40"`);
  });

  it('a11y: role="img" + <title> mit Produktname als Default', () => {
    const html = renderToStaticMarkup(<LoonaMark product="flow" />);
    expect(html).toContain('role="img"');
    expect(html).toContain('<title>LD Flow.</title>');
    expect(renderToStaticMarkup(<LoonaMark title="Startseite" />)).toContain('<title>Startseite</title>');
  });

  it('decorative → aria-hidden, kein <title>', () => {
    const html = renderToStaticMarkup(<LoonaMark decorative />);
    expect(html).toContain('aria-hidden="true"');
    expect(html).not.toContain('<title>');
    expect(html).not.toContain('role="img"');
  });

  it('tone current → currentColor', () => {
    expect(renderToStaticMarkup(<LoonaMark tone="current" />)).toContain('fill="currentColor"');
  });

  it('CSS-Länge als size → Seitenverhältnis über aspect-ratio', () => {
    const html = renderToStaticMarkup(<LoonaMark product="buddy" size="2rem" />);
    expect(html).toContain('height="2rem"');
    expect(html).toContain('aspect-ratio:24 / 40');
  });
});

describe('LoonaLockup — Wortmarke', () => {
  it('ld wie assets/lockup-*.svg: "loona" + "!" / "designs", Deep-Farbe auf hell', () => {
    expect(renderToStaticMarkup(<LoonaLockup />).replace(/<[^>]+>/g, '')).toBe('loona!designs');
    const light = renderToStaticMarkup(<LoonaLockup theme="light" />);
    expect(light).toContain('--loona-accent:#C2410C');
    expect(light).toContain('data-core=""');
  });

  it('Produkte: Name ohne Punkt + Punkt als Akzent, Deep-Farbe auf hell', () => {
    const html = renderToStaticMarkup(<LoonaLockup product="buddy" theme="light" />);
    expect(html.replace(/<[^>]+>/g, '')).toBe('LD Buddy.app · loona! designs');
    expect(html).toContain('--loona-accent:#BE185D');
    expect(html).toContain('fill="#171310"'); // Ink-Zeichen auf hell
  });

  it('variant="mark" rendert nur das Zeichen', () => {
    const html = renderToStaticMarkup(<LoonaLockup product="nova" variant="mark" />);
    expect(html.startsWith('<svg')).toBe(true);
    expect(html).not.toContain('design system');
  });
});
