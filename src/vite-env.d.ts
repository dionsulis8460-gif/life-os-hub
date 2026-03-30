/// <reference types="vite/client" />

/**
 * Type declaration for the API surface exposed to the renderer process by
 * `electron/preload.ts` via `contextBridge.exposeInMainWorld`.
 */
interface Window {
  electronAPI?: {
    /** Always true when running inside Electron. */
    readonly isElectron: true;
    /** Node.js process.platform value ('win32' | 'darwin' | 'linux'). */
    readonly platform: NodeJS.Platform;
  };
}
