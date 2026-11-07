'use client';

import { useEffect, useState, type MouseEvent } from 'react';
import type { Project } from '@content/projects';
import { useContent } from '../content/ContentProvider';
import { EText, useEditing } from '../cms/editing';
import { WidgetList, type Block } from '../cms/Widgets';
import { mono } from '../cards/ProjectCard';
import { inkOn, lum, readableAlpha } from '../lib/color';
import { projectHref } from '../lib/routes';
import { useCoverColor } from '../lib/useCoverColor';
import { useSite } from '../settings/SiteProvider';
import { Chapter, GallerySlots, RelatedCard, fs, related } from './detail';
import styles from './detail.module.css';
import { useHref, useT } from '../i18n/LocaleProvider';
import { StoryPage } from './StoryPage';

/** Projekt-Detailseite: Case Study (Prototyp) oder — Layout „Story“ in LD Flow — die Scroll-Story aus Widgets. */
export function CaseStudyPage({ p }: { p: Project }) {
  return p.layout === 'story' ? <StoryPage p={p} /> : <CaseStudyClassic p={p} />;
}

/** Case Study (Kapitel 01–06 + Verwandte). Markup/Werte: Prototyp Zeile 535–619. */
function CaseStudyClassic({ p }: { p: Project }) {
  const { settings: s, mob, vtTarget, morphOk, from } = useSite();
  const coverFull = s.coverFull;
  useCoverColor(p.color, coverFull, s.themeColor);
  const ink = inkOn(p.color);
  const acc = coverFull ? ink : 'var(--accent)';
  const t = useT();
  const facts = [
    { k: t('case.tool'), v: p.tool || '—' },
    { k: t('case.period'), v: p.datum || '—' },
    { k: t('case.category'), v: p.kat || '—' },
    { k: t('case.status'), v: p.link ? t('case.livePlayable') : p.tag || '—' },
  ];
  const padX = mob ? 18 : 32;
  const prefix = from === '/' ? 'cf-' : 'c-';
  const blocks = (p.blocks ?? []) as Block[];
  const chapters = CHAPTERS.map((key, i) => ({ n: `0${i + 1}`, id: `kap-0${i + 1}`, label: t(key) }));
  const ch = (n: number) => chapters[n - 1];

  return (
    <article
      data-screen-label="Case Study"
      data-ldsample={coverFull ? lum(p.color).toFixed(2) : '0.03,0.98'}
      // Ultra-Widescreen (ab 2400 px, nur Desktop-Darstellung): breitere Seite + drei Spalten (detail.module.css)
      data-ultra={mob ? undefined : 'case'}
      className={styles.case}
    >
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
        <div style={{ position: 'relative', maxWidth: 'var(--cs-w, 1176px)', margin: '0 auto' }}>
          <div
            style={{
              display: 'flex',
              gap: 12,
              alignItems: 'center',
              marginTop: 26,
              fontFamily: mono,
              fontSize: 10.5,
              letterSpacing: '0.12em',
              opacity: readableAlpha(p.color, ink, 0.85),
            }}
          >
            <span>
              <EText path="tag" value={p.tag} />
            </span>
            <span aria-hidden>·</span>
            <span>{p.datum}</span>
            <span aria-hidden>·</span>
            <span>{p.kat}</span>
          </div>
          <h1
            style={{
              fontSize: mob ? 34 : fs(56),
              fontWeight: 800,
              letterSpacing: '-0.035em',
              lineHeight: 1.05,
              margin: '14px 0 0',
              maxWidth: fs(760),
            }}
          >
            <EText path="name" value={p.name} />
          </h1>
          <div
            style={{ fontSize: fs(16.5), lineHeight: 1.6, marginTop: 16, maxWidth: fs(560), opacity: readableAlpha(p.color, ink, 0.85) }}
          >
            <EText path="desc" value={p.desc} multiline />
          </div>
          <div style={{ display: 'flex', gap: 14, alignItems: 'center', marginTop: 26, flexWrap: 'wrap' }}>
            {p.link && (
              <a
                href={p.link}
                target="_blank"
                rel="noopener noreferrer"
                className={styles.pill}
                style={{ background: ink, color: p.color }}
              >
                {p.linkLabel || t('catalog.play')}
              </a>
            )}
            <span style={{ fontFamily: mono, fontSize: 10.5, opacity: readableAlpha(p.color, ink, 0.75) }}>
              <EText path="tool" value={p.tool} />
            </span>
          </div>
        </div>
      </header>

      <div className={styles.caseBody}>
        <p
          className={styles.caseLead}
          style={{
            margin: '0 0 30px',
            fontSize: fs(22),
            lineHeight: 1.5,
            fontWeight: 500,
            letterSpacing: '-0.01em',
            color: 'var(--ink)',
            textWrap: 'pretty',
            fontStyle: 'italic',
          }}
        >
          <EText path="desc" value={p.desc} multiline />
        </p>
        <div className={styles.caseSide}>
          <dl
            style={{
              display: 'grid',
              gridTemplateColumns: mob ? '1fr 1fr' : 'var(--cs-facts, repeat(4,1fr))',
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
                <dd style={{ margin: 0, fontSize: fs(13), fontWeight: 600, lineHeight: 1.35, color: 'var(--ink)' }}>{f.v}</dd>
              </div>
            ))}
          </dl>
          <CaseToc items={chapters} color={acc} />
        </div>

        <div className={styles.caseMain}>
          <Chapter {...ch(1)} color={acc} first />
          <p
            className="ld-dropcap"
            style={{ margin: '12px 0 0', fontSize: fs(18.5), lineHeight: 1.65, color: 'var(--ink)', textWrap: 'pretty' }}
          >
            <EText path="ueberblick" value={p.ueberblick} multiline />
          </p>
          <Chapter {...ch(2)} color={acc} />
          <p style={{ margin: '12px 0 0', fontSize: fs(16), lineHeight: 1.75, color: 'var(--muted)' }}>
            <EText path="ansatz" value={p.ansatz} multiline />
          </p>
          <figure className={styles.caseMargin} style={{ margin: '52px 0', padding: '0 22px', textAlign: 'center' }}>
            <div aria-hidden style={{ fontSize: 40, color: acc, lineHeight: 0.5, fontFamily: 'var(--ld-font-sans),sans-serif' }}>
              „
            </div>
            <blockquote
              style={{
                fontSize: fs(22),
                fontWeight: 600,
                fontStyle: 'italic',
                letterSpacing: '-0.01em',
                lineHeight: 1.45,
                maxWidth: 560,
                margin: '8px auto 0',
                textWrap: 'balance',
              }}
            >
              <EText path="zitat" value={p.zitat} multiline />
            </blockquote>
          </figure>
          <div className={styles.caseMargin}>
            <Chapter {...ch(3)} color={acc} first />
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
          </div>
          <Chapter {...ch(4)} color={acc} />
          <p
            style={{
              margin: '14px 0 0',
              fontSize: fs(21),
              fontWeight: 600,
              lineHeight: 1.5,
              letterSpacing: '-0.01em',
              color: 'var(--ink)',
              textWrap: 'pretty',
            }}
          >
            <EText path="ergebnis" value={p.ergebnis} multiline />
          </p>
          <Chapter {...ch(5)} color={acc} />
          <p style={{ margin: '12px 0 0', fontSize: fs(15.5), lineHeight: 1.75, color: 'var(--muted)' }}>
            <EText path="learnings" value={p.learnings} multiline />
          </p>
          <div className={styles.caseWide}>
            <Chapter {...ch(6)} color={acc} />
            <GallerySlots
              wide="var(--cs-gw, 320px)"
              small="var(--cs-gs, 200px)"
              cols2={mob ? '1fr' : '1fr 1fr'}
              images={p.gallery}
              labels={[t('case.slot1'), t('case.slot2'), t('case.slot3')]}
            />
          </div>
          {/* Weitere Inhalte (Widgets, neu 07.11.2026) — im Editor immer, damit man den ersten Block einfügen kann */}
          <CaseBlocks blocks={blocks} acc={acc} gap={mob ? 22 : 32} />
        </div>

        <div className={styles.caseOutro}>
          <CaseOutro p={p} acc={acc} />
        </div>
      </div>
    </article>
  );
}

const CHAPTERS = ['case.ch1', 'case.ch2', 'case.ch3', 'case.ch4', 'case.ch5', 'case.ch6'] as const;

/** Widgets unter Kapitel 06 (Feld „Case Study: weitere Inhalte“). Ohne Blöcke und außerhalb des Editors: nichts. */
function CaseBlocks({ blocks, acc, gap }: { blocks: Block[]; acc: string; gap: number }) {
  const editing = useEditing();
  if (!blocks.length && !editing) return null;
  return (
    <div className={styles.caseWide} style={{ marginTop: 56 }}>
      <WidgetList blocks={blocks} path="blocks" accent={acc} gap={gap} />
    </div>
  );
}

/**
 * Kapitel-Navigation (nur Ultra-Widescreen sichtbar, sonst display: none): Sprunglinks zu 01–06, das aktuelle Kapitel
 * ist markiert (aria-current). Gemessen wird nur, solange die Navigation sichtbar ist.
 */
function CaseToc({ items, color }: { items: { n: string; id: string; label: string }[]; color: string }) {
  const t = useT();
  const [cur, setCur] = useState<string | null>(null);
  useEffect(() => {
    const mq = window.matchMedia('(min-width: 2400px)');
    let raf = 0;
    const measure = () => {
      raf = 0;
      let next: string | null = null;
      for (const it of items) {
        const el = document.getElementById(it.id);
        if (el && el.getBoundingClientRect().top < window.innerHeight * 0.35) next = it.id;
      }
      setCur(next ?? items[0]?.id ?? null);
    };
    const onScroll = () => {
      if (!raf) raf = requestAnimationFrame(measure);
    };
    const sync = () => {
      window.removeEventListener('scroll', onScroll);
      if (mq.matches) {
        window.addEventListener('scroll', onScroll, { passive: true });
        measure();
      }
    };
    sync();
    mq.addEventListener('change', sync);
    return () => {
      mq.removeEventListener('change', sync);
      window.removeEventListener('scroll', onScroll);
      if (raf) cancelAnimationFrame(raf);
    };
  }, [items]);
  return (
    <nav className={styles.caseToc} aria-label={t('case.toc')}>
      <ol style={{ listStyle: 'none', margin: 0, padding: 0 }}>
        {items.map((it) => (
          <li key={it.id}>
            <a
              href={`#${it.id}`}
              className={styles.tocLink}
              aria-current={cur === it.id ? 'location' : undefined}
              style={cur === it.id ? { borderLeftColor: color } : undefined}
            >
              <span style={{ fontFamily: mono, fontSize: 11, color: 'var(--soft)' }}>{it.n}</span>
              <span style={{ fontFamily: mono, fontSize: 10.5, letterSpacing: '0.14em' }}>{it.label}</span>
            </a>
          </li>
        ))}
      </ol>
    </nav>
  );
}

/** Verwandte Projekte + „Alle …“ / „Ähnliches Projekt?“ — gemeinsam für Case Study und Story. */
export function CaseOutro({ p, acc }: { p: Project; acc: string }) {
  const { mob, navigate, setOverlay } = useSite();
  const { projects } = useContent();
  const rel = related(
    projects.filter((x) => x.kind === p.kind),
    p,
  );
  const t = useT();
  const lh = useHref();
  const listHref = p.kind === 'labs' ? '/labs' : '/projekte';
  const go = (href: string) => (e: MouseEvent<HTMLAnchorElement>) => {
    if (e.metaKey || e.ctrlKey || e.shiftKey || e.button !== 0) return;
    e.preventDefault();
    navigate(href, { keepVt: false });
  };
  return (
    <>
      <section style={{ marginTop: 56 }} aria-labelledby="rel-title">
        <h2 id="rel-title" style={{ fontFamily: mono, fontSize: 10.5, fontWeight: 400, letterSpacing: '0.18em', color: acc, margin: 0 }}>
          {p.kind === 'labs' ? t('case.relatedLabs') : t('case.relatedProjects')}
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
        <a href={lh(listHref)} onClick={go(listHref)} className={styles.textLink} style={{ color: acc }}>
          {t('case.all')}
        </a>
        <button type="button" onClick={() => setOverlay('kontakt')} className={styles.textLink} style={{ color: acc }}>
          {t('case.similar')}
        </button>
      </div>
    </>
  );
}
