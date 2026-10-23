import Phaser from 'phaser';

type Key = Phaser.Input.Keyboard.Key;

/** A map's keys: arrows and WASD to walk, E to act, J journal, H or held Tab for highlights, Esc settings. */
export interface MapKeys {
  cursors: Phaser.Types.Input.Keyboard.CursorKeys;
  wasd: { W: Key; A: Key; S: Key; D: Key };
  interact: Key;
  journal: Key;
  highlight: Key;
  holdHighlight: Key;
  settings: Key;
}

export interface MapKeyActions {
  openJournal: () => void;
  toggleHighlights: () => void;
  holdHighlights: (held: boolean) => void;
  openSettings: () => void;
}

export function createMapKeys(scene: Phaser.Scene): MapKeys {
  const keyboard = scene.input.keyboard!;
  const { KeyCodes } = Phaser.Input.Keyboard;
  return {
    cursors: keyboard.createCursorKeys(),
    wasd: {
      W: keyboard.addKey(KeyCodes.W),
      A: keyboard.addKey(KeyCodes.A),
      S: keyboard.addKey(KeyCodes.S),
      D: keyboard.addKey(KeyCodes.D),
    },
    interact: keyboard.addKey(KeyCodes.E),
    journal: keyboard.addKey(KeyCodes.J),
    highlight: keyboard.addKey(KeyCodes.H),
    holdHighlight: keyboard.addKey(KeyCodes.TAB, true),
    settings: keyboard.addKey(KeyCodes.ESC),
  };
}

/** Runs the one-press actions for this frame (walking and E are read by movement and the prompt). */
export function pollMapKeys(keys: MapKeys, actions: MapKeyActions): void {
  const { JustDown, JustUp } = Phaser.Input.Keyboard;
  if (JustDown(keys.journal)) actions.openJournal();
  if (JustDown(keys.highlight)) actions.toggleHighlights();
  if (JustDown(keys.holdHighlight)) actions.holdHighlights(true);
  if (JustUp(keys.holdHighlight)) actions.holdHighlights(false);
  if (JustDown(keys.settings)) actions.openSettings();
}
