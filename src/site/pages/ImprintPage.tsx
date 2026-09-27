'use client';

import { Fragment, type CSSProperties } from 'react';
import { IMPRINT_RAIL } from '@content/about';
import { IMPRINT, PRIVACY_SECTIONS, type ImprintBlock, type Segment } from '@content/imprint';
import { mono } from '../cards/ProjectCard';
import { useSite } from '../settings/SiteProvider';
import { ScrollRail, useScrollSpy } from './ScrollRail';

const RAIL_IDS = IMPRINT_RAIL.map((r) => r.id);
const link: CSSProperties = { color: 'var(--accent)', textDecoration: 'none' };
const para: CSSProperties = { margin: '10px 0 0', fontSize: 13.5, lineHeight: 1.75, color: 'var(--muted)' };

/** Impressum + Datenschutz mit Bereichs-Rail. Markup/Werte: Prototyp Zeile 826–893. */
export function ImprintPage() {
  const { settings, mob } = useSite();
  const active = useScrollSpy(RAIL_IDS);
  return (
    <div data-screen-label="Impressum" style={{ paddingTop: mob && settings.mobModern ? 88 : 150, paddingBottom: 80, maxWidth: 680 }}>
      <section id="i-impressum" style={{ scrollMarginTop: 130 }}>
        <div style={{ fontFamily: mono, fontSize: 11, letterSpacing: '0.18em', color: 'var(--accent)' }}>{IMPRINT.kicker}</div>
        <h1 style={{ fontSize: 30, fontWeight: 700, letterSpacing: '-0.03em', margin: '10px 0 0' }}>{IMPRINT.title}</h1>
        <address
          style={{
            fontStyle: 'normal',
            background: 'var(--card)',
            border: '1px solid var(--border)',
            borderRadius: 16,
            padding: '22px 24px',
            marginTop: 28,
            fontSize: 14.5,
            lineHeight: 1.8,
            color: 'var(--muted)',
          }}
        >
          <div style={{ fontWeight: 700, color: 'var(--ink)' }}>{IMPRINT.owner}</div>
          {IMPRINT.address.map((l) => (
            <Fragment key={l}>
              {l}
              <br />
            </Fragment>
          ))}
          E-Mail:{' '}
          <a href={`mailto:${IMPRINT.email}`} style={link}>
            {IMPRINT.email}
          </a>
        </address>
        <p style={{ margin: '22px 0 0', fontSize: 13, lineHeight: 1.7, color: 'var(--soft)' }}>{IMPRINT.notice}</p>
      </section>

      {PRIVACY_SECTIONS.map((sec) => (
        <section
          key={sec.id}
          id={sec.id}
          style={{
            scrollMarginTop: 130,
            marginTop: sec.id === 'i-datenschutz' ? 56 : 36,
            ...(sec.id === 'i-datenschutz' ? { borderTop: '1px solid var(--hair)', paddingTop: 36 } : {}),
          }}
        >
          {sec.blocks.map((b, i) => (
            <Block
              key={i}
              b={b}
              first={i === 0}
              afterMain={i > 0 && 'h' in sec.blocks[i - 1] && (sec.blocks[i - 1] as { size: number }).size === 24}
            />
          ))}
        </section>
      ))}
      <ScrollRail targets={IMPRINT_RAIL} active={active} label="Bereiche" />
    </div>
  );
}

function Block({ b, first, afterMain }: { b: ImprintBlock; first: boolean; afterMain: boolean }) {
  if ('h' in b) {
    const Tag = b.size === 24 ? 'h2' : 'h3';
    return (
      <Tag
        style={{ fontSize: b.size, fontWeight: 700, letterSpacing: b.size === 24 ? '-0.02em' : undefined, margin: first ? 0 : '28px 0 0' }}
      >
        {b.h}
      </Tag>
    );
  }
  if ('box' in b) {
    return (
      <div
        style={{
          background: 'var(--card)',
          border: '1px solid var(--border)',
          borderRadius: 14,
          padding: '16px 20px',
          marginTop: 12,
          fontSize: 13.5,
          lineHeight: 1.8,
          color: 'var(--muted)',
        }}
      >
        {b.box.map((l, i) => (
          <Fragment key={i}>
            {i > 0 && <br />}
            {l}
          </Fragment>
        ))}
      </div>
    );
  }
  if ('credit' in b) {
    return (
      <p style={{ margin: '22px 0 0', fontSize: 11.5, color: 'var(--soft)' }}>
        <a href={b.credit.href} target="_blank" rel="noopener noreferrer" style={{ color: 'var(--soft)', textDecoration: 'underline' }}>
          {b.credit.text}
        </a>
      </p>
    );
  }
  // Der Absatz direkt unter „Datenschutzerklärung“ hat im Prototyp 12 px Abstand, sonst 10 px.
  return (
    <p style={afterMain ? { ...para, marginTop: 12 } : para}>
      {typeof b.p === 'string' ? b.p : b.p.map((seg, i) => <Seg key={i} s={seg} />)}
    </p>
  );
}

function Seg({ s }: { s: Segment }) {
  if (typeof s === 'string') return <>{s}</>;
  return (
    <a href={s.href} target="_blank" rel="noopener noreferrer" style={link}>
      {s.text}
    </a>
  );
}
