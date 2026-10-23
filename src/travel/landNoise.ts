/** Smooth 1D value noise in [0, 1], the same for the same seed and x. */
export function valueNoise(seed: number, x: number): number {
  const i = Math.floor(x);
  const f = x - i;
  const t = f * f * (3 - 2 * f);
  return lattice(seed, i) * (1 - t) + lattice(seed, i + 1) * t;
}

/**
 * Three octaves of noise for a skyline: `ridged` 0 gives rolling swells,
 * 1 folds each octave into sharp crests like a mountain range.
 */
export function skyline(seed: number, x: number, ridged: number): number {
  let total = 0;
  let amplitude = 0.62;
  let frequency = 1;
  let norm = 0;
  for (let octave = 0; octave < 3; octave += 1) {
    const n = valueNoise(seed + octave * 101, x * frequency);
    const crest = 1 - Math.abs(2 * n - 1);
    total += (n * (1 - ridged) + crest * ridged) * amplitude;
    norm += amplitude;
    amplitude *= 0.45;
    frequency *= 2.3;
  }
  return total / norm;
}

/** A stable random number in [0, 1) for an integer cell. */
export function lattice(seed: number, i: number): number {
  let h = (seed ^ Math.imul(i, 0x27d4eb2d)) >>> 0;
  h = Math.imul(h ^ (h >>> 15), 0x85ebca6b);
  h = Math.imul(h ^ (h >>> 13), 0xc2b2ae35);
  return ((h ^ (h >>> 16)) >>> 0) / 4294967296;
}
