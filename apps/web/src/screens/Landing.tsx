import * as React from "react";
import { useNavigate } from "react-router-dom";
import { Button, Card } from "@cappy/ui";
import { Reveal } from "../components/Reveal";
import logoMark from "../assets/logo-mark-circular.png";
import heroLibrary from "../assets/hero-library.jpg";
import heroMusic from "../assets/hero-music.jpg";
import heroSpace from "../assets/hero-space.jpg";
import heroExplorer from "../assets/hero-explorer.jpg";

const HOW_IT_WORKS = [
  {
    image: heroLibrary,
    title: "Watch",
    body: "Short, clear demos show you exactly how each sign, tap, or pattern works — no rush, no timer.",
  },
  {
    image: heroMusic,
    title: "Practice",
    body: "Try it yourself with your camera or keyboard. Cappy gives gentle, specific feedback along the way.",
  },
  {
    image: heroSpace,
    title: "Grow",
    body: "Build a calm streak of daily practice across Braille, Morse code, and ASL — progress over perfection.",
  },
];

export function Landing() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-neutral-50 text-neutral-800">
      {/* Hero */}
      <section className="relative overflow-hidden bg-primary-900 text-neutral-0">
        <img
          src={heroExplorer}
          alt=""
          aria-hidden="true"
          className="absolute inset-0 h-full w-full object-cover opacity-25"
        />
        <div className="absolute inset-0 bg-primary-900/70" aria-hidden="true" />
        <div className="relative max-w-4xl mx-auto px-lg py-4xl flex flex-col items-center text-center gap-lg">
          <img src={logoMark} alt="Cappy" className="h-20 w-20 rounded-full shadow-lg" />
          <p className="text-xs font-semibold uppercase tracking-[0.3em] text-accent-300">
            Braille &middot; Morse Code &middot; ASL
          </p>
          <h1 className="font-display text-4xl sm:text-5xl font-bold leading-tight">
            A calm, encouraging way to learn how the world communicates
          </h1>
          <p className="max-w-xl text-base text-neutral-200">
            Cappy helps you learn Braille, Morse code, and American Sign Language one small,
            unhurried step at a time — with a friendly capybara guide cheering you on.
          </p>
          <Button
            variant="primary"
            className="text-base bg-accent-500 hover:bg-accent-700 active:bg-accent-700"
            onClick={() => navigate("/onboarding")}
          >
            Let's get started
          </Button>
        </div>
      </section>

      {/* How it works */}
      <section className="max-w-6xl mx-auto px-lg py-4xl">
        <Reveal>
          <p className="text-center text-xs font-semibold uppercase tracking-[0.3em] text-primary-600 mb-sm">
            How it works
          </p>
          <h2 className="text-center font-display text-3xl font-bold text-primary-800 mb-2xl">
            Three simple steps, at your pace
          </h2>
        </Reveal>
        <div className="grid gap-xl sm:grid-cols-3">
          {HOW_IT_WORKS.map((step, i) => (
            <Reveal key={step.title} delay={i * 120}>
              <Card className="h-full flex flex-col gap-md overflow-hidden p-0">
                <img
                  src={step.image}
                  alt=""
                  aria-hidden="true"
                  className="h-40 w-full object-cover"
                />
                <div className="flex flex-col gap-sm p-lg">
                  <h3 className="font-display text-lg font-semibold text-primary-700">
                    {step.title}
                  </h3>
                  <p className="text-sm text-neutral-600">{step.body}</p>
                </div>
              </Card>
            </Reveal>
          ))}
        </div>
      </section>

      {/* Mascot moment / philosophy */}
      <section className="bg-tan-100">
        <div className="max-w-3xl mx-auto px-lg py-4xl text-center">
          <Reveal>
            <img
              src={logoMark}
              alt=""
              aria-hidden="true"
              className="h-16 w-16 rounded-full mx-auto mb-lg"
            />
            <p className="font-display text-2xl italic font-semibold text-neutral-800">
              "There's no clock running, and no wrong way to learn."
            </p>
            <p className="mt-md text-sm text-neutral-600">— Cappy</p>
          </Reveal>
        </div>
      </section>

      {/* Closing CTA */}
      <section className="max-w-4xl mx-auto px-lg py-4xl text-center flex flex-col items-center gap-lg">
        <Reveal>
          <h2 className="font-display text-3xl font-bold text-primary-800 mb-sm">
            Ready to sign your first letter?
          </h2>
          <p className="text-base text-neutral-600 mb-lg">
            It takes less than a minute to get started — no pressure, just progress.
          </p>
          <Button variant="primary" className="text-base" onClick={() => navigate("/onboarding")}>
            Start learning
          </Button>
        </Reveal>
      </section>
    </div>
  );
}
