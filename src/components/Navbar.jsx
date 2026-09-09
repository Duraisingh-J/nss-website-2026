import React, { useState, useEffect } from "react";
import { NavLink, useLocation } from "react-router-dom";
import { Menu, X } from "lucide-react";
import { cn } from "../lib/utils";

const NAV_LINKS = [
  { name: "Home", path: "/" },
  { name: "Sessions", path: "/sessions" },
  { name: "Events", path: "/events" },
  { name: "People", path: "/people" },
];

export default function Navbar() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const location = useLocation();

  useEffect(() => {
    setIsMobileMenuOpen(false);
  }, [location.pathname]);

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === "Escape" && isMobileMenuOpen) {
        setIsMobileMenuOpen(false);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isMobileMenuOpen]);

  useEffect(() => {
    if (isMobileMenuOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "unset";
    }
    return () => {
      document.body.style.overflow = "unset";
    };
  }, [isMobileMenuOpen]);

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-surface border-b border-border py-3.5 transition-colors">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between">
          
          <NavLink 
            to="/" 
            className="flex items-center gap-3.5 group focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary rounded-md"
          >
            <div className="shrink-0 flex items-center">
              <img
                src={`${process.env.PUBLIC_URL}/NSS_logo.png`}
                alt="NSS Logo"
                className="h-10 w-10 sm:h-11 sm:w-11 object-contain rounded-full"
                onError={(e) => {
                  if (!e.currentTarget.dataset.fallback) {
                    e.currentTarget.dataset.fallback = "true";
                    e.currentTarget.src = `${process.env.PUBLIC_URL}/images/NSS_logo.png`;
                  }
                }}
              />
            </div>
            <div className="hidden sm:flex flex-col">
              <span className="font-sans font-bold text-[15px] text-foreground tracking-tight leading-tight group-hover:text-primary transition-colors">
                National Service Scheme
              </span>
              <span className="text-[11px] font-semibold text-muted uppercase tracking-wider mt-0.5">
                MIT Campus · Anna University
              </span>
            </div>
          </NavLink>

          {/* Desktop Navigation & Action */}
          <div className="hidden md:flex items-center gap-6 lg:gap-8">
            <ul className="flex items-center gap-1 lg:gap-2">
              {NAV_LINKS.map((link) => (
                <li key={link.name}>
                  <NavLink
                    to={link.path}
                    className={({ isActive }) =>
                      cn(
                        "text-sm font-medium transition-colors px-3 py-1.5 rounded-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary inline-flex items-center",
                        isActive
                          ? "text-accent font-semibold"
                          : "text-muted hover:text-foreground hover:bg-slate-100/70"
                      )
                    }
                  >
                    {({ isActive }) => (
                      <span className="relative py-0.5">
                        {link.name}
                        {isActive && (
                          <span className="absolute -bottom-1 left-0 right-0 h-[2px] bg-accent rounded-full" />
                        )}
                      </span>
                    )}
                  </NavLink>
                </li>
              ))}
            </ul>

            
          </div>

          {/* Mobile Menu Button */}
          <div className="md:hidden flex items-center">
            <button
              type="button"
              className="text-foreground p-2 rounded-md hover:bg-slate-100 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
              onClick={() => setIsMobileMenuOpen(true)}
              aria-label="Open main menu"
              aria-expanded={isMobileMenuOpen}
            >
              <Menu className="h-5 w-5" />
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu Drawer */}
      {isMobileMenuOpen && (
        <div className="fixed inset-0 z-[60] md:hidden">
          <div 
            className="fixed inset-0 bg-slate-900/40 transition-opacity"
            onClick={() => setIsMobileMenuOpen(false)}
            aria-hidden="true"
          />
          <div className="fixed inset-y-0 right-0 w-full max-w-xs bg-surface border-l border-border shadow-xl flex flex-col">
            <div className="flex items-center justify-between p-4 border-b border-border">
              <div className="flex flex-col">
                <span className="font-sans font-bold text-sm text-foreground">NSS MIT Campus</span>
                <span className="text-[10px] text-muted uppercase tracking-wider">Anna University</span>
              </div>
              <button
                type="button"
                className="text-muted hover:text-foreground p-1.5 rounded-md hover:bg-slate-100 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
                onClick={() => setIsMobileMenuOpen(false)}
                aria-label="Close main menu"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            
            <div className="px-3 py-4 overflow-y-auto flex-1">
              <ul className="flex flex-col gap-1">
                {NAV_LINKS.map((link) => (
                  <li key={link.name}>
                    <NavLink
                      to={link.path}
                      className={({ isActive }) =>
                        cn(
                          "flex items-center px-3.5 py-2.5 text-sm font-medium rounded-md transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary",
                          isActive
                            ? "bg-accent/10 text-accent font-semibold border-l-2 border-accent"
                            : "text-slate-700 hover:bg-slate-100/80"
                        )
                      }
                    >
                      {link.name}
                    </NavLink>
                  </li>
                ))}
              </ul>
            </div>
            
            <div className="p-4 border-t border-border bg-slate-50">
              <p className="text-xs text-muted text-center font-medium tracking-wide uppercase">"Not Me, But You"</p>
            </div>
          </div>
        </div>
      )}
    </nav>
  );
}

