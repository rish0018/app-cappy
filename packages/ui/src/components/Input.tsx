import * as React from "react";

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  /** Visible label — always required for accessibility, no placeholder-as-label. */
  label: string;
  /**
   * Encouraging, specific validation copy (see docs/AI_project_bible.md §3
   * Brand Voice) — never "Invalid" or "Failed". Rendered with role="alert".
   */
  error?: string;
  /** Optional supporting copy shown under the label when there's no error. */
  hint?: string;
  containerClassName?: string;
}

let idCounter = 0;
function useStableId(prefix: string, providedId?: string): string {
  const generated = React.useRef<string>();
  if (!generated.current) {
    idCounter += 1;
    generated.current = `${prefix}-${idCounter}`;
  }
  return providedId ?? generated.current;
}

/**
 * Text input with visible label, error, and hint slots. Meets the same
 * 44px touch target and spacing scale as Button. Error state uses the
 * `error` color token (technical/validation issues only — never repurposed
 * for lesson "wrong answer" feedback, per docs/AI_project_bible.md §11).
 */
export const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ label, error, hint, id, className = "", containerClassName = "", ...rest }, ref) => {
    const inputId = useStableId("input", id);
    const errorId = `${inputId}-error`;
    const hintId = `${inputId}-hint`;
    const describedBy = error ? errorId : hint ? hintId : undefined;

    return (
      <div className={["flex flex-col gap-xs", containerClassName].join(" ")}>
        <label htmlFor={inputId} className="text-sm font-medium text-neutral-700">
          {label}
        </label>
        <input
          ref={ref}
          id={inputId}
          aria-invalid={error ? true : undefined}
          aria-describedby={describedBy}
          className={[
            "min-h-[44px] w-full px-md py-sm rounded-md border font-base text-base",
            "bg-neutral-0 text-neutral-800 placeholder:text-neutral-400",
            "transition-colors motion-reduce:transition-none",
            "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500 focus-visible:ring-offset-2",
            "disabled:opacity-50 disabled:cursor-not-allowed",
            error
              ? "border-error-500 focus-visible:ring-error-500"
              : "border-neutral-300 focus:border-primary-400",
            className,
          ].join(" ")}
          {...rest}
        />
        {error ? (
          <p id={errorId} role="alert" className="text-sm text-error-700">
            {error}
          </p>
        ) : hint ? (
          <p id={hintId} className="text-sm text-neutral-500">
            {hint}
          </p>
        ) : null}
      </div>
    );
  },
);
Input.displayName = "Input";

/** Alias — some call sites read more naturally as "TextField". */
export const TextField = Input;
export type TextFieldProps = InputProps;
