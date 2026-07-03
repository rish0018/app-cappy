import * as React from "react";
import { AchievementBadge, MascotMoment } from "@cappy/ui";
import { mockAchievements, mockRecentAchievementId, mockUserAchievements } from "../mockData";

export function Achievements() {
  const unlockedIds = new Set(mockUserAchievements.map((a) => a.achievementId));
  const recent = mockAchievements.find((a) => a.id === mockRecentAchievementId);

  return (
    <div className="flex flex-col gap-2xl">
      <div>
        <h1 className="font-display text-2xl font-bold text-neutral-800">Achievements</h1>
        <p className="text-neutral-600">A record of the milestones you've earned along the way.</p>
      </div>

      {recent ? (
        <MascotMoment
          context="milestone"
          message={`You just earned "${recent.name}"! ${recent.description} Keep going — you're building something real.`}
        />
      ) : null}

      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-md">
        {mockAchievements.map((achievement) => (
          <AchievementBadge
            key={achievement.id}
            name={achievement.name}
            description={achievement.description}
            icon={achievement.icon}
            unlocked={unlockedIds.has(achievement.id)}
          />
        ))}
      </div>
    </div>
  );
}
