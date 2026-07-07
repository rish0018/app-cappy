import * as React from "react";
import { FloatingPhone, STORY_GROUPS, type StoryGroupKey } from "./phone";

const GROUP_KEYS: StoryGroupKey[] = ["learn", "practice", "remember"];

export interface EditorialBlock {
  eyebrow: string;
  title: string;
  body: string;
  highlight: string;
}

export interface LearnPracticeRememberProps {
  blocks: EditorialBlock[];
  className?: string;
}

/**
 * The page's centerpiece: a phone pinned in view while the Learn / Practice
 * / Remember copy scrolls past beside it. An IntersectionObserver watches a
 * thin band at the vertical center of the viewport — whichever text block
 * crosses it becomes "active", and the phone's screen cluster switches to
 * match (see STORY_GROUPS). Falls back to a plain stacked layout with no
 * observer wiring below the md breakpoint, where nothing is sticky anyway.
 */
export function LearnPracticeRemember({ blocks, className = "" }: LearnPracticeRememberProps) {
  const [active, setActive] = React.useState(0);
  const itemRefs = React.useRef<Array<HTMLDivElement | null>>([]);

  React.useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting) return;
          const index = itemRefs.current.findIndex((el) => el === entry.target);
          if (index !== -1) setActive(index);
        });
      },
      { rootMargin: "-45% 0px -45% 0px", threshold: 0 },
    );
    itemRefs.current.forEach((el) => el && observer.observe(el));
    return () => observer.disconnect();
  }, [blocks.length]);

  const activeKey = GROUP_KEYS[active] ?? GROUP_KEYS[0]!;

  return (
    <section className={["max-w-6xl mx-auto px-lg", className].join(" ")}>
      <div className="grid gap-2xl md:grid-cols-2 md:items-start">
        <div className="order-2 md:order-1 flex flex-col gap-4xl md:gap-[7rem] py-4xl md:py-[7rem]">
          {blocks.map((block, i) => (
            <div
              key={block.title}
              ref={(el) => {
                itemRefs.current[i] = el;
              }}
              className={[
                "flex flex-col gap-md text-center md:text-left transition-opacity duration-500",
                active === i ? "opacity-100" : "opacity-50",
              ].join(" ")}
            >
              <p className="text-xs font-semibold uppercase tracking-[0.3em] text-primary-600">{block.eyebrow}</p>
              <h3 className="font-display text-3xl md:text-4xl font-bold text-primary-800">{block.title}</h3>
              <p className="text-base text-neutral-600 max-w-md mx-auto md:mx-0">{block.body}</p>
              <p className="text-sm font-medium text-accent-600">{block.highlight}</p>
            </div>
          ))}
        </div>

        <div className="order-1 md:order-2 flex items-center justify-center py-2xl md:sticky md:top-24 md:h-screen md:py-0">
          <FloatingPhone screens={STORY_GROUPS[activeKey]} groupKey={activeKey} className="w-full max-w-[300px]" />
        </div>
      </div>
    </section>
  );
}
