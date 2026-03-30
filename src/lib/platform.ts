import { Capacitor } from "@capacitor/core";

/**
 * Platform detection helpers.
 *
 * Usage:
 *   import { isNativeMobile, isAndroid, isIOS, isElectron, isWeb } from '@/lib/platform';
 */

/** True when running inside a Capacitor shell (iOS or Android). */
export const isNativeMobile = Capacitor.isNativePlatform();

/** True when running on iOS (native app). */
export const isIOS = Capacitor.getPlatform() === "ios";

/** True when running on Android (native app). */
export const isAndroid = Capacitor.getPlatform() === "android";

/**
 * True when running inside an Electron desktop window.
 * The preload script sets `window.electronAPI.isElectron = true`.
 */
export const isElectron =
  typeof window !== "undefined" &&
  !!(window as Window & { electronAPI?: { isElectron: boolean } })?.electronAPI
    ?.isElectron;

/** True only in a standard web browser (not Capacitor or Electron). */
export const isWeb = !isNativeMobile && !isElectron;

/**
 * Returns the current platform as a string.
 * Useful for logging / analytics.
 */
export function getPlatformName(): "ios" | "android" | "electron" | "web" {
  if (isIOS) return "ios";
  if (isAndroid) return "android";
  if (isElectron) return "electron";
  return "web";
}
