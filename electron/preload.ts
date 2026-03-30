import { contextBridge } from "electron";

/**
 * Expose a minimal, safe API surface to the renderer process.
 *
 * Everything here is accessible as `window.electronAPI` in the React app.
 * Keep this surface as small as possible – the renderer should never need
 * direct access to Node.js internals.
 */
contextBridge.exposeInMainWorld("electronAPI", {
  /** True when the renderer is running inside Electron (Windows / macOS / Linux). */
  isElectron: true as const,
  /** The Node.js `process.platform` string ('win32' | 'darwin' | 'linux'). */
  platform: process.platform,
});
