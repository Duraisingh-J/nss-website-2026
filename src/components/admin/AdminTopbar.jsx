import React, { useState } from "react";
import { useAdminAuth } from "../../context/AdminAuthContext";
import {
  Menu,
  LogOut,
  ChevronDown,
  ExternalLink,
} from "lucide-react";

export default function AdminTopbar({ onOpenSidebar }) {
  const { user, logout } = useAdminAuth();
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  const handleLogout = async () => {
    setIsLoggingOut(true);
    try {
      await logout();
    } catch (err) {
      console.error("Logout failed:", err);
    } finally {
      setIsLoggingOut(false);
    }
  };

  const adminEmail = user?.email || "admin@nssmit.org";
  const emailInitial = adminEmail.charAt(0).toUpperCase();

  return (
    <header className="sticky top-0 z-30 h-16 bg-white border-b border-slate-200 flex items-center justify-between px-4 sm:px-6 lg:px-8">
      {/* Left: Mobile hamburger & institutional site context */}
      <div className="flex items-center space-x-3 sm:space-x-4">
        <button
          type="button"
          onClick={onOpenSidebar}
          className="lg:hidden p-2 rounded-md text-slate-600 hover:text-slate-900 hover:bg-slate-100 transition-colors"
          aria-label="Open sidebar"
        >
          <Menu className="w-5 h-5" />
        </button>

        <div className="hidden sm:flex flex-col">
          <span className="text-xs text-slate-500 font-medium tracking-wide">
            National Service Scheme &bull; MIT Campus
          </span>
          <span className="text-sm font-semibold text-slate-900">
            Administrative Portal
          </span>
        </div>
      </div>

      {/* Right: Public website link, administrator profile, logout */}
      <div className="flex items-center space-x-3">
        <a
          href="/"
          target="_blank"
          rel="noopener noreferrer"
          className="hidden sm:inline-flex items-center space-x-1.5 px-3 py-1.5 rounded-md text-xs font-medium text-slate-600 hover:text-slate-900 hover:bg-slate-100 transition-colors"
        >
          <span>View Website</span>
          <ExternalLink className="w-3.5 h-3.5 text-slate-400" />
        </a>

        {/* Administrator profile dropdown */}
        <div className="relative">
          <button
            type="button"
            onClick={() => setDropdownOpen((prev) => !prev)}
            className="flex items-center space-x-2.5 p-1.5 rounded-md hover:bg-slate-100 border border-transparent hover:border-slate-200 transition-colors focus:outline-hidden"
            aria-expanded={dropdownOpen}
          >
            <div className="w-7 h-7 rounded-full bg-slate-800 text-white font-medium flex items-center justify-center text-xs">
              {emailInitial}
            </div>
            <div className="hidden sm:block text-left text-xs leading-tight">
              <div className="font-medium text-slate-900 truncate max-w-[160px]">
                {adminEmail}
              </div>
              <div className="text-[11px] text-slate-500">Administrator</div>
            </div>
            <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
          </button>

          {dropdownOpen && (
            <>
              <div
                className="fixed inset-0 z-30"
                onClick={() => setDropdownOpen(false)}
              />
              <div className="absolute right-0 mt-2 w-56 bg-white rounded-lg shadow-lg border border-slate-200 py-1.5 z-40">
                <div className="px-3.5 py-2 border-b border-slate-100">
                  <div className="text-[11px] text-slate-400 uppercase tracking-wider font-medium">
                    Signed in
                  </div>
                  <div className="text-xs font-medium text-slate-900 truncate mt-0.5">
                    {adminEmail}
                  </div>
                  <div className="text-[11px] text-slate-500 mt-0.5">
                    Administrator
                  </div>
                </div>

                <div className="pt-1">
                  <button
                    type="button"
                    onClick={() => {
                      setDropdownOpen(false);
                      handleLogout();
                    }}
                    disabled={isLoggingOut}
                    className="w-full flex items-center space-x-2 px-3.5 py-2 text-xs text-red-600 hover:bg-red-50 transition-colors text-left font-medium"
                  >
                    <LogOut className="w-3.5 h-3.5" />
                    <span>{isLoggingOut ? "Signing out..." : "Sign Out"}</span>
                  </button>
                </div>
              </div>
            </>
          )}
        </div>

        {/* Direct quick logout button */}
        <button
          type="button"
          onClick={handleLogout}
          disabled={isLoggingOut}
          title="Sign out of Admin CMS"
          className="hidden sm:inline-flex items-center space-x-1.5 px-3 py-1.5 rounded-md text-xs font-medium text-slate-700 hover:text-red-700 hover:bg-red-50 border border-slate-200 transition-colors"
        >
          <LogOut className="w-3.5 h-3.5" />
          <span>{isLoggingOut ? "..." : "Logout"}</span>
        </button>
      </div>
    </header>
  );
}
