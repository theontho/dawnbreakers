/**
 * The moving water's fragment shader (see `waterLayer.ts`), in GLSL ES 1.0
 * for Phaser's `Shader` object. Works in grid space, so ripples lie flat on
 * the isometric ground and drift with the current (`uFlow`, cells a second).
 *
 * Over painted water it is a thin overlay, read through the mask in
 * `iChannel0` (red: water, green: nearness to the bank): glints on the
 * crests, a little shade in the troughs, and foam that laps at the bank.
 * As open sea (`uOpenSea`) it paints the whole sea in the style the ground
 * painter gives water (deep blue, mottled, thin pale wave lines), drifting.
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
    // The painted sea's own look (deep blue, mottled, thin pale wave lines,
    // as groundPainter drew it), drifting slowly past and shimmering a little.
    vec2 p = g - uFlow * t * 0.3;
    float mottle = noise(p * 3.0) * 0.57 + noise(p * 6.3) * 0.29 + noise(p * 12.9) * 0.14;
    float wave = sin(p.x * 7.0 + p.y * 3.0 + mottle * 5.0 + sin(t * 0.5 + p.y) * 0.6);
    vec3 colour = vec3(26.0, 52.0, 82.0) / 255.0;
    colour = mix(colour, vec3(150.0, 190.0, 210.0) / 255.0, 0.35 * step(0.93, wave));
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
