import type { CSSProperties } from 'react';
import type { MobDesign } from '../settings/schema';

/**
 * Simulierter Mobil-Modus (Desktop, Telefonrahmen 430 px, PhoneFrame.tsx): Vollbild-Flächen gehören in den Rahmen,
 * nicht über den ganzen Schreibtisch. Echte Telefone: unverändert Vollbild.
 */
export const PHONE_BOX: CSSProperties = { top: 10, bottom: 10, left: 'calc(50% - 215px)', width: 430, borderRadius: 32 };
export const FULL_BOX: CSSProperties = { top: 0, bottom: 0, left: 0, right: 0 };

/** Höhe, die Tab-Leiste bzw. Dock des Mobil-Designs unten belegen (inkl. Abstand) — für Banner, Hinweise, Full-Hero. */
export function mobBottomZone(design: MobDesign): number {
  return { proto: 82, app: 72, appv2: 140, editorial: 0, lab: 100 }[design] ?? 82;
}
