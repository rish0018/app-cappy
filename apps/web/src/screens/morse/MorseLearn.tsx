import * as React from "react";
import { useNavigate, useParams } from "react-router-dom";
import { motion, useReducedMotion } from "framer-motion";
import { Button, Card, MorseAudioPlayer, MorseSequenceDisplay } from "@cappy/ui";
import { MORSE_MAP, MORSE_PROSIGNS } from "@cappy/types";
import { patternToAudioTimeline } from "@cappy/core";
import { mockMorseLessonById } from "../../morseMockData";
import { fadeUp, fadeUpReduced } from "../../components/motion";

export function MorseLearn() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const lesson = id ? mockMorseLessonById[id] : undefined;
  const reduced = useReducedMotion();
  const fade = reduced ? fadeUpReduced : fadeUp;

  if (!lesson) {
    return <p className="text-neutral-600">Lesson not found.</p>;
  }

  const learnItems = [
    ...lesson.characters.map((character) => ({
      label: character,
      pattern: MORSE_MAP[character],
    })),
    ...(lesson.prosigns ?? []).map((prosign) => ({
      label: prosign,
      pattern: MORSE_PROSIGNS[prosign]!,
    })),
  ];

  return (
    <div className="max-w-xl mx-auto flex flex-col gap-xl">
      <motion.div initial="hidden" animate="visible" variants={fade}>
        <Card variant="surface" className="flex flex-col gap-lg">
          <div className="text-center">
            <span className="text-xs font-semibold uppercase tracking-wide text-primary-600">Learn</span>
            <h1 className="font-display text-2xl font-bold text-neutral-800">{lesson.title}</h1>
            <p className="text-sm text-neutral-600 mt-xs">Review these Morse patterns visually and hear each tone.</p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-md">
            {learnItems.map((item) => (
              <Card key={item.label} variant="outline" className="flex flex-col gap-sm p-lg">
                <div className="flex items-center justify-between gap-sm">
                  <div>
                    <p className="text-lg font-bold text-neutral-800">{item.label}</p>
                    <p className="text-sm text-neutral-500">Pattern</p>
                  </div>
                  <MorseSequenceDisplay pattern={item.pattern} className="text-xl" />
                </div>
                <div className="flex justify-end">
                  <MorseAudioPlayer timeline={patternToAudioTimeline(item.pattern)} />
                </div>
              </Card>
            ))}
          </div>

          <div className="flex justify-end gap-sm">
            <Button variant="primary" onClick={() => navigate(`/morse/levels/${lesson.id}/send`)}>
              Practice
            </Button>
          </div>
        </Card>
      </motion.div>
    </div>
  );
}
