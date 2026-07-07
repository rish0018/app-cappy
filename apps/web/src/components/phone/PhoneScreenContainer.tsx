import * as React from "react";
import { AnimatePresence } from "framer-motion";

export interface PhoneScreenContainerProps {
  children: React.ReactNode;
}

/** Clips the phone display and hosts the AnimatePresence stack for whichever screen is current. */
export function PhoneScreenContainer({ children }: PhoneScreenContainerProps) {
  return (
    <div className="relative h-full w-full overflow-hidden">
      <AnimatePresence mode="wait" initial={false}>
        {children}
      </AnimatePresence>
    </div>
  );
}
