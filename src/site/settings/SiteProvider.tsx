'use client';

import { usePathname, useRouter } from 'next/navigation';
import { createContext, useLayoutEffect, useCallback, useContext, useEffect, useMemo, useRef, useState, type ReactNode } from 'react';
import { flushSync } from 'react-dom';
import { REVEAL_MODES, WILD_MODES, pageVtClasses, runVt, trackVtOrigin } from '../vt/runVt';
import { applyBody, applyThemeColor } from './applyBody';
import { DEFAULT_SETTINGS, readSettings, writeSetting, type MobDesign, type Settings } from './schema';
import { useHitCounter } from '../stats/useHitCounter';
import { useLocale } from '../i18n/LocaleProvider';
import { canonicalPath, localizePath } from '../i18n/locale';
import { sitePath } from '../lib/routes';

type Overlay = 'search' | 'settings' | 'kontakt' | 'mobileNav' | null;

interface SiteContextValue {
  settings: Settings;
  /** true, sobald die Einstellungen aus localStorage geladen sind (vorher SSR-Defaults). */
  hydrated: boolean;
  set: <K extends keyof Settings>(key: K, value: Settings[K]) => void;
  /** Viewport < 1020 px bzw. ≥ 1600 px (Prototyp: isMobile / isWide). */
  isMobile: boolean;
  isWide: boolean;
  /** Viewport < 480 px (Logo nur als Zeichen). */
  isNarrow: boolean;
  /** Mobile-Layout aktiv (View-Mode „Mobile“ oder automatisch schmal). */
  mob: boolean;
  /** Glas-Sidebar statt Top-Pille (View-Mode „Wide“ oder Seitenmenü-Toggle ab 1600 px). */
  sideActive: boolean;
  /** Wide 2: Icon-Leiste statt Seitenleiste (sideActive ist dann ebenfalls true). */
  railMode: boolean;
  /** Belegte Breite links durch Seitenleiste bzw. Icon-Leiste (0 ohne). */
  sideW: number;
  /** Aktives Mobil-Design (nur mobil, sonst 'proto'). */
  mobDesign: MobDesign;
  overlay: Overlay;
  setOverlay: (o: Overlay) => void;
  toggleTheme: () => void;
  toggleAnim: () => void;
  /** Seitenwechsel mit View Transition nach gewähltem Page-Transition-Modus. */
  navigate: (href: string, opts?: { keepVt?: boolean }) => void;
  /** Karte → Detail: nur die geklickte Karte bekommt einen view-transition-name (vtTarget-Gating, Nachtrag v20). */
  openItem: (href: string, id: string) => void;
  /** Id des Items, dessen Karte/Hero gerade morphen darf. */
  vtTarget: string | null;
  /** Morph-freundlicher Transition-Modus (kein Clip-Reveal). */
  morphOk: boolean;
  /** Herkunftsseite der aktuellen Detailseite, z. B. '/labs' — für „‹ Zurück“. */
  from: string | null;
}

const SiteContext = createContext<SiteContextValue | null>(null);

/** Detailseiten: /projekte/<slug>, /labs/<slug>, /tech/<slug> (in jeder Sprache, z. B. /en/projects/<slug>). */
export const isDetailPath = (p: string) => /^\/(projekte|labs|tech)\/[^/]+\/?$/.test(canonicalPath(p));

export function useSite(): SiteContextValue {
  const ctx = useContext(SiteContext);
  if (!ctx) throw new Error('useSite() außerhalb von <SiteProvider>');
  return ctx;
}

export function SiteProvider({ children }: { children: ReactNode }) {
  const [settings, setSettings] = useState<Settings>(DEFAULT_SETTINGS);
  const [hydrated, setHydrated] = useState(false);
  const [viewport, setViewport] = useState({ isMobile: false, isWide: false, isNarrow: false });
  const [overlay, setOverlay] = useState<Overlay>(null);
  const router = useRouter();
  const pathname = usePathname();
  const locale = useLocale();
  useHitCounter(pathname);
  const settingsRef = useRef(settings);
  useLayoutEffect(() => {
    settingsRef.current = settings;
  });

  // CLS-Schutz (site.css): sobald das Layout mit echter Bildschirmbreite gerendert ist — vor dem Zeichnen — sichtbar machen.
  useLayoutEffect(() => {
    if (hydrated) document.documentElement.classList.add('ldvp');
  }, [hydrated, viewport]);

  // Client-Sync nach der Hydration (SSR rendert immer die Defaults: dark, Animationen an).
  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect -- Einstellungen stehen nur im Browser (localStorage) — SSR rendert Defaults, danach übernehmen
    setSettings(readSettings(localStorage));
    setHydrated(true);
    const onResize = () =>
      setViewport({ isMobile: window.innerWidth < 1020, isWide: window.innerWidth >= 1600, isNarrow: window.innerWidth < 480 });
    onResize();
    window.addEventListener('resize', onResize);
    document.addEventListener('pointerdown', trackVtOrigin, { passive: true });
    return () => {
      window.removeEventListener('resize', onResize);
      document.removeEventListener('pointerdown', trackVtOrigin);
    };
  }, []);

  useEffect(() => {
    if (!hydrated) return;
    applyBody(settings);
    applyThemeColor(settings.themeColor);
  }, [settings, hydrated]);

  // Mobil-Design als Body-Klasse (md-app / md-editorial / md-lab) — Inhalte werden per CSS umgestaltet (site.css).
  const vm = settings.viewMode;
  const mobNow = vm === 'mobile' || (vm === 'auto' && viewport.isMobile);
  const md = mobNow ? settings.mobDesign : 'proto';
  useEffect(() => {
    const cl = document.body.classList;
    // App v2 erbt die Inhalts-Umgestaltung von App (md-app) und ergänzt md-appv2.
    for (const d of ['app', 'editorial', 'lab']) cl.toggle(`md-${d}`, md === d || (d === 'app' && md === 'appv2'));
    cl.toggle('md-appv2', md === 'appv2');
  }, [md]);

  // Esc schließt Overlays, ⌘K/Strg+K schaltet die Suche (Prototyp: _esc).
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setOverlay(null);
      if ((e.metaKey || e.ctrlKey) && !e.altKey && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        setOverlay((o) => (o === 'search' ? null : 'search'));
      }
    };
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, []);

  const set = useCallback(<K extends keyof Settings>(key: K, value: Settings[K]) => {
    writeSetting(localStorage, key, value);
    setSettings((s) => ({ ...s, [key]: value }));
  }, []);

  const toggleTheme = useCallback(() => {
    const next = settingsRef.current.theme === 'light' ? 'dark' : 'light';
    writeSetting(localStorage, 'theme', next);
    // Theme-Iris vom Klickpunkt; ohne 'ldvt' → keine Nav-/Karten-Morph-Gruppen (Nachtrag v21).
    runVt(
      ['ldvt-theme'],
      () => {
        flushSync(() => setSettings((s) => ({ ...s, theme: next })));
        applyBody({ ...settingsRef.current, theme: next });
      },
      { anim: settingsRef.current.anim },
    );
  }, []);

  const toggleAnim = useCallback(() => set('anim', !settingsRef.current.anim), [set]);

  // Route-Wechsel innerhalb einer View Transition: das Update-Callback wartet, bis die neue Route committed ist.
  const pending = useRef<(() => void) | null>(null);
  useEffect(() => {
    pending.current?.();
    pending.current = null;
  }, [pathname]);

  const [vtTarget, setVtTarget] = useState<string | null>(null);
  const [from, setFrom] = useState<string | null>(null);

  const navigate = useCallback(
    (target: string, opts?: { keepVt?: boolean }) => {
      const s = settingsRef.current;
      setOverlay(null);
      // Aufrufer übergeben kanonische (deutsche) Pfade; hier wird daraus die Adresse der aktuellen Sprache.
      const href = localizePath(target, locale);
      // Ohne Basispfad (GitHub-Pages-Vorschau: /ld-evo/…) und ohne abschließenden Schrägstrich (trailingSlash im
      // statischen Export) — sonst führte „Zurück“ zu /ld-evo/ld-evo/…, und der Vergleich mit href schlüge fehl.
      const current = sitePath(window.location.pathname);
      if (href === current) return;
      const detailNav = isDetailPath(href) || isDetailPath(current);
      if (isDetailPath(href) && !isDetailPath(current)) setFrom(current);
      // „Detailseiten immer schlicht (Fade)“ (ld-detailplain) erzwingt Fade bei Detail-Navigation.
      const mode = s.detailPlain && detailNav ? 'fade' : s.pageVt || 'fade';
      runVt(
        pageVtClasses(mode),
        () =>
          new Promise<void>((resolve) => {
            const t = setTimeout(resolve, 1500);
            pending.current = () => {
              clearTimeout(t);
              resolve();
            };
            if (!opts?.keepVt) flushSync(() => setVtTarget(null));
            router.push(href);
          }),
        { anim: s.anim, hold: 130 },
      );
    },
    [router, locale],
  );

  const openItem = useCallback(
    (href: string, id: string) => {
      flushSync(() => setVtTarget(id));
      // Zwei Frames warten, damit die Karte ihren Namen im alten Snapshot trägt (Prototyp: mkCard.go).
      requestAnimationFrame(() => requestAnimationFrame(() => navigate(href, { keepVt: true })));
    },
    [navigate],
  );

  const value = useMemo<SiteContextValue>(() => {
    const vm = settings.viewMode;
    const mob = vm === 'mobile' || (vm === 'auto' && viewport.isMobile);
    const railMode = !mob && vm === 'wide2';
    const sideActive = !mob && (vm === 'wide' || railMode || (settings.navSide && viewport.isWide));
    // Seitenleiste: 18 + 224 px; Icon-Leiste: 16 + 64 px
    const sideW = !sideActive ? 0 : railMode ? 80 : 242;
    const morphOk = ![...REVEAL_MODES, ...WILD_MODES].includes(settings.pageVt || 'fade');
    const mobDesign: MobDesign = mob ? settings.mobDesign : 'proto';
    return {
      settings,
      hydrated,
      set,
      ...viewport,
      mob,
      sideActive,
      railMode,
      sideW,
      mobDesign,
      overlay,
      setOverlay,
      toggleTheme,
      toggleAnim,
      navigate,
      openItem,
      vtTarget,
      morphOk,
      from,
    };
  }, [settings, hydrated, set, viewport, overlay, toggleTheme, toggleAnim, navigate, openItem, vtTarget, from]);

  return <SiteContext.Provider value={value}>{children}</SiteContext.Provider>;
}
