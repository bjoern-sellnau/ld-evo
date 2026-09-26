'use client';

import { usePathname, useRouter } from 'next/navigation';
import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState, type ReactNode } from 'react';
import { flushSync } from 'react-dom';
import { pageVtClasses, runVt, trackVtOrigin } from '../vt/runVt';
import { applyBody } from './applyBody';
import { DEFAULT_SETTINGS, readSettings, writeSetting, type Settings } from './schema';

type Overlay = 'search' | 'settings' | 'kontakt' | 'mobileNav' | null;

interface SiteContextValue {
  settings: Settings;
  /** true, sobald die Einstellungen aus localStorage geladen sind (vorher SSR-Defaults). */
  hydrated: boolean;
  set: <K extends keyof Settings>(key: K, value: Settings[K]) => void;
  /** Viewport < 1020 px bzw. ≥ 1600 px (Prototyp: isMobile / isWide). */
  isMobile: boolean;
  isWide: boolean;
  /** Mobile-Layout aktiv (View-Mode „Mobile“ oder automatisch schmal). */
  mob: boolean;
  /** Glas-Sidebar statt Top-Pille (View-Mode „Wide“ oder Seitenmenü-Toggle ab 1600 px). */
  sideActive: boolean;
  overlay: Overlay;
  setOverlay: (o: Overlay) => void;
  toggleTheme: () => void;
  toggleAnim: () => void;
  /** Seitenwechsel mit View Transition nach gewähltem Page-Transition-Modus. */
  navigate: (href: string) => void;
}

const SiteContext = createContext<SiteContextValue | null>(null);

export function useSite(): SiteContextValue {
  const ctx = useContext(SiteContext);
  if (!ctx) throw new Error('useSite() außerhalb von <SiteProvider>');
  return ctx;
}

export function SiteProvider({ children }: { children: ReactNode }) {
  const [settings, setSettings] = useState<Settings>(DEFAULT_SETTINGS);
  const [hydrated, setHydrated] = useState(false);
  const [viewport, setViewport] = useState({ isMobile: false, isWide: false });
  const [overlay, setOverlay] = useState<Overlay>(null);
  const router = useRouter();
  const pathname = usePathname();
  const settingsRef = useRef(settings);
  settingsRef.current = settings;

  // Client-Sync nach der Hydration (SSR rendert immer die Defaults: dark, Animationen an).
  useEffect(() => {
    setSettings(readSettings(localStorage));
    setHydrated(true);
    const onResize = () => setViewport({ isMobile: window.innerWidth < 1020, isWide: window.innerWidth >= 1600 });
    onResize();
    window.addEventListener('resize', onResize);
    document.addEventListener('pointerdown', trackVtOrigin, { passive: true });
    return () => {
      window.removeEventListener('resize', onResize);
      document.removeEventListener('pointerdown', trackVtOrigin);
    };
  }, []);

  useEffect(() => {
    if (hydrated) applyBody(settings);
  }, [settings, hydrated]);

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

  const navigate = useCallback(
    (href: string) => {
      const s = settingsRef.current;
      setOverlay(null);
      if (href === window.location.pathname) return;
      runVt(
        pageVtClasses(s.pageVt),
        () =>
          new Promise<void>((resolve) => {
            const t = setTimeout(resolve, 1500);
            pending.current = () => {
              clearTimeout(t);
              resolve();
            };
            router.push(href);
          }),
        { anim: s.anim, hold: 130 },
      );
    },
    [router],
  );

  const value = useMemo<SiteContextValue>(() => {
    const vm = settings.viewMode;
    const mob = vm === 'mobile' || (vm === 'auto' && viewport.isMobile);
    const sideActive = !mob && (vm === 'wide' || (settings.navSide && viewport.isWide));
    return { settings, hydrated, set, ...viewport, mob, sideActive, overlay, setOverlay, toggleTheme, toggleAnim, navigate };
  }, [settings, hydrated, set, viewport, overlay, toggleTheme, toggleAnim, navigate]);

  return <SiteContext.Provider value={value}>{children}</SiteContext.Provider>;
}
