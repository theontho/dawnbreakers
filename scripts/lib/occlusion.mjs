/**
 * Occlusion check for the smoke test: how much of each interaction point
 * (person, story object, door) is hidden behind things drawn in front of it.
 *
 * `measureOcclusion` runs in the page (pass it to `page.evaluate` with the
 * scene key); it must stay self-contained. For each interactable it samples
 * a 12 x 16 grid over its sprite and keeps the points where the sprite is
 * opaque; a point is covered when any other world sprite drawn later (a
 * building, tree, wall piece, prop or another person) is opaque there too.
 * Covered fraction = covered points / opaque points. Alpha is read from each
 * texture's own pixels through the sprite's origin, scale and rotation.
 *
 * - The player's reveal masks (holes cut in scenery near the player) are
 *   ignored: they never help anyone else, so this measures without them.
 *   The player sprite, speech marks, x-ray ghosts, lights and HUD (depth
 *   8990 and above, additive or screen-fixed layers) never count as cover.
 * - Doors, and story objects the scenery draws, have no sprite of their own: the door is painted on a building or
 *   wall piece (its owner). They are measured as a doorway, a 24 x 48 px
 *   column on the owner's face at the door cell (on the south or east face
 *   when the cell is on that edge), keeping only points where the owner is
 *   opaque, covered by anything drawn after the owner. A door on no owner
 *   is measured as a person standing on its cell.
 * - Exits are judged as a group, all the widened cells of one way out: a
 *   cell is hidden when more than 60% of its ground diamond is under
 *   anything opaque, and the exit fails only when fewer than half of its
 *   cells can be seen (a tree over two cells of a five-cell road is fine).
 *   An exit whose road leaves through a gateway within five cells of the
 *   edge (a non-blocking building such as a city gate or a mosque portal, or
 *   a gap of up to five cells in a row of buildings such as a colonnade) is
 *   marked by that gateway, which stands in view, and is not measured.
 * - Presence: each distinct set of who-and-what is present (`presence.mjs`,
 *   which must be installed on the page first) is measured once, including
 *   combinations the story never reaches, so the worst case reported names
 *   the flags it needs.
 */

/** Runs in the page. Returns per-interactable worst coverage over all presence sets. */
export function measureOcclusion(key) {
  const game = window.__game;
  const scene = game.scene.getScene(key);
  const def = scene.definition;
  const TOP_WORLD_DEPTH = 8990;
  const COLS = 12;
  const ROWS = 16;
  const SOLID = 128;
  // Only what stands lower on the screen can hide a thing. Whatever shares its cell or its
  // row is composed with it: a rug or carpet under an exit, a skiff moored on it, a pair of
  // slippers at a threshold, the same person drawn as scenery in another phase.
  const SAME_ROW = 6;

  // --- texture alpha, read once per frame ---
  const alphaCache = new Map();
  const alphaOf = (frame) => {
    const id = `${frame.texture.key}#${frame.name}`;
    if (alphaCache.has(id)) return alphaCache.get(id);
    let entry = null;
    try {
      const w = frame.cutWidth;
      const h = frame.cutHeight;
      const canvas = document.createElement('canvas');
      canvas.width = w;
      canvas.height = h;
      const ctx = canvas.getContext('2d', { willReadFrequently: true });
      ctx.drawImage(frame.source.image, frame.cutX, frame.cutY, w, h, 0, 0, w, h);
      entry = { w, h, data: ctx.getImageData(0, 0, w, h).data };
    } catch {
      entry = null;
    }
    alphaCache.set(id, entry);
    return entry;
  };
  // Alpha of sprite `o` at world point (wx, wy), or 0 outside it.
  const alphaAt = (o, wx, wy) => {
    const a = alphaOf(o.frame);
    if (!a) return 0;
    const cos = Math.cos(o.rotation);
    const sin = Math.sin(o.rotation);
    const dx = wx - o.x;
    const dy = wy - o.y;
    const px = Math.floor((cos * dx + sin * dy) / o.scaleX + o.displayOriginX);
    const py = Math.floor((-sin * dx + cos * dy) / o.scaleY + o.displayOriginY);
    if (px < 0 || py < 0 || px >= a.w || py >= a.h) return 0;
    return a.data[(py * a.w + px) * 4 + 3];
  };
  const toWorld = (o, px, py) => {
    const lx = (px - o.displayOriginX) * o.scaleX;
    const ly = (py - o.displayOriginY) * o.scaleY;
    const cos = Math.cos(o.rotation);
    const sin = Math.sin(o.rotation);
    return { x: o.x + cos * lx - sin * ly, y: o.y + sin * lx + cos * ly };
  };

  // --- the world's sprites, in draw order ---
  const order = new Map();
  scene.children.list
    .map((o, i) => ({ o, i }))
    .sort((a, b) => a.o.depth - b.o.depth || a.i - b.i)
    .forEach(({ o }, rank) => order.set(o, rank));
  const worldSprites = scene.children.list.filter((o) => (o.type === 'Image' || o.type === 'Sprite')
    && o !== scene.player
    && o.depth < TOP_WORLD_DEPTH
    && o.depth > -500
    && o.scrollFactorX === 1
    && o.blendMode === 0
    && o.alpha > 0.2);

  // Name each building and prop by its texture and cell, to find it in the map file.
  const where = new Map();
  // A building is drawn as several slices; each world sprite is named for what it shows.
  for (const o of scene.occludableSprites) if (o.name) where.set(o, o.name);

  // Which sprite belongs to which conditional person or prop.
  const conditional = new Map();
  for (const { item, sprite } of scene.conditionalDecor) conditional.set(sprite, item.present);
  const used = new Set(scene.occludableSprites);
  const npcSprites = def.npcs.map((spec) => {
    const pos = scene.gridToScreen(spec.gridX, spec.gridY);
    const sprite = worldSprites.find((o) => !used.has(o) && o.texture.key === spec.texture
      && Math.abs(o.x - pos.sx) < 0.5 && Math.abs(o.depth - (pos.sy + 1)) < 0.5);
    if (sprite) {
      used.add(sprite);
      where.set(sprite, `${spec.texture} ${spec.gridX},${spec.gridY}`);
      if (spec.present) conditional.set(sprite, spec.present);
    }
    // A story object the scenery draws (a door in a wall) has no sprite: its spec stands in.
    if (!spec.texture && spec.present) conditional.set(spec, spec.present);
    return { spec, sprite };
  });

  // --- presence sets (`presence.mjs`, installed on the page) ---
  const { flags, phases } = window.__presencePhases(conditional);

  // --- sample points per interactable ---
  const spriteSamples = (o) => {
    const a = alphaOf(o.frame);
    const pts = [];
    if (!a) return pts;
    for (let r = 0; r < ROWS; r++) {
      for (let c = 0; c < COLS; c++) {
        const px = Math.floor(((c + 0.5) * a.w) / COLS);
        const py = Math.floor(((r + 0.5) * a.h) / ROWS);
        if (a.data[(py * a.w + px) * 4 + 3] > 64) pts.push(toWorld(o, px + 0.5, py + 0.5));
      }
    }
    return pts;
  };
  const columnSamples = (cx, footY, w, h) => {
    const pts = [];
    for (let r = 0; r < ROWS; r++) {
      for (let c = 0; c < COLS; c++) pts.push({ x: cx - w / 2 + ((c + 0.5) * w) / COLS, y: footY - h + ((r + 0.5) * h) / ROWS });
    }
    return pts;
  };
  const doorSamples = (door) => {
    const pos = scene.gridToScreen(door.gridX, door.gridY);
    const owners = [];
    let face = { x: pos.sx, y: pos.sy + 16 };
    for (const b of scene.buildings) {
      if (door.gridX < b.gridX || door.gridX >= b.gridX + b.w || door.gridY < b.gridY || door.gridY >= b.gridY + b.h) continue;
      const front = scene.gridToScreen(b.gridX + b.w - 1, b.gridY + b.h - 1);
      const sprite = scene.occludableSprites.find((o) => o.texture.key === b.texture && Math.abs(o.x - front.sx) < 0.5);
      if (sprite) owners.push(sprite);
      const south = door.gridY === b.gridY + b.h - 1;
      const east = door.gridX === b.gridX + b.w - 1;
      if (south !== east) face = { x: pos.sx + (east ? 16 : -16), y: pos.sy + 8 };
    }
    scene.decor.forEach((d, i) => {
      if (d.gridX === door.gridX && d.gridY === door.gridY) owners.push(scene.occludableSprites[scene.buildings.length + i]);
    });
    if (owners.length === 0) {
      return { pts: [...columnSamples(pos.sx, pos.sy + 16, 24, 40), ...columnSamples(pos.sx, pos.sy + 16, 48, 16)], after: order.get(scene.player) - 1, owners };
    }
    const pts = columnSamples(face.x, face.y, 24, 48).filter((p) => owners.some((o) => alphaAt(o, p.x, p.y) >= SOLID));
    return { pts, after: Math.max(...owners.map((o) => order.get(o))), owners };
  };

  // Exits are judged as a group: all the widened cells of one way out.
  const exitGroups = new Map();
  for (const e of scene.exits) {
    const id = `${e.targetScene} ${e.dx},${e.dy}`;
    if (!exitGroups.has(id)) exitGroups.set(id, { label: e.label, cells: [] });
    exitGroups.get(id).cells.push(e);
  }
  // A road that leaves through a gateway (a gate or portal the player walks through, a
  // building that does not block) is marked by that gateway, which stands in plain view:
  // the last cells beyond it may lie behind the wall it pierces.
  // So is a road through a gap in a row of buildings (a colonnade, a town wall's gate bay).
  const GATEWAY_REACH = 5;
  const GAP_HALF = 2;
  const building = (x, y, gateway) => def.buildings.some((b) => (!gateway || b.blocks === false)
    && x >= b.gridX && x < b.gridX + b.w && y >= b.gridY && y < b.gridY + b.h);
  const throughGateway = (e) => {
    const lx = e.dx === 0 ? 1 : 0;
    const ly = 1 - lx;
    for (let k = 0; k <= GATEWAY_REACH; k++) {
      const x = e.fromX - e.dx * k;
      const y = e.fromY - e.dy * k;
      if (building(x, y, true)) return true;
      const side = (s) => Array.from({ length: GAP_HALF + 1 }, (_, i) => i + 1).some((d) => building(x + lx * s * d, y + ly * s * d, false));
      if (!building(x, y, false) && side(1) && side(-1)) return true;
    }
    return false;
  };
  for (const [id, group] of exitGroups) if (group.cells.some(throughGateway)) exitGroups.delete(id);
  const diamondSamples = (gx, gy) => {
    const pos = scene.gridToScreen(gx, gy);
    const pts = [];
    for (let r = 0; r < 8; r++) {
      for (let c = 0; c < 12; c++) {
        const u = ((c + 0.5) / 12) * 2 - 1;
        const v = ((r + 0.5) / 8) * 2 - 1;
        if (Math.abs(u) + Math.abs(v) <= 0.95) pts.push({ x: pos.sx + u * 32, y: pos.sy + v * 16 });
      }
    }
    return pts;
  };
  const coverOf = (pts, cover) => {
    const bounds = cover.map((o) => o.getBounds());
    const by = new Map();
    let covered = 0;
    for (const p of pts) {
      let hit;
      for (let j = 0; j < cover.length && !hit; j++) {
        const b = bounds[j];
        if (p.x >= b.x && p.x < b.right && p.y >= b.y && p.y < b.bottom && alphaAt(cover[j], p.x, p.y) >= SOLID) hit = cover[j];
      }
      if (!hit) continue;
      covered++;
      const name = where.get(hit) ?? hit.texture.key;
      by.set(name, (by.get(name) ?? 0) + 1);
    }
    return { fraction: pts.length ? covered / pts.length : 0, by };
  };

  const results = new Map();
  const exitResults = new Map();
  for (const { on, here } of phases) {
    const visible = (o) => (conditional.has(o) ? here.has(o) : o.visible);
    const onGround = worldSprites.filter((o) => visible(o));
    for (const [id, group] of exitGroups) {
      const by = new Map();
      let hidden = 0;
      for (const cell of group.cells) {
        const sy = scene.gridToScreen(cell.fromX, cell.fromY).sy;
        const c = coverOf(diamondSamples(cell.fromX, cell.fromY), onGround.filter((o) => o.depth > sy + SAME_ROW));
        if (c.fraction <= 0.6) continue;
        hidden++;
        for (const [k, n] of c.by) by.set(k, (by.get(k) ?? 0) + n);
      }
      const prev = exitResults.get(id);
      if (!prev || hidden > prev.hidden) {
        exitResults.set(id, {
          name: group.label, at: group.cells.map((c) => `${c.fromX},${c.fromY}`).join(' '), cells: group.cells.length, hidden,
          by: [...by.entries()].sort((a, b) => b[1] - a[1]).map(([k]) => k).slice(0, 3), flags: on,
        });
      }
    }
    const targets = [
      ...npcSprites.filter((n) => n.sprite && visible(n.sprite)).map((n) => ({
        name: n.spec.prompt, at: `${n.spec.gridX},${n.spec.gridY}`, pts: spriteSamples(n.sprite), after: order.get(n.sprite), owners: [n.sprite],
      })),
      ...npcSprites.filter((n) => !n.spec.texture && (!n.spec.present || here.has(n.spec))).map((n) => ({
        name: n.spec.prompt, at: `${n.spec.gridX},${n.spec.gridY}`, door: true, ...doorSamples(n.spec),
      })),
      ...scene.doors.interactables.map((d) => ({ name: d.prompt, at: `${d.gridX},${d.gridY}`, door: true, ...doorSamples(d) })),
    ];
    for (const t of targets) {
      if (t.pts.length === 0) continue;
      const cover = worldSprites.filter((o) => order.get(o) > t.after && !t.owners.includes(o) && visible(o)
        && (t.door || o.depth > t.owners[0].depth + SAME_ROW));
      const { fraction, by } = coverOf(t.pts, cover);
      const id = `${t.name}@${t.at}`;
      const prev = results.get(id);
      if (!prev || fraction > prev.fraction) {
        results.set(id, {
          name: t.name.replace(/\s*\[E\]$/, ''),
          at: t.at,
          door: !!t.door,
          fraction,
          samples: t.pts.length,
          by: [...by.entries()].sort((a, b) => b[1] - a[1]).map(([k]) => k).slice(0, 3),
          flags: on,
        });
      }
    }
  }
  return { phases: phases.length, flags, results: [...results.values()], exits: [...exitResults.values()] };
}

export const HIDDEN = 0.6;
export const COVERED = 0.35;

/** Smoke lines for one scene: errors (more than 60% hidden) and notes (more than 35%). */
export function occlusionReport({ results, exits }) {
  const errors = [];
  const notes = [];
  // An exit may lose some of its cells behind a tree; it fails when fewer than half can be seen.
  for (const e of exits) {
    if (e.hidden === 0) continue;
    const when = e.flags.length ? ` (with ${e.flags.join(', ')})` : '';
    const line = `exit "${e.label ?? e.name}" (${e.at}) has ${e.hidden} of ${e.cells} cells hidden by ${e.by.join(', ')}${when}`;
    if ((e.cells - e.hidden) * 2 < e.cells) errors.push(`hidden: ${line}`);
    else notes.push(`covered: ${line}`);
  }
  for (const r of results.sort((a, b) => b.fraction - a.fraction)) {
    const pct = Math.round(r.fraction * 100);
    const when = r.flags.length ? ` (with ${r.flags.join(', ')})` : '';
    const line = `${r.name} at ${r.at} is ${pct}% covered by ${r.by.join(', ')}${when}`;
    if (r.fraction > HIDDEN) errors.push(`hidden: ${line}`);
    else if (r.fraction > COVERED) notes.push(`covered: ${line}`);
  }
  return { errors, notes };
}
