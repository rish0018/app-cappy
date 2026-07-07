import { matchPath } from "react-router-dom";
import type { MascotFigurePose, MascotFigureSize } from "@cappy/ui";

const PEEK = "absolute right-3 md:right-6 bottom-0 translate-y-[16%] hidden sm:block";

export type MascotBubbleTail = "left" | "center" | "right";

export interface AnchorConfig {
  id: string;
  pose: MascotFigurePose;
  size: MascotFigureSize;
  positionClass: string;
  figureClass?: string;
  tail: MascotBubbleTail;
}

// Every route anchors bottom-right (PEEK) with a right-pointing tail, so the
// registry below only needs to vary id/pose/size per screen.
type RouteAnchor = Pick<AnchorConfig, "id" | "pose" | "size" | "figureClass">;

// Ordered: specific patterns before their parents. `end:true` matching.
const REGISTRY: Array<[string, RouteAnchor]> = [
  ["/dashboard", { id: "dash", pose: "mentor", size: "lg" }],
  ["/lessons/:id/demo", { id: "l-demo", pose: "curious", size: "md" }],
  ["/lessons/:id/practice", { id: "l-prac", pose: "practice", size: "md" }],
  ["/lessons/:id/quiz", { id: "l-quiz", pose: "practice", size: "md" }],
  ["/lessons/:id/review", { id: "l-rev", pose: "mentor", size: "lg" }],
  ["/lessons", { id: "lessons", pose: "mentor", size: "lg" }],
  ["/morse/levels/:id/send", { id: "m-send", pose: "practice", size: "md" }],
  ["/morse/levels/:id/receive", { id: "m-recv", pose: "thinking", size: "md" }],
  ["/morse/levels/:id/checkout", { id: "m-check", pose: "mentor", size: "lg" }],
  ["/morse/levels", { id: "m-levels", pose: "mentor", size: "md" }],
  ["/morse", { id: "morse", pose: "mentor", size: "lg" }],
  ["/achievements", { id: "ach", pose: "mentor", size: "lg" }],
  ["/profile", { id: "profile", pose: "mentor", size: "md" }],
];

export function resolveAnchor(pathname: string): AnchorConfig | null {
  for (const [pattern, cfg] of REGISTRY) {
    if (matchPath({ path: pattern, end: true }, pathname)) {
      return { ...cfg, positionClass: PEEK, tail: "right" };
    }
  }
  return null; // "/", "/onboarding" -> no companion
}
