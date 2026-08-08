cd .

cat > README.md << 'WORKNEST_EOF'
# WorkNest

A Chrome extension for managing tab overload — organize open tabs into named workspaces, save sessions, resume work later, and stay focused with built-in Pomodoro-style focus sessions.

Built with React, TypeScript, Vite, Tailwind CSS, and CRXJS, targeting Manifest V3.

**Browser support:** Works on any Chromium-based browser — Chrome, Edge, Brave, Opera, Vivaldi, Arc, etc. — since it only uses standard Manifest V3 `chrome.*` APIs with no Chrome-exclusive features. It is **not** currently compatible with Firefox or Safari, which don't share the same extension platform (notably, `chrome.offscreen`, used for the notification sound, has no Firefox equivalent).

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

### Workspace Notes
- Attach a short note to any workspace — the *context* behind why those tabs were saved, not just the tabs themselves (e.g. "Finish DBMS assignment by Friday")
- Add a note via the `+ Add note` affordance under a workspace, or by right-clicking the workspace
- Once set, the note shows as a truncated one-line preview under the workspace — click it to open the full note in a popover, with quick edit/delete icons
- **Shown again on resume:** if a workspace has a note, clicking to restore it first shows a confirmation with the note and tab count, so you're reminded *why* you saved it before the tabs open

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

Then in Chrome (or any other Chromium-based browser — Edge, Brave, Vivaldi, etc. — via their equivalent `chrome://extensions` page):
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
- **Notes are single-line-summarized in the workspace list** but can hold multiple lines — long notes will wrap/scroll inside the popover rather than in the collapsed row.

## Permissions

| Permission | Why it's needed |
|---|---|
| `tabs` | Read open tab info, close tabs, create tabs when restoring |
| `storage` | Persist all extension data locally |
| `alarms` | Background-persistent focus session timing |
| `notifications` | Alert the user when a focus/break phase ends |
| `offscreen` | Play a notification sound from the background context |
WORKNEST_EOF

echo "README updated."
