import { useState, useCallback } from "react";
import { STORAGE_KEYS } from "@/lib/storage-keys";

export interface OnboardingState {
  /** Has the user completed the first-time welcome wizard? */
  wizardCompleted: boolean;
  /** Which module the user chose to start with in the wizard. */
  selectedStartModule: string | null;
  /** Modules whose per-module guide has already been shown. */
  visitedModules: string[];
}

const DEFAULT_STATE: OnboardingState = {
  wizardCompleted: false,
  selectedStartModule: null,
  visitedModules: [],
};

function loadState(): OnboardingState {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.onboarding);
    if (raw) return { ...DEFAULT_STATE, ...JSON.parse(raw) };
  } catch {
    // ignore parse errors
  }
  return DEFAULT_STATE;
}

function saveState(state: OnboardingState): void {
  try {
    localStorage.setItem(STORAGE_KEYS.onboarding, JSON.stringify(state));
  } catch {
    // ignore quota errors
  }
}

export function useOnboarding() {
  const [state, setState] = useState<OnboardingState>(loadState);

  const completeWizard = useCallback((selectedModule: string) => {
    setState((prev) => {
      const next: OnboardingState = {
        ...prev,
        wizardCompleted: true,
        selectedStartModule: selectedModule,
      };
      saveState(next);
      return next;
    });
  }, []);

  const skipWizard = useCallback(() => {
    setState((prev) => {
      const next: OnboardingState = { ...prev, wizardCompleted: true };
      saveState(next);
      return next;
    });
  }, []);

  const markModuleVisited = useCallback((moduleKey: string) => {
    setState((prev) => {
      if (prev.visitedModules.includes(moduleKey)) return prev;
      const next: OnboardingState = {
        ...prev,
        visitedModules: [...prev.visitedModules, moduleKey],
      };
      saveState(next);
      return next;
    });
  }, []);

  const isModuleVisited = useCallback(
    (moduleKey: string) => state.visitedModules.includes(moduleKey),
    [state.visitedModules],
  );

  /** Allow resetting onboarding (useful from Settings). */
  const resetOnboarding = useCallback(() => {
    const next = DEFAULT_STATE;
    saveState(next);
    setState(next);
  }, []);

  return {
    state,
    completeWizard,
    skipWizard,
    markModuleVisited,
    isModuleVisited,
    resetOnboarding,
  };
}
