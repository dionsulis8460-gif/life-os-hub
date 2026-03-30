import { createClient } from "@supabase/supabase-js";
import type { Database } from "./types";
import { Capacitor } from "@capacitor/core";
import { Preferences } from "@capacitor/preferences";

const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL;
const SUPABASE_PUBLISHABLE_KEY = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY;

// Import the supabase client like this:
// import { supabase } from "@/integrations/supabase/client";

/**
 * Wrap the global fetch with a 10-second timeout so that hanging Supabase
 * network requests (e.g. when the project is paused or the network is slow)
 * do not leave pages stuck on the loading skeleton indefinitely.
 * AbortSignal.any() merges the timeout signal with any signal the caller
 * already provided (e.g. from React Query) so both can cancel the request.
 */
const FETCH_TIMEOUT_MS = 10_000;

function fetchWithTimeout(
  input: RequestInfo | URL,
  init?: RequestInit,
): Promise<Response> {
  const controller = new AbortController();
  const timerId = setTimeout(() => controller.abort(), FETCH_TIMEOUT_MS);

  // Merge with the caller's AbortSignal when the browser supports AbortSignal.any
  // (Chrome 116+, Firefox 118+, Safari 17.4+). On older browsers the caller's
  // signal is ignored — the timeout signal still fires after FETCH_TIMEOUT_MS,
  // so requests don't hang, but early cancellation by the caller won't work.
  const callerSignal = init?.signal as AbortSignal | undefined;
  const signal =
    callerSignal && "any" in AbortSignal
      ? AbortSignal.any([controller.signal, callerSignal])
      : controller.signal;

  return fetch(input, { ...init, signal }).finally(() => clearTimeout(timerId));
}

/**
 * When Supabase env vars are missing or still hold placeholder values,
 * all Supabase queries will fail immediately instead of hanging.
 * Components can use this flag to skip subscription checks in local-dev mode.
 */
export const isSupabaseConfigured =
  !!SUPABASE_URL &&
  !!SUPABASE_PUBLISHABLE_KEY &&
  !SUPABASE_URL.includes("your_project_ref") &&
  !SUPABASE_PUBLISHABLE_KEY.includes("your_supabase_anon_key");

/**
 * On iOS / Android, Capacitor's Preferences plugin (backed by NSUserDefaults on
 * iOS and SharedPreferences on Android) is far more reliable than localStorage:
 * iOS can silently evict localStorage under memory pressure, which would log
 * users out unexpectedly.  On web and Electron, localStorage is fine.
 */
const authStorage = Capacitor.isNativePlatform()
  ? {
      getItem: async (key: string): Promise<string | null> => {
        const { value } = await Preferences.get({ key });
        return value;
      },
      setItem: async (key: string, value: string): Promise<void> => {
        await Preferences.set({ key, value });
      },
      removeItem: async (key: string): Promise<void> => {
        await Preferences.remove({ key });
      },
    }
  : localStorage;

export const supabase = createClient<Database>(
  SUPABASE_URL,
  SUPABASE_PUBLISHABLE_KEY,
  {
    auth: {
      storage: authStorage,
      persistSession: true,
      autoRefreshToken: true,
    },
    global: {
      fetch: fetchWithTimeout,
    },
  }
);
