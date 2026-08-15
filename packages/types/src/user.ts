export interface User {
  id: string;
  email: string;
  displayName: string;
  createdAt: string;
  totalXp: number;
}

export type TextSize = "small" | "medium" | "large";

/** Backing store for Profile.tsx's/profile.tsx's accessibility toggles. */
export interface UserSettings {
  userId: string;
  reducedMotion: boolean;
  highContrast: boolean;
  textSize: TextSize;
}
