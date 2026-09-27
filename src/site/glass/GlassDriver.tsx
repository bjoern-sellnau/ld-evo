'use client';

import { usePathname } from 'next/navigation';
import { useEffect, useRef } from 'react';
import { useSite } from '../settings/SiteProvider';
import { adjustNavContrast, createContrastMemo } from './navContrast';
import { createRefractionMemo, refreshGlassFilters } from './refraction';

/**
 * Führt Auto-Kontrast und Glas-Refraktion so oft aus wie der Prototyp (componentDidUpdate + Scroll + Resize):
 * bei jeder Einstellungs-/Routen-/Overlay-Änderung, beim Scrollen, bei Größenänderungen und wenn Glasflächen
 * im DOM hinzukommen oder ihre Größe ändern (z. B. Zurück-Pill mit Schreibmaschinen-Effekt).
 */
export function GlassDriver() {
  const site = useSite();
  const pathname = usePathname();
  const live = useRef({ s: site.settings, overlayOpen: false });
  live.current = { s: site.settings, overlayOpen: site.overlay !== null };
  const contrast = useRef(createContrastMemo());
  const refr = useRef(createRefractionMemo());

  const runContrast = () => adjustNavContrast(() => live.current, contrast.current);
  const runRefr = () => refreshGlassFilters(live.current.s, refr.current);
  const fns = useRef({ runContrast, runRefr });
  fns.current = { runContrast, runRefr };

  // Wie componentDidUpdate: nach jeder relevanten Änderung.
  useEffect(() => {
    if (!site.hydrated) return;
    fns.current.runContrast();
    fns.current.runRefr();
  }, [site.hydrated, site.settings, site.overlay, site.mob, site.sideActive, pathname]);

  useEffect(() => {
    if (!site.hydrated) return;
    const on = () => fns.current.runContrast();
    const onResize = () => {
      fns.current.runContrast();
      fns.current.runRefr();
    };
    window.addEventListener('scroll', on, { passive: true });
    window.addEventListener('resize', onResize);
    // Glasflächen beobachten: neue Elemente (Overlays, Back-Pill) und Größenänderungen → Filter neu bauen.
    let raf = 0;
    const schedule = () => {
      if (!raf)
        raf = requestAnimationFrame(() => {
          raf = 0;
          onResize();
        });
    };
    const ro = new ResizeObserver(schedule);
    const observed = new Set<Element>();
    const scan = () => {
      document.querySelectorAll('[data-ldfrost]').forEach((el) => {
        if (!observed.has(el)) {
          observed.add(el);
          ro.observe(el);
        }
      });
      for (const el of observed) {
        if (!el.isConnected) {
          ro.unobserve(el);
          observed.delete(el);
        }
      }
    };
    scan();
    const mo = new MutationObserver((recs) => {
      if (recs.some((r) => r.addedNodes.length || r.removedNodes.length)) {
        scan();
        schedule();
      }
    });
    mo.observe(document.body, { childList: true, subtree: true });
    // Prototyp: der Sekunden-Tick (state.tick) löst componentDidUpdate und damit eine neue Messung aus.
    const iv = setInterval(() => {
      if (!document.hidden) on();
    }, 1000);
    return () => {
      window.removeEventListener('scroll', on);
      window.removeEventListener('resize', onResize);
      ro.disconnect();
      mo.disconnect();
      clearInterval(iv);
      cancelAnimationFrame(raf);
    };
  }, [site.hydrated]);

  return null;
}
