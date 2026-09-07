import React from "react";
import { cn } from "../../lib/utils";

const Button = React.forwardRef(({ className, variant = "primary", size = "md", icon: Icon, iconPlacement = "left", isLoading, children, disabled, ...props }, ref) => {
  const baseStyles = "inline-flex items-center justify-center font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 disabled:opacity-50 disabled:pointer-events-none rounded-md";
  
  const variants = {
    primary: "bg-primary text-white hover:bg-primary/90 shadow-sm",
    accent: "bg-accent text-white hover:bg-accent-hover shadow-sm",
    secondary: "bg-slate-100 text-foreground hover:bg-slate-200 border border-slate-200",
    outline: "border border-border text-foreground hover:bg-slate-50 hover:border-slate-300",
    ghost: "text-muted hover:text-foreground hover:bg-slate-100/70",
  };
  
  const sizes = {
    sm: "h-9 px-3 text-sm",
    md: "h-10 px-4 py-2",
    lg: "h-11 px-8 text-lg",
  };

  return (
    <button
      ref={ref}
      className={cn(baseStyles, variants[variant], sizes[size], className)}
      disabled={disabled || isLoading}
      {...props}
    >
      {isLoading && <span className="mr-2 animate-spin">⚪</span>}
      {!isLoading && Icon && iconPlacement === "left" && <Icon className="mr-2 h-4 w-4" />}
      {children}
      {!isLoading && Icon && iconPlacement === "right" && <Icon className="ml-2 h-4 w-4" />}
    </button>
  );
});

Button.displayName = "Button";

export { Button };
