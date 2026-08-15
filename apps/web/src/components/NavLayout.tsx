import * as React from "react";
import { Outlet, useLocation } from "react-router-dom";
import { StreakBadge, XPBadge } from "@cappy/ui";
import { mockStreak, mockUser } from "../mockData";
import logoMark from "../assets/logo-mark-circular.png";
import { DashboardDock, LESSON_STEP_PATTERN } from "./DashboardDock";
import { ASL_LESSON_BACKGROUNDS } from "../lessonBackgrounds";
import aslFallbackBackground from "../assets/scene_curiosity_desk.png";
import dashboardBackground from "../assets/scene_learning_workshop.png";
import morseBackground from "../assets/scene_accessibility_constellations.png";
import achievementsBackground from "../assets/scene_forest.png";
import profileBackground from "../assets/scene_human_connection.png";

const ASL_LESSON_STEP_PATTERN = /^\/lessons\/([^/]+)\/.+/;

/** Each authenticated route gets its own themed backdrop, layered behind `<main>`. */
function backgroundFor(pathname: string): string | undefined {
  const aslMatch = ASL_LESSON_STEP_PATTERN.exec(pathname);
  if (aslMatch)
    return ASL_LESSON_BACKGROUNDS[aslMatch[1]!] ?? aslFallbackBackground;
  // Every /morse* route (dashboard, level list, and each level/word step)
  // shares the same constellation backdrop for a cohesive "taps and tones" section.
  if (pathname === "/morse" || pathname.startsWith("/morse/"))
    return morseBackground;
  if (pathname === "/dashboard") return dashboardBackground;
  if (pathname === "/achievements") return achievementsBackground;
  if (pathname === "/profile") return profileBackground;
  return undefined;
}

/** Persistent top-bar shell used by every authenticated route. Navigation lives in DashboardDock. */
export function NavLayout() {
  const location = useLocation();
  const isLessonStep = LESSON_STEP_PATTERN.test(location.pathname);
  const background = backgroundFor(location.pathname);

  return (
    <div className="min-h-screen flex flex-col">
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:absolute focus:top-2 focus:left-2 focus:z-50 focus:bg-neutral-0 focus:px-md focus:py-sm focus:rounded-md focus:shadow-md"
      >
        Skip to main content
      </a>
      <header className="border-b border-neutral-200 bg-neutral-0">
        <div className="max-w-6xl mx-auto flex flex-wrap items-center justify-between gap-md px-lg py-md">
          <div className="flex items-center gap-md">
            <img
              src={logoMark}
              alt=""
              aria-hidden="true"
              className="h-9 w-9 rounded-full"
            />
            <span className="font-display text-lg font-bold text-primary-700">
              Cappy
            </span>
          </div>
          <div className="flex items-center gap-sm">
            <StreakBadge streakDays={mockStreak.currentStreak} />
            <XPBadge xp={mockUser.totalXp} />
          </div>
        </div>
      </header>
      <div
        className="relative flex-1 min-h-0 bg-cover bg-center"
        style={
          background ? { backgroundImage: `url(${background})` } : undefined
        }
      >
        {background ? (
          <div className="absolute inset-0 bg-white/85" aria-hidden="true" />
        ) : null}
        <main
          id="main-content"
          className={
            isLessonStep
              ? // Mobile keeps the dock at the bottom (see DashboardDock), so pad
                // the bottom there and only switch to left padding at md+.
                "relative max-w-6xl w-full mx-auto px-lg py-xl pb-32 md:pb-xl md:pl-24"
              : "relative flex-1 max-w-6xl w-full mx-auto px-lg py-xl pb-32"
          }
        >
          <Outlet />
        </main>
      </div>
      <DashboardDock />
    </div>
  );
}
