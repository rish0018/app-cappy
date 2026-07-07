import * as React from "react";
import { Outlet, useLocation } from "react-router-dom";
import { StreakBadge, XPBadge } from "@cappy/ui";
import { mockStreak, mockUser } from "../mockData";
import logoMark from "../assets/logo-mark-circular.png";
import { DashboardDock, LESSON_STEP_PATTERN } from "./DashboardDock";

/** Persistent top-bar shell used by every authenticated route. Navigation lives in DashboardDock. */
export function NavLayout() {
  const location = useLocation();
  const isLessonStep = LESSON_STEP_PATTERN.test(location.pathname);

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
            <img src={logoMark} alt="" aria-hidden="true" className="h-9 w-9 rounded-full" />
            <span className="font-display text-lg font-bold text-primary-700">Cappy</span>
          </div>
          <div className="flex items-center gap-sm">
            <StreakBadge streakDays={mockStreak.currentStreak} />
            <XPBadge xp={mockUser.totalXp} />
          </div>
        </div>
      </header>
      <main
        id="main-content"
        className={
          isLessonStep
            ? "flex-1 max-w-6xl w-full mx-auto px-lg py-xl pl-24"
            : "flex-1 max-w-6xl w-full mx-auto px-lg py-xl pb-32"
        }
      >
        <Outlet />
      </main>
      <DashboardDock />
    </div>
  );
}
