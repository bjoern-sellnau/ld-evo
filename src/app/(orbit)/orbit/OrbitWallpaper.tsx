'use client';

import { useEffect } from 'react';
import { mountOrbit } from '@/orbit/engine';
import { ORBIT_MARKUP } from '@/orbit/markup';

const STORE = 'orbit-wallpaper';
let mounted = false; // Host-Script registriert globale Listener — nur einmal pro Dokument starten (StrictMode im Dev)

interface Saved {
  current?: number;
  inputs?: Record<string, string | boolean>;
}

function read(): Saved {
  try {
    return JSON.parse(localStorage.getItem(STORE) || '{}') || {};
  } catch {
    return {};
  }
}

function write(s: Saved) {
  try {
    localStorage.setItem(STORE, JSON.stringify(s));
  } catch {
    // Speicher blockiert → ohne Persistenz weiter
  }
}

/**
 * ORBIT OS — Shader-Wallpapers. Markup, CSS, GLSL und Host-Script 1:1 aus dem Handoff (per Generator).
 * Ergänzt laut Handoff-README: Persistenz von Effekt + Tweaks und prefers-reduced-motion (Speed 0).
 */
export function OrbitWallpaper() {
  useEffect(() => {
    if (mounted) return;
    mounted = true;
    const interFamily = getComputedStyle(document.documentElement).getPropertyValue('--orbit-inter').trim() || undefined;
    const api = mountOrbit({ interFamily });
    if (!api) return;

    const panel = document.getElementById('settingsPanel');
    const inputs = panel ? [...panel.querySelectorAll<HTMLInputElement | HTMLTextAreaElement>('input[id],textarea[id]')] : [];
    const saved = read();
    const state: Saved = { current: saved.current ?? 0, inputs: { ...saved.inputs } };

    // Gespeicherte Tweaks über die echten Input-Events anwenden, damit die Engine ihre eigene Logik durchläuft.
    for (const el of inputs) {
      const v = state.inputs?.[el.id];
      if (v === undefined) continue;
      if (el instanceof HTMLInputElement && el.type === 'checkbox') {
        el.checked = v === true;
        el.dispatchEvent(new Event('change', { bubbles: true }));
      } else {
        el.value = String(v);
        el.dispatchEvent(new Event('input', { bubbles: true }));
      }
    }
    const speed = document.getElementById('tSpeed') as HTMLInputElement | null;
    if (speed && state.inputs?.tSpeed === undefined && window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      speed.value = '0';
      speed.dispatchEvent(new Event('input', { bubbles: true }));
    }
    if (typeof saved.current === 'number' && saved.current > 0) api.selectShader(saved.current);

    const save = () => {
      state.current = api.current;
      state.inputs = {};
      for (const el of inputs) {
        state.inputs[el.id] = el instanceof HTMLInputElement && el.type === 'checkbox' ? el.checked : el.value;
      }
      write(state);
    };
    panel?.addEventListener('input', save);
    panel?.addEventListener('change', save);
    // Reset-Button setzt Werte ohne Input-Event → nach dem Klick sichern.
    document.getElementById('settingsReset')?.addEventListener('click', () => setTimeout(save, 0));
    const name = document.getElementById('pickerName');
    if (name) new MutationObserver(save).observe(name, { childList: true, characterData: true, subtree: true });
  }, []);

  return <div dangerouslySetInnerHTML={{ __html: ORBIT_MARKUP }} />;
}
