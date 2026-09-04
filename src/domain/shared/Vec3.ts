/**
 * A point in space, as plain numbers.
 *
 * Deliberately not a Three.js Vector3: the layout contract is arithmetic, and
 * arithmetic does not need a rendering library. The adapter converts.
 */
export type Vec3 = readonly [x: number, y: number, z: number]
