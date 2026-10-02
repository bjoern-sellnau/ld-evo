'use client';

import { Fragment, useMemo, type CSSProperties } from 'react';
import type { ImprintBlock, Segment } from '@content/imprint';
import { toImprintBlock as toBlock } from '../lib/imprintModel';
import { useContent } from '../content/ContentProvider';
import { mono } from '../cards/ProjectCard';
import { useSite } from '../settings/SiteProvider';
import { ScrollRail, useScrollSpy } from './ScrollRail';
import { useT } from '../i18n/LocaleProvider';

// Prototyp: ohne Unterstreichung. Links im Fließtext brauchen ein Merkmal außer der Farbe (WCAG 1.4.1).
const link: CSSProperties = { color: 'var(--accent)', textDecoration: 'underline', textUnderlineOffset: 3 };
const para: CSSProperties = { margin: '10px 0 0', fontSize: 13.5, lineHeight: 1.75, color: 'var(--muted)' };

/** Impressum + Datenschutz mit Bereichs-Rail. Markup/Werte: Prototyp Zeile 826–893. */
export function ImprintPage() {
  const { settings, mob } = useSite();
  const { imprint: IMPRINT } = useContent();
  const t = useT();
  // Inhalte aus LD Flow → Impressum; die Rail ergibt sich aus den Abschnitten.
  const PRIVACY_SECTIONS = useMemo(
    () => IMPRINT.sections.map((sec) => ({ id: sec.id, blocks: sec.blocks.map(toBlock) })),
    [IMPRINT.sections],
  );
  const IMPRINT_RAIL = useMemo(
    () => [
      { id: 'i-impressum', label: t('imprint.railImprint') },
      ...IMPRINT.sections.map((sec) => ({ id: sec.id, label: sec.rail, sub: sec.sub || undefined })),
    ],
    [IMPRINT.sections, t],
  );
  const RAIL_IDS = useMemo(() => IMPRINT_RAIL.map((r) => r.id), [IMPRINT_RAIL]);
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
          {t('imprint.email')}{' '}
          <a href={`mailto:${IMPRINT.email}`} style={link}>
            {IMPRINT.email}
          </a>
        </address>
        <p style={{ margin: '22px 0 0', fontSize: 13, lineHeight: 1.7, color: 'var(--soft)' }}>{IMPRINT.notice}</p>
      </section>

      {/* Der erste Abschnitt (Datenschutzerklärung) ist mit Linie + größerem Abstand abgesetzt (Prototyp). */}
      {PRIVACY_SECTIONS.map((sec, si) => (
        <section
          key={sec.id}
          id={sec.id}
          style={{
            scrollMarginTop: 130,
            marginTop: si === 0 ? 56 : 36,
            ...(si === 0 ? { borderTop: '1px solid var(--hair)', paddingTop: 36 } : {}),
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
      <ScrollRail targets={IMPRINT_RAIL} active={active} label={t('imprint.rail')} />
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
