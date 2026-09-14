import React, { useState } from "react";
import { Outlet } from "react-router-dom";
import AdminSidebar from "./AdminSidebar";
import AdminTopbar from "./AdminTopbar";
import "../../styles/admin.css";

export default function AdminLayout() {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  return (
    <div className="min-h-screen bg-slate-50 flex font-sans antialiased text-slate-800">
      {/* Sidebar Navigation */}
      <AdminSidebar
        isOpen={isSidebarOpen}
        onClose={() => setIsSidebarOpen(false)}
      />

      {/* Main Content Area (offset left by sidebar width on lg screens) */}
      <div className="flex-1 flex flex-col min-w-0 lg:pl-72 transition-[padding] duration-300">
        {/* Top Navbar */}
        <AdminTopbar onOpenSidebar={() => setIsSidebarOpen(true)} />

        {/* Dynamic Page Content */}
        <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-7xl w-full mx-auto admin-custom-scrollbar">
          <Outlet />
        </main>

        {/* Admin Footer */}
        <footer className="border-t border-slate-200 py-3 px-6 text-center text-xs text-slate-500 bg-white">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-2 max-w-7xl mx-auto">
            <span>
              &copy; {new Date().getFullYear()} National Service Scheme, Madras Institute of Technology, Anna University.
            </span>
            <span className="font-mono text-[11px] text-slate-400">
              CMS Phase 1 &bull; Connected via Supabase RLS
            </span>
          </div>
        </footer>
      </div>
    </div>
  );
}
