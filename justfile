# The Dawn-Breakers. Run `just` to list recipes.
# Recipes that take `*args` pass them through to the underlying script.

set positional-arguments

# List recipes
default:
    @just --list

# Install dependencies (and apply patches)
install:
    npm install

# Start the dev server at http://localhost:5173 (no browser)
run *args:
    npm run dev -- "$@"

# Start the dev server and open the game in your browser (for people, not agents)
play:
    npm run dev -- --open

# Serve the dev server on the local network, e.g. to play from a phone
serve:
    npm run dev:server

# Typecheck, lint, and production build
check: typecheck lint build

# Type-check without emitting
typecheck:
    npm run typecheck

# eslint, localization coverage, dialogue references, content rules
lint:
    npm run lint

# Production build into dist/
build:
    npm run build

# Build, then serve dist/ as players would get it
preview: build
    npm run preview

# Headless: boot every map and open every NPC dialogue (`just smoke --gpu` for real fps)
smoke *args:
    npm run smoke -- "$@"

# Headless: play every chapter's mini-game with a bot (`just minigames --quick`)
minigames *args:
    npm run minigames -- "$@"

# Headless: play every journey between chapters
journeys *args:
    npm run journeys -- "$@"

# Screenshot with the player at a cell, e.g. `just look City:8:13`
look *args:
    npm run look -- "$@"

# Contact sheets of every generated texture -> out/gallery/
gallery *args:
    npm run gallery -- "$@"

# The synthesized score and sound effects as WAV -> out/music/
music *args:
    npm run render:music -- "$@"

# Native C++/OpenGL Sky Rewind prototype
starfield:
    npm run dev:starfield

# Stop orphaned dev servers and headless browsers (`just reap --dry-run` to preview)
reap *args:
    npm run reap -- "$@"
