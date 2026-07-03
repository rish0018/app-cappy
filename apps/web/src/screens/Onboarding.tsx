import * as React from "react";
import { useNavigate } from "react-router-dom";
import { Button, MascotMoment } from "@cappy/ui";
import logoMark from "../assets/logo-mark-circular.png";

/** Welcome screen. Calm, unhurried tone per docs/VISION.md. */
export function Onboarding() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen flex items-center justify-center bg-primary-50 px-lg">
      <div className="max-w-xl w-full bg-neutral-0 rounded-xl shadow-md p-2xl flex flex-col gap-xl">
        <div className="text-center">
          <img src={logoMark} alt="" aria-hidden="true" className="h-16 w-16 rounded-full mx-auto mb-lg" />
          <h1 className="font-display text-3xl font-bold text-primary-700 mb-sm">
            Welcome to Cappy
          </h1>
          <p className="text-base text-neutral-600">
            A calm, encouraging way to learn American Sign Language — one letter at a time.
          </p>
        </div>

        <MascotMoment
          context="onboarding"
          icon={<img src={logoMark} alt="" aria-hidden="true" className="h-9 w-9 rounded-full flex-shrink-0" />}
          message="Hi, I'm Cappy! We'll take this at your pace — there's no clock running and no wrong way to learn. Ready to sign your first letter?"
        />

        <ul className="flex flex-col gap-sm text-sm text-neutral-700">
          <li className="flex items-center gap-sm">
            <span aria-hidden="true">👀</span> Watch a short demo of each sign.
          </li>
          <li className="flex items-center gap-sm">
            <span aria-hidden="true">🤲</span> Practice with your camera, at your own pace.
          </li>
          <li className="flex items-center gap-sm">
            <span aria-hidden="true">🌱</span> Build a gentle streak — progress over perfection.
          </li>
        </ul>

        <Button
          variant="primary"
          className="w-full text-base"
          onClick={() => navigate("/dashboard")}
        >
          Let's get started
        </Button>
      </div>
    </div>
  );
}
