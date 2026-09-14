import React from "react";
import { NavLink, Link } from "react-router-dom";
import {
  LayoutDashboard,
  Users,
  Calendar,
  Layers,
  Megaphone,
  BarChart3,
  Target,
  Settings,
  Image as ImageIcon,
  FileText,
  Mail,
  Shield,
  HardDrive,
  ExternalLink,
  ChevronRight,
  X,
  Sparkles,
} from "lucide-react";

const navigationGroups = [
  {
    title: "Overview",
    items: [
      {
        name: "Dashboard",
        path: "/admin/dashboard",
        icon: LayoutDashboard,
        isReady: true,
      },
    ],
  },
  {
    title: "People Management",
    items: [
      {
        name: "All People",
        path: "/admin/people",
        icon: Users,
        isReady: false,
        phase: "Phase 2",
      },
      {
        name: "Categories & Roles",
        path: "/admin/people-categories",
        icon: Layers,
        isReady: false,
        phase: "Phase 2",
      },
    ],
  },
  {
    title: "Events & Activities",
    items: [
      {
        name: "Events",
        path: "/admin/events",
        icon: Calendar,
        isReady: false,
        phase: "Phase 3",
      },
      {
        name: "Sessions & Volunteers",
        path: "/admin/sessions",
        icon: Layers,
        isReady: false,
        phase: "Phase 3",
      },
    ],
  },
  {
    title: "Content & Objectives",
    items: [
      {
        name: "Announcements",
        path: "/admin/announcements",
        icon: Megaphone,
        isReady: false,
        phase: "Phase 4",
      },
      {
        name: "Statistics",
        path: "/admin/statistics",
        icon: BarChart3,
        isReady: false,
        phase: "Phase 4",
      },
      {
        name: "Site Objectives",
        path: "/admin/objectives",
        icon: Target,
        isReady: false,
        phase: "Phase 4",
      },
      {
        name: "Site Settings",
        path: "/admin/settings",
        icon: Settings,
        isReady: false,
        phase: "Phase 4",
      },
    ],
  },
  {
    title: "Media & Records",
    items: [
      {
        name: "Gallery Albums",
        path: "/admin/gallery",
        icon: ImageIcon,
        isReady: false,
        phase: "Phase 5",
      },
      {
        name: "Annual Reports",
        path: "/admin/reports",
        icon: FileText,
        isReady: false,
        phase: "Phase 5",
      },
    ],
  },
  {
    title: "Communications",
    items: [
      {
        name: "Contact Messages",
        path: "/admin/messages",
        icon: Mail,
        isReady: false,
        phase: "Phase 5",
      },
    ],
  },
  {
    title: "System & Storage",
    items: [
      {
        name: "Admin Users",
        path: "/admin/users",
        icon: Shield,
        isReady: false,
        phase: "Phase 6",
      },
      {
        name: "Storage Buckets",
        path: "/admin/storage",
        icon: HardDrive,
        isReady: false,
        phase: "Phase 6",
      },
    ],
  },
];

export default function AdminSidebar({ isOpen, onClose }) {
  return (
    <>
      {/* Mobile Backdrop */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-slate-950/60 backdrop-blur-sm z-40 lg:hidden"
          onClick={onClose}
          aria-hidden="true"
        />
      )}

      {/* Sidebar Panel */}
      <aside
        className={`fixed top-0 bottom-0 left-0 z-50 w-72 bg-slate-900 border-r border-slate-800/80 flex flex-col transition-transform duration-300 ease-in-out lg:translate-x-0 ${
          isOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        {/* Brand Header */}
        <div className="h-16 flex items-center justify-between px-5 border-b border-slate-800 bg-slate-950/40">
          <Link
            to="/admin/dashboard"
            className="flex items-center space-x-3 group"
            onClick={onClose}
          >
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-red-600 to-rose-700 flex items-center justify-center text-white font-bold text-sm shadow-md shadow-red-950/50 group-hover:scale-105 transition-transform">
              NSS
            </div>
            <div>
              <div className="text-sm font-semibold text-white tracking-wide flex items-center gap-1.5 font-serif">
                <span>NSS MIT CMS</span>
                <span className="text-[10px] uppercase font-mono px-1.5 py-0.5 rounded bg-red-950/80 text-red-400 border border-red-800/50">
                  Admin
                </span>
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
            className="lg:hidden p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition-colors"
            aria-label="Close sidebar"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Navigation List */}
        <div className="flex-1 overflow-y-auto px-3 py-4 space-y-6 admin-sidebar-scrollbar">
          {navigationGroups.map((group) => (
            <div key={group.title} className="space-y-1">
              <div className="px-3 text-[10px] font-semibold uppercase tracking-wider text-slate-400 font-mono">
                {group.title}
              </div>
              <div className="space-y-0.5 pt-1">
                {group.items.map((item) => {
                  const Icon = item.icon;
                  if (item.isReady) {
                    return (
                      <NavLink
                        key={item.name}
                        to={item.path}
                        onClick={onClose}
                        className={({ isActive }) =>
                          `flex items-center justify-between px-3 py-2 rounded-lg text-xs font-medium transition-all ${
                            isActive
                              ? "bg-red-600/15 text-red-400 border-l-2 border-red-500 font-semibold"
                              : "text-slate-300 hover:bg-slate-800/70 hover:text-white"
                          }`
                        }
                      >
                        <div className="flex items-center space-x-2.5">
                          <Icon className="w-4 h-4 text-slate-400 group-hover:text-white" />
                          <span>{item.name}</span>
                        </div>
                        <ChevronRight className="w-3.5 h-3.5 opacity-40" />
                      </NavLink>
                    );
                  }

                  // Non-ready item (Upcoming Phase)
                  return (
                    <div
                      key={item.name}
                      className="flex items-center justify-between px-3 py-1.5 rounded-lg text-xs font-medium text-slate-400 cursor-not-allowed select-none opacity-85 hover:bg-slate-800/30 transition-colors"
                      title={`${item.name} (Scheduled in ${item.phase})`}
                    >
                      <div className="flex items-center space-x-2.5">
                        <Icon className="w-4 h-4 text-slate-400" />
                        <span>{item.name}</span>
                      </div>
                      <span className="text-[9px] font-mono uppercase px-1.5 py-0.5 rounded bg-slate-800/80 text-slate-300 border border-slate-700/50">
                        {item.phase}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>
          ))}
        </div>

        {/* Footer / Quick Public Site link */}
        <div className="p-3 border-t border-slate-800/90 bg-slate-950/30">
          <a
            href="/"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center justify-between w-full px-3 py-2 rounded-lg text-xs font-medium text-slate-400 hover:text-white hover:bg-slate-800/60 transition-colors group"
          >
            <div className="flex items-center space-x-2">
              <Sparkles className="w-3.5 h-3.5 text-amber-400" />
              <span>View Public Website</span>
            </div>
            <ExternalLink className="w-3.5 h-3.5 text-slate-400 group-hover:text-slate-300" />
          </a>
        </div>
      </aside>
    </>
  );
}
