import React from "react";
import { NavLink } from "react-router-dom";

export default function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-[#070A12] text-slate-200 pt-20 pb-0 overflow-hidden relative border-t border-slate-800/60 selection:bg-red-500/30">
      <div className="max-w-7xl mx-auto px-6 sm:px-8">
        
        {/* ── 4 Main Content Areas Grid ────────────────────────── */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-12 gap-10 lg:gap-12 pb-16">
          
          {/* 1 — NSS BRAND (Spans 5 columns on desktop) */}
          <div className="lg:col-span-5 flex flex-col justify-start pr-0 lg:pr-8">
            <div className="flex items-center gap-3.5 mb-4">
              <div className="flex items-center justify-center h-10 w-10 rounded-full bg-white p-0.5 shrink-0 overflow-hidden shadow-sm">
                <img
                  src={`${process.env.PUBLIC_URL}/NSS_logo.png`}
                  alt="NSS Emblem"
                  className="w-full h-full object-contain rounded-full"
                  onError={(e) => {
                    if (!e.currentTarget.dataset.fallback) {
                      e.currentTarget.dataset.fallback = "true";
                      e.currentTarget.src = `${process.env.PUBLIC_URL}/images/NSS_logo.png`;
                    }
                  }}
                />
              </div>
              <div className="flex flex-col">
                <span className="font-sans font-bold text-base text-white tracking-tight leading-tight">
                  National Service Scheme
                </span>
                <span className="text-[10.5px] font-semibold text-slate-400 uppercase tracking-widest mt-0.5">
                  MIT CAMPUS · ANNA UNIVERSITY
                </span>
              </div>
            </div>

            <p className="text-slate-400 text-[13.5px] leading-relaxed max-w-sm">
              Serving through civic responsibility and community action.
            </p>
          </div>

          {/* 2 — NAVIGATION (Spans 2 columns on desktop) */}
          <div className="lg:col-span-2 flex flex-col">
            <h4 className="text-[11px] font-bold uppercase tracking-widest text-slate-300 mb-4">
              Navigation
            </h4>
            <ul className="flex flex-col space-y-2.5 m-0 p-0 list-none">
              {[
                { name: "Home", path: "/" },
                { name: "Events", path: "/events" },
                { name: "People", path: "/people" },
              ].map((item) => (
                <li key={item.name}>
                  <NavLink
                    to={item.path}
                    className="text-[13.5px] text-slate-400 hover:text-white transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-primary rounded-sm inline-block"
                  >
                    {item.name}
                  </NavLink>
                </li>
              ))}
            </ul>
          </div>

          {/* 3 — CONNECT (Spans 2 columns on desktop) */}
          <div className="lg:col-span-2 flex flex-col">
            <h4 className="text-[11px] font-bold uppercase tracking-widest text-slate-300 mb-4">
              Connect
            </h4>
            
            {/* Simple Horizontal Social Icons */}
            <div className="flex items-center gap-4 pt-1">
              {/* Instagram */}
              <a
                href="https://instagram.com"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Instagram"
                className="text-slate-400 hover:text-white hover:text-[#E4405F] transition-colors"
              >
                <svg className="w-5 h-5 fill-current" viewBox="0 0 24 24">
                  <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z" />
                </svg>
              </a>

              {/* LinkedIn */}
              <a
                href="https://linkedin.com"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="LinkedIn"
                className="text-slate-400 hover:text-white hover:text-[#0A66C2] transition-colors"
              >
                <svg className="w-5 h-5 fill-current" viewBox="0 0 24 24">
                  <path d="M19 3a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h14m-.5 15.5v-5.3a3.26 3.26 0 0 0-3.26-3.26c-.85 0-1.84.52-2.28 1.3v-1.11h-2.79v8.37h2.79v-4.93c0-.77.62-1.4 1.39-1.4a1.4 1.4 0 0 1 1.4 1.4v4.93h2.75M6.46 10.9v8.37H9.2V10.9H6.46M7.83 6.22a1.62 1.62 0 1 0 0 3.24 1.62 1.62 0 0 0 0-3.24Z" />
                </svg>
              </a>

              {/* YouTube */}
              <a
                href="https://youtube.com"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="YouTube"
                className="text-slate-400 hover:text-white hover:text-[#FF0000] transition-colors"
              >
                <svg className="w-5 h-5 fill-current" viewBox="0 0 24 24">
                  <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z" />
                </svg>
              </a>
            </div>
          </div>

          {/* 4 — CAMPUS (Spans 3 columns on desktop) */}
          <div className="lg:col-span-3 flex flex-col">
            <h4 className="text-[11px] font-bold uppercase tracking-widest text-slate-300 mb-4">
              Campus
            </h4>
            <div className="flex flex-col space-y-1.5 text-[13.5px] text-slate-400 leading-normal">
              <p className="m-0 font-medium text-slate-300">MIT Campus</p>
              <p className="m-0">Anna University</p>
              <p className="m-0">Chennai, India</p>
              <p className="m-0 pt-1 text-slate-500 text-[12px]">NSS Office · MIT Campus</p>
            </div>
          </div>

        </div>

        {/* ── Thin Divider Line ──────────────────────────────────── */}
        <div className="border-t border-slate-800/70 w-full" />

        {/* ── Centered Copyright Row ─────────────────────────────── */}
        <div className="py-8 text-center">
          <p className="text-slate-500 text-xs sm:text-[13px] tracking-normal font-normal m-0">
            © {currentYear} NSS MIT Campus, Anna University. All rights reserved.
          </p>
        </div>

      </div>

      {/* ── Oversized Background Branding (Clipped at Bottom) ───── */}
      <div className="w-full overflow-hidden flex justify-center items-end select-none pointer-events-none -mt-4 pb-0">
        <span className="footer-embossed-watermark text-[11vw] sm:text-[9.5vw] md:text-[8.5vw] tracking-wider whitespace-nowrap">
          NATIONAL SERVICE SCHEME
        </span>
      </div>
    </footer>
  );
}
