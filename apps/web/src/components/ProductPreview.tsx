import * as React from "react";
import { motion, useReducedMotion } from "framer-motion";
import { ProgressBar, XPBadge } from "@cappy/ui";
import "./ProductPreview.css";

import logoMark from "../assets/logo-mark-circular.png";
import sceneCuriosityDesk from "../assets/scene_curiosity_desk.png";
import sceneCappyUniverse from "../assets/scene_cappy_universe.png";
import characterCurious from "../assets/character_curious_cappy.png";
import characterMentor from "../assets/character_mentor_cappy.png";
import characterCelebration from "../assets/character_celebration_cappy.png";

type PanelTone = "primary" | "accent";

interface PanelDef {
  eyebrow: string;
  tone?: PanelTone;
  content: React.ReactNode;
}

/**
 * Static, non-interactive stand-in for the real LessonTile — this preview
 * is decorative (see aria-hidden on the root), so it deliberately avoids
 * rendering a focusable <button> that AT users could tab into twice (the
 * scroll track renders every panel twice to loop seamlessly).
 */
function MiniTile({ title, state }: { title: string; state: "locked" | "active" | "completed" }) {
  const stateClasses: Record<typeof state, string> = {
    locked: "bg-neutral-100 text-neutral-400",
    active: "bg-primary-500 text-neutral-0",
    completed: "bg-success-100 text-success-700",
  };
  const icon: Record<typeof state, string> = { locked: "🔒", active: "▶", completed: "✓" };
  return (
    <div className={`flex flex-col items-center justify-center gap-xs rounded-lg p-md ${stateClasses[state]}`}>
      <span className="text-lg">{icon[state]}</span>
      <span className="text-sm font-medium">{title}</span>
    </div>
  );
}

const PANELS: PanelDef[] = [
  {
    eyebrow: "Welcome",
    content: (
      <>
        <div className="flex items-center gap-md">
          <img src={logoMark} alt="" className="h-14 w-14 rounded-full shadow-md" />
          <div>
            <p className="font-display text-lg font-semibold text-neutral-800">Hi, I'm Cappy</p>
            <p className="text-sm text-neutral-500">Ready when you are — no rush.</p>
          </div>
        </div>
        <div className="flex flex-wrap gap-sm">
          <span className="rounded-full bg-primary-500 px-md py-xs text-sm font-medium text-neutral-0">Braille</span>
          <span className="rounded-full bg-neutral-100 px-md py-xs text-sm font-medium text-neutral-600">
            Morse Code
          </span>
          <span className="rounded-full bg-neutral-100 px-md py-xs text-sm font-medium text-neutral-600">ASL</span>
        </div>
      </>
    ),
  },
  {
    eyebrow: "Learn",
    content: (
      <>
        <div className="flex items-center gap-lg">
          <img src={sceneCuriosityDesk} alt="" className="h-24 w-24 rounded-2xl object-cover shadow-sm" />
          <div>
            <p className="font-display text-lg font-semibold text-neutral-800">Lesson 1 &middot; ASL</p>
            <p className="text-sm text-neutral-500">Watch how it's signed, at your own pace.</p>
          </div>
        </div>
        <p className="flex items-center gap-xs text-sm font-medium text-primary-600">
          <span>▶</span> Play demo
        </p>
      </>
    ),
  },
  {
    eyebrow: "Practice",
    content: (
      <>
        <div className="flex items-center justify-between">
          <p className="font-display text-lg font-semibold text-neutral-800">Try it yourself</p>
          <span className="text-xs text-neutral-500">Camera on</span>
        </div>
        <div className="grid grid-cols-3 gap-sm">
          <MiniTile title="A" state="completed" />
          <MiniTile title="B" state="active" />
          <MiniTile title="C" state="locked" />
        </div>
      </>
    ),
  },
  {
    eyebrow: "Progress",
    content: (
      <>
        <p className="font-display text-lg font-semibold text-neutral-800">Letter mastery</p>
        <ProgressBar value={0.72} label="ASL alphabet" />
        <p className="text-sm text-neutral-500">Day 5 of a quiet streak — steady wins.</p>
      </>
    ),
  },
  {
    eyebrow: "Achievements",
    tone: "accent",
    content: (
      <>
        <div className="flex items-center justify-between">
          <p className="font-display text-lg font-semibold text-neutral-800">Nice work</p>
          <XPBadge xp={120} />
        </div>
        <div className="flex flex-wrap gap-sm">
          <span className="rounded-full bg-accent-100 px-md py-xs text-sm text-accent-700">First Sign</span>
          <span className="rounded-full bg-accent-100 px-md py-xs text-sm text-accent-700">Quick Learner</span>
        </div>
      </>
    ),
  },
  {
    eyebrow: "Community",
    content: (
      <>
        <div className="flex items-center -space-x-3">
          <img src={characterCurious} alt="" className="h-10 w-10 rounded-full border-2 border-neutral-0 object-cover" />
          <img src={characterMentor} alt="" className="h-10 w-10 rounded-full border-2 border-neutral-0 object-cover" />
          <img
            src={characterCelebration}
            alt=""
            className="h-10 w-10 rounded-full border-2 border-neutral-0 object-cover"
          />
        </div>
        <p className="text-sm text-neutral-600">3 friends are practicing today.</p>
      </>
    ),
  },
  {
    eyebrow: "Cappy World",
    tone: "accent",
    content: (
      <>
        <img src={sceneCappyUniverse} alt="" className="h-40 w-full rounded-2xl object-cover shadow-sm" />
        <p className="text-sm text-neutral-500">Every skill's path, side by side.</p>
      </>
    ),
  },
];

function Panel({ eyebrow, tone = "primary", content, ariaHidden }: PanelDef & { ariaHidden: boolean }) {
  return (
    <div
      aria-hidden={ariaHidden}
      className="flex h-[380px] w-full shrink-0 flex-col gap-md border-b border-neutral-100 px-xl py-xl"
    >
      <span
        className={[
          "text-xs font-semibold uppercase tracking-[0.25em]",
          tone === "accent" ? "text-accent-500" : "text-primary-600",
        ].join(" ")}
      >
        {eyebrow}
      </span>
      <div className="flex flex-1 flex-col justify-center gap-md">{content}</div>
    </div>
  );
}

export interface ProductPreviewProps {
  className?: string;
}

/**
 * Floating "browser window" centerpiece for the Landing hero. Loops a
 * vertical filmstrip of seven decorative screens (welcome -> learn ->
 * practice -> progress -> achievements -> community -> Cappy world) via a
 * pure-CSS marquee (paused on hover, disabled under reduced motion), and
 * tilts toward the cursor the same way the hero mascot does so the two
 * feel like one interaction language.
 */
export function ProductPreview({ className = "" }: ProductPreviewProps) {
  const reduced = useReducedMotion();
  const wrapRef = React.useRef<HTMLDivElement>(null);
  const [tilt, setTilt] = React.useState({ rotateX: 0, rotateY: 0 });

  const handlePointerMove = React.useCallback(
    (event: React.PointerEvent<HTMLDivElement>) => {
      if (reduced || event.pointerType !== "mouse" || !wrapRef.current) return;
      const rect = wrapRef.current.getBoundingClientRect();
      const px = (event.clientX - rect.left) / rect.width - 0.5;
      const py = (event.clientY - rect.top) / rect.height - 0.5;
      setTilt({ rotateX: py * -4, rotateY: px * 4 });
    },
    [reduced],
  );

  const handlePointerLeave = React.useCallback(() => {
    setTilt({ rotateX: 0, rotateY: 0 });
  }, []);

  return (
    <div className={["relative mx-auto max-w-3xl px-lg", className].join(" ")}>
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -left-10 -top-10 h-56 w-56 rounded-full bg-accent-100 opacity-60 blur-3xl"
      />
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -bottom-10 -right-6 h-64 w-64 rounded-full bg-primary-100 opacity-70 blur-3xl"
      />

      <p className="sr-only">
        A preview of the Cappy app: welcome, learn, practice, progress, achievements, community, and Cappy World
        screens.
      </p>

      <motion.div
        ref={wrapRef}
        aria-hidden="true"
        onPointerMove={handlePointerMove}
        onPointerLeave={handlePointerLeave}
        style={{ transformStyle: "preserve-3d" }}
        animate={{ rotateX: tilt.rotateX, rotateY: tilt.rotateY }}
        whileHover={reduced ? undefined : { y: -6, scale: 1.01 }}
        transition={{ type: "spring", stiffness: 90, damping: 16 }}
        className="cappy-preview-wrap relative overflow-hidden rounded-[28px] border border-neutral-200 bg-neutral-0 shadow-2xl"
      >
        <div className="flex items-center gap-sm border-b border-neutral-200 bg-neutral-50 px-lg py-md">
          <span className="h-2.5 w-2.5 rounded-full bg-[#ff5f57]" />
          <span className="h-2.5 w-2.5 rounded-full bg-[#febc2e]" />
          <span className="h-2.5 w-2.5 rounded-full bg-[#28c840]" />
          <span className="ml-md truncate rounded-full bg-neutral-100 px-md py-xs text-xs text-neutral-400">
            cappy.app/learn
          </span>
        </div>

        <div className="cappy-preview-viewport relative h-[380px] overflow-hidden">
          <div className="cappy-preview-track flex flex-col">
            {[0, 1].map((copy) =>
              PANELS.map((panel) => (
                <Panel key={`${copy}-${panel.eyebrow}`} {...panel} ariaHidden={copy === 1} />
              )),
            )}
          </div>
        </div>
      </motion.div>
    </div>
  );
}
