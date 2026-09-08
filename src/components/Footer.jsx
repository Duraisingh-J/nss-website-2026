import React from "react";
import { NavLink } from "react-router-dom";
import { Container } from "./ui/Container";

export default function Footer() {
  return (
    <footer className="bg-slate-900 text-slate-100 pt-16 pb-10 border-t border-slate-800">
      <Container>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10 lg:gap-8 mb-14">
          
          {/* Identity & Mission */}
          <div className="lg:col-span-1">
            <div className="flex items-center gap-3 mb-4">
              <div className="flex items-center justify-center h-10 w-10 rounded-full bg-white p-0.5 border border-slate-700 shrink-0 overflow-hidden">
                <img
                  src={`${process.env.PUBLIC_URL}/images/nss.png`}
                  alt="NSS Official Emblem"
                  className="w-full h-full object-contain rounded-full"
                  onError={(e) => {
                    if (!e.currentTarget.dataset.triedRoot) {
                      e.currentTarget.dataset.triedRoot = "true";
                      e.currentTarget.src = `${process.env.PUBLIC_URL}/nss.png`;
                    } else if (!e.currentTarget.dataset.triedAlt) {
                      e.currentTarget.dataset.triedAlt = "true";
                      e.currentTarget.src = `${process.env.PUBLIC_URL}/NSS_logo.png`;
                    }
                  }}
                />
              </div>
              <div>
                <h3 className="font-sans font-bold text-base text-white tracking-tight leading-tight">
                  National Service Scheme
                </h3>
                <p className="text-xs text-slate-400 font-sans tracking-wide mt-0.5">
                  MIT Campus · Anna University
                </p>
              </div>
            </div>
            <p className="text-slate-400 text-sm leading-relaxed mb-5">
              Fostering civic consciousness, social responsibility, and community leadership among engineering students since 1969.
            </p>
            <div className="flex items-start gap-2.5 text-sm text-slate-300">
              <span className="text-accent shrink-0">📍</span>
              <span>NSS Office, Administrative Block, MIT Campus, Chromepet, Chennai 600044</span>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="font-sans font-semibold text-sm tracking-wider uppercase text-slate-200 mb-4 flex items-center gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-accent inline-block"></span>
              Navigation
            </h4>
            <ul className="flex flex-col gap-2.5">
              {[
                { name: "Home", path: "/" },
                { name: "Sessions & Outreach", path: "/sessions" },
                { name: "Events & Camps", path: "/events" },
                { name: "People & Leadership", path: "/people" },
              ].map((item) => (
                <li key={item.name}>
                  <NavLink 
                    to={item.path}
                    className="text-sm text-slate-300 hover:text-white transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-accent rounded-sm inline-block"
                  >
                    {item.name}
                  </NavLink>
                </li>
              ))}
            </ul>
          </div>

          {/* Connect */}
          <div>
            <h4 className="font-sans font-semibold text-sm tracking-wider uppercase text-slate-200 mb-4 flex items-center gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-accent inline-block"></span>
              Connect
            </h4>
            <ul className="flex flex-col gap-2.5">
              {["Instagram", "Facebook", "YouTube", "Twitter / X"].map((platform) => (
                <li key={platform}>
                  <a 
                    href="#!" 
                    className="text-sm text-slate-300 hover:text-white transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-accent rounded-sm inline-block"
                  >
                    {platform}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Institutional Affiliation */}
          <div>
            <h4 className="font-sans font-semibold text-sm tracking-wider uppercase text-slate-200 mb-4 flex items-center gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-accent inline-block"></span>
              Institutional
            </h4>
            <div className="mb-4">
              <p className="text-slate-400 text-sm mb-1">Active Hours</p>
              <p className="font-sans font-semibold text-sm text-slate-200">Monday – Friday: 9:00 AM – 5:00 PM</p>
            </div>
            <div className="bg-slate-800/60 border-l-2 border-accent p-3 rounded-r-md">
              <span className="block text-xs text-slate-200 leading-snug uppercase tracking-wider font-semibold">
                Government of India
              </span>
              <span className="block text-xs text-slate-300 leading-snug mt-0.5">
                Ministry of Youth Affairs & Sports
              </span>
            </div>
          </div>

        </div>

        {/* Bottom Bar */}
        <div className="pt-6 border-t border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-3 text-sm text-slate-400">
          <p>© {new Date().getFullYear()} NSS MIT Campus, Anna University. All rights reserved.</p>
          <div className="flex items-center gap-2">
            <span className="text-slate-400 font-medium">Motto:</span>
            <span className="text-slate-200">"Not Me, But You"</span>
          </div>
        </div>
      </Container>
    </footer>
  );
}

