import Phaser from 'phaser';
import { chapterByScene } from '../data/chapters';
import type { DialogueTree } from '../dialogue/types';
import { applyEffect, getFlags } from '../dialogue/flags';
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

/**
 * Opens the chapter-end card the first time a chapter's completion
 * predicate becomes true. Returns whether it has now been shown.
 */
export function handleBaseMapEnding(
  scene: Phaser.Scene,
  endingShown: boolean,
  openChapterEnd: (chapterId: string) => void,
): boolean {
  if (endingShown) return true;
  const flags = getFlags();
  const chapter = chapterByScene(scene.scene.key);
  if (!chapter || !chapter.isComplete(flags) || flags[`shown_${chapter.id}`]) return false;
  applyEffect({ set: { [`shown_${chapter.id}`]: true } });
  openChapterEnd(chapter.id);
  return true;
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
