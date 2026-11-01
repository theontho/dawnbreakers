/**
 * The moving water's fragment shader (see `waterLayer.ts`), in GLSL ES 1.0
 * for Phaser's `Shader` object. Works in grid space, so ripples lie flat on
 * the isometric ground and drift with the current (`uFlow`, cells a second).
 *
 * Both draw water in the style the ground painter always gave it: thin pale
 * wave lines over mottled blue, here drifting with the current. Over painted
 * water (rivers, canals, pools) only the lines are drawn, through the mask in
 * `iChannel0` (red: water); as open sea (`uOpenSea`) the whole sea is.
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

void main() {
  vec2 local = vec2(fragCoord.x, resolution.y - fragCoord.y);
  vec2 g = toGrid(uCorner + local);
  float t = time;
  // The painted water's look (thin pale wave lines over mottled blue, as
  // groundPainter drew it), carried along by the current and shimmering a little.
  vec2 p = g - uFlow * t * 0.3;
  float mottle = noise(p * 3.0) * 0.57 + noise(p * 6.3) * 0.29 + noise(p * 12.9) * 0.14;
  float wave = sin(p.x * 7.0 + p.y * 3.0 + mottle * 5.0 + sin(t * 0.5 + p.y) * 0.6);
  float line = step(0.93, wave);
  vec3 crest = vec3(150.0, 190.0, 210.0) / 255.0;

  if (uOpenSea > 0.5) {
    gl_FragColor = vec4(mix(vec3(26.0, 52.0, 82.0) / 255.0, crest, 0.35 * line), 1.0);
    return;
  }

  // Over painted water: only the lines, as the mask says where the water is.
  float water = texture2D(iChannel0, (uMaskOffset + local) / uMaskSize).r;
  float alpha = 0.35 * line * water;
  gl_FragColor = vec4(crest * alpha, alpha);
}
`;
