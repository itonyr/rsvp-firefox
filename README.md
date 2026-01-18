# RSVP Reader - Firefox Extension

A Firefox extension for Rapid Serial Visual Presentation (RSVP) reading of selected text.

## Building

1. Install dependencies:
   ```bash
   make install
   ```

2. Build the extension:
   ```bash
   make build
   ```

3. Development mode (watch):
   ```bash
   make dev
   ```
   This runs Vite in watch mode - it will automatically rebuild when you change source files.

4. Create distributable package:
   ```bash
   make package
   ```

## Installation

### For Development

1. **First time setup**: Build the extension once to create the `dist/` folder:
   ```bash
   make build
   ```

2. **Load in Firefox**:
   - Open Firefox and navigate to `about:debugging`
   - Click "This Firefox" in the left sidebar
   - Click "Load Temporary Add-on..."
   - Navigate to your project directory and select the `dist` folder (or the `manifest.json` file inside it)
   - The extension should now appear in your list of temporary extensions

3. **Development workflow** (choose one):

   **Option A: Auto-reload (Recommended)**
   - Run `make dev-reload` - this will:
     - Build the extension
     - Open Firefox automatically
     - Watch for changes in `dist/` and auto-reload the extension
   - In a separate terminal, run `make dev` to watch and rebuild source files
   - When you save changes, Vite rebuilds → web-ext detects changes → extension reloads automatically
   - **Note**: If you change `manifest.json` or CSS, you'll need to run `make build` manually

   **Option B: Manual reload**
   - In one terminal, run `make dev` to watch for file changes (auto-rebuilds on save)
   - **Important**: `make dev` only rebuilds JS/TS files. If you change `manifest.json` or CSS, run `make build` again.
   - After code changes are rebuilt, reload the extension in Firefox:
     - Go back to `about:debugging` → "This Firefox"
     - Find "RSVP Reader" in the list
     - Click the "Reload" button (or remove and re-add it)
   - Test your changes on any webpage

### For Production

1. Build the extension: `make build`
2. Create package: `make package` (creates `rsvp-reader.zip`)
3. Install the `.zip` file in Firefox via `about:addons` → "Install Add-on From File"

## Usage

1. Select text on any webpage
2. Right-click and choose "Read selection with RSVP" OR press `Ctrl+Shift+Y`
3. Use keyboard controls:
   - `Space`: Pause/Resume
   - `Esc`: Exit overlay
   - `↑/↓`: Increase/Decrease speed (WPM)
   - `←/→`: Rewind/Forward by 5 words

## Icons

Place extension icons in `public/icons/`:
- `icon-16.png` (16x16)
- `icon-48.png` (48x48)
- `icon-96.png` (96x96)

The extension will work without icons, but they're recommended for a polished experience.

## Development

The extension uses:
- **React** for the overlay UI
- **TypeScript** for type safety
- **Vite** for building
- **Makefile** for build orchestration
- **web-ext** for auto-reloading during development

### Debugging Tips

- **Browser Console**: Press F12 on any webpage to see content script logs
- **Background Script Console**: In `about:debugging`, click "Inspect" next to your extension to see background script logs
- **React DevTools**: Install React DevTools extension to debug React components
- **Auto-reload**: Use `make dev-reload` to avoid manually reloading the extension

## Project Structure

- `src/background/` - Service worker (background script)
- `src/content/` - Content script and overlay injection
- `src/overlay/` - React overlay components
- `src/types/` - TypeScript type definitions
- `dist/` - Build output (created by `make build`)
