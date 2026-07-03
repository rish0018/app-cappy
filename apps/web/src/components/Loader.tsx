import * as React from "react";
import logoMark from "../assets/logo-mark-circular.png";
import { HeroScene } from "../assets/illustrations/HeroScene";
import { BrailleStepIcon } from "../assets/illustrations/BrailleStepIcon";
import { AslStepIcon } from "../assets/illustrations/AslStepIcon";
import { MorseStepIcon } from "../assets/illustrations/MorseStepIcon";

const SLIDES = [HeroScene, BrailleStepIcon, AslStepIcon, MorseStepIcon];
const DURATION_MS = 3200;

export interface LoaderProps {
  onDone: () => void;
}

/**
 * One-time cinematic welcome: a slow cross-fading slideshow of learning
 * moments that settles on the Cappy mark, then hands off to the app.
 * Mirrors the reference site's Loader pattern but in Cappy's calm palette.
 */
export function Loader({ onDone }: LoaderProps) {
  const [progress, setProgress] = React.useState(0);
  const [exiting, setExiting] = React.useState(false);
  const startRef = React.useRef<number | null>(null);

  React.useEffect(() => {
    let frame: number;

    const tick = (timestamp: number) => {
      if (startRef.current === null) startRef.current = timestamp;
      const elapsed = timestamp - startRef.current;
      const p = Math.min(elapsed / DURATION_MS, 1);
      setProgress(p);

      if (p < 1) {
        frame = requestAnimationFrame(tick);
      } else {
        setExiting(true);
        window.setTimeout(onDone, 900);
      }
    };

    frame = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frame);
  }, [onDone]);

  const activeIndex = Math.min(Math.floor(progress * SLIDES.length), SLIDES.length - 1);
  const showLogo = progress > 0.85;

  return (
    <div
      role="status"
      aria-label="Loading Cappy"
      className={[
        "fixed inset-0 z-[100] flex items-center justify-center overflow-hidden bg-primary-900",
        "transition-opacity duration-700 motion-reduce:transition-none",
        exiting ? "opacity-0 pointer-events-none" : "opacity-100",
      ].join(" ")}
    >
      {SLIDES.map((Slide, i) => (
        <Slide
          key={i}
          aria-hidden="true"
          className={[
            "absolute inset-0 h-full w-full transition-opacity duration-[1200ms] ease-out motion-reduce:transition-none",
            i === activeIndex ? "opacity-30" : "opacity-0",
          ].join(" ")}
          style={{
            transform: `scale(${1.04 + progress * 0.06})`,
            transition: "transform 3.2s ease-out, opacity 1.2s ease-out",
          }}
        />
      ))}

      <div className="absolute inset-0 bg-primary-900/60" aria-hidden="true" />

      <div className="relative flex flex-col items-center gap-lg px-lg text-center">
        <img
          src={logoMark}
          alt="Cappy"
          className={[
            "h-24 w-24 rounded-full shadow-lg transition-all duration-700 motion-reduce:transition-none",
            showLogo ? "opacity-100 scale-100" : "opacity-0 scale-90",
          ].join(" ")}
        />
        <p className="font-display text-xl font-semibold tracking-wide text-neutral-0">
          Cappy
        </p>
        <p className="text-sm text-neutral-200">
          Braille &middot; Morse Code &middot; ASL
        </p>
        <div className="mt-md h-1 w-48 overflow-hidden rounded-full bg-neutral-0/20">
          <div
            className="h-full rounded-full bg-accent-500"
            style={{ width: `${Math.round(progress * 100)}%` }}
          />
        </div>
      </div>
    </div>
  );
}
