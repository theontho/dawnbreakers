/**
 * The page's own first screen (in `index.html`), shown before any script
 * arrives so a slow connection never shows black: faded out once the game
 * has drawn its title.
 */
export function hideSplash(): void {
  const splash = document.getElementById('splash');
  if (!splash || splash.classList.contains('gone')) return;
  splash.classList.add('gone');
  window.setTimeout(() => splash.remove(), 700);
}
