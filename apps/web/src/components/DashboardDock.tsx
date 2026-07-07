import { Award, BookOpen, Home, Radio, User } from "lucide-react";
import { useLocation, useNavigate } from "react-router-dom";
import { Dock, DockIcon, DockItem, DockLabel } from "./Dock";

const DOCK_ITEMS = [
  { to: "/dashboard", label: "Dashboard", icon: Home },
  { to: "/lessons", label: "Lessons", icon: BookOpen },
  { to: "/morse", label: "Morse", icon: Radio },
  { to: "/achievements", label: "Achievements", icon: Award },
  { to: "/profile", label: "Profile", icon: User },
];

/** Matches an in-progress lesson/level step, e.g. /lessons/a1/demo or /morse/levels/2/send. */
export const LESSON_STEP_PATTERN = /^\/(lessons|morse\/levels)\/[^/]+\/.+/;

/**
 * Floating quick-nav dock shown on the dashboard and every route reached from it.
 * Sits as a horizontal bar at the bottom normally, but switches to a vertical bar
 * pinned to the side while inside a lesson/level step so it stays out of the way
 * of the step content.
 */
export function DashboardDock() {
  const navigate = useNavigate();
  const location = useLocation();
  const isLessonStep = LESSON_STEP_PATTERN.test(location.pathname);

  return (
    <div
      className={
        isLessonStep
          ? "fixed left-4 top-1/2 z-40 flex -translate-y-1/2 pointer-events-none"
          : "fixed inset-x-0 bottom-4 z-40 flex justify-center px-md pointer-events-none"
      }
    >
      <div className="pointer-events-auto">
        <Dock
          orientation={isLessonStep ? "vertical" : "horizontal"}
          className={isLessonStep ? "items-end pr-3" : "items-end pb-3"}
        >
          {DOCK_ITEMS.map((item) => {
            const isActive =
              item.to === "/dashboard"
                ? location.pathname === item.to
                : location.pathname.startsWith(item.to);
            const Icon = item.icon;

            return (
              <DockItem
                key={item.to}
                onClick={() => navigate(item.to)}
                className={
                  isActive
                    ? "aspect-square rounded-full bg-primary-500"
                    : "aspect-square rounded-full bg-neutral-100"
                }
              >
                <DockLabel>{item.label}</DockLabel>
                <DockIcon>
                  <Icon
                    className={
                      isActive
                        ? "h-full w-full text-neutral-0"
                        : "h-full w-full text-neutral-600"
                    }
                  />
                </DockIcon>
              </DockItem>
            );
          })}
        </Dock>
      </div>
    </div>
  );
}
