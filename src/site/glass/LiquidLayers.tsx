/**
 * Liquid-Glass-Schichten für große Flächen (App-v2-Menü, mobile Suche) — derselbe Aufbau wie die Desktop-Leiste
 * (GlassSurface): Frost mit Refraktion (data-ldfrost, Filter aus refraction.ts) UNTER einer halbdurchsichtigen Tönung,
 * darüber Kantenlicht (data-ldedge), Rand (data-ldrim) und ein langsam wandernder Glanz (data-ldglow).
 * Wichtig: Der Container selbst darf KEIN backdrop-filter und keinen deckenden Hintergrund haben — sonst sehen die
 * Schichten den Seiteninhalt nicht mehr (Backdrop-Root) und das Glas wirkt wie eine Platte.
 */
export function LiquidLayers({ radius }: { radius: string }) {
  const r = { borderRadius: radius };
  return (
    <>
      <div data-ldfrost="1" aria-hidden style={r} />
      <div aria-hidden className="ld-liquid-tint" style={r} />
      <div data-ldedge="1" aria-hidden style={r} />
      <div data-ldrim="1" aria-hidden style={r} />
      <div data-ldglow="1" aria-hidden className="ld-liquid-sheen" style={r} />
    </>
  );
}
