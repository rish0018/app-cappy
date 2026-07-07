import * as React from "react";
import { gsap } from "gsap";
import "./FlowingMenu.css";

export interface FlowingMenuItem {
  /** Visible label rendered both as the static link text and inside the marquee. */
  text: string;
  /** Short supporting copy shown under the label (Landing-specific addition, not in the original reference). */
  caption?: string;
  /** Background image used inside the sliding marquee panel. */
  image: string;
  /** Called when the item is activated (click / Enter / second tap on touch). */
  onActivate: () => void;
}

export interface FlowingMenuProps {
  items: FlowingMenuItem[];
  speed?: number;
  textColor?: string;
  bgColor?: string;
  marqueeBgColor?: string;
  marqueeTextColor?: string;
  borderColor?: string;
}

/**
 * Adapted from 0-ideation/flowing-menu-bar. The reference only reveals its
 * marquee on mouse enter/leave, which never fires on touch devices — tapping
 * would silently do nothing but navigate. Here every row is a real <button>
 * (always activatable via click/Enter/Space on any input), and on devices
 * without real hover we additionally use tap to *preview* the marquee panel
 * before a second tap/activation navigates, so the flowing reveal itself is
 * still reachable without a mouse.
 */
export function FlowingMenu({
  items,
  speed = 15,
  textColor = "#fff",
  bgColor = "#120F17",
  marqueeBgColor = "#fff",
  marqueeTextColor = "#120F17",
  borderColor = "rgba(255,255,255,0.2)",
}: FlowingMenuProps) {
  return (
    <div className="flowing-menu-wrap" style={{ backgroundColor: bgColor }}>
      <nav className="flowing-menu">
        {items.map((item) => (
          <FlowingMenuItemRow
            key={item.text}
            {...item}
            speed={speed}
            textColor={textColor}
            marqueeBgColor={marqueeBgColor}
            marqueeTextColor={marqueeTextColor}
            borderColor={borderColor}
          />
        ))}
      </nav>
    </div>
  );
}

interface RowProps extends FlowingMenuItem {
  speed: number;
  textColor: string;
  marqueeBgColor: string;
  marqueeTextColor: string;
  borderColor: string;
}

function useHoverCapable(): boolean {
  const [hoverCapable, setHoverCapable] = React.useState(true);
  React.useEffect(() => {
    if (typeof window === "undefined" || !window.matchMedia) return;
    const mql = window.matchMedia("(hover: hover) and (pointer: fine)");
    setHoverCapable(mql.matches);
    const listener = (e: MediaQueryListEvent) => setHoverCapable(e.matches);
    mql.addEventListener("change", listener);
    return () => mql.removeEventListener("change", listener);
  }, []);
  return hoverCapable;
}

function findClosestEdge(mouseX: number, mouseY: number, width: number, height: number): "top" | "bottom" {
  const distMetric = (x: number, y: number, x2: number, y2: number) => {
    const xDiff = x - x2;
    const yDiff = y - y2;
    return xDiff * xDiff + yDiff * yDiff;
  };
  const topEdgeDist = distMetric(mouseX, mouseY, width / 2, 0);
  const bottomEdgeDist = distMetric(mouseX, mouseY, width / 2, height);
  return topEdgeDist < bottomEdgeDist ? "top" : "bottom";
}

function FlowingMenuItemRow({
  text,
  caption,
  image,
  onActivate,
  speed,
  textColor,
  marqueeBgColor,
  marqueeTextColor,
  borderColor,
}: RowProps) {
  const itemRef = React.useRef<HTMLDivElement>(null);
  const marqueeRef = React.useRef<HTMLDivElement>(null);
  const marqueeInnerRef = React.useRef<HTMLDivElement>(null);
  const animationRef = React.useRef<gsap.core.Tween | null>(null);
  const [repetitions, setRepetitions] = React.useState(4);
  const [revealed, setRevealed] = React.useState(false);
  const hoverCapable = useHoverCapable();
  const animationDefaults = { duration: 0.6, ease: "expo" };

  React.useEffect(() => {
    const calculateRepetitions = () => {
      if (!marqueeInnerRef.current) return;
      const marqueeContent = marqueeInnerRef.current.querySelector<HTMLElement>(".flowing-menu__part");
      if (!marqueeContent) return;
      const contentWidth = marqueeContent.offsetWidth;
      if (!contentWidth) return;
      const viewportWidth = window.innerWidth;
      const needed = Math.ceil(viewportWidth / contentWidth) + 2;
      setRepetitions(Math.max(4, needed));
    };
    calculateRepetitions();
    window.addEventListener("resize", calculateRepetitions);
    return () => window.removeEventListener("resize", calculateRepetitions);
  }, [text, image]);

  React.useEffect(() => {
    const reducedMotion =
      typeof window !== "undefined" &&
      window.matchMedia &&
      window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reducedMotion) return; // static marquee — no auto-scrolling background motion

    const setupMarquee = () => {
      if (!marqueeInnerRef.current) return;
      const marqueeContent = marqueeInnerRef.current.querySelector<HTMLElement>(".flowing-menu__part");
      if (!marqueeContent) return;
      const contentWidth = marqueeContent.offsetWidth;
      if (contentWidth === 0) return;
      animationRef.current?.kill();
      animationRef.current = gsap.to(marqueeInnerRef.current, {
        x: -contentWidth,
        duration: speed,
        ease: "none",
        repeat: -1,
      });
    };
    const timer = setTimeout(setupMarquee, 50);
    return () => {
      clearTimeout(timer);
      animationRef.current?.kill();
    };
  }, [text, image, repetitions, speed]);

  const playReveal = (edge: "top" | "bottom") => {
    if (!itemRef.current || !marqueeRef.current || !marqueeInnerRef.current) return;
    gsap
      .timeline({ defaults: animationDefaults })
      .set(marqueeRef.current, { y: edge === "top" ? "-101%" : "101%" }, 0)
      .set(marqueeInnerRef.current, { y: edge === "top" ? "101%" : "-101%" }, 0)
      .to([marqueeRef.current, marqueeInnerRef.current], { y: "0%" }, 0);
  };

  const playHide = (edge: "top" | "bottom") => {
    if (!itemRef.current || !marqueeRef.current || !marqueeInnerRef.current) return;
    gsap
      .timeline({ defaults: animationDefaults })
      .to(marqueeRef.current, { y: edge === "top" ? "-101%" : "101%" }, 0)
      .to(marqueeInnerRef.current, { y: edge === "top" ? "101%" : "-101%" }, 0);
  };

  const handleMouseEnter = (ev: React.MouseEvent<HTMLElement>) => {
    if (!hoverCapable || !itemRef.current) return;
    const rect = itemRef.current.getBoundingClientRect();
    const edge = findClosestEdge(ev.clientX - rect.left, ev.clientY - rect.top, rect.width, rect.height);
    setRevealed(true);
    playReveal(edge);
  };

  const handleMouseLeave = (ev: React.MouseEvent<HTMLElement>) => {
    if (!hoverCapable || !itemRef.current) return;
    const rect = itemRef.current.getBoundingClientRect();
    const edge = findClosestEdge(ev.clientX - rect.left, ev.clientY - rect.top, rect.width, rect.height);
    setRevealed(false);
    playHide(edge);
  };

  // Tracks the pointer type behind the interaction currently in flight so
  // handleFocus can tell a synthetic tap-triggered focus (part of the
  // touchstart -> ... -> focus -> ... -> click sequence browsers fire on
  // tap) apart from a genuine keyboard Tab focus. Without this, a tap's
  // focus event would call setRevealed(true) a tick before the coincident
  // click runs handleActivate, which would then see revealed === true and
  // navigate immediately instead of previewing — defeating the two-tap
  // fallback entirely.
  const lastPointerTypeRef = React.useRef<string | null>(null);

  const handlePointerDown = (ev: React.PointerEvent<HTMLElement>) => {
    lastPointerTypeRef.current = ev.pointerType;
  };

  const handleFocus = () => {
    if (hoverCapable || revealed) return;
    const ptr = lastPointerTypeRef.current;
    if (ptr === "touch" || ptr === "pen") return; // let handleActivate own this tap
    setRevealed(true);
    playReveal("top");
  };

  const handleBlur = () => {
    if (hoverCapable || !revealed) return;
    setRevealed(false);
    playHide("top");
  };

  /**
   * Touch / keyboard-without-hover fallback: hovering can never happen, so
   * the first activation just previews the flowing panel instead of
   * silently doing nothing. A second activation (panel already open) runs
   * the real action. On real-mouse devices this is a no-op passthrough —
   * hover already revealed the panel, so activation always fires straight
   * away.
   */
  const handleActivate = () => {
    const ptr = lastPointerTypeRef.current;
    const isTouchLike = ptr === "touch" || ptr === "pen";
    lastPointerTypeRef.current = null;
    if (hoverCapable || (revealed && !isTouchLike)) {
      onActivate();
      return;
    }
    if (isTouchLike && revealed) {
      // Touch/pen's own focus event was suppressed above, so `revealed`
      // here can only have been set by a *previous* tap's activation —
      // meaning this is genuinely the second tap. Proceed to activate.
      onActivate();
      return;
    }
    setRevealed(true);
    playReveal("top");
  };

  return (
    <div className="flowing-menu__item cursor-target" ref={itemRef} style={{ borderColor }}>
      <button
        type="button"
        className="flowing-menu__item-link"
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
        onPointerDown={handlePointerDown}
        onFocus={handleFocus}
        onBlur={handleBlur}
        onClick={handleActivate}
        style={{ color: textColor }}
      >
        <span className="flowing-menu__item-text">{text}</span>
        {caption ? <span className="flowing-menu__item-caption">{caption}</span> : null}
        {!hoverCapable ? (
          <span className="flowing-menu__item-hint" aria-hidden="true">
            {revealed ? "Tap again to continue" : "Tap to preview"}
          </span>
        ) : null}
      </button>
      <div className="flowing-menu__marquee" ref={marqueeRef} style={{ backgroundColor: marqueeBgColor }}>
        <div className="flowing-menu__marquee-inner-wrap">
          <div className="flowing-menu__marquee-inner" ref={marqueeInnerRef} aria-hidden="true">
            {Array.from({ length: repetitions }).map((_, idx) => (
              <div className="flowing-menu__part" key={idx} style={{ color: marqueeTextColor }}>
                <span>{text}</span>
                <div className="flowing-menu__img" style={{ backgroundImage: `url(${image})` }} />
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
