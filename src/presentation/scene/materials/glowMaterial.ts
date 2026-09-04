/**
 * The shader behind every node.
 *
 * Nodes are billboarded quads carrying a radial falloff, not lit geometry.
 * That choice follows the rest of the scene rather than fighting it: packets
 * and ambient dust are already additive points, so a solid unlit sphere was
 * the only hard silhouette in a field of light, and it read as a flat sticker
 * because an unlit material has no shading to give it volume.
 *
 * A quad also costs two triangles where the icosahedron cost 320, and the
 * halo — not the geometry — is what carries the sense of depth.
 */

/**
 * The quad is turned to face the camera in view space.
 *
 * The instance's rotation is discarded deliberately: the reveal animation
 * writes a uniform scale into `instanceMatrix`, and a sprite that turned with
 * the scene would eventually show the camera its edge and vanish.
 */
export const GLOW_VERTEX_SHADER = /* glsl */ `
  attribute vec3 aColor;

  varying vec3 vColor;
  varying vec2 vGlowUv;
  varying float vViewDepth;

  void main() {
    vColor = aColor;
    vGlowUv = uv;

    vec4 origin = modelViewMatrix * instanceMatrix * vec4(0.0, 0.0, 0.0, 1.0);

    // The reveal animation scales instances uniformly, so any basis column
    // carries the current radius.
    float radius = length(instanceMatrix[0].xyz);

    // planeGeometry spans -0.5..0.5, so doubling maps it to -radius..radius.
    origin.xy += position.xy * radius * 2.0;

    vViewDepth = -origin.z;
    gl_Position = projectionMatrix * origin;
  }
`

/**
 * Two falloffs stacked: a wide soft halo, and a tight core that survives it.
 *
 * One falloff alone gives either a bright disc with a hard rim or a shapeless
 * smudge. Layering them keeps a readable centre — which is what carries the
 * palette, and therefore what tells a skill from a project — while the halo
 * does the work of looking like light.
 *
 * Fog is applied by hand rather than through Three's fog chunks. The material
 * blends additively, so the correct response to distance is to contribute less
 * light, not to mix toward the fog colour.
 */
export const GLOW_FRAGMENT_SHADER = /* glsl */ `
  uniform float uFogDensity;
  uniform float uCoreTightness;
  uniform float uHaloStrength;

  varying vec3 vColor;
  varying vec2 vGlowUv;
  varying float vViewDepth;

  void main() {
    float distance = length(vGlowUv - 0.5) * 2.0;
    if (distance > 1.0) discard;

    float halo = pow(1.0 - distance, 3.6) * uHaloStrength;
    float core = pow(max(1.0 - distance * uCoreTightness, 0.0), 2.0);
    float alpha = clamp(halo + core, 0.0, 1.0);

    // Matches the scene's fogExp2, so the network still recedes into depth.
    float fogged = exp(-uFogDensity * uFogDensity * vViewDepth * vViewDepth);
    alpha *= fogged;

    if (alpha <= 0.001) discard;

    // Additive blending multiplies by alpha itself; pre-multiplying here would
    // square the falloff and collapse every halo into a point.
    gl_FragColor = vec4(vColor, alpha);
  }
`

/** How sharply the readable centre is cut out of the halo. */
export const CORE_TIGHTNESS = 4.6

/** How much of the halo survives next to the core. */
export const HALO_STRENGTH = 0.4
