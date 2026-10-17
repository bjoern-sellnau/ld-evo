/**
 * Erklärungen zu den Einstellungen (Info-„i“ mit Tooltip, neu — nicht im Prototyp). Schlüssel = deutsche Beschriftung,
 * wie sie Row/Toggle im Einstellungs-Panel tragen. Texte beschreiben die Wirkung laut Code (applyBody, navContrast, …).
 */
export const SETTINGS_INFO: Record<string, { de: string; en: string }> = {
  Sprache: {
    de: 'Wechselt die Sprache der Website. Die Adresse springt auf dieselbe Seite in der anderen Sprache.',
    en: 'Switches the language of the site. The address jumps to the same page in the other language.',
  },
  Ansicht: {
    de: 'Aufbau der Seite: Desktop (Menüleiste oben), Mobile (Telefon-Ansicht, auf großen Bildschirmen simuliert), Wide (Glas-Seitenleiste links) oder Wide 2 (schmale Icon-Leiste links).',
    en: 'Page layout: Desktop (menu bar on top), Mobile (phone view, simulated on large screens), Wide (glass sidebar on the left) or Wide 2 (slim icon rail on the left).',
  },
  Gerät: {
    de: 'Rahmen der simulierten Telefon-Ansicht: ohne, Dynamic Island, Kamera-Loch oder Notch. Der Regler ändert Breite bzw. Position.',
    en: 'Frame of the simulated phone view: none, Dynamic Island, punch hole or notch. The slider changes width or position.',
  },
  'iPhone-Höhe (430 × 932)': {
    de: 'Zeigt die Telefon-Simulation in echter iPhone-Größe statt in voller Fensterhöhe.',
    en: 'Shows the phone simulation at real iPhone size instead of the full window height.',
  },
  Darstellung: {
    de: 'Dunkles oder helles Farbschema der ganzen Website.',
    en: 'Dark or light color scheme for the whole site.',
  },
  'Browser-Farbe': {
    de: 'Farbe der Browser-Leiste (theme-color, z. B. Safari auf dem iPhone): Markenfarbe des Logos oder der aktuelle Seitenhintergrund.',
    en: 'Color of the browser bar (theme-color, e.g. Safari on iPhone): the logo’s brand color or the current page background.',
  },
  Akzentfarbe: {
    de: 'Farbe für Hervorhebungen: aktive Menüpunkte, Buttons, Schalter und Links.',
    en: 'Color for highlights: active menu items, buttons, switches and links.',
  },
  Transparenz: {
    de: 'Wie durchsichtig die Glasflächen (Menü, Panels, Karten) sind — von sehr klar bis deckend.',
    en: 'How see-through the glass surfaces (menu, panels, cards) are — from very clear to opaque.',
  },
  Material: {
    de: 'Stil der Glasflächen: Liquid (Lichtkanten und Lichtbrechung), Glas (klassisches Milchglas) oder Fluent (ruhiger, eckiger, mit feinem Rauschen).',
    en: 'Style of the glass surfaces: Liquid (light edges and refraction), Glass (classic frosted glass) or Fluent (calmer, squarer, with fine noise).',
  },
  'Hero-Animation': {
    de: 'Animierter Hintergrund im großen Bereich oben auf der Startseite.',
    en: 'Animated background of the large area at the top of the home page.',
  },
  'Splash-Animation': {
    de: 'Welche Intro-Animation beim Laden der Website läuft (wenn „Splash-Screen“ an ist).',
    en: 'Which intro animation plays when the site loads (if “Splash screen” is on).',
  },
  'Mobil-Design': {
    de: 'Gestaltung der Telefon-Ansicht: Prototyp, App (Tab-Leiste und Bottom-Sheet), App v2, Editorial (Magazin-Stil) oder Lab (experimentell).',
    en: 'Design of the phone view: Prototype, App (tab bar and bottom sheet), App v2, Editorial (magazine style) or Lab (experimental).',
  },
  'Mobil-Logo': {
    de: 'Wie das Logo oben in der Telefon-Ansicht erscheint: Glas-Pille, Pille mit Schriftzug, App-Kachel oder erst beim Scrollen.',
    en: 'How the logo appears at the top of the phone view: glass pill, pill with wordmark, app tile or only after scrolling.',
  },
  'Negativ-Farbe': {
    de: 'Farbe des Negativ-Logos. „Auto“ passt sie dem Hintergrund an, damit das Logo immer gut lesbar bleibt.',
    en: 'Color of the negative logo. “Auto” adapts it to the background so the logo always stays readable.',
  },
  Favicon: {
    de: 'Symbol im Browser-Tab. Die Auswahl wirkt sofort.',
    en: 'Icon in the browser tab. The choice applies immediately.',
  },
  'Menü-Elemente': {
    de: 'Einzelne Seiten und Werkzeuge in der Menüleiste ein- oder ausblenden. Die Einstellungen bleiben immer über Shift + S erreichbar.',
    en: 'Show or hide individual pages and tools in the menu bar. Settings always stay reachable with Shift + S.',
  },
  'Menü-Abstand': {
    de: 'Innenabstand der Menüleiste für die aktuelle Seite — oben, rechts, unten und links getrennt. Jede Hauptseite merkt sich ihre eigenen Werte; Detailseiten übernehmen die ihrer Liste. In Wide 2 wirken nur oben und unten.',
    en: 'Inner padding of the menu bar for the current page — top, right, bottom and left separately. Each main page keeps its own values; detail pages use those of their list. In Wide 2 only top and bottom apply.',
  },
  'Alle vier gleich': {
    de: 'Koppelt die vier Regler: Verschieben eines Reglers setzt oben, rechts, unten und links auf denselben Wert.',
    en: 'Links the four sliders: moving one sets top, right, bottom and left to the same value.',
  },
  Farbschema: {
    de: 'Knopf in der Menüleiste zum Umschalten zwischen hell und dunkel.',
    en: 'Button in the menu bar to switch between light and dark.',
  },
  Suche: { de: 'Knopf für die Suche (auch mit ⌘K / Strg+K).', en: 'Button for search (also with ⌘K / Ctrl+K).' },
  'Animationen an/aus': {
    de: 'Knopf in der Menüleiste, der alle Animationen pausiert bzw. startet.',
    en: 'Button in the menu bar that pauses or starts all animations.',
  },
  Einstellungen: {
    de: 'Zahnrad für dieses Panel. Ausgeblendet bleibt es per Shift + S erreichbar.',
    en: 'Gear button for this panel. When hidden it stays reachable with Shift + S.',
  },
  Seitenmenü: {
    de: 'Knopf, der das Menü auf breiten Bildschirmen als Seitenleiste links anzeigt.',
    en: 'Button that shows the menu as a sidebar on the left on wide screens.',
  },
  Kontakt: { de: 'Kontakt-Button am Ende der Menüleiste.', en: 'Contact button at the end of the menu bar.' },
  'Zähler-Animation': {
    de: 'Wie der laufende Sekundenzähler auf der Startseite umblättert: schlicht, als Walze oder als Fallblatt.',
    en: 'How the running seconds counter on the home page changes: plain, rolling digits or split-flap.',
  },
  'Tech-Layout': {
    de: 'Darstellung der .Tech-Übersicht: Karten-Raster, Magazin mit Titelgeschichte und Inhaltsverzeichnis oder Blog mit versetzten Kacheln (Masonry) samt Anlesetext und Lesezeit.',
    en: 'Layout of the .Tech overview: card grid, magazine with cover story and table of contents, or blog with staggered tiles (masonry) including excerpt and reading time.',
  },
  'Footer-Marke': {
    de: 'Marke links im Footer: „Loona! Designs“ mit farbigem „!“, einfarbig oder als LD-Logo.',
    en: 'Brand on the left of the footer: “Loona! Designs” with colored “!”, single-colored or as the LD logo.',
  },
  'Footer-Zusatz': {
    de: 'Freier Text hinter der Marke, z. B. „/// the web. my passion“. Leer lassen blendet ihn aus.',
    en: 'Free text after the brand, e.g. “/// the web. my passion”. Leave empty to hide it.',
  },
  Copyright: {
    de: 'Copyright-Zeile in der Mitte des Footers: eine Vorlage wählen oder frei eingeben. Leer lassen blendet sie aus.',
    en: 'Copyright line in the middle of the footer: pick a preset or type your own. Leave empty to hide it.',
  },
  'Footer-Links': {
    de: 'Links rechts im Footer (LinkedIn, GitHub, Impressum, Sprache) als Text oder als Symbole.',
    en: 'Links on the right of the footer (LinkedIn, GitHub, legal notice, language) as text or as icons.',
  },
  'Page-Transition': {
    de: 'Animation beim Wechsel zwischen Seiten.',
    en: 'Animation when switching between pages.',
  },
  'Detailseiten immer schlicht (Fade)': {
    de: 'Beim Öffnen und Verlassen von Projekt-, Labs- und Artikelseiten immer nur sanft überblenden.',
    en: 'Always use a gentle fade when opening or leaving project, labs and article pages.',
  },
  'Aurora-Preset': {
    de: 'Farbstimmung der Aurora-Animation.',
    en: 'Color mood of the Aurora animation.',
  },
  Farben: {
    de: 'Farbpalette der gewählten Hero-Animation — vorgefertigt oder eigene Farben.',
    en: 'Color palette of the selected hero animation — preset or custom colors.',
  },
  'Hero-Text': {
    de: 'Farbe der Texte im oberen Bereich der Startseite: automatisch, weiß, schwarz, nach Kontrast oder eine eigene Farbe.',
    en: 'Color of the texts in the top area of the home page: automatic, white, black, by contrast or a custom color.',
  },
  'Hero-Text pro Element': {
    de: 'Farbe, Stil, Deckkraft und Schatten einzeln für Titel, Name, Jobtitel, Intro, Job-Leiste und die beiden Buttons.',
    en: 'Color, style, opacity and shadow individually for titles, name, job title, intro, job bar and both buttons.',
  },
  'Schatten-Stärke': {
    de: 'Wie kräftig der Kontrast-Schatten hinter der Menüschrift ist.',
    en: 'How strong the contrast shadow behind the menu text is.',
  },
  'Cinematic-Texte (Matrix)': {
    de: 'Eigene Texte und Schriftgröße für das Matrix-Intro.',
    en: 'Custom texts and font size for the Matrix intro.',
  },
  'Funken-Dichte': { de: 'Wie viele Funken die Feuer-Animation zeigt.', en: 'How many sparks the fire animation shows.' },
  'Rauch-Dichte': { de: 'Wie dicht der Rauch der Feuer-Animation ist.', en: 'How dense the smoke of the fire animation is.' },
  'Rauch-Farbe': { de: 'Farbe des Rauchs der Feuer-Animation.', en: 'Color of the smoke in the fire animation.' },
  'Funken-Farbe': { de: 'Farbe der Funken der Feuer-Animation.', en: 'Color of the sparks in the fire animation.' },
  Größe: { de: 'Größe des Motivs der Hero-Animation.', en: 'Size of the hero animation’s motif.' },
  'Links / Rechts': { de: 'Waagerechte Position des Motivs.', en: 'Horizontal position of the motif.' },
  'Oben / Unten': { de: 'Senkrechte Position des Motivs.', en: 'Vertical position of the motif.' },
  Winkel: { de: 'Neigung bzw. Drehung des Motivs.', en: 'Tilt or rotation of the motif.' },
  'Hintergrund transparent': {
    de: 'Die Hero-Animation ohne eigenen Hintergrund — die Seitenfarbe scheint durch.',
    en: 'The hero animation without its own background — the page color shows through.',
  },
  'High Contrast': {
    de: 'Dunklerer Hintergrund und kräftigere Ränder für bessere Lesbarkeit.',
    en: 'Darker background and stronger borders for better readability.',
  },
  Schatten: { de: 'Schatten unter Karten, Menü und Panels.', en: 'Shadows under cards, menu and panels.' },
  Blur: {
    de: 'Weichzeichnung hinter Glasflächen. Aus: klares Glas, spart Rechenleistung.',
    en: 'Blur behind glass surfaces. Off: clear glass, saves processing power.',
  },
  Refraction: {
    de: 'Lichtbrechung an den Kanten der Glasflächen (Liquid-Glass-Effekt).',
    en: 'Light refraction at the edges of glass surfaces (liquid glass effect).',
  },
  'Auto-Kontrast': {
    de: 'Misst den Hintergrund hinter dem Menü und passt Schrift und Glas an, damit alles lesbar bleibt.',
    en: 'Measures the background behind the menu and adapts text and glass so everything stays readable.',
  },
  'Opposite Color': {
    de: 'Bei sehr hellem bzw. dunklem Hintergrund schaltet das Menü auf das Gegen-Farbschema um.',
    en: 'On a very light or dark background the menu switches to the opposite color scheme.',
  },
  'Kontrast-Schatten': {
    de: 'Zusätzlicher Schatten hinter der Menüschrift, wenn der Hintergrund unruhig ist.',
    en: 'Extra shadow behind the menu text when the background is busy.',
  },
  'Scroll-BG': {
    de: 'Beim Scrollen erscheint hinter dem Menü ein ruhiger Hintergrundstreifen (mit Auto-Kontrast).',
    en: 'When scrolling, a calm background strip appears behind the menu (with auto contrast).',
  },
  'Cover-Farbe': {
    de: 'Detailseiten füllen den Kopfbereich ganz in der Projektfarbe; aus: abgerundete Karte mit Akzentfarbe.',
    en: 'Detail pages fill the header entirely with the project color; off: rounded card with the accent color.',
  },
  Flat: {
    de: 'Glas ohne Glanz, Lichtkante und Rauschen — flache, ruhige Flächen.',
    en: 'Glass without sheen, light edge and noise — flat, calm surfaces.',
  },
  Animationen: {
    de: 'Alle Bewegungen der Website an oder aus (Hero, Übergänge, Zähler).',
    en: 'All motion on the site on or off (hero, transitions, counters).',
  },
  'Full-Hero': {
    de: 'Der obere Bereich der Startseite füllt den ganzen Bildschirm.',
    en: 'The top area of the home page fills the whole screen.',
  },
  'Full-Hero: Stats-Leiste': {
    de: 'Beim Full-Hero bleibt die Zeile mit Zähler und Kennzahlen am unteren Rand sichtbar.',
    en: 'With full hero, the row with counter and key figures stays visible at the bottom.',
  },
  'Splash-Screen': { de: 'Intro-Animation beim ersten Laden der Website.', en: 'Intro animation when the site first loads.' },
  'Reise: Bild-Hintergrund': {
    de: 'Auf „Meine Reise“ liegt das Bild der aktuellen Station weichgezeichnet im Hintergrund.',
    en: 'On “My Journey” the image of the current station sits blurred in the background.',
  },
  'Logo negativ': {
    de: 'Zeigt das Logo als Negativ — die Buchstaben L und D entstehen aus dem freien Raum.',
    en: 'Shows the logo as a negative — the letters L and D are formed by the empty space.',
  },
  'Logo only negative (nur LD)': {
    de: 'Vom Negativ-Logo nur die Buchstaben L und D — ohne Spalt und Fuge.',
    en: 'Only the letters L and D of the negative logo — without gap and joint.',
  },
  'Logo-Farbe: Auto (Kontrast)': {
    de: 'Das Logo wechselt je nach Hintergrund zwischen farbiger und dunkler Kachel — animiert.',
    en: 'The logo switches between colored and dark tile depending on the background — animated.',
  },
  'Kontakt-Button: Auto (Kontrast)': {
    de: 'Der Kontakt-Button färbt sich wie das Logo nach dem Hintergrund, statt immer in der Akzentfarbe.',
    en: 'The contact button takes its color from the background like the logo, instead of always using the accent color.',
  },
  'Performance-Modus': {
    de: 'Hero-Animation mit geringerer Auflösung — schont Akku und schwächere Geräte.',
    en: 'Hero animation at lower resolution — easier on battery and weaker devices.',
  },
  '30 fps Hero': {
    de: 'Hero-Animation mit halber Bildrate — spart Rechenleistung.',
    en: 'Hero animation at half frame rate — saves processing power.',
  },
  'Cinematic (Matrix)': {
    de: 'Matrix-Hero mit eingetipptem Film-Intro.',
    en: 'Matrix hero with a typed film-style intro.',
  },
  'Hero-Text danach': {
    de: 'Nach dem Matrix-Intro erscheint der normale Hero-Text.',
    en: 'After the Matrix intro the normal hero text appears.',
  },
  'Modern Mobile-Nav': {
    de: 'Moderne Tab-Leiste unten mit Logo in der Mitte (Telefon-Ansicht).',
    en: 'Modern tab bar at the bottom with the logo in the middle (phone view).',
  },
  'Leiste beim Scrollen ausblenden': {
    de: 'Beim Runterscrollen verschwindet die Leiste, beim Hochscrollen kommt sie zurück.',
    en: 'The bar hides when scrolling down and returns when scrolling up.',
  },
  'Menü beim Scrollen einklappen': {
    de: 'Beim Runterscrollen klappt die Menüleiste auf Logo und Knopf ein; hochscrollen oder Knopf klappt sie wieder aus.',
    en: 'When scrolling down the menu bar folds to logo and button; scrolling up or the button unfolds it.',
  },
  'Logo ohne Schriftzug': {
    de: 'Im Menü nur das LD-Zeichen, ohne „loona! designs“.',
    en: 'Only the LD mark in the menu, without “loona! designs”.',
  },
};

/** Erklärung zu einer (deutschen) Beschriftung in der aktuellen Sprache, sonst undefined. */
export function settingInfo(label: string, locale: string): string | undefined {
  const e = SETTINGS_INFO[label];
  return e ? (locale === 'en' ? e.en : e.de) : undefined;
}
