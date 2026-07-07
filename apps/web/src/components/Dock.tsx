import {
  motion,
  MotionValue,
  useMotionValue,
  useSpring,
  useTransform,
  type SpringOptions,
  AnimatePresence,
} from "framer-motion";
import {
  Children,
  cloneElement,
  createContext,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";

function cx(...classes: Array<string | false | undefined>): string {
  return classes.filter(Boolean).join(" ");
}

const DOCK_HEIGHT = 128;
const DEFAULT_MAGNIFICATION = 80;
const DEFAULT_DISTANCE = 150;
const DEFAULT_PANEL_HEIGHT = 64;

export type DockOrientation = "horizontal" | "vertical";

export type DockProps = {
  children: React.ReactNode;
  className?: string;
  distance?: number;
  panelHeight?: number;
  magnification?: number;
  spring?: SpringOptions;
  /** "horizontal" (default) lays items in a row and magnifies on X; "vertical" stacks them in a column and magnifies on Y. */
  orientation?: DockOrientation;
};

export type DockItemProps = {
  className?: string;
  children: React.ReactNode;
  onClick?: () => void;
};

export type DockLabelProps = {
  className?: string;
  children: React.ReactNode;
};

export type DockIconProps = {
  className?: string;
  children: React.ReactNode;
};

type DockContextType = {
  pointerPos: MotionValue<number>;
  spring: SpringOptions;
  magnification: number;
  distance: number;
  orientation: DockOrientation;
};

const DockContext = createContext<DockContextType | undefined>(undefined);

function useDock() {
  const context = useContext(DockContext);
  if (!context) {
    throw new Error("Dock.Item, Dock.Label and Dock.Icon must be used within a Dock");
  }
  return context;
}

/** Apple-style magnifying dock. Items scale up as the pointer nears them. */
export function Dock({
  children,
  className,
  spring = { mass: 0.1, stiffness: 150, damping: 12 },
  magnification = DEFAULT_MAGNIFICATION,
  distance = DEFAULT_DISTANCE,
  panelHeight = DEFAULT_PANEL_HEIGHT,
  orientation = "horizontal",
}: DockProps) {
  const pointerPos = useMotionValue(Infinity);
  const isHovered = useMotionValue(0);
  const isVertical = orientation === "vertical";

  const maxCrossAxis = useMemo(() => {
    return Math.max(DOCK_HEIGHT, magnification + magnification / 2 + 4);
  }, [magnification]);

  const crossAxisRow = useTransform(isHovered, [0, 1], [panelHeight, maxCrossAxis]);
  const crossAxis = useSpring(crossAxisRow, spring);

  return (
    <motion.div
      style={isVertical ? { width: crossAxis, scrollbarWidth: "none" } : { height: crossAxis, scrollbarWidth: "none" }}
      className={cx(
        "flex max-w-full",
        isVertical ? "my-2 flex-col items-end" : "mx-2 items-end overflow-x-auto"
      )}
    >
      <motion.div
        onMouseMove={({ pageX, pageY }) => {
          isHovered.set(1);
          pointerPos.set(isVertical ? pageY : pageX);
        }}
        onMouseLeave={() => {
          isHovered.set(0);
          pointerPos.set(Infinity);
        }}
        className={cx(
          "flex gap-4 rounded-2xl bg-neutral-0 shadow-lg border border-neutral-200",
          isVertical ? "my-auto h-fit flex-col py-4" : "mx-auto w-fit px-4",
          className
        )}
        style={isVertical ? { width: panelHeight } : { height: panelHeight }}
        role="toolbar"
        aria-label="Application dock"
        aria-orientation={orientation}
      >
        <DockContext.Provider value={{ pointerPos, spring, distance, magnification, orientation }}>
          {children}
        </DockContext.Provider>
      </motion.div>
    </motion.div>
  );
}

export function DockItem({ children, className, onClick }: DockItemProps) {
  const ref = useRef<HTMLDivElement>(null);
  const { distance, magnification, pointerPos, spring, orientation } = useDock();
  const isHovered = useMotionValue(0);
  const isVertical = orientation === "vertical";

  const pointerDistance = useTransform(pointerPos, (val) => {
    const domRect = ref.current?.getBoundingClientRect() ?? { x: 0, y: 0, width: 0, height: 0 };
    return isVertical
      ? val - domRect.y - domRect.height / 2
      : val - domRect.x - domRect.width / 2;
  });

  const sizeTransform = useTransform(
    pointerDistance,
    [-distance, 0, distance],
    [40, magnification, 40]
  );

  const size = useSpring(sizeTransform, spring);

  return (
    <motion.div
      ref={ref}
      style={{ width: size, height: size }}
      onHoverStart={() => isHovered.set(1)}
      onHoverEnd={() => isHovered.set(0)}
      onFocus={() => isHovered.set(1)}
      onBlur={() => isHovered.set(0)}
      className={cx("relative inline-flex items-center justify-center", className)}
      tabIndex={0}
      role="button"
      onClick={onClick}
      onKeyDown={(event) => {
        if (onClick && (event.key === "Enter" || event.key === " ")) {
          event.preventDefault();
          onClick();
        }
      }}
    >
      {Children.map(children, (child) =>
        cloneElement(child as React.ReactElement, { size, isHovered })
      )}
    </motion.div>
  );
}

export function DockLabel({ children, className, ...rest }: DockLabelProps) {
  const restProps = rest as Record<string, unknown>;
  const isHovered = restProps["isHovered"] as MotionValue<number>;
  const [isVisible, setIsVisible] = useState(false);
  const { orientation } = useDock();
  const isVertical = orientation === "vertical";

  useEffect(() => {
    const unsubscribe = isHovered.on("change", (latest) => {
      setIsVisible(latest === 1);
    });
    return () => unsubscribe();
  }, [isHovered]);

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={isVertical ? { opacity: 0, x: 0 } : { opacity: 0, y: 0 }}
          animate={isVertical ? { opacity: 1, x: 10 } : { opacity: 1, y: -10 }}
          exit={isVertical ? { opacity: 0, x: 0 } : { opacity: 0, y: 0 }}
          transition={{ duration: 0.2 }}
          className={cx(
            "absolute w-fit whitespace-pre rounded-md border border-neutral-200 bg-neutral-50 px-2 py-0.5 text-xs font-semibold text-neutral-700",
            isVertical ? "left-full top-1/2" : "-top-6 left-1/2",
            className
          )}
          role="tooltip"
          style={isVertical ? { y: "-50%" } : { x: "-50%" }}
        >
          {children}
        </motion.div>
      )}
    </AnimatePresence>
  );
}

export function DockIcon({ children, className, ...rest }: DockIconProps) {
  const restProps = rest as Record<string, unknown>;
  const size = restProps["size"] as MotionValue<number>;
  const iconSize = useTransform(size, (val) => val / 2);

  return (
    <motion.div
      style={{ width: iconSize, height: iconSize }}
      className={cx("flex items-center justify-center", className)}
    >
      {children}
    </motion.div>
  );
}
