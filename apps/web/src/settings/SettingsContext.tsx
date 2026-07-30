/**
 * Single shared instance of useUserSettings, mounted once at the app root
 * so every screen reads/writes the same in-flight state instead of each
 * screen re-fetching independently. App.tsx uses this to actually apply
 * reducedMotion/highContrast/textSize (see MotionConfig + the data-*
 * attributes on <html>); Profile.tsx uses it to render the toggles.
 */
import * as React from "react";
import { useUserSettings } from "../hooks/useUserSettings";
import type { UserSettings } from "@cappy/types";

interface SettingsContextValue {
  settings: UserSettings | null;
  updateSettings: (patch: Partial<Omit<UserSettings, "userId">>) => Promise<void>;
}

const SettingsContext = React.createContext<SettingsContextValue | null>(null);

export function SettingsProvider({ children }: { children: React.ReactNode }) {
  const value = useUserSettings();
  return <SettingsContext.Provider value={value}>{children}</SettingsContext.Provider>;
}

/** Throws if used outside SettingsProvider -- every screen renders under App's provider. */
export function useSettings(): SettingsContextValue {
  const ctx = React.useContext(SettingsContext);
  if (!ctx) throw new Error("useSettings() must be used within SettingsProvider");
  return ctx;
}
