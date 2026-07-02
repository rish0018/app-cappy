import * as React from "react";

export type ButtonVariant = "primary" | "secondary" | "ghost";

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
}

const VARIANT_CLASSES: Record<ButtonVariant, string> = {
  primary:
    "bg-primary-500 text-neutral-0 hover:bg-primary-600 active:bg-primary-700",
  secondary:
    "bg-tan-200 text-neutral-800 hover:bg-tan-300 active:bg-tan-400",
  ghost:
    "bg-transparent text-primary-600 hover:bg-primary-50 active:bg-primary-100",
};

/** Primary/secondary/ghost button. Meets 44x44 touch target and visible focus ring. */
export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ variant = "primary", className = "", children, ...rest }, ref) => {
    return (
      <button
        ref={ref}
        className={[
          "inline-flex items-center justify-center min-h-[44px] min-w-[44px] px-lg py-sm",
          "rounded-md font-base text-base font-medium",
          "transition-colors motion-reduce:transition-none",
          "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500 focus-visible:ring-offset-2",
          "disabled:opacity-50 disabled:cursor-not-allowed",
          VARIANT_CLASSES[variant],
          className,
        ].join(" ")}
        {...rest}
      >
        {children}
      </button>
    );
  },
);
Button.displayName = "Button";
