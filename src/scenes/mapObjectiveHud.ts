import Phaser from 'phaser';
import { playSfx } from '../audio';
import type { Chapter } from '../data/chapters';
import type { FlagState } from '../dialogue/types';
import { formatNumber, localizedStyle, rtl, t, textOriginX } from '../i18n';
import { isNarrowLayout, MIN_TOUCH_TARGET, responsiveFont, safeLayout } from '../ui/responsive';

/**
 * The objective tracker under the map title: the first unfinished
 * objective of the current chapter, with a soft pulse whenever it changes.
 */

export function currentObjectiveText(chapter: Chapter | undefined, flags: FlagState): string | undefined {
  const objective = chapter?.story.objectives.find(o => !o.done(flags));
  if (!objective) return undefined;
  const text = t(objective.text);
  const progress = objective.progress?.(flags);
  return progress ? `${text} (${formatNumber(progress.current)}/${formatNumber(progress.total)})` : text;
}

export interface ObjectiveHud {
  update(flags: FlagState): void;
}

export function createObjectiveHud(scene: Phaser.Scene, chapter: Chapter | undefined, titleBottom: number, depth: number): ObjectiveHud {
  const size = { width: scene.scale.width, height: scene.scale.height };
  const safe = safeLayout(size);
  const narrow = isNarrowLayout(size);
  const text = scene.add.text(rtl ? safe.right : safe.x, titleBottom + 6, '', localizedStyle({
    fontFamily: 'Georgia, serif',
    fontSize: responsiveFont(narrow ? 13 : 15, size, 11),
    color: '#f3d98a',
    fontStyle: 'italic',
    backgroundColor: '#0a0806aa',
    padding: { x: 8, y: 4 },
    // On narrow screens stay clear of the three HUD buttons in the top corner.
    wordWrap: { width: narrow ? Math.max(120, safe.width - MIN_TOUCH_TARGET * 3 - 34) : Math.min(safe.width * 0.42, 460) },
  })).setOrigin(textOriginX(0), 0).setScrollFactor(0).setDepth(depth);
  let last: string | undefined;

  const update = (flags: FlagState): void => {
    const value = currentObjectiveText(chapter, flags);
    if (value === last) return;
    const changed = last !== undefined;
    last = value;
    text.setVisible(value !== undefined);
    if (value === undefined) return;
    text.setText(rtl ? `${value} ◆` : `◆ ${value}`);
    if (changed) {
      playSfx('objective');
      scene.tweens.killTweensOf(text);
      text.setAlpha(0).setScale(1.04);
      scene.tweens.add({ targets: text, alpha: 1, scale: 1, duration: 600, ease: 'Sine.easeOut' });
    }
  };
  return { update };
}
