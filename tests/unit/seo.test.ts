import { describe, expect, it } from 'vitest';
import { isoMonth, serializeJsonLd } from '@/site/seo/seo';

describe('SEO', () => {
  it('JSON-LD kann kein </script> bilden (Next-Doku: < escapen)', () => {
    const out = serializeJsonLd({ headline: 'Hallo </script><script>alert(1)</script>' });
    expect(out).not.toContain('<');
    expect(JSON.parse(out).headline).toBe('Hallo </script><script>alert(1)</script>');
  });

  it('Datumsangaben aus dem Prototyp → ISO 8601', () => {
    expect(isoMonth('06/2026')).toBe('2026-06');
    expect(isoMonth('2019')).toBe('2019');
    expect(isoMonth('bald')).toBeUndefined();
  });
});
