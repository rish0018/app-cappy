import * as React from "react";
import { NavLink, Outlet } from "react-router-dom";
import { StreakBadge, XPBadge } from "@cappy/ui";
import { mockStreak, mockUser } from "../mockData";

const NAV_ITEMS = [
  { to: "/", label: "Dashboard", end: true },
  { to: "/lessons", label: "Lessons" },
  { to: "/morse", label: "Morse" },
  { to: "/achievements", label: "Achievements" },
  { to: "/profile", label: "Profile" },
];

function navLinkClasses(isActive: boolean): string {
  return [
    "inline-flex items-center min-h-[44px] px-md rounded-md text-sm font-semibold transition-colors motion-reduce:transition-none",
    "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500 focus-visible:ring-offset-2",
    isActive ? "bg-primary-500 text-neutral-0" : "text-neutral-700 hover:bg-primary-50",
  ].join(" ");
}

/** Persistent top-bar shell used by every authenticated route. */
export function NavLayout() {
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
            <span aria-hidden="true" className="text-2xl">
              🐹
            </span>
            <span className="font-display text-lg font-bold text-primary-700">Cappy</span>
          </div>
          <nav aria-label="Primary" className="flex items-center gap-xs">
            {NAV_ITEMS.map((item) => (
              <NavLink
                key={item.to}
                to={item.to}
                end={item.end}
                className={({ isActive }) => navLinkClasses(isActive)}
              >
                {item.label}
              </NavLink>
            ))}
          </nav>
          <div className="flex items-center gap-sm">
            <StreakBadge streakDays={mockStreak.currentStreak} />
            <XPBadge xp={mockUser.totalXp} />
          </div>
        </div>
      </header>
      <main id="main-content" className="flex-1 max-w-6xl w-full mx-auto px-lg py-xl">
        <Outlet />
      </main>
    </div>
  );
}
