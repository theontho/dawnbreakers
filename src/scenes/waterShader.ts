/**
 * The moving water's fragment shader (see `waterLayer.ts`), in GLSL ES 1.0
 * for Phaser's `Shader` object. Works in grid space, so ripples lie flat on
 * the isometric ground and drift with the current (`uFlow`, cells a second).
 *
 * Over painted water it is a thin overlay, read through the mask in
 * `iChannel0` (red: water, green: nearness to the bank): glints on the
 * crests, a little shade in the troughs, and foam that laps at the bank.
 * As open sea (`uOpenSea`) it paints the whole sea, deep blue with long
 * swells, whitecaps and glints.
 *
 * Output is premultiplied, as Phaser blends.
 */
export const WATER_FRAGMENT = /* glsl */ `
precision mediump float;

uniform float time;
uniform vec2 resolution;
uniform sampler2D iChannel0;
uniform vec2 uOrigin;
uniform vec2 uCorner;
uniform vec2 uMaskOffset;
uniform vec2 uMaskSize;
uniform vec2 uFlow;
uniform float uOpenSea;

varying vec2 fragCoord;

float hash(vec2 p) {
  return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453);
}

float noise(vec2 p) {
  vec2 i = floor(p);
  vec2 f = fract(p);
  vec2 u = f * f * (3.0 - 2.0 * f);
  return mix(mix(hash(i), hash(i + vec2(1.0, 0.0)), u.x), mix(hash(i + vec2(0.0, 1.0)), hash(i + vec2(1.0, 1.0)), u.x), u.y);
}

/** Grid coordinates of a world point: cell (x, y) spans [x, x + 1). */
vec2 toGrid(vec2 world) {
  vec2 d = vec2((world.x - uOrigin.x) / 32.0, (world.y - uOrigin.y) / 16.0);
  return vec2((d.x + d.y) * 0.5 + 0.5, (d.y - d.x) * 0.5 + 0.5);
}

/** The water's surface, about -1 to 1: long swells and smaller wind ripples, carried by the current. */
float surface(vec2 g, float t) {
  vec2 p = g - uFlow * t;
  float swell = sin(dot(p, vec2(0.9, 0.5)) * 2.2 + t * 0.9) * 0.45
              + sin(dot(p, vec2(-0.4, 1.0)) * 1.7 - t * 0.7) * 0.3;
  float ripple = noise(p * 2.6 + vec2(t * 0.35, -t * 0.25)) + noise(p * 5.3 - vec2(t * 0.5, t * 0.2)) * 0.5;
  return swell + (ripple - 0.75) * 0.9;
}

void main() {
  vec2 local = vec2(fragCoord.x, resolution.y - fragCoord.y);
  vec2 g = toGrid(uCorner + local);
  float t = time;
  float h = surface(g, t);
  float glint = smoothstep(0.62, 0.95, h) * (0.5 + 0.5 * noise(g * 9.0 + t * 1.3));
  float trough = smoothstep(-0.25, -0.85, h);

  if (uOpenSea > 0.5) {
    vec3 deep = vec3(0.09, 0.19, 0.30);
    vec3 shallow = vec3(0.18, 0.33, 0.43);
    vec3 colour = mix(deep, shallow, clamp(h * 0.45 + 0.45, 0.0, 1.0));
    colour = mix(colour, vec3(0.05, 0.11, 0.19), trough * 0.5);
    float cap = smoothstep(0.9, 1.15, h) * smoothstep(0.55, 0.8, noise(g * 3.0 - uFlow * t * 1.2));
    colour = mix(colour, vec3(0.85, 0.9, 0.92), cap * 0.6);
    colour += vec3(0.55, 0.65, 0.7) * glint * 0.35;
    gl_FragColor = vec4(colour, 1.0);
    return;
  }

  vec4 mask = texture2D(iChannel0, (uMaskOffset + local) / uMaskSize);
  float water = mask.r;
  if (water < 0.01) {
    gl_FragColor = vec4(0.0);
    return;
  }
  float shore = mask.g;
  // Foam that runs up the bank and back, unevenly along it.
  float lap = 0.5 + 0.5 * sin(t * 1.4 + noise(g * 1.7) * 6.0);
  float foam = smoothstep(0.55 + 0.3 * lap, 1.0, shore) * (0.55 + 0.45 * noise(g * 6.0 + t * 0.4));
  float light = clamp(glint * 0.3 + foam * 0.45, 0.0, 1.0) * water;
  float shade = trough * 0.14 * water * (1.0 - foam);
  vec3 lit = mix(vec3(0.75, 0.86, 0.92), vec3(0.93, 0.95, 0.94), foam);
  gl_FragColor = vec4(lit * light, light + shade * (1.0 - light));
}
`;
