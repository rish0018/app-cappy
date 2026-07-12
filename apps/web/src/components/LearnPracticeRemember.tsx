import * as React from "react";
import { FloatingPhone, STORY_GROUPS, type StoryGroupKey } from "./phone";
import "./LearnPracticeRemember.css";

const GROUP_KEYS: StoryGroupKey[] = ["hero", "learn", "practice", "remember"];

/**
 * Per-card accent styling, cycled by index: Learn = warm accent orange,
 * Practice = sage teal, Remember = tan. All three pull from the brand
 * palette so the cards read as facets of the same dark-teal section.
 */
const CARD_ACCENTS = [
  {
    border: "border-l-accent-400",
    eyebrow: "text-accent-300",
    ring: "ring-accent-400/50",
  },
  {
    border: "border-l-primary-300",
    eyebrow: "text-primary-300",
    ring: "ring-primary-300/50",
  },
  {
    border: "border-l-tan-300",
    eyebrow: "text-tan-300",
    ring: "ring-tan-300/50",
  },
] as const;

export interface EditorialBlock {
  eyebrow: string;
  title: string;
  body: string;
  highlight: string;
}

export interface LearnPracticeRememberProps {
  /** The hero heading content (logo, tagline, H1, subcopy, CTA) — rendered above the blocks, same column. */
  hero: React.ReactNode;
  blocks: EditorialBlock[];
  className?: string;
}

/**
 * The page's whole upper-half centerpiece: one phone, pinned in view, that
 * runs continuously from the hero header down through Learn / Practice /
 * Remember and releases right at "Pick your path". An IntersectionObserver
 * watches a thin band at the vertical center of the viewport — whichever
 * card (or the hero itself) crosses it becomes "active", and the phone's
 * screen cluster switches to match (see STORY_GROUPS). While the hero is
 * active the phone autoplays the full seven-screen story; each card narrows
 * it to just its own cluster.
 *
 * The phone runs in the right column at EVERY breakpoint: on mobile it's
 * scaled down (see LearnPracticeRemember.css) and pinned sticky beside the
 * scrolling cards, so it never sits inert between sections.
 */
export function LearnPracticeRemember({ hero, blocks, className = "" }: LearnPracticeRememberProps) {
  const [active, setActive] = React.useState(0);
  const itemRefs = React.useRef<Array<HTMLDivElement | null>>([]);
  const sectionRef = React.useRef<HTMLElement>(null);

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
    <section
      ref={sectionRef}
      // overflow-x-clip (NOT overflow-hidden) — it clips the hero's
      // off-canvas morse texture without creating a scroll container,
      // which would silently disable the phone column's position:sticky.
      className={["relative overflow-x-clip bg-primary-900 text-neutral-0", className].join(" ")}
    >
      <div className="lpr-grid relative max-w-6xl mx-auto px-lg">
        <div
          className="lpr-hero"
          ref={(el) => {
            itemRefs.current[0] = el;
          }}
        >
          {hero}
        </div>

        <div className="lpr-phone sticky top-16 self-start flex justify-center pt-lg md:top-24 md:h-screen md:items-center md:self-auto md:pt-0">
          <div className="lpr-phone-scale-wrap w-full flex justify-center">
            <div className="lpr-phone-scale w-full max-w-[300px]">
              <FloatingPhone
                screens={STORY_GROUPS[activeKey]}
                groupKey={activeKey}
                scrollContainerRef={sectionRef}
                className="w-full"
              />
            </div>
          </div>
        </div>

        <div className="lpr-blocks flex flex-col gap-xl md:gap-[7rem] py-lg pb-3xl md:py-[7rem]">
          {blocks.map((block, i) => {
            const accent = CARD_ACCENTS[i % CARD_ACCENTS.length]!;
            const isActive = active === i + 1;

            return (
              <div
                key={block.title}
                ref={(el) => {
                  itemRefs.current[i + 1] = el;
                }}
                className={[
                  "flex flex-col gap-sm md:gap-md text-left rounded-2xl border border-primary-700/60 border-l-4 bg-primary-800/50 p-lg md:p-xl transition-all duration-500",
                  accent.border,
                  isActive ? `opacity-100 ring-1 ${accent.ring}` : "opacity-60",
                ].join(" ")}
              >
                <p className={`text-xs font-semibold uppercase tracking-[0.3em] ${accent.eyebrow}`}>
                  {block.eyebrow}
                </p>
                <h3 className="font-display text-xl md:text-4xl font-bold text-neutral-0">{block.title}</h3>
                <p className="text-sm md:text-base text-neutral-300 max-w-md">{block.body}</p>
                <p className={`text-sm font-medium ${accent.eyebrow}`}>{block.highlight}</p>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
