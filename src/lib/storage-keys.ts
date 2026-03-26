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
  habits: "app-habits",
  goals: "goals-data",
  meals: "meals-data",
  studySubjects: "study-subjects",
  studySessions: "study-sessions",
} as const;

/** Ordered list of every key – used by the "clear local data" action. */
export const ALL_STORAGE_KEYS: string[] = Object.values(STORAGE_KEYS);
