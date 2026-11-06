export type FlagOp = { set?: Record<string, boolean | number | string>; };

/** The chapters' mini-games, by scene key (see `src/scenes/minigames/`). */
export type MiniGameId =
  | 'LampGame' | 'InkGame' | 'CoffeeGame' | 'TabarsiRationGame' | 'ZanjanRationGame' | 'CurtainGame' | 'LanesGame';

export interface DialogueChoice {
  text: string;
  next?: string;          // id of next node; if omitted, dialogue ends
  requires?: (flags: FlagState) => boolean;
  effect?: FlagOp;
  /**
   * Plays this mini-game before going on to `next`. The game writes its
   * result into the flags, so `next` can branch on it with `requires`.
   */
  play?: MiniGameId;
  /**
   * An inner voice (doubt, fear or longing) speaks this choice: it is drawn
   * in that voice's colour. Heed or resist it with `heed`/`resist` from
   * `src/dialogue/voices.ts` in `effect`, so later choices can depend on it.
   */
  voice?: Voice;
  /**
   * Brings an account the player has heard into this conversation (see
   * `src/data/record`). The choice shows only once that account is heard.
   */
  present?: { claim: string; account: string };
  /**
   * Opens the record for these claims so the player can write them down,
   * then goes on to `next`.
   */
  write?: string[];
  /**
   * Ends the conversation and takes the player to another map: into an
   * interlude seen through someone else's eyes, and back out of it.
   */
  travel?: DialogueTravel;
}

/** Where a `travel` choice takes the player: a map's scene key and the cell they arrive on. */
export interface DialogueTravel {
  scene: string;
  spawnX: number;
  spawnY: number;
}

/** The pilgrim's inner voices. */
export type Voice = 'doubt' | 'fear' | 'longing';

/** A voice cutting in on a node. */
export interface NodeVoice {
  voice: Voice;
  text: string;
  requires?: (flags: FlagState) => boolean;
}

export interface DialogueNode {
  speaker: string;
  text: string;
  onEnter?: FlagOp;
  choices?: DialogueChoice[]; // if omitted, shows "Continue" → ends
  /**
   * An inner voice that cuts in after the text, before the choices. Given a
   * list, the first whose `requires` holds speaks.
   */
  voice?: NodeVoice | NodeVoice[];
  /**
   * Further paragraphs after `text`, worked out from the flags when the node
   * opens (each one a literal from game data, translated on its own).
   */
  lines?: (flags: FlagState) => string[];
}

export interface DialogueTree {
  id: string;
  startId: string;
  nodes: Record<string, DialogueNode>;
}

export type FlagState = Record<string, boolean | number | string>;
