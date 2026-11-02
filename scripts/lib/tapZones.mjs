/**
 * Tap-zone check for the smoke test: on a phone every person, story object
 * and door must be a fingertip's target of its own, at least 44 points
 * across (`src/scenes/tapZones.ts`), and no two such zones may overlap at
 * the zoom phones open maps at. Exits are wide strips of ground and are not
 * tap items. Checked in every distinct set of who is present
 * (`presence.mjs`, which must be installed on the page first), so two
 * people who never stand there together may share ground. Things on the
 * same cell are one tap item: a map gives each phase of a person or object
 * its own entry on that cell (one leaves as the other arrives).
 *
 * `measureTapZones` runs in the page (pass it to `page.evaluate` with the
 * scene key) and must stay self-contained.
 */
export function measureTapZones(key) {
  const scene = window.__game.scene.getScene(key);
  const items = scene.npcs.everyone;
  const conditional = new Map(items.filter((i) => i.present).map((i) => [i, i.present]));
  const { phases } = window.__presencePhases(conditional);
  const zones = new Map(items.map((i) => [i, scene.tapZoneOf(i)]));
  const name = (i) => `"${i.prompt.replace(/\s*\[E\]$/, '')}" at ${i.gridX},${i.gridY}`;
  const overlaps = new Map();
  for (const { on, here } of phases) {
    const present = items.filter((i) => !i.present || here.has(i));
    for (let a = 0; a < present.length; a++) {
      for (let b = a + 1; b < present.length; b++) {
        if (present[a].gridX === present[b].gridX && present[a].gridY === present[b].gridY) continue;
        const za = zones.get(present[a]);
        const zb = zones.get(present[b]);
        const w = Math.min(za.right, zb.right) - Math.max(za.x, zb.x);
        const h = Math.min(za.bottom, zb.bottom) - Math.max(za.y, zb.y);
        if (w <= 0.5 || h <= 0.5) continue;
        const id = `${name(present[a])} / ${name(present[b])}`;
        if (!overlaps.has(id) || overlaps.get(id).flags.length > on.length) {
          overlaps.set(id, { id, w: Math.round(w * scene.phoneZoom), h: Math.round(h * scene.phoneZoom), flags: on });
        }
      }
    }
  }
  return [...overlaps.values()];
}

/** Smoke lines for one scene: every overlap is an error. */
export function tapZoneReport(overlaps) {
  return overlaps.map((o) => {
    const when = o.flags.length ? ` (with ${o.flags.join(', ')})` : '';
    return `tap zones overlap: ${o.id} by ${o.w}x${o.h} pt${when}`;
  });
}
