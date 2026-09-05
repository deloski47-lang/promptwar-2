import type { HTMLAttributes } from "react";

interface CardProps extends HTMLAttributes<HTMLDivElement> {
  accented?: boolean;
}

/**
 * The base surface used throughout the app: a squared-off panel with
 * blueprint-style corner brackets rather than a soft drop-shadow, so specs
 * (ideas, deep dives, roadmap weeks) read like technical data sheets.
 */
export function Card({ accented = false, className = "", children, ...props }: CardProps) {
  return (
    <div
      className={`corner-bracket border border-paper-line bg-white/70 p-5 sm:p-6 ${
        accented ? "ring-1 ring-accent" : ""
      } ${className}`}
      {...props}
    >
      {children}
    </div>
  );
}
