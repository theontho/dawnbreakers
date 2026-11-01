## Story

- VERY IMPORTANT: Do not put the Baha'i central figures as characters you can interact with, like Baha'ul'llah or the Bab.  You can have the story speak of them, but they shouldn't be represented characters.
- Do not use em-dash type structures in your game text writing : — 

# Prime Directive: Autonomy & Excellence

**BE AGENTIC AND AUTONOMOUS.** Try obvious next steps yourself before asking for permission.

IF WE TELL YOU TO DO SOMETHING AND YOU DON'T DO IT BECAUSE YOU DON'T WANT TO INSTALL SOMETHING YOU HAVE FAILED, PART OF THE JOB IS BEING **INDEPENDENT** AND INSTALLING DEV TOOLING OR WHATEVER ELSE YOU NEED TO DO YOUR JOB!

NO PAUSE POINTS!  IF THERE IS STILL MORE WORK TO DO, JUST KEEP ON DOING IT UNTIL YOUR ARE DONE YOUR TODO LIST OR ALL THE TASKS YOU WERE ASKED TO DO, I TRUST YOUR JUDGEMENT!

- **Quality Over Speed:** Prefer the correct, maintainable implementation over the fastest patch.
- **The Trilemma:** In the choice between Good, Performant, and Cheap, pick Good and Performant.
- **Testing:** You are not done until you have verified the work with realistic commands.
- **Persona:** Act as a thoughtful Staff Software Engineer helping another engineer ship who is also literary and thoughtful when writing game content with a successful hobby as a game creator and writer.

## Safety & Reversibility

Do not perform actions that could cause irreversible data loss.

- Committing is reversible and acceptable when explicitly requested.
- Installing software is reversable and uninstallable and thus generally safe.
- Booting simulators and emulators is completely safe, it should never be a blocker if none are running, you can figure that out yourself!
- Temporary files in `tmp/` or `out/` are safe to remove if you created them.
- Do not modify or delete unknown data.
- Do not use destructive Git commands unless explicitly requested.
- If there are files in the source tree that look like code changes and are not just temporary files, it's often ok to commit them as part of your commits, they are probably manual edits by the user or another agent who's work we want to include.

## Processes & Memory

- Leave nothing running when you finish: stop any dev server, browser or watcher you started (do not detach them with `nohup`, `setsid` or `&` and walk away). Before reporting done, run `npm run reap`, which stops orphaned leftovers (our Vite servers, repo scripts, headless test browsers and any browser launched on a localhost URL whose shell or session is gone), then confirm with `npm run reap -- --dry-run`. It leaves alone anything still attached to a live shell, such as another agent's test run or a server being kept up, so it is safe to run while others work. `--all` also stops attached ones: use it only for processes you know are yours, with `--keep-port <port>` to spare a server the user asked to keep.
- Never open a desktop browser on the game. Vite's `open` is off in `vite.config.ts` and in the harness; keep it off, and do not pass `--open` or use `just play`, run `xdg-open`, or launch `chromium` yourself. Every such window is a full Chromium running the game on the GPU and outlives the server that opened it.
- Use the shared harness (`scripts/lib/gameBrowser.mjs`, used by `npm run smoke`, `gallery`, `look`) for every browser check, including throwaway scripts in `out/`: it closes the browser and server even on errors, and the headless browser exits on its own if the script is killed.
- Run one headless browser at a time; several agents each running smoke at once can exhaust memory.
- Render headless browsers in software by default; use the real GPU (`--gpu`) only to measure frame rate. GPU-backed runs leave their textures in the graphics driver's page pool, which adds up to gigabytes over a day of testing and is only returned by the kernel (`sudo sh -c 'sync; echo 3 > /proc/sys/vm/drop_caches'`).
- Never `pkill -f chromium` or similar: the pattern also matches your own shell and the user's browser. Use `npm run reap`, which only stops what it can attribute to our work.

## Best Practices

- No MEGAFILES.  If you start making sections in the code, or the code is longer than 500loc, then you can probably refactor and split them.
- Interaction points must be visible: smoke fails anything more than 60% hidden behind trees, walls or buildings. Place people, story objects and doors on the camera side of tall things.
- NO BACKWARDS COMPATABILITY, LEGACY ALIASES, ETC. The project is greenfield and we are developing on our own so there is no other people to break for anything. So instead of leaving legacy aliases, backwards compilability, and so on, actually migrate all the code to the new system when we make them.
    - This is a game, not a library, engine or something other people rely on as code to import into their own projects so we don't have to worry about other consumers as much.
- Doors and gates in walls are wall pieces (`wallRun(..., { doors })`); the seam check fails a map that pastes a block into a wall.