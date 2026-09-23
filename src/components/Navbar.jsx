import React, { useState, useEffect } from "react";
import { NavLink, useLocation, useNavigate } from "react-router-dom";
import {
  Navbar as ResizableNavbar,
  NavBody,
  NavItems,
  MobileNav,
  MobileNavHeader,
  MobileNavToggle,
  MobileNavMenu,
  NavbarLogo,
} from "./ui/resizable-navbar";
import { cn } from "../lib/utils";

const NAV_ITEMS = [
  { name: "Home", link: "/" },
  { name: "Events", link: "/events" },
  { name: "People", link: "/people" },
  { name: "Achievements", link: "/achievements" },
];

export default function Navbar() {
  const [isMobileOpen, setIsMobileOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();

  // Close mobile menu on route change
  useEffect(() => {
    setIsMobileOpen(false);
  }, [location.pathname]);

  // Handle ESC key for accessibility
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === "Escape" && isMobileOpen) {
        setIsMobileOpen(false);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isMobileOpen]);

  const handleLinkClick = (item) => {
    navigate(item.link);
    setIsMobileOpen(false);
  };

  return (
    <ResizableNavbar>
      {/* ── 1. Desktop Resizable Navbar ─────────────────────── */}
      <NavBody>
        <NavbarLogo>
          <NavLink
            to="/"
            className="flex items-center gap-3 group focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary rounded-md"
          >
            <div className="shrink-0 flex items-center justify-center">
              <img
                src={`${process.env.PUBLIC_URL}/NSS_logo.png`}
                alt="NSS Emblem"
                className="h-10 w-10 object-contain rounded-full transition-transform group-hover:scale-105"
                onError={(e) => {
                  if (!e.currentTarget.dataset.fallback) {
                    e.currentTarget.dataset.fallback = "true";
                    e.currentTarget.src = `${process.env.PUBLIC_URL}/images/NSS_logo.png`;
                  }
                }}
              />
            </div>
            <div className="flex flex-col">
              <span className="font-sans font-bold text-[14.5px] text-[#0F172A] tracking-tight leading-tight whitespace-nowrap group-hover:text-[#D94B4B] transition-colors">
                National Service Scheme
              </span>
              <span className="text-[10px] font-semibold text-[#64748B] uppercase tracking-wider whitespace-nowrap mt-0.5">
                MIT Campus · Anna University
              </span>
            </div>
          </NavLink>
        </NavbarLogo>

        {/* Desktop Nav Links with smooth active + hover states */}
        <NavItems
          items={NAV_ITEMS}
          activePath={location.pathname}
          onItemClick={handleLinkClick}
        />
      </NavBody>

      {/* ── 2. Mobile Responsive Navbar ─────────────────────── */}
      <MobileNav>
        <MobileNavHeader>
          <NavbarLogo>
            <NavLink
              to="/"
              className="flex items-center gap-2.5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary rounded-md"
            >
              <img
                src={`${process.env.PUBLIC_URL}/NSS_logo.png`}
                alt="NSS Emblem"
                className="h-9 w-9 object-contain rounded-full"
                onError={(e) => {
                  if (!e.currentTarget.dataset.fallback) {
                    e.currentTarget.dataset.fallback = "true";
                    e.currentTarget.src = `${process.env.PUBLIC_URL}/images/NSS_logo.png`;
                  }
                }}
              />
              <div className="flex flex-col">
                <span className="font-sans font-bold text-[13.5px] text-[#0F172A] tracking-tight leading-tight whitespace-nowrap">
                  National Service Scheme
                </span>
                <span className="text-[9.5px] font-semibold text-[#64748B] uppercase tracking-wider whitespace-nowrap">
                  MIT Campus · Anna University
                </span>
              </div>
            </NavLink>
          </NavbarLogo>

          <MobileNavToggle
            isOpen={isMobileOpen}
            onClick={() => setIsMobileOpen((prev) => !prev)}
          />
        </MobileNavHeader>

        <MobileNavMenu isOpen={isMobileOpen}>
          <ul className="flex flex-col gap-1.5 m-0 p-0 list-none">
            {NAV_ITEMS.map((item) => {
              const isActive =
                location.pathname === item.link ||
                (item.link !== "/" && location.pathname.startsWith(item.link));

              return (
                <li key={item.name}>
                  <NavLink
                    to={item.link}
                    onClick={() => setIsMobileOpen(false)}
                    className={cn(
                      "flex items-center justify-between px-3.5 py-2.5 rounded-lg text-sm font-semibold transition-colors",
                      isActive
                        ? "bg-red-50 text-[#D94B4B] border-l-4 border-[#D94B4B]"
                        : "text-[#334155] hover:bg-slate-100/80 hover:text-[#0F172A]"
                    )}
                  >
                    <span>{item.name}</span>
                    {isActive && (
                      <span className="w-1.5 h-1.5 rounded-full bg-[#D94B4B]" />
                    )}
                  </NavLink>
                </li>
              );
            })}
          </ul>
        </MobileNavMenu>
      </MobileNav>
    </ResizableNavbar>
  );
}
