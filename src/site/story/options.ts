/**
 * Auswahl-Listen der Story-Widgets — bewusst ohne 'use client', weil der Server sie zur Validierung liest
 * (Konstanten aus Client-Modulen kämen dort nur als Client-Referenz an).
 */

export const SCREEN_OPTIONS = [
  ['finanzen', 'Finanzen'],
  ['haushalt', 'Haushaltsbuch'],
  ['liste', 'Einkaufsliste'],
  ['bestellungen', 'Bestellungen'],
  ['feed', 'Neuigkeiten'],
  ['sammlung', 'Sammlung'],
  ['lesezeichen', 'Lesezeichen'],
  ['dashboard', 'Übersicht'],
  ['limits', 'Limits & Status'],
  ['system', 'Systemwerte'],
  ['notch', 'Notch-Insel (Mac)'],
  ['spiel', 'Spiel-HUD'],
  ['editor', 'CMS-Editor'],
] as const;

/** Rahmen der App-Galerie: Geräte und Browser-Erweiterungen. */
export const DEVICE_OPTIONS = [
  ['desktop', 'Desktop-App'],
  ['phone', 'Telefon'],
  ['browser', 'Browser'],
  ['chrome', 'Chrome-Erweiterung'],
  ['safari', 'Safari-Erweiterung'],
  ['sidebar', 'Seitenleiste (Erweiterung)'],
] as const;

export const REVEAL_OPTIONS = [
  ['hoch', 'Hoch'],
  ['fade', 'Blende'],
  ['zoom', 'Zoom'],
  ['blur', 'Unschärfe'],
  ['links', 'Von links'],
  ['rechts', 'Von rechts'],
  ['kippen', 'Kippen'],
  ['keiner', 'Ohne'],
] as const;
