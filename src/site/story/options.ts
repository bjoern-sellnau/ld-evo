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
