/**
 * Medien der Reise-Seite, zugeordnet über die Slot-IDs des Prototyps:
 * `ld-shot-<jahr>` (Karten-Screenshot) und `ld-mini-<jahr>[-s<schritt>]-1|2` (Einblicke je Station/Zwischenschritt).
 * Im Prototyp Drag&Drop-Slots; hier leer, bis Bilder/Videos über das CMS gepflegt werden (keine Stock-Fotos).
 */
export interface JourneyMedia {
  src: string;
  alt: string;
  video?: boolean;
}

export const JOURNEY_MEDIA: Record<string, JourneyMedia> = {};
