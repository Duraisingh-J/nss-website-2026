import React, { useState } from "react";
import { motion, AnimatePresence, useScroll, useMotionValueEvent } from "motion/react";
import { IconMenu2, IconX } from "@tabler/icons-react";
import { cn } from "../../lib/utils";

export const Navbar = ({
  children,
  className,
}) => {
  const { scrollY } = useScroll();
  const [isScrolled, setIsScrolled] = useState(false);

  useMotionValueEvent(scrollY, "change", (latest) => {
    if (latest > 40) {
      setIsScrolled(true);
    } else {
      setIsScrolled(false);
    }
  });

  return (
    <header
      className={cn(
        "fixed top-0 left-0 right-0 z-50 w-full transition-all duration-300 pointer-events-none",
        isScrolled ? "pt-3 px-3 sm:px-6" : "pt-0 px-0",
        className
      )}
    >
      <div className="w-full flex justify-center pointer-events-auto">
        {React.Children.map(children, (child) => {
          if (React.isValidElement(child)) {
            return React.cloneElement(child, { isScrolled });
          }
          return child;
        })}
      </div>
    </header>
  );
};

export const NavBody = ({
  children,
  className,
  isScrolled = false,
}) => {
  return (
    <motion.div
      initial={false}
      animate={{
        width: isScrolled ? "min(1080px, 94%)" : "100%",
        borderRadius: isScrolled ? "9999px" : "0px",
        boxShadow: isScrolled
          ? "0 14px 36px -10px rgba(15, 23, 42, 0.12), 0 4px 12px -2px rgba(15, 23, 42, 0.04), inset 0 1px 1px 0 rgba(255, 255, 255, 0.95)"
          : "0 1px 3px 0 rgba(0, 0, 0, 0.02), inset 0 1px 0 0 rgba(255, 255, 255, 0.8)",
        borderColor: isScrolled ? "rgba(255, 255, 255, 0.85)" : "rgba(226, 232, 240, 0.65)",
        backgroundColor: isScrolled ? "rgba(255, 255, 255, 0.78)" : "rgba(255, 255, 255, 0.72)",
      }}
      transition={{
        type: "spring",
        stiffness: 260,
        damping: 26,
        mass: 0.6,
      }}
      style={{
        backdropFilter: isScrolled ? "blur(28px) saturate(210%)" : "blur(24px) saturate(200%)",
        WebkitBackdropFilter: isScrolled ? "blur(28px) saturate(210%)" : "blur(24px) saturate(200%)",
      }}
      className={cn(
        "hidden md:flex items-center justify-between border mx-auto transition-colors",
        isScrolled
          ? "py-2.5 px-6 border-white/90"
          : "py-3.5 px-6 lg:px-8 border-b border-t-0 border-l-0 border-r-0 w-full",
        className
      )}
    >
      <div className={cn(
        "w-full flex items-center justify-between mx-auto transition-all",
        isScrolled ? "max-w-full" : "max-w-7xl px-2 sm:px-4"
      )}>
        {children}
      </div>
    </motion.div>
  );
};

export const NavItems = ({
  items = [],
  activePath = "/",
  onItemClick,
  className,
}) => {
  const [hoveredIdx, setHoveredIdx] = useState(null);

  return (
    <nav className={cn("flex items-center gap-1 lg:gap-2", className)} aria-label="Main Navigation">
      <ul className="flex items-center gap-1 lg:gap-2 m-0 p-0 list-none">
        {items.map((item, idx) => {
          const isActive = activePath === item.link || (item.link !== "/" && activePath.startsWith(item.link));

          return (
            <li key={item.name} className="relative">
              <a
                href={item.link}
                onClick={(e) => {
                  if (onItemClick) {
                    e.preventDefault();
                    onItemClick(item);
                  }
                }}
                onMouseEnter={() => setHoveredIdx(idx)}
                onMouseLeave={() => setHoveredIdx(null)}
                className={cn(
                  "relative z-10 block px-3.5 py-1.5 text-sm font-semibold whitespace-nowrap transition-colors rounded-full focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary",
                  isActive
                    ? "text-[#D94B4B]"
                    : "text-[#475569] hover:text-[#0F172A]"
                )}
              >
                {item.name}
                {isActive && (
                  <motion.span
                    layoutId="navbar-active-indicator"
                    className="absolute -bottom-0.5 left-3 right-3 h-[2px] bg-[#D94B4B] rounded-full"
                    transition={{
                      type: "spring",
                      stiffness: 350,
                      damping: 30,
                    }}
                  />
                )}
              </a>

              {/* Subtle hover pill */}
              <AnimatePresence>
                {hoveredIdx === idx && (
                  <motion.span
                    layoutId="navbar-hover-indicator"
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    transition={{ duration: 0.15 }}
                    className="absolute inset-0 z-0 rounded-full bg-slate-100/70"
                  />
                )}
              </AnimatePresence>
            </li>
          );
        })}
      </ul>
    </nav>
  );
};

export const MobileNav = ({
  children,
  className,
  isScrolled = false,
}) => {
  return (
    <div
      className={cn(
        "md:hidden w-full transition-all duration-300",
        isScrolled ? "px-3" : "px-0",
        className
      )}
    >
      {React.Children.map(children, (child) => {
        if (React.isValidElement(child)) {
          return React.cloneElement(child, { isScrolled });
        }
        return child;
      })}
    </div>
  );
};

export const MobileNavHeader = ({
  children,
  className,
  isScrolled = false,
}) => {
  return (
    <motion.div
      initial={false}
      animate={{
        borderRadius: isScrolled ? "16px" : "0px",
        boxShadow: isScrolled
          ? "0 10px 28px -8px rgba(15, 23, 42, 0.12), inset 0 1px 1px 0 rgba(255, 255, 255, 0.95)"
          : "0 1px 3px 0 rgba(0, 0, 0, 0.02), inset 0 1px 0 0 rgba(255, 255, 255, 0.8)",
        borderColor: isScrolled ? "rgba(255, 255, 255, 0.85)" : "rgba(226, 232, 240, 0.65)",
        backgroundColor: isScrolled ? "rgba(255, 255, 255, 0.78)" : "rgba(255, 255, 255, 0.72)",
      }}
      transition={{
        type: "spring",
        stiffness: 260,
        damping: 26,
        mass: 0.6,
      }}
      style={{
        backdropFilter: isScrolled ? "blur(28px) saturate(210%)" : "blur(24px) saturate(200%)",
        WebkitBackdropFilter: isScrolled ? "blur(28px) saturate(210%)" : "blur(24px) saturate(200%)",
      }}
      className={cn(
        "flex items-center justify-between border px-4 py-2.5 transition-colors",
        isScrolled
          ? "border-white/90"
          : "border-b border-t-0 border-l-0 border-r-0 w-full",
        className
      )}
    >
      {children}
    </motion.div>
  );
};

export const MobileNavToggle = ({
  isOpen,
  onClick,
  className,
}) => {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={isOpen ? "Close navigation menu" : "Open navigation menu"}
      aria-expanded={isOpen}
      className={cn(
        "p-2 rounded-lg text-slate-700 hover:text-slate-900 hover:bg-slate-100/80 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary transition-colors",
        className
      )}
    >
      {isOpen ? (
        <IconX className="w-5 h-5" stroke={2} />
      ) : (
        <IconMenu2 className="w-5 h-5" stroke={2} />
      )}
    </button>
  );
};

export const MobileNavMenu = ({
  isOpen,
  children,
  className,
}) => {
  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0, height: 0, y: -6 }}
          animate={{ opacity: 1, height: "auto", y: 0 }}
          exit={{ opacity: 0, height: 0, y: -6 }}
          transition={{ duration: 0.22, ease: "easeInOut" }}
          style={{
            backdropFilter: "blur(20px) saturate(190%)",
            WebkitBackdropFilter: "blur(20px) saturate(190%)",
          }}
          className={cn(
            "overflow-hidden bg-white/90 border border-slate-200/80 rounded-2xl shadow-2xl mt-1.5 px-4 py-4 mx-2",
            className
          )}
        >
          {children}
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export const NavbarLogo = ({
  children,
  className,
}) => {
  return (
    <div className={cn("flex items-center shrink-0", className)}>
      {children}
    </div>
  );
};
