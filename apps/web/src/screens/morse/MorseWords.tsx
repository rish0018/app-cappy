import * as React from "react";
import { useNavigate, useParams } from "react-router-dom";
import { motion, useReducedMotion } from "framer-motion";
import { Button, Card, MascotMoment, MorseAudioPlayer, MorseSequenceDisplay } from "@cappy/ui";
import { wordToAudioTimeline, wordToPatterns } from "@cappy/core";
import celebrationCappy from "../../assets/characters/character_celebration_cappy.png";
import { isWordStageUnlocked, mockMorseWordStageById } from "../../morseMockData";
import { fadeUp, fadeUpReduced, scaleIn, scaleInReduced } from "../../components/motion";
import { reactTo } from "../../mascot/mascotStore";
import { useProgressRecorder } from "../../hooks/useProgressRecorder";

function buildOptions(correct: string, pool: string[]): string[] {
  const distractors = pool.filter((w) => w !== correct).slice(0, 3);
  return [correct, ...distractors].sort(() => 0.5 - Math.random());
}

/**
 * Word-stage practice: listen to a whole word (letter gaps included) and
 * pick it from the stage's word list. The pattern is revealed only after
 * answering, per the same "don't give the answer away" rule as
 * MorseReceive. The interactive Card has no entrance animation (no-lag
 * rule shared with MorseSend/MorseReceive).
 */
export function MorseWords() {
  const { stageId } = useParams<{ stageId: string }>();
  const navigate = useNavigate();
  const stage = stageId ? mockMorseWordStageById[stageId] : undefined;
  const [wordIndex, setWordIndex] = React.useState(0);
  const [selected, setSelected] = React.useState<string | null>(null);
  const [finished, setFinished] = React.useState(false);
  const reduced = useReducedMotion();
  const { recordLessonProgress, recordDailyActivity } = useProgressRecorder();
  const correctCountRef = React.useRef(0);
  const fade = reduced ? fadeUpReduced : fadeUp;
  const scale = reduced ? scaleInReduced : scaleIn;

  const options = React.useMemo(() => {
    if (!stage) return [];
    const word = stage.words[wordIndex % stage.words.length]!;
    return buildOptions(word, stage.words);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [stage?.id, wordIndex]);

  if (!stage) {
    return <p className="text-neutral-600">Word stage not found.</p>;
  }

  if (!isWordStageUnlocked(stage)) {
    return (
      <div className="max-w-xl mx-auto">
        <Card variant="outline" className="text-center flex flex-col items-center gap-md py-2xl">
          <h1 className="font-display text-2xl font-bold text-neutral-800">
            {stage.status === "dormant" ? "Coming soon" : "Not unlocked yet"}
          </h1>
          <p className="text-sm text-neutral-600 max-w-sm">
            {stage.status === "dormant"
              ? "This stage is on Cappy's workbench   it'll open up in a future update."
              : "Finish the character levels this stage builds on first, then come back."}
          </p>
          <Button variant="secondary" onClick={() => navigate("/morse")}>
            Back to Morse dashboard
          </Button>
        </Card>
      </div>
    );
  }

  const word = stage.words[wordIndex % stage.words.length]!;
  const timeline = wordToAudioTimeline(word);
  const answered = selected !== null;
  const correct = selected === word;
  const isLastWord = wordIndex + 1 >= stage.words.length;

  const handleNext = () => {
    if (correct) correctCountRef.current += 1;
    setSelected(null);
    if (isLastWord) {
      setFinished(true);
      reactTo("unitComplete");
      const accuracy = correctCountRef.current / stage.words.length;
      void recordLessonProgress({
        lessonId: `morse-words-${stage.id}`,
        status: "completed",
        attempts: 1,
        completionPercentage: 100,
        score: Math.round(accuracy * 100),
        startedAt: null,
        completedAt: new Date().toISOString(),
      });
      void recordDailyActivity();
      return;
    }
    setWordIndex((i) => i + 1);
  };

  if (finished) {
    return (
      <div className="max-w-xl mx-auto flex flex-col gap-xl">
        <motion.div initial="hidden" animate="visible" variants={scale}>
          <Card variant="feature" className="flex flex-col items-center gap-lg text-center py-2xl">
            <h1 className="font-display text-2xl font-bold text-neutral-800">Stage complete!</h1>
            <MascotMoment
              context="milestone"
              icon={
                <img
                  src={celebrationCappy}
                  alt=""
                  aria-hidden="true"
                  className="h-14 w-14 rounded-full flex-shrink-0"
                />
              }
              message={`You just read ${stage.words.length} whole words by ear. That's real Morse.`}
            />
            <Button variant="primary" onClick={() => navigate("/morse")}>
              Back to Morse dashboard
            </Button>
          </Card>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="max-w-xl mx-auto flex flex-col gap-xl">
      <motion.span
        className="text-xs font-semibold uppercase tracking-wide text-primary-600 text-center block"
        initial="hidden"
        animate="visible"
        variants={fade}
      >
        {stage.label}   Word {wordIndex + 1} of {stage.words.length}
      </motion.span>

      <Card variant="surface" className="flex flex-col items-center gap-lg text-center py-2xl px-lg">
        <h1 className="font-display text-2xl font-bold text-neutral-800">Which word did you hear?</h1>
        <p className="text-sm text-neutral-500 -mt-sm">
          Listen for the longer pauses   they separate the letters.
        </p>

        <MorseAudioPlayer timeline={timeline} />

        <div className="grid grid-cols-2 gap-sm w-full">
          {options.map((option) => (
            <Button
              key={option}
              variant={selected === option ? "primary" : "secondary"}
              disabled={answered}
              onClick={() => setSelected(option)}
            >
              {option}
            </Button>
          ))}
        </div>

        {answered && (
          <div className="flex flex-col items-center gap-md">
            <p className={correct ? "text-success-700" : "text-neutral-600"}>
              {correct ? "Nice   that's right!" : `Not quite   that was "${word}". Let's keep going.`}
            </p>
            <div className="flex flex-wrap items-end justify-center gap-md rounded-lg bg-neutral-50 p-md">
              {wordToPatterns(word).map((pattern, i) =>
                pattern === "/" ? (
                  <span key={i} className="text-2xl text-neutral-300 self-center" aria-hidden="true">
                    /
                  </span>
                ) : (
                  <div key={i} className="flex flex-col items-center gap-xs">
                    <MorseSequenceDisplay pattern={pattern} className="text-xl" />
                    <span className="text-xs font-semibold text-neutral-500">{word[i]}</span>
                  </div>
                ),
              )}
            </div>
            <Button variant="primary" onClick={handleNext}>
              {isLastWord ? "Finish stage" : "Next word"}
            </Button>
          </div>
        )}
      </Card>
    </div>
  );
}
