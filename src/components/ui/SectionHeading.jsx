import React from "react";
import { cn } from "../../lib/utils";

export function SectionHeading({ eyebrow, title, description, action, className }) {
  return (
    <div className={cn("mb-8 sm:mb-12", className)}>
      {eyebrow && <div className="text-xs font-bold tracking-wider text-accent uppercase mb-2">{eyebrow}</div>}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
        <div className="max-w-2xl">
          <h2 className="text-2xl sm:text-3xl font-sans font-bold text-foreground tracking-tight mb-2.5 leading-tight">{title}</h2>
          {description && <p className="text-muted text-base leading-relaxed">{description}</p>}
        </div>
        {action && <div className="shrink-0">{action}</div>}
      </div>
    </div>
  );
}

