import * as React from "react";
import { useNavigate } from "react-router-dom";
import { motion, useReducedMotion } from "framer-motion";
import { Button, Card, MorseSequenceDisplay, ProgressBar } from "@cappy/ui";
import { MORSE_GROUPS, MORSE_MAP, type MorseWordStage } from "@cappy/types";
import {
  averageMasteryForCharacters,
  isWordStageUnlocked,
  mockActiveMorseLessonId,
  mockMorseLessonById,
  mockMorseWordStages,
} from "../../morseMockData";
import {
  fadeUp,
  fadeUpReduced,
  staggerChildren,
  staggerChildrenReduced,
  staggerItem,
  staggerItemReduced,
} from "../../components/motion";

type GroupState = "locked" | "active" | "completed";

function groupState(avgMastery: number, isNext: boolean): GroupState {
  if (avgMastery >= 0.85) return "completed";
  if (isNext || avgMastery > 0) return "active";
  return "locked";
}

const STATE_CHIP: Record<GroupState, { label: string; classes: string }> = {
  completed: { label: "Complete", classes: "bg-success-100 text-success-700" },
  active: { label: "In progress", classes: "bg-primary-100 text-primary-700" },
  locked: { label: "Locked", classes: "bg-neutral-100 text-neutral-500" },
};

function wordStageChip(stage: MorseWordStage, unlocked: boolean): { label: string; classes: string } {
  if (stage.status === "dormant") return { label: "Coming soon", classes: "bg-tan-100 text-tan-600" };
  if (!unlocked) return { label: "Locked", classes: "bg-neutral-100 text-neutral-500" };
  return { label: "Ready", classes: "bg-primary-100 text-primary-700" };
}

export function MorseDashboard() {
  const navigate = useNavigate();
  const activeLesson = mockMorseLessonById[mockActiveMorseLessonId]!;
  const reduced = useReducedMotion();
  const fade = reduced ? fadeUpReduced : fadeUp;
  const stagger = reduced ? staggerChildrenReduced : staggerChildren;
  const item = reduced ? staggerItemReduced : staggerItem;
  let firstIncompleteFound = false;

  return (
    <div className="flex flex-col gap-3xl">
      <motion.section initial="hidden" animate="visible" variants={fade}>
        <p className="text-xs font-semibold uppercase tracking-[0.25em] text-primary-500 mb-xs">
          Taps and tones
        </p>
        <h1 className="font-display text-3xl font-bold text-primary-900 mb-xs">Morse Code</h1>
        <p className="text-neutral-600">
          Six character levels, then whole words   five new letters and numbers at a time.
        </p>
      </motion.section>

      <motion.div initial="hidden" animate="visible" variants={fade} transition={{ delay: 0.08 }}>
        <Card variant="stat" className="flex flex-col md:flex-row items-start md:items-center justify-between gap-lg">
          <div>
            <span className="inline-block text-xs font-semibold uppercase tracking-wide text-primary-600 mb-xs">
              Continue
            </span>
            <h2 className="font-display text-xl font-bold text-neutral-800">{activeLesson.title}</h2>
            <p className="text-sm text-neutral-600 mt-xs max-w-md">{activeLesson.description}</p>
          </div>
          <Button
            variant="primary"
            className="w-full md:w-auto shrink-0"
            onClick={() =>
              navigate(
                activeLesson.exerciseType === "checkout"
                  ? `/morse/levels/${activeLesson.id}/checkout`
                  : `/morse/levels/${activeLesson.id}/${activeLesson.exerciseType}`,
              )
            }
          >
            Continue
          </Button>
        </Card>
      </motion.div>

      <motion.section
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, amount: 0.15 }}
        variants={stagger}
        transition={{ delayChildren: 0.16 }}
      >
        <p className="text-xs font-semibold uppercase tracking-[0.25em] text-primary-500 mb-xs">
          Characters first
        </p>
        <h2 className="font-display text-xl font-bold text-neutral-800 mb-md">Levels</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-md">
          {MORSE_GROUPS.map((group, i) => {
            const avg = averageMasteryForCharacters([...group.characters]);
            const isNext = !firstIncompleteFound && avg < 0.85;
            if (isNext) firstIncompleteFound = true;
            const state = groupState(avg, isNext);
            const chip = STATE_CHIP[state];
            const [levelName, levelRange] = group.label.split("   ");
            const previewCharacter = group.characters[0];

            return (
              <motion.div key={group.id} custom={i} variants={item} className="h-full">
                <Card
                  variant={state === "locked" ? "outline" : "surface"}
                  className="h-full flex flex-col gap-md"
                >
                  <div className="flex items-start justify-between gap-sm">
                    <div>
                      <h3 className="font-display text-lg font-bold text-neutral-800">{levelName}</h3>
                      <p className="text-sm text-neutral-600">{levelRange ?? "Prosigns"}</p>
                    </div>
                    <span
                      className={`shrink-0 rounded-full px-sm py-xs text-xs font-semibold ${chip.classes}`}
                    >
                      {chip.label}
                    </span>
                  </div>

                  {previewCharacter ? (
                    <div className="flex items-center gap-md rounded-lg bg-neutral-50 px-md py-sm">
                      <span className="font-display text-lg font-bold text-neutral-800">
                        {previewCharacter}
                      </span>
                      <MorseSequenceDisplay pattern={MORSE_MAP[previewCharacter]} className="text-base" />
                    </div>
                  ) : (
                    <div className="flex items-center gap-md rounded-lg bg-neutral-50 px-md py-sm">
                      <span className="text-sm text-neutral-600">SOS · AR · KN</span>
                    </div>
                  )}

                  <div className="mt-auto flex flex-col gap-sm">
                    <ProgressBar value={avg} label="Mastery" />
                    <Button
                      variant={state === "active" ? "primary" : "secondary"}
                      disabled={state === "locked"}
                      onClick={() => navigate("/morse/levels")}
                    >
                      {state === "completed" ? "Review" : state === "active" ? "Practice" : "Locked"}
                    </Button>
                  </div>
                </Card>
              </motion.div>
            );
          })}
        </div>
      </motion.section>

      {/* Words & phrases   the staged curriculum past single characters.
          Dormant stages are authored but not yet released; they render as
          "coming soon" and are not navigable. */}
      <motion.section
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, amount: 0.15 }}
        variants={stagger}
      >
        <p className="text-xs font-semibold uppercase tracking-[0.25em] text-primary-500 mb-xs">
          Then real messages
        </p>
        <h2 className="font-display text-xl font-bold text-neutral-800 mb-md">Words &amp; phrases</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-md">
          {mockMorseWordStages.map((stage, i) => {
            const unlocked = isWordStageUnlocked(stage);
            const chip = wordStageChip(stage, unlocked);
            const dormant = stage.status === "dormant";

            return (
              <motion.div key={stage.id} custom={i} variants={item} className="h-full">
                <Card
                  variant={unlocked ? "surface" : "outline"}
                  className={`h-full flex flex-col gap-md ${dormant ? "opacity-70" : ""}`}
                >
                  <div className="flex items-start justify-between gap-sm">
                    <h3 className="font-display text-lg font-bold text-neutral-800">{stage.label}</h3>
                    <span className={`shrink-0 rounded-full px-sm py-xs text-xs font-semibold ${chip.classes}`}>
                      {chip.label}
                    </span>
                  </div>
                  <p className="text-sm text-neutral-600">{stage.description}</p>
                  <div className="flex flex-wrap gap-xs">
                    {stage.words.slice(0, 4).map((w) => (
                      <span
                        key={w}
                        className="rounded-full bg-neutral-100 px-sm py-xs text-xs font-medium text-neutral-600"
                      >
                        {w}
                      </span>
                    ))}
                    {stage.words.length > 4 ? (
                      <span className="rounded-full px-sm py-xs text-xs text-neutral-400">
                        +{stage.words.length - 4} more
                      </span>
                    ) : null}
                  </div>
                  <div className="mt-auto">
                    <Button
                      variant={unlocked ? "primary" : "secondary"}
                      disabled={!unlocked}
                      className="w-full"
                      onClick={() => navigate(`/morse/words/${stage.id}`)}
                    >
                      {dormant ? "Coming soon" : unlocked ? "Start" : "Locked"}
                    </Button>
                  </div>
                </Card>
              </motion.div>
            );
          })}
        </div>
      </motion.section>
    </div>
  );
}
