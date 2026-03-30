/**
 * Centralised localStorage key registry.
 *
 * Import these constants in any hook or component that reads from or writes to
 * localStorage so that keys stay consistent and easy to find / change.
 *
 * When adding a new key:
 *   1. Add the entry here.
 *   2. Also add it to the `ALL_STORAGE_KEYS` array so Configuracoes can clear it.
 */
export const STORAGE_KEYS = {
  tasks: "lifeos-tasks",
  finances: "lifeos-finances",
  habits: "lifeos-habits",
  goals: "lifeos-goals",
  meals: "lifeos-meals",
  studySubjects: "lifeos-study-subjects",
  studySessions: "lifeos-study-sessions",
  onboarding: "lifeos-onboarding",
} as const;

/** Ordered list of every key – used by the "clear local data" action. */
export const ALL_STORAGE_KEYS: string[] = Object.values(STORAGE_KEYS);

/**
 * Legacy keys used before the key names were standardised.
 * Call `migrateStorageKeys()` once at app startup to transparently move
 * existing data to the new keys so returning users don't lose their data.
 */
const LEGACY_KEY_MAP: Record<string, string> = {
  "app-habits": STORAGE_KEYS.habits,
  "goals-data": STORAGE_KEYS.goals,
  "meals-data": STORAGE_KEYS.meals,
  "study-subjects": STORAGE_KEYS.studySubjects,
  "study-sessions": STORAGE_KEYS.studySessions,
};

/**
 * One-time migration: copies data from legacy keys to new keys and removes
 * the old ones. Safe to call on every app start — it only acts when the
 * legacy key still exists and the new key does not.
 */
export function migrateStorageKeys(): void {
  for (const [oldKey, newKey] of Object.entries(LEGACY_KEY_MAP)) {
    const oldData = localStorage.getItem(oldKey);
    if (oldData !== null && localStorage.getItem(newKey) === null) {
      localStorage.setItem(newKey, oldData);
    }
    if (oldData !== null) {
      localStorage.removeItem(oldKey);
    }
  }
}
