import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";
import { componentTagger } from "lovable-tagger";

// BUILD_TARGET values:
//   (unset / "web") → standard browser build, base "/"
//   "native"        → Capacitor mobile build, base "./" (file:// protocol)
//   "electron"      → Electron desktop build, base "./" + vite-plugin-electron
const buildTarget = process.env.BUILD_TARGET ?? "web";
const isNativeBuild = buildTarget === "native";
const isElectronBuild = buildTarget === "electron";

// https://vitejs.dev/config/
export default defineConfig(async ({ mode }) => {
  const plugins: ReturnType<typeof react>[] = [
    react(),
    // componentTagger instruments components for the Lovable visual editor.
    // It's web-only: in Electron builds the dev server runs with a different
    // BUILD_TARGET so Lovable's editor is not active, and in production both
    // modes are off.
    mode === "development" && !isElectronBuild && componentTagger(),
  ].filter(Boolean) as ReturnType<typeof react>[];

  if (isElectronBuild) {
    // Dynamically import so the plugin is only loaded during Electron builds.
    const { default: electronPlugin } = await import(
      "vite-plugin-electron/simple"
    );
    plugins.push(
      electronPlugin({
        main: {
          // Entry point for the Electron main process.
          entry: "electron/main.ts",
        },
        preload: {
          // Preload script — compiled separately and referenced in main.ts.
          input: path.join(__dirname, "electron/preload.ts"),
        },
        // No renderer polyfills needed; the React app runs in a full Chromium context.
        renderer: {},
      })
    );
  }

  return {
    // Use relative asset paths for file:// based platforms (Capacitor / Electron).
    // The standard "/" base works for web deployments served from the root.
    base: isNativeBuild || isElectronBuild ? "./" : "/",

    server: {
      host: "::",
      port: 8080,
      hmr: {
        overlay: false,
      },
    },

    plugins,

    resolve: {
      alias: {
        "@": path.resolve(__dirname, "./src"),
      },
    },
  };
});

