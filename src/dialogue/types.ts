export type FlagOp = { set?: Record<string, boolean | number | string>; };

/** The chapters' mini-games, by scene key (see `src/scenes/minigames/`). */
export type MiniGameId = 'LampGame' | 'InkGame' | 'CoffeeGame' | 'RationGame' | 'CurtainGame' | 'LanesGame';

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
}

export interface DialogueNode {
  speaker: string;
  text: string;
  onEnter?: FlagOp;
  choices?: DialogueChoice[]; // if omitted, shows "Continue" → ends
}

export interface DialogueTree {
  id: string;
  startId: string;
  nodes: Record<string, DialogueNode>;
}

export type FlagState = Record<string, boolean | number | string>;
