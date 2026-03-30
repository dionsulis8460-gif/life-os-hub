/**
 * Minimal localStorage helpers used by data hooks when running in local
 * (no-Supabase) demo mode.  Keys should come from STORAGE_KEYS constants.
 */

export function localRead<T>(key: string): T[] {
  try {
    const raw = localStorage.getItem(key);
    return raw ? (JSON.parse(raw) as T[]) : [];
  } catch {
    return [];
  }
}

export function localWrite<T>(key: string, items: T[]): void {
  try {
    localStorage.setItem(key, JSON.stringify(items));
  } catch {
    // Quota exceeded — silently ignore in demo mode.
  }
}
