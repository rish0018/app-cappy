import * as React from "react";
import { Card, ProgressBar, StreakBadge, XPBadge } from "@cappy/ui";
import { ALL_LETTERS } from "@cappy/types";
import { mockLetterMastery, mockStreak, mockUser } from "../mockData";

function Toggle({ label, description, defaultChecked = false }: { label: string; description: string; defaultChecked?: boolean }) {
  const [checked, setChecked] = React.useState(defaultChecked);
  return (
    <div className="flex items-center justify-between gap-md py-sm">
      <div>
        <p className="font-medium text-neutral-800">{label}</p>
        <p className="text-sm text-neutral-500">{description}</p>
      </div>
      <button
        type="button"
        role="switch"
        aria-checked={checked}
        aria-label={label}
        onClick={() => setChecked((c) => !c)}
        className={[
          "relative inline-flex items-center h-8 w-14 min-w-[44px] rounded-full transition-colors motion-reduce:transition-none",
          "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500 focus-visible:ring-offset-2",
          checked ? "bg-primary-500" : "bg-neutral-300",
        ].join(" ")}
      >
        <span
          className={[
            "inline-block h-6 w-6 transform rounded-full bg-neutral-0 transition-transform motion-reduce:transition-none",
            checked ? "translate-x-7" : "translate-x-1",
          ].join(" ")}
        />
      </button>
    </div>
  );
}

export function Profile() {
  return (
    <div className="flex flex-col gap-2xl">
      <div className="flex items-center gap-lg">
        <span
          aria-hidden="true"
          className="flex items-center justify-center w-16 h-16 rounded-full bg-primary-100 text-primary-700 font-display font-bold text-2xl"
        >
          {mockUser.displayName.charAt(0)}
        </span>
        <div>
          <h1 className="font-display text-2xl font-bold text-neutral-800">{mockUser.displayName}</h1>
          <p className="text-neutral-500 text-sm">{mockUser.email}</p>
        </div>
      </div>

      <div className="flex gap-sm">
        <StreakBadge streakDays={mockStreak.currentStreak} />
        <XPBadge xp={mockUser.totalXp} />
      </div>

      <Card className="grid grid-cols-2 sm:grid-cols-4 gap-lg text-center">
        <div>
          <p className="text-2xl font-display font-bold text-primary-700">{mockStreak.longestStreak}</p>
          <p className="text-sm text-neutral-500">Longest streak</p>
        </div>
        <div>
          <p className="text-2xl font-display font-bold text-primary-700">{mockUser.totalXp}</p>
          <p className="text-sm text-neutral-500">Total XP</p>
        </div>
        <div>
          <p className="text-2xl font-display font-bold text-primary-700">
            {mockLetterMastery.filter((m) => m.masteryScore >= 0.85).length}
          </p>
          <p className="text-sm text-neutral-500">Letters mastered</p>
        </div>
        <div>
          <p className="text-2xl font-display font-bold text-primary-700">
            {mockLetterMastery.reduce((sum, m) => sum + m.practiceCount, 0)}
          </p>
          <p className="text-sm text-neutral-500">Practice reps</p>
        </div>
      </Card>

      <section>
        <h2 className="font-display text-lg font-bold text-neutral-800 mb-md">Letter mastery detail</h2>
        <Card className="grid grid-cols-1 sm:grid-cols-2 gap-md">
          {ALL_LETTERS.map((letter) => {
            const mastery = mockLetterMastery.find((m) => m.letter === letter);
            return (
              <ProgressBar
                key={letter}
                value={mastery?.masteryScore ?? 0}
                label={`Letter ${letter}`}
              />
            );
          })}
        </Card>
      </section>

      <section>
        <h2 className="font-display text-lg font-bold text-neutral-800 mb-md">Accessibility settings</h2>
        <Card className="divide-y divide-neutral-200">
          <Toggle
            label="Reduce motion"
            description="Turns off non-essential animations and transitions throughout Cappy."
          />
          <Toggle
            label="High contrast"
            description="Increases contrast between text and backgrounds."
          />
          <Toggle
            label="Larger text"
            description="Increases the base text size across the app."
          />
        </Card>
      </section>
    </div>
  );
}
