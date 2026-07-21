import * as React from "react";
import { motion, useReducedMotion, type HTMLMotionProps } from "framer-motion";

export type SSOProvider = "google" | "apple";

export interface SSOButtonProps extends Omit<HTMLMotionProps<"button">, "children"> {
  provider: SSOProvider;
}

const LABELS: Record<SSOProvider, string> = {
  google: "Continue with Google",
  apple: "Continue with Apple",
};

/**
 * Google's "G" mark, reproduced as inline paths so no brand icon package is
 * required. Kept to the official four-color mark; do not recolor.
 */
function GoogleIcon() {
  return (
    <svg aria-hidden="true" viewBox="0 0 24 24" width="20" height="20">
      <path
        fill="#4285F4"
        d="M23.49 12.27c0-.79-.07-1.54-.2-2.27H12v4.3h6.47c-.28 1.5-1.13 2.77-2.4 3.62v3h3.87c2.27-2.09 3.55-5.17 3.55-8.65z"
      />
      <path
        fill="#34A853"
        d="M12 24c3.24 0 5.95-1.07 7.94-2.9l-3.87-3c-1.08.73-2.46 1.16-4.07 1.16-3.13 0-5.78-2.11-6.73-4.96H1.28v3.11C3.26 21.3 7.31 24 12 24z"
      />
      <path
        fill="#FBBC05"
        d="M5.27 14.3A7.16 7.16 0 0 1 4.9 12c0-.8.14-1.57.37-2.3V6.6H1.28A11.97 11.97 0 0 0 0 12c0 1.93.46 3.76 1.28 5.4l3.99-3.1z"
      />
      <path
        fill="#EA4335"
        d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.94 1.19 15.24 0 12 0 7.31 0 3.26 2.7 1.28 6.6l3.99 3.1C6.22 6.86 8.87 4.75 12 4.75z"
      />
    </svg>
  );
}

/** Simplified Apple glyph — monochrome, inherits currentColor. */
function AppleIcon() {
  return (
    <svg aria-hidden="true" viewBox="0 0 24 24" width="18" height="18" fill="currentColor">
      <path d="M16.37 1c.1 1.02-.29 2.02-.9 2.76-.63.76-1.7 1.35-2.72 1.27-.12-1 .34-2.05.95-2.76C14.34 1.47 15.41.9 16.37 1zm2.9 17.94c-.5 1.08-.74 1.57-1.38 2.53-.9 1.34-2.16 3.02-3.72 3.03-1.39.02-1.74-.9-3.62-.9-1.87 0-2.27.88-3.65.92-1.5.05-2.65-1.44-3.55-2.78C1.05 19.05-.33 14.98 1.02 12.1c.66-1.4 1.83-2.29 3.11-2.3 1.4-.03 2.27.94 3.63.94 1.35 0 2.17-.94 3.66-.94.9 0 2.36.14 3.44.98-3.02 1.62-2.55 5.8.41 6.6.02.55.11 1.09.2 1.56z" />
    </svg>
  );
}

const ICONS: Record<SSOProvider, () => React.ReactElement> = {
  google: GoogleIcon,
  apple: AppleIcon,
};

/**
 * Third-party sign-in button. Purely presentational + click handler —
 * wiring to `signInWithOAuth(provider)` happens at the call site so this
 * component stays framework/backend agnostic.
 */
export const SSOButton = React.forwardRef<HTMLButtonElement, SSOButtonProps>(
  ({ provider, className = "", disabled, ...rest }, ref) => {
    const reduced = useReducedMotion();
    const Icon = ICONS[provider];

    return (
      <motion.button
        ref={ref}
        type="button"
        disabled={disabled}
        whileHover={reduced || disabled ? undefined : { scale: 1.01 }}
        whileTap={reduced || disabled ? undefined : { scale: 0.98 }}
        transition={{ duration: 0.15, ease: "easeOut" }}
        className={[
          "inline-flex items-center justify-center gap-sm min-h-[44px] w-full px-lg py-sm",
          "rounded-md font-base text-base font-medium border border-neutral-300 bg-neutral-0 text-neutral-800",
          "shadow-sm transition-colors motion-reduce:transition-none hover:bg-neutral-50",
          "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500 focus-visible:ring-offset-2",
          "disabled:opacity-50 disabled:cursor-not-allowed",
          className,
        ].join(" ")}
        {...rest}
      >
        <Icon />
        <span>{LABELS[provider]}</span>
      </motion.button>
    );
  },
);
SSOButton.displayName = "SSOButton";
