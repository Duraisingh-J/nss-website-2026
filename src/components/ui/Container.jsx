import React from "react";
import { cn } from "../../lib/utils";

export function Container({ className, variant = "default", children, ...props }) {
  const variants = {
    default: "max-w-7xl mx-auto px-4 sm:px-6 lg:px-8",
    narrow: "max-w-4xl mx-auto px-4 sm:px-6 lg:px-8",
    wide: "max-w-screen-2xl mx-auto px-4 sm:px-6 lg:px-8",
  };

  return (
    <div className={cn("w-full", variants[variant], className)} {...props}>
      {children}
    </div>
  );
}
