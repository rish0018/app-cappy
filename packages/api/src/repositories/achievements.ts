/**
 * Data-access rule (docs/PROJECT_BIBLE.md §197, "Import Rules"): apps never
 * talk to database tables directly. All reads/writes for achievements go
 * through this repository so the persistence layer can change without
 * touching app code.
 */
import type { Achievement, UserAchievement } from "@cappy/types";

export async function getAchievements(): Promise<Achievement[]> {
  throw new Error("not implemented");
}

export async function getUserAchievements(_userId: string): Promise<UserAchievement[]> {
  throw new Error("not implemented");
}

export async function unlockAchievement(_userId: string, _achievementId: string): Promise<UserAchievement> {
  throw new Error("not implemented");
}
