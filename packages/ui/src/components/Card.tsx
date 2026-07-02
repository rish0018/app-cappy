import * as React from "react";

export interface CardProps extends React.HTMLAttributes<HTMLDivElement> {}

/** Generic rounded surface container used across lesson/dashboard layouts. */
export const Card = React.forwardRef<HTMLDivElement, CardProps>(
  ({ className = "", children, ...rest }, ref) => {
    return (
      <div
        ref={ref}
        className={[
          "bg-neutral-0 border border-neutral-200 rounded-lg p-lg shadow-sm",
          className,
        ].join(" ")}
        {...rest}
      >
        {children}
      </div>
    );
  },
);
Card.displayName = "Card";
