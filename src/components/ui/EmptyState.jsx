import React from "react";
import { cn } from "../../lib/utils";

export function EmptyState({ icon: Icon, title, description, action, className }) {
  return (
    <div className={cn("flex flex-col items-center justify-center py-16 px-4 text-center border-2 border-dashed border-border rounded-xl bg-surface/50", className)}>
      {Icon && (
        <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-primary/5 mb-4">
          <Icon className="h-8 w-8 text-primary/60" />
        </div>
      )}
      <h3 className="text-lg font-semibold text-primary">{title}</h3>
      {description && <p className="mt-2 text-sm text-muted max-w-sm">{description}</p>}
      {action && <div className="mt-6">{action}</div>}
    </div>
  );
}
