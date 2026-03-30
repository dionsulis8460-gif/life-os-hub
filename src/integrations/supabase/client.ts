import { createClient } from "@supabase/supabase-js";
import type { Database } from "./types";
import { Capacitor } from "@capacitor/core";
import { Preferences } from "@capacitor/preferences";

const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL;
const SUPABASE_PUBLISHABLE_KEY = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY;

// Import the supabase client like this:
// import { supabase } from "@/integrations/supabase/client";

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
  }
);
