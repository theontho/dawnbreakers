import type { FlagState, FlagOp } from './types';

const KEY = 'dawnbreakers.flags.v1';

let flags: FlagState = load();

function load(): FlagState {
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) return {};

    const parsed: unknown = JSON.parse(raw);
    if (isFlagState(parsed)) return parsed;

    console.warn(`Ignoring invalid dialogue flag data in ${KEY}.`);
    return {};
  } catch (error) {
    console.warn(`Unable to load dialogue flags from ${KEY}.`, error);
    return {};
  }
}

function persist(): void {
  try {
    localStorage.setItem(KEY, JSON.stringify(flags));
  } catch (error) {
    console.warn(`Unable to persist dialogue flags to ${KEY}.`, error);
  }
}

function isFlagState(value: unknown): value is FlagState {
  if (!value || typeof value !== 'object' || Array.isArray(value)) return false;

  return Object.values(value).every(flag =>
    typeof flag === 'boolean' ||
    typeof flag === 'number' ||
    typeof flag === 'string',
  );
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
