import Phaser from 'phaser';
import { findGlossaryTerms } from '../../data/glossary';
import { hideGlossaryTip, scheduleHide, showGlossaryTip } from './glossaryTooltip';

/**
 * Makes the glossary words inside a rendered Phaser text hoverable and
 * tappable. Phaser draws text to a canvas, so there are no word elements:
 * instead each wrapped line is measured with the text's own font to find
 * where a word sits (from the right for right-to-left lines), and a faint
 * dotted underline and an invisible zone are laid over it.
 *
 * Zones and underlines are added beside the text (to `container` when the
 * text lives in one, so they scroll with it) and are destroyed with it.
 */
export function attachGlossary(
  scene: Phaser.Scene,
  text: Phaser.GameObjects.Text,
  container?: Phaser.GameObjects.Container,
): void {
  const lines = text.getWrappedText();
  const ctx = text.context;
  const style = text.style;
  const padding = { left: text.padding.left ?? 0, right: text.padding.right ?? 0, top: text.padding.top ?? 0 };
  const metrics = text.getTextMetrics();
  const lineHeight = metrics.fontSize + text.lineSpacing;
  const innerWidth = text.width - padding.left - padding.right;
  const left = text.x - text.originX * text.displayWidth;
  const top = text.y - text.originY * text.displayHeight;
  const rtlText = style.rtl;
  ctx.save();
  // The same font string Phaser builds for the text.
  ctx.font = [style.fontStyle, style.fontSize, style.fontFamily].join(' ').trim();
  const objects: Phaser.GameObjects.GameObject[] = [];
  const underline = scene.add.graphics().setDepth(text.depth).setScrollFactor(text.scrollFactorX, text.scrollFactorY);
  objects.push(underline);
  lines.forEach((line, i) => {
    const hits = findGlossaryTerms(line);
    if (hits.length === 0) return;
    const lineWidth = ctx.measureText(line).width;
    let start = padding.left;
    if (rtlText) start = padding.left + innerWidth - lineWidth;
    else if (style.align === 'right') start = padding.left + innerWidth - lineWidth;
    else if (style.align === 'center') start = padding.left + (innerWidth - lineWidth) / 2;
    const y = top + padding.top + i * lineHeight;
    for (const hit of hits) {
      const before = ctx.measureText(line.slice(0, hit.start)).width;
      const width = ctx.measureText(line.slice(hit.start, hit.end)).width;
      // A right-to-left line runs from its right edge.
      const x = left + (rtlText ? start + lineWidth - before - width : start + before);
      const baseline = y + metrics.ascent + 3;
      // A dotted underline: round dots, clearly visible but quieter than the text.
      underline.fillStyle(0xe8c878, 0.9);
      for (let u = 1; u < width; u += 3.5) underline.fillCircle(x + u, baseline, 0.85);
      const zone = scene.add.zone(x, y, width, metrics.fontSize + 4).setOrigin(0)
        .setScrollFactor(text.scrollFactorX, text.scrollFactorY)
        .setInteractive({ cursor: 'help' });
      const anchor = () => pageRect(scene, zone);
      zone.on('pointerover', (pointer: Phaser.Input.Pointer) => {
        if (pointer.wasTouch) return;
        showGlossaryTip(hit.entry, anchor(), false);
      });
      zone.on('pointerout', () => scheduleHide());
      // Touch has no hover, so a tap pins the card until the next tap; with a
      // mouse the card simply follows the pointer.
      zone.on('pointerdown', (pointer: Phaser.Input.Pointer, _x: number, _y: number, event: Phaser.Types.Input.EventData) => {
        event.stopPropagation();
        showGlossaryTip(hit.entry, anchor(), pointer.wasTouch);
      });
      objects.push(zone);
    }
  });
  ctx.restore();
  if (container) container.add(objects);
  text.once(Phaser.GameObjects.Events.DESTROY, () => {
    objects.forEach(o => o.destroy());
    hideGlossaryTip();
  });
}

/** A game object's bounds in page pixels, through the canvas's on-page size. */
function pageRect(scene: Phaser.Scene, object: Phaser.GameObjects.Zone): { left: number; top: number; right: number; bottom: number } {
  const canvas = scene.game.canvas.getBoundingClientRect();
  const sx = canvas.width / scene.scale.width;
  const sy = canvas.height / scene.scale.height;
  const b = object.getBounds();
  return { left: canvas.left + b.x * sx, top: canvas.top + b.y * sy, right: canvas.left + b.right * sx, bottom: canvas.top + b.bottom * sy };
}
