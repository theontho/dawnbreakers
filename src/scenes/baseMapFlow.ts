import Phaser from 'phaser';
import { chapterByScene, type Chapter } from '../data/chapters';
import type { MapDefinition } from '../data/maps/types';
import { dialogues } from '../data/dialogues';
import type { DialogueTravel, DialogueTree } from '../dialogue/types';
import { applyEffect, getFlags } from '../dialogue/flags';
import type { DialogueLaunch } from './DialogueScene';

export function launchBaseMapDialogue(
  scene: Phaser.Scene,
  tree: DialogueTree,
  onComplete: (travel?: DialogueTravel) => void,
): void {
  scene.scene.launch('Dialogue', {
    tree,
    onComplete: (travel?: DialogueTravel) => {
      scene.scene.resume();
      onComplete(travel);
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
): void {
  if (scene.scene.isActive('ChapterEnd')) return;
  scene.scene.launch('ChapterEnd', { chapterId, from: scene.scene.key });
  scene.scene.pause();
}

/**
 * Plays the narration that says who the player is, once, on the first frame
 * after they first arrive: a map's own `opening` (an interlude seen through
 * someone else's eyes) on that map, or else the chapter's `opening` in its
 * start scene. It plays again whenever the chapter is started over from
 * chapter select (`replay`).
 */
export function scheduleOpening(
  scene: Phaser.Scene,
  map: MapDefinition,
  chapter: Chapter | undefined,
  launch: (tree: DialogueTree) => void,
  replay = false,
): void {
  const opening = openingFor(map, chapter);
  if (!opening) return;
  const tree = dialogues[opening.id];
  if (!tree) {
    console.error(`Unknown opening dialogue "${opening.id}" on ${map.key}`);
    return;
  }
  if (getFlags()[opening.seen] && !replay) return;
  scene.events.once(Phaser.Scenes.Events.UPDATE, () => {
    if (scene.scene.isActive('Dialogue')) return;
    applyEffect({ set: { [opening.seen]: true } });
    launch(tree);
  });
}

/** The opening that plays on this map, and the flag that remembers it was heard. */
function openingFor(map: MapDefinition, chapter: Chapter | undefined): { id: string; seen: string } | undefined {
  if (map.opening) return { id: map.opening, seen: `opened_${map.key}` };
  if (chapter?.opening && map.key === chapter.startScene) return { id: chapter.opening, seen: `opened_${chapter.id}` };
  return undefined;
}

/** The player's figure on this map: the map's own witness, else the chapter's, else the pilgrim. */
export function playerTexture(map: MapDefinition, chapter: Chapter | undefined): string {
  return map.player ?? chapter?.player ?? 'player';
}
