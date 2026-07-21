import * as React from "react";
import { PHONE_COLORS } from "./palette";

export interface PhoneFrameProps {
  children: React.ReactNode;
  className?: string;
}

/**
 * A timeless flagship-phone shell   matte graphite aluminum, thin bezels,
 * large display corners. Deliberately generic (no notch copy, no branding)
 * so it reads as "a phone" rather than a clone of any real device.
 */
export function PhoneFrame({ children, className = "" }: PhoneFrameProps) {
  return (
    <div
      className={["relative mx-auto w-[280px] sm:w-[300px] aspect-[9/19.5]", className].join(" ")}
      style={{ perspective: 1400 }}
    >
      {/* grounding shadow */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute left-1/2 -bottom-6 h-10 w-[70%] -translate-x-1/2 rounded-full blur-2xl"
        style={{ background: "radial-gradient(closest-side, rgba(43,38,32,0.35), rgba(43,38,32,0) 72%)" }}
      />

      {/* aluminum frame */}
      <div
        className="relative h-full w-full rounded-[3rem] p-[3px] shadow-[0_30px_60px_-15px_rgba(43,38,32,0.45)]"
        style={{
          background:
            "linear-gradient(155deg, #9a9490 0%, #77726d 22%, #5b5854 45%, #726d68 65%, #a39d97 85%, #8c8681 100%)",
        }}
      >
        {/* warm edge highlight */}
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 rounded-[3rem] opacity-60"
          style={{
            background:
              "linear-gradient(155deg, rgba(255,244,230,0.55) 0%, rgba(255,244,230,0) 12%, rgba(255,244,230,0) 82%, rgba(255,244,230,0.35) 100%)",
          }}
        />

        {/* side controls */}
        <span aria-hidden="true" className="absolute -left-[2px] top-[22%] h-10 w-[3px] rounded-full bg-[#4c4744]/70" />
        <span aria-hidden="true" className="absolute -left-[2px] top-[34%] h-16 w-[3px] rounded-full bg-[#4c4744]/70" />
        <span aria-hidden="true" className="absolute -right-[2px] top-[26%] h-20 w-[3px] rounded-full bg-[#4c4744]/70" />

        {/* inner bezel */}
        <div
          className="relative h-full w-full rounded-[2.7rem] p-2"
          style={{ background: "linear-gradient(160deg, #232120 0%, #171615 60%, #201e1d 100%)" }}
        >
          {/* screen */}
          <div
            className="relative h-full w-full overflow-hidden rounded-[2.2rem]"
            style={{ backgroundColor: PHONE_COLORS.cream }}
          >
            {/* speaker + camera */}
            <div className="pointer-events-none absolute left-1/2 top-[10px] z-20 flex -translate-x-1/2 items-center gap-2">
              <span className="h-[5px] w-9 rounded-full bg-black/25" />
              <span className="h-[6px] w-[6px] rounded-full bg-black/30" />
            </div>

            {/* subtle glass reflection */}
            <div
              aria-hidden="true"
              className="pointer-events-none absolute inset-0 z-30"
              style={{
                background:
                  "linear-gradient(115deg, rgba(255,255,255,0.16) 0%, rgba(255,255,255,0.03) 18%, rgba(255,255,255,0) 38%)",
              }}
            />

            <div className="relative z-10 h-full w-full pt-6">{children}</div>
          </div>
        </div>
      </div>
    </div>
  );
}
