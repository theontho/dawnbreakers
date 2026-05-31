export type GameLogLevel = 'debug' | 'info' | 'warn' | 'error';
export type GameLogKind = 'message' | 'event';
export type GameLogValue = string | number | boolean | null;

export type GameLogEntry = {
  id: number;
  atMs: number;
  level: GameLogLevel;
  kind: GameLogKind;
  message: string;
  data?: Record<string, GameLogValue>;
};

type GameLogListener = (entry: GameLogEntry) => void;

const maxEntries = 250;
const entries: GameLogEntry[] = [];
const listeners = new Set<GameLogListener>();
let nextId = 1;

export function logGameMessage(
  message: string,
  data?: Record<string, GameLogValue>,
  level: GameLogLevel = 'info',
): GameLogEntry {
  return appendLogEntry({ kind: 'message', level, message, data });
}

export function logGameEvent(name: string, data?: Record<string, GameLogValue>): GameLogEntry {
  return appendLogEntry({ kind: 'event', level: 'info', message: name, data });
}

export function getGameLogEntries(): GameLogEntry[] {
  return [...entries];
}

export function clearGameLog(): void {
  entries.splice(0, entries.length);
}

export function subscribeToGameLog(listener: GameLogListener): () => void {
  listeners.add(listener);

  return () => listeners.delete(listener);
}

function appendLogEntry({
  kind,
  level,
  message,
  data,
}: Omit<GameLogEntry, 'id' | 'atMs'>): GameLogEntry {
  const entry: GameLogEntry = {
    id: nextId,
    atMs: performance.now(),
    kind,
    level,
    message,
    ...(data ? { data } : {}),
  };
  nextId += 1;

  entries.push(entry);
  if (entries.length > maxEntries) {
    entries.splice(0, entries.length - maxEntries);
  }

  writeBrowserConsole(entry);
  window.dispatchEvent(new CustomEvent<GameLogEntry>('dawnbreakers:console-log', { detail: entry }));
  listeners.forEach((listener) => listener(entry));

  return entry;
}

function writeBrowserConsole(entry: GameLogEntry): void {
  const prefix = entry.kind === 'event' ? '[dawnbreakers:event]' : '[dawnbreakers]';
  const message = `${prefix} ${entry.message}`;
  const write = {
    debug: console.debug,
    info: console.info,
    warn: console.warn,
    error: console.error,
  }[entry.level].bind(console);

  if (entry.data) {
    write(message, entry.data);
    return;
  }

  write(message);
}
