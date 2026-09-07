import React from "react";
import { cn } from "../../lib/utils";

export function FilterChip({ active, children, onClick, className }) {
  return (
    <button
      onClick={onClick}
      className={cn(
        "inline-flex items-center justify-center rounded-full px-4 py-1.5 text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2",
        active 
          ? "bg-primary text-primary-foreground" 
          : "bg-surface border border-border text-muted hover:text-foreground hover:border-foreground/30",
        className
      )}
    >
      {children}
    </button>
  );
}
