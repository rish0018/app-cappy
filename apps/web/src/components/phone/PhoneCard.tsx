import * as React from "react";

export interface PhoneCardProps {
  children: React.ReactNode;
  className?: string;
  tone?: "paper" | "tint";
  onClick?: () => void;
}

/** Shared "premium paper resting on cream" surface used across every phone screen. */
export function PhoneCard({ children, className = "", tone = "paper", onClick }: PhoneCardProps) {
  return (
    <div
      className={[
        "rounded-[1.4rem] p-4",
        tone === "paper" ? "bg-[#FFFDF9]" : "bg-[#EFE6D8]",
        className,
      ].join(" ")}
      style={{
        boxShadow:
          tone === "paper"
            ? "0 1px 2px rgba(43,38,32,0.05), 0 8px 20px -12px rgba(43,38,32,0.18)"
            : "inset 0 1px 2px rgba(43,38,32,0.04)",
      }}
      onClick={onClick}
    >
      {children}
    </div>
  );
}
