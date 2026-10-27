import { renderToStaticMarkup } from 'react-dom/server';
import { describe, expect, it } from 'vitest';
import { IntroTransform, LOONA_PRODUCTS, LOONA_PRODUCT_KEYS, LoonaLockup, LoonaMark, LoonaTile, LoonaZeichen } from '@/components/brand';

const text = (html: string) =>
  html
    .replace(/<title>[\s\S]*?<\/title>/g, '')
    .replace(/<[^>]+>/g, '')
    .replace(/&amp;/g, '&');

describe('LoonaMark — Props', () => {
  it.each(LOONA_PRODUCT_KEYS.filter((k) => k !== 'ld'))('%s: Breite = size · W / 40', (key) => {
    const html = renderToStaticMarkup(<LoonaMark product={key} size={80} />);
    expect(html).toContain(`width="${(80 * LOONA_PRODUCTS[key].width) / 40}"`);
    expect(html).toContain('height="80"');
    expect(html).toContain(`viewBox="0 0 ${LOONA_PRODUCTS[key].width} 40"`);
  });

  it('ld: Zeichen, Breite = size · 28 / 24', () => {
    const html = renderToStaticMarkup(<LoonaMark size={48} />);
    expect(html).toContain('width="56"');
    expect(html).toContain('height="48"');
    expect(html).toContain('viewBox="8 11 28 24"');
  });

  it('a11y: role="img" + <title> mit Produktname als Default', () => {
    const html = renderToStaticMarkup(<LoonaMark product="flow" />);
    expect(html).toContain('role="img"');
    expect(html).toContain('<title>LD Flow.</title>');
    expect(renderToStaticMarkup(<LoonaMark title="Startseite" />)).toContain('<title>Startseite</title>');
    expect(renderToStaticMarkup(<LoonaMark />)).toContain('<title>Loona! Designs</title>');
  });

  it('decorative → aria-hidden, kein <title>', () => {
    for (const product of ['ld', 'nova'] as const) {
      const html = renderToStaticMarkup(<LoonaMark product={product} decorative />);
      expect(html).toContain('aria-hidden="true"');
      expect(html).not.toContain('<title>');
      expect(html).not.toContain('role="img"');
    }
  });

  it('Töne: current → currentColor, ld cream = Marken-Creme #F6F1E8, auto → CSS-Variable', () => {
    expect(renderToStaticMarkup(<LoonaMark tone="current" />)).toContain('fill="currentColor"');
    expect(renderToStaticMarkup(<LoonaMark tone="cream" />)).toContain('fill="#F6F1E8"');
    const auto = renderToStaticMarkup(<LoonaMark tone="auto" />);
    expect(auto).toContain('data-ldlogoauto="fill"');
    expect(auto).toContain('fill="var(--ld-logo-auto, #FF7816)"');
  });

  it('CSS-Länge als size → Seitenverhältnis über aspect-ratio', () => {
    expect(renderToStaticMarkup(<LoonaMark product="buddy" size="2rem" />)).toContain('aspect-ratio:24 / 40');
    expect(renderToStaticMarkup(<LoonaMark size="2rem" />)).toContain('aspect-ratio:28 / 24');
  });
});

describe('LoonaZeichen — Varianten und Animationen', () => {
  it('Glas: Verlauf #FFB366 → #FF7816 (55 %) → #FF4D1C + Glanz 32 %', () => {
    const html = renderToStaticMarkup(<LoonaZeichen tone="glass" />);
    expect(html).toMatch(/stop offset="0" stop-color="#FFB366".*offset="0.55" stop-color="#FF7816".*offset="1" stop-color="#FF4D1C"/);
    expect(html).toContain('opacity="0.32"');
  });

  it('IDs (Masken, Clips, Verläufe) sind je Instanz eindeutig', () => {
    const html = renderToStaticMarkup(
      <>
        <LoonaZeichen variant="motion" motion="sweep" />
        <LoonaZeichen variant="motion" motion="sweep" />
      </>,
    );
    const ids = [...html.matchAll(/ id="([^"]+)"/g)].map((m) => m[1]);
    expect(ids.length).toBeGreaterThan(1);
    expect(new Set(ids).size).toBe(ids.length);
  });

  it('Loader (Sweep/Blinken): Ruhe-Fassung mit Zeichen + Punkt liegt bereit; done → Crossfade-Ebene', () => {
    const html = renderToStaticMarkup(<LoonaZeichen variant="motion" motion="sweep" done={false} />);
    expect(html).toContain('data-done="false"');
    expect(html).toContain('<circle');
    expect(html).toMatch(/class="[^"]*sweep/);
    expect(renderToStaticMarkup(<LoonaZeichen variant="motion" motion="blink" />)).toMatch(/class="[^"]*blink/);
  });

  it('Füllstand: --progress aus value (auf 0–1 begrenzt)', () => {
    expect(renderToStaticMarkup(<LoonaZeichen variant="motion" motion="progress" value={0.4} />)).toContain('--progress:0.4');
    expect(renderToStaticMarkup(<LoonaZeichen variant="motion" motion="progress" value={3} />)).toContain('--progress:1');
  });

  it('Mondphase: Scheibe cx 24 cy 23 r 12 im Clip auf den kleinen Mond (Badge und Kachel)', () => {
    for (const html of [
      renderToStaticMarkup(<LoonaZeichen variant="badge" motion="moonphase" />),
      renderToStaticMarkup(<LoonaTile motion="moonphase" />),
    ]) {
      expect(html).toContain('<clipPath');
      expect(html).toMatch(/<circle cx="24" cy="23" r="12" fill="#171310" class="[^"]*moon/);
    }
    // ohne Animation keine zusätzliche Ebene
    expect(renderToStaticMarkup(<LoonaTile />)).not.toContain('<circle');
  });

  it('Hover: Fuge + Slash-Maske, Klasse am <svg>', () => {
    const html = renderToStaticMarkup(<LoonaZeichen motion="hover" />);
    expect(html).toContain('d="M16 11H21V27L24 35H22L19 27H16Z"');
    expect(html).toContain('<mask');
    expect(html).toMatch(/^<svg[^>]*class="[^"]*hover/);
  });

  it('IntroTransform: Endbild = Zeichen (um 2/1 versetzt im 48er-Feld)', () => {
    const html = renderToStaticMarkup(<IntroTransform />);
    expect(html).toContain('viewBox="0 0 48 48"');
    expect(html.match(/transform="translate\(2 1\)"/g)).toHaveLength(2);
  });
});

describe('LoonaLockup — Wortmarke', () => {
  it('ld (Brand Guide S. 07): „loona! designs“ einzeilig, „!“ nicht gefärbt, Zeichen Orange auf hell wie dunkel', () => {
    for (const theme of ['dark', 'light'] as const) {
      const html = renderToStaticMarkup(<LoonaLockup theme={theme} />);
      expect(text(html)).toBe('loona! designs');
      expect(html).not.toContain('--loona-accent');
      expect(html).toContain('fill="#FF7816"');
      expect(html).toContain(`data-theme="${theme}"`);
    }
  });

  it('ld: Unterzeile optional (Text aus dem Brand-README)', () => {
    expect(text(renderToStaticMarkup(<LoonaLockup tagline />))).toBe(
      'loona! designsBjoern Sellnau · Senior Fullstack & Software Engineer · React, Mobile, TypeScript',
    );
  });

  it('ld: negativeColor färbt das Zeichen (Einstellung „Logo only negative“)', () => {
    expect(renderToStaticMarkup(<LoonaLockup negativeColor="#3DDC84" />)).toContain('fill="#3DDC84"');
    expect(renderToStaticMarkup(<LoonaLockup variant="mark" negativeColor="auto" />)).toContain('data-ldlogoauto="fill"');
  });

  it('Produkte: Name ohne Punkt + Punkt als Akzent, Deep-Farbe auf hell', () => {
    const html = renderToStaticMarkup(<LoonaLockup product="buddy" theme="light" />);
    expect(html.replace(/<[^>]+>/g, '')).toBe('LD Buddy.app · loona! designs');
    expect(html).toContain('--loona-accent:#BE185D');
    expect(html).toContain('fill="#171310"'); // Ink-Zeichen auf hell
  });

  it('variant="mark" rendert nur das Zeichen', () => {
    for (const product of ['ld', 'nova'] as const) {
      const html = renderToStaticMarkup(<LoonaLockup product={product} variant="mark" />);
      expect(html.startsWith('<svg')).toBe(true);
      expect(html).not.toContain('design');
    }
  });
});
