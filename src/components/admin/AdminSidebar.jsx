import React from "react";
import { NavLink, Link } from "react-router-dom";
import {
  LayoutDashboard,
  Users,
  Shield,
  Calendar,
  Megaphone,
  Award,
  FileText,
  Layers,
  Image as ImageIcon,
  BarChart3,
  Target,
  Compass,
  Star,
  Settings,
  FolderArchive,
  ExternalLink,
  X,
} from "lucide-react";

const navigationGroups = [
  {
    title: "Overview",
    items: [
      { name: "Dashboard", path: "/admin/dashboard", icon: LayoutDashboard },
    ],
  },
  {
    title: "People",
    items: [
      { name: "People", path: "/admin/people", icon: Users },
      { name: "Roles", path: "/admin/roles", icon: Shield },
    ],
  },
  {
    title: "Activities",
    items: [
      { name: "Events", path: "/admin/events", icon: Calendar },
    ],
  },
  {
    title: "Content",
    items: [
      { name: "Announcements", path: "/admin/announcements", icon: Megaphone },
      { name: "Achievements", path: "/admin/achievements", icon: Award },
      { name: "Reports", path: "/admin/reports", icon: FileText },
    ],
  },
  {
    title: "Website",
    items: [
      { name: "Hero Slides", path: "/admin/hero-slides", icon: Layers },
      { name: "Gallery", path: "/admin/gallery", icon: ImageIcon },
      { name: "Statistics", path: "/admin/statistics", icon: BarChart3 },
      { name: "Objectives", path: "/admin/objectives", icon: Target },
      { name: "Impact Domains", path: "/admin/impact-domains", icon: Compass },
      { name: "Featured Events", path: "/admin/featured-events", icon: Star },
      { name: "Site Settings", path: "/admin/settings", icon: Settings },
    ],
  },
  {
    title: "Media",
    items: [
      { name: "Media Library", path: "/admin/media", icon: FolderArchive },
    ],
  },
];

export default function AdminSidebar({ isOpen, isCollapsed, onClose }) {
  return (
    <>
      {/* Mobile Backdrop */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-slate-950/50 z-40 lg:hidden"
          onClick={onClose}
          aria-hidden="true"
        />
      )}

      {/* Sidebar Container */}
      <aside
        className={`fixed inset-y-0 left-0 z-50 w-64 bg-slate-900 border-r border-slate-800 flex flex-col h-screen h-[100dvh] transition-transform duration-200 ease-in-out ${
          isOpen
            ? "translate-x-0"
            : isCollapsed
            ? "-translate-x-full"
            : "-translate-x-full lg:translate-x-0"
        }`}
      >
        {/* Institutional Branding Header */}
        <div className="h-16 shrink-0 flex items-center justify-between px-5 border-b border-slate-800">
          <Link
            to="/admin/dashboard"
            className="flex items-center space-x-3"
            onClick={onClose}
          >
            <div className="w-8 h-8 rounded-md bg-red-700 flex items-center justify-center text-white font-bold text-xs">
              NSS
            </div>
            <div>
              <div className="text-sm font-semibold text-white tracking-wide">
                NSS MIT CMS
              </div>
              <div className="text-[11px] text-slate-400">
                Anna University, Chennai
              </div>
            </div>
          </Link>

          {/* Mobile close button */}
          <button
            type="button"
            onClick={onClose}
            className="lg:hidden p-1.5 text-slate-400 hover:text-white rounded-md transition-colors"
            aria-label="Close sidebar"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Navigation Menu (Independently scrollable) */}
        <div className="flex-1 min-h-0 overflow-y-auto px-3 py-4 space-y-4 admin-sidebar-scrollbar overscroll-contain">
          {navigationGroups.map((group) => (
            <div key={group.title}>
              <div className="px-2.5 text-[11px] font-medium uppercase tracking-wider text-slate-400 mb-1">
                {group.title}
              </div>
              <nav className="space-y-0.5">
                {group.items.map((item) => {
                  const Icon = item.icon;
                  return (
                    <NavLink
                      key={item.name}
                      to={item.path}
                      onClick={onClose}
                      className={({ isActive }) =>
                        `flex items-center space-x-2.5 px-2.5 py-1.5 rounded-md text-xs transition-colors ${
                          isActive
                            ? "bg-slate-800 text-white font-medium border-l-2 border-red-600 pl-2"
                            : "text-slate-300 hover:text-white hover:bg-slate-800/60"
                        }`
                      }
                    >
                      <Icon className="w-4 h-4 text-slate-400 shrink-0" />
                      <span className="leading-snug">{item.name}</span>
                    </NavLink>
                  );
                })}
              </nav>
            </div>
          ))}
        </div>

        {/* Footer: View Public Website */}
        <div className="shrink-0 p-3 border-t border-slate-800">
          <a
            href="/"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center justify-between w-full px-2.5 py-1.5 rounded-md text-xs text-slate-400 hover:text-white hover:bg-slate-800/60 transition-colors"
          >
            <span>View Website</span>
            <ExternalLink className="w-3.5 h-3.5 text-slate-400" />
          </a>
        </div>
      </aside>
    </>
  );
}
