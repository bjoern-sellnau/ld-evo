'use client';

import type { MouseEvent } from 'react';
import type { Project } from '@content/projects';
import { useContent } from '../content/ContentProvider';
import { mono } from '../cards/ProjectCard';
import { inkOn, lum } from '../lib/color';
import { projectHref } from '../lib/routes';
import { useCoverColor } from '../lib/useCoverColor';
import { useSite } from '../settings/SiteProvider';
import { Chapter, GallerySlots, RelatedCard, related } from './detail';
import styles from './detail.module.css';

/** Case Study (Kapitel 01–06 + Verwandte). Markup/Werte: Prototyp Zeile 535–619. */
export function CaseStudyPage({ p }: { p: Project }) {
  const { settings: s, mob, vtTarget, morphOk, from, navigate, setOverlay } = useSite();
  const coverFull = s.coverFull;
  useCoverColor(p.color, coverFull, s.themeColor);
  const ink = inkOn(p.color);
  const acc = coverFull ? ink : 'var(--accent)';
  const { projects } = useContent();
  const list = projects.filter((x) => x.kind === p.kind);
  const rel = related(list, p);
  const listHref = p.kind === 'labs' ? '/labs' : '/projekte';
  const facts = [
    { k: 'WERKZEUG', v: p.tool || '—' },
    { k: 'ZEITRAUM', v: p.datum || '—' },
    { k: 'KATEGORIE', v: p.kat || '—' },
    { k: 'STATUS', v: p.link ? 'Live · spielbar' : p.tag || '—' },
  ];
  const go = (href: string) => (e: MouseEvent<HTMLAnchorElement>) => {
    if (e.metaKey || e.ctrlKey || e.shiftKey || e.button !== 0) return;
    e.preventDefault();
    navigate(href, { keepVt: false });
  };
  const padX = mob ? 18 : 32;
  const prefix = from === '/' ? 'cf-' : 'c-';

  return (
    <article data-screen-label="Case Study" data-ldsample={coverFull ? lum(p.color).toFixed(2) : '0.03,0.98'}>
      <header
        data-ldsample={lum(p.color).toFixed(2)}
        style={{
          viewTransitionName: morphOk && vtTarget === p.id ? `${prefix}${p.id}` : 'none',
          position: 'relative',
          margin: `0 -${padX}px`,
          padding: mob && s.mobModern ? '72px 22px 40px' : mob ? '118px 22px 40px' : '150px 64px 60px',
          background: p.color,
          color: ink,
          overflow: 'hidden',
          borderRadius: coverFull ? 0 : '0 0 44px 44px',
        }}
      >
        <div
          aria-hidden
          style={{
            position: 'absolute',
            inset: 0,
            background: 'repeating-linear-gradient(-45deg,rgba(255,255,255,0.05) 0 2px,transparent 2px 18px)',
          }}
        />
        <div style={{ position: 'relative', maxWidth: 1176, margin: '0 auto' }}>
          <div
            style={{
              display: 'flex',
              gap: 12,
              alignItems: 'center',
              marginTop: 26,
              fontFamily: mono,
              fontSize: 10.5,
              letterSpacing: '0.12em',
              opacity: 0.85,
            }}
          >
            <span>{p.tag}</span>
            <span aria-hidden>·</span>
            <span>{p.datum}</span>
            <span aria-hidden>·</span>
            <span>{p.kat}</span>
          </div>
          <h1
            style={{
              fontSize: mob ? 34 : 56,
              fontWeight: 800,
              letterSpacing: '-0.035em',
              lineHeight: 1.05,
              margin: '14px 0 0',
              maxWidth: 760,
            }}
          >
            {p.name}
          </h1>
          <div style={{ fontSize: 16.5, lineHeight: 1.6, marginTop: 16, maxWidth: 560, opacity: 0.85 }}>{p.desc}</div>
          <div style={{ display: 'flex', gap: 14, alignItems: 'center', marginTop: 26, flexWrap: 'wrap' }}>
            {p.link && (
              <a
                href={p.link}
                target="_blank"
                rel="noopener noreferrer"
                className={styles.pill}
                style={{ background: ink, color: p.color }}
              >
                {p.linkLabel || 'Jetzt spielen ↗'}
              </a>
            )}
            <span style={{ fontFamily: mono, fontSize: 10.5, opacity: 0.75 }}>{p.tool}</span>
          </div>
        </div>
      </header>

      <div style={{ maxWidth: 760, margin: '0 auto', padding: '56px 0 40px' }}>
        <p
          style={{
            margin: '0 0 30px',
            fontSize: 22,
            lineHeight: 1.5,
            fontWeight: 500,
            letterSpacing: '-0.01em',
            color: 'var(--ink)',
            textWrap: 'pretty',
            fontStyle: 'italic',
          }}
        >
          {p.desc}
        </p>
        <dl
          style={{
            display: 'grid',
            gridTemplateColumns: mob ? '1fr 1fr' : 'repeat(4,1fr)',
            gap: 1,
            background: 'var(--hair)',
            border: '1px solid var(--hair)',
            borderRadius: 14,
            overflow: 'hidden',
            margin: '0 0 44px',
          }}
        >
          {facts.map((f) => (
            <div key={f.k} style={{ background: 'var(--bg)', padding: '14px 16px' }}>
              <dt style={{ fontFamily: mono, fontSize: 9, letterSpacing: '0.14em', color: 'var(--soft)', marginBottom: 5 }}>{f.k}</dt>
              <dd style={{ margin: 0, fontSize: 13, fontWeight: 600, lineHeight: 1.35, color: 'var(--ink)' }}>{f.v}</dd>
            </div>
          ))}
        </dl>

        <Chapter n="01" label="DIE AUSGANGSLAGE" color={acc} first />
        <p className="ld-dropcap" style={{ margin: '12px 0 0', fontSize: 18.5, lineHeight: 1.65, color: 'var(--ink)', textWrap: 'pretty' }}>
          {p.ueberblick}
        </p>
        <Chapter n="02" label="DER ANSATZ" color={acc} />
        <p style={{ margin: '12px 0 0', fontSize: 16, lineHeight: 1.75, color: 'var(--muted)' }}>{p.ansatz}</p>
        <figure style={{ margin: '52px 0', padding: '0 22px', textAlign: 'center' }}>
          <div aria-hidden style={{ fontSize: 40, color: acc, lineHeight: 0.5, fontFamily: 'var(--ld-font-sans),sans-serif' }}>
            „
          </div>
          <blockquote
            style={{
              fontSize: 22,
              fontWeight: 600,
              fontStyle: 'italic',
              letterSpacing: '-0.01em',
              lineHeight: 1.45,
              maxWidth: 560,
              margin: '8px auto 0',
              textWrap: 'balance',
            }}
          >
            {p.zitat}
          </blockquote>
        </figure>
        <Chapter n="03" label="DIE WERKZEUGE" color={acc} first />
        <ul style={{ display: 'flex', flexWrap: 'wrap', gap: 8, margin: '14px 0 0', padding: 0, listStyle: 'none' }}>
          {p.stack.map((c) => (
            <li
              key={c}
              style={{
                background: 'var(--card)',
                border: '1px solid var(--border)',
                borderRadius: 12,
                padding: '10px 16px',
                fontSize: 13,
                fontWeight: 600,
              }}
            >
              {c}
            </li>
          ))}
        </ul>
        <Chapter n="04" label="DAS ERGEBNIS" color={acc} />
        <p
          style={{
            margin: '14px 0 0',
            fontSize: 21,
            fontWeight: 600,
            lineHeight: 1.5,
            letterSpacing: '-0.01em',
            color: 'var(--ink)',
            textWrap: 'pretty',
          }}
        >
          {p.ergebnis}
        </p>
        <Chapter n="05" label="GELERNT" color={acc} />
        <p style={{ margin: '12px 0 0', fontSize: 15.5, lineHeight: 1.75, color: 'var(--muted)' }}>{p.learnings}</p>
        <Chapter n="06" label="EINDRÜCKE" color={acc} />
        <GallerySlots
          wide={320}
          small={200}
          cols2={mob ? '1fr' : '1fr 1fr'}
          images={p.gallery}
          labels={['Screenshot / Hero-Shot', 'Detail-Screenshot', 'Making-of / Skizze']}
        />

        <section style={{ marginTop: 56 }} aria-labelledby="rel-title">
          <h2 id="rel-title" style={{ fontFamily: mono, fontSize: 10.5, fontWeight: 400, letterSpacing: '0.18em', color: acc, margin: 0 }}>
            {p.kind === 'labs' ? 'VERWANDTE EXPERIMENTE' : 'VERWANDTE PROJEKTE'}
          </h2>
          <div style={{ display: 'grid', gridTemplateColumns: mob ? '1fr' : 'repeat(3,1fr)', gap: 12, marginTop: 16 }}>
            {rel.map((r) => (
              <RelatedCard
                key={r.id}
                href={projectHref(r)}
                onClick={go(projectHref(r))}
                color={r.color}
                ink={inkOn(r.color)}
                meta={`${r.tag} · ${r.datum}`}
                stripes
              >
                <div style={{ position: 'relative', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 10 }}>
                  <span style={{ fontSize: 17, fontWeight: 800, letterSpacing: '-0.02em', lineHeight: 1.25 }}>{r.name}</span>
                  <span aria-hidden style={{ fontSize: 26, fontWeight: 800, opacity: 0.35, flex: 'none', lineHeight: 1 }}>
                    {r.mono}
                  </span>
                </div>
              </RelatedCard>
            ))}
          </div>
        </section>

        <div
          style={{
            borderTop: '1px solid var(--hair)',
            marginTop: 32,
            padding: '22px 0 60px',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            gap: 12,
            flexWrap: 'wrap',
          }}
        >
          <a href={listHref} onClick={go(listHref)} className={styles.textLink} style={{ color: acc }}>
            ‹ Alle ansehen
          </a>
          <button type="button" onClick={() => setOverlay('kontakt')} className={styles.textLink} style={{ color: acc }}>
            Ähnliches Projekt? Sag hallo ›
          </button>
        </div>
      </div>
    </article>
  );
}
