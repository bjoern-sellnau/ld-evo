import Link from 'next/link';
import { LoonaLockup } from '@/components/brand';

// Platzhalter bis zur Portfolio-Umsetzung (design/design_handoff_loona_site).
export default function Home() {
  return (
    <main style={{ minHeight: '100dvh', display: 'grid', placeItems: 'center', gap: 24, padding: 16 }}>
      <div style={{ display: 'grid', justifyItems: 'center', gap: 24 }}>
        <h1 style={{ margin: 0 }}>
          <LoonaLockup markSize={64} />
        </h1>
        <Link href="/brand" style={{ color: 'var(--loona-cream)' }}>
          Logo-System ansehen
        </Link>
      </div>
    </main>
  );
}
