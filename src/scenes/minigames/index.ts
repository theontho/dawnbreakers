import type Phaser from 'phaser';
import { CoffeeGame } from './CoffeeGame';
import { CurtainGame } from './CurtainGame';
import { InkGame } from './InkGame';
import { LampGame } from './LampGame';
import { LanesGame } from './LanesGame';
import { RationGame } from './RationGame';

/**
 * Every chapter's mini-game scene, keyed by its `MiniGameId`. Registered
 * after the dialogue so they draw over it.
 */
export function miniGameScenes(): Phaser.Scene[] {
  return [new LampGame(), new InkGame(), new CoffeeGame(), new RationGame(), new CurtainGame(), new LanesGame()];
}
