import Phaser from 'phaser';
import { chapterByScene } from '../data/chapters';
import type { DialogueTree } from '../dialogue/types';
import { applyEffect, getFlags } from '../dialogue/flags';
import { t } from '../i18n';
import type { DialogueLaunch } from './DialogueScene';

export function launchBaseMapDialogue(
  scene: Phaser.Scene,
  tree: DialogueTree,
  setMobileControlsVisible: (visible: boolean) => void,
  onComplete: () => void,
): void {
  setMobileControlsVisible(false);
  scene.scene.launch('Dialogue', {
    tree,
    onComplete: () => {
      scene.scene.resume();
      setMobileControlsVisible(true);
      onComplete();
    },
  } as DialogueLaunch);
  scene.scene.pause();
}

export function handleBaseMapEnding(
  scene: Phaser.Scene,
  endingShown: boolean,
  showBanner: (text: string, opts?: { holdMs?: number; onComplete?: () => void }) => void,
  openChapterEnd: (chapterId: string) => void,
): boolean {
  if (endingShown) return true;
  const flags = getFlags();
  const chapter = chapterByScene(scene.scene.key);
  const chapterFreshlyDone = !!chapter && chapter.isComplete(flags)
    && !flags[`shown_${chapter.id}`];
  const ending = flags.ending as string | undefined;
  const shouldShowFirstLetterBanner = chapter?.id === 'shiraz'
    && !!ending
    && !flags[`shown_${chapter.id}`];

  if (shouldShowFirstLetterBanner) {
    showBanner(endingBannerText(ending), {
      onComplete: chapterFreshlyDone ? () => openChapterEnd(chapter!.id) : undefined,
    });
    if (chapterFreshlyDone) {
      applyEffect({ set: { [`shown_${chapter!.id}`]: true } });
    }
    return true;
  }

  if (chapterFreshlyDone) {
    applyEffect({ set: { [`shown_${chapter!.id}`]: true } });
    openChapterEnd(chapter!.id);
  }
  return endingShown;
}

export function openBaseMapChapterEnd(
  scene: Phaser.Scene,
  chapterId: string,
  setMobileControlsVisible: (visible: boolean) => void,
): void {
  if (scene.scene.isActive('ChapterEnd')) return;
  setMobileControlsVisible(false);
  scene.scene.launch('ChapterEnd', { chapterId, from: scene.scene.key });
  scene.scene.pause();
}

export function showBaseMapBanner(
  scene: Phaser.Scene,
  banner: Phaser.GameObjects.Text,
  text: string,
  opts: { holdMs?: number; onComplete?: () => void } = {},
): void {
  const holdMs = opts.holdMs ?? 1800;
  scene.tweens.killTweensOf(banner);
  banner.setText(text).setAlpha(0);
  scene.tweens.add({
    targets: banner,
    alpha: 1,
    duration: 300,
    onComplete: () => {
      scene.tweens.add({
        targets: banner,
        alpha: 0,
        delay: holdMs,
        duration: 500,
        onComplete: opts.onComplete,
      });
    },
  });
}

export function endingBannerText(ending: string): string {
  return ending === 'firstLetter'
    ? t('— The First Letter of the Living —')
    : t('— You walk on into the night —');
}
