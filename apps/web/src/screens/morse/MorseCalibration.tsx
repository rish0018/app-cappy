import * as React from "react";
import { useNavigate, useParams } from "react-router-dom";
import { Button, Card, MascotMoment, MorseKeyer } from "@cappy/ui";
import { calibrateUnitMs, DEFAULT_UNIT_MS, type TapEvent } from "@cappy/core";
import { getMorseCalibration, setMorseCalibration } from "../../morseMockData";

const REQUIRED_TAPS = 5;

/**
 * One-time calibration step before a learner's first Send lesson: captures
 * a handful of steady taps and averages them into a personal unitMs, which
 * replaces DEFAULT_UNIT_MS for later dot/dash classification. Navigates on
 * to the Send screen once done (or immediately if skipped). If the learner
 * has already calibrated this session, skips straight through instead of
 * re-prompting.
 */
export function MorseCalibration() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [taps, setTaps] = React.useState<TapEvent[]>([]);
  const alreadyCalibrated = getMorseCalibration();

  const done = taps.length >= REQUIRED_TAPS;
  const unitMs = done ? calibrateUnitMs(taps) : null;

  const goToSend = (resolvedUnitMs: number) => {
    if (id) {
      navigate(`/morse/levels/${id}/send`, { state: { unitMs: resolvedUnitMs }, replace: true });
    } else {
      navigate("/morse/levels", { replace: true });
    }
  };

  React.useEffect(() => {
    if (alreadyCalibrated !== null) {
      goToSend(alreadyCalibrated);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [alreadyCalibrated]);

  const handleTap = (durationMs: number) => {
    setTaps((prev) => (prev.length >= REQUIRED_TAPS ? prev : [...prev, { durationMs }]));
  };

  if (alreadyCalibrated !== null) {
    return null;
  }

  return (
    <div className="max-w-xl mx-auto flex flex-col gap-xl">
      <Card className="flex flex-col items-center gap-lg text-center py-2xl">
        <span className="text-xs font-semibold uppercase tracking-wide text-primary-600">Calibration</span>

        <MascotMoment
          context="onboarding"
          message="Before we start sending, let's learn your natural rhythm. Tap the key a few times at a steady, comfortable pace."
        />

        <p className="text-neutral-600 text-sm">
          Tap 5 times, all at the same speed. Don't worry about dots or dashes yet.
        </p>

        <MorseKeyer onTap={handleTap} disabled={done} label="Tap" />

        {done ? (
          <p className="text-success-700 text-sm font-medium">Got it — your rhythm is set.</p>
        ) : (
          <div className="flex items-center gap-sm" role="status" aria-label={`${taps.length} of ${REQUIRED_TAPS} taps recorded`}>
            {Array.from({ length: REQUIRED_TAPS }).map((_, index) => (
              <span
                key={index}
                aria-hidden="true"
                className={[
                  "w-3 h-3 rounded-full transition-colors motion-reduce:transition-none",
                  index < taps.length
                    ? "bg-primary-500 motion-safe:scale-105"
                    : "bg-neutral-200",
                ].join(" ")}
              />
            ))}
          </div>
        )}

        <div className="flex flex-col gap-sm w-full max-w-xs">
          <Button
            variant="primary"
            className="w-full"
            disabled={!done}
            onClick={() => {
              const resolved = unitMs ?? DEFAULT_UNIT_MS;
              setMorseCalibration(resolved);
              goToSend(resolved);
            }}
          >
            Continue
          </Button>
          <Button
            variant="secondary"
            className="w-full"
            onClick={() => {
              setMorseCalibration(DEFAULT_UNIT_MS);
              goToSend(DEFAULT_UNIT_MS);
            }}
          >
            Skip, use default timing
          </Button>
        </div>
      </Card>
    </div>
  );
}
