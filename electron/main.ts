import { app, BrowserWindow, shell, session } from "electron";
import { fileURLToPath } from "node:url";
import path from "node:path";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

// After the Vite build the directory layout is:
//
//   dist/               ← renderer (React app)
//   dist-electron/
//     main.js           ← this file (compiled)
//     preload.mjs       ← preload script

const DIST_PATH = path.join(__dirname, "../dist");
const DEV_SERVER_URL = process.env["VITE_DEV_SERVER_URL"];

let win: BrowserWindow | null = null;

function createWindow() {
  win = new BrowserWindow({
    width: 1280,
    height: 800,
    minWidth: 900,
    minHeight: 600,
    title: "LifeOS Hub",
    webPreferences: {
      preload: path.join(__dirname, "preload.mjs"),
      contextIsolation: true,
      nodeIntegration: false,
      // Sandbox renderer for security (preload still runs in a privileged context)
      sandbox: true,
    },
  });

  // Open every link with target="_blank" in the OS default browser,
  // not inside the Electron window.
  win.webContents.setWindowOpenHandler(({ url }) => {
    if (url.startsWith("https:") || url.startsWith("http:")) {
      shell.openExternal(url);
    }
    return { action: "deny" };
  });

  // Block navigation to external origins (phishing / open-redirect protection).
  win.webContents.on("will-navigate", (event, navigationUrl) => {
    const allowed = DEV_SERVER_URL
      ? new URL(DEV_SERVER_URL).origin
      : `file://`;
    const origin = new URL(navigationUrl).origin;
    if (origin !== allowed && !navigationUrl.startsWith("file://")) {
      event.preventDefault();
    }
  });

  if (DEV_SERVER_URL) {
    // Development — load from Vite dev server
    win.loadURL(DEV_SERVER_URL);
  } else {
    // Production — load the built index.html
    win.loadFile(path.join(DIST_PATH, "index.html"));

    // When the user refreshes or navigates to a deep route (BrowserRouter),
    // Electron may fail to load the path as a file. Fall back to root.
    win.webContents.on("did-fail-load", (_event, errorCode) => {
      // errorCode -6 = FILE_NOT_FOUND
      if (errorCode === -6 && win) {
        win.loadFile(path.join(DIST_PATH, "index.html"));
      }
    });
  }
}

// Remove the default menu bar on Windows / Linux (App has its own UI).
app.on("browser-window-created", (_, window) => {
  window.removeMenu();
});

app.on("window-all-closed", () => {
  // On macOS it is conventional to keep the application running until the
  // user explicitly quits with Cmd + Q.
  if (process.platform !== "darwin") {
    app.quit();
    win = null;
  }
});

app.on("activate", () => {
  if (BrowserWindow.getAllWindows().length === 0) {
    createWindow();
  }
});

// Set a strict Content-Security-Policy so external resources and eval-based
// code are blocked by default.  'unsafe-inline' is intentionally omitted;
// all styles are injected by Vite as <link> tags (no inline <style> blocks),
// and the React runtime does not require eval.
app.whenReady().then(() => {
  session.defaultSession.webRequest.onHeadersReceived((details, callback) => {
    callback({
      responseHeaders: {
        ...details.responseHeaders,
        "Content-Security-Policy": [
          DEV_SERVER_URL
            ? // Development: allow the Vite dev-server origin and HMR websocket.
              `default-src 'self' 'unsafe-inline' data: ${DEV_SERVER_URL} ws://localhost:*`
            : // Production: only same-origin and HTTPS (for Supabase API calls).
              "default-src 'self' data: https:",
        ],
      },
    });
  });

  createWindow();
});
