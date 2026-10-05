import type { CSSProperties } from 'react';
import type { MobDesign } from '../settings/schema';

/**
 * Simulierter Mobil-Modus (Desktop, Telefonrahmen 430 px, PhoneFrame.tsx): Vollbild-Flächen gehören in den Rahmen,
 * nicht über den ganzen Schreibtisch. Echte Telefone: unverändert Vollbild.
 */
export const PHONE_BOX: CSSProperties = { top: 10, bottom: 'var(--ld-pb, 10px)', left: 'calc(50% - 215px)', width: 430, borderRadius: 32 };

/**
 * Unterkante des Telefonrahmens: Abstand zum Fensterrand (--ld-pb, setzt PhoneFrame). Normal 10 px; mit
 * „iPhone-Höhe“ ist der Rahmen höchstens 932 px hoch, darunter bleibt mehr Schreibtisch. `simBottom(x)` rechnet
 * einen für 10 px gedachten Abstand x um, damit Tab-Leisten & Co. am Rahmen statt am Fenster kleben.
 */
export const simBottom = (x: number) => `calc(var(--ld-pb, 10px) + ${x - 10}px)`;
/** Sichtbare Höhe im Rahmen (--ld-vh), außerhalb der Simulation die kleine Viewport-Höhe. */
export const SIM_VH = 'var(--ld-vh, 100svh)';
export const FULL_BOX: CSSProperties = { top: 0, bottom: 0, left: 0, right: 0 };

/**
 * Höhe, die Tab-Leiste bzw. Dock des Mobil-Designs unten belegen (inkl. Abstand) — für Banner, Hinweise, Full-Hero.
 * barHidden („Leiste beim Scrollen ausblenden“, Startseite oben): Prototyp/App ohne Leiste, App v2 nur noch die
 * Glasknöpfe (Suche) an der Stelle der Leiste.
 */
export function mobBottomZone(design: MobDesign, barHidden = false): number {
  if (barHidden && (design === 'proto' || design === 'app' || design === 'appv2')) return design === 'appv2' ? 76 : 12;
  return { proto: 82, app: 72, appv2: 140, editorial: 0, lab: 100 }[design] ?? 82;
}
