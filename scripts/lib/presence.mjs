/**
 * Every distinct set of who and what is on a map, for the smoke checks.
 *
 * `installPresence` runs in the page (`page.evaluate(installPresence)`) and
 * defines `window.__presencePhases(conditional)`, which the in-page checks
 * (`occlusion.mjs`, `tapZones.mjs`) call; page functions must be
 * self-contained, so the shared helper lives on the window.
 *
 * `conditional` maps anything (a sprite, a spec) to its `present` gate. The
 * flags the gates read are found by calling them with a recording proxy;
 * every combination of up to 10 such flags is evaluated and each distinct
 * set of what is present is returned once, with the fewest flags that make
 * it. Combinations the story never reaches are included too.
 */
export function installPresence() {
  window.__presencePhases = (conditional) => {
    const gates = [...new Set(conditional.values())];
    const readFlags = (base) => {
      const read = new Set();
      const proxy = new Proxy(base, { get: (t, k) => { if (typeof k === 'string') read.add(k); return t[k]; } });
      for (const gate of gates) { try { gate(proxy); } catch { /* a gate that needs real flags */ } }
      return read;
    };
    const flags = [...readFlags({})];
    for (let i = 0; i < flags.length && flags.length <= 12; i++) {
      for (const k of readFlags({ [flags[i]]: true })) if (!flags.includes(k)) flags.push(k);
    }
    const combos = [];
    if (flags.length <= 10) {
      for (let m = 0; m < 1 << flags.length; m++) combos.push(flags.filter((_, b) => m & (1 << b)));
    } else {
      // Too many to enumerate: no flags, each one alone, and each prefix of them.
      combos.push([]);
      flags.forEach((f, i) => { combos.push([f]); combos.push(flags.slice(0, i + 1)); });
    }
    const phases = new Map();
    for (const on of combos) {
      const state = Object.fromEntries(on.map((f) => [f, true]));
      const here = new Set();
      for (const [key, gate] of conditional) { try { if (gate(state)) here.add(key); } catch { /* skip */ } }
      const sig = [...conditional.keys()].map((s) => (here.has(s) ? 1 : 0)).join('');
      if (!phases.has(sig) || phases.get(sig).on.length > on.length) phases.set(sig, { on, here });
    }
    return { flags, phases: [...phases.values()] };
  };
}
