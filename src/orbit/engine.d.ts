/** Typen für das generierte Host-Script (engine.js). */
export interface OrbitApi {
  selectShader(i: number): void;
  readonly current: number;
}
export function mountOrbit(opts?: { interFamily?: string }): OrbitApi | undefined;
