import * as React from "react";
import { useNavigate } from "react-router-dom";
import { motion, useReducedMotion } from "framer-motion";
import { Button, Card, ProgressBar, StreakBadge, XPBadge } from "@cappy/ui";
import { signOut } from "@cappy/api";
import { ALL_LETTERS } from "@cappy/types";
import { mockLetterMastery, mockStreak, mockUser } from "../mockData";
import {
  fadeUp,
  fadeUpReduced,
  staggerChildren,
  staggerChildrenReduced,
  staggerItem,
  staggerItemReduced,
} from "../components/motion";

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

const PROFILE_STATS = (letterCount: number, repCount: number) => [
  { value: mockStreak.longestStreak, label: "Longest streak" },
  { value: mockUser.totalXp, label: "Total XP" },
  { value: letterCount, label: "Letters mastered" },
  { value: repCount, label: "Practice reps" },
  {
    value: new Date(mockUser.createdAt).toLocaleDateString(undefined, { month: "short", year: "numeric" }),
    label: "Member since",
  },
];

export function Profile() {
  const navigate = useNavigate();
  const reduced = useReducedMotion();
  const fade = reduced ? fadeUpReduced : fadeUp;
  const stagger = reduced ? staggerChildrenReduced : staggerChildren;
  const item = reduced ? staggerItemReduced : staggerItem;
  const [signingOut, setSigningOut] = React.useState(false);
  const [signOutNotice, setSignOutNotice] = React.useState<string | null>(null);

  async function handleSignOut() {
    setSigningOut(true);
    setSignOutNotice(null);
    try {
      await signOut();
      navigate("/login");
    } catch {
      // Auth backend isn't configured yet in dev   let the learner leave
      // the screen anyway rather than trapping them behind a broken call.
      console.warn("[Profile] signOut() failed   auth backend likely not configured yet.");
      setSignOutNotice("We couldn't reach your account just now, but you're free to head back to sign in.");
    } finally {
      setSigningOut(false);
    }
  }

  const letterCount = mockLetterMastery.filter((m) => m.masteryScore >= 0.85).length;
  const repCount = mockLetterMastery.reduce((sum, m) => sum + m.practiceCount, 0);
  const stats = PROFILE_STATS(letterCount, repCount);

  return (
    <div className="flex flex-col gap-2xl">
      <motion.div className="flex items-center gap-lg" initial="hidden" animate="visible" variants={fade}>
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
      </motion.div>

      <motion.div className="flex gap-sm" initial="hidden" animate="visible" variants={fade} transition={{ delay: 0.06 }}>
        <StreakBadge streakDays={mockStreak.currentStreak} />
        <XPBadge xp={mockUser.totalXp} />
      </motion.div>

      <motion.div
        className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-md"
        initial="hidden"
        animate="visible"
        variants={stagger}
        transition={{ delayChildren: 0.12 }}
      >
        {stats.map((stat, i) => (
          <motion.div key={stat.label} custom={i} variants={item}>
            <Card variant="stat" className="text-center">
              <p className="text-2xl font-display font-bold text-primary-700">{stat.value}</p>
              <p className="text-sm text-neutral-500">{stat.label}</p>
            </Card>
          </motion.div>
        ))}
      </motion.div>

      <motion.section
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, amount: 0.15 }}
        variants={fade}
      >
        <h2 className="font-display text-lg font-bold text-neutral-800 mb-md">Letter mastery detail</h2>
        <Card variant="surface" className="grid grid-cols-1 sm:grid-cols-2 gap-md">
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
      </motion.section>

      <motion.section
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, amount: 0.15 }}
        variants={fade}
      >
        <h2 className="font-display text-lg font-bold text-neutral-800 mb-md">Accessibility settings</h2>
        <Card variant="outline" className="divide-y divide-neutral-200">
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
      </motion.section>

      <motion.section
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, amount: 0.15 }}
        variants={fade}
      >
        <h2 className="font-display text-lg font-bold text-neutral-800 mb-md">Account</h2>
        <Card variant="outline" className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-md">
          <div>
            <p className="font-medium text-neutral-800">Sign out</p>
            <p className="text-sm text-neutral-500">You can always sign back in to keep learning.</p>
            {signOutNotice ? (
              <p role="status" className="text-sm text-neutral-500 mt-xs">
                {signOutNotice}
              </p>
            ) : null}
          </div>
          <Button variant="secondary" onClick={handleSignOut} disabled={signingOut}>
            {signingOut ? "Signing out…" : "Sign out"}
          </Button>
        </Card>
      </motion.section>
    </div>
  );
}
