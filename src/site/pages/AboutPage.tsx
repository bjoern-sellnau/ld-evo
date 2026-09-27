'use client';

import type { CSSProperties } from 'react';
import { ABOUT_CAPTIONS, ABOUT_IMAGE_FOR, ABOUT_IMAGES, ABOUT_RAIL, LOONA_PROJECTS, STATIONS, type StationProject } from '@content/about';
import { LoonaTile } from '@/components/brand';
import { mono } from '../cards/ProjectCard';
import { useContent } from '../content/ContentProvider';
import { useSite } from '../settings/SiteProvider';
import { ScrollRail, useScrollSpy } from './ScrollRail';
import detailStyles from './detail.module.css';

const RAIL_IDS = ABOUT_RAIL.map((r) => r.id);
const h2: CSSProperties = { fontSize: 24, fontWeight: 700, letterSpacing: '-0.02em', margin: 0 };
const para: CSSProperties = { margin: '12px 0 0', fontSize: 15, lineHeight: 1.75, color: 'var(--muted)' };

/** Über mich — Split-Layout: links sticky Bild (Crossfade je Abschnitt), rechts Inhalt, Punkt-Rail. Prototyp Zeile 691–820. */
export function AboutPage() {
  const { settings: s, mob, navigate } = useSite();
  const { about } = useContent();
  // Texte/Listen aus LD Flow; Stationen und Rail bleiben im Code (content/about.ts), Bilder je Slot aus dem CMS.
  const images = ABOUT_IMAGES.map((im) => {
    const cms = about.images.find((x) => x.slot === im.slot)?.image;
    return cms ? { ...im, src: cms.src, alt: cms.alt } : im;
  });
  const active = useScrollSpy(RAIL_IDS);
  const imgIdx = ABOUT_IMAGE_FOR[active] ?? 0;
  const padX = mob ? 18 : 32;

  return (
    <div data-screen-label="Über mich" style={{ margin: `0 -${padX}px` }}>
      <div style={{ display: 'grid', gridTemplateColumns: mob ? '1fr' : '0.85fr 1.15fr' }}>
        <div
          style={{
            boxSizing: 'border-box',
            ...(mob
              ? { position: 'relative', height: '46vh', minHeight: 300, padding: `${s.mobModern ? 56 : 82}px 18px 0 18px` }
              : { position: 'sticky', top: 0, height: '100vh', padding: '88px 12px 24px 24px' }),
          }}
        >
          <div
            style={{
              position: 'relative',
              width: '100%',
              height: '100%',
              borderRadius: 26,
              overflow: 'hidden',
              border: '1px solid var(--border)',
              background: 'var(--card)',
            }}
          >
            {images.map((img, i) => (
              <div
                key={img.slot}
                aria-hidden={i !== imgIdx}
                style={{ position: 'absolute', inset: 0, opacity: i === imgIdx ? 1 : 0, transition: 'opacity 0.6s ease' }}
              >
                {img.src ? (
                  <img src={img.src} alt={img.alt ?? ''} style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }} />
                ) : (
                  <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <span style={{ fontFamily: mono, fontSize: 10, letterSpacing: '0.12em', color: 'var(--soft)' }}>FOTO FOLGT</span>
                  </div>
                )}
              </div>
            ))}
            <div
              style={{
                position: 'absolute',
                left: 16,
                bottom: 14,
                background: 'var(--glass)',
                border: '1px solid var(--glassbrd)',
                backdropFilter: 'blur(16px)',
                borderRadius: 999,
                padding: '7px 14px',
                fontFamily: mono,
                fontSize: 10,
                letterSpacing: '0.1em',
                color: 'var(--ink)',
                boxShadow: 'inset 0 1px 0 var(--glasshi)',
              }}
            >
              {ABOUT_CAPTIONS[imgIdx]}
            </div>
          </div>
        </div>

        <div style={{ padding: mob ? '28px 18px 64px 18px' : '150px 170px 80px 44px' }}>
          <section id="u-intro">
            <div style={{ fontFamily: mono, fontSize: 10.5, letterSpacing: '0.18em', color: 'var(--accent)' }}>{about.introKicker}</div>
            <h1 style={{ fontSize: 40, fontWeight: 700, letterSpacing: '-0.03em', lineHeight: 1.1, margin: '12px 0 0' }}>
              {about.introTitle}
            </h1>
            <p style={{ margin: '20px 0 0', fontSize: 15.5, lineHeight: 1.75, color: 'var(--muted)' }}>{about.intro}</p>
          </section>

          <section id="u-vita" style={{ marginTop: 64 }}>
            <h2 style={h2}>Vita</h2>
            {about.vita.map((p, i) => (
              <p key={i} style={{ ...para, marginTop: i === 0 ? 14 : 12 }}>
                {p}
              </p>
            ))}
          </section>

          <section id="u-werkzeuge" style={{ marginTop: 64 }}>
            <h2 style={h2}>Werkzeuge</h2>
            <ul style={{ display: 'flex', flexWrap: 'wrap', gap: 8, margin: '16px 0 0', padding: 0, listStyle: 'none' }}>
              {about.tools.map((t) => (
                <li
                  key={t}
                  style={{
                    background: 'var(--card)',
                    border: '1px solid var(--border)',
                    borderRadius: 999,
                    padding: '8px 16px',
                    fontSize: 13,
                    color: 'var(--muted)',
                  }}
                >
                  {t}
                </li>
              ))}
            </ul>
          </section>

          <section id="u-skills" style={{ marginTop: 64 }}>
            <h2 style={h2}>Skills</h2>
            <div style={{ display: 'grid', gridTemplateColumns: mob ? '1fr' : '1fr 1fr', gap: 12, marginTop: 16 }}>
              {about.skills.map((g) => (
                <div key={g.titel} style={{ background: 'var(--card)', border: '1px solid var(--border)', borderRadius: 16, padding: 18 }}>
                  <h3 style={{ fontSize: 14, fontWeight: 700, margin: '0 0 10px', color: 'var(--accent)' }}>{g.titel}</h3>
                  <ul style={{ display: 'flex', flexWrap: 'wrap', gap: 6, margin: 0, padding: 0, listStyle: 'none' }}>
                    {g.chips.map((c) => (
                      <li
                        key={c}
                        style={{
                          background: 'var(--bg)',
                          border: '1px solid var(--border)',
                          borderRadius: 999,
                          padding: '5px 11px',
                          fontSize: 11.5,
                          color: 'var(--muted)',
                        }}
                      >
                        {c}
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          </section>

          <section id="u-zertifikate" style={{ marginTop: 64 }}>
            <h2 style={h2}>Zertifikate</h2>
            <ul
              style={{
                background: 'var(--card)',
                border: '1px solid var(--border)',
                borderRadius: 16,
                padding: '8px 20px',
                margin: '16px 0 0',
                listStyle: 'none',
              }}
            >
              {about.qualifications.map((q) => (
                <li
                  key={q.datum + q.name}
                  style={{ display: 'flex', gap: 16, alignItems: 'baseline', padding: '11px 0', borderBottom: '1px solid var(--hair)' }}
                >
                  <span style={{ fontFamily: mono, fontSize: 10.5, color: 'var(--accent)', whiteSpace: 'nowrap' }}>{q.datum}</span>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: 13.5, fontWeight: 600, lineHeight: 1.4 }}>{q.name}</div>
                    <div style={{ fontSize: 11, color: 'var(--soft)', marginTop: 1 }}>{q.von}</div>
                  </div>
                </li>
              ))}
            </ul>
          </section>

          <section id="u-stationen" style={{ marginTop: 64 }}>
            <h2 style={h2}>Stationen</h2>
            {STATIONS.map((st) => (
              <div
                key={st.anchor}
                id={st.anchor}
                style={{
                  scrollMarginTop: 120,
                  marginTop: 22,
                  background: 'var(--card)',
                  border: '1px solid var(--border)',
                  borderRadius: 18,
                  padding: '22px 24px',
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', gap: 16, flexWrap: 'wrap' }}>
                  <h3 style={{ margin: 0, fontWeight: 400 }}>
                    <span style={{ fontSize: 18, fontWeight: 700 }}>{st.firma}</span>
                    <span style={{ fontSize: 13, color: 'var(--muted)', marginLeft: 10 }}>{st.rolle}</span>
                  </h3>
                  <span style={{ fontFamily: mono, fontSize: 10.5, color: 'var(--soft)' }}>{st.zeit}</span>
                </div>
                <p style={{ margin: '10px 0 0', fontSize: 13.5, lineHeight: 1.65, color: 'var(--muted)' }}>{st.desc}</p>
                {st.projekte.map((sp) => (
                  <ProjectBox key={sp.anchor} sp={sp} />
                ))}
              </div>
            ))}
          </section>

          <section id="u-loona" style={{ marginTop: 64, marginBottom: 20 }}>
            <div
              style={{
                background: 'linear-gradient(120deg,rgba(255,178,36,0.12),rgba(122,74,219,0.1))',
                border: '1px solid var(--border)',
                borderRadius: 20,
                padding: 28,
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                <LoonaTile product="ld" variant="color" size={38} decorative style={{ display: 'block', flex: 'none' }} />
                <h2 style={{ fontSize: 22, fontWeight: 700, margin: 0 }}>
                  Loona! Designs{' '}
                  <span style={{ fontFamily: mono, fontSize: 11, fontWeight: 400, color: 'var(--soft)' }}>/// the web. my passion</span>
                </h2>
                <span style={{ marginLeft: 'auto', fontFamily: mono, fontSize: 10.5, color: 'var(--soft)', whiteSpace: 'nowrap' }}>
                  seit 2001
                </span>
              </div>
              <p style={{ margin: '14px 0 0', fontSize: 14.5, lineHeight: 1.7, color: 'var(--muted)' }}>{about.loona}</p>
              {LOONA_PROJECTS.map((sp) => (
                <ProjectBox key={sp.anchor} sp={sp} />
              ))}
              <a
                href="/labs"
                onClick={(e) => {
                  if (e.metaKey || e.ctrlKey || e.shiftKey || e.button !== 0) return;
                  e.preventDefault();
                  navigate('/labs');
                }}
                className={detailStyles.textLink}
                style={{ display: 'inline-block', marginTop: 16, color: 'var(--accent)' }}
              >
                Zu den Labs ›
              </a>
            </div>
          </section>
        </div>
      </div>
      <ScrollRail targets={ABOUT_RAIL} active={active} label="Abschnitte" />
    </div>
  );
}

function ProjectBox({ sp }: { sp: StationProject }) {
  return (
    <div
      id={sp.anchor}
      style={{
        scrollMarginTop: 120,
        marginTop: 12,
        border: '1px solid var(--hair)',
        borderRadius: 14,
        padding: '16px 18px',
        background: 'var(--bg)',
      }}
    >
      <div style={{ display: 'flex', justifyContent: 'space-between', gap: 12, alignItems: 'baseline' }}>
        <h4 style={{ fontSize: 14.5, fontWeight: 700, margin: 0 }}>{sp.name}</h4>
        <span style={{ fontFamily: mono, fontSize: 10, color: 'var(--soft)', whiteSpace: 'nowrap' }}>{sp.zeit}</span>
      </div>
      <div style={{ fontSize: 12.5, color: 'var(--muted)', lineHeight: 1.6, marginTop: 5 }}>{sp.desc}</div>
      <ul style={{ display: 'flex', flexWrap: 'wrap', gap: 6, margin: '10px 0 0', padding: 0, listStyle: 'none' }}>
        {sp.stack.map((c) => (
          <li
            key={c}
            style={{
              background: 'var(--card)',
              border: '1px solid var(--border)',
              borderRadius: 8,
              padding: '5px 10px',
              fontSize: 10.5,
              fontFamily: mono,
              color: 'var(--muted)',
            }}
          >
            {c}
          </li>
        ))}
      </ul>
    </div>
  );
}
