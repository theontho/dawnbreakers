import { slotKey } from './saveSlots';
import type { FlagState, FlagOp } from './types';

const KEY = 'dawnbreakers.flags.v1';

/**
 * Minimal subset of `Storage` (localStorage / sessionStorage / in-memory)
 * the flag store needs. Tests can pass an in-memory map; production passes
 * `localStorage`.
 */
export interface FlagStorage {
  getItem(key: string): string | null;
  setItem(key: string, value: string): void;
}

export interface FlagStore {
  getFlags(): FlagState;
  applyEffect(effect?: FlagOp): void;
  resetFlags(): void;
}

export function createMemoryStorage(initial: Record<string, string> = {}): FlagStorage {
  const data = new Map<string, string>(Object.entries(initial));
  return {
    getItem: (k) => (data.has(k) ? data.get(k)! : null),
    setItem: (k, v) => { data.set(k, v); },
  };
}

export function createFlagStore(storage: FlagStorage, key: string = KEY): FlagStore {
  let flags: FlagState = load();

  function load(): FlagState {
    try {
      const raw = storage.getItem(key);
      if (!raw) return {};

      const parsed: unknown = JSON.parse(raw);
      if (isFlagState(parsed)) return parsed;

      console.warn(`Ignoring invalid dialogue flag data in ${key}.`);
      return {};
    } catch (error) {
      console.warn(`Unable to load dialogue flags from ${key}.`, error);
      return {};
    }
  }

  function persist(): void {
    try {
      storage.setItem(key, JSON.stringify(flags));
    } catch (error) {
      console.warn(`Unable to persist dialogue flags to ${key}.`, error);
    }
  }

  return {
    getFlags: () => flags,
    applyEffect: (effect) => {
      if (!effect?.set) return;
      flags = { ...flags, ...effect.set };
      persist();
    },
    resetFlags: () => {
      flags = {};
      persist();
    },
  };
}

function isFlagState(value: unknown): value is FlagState {
  if (!value || typeof value !== 'object' || Array.isArray(value)) return false;

  return Object.values(value).every(flag =>
    typeof flag === 'boolean' ||
    typeof flag === 'number' ||
    typeof flag === 'string',
  );
}

/**
 * Default store, bound to `window.localStorage` (or in-memory when running
 * outside a browser, e.g. lint scripts / tests that import a scene module
 * for type info). Game code should use the re-exported `getFlags`,
 * `applyEffect`, `resetFlags` so the underlying store stays a singleton.
 */
const defaultStorage: FlagStorage =
  typeof localStorage !== 'undefined' ? localStorage : createMemoryStorage();

let defaultStore: FlagStore = createFlagStore(defaultStorage, slotKey(KEY));

/** Reads the active save slot's flags afresh, after the slot changes. */
export function reloadFlags(): void {
  defaultStore = createFlagStore(defaultStorage, slotKey(KEY));
}

/** A slot's flags, read without making it the active one. */
export function slotFlags(slot: number): FlagState {
  return createFlagStore(defaultStorage, slotKey(KEY, slot)).getFlags();
}

export const getFlags = (): FlagState => defaultStore.getFlags();
export const applyEffect = (effect?: FlagOp): void => defaultStore.applyEffect(effect);
export const resetFlags = (): void => defaultStore.resetFlags();
