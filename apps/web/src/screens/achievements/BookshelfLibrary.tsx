import * as React from "react";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { Card, MASCOT_POSE_SRC } from "@cappy/ui";
import type { Achievement, UserAchievement } from "@cappy/types";
import {
  ACHIEVEMENT_LIBRARY,
  ACHIEVEMENT_POSE,
  CATEGORY_LABEL,
  CATEGORY_ORDER,
  MENTOR_NOTE,
  RARITY_STYLE,
  type BookCategory,
} from "./libraryData";

function achievementIconSrc(achievementId: string): string {
  return MASCOT_POSE_SRC[ACHIEVEMENT_POSE[achievementId] ?? "mentor"];
}

export interface BookshelfLibraryProps {
  achievements: Achievement[];
  userAchievements: UserAchievement[];
}

function formatUnlockDate(iso: string): string {
  return new Date(iso).toLocaleDateString(undefined, {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}

/**
 * Stylized 2D stand-in for "The Library of Milestones" (see
 * brand-assets/Cappy_Brand_Prompt_Library_v1.txt)   a full 3D diorama with
 * real book meshes is a much larger undertaking than this ships today, but
 * the emotional/structural idea (shelves as categories, books as memories,
 * rarity as material, opening a book as a treasured moment) is all here.
 */
export function BookshelfLibrary({
  achievements,
  userAchievements,
}: BookshelfLibraryProps) {
  const reduced = useReducedMotion();
  const [openId, setOpenId] = React.useState<string | null>(null);

  const unlockedById = new Map(
    userAchievements.map((a) => [a.achievementId, a]),
  );
  const byId = new Map(achievements.map((a) => [a.id, a]));

  const shelves = CATEGORY_ORDER.map((category) => ({
    category,
    achievementIds: Object.entries(ACHIEVEMENT_LIBRARY)
      .filter(([, meta]) => meta.category === category)
      .map(([id]) => id)
      .filter((id) => byId.has(id)),
  })).filter((shelf) => shelf.achievementIds.length > 0);

  const openAchievement = openId ? byId.get(openId) : undefined;
  const openUnlock = openId ? unlockedById.get(openId) : undefined;

  return (
    <div className="flex flex-col gap-lg">
      {shelves.map((shelf) => (
        <ShelfSection
          key={shelf.category}
          category={shelf.category}
          achievementIds={shelf.achievementIds}
          byId={byId}
          unlockedById={unlockedById}
          onOpen={setOpenId}
        />
      ))}

      <AnimatePresence>
        {openAchievement ? (
          <BookDetailOverlay
            achievement={openAchievement}
            unlock={openUnlock}
            reduced={!!reduced}
            onClose={() => setOpenId(null)}
          />
        ) : null}
      </AnimatePresence>
    </div>
  );
}

function ShelfSection({
  category,
  achievementIds,
  byId,
  unlockedById,
  onOpen,
}: {
  category: BookCategory;
  achievementIds: string[];
  byId: Map<string, Achievement>;
  unlockedById: Map<string, UserAchievement>;
  onOpen: (id: string) => void;
}) {
  return (
    <Card variant="surface" className="flex flex-col gap-sm">
      <p className="text-xs font-semibold uppercase tracking-[0.2em] text-primary-500">
        {CATEGORY_LABEL[category]}
      </p>
      <div className="flex items-end gap-sm overflow-x-auto rounded-lg bg-tan-100/60 px-md pb-3 pt-6">
        {achievementIds.map((id) => {
          const achievement = byId.get(id)!;
          const unlock = unlockedById.get(id);
          return (
            <BookSpine
              key={id}
              achievement={achievement}
              unlocked={!!unlock}
              onOpen={() => onOpen(id)}
            />
          );
        })}
      </div>
    </Card>
  );
}

function BookSpine({
  achievement,
  unlocked,
  onOpen,
}: {
  achievement: Achievement;
  unlocked: boolean;
  onOpen: () => void;
}) {
  const rarity = ACHIEVEMENT_LIBRARY[achievement.id]?.rarity ?? "common";
  const style = RARITY_STYLE[rarity];

  return (
    <button
      type="button"
      disabled={!unlocked}
      onClick={onOpen}
      aria-label={
        unlocked ? `Open "${achievement.name}"` : `${achievement.name} (locked)`
      }
      className={[
        "group relative flex h-40 shrink-0 flex-col items-center justify-end rounded-t-sm rounded-b-[3px] border-b-4 pb-sm shadow-md transition-transform motion-reduce:transition-none",
        style.spineWidth,
        unlocked
          ? `${style.spine} ${style.accent} hover:-translate-y-1.5 cursor-pointer`
          : "cursor-default border-neutral-400 bg-neutral-300",
      ].join(" ")}
    >
      <span
        className={[
          "mb-sm flex h-8 w-8 items-end justify-center overflow-hidden rounded-full bg-white/70",
          unlocked ? "" : "grayscale opacity-50",
        ].join(" ")}
        aria-hidden="true"
      >
        {/* Pose art is full-body, bottom-anchored, transparent above the
            character -- rendering it 2x the visible box and bottom-aligning
            crops in on the figure instead of shrinking the whole (mostly
            empty) frame into the circle. */}
        <img
          src={achievementIconSrc(achievement.id)}
          alt=""
          className="h-16 w-16 object-contain object-bottom"
        />
      </span>
      {unlocked ? (
        <span
          className="pointer-events-none text-[10px] font-semibold leading-tight text-white/90"
          style={{ writingMode: "vertical-rl", textOrientation: "mixed" }}
        >
          {achievement.name}
        </span>
      ) : null}
    </button>
  );
}

function BookDetailOverlay({
  achievement,
  unlock,
  reduced,
  onClose,
}: {
  achievement: Achievement;
  unlock: UserAchievement | undefined;
  reduced: boolean;
  onClose: () => void;
}) {
  return (
    <motion.div
      className="fixed inset-0 z-50 flex items-center justify-center bg-neutral-900/50 px-lg"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: reduced ? 0.01 : 0.2 }}
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-label={`${achievement.name} details`}
    >
      <motion.div
        className="grid w-full max-w-2xl grid-cols-1 gap-lg overflow-hidden rounded-2xl bg-tan-50 p-2xl shadow-lg sm:grid-cols-2"
        initial={{ opacity: 0, scale: reduced ? 1 : 0.92, y: reduced ? 0 : 16 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: reduced ? 1 : 0.96 }}
        transition={{
          duration: reduced ? 0.01 : 0.32,
          ease: [0.22, 1, 0.36, 1],
        }}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex flex-col items-start gap-xs border-r border-tan-200 pr-lg sm:pr-lg">
          <img
            src={achievementIconSrc(achievement.id)}
            alt=""
            aria-hidden="true"
            className="h-20 w-20 object-contain object-top"
          />
          <h2 className="font-display text-xl font-bold text-neutral-800">
            {achievement.name}
          </h2>
          {unlock ? (
            <p className="text-sm text-neutral-500">
              Unlocked {formatUnlockDate(unlock.unlockedAt)}
            </p>
          ) : null}
        </div>
        <div className="flex flex-col gap-md">
          <p className="text-neutral-700">{achievement.description}</p>
          <div className="rounded-lg bg-primary-50 p-md">
            <p className="text-xs font-semibold uppercase tracking-wide text-primary-600 mb-xs">
              Mentor Cappy&apos;s note
            </p>
            <p className="text-sm italic text-neutral-700">
              &quot;
              {MENTOR_NOTE[achievement.id] ??
                "Every page in this library is one you earned."}
              &quot;
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="mt-auto self-end rounded-md px-md py-sm text-sm font-semibold text-primary-600 hover:text-primary-700"
          >
            Close
          </button>
        </div>
      </motion.div>
    </motion.div>
  );
}
