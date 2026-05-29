import type { FlagState, FlagOp } from './types';

const KEY = 'dawnbreakers.flags.v1';

let flags: FlagState = load();

function load(): FlagState {
  try {
    const raw = localStorage.getItem(KEY);
    return raw ? JSON.parse(raw) as FlagState : {};
  } catch {
    return {};
  }
}

function persist(): void {
  try { localStorage.setItem(KEY, JSON.stringify(flags)); } catch { /* ignore */ }
}

export function getFlags(): FlagState {
  return flags;
}

export function applyEffect(effect?: FlagOp): void {
  if (!effect?.set) return;
  flags = { ...flags, ...effect.set };
  persist();
}

export function resetFlags(): void {
  flags = {};
  persist();
}
