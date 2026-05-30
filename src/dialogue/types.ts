export type FlagOp = { set?: Record<string, boolean | number | string>; };

export interface DialogueChoice {
  text: string;
  next?: string;          // id of next node; if omitted, dialogue ends
  requires?: (flags: FlagState) => boolean;
  effect?: FlagOp;
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
