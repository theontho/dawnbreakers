import { BLOOM_REACH, CORE_INNER, CORE_OUTER } from './glowMath';

/**
 * One glow per canvas: a triangle over the whole canvas, and per pixel the
 * bright core (cut to the moon's phase) and the additive bloom round it,
 * both cut along the skyline (one texel per column) where the land, the
 * city or the party stands in front, dimmed below a haze band that reads as
 * a far ridge, and out of the words and panels drawn
 * over them (a mask the size of the canvas, by its alpha). The core goes
 * wherever a letter covers it and nowhere else; the bloom keeps a little
 * glare over the letters, as a bright sun does. The output is
 * premultiplied: the core covers the disc with its HDR colour, the bloom
 * adds light with no coverage of its own. See `packGlowUniforms` for the
 * uniforms' layout.
 */
export const GLOW_SHADER = /* wgsl */ `
struct Glow {
  core: vec4f,
  disc: vec4f,
  phase: vec4f,
  bloom: vec4f,
};

@group(0) @binding(0) var<uniform> glow: Glow;
@group(0) @binding(1) var skyline: texture_2d<f32>;
@group(0) @binding(2) var cover: texture_2d<f32>;

@vertex
fn vertexMain(@builtin(vertex_index) index: u32) -> @builtin(position) vec4f {
  let corner = vec2f(f32((index << 1u) & 2u), f32(index & 2u));
  return vec4f(corner * 2.0 - 1.0, 0.0, 1.0);
}

@fragment
fn fragmentMain(@builtin(position) frag: vec4f) -> @location(0) vec4f {
  let offset = frag.xy - glow.disc.xy;
  let radius = glow.disc.z;
  let feather = glow.disc.w;
  let dist = length(offset) / radius;
  let line = textureLoad(skyline, vec2i(i32(frag.x), 0), 0);
  // How much of this pixel is open sky: above the land, through the haze, and what the words and panels leave.
  let underHaze = clamp((frag.y - line.g) * 0.75, 0.0, 1.0);
  let sky = clamp((line.r - frag.y) * 0.75, 0.0, 1.0) * (1.0 - glow.bloom.w * underHaze);
  let covered = textureLoad(cover, vec2i(frag.xy), 0).a;

  let along = dot(offset, glow.phase.yz);
  let across = dot(offset, vec2f(-glow.phase.z, glow.phase.y));
  let halfChord = sqrt(max(radius * radius - across * across, 0.0));
  let lit = smoothstep(-feather, feather, along + (2.0 * glow.phase.x - 1.0) * halfChord);

  let core = (1.0 - smoothstep(${CORE_INNER.toFixed(3)}, ${CORE_OUTER.toFixed(3)}, dist)) * lit * glow.core.w * sky * (1.0 - covered);
  let reach = 1.0 - smoothstep(0.8, ${BLOOM_REACH.toFixed(3)}, dist);
  let bloom = glow.bloom.rgb * reach * reach * sky * (1.0 - 0.75 * covered);
  return vec4f(glow.core.rgb * core + bloom, core);
}
`;
