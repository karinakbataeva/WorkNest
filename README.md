# WorkNest

A Chrome extension for managing tab overload — organize open tabs into named workspaces, save sessions, resume work later, and stay focused with built-in Pomodoro-style focus sessions.

Built with React, TypeScript, Vite, Tailwind CSS, and CRXJS, targeting Manifest V3.

## Features

### Tab Management
- View all currently open tabs across every window, with favicon, title, and URL
- Detect and flag duplicate tabs (same URL open more than once)
- Close any tab directly from the popup

### Workspaces
- Create a new, empty workspace, then add tabs to it individually over time
- Add any open tab to an existing workspace directly from the tab list (duplicate URLs are skipped automatically)
- Restore a workspace — opens all its tabs in a new browser window, in their original order
- Rename or delete a workspace
- Search workspaces by name
- Hover a workspace to preview its saved tabs (favicon + title) without opening it

### Focus Sessions
- Configurable Pomodoro-style focus/break timer
- Runs in the background via `chrome.alarms` — keeps counting down even if the popup is closed
- Visual + audio notification when a focus period ends and a break begins, and when a break ends
- Tracks and displays the number of breaks taken in the current session streak
- Restoring a workspace during an active focus session shows a confirmation warning (can be overridden)

### Session History
- Automatically logs every workspace **save** and **open (restore)** event
- Viewable in a dedicated History screen, most recent first
- Entries older than 30 days are automatically pruned

### Keyboard Shortcut
- `Cmd+Shift+S` (Mac) / `Ctrl+Shift+S` (Windows/Linux) — instantly saves all current tabs as a new, timestamp-named workspace, without needing to open the popup
- Customizable/reassignable at `chrome://extensions/shortcuts`

### Appearance
- Light, dark, and system-following theme modes, persisted across sessions

## Tech Stack

- **React 19** + **TypeScript** — UI and type safety
- **Vite 6** — build tooling (via CRXJS plugin for MV3 support)
- **Tailwind CSS v4** — styling
- **CRXJS Vite Plugin** — bundles the extension for Manifest V3, handles popup/background/dev-mode HMR
- **Lucide React** — icon set
- **Chrome Storage API** (`chrome.storage.local`) — all persistence (workspaces, theme, focus session state, history)

## Chrome APIs Used

| API | Purpose |
|---|---|
| `chrome.tabs` | Query open tabs, close tabs, create tabs when restoring a workspace |
| `chrome.windows` | Open a new window when restoring a workspace |
| `chrome.storage.local` | Persist workspaces, theme preference, focus session state, and history |
| `chrome.storage.onChanged` | Keep the popup's focus session UI in sync with background-driven state changes |
| `chrome.alarms` | Schedule background-persistent focus/break phase transitions |
| `chrome.notifications` | Show native OS notifications when a focus/break phase ends or a quick-save completes |
| `chrome.offscreen` | Play a notification sound from the background service worker (which has no DOM/`<audio>` access on its own) |
| `chrome.commands` | Register and handle the quick-save keyboard shortcut |
| `chrome.runtime` | Messaging between the background worker and the offscreen document |

## Project Structure
src/
popup/ # Popup UI entry point (index.html, main.tsx, App.tsx)
background/ # Service worker — alarm handling, keyboard command handling
offscreen/ # Hidden document used solely for audio playback
components/ # Reusable, presentational React components
hooks/ # Custom hooks — one per domain (tabs, workspaces, theme, focus session, history)
services/ # All chrome.* API calls live here, isolated from UI
utils/ # Pure helper functions (e.g. duplicate tab detection)
types/ # Shared TypeScript interfaces
assets/ # Icons and notification sound
**Architecture principle:** components never call `chrome.*` APIs directly. Every Chrome API call is wrapped in `services/`; hooks call services and expose state; components call hooks. This keeps business logic testable and swappable independently of the UI.

## Development

```bash
npm install
npm run dev
```

Then in Chrome:
1. Go to `chrome://extensions`
2. Enable **Developer mode**
3. Click **Load unpacked**, select the generated `dist/` folder

The dev server supports hot-reload for popup UI changes. Changes to `manifest.json` (new permissions, commands, etc.) or the background service worker require removing and re-loading the unpacked extension for changes to fully register.

```bash
npx tsc -b --noEmit   # type-check without emitting output
npm run build          # production build
```

## Known Limitations

- **No cross-device sync.** Workspaces are stored in `chrome.storage.local`, tied to a single browser profile on a single machine. Import/export was considered but deprioritized for the current version.
- **No confirmation dialog on delete.** Deleting a workspace is immediate and irreversible — intentional, low-friction design choice, but worth knowing.
- **Duplicate detection is URL-exact-match only** — it won't catch near-duplicate tabs (e.g. same page with different query parameters or trailing slashes).
- **Notification sound requires OS-level notification permissions** for Chrome to be enabled; if disabled at the system level, the extension will still register the notification but nothing will visibly/audibly appear.
- **Restoring a large workspace** opens tabs sequentially (to preserve order), which may feel slightly slower than instant for workspaces with many tabs.

## Permissions

| Permission | Why it's needed |
|---|---|
| `tabs` | Read open tab info, close tabs, create tabs when restoring |
| `storage` | Persist all extension data locally |
| `alarms` | Background-persistent focus session timing |
| `notifications` | Alert the user when a focus/break phase ends |
| `offscreen` | Play a notification sound from the background context |
