import {
  clearGameLog,
  GameLogEntry,
  getGameLogEntries,
  subscribeToGameLog,
} from '../logging/gameLogger';

const panelId = 'dawnbreakers-console-panel';
const maxVisibleEntries = 80;

export function attachConsolePanel(): void {
  if (document.getElementById(panelId)) return;

  const panel = document.createElement('section');
  panel.id = panelId;
  panel.setAttribute('aria-label', 'Game console');
  Object.assign(panel.style, {
    position: 'fixed',
    left: '8px',
    top: '8px',
    zIndex: '2147483646',
    width: 'min(420px, calc(100vw - 16px))',
    maxHeight: '176px',
    display: 'flex',
    flexDirection: 'column',
    border: '1px solid rgba(243, 217, 138, 0.38)',
    borderRadius: '8px',
    overflow: 'hidden',
    background: 'rgba(5, 4, 3, 0.76)',
    color: '#f2dfad',
    font: '11px/1.35 ui-monospace, SFMono-Regular, Menlo, Consolas, monospace',
    boxShadow: '0 4px 18px rgba(0, 0, 0, 0.45)',
  });

  const header = document.createElement('div');
  Object.assign(header.style, {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    padding: '4px 6px',
    borderBottom: '1px solid rgba(243, 217, 138, 0.2)',
    background: 'rgba(26, 18, 10, 0.92)',
  });

  const title = document.createElement('strong');
  title.textContent = 'Console';
  Object.assign(title.style, {
    flex: '1',
    color: '#f3d98a',
    fontWeight: '700',
    letterSpacing: '0.04em',
  });

  const clearButton = createHeaderButton('Clear');
  const toggleButton = createHeaderButton('Hide');
  header.append(title, clearButton, toggleButton);

  const body = document.createElement('div');
  body.setAttribute('role', 'log');
  body.setAttribute('aria-live', 'polite');
  Object.assign(body.style, {
    minHeight: '34px',
    overflowY: 'auto',
    padding: '5px 6px 7px',
  });

  const render = () => {
    body.replaceChildren(...getGameLogEntries().slice(-maxVisibleEntries).map(renderEntry));
    body.scrollTop = body.scrollHeight;
  };

  clearButton.addEventListener('click', () => {
    clearGameLog();
    render();
  });
  toggleButton.addEventListener('click', () => {
    const hidden = body.style.display !== 'none';
    body.style.display = hidden ? 'none' : 'block';
    toggleButton.textContent = hidden ? 'Show' : 'Hide';
  });

  panel.append(header, body);
  document.body.appendChild(panel);
  render();
  subscribeToGameLog(render);
}

function createHeaderButton(label: string): HTMLButtonElement {
  const button = document.createElement('button');
  button.type = 'button';
  button.textContent = label;
  Object.assign(button.style, {
    appearance: 'none',
    border: '1px solid rgba(243, 217, 138, 0.32)',
    borderRadius: '5px',
    padding: '2px 6px',
    background: 'rgba(8, 7, 5, 0.72)',
    color: '#f3d98a',
    font: 'inherit',
    cursor: 'pointer',
  });

  return button;
}

function renderEntry(entry: GameLogEntry): HTMLDivElement {
  const line = document.createElement('div');
  const data = entry.data ? ` ${JSON.stringify(entry.data)}` : '';
  line.textContent = `${formatLogTime(entry.atMs)} ${entry.kind} ${entry.message}${data}`;
  Object.assign(line.style, {
    color: colorForLevel(entry.level),
    whiteSpace: 'pre-wrap',
    overflowWrap: 'anywhere',
  });

  return line;
}

function formatLogTime(atMs: number): string {
  return `+${(atMs / 1000).toFixed(2)}s`;
}

function colorForLevel(level: GameLogEntry['level']): string {
  switch (level) {
    case 'debug':
      return '#c2b68d';
    case 'warn':
      return '#ffd37a';
    case 'error':
      return '#ff9b8f';
    case 'info':
      return '#f2dfad';
  }
}
