import React, { useState } from "react";
import { Outlet } from "react-router-dom";
import AdminSidebar from "./AdminSidebar";
import AdminTopbar from "./AdminTopbar";
import "../../styles/admin.css";

export default function AdminLayout() {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(() => {
    try {
      return localStorage.getItem("nss_admin_sidebar_collapsed") === "true";
    } catch {
      return false;
    }
  });

  const toggleSidebar = () => {
    if (window.innerWidth < 1024) {
      setIsSidebarOpen((prev) => !prev);
    } else {
      setIsSidebarCollapsed((prev) => {
        const next = !prev;
        try {
          localStorage.setItem("nss_admin_sidebar_collapsed", String(next));
        } catch (e) {}
        return next;
      });
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex font-sans antialiased text-slate-800">
      {/* Sidebar Navigation */}
      <AdminSidebar
        isOpen={isSidebarOpen}
        isCollapsed={isSidebarCollapsed}
        onClose={() => setIsSidebarOpen(false)}
      />

      {/* Main Content Area (offset left by sidebar width on lg screens) */}
      <div
        className={`flex-1 flex flex-col min-w-0 transition-all duration-300 ease-in-out ${
          isSidebarCollapsed ? "lg:pl-16" : "lg:pl-64"
        }`}
      >
        {/* Top Navbar */}
        <AdminTopbar
          onOpenSidebar={toggleSidebar}
          isSidebarCollapsed={isSidebarCollapsed}
        />

        {/* Dynamic Page Content */}
        <main className="flex-1 p-6 sm:p-8 lg:p-10 max-w-6xl w-full mx-auto admin-custom-scrollbar">
          <Outlet />
        </main>

        {/* Admin Footer */}
        <footer className="border-t border-slate-200 py-3.5 px-6 text-xs text-slate-500 bg-white">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-2 max-w-6xl mx-auto">
            <span>
              &copy; {new Date().getFullYear()} National Service Scheme &bull; Madras Institute of Technology, Anna University.
            </span>
            <span className="text-[11px] text-slate-400">
              Chennai &bull; Tamil Nadu
            </span>
          </div>
        </footer>
      </div>
    </div>
  );
}
