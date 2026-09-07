import React from "react";
import { cn } from "../../lib/utils";

export function SectionHeading({ eyebrow, title, description, action, className }) {
  return (
    <div className={cn("mb-8 sm:mb-12", className)}>
      {eyebrow && <div className="text-sm font-semibold tracking-wider text-accent uppercase mb-2">{eyebrow}</div>}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
        <div className="max-w-2xl">
          <h2 className="text-3xl sm:text-4xl font-display font-bold text-primary mb-3 leading-tight">{title}</h2>
          {description && <p className="text-muted text-lg">{description}</p>}
        </div>
        {action && <div className="shrink-0">{action}</div>}
      </div>
    </div>
  );
}
